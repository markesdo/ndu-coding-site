import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Folie „Kaffeebar: drei Fragen, live“ (baum.astro): Im Beamer deckt jeder Schritt eine Zeile auf. Die CSS-Regel
// `td.antwort[data-schritt]:not(.gezeigt) ~ td.antwort` versteckt nur Antwortzellen NACH der Schrittzelle – darum muss
// der Schritt in jeder Zeile auf der ersten Antwortzelle sitzen und darf auf keiner anderen stehen.
const quelle = readFileSync(new URL('../pages/innolab/methoden/baum.astro', import.meta.url), 'utf8');
const tabelle = quelle.slice(quelle.indexOf('class="drei-fragen"'), quelle.indexOf('</table>', quelle.indexOf('class="drei-fragen"')));
const zeilen = [...tabelle.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((m) => m[1]).filter((z) => z.includes('class="antwort'));

describe('drei Fragen: Zeile für Zeile aufdecken', () => {
  it('hat fünf Zeilen mit Antworten', () => {
    expect(zeilen).toHaveLength(5);
  });
  it.each(zeilen.map((z, i) => [i + 1, z]))('Zeile %i: Schritt nur auf der ersten Antwortzelle', (_, zeile) => {
    const zellen = [...(zeile as string).matchAll(/<td\b[^>]*class="antwort[^"]*"[^>]*>/g)].map((m) => m[0]);
    expect(zellen.map((z) => z.includes('data-schritt'))).toStrictEqual(zellen.map((_, i) => i === 0));
  });
});
