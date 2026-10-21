// Aufdecken für alle: Deckt der Präsentator eine Auflösung auf (Knopf auf seinem Bildschirm), öffnet sie sich auch bei den
// Studierenden – über api/aufgedeckt.ts, so wie „Wo ist Markus?“ über api/position.ts. Die Uhrzeit an <Aufloesung ab=…>
// bleibt nur der späte Rückfall. Hier ohne DOM und ohne Vercel, damit testbar.
import { aufloesungAb } from '../components/aufloesung';
import { wienerZeit } from '../components/jetzt';

/** Studierende fragen so oft nach, solange heute noch eine Auflösung zu ist … */
export const AUFGEDECKT_MS = 4000;
/** … und geben eine hängende Anfrage nach so langer Zeit auf. */
export const AUFGEDECKT_TIMEOUT_MS = 3000;

const STEUERZEICHEN = /[\u0000-\u001f\u007f]/;

/** Kennung einer Auflösung: ihre Gruppe, sonst der Knopftext (Aufloesung.astro). Eingabe aus dem Netz prüfen. */
export function kennungPruefen(roh: unknown): string | null {
  if (typeof roh !== 'string') return null;
  const k = roh.trim();
  return k && k.length <= 80 && !STEUERZEICHEN.test(k) ? k : null;
}

/** Gespeicherter Stand: welcher Wiener Kalendertag, welche Kennungen. Ein Stand von gestern gilt heute nicht. */
export type Aufgedeckt = { datum: string; offen: string[] };

/** Nach einem Aufdecken: Stand für heute, Kennung einmal dazu (ein alter Tag fängt leer an). */
export function aufdecken(stand: Aufgedeckt | undefined, kennung: string, jetzt: Date): Aufgedeckt {
  const { datum } = wienerZeit(jetzt);
  const offen = stand?.datum === datum ? stand.offen : [];
  return { datum, offen: offen.includes(kennung) ? offen : [...offen, kennung].slice(-50) };
}

/** Was heute aufgedeckt ist (Stand von einem anderen Tag → nichts). */
export function heuteOffen(stand: Aufgedeckt | undefined, jetzt: Date): string[] {
  return stand && stand.datum === wienerZeit(jetzt).datum ? stand.offen : [];
}

/** Lohnt sich das Nachfragen? Nur wenn eine noch geschlossene Auflösung heute fällig wird – sonst ist kein Kurstag. */
export function heuteZuFragen(geschlosseneAb: string[], jetzt: Date): boolean {
  const heute = wienerZeit(jetzt).datum;
  return geschlosseneAb.some((ab) => aufloesungAb(ab)?.datum === heute);
}
