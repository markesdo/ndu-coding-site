import { describe, expect, it } from 'vitest';
import { proStufe } from './skala';

describe('proStufe (Skala: Stickies den Stufen zuordnen)', () => {
  it('legt jeden Sticky unter seine Stufe, in der Reihenfolge der Eingabe', () => {
    const a = { t: 'I1', stufe: 2 };
    const b = { t: 'Kassendaten', stufe: 3 };
    const c = { t: 'T1', stufe: 2 };
    expect(proStufe([a, b, c], 4)).toStrictEqual([[], [], [a, c], [b]]);
  });

  it('gibt für jede Stufe eine Liste zurück, auch ohne Stickies', () => {
    expect(proStufe([], 3)).toStrictEqual([[], [], []]);
  });

  it('bricht bei einer Stufe außerhalb der Skala ab, statt den Sticky zu verlieren', () => {
    expect(() => proStufe([{ t: 'zu weit', stufe: 4 }], 4)).toThrow(/Stufe 4, erlaubt sind 0–3/);
    expect(() => proStufe([{ t: 'negativ', stufe: -1 }], 4)).toThrow(/Stufe -1/);
    expect(() => proStufe([{ t: 'halb', stufe: 1.5 }], 4)).toThrow(/Stufe 1.5/);
  });
});
