import { describe, expect, it } from 'vitest';
import { appErstellen } from './app';
import { lokaleAbhaengigkeiten, lokaleUmgebung } from './lokal';
import { produktionsAbhaengigkeiten } from './produktion';
import { mapCache } from './cache';
import { COOKIE_WERKSTATT, sitzungErstellen } from './sitzung';

const BASIS = 'http://localhost:4321';
const app = appErstellen(lokaleAbhaengigkeiten());

function anfrage(pfad: string, init: RequestInit = {}) {
  return app.request(`${BASIS}${pfad}`, init);
}

// Antworten des OAuth-Routers (T7): Metadaten bzw. OAuth-Fehler im Format von RFC 6749.
async function issuerMeta(r: Response): Promise<string> {
  expect(r.status).toBe(200);
  return (await r.json()).issuer;
}
async function resourceMeta(r: Response): Promise<string> {
  expect(r.status).toBe(200);
  return (await r.json()).resource;
}
async function oauthFehler(r: Response): Promise<string> {
  expect(r.status).toBe(400);
  return (await r.json()).error;
}
// Der Mappe-Router (T11) antwortet ohne Sitzung mit 401 nicht-angemeldet – hinter der CSRF-Prüfung (die gäbe 403).
async function mappe(r: Response): Promise<string> {
  expect(r.status).toBe(401);
  return (await r.json()).code;
}

const JSON_KOPF = { 'Content-Type': 'application/json', Origin: BASIS };

describe('Routing', () => {
  it('unbekannter Pfad: 404 als ApiFehler, nicht im Cache', async () => {
    const r = await anfrage('/api/werkstatt/gibtsnicht');
    expect(r.status).toBe(404);
    expect(r.headers.get('content-type')).toContain('application/json');
    expect(r.headers.get('cache-control')).toBe('no-store');
    const body = await r.json();
    expect(body.code).toBe('unbekannt');
    expect(typeof body.fehler).toBe('string');
  });

  it('Resource-Metadaten erreichen oauthRouten, nicht mcpRouten', async () => {
    // oauth ist gebaut (T7): Metadaten statt Stub.
    expect(await resourceMeta(await anfrage('/.well-known/oauth-protected-resource/api/werkstatt/mcp'))).toBe(`${BASIS}/api/werkstatt/mcp`);
    expect(await resourceMeta(await anfrage('/api/werkstatt/mcp/resource'))).toBe(`${BASIS}/api/werkstatt/mcp`);
  });

  it('Issuer-Metadaten und OAuth-Endpunkte erreichen oauthRouten', async () => {
    expect(await issuerMeta(await anfrage('/.well-known/oauth-authorization-server/api/werkstatt/oauth'))).toBe(`${BASIS}/api/werkstatt/oauth`);
    expect(await issuerMeta(await anfrage('/api/werkstatt/oauth/metadata'))).toBe(`${BASIS}/api/werkstatt/oauth`);
    expect(await oauthFehler(await anfrage('/api/werkstatt/oauth/token', { method: 'POST' }))).toBe('invalid_request');
  });

  it('übrige Bereiche erreichen ihren eigenen Router', async () => {
    // mcp ist gebaut (T12): ohne Token 401 mit Discovery-Verweis statt Stub.
    const mcp = await anfrage('/api/werkstatt/mcp', { method: 'POST' });
    expect(mcp.status).toBe(401);
    expect(mcp.headers.get('www-authenticate')).toContain('resource_metadata=');
    // auth ist gebaut (T4): ohne Sitzung 401 statt Stub.
    expect((await anfrage('/api/werkstatt/auth/ich')).status).toBe(401);
    // mappe ist gebaut (T11): ohne Sitzung 401 statt Stub.
    expect(await mappe(await anfrage('/api/werkstatt/mappe'))).toBe('nicht-angemeldet');
    expect(await mappe(await anfrage('/api/werkstatt/mappe/brief'))).toBe('nicht-angemeldet');
  });

  it('mit gültiger Sitzung liefert /api/werkstatt/mappe einen MappeStand (Router wirklich eingehängt)', async () => {
    const abh = lokaleAbhaengigkeiten();
    const mit = appErstellen(abh);
    const wert = await sitzungErstellen({ githubId: 900001, login: 'sofie-test', kohorte: 'test', rolle: 'studierende', exp: Math.floor(Date.now() / 1000) + 600 }, abh.umgebung.sessionSecret);
    const r = await mit.request(`${BASIS}/api/werkstatt/mappe`, { headers: { Cookie: `${COOKIE_WERKSTATT}=${wert}` } });
    expect(r.status).toBe(200);
    const stand = await r.json();
    expect(stand).toMatchObject({ kohorte: 'test', repo: 'test-sofie' });
    expect(stand.artefakte.map((a: { name: string }) => a.name)).toStrictEqual(['brief', 'entscheidungen', 'annahmen', 'leitfaden']);
  });

  it('Metadaten ohne Suffix an der Wurzel: 404 als ApiFehler (Issuer mit Pfad, RFC 8414 §3.3)', async () => {
    for (const p of ['/.well-known/oauth-authorization-server', '/.well-known/oauth-protected-resource']) {
      const r = await anfrage(p);
      expect(r.status, p).toBe(404);
      expect(await r.json(), p).toMatchObject({ code: 'unbekannt' });
    }
  });

  it('andere /.well-known-Pfade gehören nicht zur Werkstatt', async () => {
    expect((await anfrage('/.well-known/openid-configuration')).status).toBe(404);
  });
});

