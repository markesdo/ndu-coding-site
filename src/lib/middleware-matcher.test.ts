import { describe, expect, it } from 'vitest';
import { afterEach, vi } from 'vitest';
import middleware, { config } from '../../middleware';
import { COOKIE, istOeffentlich, tokenErstellen } from './kurszugang';

// Vercel wendet den Matcher wie einen Pfad-Ausdruck an; für unsere Muster genügt ein verankerter RegExp.
const geschuetzt = (pfad: string) => config.matcher.some((m) => new RegExp(`^${m}$`).test(pfad));

describe('Kurspasswort-Matcher', () => {
  it('lässt das Bild der Link-Vorschau durch – WhatsApp & Co. sind nicht angemeldet', () => {
    expect(geschuetzt('/og.png')).toBe(false);
    expect(geschuetzt('/og-innolab.png')).toBe(false);
  });
  it('lässt das Innolab-Favicon durch – wie das des Coding-Kurses', () => {
    expect(geschuetzt('/favicon-innolab.svg')).toBe(false);
  });
  it('lässt version.json durch – sonst bekäme der Hinweis „Seite aktualisiert“ die Login-Seite', () => {
    expect(geschuetzt('/version.json')).toBe(false);
  });
  it('schützt weiterhin die Kursseiten', () => {
    expect(geschuetzt('/tag-1')).toBe(true);
    expect(geschuetzt('/')).toBe(true);
    expect(geschuetzt('/og.png.html')).toBe(true);
    expect(geschuetzt('/og-innolab.png.html')).toBe(true);
    expect(geschuetzt('/og-andere.png')).toBe(true);
    expect(geschuetzt('/version.json.html')).toBe(true);
  });
});

describe('Middleware ohne Anmeldung', () => {
  afterEach(() => vi.unstubAllEnvs());
  const ohneCookie = async (pfad: string) => {
    vi.stubEnv('SITE_PASSWORD', 'pw');
    vi.stubEnv('SITE_SESSION_SECRET', 's'.repeat(32));
    return middleware(new Request(`https://kurs.invalid${pfad}`));
  };
  it('Schnittstellen antworten mit 401 JSON statt mit der Login-Seite (fetch hielte die für Erfolg)', async () => {
    const r = await ohneCookie('/api/position');
    expect(r.status).toBe(401);
    expect(r.headers.get('content-type')).toContain('application/json');
  });
  it('Seiten leiten weiter zum Login', async () => {
    const r = await ohneCookie('/tag-1');
    expect(r.status).toBe(303);
    expect(r.headers.get('location')).toBe('/login?weiter=%2Ftag-1');
  });
  it('Innolab-Seiten leiten zur Innolab-Anmeldung, und die ist ohne Cookie erreichbar', async () => {
    const r = await ohneCookie('/innolab/tag-1');
    expect(r.status).toBe(303);
    expect(r.headers.get('location')).toBe('/login/innolab?weiter=%2Finnolab%2Ftag-1');
    const login = await ohneCookie('/login/innolab?weiter=%2Finnolab%2Ftag-1');
    expect(login.headers.get('x-middleware-next')).toBe('1');
  });
});

describe('Innolab-Anmeldung mit Cookie', () => {
  afterEach(() => vi.unstubAllEnvs());
  it('leitet sofort zum Ziel weiter, wie /login', async () => {
    vi.stubEnv('SITE_PASSWORD', 'pw');
    vi.stubEnv('SITE_SESSION_SECRET', 's'.repeat(32));
    const token = await tokenErstellen('s'.repeat(32), 'pw', Math.floor(Date.now() / 1000));
    const r = await middleware(new Request('https://kurs.invalid/login/innolab?weiter=%2Finnolab', { headers: { cookie: `${COOKIE}=${token}` } }));
    expect(r.status).toBe(303);
    expect(r.headers.get('location')).toBe('/innolab');
  });
  it('ohne weiter geht es zur Innolab-Übersicht, nicht in den Coding-Kurs', async () => {
    vi.stubEnv('SITE_PASSWORD', 'pw');
    vi.stubEnv('SITE_SESSION_SECRET', 's'.repeat(32));
    const token = await tokenErstellen('s'.repeat(32), 'pw', Math.floor(Date.now() / 1000));
    const r = await middleware(new Request('https://kurs.invalid/login/innolab', { headers: { cookie: `${COOKIE}=${token}` } }));
    expect(r.headers.get('location')).toBe('/innolab');
  });
});

describe('Falsches Passwort', () => {
  afterEach(() => vi.unstubAllEnvs());
  const falsch = async (weiterZiel: string) => {
    vi.stubEnv('SITE_PASSWORD', 'pw');
    vi.stubEnv('SITE_SESSION_SECRET', 's'.repeat(32));
    const form = new FormData();
    form.set('passwort', 'falsch');
    form.set('weiter', weiterZiel);
    return middleware(new Request('https://kurs.invalid/login', { method: 'POST', body: form }));
  };
  it('bleibt bei einem Innolab-Ziel auf der Innolab-Anmeldung', async () => {
    const r = await falsch('/innolab/tag-1');
    expect(r.status).toBe(303);
    expect(r.headers.get('location')).toBe('/login/innolab?weiter=%2Finnolab%2Ftag-1&fehler=1');
  });
  it('bleibt sonst auf /login', async () => {
    const r = await falsch('/tag-1');
    expect(r.headers.get('location')).toBe('/login?weiter=%2Ftag-1&fehler=1');
  });
});

