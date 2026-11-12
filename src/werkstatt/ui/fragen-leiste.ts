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

/** „Frage n/4 · <Frage> → <Wo>“; nr ab 0. */
export function frageText(nr: number): string {
  const f = FRAGEN[nr] ?? FRAGEN[0];
  return `Frage ${FRAGEN.indexOf(f) + 1}/${FRAGEN.length} · ${f.frage} → ${f.wo}`;
}

export type FragenTaste = { art: 'frage'; nr: number } | { art: 'umschalten' } | null;

/** 1–4 wählen die Frage (nr ab 0), F blendet die Leiste ein oder aus; sonst null. Regeln wie K (zeigenTasteFrei). */
export function fragenTaste(e: ZeigenTastenEreignis): FragenTaste {
  if (!zeigenTasteFrei(e)) return null;
  if (e.key === 'f' || e.key === 'F') return { art: 'umschalten' };
  const n = /^[1-9]$/.test(e.key) ? Number(e.key) : 0;
  return n >= 1 && n <= FRAGEN.length ? { art: 'frage', nr: n - 1 } : null;
}
