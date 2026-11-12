// Fragen-Leiste im Zeigen-Modus (Zeigen.tsx): unten eine der vier Fragen der Besprechungsrunde, damit die Gruppe sie
// auf dem geteilten Bildschirm sieht (Fragen nach Fitzpatrick, The Mom Test, S. 103). Fester Kursinhalt, für alle
// gleich: keine Daten aus der Mappe, keine Zahlen. Ändert sich der Wortlaut auf der Folie, nur hier ändern.
import { zeigenTasteFrei, type ZeigenTastenEreignis } from './kontext-hilfen.js';

export const FRAGEN: readonly { frage: string; wo: string }[] = [
  { frage: 'Was wurde gesagt? Die wichtigsten Zitate.', wo: 'Snapshot' },
  { frage: 'Was ändert sich? Welche Annahme wird gestützt, welche wackelt?', wo: 'Kontext: Annahmen' },
  { frage: 'Welche Fragen haben funktioniert, welche nicht?', wo: 'Kontext: Leitfaden · zuerst, wer präsentiert' },
  { frage: 'Was haben wir überhört?', wo: 'Alle Zitate und Notizen' },
];

/** Gültige Stelle (ab 0) für FRAGEN: auf 0 … 3 begrenzt, ganzzahlig. Zeigen.tsx rechnet sie einmal für Text und Knöpfe. */
export function frageStelle(nr: number): number {
  return Number.isFinite(nr) ? Math.min(Math.max(Math.trunc(nr), 0), FRAGEN.length - 1) : 0;
}

/** „Frage n/4 · <Frage> → <Wo>“; nr ab 0, schon begrenzt (frageStelle). */
export function frageText(nr: number): string {
  const f = FRAGEN[nr];
  return `Frage ${nr + 1}/${FRAGEN.length} · ${f.frage} → ${f.wo}`;
}

/** Beim Ausblenden: Fokus nur dann zurück in den Zeigen-Bereich, wenn er auf einem der Knöpfe 1–4 lag (die verschwinden,
 *  sonst fiele er auf body). Liegt er anderswo (etwa auf einem Reiter im Kontext), bleibt er dort. */
export function fokusInFragenWahl(el: { closest?: (s: string) => unknown } | null | undefined): boolean {
  return !!el?.closest?.('.zg-leiste-nr');
}

export type FragenTaste = { art: 'frage'; nr: number } | { art: 'umschalten' } | null;

/** 1–4 wählen die Frage (nr ab 0), F blendet die Leiste ein oder aus; sonst null. Regeln wie K (zeigenTasteFrei).
 *  Gehaltene Taste (repeat) zählt nicht: sonst flackert die Leiste, solange F gedrückt ist. */
export function fragenTaste(e: ZeigenTastenEreignis): FragenTaste {
  if (e.repeat || !zeigenTasteFrei(e)) return null;
  if (e.key === 'f' || e.key === 'F') return { art: 'umschalten' };
  const n = /^[1-9]$/.test(e.key) ? Number(e.key) : 0;
  return n >= 1 && n <= FRAGEN.length ? { art: 'frage', nr: n - 1 } : null;
}
