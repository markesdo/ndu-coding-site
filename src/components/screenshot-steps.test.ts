import { describe, expect, it } from 'vitest';
import { cropRect, cropStyle, markStyle } from './screenshot-steps';

describe('markStyle', () => {
  it('rechnet Pixel des Bildes in Prozent um', () => {
    expect(markStyle({ x: 100, y: 50, w: 200, h: 25 }, 1000, 500)).toBe('left:10%;top:10%;width:20%;height:5%');
  });

  it('rundet auf drei Nachkommastellen', () => {
    expect(markStyle({ x: 1, y: 1, w: 1, h: 1 }, 3, 3)).toBe('left:33.333%;top:33.333%;width:33.333%;height:33.333%');
  });

  it('erlaubt einen Rahmen bis genau an den Bildrand', () => {
    expect(markStyle({ x: 0, y: 0, w: 1000, h: 500 }, 1000, 500)).toBe('left:0%;top:0%;width:100%;height:100%');
  });

  it.each([
    { x: 900, y: 10, w: 200, h: 5 },
    { x: 10, y: 490, w: 10, h: 20 },
    { x: -1, y: 10, w: 10, h: 5 },
    { x: 10, y: 10, w: 0, h: 5 },
    { x: 10, y: 10, w: Number.NaN, h: 5 },
  ])('lehnt Rahmen außerhalb des Bildes ab: %o', (m) => {
    expect(() => markStyle(m, 1000, 500)).toThrow('außerhalb des Bildes');
  });
});

describe('cropRect', () => {
  const W = 1000, H = 500;

  it('zeigt das ganze Bild ohne Markierungen', () => {
    expect(cropRect([], W, H)).toBeNull();
  });

  it('schneidet um eine kleine Markierung herum mit Rand und Mindestgröße zu', () => {
    const c = cropRect([{ x: 480, y: 240, w: 40, h: 20 }], W, H)!;
    expect(c.w).toBe(470); // Mindestbreite 47 % schlägt Markierung + Rand
    expect(c.h).toBe(234); // 20 + 2 × 107 Rand = 234 > Mindesthöhe 220
    expect(c.x + c.w / 2).toBeCloseTo(500, 0); // um die Markierung zentriert
    expect(c.y + c.h / 2).toBeCloseTo(250, 0);
  });

  it('schiebt den Ausschnitt am Rand ins Bild statt ihn abzuschneiden', () => {
    const c = cropRect([{ x: 0, y: 0, w: 30, h: 20 }], W, H)!;
    expect(c).toStrictEqual({ x: 0, y: 0, w: 470, h: 234 });
  });

  it('zeigt das ganze Bild, wenn der Ausschnitt fast alles abdecken würde', () => {
    expect(cropRect([{ x: 10, y: 10, w: 900, h: 400 }], W, H)).toBeNull();
  });

  it('umfasst alle Markierungen', () => {
    const marks = [{ x: 100, y: 50, w: 50, h: 20 }, { x: 700, y: 120, w: 60, h: 20 }];
    const c = cropRect(marks, W, H)!;
    for (const m of marks) {
      expect(m.x).toBeGreaterThanOrEqual(c.x);
      expect(m.y).toBeGreaterThanOrEqual(c.y);
      expect(m.x + m.w).toBeLessThanOrEqual(c.x + c.w);
      expect(m.y + m.h).toBeLessThanOrEqual(c.y + c.h);
    }
  });
});

describe('cropStyle', () => {
  it('verschiebt und beschneidet das Bild auf den Ausschnitt', () => {
    expect(cropStyle({ x: 250, y: 100, w: 500, h: 250 }, 1000, 500)).toBe(
      '--w:200%;--x:-50%;--y:-40%;--clip:inset(20% 25% 30% 25% round 7px)',
    );
  });
});
