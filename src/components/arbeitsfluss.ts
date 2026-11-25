// Arbeitsfluss als Linienplan (NDU-71): Spalten sind Kurstage, Stationen sind Ergebnisse, drei Linien laufen durch –
// Beleg, Outcome, Annahme. Von Hand gepflegt wird je Station nur, was methoden.ts nicht hergibt: Kurzbeschriftung (≤ 5
// Wörter), Linie(n), Reihenfolge im Tag, ein Satz, „gebraucht in“ – und, wo nötig, Überschreibungen von Tag und Ergebnis.
// „Kommt aus“ im Übergangsstreifen folgt aus braucht (methoden.ts), außer wo eine Station es selbst sagt.
// Ohne Astro, damit testbar (arbeitsfluss.test.ts); gezeichnet in bild/Arbeitsfluss.astro, Streifen in Uebergang.astro.
//
// Kursentscheidungen (Markus, 25.11.2026): Die Concept Story wird an Tag 4 geschrieben (Station in Spalte 4). Der
// Entscheidungslog ist stillgelegt und hat keine Station; die Entscheidung nach einem Test steht auf der Lernkarte.
// Der Map-Entwurf von Tag 1 (T1 · 1) hat keine Methode in methoden.ts: Station „Vermutung“, ersetzt durch die Experience Map.
import { METHODEN, TAGE, type Methode } from './methoden';
import { heutigerTag as heuteNach, spalteVonTag } from './arbeitsfluss-heute';

export type Linie = 'beleg' | 'outcome' | 'annahme';
export type Spalte = 1 | 2 | 3 | 4 | 5;

/** Reihenfolge der Linien in Legende und Kanälen (links nach rechts im Kanal vor einer Spalte). */
export const LINIEN: Linie[] = ['beleg', 'outcome', 'annahme'];

export const LINIE: Record<Linie, { name: string; text: string; frage: string }> = {
  beleg: { name: 'Beleg', text: 'was Menschen erzählt haben. Trägt eine Zitat-ID.', frage: 'Woher wissen wir, dass es jemand braucht?' },
  outcome: { name: 'Outcome', text: 'was sie danach anders tun sollen. Ein Satz, von Tag 1 bis zum Pitch.', frage: 'Woran merken wir, dass es wirkt?' },
  annahme: { name: 'Annahme', text: 'was ihr noch nicht wisst. Wird getestet, nicht diskutiert.', frage: 'Was wissen wir noch nicht – und wie finden wir es heraus?' },
};

/** Spalte 5 fasst Tag 5–7 zusammen. */
export const SPALTEN: { n: Spalte; tag: string; titel: string; tage: number[] }[] = [
  { n: 1, tag: 'Tag 1', titel: 'Rahmen', tage: [1] },
  { n: 2, tag: 'Tag 2', titel: 'Erlebnis', tage: [2] },
  { n: 3, tag: 'Tag 3', titel: 'Lösung', tage: [3] },
  { n: 4, tag: 'Tag 4', titel: 'Prototyp', tage: [4] },
  { n: 5, tag: 'Tag 5–7', titel: 'Liefern', tage: [5, 6, 7] },
];

export interface Station {
  id: string;
  /** Beschriftung im Plan, höchstens fünf Wörter. */
  kurz: string;
  /** Erste Linie = Hauptlinie; mehrere = Umsteigepunkt: die Linien verzweigen zu dieser Station. */
  linien: Linie[];
  /** Kurstag-Spalte – darf vom tag der Methode abweichen (Concept Story: Tag 4). */
  spalte: Spalte;
  /** Rasterzeile in der Spalte – berechnet: Reihenfolge im Tagesablauf (Reihenfolge in STATIONEN). */
  zeile: number;
  /** Ein Satz: was ihr dort tut. */
  satz: string;
  /** „→ gebraucht in“, als Text mit „ · “ zwischen den Stellen. */
  gebrauchtIn: string;
  /** Methode in methoden.ts, falls es eine gibt. */
  methode?: string;
  /** Artefakt-IDs dieser Station; ohne Angabe alles, was die Methode ergibt. */
  ergebnis?: string[];
  /** Überschreibt „Kommt aus“ im Übergangsstreifen (sonst aus braucht). */
  kommtAus?: string[];
  /** Zweite Zeile im Kasten „Jetzt“ (sonst die Frage der Methode). */
  jetzt?: string;
  /** Hohler Punkt: Das Ergebnis endet hier oder wird ersetzt – mit Hinweis wohin. */
  endet?: string;
  /** Fortsetzung einer Station von einem früheren Tag (ID): gepunkteter Punkt, kein neues Ergebnis. */
  fortsetzung?: string;
  /** „Was bauen wir?“ */
  stern?: boolean;
  /** Kleiner Zusatz unter dem Satz (Handout, Stationstext). */
  zusatz?: string;
  /** Wohin die Station verlinkt (sonst die Methodenseite). */
  href?: string;
}

