import { describe, expect, it } from 'vitest';
import beispiel from '../../beispiele/annahmen.json';
import { annahmenPunkte } from './annahmen-punkte.js';
import { quadrant, type Annahme } from '../../schemas/index.js';

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

  it.each([
    ['hoch', 'keiner'], ['hoch', 'getan'], ['mittel', 'gesagt'], ['niedrig', 'getan'], ['niedrig', 'keiner'], ['mittel', 'erzaehlt'],
  ] as const)('fünf Annahmen in %s/%s: fünf verschiedene Punkte im selben Quadranten', (wichtig, beleg) => {
    const liste = [1, 2, 3, 4, 5].map((n) => annahme(n, { wichtig, beleg }));
    const q = quadrant(liste[0]!);
    const punkte = annahmenPunkte(liste, null);
    expect(new Set(punkte.map((p) => `${p.x}|${p.y}`)).size).toBe(5);
    for (const p of punkte) {
      expect(`${p.y > 0.5 ? 'o' : 'u'}${p.x > 0.5 ? 'r' : 'l'}`).toBe(q);
    }
  });
});
