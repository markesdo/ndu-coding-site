// Das Kaffeebar-Beispiel hängt über Zitat-IDs zusammen: Was eine Kursseite oder ein anderes Beispiel zitiert (I3-1),
// muss es in den Beispiel-Interviews geben. Themen-IDs (T1) gibt es seit der Synthese nach Torres nicht mehr.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import interviews from './interviews.json';

const SEITEN = 'src/pages/innolab';
const BEISPIELE = 'src/werkstatt/beispiele';

const dateien = (ordner: string, endung: string): string[] =>
  readdirSync(ordner, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith(endung)).map((f) => join(ordner, f));

const quellen = [...dateien(SEITEN, '.astro'), ...dateien(BEISPIELE, '.json').filter((f) => !f.endsWith('interviews.json')), 'src/components/innolab-beispiel.ts'];
const vorhanden = new Set(interviews.interviews.flatMap((iv) => iv.zitate.map((z) => z.id)));

describe('Kaffeebar-Beispiel', () => {
  it('jede zitierte Zitat-ID steht in den Beispiel-Interviews', () => {
    const fehlend = quellen.flatMap((f) =>
      [...readFileSync(f, 'utf8').matchAll(/\bI[1-9][0-9]*-[1-9][0-9]*\b/g)].map((m) => m[0]).filter((id) => !vorhanden.has(id)).map((id) => `${f}: ${id}`),
    );
    expect(fehlend).toStrictEqual([]);
  });

  it('keine Themen-IDs mehr (Miro-Frames wie „T1 · 3“ ausgenommen)', () => {
    const treffer = quellen.flatMap((f) =>
      [...readFileSync(f, 'utf8').matchAll(/(?<![\w}])T[1-9][0-9]*\b(?! ·)/g)].map((m) => `${f}: ${m[0]}`),
    );
    expect(treffer).toStrictEqual([]);
  });
});

describe('Kaffeebar-Beispiel: Belege der Chance „mitbestellen“', () => {
  // I5-4 trägt „für Kolleg*innen“, I5-6 „ohne lange zu warten“ – Werkstatt-Beispiel und Baum-Seite nennen beide.
  const chance = interviews.interviews.flatMap((iv) => iv.chancen ?? []).find((c) => c.text.includes('Kolleg*innen mitbestellen'));
  it('Werkstatt-Beispiel belegt sie mit I5-4 und I5-6', () => {
    expect(chance?.belege).toStrictEqual(['I5-4', 'I5-6']);
  });
  it('die Baum-Seite nennt dieselben IDs', () => {
    const seite = readFileSync('src/pages/innolab/methoden/baum.astro', 'utf8');
    const treffer = [...seite.matchAll(/mitbestellen“? \((I[^)]*)\)/g)].map((m) => m[1]);
    expect(treffer.length).toBeGreaterThan(0);
    expect(treffer.every((ids) => ids === 'I5-4, I5-6')).toBe(true);
  });
});

describe('Kaffeebar-Beispiel: Chance „Wenn ich anstehe, reicht mir die Zeit nicht.“', () => {
  // Kein Zitat in I2-2, I3-4, I4-2 erzählt vom Zug. Dass die Zeit nicht reicht, sagt I4 fast wörtlich (I4-1);
  // I2-2 (Blick auf die Uhr) und I3-4 (Regel für die Schlange) stützen es.
  // „Ich will den Zug nicht verpassen“ bleibt als Bedürfnis hinter dem Tag-1-Wunsch „per App vorbestellen“.
  it('die Baum-Seite belegt sie überall mit I2-2, I3-4, I4-1', () => {
    const seite = readFileSync('src/pages/innolab/methoden/baum.astro', 'utf8');
    const treffer = [...seite.matchAll(/(?:reicht mir die Zeit nicht\.?“?|Alle drei Zitate) \((I[^)]*)\)/g)].map((m) => m[1]);
    expect(treffer.length).toBeGreaterThan(0);
    expect(treffer.filter((ids) => ids !== 'I2-2, I3-4, I4-1')).toStrictEqual([]);
  });
  it('Kursseiten und Notizen zu Baum, Ziel-Chance und HMW belegen sie mit I4-1, nicht I4-2', () => {
    // Die Belegreihe der Chance (Baum, Ulwick-Sätze, „gegen …“ bei der Größe, Nachbar-Chance bei HMW).
    const orte = ['baum', 'ziel-chance', 'hmw'].flatMap((n) => [`${SEITEN}/methoden/${n}.astro`, `src/data/begleiter/${n}.ts`]);
    const treffer = orte.flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/I2-2, I3-4, I4-\d+/g)].map((m) => `${f}: ${m[0]}`));
    expect(treffer.length).toBeGreaterThanOrEqual(9);
    expect(treffer.filter((t) => !t.endsWith('I4-1'))).toStrictEqual([]);
  });
  it('die alte Fassung „verpasse ich den/meinen Zug“ steht nirgends mehr', () => {
    const orte = [...dateien(SEITEN, '.astro'), ...dateien('src/data/begleiter', '.ts'), ...dateien('src/components', '.ts'), ...dateien(BEISPIELE, '.json')];
    const treffer = orte.filter((f) => /verpasse ich (den|meinen) Zug/.test(readFileSync(f, 'utf8')));
    expect(treffer).toStrictEqual([]);
  });
});
