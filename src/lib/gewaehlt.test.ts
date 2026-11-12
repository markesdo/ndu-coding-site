import { describe, expect, it } from 'vitest';
import { ZWOELF_PAARE, gewaehltSchluessel, gewaehltZaehlen, jePaarEine, nummernAus } from './gewaehlt';

describe('Gewählte Nummern („zwoelf“)', () => {
  it('eine Nummer am Satzanfang, 1 bis 12', () => {
    expect(nummernAus('3 – weil die Suche fehlt')).toStrictEqual([3]);
    expect(nummernAus(' 12: im Zug')).toStrictEqual([12]);
    expect(nummernAus('1')).toStrictEqual([1]);
    expect(nummernAus('11, leicht')).toStrictEqual([11]);
  });

  it('Aufzählung am Satzanfang: Komma, Semikolon, Punkt, „und“, „&“, „+“, Leerzeichen', () => {
    expect(nummernAus('7 und 12 – unterwegs')).toStrictEqual([7, 12]);
    expect(nummernAus('1, 2 – weil …')).toStrictEqual([1, 2]);
    expect(nummernAus('2; 7; 11 – schwer')).toStrictEqual([2, 7, 11]);
    expect(nummernAus('2. 7. 11.')).toStrictEqual([2, 7, 11]);
    // Ein Schrägstrich beendet die Liste.
    expect(nummernAus('3/5 – Suche')).toStrictEqual([3]);
    expect(nummernAus('9 & 11: groß gegen klein')).toStrictEqual([9, 11]);
    expect(nummernAus('2 + 3, weil')).toStrictEqual([2, 3]);
    expect(nummernAus('4 6 – egal')).toStrictEqual([4, 6]);
    expect(nummernAus('1, 2 und 3 – alles')).toStrictEqual([1, 2, 3]);
    // Drei Paare (Platzhalter der Runde): Die Liste endet am Gedankenstrich, Nummern später im Satz zählen nicht.
    expect(nummernAus('2, 7, 11 – bei 9 oder 11 …')).toStrictEqual([2, 7, 11]);
    expect(nummernAus('2, 7, 11 – bei 9/11 …')).toStrictEqual([2, 7, 11]);
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

  it('je Paar eine Nummer (1 oder 2, 7 oder 12, 9 oder 11), die erste zählt; andere Nummern bleiben', () => {
    const paare = (t: string) => jePaarEine(nummernAus(t), ZWOELF_PAARE);
    expect(paare('2, 7, 11 9 oder 11 war schwer')).toStrictEqual([2, 7, 11]);
    expect(paare('1 2 7')).toStrictEqual([1, 7]);
    expect(paare('2; 7; 11')).toStrictEqual([2, 7, 11]);
    expect(paare('2. 7. 11.')).toStrictEqual([2, 7, 11]);
    expect(paare('12, 7, 4')).toStrictEqual([12, 4]);
    expect(jePaarEine([4, 6, 8, 10], ZWOELF_PAARE)).toStrictEqual([4, 6, 8, 10]);
    expect([...gewaehltZaehlen(['1 2 7', '2, 12, 9'], ZWOELF_PAARE)]).toStrictEqual([[1, 1], [7, 1], [2, 1], [12, 1], [9, 1]]);
    // Ohne Paare zählt alles.
    expect([...gewaehltZaehlen(['1 2 7'])]).toStrictEqual([[1, 1], [2, 1], [7, 1]]);
  });

  it('Schlüssel: gleich bei gleicher Zählung, unabhängig von der Reihenfolge', () => {
    expect(gewaehltSchluessel(gewaehltZaehlen(['3 – a', '11 – b']))).toBe(gewaehltSchluessel(gewaehltZaehlen(['11 – b', '3 – a'])));
    expect(gewaehltSchluessel(gewaehltZaehlen(['3 – a']))).not.toBe(gewaehltSchluessel(gewaehltZaehlen(['3 – a', '3 – b'])));
    expect(gewaehltSchluessel(new Map())).toBe('');
  });
});
