import { describe, expect, it } from 'vitest';
import { bloeckeAus, folienAus, hhmm, quellenAusGlob } from './begleiter';
import { KAFFEEBAR_BAUM_TAG_4 } from '../components/innolab-beispiel';

// Dieselbe Glob-Form wie in pages/innolab/begleiter.astro.
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const seite = (p: string) => quellen[p] ?? '';
const folie = (p: string, id: string) => {
  const q = seite(p);
  const a = q.indexOf(`<h2 id="${id}">`);
  return a < 0 ? '' : q.slice(a, q.indexOf('</Folie>', a));
};

// NDU-66 (Entscheidung Markus 25.11.2026): neuer Ablauf für Tag 4, Concept Story am Morgen, der Baum wächst um Lösungen und Tests.
describe('Tag 4: Ablauf vom 25.11.2026 (NDU-66)', () => {
  it('die Blöcke in Reihenfolge, mit Zeiten und Zielen', () => {
    const b = bloeckeAus(seite('/innolab/tag-4')).map((x) => `${hhmm(x.von)}–${hhmm(x.bis)} ${x.titel} ${x.href ?? ''}`.trim());
    expect(b).toStrictEqual([
      '09:00–09:10 Arbeitsfluss – ihr seid hier #arbeitsfluss',
      '09:10–09:40 Value Map & Fit (Nachholen von Tag 3) /innolab/methoden/value-map#vorgehen',
      '09:40–10:20 Story-Bogen + Concept Story /innolab/methoden/concept-story#story-bogen',
      '10:20–10:30 Pause',
      '10:30–10:50 Geschäftsmodell-Karten /innolab/methoden/geschaeftsmodell',
      '10:50–11:20 Experiment-Karte /innolab/methoden/experiment',
      '11:20–12:35 Story Map /innolab/methoden/story-map',
      '12:35–13:35 Mittagspause',
      '13:35–14:05 Usage Story /innolab/methoden/usage-story',
      '14:05–15:35 Prototyp-Spike /innolab/methoden/prototyp-spike',
      '15:35–15:45 Pause',
      '15:45–16:15 Agil & Scrum /innolab/methoden/scrum#agil',
      '16:15–17:15 Prototyp weiterbauen / Puffer',
      '17:15–17:30 Origin Story & Hausaufgabe #abschluss',
    ]);
  });

  it('der Baum wächst um Lösungen (Value Map) und Tests (Experiment-Karte), je 2 min im Block', () => {
    expect(seite('/innolab/tag-4')).toContain('<strong>Der Baum wächst heute um Lösungen und Tests.</strong>');
    // Je ein eigener Schritt (data-schritt) in der Vorgehen-Folie.
    expect(folie('/innolab/methoden/value-map', 'vorgehen')).toContain('<li data-schritt><strong>Euer Baum – Lösungen:</strong> Hängt eure drei Ideen als Lösungen unter den Stern in eurem Baum und markiert den Spitzenreiter. <Timer minuten={2} /></li>');
    const ex = folie('/innolab/methoden/experiment', 'vorgehen');
    expect(ex).toContain('<li data-schritt><strong>Euer Baum – Tests:</strong> Hängt die riskanteste Annahme und E1 unter den Spitzenreiter in eurem Baum; nach dem Spike kommt E2 dazu. <Timer minuten={2} /></li>');
    // 18 min Übung plus 12 min Theorie füllen den 30-Minuten-Block; der Titel ist die Summe der Timer.
    const timer = [...ex.matchAll(/<Timer minuten=\{(\d+)\} \/>/g)].reduce((a, m) => a + Number(m[1]), 0);
    expect(timer).toBe(18);
    expect(ex).toContain(`So geht ihr vor (${timer} min)</h2>`);
    // Kaffeebar: drei Ideen unter der Ziel-Chance, der Spitzenreiter markiert, darunter A5 mit E1.
    const loesungen = KAFFEEBAR_BAUM_TAG_4.kinder![0].kinder!;
    expect(loesungen.map((k) => k.t)).toStrictEqual(['Wartezeit-Anzeige an der Tür', 'Spitzenreiter: Im Gehen bestellen', 'Kaffeewagen am Bahnsteig']);
    expect(loesungen.filter((k) => k.kinder?.length).map((k) => k.kinder!.map((t) => t.t))).toStrictEqual([['A5 → E1: Aufsteller an der Hallentür, ab 10 von 30']]);
  });

  it('Story Map 75 min: Timer der Übung 47, davor 28; Agil & Scrum 30 min', () => {
    const sm = folie('/innolab/methoden/story-map', 'vorgehen');
    const timer = [...sm.matchAll(/<Timer minuten=\{(\d+)\} \/>/g)].reduce((a, m) => a + Number(m[1]), 0);
    expect(timer).toBe(47);
    expect(sm).toContain(`So geht ihr vor (${timer} min)</h2>`);
    expect(sm).toContain('Davor, zusammen 28 Minuten: Warm-up 8');
    expect(seite('/innolab/methoden/scrum')).toContain('Agil &amp; Scrum: 18 Minuten Theorie, 8 Minuten Kaffeebar gemeinsam, 4 Minuten Produktziele.');
  });

  it('keine alten Tag-4-Zeiten mehr (Pre-Mortem 9:20, Origin Story 17:10, Lego 15:50)', () => {
    const texte = ['/innolab/tag-3', '/innolab/tag-4', '/innolab/methoden/experiment', '/innolab/methoden/scrum'].map(seite);
    expect(texte.every((x) => x.length > 1000)).toBe(true);
    expect(texte.flatMap((x) => x.match(/um 9:20|Abschluss, 17:10|ab 15:50|14:45–15:40|15:50–17:10/g) ?? [])).toStrictEqual([]);
  });

  // Kursregel (Markus 12.11.): drei Produkte – keine Runden aufs eigene Produkt, sondern allein und 1:1 mit Markus.
  it('Story Map und Geschäftsmodell: keine Runde zu dritt aufs eigene Produkt, stattdessen allein und 1:1', () => {
    const sm = folie('/innolab/methoden/story-map', 'vorgehen');
    const gm = folie('/innolab/methoden/geschaeftsmodell', 'vorgehen');
    expect([sm, gm].flatMap((x) => x.match(/zu dritt|die anderen beiden (gehen|ergänzen)|die anderen fragen/gi) ?? [])).toStrictEqual([]);
    expect(seite('/innolab/methoden/geschaeftsmodell')).not.toContain('zu dritt sechs Karten');
    expect(sm).toContain('<li data-schritt><strong>Was ist, wenn …? Allein,</strong> Markus fragt im 1:1 nach. <Timer minuten={7} /></li>');
    expect(sm).toContain('<li data-schritt><strong>Slice 1 durchgehen, allein:</strong> mit „und dann“. <Timer minuten={7} /></li>');
    expect(gm).toContain('<li data-schritt><strong>Eine wählen, allein:</strong> die Idee, die am meisten verändert; Markus fragt im 1:1 nach – keine Killerphrasen. <Timer minuten={5} /></li>');
  });

  it('Tag-2-Abschluss nennt den Anfang von Tag 4 richtig: Arbeitsfluss, Value Map nachholen, dann Concept Story', () => {
    expect(seite('/innolab/tag-2/abschluss')).toContain('Tag 4 beginnt mit dem Arbeitsfluss und dem Nachholen von Value Map und Fit; dann schreibt ihr eure Concept Story.');
    // Tag 3 #faden: ohne Bezug „dort“, der Tag ist genannt (Code-Review #436).
    expect(seite('/innolab/tag-3')).toContain('(Experiment-Karte); an Tag 4 folgen auch Story Map, Usage Story und Prototyp.');
    expect(seite('/innolab/tag-3')).not.toContain('dort folgen auch');
    expect(seite('/innolab/methoden/experiment')).not.toContain('die „?“ von Tag 3 auf Miro');
  });

  // NDU-71: Um 9:00 blättert Markus im Beamer per → vom Ablauf direkt in den Arbeitsfluss, ohne Seitenwechsel.
  it('Beamer: nach dem Ablauf kommen die Folien Arbeitsfluss (Tag 4 hier, Tag 4 und 5–7 per →) und „Was bauen wir?“', () => {
    const q = seite('/innolab/tag-4');
    expect(folienAus('/innolab/tag-4', q).map((f) => f.id)).toStrictEqual(['arbeitsfluss', 'was-bauen-wir']);
    // Die erste Folie steht direkt hinter dem Ablauf, nicht erst nach #faden.
    const ablauf = q.indexOf('<h2 id="ablauf">');
    expect(ablauf).toBeGreaterThan(0);
    expect(q.slice(ablauf, q.indexOf('<Folie>')).match(/<h2 id="[^"]+"/g)).toStrictEqual(['<h2 id="ablauf"']);
    expect(folie('/innolab/tag-4', 'arbeitsfluss')).toContain('<Arbeitsfluss id="af-tag-4" hier={4} bis={4} aufdecken={3} />');
    // Letzte Folie ohne Schritte: Von #faden, #methoden oder #abschluss aus deckte → sonst erst unsichtbar ihre Schritte auf.
    expect(folie('/innolab/tag-4', 'was-bauen-wir')).toContain('<WasBauenWir schritte={false}>Heute Mittag steht euer Slice 1. In zwei Wochen wisst ihr, ob er hält.</WasBauenWir>');
    // „Heute Mittag“ nur auf Tag 4; der Arbeitsfluss ist tagneutral.
    expect(folie('/innolab/arbeitsfluss', 'was-bauen-wir')).toContain('<WasBauenWir>An Tag 4 entsteht euer Slice 1.');
    expect(seite('/innolab/arbeitsfluss')).not.toContain('Heute Mittag');
    // Im Handout nicht doppelt: der Plan nur in der Folie.
    expect(q.match(/<Arbeitsfluss\b/g)).toHaveLength(1);
  });
});
