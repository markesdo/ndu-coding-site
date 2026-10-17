import { describe, expect, it, vi } from 'vitest';
import { kohorteTest } from '../../kohorten/test';
import { appErstellen } from '../app';
import { githubIdentitaet } from '../github/identitaet';
import { lokaleAbhaengigkeiten, lokaleUmgebung } from '../lokal';
import { fakeSpeicher } from '../fake-speicher';
import { COOKIE_WERKSTATT, cookieName, sitzungLesen } from '../sitzung';
import type { GithubIdentitaet, Speicher, Umgebung } from '../typen';

const BASIS = 'http://localhost:4321';

function aufbau(opts: { zugang?: Umgebung['zugang']; person?: { githubId: number; login: string }; anlegenWirft?: boolean; lesezugriff?: Speicher['lesezugriff']; werkstattJson?: Speicher['werkstattJson'] } = {}) {
  const umgebung = { ...lokaleUmgebung(), zugang: opts.zugang ?? { test: { lehrende: [1000], studierende: [{ githubId: 1001, kuerzel: 'sofie' }, { githubId: 1002, kuerzel: 'jonas' }] } } };
  const basis = fakeSpeicher();
  const anlegen = vi.fn(async (...a: Parameters<Speicher['anlegen']>) => {
    if (opts.anlegenWirft) throw new Error('GitHub kaputt');
    return basis.anlegen(...a);
  });
  const lesezugriff = vi.fn(opts.lesezugriff ?? basis.lesezugriff);
  const speicher: Speicher = { ...basis, anlegen, lesezugriff, ...(opts.werkstattJson ? { werkstattJson: opts.werkstattJson } : {}) };
  const person = opts.person ?? { githubId: 1001, login: 'sofie-x' };
  const github: GithubIdentitaet = {
    loginUrl: (state, uri) => `https://github.test/auth?state=${state}&redirect_uri=${encodeURIComponent(uri)}`,
    codeEinloesen: async () => person,
  };
  const abh = lokaleAbhaengigkeiten({ umgebung, speicher, github, jetzt: () => 1_800_000_000_000 });
  return { app: appErstellen(abh), anlegen, lesezugriff, umgebung };
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

describe('Cookies in Produktion (lokal: false)', () => {
  it('Host-Präfix und Secure bei state- und Sitzungs-Cookie', async () => {
    const t = aufbau();
    const umgebung = { ...t.umgebung, lokal: false };
    const abh = lokaleAbhaengigkeiten({ umgebung, github: { loginUrl: (s) => `https://github.test/?state=${s}`, codeEinloesen: async () => ({ githubId: 1001, login: 'x' }) } });
    const app = appErstellen(abh);
    const l = await app.request(`${BASIS}/api/werkstatt/auth/login`);
    const sc = setCookies(l)[0];
    expect(sc.startsWith('__Host-werkstatt_state=')).toBe(true);
    expect(sc).toMatch(/Secure/i);
    expect(sc).toMatch(/Path=\//);
    const state = new URL(l.headers.get('location')!).searchParams.get('state')!;
    const r = await app.request(`${BASIS}/api/werkstatt/auth/callback?code=x&state=${state}`, { headers: { Cookie: `__Host-werkstatt_state=${sc.split(';')[0].split('=').slice(1).join('=')}` } });
    expect(cookieName(false)).toBe('__Host-ndu_werkstatt');
    expect(cookieName(true)).toBe('ndu_werkstatt');
    const sitz = setCookies(r).find((c) => c.startsWith('__Host-ndu_werkstatt='))!;
    expect(sitz).toMatch(/Secure/i);
    expect(sitz).toMatch(/Path=\//);
    expect(sitz).not.toMatch(/Domain/i);
    expect(setCookies(r).some((c) => c.startsWith(`${COOKIE_WERKSTATT}=`))).toBe(false);
    // Das Cookie mit dem alten, einfachen Namen gilt in Produktion nicht.
    const wert2 = sitz.split(';')[0].split('=').slice(1).join('=');
    const mit = await app.request(`${BASIS}/api/werkstatt/auth/ich`, { headers: { Cookie: `__Host-ndu_werkstatt=${wert2}` } });
    expect(mit.status).toBe(200);
    const ohne = await app.request(`${BASIS}/api/werkstatt/auth/ich`, { headers: { Cookie: `${COOKIE_WERKSTATT}=${wert2}` } });
    expect(ohne.status).toBe(401);
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
    expect(s).toMatchObject({ githubId: 1001, kohorte: 'test', rolle: 'studierende' });
    expect(s!.exp).toBe(1_800_000_000 + 30 * 24 * 3600);
    const sc = setCookies(r).find((c) => c.startsWith(`${COOKIE_WERKSTATT}=`))!;
    expect(sc).toMatch(/HttpOnly/i);
    expect(sc).toMatch(/SameSite=Lax/i);
    expect(sc).toMatch(/Path=\//);
    expect(anlegen).toHaveBeenCalledTimes(1);
  });

  it('falscher state: Weiterleitung mit Fehler, kein Sitzungs-Cookie', async () => {
    const { app, anlegen } = aufbau();
    const { stateCookie } = await login(app);
    const r = await callback(app, 'falsch', stateCookie);
    expect(r.status).toBe(302);
    expect(r.headers.get('location')).toBe('/innolab/mappe?fehler=anmeldung-ungueltig');
    expect(wert(r, COOKIE_WERKSTATT)).toBeUndefined();
    expect(anlegen).not.toHaveBeenCalled();
  });

  it('ohne state-Cookie: Weiterleitung mit Fehler, kein Sitzungs-Cookie', async () => {
    const { app } = aufbau();
    const { state } = await login(app);
    const r = await callback(app, state, undefined);
    expect(r.status).toBe(302);
    expect(r.headers.get('location')).toBe('/innolab/mappe?fehler=anmeldung-ungueltig');
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
    const { app, anlegen, umgebung } = aufbau({ person: { githubId: 1001, login: 'neuer-name' } });
    const { state, stateCookie } = await login(app);
    const r = await callback(app, state, stateCookie);
    const s = await sitzungLesen(wert(r, COOKIE_WERKSTATT), umgebung.sessionSecret, 1_800_000_000);
    expect(s).toMatchObject({ githubId: 1001, login: 'neuer-name' });
    expect(anlegen).toHaveBeenCalledWith(expect.objectContaining({ kuerzel: 'sofie', kohorte: 'test' }), 1001);
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

  it('Student: Lesezugriff best effort mit dem Login der Person; Lehrende ohne Aufruf', async () => {
    const t = aufbau();
    const { state, stateCookie } = await login(t.app);
    await callback(t.app, state, stateCookie);
    expect(t.lesezugriff).toHaveBeenCalledWith('test-sofie', 1001);
    const l = aufbau({ person: { githubId: 1000, login: 'lehrer' } });
    const z = await login(l.app);
    await callback(l.app, z.state, z.stateCookie);
    expect(l.lesezugriff).not.toHaveBeenCalled();
  });

  it('anlegen wirft (z. B. fremdes Repo): kein lesezugriff, Login klappt', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const t = aufbau({ anlegenWirft: true });
    const { state, stateCookie } = await login(t.app);
    const r = await callback(t.app, state, stateCookie);
    expect(r.status).toBe(302);
    expect(wert(r, COOKIE_WERKSTATT)).toBeDefined();
    expect(t.lesezugriff).not.toHaveBeenCalled();
  });

  it('lesezugriff wirft: Login klappt trotzdem', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { app, umgebung } = aufbau({ lesezugriff: async () => { throw new Error('GitHub kaputt'); } });
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

  it('weiter im state-Cookie ist untergeschoben (nicht über login gesetzt): Ziel /', async () => {
    const { app } = aufbau();
    const r = await callback(app, 'abc', `abc.${encodeURIComponent('https://boese.example')}`);
    expect(r.status).toBe(302);
    expect(r.headers.get('location')).toBe('/');
  });

  it('GitHub lehnt den Code ab: Weiterleitung mit Fehler, kein Cookie', async () => {
    const abh = lokaleAbhaengigkeiten({ github: { loginUrl: (s) => `https://github.test/?state=${s}`, codeEinloesen: async () => { throw new Error('nein'); } } });
    const app = appErstellen(abh);
    const { state, stateCookie } = await login(app);
    const r = await callback(app, state, stateCookie);
    expect(r.status).toBe(302);
    expect(r.headers.get('location')).toBe('/innolab/mappe?fehler=anmeldung-fehlgeschlagen');
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
    const { app, cookie } = await angemeldet({ githubId: 1001, login: 'neuer-name' });
    const r = await app.request(`${BASIS}/api/werkstatt/auth/ich`, { headers: { Cookie: cookie } });
    expect(await r.json()).toStrictEqual({ githubId: 1001, login: 'neuer-name', kohorte: 'test', rolle: 'studierende', repo: 'test-sofie' });
  });

  it('fremde werkstatt.json (andere githubId oder Kohorte): repo null', async () => {
    for (const fremd of [{ kohorte: 'test', githubId: 1002 }, { kohorte: 'andere', githubId: 1001 }]) {
      const t = aufbau({ person: { githubId: 1001, login: 'x' }, werkstattJson: async () => fremd });
      const { state, stateCookie } = await login(t.app);
      const cookie = `${COOKIE_WERKSTATT}=${wert(await callback(t.app, state, stateCookie), COOKIE_WERKSTATT)}`;
      const r = await t.app.request(`${BASIS}/api/werkstatt/auth/ich`, { headers: { Cookie: cookie } });
      expect(await r.json()).toMatchObject({ repo: null });
    }
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

  it('Person nach dem Login aus der Zugangsliste entfernt: 401 und Cookie weg', async () => {
    const t = await angemeldet({ githubId: 1001, login: 'x' });
    t.umgebung.zugang.test.studierende = [];
    const r = await t.app.request(`${BASIS}/api/werkstatt/auth/ich`, { headers: { Cookie: t.cookie } });
    expect(r.status).toBe(401);
    expect(await r.json()).toMatchObject({ code: 'nicht-angemeldet' });
    expect(setCookies(r).find((c) => c.startsWith(`${COOKIE_WERKSTATT}=`))).toMatch(/Max-Age=0/i);
  });

  it('entfernte Lehrende: 401', async () => {
    const t = await angemeldet({ githubId: 1000, login: 'l' });
    t.umgebung.zugang.test.lehrende = [];
    expect((await t.app.request(`${BASIS}/api/werkstatt/auth/ich`, { headers: { Cookie: t.cookie } })).status).toBe(401);
  });

  it('Rolle gewechselt (Studierende wurde Lehrende): alte Sitzung 401', async () => {
    const t = await angemeldet({ githubId: 1001, login: 'x' });
    t.umgebung.zugang.test.studierende = t.umgebung.zugang.test.studierende.filter((x) => x.githubId !== 1001);
    t.umgebung.zugang.test.lehrende = [1001];
    expect((await t.app.request(`${BASIS}/api/werkstatt/auth/ich`, { headers: { Cookie: t.cookie } })).status).toBe(401);
  });

  it('Kohorte archiviert: 401', async () => {
    const t = await angemeldet({ githubId: 1001, login: 'x' });
    expect((await t.app.request(`${BASIS}/api/werkstatt/auth/ich`, { headers: { Cookie: t.cookie } })).status).toBe(200);
    (kohorteTest as { status: string }).status = 'archiviert';
    try {
      expect((await t.app.request(`${BASIS}/api/werkstatt/auth/ich`, { headers: { Cookie: t.cookie } })).status).toBe(401);
    } finally {
      (kohorteTest as { status: string }).status = 'aktiv';
    }
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

  it('hängender GitHub-Aufruf: bricht nach dem Zeitlimit ab, beide Aufrufe haben ein Signal', async () => {
    const signale: (AbortSignal | null | undefined)[] = [];
    const haengt = ((_url: string, init?: RequestInit) => {
      signale.push(init?.signal);
      return new Promise((_, reject) => init?.signal?.addEventListener('abort', () => reject(init.signal!.reason)));
    }) as unknown as typeof fetch;
    await expect(githubIdentitaet(env, haengt, 20).codeEinloesen('c', 'u')).rejects.toBeDefined();
    expect(signale[0]).toBeInstanceOf(AbortSignal);

    let n = 0;
    const zweiterHaengt = ((url: string, init?: RequestInit) => {
      signale.push(init?.signal);
      if (n++ === 0) return Promise.resolve(Response.json({ access_token: 't' }));
      return new Promise((_, reject) => init?.signal?.addEventListener('abort', () => reject(init.signal!.reason)));
    }) as unknown as typeof fetch;
    await expect(githubIdentitaet(env, zweiterHaengt, 20).codeEinloesen('c', 'u')).rejects.toBeDefined();
    expect(signale[2]).toBeInstanceOf(AbortSignal);
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
