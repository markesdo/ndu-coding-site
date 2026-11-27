import { describe, expect, it } from 'vitest';
import { NOTIZEN } from '../data/begleiter';

// Story Map, Tag 4 (Markus 27.11.2026): Die Folien #warum („Warum eine Map und keine Liste“) und #lernen („Der erste
// Slice: laufen und lernen“) brauchen im Begleiter mehr Kontext aus Patton (EPUB, Kapitel + Abschnitt): Geschichte,
// Kernzitate, Verständnisfrage, Fragen mit Kursübertrag. Außerdem heißt es im Kurs „der Backbone“, nicht „das“.
const n = NOTIZEN['/innolab/methoden/story-map'];
const PATTON = 'Jeff Patton, User Story Mapping (2014)';

describe('Story Map: Begleiter mit Kontext aus Patton', () => {
  it('#warum: Garys Geschichte ganz, mit seiner Antwort wörtlich', () => {
    const g = n.warum.geschichte;
    expect(g?.quelle).toBe(`${PATTON}, Kap. 1, Gary and the Tragedy of the Flat Backlog bis Explore Details and Options; Kap. 14, The secret to prioritization`);
    for (const s of ['Mad Mimi', '„music industry marketing interface“', 'Oprah-Winfrey-Show', 'auflisten, priorisieren', '„Nearly none of it', 'the vision that would have taken me years to reach', 'I wouldn’t have started there at all.“', 'per E-Mail']) {
      expect(g?.text, s).toContain(s);
    }
  });

  it('#warum: Kern zu flacher Liste, Map und gemeinsamem Verständnis, jeweils mit Kapitel und Abschnitt', () => {
    const kern = n.warum.kern ?? [];
    expect(kern).toHaveLength(8);
    expect(kern.every((k) => k.quelle.startsWith(`${PATTON}, `) && /(Kap\. \d+|Read This First), /.test(k.quelle))).toBe(true);
    const text = kern.map((k) => k.text).join('\n');
    for (const s of ['But it can create some big problems.', 'And there were a lot of holes in Gary’s big picture.', 'without saying a word I’ve indicated sequence', 'The top to bottom is about the details.', 'You can’t plan a release until you can see it all together.', 'The goal is to minimize the amount we build.', 'Shared documents aren’t shared understanding.']) {
      expect(text, s).toContain(s);
    }
  });

  it('#warum: Verständnisfrage und drei Fragen, die Übertragung als Kurs markiert', () => {
    expect(n.warum.verstaendnis?.frage).toBe('Was zeigt die Map, das eine priorisierte Liste nicht zeigen kann?');
    expect(n.warum.verstaendnis?.falsch).toMatch(/^„Die Map ist einfach übersichtlicher\.“/);
    expect(n.warum.fragen?.map((f) => f.frage)).toStrictEqual(['Ist eine Liste dann falsch?', 'Ich baue allein und habe alles im Kopf – brauche ich das?', 'Was hat das mit unserem Produkt zu tun?']);
    expect(n.warum.fragen?.[0].antwort).toContain('„Eric’s backlog is organized as a story map“');
    expect(n.warum.fragen?.[2].antwort).toMatch(/^Kursübertrag, nicht aus dem Buch: .*Tag 5 .*Slice 1/);
  });

  it('#lernen: Skelett, Eröffnung, kein Release, Riskantes zuerst, MVPe – mit richtigem Abschnitt', () => {
    const kern = n.lernen.kern ?? [];
    expect(kern).toHaveLength(7);
    expect(kern[0].quelle).toBe(`${PATTON}, Kap. 3, Really Minimize Your Experiments`);
    const paare = kern.map((k) => [k.text.slice(0, 40), k.quelle.replace(`${PATTON}, `, '')]);
    expect(paare.slice(1)).toStrictEqual([
      ['Was der erste Slice ist: „The first slic', 'Kap. 4, Plan to Build Piece by Piece'],
      ['Wozu: „They can learn a lot about the te', 'Kap. 4, Plan to Build Piece by Piece'],
      ['Eröffnung: „Focus on the essential featu', 'Kap. 4, Opening-, Mid-, and Endgame Strategy'],
      ['Kein Release: „Each of these slices isn’', 'Kap. 4, Don’t Release Each Slice'],
      ['Riskantes zuerst: Eric und sein Team „pu', 'Kap. 4, It’s All About Risk'],
      ['Lernen als Ziel: „Treat every release as', 'Kap. 3, How to Do It the Wrong Way; Validated Learning'],
    ]);
    expect(kern.map((k) => k.text).join('\n')).toContain('functional walking skeleton');
  });

  it('#lernen: Workiva-Geschichte, Verständnisfrage, drei Fragen mit Kursübertrag zu Slice 1', () => {
    expect(n.lernen.geschichte?.text).toMatch(/^Aaron und Mike von Workiva .*drei Slices.*„would howl“/s);
    expect(n.lernen.verstaendnis?.antwort).toContain('„Build just enough to see the product working end-to-end“');
    expect(n.lernen.fragen?.map((f) => f.frage)).toStrictEqual(['Ist das laufende Skelett schon das MVP?', 'Warum nicht ein Teil fertig bauen und dann das nächste?', 'Was heißt das für unseren Slice 1 heute?']);
    expect(n.lernen.fragen?.[2].antwort).toMatch(/^Kursübertrag, nicht aus dem Buch: .*Usage Story.*Prototyp auf Papier.*Issues/);
  });
});

describe('Kurs: „der Backbone“', () => {
  const dateien = import.meta.glob('/src/**/*.{astro,ts,tsx,md,mdx,json}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
  it('nirgends in src „das Backbone“', () => {
    expect(Object.keys(dateien).length).toBeGreaterThan(50);
    const funde = Object.entries(dateien).flatMap(([pfad, text]) => [...text.matchAll(/\b[Dd]as Backbone\b/g)].map((m) => `${pfad}: ${text.slice(Math.max(0, m.index - 30), m.index + 20)}`));
    expect(funde).toStrictEqual([]);
  });
});
