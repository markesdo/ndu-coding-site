import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { NOTIZEN_CONCEPT_STORY } from '../data/begleiter/concept-story';
import { quellenAusGlob } from './begleiter';

// Dieselbe Glob-Form wie in pages/innolab/begleiter.astro.
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const seite = quellen['/innolab/methoden/concept-story'] ?? '';
const folie = (id: string) => {
  const a = seite.indexOf(`<h2 id="${id}">`);
  return a < 0 ? '' : seite.slice(a, seite.indexOf('</Folie>', a));
};

// Entscheidung 66 (21.11.): Story-Bogen verbessern, nichts kürzen.
describe('Story-Bogen (Entscheidung 66; seit 26.11. Theorie an Tag 4)', () => {
  it('Folie 1 hat das Warum fürs eigene Produkt, die drei Fragen und den Ausblick auf den Prototyp', () => {
    const f = folie('story-bogen');
    expect(f).toContain('<li data-schritt><strong>Warum für euch:</strong> Ihr wisst nicht, ob eure Idee gut ist? „That’s a story.“</li>');
    expect(f).toContain('<li data-schritt><strong>Drei Fragen:</strong> Was ist die Geschichte? Wer ist die Hauptfigur? Was ist ihr Ziel?</li>');
    expect(f).toContain('<li data-schritt><strong>Kursregel:</strong> Am Bogen prüft ihr danach, was in euren Prototyp kommt.</li>');
    expect(f).toContain('„What’s the story? Who is the hero? What is the hero’s goal?“ ({LICHAW}, Introduction vor Kap. 1, S. xiii–xiv)');
    expect(NOTIZEN_CONCEPT_STORY['story-bogen'].kern?.[0].quelle).toContain('Introduction (vor Kap. 1), S. xiii–xiv');
  });
  it('Lichaws Film ist ein Dokumentarfilm zum Jahresende im Master, kein Abschlussfilm', () => {
    const texte = [seite, JSON.stringify(NOTIZEN_CONCEPT_STORY)];
    expect(texte.every((x) => x.length > 1000)).toBe(true);
    expect(texte.flatMap((x) => x.match(/Abschlussfilm/g) ?? [])).toStrictEqual([]);
    expect(texte.map((x) => x.includes('Dokumentarfilm zum Jahresende'))).toStrictEqual([true, true]);
    expect(NOTIZEN_CONCEPT_STORY['story-bogen'].geschichte?.text).toContain('im Master ihren Dokumentarfilm zum Jahresende');
  });
  it('keine Kürz- oder Überspring-Hinweise, keine Uhrzeit mitten im Block; jede Folie mit Sprechzeit', () => {
    const notizen = Object.entries(NOTIZEN_CONCEPT_STORY);
    expect(notizen.flatMap(([id, n]) => n.live.filter((s) => /Wenn hinten|überspringen|streichen|16:30/.test(s)).map((s) => `${id}: ${s}`))).toStrictEqual([]);
    expect(JSON.stringify(NOTIZEN_CONCEPT_STORY)).not.toMatch(/Bei Bedarf, als zweites Beispiel/);
    // Ohne die Übung von Tag 4 (vorgehen) und das Handout (vorlage, pruefen): die Folien des Story-Bogens von Tag 3.
    const ids = [...seite.matchAll(/<h2 id="([^"]+)">/g)].map((m) => m[1]).filter((id) => !['vorlage', 'vorgehen', 'pruefen'].includes(id));
    expect(ids).toHaveLength(16);
    const minuten = ids.map((id) => {
      const z = NOTIZEN_CONCEPT_STORY[id]?.live.find((s) => s.startsWith('Zeit:') && s.includes('Sprechzeit ~'));
      return Number(z?.match(/Sprechzeit ~(\d+) min/)?.[1] ?? NaN);
    });
    expect(minuten.every((m) => m > 0)).toBe(true);
    // Der Kopfkommentar in concept-story.ts nennt genau diese Summe.
    const kopf = readFileSync('src/data/begleiter/concept-story.ts', 'utf8').split('export const')[0];
    expect(kopf).toContain(`rund ${minuten.reduce((a, m) => a + m, 0)} min`);
  });
  it('höchstens fünf live-Stichworte je Folie (typen.ts)', () => {
    const zuViele = Object.entries(NOTIZEN_CONCEPT_STORY).filter(([, n]) => n.live.length > 5).map(([id, n]) => `${id}: ${n.live.length}`);
    expect(zuViele).toStrictEqual([]);
  });
  it('mitten im Block eine Uhrprüfung: concept-story notiert die Ist-Zeit', () => {
    expect(NOTIZEN_CONCEPT_STORY['concept-story'].live[0]).toBe('Zeit: Ist-Zeit notieren; Sprechzeit ~2 min, mit der BOOM-Karte.');
  });
  it('die sechs Folien ohne Geschichte haben jetzt eine, mit Seite; eigene Worte als Kursformulierung', () => {
    for (const id of ['hauptfigur', 'drei-storys', 'concept-story', 'woher', 'ein-satz']) {
      const g = NOTIZEN_CONCEPT_STORY[id]?.geschichte;
      expect(g?.quelle, id).toMatch(/S\. \d+/);
      if (g?.text.includes('Für euch:')) expect(g.quelle, id).toContain('Kursformulierung');
    }
    expect(NOTIZEN_CONCEPT_STORY.hauptfigur.geschichte?.quelle).toContain('Goals Can Change, S. 135');
    // Seit der Durchsicht 26.11. ist hoehepunkt in concept-story aufgegangen; das halbe Telefongespräch steht dort als Frage.
    expect(NOTIZEN_CONCEPT_STORY['concept-story'].fragen?.[0].antwort).toContain('„Humans, it turns out, need closure.“');
    expect(NOTIZEN_CONCEPT_STORY.woher.geschichte?.quelle).toContain('fiktionalisiert (S. 38)');
    expect(NOTIZEN_CONCEPT_STORY.slack.geschichte).toBeUndefined();
  });
});