describe('Middleware mit Anmeldung', () => {
  afterEach(() => vi.unstubAllEnvs());
  it('Kursseiten kommen mit private, no-store – sie gehören in keinen geteilten Cache', async () => {
    vi.stubEnv('SITE_PASSWORD', 'pw');
    vi.stubEnv('SITE_SESSION_SECRET', 's'.repeat(32));
    const token = await tokenErstellen('s'.repeat(32), 'pw', Math.floor(Date.now() / 1000));
    const r = await middleware(new Request('https://kurs.invalid/tag-3', { headers: { cookie: `${COOKIE}=${token}` } }));
    expect(r.headers.get('x-middleware-next')).toBe('1');
    expect(r.headers.get('cache-control')).toBe('private, no-store');
    expect(r.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });
});

describe('Werkstatt ohne Kurspasswort', () => {
  afterEach(() => vi.unstubAllEnvs());
  it('nimmt genau /api/werkstatt und die vier OAuth-Metadatenpfade aus', () => {
    for (const p of [
      '/api/werkstatt',
      '/api/werkstatt/',
      '/api/werkstatt/mcp',
      '/api/werkstatt/oauth/token',
      '/api/werkstatt/mappe/brief',
      '/.well-known/oauth-authorization-server/api/werkstatt/oauth',
      '/.well-known/oauth-protected-resource/api/werkstatt/mcp',
      '/.well-known/oauth-authorization-server',
      '/.well-known/oauth-protected-resource',
    ]) expect(istOeffentlich(p), p).toBe(true);
  });
  it('alles andere bleibt hinter dem Kurspasswort', () => {
    for (const p of [
      '/api/werkstattx',
      '/api/werkstatt-x/mcp',
      '/api/position',
      '/innolab/mappe',
      '/.well-known/anderes',
      '/.well-known/openid-configuration',
      '/.well-known/oauth-authorization-server/',
      '/.well-known/oauth-protected-resource/',
      '/.well-known/oauth-authorization-server/api/werkstatt/oauth/x',
      '/.well-known/oauth-protected-resource/api/werkstatt/mcpx',
      '/x/api/werkstatt',
    ]) expect(istOeffentlich(p), p).toBe(false);
  });
  it('kodierte Trenner oder Punkte im Werkstatt-Pfad: geschützt (kein Umweg auf Kursseiten)', () => {
    for (const p of [
      '/api/werkstatt/..%2F..%2Ftag-1',
      '/api/werkstatt/..%2f..%2ftag-1',
      '/api/werkstatt/%2e%2e/%2e%2e/tag-1',
      '/api/werkstatt/%2E%2E/tag-1',
      '/api/werkstatt/..%5C..%5Ctag-1',
      '/api/werkstatt/..%5c..%5ctag-1',
      '/api/werkstatt/mappe%2Fbrief',
      '/.well-known/oauth-protected-resource/api/werkstatt/mcp%2F..',
    ]) expect(istOeffentlich(p), p).toBe(false);
    expect(istOeffentlich('/api/werkstatt/mappe/brief')).toBe(true);
    expect(istOeffentlich('/api/werkstatt/auth/login')).toBe(true);
  });
  it('Middleware: /api/werkstatt/..%2F..%2Ftag-1 ohne Cookie bekommt 401, nicht die Seite', async () => {
    vi.stubEnv('SITE_PASSWORD', 'pw');
    vi.stubEnv('SITE_SESSION_SECRET', 's'.repeat(32));
    const r = await middleware(new Request('https://kurs.invalid/api/werkstatt/..%2F..%2Ftag-1'));
    expect(r.headers.get('x-middleware-next')).toBeNull();
    expect(r.status).toBe(401);
  });
  it('/start bleibt öffentlich, /start/geheim nicht', () => {
    expect(istOeffentlich('/start')).toBe(true);
    expect(istOeffentlich('/start/')).toBe(true);
    expect(istOeffentlich('/start/geheim')).toBe(false);
  });
  it('Middleware lässt /api/werkstatt/mcp ohne Cookie zur Funktion durch, /api/werkstattx nicht', async () => {
    vi.stubEnv('SITE_PASSWORD', 'pw');
    vi.stubEnv('SITE_SESSION_SECRET', 's'.repeat(32));
    const frei = await middleware(new Request('https://kurs.invalid/api/werkstatt/mcp', { method: 'POST' }));
    expect(frei.headers.get('x-middleware-next')).toBe('1');
    const metadaten = await middleware(new Request('https://kurs.invalid/.well-known/oauth-authorization-server/api/werkstatt/oauth'));
    expect(metadaten.headers.get('x-middleware-next')).toBe('1');
    const gesperrt = await middleware(new Request('https://kurs.invalid/api/werkstattx'));
    expect(gesperrt.status).toBe(401);
  });
});
