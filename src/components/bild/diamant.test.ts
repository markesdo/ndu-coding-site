import { describe, expect, it } from 'vitest';
import { phasenFlaeche, pruefeDiamant, RAUTEN } from './diamant';

describe('pruefeDiamant', () => {
  it('lässt vier Phasen mit und ohne Hervorhebung durch', () => {
    expect(() => pruefeDiamant(4)).not.toThrow();
    expect(() => pruefeDiamant(4, 3)).not.toThrow();
  });

  it('bricht ab bei einer anderen Zahl von Phasen und bei hervor außerhalb 0–3', () => {
    expect(() => pruefeDiamant(3)).toThrow(/genau vier Phasen, waren 3/);
    expect(() => pruefeDiamant(4, 4)).toThrow(/hervor muss 0–3 sein, war 4/);
    expect(() => pruefeDiamant(4, -1)).toThrow(/war -1/);
  });
});

describe('phasenFlaeche', () => {
  it('liegt in der richtigen Hälfte der richtigen Raute', () => {
    expect(RAUTEN).toStrictEqual(['2,100 200,4 398,100 200,196', '402,100 600,4 798,100 600,196']);
    expect(phasenFlaeche(0)).toBe('2,100 200,4 200,196');
    expect(phasenFlaeche(1)).toBe('200,4 398,100 200,196');
    expect(phasenFlaeche(2)).toBe('402,100 600,4 600,196');
    expect(phasenFlaeche(3)).toBe('600,4 798,100 600,196');
  });
});
