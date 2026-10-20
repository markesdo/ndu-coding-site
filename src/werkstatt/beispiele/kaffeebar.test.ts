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
