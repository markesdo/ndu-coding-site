import { describe, expect, it } from 'vitest';
import { ACHSE_X, ACHSE_Y, FELDER } from '../components/bild/annahmen-map';
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
  // Seit 26.11.2026 nachts ohne claude-pro-jetzt und claude-code-opus: Tag 4 läuft ohne Claude, die Folien stehen auf tag-5.
  it('18 Folien (seit 27.11. mit annahmen-finden und so-liefe-e1) in der neuen Reihenfolge, ohne die Intuit-Folien', () => {
    expect(folienAus(EX, seite(EX)).map((f) => f.id)).toStrictEqual([
      'annahmen-der-idee', 'schritte-der-idee', 'spitzenreiter', 'map', 'karte', 'ergebnis-gilt',
      'vorher-entscheiden', 'welcher-test', 'test-arten', 'annahmen-finden', 'beispiel', 'beispiel-map', 'karte-e1', 'vorgehen', 'so-liefe-e1', 'lernkarte',
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
    expect(n['so-liefe-e1'].ueberleitung).toBe('Und so sähe die Lernkarte danach aus – am Beispiel der Kaffeebar.');
    expect(n.vorgehen.ueberleitung).toBe('Wie E1 laufen würde – Schritt für Schritt.');
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
    // Seit 27.11.2026 läuft E1 nicht: „Kein Ort?“ ist keine Anweisung mehr, nur noch Theorie im Handout.
    expect(sichtbar('uebertrag')).not.toContain('<strong>Kein Ort?</strong>');
    expect(folie('uebertrag')).toContain('Theorie, denn bei uns läuft E1 nicht');
  });
});

