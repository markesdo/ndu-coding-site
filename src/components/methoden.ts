// Toolbox des Innolabs: jede Methode beantwortet eine Frage und ergibt ein Artefakt. Spätere Methoden bauen auf
// diesen Artefakten auf, statt sie neu zu erarbeiten (Chancen etwa nur im Baum; das Kundenprofil übernimmt sie mit ihren Zitat-IDs). methoden.test.ts prüft die Kette.
// Ohne Astro, damit testbar.
import type { ArtefaktName } from '../werkstatt/schemas/index.js';
import { MCP_WERKZEUGE } from '../werkstatt/vertrag.js';
import { MOM_TEST_GRUPPE, NACH_MOM_TEST } from './innolab-zeiten.js';

export type Ort = 'repo' | 'miro' | 'linear' | 'live' | 'vortrag' | 'werkstatt';

export const ORTE: Record<Ort, string> = {
  repo: 'Repo',
  miro: 'Miro',
  linear: 'Linear',
  live: 'Live-App',
  vortrag: 'Präsentation',
  werkstatt: 'Werkstatt',
};

export interface Artefakt {
  id: string;
  name: string;
  lebtIn: Ort[];
  /** Datei oder Abschnitt im Projekt-Repo, wenn es dort festgehalten wird; nur in der Werkstatt: die Datei in der Mappe. */
  pfad?: string;
  /** Name in der Werkstatt-Mappe, wenn das Artefakt dort bearbeitet wird. Die IDs hier bleiben, auch wo die Werkstatt
   *  anders heißt („transkripte“ → leitfaden). Interview-Notizen kommen nie ins App-Repo (öffentlich), nur
   *  pseudonymisiert in die private Mappe (interviews). */
  werkstatt?: ArtefaktName;
  /** Hausaufgabe zwischen zwei Kurstagen: fällig zu Kurstag bisTag (sonst am Tag nach der Methode), anzahl = so viele
   *  Einträge je Person (tag_stand zählt mit). */
  hausaufgabe?: { bisTag: number; anzahl?: number };
}

export const ARTEFAKTE: Artefakt[] = [
  { id: 'brief', name: 'Produkt-Brief mit Outcome-Metrik', lebtIn: ['werkstatt'], pfad: 'mappe/brief.json', werkstatt: 'brief' },
  { id: 'entscheidungen', name: 'Entscheidungslog', lebtIn: ['werkstatt'], pfad: 'mappe/entscheidungen.json', werkstatt: 'entscheidungen' },
  { id: 'transkripte', name: 'Leitfaden und Interview-Notizen (pseudonymisiert)', lebtIn: ['werkstatt'], pfad: 'mappe/leitfaden.json', werkstatt: 'leitfaden' },
  { id: 'annahmen', name: 'Annahmen-Map', lebtIn: ['miro', 'werkstatt'], pfad: 'mappe/annahmen.json', werkstatt: 'annahmen' },
  { id: 'synthese', name: 'Interviews mit Snapshots (pseudonymisiert)', lebtIn: ['miro', 'werkstatt'], pfad: 'mappe/interviews.json', werkstatt: 'interviews', hausaufgabe: { bisTag: 2, anzahl: 5 } },
  { id: 'profil', name: 'Kundenprofil (Jobs, Pains, Gains), je Spalte geordnet', lebtIn: ['miro', 'repo'], pfad: 'docs/KUNDENPROFIL.md' },
  { id: 'journey', name: 'Experience Map mit Momenten (Äste des Baums)', lebtIn: ['miro', 'repo'], pfad: 'docs/JOURNEY.md' },
  { id: 'baum', name: 'Opportunity Solution Tree (Chancen unter den Momenten)', lebtIn: ['miro', 'repo'], pfad: 'docs/BAUM.md' },
  { id: 'ziel', name: 'Ziel-Chance mit vier Linsen und Ulwick-Gegenprobe', lebtIn: ['miro', 'repo'], pfad: 'docs/ZIEL-CHANCE.md' },
  { id: 'chancen', name: 'How-Might-We-Frage zur Ziel-Chance', lebtIn: ['miro', 'repo'], pfad: 'docs/HMW.md' },
  { id: 'ideen', name: 'Drei Ideen für die Ziel-Chance', lebtIn: ['miro', 'repo'], pfad: 'docs/IDEEN.md' },
  { id: 'valuemap', name: 'Value Map der gewählten Idee mit Fit-Vergleich', lebtIn: ['miro', 'repo'], pfad: 'docs/VALUE-MAP.md' },
  { id: 'concept', name: 'Concept Story', lebtIn: ['repo'], pfad: 'docs/STORYS.md' },
  { id: 'experimente', name: 'Experiment-Karten', lebtIn: ['repo'], pfad: 'docs/EXPERIMENTE.md' },
  { id: 'origin', name: 'Origin Story als Landingpage-Text', lebtIn: ['repo'], pfad: 'docs/STORYS.md' },
  { id: 'geschaeftsmodell', name: 'Geschäftsmodell', lebtIn: ['repo'], pfad: 'docs/GESCHAEFTSMODELL.md' },
  { id: 'storymap', name: 'Story Map mit Slices', lebtIn: ['miro', 'repo'], pfad: 'docs/STORY-MAP.md' },
  { id: 'usage', name: 'Usage Story des Kernablaufs', lebtIn: ['repo'], pfad: 'docs/STORYS.md' },
  { id: 'spike', name: 'Prototyp-Spike und Testbefunde', lebtIn: ['repo'], pfad: 'docs/TESTS.md' },
  { id: 'team', name: 'Team-Vereinbarung mit Definition of Done', lebtIn: ['repo'], pfad: 'docs/TEAM.md' },
  { id: 'issues', name: 'Backlog aus Issues', lebtIn: ['linear'] },
  { id: 'kriterien', name: 'Akzeptanzkriterien', lebtIn: ['linear'] },
  { id: 'geschnitten', name: 'Issues geschnitten und quer gelesen', lebtIn: ['linear'] },
  { id: 'inkrement', name: 'Laufendes Inkrement', lebtIn: ['live', 'repo'] },
  { id: 'sprintlog', name: 'Sprint-Protokoll: Ziele, Review, Retro', lebtIn: ['repo'], pfad: 'docs/SPRINTS.md' },
  { id: 'pitch', name: 'Pitch mit Demo und Belegen', lebtIn: ['vortrag', 'repo'], pfad: 'docs/PITCH.md' },
];

/** Ein Punkt der Prüfliste. Die ID (<slug>-<thema>) bleibt, wenn der Text umformuliert oder die Reihenfolge geändert
 *  wird: Fokus-Prüfung (artefakt_pruefen mit pruefpunkt), die Häkchen der Checkliste und das geplante Kalibrierungslog
 *  verweisen darauf. Ein neues Thema bekommt eine neue ID; eine gestrichene ID wird nie wieder vergeben (methoden.test.ts).
 *  alt: die Positions-ID, die artefakt_pruefen bis NDU-28 vergab (annahmen-5) – eingefroren, damit sie in alten
 *  Gesprächen weiter auf denselben Punkt zeigt; neue Punkte bekommen keine. */
export interface Pruefpunkt {
  id: string;
  alt?: string;
  text: string;
}

export interface Methode {
  slug: string;
  name: string;
  /** Kurstag, an dem die Methode eingeführt wird (1–4; Tag 5 und 6 sind Bautage, Tag 7 die Präsentation – dort kommt nichts Neues dazu). */
  tag: number;
  /** Minuten für Input, Übung und Festhalten zusammen. */
  dauer: number;
  /** Die eine Frage, die diese Methode beantwortet. */
  frage: string;
  /** Artefakt-IDs, auf denen sie aufbaut – müssen von einer früheren Methode stammen. */
  braucht: string[];
  /** Artefakt-IDs, die sie erzeugt – jedes Artefakt entsteht genau einmal. */
  ergibt: string[];
  /** Wofür Claude hier da ist – immer erst nach der eigenen Arbeit. */
  ki: string;
  /** Herkunft der Methode, damit die Quelle genannt ist. */
  quelle?: string;
  /** Prüfliste: die häufigen Fehler als prüfbare Sätze. Die Studierenden haken sie ab, Claude prüft dagegen
   *  (ClaudePruefung.astro). Pflicht, sobald die Methode eine eigene Seite hat. */
  pruefliste?: Pruefpunkt[];
  /** Stand der Prüfliste aus der Zeit, als die Checkliste Häkchen je Position speicherte: Teil des localStorage-Schlüssels
   *  il-<slug>-<stand> (Checklist.astro). Seit NDU-28 speichert sie je Prüfpunkt-ID; ein neuer Stand ist nicht mehr nötig,
   *  der Schlüssel bleibt, damit vorhandene Häkchen bleiben. */
  prueflisteStand?: number;
  /** Verrät die Prüfliste die Lösung einer Übung, ist sie wie deren Auflösung zu: frei, sobald der Präsentator die Gruppe
   *  aufdeckt, spätestens ab ab (lib/aufgedeckt.ts gruppeFrei). Der Connector hält sich daran (methode_erklaeren,
   *  artefakt_pruefen); auf der Methodenseite steht die Prüfliste dafür selbst in <Aufloesung>. */
  prueflisteNach?: { gruppe: string; ab: string };
}

