import { createHash, randomBytes } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { kohorteTest } from '../../kohorten/test';
import { appErstellen } from '../app';
import { mapCache } from '../cache';
import { lokaleAbhaengigkeiten, lokaleUmgebung } from '../lokal';
import { cookieName, sitzungErstellen } from '../sitzung';
import type { GithubIdentitaet } from '../typen';
import { bearerPruefen } from './routen';

const BASIS = 'http://localhost:4321';
const ISSUER = `${BASIS}/api/werkstatt/oauth`;
const RESOURCE = `${BASIS}/api/werkstatt/mcp`;
const CLAUDE_CLIENT = 'https://claude.ai/oauth/mcp-oauth-client-metadata';
const CALLBACK = 'https://claude.ai/api/mcp/auth_callback';
const FORM = { 'Content-Type': 'application/x-www-form-urlencoded' };
const START = 1_800_000_000_000;

// Hilfen nach dem Vorbild von capitelize (test/http-harness.ts).
function pkce() {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}
const form = (o: Record<string, string>) => new URLSearchParams(o).toString();

function aufbau(opts: { origin?: string; wieBei?: Aufbau } = {}) {
  const uhr = { ms: START };
  const umgebung = {
    // wieBei: dieselben Schlüssel und Secrets wie ein anderer Aufbau (z. B. Preview neben Prod).
    ...(opts.wieBei?.abh.umgebung ?? lokaleUmgebung()),
    zugang: { test: { lehrende: [1000], studierende: [{ githubId: 1001, kuerzel: 'sofie' }] } },
    origin: opts.origin ?? null,
  };
  const github: GithubIdentitaet = {
    loginUrl: (state, uri) => `https://github.test/auth?state=${state}&redirect_uri=${encodeURIComponent(uri)}`,
    codeEinloesen: async () => ({ githubId: 1001, login: 'sofie-x' }),
  };
  const abh = lokaleAbhaengigkeiten({ umgebung, github, jetzt: () => uhr.ms, cache: mapCache(() => uhr.ms) });
  const app = appErstellen(abh);
  const anfrage = (pfad: string, init: RequestInit = {}) => app.request(pfad.startsWith('http') ? pfad : `${BASIS}${pfad}`, init);
  // Sitzungen nur für Personen aus zugang: die Sitzung wird gegen die aktuelle Zugangsliste geprüft (T4).
  const sitzung = async (githubId = 1001, rolle: 'studierende' | 'lehrende' = 'studierende') =>
    `${cookieName(umgebung.lokal)}=${await sitzungErstellen({ githubId, login: 'x', kohorte: 'test', rolle, exp: Math.floor(uhr.ms / 1000) + 3600 }, umgebung.sessionSecret)}`;
  return { app, abh, uhr, anfrage, sitzung };
}

interface Aufbau {
  app: ReturnType<typeof appErstellen>;
  abh: ReturnType<typeof lokaleAbhaengigkeiten>;
  uhr: { ms: number };
  anfrage(pfad: string, init?: RequestInit): Response | Promise<Response>;
  sitzung(githubId?: number, rolle?: 'studierende' | 'lehrende'): Promise<string>;
}

function authorizeParameter(challenge: string, extra: Record<string, string> = {}) {
  return {
    response_type: 'code',
    client_id: CLAUDE_CLIENT,
    redirect_uri: CALLBACK,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state: 'zustand-123',
    scope: 'mappe offline_access',
    resource: RESOURCE,
    ...extra,
  };
}

// Zustimmung abschicken (wie das Formular der Zustimmungsseite) und den Code aus der Weiterleitung holen.
async function codeHolen(h: Aufbau, challenge: string, extra: Record<string, string> = {}) {
  const r = await h.anfrage('/api/werkstatt/oauth/authorize', {
    method: 'POST',
    headers: { ...FORM, Origin: BASIS, Cookie: await h.sitzung() },
    body: form({ ...authorizeParameter(challenge, extra), entscheidung: 'erlauben' }),
  });
  expect(r.status).toBe(302);
  const ziel = new URL(r.headers.get('location')!);
  return { r, ziel, code: ziel.searchParams.get('code')! };
}

function token(h: Aufbau, felder: Record<string, string>) {
  return h.anfrage('/api/werkstatt/oauth/token', { method: 'POST', headers: FORM, body: form({ client_id: CLAUDE_CLIENT, ...felder }) });
}

async function tokenPaar(h: Aufbau) {
  const p = pkce();
  const { code } = await codeHolen(h, p.challenge);
  const r = await token(h, { grant_type: 'authorization_code', code, redirect_uri: CALLBACK, code_verifier: p.verifier });
  expect(r.status).toBe(200);
  return (await r.json()) as { access_token: string; refresh_token: string; token_type: string; expires_in: number };
}

async function erwarteInvalidGrant(r: Response) {
  expect(r.status).toBe(400);
  expect(await r.json()).toMatchObject({ error: 'invalid_grant' });
}

afterEach(() => {
  kohorteTest.status = 'aktiv';
  vi.restoreAllMocks();
});

