// Kriterien-Katalog (NDU-40): die häufigsten Schwächen in den Mappen, je Kriterium ein Paar schwach → stark aus dem
// Kursbeispiel Kaffeebar. Lehrende hängen ein Kriterium an ihr Feedback (NDU-41); die Studierenden sehen dann das Paar,
// nie eine Fassung für ihren eigenen Fall. Fester Katalog im Repo, kein Text aus einer KI.
//
// Regeln (kriterien.test.ts prüft sie):
// - Die starke Fassung steht wörtlich im Kaffeebar-Material (fundort: Beispieldatei der Werkstatt oder Methodenseite).
//   Ändert sich die Kaffeebar, wird der Test rot, und das Paar muss nachgezogen werden.
// - Die schwache Fassung steht entweder ebenso wörtlich auf einer Methodenseite oder ist ausdrücklich „für den Katalog
//   formuliert“ – als schwächere Fassung desselben Kaffeebar-Eintrags, nie im Widerspruch zum Beispiel.
// - Jede Quelle nennt die Methodenseite (mit Anker) und das Buch mit Seitenzahl, im Buch nachgeprüft (Torres: Seiten
//   wie auf der Website; Mom Test, Bland: Druckseite; Value Proposition Design: PDF-Seite). Was nicht aus dem Buch
//   kommt, sondern eine Regel des Kurses ist, steht als kursregel daneben.
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
    /** Methodenseiten mit Anker (z. B. /innolab/methoden/problem-rahmen#fehler-2) und Linktext „Seite – Überschrift des
     *  Ankers“, wörtlich wie auf der Seite (kriterien.test.ts prüft das). So unterscheiden sich zwei Links auf dieselbe Seite. */
    seiten: readonly { href: string; titel: string }[];
    /** Buch oder Artikel mit Seitenzahl. */
    buch: string;
    /** Was eine Regel des Kurses ist und nicht aus dem Buch stammt (Satz für die Studierenden). */
    kursregel?: string;
  };
}

