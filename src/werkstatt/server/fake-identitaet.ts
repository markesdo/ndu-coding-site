// Test-Login für den lokalen Dev-Server und Tests: statt GitHub eine Seite, auf der man eine Testperson wählt.
// Der „Code“ ist deren GitHub-ID. Nur bei NODE_ENV ∈ {development, test}.
import type { Rolle } from '../zugang.js';
import type { GithubIdentitaet } from './typen.js';
import { istLokal } from './umgebung.js';

export interface Testperson {
  githubId: number;
  login: string;
  // Fehlt die Rolle, steht die Person in keiner Kohorte (zum Ausprobieren von „nicht freigeschaltet“).
  rolle: Rolle | null;
  kuerzel: string | null;
}

// Erfundene IDs, keine echten Konten. Kohorte: test.
export const TESTPERSONEN: readonly Testperson[] = [
  { githubId: 900001, login: 'sofie-test', rolle: 'studierende', kuerzel: 'sofie' },
  { githubId: 900002, login: 'jonas-test', rolle: 'studierende', kuerzel: 'jonas' },
  { githubId: 900000, login: 'lehrende-test', rolle: 'lehrende', kuerzel: null },
  { githubId: 900099, login: 'fremd-test', rolle: null, kuerzel: null },
];

// Liegt unter /api/werkstatt, damit der Vite-Proxy (astro dev) es mit durchreicht.
export const ANMELDE_PFAD = '/api/werkstatt/dev/anmelden';

function nurLokal(was: string): void {
  if (!istLokal(process.env)) throw new Error(`${was} nur bei NODE_ENV development oder test`);
}

export function fakeIdentitaet(personen: readonly Testperson[] = TESTPERSONEN): GithubIdentitaet {
  nurLokal('fakeIdentitaet');
  return {
    loginUrl(state, redirectUri) {
      const url = new URL(ANMELDE_PFAD, redirectUri);
      url.searchParams.set('state', state);
      url.searchParams.set('redirect_uri', redirectUri);
      return url.toString();
    },
    async codeEinloesen(code) {
      const p = personen.find((x) => String(x.githubId) === code);
      if (!p) throw new Error('unbekannter Test-Code');
      return { githubId: p.githubId, login: p.login };
    },
  };
}

const maskieren = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// GET ANMELDE_PFAD?state=…&redirect_uri=… → Liste der Testpersonen, jede verlinkt auf redirect_uri?code=<id>&state=….
// Leitet nur auf dieselbe Origin zurück.
export function anmeldeSeite(req: Request, personen: readonly Testperson[] = TESTPERSONEN): Response {
  nurLokal('anmeldeSeite');
  const url = new URL(req.url);
  const state = url.searchParams.get('state') ?? '';
  let ziel: URL;
  try {
    ziel = new URL(url.searchParams.get('redirect_uri') ?? '');
  } catch {
    return new Response('redirect_uri fehlt', { status: 400 });
  }
  if (ziel.origin !== url.origin) return new Response('redirect_uri muss auf dieselbe Origin zeigen', { status: 400 });

  const eintraege = personen.map((p) => {
    const link = new URL(ziel);
    link.searchParams.set('code', String(p.githubId));
    link.searchParams.set('state', state);
    const rolle = p.rolle ? `${p.rolle}${p.kuerzel ? `, Kürzel ${p.kuerzel}` : ''}` : 'nicht freigeschaltet';
    return `<li><a href="${maskieren(link.toString())}">${maskieren(p.login)}</a> (${maskieren(rolle)})</li>`;
  });
  const html = '<!doctype html><html lang="de"><meta charset="utf-8"><title>Test-Login</title>'
    + '<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:10vh auto;padding:0 1rem;line-height:1.6">'
    + '<h1>Test-Login (nur lokal)</h1><p>Statt GitHub: Wähle eine Testperson der Kohorte <code>test</code>.</p>'
    + `<ul>${eintraege.join('')}</ul></body></html>`;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}
