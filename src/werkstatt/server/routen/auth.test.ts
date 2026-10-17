import { describe, expect, it, vi } from 'vitest';
import { appErstellen } from '../app';
import { githubIdentitaet } from '../github/identitaet';
import { lokaleAbhaengigkeiten, lokaleUmgebung } from '../lokal';
import { fakeSpeicher } from '../fake-speicher';
import { COOKIE_WERKSTATT, sitzungLesen } from '../sitzung';
import type { GithubIdentitaet, Speicher, Umgebung } from '../typen';

const BASIS = 'http://localhost:4321';

function aufbau(opts: { zugang?: Umgebung['zugang']; person?: { githubId: number; login: string }; anlegenWirft?: boolean } = {}) {
  const umgebung = { ...lokaleUmgebung(), zugang: opts.zugang ?? { test: { lehrende: [1000], studierende: [{ githubId: 339529141, kuerzel: 'sofie' }, { githubId: 1002, kuerzel: 'jonas' }] } } };
  const basis = fakeSpeicher();
  const anlegen = vi.fn(async (...a: Parameters<Speicher['anlegen']>) => {
    if (opts.anlegenWirft) throw new Error('GitHub kaputt');
    return basis.anlegen(...a);
  });
  const speicher: Speicher = { ...basis, anlegen };
  const person = opts.person ?? { githubId: 339529141, login: 'sofie-x' };
  const github: GithubIdentitaet = {
    loginUrl: (state, uri) => `https://github.test/auth?state=${state}&redirect_uri=${encodeURIComponent(uri)}`,
    codeEinloesen: async () => person,
  };
  const abh = lokaleAbhaengigkeiten({ umgebung, speicher, github, jetzt: () => 1_800_000_000_000 });
  return { app: appErstellen(abh), anlegen, umgebung };
}

const setCookies = (r: Response) => r.headers.getSetCookie();
const wert = (r: Response, name: string) => setCookies(r).find((c) => c.startsWith(`${name}=`))?.split(';')[0].slice(name.length + 1);

async function login(app: ReturnType<typeof aufbau>['app'], weiter?: string) {
  const r = await app.request(`${BASIS}/api/werkstatt/auth/login${weiter !== undefined ? `?weiter=${encodeURIComponent(weiter)}` : ''}`);
  const state = new URL(r.headers.get('location')!).searchParams.get('state')!;
  const stateCookie = wert(r, 'werkstatt_state')!;
  return { r, state, stateCookie };
}

function callback(app: ReturnType<typeof aufbau>['app'], state: string, stateCookie: string | undefined, code = 'x') {
  return app.request(`${BASIS}/api/werkstatt/auth/callback?code=${code}&state=${state}`, { headers: stateCookie ? { Cookie: `werkstatt_state=${stateCookie}` } : {} });
}

describe('auth/login', () => {
  it('leitet zu GitHub mit state und redirect_uri, setzt das state-Cookie', async () => {
    const { app } = aufbau();
    const { r, state, stateCookie } = await login(app, '/innolab/mappe');
    expect(r.status).toBe(302);
    expect(r.headers.get('location')).toContain(encodeURIComponent(`${BASIS}/api/werkstatt/auth/callback`));
    expect(state.length).toBeGreaterThan(16);
    expect(stateCookie.startsWith(state)).toBe(true);
    const roh = setCookies(r)[0];
    expect(roh).toMatch(/HttpOnly/i);
    expect(roh).toMatch(/Max-Age=600/i);
    expect(roh).toMatch(/SameSite=Lax/i);
  });
});

