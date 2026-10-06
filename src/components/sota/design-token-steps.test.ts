import { describe, expect, it } from 'vitest';
import { BLAU, ROT, STEPS, ersetzen, farbe, farben, zustandAt, type Seite } from './design-token-steps';

const farbeVon = (seite: Seite, id: string) => farbe(seite, seite.stellen.find((s) => s.id === id)!);

describe('design-token-steps', () => {
  it('hat sieben Schritte mit Titel und Text', () => {
    expect(STEPS).toHaveLength(7);
    for (const s of STEPS) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.text.length).toBeGreaterThan(0);
    }
  });

  it('wirft bei Schritten außerhalb von 1–7', () => {
    expect(() => zustandAt(0)).toThrow(RangeError);
    expect(() => zustandAt(8)).toThrow(RangeError);
    expect(() => zustandAt(2.5)).toThrow(RangeError);
  });

  it('am Anfang sind beide Seiten rot – rechts mit einem leicht abgewandelten Ton', () => {
    const z = zustandAt(1);
    expect(farben(z.token)).toStrictEqual([ROT]);
    expect(farben(z.hex)).toStrictEqual([ROT, '#e8603f']);
    expect(z.code).toBe(false);
  });

  it('auf der Token-Seite zeigt in jedem Schritt jede Stelle den Token-Wert', () => {
    for (let step = 1; step <= STEPS.length; step++) {
      const { token } = zustandAt(step);
      for (const s of token.stellen) expect(farbe(token, s)).toBe(token.accent);
    }
  });

  it('Schritt 3: eine Zeile geändert, alle fünf Stellen links folgen, rechts noch nichts', () => {
    const z = zustandAt(3);
    expect(z.zeilen.token).toBe(1);
    expect(farben(z.token)).toStrictEqual([BLAU]);
    expect(z.geaendert.token).toHaveLength(5);
    expect(farben(z.hex)).not.toContain(BLAU);
  });

  it('Schritt 4: Suchen und Ersetzen trifft drei von fünf Stellen, Badge und Fokus bleiben', () => {
    const z = zustandAt(4);
    expect(z.geaendert.hex).toStrictEqual(['button', 'link', 'rand']);
    expect(z.verfehlt).toStrictEqual(['badge', 'fokus']);
    expect(farbeVon(z.hex, 'badge')).toBe(ROT);
    expect(farbeVon(z.hex, 'fokus')).toBe('#e8603f');
    expect(z.zeilen.hex).toBe(3);
  });

  it('Ersetzen unterscheidet Groß- und Kleinschreibung wie ein Editor', () => {
    const seite: Seite = { art: 'hex', stellen: [{ id: 'badge', name: '', datei: '', code: 'bg-[#E8472B]' }] };
    const r = ersetzen(seite, '#e8472b', BLAU);
    expect(r.getroffen).toStrictEqual([]);
    expect(r.verfehlt).toStrictEqual(['badge']);
  });

  it('Schritt 6: der neue Button übernimmt die Vorlage – links blau, rechts rot', () => {
    const z = zustandAt(6);
    expect(farbeVon(z.token, 'teilen')).toBe(BLAU);
    expect(farbeVon(z.hex, 'teilen')).toBe(ROT);
    expect(z.markiert).toStrictEqual(['teilen']);
  });

  it('am Ende: links eine Farbe, rechts drei', () => {
    const z = zustandAt(7);
    expect(farben(z.token)).toHaveLength(1);
    expect(farben(z.hex)).toHaveLength(3);
  });

  it('die Stellen-Reihenfolge ist in allen Schritten gleich – sonst springt die Szene', () => {
    const ids = zustandAt(1).token.stellen.map((s) => s.id);
    for (let step = 1; step <= STEPS.length; step++) {
      const z = zustandAt(step);
      expect(z.token.stellen.map((s) => s.id).slice(0, 5)).toStrictEqual(ids);
      expect(z.hex.stellen.map((s) => s.id).slice(0, 5)).toStrictEqual(ids);
    }
  });
});
