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
  it('19 Folien (seit 27.11. mit annahmen-finden, ein-schritt-fuenf-fragen und so-liefe-e1) in der neuen Reihenfolge, ohne die Intuit-Folien', () => {
    expect(folienAus(EX, seite(EX)).map((f) => f.id)).toStrictEqual([
      'annahmen-der-idee', 'schritte-der-idee', 'spitzenreiter', 'map', 'karte', 'ergebnis-gilt',
      'vorher-entscheiden', 'welcher-test', 'test-arten', 'annahmen-finden', 'ein-schritt-fuenf-fragen', 'beispiel', 'beispiel-map', 'karte-e1', 'vorgehen', 'so-liefe-e1', 'lernkarte',
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
    // Seit 27.11. abends: die Werkstatt erst am Abend, die IDs stehen schon auf Miro.
    expect(m).toContain('Sortieren auf Miro – die Karte E1 auf Miro, im selben Frame – am Abend festhalten in der Werkstatt (Art, Wichtigkeit, Beleg).');
    expect(m).not.toContain('festhalten in der Werkstatt (ID,');
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
    expect(v).toContain('<a href="/innolab/mappe?bearbeiten=annahmen">Werkstatt</a>: am Abend.');
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

  // Seit 27.11.2026 (Dozent): Tag 4 ohne Claude-Hausaufgabe – die „Gegenprobe zu E1“ in claude.ai ist weg, Prüfen nur selbst.
  it('ohne „Gegenprobe zu E1“: kein Claude-Prompt zu E1, Prüfen selbst mit der Prüfliste', () => {
    const q = seite(EX);
    expect(q).not.toMatch(/GEGENPROBE|Gegenprobe zu E1|claude\.ai|<Prompt\b|MCP_WERKZEUGE/);
    expect(q).not.toContain('Prüfen mit Claude am Ende des Tages');
    // Code-Review #470: der Zeitpunkt bleibt – experiment-origin lässt sich erst nach dem Abschluss abhaken.
    expect(q).toContain('Prüft sie selbst mit der Liste unter <a href="#pruefen">Prüfen</a> am Ende des Tages, wenn auch die Origin Story steht.</p>');
    expect(q).toContain('die Origin Story in „T4 · 6 · Origin Story · Produkt n“. Prüft selbst mit der Liste unten und hakt ab, was erfüllt ist.</p>\n  <Selbstpruefung slug="experiment" />');
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

  // 27.11.2026: Begleiter erzählt Kohl’s ganz – wer, warum begeistert, Aufbau, Mechanismus, Reaktion, Lehre (Thomke S. 13–14, 66–67, 85–87, 126).
  it('Begleiter #ergebnis-gilt: die Kohl’s-Geschichte mit Mechanismus, Reaktion und Brücke zu E1', () => {
    const n = NOTIZEN[EX]['ergebnis-gilt'];
    expect(n.geschichte?.quelle).toBe('Stefan H. Thomke, The Scientific Mindset, S. 13, 66–67, 86–87');
    for (const zitat of [
      '„the large US retailer“ (S. 66)',
      'anticipating significant additional revenue',
      'test sales at seventy stores over six months',
      '„Products that now had less floor space (to make room for the furniture) experienced a drop in sales, and Kohl’s was actually losing customers overall.“',
      'a huge disappointment for the program’s advocates',
      'people with organizational clout',
    ]) expect(n.geschichte?.text).toContain(zitat);
    const kern = JSON.stringify(n.kern);
    expect(kern).toContain('„(1) commit to abide by results“ (S. 85)');
    expect(kern).toContain('done deal');
    expect(kern).toContain('Ob auch feststand, was bei welchem Ergebnis folgt, sagt Thomke nicht.');
    expect(kern).toContain('willing to walk away from a project if a hypothesis is not supported“ (S. 86)');
    // Review #478: keine Bänder vor #vorher-entscheiden – die 8-von-30-Frage steht dort.
    expect(n.fragen?.map((f) => f.frage)).toStrictEqual(['Was hat der Test bei Kohl’s gemessen – die Möbel oder den ganzen Laden?']);
    expect(JSON.stringify(n)).not.toMatch(/5–9|unter 5|8 von 30/);
    expect(n.live).toStrictEqual([
      'Kohl’s: Führung begeistert, Möbel, 70 Läden, sechs Monate, gestoppt.',
      'Warum der Umsatz sank: Möbel nahmen anderen Waren die Fläche.',
      '„Gute Ergebnisse glaubt man sofort – schlechte prüft man so lange nach, bis sie zur eigenen Erwartung passen.“',
      'Falle: Kohl’s eine Matrix vorab andichten – belegt ist der vereinbarte Test.',
      'Brücke: Darum steht die Handlung vorher auf der Karte.',
    ]);
    const v = NOTIZEN[EX]['vorher-entscheiden'].fragen?.find((f) => f.frage === 'E1 ergibt 8 von 30, und jemand sagt: „Der Aufsteller stand ungünstig.“ Ist das Wegerklären?');
    expect(v?.antwort).toContain('„unter 5 → Wartezeit-Anzeige“');
    expect(JSON.stringify(n)).not.toContain('Kursregel');
  });

  // 27.11.2026: Mock Sale an der Kaffeebar als Szene – Ort, wer, Ablauf, was mit der Person passiert (Bland S. 86, 289–290).
  it('Begleiter #test-arten: Mock Sale an der Kaffeebar – Person sofort aufgeklärt, Kaffee wie sonst, Dankeschön', () => {
    const n = NOTIZEN[EX]['test-arten'];
    expect(n.live).toContain('Mock Sale: Klick, sofort aufgeklärt, Kaffee wie sonst, kleines Dankeschön.');
    const f = n.fragen?.find((x) => x.frage === 'Wie sähe der Mock Sale an der Kaffeebar aus – und was ist mit der Person, die klickt und keinen Kaffee bekommt?');
    for (const teil of [
      'am selben Ort wie E1, als eigener Durchlauf nach E1',
      '„Fährt dein Zug in weniger als 5 Minuten? Dann bitte nicht jetzt.“ (Hinweis des Kurses',
      '„Das ist ein Test – das gibt es noch nicht. Zeig diese Seite an der Bar: dein Dankeschön. Sollen wir dir Bescheid sagen? [E-Mail]“',
      'die Strichliste am Automaten in derselben Zeit',
      'Die Person kostet es knapp eine Minute',
      '„Kaffee im Gehen vorbestellen – fertig vor deinem Zug. Cappuccino 2,90 €“',
      'Angeworben wird niemand',
      '„target a specific audience with your solution and give them enough time to consider a purchase“ (S. 290)',
      'auf „Vorbestellen für 2,90 €“ tippen',
      'keinen Kaffee, und es fließt kein Geld',
      'ihren Kaffee holt sie wie sonst an der Bar oder am Automaten',
      '„gift card for the inconvenience“ (S. 289)',
      'der Gutschein ist eine Anpassung des Kurses',
      'ohne Zahlungsdaten nicht „very strong“',
      '„Are you experimenting with your customers or on them?“ (S. 86)',
    ]) expect(f?.antwort).toContain(teil);
    expect(f?.antwort).not.toContain('Kursregel');
  });

  it('#vorher-entscheiden: Bänder auf E1-Zahlen, aufgedeckt ab 10 → unter 5 → 5–9, Kursregel halbe Schwelle', () => {
    const v = sichtbar('vorher-entscheiden');
    // 27.11.2026: die 30 sind Menschen, die wählen (wie auf Karte E1 und der Lernkarte: 8 Einträge + 22 am Automaten).
    expect(v).toContain('<p class="setup-zeile">Kaffeebar, E1: Die ersten 30 Pendler*innen, die bei Schlange wählen – Automat oder Aufsteller: ab 10 Einträgen haben wir recht.</p>');
    expect(v).toContain('aria-label="Skala von 0 bis 30: Einträge von 30 Pendler*innen, die bei Schlange zwischen Automat und Aufsteller wählen; Marken bei 5 und 10');
    expect([...v.matchAll(/<li class="band-[a-z]+" data-schritt><b>([^<]+)<\/b>/g)].map((x) => x[1])).toStrictEqual(['ab 10 von 30', 'unter 5 von 30', '5–9 von 30']);
    expect(v).toContain('<p data-schritt><strong>Zwei Zahlen, vor dem Test:</strong> die Schwelle (ab 10: gestützt) und die Grenze (unter 5: widerlegt) – dazwischen ist es unklar. Kursregel: Grenze etwa bei der halben Schwelle.</p>');
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

  // 27.11.2026: Regel ohne „(Kohl’s)“; Begleiter erzählt Netflix nach Thomke S. 126–127 und baut die Brücke zu E1.
  it('#gegen-den-beleg: „Die Regel: Das Ergebnis gilt.“; Begleiter mit Netflix-Fall, Umdeuten und Kaffeebar-Brücke', () => {
    expect(sichtbar('gegen-den-beleg')).toContain('<li data-schritt><strong>Die Regel:</strong> Das Ergebnis gilt.</li>');
    const n = NOTIZEN[EX]['gegen-den-beleg'];
    expect(n.geschichte?.quelle).toBe('Stefan H. Thomke, The Scientific Mindset, S. 127');
    for (const zitat of [
      'has built a sophisticated infrastructure for large-scale experimentation',
      'resulted in more clicks by potential viewers than promotions featuring both Tomlin and her costar Jane Fonda',
      '„The content team worried that excluding Fonda would alienate the actress and possibly violate her contract.“',
      'pitted empirical evidence against ‚strategic considerations,‘',
      'Wer genau entschied, nennt er nicht',
    ]) expect(n.geschichte?.text).toContain(zitat);
    const kern = JSON.stringify(n.kern);
    expect(kern).toContain('Wie Netflix Vorschaubilder testet und warum sie zählen, beschreibt er nicht');
    expect(kern).toContain('„Sometimes those discussions might result in a conscious choice to overrule the data.“');
    const [, , umdeuten, kaffeebar] = n.fragen!.map((f) => f.antwort);
    expect(umdeuten).toContain('„commit to abide by results“ (S. 85)');
    expect(kaffeebar).toContain('„Weicht ab von ‚Wir entscheiden vorher‘? Ja – die Bar kann um 7:30 keine Bestellungen von Hand annehmen.“');
    expect(kaffeebar).toContain('Nicht in Ordnung: „12 ist eigentlich nicht genug“');
    expect(n.live).toContain('Brücke: E1 mit 12, trotzdem kein Concierge – Grund auf die Lernkarte.');
    expect(JSON.stringify(n)).not.toContain('Kursregel');
  });

  // Dozent 27.11.2026: Karte E1 der Kaffeebar folgt der Vorlage (#vorlage) wie auf Miro; dazu der Kontakt (E-Mail).
  it('#karte-e1 folgt der Vorlage: „Wir messen, …“, „Danach erfahren die Testpersonen: … · Wir sammeln: …“, Zug und E-Mail', () => {
    const k = sichtbar('karte-e1');
    expect(k).toContain('Die Seite verspricht „Im Gehen bestellen – bald“ und bittet, den eigenen Zug einzutragen – wer Bescheid will, auch eine E-Mail-Adresse. Bestellen geht noch nicht; das steht auf der Seite.\n');
    expect(k).toContain('\nWir messen, wer bei Schlange zum Automaten geht (Strichliste) und wer am Aufsteller einen Zug einträgt.\n');
    expect(k).toContain('\nWir haben recht, wenn von den ersten 30, die bei Schlange zum Automaten gehen oder einen Zug eintragen, mindestens 10 eintragen.\n');
    expect(k).toContain('\nDanach erfahren die Testpersonen: wann es losgeht, per E-Mail · Wir sammeln: den eingetragenen Zug, freiwillig eine E-Mail-Adresse\n');
    expect(k).not.toContain('Danach: Wer eingetragen hat');
    expect(k).not.toContain('Wir messen:');
    // Die Vorlage hat dieselben Satzanfänge.
    expect(seite(EX)).toContain('\nWir messen [Handlung].\n');
    expect(seite(EX)).toContain('\nDanach erfahren die Testpersonen: [...] · Wir sammeln: [...]\n');
  });

  it('#karte-e1 kennzeichnet die Zeilen des Kurses', () => {
    // Markus 27.11.: keine „Kursregel“-Zeile auf der Folie (verwirrt Studierende).
    expect(sichtbar('karte-e1')).not.toContain('Kursregel');
  });
});

describe('Tests zur Auswahl und Beispiel', () => {
  it('#test-arten zeigt vier Tests auf der Folie, je eine Zeile pro Klick', () => {
    const t = sichtbar('test-arten');
    expect([...t.matchAll(/<tr data-schritt><th>([^<]+)<\/th>/g)].map((x) => x[1])).toStrictEqual(['Simulierter Moment', 'Landingpage / Aufsteller', 'Concierge', 'Mock Sale']);
  });
  // Markus 27.11.: „eher stark“ wie Bland („relatively strong“). Ohne Zahlungsdaten zählt der Mock Sale Kaufklicks – „relatively strong“; „very strong“ erst mit Zahlungsdaten (Bland S. 290).
  it('#test-arten: Mock Sale – die Person klickt auf Kaufen, Beleg eher stark (Zahlungsdaten: sehr stark)', () => {
    expect(sichtbar('test-arten')).toContain('<tr data-schritt><th>Mock Sale</th><td>Kaufen-Knopf, ohne abzubuchen</td><td>klickt auf Kaufen</td><td>eher stark (Zahlungsdaten: sehr stark)</td></tr>');
    expect(sichtbar('test-arten')).not.toContain('gibt Zahlungsdaten');
    const n = NOTIZEN[EX]['test-arten'];
    expect(n.live?.[0]).toBe('Eine Zeile pro Klick, von schwach nach stark.');
    expect(n.verstaendnis?.antwort).toMatch(/^Der Kaufklick hängt an einem Preis, der Eintrag auf der Landingpage nicht/);
    expect(n.verstaendnis?.antwort).toContain('„Purchase clicks are relatively strong“');
  });
  // Markus 27.11.: Was ist ein Mock Sale, sind die Testpersonen schon Kund*innen, und wie bleibt das ehrlich?
  it('#test-arten: Begleiter beantwortet Mock Sale, Testpersonen, Ehrlichkeit und Testwahl', () => {
    const n = NOTIZEN[EX]['test-arten'];
    expect(n.fragen?.map((f) => f.frage)).toStrictEqual([
      'Was ist ein Mock Sale?',
      'Sind die Testpersonen schon echte Kund*innen?',
      'Wie läuft das beim Mock Sale mit echten Menschen – ist das nicht unehrlich?',
      'Welcher Test passt zu uns?',
      'Wie sähe der Mock Sale an der Kaffeebar aus – und was ist mit der Person, die klickt und keinen Kaffee bekommt?',
    ]);
    const [mock, personen, ehrlich, wahl] = n.fragen!.map((f) => f.antwort);
    // Review #465: Der Hinweis nach dem Klick sagt, dass es ein Test ist, und fragt nach der E-Mail (Bland S. 289).
    const hinweis = '„Das ist ein Test – das gibt es noch nicht. Sollen wir dir Bescheid sagen? [E-Mail]“';
    expect(mock).toContain(`„Vorbestellen für 2,90 €“ → ${hinweis}`);
    expect(n.geschichte?.text).toContain(hinweis);
    expect(n.kern?.[7].text).toContain(hinweis);
    expect(JSON.stringify(n)).not.toContain('wir sagen dir Bescheid“');
    expect(mock).toContain('Es fließt kein Geld (Bland, Mock Sale, S. 288–289)');
    // Ohne Zahlungsdaten: Kaufklicks und E-Mails, „relatively strong“ – nicht „sehr stark“.
    expect(mock).toContain('Ohne Zahlungsdaten (Kursregel: nie speichern) zählt euer Mock Sale die Kaufklicks');
    expect(personen).toMatch(/^Bei drei der vier Tests hat noch niemand gekauft/);
    expect(personen).toContain('Ausnahme Concierge: echte Kund*innen, die bestellen, zahlen können');
    expect(ehrlich).toContain('„with a gift card for the inconvenience“');
    expect(ehrlich).toContain('Kursregel: Zahlungsdaten nie speichern');
    expect(ehrlich).toContain('„Do your customers understand that you’ll be collecting that data?“ (S. 127)');
    expect(ehrlich).not.toContain('Can we meet customers’ expectations');
    expect(wahl).toContain('Kursregel: E1 führt ihr nicht durch.');
    expect(n.geschichte?.text).toContain('von schwach nach stark.');
    expect(n.geschichte?.text).toContain('Der Kaufklick allein ist „relatively strong“; „sehr stark“ wird der Mock Sale erst mit Zahlungsdaten (S. 290).');
    // Die bisherigen Kern-Einträge bleiben: je zwei pro Test, in dieser Reihenfolge.
    expect(n.kern?.map((k) => k.text.split(':')[0])).toStrictEqual([
      'Simulierter Moment – Aufbau', 'Simulierter Moment – gemessen', 'Landingpage / Aufsteller – Aufbau', 'Landingpage – gemessen',
      'Concierge – Aufbau', 'Concierge – Testpersonen', 'Mock Sale – Aufbau', 'Mock Sale – Achtung',
    ]);
  });
  it('#beispiel: Schritt – Annahme – Art, A3 an Schritt 2, A4 an Schritt 5', () => {
    const b = sichtbar('beispiel');
    expect(b).toContain('<tr data-schritt><td>2 Code scannen, Seite öffnet sich am Handy</td><td><strong>A3:</strong>');
    // Seit 27.11.2026 nennt auch das Handout die Seite in Schritt 2.
    expect(folie('beispiel')).toContain('(2) scannt den Code, die Seite öffnet sich am Handy –');
    expect(b).toContain('<tr data-schritt><td>5 Abholen, bar zahlen</td><td><strong>A4:</strong>');
  });
});

describe('Seite am Handy in den Schritten (27.11.2026)', () => {
  it('#vorgehen Schritt 1 fragt im Beamer nach der Seite am Handy, mit Anleitung und Timer', () => {
    const schritt1 = sichtbar('vorgehen').match(/<li data-schritt><strong>Schritte, auf Miro:<\/strong>[\s\S]*?<\/li>/)?.[0] ?? '';
    expect(schritt1).toContain('als gäbe es euren Spitzenreiter schon – wer tut was, und wo kommt eure Seite am Handy ins Spiel? In eurer Spalte im Frame oben rechts (<MiroLink name="T4 · 0 · Anleitung Annahmen der Idee">Anleitung</MiroLink>).');
    expect(schritt1).toContain('<Timer minuten={3} />');
  });
  it('#schritte-der-idee: Handout nennt die Seite als Beteiligte, mit Torres S. 120 und Kursregel', () => {
    expect(folie('schritte-der-idee')).toContain('Bei euch ist die Seite am Handy einer der Beteiligten: „the interface or software itself may be an actor in your map“ (S. 120). Kursregel: Mindestens ein Schritt passiert auf der Seite.');
  });
});

describe('#schritte-der-idee: Begleiter erklärt Torres’ Streaming-Beispiel (27.11.2026)', () => {
  const n = NOTIZEN[EX]['schritte-der-idee'];
  const frage = (f: string) => n.fragen?.find((x) => x.frage === f)?.antwort ?? '';
  it('die drei Zeilen: Kund*in, Software selbst, Partner mit Inhalt – mit Seiten', () => {
    const a = frage('Was sind Subscriber, Platform und Local Channel?');
    expect(a).toContain('Subscriber ist die Kundin oder der Kunde mit Abo, die Sport schauen will: „the sports consumer (i.e., our subscriber)“ (S. 121).');
    expect(a).toContain('Platform ist der Streamingdienst selbst, die Software als eigene Zeile: „the interface or software itself may be an actor in your map“ (S. 120).');
    expect(a).toContain('Local Channel ist ein Partner von außen, ein lokaler Fernsehsender (Torres nennt ABC, CBS, NBC, S. 120), der das Live-Programm liefert: „any number of local TV channel partners“ (S. 121).');
    expect(n.live).toContain('Bei Bedarf: Zeilen erklären – Kund*in, Software selbst, Partner mit Inhalt.');
  });
  it('Hintergrund: Firma, Outcome, Chance, gemappte Idee, mit Seiten', () => {
    expect(n.geschichte?.text).toContain('„if we worked at a streaming-entertainment company (e.g., Netflix, Hulu)“ (S. 52)');
    expect(n.geschichte?.text).toContain('„Increase weekly viewer minutes“ (S. 126)');
    expect(n.geschichte?.text).toContain('„to grab some of this market“ (S. 100)');
    expect(n.geschichte?.text).toContain('„1. Integrate local networks (e.g., ABC, CBS, NBC) into our service');
    expect(n.geschichte?.quelle).toBe('Teresa Torres, Continuous Discovery Habits, S. 52, 100, 120–121, 126, 154');
  });
  it('Leserichtung, abgeleitete Annahmen und Kaffeebar-Zuordnung', () => {
    expect(frage('Wie liest man die Map?')).toContain('Subscriber: Visits platform → Platform: Shows sports options → Subscriber: Browses options, Chooses sport → Local Channel: Delivers content → Subscriber: Watches sport.');
    const ann = frage('Welche Annahmen leitet Torres aus dieser Map ab?');
    for (const z of ['„Desirability: Our subscriber wants to watch sports.“', '„Feasibility: The local provider’s source content will be available.“ (S. 124)',
      '„Viability: Integrating a local channel feed won’t be too expensive.“', '„Ethical: Subscribers will be okay with us sharing viewership data with their local channels.“ (S. 124)']) expect(ann).toContain(z);
    const kb = frage('Wo stecken die drei Zeilen bei der Kaffeebar?');
    expect(kb).toMatch(/^Pendler\*in wie Subscriber: [\s\S]* Seite am Handy wie Platform: [\s\S]* Bar wie Local Channel: /);
    expect(kb).toContain('Die Zuordnung ist eine Lesart des Kurses, nicht von Torres.');
  });
  it('Review #477: keine Überdehnung von S. 122–124; die Seite handelt nicht für die Pendler*in', () => {
    const lesen = frage('Wie liest man die Map?');
    expect(lesen).toContain('Gerade dort stehen Machbarkeits-Annahmen: „Feasibility: We know what sports are available right now.“ (S. 123)');
    expect(lesen).not.toMatch(/vor allem|genau diesen/);
    const ann = frage('Welche Annahmen leitet Torres aus dieser Map ab?');
    expect(ann).toContain('Wünschbarkeit, Bedienbarkeit und Machbarkeit stecken überall dort, wo jemand etwas tun muss – „every time you assume that an end-user will do something“ (S. 122)');
    expect(ann).not.toContain('in jedem Schritt');
    expect(frage('Wo stecken die drei Zeilen bei der Kaffeebar?')).toContain('sie öffnet sich nach dem Scan und nimmt Getränk und Abfahrtszeit entgegen (Schritte 2 und 3); Code scannen und wählen tut die Pendler*in.');
  });
});

// Die Folien „claude-pro-jetzt“ und „claude-code-opus“ stehen seit 26.11.2026 nachts auf tag-5 (tag-5-claude-pro.test.ts).
describe('Experiment-Seite ohne Claude-Pro-Block', () => {
  it('Rückfall, wenn Opus nicht geht: überall im Handout, wo Opus steht (Review #456)', () => {
    const rueckfall = 'Meldet Claude ein Limit oder gibt es Opus nicht:';
    // Jeder Handout-Absatz, der sagt, wie man Opus wählt (Modellmenü, /model opus), nennt auch den Rückfall.
    const absaetze = (seite(EX).match(/<p>[^]*?<\/p>/g) ?? []).filter((p) => /Opus/.test(p) && /Modellmenü|\/model opus/.test(p));
    // Seit 27.11.2026 ohne Claude-Hausaufgabe (Gegenprobe zu E1): kein Absatz wählt mehr ein Modell. Kommt einer zurück,
    // braucht er den Rückfall.
    expect(absaetze.filter((p) => !p.includes(rueckfall))).toStrictEqual([]);
    expect(absaetze).toStrictEqual([]);
    expect(seite(EX)).not.toMatch(/\/model opus/);
  });

  it('FooterNav: zurück zum Geschäftsmodell', () => {
    expect(seite(EX)).toContain("prev={{ href: '/innolab/methoden/geschaeftsmodell', t: 'Geschäftsmodell' }}");
  });
});

// 27.11.2026 (Markus): Der Begleiter zu #spitzenreiter braucht mehr – Geschichte, Verständnisfrage, Fragen aus dem Raum.
describe('Begleiter #spitzenreiter: Geschichte, Verständnisfrage, Fragen', () => {
  const n = NOTIZEN[EX].spitzenreiter;
  it('Geschichte: Torres’ Begründung mit Seite, die Abweichung als Kursregel', () => {
    expect(n.geschichte?.text).toContain('„If we test only one idea at a time, confirmation bias will rear its ugly head.');
    expect(n.geschichte?.quelle).toContain('S. 116, 134–136');
    expect(n.geschichte?.quelle).toContain('Kursregel');
    // Review #463: Torres nennt Portland auf S. 134 nicht – der Bezug ist unserer; die Zeile unter der Karte ist Kursregel.
    expect(n.geschichte?.text).toContain('bei uns die Portland-Geschichte von Tag 1');
    expect(n.geschichte?.text).toContain('ebenfalls als Kursregel, die anderen beiden als Zeile „Falls E1 scheitert“');
    expect(n.fragen?.[3].antwort).toContain('Die Zeile „Falls E1 scheitert“ für die anderen beiden ist eine Kursregel');
  });
  it('Umschwenken wie auf der Folie „Vorher festlegen“: auf die Idee aus der Zeile, als Lesart des Kurses', () => {
    expect(n.fragen?.[2].antwort).toContain('pivot – eine deutliche Änderung an Idee, Wertversprechen oder Geschäftsmodell');
    expect(n.fragen?.[2].antwort).toContain('das ist eine Lesart des Kurses');
    expect(n.fragen?.[2].antwort).not.toContain('ein Teil der Idee ändert sich deutlich');
  });
  it('Verständnisfrage mit erwarteter und falscher Antwort', () => {
    expect(n.verstaendnis?.frage).toBe('Was heißt „Spitzenreiter auf Papier“?');
    expect(n.verstaendnis?.antwort).toContain('auf den Fit zwischen Value Map und Kundenprofil, nicht auf einen Test');
    expect(n.verstaendnis?.antwort).toContain('dann entscheidet ihr nach Blands drei Möglichkeiten');
    expect(n.verstaendnis?.falsch).toContain('„Wir haben uns entschieden.“');
  });
  it('fünf Fragen, die letzte lässt die Wahl bei der Person', () => {
    expect(n.fragen?.map((f) => f.frage)).toStrictEqual([
      'Was ist eine gemeinsame Annahme?',
      'Was passiert mit den anderen beiden Ideen?',
      'Und wenn der Spitzenreiter scheitert?',
      'Warum nicht alle drei testen, wie Torres?',
      'Der Spitzenreiter ist nicht meine Idee – was jetzt?',
    ]);
    expect(n.fragen?.[0].antwort).toContain('A8');
    expect(n.fragen?.[4].antwort).toContain('Du entscheidest: bestätigen oder ändern.');
  });
});

// 27.11.2026 (Markus, Widersprüche aus #463): E1 läuft nicht – kein Satz darf so tun, als wäre vor Tag 5 getestet worden.
describe('E1 nur Theorie: Spitzenreiter-Handout, Slice im Baum, Umschwenken', () => {
  it('#spitzenreiter-Handout: ohne „zwei Wochen“, Entscheidung im Konjunktiv, Zeile unter der Karte als Kursregel', () => {
    const f = folie('spitzenreiter');
    expect(f).not.toContain('zwei Wochen');
    expect(f).not.toContain('entschieden wird nach den Tests');
    expect(f).toContain('Ihr seid drei, jede*r mit einem eigenen Produkt, und Story Map, Usage Story und Prototyp von heute brauchen eine Idee.');
    expect(f).toContain('entschieden würde nach einem Test');
    expect(f).toContain('an Tag 5 besprecht ihr als Gedankenexperiment, was E1 gezeigt hätte');
    expect(f).toContain('(S. 117 PDF)');
    expect(f).toContain('Dazu kommt eine Kursregel: Die riskanteste Annahme jeder anderen Idee steht als eine Zeile unter eurer Karte');
    expect(f).toContain('heißt Lernkarte – bei uns nur für E2, falls ihr mit dem Prototyp testet');
  });
  it('tag-4 #slice-im-baum: Beamer-Zeile und Handout im Konjunktiv', () => {
    const t4 = seite('/innolab/tag-4');
    expect(t4).toContain('<p class="nur-beamer">An Tag 5, im Debrief: Hätte die Annahme gehalten, bleibt der Slice. Sonst geht ihr zurück in den Baum.</p>');
    expect(t4).not.toContain('Nach den Tests');
    expect(t4).toContain('An Tag 5 markiert ihr im Baum, was E1 gezeigt hätte (und E2, falls getestet)');
    expect(NOTIZEN['/innolab/tag-4']['slice-im-baum'].live).toContain('Tag 5, Debrief: hätte die Annahme gehalten → Slice bleibt; sonst Baum.');
  });
  it('tag-5 #umschwenken: die geteilte Annahme ist A8, nicht „zuerst getestet“', () => {
    const t5 = seite('/innolab/tag-5');
    expect(t5).toContain('und die geteilte Annahme (A8)');
    expect(t5).not.toContain('die ihr zuerst getestet habt');
  });
});

describe('Weg von den Schritten zur Map (27.11.2026)', () => {
  const NOTIZ = NOTIZEN['/innolab/methoden/experiment'] as Record<string, { live?: string[] }> | undefined;
  // 27.11. abends: neue IDs ab A7 (A1–A4 Tag 1, A5 Concept Story, A6 Geschäftsmodell), damit die Übung ohne Werkstatt läuft.
  it('#vorgehen Schritt 2: Art und Schritt auf dem Zettel, neue IDs ab A7, gleich in die Felder; im Handout, woher A1 bis A6 kommen', () => {
    expect(sichtbar('vorgehen')).toContain('<li data-schritt><strong>Annahmen, auf Miro:</strong> die fünf Fragen an jeden Schritt, je Schritt mindestens zwei, mit Art und Schritt, ab A7 („A7 · S1 · …“), gleich in die Felder der Map; dazu das Pre-Mortem. <Timer minuten={5} /></li>');
    expect(folie('vorgehen')).toContain('Je Schritt mindestens zwei Annahmen. Neue Annahmen zählt ihr ab A7: A1 bis A4 sind von Tag 1, A5 kam aus der Concept Story, A6 aus dem Geschäftsmodell. So braucht ihr die Werkstatt während der Übung nicht.');
    expect(folie('vorgehen')).not.toContain('nächste freie ID');
    expect(sichtbar('vorgehen')).toContain('<p class="folie-satz">Alles auf Miro – allein. Die Werkstatt kommt am Abend.</p>');
  });
  // Markus 27.11.: Überholtes ist nicht „Abhaken“ (unwichtig und belegt), es rutscht nach unten; ohne „(Kursregel)“ auf der Folie.
  it('#vorgehen Schritt 3: die Tag-1-Zettel liegen schon in der Spalte, jede in ein Feld, Überholtes nach unten, Werkstatt am Abend in der Reihenfolge der Nummern', () => {
    const v = sichtbar('vorgehen');
    expect(v).toContain('<li data-schritt><strong>Map, auf Miro:</strong> wichtig nach oben, wenig Beleg nach rechts. Eure Annahmen von Tag 1 liegen schon in eurer Spalte („A1 · Tag 1 · …“), A5 (Concept Story) und A6 (Geschäftsmodell) kommen als Zettel dazu: Zieht jede in ein Feld – Überholtes nach unten. <a href="/innolab/mappe?bearbeiten=annahmen">Werkstatt</a>: am Abend. <Timer minuten={3} /></li>');
    const schritt3 = v.match(/<li data-schritt><strong>Map, auf Miro:<\/strong>.*<\/li>/)?.[0] ?? '';
    expect(schritt3).toContain('Überholtes nach unten');
    expect(schritt3).not.toContain('Abhaken');
    expect(schritt3).not.toContain('Kursregel');
    expect(folie('vorgehen')).toContain('im Schritt danach schiebt ihr die Zettel relativ zueinander. Eure Annahmen von Tag 1 liegen schon als Zettel in eurer Spalte, rechts neben den Schritten, mit „Tag 1“ nach der ID. A5 aus der Concept Story und A6 aus dem Geschäftsmodell schreibt ihr als Zettel dazu. Zieht jede in das Feld, in das sie für diese Idee gehört: Was die Interviews geklärt haben, wandert nach links; Überholtes rutscht nach unten (nicht mehr wichtig). In der Werkstatt setzt ihr am Abend die Wichtigkeit herunter, gelöscht wird nichts. Die Schritte bleiben in ihrem Feld. In die Werkstatt tragt ihr die Annahmen am Abend ein, mit Art, Wichtigkeit und Beleg – alle in der Reihenfolge ihrer Nummern, A5 und A6 zuerst, falls sie noch fehlen. Die Werkstatt vergibt die IDs der Reihe nach; so stimmen ihre Nummern mit Miro überein. Passt eine nicht, gilt die Nummer der Werkstatt: Dann korrigiert ihr den Zettel auf Miro. Alle Zeilen auszufüllen dauert länger als die drei Minuten.');
    // Kein Versprechen ohne Bedingung: die Nummern stimmen nur, wenn A5 und A6 zuerst kommen.
    expect(folie('vorgehen')).not.toContain('der Reihe nach, und so stimmen sie mit Miro überein');
    expect(folie('vorgehen')).not.toMatch(/aus der Werkstatt dazu|jetzt nur die Annahmen in „Zuerst testen“/);
    expect(folie('vorgehen')).not.toContain('kommt unter „Abhaken“');
    expect([...v.matchAll(/<Timer minuten=\{(\d+)\} \/>/g)].map((m) => Number(m[1]))).toStrictEqual([3, 5, 3, 5, 2]);
    expect(folie('vorgehen')).toContain('während der Übung nicht. Die Kaffeebar zählt anders – bei euch gilt ab A7. „S1“ auf dem Zettel nennt den Schritt, aus dem die Annahme kommt – eine Kursregel');
  });
  it('#annahmen-finden: A5 ist die Kaffeebar-Nummer, bei euch geht es ab A7 weiter, mit A5 zusammen aufgedeckt', () => {
    expect(sichtbar('annahmen-finden')).toContain('(wünschenswert)</span><br><span class="small muted">Kaffeebar-Nummer. Bei euch geht es ab A7 weiter.</span></p>');
  });
  it('#map: die Schritte bleiben in ihrem Feld', () => {
    expect(folie('map')).toContain('Die Schritte bleiben in ihrem Feld; auf die Map kommen nur die Annahmen');
    expect(folie('map')).toContain('(Frame „T4 · 0 · Annahmen der Idee“); festgehalten wird am Abend in der Werkstatt, in eurer Annahmen-Map, in der Reihenfolge der Nummern, mit Art, Wichtigkeit und Beleg;');
  });
  it('#ergebnis-gilt: „vor dem Test“ fett', () => {
    expect(sichtbar('ergebnis-gilt')).toContain('<li data-schritt><strong>Darum:</strong> Auf eurer Karte steht <strong>vor dem Test</strong>, was ihr bei jedem Ergebnis tut.</li>');
  });
  // 27.11.2026: ein Kaffeebar-Schritt durch alle fünf Fragen, mit den leeren Fällen. Ohne „Kursregel“ (Markus: die Studierenden
  // wollen wissen, was sie tun und warum).
  it('#ein-schritt-fuenf-fragen: Schritt 4, fünf Zeilen mit Ergebnis, die Regel fett, ohne „Kursregel“', () => {
    const s = sichtbar('ein-schritt-fuenf-fragen');
    expect(s).toContain('<h2 id="ein-schritt-fuenf-fragen">Ein Schritt, fünf Fragen – nicht jede ergibt einen Zettel</h2>');
    expect(s).toContain('Kaffeebar, <strong>Schritt 4:</strong> Bar zeigt „Fertig 7:31“ und bereitet zu.');
    const zeilen = [...s.matchAll(/<tr data-schritt><td>([^<]+)<\/td><td>[^<]+<\/td><td[^>]*>(.+?)<\/td><\/tr>/g)].map((m) => `${m[1]} → ${m[2]}`);
    expect(zeilen).toStrictEqual([
      'Wollen sie? → <strong>A6</strong> · S4 · wünschenswert',
      'Können sie? → kein Zettel',
      'Können wir? → <strong>A2</strong> · S4 · machbar',
      'Rechnet es sich? → weiter',
      'Schadet es jemandem? → kein Zettel',
    ]);
    expect(s).toContain('<p class="ein-schritt-regel" data-schritt><strong>Eine Frage darf leer bleiben – ein Schritt nicht.</strong> Je Schritt mindestens zwei; bleibt eine Art an allen Schritten leer: noch einmal fragen.</p>');
    // Folie und Handout: was zu tun ist und warum, keine Kursregel und kein Vergleich mit Torres’ drei Arten je Schritt.
    const f = folie('ein-schritt-fuenf-fragen');
    expect(f).toContain('<div class="nur-handout">');
    expect(f).toContain('Für leere Fragen schreibt ihr nichts auf, auch kein „–“.');
    expect(f).toContain('„Use the categories to catch your blind spots“ (S. 132)');
    expect(f).not.toMatch(/Kursregel/);
    expect(f).not.toMatch(/Sometimes story maps can help us uncover|drei Arten|desirability assumptions/i);
    // Die Annahmen stehen genauso an Schritt 4 von #beispiel.
    expect(sichtbar('beispiel')).toContain('<td>4 Bar zeigt „Fertig 7:31“ und bereitet zu</td><td><strong>A6:</strong>');
    expect(sichtbar('beispiel')).toContain('<strong>A2:</strong> 40 Bestellungen in 30 Minuten.');
  });
  it('Begleiter #ein-schritt-fuenf-fragen: Regel im live-Text, Quellen ohne „Kursregel“, Übergänge davor und danach', () => {
    const n = NOTIZEN[EX];
    const e = n['ein-schritt-fuenf-fragen'];
    expect(e.live).toContain('„Eine Frage darf leer bleiben – ein Schritt nicht.“');
    expect(JSON.stringify(e)).not.toContain('Kursregel');
    expect(e.kern?.map((k) => k.quelle)).toStrictEqual([
      'Teresa Torres, Continuous Discovery Habits, S. 122–124',
      'Teresa Torres, Continuous Discovery Habits, S. 124–126',
      'Teresa Torres, Continuous Discovery Habits, S. 126, 132',
    ]);
    expect(n['annahmen-finden'].ueberleitung).toBe('Und wenn eine Frage nichts ergibt? Ein Schritt der Kaffeebar, alle fünf Fragen.');
    expect(e.ueberleitung).toBe('Dasselbe an allen fünf Schritten – das kommt heraus.');
    expect(n.beispiel.live).toContain('Schritt 4 kennt ihr schon: zwei Treffer.');
    expect(folie('annahmen-finden')).toContain('Die nächste Folie geht einen Schritt mit allen fünf Fragen durch, die übernächste zeigt die Annahmen aller Schritte.');
  });
  it('#vorlage: Annahmen jetzt auf Miro, am Abend in die Werkstatt', () => {
    const q = seite(EX);
    const v = q.slice(q.indexOf('<h2 id="vorlage">'), q.indexOf('<Karte label="Feld „Karte E1', q.indexOf('<h2 id="vorlage">')));
    expect(v).toContain('die Annahmen stehen jetzt als Zettel auf Miro und kommen am Abend mit ID, Art, Wichtigkeit und Beleg in die Werkstatt, in eure Annahmen-Map.');
    expect(v).not.toContain('stehen in der Werkstatt');
  });
  it('Begleiter #map: Wege mit der Werkstatt am Abend', () => {
    expect(NOTIZ?.map?.live ?? []).toContain('Wege nennen: Miro sortieren, Karte E1 auf Miro, Werkstatt am Abend.');
  });
  it('Begleiter #annahmen-finden: bei den Studierenden ab A7', () => {
    expect(NOTIZ?.['annahmen-finden']?.live ?? []).toContain('Antwort mit „hoffentlich“ → Annahme, hier A5 – bei euch: ab A7.');
  });
  it('Begleiter: Check nach 11 min fragt nach den Tag-1-Zetteln, die Werkstatt erst abends', () => {
    const live = NOTIZ?.vorgehen?.live ?? [];
    expect(live).toContain('Nach 11 min: Liegt jeder Tag-1-Zettel in einem Feld? Werkstatt erst abends.');
    expect(live).not.toContain('Nach 11 min: Liegen alle Tag-1-Zettel in einem Feld? Werkstatt erst abends.');
    expect(live).not.toContain('Nach 11 min: „Zuerst testen“ in der Werkstatt? Rest bis abends.');
    expect(live).not.toContain('Nach 11 min: Stehen die Annahmen in der Werkstatt?');
  });
});

describe('Überholte Annahmen (27.11.2026)', () => {
  it('nirgends in src kommt Überholtes nach „Abhaken“', () => {
    const alle = import.meta.glob(['/src/**/*.{astro,ts,tsx}', '!/src/**/*.test.{ts,tsx}'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
    expect(Object.keys(alle).length).toBeGreaterThan(50);
    // Auch „kommt unter „Abhaken““ und Varianten wie „Überholte Annahmen … Abhaken“ in einem Satz.
    const alt = /[Üü]berholt[^.]{0,80}Abhaken|unter „Abhaken“/;
    expect(Object.entries(alle).filter(([, t]) => alt.test(t)).map(([p]) => p)).toStrictEqual([]);
  });
});
