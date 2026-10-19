import { describe, expect, it } from 'vitest';
import beispiel from '../../beispiele/annahmen.json';
import { annahmenPunkte } from './annahmen-punkte.js';
import { punkt, quadrant, type Annahme } from '../../schemas/index.js';

const annahme = (n: number, extra: Partial<Annahme> = {}): Annahme => ({
  id: `A${n}`, text: `Annahme ${n}`, art: 'machbar', wichtig: 'niedrig', beleg: 'getan', belegIds: [], ...extra,
});

describe('annahmenPunkte', () => {
  it('Kaffeebar-Beispiel: vier Punkte, nur A1 hervorgehoben', () => {
    const p = annahmenPunkte(beispiel.annahmen as Annahme[], 'A1');
    expect(p).toHaveLength(4);
    expect(p.map((x) => x.hervor)).toEqual([true, false, false, false]);
    expect(p[0]!.t.startsWith('A1 · ')).toBe(true);
    expect(p.map((x) => x.farbe)).toEqual(['yellow', 'blue', 'purple', 'green']);
  });

  it('kürzt Text über 40 Zeichen mit „…“, kurzen Text nicht', () => {
    const [lang, kurz] = annahmenPunkte([annahme(1, { text: 'x'.repeat(60) }), annahme(2, { text: 'kurz', wichtig: 'hoch' })], null);
    expect(lang!.t).toBe(`A1 · ${'x'.repeat(40)}…`);
    expect(kurz!.t).toBe('A2 · kurz');
  });

  it('ohne riskanteste ist nichts hervorgehoben', () => {
    expect(annahmenPunkte([annahme(1)], null)[0]!.hervor).toBe(false);
  });

  it('A1 (kein Beleg) liegt im Feld oben rechts, A2 (getan) oben links', () => {
    const p = annahmenPunkte(beispiel.annahmen as Annahme[], 'A1');
    expect(p[0]).toMatchObject({ id: 'A1' });
    expect(p[0]!.x).toBeGreaterThan(0.5);
    expect(p[0]!.y).toBeGreaterThan(0.5);
    expect(p[1]!.x).toBeLessThan(0.5);
    expect(p[1]!.y).toBeGreaterThan(0.5);
  });

  it('kürzt nach Zeichen, nicht nach UTF-16-Einheiten (Emoji an Stelle 40)', () => {
    const text = `${'x'.repeat(39)}😀${'y'.repeat(10)}`;
    const [p] = annahmenPunkte([annahme(1, { text })], null);
    expect(p!.t).toBe(`A1 · ${'x'.repeat(39)}😀…`);
  });

  it('nutzt punkt() ohne eigene Versatzlogik: fünf in einer Randzelle bleiben im Quadranten', () => {
    const liste = [1, 2, 3, 4, 5].map((n) => annahme(n));
    const punkte = annahmenPunkte(liste, null);
    expect(new Set(punkte.map((p) => `${p.x}|${p.y}`)).size).toBe(5);
    punkte.forEach((p, i) => expect(p).toMatchObject(punkt(liste[i]!, liste)));
    for (const p of punkte) expect(`${p.y > 0.5 ? 'o' : 'u'}${p.x > 0.5 ? 'r' : 'l'}`).toBe(quadrant(liste[0]!));
  });
});
