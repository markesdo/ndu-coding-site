import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { NOTIZEN_USAGE_STORY } from '../data/begleiter/usage-story';
import { NOTIZEN_PROTOTYP_SPIKE } from '../data/begleiter/prototyp-spike';
import { folienAus, quellenAusGlob } from './begleiter';
import { MIRO_FRAMES } from '../components/miro-frames';

// Durchsicht Tag 4 (26.11.2026): Usage Story und Prototyp-Spike im Beamer allein verständlich – Folien geteilt, Begriffe
// vor dem Gebrauch, Kursregeln gekennzeichnet, keine Runde, in der jemand die Produktarbeit der anderen liest.
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const US = '/innolab/methoden/usage-story';
const PS = '/innolab/methoden/prototyp-spike';
const seite = (p: string) => quellen[p] ?? '';
const folie = (p: string, id: string) => {
  const s = seite(p);
  const a = s.indexOf(`<h2 id="${id}">`);
  return a < 0 ? '' : s.slice(a, s.indexOf('</Folie>', a));
};
// Was der Beamer zeigt: ohne .nur-handout-Blöcke.
const beamer = (f: string) => f.replace(/<div class="nur-handout">[\s\S]*?<\/div>\n/g, '').replace(/<p class="nur-handout">[\s\S]*?<\/p>/g, '');
const ids = (p: string) => folienAus(p, seite(p)).map((f) => f.id);

