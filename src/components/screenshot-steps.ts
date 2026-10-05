// Markierung auf einem Screenshot: Rahmen in Pixeln des Originalbilds (so wie man sie im Bild abliest),
// optional mit Nummer. Ausgegeben wird in Prozent, damit die Markierung bei jeder Anzeigegröße passt.
export type Mark = { x: number; y: number; w: number; h: number; n?: number };

export function markStyle(m: Mark, imgW: number, imgH: number): string {
  const ok = [m.x, m.y, m.w, m.h].every((v) => Number.isFinite(v) && v >= 0)
    && m.w > 0 && m.h > 0 && m.x + m.w <= imgW && m.y + m.h <= imgH;
  if (!ok) throw new Error(`Markierung liegt außerhalb des Bildes (${imgW}×${imgH}): ${JSON.stringify(m)}`);
  const pct = (v: number, total: number) => `${+((v / total) * 100).toFixed(3)}%`;
  return `left:${pct(m.x, imgW)};top:${pct(m.y, imgH)};width:${pct(m.w, imgW)};height:${pct(m.h, imgH)}`;
}