describe('Metadaten', () => {
  const AS_PFADE = ['/api/werkstatt/oauth/metadata', '/.well-known/oauth-authorization-server/api/werkstatt/oauth'];
  const PR_PFADE = ['/api/werkstatt/mcp/resource', '/.well-known/oauth-protected-resource/api/werkstatt/mcp'];

  it('keine Aliasse an der Wurzel: Issuer und Resource passen nur zur Pfad-Variante (RFC 8414 §3.3, RFC 9728) -> 404', async () => {
    const h = aufbau();
    for (const p of ['/.well-known/oauth-authorization-server', '/.well-known/oauth-protected-resource']) {
      const r = await h.anfrage(p);
      expect(r.status, p).toBe(404);
      expect(await r.json(), p).toMatchObject({ code: 'unbekannt' });
    }
  });

  it('Issuer-Metadaten: CIMD, öffentlicher Client, S256, offline_access; an allen Pfaden gleich', async () => {
    const h = aufbau();
    const antworten = await Promise.all(AS_PFADE.map(async (p) => (await h.anfrage(p)).json()));
    expect(antworten[0]).toStrictEqual({
      issuer: ISSUER,
      authorization_endpoint: `${ISSUER}/authorize`,
      token_endpoint: `${ISSUER}/token`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['none'],
      client_id_metadata_document_supported: true,
      authorization_response_iss_parameter_supported: true,
      scopes_supported: ['mappe', 'offline_access'],
    });
    for (const a of antworten) expect(a).toStrictEqual(antworten[0]);
  });

  it('Resource-Metadaten: resource = Connector-URL, erster Issuer; an allen Pfaden gleich', async () => {
    const h = aufbau();
    const antworten = await Promise.all(PR_PFADE.map(async (p) => (await h.anfrage(p)).json()));
    expect(antworten[0]).toStrictEqual({ resource: RESOURCE, authorization_servers: [ISSUER], scopes_supported: ['mappe'] });
    for (const a of antworten) expect(a).toStrictEqual(antworten[0]);
  });

  it('mit WERKSTATT_ORIGIN zählt diese, nicht die Origin der Anfrage', async () => {
    const h = aufbau({ origin: 'https://ndu.datamonkeys.ai' });
    const as = await (await h.anfrage('/api/werkstatt/oauth/metadata')).json();
    expect(as.issuer).toBe('https://ndu.datamonkeys.ai/api/werkstatt/oauth');
    expect(as.token_endpoint).toBe('https://ndu.datamonkeys.ai/api/werkstatt/oauth/token');
    const pr = await (await h.anfrage('/api/werkstatt/mcp/resource')).json();
    expect(pr.resource).toBe('https://ndu.datamonkeys.ai/api/werkstatt/mcp');
  });
});

