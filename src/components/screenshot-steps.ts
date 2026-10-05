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

// Ausschnitt eines Screenshots in Pixeln des Originalbilds.
export type Crop = { x: number; y: number; w: number; h: number };

// Ausschnitt um alle Markierungen herum, mit Rand für Kontext und Mindestgröße, damit man noch erkennt,
// wo man ist. null = ganzes Bild zeigen (keine Markierungen, oder der Ausschnitt wäre fast das ganze Bild).
// Rand und Mindestgröße sind relativ zur Bildgröße, damit Retina-Screenshots gleich behandelt werden.
export function cropRect(marks: Mark[], imgW: number, imgH: number): Crop | null {
  if (marks.length === 0) return null;
  const pad = imgW * 0.107;
  const minW = imgW * 0.47;
  const minH = imgH * 0.44;
  let x0 = Math.min(...marks.map((m) => m.x)) - pad;
  let y0 = Math.min(...marks.map((m) => m.y)) - pad;
  let x1 = Math.max(...marks.map((m) => m.x + m.w)) + pad;
  let y1 = Math.max(...marks.map((m) => m.y + m.h)) + pad;
  // Auf Mindestgröße aufziehen (symmetrisch), dann ins Bild schieben.
  const grow = (a: number, b: number, min: number, max: number): [number, number] => {
    const missing = min - (b - a);
    if (missing > 0) { a -= missing / 2; b += missing / 2; }
    if (a < 0) { b -= a; a = 0; }
    if (b > max) { a -= b - max; b = max; }
    return [Math.max(0, a), Math.min(max, b)];
  };
  [x0, x1] = grow(x0, x1, minW, imgW);
  [y0, y1] = grow(y0, y1, minH, imgH);
  const c = { x: Math.round(x0), y: Math.round(y0), w: Math.round(x1 - x0), h: Math.round(y1 - y0) };
  if ((c.w * c.h) / (imgW * imgH) >= 0.8) return null;
  return c;
}

// CSS-Variablen, die das ganze Bild so verschieben und beschneiden, dass nur der Ausschnitt sichtbar ist.
// Die Markierungen liegen im selben Rahmen und wandern dadurch richtig mit.
export function cropStyle(c: Crop, imgW: number, imgH: number): string {
  const p = (v: number) => `${+v.toFixed(3)}%`;
  const top = (c.y / imgH) * 100, left = (c.x / imgW) * 100;
  const right = ((imgW - c.x - c.w) / imgW) * 100, bottom = ((imgH - c.y - c.h) / imgH) * 100;
  return `--w:${p((imgW / c.w) * 100)};--x:${p(-(c.x / c.w) * 100)};--y:${p(-(c.y / c.h) * 100)};` +
    `--clip:inset(${p(top)} ${p(right)} ${p(bottom)} ${p(left)} round 7px)`;
}
