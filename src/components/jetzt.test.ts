import { describe, expect, it } from 'vitest';
import { aktiveZeile, wienerZeit, zeitraum } from './jetzt';

// Tag 1 in Wien: Oktober = Sommerzeit (UTC+2).
const wien = (zeit: string, datum = '2026-10-08') => new Date(`${datum}T${zeit}:00+02:00`);
const PLAN = ['09:00–09:30', '09:30–10:45', '10:45–11:00', '11:00–12:00', '12:00–13:00', '16:45–17:00'];

describe('zeitraum', () => {
  it('liest Halbgeviertstrich und Bindestrich', () => {
    expect(zeitraum('09:00–09:30')).toStrictEqual({ start: 540, ende: 570 });
    expect(zeitraum('9:00 - 9:30')).toStrictEqual({ start: 540, ende: 570 });
  });

  it('lehnt Unsinn ab', () => {
    expect(zeitraum('Pause')).toBeUndefined();
    expect(zeitraum('25:00–26:00')).toBeUndefined();
    expect(zeitraum('10:00–09:00')).toBeUndefined();
    expect(zeitraum('10:00–10:00')).toBeUndefined();
  });
});

describe('wienerZeit', () => {
  it('rechnet in Wiener Zeit, egal in welcher Zone der Zeitpunkt angegeben ist', () => {
    // 07:30 UTC = 09:30 in Wien (Sommerzeit).
    expect(wienerZeit(new Date('2026-10-08T07:30:00Z'))).toStrictEqual({ datum: '2026-10-08', minuten: 570 });
    // 23:30 UTC am 7.10. ist in Wien schon der 8.10.
    expect(wienerZeit(new Date('2026-10-07T23:30:00Z')).datum).toBe('2026-10-08');
  });
});

describe('aktiveZeile', () => {
  it('findet die laufende Zeile', () => {
    expect(aktiveZeile(PLAN, '2026-10-08', wien('09:10'))).toBe(0);
    expect(aktiveZeile(PLAN, '2026-10-08', wien('11:59'))).toBe(3);
  });

  it('an der Grenze gilt die Zeile, die beginnt', () => {
    expect(aktiveZeile(PLAN, '2026-10-08', wien('10:44'))).toBe(1);
    expect(aktiveZeile(PLAN, '2026-10-08', wien('10:45'))).toBe(2);
    expect(aktiveZeile(PLAN, '2026-10-08', wien('11:00'))).toBe(3);
  });

  it('markiert auch Pausen', () => {
    expect(aktiveZeile(PLAN, '2026-10-08', wien('12:30'))).toBe(4);
  });

  it('vor Beginn, nach Ende und in Lücken: keine Zeile', () => {
    expect(aktiveZeile(PLAN, '2026-10-08', wien('08:59'))).toBe(-1);
    expect(aktiveZeile(PLAN, '2026-10-08', wien('17:00'))).toBe(-1);
    expect(aktiveZeile(PLAN, '2026-10-08', wien('14:00'))).toBe(-1);
  });

  it('an einem anderen Tag: keine Zeile', () => {
    expect(aktiveZeile(PLAN, '2026-10-08', wien('09:10', '2026-10-09'))).toBe(-1);
  });

  it('der Kurstag zählt in Wiener Zeit, nicht in der des Rechners', () => {
    // 07:10 UTC = 09:10 Wien.
    expect(aktiveZeile(PLAN, '2026-10-08', new Date('2026-10-08T07:10:00Z'))).toBe(0);
    // 22:50 UTC am 8.10. = 00:50 Wien am 9.10. – nicht mehr Tag 1.
    expect(aktiveZeile(['00:00–01:00'], '2026-10-08', new Date('2026-10-08T22:50:00Z'))).toBe(-1);
  });
});