describe('auth/callback', () => {
  it('Rücksprung auf weiter, Sitzungs-Cookie, Mappe angelegt', async () => {
    const { app, anlegen, umgebung } = aufbau();
    const { state, stateCookie } = await login(app, '/innolab/mappe/brief');
    const r = await callback(app, state, stateCookie);
    expect(r.status).toBe(302);
    expect(r.headers.get('location')).toBe('/innolab/mappe/brief');
    const s = await sitzungLesen(wert(r, COOKIE_WERKSTATT), umgebung.sessionSecret, 1_800_000_000);
    expect(s).toMatchObject({ githubId: 339529141, kohorte: 'test', rolle: 'studierende' });
    expect(s!.exp).toBe(1_800_000_000 + 30 * 24 * 3600);
    expect(setCookies(r).find((c) => c.startsWith(`${COOKIE_WERKSTATT}=`))).toMatch(/HttpOnly/i);
    expect(anlegen).toHaveBeenCalledTimes(1);
  });

  it('falscher state: 400, kein Sitzungs-Cookie', async () => {
    const { app, anlegen } = aufbau();
    const { stateCookie } = await login(app);
    const r = await callback(app, 'falsch', stateCookie);
    expect(r.status).toBe(400);
    expect(wert(r, COOKIE_WERKSTATT)).toBeUndefined();
    expect(anlegen).not.toHaveBeenCalled();
  });

  it('ohne state-Cookie: 400, kein Sitzungs-Cookie', async () => {
    const { app } = aufbau();
    const { state } = await login(app);
    const r = await callback(app, state, undefined);
    expect(r.status).toBe(400);
    expect(wert(r, COOKIE_WERKSTATT)).toBeUndefined();
  });

  it('unbekannte ID: nicht freigeschaltet, anlegen nie aufgerufen, kein Cookie', async () => {
    const { app, anlegen } = aufbau({ person: { githubId: 777, login: 'fremd' } });
    const { state, stateCookie } = await login(app);
    const r = await callback(app, state, stateCookie);
    expect(r.status).toBe(302);
    expect(r.headers.get('location')).toBe('/innolab/mappe?fehler=nicht-freigeschaltet');
    expect(wert(r, COOKIE_WERKSTATT)).toBeUndefined();
    expect(anlegen).not.toHaveBeenCalled();
  });

  it('umbenannter login behält zugang', async () => {
    const { app, anlegen, umgebung } = aufbau({ person: { githubId: 339529141, login: 'neuer-name' } });
    const { state, stateCookie } = await login(app);
    const r = await callback(app, state, stateCookie);
    const s = await sitzungLesen(wert(r, COOKIE_WERKSTATT), umgebung.sessionSecret, 1_800_000_000);
    expect(s).toMatchObject({ githubId: 339529141, login: 'neuer-name' });
    expect(anlegen).toHaveBeenCalledWith(expect.objectContaining({ kuerzel: 'sofie', kohorte: 'test' }), 339529141);
  });

  it('Lehrende: Cookie mit rolle lehrende, anlegen nicht aufgerufen', async () => {
    const { app, anlegen, umgebung } = aufbau({ person: { githubId: 1000, login: 'lehrer' } });
    const { state, stateCookie } = await login(app);
    const r = await callback(app, state, stateCookie);
    const s = await sitzungLesen(wert(r, COOKIE_WERKSTATT), umgebung.sessionSecret, 1_800_000_000);
    expect(s).toMatchObject({ rolle: 'lehrende' });
    expect(anlegen).not.toHaveBeenCalled();
  });

  it('anlegen scheitert: Cookie und Rücksprung trotzdem', async () => {
    const { app, umgebung } = aufbau({ anlegenWirft: true });
    const { state, stateCookie } = await login(app, '/innolab/mappe');
    const r = await callback(app, state, stateCookie);
    expect(r.status).toBe(302);
    expect(r.headers.get('location')).toBe('/innolab/mappe');
    expect(await sitzungLesen(wert(r, COOKIE_WERKSTATT), umgebung.sessionSecret, 1_800_000_000)).not.toBeNull();
  });

  it('weiter auf fremde Adresse: Ziel /', async () => {
    const { app } = aufbau();
    const { state, stateCookie } = await login(app, 'https://boese.example');
    const r = await callback(app, state, stateCookie);
    expect(r.headers.get('location')).toBe('/');
  });

  it('GitHub lehnt den Code ab: 502, kein Cookie', async () => {
    const abh = lokaleAbhaengigkeiten({ github: { loginUrl: (s) => `https://github.test/?state=${s}`, codeEinloesen: async () => { throw new Error('nein'); } } });
    const app = appErstellen(abh);
    const { state, stateCookie } = await login(app);
    const r = await callback(app, state, stateCookie);
    expect(r.status).toBe(502);
    expect(wert(r, COOKIE_WERKSTATT)).toBeUndefined();
  });
});