/** Je Spalte in der Reihenfolge des Tagesablaufs – daraus folgt die Rasterzeile. */
const ROH: Omit<Station, 'zeile'>[] = [
  // Tag 1 (Ablauf: Warm-up Toast, Problem-Rahmen, Annahmen-Map, Leitfaden)
  {
    id: 'map-entwurf', kurz: 'Map-Entwurf (Vermutung)', linien: ['beleg'], spalte: 1, href: '/innolab/tag-1#toast',
    endet: 'ersetzt durch die Experience Map',
    satz: 'Ihr zeichnet, wie eure Zielgruppe das Problem heute löst – als Vermutung, bevor ihr fragt.',
    gebrauchtIn: 'Problem-Rahmen · jedes „?“ wird eine Annahme · ersetzt durch die Map aus den Interviews',
  },
  {
    id: 'problem-rahmen', methode: 'problem-rahmen', kurz: 'Produkt-Brief mit Outcome', linien: ['outcome'], spalte: 1,
    kommtAus: ['Map-Entwurf (Vermutung)'],
    satz: 'Ihr legt fest, für wen ihr arbeitet und woran ihr merkt, dass es besser geworden ist.',
    gebrauchtIn: 'Wurzel des Baums · Rahmen der Story Map · Produktziel im Sprint · Pitch',
  },
  {
    id: 'annahmen', methode: 'annahmen', kurz: 'Annahmen zum Problem', linien: ['annahme'], spalte: 1,
    satz: 'Ihr schreibt auf, was ihr nur glaubt, und markiert, was wichtig und unbelegt ist.',
    gebrauchtIn: 'Forschungsfrage der Interviews · Belege nachtragen (Tag 2) · Annahmen der Idee (Tag 4)',
  },
  {
    id: 'interview', methode: 'interview', kurz: 'Interviewleitfaden', linien: ['annahme'], spalte: 1,
    endet: 'endet nach den Interviews',
    satz: 'Ihr fragt nach dem letzten konkreten Mal, nicht nach Meinungen.',
    gebrauchtIn: 'fünf Interviews – dort endet er',
  },
  // Tag 2 (Snapshots besprechen, Belege an die Annahmen, Experience Map)
  {
    id: 'synthese', methode: 'synthese', kurz: 'Snapshots mit Zitat-IDs', linien: ['beleg'], spalte: 2,
    kommtAus: ['Fünf Interviews', 'Annahmen zum Problem'],
    satz: 'Ihr haltet je Interview fest, was gesagt wurde – jede Stelle bekommt eine ID.',
    gebrauchtIn: 'Experience Map · Baum · Ziel-Chance · Kundenprofil · Krise der Storys',
  },
  {
    id: 'belege', kurz: 'Belege nachtragen', linien: ['annahme'], spalte: 2, href: '/innolab/methoden/synthese#pruefen',
    satz: 'Ihr tragt Zitat-IDs als Beleg an eure Annahmen – sie stützen sie oder sprechen dagegen.',
    gebrauchtIn: 'Annahmen-Map · offene „?“ an Tag 3',
  },
  {
    id: 'journey-map', methode: 'journey-map', kurz: 'Experience Map', linien: ['beleg'], spalte: 2,
    satz: 'Aus den Geschichten werden Momente: was Menschen tun und fühlen, in N von M Interviews.',
    gebrauchtIn: 'Äste des Baums · Gegenstück der Story Map · Auslöser der Usage Story',
  },
  // Tag 3
  {
    id: 'baum', methode: 'baum', kurz: 'Baum mit Chancen', linien: ['beleg', 'outcome'], spalte: 3,
    satz: 'Ihr hängt Bedürfnisse, Schmerzen und Wünsche unter die Momente – in den Worten der Kundschaft, mit Zitat-ID.',
    gebrauchtIn: 'Ziel-Chance · Kundenprofil · Lösungen und Tests (Tag 4)',
  },
  {
    id: 'ziel-chance', methode: 'ziel-chance', kurz: 'Ziel-Chance', linien: ['beleg'], spalte: 3,
    satz: 'Ihr vergleicht Geschwister durch vier Linsen und wählt ein Blatt.',
    gebrauchtIn: 'P1 im Kundenprofil · How-Might-We-Frage · Maßstab für jede Idee',
  },
  {
    id: 'kundenprofil', methode: 'kundenprofil', kurz: 'Kundenprofil', linien: ['beleg'], spalte: 3,
    satz: 'Ihr beschreibt ein Segment in Jobs, Pains und Gains, bevor es eine Idee gibt.',
    gebrauchtIn: 'Lückensätze · Fit · Concept Story · Geschäftsmodell (Wer?) · Story Map · Pitch',
  },
  {
    id: 'hmw', methode: 'hmw', kurz: 'How-Might-We-Frage', linien: ['beleg'], spalte: 3,
    endet: 'endet in der Ideation',
    satz: 'Eine Frage zur Ziel-Chance, die mehr als einen Weg zulässt.',
    gebrauchtIn: 'Ideation – dort endet sie: Gewählt wird an der Ziel-Chance',
  },
  {
    id: 'ideation', methode: 'ideation', kurz: 'Drei Lückensätze', linien: ['beleg'], spalte: 3,
    satz: 'Aus 15 bis 20 Ideen bleiben drei verschiedene, je als Satz gegen euer Profil.',
    zusatz: 'Eure Idee von Tag 1 ist hier ein Sticky unter vielen – ohne Vorsprung.',
    gebrauchtIn: 'Ideen-Vergleich · die drei Ideen im Baum (Tag 4) · die zwei anderen: je eine Zeile unter E1',
  },
  {
    id: 'value-map', methode: 'value-map', kurz: 'Spitzenreiter, Value Map, Fit', linien: ['beleg'], spalte: 3,
    satz: 'Ihr wählt eine Idee auf Papier, arbeitet aus, wie sie Wert schafft, und markiert, was offen bleibt.',
    gebrauchtIn: 'Concept Story · Geschäftsmodell (Was?) · Schritte der Idee · Story Map · jedes „?“ wird eine Annahme',
  },
  {
    id: 'offene-fragen', kurz: 'Offene „?“', linien: ['annahme'], spalte: 3, href: '/innolab/methoden/value-map#fit',
    satz: 'Jedes „?“ im Ideen-Vergleich und im Fit ist eine offene Frage.',
    gebrauchtIn: 'Annahmen der Idee (Tag 4)',
  },
  // Tag 4 (Ablauf ab 25.11.: 9:10 Value Map & Fit nachholen, 9:40 Concept Story, 10:30 Geschäftsmodell, 10:50 Experiment-
  // Karte, 11:20 Story Map, 13:35 Usage Story, 14:05 Prototyp-Spike, 15:45 Agil & Scrum, 17:15 Origin Story). Der Baum
  // wächst über den Tag mit (Ideen, Annahme, E1, E2) und steht nach dem Spike.
  {
    id: 'value-map-nachholen', fortsetzung: 'value-map', kurz: 'Value Map & Fit (Nachholen)', linien: ['beleg'], spalte: 4, ergebnis: [],
    href: '/innolab/methoden/value-map#vorgehen',
    satz: 'Wer an Tag 3 nicht fertig wurde, wählt den Spitzenreiter, ordnet seine Value Map und prüft den Fit.',
    gebrauchtIn: 'Concept Story · Geschäftsmodell (Was?) · Schritte der Idee · Story Map',
  },
  {
    id: 'concept-story', methode: 'concept-story', kurz: 'Concept Story', linien: ['beleg'], spalte: 4,
    kommtAus: ['Kundenprofil (P1)', 'Value Map', 'Zitate aus den Interviews', 'Outcome'], jetzt: 'Sieben Stationen, Krise und Höhepunkt',
    satz: 'Ihr erzählt, warum jemand euer Produkt dem vorzieht, was er heute tut – mit Krise und Höhepunkt.',
    gebrauchtIn: 'Geschäftsmodell · Experiment-Karte · Usage Story · Origin Story · Pitch',
  },
  {
    id: 'geschaeftsmodell', methode: 'geschaeftsmodell', kurz: 'Geschäftsmodell und seine Annahme', linien: ['annahme', 'outcome'], spalte: 4,
    kommtAus: ['Kundenprofil (Wer?)', 'Value Map (Was?)', 'Concept Story'], jetzt: 'Wie? und Wert? – und die Annahme dahinter',
    satz: 'Ihr klärt, wer wofür zahlt, und benennt den Satz, an dem das Modell hängt.',
    gebrauchtIn: 'Annahmen der Idee · Pitch',
  },
  {
    id: 'experiment', methode: 'experiment', kurz: 'Annahmen der Idee, Karte E1', linien: ['annahme'], spalte: 4, ergebnis: ['experimente'],
    kommtAus: ['Lückensatz und Value Map', 'Concept Story', 'eure „?“ von Tag 3', 'Annahmen-Map'], jetzt: 'Schritte, Annahmen, Map – Karte E1 mit Schwelle',
    satz: 'Ihr geht die Idee Schritt für Schritt durch, findet, was dafür stimmen muss, und legt für die riskanteste Annahme Test und Schwelle fest.',
    gebrauchtIn: 'Baum: Lösungen und Tests · E1 läuft bis Tag 5 · Lernkarte · Backlog',
  },
  {
    id: 'story-map', methode: 'story-map', kurz: 'Story Map: Slice 1', linien: ['beleg', 'outcome'], spalte: 4, stern: true,
    kommtAus: ['Spitzenreiter', 'Kundenprofil', 'Outcome aus dem Brief'], jetzt: 'Der Weg mit eurem Produkt; Slice 1',
    satz: 'Ihr erzählt den Weg mit eurem Produkt von Anfang bis Ende und schneidet das Kleinste heraus, mit dem ihr lernt.',
    gebrauchtIn: 'Usage Story · Bildschirme des Spikes · Issues an Tag 5',
  },
  {
    id: 'usage-story', methode: 'usage-story', kurz: 'Usage Story mit Höhepunkt', linien: ['beleg'], spalte: 4,
    kommtAus: ['Slice 1', 'Concept Story', 'Moment der Experience Map', 'P1'], jetzt: 'Sieben Stationen, Höhepunkt nahe am Ende',
    satz: 'Ihr legt fest, an welchem Bildschirm jemand den Wert erlebt – und wie schnell danach Schluss ist.',
    gebrauchtIn: 'Spike (Stationen 2–6) · Messgröße von E2 · Reihenfolge im Backlog · Demo im Pitch',
  },
  {
    id: 'prototyp-spike', methode: 'prototyp-spike', kurz: 'Prototyp-Spike, Karte E2', linien: ['beleg', 'annahme'], spalte: 4,
    kommtAus: ['Usage Story', 'Slice 1', 'eine Annahme'], jetzt: 'Papier, Spike, Karte E2',
    satz: 'Erst Papier, dann Wegwerf-Code: genug, damit fünf Menschen den Höhepunkt erreichen können – oder nicht.',
    gebrauchtIn: 'Baum: Lösungen und Tests · Fünf Tests bis Tag 5 · Befunde U… · Lernkarte · Issues',
  },
  {
    // Der Baum von Tag 3 wächst weiter (Torres: Lösungen und Annahmen-Tests unter der Ziel-Chance). Outcome läuft durch
    // ihn zurück (Wurzel), Annahme durch die Tests. Ergebnis bleibt der Baum (Artefakt baum, Station baum an Tag 3).
    id: 'baum-loesungen', kurz: 'Baum: Lösungen und Tests', linien: ['outcome', 'annahme'], spalte: 4, ergebnis: [],
    href: '/innolab/methoden/baum', fortsetzung: 'baum',
    kommtAus: ['Baum mit Chancen', 'Ziel-Chance', 'Drei Lückensätze', 'Karte E1', 'Karte E2'],
    satz: 'Unter den Stern kommen eure drei Ideen, unter den Spitzenreiter die riskanteste Annahme mit E1 und E2 – der Baum wächst bis zu den Tests.',
    gebrauchtIn: 'Lernkarten · Test-Debrief an Tag 5',
  },
  {
    // Lego4Scrum ist dieses Kursjahr stillgelegt (Markus, 25.11.): Die Station ist nur der Input Agil & Scrum.
    id: 'scrum', methode: 'scrum', kurz: 'Agil und Scrum', linien: ['outcome'], spalte: 4, ergebnis: [],
    href: '/innolab/methoden/scrum#agil',
    kommtAus: ['Outcome-Satz (wird Produktziel)'], jetzt: 'Wasserfall, Manifest, Scrum nach dem Guide',
    satz: 'Ihr seht an der Kaffeebar, wie Scrum ein Produkt in Sprints liefert – und wo der Kurs vom Scrum Guide abweicht.',
    gebrauchtIn: 'Team und Definition of Done (Tag 5) · Sprint',
  },
  {
    id: 'origin-story', methode: 'experiment', kurz: 'Origin Story', linien: ['annahme'], spalte: 4, ergebnis: ['origin'],
    href: '/innolab/methoden/experiment#origin-story',
    kommtAus: ['Concept Story', 'Value Map', 'Karte E1'], jetzt: 'Sehen – und eine Handlung',
    satz: 'Der Text, mit dem jemand euren Wert zum ersten Mal sieht – er führt zu genau einer Handlung.',
    gebrauchtIn: 'Text von E1 (die Handlung ist die Messgröße) · Pitch',
  },
  // Tag 5–7 (Test-Debrief, Team und Definition of Done, Backlog … Pitch)
  {
    id: 'lernkarten', kurz: 'Lernkarten aus E1, E2', linien: ['annahme'], spalte: 5, href: '/innolab/methoden/experiment#lernkarte',
    satz: 'Geglaubt, beobachtet, gelernt – und darum entschieden: weitermachen, umschwenken oder verwerfen.',
    gebrauchtIn: 'Slice 1 ändert sich · Issues aus Befunden · Pitch',
  },
  {
    id: 'produktziel', kurz: 'Produktziel und Messung', linien: ['outcome'], spalte: 5, ergebnis: ['team'], href: '/innolab/methoden/scrum#team',
    satz: 'Euer Outcome-Satz wird das Produktziel; die Definition of Done sagt, welches Ereignis ihn misst.',
    gebrauchtIn: 'jeder Sprint · Review · Pitch-Zahlen',
  },
  {
    id: 'backlog', kurz: 'Backlog, Sprint, Pitch', linien: ['beleg', 'outcome', 'annahme'], spalte: 5, href: '/innolab/methoden/backlog',
    satz: 'Aus Slice 1 werden Issues, aus Issues ein Inkrement, aus Belegen ein Pitch.',
    gebrauchtIn: 'Präsentation am 16.01.',
  },
];

