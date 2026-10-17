import { describe, expect, it } from 'vitest';
import { appErstellen } from './app';
import { lokaleAbhaengigkeiten, lokaleUmgebung } from './lokal';
import { produktionsAbhaengigkeiten } from './produktion';
import { mapCache } from './cache';

const BASIS = 'http://localhost:4321';
const app = appErstellen(lokaleAbhaengigkeiten());

function anfrage(pfad: string, init: RequestInit = {}) {
  return app.request(`${BASIS}${pfad}`, init);
}

// Stubs markieren sich mit x-werkstatt-stub, damit sichtbar ist, welcher Router geantwortet hat.
async function stub(r: Response): Promise<string | null> {
  expect(r.status).toBe(501);
  expect(await r.json()).toMatchObject({ code: 'unbekannt' });
  return r.headers.get('x-werkstatt-stub');
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
    expect(await stub(await anfrage('/.well-known/oauth-protected-resource/api/werkstatt/mcp'))).toBe('oauth');
    expect(await stub(await anfrage('/api/werkstatt/mcp/resource'))).toBe('oauth');
  });

  it('Issuer-Metadaten und OAuth-Endpunkte erreichen oauthRouten', async () => {
    expect(await stub(await anfrage('/.well-known/oauth-authorization-server/api/werkstatt/oauth'))).toBe('oauth');
    expect(await stub(await anfrage('/api/werkstatt/oauth/metadata'))).toBe('oauth');
    expect(await stub(await anfrage('/api/werkstatt/oauth/token', { method: 'POST' }))).toBe('oauth');
  });

  it('übrige Bereiche erreichen ihren eigenen Router', async () => {
    expect(await stub(await anfrage('/api/werkstatt/mcp', { method: 'POST' }))).toBe('mcp');
    // auth ist gebaut (T4): ohne Sitzung 401 statt Stub.
    expect((await anfrage('/api/werkstatt/auth/ich')).status).toBe(401);
    expect(await stub(await anfrage('/api/werkstatt/mappe'))).toBe('mappe');
    expect(await stub(await anfrage('/api/werkstatt/mappe/brief'))).toBe('mappe');
  });

  it('Metadaten ohne Suffix an der Wurzel erreichen oauthRouten (so sucht Claude zuerst)', async () => {
    expect(await stub(await anfrage('/.well-known/oauth-authorization-server'))).toBe('oauth');
    expect(await stub(await anfrage('/.well-known/oauth-protected-resource'))).toBe('oauth');
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
    expect(await stub(r)).toBe('mappe');
  });

  it('POST und DELETE unter mappe sind ebenso geschützt, GET nicht', async () => {
    expect((await anfrage('/api/werkstatt/mappe/brief', { method: 'POST', headers: { Origin: 'https://boese.example' } })).status).toBe(403);
    expect((await anfrage('/api/werkstatt/mappe/brief', { method: 'DELETE', headers: { Origin: 'https://boese.example' } })).status).toBe(403);
    expect((await anfrage('/api/werkstatt/mappe', { method: 'POST', headers: { Origin: 'https://boese.example' } })).status).toBe(403);
    expect(await stub(await anfrage('/api/werkstatt/mappe/brief', { headers: { Origin: 'https://boese.example' } }))).toBe('mappe');
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
    expect(await stub(await anfrage('/api/werkstatt/oauth/authorize', { method: 'POST', headers: { ...form, Origin: BASIS }, body: 'a=1' }))).toBe('oauth');
    expect((await anfrage('/api/werkstatt/oauth/authorize', { method: 'POST', headers: { ...form, Origin: 'https://boese.example' }, body: 'a=1' })).status).toBe(403);
    expect((await anfrage('/api/werkstatt/oauth/authorize', { method: 'POST', headers: form, body: 'a=1' })).status).toBe(403);
  });

  it('Token-Endpunkt bleibt ohne Origin erreichbar (Claude ruft ihn vom Server aus)', async () => {
    expect(await stub(await anfrage('/api/werkstatt/oauth/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'a=1' }))).toBe('oauth');
  });

  it('mit WERKSTATT_ORIGIN zählt diese, nicht die Origin der Anfrage-URL', async () => {
    const prod = appErstellen(lokaleAbhaengigkeiten({ umgebung: { ...lokaleUmgebung(), origin: 'https://ndu.datamonkeys.ai' } }));
    const put = (origin: string) => prod.request(`${BASIS}/api/werkstatt/mappe/brief`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Origin: origin }, body: '{}' });
    expect((await put(BASIS)).status).toBe(403);
    expect(await stub(await put('https://ndu.datamonkeys.ai'))).toBe('mappe');
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
