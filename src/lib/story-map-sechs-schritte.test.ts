import { describe, expect, it } from 'vitest';
import { ohneAbgeschaltet } from '../components/abgeschaltet';
import { quellenAusGlob } from './begleiter';

// Pattons „Six Simple Steps to Story Mapping“ (Kap. 5) stehen im Foliensatz der Lehrveranstaltung; die Folie
// „sechs-schritte“ zeigt, dass die Übung „So geht ihr vor“ derselbe Ablauf ist.
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const seite = ohneAbgeschaltet(quellen['/innolab/methoden/story-map'] ?? '');
const folienIds = [...seite.matchAll(/<Folie\b[^>]*>(?:(?!<\/Folie>)[\s\S])*?<h2 id="([^"]+)"/g)].map((m) => m[1]);
const folie = (id: string) => {
  const a = seite.indexOf(`<h2 id="${id}">`);
  return a < 0 ? '' : seite.slice(seite.lastIndexOf('<Folie', a), seite.indexOf('</Folie>', a));
};
/** Was im Beamer zu sehen ist: die Folie ohne den Handout-Teil. */
const sichtbar = (f: string) => f.replace(/<div class="nur-handout">[\s\S]*?<\/div>/g, '');

const SCHRITTE = [
  'Frame the problem', 'Map the big picture', 'Explore',
  'Slice out a release strategy', 'Slice out a learning strategy', 'Slice out a development strategy',
];

describe('Story Map: Pattons sechs Schritte', () => {
  it('die Folie steht direkt vor „So geht ihr vor“', () => {
    expect(seite.length).toBeGreaterThan(1000);
    const i = folienIds.indexOf('vorgehen');
    expect(i).toBeGreaterThan(0);
    expect(folienIds[i - 1]).toBe('sechs-schritte');
    expect(folienIds[i - 2]).toBe('beispiel');
  });

  it('nennt alle sechs Schritte in Pattons Reihenfolge, je eine Zeile mit data-schritt', () => {
    const zeilen = [...sichtbar(folie('sechs-schritte')).matchAll(/<tr data-schritt><th>(\d)\. ([^<]+)<\/th>/g)].map((m) => `${m[1]}. ${m[2]}`);
    expect(zeilen).toStrictEqual(SCHRITTE.map((s, i) => `${i + 1}. ${s}`));
  });

  it('verlinkt auf der Folie die Experience Map (Schritt 2) und Schneiden (Schritt 6)', () => {
    const f = sichtbar(folie('sechs-schritte'));
    const zeile = (n: number) => f.match(new RegExp(`<tr data-schritt><th>${n}\\. [\\s\\S]*?</tr>`))?.[0] ?? '';
    expect(zeile(2)).toContain('<a href="/innolab/methoden/journey-map">');
    expect(zeile(6)).toContain('<a href="/innolab/methoden/schneiden">');
    expect(zeile(6)).toContain('Tag 5');
  });

  it('das Handout zitiert Kap. 5 und sagt, dass 4 und 5 zusammenzulegen eine Vereinfachung des Kurses ist', () => {
    const h = folie('sechs-schritte').match(/<div class="nur-handout">([\s\S]*?)<\/div>/)?.[1] ?? '';
    expect(h).toContain('„I can boil down the last four chapters into just six steps“');
    expect(h).toContain('({PATTON}, Kap. 5, Six Simple Steps to Story Mapping)');
    expect(h).toContain('Im Kurs legt ihr Schritt 4 und 5 in Slice 1 zusammen – das ist eine Vereinfachung des Kurses');
  });
});
