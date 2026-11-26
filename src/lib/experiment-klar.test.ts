import { describe, expect, it } from 'vitest';
import { NOTIZEN } from '../data/begleiter';
import { MIRO_FRAMES } from '../components/miro-frames';
import * as ZEITEN from '../components/innolab-zeiten';
import { folienAus, quellenAusGlob } from './begleiter';

// Experiment-Karte, Überarbeitung 26.11.2026 (Entscheidungen Markus): jede Folie im Beamer allein verständlich.
// Intuit-Folien raus (Lehre als Zeile auf #karte), Kohl’s als eigene Folie #ergebnis-gilt, Bänder auf E1-Zahlen,
// „Gegen den Beleg“ nach der Lernkarte, Annahmen-Map mit den Feldern des Miro-Frames, Pre-Mortem auf der Folie definiert,
// der Claude-Prompt am Tagesende heißt „Gegenprobe zu E1“. Nachtrag 26.11. abends: keine docs-Dateien – Karte E1 und
// Lernkarten auf Miro, Annahmen in der Werkstatt, Claude mit Opus, der 10:50-Test liest einen Screenshot.
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const EX = '/innolab/methoden/experiment';
const seite = (p: string) => quellen[p] ?? '';
const folie = (id: string) => {
  const q = seite(EX);
  const a = q.indexOf(`<h2 id="${id}">`);
  return a < 0 ? '' : q.slice(a, q.indexOf('</Folie>', a));
};
// Was im Beamer steht: die Folie ohne Handout (das Handout ist dort unsichtbar).
const sichtbar = (id: string) => folie(id).replace(/<div class="nur-handout">[\s\S]*?<\/div>\s*(?=<\/?[A-Za-z]|$)/g, '').replace(/<p class="nur-handout">[\s\S]*?<\/p>/g, '');

