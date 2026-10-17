// OAuth-Autorisierungsserver für den Connector (claude.ai als öffentlicher CIMD-Client), ohne Datenbank:
// Codes und Tokens sind versiegelte Umschläge (umschlag.ts). Nur zwei Merker liegen im Cache, beide nach bestem
// Bemühen: „Code schon eingelöst“ und „Refresh-Token schon rotiert“. PKCE macht einen abgefangenen Code ohnehin nutzlos.
//
// Anders als die übrigen Router hängt dieser an der Wurzel und trägt VOLLE Pfade, weil er auch außerhalb von
// /api/werkstatt/oauth antwortet. appErstellen registriert ihn vor mcpRouten. Ihm gehören genau:
//   /api/werkstatt/oauth/metadata, /authorize, /token
//   /api/werkstatt/mcp/resource                                    (RFC 9728)
//   /.well-known/oauth-authorization-server/api/werkstatt/oauth    (RFC 8414, gleiches JSON wie oauth/metadata)
//   /.well-known/oauth-protected-resource/api/werkstatt/mcp        (RFC 9728, gleiches JSON wie mcp/resource)
//   /.well-known/oauth-authorization-server                        (ohne Suffix, dieselben Handler)
//   /.well-known/oauth-protected-resource                          (ohne Suffix, dieselben Handler)
// Kein Sammelpfad wie '/*' und kein use() ohne Pfad: das fänge Anfragen der anderen Router ab.
// CSRF (nur Origin, Formular erlaubt) für POST /api/werkstatt/oauth/authorize prüft schon appErstellen.
import { Hono, type Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { gleich, sichererPfad } from '../../../lib/kurszugang.js';
import { KOHORTEN } from '../../kohorten/index.js';
import { mitgliedschaften, type Rolle } from '../../zugang.js';
import { json } from '../antwort.js';
import { sitzungDerAnfrage } from '../sitzung.js';
import type { Abhaengigkeiten, WerkstattEnv } from '../typen.js';
import { clientErlaubt, clientMelden } from './clients.js';
import { ISSUER_PFAD, SCOPE, issuer, issuerMetadaten, resource, resourceMetadaten } from './metadaten.js';
import { oeffnen, versiegeln } from './umschlag.js';
import { clientName, meldungsSeite, zustimmungsSeite } from './zustimmung.js';

export interface TokenClaims {
  githubId: number;
  kohorte: string;
  rolle: Rolle;
  clientId: string;
  // Ablauf des Access-Tokens in Sekunden seit 1970.
  exp: number;
}

const CODE_SEKUNDEN = 60;
const ACCESS_SEKUNDEN = 60 * 60;
const REFRESH_SEKUNDEN = 30 * 24 * 60 * 60;

const AUTHORIZE = `${ISSUER_PFAD}/authorize`;
const LOGIN = '/api/werkstatt/auth/login';
// S256 über 32 Zufallsbytes, base64url ohne Auffüllung = genau 43 Zeichen (RFC 7636).
const CHALLENGE = /^[A-Za-z0-9_-]{43}$/;
const VERIFIER = /^[A-Za-z0-9._~-]{43,128}$/;
const MAX_STATE = 512;

const jetztSek = (abh: Abhaengigkeiten) => Math.floor(abh.jetzt() / 1000);

async function sha256(text: string): Promise<string> {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Buffer.from(h).toString('base64url');
}

// Gilt die Person noch in dieser Kohorte mit dieser Rolle? Archivierte Kohorte oder aus WERKSTATT_ZUGANG entfernt: nein.
function mitgliedAktiv(abh: Abhaengigkeiten, githubId: number, kohorte: string, rolle: Rolle): boolean {
  return mitgliedschaften(abh.umgebung.zugang, githubId, KOHORTEN).some((m) => m.kohorte === kohorte && m.rolle === rolle);
}

function claimsAus(inhalt: Record<string, unknown>): Omit<TokenClaims, 'exp'> | null {
  const { githubId, kohorte, rolle, clientId } = inhalt;
  if (!Number.isSafeInteger(githubId) || typeof kohorte !== 'string' || typeof clientId !== 'string') return null;
  if (rolle !== 'studierende' && rolle !== 'lehrende') return null;
  return { githubId: githubId as number, kohorte, rolle, clientId };
}

// Für den MCP-Endpunkt (T12): Claims eines gültigen Access-Tokens oder null.
export async function bearerPruefen(abh: Abhaengigkeiten, header: string | null | undefined): Promise<TokenClaims | null> {
  const treffer = /^Bearer +([A-Za-z0-9._-]+)$/i.exec(header ?? '');
  if (!treffer) return null;
  const inhalt = await oeffnen('access', treffer[1], abh.umgebung.tokenKeys, jetztSek(abh));
  if (!inhalt) return null;
  const claims = claimsAus(inhalt);
  if (!claims || !mitgliedAktiv(abh, claims.githubId, claims.kohorte, claims.rolle)) return null;
  return { ...claims, exp: inhalt.exp };
}

// --- authorize ---

interface Anfrage {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state: string | null;
  scope: string | null;
}

type Pruefung = { anfrage: Anfrage } | { seite: Response };

const UNGUELTIG = 'Ungültige Anfrage';
const NEU_STARTEN = 'Starte die Verbindung in Claude bitte noch einmal.';

function anfragePruefen(c: Context, wert: (k: string) => string | undefined): Pruefung {
  const nein = (titel: string, text: string): Pruefung => ({ seite: meldungsSeite(c, 400, titel, text) });
  const clientId = wert('client_id') ?? '';
  const client = clientErlaubt(clientId);
  if (!client) return nein('Unbekannte Anwendung', 'Diese Anwendung darf sich nicht mit der Werkstatt verbinden.');
  // Genau vergleichen, nie weiterleiten, solange redirect_uri nicht stimmt.
  const redirectUri = wert('redirect_uri') ?? '';
  if (!client.redirectUris.includes(redirectUri)) return nein('Ungültige Rücksprungadresse', `Diese Rücksprungadresse ist nicht erlaubt. ${NEU_STARTEN}`);
  if (wert('response_type') !== 'code') return nein(UNGUELTIG, `Die Anfrage verlangt keinen Autorisierungscode. ${NEU_STARTEN}`);
  const codeChallenge = wert('code_challenge') ?? '';
  if (!CHALLENGE.test(codeChallenge) || wert('code_challenge_method') !== 'S256') {
    return nein(UNGUELTIG, `Der Anfrage fehlt der PKCE-Schutz (S256). ${NEU_STARTEN}`);
  }
  const res = wert('resource');
  if (res !== undefined && res !== resource(c)) return nein(UNGUELTIG, `Die Anfrage gilt nicht für die Werkstatt. ${NEU_STARTEN}`);
  const state = wert('state') ?? null;
  if (state !== null && state.length > MAX_STATE) return nein(UNGUELTIG, `Die Anfrage ist zu lang. ${NEU_STARTEN}`);
  const scope = wert('scope') ?? null;
  if (scope !== null && scope.length > MAX_STATE) return nein(UNGUELTIG, `Die Anfrage ist zu lang. ${NEU_STARTEN}`);
  return { anfrage: { clientId, redirectUri, codeChallenge, state, scope } };
}

// Die geprüfte Anfrage als Formularfelder (Zustimmungsseite) und als Rücksprung nach der Anmeldung.
// resource fehlt absichtlich: Gibt es sie, ist sie schon geprüft und gleich der Connector-URL; das spart Länge
// (sichererPfad nimmt höchstens 512 Zeichen).
function felder(a: Anfrage): Record<string, string> {
  const f: Record<string, string> = {
    response_type: 'code',
    client_id: a.clientId,
    redirect_uri: a.redirectUri,
    code_challenge: a.codeChallenge,
    code_challenge_method: 'S256',
  };
  if (a.state !== null) f.state = a.state;
  if (a.scope !== null) f.scope = a.scope;
  return f;
}

function rueckweg(a: Anfrage): string {
  return `${AUTHORIZE}?${new URLSearchParams(felder(a))}`;
}

function zurueckZumClient(c: Context, a: Anfrage, werte: Record<string, string>): Response {
  const ziel = new URL(a.redirectUri);
  for (const [k, v] of Object.entries(werte)) ziel.searchParams.set(k, v);
  if (a.state !== null) ziel.searchParams.set('state', a.state);
  ziel.searchParams.set('iss', issuer(c));
  c.header('Cache-Control', 'no-store');
  return c.redirect(ziel.toString(), 302);
}

const NICHT_FREI = 'Du bist für keinen laufenden Kurs freigeschaltet. Schreib Markus deinen GitHub-Namen.';

// --- token ---

type OAuthFehler = 'invalid_request' | 'invalid_client' | 'invalid_grant' | 'unsupported_grant_type' | 'invalid_target';

function oauthFehler(c: Context, status: ContentfulStatusCode, error: OAuthFehler, beschreibung: string): Response {
  return c.json({ error, error_description: beschreibung }, status, { 'Cache-Control': 'no-store', Pragma: 'no-cache' });
}

async function tokenPaar(c: Context, abh: Abhaengigkeiten, claims: Omit<TokenClaims, 'exp'>): Promise<Response> {
  const keys = abh.umgebung.tokenKeys;
  const t = jetztSek(abh);
  const inhalt = { githubId: claims.githubId, kohorte: claims.kohorte, rolle: claims.rolle, clientId: claims.clientId };
  const access = await versiegeln('access', inhalt, ACCESS_SEKUNDEN, keys, t);
  const refresh = await versiegeln('refresh', inhalt, REFRESH_SEKUNDEN, keys, t);
  return c.json(
    { access_token: access, token_type: 'Bearer', expires_in: ACCESS_SEKUNDEN, refresh_token: refresh, scope: SCOPE },
    200,
    { 'Cache-Control': 'no-store', Pragma: 'no-cache' },
  );
}

const ABGELAUFEN = 'Der Code oder das Token ist ungültig, abgelaufen oder schon verbraucht.';

export function oauthRouten(abh: Abhaengigkeiten): Hono<WerkstattEnv> {
  const r = new Hono<WerkstattEnv>();
  const nurGet = (c: Context) => oauthFehler(c, 405, 'invalid_request', 'Nur GET.');

  for (const pfad of [`${ISSUER_PFAD}/metadata`, '/.well-known/oauth-authorization-server/api/werkstatt/oauth', '/.well-known/oauth-authorization-server']) {
    r.get(pfad, (c) => json(c, issuerMetadaten(c)));
    r.all(pfad, nurGet);
  }
  for (const pfad of ['/api/werkstatt/mcp/resource', '/.well-known/oauth-protected-resource/api/werkstatt/mcp', '/.well-known/oauth-protected-resource']) {
    r.get(pfad, (c) => json(c, resourceMetadaten(c)));
    r.all(pfad, nurGet);
  }

  r.get(AUTHORIZE, async (c) => {
    const p = anfragePruefen(c, (k) => c.req.query(k));
    if ('seite' in p) return p.seite;
    const a = p.anfrage;
    await clientMelden(abh, a.clientId);

    const s = await sitzungDerAnfrage(c, abh);
    if (!s) {
      const weiter = rueckweg(a);
      // sichererPfad ließe ein zu langes oder seltsames Ziel stillschweigend zur Startseite werden: lieber gleich sagen.
      if (sichererPfad(weiter) !== weiter) return meldungsSeite(c, 400, UNGUELTIG, `Die Anfrage ist zu lang. ${NEU_STARTEN}`);
      c.header('Cache-Control', 'no-store');
      return c.redirect(`${LOGIN}?weiter=${encodeURIComponent(weiter)}`, 302);
    }
    if (!mitgliedAktiv(abh, s.githubId, s.kohorte, s.rolle)) return meldungsSeite(c, 403, 'Nicht freigeschaltet', NICHT_FREI);

    return zustimmungsSeite(c, { zielHost: new URL(a.redirectUri).host, login: s.login, felder: felder(a), aktion: AUTHORIZE });
  });

  r.post(AUTHORIZE, async (c) => {
    const body = await c.req.parseBody();
    const wert = (k: string) => (typeof body[k] === 'string' ? (body[k] as string) : undefined);
    const p = anfragePruefen(c, wert);
    if ('seite' in p) return p.seite;
    const a = p.anfrage;

    const s = await sitzungDerAnfrage(c, abh);
    if (!s) {
      return meldungsSeite(c, 401, 'Anmeldung abgelaufen', 'Bitte melde dich noch einmal mit GitHub an.', {
        text: 'Mit GitHub anmelden',
        href: `${LOGIN}?weiter=${encodeURIComponent(sichererPfad(rueckweg(a)))}`,
      });
    }
    if (!mitgliedAktiv(abh, s.githubId, s.kohorte, s.rolle)) return meldungsSeite(c, 403, 'Nicht freigeschaltet', NICHT_FREI);

    const entscheidung = wert('entscheidung');
    if (entscheidung === 'ablehnen') return zurueckZumClient(c, a, { error: 'access_denied' });
    if (entscheidung !== 'erlauben') return meldungsSeite(c, 400, UNGUELTIG, NEU_STARTEN);

    const code = await versiegeln(
      'code',
      { clientId: a.clientId, redirectUri: a.redirectUri, codeChallenge: a.codeChallenge, githubId: s.githubId, kohorte: s.kohorte, rolle: s.rolle },
      CODE_SEKUNDEN,
      abh.umgebung.tokenKeys,
      jetztSek(abh),
    );
    console.info(JSON.stringify({ werkstatt: 'oauth-zustimmung', host: clientName(new URL(a.redirectUri).host), kohorte: s.kohorte }));
    return zurueckZumClient(c, a, { code });
  });

  r.post(`${ISSUER_PFAD}/token`, async (c) => {
    // Claude schickt beides (Code und Refresh) als Formular (RFC 6749 §4.1.3); JSON nehmen wir nicht.
    const typ = (c.req.header('content-type') ?? '').toLowerCase();
    if (!typ.startsWith('application/x-www-form-urlencoded')) return oauthFehler(c, 400, 'invalid_request', 'Erwartet application/x-www-form-urlencoded.');
    const form = new URLSearchParams(await c.req.text());
    for (const k of new Set(form.keys())) {
      if (form.getAll(k).length > 1) return oauthFehler(c, 400, 'invalid_request', `Parameter ${k} doppelt.`);
    }
    const wert = (k: string) => form.get(k) ?? '';

    const grant = wert('grant_type');
    if (grant !== 'authorization_code' && grant !== 'refresh_token') return oauthFehler(c, 400, 'unsupported_grant_type', 'Nur authorization_code und refresh_token.');
    const clientId = wert('client_id');
    if (!clientErlaubt(clientId)) return oauthFehler(c, 401, 'invalid_client', 'Unbekannter Client.');
    const res = form.get('resource');
    if (res !== null && res !== resource(c)) return oauthFehler(c, 400, 'invalid_target', 'Unbekannte resource.');
    const t = jetztSek(abh);
    const keys = abh.umgebung.tokenKeys;

    if (grant === 'authorization_code') {
      const code = wert('code');
      const verifier = wert('code_verifier');
      if (!code || !wert('redirect_uri') || !verifier) return oauthFehler(c, 400, 'invalid_request', 'code, redirect_uri und code_verifier sind Pflicht.');
      const inhalt = await oeffnen('code', code, keys, t);
      const claims = inhalt && claimsAus(inhalt);
      if (!inhalt || !claims || claims.clientId !== clientId || inhalt.redirectUri !== wert('redirect_uri')) {
        return oauthFehler(c, 400, 'invalid_grant', ABGELAUFEN);
      }
      if (!VERIFIER.test(verifier) || typeof inhalt.codeChallenge !== 'string' || !gleich(await sha256(verifier), inhalt.codeChallenge)) {
        return oauthFehler(c, 400, 'invalid_grant', 'code_verifier passt nicht.');
      }
      if (!mitgliedAktiv(abh, claims.githubId, claims.kohorte, claims.rolle)) return oauthFehler(c, 400, 'invalid_grant', ABGELAUFEN);
      // Einmaligkeit nach bestem Bemühen (zwischen get und set ist kein Schloss).
      const merker = `werkstatt:oauth:code:${await sha256(code)}`;
      if ((await abh.cache.get(merker)) !== undefined) return oauthFehler(c, 400, 'invalid_grant', ABGELAUFEN);
      await abh.cache.set(merker, 1, CODE_SEKUNDEN * 2);
      return tokenPaar(c, abh, claims);
    }

    const refresh = wert('refresh_token');
    if (!refresh) return oauthFehler(c, 400, 'invalid_request', 'refresh_token ist Pflicht.');
    const inhalt = await oeffnen('refresh', refresh, keys, t);
    const claims = inhalt && claimsAus(inhalt);
    if (!claims || claims.clientId !== clientId) return oauthFehler(c, 400, 'invalid_grant', ABGELAUFEN);
    if (!mitgliedAktiv(abh, claims.githubId, claims.kohorte, claims.rolle)) return oauthFehler(c, 400, 'invalid_grant', ABGELAUFEN);
    // Rotation: das alte Refresh-Token gilt ab jetzt als verbraucht, so lange, wie es höchstens gültig wäre.
    const merker = `werkstatt:oauth:refresh:${await sha256(refresh)}`;
    if ((await abh.cache.get(merker)) !== undefined) return oauthFehler(c, 400, 'invalid_grant', ABGELAUFEN);
    await abh.cache.set(merker, 1, REFRESH_SEKUNDEN);
    return tokenPaar(c, abh, claims);
  });

  return r;
}
