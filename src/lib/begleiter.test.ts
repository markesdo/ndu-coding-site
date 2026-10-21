import { describe, expect, it } from 'vitest';
import { MIRO_FRAMES } from '../components/miro-frames';
import { NOTIZEN } from '../data/begleiter';
import {
  TAG_1_SEITEN, folieZu, folienAus, layoutTitel, notizenMitFremdemFrame, notizenOhneFolie, pfadAusGlob, quellenAusGlob, seitenLabel, tagFolien,
} from './begleiter';

// Dieselbe Glob-Form wie in pages/innolab/begleiter.astro (vom Projektwurzel aus, unabhängig vom Ordner der Datei).
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);

const QUELLE = `
<Layout>
  <h2 id="ablauf">Ablauf</h2>
  <Folie>
    <h2 id="a">A</h2>
    <p class="folie-satz">Eins.</p>
    <Video id="yt-123" /><Checklist id="cl-1" />
  </Folie>
  <Folie>
    <h2 id="b">B <em>mit</em> &amp; Tag (60 min)</h2>
    <h3 id="uebung-1-c">Übung 1 c</h3>
    <div data-id="x" id="kein-anker"></div>
  </Folie>
  <h2 id="werkstatt">In der Werkstatt speichern</h2>
  <h3 id="pruefen">Prüfen</h3>
  <Folie>
    <h2 id="c">C</h2>
  </Folie>
</Layout>`;

describe('folienAus', () => {
  it('liest je <Folie> die h2-id und den bereinigten Titel; Unter-Anker nur aus h2/h3', () => {
    expect(folienAus('/innolab/tag-1', QUELLE).map(({ id, titel, unterIds }) => ({ id, titel, unterIds }))).toStrictEqual([
      { id: 'a', titel: 'A', unterIds: ['ablauf'] },
      { id: 'b', titel: 'B mit & Tag', unterIds: ['uebung-1-c', 'werkstatt', 'pruefen'] },
      { id: 'c', titel: 'C', unterIds: [] },
    ]);
  });
});

describe('pfadAusGlob', () => {
  it('macht aus dem Glob-Schlüssel den Seitenpfad', () => {
    expect(pfadAusGlob('../pages/innolab/tag-1.astro')).toBe('/innolab/tag-1');
    expect(pfadAusGlob('../pages/innolab/index.astro')).toBe('/innolab');
    expect(pfadAusGlob('../pages/innolab/tag-1/abschluss.astro')).toBe('/innolab/tag-1/abschluss');
    expect(pfadAusGlob('/src/pages/innolab/methoden/annahmen.astro')).toBe('/innolab/methoden/annahmen');
  });
});

describe('folieZu', () => {
  const folien = [...folienAus('/innolab/tag-1', QUELLE), ...folienAus('/innolab/methoden/annahmen', QUELLE)];
  it('findet die Folie zur h2-id', () => {
    expect(folieZu(folien, '/innolab/methoden/annahmen', 'b')).toBe(4);
  });
  it('ordnet einen Unter-Anker der umschließenden Folie zu', () => {
    expect(folieZu(folien, '/innolab/tag-1', 'uebung-1-c')).toBe(1);
  });
  it('Anker außerhalb jeder Folie → letzte Folie davor, vor allen Folien → erste', () => {
    expect(folieZu(folien, '/innolab/tag-1', 'werkstatt')).toBe(1);
    expect(folieZu(folien, '/innolab/methoden/annahmen', 'pruefen')).toBe(4);
    expect(folieZu(folien, '/innolab/tag-1', 'ablauf')).toBe(0);
  });
  it('leerer oder unbekannter Anker auf einer Tag-1-Seite → erste Folie dieser Seite', () => {
    expect(folieZu(folien, '/innolab/methoden/annahmen', '')).toBe(3);
    expect(folieZu(folien, '/innolab/tag-1', 'gibt-es-nicht')).toBe(0);
    expect(folieZu(folien, '/innolab/tag-1', 'yt-123')).toBe(0);
  });
  it('Seite außerhalb von Tag 1 → null', () => {
    expect(folieZu(folien, '/innolab/tag-3', 'x')).toBeNull();
    expect(folieZu(folien, '/innolab/tag-3', 'a')).toBeNull();
  });
});

describe('Seitennamen', () => {
  it('liest den Layout-Titel in allen Schreibweisen und löst Entitäten auf', () => {
    expect(layoutTitel('<Layout title="A &amp; B">')).toBe('A & B');
    expect(layoutTitel("<Layout title='Einfach'>")).toBe('Einfach');
    expect(layoutTitel('<Layout description="x" title={`Vorlage`}>')).toBe('Vorlage');
    expect(layoutTitel('<Layout title={"Doppelt"}>')).toBe('Doppelt');
    expect(layoutTitel('<Layout title={`Tag ${n}`}>')).toBeNull();
    expect(layoutTitel('<Layout title={titel}>')).toBeNull();
  });
  it('ohne lesbaren Titel: Name aus der Liste der Tag-1-Seiten', () => {
    expect(seitenLabel('/innolab/methoden/interview', '<Layout title={t}>')).toBe('Jobs to be Done & Mom Test');
  });
  it('alle sechs Seiten von Tag 1 haben einen Namen, keinen Pfad', () => {
    const namen = TAG_1_SEITEN.map((p) => seitenLabel(p, quellen[p] ?? ''));
    expect(namen.filter((n) => n.startsWith('/') || n === '')).toStrictEqual([]);
    expect(TAG_1_SEITEN.map((p) => layoutTitel(quellen[p] ?? ''))).not.toContain(null);
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
  it('jede Folie hat eine id und einen bereinigten Titel (ohne Tags, Entitäten und „(60 min)“)', () => {
    expect(folien.filter((f) => !f.id || !f.titel || /[<>]|&\w+;|\(\d+\s*min\)/.test(f.titel))).toStrictEqual([]);
    expect(folien.find((f) => f.pfad === '/innolab/methoden/problem-rahmen' && f.id === 'vorgehen')?.titel).toBe('So geht ihr vor');
  });
  it('Anker außerhalb der Folien gehören zur Folie davor (problem-rahmen #werkstatt, #pruefen → #vorgehen)', () => {
    const i = folien.findIndex((f) => f.pfad === '/innolab/methoden/problem-rahmen' && f.id === 'vorgehen');
    expect(folieZu(folien, '/innolab/methoden/problem-rahmen', 'werkstatt')).toBe(i);
    expect(folieZu(folien, '/innolab/methoden/problem-rahmen', 'pruefen')).toBe(i);
    expect(folieZu(folien, '/innolab/tag-1', 'ablauf')).toBe(0);
  });
  it('jede Notiz zeigt auf eine existierende Folie', () => {
    expect(notizenOhneFolie(folien, NOTIZEN)).toStrictEqual([]);
  });
  it('jede Tag-1-Folie hat eine Notiz mit mindestens einem live-Stichwort', () => {
    const ohne = folien.filter((f) => !NOTIZEN[f.pfad]?.[f.id]?.live?.some((s) => s.trim() !== ''));
    expect(ohne.map((f) => `${f.pfad}#${f.id}`)).toStrictEqual([]);
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