describe('CSRF', () => {
  it('PUT auf ein Artefakt mit fremder Origin: 403 csrf', async () => {
    const r = await anfrage('/api/werkstatt/mappe/brief', { method: 'PUT', headers: { ...JSON_KOPF, Origin: 'https://boese.example' }, body: '{}' });
    expect(r.status).toBe(403);
    expect(await r.json()).toMatchObject({ code: 'csrf' });
  });

  it('PUT ohne Origin: 403 csrf', async () => {
    const r = await anfrage('/api/werkstatt/mappe/brief', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    expect(r.status).toBe(403);
    expect(await r.json()).toMatchObject({ code: 'csrf' });
  });

  it('PUT ohne Content-Type application/json: 403 csrf', async () => {
    for (const kopf of [{ Origin: BASIS }, { Origin: BASIS, 'Content-Type': 'text/plain' }, { Origin: BASIS, 'Content-Type': 'application/x-www-form-urlencoded' }]) {
      const r = await anfrage('/api/werkstatt/mappe/brief', { method: 'PUT', headers: kopf, body: '{}' });
      expect(r.status).toBe(403);
      expect(await r.json()).toMatchObject({ code: 'csrf' });
    }
  });

  it('PUT mit JSON und eigener Origin kommt beim Router an', async () => {
    const r = await anfrage('/api/werkstatt/mappe/brief', { method: 'PUT', headers: { ...JSON_KOPF, 'Content-Type': 'application/json; charset=utf-8' }, body: '{}' });
    expect(await mappe(r)).toBe('nicht-angemeldet');
  });

  it('POST und DELETE unter mappe sind ebenso geschützt, GET nicht', async () => {
    expect((await anfrage('/api/werkstatt/mappe/brief', { method: 'POST', headers: { Origin: 'https://boese.example' } })).status).toBe(403);
    expect((await anfrage('/api/werkstatt/mappe/brief', { method: 'DELETE', headers: { Origin: 'https://boese.example' } })).status).toBe(403);
    expect((await anfrage('/api/werkstatt/mappe', { method: 'POST', headers: { Origin: 'https://boese.example' } })).status).toBe(403);
    expect(await mappe(await anfrage('/api/werkstatt/mappe/brief', { headers: { Origin: 'https://boese.example' } }))).toBe('nicht-angemeldet');
  });

  it('kodierter Pfad umgeht die Prüfung nicht', async () => {
    const r = await anfrage('/api/werkstatt/%6Dappe/brief', { method: 'PUT', headers: { ...JSON_KOPF, Origin: 'https://boese.example' }, body: '{}' });
    expect(r.status).toBe(403);
  });

  it('Abmelden: nur Origin zählt, Content-Type egal', async () => {
    expect((await anfrage('/api/werkstatt/auth/abmelden', { method: 'POST', headers: { Origin: BASIS } })).status).toBe(200);
    const fremd = await anfrage('/api/werkstatt/auth/abmelden', { method: 'POST', headers: { ...JSON_KOPF, Origin: 'https://boese.example' } });
    expect(fremd.status).toBe(403);
    expect(await fremd.json()).toMatchObject({ code: 'csrf' });
  });

  it('Zustimmung POST oauth/authorize: Formular erlaubt, fremde Origin nicht', async () => {
    const form = { 'Content-Type': 'application/x-www-form-urlencoded' };
    // Durch die CSRF-Prüfung bis zum OAuth-Router: der lehnt die unvollständige Anfrage selbst ab (400-Seite, nicht 403).
    const durch = await anfrage('/api/werkstatt/oauth/authorize', { method: 'POST', headers: { ...form, Origin: BASIS }, body: 'a=1' });
    expect(durch.status).toBe(400);
    expect(durch.headers.get('content-type')).toContain('text/html');
    expect((await anfrage('/api/werkstatt/oauth/authorize', { method: 'POST', headers: { ...form, Origin: 'https://boese.example' }, body: 'a=1' })).status).toBe(403);
    expect((await anfrage('/api/werkstatt/oauth/authorize', { method: 'POST', headers: form, body: 'a=1' })).status).toBe(403);
  });

  it('Token-Endpunkt bleibt ohne Origin erreichbar (Claude ruft ihn vom Server aus)', async () => {
    expect(await oauthFehler(await anfrage('/api/werkstatt/oauth/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'a=1' }))).toBe('unsupported_grant_type');
  });

  it('mit WERKSTATT_ORIGIN zählt diese, nicht die Origin der Anfrage-URL', async () => {
    const prod = appErstellen(lokaleAbhaengigkeiten({ umgebung: { ...lokaleUmgebung(), origin: 'https://ndu.datamonkeys.ai' } }));
    const put = (origin: string) => prod.request(`${BASIS}/api/werkstatt/mappe/brief`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Origin: origin }, body: '{}' });
    expect((await put(BASIS)).status).toBe(403);
    expect(await mappe(await put('https://ndu.datamonkeys.ai'))).toBe('nicht-angemeldet');
  });
});

describe('Produktion ohne Secrets', () => {
  const prod = appErstellen(produktionsAbhaengigkeiten({}));
  it('baut die App, ohne zu werfen, und routet weiter', async () => {
    expect((await prod.request(`${BASIS}/api/werkstatt/gibtsnicht`)).status).toBe(404);
  });
  it('braucht eine Anfrage die Umgebung: 503 als ApiFehler, kein Absturz und kein Secret im Text', async () => {
    const r = await prod.request(`${BASIS}/api/werkstatt/mappe/brief`, { method: 'PUT', headers: JSON_KOPF, body: '{}' });
    expect(r.status).toBe(503);
    expect(r.headers.get('cache-control')).toBe('no-store');
    const body = await r.json();
    expect(body.code).toBe('unbekannt');
    expect(body.fehler).not.toMatch(/GITHUB|MCP_|WERKSTATT_/);
  });
});

describe('mapCache', () => {
  it('liefert bis zum Ablauf, danach undefined', async () => {
    let jetzt = 1_000_000;
    const c = mapCache(() => jetzt);
    await c.set('k', { a: 1 }, 60);
    expect(await c.get('k')).toEqual({ a: 1 });
    jetzt += 59_000;
    expect(await c.get('k')).toEqual({ a: 1 });
    jetzt += 2_000;
    expect(await c.get('k')).toBeUndefined();
  });
});
