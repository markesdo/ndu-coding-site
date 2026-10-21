import { describe, expect, it } from 'vitest';
import { MIRO_FRAMES } from '../components/miro-frames';
import { NOTIZEN } from '../data/begleiter';
import { TAG_1_SEITEN, folieZu, folienAus, notizenMitFremdemFrame, notizenOhneFolie, pfadAusGlob, tagFolien } from './begleiter';

const seiten = import.meta.glob('../pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const quellen = Object.fromEntries(Object.entries(seiten).map(([k, v]) => [pfadAusGlob(k), v]));

const QUELLE = `
<Layout>
  <h2 id="ablauf">Ablauf</h2>
  <Folie>
    <h2 id="a">A</h2>
    <p class="folie-satz">Eins.</p>
  </Folie>
  <h2 id="werkstatt">Kein Folie</h2>
  <Folie>
    <h2 id="b">B <em>mit</em> &amp; Tag</h2>
    <h3 id="uebung-1-c">Übung 1 c</h3>
  </Folie>
</Layout>`;

describe('folienAus', () => {
  it('liest je <Folie> die h2-id, den Titel ohne Tags und die weiteren ids im Block', () => {
    expect(folienAus('/innolab/tag-1', QUELLE)).toStrictEqual([
      { pfad: '/innolab/tag-1', id: 'a', titel: 'A', unterIds: [] },
      { pfad: '/innolab/tag-1', id: 'b', titel: 'B mit & Tag', unterIds: ['uebung-1-c'] },
    ]);
  });
});

describe('pfadAusGlob', () => {
  it('macht aus dem Glob-Schlüssel den Seitenpfad', () => {
    expect(pfadAusGlob('../pages/innolab/tag-1.astro')).toBe('/innolab/tag-1');
    expect(pfadAusGlob('../pages/innolab/index.astro')).toBe('/innolab');
    expect(pfadAusGlob('../pages/innolab/tag-1/abschluss.astro')).toBe('/innolab/tag-1/abschluss');
  });
});

describe('folieZu', () => {
  const folien = [...folienAus('/innolab/tag-1', QUELLE), ...folienAus('/innolab/methoden/annahmen', QUELLE)];
  it('findet die Folie zur h2-id', () => {
    expect(folieZu(folien, '/innolab/methoden/annahmen', 'b')).toBe(3);
  });
  it('ordnet einen Unter-Anker der umschließenden Folie zu', () => {
    expect(folieZu(folien, '/innolab/tag-1', 'uebung-1-c')).toBe(1);
  });
  it('leerer oder unbekannter Anker auf einer Tag-1-Seite → erste Folie dieser Seite', () => {
    expect(folieZu(folien, '/innolab/methoden/annahmen', '')).toBe(2);
    expect(folieZu(folien, '/innolab/tag-1', 'werkstatt')).toBe(0);
  });
  it('Seite außerhalb von Tag 1 → null', () => {
    expect(folieZu(folien, '/innolab/tag-3', 'x')).toBeNull();
    expect(folieZu(folien, '/innolab/tag-3', 'a')).toBeNull();
  });
});

describe('Folien von Tag 1 (echte Seiten)', () => {
  const folien = tagFolien(quellen);
  it('alle Seiten des Tages in der Tagesreihenfolge, 52 Folien', () => {
    expect([...new Set(folien.map((f) => f.pfad))]).toStrictEqual(TAG_1_SEITEN);
    expect(folien).toHaveLength(52);
    expect(folien[0].pfad).toBe('/innolab/tag-1');
    expect(folien.at(-1)!.pfad).toBe('/innolab/tag-1/abschluss');
  });
  it('jede Folie hat eine id und einen Titel', () => {
    expect(folien.filter((f) => !f.id || !f.titel)).toStrictEqual([]);
  });
  it('jede Notiz zeigt auf eine existierende Folie', () => {
    expect(notizenOhneFolie(folien, NOTIZEN)).toStrictEqual([]);
  });
  it('erkennt eine Notiz ohne Folie', () => {
    expect(notizenOhneFolie(folien, { '/innolab/tag-1': { gibtsnicht: { live: ['x'] } } })).toStrictEqual(['/innolab/tag-1#gibtsnicht']);
  });
});

describe('Miro-Frames in den Notizen', () => {
  it('jeder genannte Frame existiert auf dem Team-Board', () => {
    expect(notizenMitFremdemFrame(NOTIZEN, MIRO_FRAMES)).toStrictEqual([]);
  });
  it('erkennt einen unbekannten Frame-Namen', () => {
    const notizen = {
      '/innolab/tag-1': {
        a: { live: ['x'], miro: { frame: 'T1 · 1 · Experience Map', schritte: ['ok'] } },
        b: { live: ['x'], miro: { frame: 'T1 · 9 · Gibt es nicht', schritte: ['falsch'] } },
        c: { live: ['x'], miro: { schritte: ['ohne Frame'] } },
      },
    };
    expect(notizenMitFremdemFrame(notizen, MIRO_FRAMES)).toStrictEqual(['/innolab/tag-1#b: T1 · 9 · Gibt es nicht']);
  });
});
