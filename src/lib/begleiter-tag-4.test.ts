import { describe, expect, it } from 'vitest';
import { NOTIZEN } from '../data/begleiter';
import { folienAus, quellenAusGlob } from './begleiter';
import { KAFFEEBAR_BAUM_TAG_4 } from '../components/innolab-beispiel';

// Tag 4 (28.11.2026): Jede Folie der Methodenseiten, die der Begleiter an Tag 4 zeigt, hat eine Notiz mit mindestens
// einem live-Stichwort, und jede Notiz zeigt auf eine Folie dieser Seite (keine Reste gestrichener Folien, z. B. der
// Origin Story, die seit 26.11. im Abschluss von Tag 4 steht). Abgeschaltete Folien (Lego4Scrum, „Euer Produkt in
// einem Satz“) zählt folienAus nicht mit. scrum enthält auch die Tag-5-Folien team, dod, vorgehen, uebertrag.
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);

const SEITEN: Record<string, number> = {
  // Tagesseite: 9:00 Arbeitsfluss, 9:35 Was bauen wir? und Slice 1 im Baum, 17:15 Abschluss mit Beispiel, Hausaufgabe, Ende.
  '/innolab/tag-4': 7,
  // Seit 26.11.2026 nachts ohne die beiden Claude-Pro-Folien (jetzt auf tag-5).
  // Seit 27.11.2026 abends mit ein-schritt-fuenf-fragen (ein Kaffeebar-Schritt durch alle fünf Fragen).
  '/innolab/methoden/experiment': 20,
  // Story Map seit 26.11.2026 abends: Warm-up in sechs Schritten, Begriffe, Theorie, Kaffeebar, Übung in elf Schritt-Folien.
  '/innolab/methoden/story-map': 31,
  '/innolab/methoden/usage-story': 6,
  // Seit 26.11.2026 nachts Prototyp auf Papier: ohne Zeitbox, Bauen und Ansehen.
  '/innolab/methoden/prototyp-spike': 14,
  // Seit 27.11.2026 ohne die sechs Theorie-Folien agil … fertig (Nachlese nur im Handout, #nachlese).
  '/innolab/methoden/scrum': 10,
};

describe('Begleiter Tag 4: Notizen decken die Folien', () => {
  for (const [pfad, anzahl] of Object.entries(SEITEN)) {
    const folien = folienAus(pfad, quellen[pfad] ?? '');
    it(`${pfad}: ${anzahl} Folien, jede mit live-Stichwort`, () => {
      expect(folien).toHaveLength(anzahl);
      expect(folien.filter((f) => !NOTIZEN[pfad]?.[f.id]?.live?.some((s) => s.trim() !== '')).map((f) => f.id)).toStrictEqual([]);
    });
    it(`${pfad}: jede Notiz zeigt auf eine Folie der Seite`, () => {
      const ids = new Set(folien.map((f) => f.id));
      expect(Object.keys(NOTIZEN[pfad] ?? {}).filter((id) => !ids.has(id))).toStrictEqual([]);
    });
  }
  it('scrum: abgeschaltete Folien (Lego4Scrum, Produktsatz) haben keine Notiz', () => {
    const n = NOTIZEN['/innolab/methoden/scrum'];
    expect(['produktziel', 'lego', 'vision', 'produkt-board', 'lego-sprint', 'review-1', 'nachbesprechung'].filter((id) => id in n)).toStrictEqual([]);
  });
});

