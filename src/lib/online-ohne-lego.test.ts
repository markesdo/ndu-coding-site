import { describe, expect, it } from 'vitest';
import { quellenAusGlob } from './begleiter';
import { METHODEN, TAGE } from '../components/methoden';

// NDU-72 (Entscheidung Markus 25.11.2026): Tag 4 bis 7 sind online in Teams; Lego4Scrum fällt dieses Kursjahr weg, die
// Folien bleiben für das nächste Kursjahr.
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const seite = (p: string) => quellen[p] ?? '';
const m = (slug: string) => `/innolab/methoden/${slug}`;

// Seiten, die an Tag 4 bis 6 auf dem Beamer oder im Handout gebraucht werden.
const TAG_4_BIS_6 = ['/innolab/tag-4', '/innolab/tag-5', '/innolab/tag-6', ...['value-map', 'concept-story', 'geschaeftsmodell', 'experiment', 'story-map', 'usage-story', 'prototyp-spike', 'backlog', 'akzeptanzkriterien', 'schneiden', 'sprint', 'pitch'].map(m)];

// Folien- und Fließtext ohne Bildbeschreibungen (alt) und ohne Sätze mit Quellenangabe – Zitate und Berichte aus Büchern
// („Handgeschriebene Karteikarten … ({GASSMANN}, I-2.3)“) dürfen den Raum nennen.
const ohneQuellen = (q: string) =>
  q.replace(/alt="[^"]*"/g, '').split(/(?<=[.!?“])\s+/).filter((satz) => !/\(\{[A-Z_]+\}|\(S\. \d|, S\. \d|\(I-\d/.test(satz)).join(' ');

describe('Ab Tag 4 online (NDU-72)', () => {
  it('Tag 4 bis 7 sagen in der Kopfzeile „online in Teams“', () => {
    for (const n of [4, 5, 6, 7]) {
      expect(seite(`/innolab/tag-${n}`), `tag-${n}`).toMatch(/class="eyebrow">[^<]*· online in Teams<\/span>/);
    }
  });

  it('keine Sätze, die den Raum voraussetzen, auf den Seiten von Tag 4 bis 6 und in der Teamaufstellung', () => {
    const scrumTeam = seite(m('scrum')).slice(seite(m('scrum')).indexOf('<h2 id="team">'));
    const texte = [...TAG_4_BIS_6.map(seite), scrumTeam].map(ohneQuellen);
    // Interview (Tag 1): die Übung im Kurs ohne Sitzordnung; echte Interviews draußen dürfen Ausdrucke haben.
    expect(seite(m('interview')).match(/Person rechts/g) ?? []).toStrictEqual([]);
    expect(texte.every((x) => x.length > 1000)).toBe(true);
    // „auf Papier“ als Bild („Fit auf Papier“) und Papierskizzen mit Foto gehen auch online; gemeint ist Papier als Ort der Arbeit.
    const raum = /im Raum|an die Tafel|Person rechts|auf dem Tisch|am Tisch|an eure Tische|am Beamer|Karteikarte|schreibt ihr auf Papier|ausgedruckt|Lego-Nachbesprechung|aus dem Lego|Beim Lego|vom Lego|mit Lego durch/gi;
    expect(texte.flatMap((x) => x.match(raum) ?? [])).toStrictEqual([]);
  });

  it('vor Tag 4: Claude Code vorher installieren und anmelden – auf Tag 4 vor dem Ablauf und in der Tag-3-Hausaufgabe', () => {
    const t4 = seite('/innolab/tag-4');
    const hinweis = t4.indexOf('<Callout type="warn" title="Vor Tag 4: Claude Code installieren und anmelden">');
    expect(hinweis).toBeGreaterThan(0);
    expect(hinweis).toBeLessThan(t4.indexOf('<h2 id="ablauf">'));
    for (const q of [t4, seite('/innolab/tag-3')]) {
      expect(q).toContain('href="/setup#lokal-schnellweg"');
      expect(q).toContain('href="/setup#claude-code-browser"');
    }
    // Tag 3 sagt es einmal, im Hinweis zur Einrichtung (Code-Review #437).
    expect(seite('/innolab/tag-3').match(/Tag 4 ist online/g)).toHaveLength(1);
  });
});