/** Form jeder Kriteriums-ID; feedback@1 liest nur diese Form (kriterien.test.ts prüft den ganzen Katalog dagegen). */
export const KRITERIUM_ID = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

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
      warum: '„500 Downloads“ zählt, wie oft eine schon gewählte Lösung genutzt wird – eine Traction Metric, die die Lösung festlegt (wie „viele Buchungen“); die starke Fassung beschreibt, was Menschen danach anders tun.',
    },
    quelle: {
      seiten: [
        { href: '/innolab/methoden/problem-rahmen#fehler-2', titel: 'Problem-Rahmen & Produkt-Brief – Fehler 2: Der Output steckt im Outcome' },
        { href: '/innolab/tag-1#outcome-arten', titel: 'Tag 1 – Drei Arten von Zielen' },
      ],
      buch: `${TORRES}, S. 37–41`,
    },
  },
  {
    id: 'outcome-nicht-messbar',
    name: 'Outcome nicht messbar',
    artefakte: ['brief'],
    abschnitte: ['outcome'],
    paar: {
      schwach: { text: 'Wenn Pendler*innen morgens zufriedener sind.', formuliert: true },
      stark: { text: 'Wenn mehr Pendler*innen morgens mit Kaffee in den Zug steigen – zuerst beobachtet an wenigen Testpersonen.', fundort: `${BEISPIELE}/brief.json` },
      warum: 'Ob jemand zufriedener ist, könnt ihr nur erfragen – das bleibt „gesagt“; ob jemand mit Kaffee in den Zug steigt, könnt ihr an wenigen Testpersonen beobachten und zählen – das ist „getan“, und eine Zielzahl braucht es dafür noch nicht.',
    },
    quelle: {
      seiten: [
        { href: '/innolab/methoden/problem-rahmen#fehler-2', titel: 'Problem-Rahmen & Produkt-Brief – Fehler 2: Der Output steckt im Outcome' },
        { href: '/innolab/methoden/annahmen#beleg', titel: 'Annahmen-Map – Was zählt als Beleg?' },
      ],
      buch: `${TORRES}, S. 37–38, 44; ${BLAND}, S. 52`,
    },
  },
  {
    id: 'loesung-im-problem',
    name: 'Lösung im Problem',
    artefakte: ['brief'],
    abschnitte: ['problem'],
    paar: {
      schwach: { text: 'Pendler*innen brauchen eine App zum Vorbestellen.', fundort: `${SEITEN}/problem-rahmen.astro` },
      stark: {
        text: 'Die Schlange ist morgens länger als die Zeit bis zur Abfahrt. Wer den Zug erreichen will, verzichtet auf Kaffee oder nimmt den Automaten.',
        fundort: `${BEISPIELE}/brief.json`,
      },
      warum: 'Die schwache Fassung lässt nur eine Lösung zu, die App; die starke beschreibt das Problem und lässt Platz für mehrere – auch für bessere, die erst in den Interviews auftauchen.',
    },
    quelle: {
      seiten: [
        { href: '/innolab/methoden/problem-rahmen#fehler-1', titel: 'Problem-Rahmen & Produkt-Brief – Fehler 1: Die Lösung steckt im Problem' },
        { href: '/innolab/methoden/problem-rahmen#loesungsraum', titel: 'Problem-Rahmen & Produkt-Brief – Ein Problem, mehrere Lösungen' },
      ],
      buch: `${TORRES}, S. 94–95`,
    },
  },
  {
    id: 'zielgruppe-zu-vage',
    name: 'Zielgruppe zu vage',
    artefakte: ['brief'],
    abschnitte: ['fuerWen'],
    paar: {
      schwach: { text: 'Kaffeetrinker*innen', fundort: `${SEITEN}/problem-rahmen.astro` },
      stark: { text: 'Pendler*innen, die werktags zwischen 7:15 und 7:45 auf ihren festen Morgenzug warten', fundort: `${BEISPIELE}/brief.json` },
      warum: '„Kaffeetrinker*innen“ sind fast alle – wen ihr wo trefft und was sie gemeinsam haben, sagt das nicht; die starke Fassung nennt Menschen in einer konkreten Situation, mit Ort und Uhrzeit, und damit auch, wo ihr sie für Interviews findet.',
    },
    quelle: {
      seiten: [
        { href: '/innolab/methoden/problem-rahmen#fehler-2', titel: 'Problem-Rahmen & Produkt-Brief – Fehler 2: Der Output steckt im Outcome' },
        { href: '/innolab/methoden/problem-rahmen#nach-claude', titel: 'Problem-Rahmen & Produkt-Brief – Nach der Prüfung: Claude findet, ihr entscheidet' },
      ],
      buch: `${FITZPATRICK}, S. 94, 97`,
    },
  },
  {
    id: 'zwei-zielgruppen',
    name: 'Zwei Zielgruppen in einer',
    artefakte: ['brief'],
    abschnitte: ['fuerWen'],
    paar: {
      schwach: { text: 'Pendler*innen am Morgen und Büros in der Nähe, die Kaffee fürs Team bestellen', formuliert: true },
      stark: { text: 'Zielgruppe: Pendler*innen mit festem Morgenzug, 7:15–7:45, egal wohin', fundort: `${BEISPIELE}/entscheidungen.json` },
      warum: 'Pendler*innen kämpfen mit der Zeit bis zur Abfahrt, Büros mit Sammelbestellungen – zwei Gruppen mit zwei Problemen; die Kaffeebar hat sich nach den Interviews für eine Gruppe entschieden (D3), sodass der ganze Brief auf dieselben Menschen passt.',
    },
    quelle: {
      seiten: [
        { href: '/innolab/methoden/problem-rahmen#worum', titel: 'Problem-Rahmen & Produkt-Brief – Worum es geht' },
        { href: '/innolab/methoden/kundenprofil#fehler', titel: 'Kundenprofil – Sechs häufige Fehler' },
      ],
      buch: `${VPD}, S. 78 (PDF)`,
    },
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
    quelle: {
      seiten: [{ href: '/innolab/methoden/annahmen#arten', titel: 'Annahmen-Map – Vier Arten von Annahmen' }],
      buch: `${BLAND}, S. 32; ${TORRES}, S. 118, 132`,
    },
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
    quelle: {
      seiten: [
        { href: '/innolab/methoden/annahmen#beispiel', titel: 'Annahmen-Map – Am Beispiel: die riskanteste Annahme' },
        { href: '/innolab/methoden/annahmen#werkstatt-ausfuellen', titel: 'Annahmen-Map – Die Map in der Werkstatt' },
      ],
      buch: `${BLAND}, S. 30–31`,
    },
  },
  {
    id: 'zwei-annahmen-in-einer',
    name: 'Zwei Annahmen in einem Satz',
    artefakte: ['annahmen'],
    paar: {
      schwach: { text: 'Wir glauben, dass die Bar morgens 40 Bestellungen in 30 Minuten zubereiten kann und sich das ohne eine weitere Kraft rechnet.', formuliert: true },
      stark: { text: 'Wir glauben, dass die Bar morgens 40 Bestellungen in 30 Minuten zubereiten kann.', zusatz: 'Art: machbar; ob es sich rechnet, steht als eigene Annahme A4', fundort: `${BEISPIELE}/annahmen.json` },
      warum: 'Die schwache Fassung prüft zwei Dinge auf einmal: Fällt der Test schlecht aus, wisst ihr nicht, ob die Zeit oder das Geld nicht reicht; getrennt lässt sich jede Annahme für sich einordnen und prüfen (A2 machbar, A4 wirtschaftlich).',
    },
    quelle: {
      seiten: [
        { href: '/innolab/methoden/annahmen#werkstatt-ausfuellen', titel: 'Annahmen-Map – Die Map in der Werkstatt' },
        { href: '/innolab/methoden/annahmen#arten', titel: 'Annahmen-Map – Vier Arten von Annahmen' },
      ],
      buch: `${BLAND}, S. 31`,
    },
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
      warum: 'Mit den Zitat-IDs kann jede*r nachlesen, wer das gesagt hat; ohne sie bleibt „gesagt“ eine Behauptung.',
    },
    quelle: {
      seiten: [
        { href: '/innolab/methoden/entscheidungslog#beispiel', titel: 'Entscheidungslog – Am Beispiel: die Kaffeebar am Bahnhof' },
        { href: '/innolab/methoden/annahmen#beleg', titel: 'Annahmen-Map – Was zählt als Beleg?' },
      ],
      buch: `${BLAND}, S. 52–53`,
      kursregel: 'Ein Beleg nennt, woher er kommt: Interview oder Zitat (I3, I3-2), bei „getan“ die Beleg-Notiz oder eine Entscheidung (D…); ohne Quelle ist der Beleg „noch keiner“.',
    },
  },
  {
    id: 'beleg-ueberschaetzt',
    name: 'Beleg zu stark eingestuft',
    artefakte: ['annahmen', 'entscheidungen'],
    paar: {
      schwach: { text: 'Vorbestellen vor der Ankunft verworfen — 3 von 5 sagen, sie entscheiden erst in der Halle — Beleg: getan (I2-4, I3-1, I5-3)', formuliert: true },
      stark: {
        text: 'Vorbestellen vor der Ankunft verworfen — 3 von 5 sagen, sie entscheiden erst in der Halle — Beleg: gesagt (I2-4, I3-1, I5-3; bei I1 steht es nur in der Notiz)',
        fundort: `${SEITEN}/entscheidungslog.astro`,
      },
      warum: 'Was Pendler*innen im Interview sagen, ist eine Aussage, keine Beobachtung – „getan“ hieße, jemand hat gesehen oder gemessen, wo sie entscheiden; darum bleibt D4 bei „gesagt“ und ist vorläufig.',
    },
    quelle: {
      seiten: [
        { href: '/innolab/methoden/entscheidungslog#beleg-staerke', titel: 'Entscheidungslog – Wie stark ist euer Beleg?' },
        { href: '/innolab/methoden/annahmen#beleg', titel: 'Annahmen-Map – Was zählt als Beleg?' },
      ],
      buch: `${BLAND}, S. 52`,
      kursregel: 'Interviews bringen einen Beleg höchstens auf „erzählt“; „getan“ heißt beobachtet, gemessen oder bezahlt.',
    },
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
    quelle: {
      seiten: [
        { href: '/innolab/methoden/interview#statt-besser', titel: 'Jobs to be Done & Mom Test – Eure Fragen umschreiben' },
        { href: '/innolab/methoden/interview#warum-geschichten', titel: 'Jobs to be Done & Mom Test – Warum Meinungsfragen täuschen' },
      ],
      buch: `${FITZPATRICK}, S. 13, 16, 24–29; ${TORRES}, S. 60–63`,
    },
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
    quelle: {
      seiten: [
        { href: '/innolab/methoden/interview#forschungsfrage', titel: 'Jobs to be Done & Mom Test – Was ihr wissen wollt ≠ was ihr fragt' },
        { href: '/innolab/methoden/interview#ausgraben', titel: 'Jobs to be Done & Mom Test – Die Geschichte ausgraben' },
      ],
      buch: `${TORRES}, S. 60–67; ${FITZPATRICK}, S. 28–31`,
    },
  },
  {
    id: 'suggestivfrage',
    name: 'Suggestiv- oder Pitch-Frage',
    artefakte: ['leitfaden'],
    paar: {
      schwach: { text: 'Würdest du eine App zum Vorbestellen nutzen?', fundort: `${SEITEN}/interview.astro` },
      stark: { text: 'Was hast du schon ausprobiert, um das zu umgehen? Was hat es dich gekostet (Zeit, Geld, Nerven)?', fundort: `${BEISPIELE}/leitfaden.json` },
      warum: 'Die schwache Fassung stellt eure Idee vor und fragt nach der Zukunft – darauf sagen fast alle Ja; die starke fragt, was die Person heute schon tut und was es sie kostet, und die Idee kommt gar nicht vor.',
    },
    quelle: {
      seiten: [
        { href: '/innolab/methoden/interview#mom-test', titel: 'Jobs to be Done & Mom Test – Der Mom Test' },
        { href: '/innolab/methoden/interview#fragen-matrix', titel: 'Jobs to be Done & Mom Test – Wo liegen eure Fragen?' },
      ],
      buch: `${FITZPATRICK}, S. 13, 16`,
    },
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

/** Nach einem Wechsel der Zeile in der Auswahl der Lehrenden: das gewählte Kriterium, wenn es noch passt, sonst keins ('').
 *  So taucht ein verworfenes Kriterium nicht still wieder auf, wenn man zur alten Zeile zurückwechselt. */
export function kriteriumBehalten(artefakt: ArtefaktName, zeilenId: string | undefined, id: string): string {
  const k = kriterium(id);
  return k && kriteriumPasst(k, artefakt, zeilenId) ? id : '';
}
