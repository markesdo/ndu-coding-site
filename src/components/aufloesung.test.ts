import { describe, expect, it } from 'vitest';
import { aufgeloest, aufloesungAb, abText } from './aufloesung';

// Oktober = Sommerzeit in Wien (UTC+2).
const wien = (zeit: string, datum = '2026-10-16') => new Date(`${datum}T${zeit}:00+02:00`);

describe('aufloesungAb', () => {
  it('liest Datum und Uhrzeit', () => {
    expect(aufloesungAb('2026-10-16T10:10')).toStrictEqual({ datum: '2026-10-16', minuten: 610 });
  });

  it('lehnt Unsinn ab', () => {
    expect(aufloesungAb('16.10.2026 10:10')).toBeUndefined();
    expect(aufloesungAb('2026-10-16T24:00')).toBeUndefined();
    expect(aufloesungAb('2026-10-16')).toBeUndefined();
    expect(aufloesungAb('2026-10-61T10:10')).toBeUndefined();
    expect(aufloesungAb('2026-16-10T10:10')).toBeUndefined();
    expect(aufloesungAb('2026-02-30T10:10')).toBeUndefined();
  });
});

describe('aufgeloest', () => {
  it('bleibt bis zur Uhrzeit verborgen, ab der Minute sichtbar', () => {
    expect(aufgeloest('2026-10-16T10:10', wien('10:09'))).toBe(false);
    expect(aufgeloest('2026-10-16T10:10', wien('10:10'))).toBe(true);
  });

  it('vergleicht Tage: am Vortag verborgen, danach sichtbar', () => {
    expect(aufgeloest('2026-10-16T10:10', wien('23:00', '2026-10-15'))).toBe(false);
    expect(aufgeloest('2026-10-16T10:10', wien('08:00', '2026-10-17'))).toBe(true);
  });

  it('rechnet in Wiener Zeit, egal wo der Rechner steht', () => {
    // 08:09 UTC = 10:09 in Wien.
    expect(aufgeloest('2026-10-16T10:10', new Date('2026-10-16T08:09:00Z'))).toBe(false);
    expect(aufgeloest('2026-10-16T10:10', new Date('2026-10-16T08:10:00Z'))).toBe(true);
  });

  it('ungültiges ab verrät nichts', () => {
    expect(aufgeloest('morgen', wien('12:00', '2030-01-01'))).toBe(false);
  });
});

describe('abText', () => {
  it('„am 22.10. um 16:45“', () => expect(abText('2026-10-22T16:45')).toBe('am 22.10. um 16:45'));
});
