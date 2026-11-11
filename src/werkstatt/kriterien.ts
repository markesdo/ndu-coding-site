// Kriterien-Katalog (NDU-40): die häufigsten Schwächen in den Mappen, je Kriterium ein Paar schwach → stark aus dem
// Kursbeispiel Kaffeebar. Lehrende hängen ein Kriterium an ihr Feedback (NDU-41); die Studierenden sehen dann das Paar,
// nie eine Fassung für ihren eigenen Fall. Fester Katalog im Repo, kein Text aus einer KI.
//
// Regeln (kriterien.test.ts prüft sie):
// - Die starke Fassung steht wörtlich im Kaffeebar-Material (fundort: Beispieldatei der Werkstatt oder Methodenseite).
//   Ändert sich die Kaffeebar, wird der Test rot, und das Paar muss nachgezogen werden.
// - Die schwache Fassung steht entweder ebenso wörtlich auf einer Methodenseite oder ist ausdrücklich „für den Katalog
//   formuliert“ – als schwächere Fassung desselben Kaffeebar-Eintrags, nie im Widerspruch zum Beispiel.
// - Jede Quelle nennt die Methodenseite (mit Anker) und das Buch mit Seitenzahl, wie es auf der Seite zitiert wird.
import type { BriefAbschnitt } from './feedback.js';
import type { ArtefaktName } from './schemas/index.js';

/** Eine Fassung des Paars. Mit fundort steht text wörtlich in dieser Datei (Pfad ab Repo-Wurzel); formuliert = für den
 *  Katalog geschrieben. zusatz: was zur Zeile gehört, aber nicht im Satz steht (etwa die Art einer Annahme). */
export type Fassung =
  | { text: string; zusatz?: string; fundort: string; formuliert?: never }
  | { text: string; zusatz?: string; formuliert: true; fundort?: never };

export interface Kriterium {
  /** Stabil: steht später in mappe/feedback.json. Nie umbenennen, nur neue anhängen. */
  id: string;
  name: string;
  /** Zu welchen Artefakten das Kriterium passt. */
  artefakte: readonly ArtefaktName[];
  /** Nur beim Brief: zu welchen Abschnitten. Fehlt es, passt das Kriterium zum ganzen Brief. */
  abschnitte?: readonly BriefAbschnitt[];
  paar: {
    schwach: Fassung;
    stark: Fassung & { fundort: string };
    /** Ein Satz: warum die starke Fassung stärker ist. */
    warum: string;
  };
  quelle: {
    /** Methodenseiten mit Anker, z. B. /innolab/methoden/problem-rahmen#fehler-2. */
    seiten: readonly string[];
    /** Buch oder Artikel mit Seitenzahl, wie auf der Methodenseite zitiert. */
    buch: string;
  };
}

const BEISPIELE = 'src/werkstatt/beispiele';
const SEITEN = 'src/pages/innolab/methoden';
const TORRES = 'Teresa Torres, „Continuous Discovery Habits“ (2021)';
const BLAND = 'David J. Bland & Alexander Osterwalder, „Testing Business Ideas“ (2019)';
const FITZPATRICK = 'Rob Fitzpatrick, „The Mom Test“ (2013)';
const VPD = 'Alexander Osterwalder, Yves Pigneur, Greg Bernarda, Alan Smith, „Value Proposition Design“ (2014)';

