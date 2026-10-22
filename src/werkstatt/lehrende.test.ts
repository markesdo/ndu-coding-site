import { describe, expect, it } from 'vitest';
import { bezugBestimmen, verlaufZaehlen } from './lehrende';

const TERMINE = { tag1: '2026-10-22', tag2: null, tag3: '2026-11-21', tag4: '2026-11-28' };

describe('bezugBestimmen', () => {
  it('vor Tag 1: keine Tage, kein Bezug', () => {
    expect(bezugBestimmen(TERMINE, '2026-10-21')).toStrictEqual({ tage: [], bezug: null });
  });
  it('am Tag 1: Tag 1 selbst (es gibt keinen früheren)', () => {
    expect(bezugBestimmen(TERMINE, '2026-10-22')).toStrictEqual({ tage: [{ tag: 1, datum: '2026-10-22' }], bezug: { tag: 1, datum: '2026-10-22' } });
  });
  it('am Tag 3: der letzte Kurstag davor (Tag 1), Tag 3 ist wählbar', () => {
    const b = bezugBestimmen(TERMINE, '2026-11-21');
    expect(b?.bezug).toStrictEqual({ tag: 1, datum: '2026-10-22' });
    expect(b?.tage.map((t) => t.tag)).toStrictEqual([1, 3]);
  });
  it('zwischen Tag 3 und 4: Tag 3; Tage ohne Termin nie', () => {
    expect(bezugBestimmen(TERMINE, '2026-11-25')?.bezug).toStrictEqual({ tag: 3, datum: '2026-11-21' });
  });
  it('gewählt: nur ein vergangener Tag mit Termin, sonst undefined', () => {
    expect(bezugBestimmen(TERMINE, '2026-11-25', 1)?.bezug).toStrictEqual({ tag: 1, datum: '2026-10-22' });
    expect(bezugBestimmen(TERMINE, '2026-11-25', 2)).toBeUndefined();
    expect(bezugBestimmen(TERMINE, '2026-11-25', 4)).toBeUndefined();
  });
  it('nach Datum sortiert, nicht nach Nummer (verschobener Tag)', () => {
    const b = bezugBestimmen({ tag1: '2026-10-22', tag2: '2026-12-01', tag3: '2026-11-21' }, '2026-12-02');
    expect(b?.tage.map((t) => t.tag)).toStrictEqual([1, 3, 2]);
    expect(b?.bezug?.tag).toBe(2);
  });
});

describe('verlaufZaehlen', () => {
  const Z = ['2026-10-23T10:00:00Z', '2026-10-21T22:30:00Z', '2026-10-21T08:00:00Z'];
  it('zählt ab dem Kalendertag in Wien (22:30 UTC am 21.10. ist schon der 22.10.)', () => {
    expect(verlaufZaehlen(Z, true, '2026-10-22')).toStrictEqual({ commits: 2, mehr: false, zuletzt: Z[0] });
  });
  it('ohne Bezugstag alle', () => {
    expect(verlaufZaehlen(Z, true, null)).toStrictEqual({ commits: 3, mehr: false, zuletzt: Z[0] });
  });
  it('nie gespeichert', () => {
    expect(verlaufZaehlen([], true, '2026-10-22')).toStrictEqual({ commits: 0, mehr: false, zuletzt: null });
  });
  it('mehr nur, wenn ältere fehlen und alle gelesenen zählen', () => {
    expect(verlaufZaehlen(Z.slice(0, 2), false, '2026-10-22')).toStrictEqual({ commits: 2, mehr: true, zuletzt: Z[0] });
    expect(verlaufZaehlen(Z, false, '2026-10-22')).toStrictEqual({ commits: 2, mehr: false, zuletzt: Z[0] });
  });
});
