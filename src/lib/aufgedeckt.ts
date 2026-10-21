// Aufdecken für alle: Deckt der Präsentator eine Auflösung auf (Knopf oder Pfeiltaste im Beamer), öffnet sie sich auch bei
// den Studierenden – über api/aufgedeckt.ts, so wie „Wo ist Markus?“ über api/position.ts. Die Uhrzeit an <Aufloesung ab=…>
// bleibt nur der späte Rückfall. Hier ohne DOM und ohne Vercel, damit testbar.
import { aufloesungAb, kennungNormal } from '../components/aufloesung.js'; // .js-Endung: api/aufgedeckt.ts lädt das per Node-ESM
import { wienerZeit } from '../components/jetzt.js';
import { jsonHolen } from './kette.js';

/** Studierende fragen so oft nach, solange heute noch eine Auflösung zu ist … */
export const AUFGEDECKT_MS = 4000;
/** … an anderen Tagen seltener – Termine wandern, darum fragt jede Seite mit geschlossener Auflösung nach. */
export const AUFGEDECKT_SELTEN_MS = 30_000;
/** … und geben eine hängende Anfrage nach so langer Zeit auf. */
export const AUFGEDECKT_TIMEOUT_MS = 3000;
/** Höchstens so viele Kennungen fragt eine Seite auf einmal nach. */
export const MAX_KENNUNGEN = 30;

export const MAX_KENNUNG_LAENGE = 160;
const STEUERZEICHEN = /[\u0000-\u001f\u007f]/;

/** Kennung einer Auflösung: ihre Gruppe, sonst Seite und Knopftext (aufloesungKennung). Eingabe aus dem Netz prüfen. */
export function kennungPruefen(roh: unknown): string | null {
  if (typeof roh !== 'string') return null;
  const k = kennungNormal(roh);
  return k && k.length <= MAX_KENNUNG_LAENGE && !STEUERZEICHEN.test(k) ? k : null;
}

/** Für den Build (Aufloesung.astro): Fehlertext, wenn eine Kennung so nicht ankäme (Leerraum am Rand, zu lang, Steuerzeichen). */
export function kennungFehler(gruppe: string | undefined, knopf: string, kennung: string): string | null {
  const roh = gruppe ?? knopf;
  if (roh !== kennungNormal(roh)) return `Leerraum am Rand von ${gruppe !== undefined ? 'gruppe' : 'knopf'}="${roh}"`;
  if (kennungPruefen(kennung) !== kennung) return `Kennung „${kennung}“ ungültig (höchstens ${MAX_KENNUNG_LAENGE} Zeichen, keine Steuerzeichen)`;
  return null;
}

/** Ein Eintrag pro Kennung und Wiener Kalendertag: Jedes Aufdecken schreibt nur seinen eigenen Schlüssel, so geht
 *  bei zwei schnellen Meldungen keine verloren (kein Lesen-Ändern-Schreiben). Ein Stand von gestern gilt heute nicht. */
export function aufgedecktSchluessel(kennung: string, jetzt: Date): string {
  return `aufgedeckt:${wienerZeit(jetzt).datum}:${kennung}`;
}

/** GET ?k=…&k=…: die geprüften Kennungen, nach denen eine Seite fragt (ohne Doppel, höchstens MAX_KENNUNGEN). */
export function gefragteKennungen(suche: URLSearchParams): string[] {
  const k = suche.getAll('k').map(kennungPruefen).filter((x): x is string => x !== null);
  return [...new Set(k)].slice(0, MAX_KENNUNGEN);
}

/** Wann wieder nachfragen? null: nichts mehr zu, aufhören. Sonst oft, wenn eine geschlossene Auflösung heute fällig wird
 *  (Kurstag laut Plan), und selten an anderen Tagen – eine verschobene Einheit soll trotzdem aufgehen. */
export function abfrageAbstand(geschlosseneAb: readonly string[], jetzt: Date): number | null {
  if (!geschlosseneAb.length) return null;
  const heute = wienerZeit(jetzt).datum;
  return geschlosseneAb.some((ab) => aufloesungAb(ab)?.datum === heute) ? AUFGEDECKT_MS : AUFGEDECKT_SELTEN_MS;
}

/** Für Aufloesung.astro und die Mappe: Welche dieser Kennungen hat der Präsentator heute aufgedeckt? Wirft bei Fehlern. */
export async function aufgedecktHolen(kennungen: readonly string[]): Promise<string[]> {
  if (!kennungen.length) return [];
  const suche = new URLSearchParams(kennungen.map((k) => ['k', k]));
  const d = (await jsonHolen(`/api/aufgedeckt?${suche}`, AUFGEDECKT_TIMEOUT_MS)) as { offen?: unknown };
  return Array.isArray(d.offen) ? d.offen.filter((k): k is string => typeof k === 'string') : [];
}

export const NICHT_GEMELDET = 'Aufdecken nicht an die Studierenden gemeldet – Seite neu laden oder /praesentator prüfen.';
export const SCHLUESSEL_FALSCH = 'Präsentator-Schlüssel stimmt nicht – auf /praesentator neu anmelden.';
export const KENNUNG_UNGUELTIG = 'Kennung ungültig – bitte Markus/Code prüfen.';
/** Schlägt die Meldung fehl (Netz, 5xx), nach so langer Zeit ein zweites Mal. */
export const MELDEN_NOCHMAL_MS = 3000;

export interface MeldenOptionen {
  /** Die eigentliche Anfrage (POST /api/aufgedeckt). */
  senden: () => Promise<Response>;
  warten: (ms: number) => Promise<void>;
  /** Sichtbarer Hinweis für den Präsentator (components/hinweis.ts). */
  hinweis: (text: string) => void;
}

/** Aufdecken melden. 403 (Schlüssel) und 400 (Kennung) ändern sich nicht durch Wiederholen: gleich ein eigener Hinweis.
 *  Netzfehler, 5xx oder Umleitung (Login-Seite): nach MELDEN_NOCHMAL_MS noch einmal, dann Hinweis – sonst glaubte der
 *  Präsentator, die Studierenden sähen die Auflösung. */
export async function aufdeckenMelden(o: MeldenOptionen): Promise<boolean> {
  for (let versuch = 0; versuch < 2; versuch++) {
    if (versuch) await o.warten(MELDEN_NOCHMAL_MS);
    try {
      const r = await o.senden();
      if (r.ok && !r.redirected) return true;
      console.warn('[aufloesung] Aufdecken nicht gemeldet: Status', r.status);
      if (r.status === 403) { o.hinweis(SCHLUESSEL_FALSCH); return false; }
      if (r.status === 400) { o.hinweis(KENNUNG_UNGUELTIG); return false; }
    } catch (e) {
      console.warn('[aufloesung] Aufdecken nicht gemeldet:', e);
    }
  }
  o.hinweis(NICHT_GEMELDET);
  return false;
}