export const STATIONEN: Station[] = ROH.map((s) => ({ ...s, zeile: ROH.filter((x) => x.spalte === s.spalte).indexOf(s) + 1 }));

/** So viele Zeilen hat der Plan: die längste Spalte. */
export const ZEILEN = Math.max(...STATIONEN.map((s) => s.zeile));

/** Stillgelegte Methoden ohne Station (Entscheidung 30, NDU-70). */
export const OHNE_STATION = ['entscheidungslog'];

export const station = (id: string): Station | undefined => STATIONEN.find((s) => s.id === id);
export const methodeVon = (s: Station): Methode | undefined => (s.methode ? METHODEN.find((m) => m.slug === s.methode) : undefined);

/** Artefakt-IDs einer Station: Überschreibung oder alles, was ihre Methode ergibt. */
export const ergebnisse = (s: Station): string[] => s.ergebnis ?? methodeVon(s)?.ergibt ?? [];

/** Die Station, an der ein Artefakt entsteht. */
export const stationVonArtefakt = (id: string): Station | undefined => STATIONEN.find((s) => ergebnisse(s).includes(id));

/** „Kommt aus“: Überschreibung, sonst die Stationen hinter braucht (ohne stillgelegte Artefakte), je einmal. */
export function kommtAus(s: Station): string[] {
  if (s.kommtAus) return s.kommtAus;
  const m = methodeVon(s);
  if (!m) return [];
  return [...new Set(m.braucht.map(stationVonArtefakt).filter((x): x is Station => !!x).map((x) => x.kurz))];
}

