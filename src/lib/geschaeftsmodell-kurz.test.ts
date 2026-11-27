import { describe, expect, it } from 'vitest';
import { METHODEN } from '../components/methoden';
import { MIRO_FRAMES } from '../components/miro-frames';
import { NOTIZEN } from '../data/begleiter';
import { folienAus, notizSeiten, quellenAusGlob, uebungMinuten } from './begleiter';

// Dieselbe Glob-Form wie in pages/innolab/begleiter.astro.
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const PFAD = '/innolab/methoden/geschaeftsmodell';
const q = quellen[PFAD] ?? '';
// Bereiche [Anfang, Ende) jeder <Folie> im Quelltext.
const folienBereiche = (s: string) => [...s.matchAll(/<Folie\b[^>]*>/g)].map((m) => [m.index!, s.indexOf('</Folie>', m.index!)] as const);
const inFolie = (s: string, i: number) => folienBereiche(s).some(([a, b]) => i > a && i < b);

// Entscheidung Markus 26.11.2026: Geschäftsmodell gekürzt – keine Musterkarten-Runde mehr; der Block liefert die
// wirtschaftliche Annahme für die Annahmen-Map direkt vor der Experiment-Karte.
describe('Geschäftsmodell gekürzt (26.11.2026)', () => {
  it('Beamer-Folien in der neuen Reihenfolge', () => {
    expect(q.length).toBeGreaterThan(1000);
    expect(folienAus(PFAD, q).map((f) => f.id)).toStrictEqual(['warum-jetzt', 'vor-experiment', 'dreieck', 'modell', 'annahme', 'vorgehen', 'uebertrag']);
  });

  it('keine Karten-Folien: #muster und #beispiel gibt es nicht mehr, auch nicht innerhalb einer Folie', () => {
    expect(q.match(/id="(muster|beispiel|karten)"/g) ?? []).toStrictEqual([]);
    expect(q).not.toContain('Konfrontation:</strong>');
  });

  it('die Musterkarten stehen nur im Handout, hinter der letzten Folie', () => {
    const i = q.indexOf('<h2 id="musterkarten">');
    expect(i).toBeGreaterThan(0);
    expect(inFolie(q, i)).toBe(false);
    expect(q.lastIndexOf('<div', i)).toBe(q.lastIndexOf('<div class="nur-handout">', i));
    expect(i).toBeGreaterThan(folienBereiche(q).at(-1)![1]);
    // Die Kartentabelle hängt in diesem Abschnitt.
    const t = q.indexOf('{KARTEN.map(');
    expect(t).toBeGreaterThan(i);
    expect(inFolie(q, t)).toBe(false);
  });

  it('Übung: 10 min, Titel = Summe der Timer, ohne Karten', () => {
    const v = q.slice(q.indexOf('<h2 id="vorgehen">'), q.indexOf('</Folie>', q.indexOf('<h2 id="vorgehen">')));
    const timer = [...v.matchAll(/<Timer minuten=\{(\d+)\} \/>/g)].map((m) => Number(m[1]));
    expect(timer).toStrictEqual([4, 2, 2, 2]);
    expect(v).toContain('So geht ihr vor (10 min)</h2>');
    expect(v.match(/(?<!-)\bKarten?\b|Muster|Killerphrase/g) ?? []).toStrictEqual([]);
    expect(uebungMinuten(NOTIZEN[PFAD]?.vorgehen?.uebung?.dauer)).toBe(10);
  });

  // Seit 26.11. abends: keine docs-Dateien für Studierende – das Modell steht auf Miro, die Vorlage beschreibt den Frame.
  it('Frame statt Vorlage: ohne Kartentabelle und „Gewählt: [Muster]“, Kosten unter Wert?, keine docs-Datei', () => {
    const v = q.slice(q.indexOf('<h2 id="vorlage">'), q.indexOf('<h2 id="pruefen">'));
    expect(v).toContain('<h2 id="vorlage">So sieht euer Frame aus</h2>');
    expect(v.match(/Karte|Muster|Gewählt/g) ?? []).toStrictEqual([]);
    expect(v).toContain('<li><strong>Wert?</strong> Ertrag: wer zahlt wofür; wie die Kundschaft heute bezahlt. Kosten: die größten Posten.</li>');
    expect(v).toContain('<li><strong>Linie:</strong> [Outcome] führt zu [Impact], weil …</li>');
    expect(q.match(/docs\//g) ?? []).toStrictEqual([]);
    // Seit 27.11.2026 (Dozent): Prüfen selbst, ohne Claude-Hausaufgabe.
    expect(q).toContain('Euer Modell liegt nur auf Miro, in eurem Frame „T4 · 7 · Geschäftsmodell · Produkt n“, die wirtschaftliche Annahme in der Werkstatt. Prüft selbst mit der Liste unten und hakt ab, was erfüllt ist.');
  });

  it('Begleiter: jede Folie hat eine Notiz mit live-Stichworten, Seite zwischen Concept Story und Experiment', () => {
    const ohne = folienAus(PFAD, q).filter((f) => !NOTIZEN[PFAD]?.[f.id]?.live?.some((s) => s.trim() !== '')).map((f) => f.id);
    expect(ohne).toStrictEqual([]);
    const seiten = notizSeiten(NOTIZEN);
    expect(seiten.indexOf(PFAD)).toBe(seiten.indexOf('/innolab/methoden/concept-story') + 1);
    expect(seiten.indexOf('/innolab/methoden/experiment')).toBe(seiten.indexOf(PFAD) + 1);
  });

  it('Methode heißt „Geschäftsmodell“, Prüfliste ohne Muster', () => {
    const m = METHODEN.find((x) => x.slug === 'geschaeftsmodell')!;
    expect(m.name).toBe('Geschäftsmodell');
    expect(m.dauer).toBe(20);
    expect(m.pruefliste!.map((p) => p.id)).not.toContain('geschaeftsmodell-muster');
    expect([m.ki, ...m.pruefliste!.map((p) => p.text)].join(' ')).not.toMatch(/Muster|Karte/);
    expect(q).toContain('<Layout title="Geschäftsmodell">');
    expect(q).toContain('<h1>Geschäftsmodell</h1>');
  });

  it('kein Link mehr auf die gestrichenen Anker', () => {
    const treffer = Object.entries(quellen).flatMap(([p, s]) => (s.match(/geschaeftsmodell#(muster|karten|beispiel)\b/g) ?? []).map((x) => `${p}: ${x}`));
    expect(treffer).toStrictEqual([]);
  });
});

// Dozent 27.11.2026 (Beamer-Durchsicht): #vor-experiment erklärt, warum die wirtschaftliche Annahme vor der Experiment-Karte
// auf die Map kommt, was „wirtschaftlich“ heißt und was ihr schreibt; der Begleiter hat Tagesort, Geschichte und Fragen.
// #vorgehen hat die Miro-Pille oben rechts, das Handout (#vorlage) verlinkt Frames und Werkstatt wie die Folie.
describe('Geschäftsmodell: Warum vor der Experiment-Karte, Links (27.11.2026)', () => {
  const folie = (id: string) => {
    const a = q.indexOf(`<h2 id="${id}">`);
    return a < 0 ? '' : q.slice(a, q.indexOf('</Folie>', a));
  };
  const sichtbar = (id: string) => folie(id).slice(0, folie(id).indexOf('<div class="nur-handout">'));

  it('#vor-experiment: Folie-Satz, vier Zeilen und die sichtbare Idee in der Mitte', () => {
    const f = sichtbar('vor-experiment');
    expect(f).toContain('<p class="folie-satz">Gleich wählt ihr die riskanteste Annahme – dafür muss sie auf der Map stehen. Die wirtschaftliche fehlt dort oft.</p>');
    expect(f).toContain('mitte="Im Gehen bestellen" ideeSichtbar hervor={2}');
    expect([...f.matchAll(/<li data-schritt>(.*?)<\/li>/g)].map((m) => m[1])).toStrictEqual([
      '<strong>Wirtschaftlich heißt:</strong> Die Idee funktioniert für die Kundschaft – trägt sie sich auch für euch? („Should we build it?“)',
      '<strong>Oft vergessen:</strong> Kosten und Einnahmen – die meisten Teams haben einen blinden Fleck, manche genau diesen.',
      '<strong>Kaffeebar:</strong> Rechnen sich die zusätzlichen Bestellungen? – gleich als Annahme A4.',
      '<strong>Ein Satz, keine Kalkulation</strong> – getestet wird zuerst, ob es jemand will.',
    ]);
    // Kein Vorgriff: Die fertige A4 leitet erst #annahme her; hier steht nur der Verweis darauf.
    expect(f).not.toContain('mehr einbringen');
    expect(f).not.toContain('bringen mehr ein');
    expect(folie('annahme')).toContain('„Wir glauben, dass die zusätzlichen Bestellungen mehr einbringen, als Aufsteller, Bildschirm und Bestellseite kosten – ohne weitere Kraft am Morgen.“');
  });

  it('Begleiter #vor-experiment: Geschichte zum Tagesort, neue Fragen, live höchstens fünf', () => {
    const n = NOTIZEN[PFAD]['vor-experiment'];
    expect(n.live.length).toBeLessThanOrEqual(5);
    expect(n.geschichte?.text).toContain('ab 10:40, kommt das Geschäftsmodell. Um 11:00 folgt die Experiment-Karte');
    expect(n.geschichte?.text).toContain('wünschenswert, machbar, wirtschaftlich, bedienbar');
    expect(n.geschichte?.quelle).toMatch(/S\. 118, 128/);
    // Torres verallgemeinert nicht: erst der Bias der meisten Teams, dann „forget viability“ als ein Muster – ohne „Or“ am Zitatanfang.
    expect(n.geschichte?.text).toContain('„most teams have a bias toward one category or another.“ Ein Muster, das Torres nennt: „they always remember desirability and usability, but they forget viability.“');
    expect(n.geschichte?.text).not.toContain('„Or ');
    expect(n.fragen?.map((f) => f.frage)).toStrictEqual([
      'Ist das nicht viel zu früh für ein Geschäftsmodell?',
      'Müssen wir einen Preis festlegen?',
      'Was, wenn bei uns niemand zahlt?',
      'Warum testen wir sie nicht zuerst?',
      'Wie formulieren wir sie?',
    ]);
    expect(n.fragen?.[1].antwort).toContain('(Kursentscheidung)');
    expect(n.fragen?.[3].antwort).toContain('(S. 34–35, 39)');
    expect(n.fragen?.[2].antwort).toContain('Torres nennt Loss Leader (S. 118)');
    expect(n.fragen?.[2].antwort).not.toContain('erlaubt');
    // Die Zeiten der Geschichte stehen so im Tagesplan.
    const tag4 = quellen['/innolab/tag-4'] ?? '';
    expect(tag4).toContain('<Block time="10:40–11:00" type="uebung" title="Geschäftsmodell"');
    expect(tag4).toContain('<Block time="11:00–11:40" type="uebung" title="Experiment-Karte"');
  });

  it('#vorgehen: Miro-Pille oben rechts; #vorlage verlinkt die drei Frames, Kaffeebar, Anleitung und Werkstatt', () => {
    expect(folie('vorgehen')).toContain('<h2 id="vorgehen">So geht ihr vor (10 min)</h2>\n    <p class="folie-satz">Zwei Zeilen, eine Linie, ein Satz.</p>\n    <MiroFrame name="T4 · 7 · Anleitung Geschäftsmodell" />');
    const v = q.slice(q.indexOf('<h2 id="vorlage">'), q.indexOf('<h2 id="pruefen">'));
    for (const n of [1, 2, 3]) expect(v).toContain(`<MiroLink name="T4 · 7 · Geschäftsmodell · Produkt ${n}">`);
    expect(v).toContain('<MiroLink name="T4 · 7 · Geschäftsmodell · Kaffeebar">Kaffeebar</MiroLink>');
    expect(v).toContain('<MiroLink name="T4 · 7 · Anleitung Geschäftsmodell">Anleitung</MiroLink>');
    expect(v).toContain('<a href="/innolab/mappe?bearbeiten=annahmen">');
    // Jeder Frame-Name der Seite ist im Board bekannt, sonst bleibt der Link Text.
    const namen = [...q.matchAll(/<Miro(?:Link|Frame) name="([^"]+)"/g)].map((m) => m[1]);
    expect(namen.length).toBeGreaterThan(5);
    expect(namen.filter((n) => !Object.hasOwn(MIRO_FRAMES, n))).toStrictEqual([]);
  });
});
