import { describe, expect, it } from 'vitest';
import { ersetzungen } from './zeitleiste';

const zeile = (t: string, ersetzt?: number) => ({ datum: '22.10.', t, grund: 'g', beleg: 'b', ersetzt });

describe('ersetzungen (Zeitleiste)', () => {
  it('ordnet jeder ersetzten Zeile die ersetzende zu', () => {
    expect(ersetzungen([zeile('Wien'), zeile('Mittag'), zeile('Wien und Linz', 0), zeile('Vorbestellen')]))
      .toStrictEqual({ ersetztDurch: { 0: 2 } });
  });

  it('ohne Ersetzungen bleibt die Zuordnung leer', () => {
    expect(ersetzungen([zeile('a'), zeile('b')])).toStrictEqual({ ersetztDurch: {} });
  });

  it('bricht ab, wenn eine Zeile sich selbst oder eine spätere ersetzt', () => {
    expect(() => ersetzungen([zeile('a', 0)])).toThrow(/ersetzt Zeile 0, erlaubt sind nur frühere/);
    expect(() => ersetzungen([zeile('a', 1), zeile('b')])).toThrow(/ersetzt Zeile 1/);
  });

  it('bricht ab, wenn eine Zeile doppelt ersetzt wird', () => {
    expect(() => ersetzungen([zeile('a'), zeile('b', 0), zeile('c', 0)])).toThrow(/Zeile 0 wird doppelt ersetzt \(von 1 und 2\)/);
  });
});
