import { describe, expect, it } from 'vitest';
import { ersetzungen, pruefeId } from './zeitleiste';

const zeile = (t: string, ersetzt?: number) => ({ datum: '22.10.', t, grund: 'g', beleg: 'b', ersetzt });

describe('ersetzungen (Zeitleiste)', () => {
  it('ordnet jeder ersetzten Zeile die ersetzende zu', () => {
    expect(ersetzungen([zeile('Wien'), zeile('Mittag'), zeile('Wien und Linz', 0), zeile('Vorbestellen')])).toStrictEqual({ 0: 2 });
  });

  it('ohne Ersetzungen bleibt die Zuordnung leer', () => {
    expect(ersetzungen([zeile('a'), zeile('b')])).toStrictEqual({});
  });

  it('bricht ab, wenn die erste Zeile etwas ersetzen soll', () => {
    expect(() => ersetzungen([zeile('a', 0)])).toThrow(/erste Zeile und kann keine frühere ersetzen/);
  });

  it('bricht ab, wenn eine Zeile sich selbst oder eine spätere ersetzt', () => {
    expect(() => ersetzungen([zeile('a'), zeile('b', 1)])).toThrow(/ersetzt Zeile 1, erlaubt sind nur frühere \(0–0\)/);
    expect(() => ersetzungen([zeile('a'), zeile('b', 2), zeile('c')])).toThrow(/ersetzt Zeile 2/);
  });

  it('bricht ab, wenn eine Zeile doppelt ersetzt wird', () => {
    expect(() => ersetzungen([zeile('a'), zeile('b', 0), zeile('c', 0)])).toThrow(/Zeile 0 wird doppelt ersetzt \(von 1 und 2\)/);
  });
});

describe('pruefeId', () => {
  it('lässt einfache ids durch', () => {
    expect(() => pruefeId('zl-kaffeebar')).not.toThrow();
  });

  it('bricht ab bei ids, die als CSS-Selektor nicht taugen', () => {
    for (const id of ['1-kaffeebar', 'zl-2.0', 'zl:x', 'Zl', '']) expect(() => pruefeId(id), id).toThrow(/taugt nicht als CSS-Selektor/);
  });
});
