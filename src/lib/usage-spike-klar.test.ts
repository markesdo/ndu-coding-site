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
    expect(f).toContain("{ t: 'Concept Story', sub: 'Höhepunkt: sie <em>versteht</em> den Wert<br>heute Morgen', icon: Lightbulb }");
    expect(f).toContain("{ t: 'Origin Story', sub: 'Höhepunkt: sie <em>sieht</em> den Wert<br>um 17:15', icon: Eye }");
    expect(f).toContain("{ t: 'Usage Story', sub: 'Höhepunkt: sie <em>erlebt</em> den Wert<br>jetzt', icon: Hand }");
    expect(f).toContain('({LICHAW}, Kap. 4, Climax/Resolution, S. 50)');
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
    expect(b).toContain('<p class="nur-beamer"><strong>Weiter:</strong> Prototyp-Spike – ihr baut die Stationen 2 bis 6.</p>');
  });
});

describe('Prototyp-Spike: geteilte Folien, Karte E2 entscheidet vorher, Trockenlauf ohne Kritik', () => {
  it('Folienordnung', () => {
    expect(ids(PS)).toStrictEqual(['worum', 'was-er-zeigt', 'usability-test', 'fuenf', 'test-ablauf', 'karte-e2', 'beispiel', 'beispiel-befunde', 'vorgehen',
      'schritt-papier', 'schritt-kriterien', 'schritt-zeitbox', 'schritt-bauen', 'schritt-ansehen', 'schritt-karte', 'schritt-trockenlauf', 'uebertrag']);
  });
  it('worum: Weg von der Usage Story, Papier-Skizzen erklärt, Kursregel gekennzeichnet, Abnahmekriterien erklärt', () => {
    const b = beamer(folie(PS, 'worum'));
    expect(b).toContain("{ t: 'Usage Story', sub: 'Stationen 2 bis 6', icon: BookOpen }");
    expect(b).toContain("{ t: 'Papier-Skizzen', sub: 'ein Blatt pro Bildschirm, von Hand', icon: PenLine }");
    expect(b).toContain('<strong>Papier-Skizzen:</strong> Jeden Bildschirm eures Ablaufs von Hand auf ein Blatt – was steht drauf, welcher Knopf führt wohin. Foto in euren Miro-Frame; Claude Code baut genau das.');
    expect(b).toContain('<strong>Kursregel – Papier vor Claude:</strong> Jeden Bildschirm entscheidet ihr selbst. Sonst testet ihr Claudes Vorstellung von eurem Produkt.');
    expect(b).toContain('<strong>Abnahmekriterien und Zeitbox:</strong> drei Sätze, was er zeigen muss und was nicht – 40 Minuten, dann ist Schluss.');
    expect(folie(PS, 'worum')).toContain('„Sketched interface on paper, manipulated by another person to represent the software’s reactions to the customer interaction“');
    expect(b).not.toContain('gestrahlt');
    expect(JSON.stringify([seite(PS), NOTIZEN_PROTOTYP_SPIKE]).match(/Papierbildschirm/g) ?? []).toStrictEqual([]);
  });
  it('usability-test: eine Testperson, eine Aufgabe, keine Meinungsfragen, Grenze zu E1', () => {
    const b = beamer(folie(PS, 'usability-test'));
    expect(b).toContain('<p class="folie-satz">Eine Testperson, eine Aufgabe, euer Prototyp – ihr schaut zu.</p>');
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
    // „Testperson“, nicht „User“ – außer in englischen Zitaten.
    expect(b.replace(/„[^“]*“/g, '').match(/\bUser\b/g) ?? []).toStrictEqual([]);
  });
  // Entscheidung des Dozenten (26.11. abends): Die fünf Tests sind freiwillig bis Tag 5; im Kurs ist der Trockenlauf der
  // eine Test des Prototyps. Befunde und Lernkarte E2 – falls getestet – im Frame „T4 · 5 · Prototyp · Produkt n“.
  it('Tests mit der Zielgruppe freiwillig: Beamer sagt heute Trockenlauf, bis Tag 5 freiwillig', () => {
    expect(beamer(folie(PS, 'usability-test'))).toContain('<strong>Heute</strong> testet ihr einmal: im Trockenlauf untereinander. <strong>Bis Tag 5, freiwillig:</strong> mit Menschen, die den Pain haben.');
    expect(beamer(folie(PS, 'worum'))).toContain("{ t: 'Testen', sub: 'heute ein Trockenlauf; bis Tag 5 freiwillig mehr', icon: Users }");
    expect(beamer(folie(PS, 'uebertrag'))).toContain('<strong>Bis Tag 5, freiwillig:</strong> Tests mit Menschen, die den Pain haben – fünf sind ideal.');
    const s = seite(PS);
    expect(s).toContain('\nLernkarte E2 – falls ihr testet\n');
    expect(s).not.toContain('T4 · 6 · Lernkarten');
    // Keine Folie und keine Notiz macht die fünf Tests zur Pflicht.
    const texte = [s, JSON.stringify(NOTIZEN_PROTOTYP_SPIKE)];
    expect(texte.flatMap((x) => x.match(/Bis Tag 5: fünf Tests|Fünf Tests', sub|alle fünf haben/g) ?? [])).toStrictEqual([]);
  });
  it('test-ablauf: gute und schlechte Aufgabe, laut denken erklärt, wer was wo notiert', () => {
    const t = beamer(folie(PS, 'test-ablauf'));
    expect(t).toContain('<b>So</b><span>„Du bist um 7:27 in der Halle, dein Zug fährt um 7:38. Hol dir einen Cappuccino.“</span>');
    expect(t).toContain('<b>Nicht so</b><span>„Scanne den Code und tippe auf Bestellen.“</span>');
    expect(t).toContain('<strong>Laut denken:</strong> Sie sagt, was sie sieht, sucht und vorhat. Ihr schweigt; stockt sie, höchstens: „Was würdest du jetzt tun?“');
    expect(t).toContain('<strong>Zu zweit:</strong> eine*r führt, eine*r notiert in „T4 · 5 · Prototyp · Produkt n“ – geschafft?, Zeit, wo gehangen; daraus U1, U2 …');
  });
  it('beispiel: fünf nummerierte Blätter, Blatt 3 ist der Höhepunkt', () => {
    const b = beamer(folie(PS, 'beispiel'));
    expect([...b.matchAll(/<li(?: class="[^"]+")?><span>([^<]+)<\/span>([^<]+)<\/li>/g)].map((m) => `${m[1]}: ${m[2]}`)).toStrictEqual([
      'Blatt 1: Getränk wählen', 'Blatt 2: Zug wählen', 'Blatt 3 · Höhepunkt: „Fertig 7:31. Dein Zug fährt 7:38.“', 'Blatt 4: Abholnummer', 'Blatt 5: Ansicht für die Bar',
    ]);
  });
  it('karte-e2: Annahme ohne Zeitgrenze, Zeit als Richtwert, „Wir entscheiden vorher“ auf Karte und in der Vorlage', () => {
    const f = folie(PS, 'karte-e2');
    expect(f).toContain('Wir glauben, dass Pendler*innen im Gehen ohne Hilfe bis zur Fertig-Zeit bestellen können.');
    expect(f).not.toContain('innerhalb von 20 Sekunden');
    expect(f).toContain('Zeit bis dahin (Richtwert aus A3: 20 Sekunden)');
    expect(f).toContain('Wir entscheiden vorher: ab 4 → Slice 1 bauen · 3 → Hänger beheben, mit drei weiteren testen · unter 3 → Ablauf neu skizzieren, E2 wiederholen</Prompt>');
    const s = seite(PS);
    expect(s).toContain('Wir haben recht, wenn [x] von 5 den Höhepunkt ohne Hilfe erreichen.\nWir entscheiden vorher: ab [x] → [...] · [...] → [...] · unter [...] → [...]\n');
    expect(s).toContain('Beleg: gestützt / widerlegt / unklar / neue Einsicht → darum: [...]\nWeicht ab von „Wir entscheiden vorher“? Grund: [...]\n');
  });
  it('beispiel-befunde: U1–U3 mit Zahl und Folge im Beamer, U2 wandert in Slice 1', () => {
    const b = beamer(folie(PS, 'beispiel-befunde'));
    expect(b).toContain('<tr data-schritt><th>U2</th><td>Zug eintippen dauert; alle suchen eine Liste der nächsten Abfahrten</td><td>5 von 5</td><td>„Zug aus der Liste“ wandert von Slice 2 in Slice 1</td></tr>');
    expect(b).toContain('<tr data-schritt><th>U3</th><td>Unklar, wo die Express-Ausgabe ist</td><td>3 von 5</td><td>Hinweis auf dem Höhepunkt-Bildschirm</td></tr>');
    expect(b).toContain('Ausgedacht');
  });
  // Rezept (Consult „Spike als Schritt-Folien“, 26.11.): Übersicht und sieben Schritt-Folien, Timer 10/3/2/40/10/10,
  // jede mit „Wo“ und „Fertig, wenn“.
  it('vorgehen: Übersicht mit sechs Schritten, dann sieben Schritt-Folien mit Wo, Fertig-wenn und Timer 10/3/2/40/10/10', () => {
    const timer = (f: string) => [...f.matchAll(/<Timer minuten=\{(\d+)\}(?: gruppe="([^"]+)")? \/>/g)].map((m) => (m[2] ? `${m[1]} ${m[2]}` : Number(m[1])));
    const schritte = ['schritt-papier', 'schritt-kriterien', 'schritt-zeitbox', 'schritt-bauen', 'schritt-ansehen', 'schritt-karte', 'schritt-trockenlauf'];
    expect(folie(PS, 'vorgehen')).toContain('<h2 id="vorgehen">So geht ihr vor (75 min)</h2>');
    expect(timer(folie(PS, 'vorgehen'))).toStrictEqual([]);
    // Schritt 4 erstreckt sich über zwei Folien: eine Uhr (gruppe), auf beiden sichtbar – zusammen 10 + 3 + 2 + 40 + 10 + 10.
    expect(schritte.flatMap((id) => timer(folie(PS, id)))).toStrictEqual([10, 3, 2, '40 spike-bauen', '40 spike-bauen', 10, 10]);
    expect(beamer(folie(PS, 'schritt-ansehen'))).toContain('<span class="wo-fertig-hinweis">Rest der 40 min · bei 5:00: Spike sichern</span>');
    for (const id of schritte) {
      const b = beamer(folie(PS, id));
      expect(b, id).toMatch(/<p class="wo-fertig"><span><strong>Wo:<\/strong> [^<]+/);
      expect(b, id).toContain('<span><strong>Fertig, wenn:</strong> ');
    }
    expect(schritte.map((id) => NOTIZEN_PROTOTYP_SPIKE[id]?.uebung?.dauer ?? null)).toStrictEqual(['10 min', '3 min', '2 min', '40 min (Schritt 4, zwei Folien)', null, '10 min', '10 min']);
  });
  it('Schritt 2 und 3: Abnahmekriterien als „zeigt / läuft / hat nicht“, Zeitbox als eigenes Feld', () => {
    const k = beamer(folie(PS, 'schritt-kriterien'));
    expect([...k.matchAll(/<li data-schritt><strong>(„[^<]+)<\/strong>/g)].map((m) => m[1])).toStrictEqual(['„Der Prototyp zeigt …“', '„Er läuft …“', '„Er hat nicht …“']);
    expect(k).toContain('<strong>Wo:</strong> Feld „2 · Abnahmekriterien“');
    expect(beamer(folie(PS, 'schritt-zeitbox'))).toContain('<strong>Wo:</strong> Feld „3 · Zeitbox“');
    expect(seite(PS)).toContain('\n3 · Zeitbox\nZeitbox: bis [Uhrzeit] (40 Minuten)\nZuerst gebaut: [Höhepunkt-Bildschirm]\nBei null fehlt noch: [...]\n');
  });
  it('Schritt 4: Fenster von 10:50, Opus mit Ausweich-Zeile, Bilder, Vorlesen vor dem Bauen; Sichern mit Link', () => {
    const b = beamer(folie(PS, 'schritt-bauen'));
    expect(b).toContain('<strong>Claude Code öffnen:</strong> dasselbe Fenster wie um 10:50 – euer Repo, Terminal, <code>claude</code>. Dann <code>/model opus</code>.');
    expect(b).toContain('Meldet Claude ein Limit oder gibt es Opus nicht: <code>/model</code> und das vorgeschlagene Standardmodell wählen.');
    expect(folie(PS, 'schritt-bauen')).toContain('Eine Datei öffnet oder schreibt ihr nicht');
    expect(beamer(folie(PS, 'schritt-ansehen'))).toContain('<strong>Fünf Minuten vor Schluss:</strong> Prompt „Spike sichern“ – Claude gibt euch den Link fürs Handy.');
  });
  it('Schritt 5 und 6: Karte E2 mit „Wir entscheiden vorher“; Trockenlauf in drei Runden, keine Kritik', () => {
    expect(beamer(folie(PS, 'schritt-karte'))).toContain('<strong>„Wir entscheiden vorher“:</strong> drei Bänder, je eine Handlung.');
    const t = beamer(folie(PS, 'schritt-trockenlauf'));
    expect(t).toContain('<tr><th>1</th><td>Produkt 2</td><td>Produkt 1</td><td>Produkt 3</td></tr>');
    expect(t).toContain('<strong>Kursregel – keine Kritik:</strong> kein Feedback danach. Nächste Runde.');
    expect(folie(PS, 'schritt-trockenlauf')).toContain('Der Trockenlauf ist heute euer Test des Prototyps.');
  });
  it('uebertrag: Übergabe an Scrum im Beamer', () => {
    expect(beamer(folie(PS, 'uebertrag'))).toContain('<strong>Nach der Pause:</strong> Agil und Scrum.');
  });
  it('Spike-Prompt: Screenshots der Miro-Frames, keine Dateien; Branch legt Claude Code an', () => {
    const s = seite(PS);
    expect(s).toContain('Unter dieser Nachricht stehen Bilder aus Miro: meine Usage Story mit sieben Stationen, meine Story Map mit Slice 1, meine Abnahmekriterien mit Zeitbox und Fotos meiner Papier-Skizzen, ein Blatt je Bildschirm.');
    expect(s).toContain('Bevor du baust: Zähl mir in höchstens sechs Zeilen auf, welche Bildschirme du baust');
    expect(s).toContain('- Der Prototyp liegt unter der Adresse /spike; die bestehende App änderst du nicht.');
    expect(s).not.toContain('[Bilder einfügen]');
    expect(s).toContain('Schickt den Prompt erst, wenn die Bilder darunter eingefügt sind.');
    expect(s).toContain('<Prompt label="Spike sichern · Claude Code">Committe den Stand auf dem aktuellen Spike-Branch und push ihn zu GitHub. Merge nichts nach main und öffne keinen Pull Request. Gib mir dann die Vorschau-Adresse, die Vercel für diesen Branch baut, mit /spike am Ende.');
    expect(s).toContain('<h2 id="vorlage">So sieht euer Frame aus</h2>');
    expect(s).toContain('<Prompt label="Miro · T4 · 5 · Prototyp · Produkt n">');
  });
  it('höchstens fünf live-Stichworte je Folie, auf beiden Seiten', () => {
    const zuViele = [...Object.entries(NOTIZEN_USAGE_STORY), ...Object.entries(NOTIZEN_PROTOTYP_SPIKE)].filter(([, n]) => n.live.length > 5).map(([id]) => id);
    expect(zuViele).toStrictEqual([]);
  });
});

// NACHTRAG 26.11. (abends): Studierende schreiben keine docs/*.md mehr – Usage Story, Karte E2, Abnahmekriterien und Befunde
// stehen auf Miro; Claude und Claude Code immer mit Opus.
describe('Usage Story und Prototyp-Spike: Miro statt Repo-Dateien, Opus', () => {
  it('keine docs/-Datei auf den Seiten und in den Notizen', () => {
    const texte = [seite(US), seite(PS), JSON.stringify(NOTIZEN_USAGE_STORY), JSON.stringify(NOTIZEN_PROTOTYP_SPIKE)];
    expect(texte.every((x) => x.length > 1000)).toBe(true);
    expect(texte.flatMap((x) => x.match(/docs\/[A-Z-]+\.md/g) ?? [])).toStrictEqual([]);
  });
  it('Usage Story: Frame „T4 · 4 · Usage Story · Produkt n“ mit Aufbau statt Datei-Vorlage', () => {
    const s = seite(US);
    expect(s).toContain('<h2 id="vorlage">So sieht euer Frame aus</h2>');
    expect(s).toContain('<Prompt label="Miro · T4 · 4 · Usage Story · Produkt n">');
  });
  it('Opus, ohne Versionsnummer: Spike-Schritt und beide Prüfungen', () => {
    expect(seite(PS).match(/\/model opus/g)?.length).toBeGreaterThanOrEqual(3);
    expect(seite(US)).toContain('<p>Mit Opus – in Claude Code <code>/model opus</code>.');
    expect(seite(PS)).toContain('<p>Mit Opus – in Claude Code <code>/model opus</code>.');
    expect([seite(US), seite(PS)].flatMap((x) => x.match(/Opus \d|opus-\d/gi) ?? [])).toStrictEqual([]);
  });
  // TODO Miro-IDs: Die Frames je Produkt haben noch keine IDs; die Seiten nennen sie als Text. Sobald sie in miro-frames.ts
  // stehen, schlägt dieser Test an: dann auf beiden Seiten <MiroLink> wie in concept-story#vorgehen.
  it('neue Frames: als Text, bis ihre IDs in miro-frames.ts stehen', () => {
    for (const [pfad, frame] of [[US, 'T4 · 4 · Usage Story · Produkt'], [PS, 'T4 · 5 · Prototyp · Produkt']] as const) {
      const bekannt = Object.keys(MIRO_FRAMES).some((n) => n.startsWith(frame));
      expect(bekannt, `${frame} ist jetzt in miro-frames.ts – auf ${pfad} als <MiroLink> verlinken`).toBe(false);
      expect(seite(pfad)).toContain(`${frame} n`);
    }
  });
});
