import { describe, expect, it } from 'vitest';
import { NOTIZEN_USAGE_STORY } from '../data/begleiter/usage-story';
import { NOTIZEN_PROTOTYP_SPIKE } from '../data/begleiter/prototyp-spike';
import { folienAus, quellenAusGlob } from './begleiter';

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
    expect(f).toContain('<strong>Festhalten</strong> in <code>docs/STORYS.md</code>, Abschnitt „Usage Story“. <Timer minuten={2} />');
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
    expect(ids(PS)).toStrictEqual(['worum', 'was-er-zeigt', 'fuenf', 'test-ablauf', 'karte-e2', 'beispiel', 'beispiel-befunde', 'vorgehen', 'vorgehen-test', 'uebertrag']);
  });
  it('worum: Weg von der Usage Story, Kursregel gekennzeichnet, Abnahmekriterien erklärt', () => {
    const b = beamer(folie(PS, 'worum'));
    expect(b).toContain("{ t: 'Usage Story', sub: 'Stationen 2 bis 6', icon: BookOpen }");
    expect(b).toContain('<strong>Kursregel – Papier vor Claude:</strong>');
    expect(b).toContain('<strong>Abnahmekriterien:</strong> drei Sätze, was der Prototyp zeigen muss – und was er nicht hat.');
    expect(b).not.toContain('gestrahlt');
  });
  it('fuenf und test-ablauf: 85 % mit Nomen, gute und schlechte Aufgabe im Beamer', () => {
    expect(beamer(folie(PS, 'fuenf'))).toContain('<strong>Fünf Personen</strong> finden rund 85 % der Bedienprobleme.');
    const t = beamer(folie(PS, 'test-ablauf'));
    expect(t).toContain('<b>So</b><span>„Du bist um 7:27 in der Halle, dein Zug fährt um 7:38. Hol dir einen Cappuccino.“</span>');
    expect(t).toContain('<b>Nicht so</b><span>„Scanne den Code und tippe auf Bestellen.“</span>');
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
  it('vorgehen + vorgehen-test: 75 min auf zwei Folien, Prompt und Vorschau benannt, Trockenlauf „keine Kritik“', () => {
    const a = folie(PS, 'vorgehen');
    const b = folie(PS, 'vorgehen-test');
    const timer = (f: string) => [...f.matchAll(/<Timer minuten=\{(\d+)\} \/>/g)].map((m) => Number(m[1]));
    expect([timer(a), timer(b)]).toStrictEqual([[10, 5, 40], [10, 10]]);
    expect(a).toContain('<h2 id="vorgehen">So geht ihr vor (75 min) – 1: bauen</h2>');
    expect(a).toContain('Prompt „Spike · Claude Code“ aus dem Handout');
    expect(a).toContain('<strong>Am Handy ansehen:</strong> als Vercel-Vorschau.');
    expect(a).not.toContain('Stopp bei null');
    expect(b).toContain('<p class="folie-satz">Ein Testlauf, keine Kritik.</p>');
    expect(beamer(b)).toContain('<strong>Kursregel – keine Kritik:</strong> kein Feedback danach.');
    expect(NOTIZEN_PROTOTYP_SPIKE.vorgehen.uebung?.dauer).toBe('55 min (10 + 5 + 40)');
    expect(NOTIZEN_PROTOTYP_SPIKE['vorgehen-test'].uebung?.dauer).toBe('20 min (10 + 10)');
  });
  it('uebertrag: Übergabe an Scrum im Beamer', () => {
    expect(beamer(folie(PS, 'uebertrag'))).toContain('<strong>Nach der Pause:</strong> Agil und Scrum.');
  });
  it('höchstens fünf live-Stichworte je Folie, auf beiden Seiten', () => {
    const zuViele = [...Object.entries(NOTIZEN_USAGE_STORY), ...Object.entries(NOTIZEN_PROTOTYP_SPIKE)].filter(([, n]) => n.live.length > 5).map(([id]) => id);
    expect(zuViele).toStrictEqual([]);
  });
});
