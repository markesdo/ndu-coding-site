// OAuth-Autorisierungsserver für den Connector (claude.ai als öffentlicher CIMD-Client), ohne Datenbank:
// Codes und Tokens sind versiegelte Umschläge (umschlag.ts). Im Cache liegen nur Merker, alle nach bestem Bemühen:
// „Code schon eingelöst“, „Refresh-Token schon rotiert“ und „Familie widerrufen“. PKCE macht einen abgefangenen Code
// ohnehin nutzlos. Familie = eine Verbindung: alle Tokens aus einem Code und seinen Refreshes tragen dieselbe
// zufällige ID. Taucht ein verbrauchter Code oder ein schon rotiertes Refresh-Token wieder auf, hat jemand mitgelesen:
// dann gilt die ganze Familie nicht mehr (OAuth 2.1 / RFC 9700 §4.14.2).
//
// Anders als die übrigen Router hängt dieser an der Wurzel und trägt VOLLE Pfade, weil er auch außerhalb von
// /api/werkstatt/oauth antwortet. appErstellen registriert ihn vor mcpRouten. Ihm gehören genau:
//   /api/werkstatt/oauth/metadata, /authorize, /token
//   /api/werkstatt/mcp/resource                                    (RFC 9728)
//   /.well-known/oauth-authorization-server/api/werkstatt/oauth    (RFC 8414, gleiches JSON wie oauth/metadata)
//   /.well-known/oauth-protected-resource/api/werkstatt/mcp        (RFC 9728, gleiches JSON wie mcp/resource)
// Nicht an der Wurzel (/.well-known/oauth-authorization-server ohne Suffix): Issuer und Resource haben einen Pfad,
// die Metadaten müssen zur Well-known-URL passen (RFC 8414 §3.3, RFC 9728 §3.3). Dort antwortet die App mit 404.
// Kein Sammelpfad wie '/*' und kein use() ohne Pfad: das fänge Anfragen der anderen Router ab.
// CSRF (nur Origin, Formular erlaubt) für POST /api/werkstatt/oauth/authorize prüft schon appErstellen.
import { Hono, type Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { b64url, gleich, sichererPfad } from '../../../lib/kurszugang.js';
import type { Rolle } from '../../zugang.js';
import { json } from '../antwort.js';
import { mitgliedschaftFinden, sitzungMitMitgliedschaft } from '../sitzung.js';
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
// Neuversuch desselben Refresh-Tokens nach einer verlorenen Antwort: kein Diebstahl, solange er so kurz danach kommt.
const REFRESH_GNADE_SEKUNDEN = 30;

const AUTHORIZE = `${ISSUER_PFAD}/authorize`;
const LOGIN = '/api/werkstatt/auth/login';
// S256 über 32 Zufallsbytes, base64url ohne Auffüllung = genau 43 Zeichen (RFC 7636).
const CHALLENGE = /^[A-Za-z0-9_-]{43}$/;
const VERIFIER = /^[A-Za-z0-9._~-]{43,128}$/;
const MAX_STATE = 512;
// Token-Anfragen sind klein (Code oder Refresh-Token plus ein paar Felder); mehr wird gar nicht erst gelesen.
const MAX_TOKEN_BODY = 16 * 1024;

const jetztSek = (abh: Abhaengigkeiten) => Math.floor(abh.jetzt() / 1000);

async function sha256(text: string): Promise<string> {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return b64url(h);
}

// Gilt die Person noch in dieser Kohorte mit dieser Rolle? Dieselbe Prüfung wie für die Sitzung.
function mitgliedAktiv(abh: Abhaengigkeiten, c: Pick<TokenClaims, 'githubId' | 'kohorte' | 'rolle'>): boolean {
  return mitgliedschaftFinden(abh.umgebung.zugang, c.githubId, c.kohorte, c.rolle) !== undefined;
}

const familienMerker = (familie: string) => `werkstatt:oauth:familie:${familie}`;

async function familieWiderrufen(abh: Abhaengigkeiten, familie: string): Promise<void> {
  await abh.cache.set(familienMerker(familie), 1, REFRESH_SEKUNDEN);
}

async function familieWiderrufenen(abh: Abhaengigkeiten, familie: string): Promise<boolean> {
  return (await abh.cache.get(familienMerker(familie))) !== undefined;
}

function neueFamilie(): string {
  return b64url(crypto.getRandomValues(new Uint8Array(16)));
}

// Jeder Umschlag trägt den Issuer, der ihn ausgestellt hat (origin(c) + /api/werkstatt/oauth). Eine Preview mit denselben
// MCP_TOKEN_KEYS nimmt so keine Prod-Tokens an und umgekehrt.
interface Kette extends Omit<TokenClaims, 'exp'> {
  familie: string;
}

function claimsAus(inhalt: Record<string, unknown>, iss: string): Kette | null {
  const { githubId, kohorte, rolle, clientId, familie } = inhalt;
  if (inhalt.iss !== iss || typeof familie !== 'string' || !familie) return null;
  if (!Number.isSafeInteger(githubId) || typeof kohorte !== 'string' || typeof clientId !== 'string') return null;
  if (rolle !== 'studierende' && rolle !== 'lehrende') return null;
  return { githubId: githubId as number, kohorte, rolle, clientId, familie };
}

// Für den MCP-Endpunkt (T12): Claims eines gültigen Access-Tokens oder null. iss = issuer(c) der Anfrage.
export async function bearerPruefen(abh: Abhaengigkeiten, header: string | null | undefined, iss: string): Promise<TokenClaims | null> {
  const treffer = /^Bearer +([A-Za-z0-9._-]+)$/i.exec(header ?? '');
  if (!treffer) return null;
  const inhalt = await oeffnen('access', treffer[1], abh.umgebung.tokenKeys, jetztSek(abh));
  if (!inhalt) return null;
  const k = claimsAus(inhalt, iss);
  if (!k || !mitgliedAktiv(abh, k) || (await familieWiderrufenen(abh, k.familie))) return null;
  return { githubId: k.githubId, kohorte: k.kohorte, rolle: k.rolle, clientId: k.clientId, exp: inhalt.exp };
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

// null = zu lang oder für sichererPfad nicht sicher; der Login fiele dann still auf / zurück.
function rueckweg(a: Anfrage): string | null {
  const weiter = `${AUTHORIZE}?${new URLSearchParams(felder(a))}`;
  return sichererPfad(weiter) === weiter ? weiter : null;
}

function zuLang(c: Context): Response {
  return meldungsSeite(c, 400, UNGUELTIG, `Die Anfrage ist zu lang. ${NEU_STARTEN}`);
}

// Body als Text, höchstens max Bytes; null, wenn mehr kommt (Content-Length oder tatsächlich gelesen).
async function begrenztLesen(req: Request, max: number): Promise<string | null> {
  const angabe = Number(req.headers.get('content-length') ?? '0');
  if (!Number.isFinite(angabe) || angabe > max) return null;
  if (!req.body) return '';
  const leser = req.body.getReader();
  const teile: Uint8Array[] = [];
  let laenge = 0;
  for (;;) {
    const { done, value } = await leser.read();
    if (done) break;
    laenge += value.byteLength;
    if (laenge > max) {
      await leser.cancel();
      return null;
    }
    teile.push(value);
  }
  const alles = new Uint8Array(laenge);
  let pos = 0;
  for (const t of teile) {
    alles.set(t, pos);
    pos += t.byteLength;
  }
  return new TextDecoder().decode(alles);
}

function zurueckZumClient(c: Context, a: Anfrage, werte: Record<string, string>): Response {
  const ziel = new URL(a.redirectUri);
  for (const [k, v] of Object.entries(werte)) ziel.searchParams.set(k, v);
  if (a.state !== null) ziel.searchParams.set('state', a.state);
  ziel.searchParams.set('iss', issuer(c));
  c.header('Cache-Control', 'no-store');
  return c.redirect(ziel.toString(), 302);
}

// --- token ---

type OAuthFehler = 'invalid_request' | 'invalid_client' | 'invalid_grant' | 'unsupported_grant_type' | 'invalid_target';

function oauthFehler(c: Context, status: ContentfulStatusCode, error: OAuthFehler, beschreibung: string): Response {
  return c.json({ error, error_description: beschreibung }, status, { 'Cache-Control': 'no-store', Pragma: 'no-cache' });
}

async function tokenPaar(c: Context, abh: Abhaengigkeiten, k: Kette): Promise<Response> {
  const keys = abh.umgebung.tokenKeys;
  const t = jetztSek(abh);
  const inhalt = { githubId: k.githubId, kohorte: k.kohorte, rolle: k.rolle, clientId: k.clientId, familie: k.familie, iss: issuer(c) };
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

  for (const pfad of [`${ISSUER_PFAD}/metadata`, '/.well-known/oauth-authorization-server/api/werkstatt/oauth']) {
    r.get(pfad, (c) => json(c, issuerMetadaten(c)));
    r.all(pfad, nurGet);
  }
  for (const pfad of ['/api/werkstatt/mcp/resource', '/.well-known/oauth-protected-resource/api/werkstatt/mcp']) {
    r.get(pfad, (c) => json(c, resourceMetadaten(c)));
    r.all(pfad, nurGet);
  }

  r.get(AUTHORIZE, async (c) => {
    const p = anfragePruefen(c, (k) => c.req.query(k));
    if ('seite' in p) return p.seite;
    const a = p.anfrage;

    // Ohne gültige Sitzung (auch: nicht mehr in der Zugangsliste, Kohorte archiviert) zur Anmeldung; die sagt dann,
    // falls nötig, „nicht freigeschaltet“.
    const s = (await sitzungMitMitgliedschaft(c, abh))?.sitzung;
    if (!s) {
      const weiter = rueckweg(a);
      if (!weiter) return zuLang(c);
      c.header('Cache-Control', 'no-store');
      return c.redirect(`${LOGIN}?weiter=${encodeURIComponent(weiter)}`, 302);
    }

    return zustimmungsSeite(c, { zielHost: new URL(a.redirectUri).host, login: s.login, felder: felder(a), aktion: AUTHORIZE });
  });

  r.post(AUTHORIZE, async (c) => {
    const body = await c.req.parseBody();
    const wert = (k: string) => (typeof body[k] === 'string' ? (body[k] as string) : undefined);
    const p = anfragePruefen(c, wert);
    if ('seite' in p) return p.seite;
    const a = p.anfrage;

    const s = (await sitzungMitMitgliedschaft(c, abh))?.sitzung;
    if (!s) {
      const weiter = rueckweg(a);
      if (!weiter) return zuLang(c);
      return meldungsSeite(c, 401, 'Anmeldung abgelaufen', 'Bitte melde dich noch einmal mit GitHub an.', {
        text: 'Mit GitHub anmelden',
        href: `${LOGIN}?weiter=${encodeURIComponent(weiter)}`,
      });
    }

    const entscheidung = wert('entscheidung');
    if (entscheidung === 'ablehnen') return zurueckZumClient(c, a, { error: 'access_denied' });
    if (entscheidung !== 'erlauben') return meldungsSeite(c, 400, UNGUELTIG, NEU_STARTEN);

    const code = await versiegeln(
      'code',
      { clientId: a.clientId, redirectUri: a.redirectUri, codeChallenge: a.codeChallenge, githubId: s.githubId, kohorte: s.kohorte, rolle: s.rolle, familie: neueFamilie(), iss: issuer(c) },
      CODE_SEKUNDEN,
      abh.umgebung.tokenKeys,
      jetztSek(abh),
    );
    console.info(JSON.stringify({ werkstatt: 'oauth-zustimmung', host: clientName(new URL(a.redirectUri).host), kohorte: s.kohorte }));
    // Erst nach erfolgreicher Zustimmung: anonyme Aufrufe sollen weder Log noch Cache füllen.
    await clientMelden(abh, a.clientId);
    return zurueckZumClient(c, a, { code });
  });

  r.post(`${ISSUER_PFAD}/token`, async (c) => {
    // Claude schickt beides (Code und Refresh) als Formular (RFC 6749 §4.1.3); JSON nehmen wir nicht.
    const typ = (c.req.header('content-type') ?? '').toLowerCase();
    if (!typ.startsWith('application/x-www-form-urlencoded')) return oauthFehler(c, 400, 'invalid_request', 'Erwartet application/x-www-form-urlencoded.');
    const text = await begrenztLesen(c.req.raw, MAX_TOKEN_BODY);
    if (text === null) return oauthFehler(c, 413, 'invalid_request', 'Anfrage zu groß.');
    const form = new URLSearchParams(text);
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
      const claims = inhalt && claimsAus(inhalt, issuer(c));
      if (!inhalt || !claims || claims.clientId !== clientId || inhalt.redirectUri !== wert('redirect_uri')) {
        return oauthFehler(c, 400, 'invalid_grant', ABGELAUFEN);
      }
      if (!VERIFIER.test(verifier) || typeof inhalt.codeChallenge !== 'string' || !gleich(await sha256(verifier), inhalt.codeChallenge)) {
        return oauthFehler(c, 400, 'invalid_grant', 'code_verifier passt nicht.');
      }
      if (!mitgliedAktiv(abh, claims)) return oauthFehler(c, 400, 'invalid_grant', ABGELAUFEN);
      // Einmaligkeit nach bestem Bemühen (zwischen get und set ist kein Schloss). Zweiter Versuch: Familie widerrufen,
      // damit auch die Tokens aus dem ersten Einlösen nicht mehr gelten (RFC 6749 §4.1.2).
      const merker = `werkstatt:oauth:code:${await sha256(code)}`;
      if ((await abh.cache.get(merker)) !== undefined) {
        await familieWiderrufen(abh, claims.familie);
        return oauthFehler(c, 400, 'invalid_grant', ABGELAUFEN);
      }
      await abh.cache.set(merker, 1, CODE_SEKUNDEN * 2);
      return tokenPaar(c, abh, claims);
    }

    const refresh = wert('refresh_token');
    if (!refresh) return oauthFehler(c, 400, 'invalid_request', 'refresh_token ist Pflicht.');
    const inhalt = await oeffnen('refresh', refresh, keys, t);
    const claims = inhalt && claimsAus(inhalt, issuer(c));
    if (!claims || claims.clientId !== clientId) return oauthFehler(c, 400, 'invalid_grant', ABGELAUFEN);
    if (!mitgliedAktiv(abh, claims) || (await familieWiderrufenen(abh, claims.familie))) return oauthFehler(c, 400, 'invalid_grant', ABGELAUFEN);
    // Rotation: das alte Refresh-Token gilt ab jetzt als verbraucht, so lange, wie es höchstens gültig wäre. Der Merker
    // hält den Zeitpunkt der ersten Rotation. Kommt dasselbe Token innerhalb von REFRESH_GNADE_SEKUNDEN noch einmal
    // (verlorene Antwort, Neuversuch, zwei Werkzeugaufrufe zugleich), gibt es ein weiteres Paar derselben Familie;
    // das Fenster beginnt dabei nicht neu. Später ist eins von beiden gestohlen: die ganze Familie widerrufen.
    const merker = `werkstatt:oauth:refresh:${await sha256(refresh)}`;
    const rotiert = await abh.cache.get(merker);
    if (rotiert !== undefined) {
      if (typeof rotiert === 'number' && t - rotiert < REFRESH_GNADE_SEKUNDEN) return tokenPaar(c, abh, claims);
      await familieWiderrufen(abh, claims.familie);
      return oauthFehler(c, 400, 'invalid_grant', ABGELAUFEN);
    }
    await abh.cache.set(merker, t, REFRESH_SEKUNDEN);
    return tokenPaar(c, abh, claims);
  });

  return r;
}