/** In Kursreihenfolge – die Prüfung „braucht nur Früheres“ verlässt sich darauf. */
export const METHODEN: Methode[] = [
  {
    slug: 'problem-rahmen', name: 'Problem-Rahmen & Produkt-Brief', tag: 1, dauer: 60,
    frage: 'Welches Problem lösen wir für wen – und woran merken wir, dass es gelungen ist?',
    braucht: [], ergibt: ['brief'],
    ki: 'Findet versteckte Lösungen im Problemsatz und Ziele, die man nicht messen kann.',
    pruefliste: [
      { id: 'problem-rahmen-zielgruppe', alt: 'problem-rahmen-1', text: 'Die Zielgruppe ist eine konkrete Person in einer konkreten Situation – nicht „alle“.' },
      { id: 'problem-rahmen-loesung', alt: 'problem-rahmen-2', text: 'Der Problemsatz enthält keine Lösung: kein „App“, keine „Plattform“, keine Funktion.' },
      { id: 'problem-rahmen-heute', alt: 'problem-rahmen-3', text: 'Es steht da, wie das Problem heute gelöst wird – auch „gar nicht“ ist eine Antwort.' },
      { id: 'problem-rahmen-nicht', alt: 'problem-rahmen-4', text: '„Was macht es NICHT?“ nennt drei Dinge, die naheliegen würden.' },
      { id: 'problem-rahmen-outcome', alt: 'problem-rahmen-5', text: 'Die Outcome-Metrik beschreibt, was Menschen anders tun – nicht, was das Produkt kann, und nicht, wie oft eine Funktion benutzt wird – und lässt sich schon an wenigen Menschen beobachten.' },
    ],
  },
  {
    slug: 'entscheidungslog', name: 'Entscheidungslog', tag: 1, dauer: 5, prueflisteStand: 2,
    frage: 'Was haben wir geglaubt, wie geprüft, was gelernt – und was haben wir darum geändert?',
    braucht: ['brief'], ergibt: ['entscheidungen'],
    ki: 'Prüft am Ende jedes Tages, welche Entscheidung ohne Beleg dasteht.',
    pruefliste: [
      { id: 'entscheidungslog-felder', alt: 'entscheidungslog-1', text: 'Jede Zeile nennt Datum, Entscheidung und Grund.' },
      { id: 'entscheidungslog-beleg', alt: 'entscheidungslog-2', text: 'Jede Produktentscheidung nennt einen Beleg – oder ausdrücklich „noch keiner“.' },
      { id: 'entscheidungslog-tatsache', alt: 'entscheidungslog-3', text: 'Keine Annahme ist als Tatsache formuliert („Pendler*innen wollen …“ statt „Wir glauben, dass …“).' },
      { id: 'entscheidungslog-ersetzt', alt: 'entscheidungslog-4', text: 'Wo ein Test etwas widerlegt hat, steht die Änderung als neue Zeile da („ersetzt D…“ mit der ID der alten Zeile) – die alte bleibt stehen und trägt „ersetzt am …“.' },
    ],
  },
  {
    slug: 'annahmen', name: 'Annahmen-Map', tag: 1, dauer: 45,
    frage: 'Welche Annahmen müssen stimmen – und welche ist am riskantesten?',
    braucht: ['brief'], ergibt: ['annahmen'],
    pruefliste: [
      { id: 'annahmen-pruefbar', alt: 'annahmen-1', text: 'Jede Annahme ist ein prüfbarer Satz: „Wir glauben, dass …“.' },
      { id: 'annahmen-arten', alt: 'annahmen-2', text: 'Alle vier Arten kommen vor: wünschenswert, machbar, wirtschaftlich, bedienbar.' },
      { id: 'annahmen-wichtig-beleg', alt: 'annahmen-3', text: 'Bei jeder Annahme steht, wie wichtig sie ist und welchen Beleg es gibt.' },
      { id: 'annahmen-riskanteste', alt: 'annahmen-4', text: 'Die riskanteste Annahme – sehr wichtig, kaum Beleg – ist markiert.' },
      { id: 'annahmen-loesung', alt: 'annahmen-5', text: 'Keine Annahme ist eine Aufgabe („Logo gestalten“) oder eine Funktion („Es gibt einen Login“).' },
      // Mit NDU-31 angehängt (darum alt annahmen-6). Seit NDU-28 hängen die Häkchen an der ID, die Reihenfolge ist frei.
      { id: 'annahmen-getan-quelle', alt: 'annahmen-6', text: 'Wo „getan“ steht, nennt die Beleg-Notiz die Quelle oder es ist eine Entscheidung (D…) als Beleg angegeben – Interview-IDs allein reichen nicht.' },
    ],
    ki: 'Red Team: sucht Annahmen, die ihr übersehen habt.',
    quelle: 'David J. Bland & Alex Osterwalder, Testing Business Ideas',
  },
  {
    slug: 'interview', name: 'Jobs to be Done & Mom Test', tag: 1, dauer: 120, prueflisteStand: 2,
    prueflisteNach: { gruppe: MOM_TEST_GRUPPE, ab: NACH_MOM_TEST },
    frage: 'Was tun Menschen heute wirklich, um ihren Job zu erledigen?',
    braucht: ['brief', 'annahmen'], ergibt: ['transkripte'],
    pruefliste: [
      { id: 'interview-ziel', alt: 'interview-1', text: 'Das Ziel ist eine Forschungsfrage aus der riskantesten Annahme der Annahmen-Map.' },
      { id: 'interview-zukunft', alt: 'interview-2', text: 'Keine Frage nach der Zukunft („Würdest du …?“, „Wie viel würdest du zahlen?“).' },
      { id: 'interview-idee', alt: 'interview-3', text: 'Keine Frage stellt eure Idee vor oder will sie bewertet haben.' },
      { id: 'interview-letztes-mal', alt: 'interview-4', text: 'Die Kernfragen fragen nach dem letzten konkreten Mal („Erzähl vom letzten Mal, als …“).' },
      { id: 'interview-heute', alt: 'interview-5', text: 'Mindestens eine Frage zielt darauf, was die Person heute schon tut, um das Problem zu lösen – und was sie das kostet.' },
      { id: 'interview-nachfragen', alt: 'interview-6', text: 'Nachfragen sind vorbereitet („Warum?“, „Was ist dann passiert?“, „Und davor?“).' },
      { id: 'interview-einwilligung', alt: 'interview-7', text: 'Am Anfang stehen die Bitte um Einwilligung zur Aufnahme und die Zusage, dass nichts mit Namen ins Projekt kommt.' },
    ],
    ki: 'Markiert suggestive und hypothetische Fragen im Leitfaden und spielt zur Probe eine zurückhaltende Person aus der Zielgruppe.',
    quelle: 'Rob Fitzpatrick, The Mom Test; Clayton Christensen, Jobs to be Done',
  },
  {
    slug: 'synthese', name: 'Interview-Synthese', tag: 2, dauer: 60,
    frage: 'Was haben wir aus jedem Interview gelernt – und was hören die anderen darin?',
    braucht: ['transkripte', 'annahmen'], ergibt: ['synthese'],
    quelle: 'Teresa Torres, „Continuous Discovery Habits“ (2021), S. 67–77; Rob Fitzpatrick, „The Mom Test“ (2013), S. 98–102',
    pruefliste: [
      { id: 'synthese-snapshot', alt: 'synthese-1', text: 'Jedes Interview hat einen Snapshot mit einprägsamem Zitat, Kurzinfos, Einsichten und Chancen.' },
      { id: 'synthese-chance-beduerfnis', alt: 'synthese-2', text: 'Jede Chance ist ein Bedürfnis, ein Schmerzpunkt oder ein Wunsch in den Worten der Person – keine Lösung und keine Funktion.' },
      { id: 'synthese-einsichten', alt: 'synthese-3', text: 'Einsichten (auffälliges Verhalten) stehen getrennt von den Chancen.' },
      { id: 'synthese-pseudonym', alt: 'synthese-4', text: 'Kein Eintrag nennt Namen, Arbeitgeber oder etwas, woran man die Person erkennt – nur das Pseudonym.' },
      { id: 'synthese-beleg-nachgetragen', alt: 'synthese-5', text: 'In der Annahmen-Map ist für jede Annahme, zu der ihr etwas gehört habt, der Beleg nachgetragen.' },
    ],
    ki: 'Prüft nach der Besprechung, ob eure Chancen Bedürfnisse sind und keine Lösungen – mit Zitat aus euren Interviews.',
  },
  {
    slug: 'journey-map', name: 'Experience Map', tag: 2, dauer: 60,
    frage: 'Welche Momente erleben eure Interviewpartner*innen wirklich – und welche werden die Äste eures Baums?',
    braucht: ['brief', 'synthese'], ergibt: ['journey'],
    quelle: 'Teresa Torres, „Continuous Discovery Habits“ (2021), S. 50–57, 86–87; Lexie Kane, „The Peak–End Rule“, Nielsen Norman Group (2018)',
    pruefliste: [
      { id: 'journey-map-geschichten', text: 'Die Map ist aus den Geschichten eurer Interviews gebaut: Jeder Knoten lässt sich mindestens einer Geschichte zuordnen.' },
      { id: 'journey-map-erleben', text: 'Sie zeigt, was die Menschen erleben – nicht euer Produkt und keine Bildschirmabfolge.' },
      { id: 'journey-map-umwege', text: 'Sie zeigt auch Umwege, Schleifen und Abbrüche, nicht nur den glatten Weg.' },
      { id: 'journey-map-momente-getrennt', text: 'Die Momente überschneiden sich nicht: Jeder ist ein eigener Zeitpunkt.' },
      { id: 'journey-map-worte-belegt', text: 'Jeder Moment steht in den Worten der Kundschaft und ist mit Zitat-IDs belegt.' },
      { id: 'journey-map-hoehepunkt-ende', text: 'Der stärkste Moment und das Ende sind markiert.' },
    ],
    ki: 'Liest eure Interviews und fragt, welche Geschichte in der Map fehlt und wo sich Momente überschneiden.',
  },
  {
    slug: 'baum', name: 'Opportunity Solution Tree', tag: 2, dauer: 65,
    frage: 'Welche Chancen aus den Interviews gehören unter welchen Moment – und wie hängen sie zusammen?',
    braucht: ['brief', 'synthese', 'journey'], ergibt: ['baum'],
    quelle: 'Teresa Torres, „Continuous Discovery Habits“ (2021), Kap. 6, S. 78–95',
    pruefliste: [
      { id: 'baum-chance-beduerfnis', text: 'Jede Chance ist ein Bedürfnis, ein Schmerzpunkt oder ein Wunsch in den Worten der Kundschaft – keine Lösung.' },
      { id: 'baum-belegt', text: 'Jede gehörte Chance im Baum ist mit Zitat-IDs aus mehr als einem Interview belegt; ergänzte Eltern-Chancen sind als ergänzt markiert, Einzelfälle stehen getrennt.' },
      { id: 'baum-ein-elternteil', text: 'Jede Chance hängt unter genau einem Moment der Experience Map; keine hat zwei Eltern.' },
      { id: 'baum-kind-teil', text: 'Ein Kind ist ein Teil seines Elternteils; Geschwister lassen sich einzeln lösen.' },
      { id: 'baum-stapel', text: 'Kein senkrechter Stapel: Wo ein Elternteil nur ein Kind hat, ist notiert, wonach ihr als Nächstes fragt.' },
      { id: 'baum-konkret', text: 'Keine Chance ist ein Gefühl ohne Ursache oder so unkonkret wie „Das ist zu schwer“.' },
    ],
    ki: 'Liest eure Interviews und sucht die sechs Anti-Muster – mit Zitat aus Baum und Interview.',
  },
  {
    slug: 'ziel-chance', name: 'Ziel-Chance wählen', tag: 2, dauer: 60,
    frage: 'An welcher Chance arbeiten wir als Nächstes – und warum gerade an dieser?',
    braucht: ['brief', 'synthese', 'baum'], ergibt: ['ziel'],
    quelle: 'Teresa Torres, „Continuous Discovery Habits“ (2021), Kap. 7, S. 96–104; Anthony W. Ulwick, „Turn Customer Input into Innovation“, HBR (2002)',
    pruefliste: [
      { id: 'ziel-chance-geschwister', text: 'Verglichen wurden Geschwister miteinander – nicht jede Chance einzeln mit „Sollen wir das machen?“.' },
      { id: 'ziel-chance-blatt', text: 'Die Ziel-Chance ist ein Blatt: Sie hat im Baum keine Kinder.' },
      { id: 'ziel-chance-linsen', text: 'Zu jeder der vier Linsen steht ein Satz: Größe, Markt, eigene Lage, Kundschaft.' },
      { id: 'ziel-chance-belegt', text: 'Größe und Kundschaft sind mit Zitat-IDs aus den Interviews belegt.' },
      { id: 'ziel-chance-ulwick', text: 'Die Ulwick-Rechnung steht als geschätzte Gegenprobe daneben; entschieden hat das Gespräch, nicht die Zahl.' },
    ],
    ki: 'Fragt nach, welche Linse eure Wahl trägt und wo ihr vom gewünschten Ergebnis rückwärts argumentiert.',
  },
  {
    slug: 'hmw', name: 'How Might We', tag: 2, dauer: 30,
    frage: 'Welche Frage öffnet für die Ziel-Chance möglichst viele Ideen?',
    braucht: ['ziel'], ergibt: ['chancen'],
    quelle: 'Warren Berger, „The Secret Phrase Top Innovators Use“, HBR Blog Network (2012); Teresa Torres, „Continuous Discovery Habits“ (2021), S. 94–95',
    pruefliste: [
      { id: 'hmw-wie-koennten', text: 'Jede Frage beginnt mit „Wie könnten wir …“ und hängt an eurer Ziel-Chance.' },
      { id: 'hmw-loesung', text: 'Keine Lösung steckt drin: Es gibt mehr als einen Weg, die Frage zu beantworten.' },
      { id: 'hmw-reichweite', text: 'Die Frage ist ehrgeizig, aber erreichbar – nicht so weit wie „den Morgen schöner machen“, nicht so eng wie eine einzelne Zahl.' },
      { id: 'hmw-kundensicht', text: 'Sie ist aus Sicht der Kundschaft gestellt, nicht aus Sicht eures Produkts.' },
      { id: 'hmw-auswahl', text: 'Eine Frage ist ausgewählt, mit einem Satz, warum.' },
    ],
    ki: 'Prüft, ob eine Frage eine Lösung vorgibt, zu weit oder zu eng ist und aus Sicht der Kundschaft gestellt ist.',
  },
  {
    slug: 'ideation', name: 'Ideation', tag: 2, dauer: 90,
    frage: 'Welche Lösungen gibt es für die Ziel-Chance – und welche drei vergleichen wir?',
    braucht: ['chancen'], ergibt: ['ideen'],
    quelle: 'Teresa Torres, „Continuous Discovery Habits“ (2021), Kap. 8, S. 106–114',
    pruefliste: [
      { id: 'ideation-menge', text: 'Für die Ziel-Chance stehen 15 bis 20 Ideen, entstanden im Wechsel von allein und geteilt.' },
      { id: 'ideation-aussortiert', text: 'Ideen, die die Ziel-Chance nicht lösen, sind aussortiert und stehen getrennt.' },
      { id: 'ideation-drei', text: 'Genau drei Ideen gehen weiter; bei jeder steht, warum sie die Ziel-Chance trifft.' },
      { id: 'ideation-verschieden', text: 'Die drei sind verschieden und keine Varianten derselben Idee; jede hat eine Fürsprecher*in.' },
      { id: 'ideation-claude', text: 'Ideen von Claude sind als solche markiert.' },
    ],
    ki: 'Nach der ersten eigenen Runde, wenn ihr feststeckt: analoge Produkte aus anderen Branchen und extreme Nutzer*innen.',
  },
  {
    slug: 'kundenprofil', name: 'Kundenprofil', tag: 3, dauer: 30,
    frage: 'Welche Jobs, Pains und Gains hat dieses Segment – und welche zählen am meisten?',
    braucht: ['synthese', 'baum', 'ziel'], ergibt: ['profil'],
    pruefliste: [
      { id: 'kundenprofil-segment', text: 'Das Profil beschreibt genau ein Segment.' },
      { id: 'kundenprofil-jobs', text: 'Jobs sind Aufgaben der Person – keine Ergebnisse und keine Funktionen eures Produkts.' },
      { id: 'kundenprofil-sozial-emotional', text: 'Neben funktionalen Jobs steht mindestens ein sozialer oder emotionaler.' },
      { id: 'kundenprofil-konkret', text: 'Pains und Gains sind konkret: „mehr als fünf Leute in der Schlange“ statt „zu voll“.' },
      { id: 'kundenprofil-produkt', text: 'Kein Eintrag beschreibt euer Produkt oder eure Lösung.' },
      { id: 'kundenprofil-ziel-chance', text: 'Die Ziel-Chance steht als Pain im Profil; jeder Eintrag verweist auf Zitat-IDs aus den Interviews.' },
      { id: 'kundenprofil-geordnet', text: 'Jede Spalte ist für sich geordnet: Jobs nach Wichtigkeit, Pains nach Schwere, Gains nach Relevanz.' },
    ],
    ki: 'Prüft gegen die häufigen Fehler: vermischte Segmente, Jobs mit Ergebnissen verwechselt, vage Pains, nur funktionale Jobs.',
    quelle: 'Osterwalder, Pigneur, Bernarda, Smith, „Value Proposition Design“ (2014), S. 44–80 (PDF)',
  },
  {
    slug: 'value-map', name: 'Value Map & Fit', tag: 3, dauer: 45,
    frage: 'Welche unserer drei Ideen trifft das Profil am besten – und wie genau schafft sie Wert?',
    braucht: ['profil', 'ideen'], ergibt: ['valuemap'],
    pruefliste: [
      { id: 'value-map-lueckensatz', text: 'Für jede der drei Ideen von Tag 2 steht ein Lückensatz.' },
      { id: 'value-map-segment', text: 'Unter Produkte und Services steht nur, was für dieses Segment gedacht ist.' },
      { id: 'value-map-fit-vergleich', text: 'Der Fit-Vergleich hakt jede Idee gegen die obersten Einträge des Profils ab (✓, ✗ oder ?).' },
      { id: 'value-map-wahl', text: 'Gewählt ist die Idee mit dem besten Fit, mit einem Satz warum.' },
      { id: 'value-map-wirkung', text: 'Bei Schmerzlinderern und Gewinnerzeugern stehen keine Produkte, sondern was sie bewirken – mit der ID des Pains oder Gains.' },
      { id: 'value-map-adressiert', text: 'Die obersten Einträge des Profils sind adressiert – oder es steht da, warum nicht; was bewusst offen bleibt, ist markiert.' },
    ],
    ki: 'Markiert Schmerzlinderer, die zu keinem Pain passen, und fragt nach jedem ✓ im Fit-Vergleich.',
    quelle: 'Osterwalder, Pigneur, Bernarda, Smith, „Value Proposition Design“ (2014), S. 44–118, 157–159 (PDF)',
  },
  {
    slug: 'concept-story', name: 'Concept Story', tag: 3, dauer: 75,
    frage: 'Warum versteht jemand in Sekunden, dass euer Produkt besser ist als das, was er heute tut?',
    braucht: ['annahmen', 'synthese', 'profil', 'valuemap'], ergibt: ['concept'],
    pruefliste: [
      { id: 'concept-story-stationen', text: 'Alle sieben Stationen sind gefüllt; die Exposition beschreibt die Welt der Zielgruppe, was darin gut ist, und ihr großes Ziel – nicht das Produkt.' },
      { id: 'concept-story-produkt', text: 'Die steigende Handlung nennt Namen und Art des Produkts in einem Satz.' },
      { id: 'concept-story-krise', text: 'Die Krise nennt mindestens eine heutige Alternative aus den Interviews und mindestens einen inneren Widerstand.' },
      { id: 'concept-story-hoehepunkt', text: 'Der Höhepunkt löst Pain und Krise auf und sagt, wie er anders und besser ist als die Alternativen.' },
      { id: 'concept-story-linie', text: 'Neben der Story steht die einfache Lösung als Linie – und die Story hat ihr gegenüber Krise und Höhepunkt.' },
      { id: 'concept-story-fallend', text: 'Die fallende Handlung ist ein Gedanke, keine Handlung, und steht als Annahme mit ID bereit.' },
      { id: 'concept-story-ende', text: 'Das Ende nennt das Ziel der Person und ein messbares Ziel des Geschäfts; jede Behauptung trägt eine J-, P-, G- oder Zitat-ID.' },
    ],
    ki: 'Prüft, ob die Story Krise und Höhepunkt hat oder nur eine Linie ist; schreibt sie nicht um.',
    quelle: 'Donna Lichaw, The User’s Journey (Rosenfeld 2016), Kap. 2–4, 6–8',
  },
  {
    slug: 'geschaeftsmodell', name: 'Geschäftsmodell-Karten', tag: 3, dauer: 20,
    frage: 'Wer zahlt wofür – und welche Annahme steckt dahinter?',
    braucht: ['profil', 'valuemap', 'concept', 'annahmen', 'brief'], ergibt: ['geschaeftsmodell'],
    pruefliste: [
      { id: 'geschaeftsmodell-verweise', text: 'Wer? und Was? verweisen auf Kundenprofil und Value Map; Wie? und Wert? stehen neu da.' },
      { id: 'geschaeftsmodell-wert', text: 'Bei Wert? steht, wer wofür zahlt – und wie die Kundschaft heute bezahlt.' },
      { id: 'geschaeftsmodell-kosten', text: 'Die wichtigsten Kosten sind als Posten genannt, nicht als „gering“.' },
      { id: 'geschaeftsmodell-muster', text: 'Das gewählte Muster ist benannt, und für jede andere Karte steht, warum sie verworfen wurde.' },
      { id: 'geschaeftsmodell-annahme', text: 'Die Annahme, an der das Modell hängt, steht in der Annahmen-Map, Art „wirtschaftlich“, mit Wichtigkeit und Beleg – sie sagt, dass der Ertrag die Kosten deckt, nicht bloß, dass Umsatz entsteht.' },
      { id: 'geschaeftsmodell-widerspruch', text: 'Nichts im Modell widerspricht der Krise der Concept Story oder einem Pain im Kundenprofil.' },
    ],
    ki: 'Prüft, ob Wer, Was, Wie und Wert zusammenpassen; schlägt keine Muster vor.',
    quelle: 'Gassmann, Frankenberger, Csik: Geschäftsmodelle entwickeln, 2. Aufl. 2017 (St. Galler Business Model Navigator); Osterwalder u. a., Value Proposition Design, S. 115–118; Cagan, Inspired, S. 189–190, 277; Torres, Continuous Discovery Habits, S. 118, 125–128',
  },
  {
    slug: 'experiment', name: 'Experiment-Karte & Origin Story', tag: 3, dauer: 40, prueflisteStand: 2,
    frage: 'An welcher Annahme hängt der Spitzenreiter – und wie prüfen wir sie diese Woche?',
    braucht: ['annahmen', 'ideen', 'valuemap', 'concept', 'geschaeftsmodell'], ergibt: ['experimente', 'origin'],
    pruefliste: [
      { id: 'experiment-annahmen-arten', text: 'Die Annahmen kommen aus den Schritten der gewählten Idee und decken alle fünf Arten ab; jede ist so formuliert, dass ihr sie braucht, und konkret genug, um sie zu beobachten.' },
      { id: 'experiment-eine-annahme', text: 'Die Karte testet genau eine Annahme – die oberste rechts in der Annahmen-Map – und nennt ihre ID und Art.' },
      { id: 'experiment-wer-wo-was', text: 'Die Karte sagt genau, wer, wo und was; gemessen wird eine Handlung, keine Meinung.' },
      { id: 'experiment-schwelle', text: 'Die Schwelle steht als „x von y“ fest, bevor der Test läuft.' },
      { id: 'experiment-schnellster', text: 'Es ist der schnellste Test dieser Woche, der den stärksten Beleg liefert, den ihr euch leisten könnt.' },
      { id: 'experiment-danach', text: 'Es steht da, was die Testpersonen danach erfahren; die riskanteste Annahme der anderen beiden Ideen steht je als Zeile darunter.' },
      { id: 'experiment-origin', text: 'Am Abend: Die Origin Story führt zu genau einer Handlung, und diese Handlung ist die Messgröße der Karte.' },
      { id: 'experiment-lernkarte', text: 'Nach dem Test: Die Lernkarte nennt die Verlässlichkeit mit Grund und den Befund (gestützt, widerlegt, unklar oder neue Einsicht), bevor sie sagt, was ihr deshalb tut.' },
    ],
    ki: 'Pre-Mortem: Wie könnte E1 uns in die Irre führen – und welcher kleinere Test wäre genauer?',
    quelle: 'Teresa Torres, Continuous Discovery Habits, Kap. 9–10; David J. Bland & Alexander Osterwalder, Testing Business Ideas; Origin Story nach Donna Lichaw, Kap. 4',
  },
  {
    slug: 'story-map', name: 'Story Map', tag: 3, dauer: 105,
    frage: 'Was tun Menschen mit eurem Produkt, von Anfang bis Ende – und was baut ihr zuerst, um welchen Outcome zu erreichen?',
    braucht: ['brief', 'profil', 'valuemap', 'journey', 'annahmen'], ergibt: ['storymap'],
    pruefliste: [
      { id: 'story-map-rahmen', text: 'Der Rahmen steht da: für wen die Map ist und welchen Outcome das Produkt erreichen soll.' },
      { id: 'story-map-schritte', text: 'Jeder Schritt ist ein kurzer Verb-Satz aus Sicht der Person, die handelt – kein Bildschirm, kein Feature.' },
      { id: 'story-map-erzaehlbar', text: 'Die Map lässt sich von links nach rechts mit „und dann …“ erzählen, und jede Gruppe, die mitspielt, hat eigene Schritte darin.' },
      { id: 'story-map-alternativen', text: 'Unter den Schritten stehen Alternativen, Details und Fehlerfälle – mindestens eine Antwort auf „Was ist, wenn …?“ pro Aktivität mit Software-Schritten.' },
      { id: 'story-map-slice-ziel', text: 'Slice 1 nennt, was Menschen danach anders tun, und was ihr damit lernen wollt (mit Annahmen-ID).' },
      { id: 'story-map-slice-durchgehend', text: 'Slice 1 geht durch alle Aktivitäten von Anfang bis Ende; keine Aktivität wurde nach unten geschoben.' },
      { id: 'story-map-kein-software', text: 'Was in Slice 1 keine Software ist, steht trotzdem auf der Map und ist als „kein Software-Schritt“ markiert.' },
    ],
    ki: 'Spielt „Was ist, wenn …?“: fehlende Schritte dazwischen, Fehlerwege, eine zweite Gruppe; nennt die Annahmen hinter jedem Schritt von Slice 1.',
    quelle: 'Jeff Patton, User Story Mapping (O’Reilly 2014), Read This First, Kap. 1–5, 14',
  },
  {
    slug: 'usage-story', name: 'Usage Story', tag: 3, dauer: 30,
    frage: 'Wo erlebt die Person im Kernablauf den Wert – und wie schnell ist danach Schluss?',
    braucht: ['annahmen', 'synthese', 'storymap', 'journey', 'profil', 'concept'], ergibt: ['usage'],
    pruefliste: [
      { id: 'usage-story-person', text: 'Die Story hat eine Person aus den Interviews (Pseudonym, ID), Zeit, Ort und das Ziel aus der Concept Story.' },
      { id: 'usage-story-ausloeser', text: 'Der Auslöser ist ein Ereignis oder eine Aufforderung an einem Moment der Experience Map und passt zum Pain der Concept Story.' },
      { id: 'usage-story-schritte', text: 'Die Schritte sind die Tasks aus Slice 1 der Story Map, in ihrer Reihenfolge; jeder bringt die Person weiter als der vorige.' },
      { id: 'usage-story-krise', text: 'Die Krise ist eine Hürde – Anmeldung, Bezahlen, Zweifel oder Bedienung – mit Beleg (Profil-, Annahme- oder Zitat-ID).' },
      { id: 'usage-story-hoehepunkt', text: 'Der Höhepunkt ist ein konkreter Bildschirm oder Moment, in dem die Person den Wert erlebt – und sagt, wie.' },
      { id: 'usage-story-nach-gipfel', text: 'Nach dem Höhepunkt kommen höchstens ein, zwei Schritte bis zum Ende; die Story endet nicht am Gipfel.' },
      { id: 'usage-story-ende', text: 'Das Ende sagt, wo die Person steht und was die nächste Episode wäre.' },
    ],
    ki: 'Prüft, ob der Höhepunkt nahe am Ende liegt und danach schnell Schluss ist.',
    quelle: 'Donna Lichaw, The User’s Journey (Rosenfeld 2016), Kap. 2, 5–8',
  },
  {
    slug: 'prototyp-spike', name: 'Prototyp-Spike & Usability-Test', tag: 3, dauer: 90, prueflisteStand: 2,
    frage: 'Erreichen fünf Menschen mit dem Prototyp den Höhepunkt, ohne dass ihr helft?',
    braucht: ['usage', 'storymap', 'annahmen', 'entscheidungen'], ergibt: ['spike'],
    pruefliste: [
      { id: 'prototyp-spike-skizzen', text: 'Papierskizzen für jeden Bildschirm der Usage Story liegen als Foto in docs/TESTS.md; der Höhepunkt ist ein eigener Bildschirm.' },
      { id: 'prototyp-spike-branch', text: 'Der Prototyp liegt in einem eigenen Branch, trägt „Prototyp – nicht echt“ und hat Abnahmekriterien und eine Zeitbox – er wird nicht gemergt.' },
      { id: 'prototyp-spike-karte', text: 'Die Karte E2 nennt die Annahme (ID, Art) und die Schwelle „x von 5“, bevor jemand testet.' },
      { id: 'prototyp-spike-aufgabe', text: 'Die Aufgabe beschreibt Situation und Ziel, keine Bedienschritte und keine Begriffe aus der Oberfläche.' },
      { id: 'prototyp-spike-trockenlauf', text: 'Ein Trockenlauf mit den anderen beiden ist gelaufen; die Testpersonen danach haben den Pain und kennen das Produkt nicht.' },
      { id: 'prototyp-spike-protokoll', text: 'Pro Testperson steht fest: Höhepunkt ohne Hilfe erreicht, Zeit, wo gehangen, Reaktion am Höhepunkt.' },
      { id: 'prototyp-spike-lernkarte', text: 'Nach den Tests: Lernkarte mit Verlässlichkeit und Befund (gestützt, widerlegt, unklar oder neue Einsicht), und was ihr deshalb ändert, als Zeile im Entscheidungslog mit U-IDs.' },
    ],
    ki: 'Baut den Wegwerf-Prototyp – erst nach der Papierskizze und innerhalb der Abnahmekriterien.',
    quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas (Paper Prototype, Clickable Prototype, XP Spike); Jakob Nielsen, NN/g 2000 und 2012; Marieke McCloskey, NN/g 2014',
  },
  {
    slug: 'scrum', name: 'Scrum im Team', tag: 4, dauer: 175, prueflisteStand: 2,
    frage: 'Wie arbeiten wir als drei Scrum-Teams mit denselben drei Personen an drei Produkten?',
    braucht: ['brief'], ergibt: ['team'],
    pruefliste: [
      { id: 'scrum-produkte', text: 'Für jedes der drei Produkte stehen Product Owner, Linear-Projekt und als Produktziel der Outcome aus dem Produkt-Brief („Wir glauben, dass … Wir merken es, wenn …“), der sagt, was Menschen danach anders tun.' },
      { id: 'scrum-rollen', text: 'Alle drei sind Developers in allen drei Produkten; der Scrum Master für Sprint 1 und Sprint 2 ist genannt.' },
      { id: 'scrum-termine', text: 'Sprint 1 und Sprint 2 haben ein Datum für Planning, Review und Retro; das Daily hat Zeit und Ort an Kurstagen und eine Regel für dazwischen.' },
      { id: 'scrum-dod', text: 'Die Definition of Done ist eine Liste von Punkten, die sich im Browser, auf GitHub oder in Supabase prüfen lassen, und gilt für alle drei Produkte.' },
      { id: 'scrum-dod-messung', text: 'In der Definition of Done steht das Ereignis, das die Outcome-Metrik des Produkt-Briefs misst, mit seinen Feldern – ohne Name und E-Mail.' },
      { id: 'scrum-abweichungen', text: 'Unter „Abweichungen vom Scrum Guide“ stehen mindestens: drei Produkte in einem Takt, ungleiche Sprintlängen, schriftliches Daily.' },
      { id: 'scrum-lego', text: 'Unter „Aus Lego4Scrum“ steht je Person eine Sache, die das Team in den echten Sprints anders macht.' },
    ],
    ki: 'Keine Rolle – Scrum lernt ihr im Spiel und im Team.',
    quelle: 'Schwaber & Sutherland, Scrum Guide 2020; Manifesto for Agile Software Development (2001); Alexey Krivitsky, lego4scrum (2023); Ron Jeffries, The Nature of Software Development (2015)',
  },
  {
    slug: 'backlog', name: 'Backlog aus Issues', tag: 4, dauer: 60, prueflisteStand: 2,
    frage: 'Welche Issues ergeben sich aus dem ersten Slice – und in welcher Reihenfolge?',
    braucht: ['storymap', 'usage', 'spike', 'experimente', 'team', 'entscheidungen'], ergibt: ['issues'],
    pruefliste: [
      { id: 'backlog-herkunft', text: 'Jedes Issue kommt aus Slice 1 der Story Map, aus einem Testbefund oder aus der Definition of Done und nennt seine Quelle (Slice 1, U-Kennung oder DoD).' },
      { id: 'backlog-titel-ziel', text: 'Jedes Issue hat einen kurzen Titel als Verb-Satz und ein Ziel, das sagt, wer danach was kann und warum.' },
      { id: 'backlog-senkrecht', text: 'Jedes Issue ist ein senkrechter Schnitt: Danach kann jemand etwas, das vorher nicht ging – kein Issue heißt „Datenbank“ oder „Oberfläche“.' },
      { id: 'backlog-nicht-im-umfang', text: 'Unter Nicht im Umfang steht, was ihr bewusst weggelassen habt; offene Fragen stehen unter „Fragen aus dem Gespräch“, nicht als stille Annahmen.' },
      { id: 'backlog-reihenfolge', text: 'Die Reihenfolge ist begründet: zuerst, was Slice 1 bis zum Höhepunkt der Usage Story braucht, dann das Riskanteste; wo ihr vom Bauchgefühl abweicht, steht eine Zeile im Entscheidungslog.' },
      { id: 'backlog-erzaehlt', text: 'Jedes Issue haben die beiden anderen erzählt bekommen; ihre Fragen und eure Antworten stehen im Issue.' },
    ],
    ki: 'Prüft INVEST und ob die Reihenfolge Outcome und Risiko folgt – schlägt keine Issues vor und ändert keins.',
    quelle: 'Jeff Patton, User Story Mapping (O’Reilly 2014), Kap. 2, 4, 6–12; Bill Wake, INVEST in Good Stories (2003); Mike Cohn, Agile Estimating and Planning (2005), Kap. 9; Ron Jeffries, The Nature of Software Development (2015), S. 13, 36, 84–87; Vasco Duarte, NoEstimates (2016), S. 42–43, 71',
  },
  {
    slug: 'akzeptanzkriterien', name: 'Akzeptanzkriterien', tag: 4, dauer: 45, prueflisteStand: 2,
    frage: 'Woran prüfen wir, dass ein Issue fertig ist – und wie zeigen wir es im Review?',
    braucht: ['issues', 'brief', 'team'], ergibt: ['kriterien'],
    pruefliste: [
      { id: 'akzeptanzkriterien-szenario', text: 'Jedes Kriterium ist ein Szenario „Gegeben … wenn … dann …“ mit konkreten Werten oder eine Regel mit mindestens einem solchen Beispiel darunter.' },
      { id: 'akzeptanzkriterien-gegeben-zustand', text: 'Jedes „Gegeben“ beschreibt einen Zustand, keine Handlung.' },
      { id: 'akzeptanzkriterien-grenzfall', text: 'Jedes Issue hat mindestens einen Fehler- oder Grenzfall, der aus der Frage „Was, wenn …?“ kommt.' },
      { id: 'akzeptanzkriterien-kein-bau', text: 'Kein Kriterium sagt, wie es gebaut oder gespeichert wird.' },
      { id: 'akzeptanzkriterien-zeigbar', text: 'Jedes Kriterium lässt sich zeigen – im Browser am Handy oder als Zeile in der Tabelle –, und unter „Fertig, wenn“ steht, womit und mit welchen Daten ihr es im Review vorführt.' },
      { id: 'akzeptanzkriterien-ki', text: 'Hat das Produkt eine KI-Funktion: Es gibt eine Liste von Eingaben mit erwartetem Verhalten, Grenzfälle eingeschlossen, und eine Schwelle „x von y“.' },
    ],
    ki: 'Ergänzt höchstens drei Fehler- oder Grenzfälle als Gegeben/Wenn/Dann – nachdem ihr zu dritt den Normalfall und eure Was-wenn-Fälle geschrieben habt.',
    quelle: 'Jeff Patton, User Story Mapping (O’Reilly 2014), Kap. 6, 7, 11, 12, 16; Dan North, Introducing BDD (2006); Cucumber, Gherkin Reference; Bill Wake, INVEST (2003); Jeffries (2015), S. 44; Cohn (2005), S. 222; Duarte (2016), S. 70–71; Evals als Ergänzung des Kurses nach Anthropic, Define success criteria and build evaluations',
  },
  {
    slug: 'schneiden', name: 'Schneiden statt Schätzen', tag: 4, dauer: 30, prueflisteStand: 2,
    frage: 'Passt jedes Issue in einen Durchgang mit Claude – und versteht es das ganze Team?',
    braucht: ['issues', 'kriterien'], ergibt: ['geschnitten'],
    pruefliste: [
      { id: 'schneiden-plan-check', text: 'Zu jedem Issue für Sprint 1 steht als Kommentar das Ergebnis des Plan-Checks: passt, geteilt in … oder ergänzt um ….' },
      { id: 'schneiden-ein-durchgang', text: 'Kein Issue braucht mehr als einen Durchgang; was zu groß war, ist geteilt, und jedes Teil ist ein senkrechter Schnitt mit mindestens einem eigenen Akzeptanzkriterium.' },
      { id: 'schneiden-entscheidung', text: 'Was Claude annehmen musste, steht jetzt als eure Entscheidung im Issue – in den Akzeptanzkriterien oder unter Nicht im Umfang.' },
      { id: 'schneiden-spike', text: 'Ein Teil, das nur dem Lernen dient, heißt Spike, nennt seine Frage und ist nicht für Sprint 1 vorgesehen.' },
      { id: 'schneiden-gesehen', text: 'Die geteilten Issues haben die beiden anderen gesehen; ihre Fragen sind im Issue beantwortet.' },
    ],
    ki: 'Macht im Plan-Modus einen Plan pro Issue, ohne zu bauen, und sagt, was es annehmen müsste – ihr entscheidet, ob es passt.',
    quelle: 'Vasco Duarte, NoEstimates (2016), S. 68–71, 80–88, 97; Ron Jeffries, The Nature of Software Development (2015), S. 37–40; Jeff Patton, User Story Mapping (2014), Kap. 4, 10–12, 16–17; Bill Wake, INVEST (2003); Gegenposition: James Grenning, Planning Poker (2002), und Mike Cohn, Agile Estimating and Planning (2005), S. 51–59; Teilen nach Cohn Kap. 12, S. 121–125',
  },
  {
    slug: 'sprint', name: 'Sprint', tag: 4, dauer: 150, prueflisteStand: 2,
    frage: 'Was liefern wir in diesem Sprint – und was lernen wir daraus?',
    braucht: ['geschnitten', 'team', 'brief'], ergibt: ['inkrement', 'sprintlog'],
    pruefliste: [
      { id: 'sprint-ziel', text: 'Jedes Produkt hat ein Sprint-Ziel in einem Satz, der sagt, was danach jemand kann – keine Liste von Issues.' },
      { id: 'sprint-auswahl', text: 'Die ausgewählten Issues stehen mit Kennung und Anzahl da; das Mess-Issue ist in Sprint 1 dabei.' },
      { id: 'sprint-nicht-mehr', text: 'Ab Sprint 2 sind es nicht mehr Issues, als im Sprint davor nach der Definition of Done fertig wurden.' },
      { id: 'sprint-beleg', text: 'Jedes als fertig genannte Issue hat einen Beleg je Akzeptanzkriterium, den Link zum Pull Request und den Namen der prüfenden Person.' },
      { id: 'sprint-review', text: 'Das Review hält fest, ob das Sprint-Ziel erreicht ist, was Tests und Messung ergeben haben und welche Issues zurück in den Backlog gehen.' },
      { id: 'sprint-retro', text: 'Die Retro von Sprint 1 (Lightning Decision Jam) endet mit einer Maßnahme, einem ersten Schritt, der am selben Tag erledigt wurde, einer verantwortlichen Person und dem Datum der Prüfung.' },
      { id: 'sprint-retro-kurz', text: 'Die kurze Retro von Sprint 2 hält fest, ob die Maßnahme aus Sprint 1 gewirkt hat und woran man es sieht.' },
    ],
    ki: 'Baut die Issues als Developer im Rahmen der Definition of Done; prüft, ob die Issues zusammen das Sprint-Ziel erreichen.',
    quelle: 'Schwaber & Sutherland, Scrum Guide 2020; Ron Jeffries, The Nature of Software Development (2015), Kap. 5–6; AJ&Smart, Lightning Decision Jam (2020)',
  },
  {
    slug: 'pitch', name: 'Pitch', tag: 4, dauer: 45, prueflisteStand: 2,
    frage: 'Überzeugt das Produkt – mit Belegen und einem sichtbaren Unterschied zu dem, was es heute gibt?',
    braucht: ['brief', 'profil', 'valuemap', 'concept', 'experimente', 'origin', 'geschaeftsmodell', 'usage', 'spike', 'inkrement', 'sprintlog', 'entscheidungen'], ergibt: ['pitch'],
    pruefliste: [
      { id: 'pitch-einstieg', text: 'Der Einstieg ist die Concept Story: Die Nutzer*innen und ihr Problem kommen vor dem Produkt, und die Geschichte hört vor dem Höhepunkt auf.' },
      { id: 'pitch-demo', text: 'Die Demo folgt der Usage Story bis zum Höhepunkt, live am Handy auf der Produktions-URL; ihr führt sie vor, und ein Video liegt als Plan B bereit.' },
      { id: 'pitch-belege', text: 'Jede Behauptung über Nutzer*innen hat einen Beleg mit ID, eine Zahl mit der Zahl der Personen dahinter und ein Wort dazu, wie sicher sie ist – nicht sicherer als in der Lernkarte.' },
      { id: 'pitch-gescheitert', text: 'Mindestens eine Annahme, die nicht gehalten hat, kommt vor – mit der Entscheidung, die dazu im Entscheidungslog steht.' },
      { id: 'pitch-outcome', text: 'Die Zahlen der Outcome-Metrik stehen da, mit der Zahl der Personen dahinter, auch wenn sie klein ist.' },
      { id: 'pitch-position', text: 'Der Teil Position nennt gegenüber den heutigen Alternativen, was wegfällt, weniger wird, mehr wird und neu ist – alle vier, jede Zeile mit Beleg: einer ID aus dem Kundenprofil oder einem Verweis auf die Value Map.' },
      { id: 'pitch-pitch-satz', text: 'Der Pitch-Satz aus Abschnitt 3 des Produkt-Briefs steht da und verspricht nichts, was die Demo nicht zeigt.' },
      { id: 'pitch-geschaeftsmodell', text: 'Es steht da, wer zahlt und wofür, an welcher Annahme das Modell hängt – benannt, nicht gerechnet –, und was ihr als Nächstes prüft und warum.' },
    ],
    ki: 'Spielt eine skeptische Investorin; prüft jede Behauptung gegen Lernkarten und Entscheidungslog und verlangt keine Preis- oder Kostenrechnung.',
    quelle: 'Donna Lichaw, The User’s Journey (2016), Kap. 2, 7; W. Chan Kim & Renée Mauborgne, Blue Ocean Strategy (2005), S. 25–43, 82–93; Marty Cagan, Inspired (2018), S. 151–153, 189–190, 281–282; David J. Bland & Alexander Osterwalder, Testing Business Ideas (2019), S. 52, 56–57, 81',
  },
];

