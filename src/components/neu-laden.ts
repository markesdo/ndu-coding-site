// „Neue Version – neu laden“ – im Browser, eingebunden über NeuLaden.astro. Logik und Takt: lib/neu-laden.ts.
// Fragt nur, solange der Tab sichtbar ist; immer nur eine Anfrage zugleich. Lädt nie selbst neu und nimmt nie den Fokus.
import { aktiverAbschnitt } from './abschnitt';
import { MIN_ABSTAND_MS, TIMEOUT_MS, brauchtHinweis, naechstePruefung, versionAus, ziel } from '../lib/neu-laden';

const VERWORFEN = 'ndu-neu-laden-verworfen';
const geladen = document.querySelector<HTMLMetaElement>('meta[name="ndu-build"]')?.content ?? '';
const box = document.querySelector<HTMLElement>('[data-neu-laden]');

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
  // Erst sichtbar, dann der Text – sonst lesen Screenreader die Meldung nicht vor.
  const text = box.querySelector<HTMLElement>('[role="status"]');
  requestAnimationFrame(() => { if (text) text.textContent = 'Diese Seite wurde gerade aktualisiert. Eure Häkchen und Einstellungen bleiben erhalten.'; });
}

async function pruefen() {
  if (laeuft || document.visibilityState !== 'visible') return;
  if (!navigator.onLine) { planen(naechstePruefung(true, 0)); return; }
  laeuft = true;
  zuletzt = Date.now();
  let ok = false;
  try {
    const r = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store', signal: AbortSignal.timeout(TIMEOUT_MS) });
    const json = r.ok && r.headers.get('content-type')?.includes('application/json');
    if (r.redirected || !json) console.warn('[neu-laden] /version.json liefert kein JSON – vom Kurspasswort umgeleitet?');
    const v = json ? versionAus(await r.json()) : null;
    if (v) { ok = true; neu = v; }
  } catch {}
  laeuft = false;
  fehler = ok ? 0 : fehler + 1;
  if (brauchtHinweis(geladen, neu, verworfen())) zeigen();
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
  // Kein Abschnitt (Seitenanfang) → Adresse lassen, der Browser stellt die Position selbst wieder her.
  if (i >= 0) history.replaceState(history.state, '', ziel(location.pathname, location.search, hs[i].id));
  location.reload();
}

if (box && geladen) {
  box.querySelector('[data-neu-laden-los]')?.addEventListener('click', neuLaden);
  box.querySelector('[data-neu-laden-weg]')?.addEventListener('click', () => {
    if (neu) verwerfen(neu);
    box.hidden = true;
  });
  document.addEventListener('visibilitychange', baldPruefen);
  addEventListener('focus', baldPruefen);
  addEventListener('online', baldPruefen);
  addEventListener('pageshow', baldPruefen);
  planen(naechstePruefung(true, 0));
}
