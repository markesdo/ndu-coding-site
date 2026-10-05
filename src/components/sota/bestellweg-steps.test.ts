import { describe, expect, it } from 'vitest';
import { STATIONEN, STEPS, stateAt, strecke } from './bestellweg-steps';

const ALLE = STEPS.map((_, i) => i + 1);
const FEHLER = [8, 9, 10];

describe('bestellweg-steps', () => {
  it('hat zehn Schritte mit Titel und Text', () => {
    expect(STEPS).toHaveLength(10);
    for (const s of STEPS) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.text.length).toBeGreaterThan(0);
    }
  });

  it('kennt keine Schritte außerhalb', () => {
    expect(() => stateAt(0)).toThrow();
    expect(() => stateAt(STEPS.length + 1)).toThrow();
  });

  it('der Hinweg führt Station für Station bis zur Datenbank', () => {
    expect([2, 3, 4, 5].map((s) => stateAt(s).zettel?.at)).toStrictEqual(['frontend', 'api', 'backend', 'db']);
    for (const s of [2, 3, 4, 5]) expect(stateAt(s).zettel?.key).toBe('bestellung');
  });

  it('die API stempelt, verändert aber nichts: Prüfungen erst im Backend', () => {
    expect(stateAt(2).zettel?.stempel).toBe(false);
    expect(stateAt(3).zettel?.stempel).toBe(true);
    expect(stateAt(3).pruefungen).toStrictEqual(['offen', 'offen', 'offen']);
    expect(stateAt(4).pruefungen).toStrictEqual(['ok', 'ok', 'ok']);
  });

  it('die neue Zeile entsteht erst in der Datenbank', () => {
    for (const s of [1, 2, 3, 4]) {
      expect(stateAt(s).zeilen.map((z) => z.id)).not.toContain('lena');
      expect(stateAt(s).anzahl).toBe(12);
    }
    expect(stateAt(5).neueZeile).toBe('lena');
    expect(stateAt(5).zeilen.map((z) => z.id)).toContain('lena');
  });

  it('die angezeigte Zahl stammt aus der Datenbank', () => {
    expect(stateAt(1).angezeigt).toBe(stateAt(1).anzahl);
    expect(stateAt(6).angezeigt).toBe(12);
    expect(stateAt(7).angezeigt).toBe(stateAt(5).anzahl);
    expect(stateAt(7).button).toBe('zugesagt');
  });

  it('die Antwort läuft vom Backend zurück', () => {
    expect(stateAt(6).zettel).toMatchObject({ key: 'antwort', at: 'api', von: 'backend' });
    expect(stateAt(7).zettel).toMatchObject({ key: 'antwort', at: 'frontend' });
  });

  it('der Fehlerfall scheitert im Backend und erreicht die Datenbank nie', () => {
    expect(stateAt(8).angemeldet).toBe(false);
    expect(stateAt(8).pruefungen).toStrictEqual(['fehler', 'offen', 'offen']);
    for (const s of FEHLER) {
      expect(stateAt(s).zettel?.at).not.toBe('db');
      expect(stateAt(s).zeilen).toStrictEqual(stateAt(7).zeilen);
      expect(stateAt(s).anzahl).toBe(13);
      expect(stateAt(s).neueZeile).toBeNull();
    }
    expect(stateAt(9).zettel).toMatchObject({ art: 'fehler', at: 'frontend', von: 'backend' });
    expect(stateAt(9).button).toBe('fehler');
    expect(stateAt(9).unberuehrt).toBe(true);
  });

  it('nur der letzte Schritt zeigt alle Stationen mit ihrem Werkzeug', () => {
    for (const s of ALLE) {
      const z = stateAt(s);
      expect(z.werkzeuge).toBe(s === STEPS.length);
      expect(z.aktiv === null).toBe(s === STEPS.length);
    }
  });

  it('ein Zettel startet nur an einer bekannten Station', () => {
    for (const s of ALLE) {
      const z = stateAt(s).zettel;
      if (!z) continue;
      expect(STATIONEN).toContain(z.at);
      if (z.von) expect(STATIONEN).toContain(z.von);
    }
  });

  it.each([
    [1, 0], [2, 0], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 2], [9, 2], [10, 0],
  ])('Schritt %i: Zettel wandert %i Stationen', (step, n) => {
    expect(strecke(step)).toBe(n);
  });
});