/** Sieben Termine: Tag 1–4 Input und Übung, Tag 5 und 6 (halber Tag) nur Bauen – mit den Scrum-Events, aber ohne neue
 *  Methode –, Tag 7 (halber Tag) Präsentation. Dazwischen arbeitet ihr zu Hause; gebaut wird bis Tag 6.
 *  datum steht auch als data-kurstag auf der Tagesseite (methoden.test.ts prüft das). Ohne datum: Termin folgt
 *  (Tag 2 nach der Absage von Tag 1 am 16.10.) – dann keine Jetzt-Markierung auf der Tagesseite. */
export const TAGE: { n: number; datum?: string; titel: string; text: string }[] = [
  { n: 1, datum: '2026-10-22', titel: 'Rahmen & Verstehen', text: 'Problem und Outcome festlegen, Interviews vorbereiten, Annahmen sichtbar machen.' },
  { n: 2, titel: 'Kunde & Erlebnis', text: 'Snapshots besprechen, Experience Map, Opportunity Solution Tree, Ziel-Chance, Ideen.' },
  { n: 3, datum: '2026-11-21', titel: 'Lösung, Story, Prototyp', text: 'Kundenprofil und Value Map, Concept und Usage Story, Story Map, erster Prototyp.' },
  { n: 4, datum: '2026-11-28', titel: 'Scrum im Team', text: 'Drei Produkte, ein Takt: Scrum und Lego4Scrum, Backlog, Akzeptanzkriterien, Sprint-1-Planning, Pitch.' },
  { n: 5, datum: '2026-12-12', titel: 'Bauen & Review', text: 'Bauen, Usability-Tests über Kreuz, Sprint-1-Review, Retro, Sprint-2-Planning mit Störfall.' },
  { n: 6, datum: '2026-12-19', titel: 'Bauen', text: 'Sprint 2 fertig bauen, Review und Retro: Der Prototyp steht.' },
  { n: 7, datum: '2027-01-07', titel: 'Präsentation', text: 'Präsentation an Stakeholder: Pitch, Live-Demo und Belege.' },
];

