import { describe, expect, it } from 'vitest';
import { gefundenAnteil } from './nielsen';

describe('gefundenAnteil (Nielsen 2000)', () => {
  it('fünf Personen finden rund 85 % der Probleme, eine knapp ein Drittel, keine nichts', () => {
    expect(gefundenAnteil(0)).toBe(0);
    expect(gefundenAnteil(1)).toBeCloseTo(0.31, 5);
    expect(gefundenAnteil(5)).toBeCloseTo(0.844, 3);
  });

  it('jede weitere Person bringt weniger als die vorige – ab der sechsten unter fünf Prozentpunkte', () => {
    const zuwachs = (n: number) => gefundenAnteil(n) - gefundenAnteil(n - 1);
    expect(zuwachs(6)).toBeLessThan(zuwachs(5));
    expect(zuwachs(6)).toBeLessThan(0.05);
    expect(zuwachs(5)).toBeGreaterThan(0.05);
  });

  it('lehnt Bruchteile und negative Zahlen ab', () => {
    expect(() => gefundenAnteil(2.5)).toThrow();
    expect(() => gefundenAnteil(-1)).toThrow();
  });
});
