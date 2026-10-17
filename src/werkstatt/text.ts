const SEGMENTIERER = new Intl.Segmenter('de', { granularity: 'grapheme' });

/** Anzahl sichtbarer Zeichen (Grapheme): „e“ + Akzent und ein Emoji mit Joiner zählen je als eines. */
export function graphemAnzahl(s: string): number {
  let n = 0;
  for (const _ of SEGMENTIERER.segment(s)) n++;
  return n;
}
