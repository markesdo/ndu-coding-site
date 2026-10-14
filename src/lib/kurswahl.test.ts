import { describe, expect, it } from 'vitest';
import { INNOLAB_AB, innolabOffen, kursZiel, tagInWien } from './kurswahl';
import { TAGE } from '../components/methoden';

describe('kurswahl', () => {
  it('Stichtag ist der erste Innolab-Tag', () => {
    expect(INNOLAB_AB).toBe(TAGE[0].datum);
  });

  it('rechnet den Kalendertag in Wien, nicht in UTC', () => {
    // 15.10. 22:30 UTC ist in Wien (Sommerzeit, UTC+2) schon der 16.10., 0:30.
    expect(tagInWien(new Date('2026-10-15T22:30:00Z'))).toBe('2026-10-16');
    expect(tagInWien(new Date('2026-10-15T21:30:00Z'))).toBe('2026-10-15');
  });

  it('Innolab ist bis zum Ende des letzten Coding-Tags ausgegraut, ab Mitternacht Wiener Zeit offen', () => {
    expect(innolabOffen(new Date('2026-10-15T21:59:59Z'))).toBe(false); // 15.10. 23:59:59 in Wien
    expect(innolabOffen(new Date('2026-10-15T22:00:00Z'))).toBe(true); // 16.10. 0:00 in Wien
    expect(innolabOffen(new Date('2027-01-07T12:00:00Z'))).toBe(true);
  });

  it('behält den Beamer-Modus beim Kurswechsel', () => {
    expect(kursZiel('/innolab', '?beamer')).toBe('/innolab?beamer');
    expect(kursZiel('/innolab', '?beamer=1')).toBe('/innolab?beamer');
    expect(kursZiel('/', '?beamer=0')).toBe('/');
    expect(kursZiel('/', '')).toBe('/');
  });
});