/** Ziel eines Links auf die Station. */
export const stationHref = (s: Station): string | undefined => s.href ?? (s.methode ? `/innolab/methoden/${s.methode}` : undefined);

/** Wörter einer Beschriftung (Leerzeichen trennen; „Map-Entwurf“ ist eins). */
export const woerter = (t: string): number => t.trim().split(/\s+/).filter(Boolean).length;

/** Spalte eines Kurstags (Tag 5, 6, 7 → Spalte 5). */
export { spalteVonTag };

/** Kurstag „heute“ nach den Terminen in TAGE (siehe arbeitsfluss-heute.ts). */
export const heutigerTag = (datum: string, tage: { n: number; datum?: string }[] = TAGE): number | undefined => heuteNach(datum, tage);

// Geometrie: Die Zeichnung liegt in einem viewBox-Raster (je Spalte 100 Einheiten breit, je Zeile 100 hoch) über dem
// CSS-Raster derselben Teilung, gestreckt (preserveAspectRatio="none", Striche mit non-scaling-stroke). Oben laufen die
// Schienen von Beleg und Outcome, unten die von Annahme; im Kanal links jeder Spalte fällt je Linie ein Stamm zu ihren
// Stationen, ein Ast führt zum Punkt der Station. Linien kreuzen so keine Beschriftung.
export const GEO = {
  breite: 100,
  zeile: 100,
  oben: 40, // Band für die Schienen oben (Anteil einer Zeile: 0.4)
  unten: 30, // Band für die Schiene unten (0.3)
  punktX: 15, // Punkt der Station, von links in der Spalte
  kanal: { annahme: 4, beleg: 7.5, outcome: 11 } as Record<Linie, number>,
  schiene: { outcome: 12, beleg: 28, annahme: 0 } as Record<Linie, number>,
};
export const HOEHE = GEO.oben + ZEILEN * GEO.zeile + GEO.unten;