describe('Annahmen-Map wie der Miro-Frame', () => {
  it('#map: Titel, die vier Feldnamen des Frames, Achsen, Spitzenreiter von heute Morgen, Wege Miro – Werkstatt – Repo', () => {
    const m = sichtbar('map');
    expect(m).toContain('<h2 id="map">Annahmen-Map: Welche testen wir zuerst?</h2>');
    expect(m).toContain('eures Spitzenreiters, den ihr heute Morgen in der Value Map bestätigt habt');
    // Seit 27.11.: echte Achsen wie bei Torres statt der Unterschrift; dieselbe Komponente auf #map und #beispiel-map.
    expect(m).not.toContain('Nach oben: wichtiger. Nach rechts: weniger Beleg.');
    expect(m).toContain('<AnnahmenMap label=');
    expect(sichtbar('beispiel-map')).toContain('<AnnahmenMap label="Annahmen-Map der Kaffeebar.');
    expect(ACHSE_Y).toStrictEqual({ titel: 'Wichtigkeit: fällt die Idee um, wenn es falsch ist?', oben: 'wichtig', unten: 'weniger wichtig' });
    expect(ACHSE_X).toStrictEqual({ titel: 'Beleg: was wissen wir schon?', links: 'viel Beleg', rechts: 'kein Beleg' });
    expect(m).toContain('Sortieren auf Miro – festhalten in der Werkstatt (ID, Art, Wichtigkeit, Beleg) – die Karte E1 auf Miro, im selben Frame.');
    // Feldnamen in dieser Reihenfolge (oben links, oben rechts, unten links, unten rechts), wie im Frame.
    const felder = FELDER.map((x) => `${x.klasse}:${x.name}`);
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
    expect(v).toContain('in der <a href="/innolab/mappe?bearbeiten=annahmen">Annahmen-Map der Werkstatt</a> festhalten: ID, Art, Wichtigkeit, Beleg.');
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

  it('der Claude-Prompt am Ende des Tages heißt „Gegenprobe zu E1“, liest Screenshot und Werkstatt – zu Hause, in claude.ai', () => {
    const q = seite(EX);
    expect(q).toContain('<Prompt label="Gegenprobe zu E1 · zu Hause, in claude.ai">{GEGENPROBE}</Prompt>');
    expect(q).toContain('Zu Hause, in claude.ai oder der Claude-App, mit der Werkstatt verbunden und im Modellmenü auf dem besten Modell, das euch zur Verfügung steht – ab Tag 5 Opus');
    expect(q).toContain('const GEGENPROBE = `Im Bild: meine Karte E1 vom Miro-Frame „T4 · 0 · Annahmen der Idee“. Lies aus der Werkstatt meine Annahmen-Map');
    expect(q).not.toMatch(/PRE_MORTEM\}|label="Pre-Mortem/);
  });

  it('keine docs-Dateien mehr für Studierende (Nachtrag 26.11. abends)', () => {
    expect(seite(EX)).not.toMatch(/docs\/[A-Z-]+\.md/);
    expect(seite(EX)).toContain('<h2 id="vorlage">So sieht die Karte auf Miro aus</h2>');
    expect(seite(EX)).toContain('<Karte label="Lernkarte (freiwillig, für E2) · Miro, T4 · 6 · Lernkarten · Produkt n" text={`Lernkarte E[n] · A[n]');
    // Seit 27.11.: Karten als Karte (kein Kopieren-Knopf), nicht als Prompt.
    expect(seite(EX)).not.toMatch(/<Prompt label="(Beispiel · Experiment-Karte E1|Feld „Karte E1|Lernkarte E1|Origin Story · Miro)/);
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

  it('Skala 0–30 in 30 gleichen Teilen: Bänder 5/5/20, Marken bei 5/30 und 10/30, 30 am Ende (Review #456)', () => {
    const v = folie('vorher-entscheiden');
    const flex = [...v.matchAll(/<span class="sk-[a-z]+" style="flex: (\d+)"><\/span>/g)].map((x) => Number(x[1]));
    expect(flex).toStrictEqual([5, 5, 20]);
    expect(flex.reduce((a, b) => a + b)).toBe(30);
    const marken = [...v.matchAll(/<span style="left: ([\d.]+)%">(\d+)<\/span>/g)].map((x) => [Number(x[2]), Number(x[1])]);
    expect(marken.map(([z]) => z)).toStrictEqual([0, 5, 10, 30]);
    for (const [z, links] of marken) expect(links, String(z)).toBeCloseTo((z / 30) * 100, 2);
  });

  // Dozent 27.11.2026: E1 läuft nicht. Tag 5 bespricht die Karte E1 als Gedankenexperiment; Lernkarte nur für E2, falls getestet.
  it('Tag 5: Karte E1 als Gedankenexperiment, Lernkarte nur für E2, falls getestet', () => {
    const t5 = seite('/innolab/tag-5');
    const fragen = 'Was hätte euch umstimmen können? Welches Band hättet ihr erwartet – und was hättet ihr dann getan?';
    expect(t5).toContain(`<li data-schritt><strong>Karte E1 vorstellen:</strong> ${fragen}</li>`);
    expect(t5).toContain('Eure Karte E1 auf Miro, im Frame „T4 · 0 · Annahmen der Idee“ – E1 ist in diesem Kurs nicht gelaufen');
    expect(t5).not.toMatch(/Lernkarte E1 habt ihr|Lernkarte vorlesen|Lernkarten zu Beginn vor/);
    expect(t5).toContain('Wer mit dem Prototyp getestet hat (freiwillig), bringt die Lernkarte E2 mit');
  });

  it('experiment#so-liefe-e1: fünf Schritte mit Kaffeebar, Lernkarte als Theorie; Karte E1 ohne Laufzeit', () => {
    const v = sichtbar('so-liefe-e1');
    expect(v).toContain('<p class="folie-satz">Ihr lauft E1 nicht – aber so sähe es aus, Schritt für Schritt.</p>');
    expect([...v.matchAll(/<li data-schritt><strong>([^<]+)<\/strong>/g)].map((x) => x[1])).toStrictEqual(['Vorbereiten:', 'Menschen aus der Zielgruppe, in der echten Situation', 'Zählen, nicht überreden:', 'Erst danach fragen:', 'Lernkarte:']);
    expect(v).toContain('Eure Karte E1 beschreibt genau das – an Tag 5 besprecht ihr, was sie gezeigt hätte.');
    expect(folie('so-liefe-e1')).toContain('<strong>Kurszusammenfassung</strong>');
    expect(sichtbar('lernkarte')).toContain('<h2 id="lernkarte">So sähe die Lernkarte aus</h2>');
    expect(sichtbar('lernkarte')).toContain('<strong>Bei uns läuft E1 nicht</strong> – an Tag 5 besprecht ihr, was eure Karte gezeigt hätte und was ihr dann entschieden hättet.');
    expect(seite(EX)).not.toMatch(/läuft bis|E1 laufen lassen|sobald E1 gelaufen/);
    expect(seite(EX)).toContain('<Karte label="Beispiel · Experiment-Karte E1" text={`E1 · A5 (wünschenswert)\n');
    expect(sichtbar('vorgehen')).toContain('„Um das zu prüfen“ beschreibt, wie E1 laufen würde');
  });

  it('Lernkarten-Vorlage hat die Zeile für die Abweichung; #gegen-den-beleg steht danach, Regel – Ausnahme – Nie', () => {
    expect(seite(EX)).toContain('Beleg: gestützt / widerlegt / unklar / neue Einsicht → darum: [...]\nWeicht ab von „Wir entscheiden vorher“? Grund: …\n');
    const g = sichtbar('gegen-den-beleg');
    expect(g).toContain('<p class="folie-satz">Netflix testet Vorschaubilder: Welches Bild bringt mehr Klicks auf die Serie „Grace and Frankie“?</p>');
    expect(g).toContain('Die Serie hat zwei Hauptdarstellerinnen: Jane Fonda und Lily Tomlin.');
    expect(g).toContain('<strong>Die Ausnahme:</strong> bewusst dagegen entscheiden – und den Beleg und euren Grund offen festhalten.');
    expect(NOTIZEN[EX]['gegen-den-beleg'].kern?.[0].text).toMatch(/^Hintergrund \(nicht bei Thomke\):/);
    expect(NOTIZEN[EX]['gegen-den-beleg'].live[0]).toBe('Erst erklären: Serie, zwei Stars, Netflix testet Vorschaubilder.');
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

// Die Folien „claude-pro-jetzt“ und „claude-code-opus“ stehen seit 26.11.2026 nachts auf tag-5 (tag-5-claude-pro.test.ts).
describe('Experiment-Seite ohne Claude-Pro-Block', () => {
  it('Rückfall, wenn Opus nicht geht: überall im Handout, wo Opus steht (Review #456)', () => {
    const rueckfall = 'Meldet Claude ein Limit oder gibt es Opus nicht:';
    // Jeder Handout-Absatz, der sagt, wie man Opus wählt (Modellmenü, /model opus), nennt auch den Rückfall.
    const absaetze = (seite(EX).match(/<p>[^]*?<\/p>/g) ?? []).filter((p) => /Opus/.test(p) && /Modellmenü|\/model opus/.test(p));
    expect(absaetze.length).toBeGreaterThanOrEqual(1);
    expect(absaetze.filter((p) => !p.includes(rueckfall))).toStrictEqual([]);
    expect(seite(EX)).not.toMatch(/\/model opus/);
  });

  it('FooterNav: zurück zum Geschäftsmodell', () => {
    expect(seite(EX)).toContain("prev={{ href: '/innolab/methoden/geschaeftsmodell', t: 'Geschäftsmodell' }}");
  });
});
