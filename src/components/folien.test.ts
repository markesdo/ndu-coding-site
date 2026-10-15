import { describe, expect, it } from 'vitest';
import { aktuelleFolie, restText, weiter, zurueck } from './folien';

describe('weiter (→ im Beamer)', () => {
  const folie = { versteckteSchritte: 0, offeneAufloesung: false, naechsteFolie: true };

  it('deckt zuerst den nächsten Schritt der Folie auf', () => {
    expect(weiter({ ...folie, versteckteSchritte: 2, offeneAufloesung: true })).toBe('schritt');
  });

  it('dann die Auflösung, bevor es zur nächsten Folie geht', () => {
    expect(weiter({ ...folie, offeneAufloesung: true })).toBe('aufloesung');
  });

  it('dann die nächste Folie', () => {
    expect(weiter(folie)).toBe('folie');
  });

  it('nach der letzten Folie die nächste Seite', () => {
    expect(weiter({ ...folie, naechsteFolie: false })).toBe('seite');
  });
});

describe('zurueck (← im Beamer)', () => {
  it('verdeckt zuerst den zuletzt gezeigten Schritt', () => {
    expect(zurueck({ gezeigteSchritte: 1, vorherigeFolie: true })).toBe('schritt');
  });

  it('dann die vorige Folie, vor der ersten die vorige Seite', () => {
    expect(zurueck({ gezeigteSchritte: 0, vorherigeFolie: true })).toBe('folie');
    expect(zurueck({ gezeigteSchritte: 0, vorherigeFolie: false })).toBe('seite');
  });
});

describe('aktuelleFolie', () => {
  it('ist die Folie, deren Oberkante der Kopfleiste am nächsten liegt', () => {
    expect(aktuelleFolie([48, 768, 1488], 48)).toBe(0);
    expect(aktuelleFolie([-672, 52, 772], 48)).toBe(1);
    expect(aktuelleFolie([-1300, -580, 140], 48)).toBe(2);
  });

  it('ohne Folien -1', () => {
    expect(aktuelleFolie([], 48)).toBe(-1);
  });
});

describe('restText', () => {
  it('zeigt Minuten und Sekunden, aufgerundet', () => {
    expect(restText(180_000)).toBe('3:00');
    expect(restText(61_001)).toBe('1:02');
    expect(restText(9_000)).toBe('0:09');
  });

  it('wird nie negativ', () => {
    expect(restText(-5_000)).toBe('0:00');
  });
});
