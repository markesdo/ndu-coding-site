import { describe, expect, it } from 'vitest';
import { afterEach, vi } from 'vitest';
import middleware, { config } from '../../middleware';
import { COOKIE, tokenErstellen } from './kurszugang';

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