describe('Lego4Scrum dieses Kursjahr stillgelegt (NDU-72)', () => {
  it('kein Lego-Block an Tag 4; Agil & Scrum, dann Prototyp weiterbauen / Puffer, dann Origin Story', () => {
    const t4 = seite('/innolab/tag-4');
    expect(t4).not.toMatch(/<Block[^>]*title="Lego4Scrum"/);
    expect(t4).toContain('<Block time="15:45–16:15" type="konzept" title="Agil & Scrum"');
    expect(t4).toContain('<Block time="16:15–17:15" type="uebung" title="Prototyp weiterbauen / Puffer">');
    expect(t4).toContain('<Block time="17:15–17:30" type="plenum" title="Origin Story & Hausaufgabe"');
    expect(t4).toContain('(Lego4Scrum ist dieses Kursjahr nicht dabei)');
  });

  it('die Lego-Folien bleiben, mit Hinweis „dieses Kursjahr nicht genutzt“ direkt davor', () => {
    const s = seite(m('scrum'));
    const hinweis = s.indexOf('<Callout type="info" title="Lego4Scrum: dieses Kursjahr nicht genutzt">');
    expect(hinweis).toBeGreaterThan(0);
    expect(s.indexOf('<h2 id="lego">')).toBeGreaterThan(hinweis);
    expect(s.slice(hinweis, s.indexOf('<h2 id="lego">'))).not.toContain('<Folie>\n    <h2');
    for (const id of ['lego', 'vision', 'produkt-board', 'lego-sprint', 'review-1', 'nachbesprechung']) expect(s, id).toContain(`<h2 id="${id}">`);
  });

  it('Prüfliste und Vorlage ohne Lego; Dauer der Methode = Agil an Tag 4 + Team an Tag 5', () => {
    const scrum = METHODEN.find((x) => x.slug === 'scrum')!;
    expect(scrum.pruefliste!.map((p) => p.id)).not.toContain('scrum-lego');
    expect(scrum.dauer).toBe(30 + 40);
    expect(seite(m('scrum'))).not.toMatch(/## Aus Lego4Scrum/);
    expect(seite(m('scrum'))).toContain('<h2 id="vorgehen">So geht ihr vor (70 min)</h2>');
  });

  it('Tag 5: Störfall ohne Lego-Bezug, Krivitsky nur als Quelle der Idee; Debrief markiert E1/E2 im Baum', () => {
    const t5 = seite('/innolab/tag-5');
    const stoer = t5.slice(t5.indexOf('<Callout type="info" title="Wofür die Störung gut ist">'), t5.indexOf('</Callout>', t5.indexOf('title="Wofür die Störung gut ist"')));
    expect(stoer).toContain('Störungen mit Absicht einzubauen, stammt von Alexey Krivitsky');
    expect(stoer).not.toMatch(/scrum#nachbesprechung|Markus hat/);
    const ablauf = t5.slice(t5.indexOf('<h2 id="debrief-ablauf">'), t5.indexOf('</Folie>', t5.indexOf('<h2 id="debrief-ablauf">')));
    expect(ablauf).toContain('<li data-schritt><strong>Euer Baum:</strong> E1 und E2 mit ✓, ✗, „unklar“ oder „neue Einsicht“ markieren – bleiben, zur Geschwister-Idee wechseln oder verwerfen. <Timer minuten={2} /></li>');
    // Drei Product Ownerinnen à 6 min plus die übrigen Schritte = die 25 min des Blocks.
    const timer = [...ablauf.matchAll(/<Timer minuten=\{(\d+)\} \/>/g)].map((x) => Number(x[1]));
    expect(timer).toStrictEqual([2, 6, 3, 2]);
    expect(timer.reduce((a, x) => a + x, 0) + 2 * 6).toBe(25);
  });

  it('Ab hier: Tag 5 – an Tag 4 geht es nach Scrum mit „Prototyp weiterbauen / Puffer“ weiter, Origin Story um 17:15', () => {
    const s = seite(m('scrum'));
    const ab = s.slice(s.indexOf('<Callout type="info" title="Ab hier: Tag 5">'), s.indexOf('</Callout>', s.indexOf('title="Ab hier: Tag 5"')));
    expect(ab).toContain('An Tag 4 geht es von hier weiter mit <a href="/innolab/tag-4#ablauf">Prototyp weiterbauen / Puffer</a>; um 17:15 folgt der <a href="/innolab/tag-4#abschluss">Abschluss mit der Origin Story</a>.');
  });

  it('die Lego-Auflösungen springen dieses Kursjahr nicht von selbst auf: Zeitpunkt nach dem letzten Kurstag', () => {
    const s = seite(m('scrum'));
    const ab = [...s.matchAll(/<Aufloesung ab=\{(\w+)\}/g)].map((x) => x[1]);
    expect(ab).toStrictEqual(['AB_LEGO', 'NACH_REVIEW_1', 'NACH_LEGO']);
    const wert = (name: string) => s.match(new RegExp(`const ${name} = ([A-Z_]+|'[^']+');`))?.[1];
    const datum = (name: string): string => { const w = wert(name)!; return w.startsWith("'") ? w.slice(1, -1) : datum(w); };
    const letzterTag = TAGE.at(-1)!.datum!;
    for (const name of ab) expect(datum(name) > `${letzterTag}T23:59`, name).toBe(true);
  });

  it('Scrum lernt ihr an der Kaffeebar und im Team – nicht im Spiel', () => {
    expect(METHODEN.find((x) => x.slug === 'scrum')!.ki).toBe('Keine Rolle – Scrum lernt ihr an der Kaffeebar und im Team.');
  });
});
