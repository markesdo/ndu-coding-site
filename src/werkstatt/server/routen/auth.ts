// Anmeldung: GitHub-Login, Sitzungs-Cookie, Abmelden. Gemountet unter /api/werkstatt/auth: Pfade relativ dazu.
// CSRF für POST /abmelden prüft appErstellen.
import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { gleich, sichererPfad } from '../../../lib/kurszugang.js';
import { KOHORTEN } from '../../kohorten/index.js';
import type { Ich } from '../../vertrag.js';
import { mitgliedschaften, repoName } from '../../zugang.js';
import { json, origin } from '../antwort.js';
import { COOKIE_WERKSTATT, GUELTIG_SEKUNDEN, mitSitzung, sitzungErstellen, type SitzungEnv } from '../sitzung.js';
import type { Abhaengigkeiten } from '../typen.js';

const STATE_SEKUNDEN = 10 * 60;
const MAPPE = '/innolab/mappe';

function zufall(): string {
  const b = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function authRouten(abh: Abhaengigkeiten): Hono<SitzungEnv> {
  const r = new Hono<SitzungEnv>();
  // __Host- verlangt Secure; auf http://localhost (Safari) nicht setzbar, darum nur lokal ohne.
  // Die Umgebung wird erst in der Anfrage gelesen (sonst scheitert schon der Import ohne Secrets).
  const stateName = () => (abh.umgebung.lokal ? 'werkstatt_state' : '__Host-werkstatt_state');
  const sicher = () => !abh.umgebung.lokal;
  const redirectUri = (c: Parameters<typeof origin>[0]) => `${origin(c)}/api/werkstatt/auth/callback`;
  const cookieOpt = () => ({ httpOnly: true, secure: sicher(), sameSite: 'Lax' as const, path: '/' });

  r.get('/ich', mitSitzung, async (c) => {
    const s = c.get('sitzung');
    let repo: string | null = null;
    if (s.rolle === 'studierende') {
      const m = mitgliedschaften(abh.umgebung.zugang, s.githubId, KOHORTEN).find((x) => x.kohorte === s.kohorte && x.rolle === 'studierende');
      if (m) {
        try {
          const name = repoName(m);
          repo = (await abh.speicher.werkstattJson(name)) ? name : null;
        } catch (e) {
          console.error('werkstatt: Mappe nicht lesbar –', e instanceof Error ? e.message : 'Fehler');
          repo = null; // Mappe wird noch eingerichtet
        }
      }
    }
    const ich: Ich = { githubId: s.githubId, login: s.login, kohorte: s.kohorte, rolle: s.rolle, repo };
    return json(c, ich);
  });

  r.get('/login', (c) => {
    const state = zufall();
    const weiter = sichererPfad(c.req.query('weiter'));
    setCookie(c, stateName(), `${state}.${weiter}`, { ...cookieOpt(), maxAge: STATE_SEKUNDEN });
    c.header('Cache-Control', 'no-store');
    return c.redirect(abh.github.loginUrl(state, redirectUri(c)), 302);
  });

  r.get('/callback', async (c) => {
    const roh = getCookie(c, stateName()) ?? '';
    const i = roh.indexOf('.');
    const state = i > 0 ? roh.slice(0, i) : '';
    let weiter = '/';
    if (i > 0) weiter = sichererPfad(roh.slice(i + 1)); // hono kodiert/dekodiert den Cookie-Wert selbst
    const code = c.req.query('code');
    deleteCookie(c, stateName(), { path: '/', secure: sicher() });
    c.header('Cache-Control', 'no-store');
    if (!state || !code || !gleich(c.req.query('state') ?? '', state)) return c.redirect(`${MAPPE}?fehler=anmeldung-ungueltig`, 302);

    let person;
    try {
      person = await abh.github.codeEinloesen(code, redirectUri(c));
    } catch (e) {
      console.error('werkstatt: GitHub-Anmeldung fehlgeschlagen –', e instanceof Error ? e.message : 'Fehler');
      return c.redirect(`${MAPPE}?fehler=anmeldung-fehlgeschlagen`, 302);
    }

    // Neueste aktive Kohorte zuerst; Zuordnung nur über die ID, nie über den (umbenennbaren) login.
    const m = mitgliedschaften(abh.umgebung.zugang, person.githubId, KOHORTEN)[0];
    if (!m) return c.redirect(`${MAPPE}?fehler=nicht-freigeschaltet`, 302);

    if (m.rolle === 'studierende') {
      try {
        await abh.speicher.anlegen(m, person.githubId);
      } catch (e) {
        // Cookie trotzdem: /innolab/mappe zeigt „wird eingerichtet“, die Oberfläche versucht es erneut.
        console.error('werkstatt: Mappe anlegen fehlgeschlagen –', e instanceof Error ? e.message : 'Fehler');
      }
    }

    const cookie = await sitzungErstellen(
      { githubId: person.githubId, login: person.login, kohorte: m.kohorte, rolle: m.rolle, exp: Math.floor(abh.jetzt() / 1000) + GUELTIG_SEKUNDEN },
      abh.umgebung.sessionSecret,
    );
    setCookie(c, COOKIE_WERKSTATT, cookie, { ...cookieOpt(), maxAge: GUELTIG_SEKUNDEN });
    return c.redirect(weiter, 302);
  });

  r.post('/abmelden', (c) => {
    deleteCookie(c, COOKIE_WERKSTATT, { path: '/', secure: sicher() });
    return json(c, { ok: true });
  });

  return r;
}
