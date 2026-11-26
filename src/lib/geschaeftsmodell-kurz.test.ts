import { describe, expect, it } from 'vitest';
import { METHODEN } from '../components/methoden';
import { NOTIZEN } from '../data/begleiter';
import { folienAus, notizSeiten, quellenAusGlob, uebungMinuten } from './begleiter';

// Dieselbe Glob-Form wie in pages/innolab/begleiter.astro.
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const PFAD = '/innolab/methoden/geschaeftsmodell';
const q = quellen[PFAD] ?? '';
// Bereiche [Anfang, Ende) jeder <Folie> im Quelltext.
const folienBereiche = (s: string) => [...s.matchAll(/<Folie\b[^>]*>/g)].map((m) => [m.index!, s.indexOf('</Folie>', m.index!)] as const);
const inFolie = (s: string, i: number) => folienBereiche(s).some(([a, b]) => i > a && i < b);

// Entscheidung Markus 26.11.2026: Geschäftsmodell gekürzt – keine Musterkarten-Runde mehr; der Block liefert die
// wirtschaftliche Annahme für die Annahmen-Map direkt vor der Experiment-Karte.
describe('Geschäftsmodell gekürzt (26.11.2026)', () => {
  it('Beamer-Folien in der neuen Reihenfolge', () => {
    expect(q.length).toBeGreaterThan(1000);
    expect(folienAus(PFAD, q).map((f) => f.id)).toStrictEqual(['warum-jetzt', 'vor-experiment', 'dreieck', 'modell', 'annahme', 'vorgehen', 'uebertrag']);
  });

  it('keine Karten-Folien: #muster und #beispiel gibt es nicht mehr, auch nicht innerhalb einer Folie', () => {
    expect(q.match(/id="(muster|beispiel|karten)"/g) ?? []).toStrictEqual([]);
    expect(q).not.toContain('Konfrontation:</strong>');
  });

  it('die Musterkarten stehen nur im Handout, hinter der letzten Folie', () => {
    const i = q.indexOf('<h2 id="musterkarten">');
    expect(i).toBeGreaterThan(0);
    expect(inFolie(q, i)).toBe(false);
    expect(q.lastIndexOf('<div', i)).toBe(q.lastIndexOf('<div class="nur-handout">', i));
    expect(i).toBeGreaterThan(folienBereiche(q).at(-1)![1]);
    // Die Kartentabelle hängt in diesem Abschnitt.
    const t = q.indexOf('{KARTEN.map(');
    expect(t).toBeGreaterThan(i);
    expect(inFolie(q, t)).toBe(false);
  });

  it('Übung: 10 min, Titel = Summe der Timer, ohne Karten', () => {
    const v = q.slice(q.indexOf('<h2 id="vorgehen">'), q.indexOf('</Folie>', q.indexOf('<h2 id="vorgehen">')));
    const timer = [...v.matchAll(/<Timer minuten=\{(\d+)\} \/>/g)].map((m) => Number(m[1]));
    expect(timer).toStrictEqual([4, 2, 2, 2]);
    expect(v).toContain('So geht ihr vor (10 min)</h2>');
    expect(v.match(/(?<!-)\bKarten?\b|Muster|Killerphrase/g) ?? []).toStrictEqual([]);
    expect(uebungMinuten(NOTIZEN[PFAD]?.vorgehen?.uebung?.dauer)).toBe(10);
  });

  it('Vorlage ohne Kartentabelle und ohne „Gewählt: [Muster]“, Kosten unter Wert?', () => {
    const v = q.slice(q.indexOf('<h2 id="vorlage">'), q.indexOf('</Prompt>'));
    expect(v.match(/Karte|Muster|Gewählt/g) ?? []).toStrictEqual([]);
    expect(v).toContain('- Wert? Ertrag: [wer zahlt wofür]; heute bezahlt die Kundschaft [...]\n  Kosten: [Posten], [Posten]');
    expect(v).toContain('Linie: [Outcome] führt zu [Impact], weil [...]');
  });

  it('Begleiter: jede Folie hat eine Notiz mit live-Stichworten, Seite zwischen Concept Story und Experiment', () => {
    const ohne = folienAus(PFAD, q).filter((f) => !NOTIZEN[PFAD]?.[f.id]?.live?.some((s) => s.trim() !== '')).map((f) => f.id);
    expect(ohne).toStrictEqual([]);
    const seiten = notizSeiten(NOTIZEN);
    expect(seiten.indexOf(PFAD)).toBe(seiten.indexOf('/innolab/methoden/concept-story') + 1);
    expect(seiten.indexOf('/innolab/methoden/experiment')).toBe(seiten.indexOf(PFAD) + 1);
  });

  it('Methode heißt „Geschäftsmodell“, Prüfliste ohne Muster', () => {
    const m = METHODEN.find((x) => x.slug === 'geschaeftsmodell')!;
    expect(m.name).toBe('Geschäftsmodell');
    expect(m.dauer).toBe(20);
    expect(m.pruefliste!.map((p) => p.id)).not.toContain('geschaeftsmodell-muster');
    expect([m.ki, ...m.pruefliste!.map((p) => p.text)].join(' ')).not.toMatch(/Muster|Karte/);
    expect(q).toContain('<Layout title="Geschäftsmodell">');
    expect(q).toContain('<h1>Geschäftsmodell</h1>');
  });

  it('kein Link mehr auf die gestrichenen Anker', () => {
    const treffer = Object.entries(quellen).flatMap(([p, s]) => (s.match(/geschaeftsmodell#(muster|karten|beispiel)\b/g) ?? []).map((x) => `${p}: ${x}`));
    expect(treffer).toStrictEqual([]);
  });
});
