// „Ihr seid hier“ im Browser (Arbeitsfluss.astro, hier='heute'): ohne Importe, damit das Skript klein bleibt.

/** Spalte des Linienplans für einen Kurstag: Tag 1–4 je eine Spalte, Tag 5–7 teilen sich Spalte 5. */
export const spalteVonTag = (tag: number): 1 | 2 | 3 | 4 | 5 | undefined =>
  Number.isInteger(tag) && tag >= 1 && tag <= 7 ? (Math.min(tag, 5) as 1 | 2 | 3 | 4 | 5) : undefined;

/** Kurstag „heute“: der letzte Termin am oder vor datum (JJJJ-MM-TT, Wien); vor Tag 1 nichts. */
export function heutigerTag(datum: string, tage: { n: number; datum?: string }[]): number | undefined {
  return tage.filter((t) => t.datum && t.datum <= datum).at(-1)?.n;
}
