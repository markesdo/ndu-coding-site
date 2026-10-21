import { describe, expect, it } from 'vitest';
import { aufdecken, heuteOffen, heuteZuFragen, kennungPruefen } from './aufgedeckt';

// 22.10.2026 10:05 in Wien = 08:05 UTC (Sommerzeit bis 25.10.).
const KURSTAG = new Date('2026-10-22T08:05:00Z');
const NAECHSTER = new Date('2026-10-23T08:05:00Z');

describe('kennungPruefen', () => {
  it('Gruppe oder Knopftext, getrimmt', () => {
    expect(kennungPruefen(' mom-test ')).toBe('mom-test');
    expect(kennungPruefen('Auflösung zeigen (nach Review 1)')).toBe('Auflösung zeigen (nach Review 1)');
  });
  it('leer, zu lang, Steuerzeichen oder kein Text → null', () => {
    for (const roh of ['', '   ', 'x'.repeat(81), 'a\nb', 7, null, undefined, { k: 1 }]) expect(kennungPruefen(roh), String(roh)).toBeNull();
  });
});

describe('aufdecken / heuteOffen', () => {
  it('sammelt Kennungen des Tages, ohne Doppel', () => {
    let s = aufdecken(undefined, 'toast', KURSTAG);
    s = aufdecken(s, 'mom-test', KURSTAG);
    s = aufdecken(s, 'toast', KURSTAG);
    expect(s).toStrictEqual({ datum: '2026-10-22', offen: ['toast', 'mom-test'] });
    expect(heuteOffen(s, KURSTAG)).toStrictEqual(['toast', 'mom-test']);
  });
  it('ein Stand von gestern gilt heute nicht und wird beim nächsten Aufdecken ersetzt', () => {
    const gestern = aufdecken(undefined, 'toast', KURSTAG);
    expect(heuteOffen(gestern, NAECHSTER)).toStrictEqual([]);
    expect(aufdecken(gestern, 'lego', NAECHSTER)).toStrictEqual({ datum: '2026-10-23', offen: ['lego'] });
  });
  it('ohne Stand ist nichts offen', () => {
    expect(heuteOffen(undefined, KURSTAG)).toStrictEqual([]);
  });
});

describe('heuteZuFragen', () => {
  it('nur wenn eine geschlossene Auflösung heute fällig wird', () => {
    expect(heuteZuFragen(['2026-10-22T16:45'], KURSTAG)).toBe(true);
    expect(heuteZuFragen(['2026-11-28T10:30'], KURSTAG)).toBe(false);
    expect(heuteZuFragen([], KURSTAG)).toBe(false);
    expect(heuteZuFragen(['ungültig'], KURSTAG)).toBe(false);
  });
});
