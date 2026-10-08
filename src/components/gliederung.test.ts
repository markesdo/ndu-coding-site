import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { gliederung } from './gliederung';

const BEISPIEL = `
  <h2 id="ablauf">Ablauf</h2>
  <h2 id="uebung-1">Übung 1 · Erste eigene Änderungen <span class="pill uebung">60 min</span></h2>
  <h3 id="uebung-1-a">a) Verstehen, was da ist (10 min)</h3>
  <h3 id="uebung-1-c">c) Vage oder präzise – ein Raum-Experiment (10 min)</h3>
  <h3 id="supabase">a) Supabase-Projekt (gemeinsam, 15 min)</h3>
  <h3 id="uebung-1-f">f) Sichern</h3>
  <h3 id="check">Checkliste Übung 1</h3>
  <h3>b) Ohne id</h3>
  <h2>Ohne id</h2>
  <h2 id="werkstatt">Werkstatt</h2>
  <h3 id="peer">a) Peer-Review &amp; mehr</h3>
`;

describe('gliederung', () => {
  const g = gliederung(BEISPIEL);

  it('nimmt nur Überschriften mit id', () => {
    expect(g.map((a) => a.id)).toStrictEqual(['ablauf', 'uebung-1', 'werkstatt']);
    expect(g[1].schritte.map((s) => s.id)).toStrictEqual(['uebung-1-a', 'uebung-1-c', 'supabase', 'uebung-1-f']);
  });

  it('h2: Pille wird zur Dauer in der Leiste, nicht Teil des Titels', () => {
    expect(g[1].text).toBe('Übung 1 · Erste eigene Änderungen');
    expect(g[1].leiste).toBe('Übung 1 · Erste eigene Änderungen · 60 min');
    expect(g[0].leiste).toBe('Ablauf');
  });

  it('Schritte: Übungsnummer, kurzer Titel, Dauer', () => {
    expect(g[1].schritte[1].leiste).toBe('Übung 1 · c) Vage oder präzise · 10 min');
    expect(g[1].schritte[1].text).toBe('c) Vage oder präzise – ein Raum-Experiment (10 min)');
    expect(g[1].schritte[2].leiste).toBe('Übung 1 · a) Supabase-Projekt · 15 min');
    expect(g[1].schritte[3].leiste).toBe('Übung 1 · f) Sichern');
  });

  it('Schritte nur unter Übungen, keine Checklisten', () => {
    expect(g[2].schritte).toStrictEqual([]);
    expect(g[1].schritte.some((s) => s.text.startsWith('Checkliste'))).toBe(false);
  });
});

describe('die echten Tagesseiten', () => {
  for (const seite of ['tag-1', 'tag-2', 'tag-3', 'zwischenwoche']) {
    it(`${seite}: jede h2 hat eine id und kommt ins Inhaltsverzeichnis`, () => {
      const quelle = readFileSync(new URL(`../pages/${seite}.astro`, import.meta.url), 'utf8');
      const alleH2 = quelle.match(/<h2\b/g)?.length ?? 0;
      const g = gliederung(quelle);
      expect(g.length).toBe(alleH2);
      expect(new Set(g.flatMap((a) => [a.id, ...a.schritte.map((s) => s.id)])).size).toBe(
        g.reduce((n, a) => n + 1 + a.schritte.length, 0),
      );
    });
  }

  // Wer die Seite von oben nach unten liest, kommt an jedem Konzept vorbei, bevor die Übung dazu beginnt.
  it.each([
    ['tag-1', ['ablauf', 'konzept-1', 'konzept-2', 'uebung-1', 'konzept-3', 'uebung-2'], [1, 2, 3]],
    ['tag-2', ['quiz', 'konzept-4', 'uebung-3', 'konzept-5', 'uebung-4', 'konzept-6', 'uebung-5'], [4, 5, 6]],
    ['tag-3', ['ablauf', 'konzept-7', 'werkstatt-1', 'konzept-8', 'werkstatt-2', 'demos'], [7, 8]],
  ] as const)('%s: jedes Konzept steht vor seiner Übung, wie im Ablauf', (seite, reihe, konzepte) => {
    const quelle = readFileSync(new URL(`../pages/${seite}.astro`, import.meta.url), 'utf8');
    const ids = gliederung(quelle).map((a) => a.id);
    expect(ids.slice(ids.indexOf(reihe[0]), ids.indexOf(reihe.at(-1)!) + 1)).toStrictEqual(reihe);
    // Der Ablauf verlinkt die Konzepte auf ihren Platz auf der Seite, nicht direkt auf die Konzeptseite.
    for (const n of konzepte) {
      const zeilen = quelle.match(new RegExp(`type="konzept" title="Konzept ${n} [^"]*" href="[^"]*"`, 'g')) ?? [];
      expect(zeilen.length).toBeGreaterThan(0);
      for (const z of zeilen) expect(z).toMatch(new RegExp(`href="#konzept-${n}"$`));
    }
  });

  it('tag-1: alle Übungsschritte a)–f) sind verlinkbar', () => {
    const g = gliederung(readFileSync(new URL('../pages/tag-1.astro', import.meta.url), 'utf8'));
    const u1 = g.find((a) => a.id === 'uebung-1')!;
    expect(u1.schritte.map((s) => s.text[0])).toStrictEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });
});