describe('Usage Story: drei Storys vorn, sieben Stationen, Boom-Probe allein', () => {
  it('Folienordnung', () => {
    expect(ids(US)).toStrictEqual(['drei-storys', 'usage-story', 'nahe-am-ende', 'beispiel', 'vorgehen', 'uebertrag']);
  });
  it('drei-storys: Concept, Origin, Usage mit versteht / sieht / erlebt; Lichaw mit Seite', () => {
    const f = folie(US, 'drei-storys');
    // Consult 27.11.: wer am Höhepunkt was tut, was daraus wird und wann – relativ, ohne Uhrzeit; „Wert“ als erster Punkt.
    expect(f).toContain("{ t: 'Concept Story', sub: 'Am Höhepunkt <em>versteht</em> die Person den Wert eures Produkts<br>→ Satz im Produkt-Brief · heute Morgen', icon: Lightbulb }");
    expect(f).toContain("{ t: 'Origin Story', sub: 'Am Höhepunkt <em>sieht</em> die Person den Wert eures Produkts<br>→ Text für Aufsteller oder Landingpage, Test E1 · am Ende des Tages', icon: Eye }");
    expect(f).toContain("{ t: 'Usage Story', sub: 'Am Höhepunkt <em>erlebt</em> die Person den Wert eures Produkts<br>→ Ablauf für euren Prototyp · jetzt', icon: Hand }");
    expect(f).toContain('<li data-schritt><strong>Wert:</strong> was euer Produkt für diese Person besser macht als das, was sie heute tut.</li>');
    expect(f).toContain('(Kap. 5, Micro-Stories: Core Tasks, S. 86)');
    expect(f).toContain('({LICHAW}, Kap. 4, Climax/Resolution, S. 50)');
  });
  it('concept-story#drei-storys: Tabelle mit vier Zeilen, Wert und Exposition darunter', () => {
    const c = quellen['/innolab/methoden/concept-story'] ?? '';
    const f = c.slice(c.indexOf('<h2 id="drei-storys">'), c.indexOf('</Folie>', c.indexOf('<h2 id="drei-storys">')));
    expect(f).toContain('<p class="folie-satz">Dieselbe Person, dasselbe Produkt, drei Momente: verstehen, sehen, erleben.</p>');
    expect([...f.matchAll(/<tr data-schritt><th>([^<]+)<\/th>/g)].map((m) => m[1])).toStrictEqual(['Frage', 'Am Höhepunkt', 'Kaffeebar', 'Daraus wird']);
    expect(f).toContain('<th>Concept Story<span>jetzt</span></th><th>Origin Story<span>am Ende des Tages, im Abschluss</span></th><th>Usage Story<span>nach der Mittagspause</span></th>');
    expect(f).toContain('<strong>Wert:</strong> was euer Produkt für diese Person besser macht als das, was sie heute tut.');
    expect(f).toContain('<strong>Kurslogik:</strong>');
    for (const s of ['S. 24', 'S. 28', 'S. 45', 'S. 48', 'S. 50', 'S. 70', 'S. 73']) expect(f, s).toContain(s);
    expect(f.replace(/<[^>]+>/g, '')).not.toMatch(/\bihn\b/);
  });
  it('usage-story: alle sieben Stationen im Beamer, englische Wörter der Abbildung zugeordnet', () => {
    const b = beamer(folie(US, 'usage-story'));
    for (const n of ['1 Exposition', '2 Auslöser', '3 Steigende Handlung', '4 Krise', '5 Höhepunkt', '6 Fallende Handlung', '7 Ende']) expect(b).toContain(n);
    expect(b).toContain('(„Steps“)');
    expect(b).toContain('(„Impediments“)');
    expect(b).toContain('(„Then what?“)');
  });
  it('nahe-am-ende: Peak-End erklärt, Bild als Storyboard benannt', () => {
    const b = beamer(folie(US, 'nahe-am-ende'));
    expect(b).toContain('<strong>Menschen erinnern Höhepunkt und Ende</strong> (Peak-End-Regel, Tag 2)');
    expect(b).toContain('<strong>Im Bild, Lichaws Storyboard:</strong>');
    expect(b).not.toContain('spiegelt den Story-Bogen');
  });
  it('beispiel (Handout): „Höhepunkt erreicht“ und Smile Test sind zwei Beobachtungen', () => {
    const f = folie(US, 'beispiel');
    expect(f).not.toContain('Genau das zählt der Spike-Test als „Höhepunkt erreicht“');
    expect(f).toContain('„Höhepunkt erreicht“ heißt auf Karte E2: Die Person kommt ohne Hilfe bis zum Höhepunkt-Bildschirm – ja oder nein.');
    expect(f).toContain('Die Reaktion zählt nicht für die Schwelle');
  });
  it('vorgehen: Boom-Probe allein + 1:1, Wozu, Festhalten mit Ort; keine Runde über Kreuz', () => {
    const f = folie(US, 'vorgehen');
    expect(f).toContain('<p class="wozu"><strong>Wozu?</strong> Damit ihr wisst, welchen Bildschirm euer Prototyp unbedingt zeigen muss.</p>');
    expect(f).toContain('<strong>Boom-Probe, allein:</strong> Ist der Höhepunkt ein konkreter Bildschirm oder Moment? Kommen danach höchstens zwei Schritte? Markus liest im 1:1 die Stationen 4 bis 7. <Timer minuten={4} />');
    expect(f).toContain('<strong>Sieben Stationen, allein,</strong> auf Miro in eurem Frame „T4 · 4 · Usage Story · Produkt n“: Person aus den Interviews, Uhrzeit, Ort. <Timer minuten={10} />');
    expect(f).toContain('<strong>Festhalten</strong> im selben Frame: Höhepunkt markieren, Belege mit ID (I…, P…). <Timer minuten={2} />');
    expect([...f.matchAll(/<Timer minuten=\{(\d+)\} \/>/g)].map((m) => Number(m[1]))).toStrictEqual([2, 10, 4, 2]);
    expect(f).toContain('Eine Runde über Kreuz gibt es nicht');
    expect(f.match(/A die von B|Boom-Probe, über Kreuz/g) ?? []).toStrictEqual([]);
    const n = NOTIZEN_USAGE_STORY.vorgehen;
    expect(n.uebung?.form).toBe('allein; Boom-Probe allein, Markus liest im 1:1 die Stationen 4 bis 7');
    expect(JSON.stringify(NOTIZEN_USAGE_STORY).match(/über Kreuz \(|A liest B|einer anderen Story/g) ?? []).toStrictEqual([]);
  });
  it('uebertrag: Erklärung und Übergabe im Beamer', () => {
    const b = beamer(folie(US, 'uebertrag'));
    expect(b).toContain('<p>Der eine Satz oder das eine Bild, in dem eure Person merkt, dass es sich gelohnt hat.</p>');
    expect(b).toContain('<p class="nur-beamer"><strong>Weiter:</strong> Prototyp auf Papier – ein Blatt je Bildschirm für die Stationen 2 bis 6.</p>');
  });
});

// Seit 26.11.2026 nachts (Dozent): Tag 4 ohne Claude – aus dem Spike wird der Prototyp auf Papier. Zeitbox, Bauen und
// Ansehen sind weg (gebaut wird an Tag 5, tag-5#bauen-skizzen). Seit 27.11. heißt er nur „Trockenlauf“ (Papier oder Figma).
describe('Prototyp auf Papier: geteilte Folien, Karte E2 entscheidet vorher, Trockenlauf ohne Kritik', () => {
  it('Folienordnung', () => {
    expect(ids(PS)).toStrictEqual(['worum', 'was-er-zeigt', 'usability-test', 'fuenf', 'test-ablauf', 'karte-e2', 'beispiel', 'beispiel-befunde', 'vorgehen',
      'schritt-papier', 'schritt-kriterien', 'schritt-karte', 'schritt-trockenlauf', 'uebertrag']);
    expect(seite(PS)).not.toMatch(/id="schritt-(zeitbox|bauen|ansehen)"/);
  });
  it('worum: heute auf Papier, an Tag 5 baut Claude Code; Papier-Skizzen und Test auf Papier erklärt, Kursregel gekennzeichnet', () => {
    const b = beamer(folie(PS, 'worum'));
    expect(b).toContain('<p class="folie-satz">Heute auf Papier oder lo-fi in Figma – an Tag 5 baut Claude Code daraus.</p>');
    expect(b).toContain("{ t: 'Usage Story', sub: 'Stationen 2 bis 6', icon: BookOpen }");
    expect(b).toContain("{ t: 'Skizzen', sub: 'ein Blatt oder Figma-Frame pro Bildschirm', icon: PenLine }");
    expect(b).toContain("{ t: 'Tag 5: bauen', sub: 'Claude Code baut nach euren Skizzen', icon: Code }");
    expect(b).toContain('<strong>Skizzen:</strong> Jeden Bildschirm auf ein Blatt, oder je ein Graustufen-Frame in Figma – was steht drauf, welcher Knopf führt wohin.</li>');
    expect(b).toContain('<strong>Testen auf Papier:</strong> Jemand „tippt“ auf ein Blatt, ihr legt das nächste hin oder wechselt den Frame – so seht ihr, wo der Ablauf hakt.');
    expect(b).toContain('<strong>Kursregel – Papier vor Claude:</strong> Jeden Bildschirm entscheidet ihr selbst.');
    expect(b).not.toMatch(/Zeitbox|40 Minuten|Wegwerf/);
    // Bland wörtlich, mit Seite: Definition (S. 182) und das Paar mit dem Klick-Prototyp (S. 185).
    expect(folie(PS, 'worum')).toContain('„Sketched interface on paper, manipulated by another person to represent the software’s reactions to the customer interaction“');
    expect(folie(PS, 'worum')).toContain('„to inform your clickable prototype design“ ({BLAND}, S. 185)');
    expect(JSON.stringify([seite(PS), NOTIZEN_PROTOTYP_SPIKE]).match(/Papierbildschirm/g) ?? []).toStrictEqual([]);
  });
  it('was-er-zeigt: E2 mit dem Papier-Prototyp; Belege nach Bland S. 182 und 184, nicht mehr der Klick-Prototyp', () => {
    const f = folie(PS, 'was-er-zeigt');
    expect(beamer(f)).toContain('<b>E2 · Prototyp auf Papier</b><span class="frage">Kommen sie zurecht?</span>');
    expect(f).toContain('„not ideal as a replacement for proper usability with customers“ ({BLAND}, S. 182)');
    expect(f).toContain('„Manual task completion is not necessarily strong evidence, but it will provide glimpses into where customers could get confused“ (S. 184)');
    expect(f).not.toContain('higher fidelity than paper');
  });
  it('usability-test: eine Testperson, eine Aufgabe, keine Meinungsfragen, Grenze zu E1', () => {
    const b = beamer(folie(PS, 'usability-test'));
    expect(b).toContain('<p class="folie-satz">Eine Testperson, eine Aufgabe, euer Prototyp – ihr schaut zu.</p>');
    expect(b).toContain('<strong>Eine Testperson</strong> mit dem Pain, vor ihr euer Papier-Prototyp – online über die Kamera.');
    expect(b).toContain('Keine Meinungsfragen wie „Gefällt dir das?“');
    expect(b).toContain('<strong>Ergebnis: Bedienprobleme</strong> – nicht, ob sie es haben will. Das prüft E1.');
  });
  it('fuenf: 31 % je Testperson, Wiederholungen, 85 % der Bedienprobleme, dreimal fünf; Formel nur im Handout', () => {
    const f = folie(PS, 'fuenf');
    const b = beamer(f);
    expect(b).toContain('<strong>Eine Testperson</strong> findet im Schnitt rund 31 % der Bedienprobleme.');
    expect(b).toContain('<strong>Jede weitere</strong> zeigt vieles, was ihr schon gesehen habt – darum flacht die Kurve ab.');
    expect(b).toContain('<strong>Nach fünf</strong> habt ihr rund 85 % der Bedienprobleme gesehen; danach fast nur Wiederholungen.');
    expect(b).toContain('<strong>Wenn ihr bis Tag 5 testet:</strong> Fünf sind ideal – schon zwei, drei finden die Hälfte bis zwei Drittel.');
    expect(b).not.toContain('N(1 − (1 − L)ⁿ)');
    expect(f).toContain('„where N is the total number of usability problems in the design and L is the proportion of usability problems discovered while testing a single user. The typical value of L is 31%, averaged across a large number of projects we studied.“');
    expect(f).toContain('„After the first study with five participants has found 85% of the usability problems, you will want to fix these problems in a redesign.“');
    expect(b.replace(/„[^“]*“/g, '').match(/\bUser\b/g) ?? []).toStrictEqual([]);
  });
  // Entscheidung des Dozenten (26.11. abends): Die fünf Tests sind freiwillig bis Tag 5; im Kurs ist der Trockenlauf der
  // eine Test des Prototyps – seit 26.11. nachts auf Papier.
  it('Tests mit der Zielgruppe freiwillig: Beamer sagt heute Trockenlauf, bis Tag 5 freiwillig', () => {
    expect(beamer(folie(PS, 'usability-test'))).toContain('<strong>Heute</strong> testet ihr einmal: im Trockenlauf untereinander. <strong>Bis Tag 5, freiwillig:</strong> mit Menschen, die den Pain haben.');
    expect(beamer(folie(PS, 'worum'))).toContain("{ t: 'Testen auf Papier', sub: 'heute ein Trockenlauf; bis Tag 5 freiwillig mehr', icon: Users }");
    expect(beamer(folie(PS, 'vorgehen'))).toContain('<strong>Bis dahin, freiwillig:</strong> Tests mit Menschen, die den Pain haben.');
    const s = seite(PS);
    expect(s).toContain('<Karte text={`Lernkarte E2 – falls ihr testet\n');
    expect(s).not.toContain('T4 · 6 · Lernkarten');
    const texte = [s, JSON.stringify(NOTIZEN_PROTOTYP_SPIKE)];
    expect(texte.flatMap((x) => x.match(/Bis Tag 5: fünf Tests|Fünf Tests', sub|alle fünf haben/g) ?? [])).toStrictEqual([]);
  });
  it('test-ablauf: gute und schlechte Aufgabe, laut denken erklärt, wer führt, legt die Blätter', () => {
    const t = beamer(folie(PS, 'test-ablauf'));
    expect(t).toContain('<b>So</b><span>„Du bist um 7:27 in der Halle, dein Zug fährt um 7:38. Hol dir einen Cappuccino.“</span>');
    expect(t).toContain('<b>Nicht so</b><span>„Scanne den Code und tippe auf Bestellen.“</span>');
    expect(t).toContain('<strong>Laut denken:</strong> Sie sagt, was sie sieht, sucht und vorhat. Ihr schweigt; stockt sie, höchstens: „Was würdest du jetzt tun?“');
    expect(t).toContain('<strong>Zu zweit:</strong> eine*r führt und legt die Blätter oder wechselt die Frames, eine*r notiert in „T4 · 5 · Prototyp · Produkt n“ – geschafft?, Zeit, wo gehangen; daraus U1, U2 …');
    expect(folie(PS, 'test-ablauf')).toContain('„Have one person conduct the interviews and interact with the customer“, „Have another person write notes and act as a scribe“');
  });
  it('beispiel: fünf Bildschirme wie im Figma-Modell, 3 ist der Höhepunkt; Kriterien heute auf Papier oder in Figma, Link aufs Modell', () => {
    const b = beamer(folie(PS, 'beispiel'));
    expect(b).toContain('<h2 id="beispiel">Am Beispiel: der Prototyp der Kaffeebar – auf Papier oder lo-fi in Figma</h2>');
    expect([...b.matchAll(/<li(?: class="[^"]+")?><span>([^<]+)<\/span>([^<]+)<span class="inhalt">([^<]+)<\/span><\/li>/g)].map((m) => `${m[1]}: ${m[2]} | ${m[3]}`)).toStrictEqual([
      'Bildschirm 1: Getränk wählen | 3 Getränke → 2',
      'Bildschirm 2: Zug wählen | Abfahrt · Weiter → 3',
      'Bildschirm 3 · Höhepunkt: „Fertig 7:31. Dein Zug fährt 7:38.“ | Bestellen → 4',
      'Bildschirm 4: Abholnummer | 17 · Express-Ausgabe',
      'Bildschirm 5: Ansicht für die Bar | sortiert nach Abfahrt',
    ]);
    expect(b).toContain('<li class="gipfel"><span>Bildschirm 3 · Höhepunkt</span>');
    expect(b).toContain('<li class="bar"><span>Bildschirm 5</span>');
    expect(b).not.toMatch(/Blatt \d/);
    expect(b).toContain('<strong>Er läuft</strong> heute auf Papier oder lo-fi in Figma, an Tag 5 am Handy.');
    expect(b).not.toMatch(/40 Minuten|nicht echt|an der Bar abholen/);
    // Link aufs Modell im Beamer, als einfacher Link in neuem Tab (kein MiroLink).
    expect(seite(PS)).toContain("const FIGMA_KAFFEEBAR = 'https://www.figma.com/design/K0qxTMOsdEwIpl9YCJWvzK/Untitled?node-id=0-1';");
    expect(b).toContain('<a href={FIGMA_KAFFEEBAR} target="_blank" rel="noopener noreferrer">Modell in Figma: Kaffeebar, fünf Frames <ExternalLink');
    expect(b).not.toContain('<MiroLink');
    const h = folie(PS, 'beispiel');
    expect(h).toContain('Das Modell in Figma zeigt, was lo-fi heißt: graue Kästen und Wörter, ein Frame je Bildschirm');
    expect(h).toContain('Auf Bildschirm 4 steht „Express-Ausgabe“, nicht „an der Bar“');
    // Export der fünf Frames: im Handout (im Beamer zu klein, gemessen 27.11.2026), Datei liegt wirklich in public/quellen/kurs/.
    expect(b).not.toContain('kaffeebar-prototyp-figma.png');
    expect(h).toContain('<BuchAbbildung src="/quellen/kurs/kaffeebar-prototyp-figma.png" alt="Fünf graue Handy-Bildschirme nebeneinander');
    expect(h).toContain('quelle="Das Modell in Figma: fünf Frames, Graustufen, Pfeile als Notiz neben den Knöpfen."');
    const alt = /<BuchAbbildung src="\/quellen\/kurs\/kaffeebar-prototyp-figma.png" alt="([^"]+)"/.exec(h)?.[1] ?? '';
    for (const t of ['Frame 1 · Getränk wählen', 'Frame 2 · Zug wählen', 'Frame 3 · ★ Höhepunkt', '„Fertig 7:31. Dein Zug fährt 7:38.“', 'Frame 4 · Abholnummer', '„Abholen an der Express-Ausgabe.“', 'Frame 5 · Ansicht für die Bar', 'sortiert nach Abfahrt']) expect(alt, t).toContain(t);
    const png = new URL('../../public/quellen/kurs/kaffeebar-prototyp-figma.png', import.meta.url);
    expect(existsSync(png), 'PNG in public/quellen/kurs/').toBe(true);
    expect(readFileSync(png).subarray(1, 4).toString()).toBe('PNG');
    const n = NOTIZEN_PROTOTYP_SPIKE.beispiel;
    expect(n?.live).toContain('Figma-Modell kurz zeigen: so roh darf es sein.');
    for (const z of n?.live ?? []) expect(z.split(/\s+/).length, z).toBeLessThanOrEqual(12);
    expect(n?.fragen?.map((f) => f.frage)).toStrictEqual(['Papier oder Figma – was ist besser?']);
  });
  it('karte-e2: Papier-Prototyp statt Klick-Prototyp, Zeit nur notiert, „Wir entscheiden vorher“ auf Karte und in der Vorlage', () => {
    const f = folie(PS, 'karte-e2');
    expect(f).toContain('E2 · A3 (bedienbar) · mit dem Prototyp auf Papier\n');
    expect(f).toContain('Um das zu prüfen, geben wir fünf Pendler*innen den Papier-Prototyp – sie tippen auf ein Blatt, wir legen das nächste hin – mit der Aufgabe:');
    expect(f).not.toMatch(/Klick-Prototyp|am Handy mit der Aufgabe|läuft bis Tag 5|innerhalb von 20 Sekunden/);
    expect(f).toContain('Wir glauben, dass Pendler*innen im Gehen ohne Hilfe bis zur Fertig-Zeit bestellen können.');
    expect(f).toContain('Bland nennt „Time to complete tasks“ unter den Belegen des Papier-Prototyps ({BLAND}, S. 184)');
    expect(f).toContain('Wir entscheiden vorher: ab 4 → Slice 1 bauen · 3 → Hänger beheben, mit drei weiteren testen · unter 3 → Ablauf neu skizzieren, E2 wiederholen`} />');
    const s = seite(PS);
    expect(s).toContain('<Karte text={`3 · Karte E2 · A[n] (bedienbar) · mit dem Prototyp auf Papier\n');
    expect(s).toContain('Wir haben recht, wenn [x] von 5 den Höhepunkt ohne Hilfe erreichen.\nWir entscheiden vorher: ab [x] → [...] · [...] → [...] · unter [...] → [...]`} />');
    expect(s).toContain('Beleg: gestützt / widerlegt / unklar / neue Einsicht → darum: [...]\nWeicht ab von „Wir entscheiden vorher“? Grund: [...]\n');
  });
  it('beispiel-befunde: U1–U3 mit Zahl und Folge im Beamer, U2 wandert in Slice 1', () => {
    const b = beamer(folie(PS, 'beispiel-befunde'));
    expect(b).toContain('<tr data-schritt><th>U2</th><td>Zug eintippen dauert; alle suchen eine Liste der nächsten Abfahrten</td><td>5 von 5</td><td>„Zug aus der Liste“ wandert von Slice 2 in Slice 1</td></tr>');
    expect(b).toContain('<tr data-schritt><th>U3</th><td>Unklar, wo die Express-Ausgabe ist</td><td>3 von 5</td><td>Hinweis auf dem Höhepunkt-Bildschirm</td></tr>');
    expect(b).toContain('Ausgedacht');
  });
  // Rezept: Übersicht und vier Schritt-Folien, Timer 10/3/10/10 (33 min), jede mit „Wo“ und „Fertig, wenn“. Der Block im
  // Ablauf von Tag 4 ist 55 min: rund 20 Theorie und Beispiel + 33 Übung + 2 Übergang.
  it('vorgehen: Übersicht mit vier Schritten, dann vier Schritt-Folien mit Wo, Fertig-wenn und Timer 10/3/10/10', () => {
    const timer = (f: string) => [...f.matchAll(/<Timer minuten=\{(\d+)\}(?: gruppe="([^"]+)")? \/>/g)].map((m) => (m[2] ? `${m[1]} ${m[2]}` : Number(m[1])));
    const schritte = ['schritt-papier', 'schritt-kriterien', 'schritt-karte', 'schritt-trockenlauf'];
    const v = folie(PS, 'vorgehen');
    expect(v).toContain('<h2 id="vorgehen">So geht ihr vor (33 min)</h2>');
    expect(timer(v)).toStrictEqual([]);
    expect([...v.matchAll(/\{ t: '([^']+)', sub: '([^']+)' \}/g)].map((m) => `${m[1]} | ${m[2]}`)).toStrictEqual([
      '1 Papier | 10 min<br>allein, Stift oder Figma', '2 Abnahme-kriterien | 3 min<br>Miro', '3 Karte E2 | 10 min<br>Miro', '4 Trockenlauf | 10 min<br>zu dritt, Teams',
    ]);
    expect(schritte.flatMap((id) => timer(folie(PS, id)))).toStrictEqual([10, 3, 10, 10]);
    expect(v).toContain('zusammen 53 Minuten, der Block hat 55');
    for (const id of schritte) {
      const b = beamer(folie(PS, id));
      expect(b, id).toMatch(/<p class="wo-fertig"><span><strong>Wo:<\/strong> [^<]+/);
      expect(b, id).toContain('<span><strong>Fertig, wenn:</strong> ');
    }
    // Die Felder auf Miro heißen wie die Schritte: 1 Skizzen (Papier oder Figma), 2 Abnahmekriterien, 3 Karte E2, 4 Tests.
    expect(['schritt-papier', 'schritt-kriterien', 'schritt-karte', 'schritt-trockenlauf'].map((id) => beamer(folie(PS, id)).match(/Feld „(\d · [^“]+)“/)?.[1])).toStrictEqual([
      '1 · Skizzen: Papier oder Figma (lo-fi)', '2 · Abnahmekriterien', '3 · Karte E2', '4 · Tests',
    ]);
    expect(schritte.map((id) => NOTIZEN_PROTOTYP_SPIKE[id]?.uebung?.dauer ?? null)).toStrictEqual(['10 min', '3 min', '10 min', '10 min']);
  });
  it('Schritt 2: Abnahmekriterien als „zeigt / läuft / hat nicht“ – heute fürs Papier, an Tag 5 der Auftrag für Claude Code', () => {
    const k = beamer(folie(PS, 'schritt-kriterien'));
    expect([...k.matchAll(/<li data-schritt><strong>(„[^<]+)<\/strong>/g)].map((m) => m[1])).toStrictEqual(['„Der Prototyp zeigt …“', '„Er läuft …“', '„Er hat nicht …“']);
    expect(k).toContain('<p class="folie-satz">Was der Prototyp zeigen muss – heute auf Papier, an Tag 5 als Auftrag für Claude Code.</p>');
    expect(k).toContain('<p>Er läuft heute auf Papier oder lo-fi in Figma, an Tag 5 am Handy im Browser.</p>');
    expect(seite(PS)).not.toMatch(/3 · Zeitbox|Zeitbox: bis/);
  });
  it('Schritt 3 und 4: Karte E2 mit „Wir entscheiden vorher“; Trockenlauf in drei Runden, wer besitzt, legt die Blätter, keine Kritik', () => {
    expect(beamer(folie(PS, 'schritt-karte'))).toContain('<strong>„Wir entscheiden vorher“:</strong> drei Bänder, je eine Handlung.');
    const t = beamer(folie(PS, 'schritt-trockenlauf'));
    expect(t).toContain('<h2 id="schritt-trockenlauf">Schritt 4: Trockenlauf</h2>');
    expect(t).toContain('<p class="folie-satz">Drei Runden: Ihr prüft, ob der Ablauf verständlich ist – nicht, ob er gefällt.</p>');
    expect(t).toContain('<tr><th>1</th><td>Produkt 2</td><td>Produkt 1</td><td>Produkt 3</td></tr>');
    expect(t).toContain('<strong>Wem der Prototyp gehört:</strong> Blatt 1 in die Kamera oder Frame 1 teilen, Aufgabe vorlesen, dann das Blatt legen oder den Frame wechseln, zu dem der angesagte Knopf führt. Sonst schweigen.');
    expect(t).toContain('<strong>Kursregel – keine Kritik:</strong> kein Feedback danach. Nächste Runde.');
    expect(t).toContain('<strong>Wo:</strong> Teams (Kamera oder Bildschirm teilen) und Feld „4 · Tests“, Zeile 0');
    expect(folie(PS, 'schritt-trockenlauf')).toContain('Der Trockenlauf ist heute euer Test des Prototyps.');
    expect(folie(PS, 'schritt-trockenlauf')).toContain('„Test it internally to make sure the flow works“');
  });
  it('uebertrag: Übergabe an den Puffer und nach der Pause an Scrum im Beamer', () => {
    expect(beamer(folie(PS, 'uebertrag'))).toContain('<p class="nur-beamer"><strong>Weiter:</strong> Puffer – fertig machen, was heute offen blieb. <strong>Nach der Pause:</strong> Agil und Scrum.</p>');
  });
  it('kein Bau an Tag 4: kein Spike-Prompt, kein Branch, kein /spike; die Prompts stehen auf tag-5#bauen-skizzen', () => {
    const s = seite(PS);
    expect(s).not.toMatch(/<Prompt label="Spike|spike\/\[vorname\]|\/spike\b|Der Spike bleibt im Branch|<Timer[^>]*gruppe=/);
    expect(s).toContain('<Callout type="info" title="An Tag 5 baut Claude Code daraus">');
    expect(s).toContain('(<a href="/innolab/tag-5#bauen-skizzen">Tag 5, Bauen</a>)');
    expect(s).toContain('<h2 id="vorlage">So sieht euer Frame aus</h2>');
    expect(s).toContain('<Karte label="Miro · T4 · 5 · Prototyp · Produkt n" text={`1 · Skizzen: Papier oder Figma (lo-fi)\nJe Bildschirm ein Blatt oder ein Graustufen-Frame in Figma – Foto oder Bild hier rein');
    expect(s).toContain('Aufgabe vorlesen · Blatt legen oder Frame wechseln, schweigen');
    expect(s).toContain('\n0 · Trockenlauf (heute): Aufgabe verständlich?');
    expect(JSON.stringify([s, NOTIZEN_PROTOTYP_SPIKE]).match(/Trockenlauf auf Papier/g) ?? []).toStrictEqual([]);
    expect(s).toContain('Abnahmekriterien und eure Skizzen (Fotos oder Figma-Bilder)');
    expect(s).toContain('<Karte text={`5 · Tag 5: gebaut\n');
    expect(s).toContain('<Karte text={`Für Claude Code (an Tag 5, mit Opus – /model opus)\n');
    expect(quellen['/innolab/tag-5']).toContain('<h2 id="bauen-skizzen">');
  });
  // Entscheidung Markus 27.11.2026: Bildschirme auf Papier oder lo-fi in Figma; Figma nur Graustufen, ohne Komponenten
  // und Klick-Verbindungen (sonst wäre es der Klick-Prototyp, den Bland nach dem Papier stellt, S. 185).
  it('Kursregel Papier oder Figma: im Handout mit Bland-Grund, im Begleiter als live-Stichwort und Frage', () => {
    const w = folie(PS, 'worum');
    expect(w).toContain('<p><strong>Kursregel – Papier oder Figma:</strong> In Figma nur Graustufen-Rahmen: Kästen, Text, Pfeile. Keine Farben, keine Komponenten, keine Klick-Verbindungen. Ein Frame pro Bildschirm, als Bild in euren Miro-Frame.');
    expect(w).toContain('„ideal for rapidly testing the concept“ ({BLAND}, S. 182) –, der klickbare Prototyp kommt danach (S. 185)');
    expect(w).toContain('wechselt zum nächsten Frame – wie beim Blätter legen.</p>');
    const n = NOTIZEN_PROTOTYP_SPIKE.worum;
    expect(n.live).toContain('Kursregel: Figma nur lo-fi – Graustufen, keine Komponenten, keine Klicks.');
    const figma = n.fragen?.find((f) => f.frage === 'Dürfen wir Figma nehmen?');
    expect(figma?.antwort).toContain('Keine Farben, keine Komponenten, keine Klick-Verbindungen (Kursregel).');
    expect(figma?.antwort).toContain('„ideal for rapidly testing the concept“ (S. 182)');
    expect(beamer(folie(PS, 'schritt-papier'))).toContain('Ein Blatt (oder Figma-Frame) je Bildschirm');
    // Markus 27.11.2026: Schritt 1 und Befund-IDs ohne „Kursregel“-Label, mit dem Warum.
    const sp = folie(PS, 'schritt-papier');
    expect(sp).toContain('<p class="folie-satz">Papier vor Claude: Was auf dem Bildschirm steht, entscheidet ihr – nicht Claude.</p>');
    expect(sp).toContain('<li data-schritt><strong>Foto je Blatt</strong> (oder Bild je Frame) in Feld 1 eures Frames – daraus baut Claude Code an Tag 5.</li>');
    expect(sp).toContain('Papier vor Claude heißt: Ihr legt fest, was auf jedem Bildschirm steht, und Claude Code baut an Tag 5 genau das');
    expect(sp).not.toContain('Kursregel');
    const bf = folie(PS, 'beispiel-befunde');
    expect(bf).toContain('<p data-schritt><strong>Jeder Befund</strong> bekommt eine ID – U wie Usability-Test: U1, U2 … –, eine Zahl und eine Folge.</p>');
    expect(bf).not.toContain('Kursregel');
    expect(NOTIZEN_PROTOTYP_SPIKE['schritt-trockenlauf'].live).toContain('Wem er gehört: Blatt/Frame zeigen, Aufgabe vorlesen, nächstes Blatt/Frame.');
  });
  it('höchstens fünf live-Stichworte je Folie, auf beiden Seiten', () => {
    const zuViele = [...Object.entries(NOTIZEN_USAGE_STORY), ...Object.entries(NOTIZEN_PROTOTYP_SPIKE)].filter(([, n]) => n.live.length > 5).map(([id]) => id);
    expect(zuViele).toStrictEqual([]);
  });
});

// NACHTRAG 26.11. (abends): Studierende schreiben keine docs/*.md mehr – Usage Story, Karte E2, Abnahmekriterien und Befunde
// stehen auf Miro; Claude und Claude Code immer mit Opus.
describe('Usage Story und Prototyp auf Papier: Miro statt Repo-Dateien, Opus', () => {
  it('keine docs/-Datei auf den Seiten und in den Notizen', () => {
    const texte = [seite(US), seite(PS), JSON.stringify(NOTIZEN_USAGE_STORY), JSON.stringify(NOTIZEN_PROTOTYP_SPIKE)];
    expect(texte.every((x) => x.length > 1000)).toBe(true);
    expect(texte.flatMap((x) => x.match(/docs\/[A-Z-]+\.md/g) ?? [])).toStrictEqual([]);
  });
  it('Usage Story: Frame „T4 · 4 · Usage Story · Produkt n“ mit Aufbau statt Datei-Vorlage', () => {
    const s = seite(US);
    expect(s).toContain('<h2 id="vorlage">So sieht euer Frame aus</h2>');
    expect(s).toContain('<Karte label="Miro · T4 · 4 · Usage Story · Produkt n" text={`Titel: Usage Story');
  });
  // Seit 26.11.2026 nachts: Tag 4 ohne Claude Code; seit 27.11.2026 (Dozent) auch ohne Prüfen in claude.ai – Prüfen selbst.
  it('Opus, ohne Versionsnummer, nur für Tag 5; beide Prüfungen selbst mit der Prüfliste', () => {
    expect(seite(PS).match(/\/model opus/g) ?? []).toStrictEqual(['/model opus']);
    expect(seite(US)).toContain('<p>Eure Usage Story liegt nur auf Miro, in eurem Frame „T4 · 4 · Usage Story · Produkt n“. Prüft selbst mit der Liste unten und hakt ab, was erfüllt ist.</p>');
    expect(seite(PS)).toContain('in eurem Frame „T4 · 5 · Prototyp · Produkt n“. Prüft selbst mit der Liste unten und hakt ab, was erfüllt ist.</p>');
    expect(seite(US)).toContain('Eine zweite Probe allein ist die <a href="#pruefen">Prüfliste</a> unten:');
    // Der Weg mit Claude auf Miro bleibt für die Methoden von Tag 2 und 3 (ClaudePruefung.astro).
    expect(readFileSync(new URL('../components/ClaudePruefung.astro', import.meta.url), 'utf8')).toContain('Im Modellmenü das beste Modell wählen, das euch zur Verfügung steht – mit Claude Pro (ab Innolab-Tag 5) Opus; meldet Claude ein Limit oder gibt es Opus nicht, das vorgeschlagene Standardmodell.');
    expect([seite(US), seite(PS)].flatMap((x) => x.match(/Opus \d|opus-\d/gi) ?? [])).toStrictEqual([]);
  });
  // Seit 27.11.2026 haben die Frames IDs: beide Seiten verlinken sie je Produkt (wie concept-story#vorgehen) und das Beispiel.
  it('neue Frames: je Produkt als <MiroLink>, dazu das Beispiel der Kaffeebar', () => {
    for (const [pfad, frame] of [[US, 'T4 · 4 · Usage Story'], [PS, 'T4 · 5 · Prototyp']] as const) {
      for (const n of ['Produkt 1', 'Produkt 2', 'Produkt 3', 'Kaffeebar']) {
        expect(Object.keys(MIRO_FRAMES), `${frame} · ${n}`).toContain(`${frame} · ${n}`);
        expect(seite(pfad), `${pfad}: ${frame} · ${n}`).toContain(`<MiroLink name="${frame} · ${n}">${n}</MiroLink>`);
      }
      expect(seite(pfad)).not.toContain('TODO Miro-IDs');
    }
  });
});
