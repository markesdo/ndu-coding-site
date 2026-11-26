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
      // Seit 26.11.2026 (Markus): Value Map vor „Was bauen wir?“ – erst dort ist der Spitzenreiter bestätigt, den „Slice 1 im Baum“ zeigt.
      '09:00–09:05 Arbeitsfluss – ihr seid hier #arbeitsfluss',
      '09:05–09:35 Value Map & Fit (Nachholen von Tag 3) /innolab/methoden/value-map#vorgehen',
      '09:35–09:40 Was bauen wir? #was-bauen-wir',
      '09:40–10:20 Story-Bogen + Concept Story /innolab/methoden/concept-story#story-bogen',
      '10:20–10:30 Pause',
      // Seit 26.11.2026 (Durchsicht): „Geschäftsmodell“ wie der Titel der Seite, nicht mehr „Geschäftsmodell-Karten“.
      '10:30–10:50 Geschäftsmodell /innolab/methoden/geschaeftsmodell',
      // Seit 26.11.2026 (Markus, Option a): Claude Pro gemeinsam als eigener Block, Story Map dafür 65 statt 75 min.
      '10:50–11:00 Claude Pro und Claude Code, gemeinsam /innolab/methoden/experiment#claude-pro-jetzt',
      '11:00–11:30 Experiment-Karte /innolab/methoden/experiment#annahmen-der-idee',
      '11:30–12:35 Story Map /innolab/methoden/story-map',
      '12:35–13:35 Mittagspause',
      '13:35–14:05 Usage Story /innolab/methoden/usage-story',
      '14:05–15:35 Prototyp-Spike /innolab/methoden/prototyp-spike',
      '15:35–15:45 Pause',
      '15:45–16:25 Agil & Scrum /innolab/methoden/scrum#foliensatz',
      '16:25–17:15 Prototyp weiterbauen / Puffer',
      '17:15–17:30 Origin Story & Hausaufgabe #abschluss',
    ]);
  });

  it('der Baum wächst um Lösungen (Value Map) und Tests (Experiment-Karte), je 2 min im Block', () => {
    expect(seite('/innolab/tag-4')).toContain('<strong>Der Baum wächst heute um Lösungen und Tests.</strong>');
    // Je ein eigener Schritt (data-schritt) in der Vorgehen-Folie.
    expect(folie('/innolab/methoden/value-map', 'vorgehen-fit')).toContain('<li data-schritt><strong>Euer Baum – Lösungen:</strong> Hängt eure drei Ideen als Lösungen unter den Stern in eurem Baum und markiert den Spitzenreiter. <Timer minuten={2} /></li>');
    const ex = folie('/innolab/methoden/experiment', 'vorgehen');
    expect(ex).toContain('<li data-schritt><strong>Euer Baum – Tests, auf Miro:</strong> riskanteste Annahme und E1 unter den Spitzenreiter. <Timer minuten={2} /></li>');
    // E2 kommt erst nach dem Spike – nicht auf der Folie um 11:30, nur im Handout.
    expect(ex.slice(0, ex.indexOf('<div class="nur-handout">'))).not.toContain('E2');
    expect(ex).toContain('nach dem Prototyp-Spike kommt E2 dazu');
    // 18 min Übung plus 12 min Theorie füllen den 30-Minuten-Block; der Titel ist die Summe der Timer.
    const timer = [...ex.matchAll(/<Timer minuten=\{(\d+)\} \/>/g)].reduce((a, m) => a + Number(m[1]), 0);
    expect(timer).toBe(18);
    expect(ex).toContain(`So geht ihr vor (${timer} min)</h2>`);
    // Kaffeebar: drei Ideen unter der Ziel-Chance, der Spitzenreiter markiert, darunter A5 mit E1.
    const loesungen = KAFFEEBAR_BAUM_TAG_4.kinder![0].kinder!;
    expect(loesungen.map((k) => k.t)).toStrictEqual(['Wartezeit-Anzeige an der Tür', 'Spitzenreiter: Im Gehen bestellen', 'Kaffeewagen am Bahnsteig']);
    expect(loesungen.filter((k) => k.kinder?.length).map((k) => k.kinder!.map((t) => t.t))).toStrictEqual([['A5 → E1: Aufsteller an der Hallentür, ab 10 von 30']]);
  });

  // Seit 26.11.2026 abends (Markus): Die Übung ist auf elf Schritt-Folien verteilt, je mit eigener Uhr; „vorgehen“ ist die
  // Übersicht ohne Timer. Das Warm-up macht jede*r selbst in sechs Schritten (28 statt 6 min) – der Block im Ablauf von
  // tag-4.astro (65 min) wächst im Tag-4-PR; hier nur Übung + davor als Summe der Seite.
  it('Story Map: Timer der Übung 42 auf den Schritt-Folien, davor 45 (28 + 8 + 9); Agil & Scrum 40 min', () => {
    const q = seite('/innolab/methoden/story-map');
    const schritte = [...q.matchAll(/<h2 id="(schritt-[a-z-]+)">/g)].map((m) => m[1]);
    expect(schritte).toHaveLength(11);
    const timer = schritte.reduce((a, id) => a + [...folie('/innolab/methoden/story-map', id).matchAll(/<Timer minuten=\{(\d+)\} \/>/g)].reduce((b, m) => b + Number(m[1]), 0), 0);
    expect(timer).toBe(42);
    const sm = folie('/innolab/methoden/story-map', 'vorgehen');
    expect(sm).toContain(`So geht ihr vor (${timer} min)</h2>`);
    expect(sm).not.toContain('<Timer');
    const davor = sm.match(/Davor, zusammen (\d+) Minuten: Warm-up (\d+) .*?Theorie (\d+), Kaffeebar gemeinsam (\d+)\./);
    expect(davor?.slice(1).map(Number)).toStrictEqual([45, 28, 8, 9]);
    expect(seite('/innolab/methoden/scrum')).toContain('Agil &amp; Scrum: 27 Minuten Theorie aus dem Foliensatz (20 Folien), 2 Minuten „Wo wir abweichen“, 7 Minuten Kaffeebar auf der Scrum-Karte (4 sortieren, 3 Auflösung), 4 Minuten Gleis-1-Express und Übergang.');
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
    expect(sm).toContain('<li data-schritt><strong>Kursregel:</strong> Jede*r arbeitet allein an der eigenen Map; Markus kommt ins 1:1. Eine Runde über die Maps der anderen gibt es nicht.</li>');
    expect(folie('/innolab/methoden/story-map', 'schritt-loecher')).toContain('<li data-schritt><strong>Markus kommt ins 1:1</strong> und stellt dieselben Fragen; ihr ergänzt, ohne zu verteidigen.</li>');
    expect(folie('/innolab/methoden/story-map', 'schritt-durchgehen')).toContain('<li data-schritt><strong>Erzählt Slice 1 allein</strong>');
    expect(gm).toContain('Jede*r arbeitet allein am eigenen Produkt; Markus fragt im 1:1 nach.');
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
    // Dahinter die drei Folien des Abschlusses (17:15, tag-4-ende.test.ts). → vom Arbeitsfluss zur Value Map, von dort zurück zu „Was bauen wir?“.
    expect(folienAus('/innolab/tag-4', q).map((f) => f.id)).toStrictEqual(['arbeitsfluss', 'was-bauen-wir', 'slice-im-baum', 'abschluss', 'origin-beispiel', 'hausaufgabe', 'ende-tag-4']);
    // Die erste Folie steht direkt hinter dem Ablauf, nicht erst nach #faden.
    const ablauf = q.indexOf('<h2 id="ablauf">');
    expect(ablauf).toBeGreaterThan(0);
    expect(q.slice(ablauf, q.search(/<Folie\b/)).match(/<h2 id="[^"]+"/g)).toStrictEqual(['<h2 id="ablauf"']);
    expect(folie('/innolab/tag-4', 'arbeitsfluss')).toContain('<Arbeitsfluss id="af-tag-4" hier={4} bis={4} aufdecken={3} />');
    // Letzte Folie ohne Schritte: Von #faden, #methoden oder #abschluss aus deckte → sonst erst unsichtbar ihre Schritte auf.
    expect(folie('/innolab/tag-4', 'was-bauen-wir')).toContain('schritte={false}');
    expect(folie('/innolab/tag-4', 'was-bauen-wir')).toContain('>Heute Mittag steht Slice 1 auf eurer Story Map, um 15:35 als Prototyp. In zwei Wochen wisst ihr, ob er hält.</WasBauenWir>');
    // „Heute Mittag“ nur auf Tag 4; der Arbeitsfluss ist tagneutral.
    expect(folie('/innolab/arbeitsfluss', 'was-bauen-wir')).toContain('<WasBauenWir>An Tag 4 entsteht euer Slice 1.');
    expect(seite('/innolab/arbeitsfluss')).not.toContain('Heute Mittag');
    // Im Handout nicht doppelt: der Plan nur in der Folie.
    expect(q.match(/<Arbeitsfluss\b/g)).toHaveLength(1);
  });
});
