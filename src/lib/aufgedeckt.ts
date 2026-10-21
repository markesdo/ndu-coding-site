// Aufdecken für alle: Deckt der Präsentator eine Auflösung auf (Knopf oder Pfeiltaste im Beamer), öffnet sie sich auch bei
// den Studierenden – über api/aufgedeckt.ts, so wie „Wo ist Markus?“ über api/position.ts. Die Uhrzeit an <Aufloesung ab=…>
// bleibt nur der späte Rückfall. Hier ohne DOM und ohne Vercel, damit testbar.
import { aufloesungAb } from '../components/aufloesung.js'; // .js-Endung: api/aufgedeckt.ts lädt das per Node-ESM
import { wienerZeit } from '../components/jetzt.js';
import { jsonHolen } from './kette.js';

/** Studierende fragen so oft nach, solange heute noch eine Auflösung zu ist … */
export const AUFGEDECKT_MS = 4000;
/** … und geben eine hängende Anfrage nach so langer Zeit auf. */
export const AUFGEDECKT_TIMEOUT_MS = 3000;
/** Höchstens so viele Kennungen fragt eine Seite auf einmal nach. */
export const MAX_KENNUNGEN = 30;

const STEUERZEICHEN = /[\u0000-\u001f\u007f]/;

/** Kennung einer Auflösung: ihre Gruppe, sonst Seite und Knopftext (aufloesungKennung). Eingabe aus dem Netz prüfen. */
export function kennungPruefen(roh: unknown): string | null {
  if (typeof roh !== 'string') return null;
  const k = roh.trim();
  return k && k.length <= 160 && !STEUERZEICHEN.test(k) ? k : null;
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

/** Lohnt sich das Nachfragen? Nur wenn eine noch geschlossene Auflösung heute fällig wird – sonst ist kein Kurstag. */
export function heuteZuFragen(geschlosseneAb: string[], jetzt: Date): boolean {
  const heute = wienerZeit(jetzt).datum;
  return geschlosseneAb.some((ab) => aufloesungAb(ab)?.datum === heute);
}

/** Für Aufloesung.astro und die Mappe: Welche dieser Kennungen hat der Präsentator heute aufgedeckt? Wirft bei Fehlern. */
export async function aufgedecktHolen(kennungen: readonly string[]): Promise<string[]> {
  if (!kennungen.length) return [];
  const suche = new URLSearchParams(kennungen.map((k) => ['k', k]));
  const d = (await jsonHolen(`/api/aufgedeckt?${suche}`, AUFGEDECKT_TIMEOUT_MS)) as { offen?: unknown };
  return Array.isArray(d.offen) ? d.offen.filter((k): k is string => typeof k === 'string') : [];
}

export const NICHT_GEMELDET = 'Aufdecken nicht an die Studierenden gemeldet – Seite neu laden oder /praesentator prüfen.';
/** Schlägt die Meldung fehl, nach so langer Zeit ein zweites Mal. */
export const MELDEN_NOCHMAL_MS = 3000;

export interface MeldenOptionen {
  /** Die eigentliche Anfrage (POST /api/aufgedeckt). */
  senden: () => Promise<Response>;
  warten: (ms: number) => Promise<void>;
  /** Sichtbarer Hinweis für den Präsentator (components/hinweis.ts). */
  hinweis: (text: string) => void;
}

/** Aufdecken melden: einmal, bei Fehler nach MELDEN_NOCHMAL_MS noch einmal; klappt beides nicht, sieht der Präsentator
 *  einen Hinweis – sonst glaubte er, die Studierenden sähen die Auflösung. Umgeleitet (Login-Seite) zählt als Fehler. */
export async function aufdeckenMelden(o: MeldenOptionen): Promise<boolean> {
  for (let versuch = 0; versuch < 2; versuch++) {
    if (versuch) await o.warten(MELDEN_NOCHMAL_MS);
    try {
      const r = await o.senden();
      if (r.ok && !r.redirected) return true;
      console.warn('[aufloesung] Aufdecken nicht gemeldet: Status', r.status);
    } catch (e) {
      console.warn('[aufloesung] Aufdecken nicht gemeldet:', e);
    }
  }
  o.hinweis(NICHT_GEMELDET);
  return false;
}