export const artefakt = (id: string): Artefakt | undefined => ARTEFAKTE.find((a) => a.id === id);

/** Die Methode, die ein Artefakt erzeugt. */
export const erzeugtVon = (id: string): Methode | undefined => METHODEN.find((m) => m.ergibt.includes(id));

/** Methoden eines Kurstags, in Kursreihenfolge. */
export const methodenVonTag = (tag: number): Methode[] => METHODEN.filter((m) => m.tag === tag);

/** So findet Claude ein Artefakt: als Datei im Repo oder über den Linear-MCP – Team und Projekt stehen in docs/BACKLOG.md,
 *  die Regeln für Linear in docs/LINEAR.md des Projekts. Was nur in der Werkstatt liegt, liest Claude über den Connector. */
export const LINEAR_QUELLE = 'die Issues über den Linear-MCP (Team und Projekt aus der Zeile „Issues: Linear ·“ in docs/BACKLOG.md)';

/** Wie der Prüf-Prompt ein Artefakt der Mappe nennt („Prüf meinen Produkt-Brief …“). */
export const WERKSTATT_AKKUSATIV: Record<ArtefaktName, string> = {
  brief: 'meinen Produkt-Brief',
  entscheidungen: 'mein Entscheidungslog',
  leitfaden: 'meinen Interviewleitfaden',
  annahmen: 'meine Annahmen-Map',
  interviews: 'meine Interviews und Snapshots',
};

