// Anmeldung: GitHub-Login, Sitzungs-Cookie, Abmelden. Gemountet unter /api/werkstatt/auth: Pfade relativ dazu.
// CSRF für POST /abmelden prüft appErstellen.
import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { b64url, gleich, sichererPfad } from '../../../lib/kurszugang.js';
import { KOHORTEN } from '../../kohorten/index.js';
import type { Ich } from '../../vertrag.js';
import { mitgliedschaften, repoName } from '../../zugang.js';
import { json, origin } from '../antwort.js';
import { GUELTIG_SEKUNDEN, cookieName, mitSitzung, rolleCookieSetzen, sitzungErstellen, type SitzungEnv } from '../sitzung.js';
import type { Abhaengigkeiten } from '../typen.js';

const STATE_SEKUNDEN = 10 * 60;
const MAPPE = '/innolab/mappe';

function zufall(): string {
  return b64url(crypto.getRandomValues(new Uint8Array(24)));
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
    const m = c.get('mitgliedschaft');
    let repo: string | null = null;
    if (m.rolle === 'studierende') {
      try {
        const name = repoName(m);
        const wj = await abh.speicher.werkstattJson(name);
        if (wj && wj.githubId === s.githubId && wj.kohorte === s.kohorte) repo = name;
        else if (wj) console.error('werkstatt: werkstatt.json passt nicht zur Sitzung, Mappe wird nicht gemeldet');
      } catch (e) {
        console.error('werkstatt: Mappe nicht lesbar –', e instanceof Error ? e.message : 'Fehler');
        repo = null; // Mappe wird noch eingerichtet
      }
    }
    const ich: Ich = { githubId: s.githubId, login: s.login, kohorte: s.kohorte, rolle: s.rolle, repo };
    // Rollen-Cookie fürs Menü nachziehen (auch für Sitzungen von vor dem Cookie).
    rolleCookieSetzen(c, abh, s);
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
    // Jeder Fehlerweg löscht auch ein altes Rollen-Cookie (etwa von einem anderen Konto am selben Gerät): Das Menü soll
    // nach einer gescheiterten Anmeldung nicht „Mappen der Kohorte“ behaupten.
    const abbruch = (grund: string) => {
      rolleCookieSetzen(c, abh, null);
      return c.redirect(`${MAPPE}?fehler=${grund}`, 302);
    };
    if (!state || !code || !gleich(c.req.query('state') ?? '', state)) return abbruch('anmeldung-ungueltig');

    let person;
    try {
      person = await abh.github.codeEinloesen(code, redirectUri(c));
    } catch (e) {
      console.error('werkstatt: GitHub-Anmeldung fehlgeschlagen –', e instanceof Error ? e.message : 'Fehler');
      return abbruch('anmeldung-fehlgeschlagen');
    }

    // Neueste aktive Kohorte zuerst; Zuordnung nur über die ID, nie über den (umbenennbaren) login.
    const m = mitgliedschaften(abh.umgebung.zugang, person.githubId, KOHORTEN)[0];
    if (!m) return abbruch('nicht-freigeschaltet');

    if (m.rolle === 'studierende') {
      let angelegt = false;
      try {
        await abh.speicher.anlegen(m, person.githubId);
        angelegt = true;
      } catch (e) {
        // Cookie trotzdem: GET /api/werkstatt/mappe und GET /mappe/:artefakt legen ein fehlendes Repo erneut an und laden dann ein.
        console.error('werkstatt: Mappe anlegen fehlgeschlagen –', e instanceof Error ? e.message : 'Fehler');
      }
      // Best effort, nur nach erfolgreichem anlegen (sonst könnte das Repo einer anderen Person gehören): die Einladung
      // zum Lesen geht früh raus (Mail von GitHub); scheitert sie, holt GET mappe sie nach (prüft den Stand bei jedem Aufruf).
      try {
        if (angelegt) await abh.speicher.lesezugriff(repoName(m), person.githubId);
      } catch (e) {
        console.error('werkstatt: Lesezugriff nicht prüfbar –', e instanceof Error ? e.message : 'Fehler');
      }
    }

    const sitzung = { githubId: person.githubId, login: person.login, kohorte: m.kohorte, rolle: m.rolle, exp: Math.floor(abh.jetzt() / 1000) + GUELTIG_SEKUNDEN };
    const cookie = await sitzungErstellen(sitzung, abh.umgebung.sessionSecret);
    setCookie(c, cookieName(abh.umgebung.lokal), cookie, { ...cookieOpt(), maxAge: GUELTIG_SEKUNDEN });
    rolleCookieSetzen(c, abh, sitzung);
    return c.redirect(weiter, 302);
  });

  r.post('/abmelden', (c) => {
    deleteCookie(c, cookieName(abh.umgebung.lokal), { path: '/', secure: sicher() });
    rolleCookieSetzen(c, abh, null);
    return json(c, { ok: true });
  });

  return r;
}