// „Slice 1 im Baum“ (27.11.2026): Der Begleiter liest das Bild Zeile für Zeile – jede Zeile des Baums mit ihrem
// Gegenstück auf der Story Map und ihrer Quelle (Torres: Baum; Patton: Slice mit Outcome und Lernziel) –, erklärt den
// Konjunktiv des Debriefs mit den Bändern der Karte E1 und sagt, was die Quellen nicht sagen („Vorsicht beim Erzählen“),
// ohne Etikett „Kursregel“. Der Rundgang zum Vorlesen nennt den Baum der Kaffeebar so, wie die Folie ihn zeigt.
describe('Begleiter Tag 4: Slice 1 im Baum', () => {
  const n = NOTIZEN['/innolab/tag-4']['slice-im-baum'];
  const kern = n.kern ?? [];
  // Folie rechts oben: „Wer tut danach was anders? – derselbe Satz wie im Brief“. Der Begleiter erklärt zuerst Pattons
  // Outcome-Frage und die zwei Ebenen: Brief-Satz im Rahmen über der Map (Wurzel des Baums), enger am pinken Sticky von
  // Slice 1. Die Vorsicht-Notiz verweist darauf, statt das Kaffeebar-Beispiel ein zweites Mal zu erzählen.
  it('„Wer tut danach was anders?“: Outcome-Frage nach Patton, zwei Ebenen, Brief oben, Slice 1 enger', () => {
    const was = kern.find((k) => k.text.startsWith('Was heißt „Wer tut danach was anders?“ '));
    expect(was).toBeDefined();
    if (!was) return;
    expect(was.text).toContain('Die Folienfrage ist unsere Kurzform von Pattons Outcome-Begriff');
    expect(was.text).toContain('„We measure what people actually do differently to reach their goals as a consequence of what you’ve built“');
    expect(was.text).toContain('„The secret to breaking down that really big chunk of output was to focus on a smaller, specific outcome.“');
    expect(was.text).toContain('„Outcomes are often something you can observe right away after delivery“');
    expect(was.quelle).toContain('User Story Mapping, Read This First, Software Isn’t the Point und OK, It’s Not Just About People; Kap. 2, Don’t Prioritize Features—Prioritize Outcomes');
    // Brief-Satz = Wurzel des Baums; Slice-Satz und A5 wörtlich wie auf den Methodenseiten.
    expect(was.text).toContain(`„${KAFFEEBAR_BAUM_TAG_4.t}“`);
    const slice = 'Pendler*innen mit knapper Zeit bestellen im Gehen, statt zum Automaten auszuweichen, und haben den Kaffee vor der Abfahrt';
    expect(was.text).toContain(`„${slice}“`);
    expect(quellen['/innolab/methoden/story-map']).toContain(`Outcome: ${slice}`);
    const a5 = 'Wer die Schlange sieht, bestellt am Aufsteller statt am Automaten';
    expect(was.text).toContain(`A5 ist der Kern davon als Annahme: „${a5}“`);
    // E1 läuft vorab, ohne das Produkt (und im Kurs gar nicht): Beobachtbar wäre der Slice-Outcome erst mit Slice 1.
    for (const t of [was.text, n.fragen?.[0].antwort ?? '']) {
      expect(t).toContain('schon vorab, ohne das Produkt (Aufsteller an der Hallentür)');
      expect(t.match(/A5 sagt dasselbe|genau das prüfen A5 und E1|Ihn können .{0,40}E1 prüfen/g) ?? []).toStrictEqual([]);
    }
    expect(was.text).toContain('im Rahmen über der Map steht der Outcome aus dem Brief');
    expect(quellen['/innolab/methoden/experiment']).toContain(`<strong>A5:</strong> ${a5}.`);
    expect(was.text).toContain('„[Wer] tut [was] statt [was bisher]“');
    expect(was.text).toContain('Beim Vorlesen der Folie heißt „derselbe Satz wie im Brief“ also: der Rahmen über der Map. An Slice 1 selbst wird der Satz enger.');
    expect(n.live).toContain('Wer tut danach was anders? Brief oben, Slice 1 enger.');
    expect(n.fragen?.[0].frage).toBe('Warum steht am Slice nicht einfach der Satz aus dem Brief?');
    expect(n.fragen?.[0].antwort).toContain('der Slice-Outcome dient ihm');
    // Kein Doppel: Die Vorsicht-Notiz verweist nach oben und erzählt das Kaffeebar-Beispiel nicht noch einmal.
    const vorsicht = kern.find((k) => k.text.startsWith('Vorsicht beim Erzählen: „derselbe Satz wie im Brief“'))?.text ?? '';
    expect(vorsicht).toContain('(siehe „Was heißt ‚Wer tut danach was anders?‘“ oben)');
    expect(vorsicht.match(/im Gehen|Automat/g) ?? []).toStrictEqual([]);
  });
  it('vier Zeilen in der Reihenfolge der Folie, je mit Quelle aus Torres und Patton', () => {
    const zeilen = kern.filter((k) => k.text.startsWith('Zeile '));
    expect(zeilen.map((k) => k.text.slice(0, k.text.indexOf('.')))).toStrictEqual([
      'Zeile 1 – Outcome', 'Zeile 2 – Ziel-Chance', 'Zeile 3 – Lösung, und warum „kein Knoten im Baum“', 'Zeile 4 – Test, und warum „Wir lernen, ob …“ die riskanteste Annahme ist',
    ]);
    for (const k of zeilen) expect(k.quelle, k.text.slice(0, 20)).toMatch(/Continuous Discovery Habits, S\. \d/);
    for (const k of zeilen) expect(k.quelle, k.text.slice(0, 20)).toMatch(/User Story Mapping, Kap\. \d/);
    expect(zeilen[0].text).toContain('„The root of the tree is your desired outcome“');
    expect(zeilen[2].text).toContain('„Below the solution space are assumption tests.“');
    expect(zeilen[3].text).toContain('„a few words about what they want to learn in this release“');
    expect(zeilen[3].quelle).toContain('S. 130');
  });
  it('Belege und Begriffe wie auf den Methodenseiten: Chance belegt mit I2-4, I3-1, I5-2; E1 ohne das Produkt, nicht ohne Software', () => {
    const [, chance, , test] = kern.filter((k) => k.text.startsWith('Zeile '));
    expect(chance.text).toContain('(I2-4, I3-1, I5-2)');
    expect(chance.text.match(/I1-4|dieselben Belege/g) ?? []).toStrictEqual([]);
    expect(test.text).toContain('E1 prüft A5 vorab, ohne das Produkt');
    expect(test.text.match(/ohne Software|minimum viable product experiment/g) ?? []).toStrictEqual([]);
    expect(test.text).toContain('ist eine Vereinfachung des Kurses');
  });
  it('live: 3–5 Stichworte in der Längengrenze (Regieanweisung 12, Satz in „…“ 18 Wörter), Bänder der Karte E1', () => {
    const woerter = (s: string) => s.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;
    const zuLang = (s: string) => woerter(s) > (/^„[^“]*“\.?$/.test(s) ? 18 : 12);
    expect(n.live.length).toBeGreaterThanOrEqual(3);
    expect(n.live.length).toBeLessThanOrEqual(5);
    expect(n.live.filter(zuLang)).toStrictEqual([]);
    expect(n.live).toContain('Tag 5: ab 10 Slice bleibt, 5–9 weiter testen, unter 5 Baum.');
  });
  it('Debrief im Konjunktiv: E1 läuft nicht, die Bänder der Karte E1 mit der Wartezeit-Anzeige als Weg zurück in den Baum', () => {
    const debrief = kern.find((k) => k.text.startsWith('Warum „Hätte … gehalten“'))?.text ?? '';
    expect(debrief).toContain('E1 läuft in diesem Kurs nicht');
    for (const s of ['Ab 10 von 30', 'Bei 5 bis 9', '„nicht gelaufen“', 'Stärkerer Test oder nächste Annahme heißt, der Slice bleibt.']) expect(debrief).toContain(s);
    // Unter 5 folgt laut „Wir entscheiden vorher“ die Wartezeit-Anzeige; der Kaffeewagen ist erst der weitere Ausweg.
    expect(debrief).toContain('Unter 5 wäre A5 widerlegt: zurück in den Baum zur Geschwister-Idee Wartezeit-Anzeige an der Tür (sie hängt an A6), so steht es in „Wir entscheiden vorher“.');
    expect(debrief).toContain('Der Kaffeewagen am Bahnsteig ist erst der weitere Ausweg aus der Zeile „Falls E1 scheitert“');
    expect(quellen['/innolab/tag-4']).toContain('Hätte die Annahme gehalten, bleibt der Slice. Sonst geht ihr zurück in den Baum.');
  });
  it('was die Quellen nicht sagen: mindestens drei „Vorsicht beim Erzählen“, jede mit Quelle, kein „Kursregel“', () => {
    const vorsicht = kern.filter((k) => k.text.startsWith('Vorsicht beim Erzählen: '));
    expect(vorsicht.length).toBeGreaterThanOrEqual(3);
    expect(vorsicht.filter((k) => k.quelle.trim() === '')).toStrictEqual([]);
    expect(vorsicht.some((k) => k.text.includes('Pattons Slices kommen bei ihr nicht vor'))).toBe(true);
    expect(JSON.stringify(n).match(/Kursregel/g) ?? []).toStrictEqual([]);
  });
  it('Rundgang zum Vorlesen nennt den Baum der Kaffeebar wie die Folie; dazu ein bis drei Fragen mit Antwort', () => {
    const chance = KAFFEEBAR_BAUM_TAG_4.kinder![0];
    const spitze = chance.kinder!.find((k) => k.t.startsWith('Spitzenreiter: '))!;
    const text = n.geschichte?.text ?? '';
    for (const s of [KAFFEEBAR_BAUM_TAG_4.t, chance.t, spitze.t.replace('Spitzenreiter: ', ''), 'A5 mit E1']) expect(text).toContain(s);
    expect(n.fragen?.length).toBeGreaterThanOrEqual(1);
    expect(n.fragen?.length).toBeLessThanOrEqual(3);
    expect(n.fragen?.filter((f) => f.antwort.trim() === '')).toStrictEqual([]);
  });
});