const nurInWerkstatt = (a: Artefakt) => a.werkstatt !== undefined && !a.lebtIn.includes('repo');

/** Datei im Repo oder Linear; nichts für Artefakte, die nur in der Werkstatt liegen (die Mappe ist ein eigenes Repo). */
function quelle(id: string): string | undefined {
  const a = artefakt(id)!;
  if (nurInWerkstatt(a)) return undefined;
  return a.pfad ?? (a.lebtIn.includes('linear') ? LINEAR_QUELLE : undefined);
}

/** Werkstatt-Artefakt der Vorarbeit: artefakt_pruefen liefert es zum Abgleich mit (jede Zeile in braucht macht jede Prüfung länger). */
function werkstattQuelle(id: string): ArtefaktName | undefined {
  const a = artefakt(id)!;
  return nurInWerkstatt(a) ? a.werkstatt : undefined;
}

/** Werkstatt-Artefakte der Vorarbeit, die zum Abgleich gehören (für die Interview-Methode: Brief und Annahmen-Map). */
export const werkstattVorarbeit = (m: Methode): ArtefaktName[] => [...new Set(m.braucht.map(werkstattQuelle).filter((n): n is ArtefaktName => !!n))];

const aufzaehlen = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} und ${xs.at(-1)}`);
const akkusativListe = (namen: ArtefaktName[]) => aufzaehlen(namen.map((n) => WERKSTATT_AKKUSATIV[n]));
const ausWerkstatt = (namen: ArtefaktName[]) => `${akkusativListe(namen)} (Werkzeug ${MCP_WERKZEUGE.artefaktLesen})`;

/** Wird das Ergebnis dieser Methode in der Werkstatt geprüft (Connector) statt als Datei im Repo? Mit pfad: immer die Datei. */
export function pruefungInWerkstatt(m: Methode, pfad?: string): boolean {
  return !pfad && m.ergibt.length > 0 && m.ergibt.every((id) => artefakt(id)?.werkstatt !== undefined);
}

const REGELN_ANFANG = 'Regeln: Zitier die Stelle, um die es geht. Nenn höchstens drei Befunde, die wichtigsten zuerst.';

/** ID der abhakbaren Prüfliste (localStorage-Schlüssel in Checklist.astro); mit Stand, wo die Liste vor NDU-28 neu geschrieben wurde. */
export const pruefChecklisteId = (m: Methode): string => (m.prueflisteStand ? `il-${m.slug}-${m.prueflisteStand}` : `il-${m.slug}`);

/** Was Claude zum Abgleich liest: die Dateien der Vorarbeit (ohne die schon gelesenen) und die Werkstatt-Artefakte,
 *  z. B. ["docs/STORYS.md, docs/TESTS.md", "aus der Werkstatt meinen Produkt-Brief (Werkzeug artefakt_lesen)"].
 *  Für Prompts, die dieselbe Vorarbeit lesen sollen wie die Prüfung (etwa die skeptische Investorin beim Pitch). */
export function vorarbeitLesen(m: Methode, schonGelesen: (string | undefined)[] = []): string[] {
  const gelesen = new Set(schonGelesen);
  const dateien = [...new Set(m.braucht.map(quelle).filter((p): p is string => !!p && !gelesen.has(p)))];
  const werkstatt = werkstattVorarbeit(m);
  return [dateien.join(', '), werkstatt.length ? `aus der Werkstatt ${ausWerkstatt(werkstatt)}` : ''].filter(Boolean);
}

// So nennt der Prompt, was eingefügt wird: je Datei einmal, mit allen Artefakten darin („Concept Story und Usage Story des
// Kernablaufs (docs/STORYS.md)“). Nur Dateien im Repo; Werkstatt-Artefakte haben keine, Linear-Artefakte stehen in linear.
function einzufuegen(ids: readonly string[], ausser: readonly (string | undefined)[] = []): { dateien: string[]; linear: string[] } {
  const pfade = new Map<string, string[]>();
  const linear: string[] = [];
  for (const id of ids) {
    const a = artefakt(id)!;
    if (a.lebtIn.includes('linear')) {
      if (!linear.includes(a.name)) linear.push(a.name);
      continue;
    }
    const p = nurInWerkstatt(a) ? undefined : a.pfad;
    if (!p || ausser.includes(p)) continue;
    const namen = pfade.get(p) ?? [];
    if (!namen.includes(a.name)) pfade.set(p, [...namen, a.name]);
  }
  return { dateien: [...pfade].map(([p, namen]) => `${aufzaehlen(namen)} (${p})`), linear };
}

// Ein pfad, der eine Datei nennt (docs/interviews/I2.md), kein Satz wie „über den Linear-MCP die Issues …“.
const IST_DATEI = /^[^\s]+\.\w+$/;

/** Gibt es zu dieser Prüfung den Weg ohne Claude Code (Ergebnis als Text in Claude einfügen)? Nur für Ergebnisse in
 *  Dateien im Repo: Werkstatt-Artefakte haben keine (dort prüft artefakt_pruefen), Linear auch nicht. */
export function einfuegenMoeglich(m: Methode, pfad?: string): boolean {
  return pfad ? IST_DATEI.test(pfad) : einzufuegen(m.ergibt).dateien.length > 0;
}

// Dateien je mit ihren Namen: mit Semikolon getrennt, weil die Namen selbst „und“ enthalten („Origin Story … und Concept Story“).
const dateiListe = (dateien: string[]) => dateien.join('; ');

/** Was beim Ausweichweg „einfuegen“ als Ergebnis eingefügt wird. Vorarbeit in derselben Datei wie das Ergebnis (Concept
 *  und Usage Story in docs/STORYS.md) steht beim Ergebnis. ausMiro: das Ergebnis liegt auch auf Miro (nicht bei pfad). */
function einfuegenErgebnis(m: Methode, pfad?: string) {
  const ergebnisPfade = pfad ? [pfad] : m.ergibt.map((id) => artefakt(id)!.pfad);
  const dateien = pfad ? [pfad] : einzufuegen([...m.ergibt, ...m.braucht.filter((id) => ergebnisPfade.includes(artefakt(id)!.pfad))]).dateien;
  const ausMiro = !pfad && m.ergibt.some((id) => artefakt(id)!.lebtIn.includes('miro'));
  return { ergebnisPfade, dateien, ausMiro };
}

/** Hinweis unter dem Prompt zum Einfügen (ClaudePruefung.astro): Miro nur, wo das Ergebnis auch dort liegt (wie im Prompt). */
export function einfuegenHinweis(m: Methode, pfad?: string): string {
  const { dateien, ausMiro } = einfuegenErgebnis(m, pfad);
  const inhalt = dateien.length > 1 ? 'den Inhalt der Dateien aus eurem Repo' : 'den Inhalt der Datei aus eurem Repo';
  return `Prompt in ein Gespräch mit Claude einfügen, darunter ${inhalt}${ausMiro ? ' oder den Text aus Miro' : ''} – und jeden weiteren Text, den der Prompt zum Abgleich nennt.`;
}

const REGELN_CHAT = 'Schreib nichts um und formulier keinen Text für mich – stell mir zu jedem Befund eine Frage, die mich weiterbringt. Passt alles, sag das in einem Satz.';

/** Prompt „Prüfen lassen“: Claude liest das Ergebnis der Methode und zum Abgleich die Vorarbeit, prüft gegen die
 *  Prüfliste und ändert nichts. pfad: nur einen Teil prüfen (z. B. ein Transkript statt aller Interview-Dateien).
 *  Liegt das Ergebnis in der Werkstatt, prüft Claude es dort mit artefakt_pruefen – nie über eine Datei unter docs/. Sonst
 *  liest Claude Code die Dateien im Repo und die Werkstatt über den Connector. weg „einfuegen“: der Ausweichweg ohne
 *  Claude Code – die Person fügt Ergebnis und Vorarbeit-Dateien als Text in Claude ein (einfuegenMoeglich). */
export function pruefPrompt(m: Methode, pfad?: string, weg: 'standard' | 'einfuegen' = 'standard'): string {
  if (!m.pruefliste) throw new Error(`pruefPrompt: Methode „${m.slug}“ hat keine Prüfliste`);
  // Mit der festen ID, damit Claude Befunde auch ohne Connector so nennt wie artefakt_pruefen.
  const liste = m.pruefliste.map((p, i) => `${i + 1}. ${p.text} (${p.id})`);
  const werkstattAbgleich = werkstattVorarbeit(m);

  if (weg === 'standard' && pruefungInWerkstatt(m, pfad)) {
    // Claude (claude.ai mit dem Connector) sieht nur die Mappe; Vorarbeit aus Dateien ließe sich so nicht lesen.
    const dateien = m.braucht.map(quelle).filter((p): p is string => !!p);
    if (dateien.length) throw new Error(`pruefPrompt: Methode „${m.slug}“ prüft in der Werkstatt, braucht aber Dateien: ${dateien.join(', ')}`);
    const namen = m.ergibt.map((id) => artefakt(id)!.werkstatt!);
    return [
      `Prüf ${akkusativListe(namen)} mit der Werkstatt (Werkzeug ${MCP_WERKZEUGE.artefaktPruefen}) gegen diese Prüfliste (${m.name}):`,
      ...liste,
      // artefakt_pruefen liefert die Vorarbeit aus der Mappe selbst mit (nur zum Abgleich).
      ...(werkstattAbgleich.length ? [`Zum Abgleich liefert das Werkzeug auch ${akkusativListe(werkstattAbgleich)} mit.`] : []),
      // Ohne Connector fügen die Studierenden die Texte aus „Für Claude kopieren“ unter den Prompt (ClaudePruefung.astro).
      `Ohne Werkstatt-Zugang nimm stattdessen die Texte, die ich unter diese Nachricht einfüge: ${akkusativListe([...namen, ...werkstattAbgleich])}.`,
      '',
      `${REGELN_ANFANG} ${REGELN_CHAT}`,
    ].join('\n');
  }

  if (weg === 'einfuegen') {
    // Ohne Claude Code: das Ergebnis und die Vorarbeit aus Dateien als Text, die Werkstatt über den Connector.
    if (!einfuegenMoeglich(m, pfad)) throw new Error(`pruefPrompt: Methode „${m.slug}“ hat keinen Weg zum Einfügen`);
    const { ergebnisPfade, dateien: ergebnis, ausMiro } = einfuegenErgebnis(m, pfad);
    const vorarbeit = einzufuegen(m.braucht, ergebnisPfade);
    const inhalt = ergebnis.length > 1 ? 'Inhalt der Dateien' : 'Inhalt der Datei';
    return [
      `Unter diese Nachricht füge ich mein Ergebnis ein (${ausMiro ? `${inhalt} oder Text aus Miro` : inhalt}): ${dateiListe(ergebnis)}. Prüf es gegen diese Prüfliste (${m.name}):`,
      ...liste,
      ...(vorarbeit.dateien.length ? [`Zum Abgleich füge ich auch ein: ${dateiListe(vorarbeit.dateien)}.`] : []),
      ...(vorarbeit.linear.length ? [`Aus Linear kopiere ich zum Abgleich ${aufzaehlen(vorarbeit.linear)} dazu (Kennung, Titel und Text jedes Issues).`] : []),
      ...(werkstattAbgleich.length
        ? [
            `Zum Abgleich lies außerdem ${ausWerkstatt(werkstattAbgleich)}.`,
            'Ohne Werkstatt-Zugang nimm dafür die Texte, die ich aus „Für Claude kopieren“ ebenfalls einfüge.',
          ]
        : []),
      '',
      `${REGELN_ANFANG} ${REGELN_CHAT}`,
    ].join('\n');
  }

  const pfade = pfad ? [pfad] : [...new Set(m.ergibt.map(quelle).filter((p): p is string => !!p))];
  // Viele Punkte lassen sich nur gegen die Vorarbeit prüfen (Zitate gegen Transkripte, IDs gegen das Kundenprofil).
  if (pfade.length === 0) throw new Error(`pruefPrompt: Methode „${m.slug}“ ergibt nichts, was Claude lesen kann`);
  // Ohne das, was Claude ohnehin liest – auch wenn pfad nur einen Teil davon nennt (z. B. ausgewählte Issues).
  const teile = vorarbeitLesen(m, [...pfade, ...m.ergibt.map(quelle)]);
  return [
    `Lies ${pfade.join(' und ')}.${teile.length ? ` Zum Abgleich lies auch ${teile.join(' und ')}.` : ''} Prüf es gegen diese Liste (${m.name}):`,
    ...liste,
    '',
    `${REGELN_ANFANG} Schreib nichts um, ändere keine Datei und kein Issue – stell mir zu jedem Befund eine Frage, die mich weiterbringt. Passt alles, sag das in einem Satz.`,
  ].join('\n');
}
