import { describe, expect, it } from 'vitest';
import { gewaehltSchluessel, gewaehltZaehlen, nummernAus } from './gewaehlt';

describe('Gewählte Nummern („zwoelf“)', () => {
  it('eine Nummer am Satzanfang, 1 bis 12', () => {
    expect(nummernAus('3 – weil die Suche fehlt')).toStrictEqual([3]);
    expect(nummernAus(' 12: im Zug')).toStrictEqual([12]);
    expect(nummernAus('1')).toStrictEqual([1]);
    expect(nummernAus('11, leicht')).toStrictEqual([11]);
  });

  it('Aufzählung am Satzanfang: Komma, „und“, „&“, „/“, „+“, Leerzeichen', () => {
    expect(nummernAus('7 und 12 – unterwegs')).toStrictEqual([7, 12]);
    expect(nummernAus('1, 2 – weil …')).toStrictEqual([1, 2]);
    expect(nummernAus('3/5 – Suche')).toStrictEqual([3, 5]);
    expect(nummernAus('9 & 11: groß gegen klein')).toStrictEqual([9, 11]);
    expect(nummernAus('2 + 3, weil')).toStrictEqual([2, 3]);
    expect(nummernAus('4 6 – egal')).toStrictEqual([4, 6]);
    expect(nummernAus('1, 2 und 3 – alles')).toStrictEqual([1, 2, 3]);
    // Dieselbe Nummer zählt pro Satz einmal; ungültige in der Aufzählung fallen weg.
    expect(nummernAus('3, 3 und 3')).toStrictEqual([3]);
    expect(nummernAus('1, 13 – halb')).toStrictEqual([1]);
    // Die Aufzählung endet beim ersten Wort; Zahlen danach zählen nicht.
    expect(nummernAus('3 weil 5 Leute')).toStrictEqual([3]);
    expect(nummernAus('3 Leute, 5 Minuten')).toStrictEqual([3]);
  });

  it('nichts für „Nr. 3“, Zahlen mitten im Satz, 0, 13, 123, 3a', () => {
    expect(nummernAus('Nr. 3, weil …')).toStrictEqual([]);
    expect(nummernAus('ich nehme 3')).toStrictEqual([]);
    expect(nummernAus('13 – gibt es nicht')).toStrictEqual([]);
    expect(nummernAus('0 – gibt es nicht')).toStrictEqual([]);
    expect(nummernAus('123')).toStrictEqual([]);
    expect(nummernAus('3a – Tippfehler')).toStrictEqual([]);
    expect(nummernAus('abc')).toStrictEqual([]);
    expect(nummernAus('')).toStrictEqual([]);
  });

  it('zählt Sätze je Nummer, Doppelte im selben Satz einmal', () => {
    expect([...gewaehltZaehlen(['3 – Suche', '11 – leicht', ' 3: auch', 'keine Ahnung', '13', '3 und 3'])])
      .toStrictEqual([[3, 3], [11, 1]]);
    expect([...gewaehltZaehlen(['7 und 12 – unterwegs', '12 – Zug'])]).toStrictEqual([[7, 1], [12, 2]]);
    expect(gewaehltZaehlen([]).size).toBe(0);
  });

  it('Schlüssel: gleich bei gleicher Zählung, unabhängig von der Reihenfolge', () => {
    expect(gewaehltSchluessel(gewaehltZaehlen(['3 – a', '11 – b']))).toBe(gewaehltSchluessel(gewaehltZaehlen(['11 – b', '3 – a'])));
    expect(gewaehltSchluessel(gewaehltZaehlen(['3 – a']))).not.toBe(gewaehltSchluessel(gewaehltZaehlen(['3 – a', '3 – b'])));
    expect(gewaehltSchluessel(new Map())).toBe('');
  });
});
