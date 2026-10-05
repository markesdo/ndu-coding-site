import { describe, expect, it } from 'vitest';
import { STEPS, blocksAt, fillOf, preludeAt, type Art } from './kontextfenster-steps';

const FILL = [14, 18, 46, 74, 82, 30, 34, 14, 18];
const kinds = (step: number): Art[] => blocksAt(step).map((b) => b.art);
const count = (step: number, art: Art) => kinds(step).filter((a) => a === art).length;

describe('kontextfenster-steps', () => {
  it('hat neun Schritte mit Titel und Text', () => {
    expect(STEPS).toHaveLength(9);
    for (const s of STEPS) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.text.length).toBeGreaterThan(0);
    }
  });

  it.each(FILL.map((fill, i) => [i + 1, fill]))('Schritt %i ist zu %i Prozent belegt', (step, fill) => {
    expect(fillOf(blocksAt(step))).toBe(fill);
  });

  it('Auftakt von Schritt 6 steht bei 96 %', () => {
    const prelude = preludeAt(6);
    expect(prelude).not.toBeNull();
    expect(fillOf(prelude!)).toBe(96);
  });

  it('nur Schritt 6 hat einen Auftakt', () => {
    for (let step = 1; step <= 9; step++) {
      if (step !== 6) expect(preludeAt(step)).toBeNull();
    }
  });

  it('übersteigt in keinem Zustand 100 Einheiten', () => {
    for (let step = 1; step <= 9; step++) {
      expect(fillOf(blocksAt(step))).toBeLessThanOrEqual(100);
    }
    expect(fillOf(preludeAt(6)!)).toBeLessThanOrEqual(100);
  });

  it('Systemregeln und CLAUDE.md sind in jedem Schritt da', () => {
    for (let step = 1; step <= 9; step++) {
      const ids = blocksAt(step).map((b) => b.id);
      expect(ids).toContain('sys');
      expect(ids).toContain('claude-md');
    }
  });

  it('Schritt 5: Auftrag und die ersten zwei Dateien verblassen, sonst nichts', () => {
    const faded = blocksAt(5).filter((b) => b.verblasst).map((b) => b.id).sort();
    expect(faded).toStrictEqual(['auftrag', 'datei-1', 'datei-2']);
  });

  it('Schritt 6: kein Auftrag mehr, genau eine Zusammenfassung', () => {
    expect(count(6, 'auftrag')).toBe(0);
    expect(count(6, 'zusammenfassung')).toBe(1);
  });

  it('Schritt 7: Auftrag bleibt neben der Zusammenfassung', () => {
    expect(count(7, 'auftrag')).toBe(1);
    expect(count(7, 'zusammenfassung')).toBe(1);
    expect(blocksAt(7).find((b) => b.art === 'auftrag')?.tag).toBe('bleibt');
  });

  it('Schritt 8: nur feste Blöcke', () => {
    expect(new Set(kinds(8))).toStrictEqual(new Set<Art>(['fest']));
  });

  it('Schritt 9: ENTSCHEIDUNGEN.md ist ein fester, verknüpfter Block', () => {
    const e = blocksAt(9).find((b) => b.id === 'entscheidungen');
    expect(e?.art).toBe('fest');
    expect(e?.tag).toBe('in CLAUDE.md verknüpft');
  });

  it('Block-IDs sind je Zustand eindeutig', () => {
    const states = [...Array.from({ length: 9 }, (_, i) => blocksAt(i + 1)), preludeAt(6)!];
    for (const blocks of states) {
      const ids = blocks.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('wirft bei Schritten außerhalb von 1–9', () => {
    expect(() => blocksAt(0)).toThrow(RangeError);
    expect(() => blocksAt(10)).toThrow(RangeError);
    expect(() => blocksAt(1.5)).toThrow(RangeError);
  });
});
