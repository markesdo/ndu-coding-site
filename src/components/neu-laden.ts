// „Neue Version – neu laden“ – im Browser, eingebunden über NeuLaden.astro. Logik und Takt: lib/neu-laden.ts.
// Fragt nur, solange der Tab sichtbar ist und nicht im Beamer-Modus; immer nur eine Anfrage zugleich (Kette: lib/kette.ts).
// Lädt nie selbst neu und nimmt nie den Fokus.
import { aktiverAbschnitt, ueberschriftOberkanten } from './abschnitt';
import { abfrageKette, jsonHolen } from '../lib/kette';
import { MIN_ABSTAND_MS, PRUEF_MS, TIMEOUT_MS, brauchtHinweis, naechstePruefung, versionAus, ziel } from '../lib/neu-laden';

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

const kette = abfrageKette({
  ruht: () => document.visibilityState !== 'visible' || document.documentElement.hasAttribute('data-beamer') || !navigator.onLine,
  ruheMs: PRUEF_MS,
  runde: async () => {
    zuletzt = Date.now();
    let ok = false;
    try {
      const v = versionAus(await jsonHolen(`/version.json?t=${Date.now()}`, TIMEOUT_MS));
      if (v) { ok = true; neu = v; }
    } catch (e) {
      console.warn('[neu-laden]', e);
    }
    fehler = ok ? 0 : fehler + 1;
    // Auch zurück: Wurde auf den geladenen Stand zurückgerollt, verschwindet der Hinweis wieder.
    if (brauchtHinweis(geladen, neu, verworfen())) zeigen(); else if (ok) verstecken();
    return naechstePruefung(ok, fehler);
  },
});

// Tab kommt nach vorn, Fenster bekommt den Fokus, Netz ist zurück: gleich prüfen, aber nicht öfter als MIN_ABSTAND_MS.
function baldPruefen() {
  if (document.visibilityState === 'visible' && Date.now() - zuletzt >= MIN_ABSTAND_MS) kette.sofort();
}

function neuLaden() {
  const hs = [...document.querySelectorAll<HTMLElement>('.inner :is(h2, h3)[id]')].filter((h) => h.getClientRects().length > 0);
  const i = aktiverAbschnitt(ueberschriftOberkanten(hs), innerHeight * 0.35);
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
  kette.planen(PRUEF_MS);
}