describe('oauth/authorize', () => {
  it('ohne code_challenge oder mit plain: 400', async () => {
    const h = aufbau();
    const { code_challenge: _weg, ...ohne } = authorizeParameter('x');
    const r = await h.anfrage(`/api/werkstatt/oauth/authorize?${form(ohne)}`, { headers: { Cookie: await h.sitzung() } });
    expect(r.status).toBe(400);
    expect(r.headers.get('location')).toBeNull();
    const plain = await h.anfrage(`/api/werkstatt/oauth/authorize?${form(authorizeParameter(pkce().challenge, { code_challenge_method: 'plain' }))}`);
    expect(plain.status).toBe(400);
    const ohneMethode = authorizeParameter(pkce().challenge) as Record<string, string>;
    delete ohneMethode.code_challenge_method;
    expect((await h.anfrage(`/api/werkstatt/oauth/authorize?${form(ohneMethode)}`)).status).toBe(400);
  });

  it('fremde redirect_uri: 400 ohne Weiterleitung, auch mit Sitzung', async () => {
    const h = aufbau();
    for (const uri of ['https://boese.example/cb', 'https://claude.ai/api/mcp/auth_callback/x', 'http://claude.ai/api/mcp/auth_callback']) {
      const r = await h.anfrage(`/api/werkstatt/oauth/authorize?${form(authorizeParameter(pkce().challenge, { redirect_uri: uri }))}`, { headers: { Cookie: await h.sitzung() } });
      expect(r.status, uri).toBe(400);
      expect(r.headers.get('location'), uri).toBeNull();
    }
  });

  it('fremde client_id: 400', async () => {
    const h = aufbau();
    for (const id of ['https://boese.example/client.json', 'http://claude.ai/oauth/x', 'https://claude.ai.boese.example/x', 'https://user@claude.ai/x', 'claude', '']) {
      const r = await h.anfrage(`/api/werkstatt/oauth/authorize?${form(authorizeParameter(pkce().challenge, { client_id: id }))}`);
      expect(r.status, id).toBe(400);
      expect(r.headers.get('location'), id).toBeNull();
    }
  });

  it('fremde resource: 400', async () => {
    const h = aufbau();
    const r = await h.anfrage(`/api/werkstatt/oauth/authorize?${form(authorizeParameter(pkce().challenge, { resource: 'https://boese.example/mcp' }))}`);
    expect(r.status).toBe(400);
  });

  it('ohne Sitzung: zur Anmeldung, die danach genau hierher zurückkehrt', async () => {
    const h = aufbau();
    const p = pkce();
    const r = await h.anfrage(`/api/werkstatt/oauth/authorize?${form(authorizeParameter(p.challenge))}`);
    expect(r.status).toBe(302);
    const login = new URL(r.headers.get('location')!, BASIS);
    expect(login.pathname).toBe('/api/werkstatt/auth/login');
    const weiter = login.searchParams.get('weiter')!;
    expect(weiter.startsWith('/api/werkstatt/oauth/authorize?')).toBe(true);

    // Ganze Runde durch die Anmeldung (T4): login -> GitHub (Fake) -> callback -> weiter.
    const l = await h.anfrage(login.toString());
    const state = new URL(l.headers.get('location')!).searchParams.get('state')!;
    const stateCookie = l.headers.getSetCookie().find((c) => c.startsWith('werkstatt_state='))!.split(';')[0];
    const cb = await h.anfrage(`/api/werkstatt/auth/callback?code=x&state=${state}`, { headers: { Cookie: stateCookie } });
    expect(cb.status).toBe(302);
    expect(cb.headers.get('location')).toBe(weiter);
    const sitzung = cb.headers.getSetCookie().find((c) => c.startsWith(`${cookieName(true)}=`))!.split(';')[0];

    const seite = await h.anfrage(weiter, { headers: { Cookie: sitzung } });
    expect(seite.status).toBe(200);
    const html = await seite.text();
    expect(html).toContain(p.challenge);
    expect(html).toContain('zustand-123');
  });

  it('mit Sitzung: Zustimmungsseite auf Deutsch, Ziel-Host deutlich, nicht einbettbar', async () => {
    const h = aufbau();
    const r = await h.anfrage(`/api/werkstatt/oauth/authorize?${form(authorizeParameter(pkce().challenge))}`, { headers: { Cookie: await h.sitzung() } });
    expect(r.status).toBe(200);
    expect(r.headers.get('content-type')).toContain('text/html');
    const html = await r.text();
    expect(html).toContain('Claude (claude.ai) möchte deine Mappe lesen');
    expect(html).toContain('<strong>claude.ai</strong>');
    expect(html).toContain('Trennen kannst du die Verbindung jederzeit in Claude unter den Connector-Einstellungen.');
    expect(html).not.toContain('Claude Code');
    expect(html).toContain('method="post"');
    const csp = r.headers.get('content-security-policy')!;
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("form-action 'self' https://claude.ai");
    expect(r.headers.get('cache-control')).toBe('no-store');
  });

  it('Zustimmungsseite maskiert eingeschleustes HTML im state', async () => {
    const h = aufbau();
    const r = await h.anfrage(`/api/werkstatt/oauth/authorize?${form(authorizeParameter(pkce().challenge, { state: '"><script>x()</script>' }))}`, { headers: { Cookie: await h.sitzung() } });
    expect(r.status).toBe(200);
    const html = await r.text();
    expect(html).not.toContain('<script>x()');
    expect(html).toContain('&quot;&gt;&lt;script&gt;');
  });

  it('nicht (mehr) freigeschaltet: keine Zustimmungsseite, sondern zur Anmeldung', async () => {
    const h = aufbau();
    const cookie = await h.sitzung();
    h.abh.umgebung.zugang = { test: { lehrende: [1000], studierende: [] } };
    const r = await h.anfrage(`/api/werkstatt/oauth/authorize?${form(authorizeParameter(pkce().challenge))}`, { headers: { Cookie: cookie } });
    expect(r.status).toBe(302);
    expect(r.headers.get('location')).toMatch(/^\/api\/werkstatt\/auth\/login\?weiter=/);
    expect(await r.text()).not.toContain('method="post"');
  });

  it('POST Zustimmung: 302 zur redirect_uri mit code, state und iss', async () => {
    const h = aufbau();
    const { ziel, code } = await codeHolen(h, pkce().challenge);
    expect(`${ziel.origin}${ziel.pathname}`).toBe(CALLBACK);
    expect(code).toMatch(/^v1\./);
    expect(ziel.searchParams.get('state')).toBe('zustand-123');
    expect(ziel.searchParams.get('iss')).toBe(ISSUER);
  });

  it('POST Ablehnen: access_denied, kein Code', async () => {
    const h = aufbau();
    const r = await h.anfrage('/api/werkstatt/oauth/authorize', {
      method: 'POST',
      headers: { ...FORM, Origin: BASIS, Cookie: await h.sitzung() },
      body: form({ ...authorizeParameter(pkce().challenge), entscheidung: 'ablehnen' }),
    });
    expect(r.status).toBe(302);
    const ziel = new URL(r.headers.get('location')!);
    expect(ziel.searchParams.get('error')).toBe('access_denied');
    expect(ziel.searchParams.get('code')).toBeNull();
    expect(ziel.searchParams.get('state')).toBe('zustand-123');
  });

  it('POST ohne Sitzung oder mit fremder redirect_uri: kein Code', async () => {
    const h = aufbau();
    const ohne = await h.anfrage('/api/werkstatt/oauth/authorize', {
      method: 'POST',
      headers: { ...FORM, Origin: BASIS },
      body: form({ ...authorizeParameter(pkce().challenge), entscheidung: 'erlauben' }),
    });
    expect(ohne.headers.get('location') ?? '').not.toContain('code=');
    expect(ohne.status).toBe(401);
    const fremd = await h.anfrage('/api/werkstatt/oauth/authorize', {
      method: 'POST',
      headers: { ...FORM, Origin: BASIS, Cookie: await h.sitzung() },
      body: form({ ...authorizeParameter(pkce().challenge, { redirect_uri: 'https://boese.example/cb' }), entscheidung: 'erlauben' }),
    });
    expect(fremd.status).toBe(400);
    expect(fremd.headers.get('location')).toBeNull();
  });

  it('POST mit fremder Origin: 403 (CSRF-Prüfung aus appErstellen)', async () => {
    const h = aufbau();
    const r = await h.anfrage('/api/werkstatt/oauth/authorize', {
      method: 'POST',
      headers: { ...FORM, Origin: 'https://boese.example', Cookie: await h.sitzung() },
      body: form({ ...authorizeParameter(pkce().challenge), entscheidung: 'erlauben' }),
    });
    expect(r.status).toBe(403);
  });

  it('jede neue client_id wird nach der Zustimmung einmal pro Tag geloggt', async () => {
    const h = aufbau();
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    const treffer = () => log.mock.calls.filter((a) => String(a[0]).includes(CLAUDE_CLIENT));
    await codeHolen(h, pkce().challenge);
    await codeHolen(h, pkce().challenge);
    expect(treffer()).toHaveLength(1);
    expect(String(treffer()[0][0])).not.toContain('zustand-123');
    h.uhr.ms += 24 * 3600 * 1000;
    await codeHolen(h, pkce().challenge);
    expect(treffer()).toHaveLength(2);
  });

  it('anonymes GET authorize: kein Log, kein Cache-Eintrag (sonst flutet jeder den Cache)', async () => {
    const h = aufbau();
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    const set = vi.spyOn(h.abh.cache, 'set');
    const r = await h.anfrage(`/api/werkstatt/oauth/authorize?${form(authorizeParameter(pkce().challenge, { client_id: 'https://claude.ai/irgendwas' }))}`);
    expect(r.status).toBe(302);
    expect(set).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  it('Zustimmungsseite: Referrer-Policy same-origin, sonst schickt der Browser beim Absenden Origin: null', async () => {
    const h = aufbau();
    const r = await h.anfrage(`/api/werkstatt/oauth/authorize?${form(authorizeParameter(pkce().challenge))}`, { headers: { Cookie: await h.sitzung() } });
    expect(r.status).toBe(200);
    expect(r.headers.get('referrer-policy')).toBe('same-origin');
    // Meldungsseiten ohne Formular bleiben bei no-referrer.
    const m = await h.anfrage(`/api/werkstatt/oauth/authorize?${form(authorizeParameter(pkce().challenge, { client_id: 'https://boese.example/c' }))}`);
    expect(m.status).toBe(400);
    expect(m.headers.get('referrer-policy')).toBe('no-referrer');
  });

  it('POST mit Origin: null (so sendet ihn ein Browser unter no-referrer): 403', async () => {
    const h = aufbau();
    const r = await h.anfrage('/api/werkstatt/oauth/authorize', {
      method: 'POST',
      headers: { ...FORM, Origin: 'null', Cookie: await h.sitzung() },
      body: form({ ...authorizeParameter(pkce().challenge), entscheidung: 'erlauben' }),
    });
    expect(r.status).toBe(403);
  });

  it('zu langer Rücksprung: ausdrückliche Fehlerseite in GET und POST statt stillem Rückfall auf /', async () => {
    const h = aufbau();
    const lang = authorizeParameter(pkce().challenge, { state: 's'.repeat(500) });
    const g = await h.anfrage(`/api/werkstatt/oauth/authorize?${form(lang)}`);
    expect(g.status).toBe(400);
    expect(await g.text()).toContain('zu lang');
    const p = await h.anfrage('/api/werkstatt/oauth/authorize', { method: 'POST', headers: { ...FORM, Origin: BASIS }, body: form({ ...lang, entscheidung: 'erlauben' }) });
    expect(p.status).toBe(400);
    const html = await p.text();
    expect(html).toContain('zu lang');
    expect(html).not.toContain('weiter=%2F"');
  });
});

describe('oauth/token', () => {
  it('ganzer Ablauf: Sitzung -> Zustimmung -> Code -> Token -> bearerPruefen liefert Claims', async () => {
    const h = aufbau();
    const paar = await tokenPaar(h);
    expect(paar.token_type).toBe('Bearer');
    expect(paar.expires_in).toBe(3600);
    expect(paar.refresh_token).toBeTruthy();
    const claims = await bearerPruefen(h.abh, `Bearer ${paar.access_token}`, ISSUER);
    expect(claims).toStrictEqual({ githubId: 1001, kohorte: 'test', rolle: 'studierende', clientId: CLAUDE_CLIENT, exp: Math.floor(START / 1000) + 3600 });
  });

  it('Token-Antwort nie im Cache', async () => {
    const h = aufbau();
    const p = pkce();
    const { code } = await codeHolen(h, p.challenge);
    const r = await token(h, { grant_type: 'authorization_code', code, redirect_uri: CALLBACK, code_verifier: p.verifier });
    expect(r.headers.get('cache-control')).toBe('no-store');
  });

  it('Code nach 61 s: invalid_grant', async () => {
    const h = aufbau();
    const p = pkce();
    const { code } = await codeHolen(h, p.challenge);
    h.uhr.ms += 61_000;
    await erwarteInvalidGrant(await token(h, { grant_type: 'authorization_code', code, redirect_uri: CALLBACK, code_verifier: p.verifier }));
  });

  it('Code mit anderer redirect_uri: invalid_grant', async () => {
    const h = aufbau();
    const p = pkce();
    const { code } = await codeHolen(h, p.challenge);
    await erwarteInvalidGrant(await token(h, { grant_type: 'authorization_code', code, redirect_uri: 'https://claude.ai/anders', code_verifier: p.verifier }));
  });

  it('falscher code_verifier: invalid_grant', async () => {
    const h = aufbau();
    const p = pkce();
    const { code } = await codeHolen(h, p.challenge);
    await erwarteInvalidGrant(await token(h, { grant_type: 'authorization_code', code, redirect_uri: CALLBACK, code_verifier: pkce().verifier }));
  });

  it('Code für eine andere client_id: invalid_grant', async () => {
    const h = aufbau();
    const p = pkce();
    const { code } = await codeHolen(h, p.challenge);
    await erwarteInvalidGrant(await token(h, { grant_type: 'authorization_code', code, redirect_uri: CALLBACK, code_verifier: p.verifier, client_id: 'https://claude.ai/oauth/anderer' }));
  });

  it('Code zweimal eingelöst: beim zweiten Mal invalid_grant, und die Tokens des ersten Mals gelten nicht mehr', async () => {
    const h = aufbau();
    const p = pkce();
    const { code } = await codeHolen(h, p.challenge);
    const felder = { grant_type: 'authorization_code', code, redirect_uri: CALLBACK, code_verifier: p.verifier };
    const erst = await token(h, felder);
    expect(erst.status).toBe(200);
    const paar = await erst.json();
    await erwarteInvalidGrant(await token(h, felder));
    expect(await bearerPruefen(h.abh, `Bearer ${paar.access_token}`, ISSUER)).toBeNull();
    await erwarteInvalidGrant(await token(h, { grant_type: 'refresh_token', refresh_token: paar.refresh_token }));
  });

  it('Refresh-Familie: Angreifer rotiert R1 -> R2, Claude legt R1 vor -> invalid_grant, R2 und alle Access-Tokens der Familie ungültig', async () => {
    const h = aufbau();
    const paar = await tokenPaar(h);
    const angreifer = await (await token(h, { grant_type: 'refresh_token', refresh_token: paar.refresh_token })).json();
    expect(await bearerPruefen(h.abh, `Bearer ${angreifer.access_token}`, ISSUER)).not.toBeNull();
    h.uhr.ms += 31_000; // nach dem Gnadenfenster
    await erwarteInvalidGrant(await token(h, { grant_type: 'refresh_token', refresh_token: paar.refresh_token }));
    await erwarteInvalidGrant(await token(h, { grant_type: 'refresh_token', refresh_token: angreifer.refresh_token }));
    expect(await bearerPruefen(h.abh, `Bearer ${angreifer.access_token}`, ISSUER)).toBeNull();
    expect(await bearerPruefen(h.abh, `Bearer ${paar.access_token}`, ISSUER)).toBeNull();
    // Eine andere Verbindung derselben Person bleibt unberührt.
    const andere = await tokenPaar(h);
    expect(await bearerPruefen(h.abh, `Bearer ${andere.access_token}`, ISSUER)).not.toBeNull();
    expect((await token(h, { grant_type: 'refresh_token', refresh_token: andere.refresh_token })).status).toBe(200);
  });

  it('Refresh-Neuversuch innerhalb von 30 s: dieselbe Antwort noch einmal, kein zweiter Zweig', async () => {
    const h = aufbau();
    const paar = await tokenPaar(h);
    const erst = await (await token(h, { grant_type: 'refresh_token', refresh_token: paar.refresh_token })).json();
    h.uhr.ms += 20_000;
    for (let i = 0; i < 2; i++) {
      const nochmal = await token(h, { grant_type: 'refresh_token', refresh_token: paar.refresh_token });
      expect(nochmal.status).toBe(200);
      // Gleiches Paar; expires_in zählt die Zeit seit der ersten Rotation ab.
      expect(await nochmal.json()).toStrictEqual({ ...erst, expires_in: erst.expires_in - 20 });
    }
    expect(await bearerPruefen(h.abh, `Bearer ${erst.access_token}`, ISSUER)).not.toBeNull();
    // Die Kette geht mit dem Token aus der ersten Antwort weiter.
    expect((await token(h, { grant_type: 'refresh_token', refresh_token: erst.refresh_token })).status).toBe(200);
  });

  it('Refresh-Neuversuch nach 30 s: Familie widerrufen, auch das Paar aus der ersten Rotation', async () => {
    const h = aufbau();
    const paar = await tokenPaar(h);
    const erst = await (await token(h, { grant_type: 'refresh_token', refresh_token: paar.refresh_token })).json();
    h.uhr.ms += 31_000;
    await erwarteInvalidGrant(await token(h, { grant_type: 'refresh_token', refresh_token: paar.refresh_token }));
    expect(await bearerPruefen(h.abh, `Bearer ${erst.access_token}`, ISSUER)).toBeNull();
    await erwarteInvalidGrant(await token(h, { grant_type: 'refresh_token', refresh_token: erst.refresh_token }));
  });

  it('Body über 16 KB: 413 invalid_request, mit und ohne Content-Length', async () => {
    const h = aufbau();
    const gross = form({ grant_type: 'refresh_token', client_id: CLAUDE_CLIENT, refresh_token: 'x'.repeat(17 * 1024) });
    const mit = await h.anfrage('/api/werkstatt/oauth/token', { method: 'POST', headers: { ...FORM, 'Content-Length': String(gross.length) }, body: gross });
    expect(mit.status).toBe(413);
    expect(await mit.json()).toMatchObject({ error: 'invalid_request' });
    const strom = new ReadableStream({
      start(k) {
        k.enqueue(new TextEncoder().encode(gross));
        k.close();
      },
    });
    const ohne = await h.anfrage('/api/werkstatt/oauth/token', { method: 'POST', headers: FORM, body: strom, duplex: 'half' } as RequestInit);
    expect(ohne.status).toBe(413);
    expect(await ohne.json()).toMatchObject({ error: 'invalid_request' });
  });

  it('Refresh rotiert: neues Refresh-Token ≠ altes; altes erneut -> invalid_grant', async () => {
    const h = aufbau();
    const paar = await tokenPaar(h);
    const r = await token(h, { grant_type: 'refresh_token', refresh_token: paar.refresh_token });
    expect(r.status).toBe(200);
    const neu = await r.json();
    expect(neu.refresh_token).toBeTruthy();
    expect(neu.refresh_token).not.toBe(paar.refresh_token);
    expect(await bearerPruefen(h.abh, `Bearer ${neu.access_token}`, ISSUER)).toMatchObject({ githubId: 1001 });
    // Ohne Wiederverwendung rotiert die Kette beliebig weiter.
    const dritt = await token(h, { grant_type: 'refresh_token', refresh_token: neu.refresh_token });
    expect(dritt.status).toBe(200);
    const drittes = await dritt.json();
    expect(drittes.refresh_token).not.toBe(neu.refresh_token);
    h.uhr.ms += 31_000;
    await erwarteInvalidGrant(await token(h, { grant_type: 'refresh_token', refresh_token: paar.refresh_token }));
    // Wiederverwendung widerruft die ganze Familie, also auch das jüngste (siehe „Refresh-Familie“).
    await erwarteInvalidGrant(await token(h, { grant_type: 'refresh_token', refresh_token: drittes.refresh_token }));
  });

  it('Refresh nach 30 Tagen abgelaufen: invalid_grant', async () => {
    const h = aufbau();
    const paar = await tokenPaar(h);
    h.uhr.ms += 30 * 24 * 3600 * 1000;
    await erwarteInvalidGrant(await token(h, { grant_type: 'refresh_token', refresh_token: paar.refresh_token }));
  });

  it('Access-Token als Refresh-Token: invalid_grant', async () => {
    const h = aufbau();
    const paar = await tokenPaar(h);
    await erwarteInvalidGrant(await token(h, { grant_type: 'refresh_token', refresh_token: paar.access_token }));
    expect(await bearerPruefen(h.abh, `Bearer ${paar.refresh_token}`, ISSUER)).toBeNull();
  });

  it('Kohorte auf archiviert: Refresh invalid_grant, Access-Token gilt nicht mehr', async () => {
    const h = aufbau();
    const paar = await tokenPaar(h);
    kohorteTest.status = 'archiviert';
    await erwarteInvalidGrant(await token(h, { grant_type: 'refresh_token', refresh_token: paar.refresh_token }));
    expect(await bearerPruefen(h.abh, `Bearer ${paar.access_token}`, ISSUER)).toBeNull();
  });

  it('Kohorte auf archiviert: Code einlösen invalid_grant', async () => {
    const h = aufbau();
    const p = pkce();
    const { code } = await codeHolen(h, p.challenge);
    kohorteTest.status = 'archiviert';
    await erwarteInvalidGrant(await token(h, { grant_type: 'authorization_code', code, redirect_uri: CALLBACK, code_verifier: p.verifier }));
  });

  it('JSON statt Formular: 400 invalid_request', async () => {
    const h = aufbau();
    const p = pkce();
    const { code } = await codeHolen(h, p.challenge);
    const r = await h.anfrage('/api/werkstatt/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant_type: 'authorization_code', code, redirect_uri: CALLBACK, code_verifier: p.verifier, client_id: CLAUDE_CLIENT }),
    });
    expect(r.status).toBe(400);
    expect(await r.json()).toMatchObject({ error: 'invalid_request' });
  });

  it('unbekannter grant_type: unsupported_grant_type', async () => {
    const h = aufbau();
    const r = await token(h, { grant_type: 'client_credentials' });
    expect(r.status).toBe(400);
    expect(await r.json()).toMatchObject({ error: 'unsupported_grant_type' });
  });

  it('fremde client_id am Token-Endpunkt: invalid_client', async () => {
    const h = aufbau();
    const r = await token(h, { grant_type: 'refresh_token', refresh_token: 'x', client_id: 'https://boese.example/c' });
    expect(r.status).toBe(401);
    expect(await r.json()).toMatchObject({ error: 'invalid_client' });
  });
});

describe('Bindung an den Issuer (Preview mit denselben Schlüsseln)', () => {
  const PROD = 'https://ndu.datamonkeys.ai';

  it('Access-Token einer anderen Origin: bearerPruefen null', async () => {
    const h = aufbau();
    const paar = await tokenPaar(h);
    expect(await bearerPruefen(h.abh, `Bearer ${paar.access_token}`, ISSUER)).not.toBeNull();
    expect(await bearerPruefen(h.abh, `Bearer ${paar.access_token}`, `${PROD}/api/werkstatt/oauth`)).toBeNull();
  });

  it('Refresh-Token und Code einer anderen Origin: invalid_grant', async () => {
    const preview = aufbau();
    const prod = aufbau({ origin: PROD, wieBei: preview });
    const paar = await tokenPaar(preview);
    await erwarteInvalidGrant(await token(prod, { grant_type: 'refresh_token', refresh_token: paar.refresh_token }));
    const p = pkce();
    const { code } = await codeHolen(preview, p.challenge);
    await erwarteInvalidGrant(await token(prod, { grant_type: 'authorization_code', code, redirect_uri: CALLBACK, code_verifier: p.verifier }));
    // Gegenprobe: dieselben Schlüssel, dieselbe Origin – gilt.
    expect((await token(aufbau({ wieBei: preview }), { grant_type: 'refresh_token', refresh_token: paar.refresh_token })).status).toBe(200);
  });
});

describe('bearerPruefen', () => {
  it('ohne, mit Müll oder ohne Bearer: null', async () => {
    const h = aufbau();
    const paar = await tokenPaar(h);
    for (const kopf of [null, '', 'Bearer', 'Bearer x', `Basic ${paar.access_token}`, paar.access_token]) {
      expect(await bearerPruefen(h.abh, kopf, ISSUER), String(kopf)).toBeNull();
    }
    expect(await bearerPruefen(h.abh, `bearer ${paar.access_token}`, ISSUER)).not.toBeNull();
  });

  it('nach einer Stunde abgelaufen', async () => {
    const h = aufbau();
    const paar = await tokenPaar(h);
    h.uhr.ms += 3600 * 1000;
    expect(await bearerPruefen(h.abh, `Bearer ${paar.access_token}`, ISSUER)).toBeNull();
  });

  it('Person aus WERKSTATT_ZUGANG entfernt: null', async () => {
    const h = aufbau();
    const paar = await tokenPaar(h);
    h.abh.umgebung.zugang = { test: { lehrende: [1000], studierende: [] } };
    expect(await bearerPruefen(h.abh, `Bearer ${paar.access_token}`, ISSUER)).toBeNull();
  });
});

// NDU-34: Claude Code meldet sich mit eigenem CIMD an und springt auf den eigenen Rechner zurück (RFC 8252, Port wechselt).
describe('Claude Code als Client', () => {
  const CODE_CLIENT = 'https://claude.ai/oauth/claude-code-client-metadata';
  const LOOPBACK = 'http://localhost:53682/callback';
  const codeParameter = (challenge: string, redirect = LOOPBACK, clientId = CODE_CLIENT) =>
    authorizeParameter(challenge, { client_id: clientId, redirect_uri: redirect });
  const zustimmungGet = async (h: Aufbau, redirect: string, clientId = CODE_CLIENT) =>
    h.anfrage(`/api/werkstatt/oauth/authorize?${form(codeParameter(pkce().challenge, redirect, clientId))}`, { headers: { Cookie: await h.sitzung() } });

  it('erlaubt: localhost und 127.0.0.1 mit beliebigem Port, auch ohne Port', async () => {
    const h = aufbau();
    for (const redirect of [LOOPBACK, 'http://127.0.0.1:61234/callback', 'http://localhost:1/callback', 'http://localhost/callback']) {
      expect((await zustimmungGet(h, redirect)).status, redirect).toBe(200);
    }
  });

  it('abgelehnt: anderer Pfad, Host, https, Abfrage, Fragment, Zugangsdaten, nicht kanonisch, IPv6, claude.ai-Rücksprung', async () => {
    const h = aufbau();
    for (const redirect of [
      'http://localhost:53682/',
      'http://localhost:53682/callback/',
      'http://localhost:53682/Callback',
      'http://localhost:53682/callback?x=1',
      'http://localhost:53682/callback#x',
      'http://user@localhost:53682/callback',
      'https://localhost:53682/callback',
      'http://LOCALHOST:53682/callback',
      'http://localhost:080/callback',
      'http://127.0.0.2:53682/callback',
      'http://[::1]:53682/callback',
      'http://localhost.evil.example:53682/callback',
      'http://evil.example/callback',
      'https://claude.ai/api/mcp/auth_callback',
    ]) {
      const r = await zustimmungGet(h, redirect);
      expect(r.status, redirect).toBe(400);
      expect(r.headers.get('location'), redirect).toBeNull();
      expect(await r.text()).toContain('Ungültige Rücksprungadresse');
    }
  });

  it('abgelehnt: eine andere client_id (auch auf claude.ai) darf nicht auf den eigenen Rechner zurück', async () => {
    const h = aufbau();
    for (const clientId of [CLAUDE_CLIENT, 'https://claude.ai/oauth/claude-code-client-metadata/', 'https://claude.ai/oauth/anderer-client']) {
      const r = await zustimmungGet(h, LOOPBACK, clientId);
      expect(r.status, clientId).toBe(400);
      expect(r.headers.get('location'), clientId).toBeNull();
    }
  });

  it('Zustimmungsseite nennt Claude Code und den Rücksprung; form-action erlaubt genau diese Origin', async () => {
    const h = aufbau();
    const r = await zustimmungGet(h, LOOPBACK);
    const html = await r.text();
    expect(html).toContain('Claude Code (auf diesem Rechner) möchte deine Mappe lesen');
    expect(html).toContain('<strong>localhost:53682</strong>');
    expect(html).toContain('Trennen kannst du die Verbindung jederzeit in Claude Code mit /mcp (Authentifizierung löschen).');
    expect(html).not.toContain('Connector-Einstellungen');
    expect(r.headers.get('content-security-policy')).toContain("form-action 'self' http://localhost:53682;");
  });

  it('Zustimmung -> 302 auf localhost mit Code; einlösen mit anderem Port: invalid_grant', async () => {
    const h = aufbau();
    const p = pkce();
    const r = await h.anfrage('/api/werkstatt/oauth/authorize', {
      method: 'POST',
      headers: { ...FORM, Origin: BASIS, Cookie: await h.sitzung() },
      body: form({ ...codeParameter(p.challenge), entscheidung: 'erlauben' }),
    });
    expect(r.status).toBe(302);
    const ziel = new URL(r.headers.get('location')!);
    expect(`${ziel.origin}${ziel.pathname}`).toBe(LOOPBACK);
    const code = ziel.searchParams.get('code')!;
    // Ein anderer Port beim Einlösen: der Code gilt nur für genau die Adresse, an die er ging.
    const andererPort = await h.anfrage('/api/werkstatt/oauth/token', { method: 'POST', headers: FORM, body: form({ client_id: CODE_CLIENT, grant_type: 'authorization_code', code, redirect_uri: 'http://localhost:9999/callback', code_verifier: p.verifier }) });
    await erwarteInvalidGrant(andererPort);
  });

  it('Token mit genau der redirect_uri: Claims mit Claude-Code-Client; Zustimmung im Log mit Namen', async () => {
    const h = aufbau();
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    const p = pkce();
    const r = await h.anfrage('/api/werkstatt/oauth/authorize', {
      method: 'POST',
      headers: { ...FORM, Origin: BASIS, Cookie: await h.sitzung() },
      body: form({ ...codeParameter(p.challenge), entscheidung: 'erlauben' }),
    });
    const code = new URL(r.headers.get('location')!).searchParams.get('code')!;
    const t = await h.anfrage('/api/werkstatt/oauth/token', { method: 'POST', headers: FORM, body: form({ client_id: CODE_CLIENT, grant_type: 'authorization_code', code, redirect_uri: LOOPBACK, code_verifier: p.verifier }) });
    expect(t.status).toBe(200);
    const paar = (await t.json()) as { access_token: string };
    const claims = await bearerPruefen(h.abh, `Bearer ${paar.access_token}`, ISSUER);
    expect(claims).toMatchObject({ githubId: 1001, clientId: CODE_CLIENT });
    expect(log.mock.calls.map((c) => String(c[0]))).toContain(JSON.stringify({ werkstatt: 'oauth-zustimmung', host: 'localhost:53682', client: 'Claude Code (auf diesem Rechner)', kohorte: 'test' }));
  });
});
