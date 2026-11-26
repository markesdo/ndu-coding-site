import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Scrum from '../pages/innolab/methoden/scrum.astro';
import Tag4 from '../pages/innolab/tag-4.astro';
import { bloeckeAus } from './begleiter';
import { AGIL_SCRUM_FOLIEN, FOLIENSATZ_URL } from './foliensatz';

// Entscheidung Markus 26.11.2026: Agil & Scrum an Tag 4 nach Variante B – 20 Folien aus dem Foliensatz, dann auf der
// Site „Wo wir abweichen“, die Übung „Kaffeebar auf der Scrum-Karte“ (4 + 3 min) und das Beispiel als Auflösung.
const SRC = fileURLToPath(new URL('..', import.meta.url));
const dateien = (d: string): string[] => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? dateien(p) : /\.(astro|ts|tsx|js|mjs|md|json)$/.test(n) ? [p] : [];
});
const QUELLE_T4 = readFileSync(new URL('../pages/innolab/tag-4.astro', import.meta.url), 'utf8');
const QUELLE_SCRUM = readFileSync(new URL('../pages/innolab/methoden/scrum.astro', import.meta.url), 'utf8');
const href = `href="${FOLIENSATZ_URL.replace(/&/g, '&amp;')}"`;
const ausschnitt = (html: string, id: string) => {
  const a = html.indexOf(`<h2 id="${id}"`);
  return a < 0 ? '' : html.slice(a, html.indexOf('<h2 ', a + 1));
};

describe('Foliensatz: eine Adresse, 20 Folien', () => {
  it('die Adresse des Foliensatzes steht nur in lib/foliensatz.ts', () => {
    expect(FOLIENSATZ_URL).toMatch(/^https:\/\/docs\.google\.com\/presentation\/d\/[\w-]+\//);
    const id = FOLIENSATZ_URL.split('/d/')[1].split('/')[0];
    const mit = dateien(SRC).filter((p) => readFileSync(p, 'utf8').includes(id)).map((p) => p.slice(SRC.length));
    expect(mit).toStrictEqual(['lib/foliensatz.ts']);
  });

  it('Variante B: 20 Folien aus dem Teil Agile & Scrum (1–62), 61 gleich nach dem Wasserfall', () => {
    const folien = AGIL_SCRUM_FOLIEN.split(', ').flatMap((t) => {
      const [von, bis = von] = t.split('–').map(Number);
      return Array.from({ length: bis - von + 1 }, (_, k) => von + k);
    });
    expect(folien).toHaveLength(20);
    expect(new Set(folien).size).toBe(20);
    expect(folien.every((n) => n >= 1 && n <= 62)).toBe(true);
    expect(folien.slice(0, 2)).toStrictEqual([3, 61]);
  });
});

describe('Tag 4: Agil & Scrum 15:45–16:25 mit Foliensatz', () => {
  it('der Block dauert 40 Minuten, der Puffer schließt lückenlos an und endet 17:15', () => {
    const b = bloeckeAus(QUELLE_T4);
    const i = b.findIndex((x) => x.titel === 'Agil & Scrum');
    expect(b[i]).toMatchObject({ von: 15 * 60 + 45, bis: 16 * 60 + 25, href: '/innolab/methoden/scrum#abweichungen' });
    expect(b[i + 1]).toMatchObject({ titel: 'Prototyp weiterbauen / Puffer', von: b[i].bis, bis: 17 * 60 + 15 });
    // Die Aufteilung im Handout von „So geht ihr vor“ ergibt genau die Länge des Blocks.
    const satz = QUELLE_SCRUM.match(/<p class="nur-handout">Agil &amp; Scrum: ([^]*?)\. „Euer Produkt/)?.[1] ?? '';
    const summe = [...satz.matchAll(/(\d+) Minuten/g)].reduce((a, m) => a + Number(m[1]), 0);
    expect(summe).toBe(b[i].bis - b[i].von);
    expect(QUELLE_SCRUM).toContain('<strong>Agil &amp; Scrum (Tag 4, 15:45–16:25):</strong>');
  });

  it('gerendert: der Ablauf von Tag 4 verlinkt den Foliensatz im Block Agil & Scrum (Beamer und Handout)', async () => {
    const html = await (await AstroContainer.create()).renderToString(Tag4);
    const a = html.indexOf('data-zeit="15:45–16:25"');
    expect(a).toBeGreaterThan(0);
    const block = html.slice(a, html.indexOf('data-zeit="16:25–17:15"', a));
    expect(block).toContain(href);
    expect(block).toContain('Kaffeebar auf der Scrum-Karte');
  }, 60_000);
});

describe('Scrum-Seite: Zeiger auf den Foliensatz und Übung vor dem Beispiel', () => {
  it('gerendert: die Folie „foliensatz“ zeigt Link und Folien auf dem Beamer, nicht nur im Handout', async () => {
    const html = await (await AstroContainer.create()).renderToString(Scrum);
    const ids = [...html.matchAll(/<h2[^>]*\bid="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.slice(ids.indexOf('foliensatz'), ids.indexOf('foliensatz') + 2)).toStrictEqual(['foliensatz', 'agil']);
    const folie = ausschnitt(html, 'foliensatz');
    const beamer = folie.slice(0, folie.indexOf('nur-handout'));
    expect(beamer).toContain(href);
    expect(beamer).toContain(`Folien ${AGIL_SCRUM_FOLIEN}.`);
    // Auch „So geht ihr vor“ nennt den Foliensatz.
    expect(ausschnitt(html, 'vorgehen')).toContain(href);
  }, 60_000);

  it('gerendert: Abweichungen → Übung → Beispiel; die Übung mit Timer 4 + 3 und den Frames je Person', async () => {
    const html = await (await AstroContainer.create()).renderToString(Scrum);
    const ids = [...html.matchAll(/<h2[^>]*\bid="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.slice(ids.indexOf('abweichungen'), ids.indexOf('abweichungen') + 3)).toStrictEqual(['abweichungen', 'kaffeebar-sortieren', 'beispiel']);
    const q = QUELLE_SCRUM.slice(QUELLE_SCRUM.indexOf('<h2 id="kaffeebar-sortieren">'), QUELLE_SCRUM.indexOf('<h2 id="beispiel">'));
    expect(q).toContain('Übung: Kaffeebar auf der Scrum-Karte</h2>');
    expect([...q.matchAll(/<li data-schritt>[^]*?<Timer minuten=\{(\d+)\} \/><\/li>/g)].map((m) => Number(m[1]))).toStrictEqual([4, 3]);
    expect(q).toContain('Still sortieren');
    for (const n of [1, 2, 3]) expect(q).toContain(`Produkt ${n}`);
    expect(q).toContain('T4 · Scrum · Kaffeebar · Lösung');
  }, 60_000);
});