// NDU-66 (Entscheidung Markus 25.11.2026): Die Concept Story wird an Tag 4 geschrieben – 10 min Theorie, 30 min Übung.
describe('Tag 4: Concept Story schreiben (NDU-66)', () => {
  it('die Übung steht wieder auf der Seite: drei Schritte, Titel = Summe der Timer = 30 min, Vorlage und Prüfen', () => {
    const f = folie('vorgehen');
    const timer = [...f.matchAll(/<Timer minuten=\{(\d+)\} \/>/g)].map((m) => Number(m[1]));
    expect(timer).toStrictEqual([20, 5, 5]);
    expect(f).toContain('<h2 id="vorgehen">So geht ihr vor (30 min)</h2>');
    expect([...f.matchAll(/<li data-schritt><strong>([^<]+)<\/strong>/g)].map((m) => m[1])).toStrictEqual(['Sieben Stationen, allein:', 'Kursregel – Flach-Probe:', 'Festhalten:']);
    expect(f).toContain('<code>docs/STORYS.md</code> kommt die Story erst um 10:50');
    expect(seite).toContain('<ClaudePruefung slug="concept-story" />');
    expect(seite).toContain('<span class="eyebrow">Innolab · Tag 4 · Methode</span>');
    expect(NOTIZEN_CONCEPT_STORY.vorgehen?.uebung?.dauer).toBe('30 min (20 + 5 + 5)');
  });
  it('kein „nur Theorie“ mehr für Tag 4, keine Erzählrunde zu den eigenen Produkten', () => {
    const texte = [seite, JSON.stringify(NOTIZEN_CONCEPT_STORY)];
    expect(texte.flatMap((x) => x.match(/schreibt ihr an diesem Tag nicht|eine eigene Story schreibt ihr heute nicht|dafür gibt es dort keinen Block|Erzählen, reihum/g) ?? [])).toStrictEqual([]);
    expect(folie('vorgehen')).toContain('Eine Runde, in der ihr einander eure Storys erzählt, gibt es nicht');
  });
});