describe('Experiment-Karte: Folienfolge seit 26.11.2026', () => {
  it('18 Folien in der neuen Reihenfolge, ohne die Intuit-Folien', () => {
    expect(folienAus(EX, seite(EX)).map((f) => f.id)).toStrictEqual([
      'claude-pro-jetzt', 'claude-code-opus', 'annahmen-der-idee', 'schritte-der-idee', 'spitzenreiter', 'map', 'karte', 'ergebnis-gilt',
      'vorher-entscheiden', 'welcher-test', 'test-arten', 'beispiel', 'beispiel-map', 'karte-e1', 'vorgehen', 'lernkarte',
      'gegen-den-beleg', 'uebertrag',
    ]);
    expect(seite(EX)).not.toMatch(/id="sagen-tun|NACH_INTUIT|<Aufloesung/);
    expect('NACH_INTUIT' in ZEITEN).toBe(false);
  });

  it('jede Folie hat eine Begleiter-Notiz; die Übergänge folgen der neuen Reihenfolge', () => {
    const n = NOTIZEN[EX];
    expect(Object.keys(n).sort()).toStrictEqual(folienAus(EX, seite(EX)).map((f) => f.id).sort());
    expect(n.karte.ueberleitung).toContain('Ergebnis nicht passt');
    expect(n['vorher-entscheiden'].ueberleitung).toContain('Vier Faustregeln');
    expect(n.lernkarte.ueberleitung).toContain('aber offen');
    expect(n['gegen-den-beleg'].ueberleitung).toContain('Aufsteller');
    expect(JSON.stringify(n['gegen-den-beleg'])).not.toContain('gewonnen');
  });

  it('Intuit: nur im Handout von #karte; auf der Folie die Lehre als Zeile', () => {
    expect(sichtbar('karte')).toContain('<strong>Gemessen wird, was Menschen tun – nicht, was sie sagen.</strong>');
    expect(sichtbar('karte')).not.toContain('Intuit');
    expect(folie('karte')).toContain('58 percent of new users picked');
  });

  it('erste Folie des Blocks sagt, wo wir stehen; letzte übergibt an die Story Map', () => {
    expect(sichtbar('annahmen-der-idee')).toContain('Euer Spitzenreiter steht auf Papier.');
    expect(sichtbar('uebertrag')).toContain('<p class="nur-beamer"><strong>Weiter:</strong> Story Map – aus dem Spitzenreiter wird Slice 1.</p>');
    expect(sichtbar('uebertrag')).toContain('<strong>Kein Ort?</strong> Dann ein simulierter Moment');
  });
});

describe('Annahmen-Map wie der Miro-Frame', () => {
  it('#map: Titel, die vier Feldnamen des Frames, Achsen, Spitzenreiter von 9:05, Wege Miro – Werkstatt – Repo', () => {
    const m = sichtbar('map');
    expect(m).toContain('<h2 id="map">Annahmen-Map: Welche testen wir zuerst?</h2>');
    expect(m).toContain('eures Spitzenreiters, den ihr um 9:05 bestätigt habt');
    expect(m).toContain('Nach oben: wichtiger. Nach rechts: weniger Beleg.');
    expect(m).toContain('Sortieren auf Miro – festhalten in der Werkstatt (ID, Art, Wichtigkeit, Beleg) – die Karte E1 auf Miro, im selben Frame.');
    // Feldnamen kommen aus MAP_FELDER, in dieser Reihenfolge (oben links, oben rechts, unten links, unten rechts).
    const felder = [...seite(EX).matchAll(/\{ name: '([^']+)', klasse: '(ol|or|ul|ur)' \}/g)].map((x) => `${x[2]}:${x[1]}`);
    expect(felder).toStrictEqual(['ol:Beleg prüfen, darauf bauen', 'or:Zuerst testen', 'ul:Abhaken', 'ur:Später prüfen']);
    // Torres’ englische Abbildung nur noch im Handout.
    expect(m).not.toContain('leap-of-faith.jpg');
    expect(folie('map')).toContain('leap-of-faith.jpg');
  });

  it('#vorgehen: Beleg-Richtung wie #map („wenig Beleg nach rechts“), Ort je Schritt, Anleitung-Frame verlinkt', () => {
    const v = sichtbar('vorgehen');
    expect(v).toContain('wichtig nach oben, wenig Beleg nach rechts');
    expect(v).not.toMatch(/Map:<\/strong> Beleg nach rechts/);
    const orte = [...v.matchAll(/<li data-schritt><strong>[^<]*?, (auf Miro|[^<:]+):<\/strong>/g)].map((x) => x[1]);
    expect(orte).toStrictEqual(['auf Miro', 'auf Miro', 'auf Miro', 'auf Miro', 'auf Miro']);
    expect(v).toContain('in der Werkstatt festhalten: ID, Art, Wichtigkeit, Beleg.');
    expect(v).toContain('<strong>Karte E1, auf Miro:</strong> im Feld „Karte E1 für die oberste rechts“');
    expect(v).toContain('<MiroLink name="T4 · 0 · Anleitung Annahmen der Idee">');
    expect(MIRO_FRAMES['T4 · 0 · Anleitung Annahmen der Idee']).toBe('3458764691725321671');
  });

  it('#beispiel-map: A5 zuerst als ausgesprochene Ausnahme von „gemeinsame Annahmen zuerst“', () => {
    const b = sichtbar('beispiel-map');
    expect(b).toContain('eine Ausnahme von „gemeinsame Annahmen zuerst“');
    expect(seite(EX)).toContain("{ id: 'A5', x: 88, y: 12, hervor: true }");
  });
});

describe('Pre-Mortem und Gegenprobe', () => {
  it('Pre-Mortem steht auf der Folie #schritte-der-idee, mit Torres S. 125 und Gary Klein', () => {
    expect(seite(EX)).toContain("const PRE_MORTEM_FRAGE = 'Stellt euch vor: Es ist ein halbes Jahr später, euer Spitzenreiter ist komplett gescheitert. Was ist schiefgegangen?';");
    const s = sichtbar('schritte-der-idee');
    expect(s).toContain('<li data-schritt><strong>Pre-Mortem:</strong> „{PRE_MORTEM_FRAGE}“</li>');
    expect(s).toContain('Torres, S. 118–125; Pre-Mortem nach Gary Klein (HBR 2007), bei Torres S. 125.');
    // Erst danach nennt #vorgehen das Pre-Mortem.
    const q = seite(EX);
    expect(q.indexOf('<strong>Pre-Mortem:</strong>')).toBeLessThan(q.indexOf('dazu das Pre-Mortem'));
  });

  it('der Claude-Prompt am Ende des Tages heißt „Gegenprobe zu E1“, liest Screenshot und Werkstatt, mit Opus', () => {
    const q = seite(EX);
    expect(q).toContain('<Prompt label="Gegenprobe zu E1 · Claude-App, mit Opus">{GEGENPROBE}</Prompt>');
    expect(q).toContain('const GEGENPROBE = `Im Bild: meine Karte E1 vom Miro-Frame „T4 · 0 · Annahmen der Idee“. Lies aus der Werkstatt meine Annahmen-Map');
    expect(q).not.toMatch(/PRE_MORTEM\}|label="Pre-Mortem/);
  });

  it('keine docs-Dateien mehr für Studierende (Nachtrag 26.11. abends)', () => {
    expect(seite(EX)).not.toMatch(/docs\/[A-Z-]+\.md/);
    expect(seite(EX)).toContain('<h2 id="vorlage">So sieht die Karte auf Miro aus</h2>');
    expect(seite(EX)).toContain('<Prompt label="Lernkarte E1 · Miro, T4 · 6 · Lernkarten · Produkt n">');
    expect(seite('/innolab/tag-5')).not.toContain('docs/EXPERIMENTE.md');
  });
});

describe('Vorher entscheiden, Ergebnis gilt, gegen den Beleg', () => {
  it('#ergebnis-gilt (Kohl’s) direkt nach #karte, mit Falle und Darum', () => {
    const e = sichtbar('ergebnis-gilt');
    expect(e).toContain('<h2 id="ergebnis-gilt">Das Ergebnis gilt – auch wenn es nicht passt</h2>');
    expect(e).toContain('Kohl’s, US-Kaufhauskette: Möbel ins Sortiment?');
    expect(e).toContain('Viele in der Führung sind begeistert – vereinbart wird zuerst ein Test');
    expect(e).not.toContain('Die Führung will');
    expect([...e.matchAll(/<li data-schritt><strong>([^<]+)<\/strong>/g)].map((x) => x[1])).toStrictEqual(['Die Falle:', 'Darum:']);
  });

  it('#vorher-entscheiden: Bänder auf E1-Zahlen, aufgedeckt ab 10 → unter 5 → 5–9, Kursregel halbe Schwelle', () => {
    const v = sichtbar('vorher-entscheiden');
    expect(v).toContain('Kaffeebar, E1: Recht haben wir ab 10 von 30 Einträgen.');
    expect([...v.matchAll(/<li class="band-[a-z]+" data-schritt><b>([^<]+)<\/b>/g)].map((x) => x[1])).toStrictEqual(['ab 10 von 30', 'unter 5 von 30', '5–9 von 30']);
    expect(v).toContain('Kursregel: etwa die halbe Schwelle.');
    expect(v).toContain('Kursregel: drei Bänder für Thomkes Entscheidungsmatrix');
    expect(v).not.toContain('Kohl’s');
  });

  it('dieselbe Zeile „Wir entscheiden vorher“ auf #vorher-entscheiden, Karte E1 und im Tag-5-Beispiel', () => {
    const zeile = 'Wir entscheiden vorher: ab 10 → Concierge · 5–9 → wiederholen, eine Sache ändern · unter 5 → Wartezeit-Anzeige';
    expect(sichtbar('vorher-entscheiden')).toContain(`„${zeile}“`);
    expect(sichtbar('karte-e1')).toContain(`${zeile}\n`);
    const t5 = seite('/innolab/tag-5');
    expect(t5).toContain('„Unklar“ ist der Befund, weil 8 im Band 5–9 liegt, das die Karte vor dem Test festgelegt hat');
    expect(t5).toContain('Weicht ab von „Wir entscheiden vorher“? Nein – 8 liegt im Band 5–9: wiederholen, eine Sache ändern.');
    expect(t5).not.toContain('Darum „unklar“.');
  });

  it('Lernkarten-Vorlage hat die Zeile für die Abweichung; #gegen-den-beleg steht danach, Regel – Ausnahme – Nie', () => {
    expect(seite(EX)).toContain('Beleg: gestützt / widerlegt / unklar / neue Einsicht → darum: [...]\nWeicht ab von „Wir entscheiden vorher“? Grund: …\n');
    const g = sichtbar('gegen-den-beleg');
    expect(g).toContain('Netflix, Serie „Grace and Frankie“: Welches Werbebild?');
    expect([...g.matchAll(/\{ t: '([^']+)'/g)].map((x) => x[1])).toStrictEqual(['Test', 'Entscheidung', 'Offen']);
    expect(g).not.toContain('Gewonnen');
    expect([...g.matchAll(/<li data-schritt><strong>([^<]+)<\/strong>/g)].map((x) => x[1])).toStrictEqual(['Die Regel:', 'Die Ausnahme:', 'Nie:']);
  });

  it('#karte-e1 kennzeichnet die Zeilen des Kurses', () => {
    expect(sichtbar('karte-e1')).toContain('Kursregel: Zeilen 2–5 nach Blands Test Card, die letzten drei vom Kurs.');
  });
});

describe('Tests zur Auswahl und Beispiel', () => {
  it('#test-arten zeigt vier Tests auf der Folie, je eine Zeile pro Klick', () => {
    const t = sichtbar('test-arten');
    expect([...t.matchAll(/<tr data-schritt><th>([^<]+)<\/th>/g)].map((x) => x[1])).toStrictEqual(['Simulierter Moment', 'Landingpage / Aufsteller', 'Concierge', 'Mock Sale']);
  });
  it('#beispiel: Schritt – Annahme – Art, A3 an Schritt 2, A4 an Schritt 5', () => {
    const b = sichtbar('beispiel');
    expect(b).toContain('<tr data-schritt><td>2 Code scannen</td><td><strong>A3:</strong>');
    expect(b).toContain('<tr data-schritt><td>5 Abholen, bar zahlen</td><td><strong>A4:</strong>');
  });
});

describe('10:50: Opus und ein Test mit Screenshot', () => {
  it('kein Übertrag in docs/STORYS.md; Opus-Schritt nach dem Anmelden; Test mit Screenshot des Concept-Story-Frames', () => {
    const pro = sichtbar('claude-pro-jetzt');
    const opus = sichtbar('claude-code-opus');
    expect(pro + opus).not.toMatch(/STORYS|Concept Story ins Repo/);
    expect(opus).toContain('<li data-schritt><strong>Modell auf Opus stellen:</strong> in Claude Code <code>/model opus</code>. In der Claude-App: im Modellmenü Opus wählen.</li>');
    expect(opus).toContain('Screenshot eures Frames „T4 · 0 · Concept Story · Produkt n“ einfügen, dazu: „Sag mir in einem Satz, worum es in meiner Concept Story geht.“');
    expect(opus).not.toMatch(/Opus \d|Opus-\d/);
    const f = folie('claude-code-opus');
    expect(f).toContain('<Prompt label="Test · Claude Code, mit Opus">Sag mir in einem Satz, worum es in meiner Concept Story geht.</Prompt>');
    for (const n of [1, 2, 3]) expect(f).toContain(`<MiroLink name="T4 · 0 · Concept Story · Produkt ${n}">`);
  });

  it('FooterNav: zurück zum Geschäftsmodell', () => {
    expect(seite(EX)).toContain("prev={{ href: '/innolab/methoden/geschaeftsmodell', t: 'Geschäftsmodell' }}");
  });
});