export const KRITERIEN: readonly Kriterium[] = [
  {
    id: 'output-statt-outcome',
    name: 'Output statt Outcome',
    artefakte: ['brief'],
    abschnitte: ['outcome'],
    paar: {
      schwach: { text: 'Die App hat 500 Downloads.', fundort: `${SEITEN}/problem-rahmen.astro` },
      stark: {
        text: 'Wir glauben, dass Pendler*innen morgens Kaffee bekommen, ohne ihren Zug zu riskieren. Wir merken es, wenn mehr von ihnen mit Kaffee in den Zug steigen.',
        fundort: `${SEITEN}/problem-rahmen.astro`,
      },
      warum: '500 Downloads sagen nichts darüber, ob jemand seinen Zug erwischt; die starke Fassung beschreibt, was Menschen danach anders tun.',
    },
    quelle: { seiten: ['/innolab/methoden/problem-rahmen#fehler-2', '/innolab/tag-1#outcome-arten'], buch: `${TORRES}, S. 37–41` },
  },
  {
    id: 'outcome-nicht-messbar',
    name: 'Outcome nicht messbar',
    artefakte: ['brief'],
    abschnitte: ['outcome'],
    paar: {
      schwach: { text: 'Wenn Pendler*innen morgens zufriedener sind.', formuliert: true },
      stark: { text: 'Wenn mehr Pendler*innen morgens mit Kaffee in den Zug steigen – zuerst beobachtet an wenigen Testpersonen.', fundort: `${BEISPIELE}/brief.json` },
      warum: 'Zufriedenheit sieht man niemandem an; ob jemand mit Kaffee in den Zug steigt, lässt sich schon an wenigen Testpersonen beobachten und zählen – eine Zielzahl braucht es dafür noch nicht.',
    },
    quelle: { seiten: ['/innolab/methoden/problem-rahmen#fehler-2', '/innolab/tag-1#outcome-kaffeebar'], buch: `${TORRES}, S. 37–38, 44` },
  },
  {
    id: 'loesung-im-problem',
    name: 'Lösung im Problem oder in der Annahme',
    artefakte: ['brief', 'annahmen'],
    abschnitte: ['problem'],
    paar: {
      schwach: { text: 'Pendler*innen brauchen eine App zum Vorbestellen.', fundort: `${SEITEN}/problem-rahmen.astro` },
      stark: {
        text: 'Die Schlange ist morgens länger als die Zeit bis zur Abfahrt. Wer den Zug erreichen will, verzichtet auf Kaffee oder nimmt den Automaten.',
        fundort: `${BEISPIELE}/brief.json`,
      },
      warum: 'Die schwache Fassung lässt nur eine Lösung zu, die App; die starke beschreibt das Problem und lässt Platz für mehrere – auch für bessere, die erst in den Interviews auftauchen.',
    },
    quelle: { seiten: ['/innolab/methoden/problem-rahmen#fehler-1', '/innolab/methoden/problem-rahmen#loesungsraum'], buch: `${TORRES}, S. 94–95` },
  },
  {
    id: 'art-der-annahme',
    name: 'Art der Annahme passt nicht',
    artefakte: ['annahmen'],
    paar: {
      schwach: { text: 'Wir glauben, dass Pendler*innen im Gehen innerhalb von 20 Sekunden bestellen können.', zusatz: 'Art: wünschenswert', formuliert: true },
      stark: { text: 'Wir glauben, dass Pendler*innen im Gehen innerhalb von 20 Sekunden bestellen können.', zusatz: 'Art: bedienbar', fundort: `${BEISPIELE}/annahmen.json` },
      warum: 'Ob Pendler*innen im Gehen in 20 Sekunden bestellen können, fragt, ob sie damit zurechtkommen (bedienbar), nicht, ob sie es wollen (wünschenswert) – mit der falschen Art überseht ihr eine Art von Risiko.',
    },
    quelle: { seiten: ['/innolab/methoden/annahmen#arten'], buch: `${BLAND}, S. 32` },
  },
  {
    id: 'annahme-nicht-pruefbar',
    name: 'Annahme nicht als prüfbarer Satz',
    artefakte: ['annahmen', 'entscheidungen'],
    paar: {
      schwach: { text: 'Pendler*innen planen ihren Kaffee.', formuliert: true },
      stark: { text: 'Wir glauben, dass Pendler*innen schon vor der Ankunft am Bahnhof entscheiden, ob sie Kaffee holen.', fundort: `${BEISPIELE}/annahmen.json` },
      warum: 'Die schwache Fassung klingt wie eine Tatsache und sagt nicht, woran man es merkt; die starke ist als Annahme markiert und nennt einen Zeitpunkt, den Interviews widerlegen können – bei der Kaffeebar ist genau das passiert (D4).',
    },
    quelle: { seiten: ['/innolab/methoden/annahmen#beispiel', '/innolab/methoden/experiment#karte'], buch: `${BLAND}, S. 46` },
  },
  {
    id: 'meinungsfrage',
    name: 'Meinungsfrage statt Geschichte',
    artefakte: ['leitfaden'],
    paar: {
      schwach: { text: 'Findest du die Schlange nervig?', fundort: `${SEITEN}/interview.astro` },
      stark: { text: 'Was hast du gemacht, als die Schlange zu lang war?', fundort: `${SEITEN}/interview.astro` },
      warum: 'Auf eine Meinungsfrage kommt ein höfliches Ja; die starke Fassung fragt nach dem, was jemand an einem echten Morgen getan hat – das ist eine Tatsache, nach der man nachfragen kann.',
    },
    quelle: { seiten: ['/innolab/methoden/interview#statt-besser', '/innolab/methoden/interview#warum-geschichten'], buch: `${FITZPATRICK}, S. 24–29; ${TORRES}, S. 60–63` },
  },
  {
    id: 'verallgemeinerung',
    name: 'Verallgemeinerung statt letztes Mal',
    artefakte: ['leitfaden'],
    paar: {
      schwach: { text: 'Was fällt dir beim Kaffeeholen am Bahnhof schwer?', formuliert: true },
      stark: { text: 'Erzähl mir vom letzten Morgen, an dem du am Bahnhof Kaffee wolltest.', fundort: `${BEISPIELE}/leitfaden.json` },
      warum: '„Was fällt dir schwer?“ fragt nach allen Morgen zugleich, und die Antwort beschreibt das ideale Ich; der letzte Morgen hat eine Uhrzeit, eine Schlange und eine Entscheidung, nach denen man fragen kann.',
    },
    quelle: { seiten: ['/innolab/methoden/interview#forschungsfrage', '/innolab/methoden/interview#ausgraben'], buch: `${TORRES}, S. 60–61, 64–67; ${FITZPATRICK}, S. 24–29` },
  },
  {
    id: 'beleg-ohne-quelle',
    name: 'Beleg ohne Quelle',
    artefakte: ['annahmen', 'entscheidungen'],
    paar: {
      schwach: { text: 'Vorbestellen vor der Ankunft verworfen — 3 von 5 sagen, sie entscheiden erst in der Halle — Beleg: gesagt', formuliert: true },
      stark: {
        text: 'Vorbestellen vor der Ankunft verworfen — 3 von 5 sagen, sie entscheiden erst in der Halle — Beleg: gesagt (I2-4, I3-1, I5-3; bei I1 steht es nur in der Notiz)',
        fundort: `${SEITEN}/entscheidungslog.astro`,
      },
      warum: 'Mit den Zitat-IDs kann jede*r nachlesen, wer das gesagt hat; ohne sie bleibt „gesagt“ eine Behauptung – und bei „getan“ nennt die Beleg-Notiz die Quelle, etwa „Kassendaten September“.',
    },
    quelle: { seiten: ['/innolab/methoden/entscheidungslog#beispiel', '/innolab/methoden/annahmen#beleg'], buch: `${BLAND}, S. 52` },
  },
  {
    id: 'zwei-zielgruppen',
    name: 'Zwei Zielgruppen in einer',
    artefakte: ['brief'],
    abschnitte: ['fuerWen'],
    paar: {
      schwach: { text: 'Pendler*innen am Morgen und Büros in der Nähe, die Kaffee fürs Team bestellen', formuliert: true },
      stark: { text: 'Pendler*innen, die werktags zwischen 7:15 und 7:45 auf den Zug nach Wien warten', fundort: `${BEISPIELE}/brief.json` },
      warum: 'Pendler*innen kämpfen mit der Zeit bis zur Abfahrt, Büros mit Sammelbestellungen – zwei Gruppen mit zwei Problemen; die starke Fassung nennt eine Gruppe in einer konkreten Situation, sodass der ganze Brief auf dieselben Menschen passt.',
    },
    quelle: { seiten: ['/innolab/methoden/problem-rahmen#worum', '/innolab/methoden/kundenprofil#fehler'], buch: `${VPD}, S. 78 (PDF)` },
  },
];

/** Kriterium zur ID; undefined = gibt es im Katalog nicht. */
export function kriterium(id: string): Kriterium | undefined {
  return KRITERIEN.find((k) => k.id === id);
}

/** Passt das Kriterium zu diesem Artefakt und (beim Brief) zum Abschnitt? Ohne Zeile: zum ganzen Artefakt – dann reicht
 *  das Artefakt. Andere Zeilen-IDs (A2, F1 …) schränken nicht ein. Dieselbe Regel für die Auswahl im Leser und die Route. */
export function kriteriumPasst(k: Kriterium, artefakt: ArtefaktName, zeilenId?: string): boolean {
  if (!k.artefakte.includes(artefakt)) return false;
  if (artefakt === 'brief' && zeilenId !== undefined && k.abschnitte !== undefined) return (k.abschnitte as readonly string[]).includes(zeilenId);
  return true;
}

/** Die Kriterien zur Auswahl, in der Reihenfolge des Katalogs. */
export function kriterienFuer(artefakt: ArtefaktName, zeilenId?: string): Kriterium[] {
  return KRITERIEN.filter((k) => kriteriumPasst(k, artefakt, zeilenId));
}