describe('auth/ich und abmelden', () => {
  async function angemeldet(person: { githubId: number; login: string }) {
    const t = aufbau({ person });
    const { state, stateCookie } = await login(t.app);
    const r = await callback(t.app, state, stateCookie);
    return { ...t, cookie: `${COOKIE_WERKSTATT}=${wert(r, COOKIE_WERKSTATT)}` };
  }

  it('ohne Sitzung: 401 nicht-angemeldet', async () => {
    const { app } = aufbau();
    const r = await app.request(`${BASIS}/api/werkstatt/auth/ich`);
    expect(r.status).toBe(401);
    expect(await r.json()).toMatchObject({ code: 'nicht-angemeldet' });
  });

  it('Studierende: Ich mit repo', async () => {
    const { app, cookie } = await angemeldet({ githubId: 339529141, login: 'neuer-name' });
    const r = await app.request(`${BASIS}/api/werkstatt/auth/ich`, { headers: { Cookie: cookie } });
    expect(await r.json()).toStrictEqual({ githubId: 339529141, login: 'neuer-name', kohorte: 'test', rolle: 'studierende', repo: 'test-sofie' });
  });

  it('Lehrende: repo null', async () => {
    const { app, cookie } = await angemeldet({ githubId: 1000, login: 'lehrer' });
    const r = await app.request(`${BASIS}/api/werkstatt/auth/ich`, { headers: { Cookie: cookie } });
    expect(await r.json()).toMatchObject({ rolle: 'lehrende', repo: null });
  });

  it('Mappe noch nicht angelegt: repo null', async () => {
    const t = aufbau({ anlegenWirft: true });
    const { state, stateCookie } = await login(t.app);
    const cookie = `${COOKIE_WERKSTATT}=${wert(await callback(t.app, state, stateCookie), COOKIE_WERKSTATT)}`;
    const r = await t.app.request(`${BASIS}/api/werkstatt/auth/ich`, { headers: { Cookie: cookie } });
    expect(await r.json()).toMatchObject({ repo: null });
  });

  it('Abmelden löscht das Cookie', async () => {
    const { app } = aufbau();
    const r = await app.request(`${BASIS}/api/werkstatt/auth/abmelden`, { method: 'POST', headers: { Origin: BASIS } });
    expect(r.status).toBe(200);
    expect(setCookies(r).find((c) => c.startsWith(`${COOKIE_WERKSTATT}=`))).toMatch(/Max-Age=0/i);
  });
});

describe('githubIdentitaet (Fake-fetch)', () => {
  const env = { githubClientId: 'cid', githubClientSecret: 'geheim' };

  it('loginUrl', () => {
    const u = new URL(githubIdentitaet(env).loginUrl('st', 'https://x.test/cb'));
    expect(u.origin + u.pathname).toBe('https://github.com/login/oauth/authorize');
    expect(Object.fromEntries(u.searchParams)).toStrictEqual({ client_id: 'cid', state: 'st', redirect_uri: 'https://x.test/cb' });
  });

  it('Code gegen Token, Token gegen id und login', async () => {
    const aufrufe: { url: string; init?: RequestInit }[] = [];
    const f = (async (url: string, init?: RequestInit) => {
      aufrufe.push({ url, init });
      if (url === 'https://github.com/login/oauth/access_token') return Response.json({ access_token: 'tok' });
      return Response.json({ id: 1001, login: 'sofie-x', email: 'geheim' });
    }) as unknown as typeof fetch;
    const r = await githubIdentitaet(env, f).codeEinloesen('code1', 'https://x.test/cb');
    expect(r).toStrictEqual({ githubId: 1001, login: 'sofie-x' });
    expect(aufrufe.map((a) => a.url)).toStrictEqual(['https://github.com/login/oauth/access_token', 'https://api.github.com/user']);
    expect((aufrufe[0].init!.headers as Record<string, string>).Accept).toBe('application/json');
    expect(JSON.parse(aufrufe[0].init!.body as string)).toStrictEqual({ client_id: 'cid', client_secret: 'geheim', code: 'code1', redirect_uri: 'https://x.test/cb' });
    expect((aufrufe[1].init!.headers as Record<string, string>).Authorization).toBe('Bearer tok');
  });

  it('abgelehnter Code (200 mit error) wirft', async () => {
    const f = (async () => Response.json({ error: 'bad_verification_code' })) as unknown as typeof fetch;
    await expect(githubIdentitaet(env, f).codeEinloesen('c', 'u')).rejects.toThrow(/bad_verification_code/);
  });

  it('unerwartete /user-Antwort wirft', async () => {
    const f = (async (url: string) => (url.includes('access_token') ? Response.json({ access_token: 't' }) : Response.json({ id: 'x' }))) as unknown as typeof fetch;
    await expect(githubIdentitaet(env, f).codeEinloesen('c', 'u')).rejects.toThrow();
  });
});
