import { describe, expect, it } from 'vitest';
import { gewaehltZaehlen, nummerAus } from './gewaehlt';

describe('Gewählte Nummern („zwoelf“)', () => {
  it('nur die Zahl am Satzanfang, 1 bis 12', () => {
    expect(nummerAus('3 – weil die Suche fehlt')).toBe(3);
    expect(nummerAus(' 12: im Zug')).toBe(12);
    expect(nummerAus('1')).toBe(1);
    expect(nummerAus('11, leicht')).toBe(11);
    expect(nummerAus('Nr. 3, weil …')).toBeNull();
    expect(nummerAus('ich nehme 3')).toBeNull();
    expect(nummerAus('13 – gibt es nicht')).toBeNull();
    expect(nummerAus('0 – gibt es nicht')).toBeNull();
    expect(nummerAus('123')).toBeNull();
    expect(nummerAus('abc')).toBeNull();
    expect(nummerAus('')).toBeNull();
  });

  it('zählt Mehrfachwahl, lässt Sätze ohne Nummer weg', () => {
    expect([...gewaehltZaehlen(['3 – Suche', '11 – leicht', ' 3: auch', 'keine Ahnung', '13'])]).toStrictEqual([[3, 2], [11, 1]]);
    expect(gewaehltZaehlen([]).size).toBe(0);
  });
});