// Fable-Durchsicht der Theorie (26.11.2026): Reihenfolge für den Beamer, iPhone-Strang in vier Folien, Kursregeln benannt,
// Übung auf Miro statt in docs/STORYS.md.
describe('Concept Story klar im Beamer (Durchsicht 26.11.)', () => {
  const reihenfolge = [...seite.matchAll(/<h2 id="([^"]+)">/g)].map((m) => m[1]);
  const lis = (id: string) => [...folie(id).matchAll(/<li data-schritt><strong>([^<]+)<\/strong>/g)].map((m) => m[1]);

  it('Folien in der neuen Reihenfolge: concept-story vor flach, hoch-lehre nach hoch, drei-storys als Ausblick nach ein-satz', () => {
    expect(reihenfolge).toStrictEqual([
      'story-bogen', 'facetime', 'stationen', 'hauptfigur', 'pinocchio', 'a-mal-b', 'concept-story', 'flach', 'hoch',
      'hoch-lehre', 'baut-mit', 'slack', 'beispiel', 'woher', 'ein-satz', 'drei-storys', 'vorgehen', 'vorlage', 'pruefen',
    ]);
    // Der Begleiter folgt derselben Reihenfolge, ohne Notiz zu einer Folie, die es nicht gibt.
    expect(Object.keys(NOTIZEN_CONCEPT_STORY)).toStrictEqual(reihenfolge.filter((id) => !['vorlage', 'pruefen'].includes(id)));
  });

  it('hoehepunkt ist in concept-story aufgegangen: keine Folie, keine Notiz, kein Link mehr', () => {
    const alle = Object.values(quellen).join('\n');
    expect(alle.length).toBeGreaterThan(100000);
    expect(alle.match(/id="hoehepunkt"|concept-story#hoehepunkt/g) ?? []).toStrictEqual([]);
    expect(NOTIZEN_CONCEPT_STORY).not.toHaveProperty('hoehepunkt');
    expect(lis('concept-story')).toStrictEqual(['Anfang', 'Krise = die Konkurrenz:', 'Höhepunkt = euer Wertversprechen:', 'Schluss']);
  });

  it('hoch erzählt die Figur, hoch-lehre zieht die Lehre – mit Kursregel', () => {
    expect(folie('hoch')).toContain('<h2 id="hoch">Dieselbe Figur, jetzt mit Bogen</h2>');
    expect(lis('hoch')).toStrictEqual(['Anfang wie zuvor', 'Krise:', 'Höhepunkt:', 'Danach:']);
    expect(folie('hoch')).not.toContain(' hochkant');
    expect(lis('hoch-lehre')).toStrictEqual(['Niemand hatte 3-in-1 verlangt:', 'Der Linie fehlen zwei Stationen:', 'Zwei Fragen von Lichaw:', 'Kursregel:']);
    expect(folie('hoch-lehre')).toContain('<li data-schritt><strong>Kursregel:</strong> Schreibt beide auf. Ist eure Story die Linie, fehlt die Krise.</li>');
    expect(folie('hoch-lehre')).toContain('Dass ihr beide nebeneinanderlegt, ist eine Kursregel');
  });

  it('baut-mit: Kette Krise → Höhepunkt → Anforderung → Gebaut, letzte Zeile als Kursregel, keine eigene Begründung', () => {
    const f = folie('baut-mit');
    expect([...f.matchAll(/\{ t: '([^']+)'/g)].map((m) => m[1])).toStrictEqual(['Krise', 'Höhepunkt', 'Anforderung', 'Gebaut']);
    expect(f).toContain('hervor={[3]}');
    expect(lis('baut-mit').at(-1)).toBe('Kursregel:');
    expect(f).not.toContain('Für euch:');
    expect(f).not.toContain('sonst wäre der Höhepunkt');
    expect(f).toContain('Warum Kopieren und Einfügen die Story nicht stützte, führt Lichaw nicht aus.');
  });

  it('Kursregel-Etiketten: Flach-Probe in beispiel und vorgehen, Zeilen 6 und 7 in woher', () => {
    expect(folie('beispiel')).toContain('<p data-schritt><strong>Kursregel – Flach-Probe:</strong>');
    expect(lis('vorgehen')[1]).toBe('Kursregel – Flach-Probe:');
    const zeilen = folie('woher').split('<tr data-schritt>').slice(1);
    expect(zeilen.map((z) => z.includes('(Kursregel)'))).toStrictEqual([false, false, false, false, false, true, true]);
    expect(folie('woher')).toContain('Kap. 8, Goals Are Measurable, S. 135');
  });

  it('Übung auf Miro: Frames der Kaffeebar und je Produkt, docs/STORYS.md erst beim Übertrag', () => {
    const f = folie('vorgehen');
    expect(f).toContain('<MiroFrame name="T4 · 0 · Concept Story · Kaffeebar" />');
    for (const n of [1, 2, 3]) expect(f).toContain(`<MiroLink name="T4 · 0 · Concept Story · Produkt ${n}">Produkt ${n}</MiroLink>`);
    expect(folie('beispiel')).toContain('<MiroFrame name="T4 · 0 · Concept Story · Kaffeebar" />');
    // Wortlaut wie auf dem Frame: Stationen „1 Exposition“ … „7 Ende“, Feld „Flach-Probe (Kursregel)“.
    expect(f).toContain('in die Stickies unter „1 Exposition“ bis „7 Ende“');
    expect(f).toContain('ins Feld „Flach-Probe“ unten links');
    expect(f).not.toContain('Vorlage in <code>docs/STORYS.md</code>');
    expect(seite).toContain('Das Format für die Übertragung um 10:50');
    expect(NOTIZEN_CONCEPT_STORY.vorgehen.miro?.frame).toBe('T4 · 0 · Concept Story · Kaffeebar');
  });
});
