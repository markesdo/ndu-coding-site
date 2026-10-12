// „Neue Version – neu laden“ – im Browser, eingebunden über NeuLaden.astro. Logik und Takt: lib/neu-laden.ts.
// Fragt nur, solange der Tab sichtbar ist und nicht im Beamer-Modus; immer nur eine Anfrage zugleich.
// Lädt nie selbst neu und nimmt nie den Fokus.
import { aktiverAbschnitt } from './abschnitt';
import { MIN_ABSTAND_MS, TIMEOUT_MS, brauchtHinweis, naechstePruefung, versionAus, ziel } from '../lib/neu-laden';

const VERWORFEN = 'ndu-neu-laden-verworfen';
const geladen = document.querySelector<HTMLMetaElement>('meta[name="ndu-build"]')?.content ?? '';
const box = document.querySelector<HTMLElement>('[data-neu-laden]');
const text = box?.querySelector<HTMLElement>('[role="status"]');
const MELDUNG = 'Diese Seite wurde gerade aktualisiert. Eure Häkchen und Einstellungen bleiben erhalten.';

const verworfen = (): string | null => { try { return sessionStorage.getItem(VERWORFEN); } catch { return null; } };
const verwerfen = (v: string) => { try { sessionStorage.setItem(VERWORFEN, v); } catch {} };

let neu: string | null = null;
let fehler = 0;
let zuletzt = 0;
let laeuft = false;
let timer: ReturnType<typeof setTimeout> | undefined;

function zeigen() {
  if (!box || !box.hidden) return;
  box.hidden = false;
  // Erst sichtbar, dann der Text (vorher geleert) – sonst lesen Screenreader die Meldung nicht vor.
  setTimeout(() => { if (text) text.textContent = MELDUNG; }, 100);
}

function verstecken() {
  if (!box) return;
  box.hidden = true;
  if (text) text.textContent = '';
}

// AbortSignal.timeout fehlt in älterem Safari (< 16).
function zeitlimit(ms: number): AbortSignal {
  if ('timeout' in AbortSignal) return AbortSignal.timeout(ms);
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

async function pruefen() {
  if (laeuft || document.visibilityState !== 'visible' || document.documentElement.hasAttribute('data-beamer')) { planen(naechstePruefung(true, 0)); return; }
  if (!navigator.onLine) { planen(naechstePruefung(true, 0)); return; }
  laeuft = true;
  zuletzt = Date.now();
  let ok = false;
  try {
    const r = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store', signal: zeitlimit(TIMEOUT_MS) });
    const json = r.ok && r.headers.get('content-type')?.includes('application/json');
    if (r.redirected) console.warn('[neu-laden] /version.json wurde umgeleitet – fehlt die Ausnahme im Kurspasswort-Matcher?');
    else if (!json) console.warn(`[neu-laden] /version.json: Status ${r.status}, kein JSON`);
    const v = json ? versionAus(await r.json()) : null;
    if (v) { ok = true; neu = v; }
  } catch (e) {
    console.warn('[neu-laden] Abfrage fehlgeschlagen:', e);
  }
  laeuft = false;
  fehler = ok ? 0 : fehler + 1;
  // Auch zurück: Wurde auf den geladenen Stand zurückgerollt, verschwindet der Hinweis wieder.
  if (brauchtHinweis(geladen, neu, verworfen())) zeigen(); else if (ok) verstecken();
  planen(naechstePruefung(ok, fehler));
}

function planen(ms: number) {
  clearTimeout(timer);
  timer = setTimeout(pruefen, ms);
}

// Tab kommt nach vorn, Fenster bekommt den Fokus, Netz ist zurück: gleich prüfen, aber nicht öfter als MIN_ABSTAND_MS.
function baldPruefen() {
  if (document.visibilityState === 'visible' && Date.now() - zuletzt >= MIN_ABSTAND_MS) pruefen();
}

function neuLaden() {
  const hs = [...document.querySelectorAll<HTMLElement>('.inner :is(h2, h3)[id]')].filter((h) => h.getClientRects().length > 0);
  const i = aktiverAbschnitt(hs.map((h) => h.getBoundingClientRect().top), innerHeight * 0.35);
  // Zeigt der Anker schon auf etwas im Bild (z. B. einen geöffneten Screenshot-Schritt), bleibt er – er ist genauer.
  // Kein Abschnitt (Seitenanfang) → Adresse lassen, der Browser stellt die Position selbst wieder her.
  const jetzt = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  const r = jetzt ? jetzt.getBoundingClientRect() : null;
  const imBild = r && r.bottom > 0 && r.top < innerHeight;
  if (i >= 0 && !imBild) history.replaceState(history.state, '', ziel(location.pathname, location.search, hs[i].id));
  location.reload();
}

if (box && geladen) {
  box.querySelector('[data-neu-laden-los]')?.addEventListener('click', neuLaden);
  box.querySelector('[data-neu-laden-weg]')?.addEventListener('click', () => {
    if (neu) verwerfen(neu);
    verstecken();
  });
  document.addEventListener('visibilitychange', baldPruefen);
  addEventListener('focus', baldPruefen);
  addEventListener('online', baldPruefen);
  // Nur aus dem Zurück-Cache: beim normalen Laden ist die Seite ohnehin aktuell.
  addEventListener('pageshow', (e) => { if (e.persisted) baldPruefen(); });
  planen(naechstePruefung(true, 0));
}