/** y der Schiene einer Linie (Annahme läuft unten). */
export const schieneY = (l: Linie): number => (l === 'annahme' ? HOEHE - GEO.unten / 2 : GEO.schiene[l]);
/** Mitte einer Rasterzeile (1-basiert). */
export const zeileY = (z: number): number => GEO.oben + (z - 0.5) * GEO.zeile;
export const stammX = (sp: number, l: Linie): number => (sp - 1) * GEO.breite + GEO.kanal[l];
export const punktX = (sp: number): number => (sp - 1) * GEO.breite + GEO.punktX;
/** Bei Umsteigepunkten liegen die Äste leicht versetzt nebeneinander. */
export const astVersatz = (s: Station, l: Linie): number => (s.linien.length < 2 ? 0 : (s.linien.indexOf(l) - (s.linien.length - 1) / 2) * 7);

/** Was eine Spalte für eine Linie zeichnet: Schiene von der vorigen Spalte der Linie, Stamm, Äste (je ein SVG-Pfad). */
export function spaltenPfade(sp: Spalte, l: Linie, stationen: Station[] = STATIONEN): { schiene?: string; stamm?: string; aeste: string[] } {
  const hier = stationen.filter((s) => s.spalte === sp && s.linien.includes(l));
  if (hier.length === 0) return { aeste: [] };
  const y0 = schieneY(l);
  const x = stammX(sp, l);
  const vorher = stationen.filter((s) => s.spalte < sp && s.linien.includes(l)).map((s) => s.spalte);
  const von = vorher.length ? Math.max(...vorher) : undefined;
  const ys = hier.map((s) => zeileY(s.zeile) + astVersatz(s, l));
  const fern = l === 'annahme' ? Math.min(...ys) : Math.max(...ys);
  return {
    schiene: von === undefined ? undefined : `M${stammX(von, l)} ${y0}H${x}`,
    stamm: `M${x} ${y0}V${fern}`,
    aeste: hier.map((s) => `M${x} ${zeileY(s.zeile) + astVersatz(s, l)}H${punktX(sp)}`),
  };
}
