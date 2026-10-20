// Toolbox des Innolabs: jede Methode beantwortet eine Frage und ergibt ein Artefakt. Spätere Methoden bauen auf
// diesen Artefakten auf, statt sie neu zu erarbeiten (Chancen etwa nur im Baum; das Kundenprofil übernimmt sie mit ihren Zitat-IDs). methoden.test.ts prüft die Kette.
// Ohne Astro, damit testbar.
import type { ArtefaktName } from '../werkstatt/schemas/index.js';
import { MCP_WERKZEUGE } from '../werkstatt/vertrag.js';

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
   *  anders heißt („transkripte“ → leitfaden). Interview-Notizen kommen nie ins App-Repo (öffentlich); bis der
   *  Interview-Editor da ist, bleiben sie privat bei den Studierenden. */
  werkstatt?: ArtefaktName;
}

export const ARTEFAKTE: Artefakt[] = [
  { id: 'brief', name: 'Produkt-Brief mit Outcome-Metrik', lebtIn: ['werkstatt'], pfad: 'mappe/brief.json', werkstatt: 'brief' },
  { id: 'entscheidungen', name: 'Entscheidungslog', lebtIn: ['werkstatt'], pfad: 'mappe/entscheidungen.json', werkstatt: 'entscheidungen' },
  { id: 'transkripte', name: 'Leitfaden und Interview-Notizen (pseudonymisiert)', lebtIn: ['werkstatt'], pfad: 'mappe/leitfaden.json', werkstatt: 'leitfaden' },
  { id: 'annahmen', name: 'Annahmen-Map', lebtIn: ['miro', 'werkstatt'], pfad: 'mappe/annahmen.json', werkstatt: 'annahmen' },
  { id: 'synthese', name: 'Interviews mit Snapshots (pseudonymisiert)', lebtIn: ['miro', 'werkstatt'], pfad: 'mappe/interviews.json', werkstatt: 'interviews' },
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
  pruefliste?: string[];
}

/** In Kursreihenfolge – die Prüfung „braucht nur Früheres“ verlässt sich darauf. */
export const METHODEN: Methode[] = [
  {
    slug: 'problem-rahmen', name: 'Problem-Rahmen & Produkt-Brief', tag: 1, dauer: 60,
    frage: 'Welches Problem lösen wir für wen – und woran merken wir, dass es gelungen ist?',
    braucht: [], ergibt: ['brief'],
    ki: 'Findet versteckte Lösungen im Problemsatz und Ziele, die man nicht messen kann.',
    pruefliste: [
      'Die Zielgruppe ist eine konkrete Person in einer konkreten Situation – nicht „alle“.',
      'Der Problemsatz enthält keine Lösung: kein „App“, keine „Plattform“, keine Funktion.',
      'Es steht da, wie das Problem heute gelöst wird – auch „gar nicht“ ist eine Antwort.',
      '„Was macht es NICHT?“ nennt drei Dinge, die naheliegen würden.',
      'Die Outcome-Metrik beschreibt, was Menschen anders tun – nicht, was das Produkt kann, und nicht, wie oft eine Funktion benutzt wird – und lässt sich schon an wenigen Menschen beobachten.',
    ],
  },
  {
    slug: 'entscheidungslog', name: 'Entscheidungslog', tag: 1, dauer: 5,
    frage: 'Was haben wir geglaubt, wie geprüft, was gelernt – und was haben wir darum geändert?',
    braucht: ['brief'], ergibt: ['entscheidungen'],
    ki: 'Prüft am Ende jedes Tages, welche Entscheidung ohne Beleg dasteht.',
    pruefliste: [
      'Jede Zeile nennt Datum, Entscheidung und Grund.',
      'Jede Produktentscheidung nennt einen Beleg – oder ausdrücklich „noch keiner“.',
      'Keine Annahme ist als Tatsache formuliert („Pendler*innen wollen …“ statt „Wir glauben, dass …“).',
      'Wo ein Test etwas widerlegt hat, steht die Änderung als neue Zeile da („ersetzt [Stichwort] vom …“) – die alte bleibt stehen und trägt „ersetzt am …“.',
    ],
  },
  {
    slug: 'annahmen', name: 'Annahmen-Map', tag: 1, dauer: 45,
    frage: 'Welche Annahmen müssen stimmen – und welche ist am riskantesten?',
    braucht: ['brief'], ergibt: ['annahmen'],
    pruefliste: [
      'Jede Annahme ist ein prüfbarer Satz: „Wir glauben, dass …“.',
      'Alle vier Arten kommen vor: wünschenswert, machbar, wirtschaftlich, bedienbar.',
      'Bei jeder Annahme steht, wie wichtig sie ist und welchen Beleg es gibt.',
      'Die riskanteste Annahme – sehr wichtig, kaum Beleg – ist markiert.',
      'Keine Annahme ist eine Aufgabe („Logo gestalten“) oder eine Funktion („Es gibt einen Login“).',
    ],
    ki: 'Red Team: sucht Annahmen, die ihr übersehen habt.',
    quelle: 'David J. Bland & Alex Osterwalder, Testing Business Ideas',
  },
  {
    slug: 'interview', name: 'Jobs to be Done & Mom Test', tag: 1, dauer: 120,
    frage: 'Was tun Menschen heute wirklich, um ihren Job zu erledigen?',
    braucht: ['brief', 'annahmen'], ergibt: ['transkripte'],
    pruefliste: [
      'Das Ziel ist eine Forschungsfrage aus der riskantesten Annahme der Annahmen-Map.',
      'Keine Frage nach der Zukunft („Würdest du …?“, „Wie viel würdest du zahlen?“).',
      'Keine Frage stellt eure Idee vor oder will sie bewertet haben.',
      'Die Kernfragen fragen nach dem letzten konkreten Mal („Erzähl vom letzten Mal, als …“).',
      'Mindestens eine Frage zielt darauf, was die Person heute schon tut, um das Problem zu lösen – und was sie das kostet.',
      'Nachfragen sind vorbereitet („Warum?“, „Was ist dann passiert?“, „Wie oft kommt das vor?“).',
      'Am Anfang stehen die Bitte um Einwilligung zur Aufnahme und die Zusage, dass nichts mit Namen ins Projekt kommt.',
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
      'Jedes Interview hat einen Snapshot mit einprägsamem Zitat, Kurzinfos, Einsichten und Chancen.',
      'Jede Chance ist ein Bedürfnis, ein Schmerzpunkt oder ein Wunsch in den Worten der Person – keine Lösung und keine Funktion.',
      'Einsichten (auffälliges Verhalten) stehen getrennt von den Chancen.',
      'Kein Eintrag nennt Namen, Arbeitgeber oder etwas, woran man die Person erkennt – nur das Pseudonym.',
      'In der Annahmen-Map ist für jede Annahme, zu der ihr etwas gehört habt, der Beleg nachgetragen.',
    ],
    ki: 'Prüft nach der Besprechung, ob eure Chancen Bedürfnisse sind und keine Lösungen – mit Zitat aus euren Interviews.',
  },
  {
    slug: 'journey-map', name: 'Experience Map', tag: 2, dauer: 60,
    frage: 'Welche Momente erleben eure Interviewpartner*innen wirklich – und welche werden die Äste eures Baums?',
    braucht: ['brief', 'synthese'], ergibt: ['journey'],
    quelle: 'Teresa Torres, „Continuous Discovery Habits“ (2021), S. 50–57, 86–87; Lexie Kane, „The Peak–End Rule“, Nielsen Norman Group (2018)',
    pruefliste: [
      'Die Map ist aus den Geschichten eurer Interviews gebaut: Jeder Knoten lässt sich mindestens einer Geschichte zuordnen.',
      'Sie zeigt, was die Menschen erleben – nicht euer Produkt und keine Bildschirmabfolge.',
      'Sie zeigt auch Umwege, Schleifen und Abbrüche, nicht nur den glatten Weg.',
      'Die Momente überschneiden sich nicht: Jeder ist ein eigener Zeitpunkt.',
      'Jeder Moment steht in den Worten der Kundschaft und ist mit Zitat-IDs belegt.',
      'Der stärkste Moment und das Ende sind markiert.',
    ],
    ki: 'Liest eure Interviews und fragt, welche Geschichte in der Map fehlt und wo sich Momente überschneiden.',
  },
  {
    slug: 'baum', name: 'Opportunity Solution Tree', tag: 2, dauer: 65,
    frage: 'Welche Chancen aus den Interviews gehören unter welchen Moment – und wie hängen sie zusammen?',
    braucht: ['brief', 'synthese', 'journey'], ergibt: ['baum'],
    quelle: 'Teresa Torres, „Continuous Discovery Habits“ (2021), Kap. 6, S. 78–95',
    pruefliste: [
      'Jede Chance ist ein Bedürfnis, ein Schmerzpunkt oder ein Wunsch in den Worten der Kundschaft – keine Lösung.',
      'Jede gehörte Chance im Baum ist mit Zitat-IDs aus mehr als einem Interview belegt; ergänzte Eltern-Chancen sind als ergänzt markiert, Einzelfälle stehen getrennt.',
      'Jede Chance hängt unter genau einem Moment der Experience Map; keine hat zwei Eltern.',
      'Ein Kind ist ein Teil seines Elternteils; Geschwister lassen sich einzeln lösen.',
      'Kein senkrechter Stapel: Wo ein Elternteil nur ein Kind hat, ist notiert, wonach ihr als Nächstes fragt.',
      'Keine Chance ist ein Gefühl ohne Ursache oder so unkonkret wie „Das ist zu schwer“.',
    ],
    ki: 'Liest eure Interviews und sucht die sechs Anti-Muster – mit Zitat aus Baum und Interview.',
  },
  {
    slug: 'ziel-chance', name: 'Ziel-Chance wählen', tag: 2, dauer: 60,
    frage: 'An welcher Chance arbeiten wir als Nächstes – und warum gerade an dieser?',
    braucht: ['brief', 'synthese', 'baum'], ergibt: ['ziel'],
    quelle: 'Teresa Torres, „Continuous Discovery Habits“ (2021), Kap. 7, S. 96–104; Anthony W. Ulwick, „Turn Customer Input into Innovation“, HBR (2002)',
    pruefliste: [
      'Verglichen wurden Geschwister miteinander – nicht jede Chance einzeln mit „Sollen wir das machen?“.',
      'Die Ziel-Chance ist ein Blatt: Sie hat im Baum keine Kinder.',
      'Zu jeder der vier Linsen steht ein Satz: Größe, Markt, eigene Lage, Kundschaft.',
      'Größe und Kundschaft sind mit Zitat-IDs aus den Interviews belegt.',
      'Die Ulwick-Rechnung steht als geschätzte Gegenprobe daneben; entschieden hat das Gespräch, nicht die Zahl.',
    ],
    ki: 'Fragt nach, welche Linse eure Wahl trägt und wo ihr vom gewünschten Ergebnis rückwärts argumentiert.',
  },
  {
    slug: 'hmw', name: 'How Might We', tag: 2, dauer: 30,
    frage: 'Welche Frage öffnet für die Ziel-Chance möglichst viele Ideen?',
    braucht: ['ziel'], ergibt: ['chancen'],
    quelle: 'Warren Berger, „The Secret Phrase Top Innovators Use“, HBR Blog Network (2012); Teresa Torres, „Continuous Discovery Habits“ (2021), S. 94–95',
    pruefliste: [
      'Jede Frage beginnt mit „Wie könnten wir …“ und hängt an eurer Ziel-Chance.',
      'Keine Lösung steckt drin: Es gibt mehr als einen Weg, die Frage zu beantworten.',
      'Die Frage ist ehrgeizig, aber erreichbar – nicht so weit wie „den Morgen schöner machen“, nicht so eng wie eine einzelne Zahl.',
      'Sie ist aus Sicht der Kundschaft gestellt, nicht aus Sicht eures Produkts.',
      'Eine Frage ist ausgewählt, mit einem Satz, warum.',
    ],
    ki: 'Prüft, ob eine Frage eine Lösung vorgibt, zu weit oder zu eng ist und aus Sicht der Kundschaft gestellt ist.',
  },
  {
    slug: 'ideation', name: 'Ideation', tag: 2, dauer: 90,
    frage: 'Welche Lösungen gibt es für die Ziel-Chance – und welche drei vergleichen wir?',
    braucht: ['chancen'], ergibt: ['ideen'],
    quelle: 'Teresa Torres, „Continuous Discovery Habits“ (2021), Kap. 8, S. 106–114',
    pruefliste: [
      'Für die Ziel-Chance stehen 15 bis 20 Ideen, entstanden im Wechsel von allein und geteilt.',
      'Ideen, die die Ziel-Chance nicht lösen, sind aussortiert und stehen getrennt.',
      'Genau drei Ideen gehen weiter; bei jeder steht, warum sie die Ziel-Chance trifft.',
      'Die drei sind verschieden und keine Varianten derselben Idee; jede hat eine Fürsprecher*in.',
      'Ideen von Claude sind als solche markiert.',
    ],
    ki: 'Nach der ersten eigenen Runde, wenn ihr feststeckt: analoge Produkte aus anderen Branchen und extreme Nutzer*innen.',
  },
  {
    slug: 'kundenprofil', name: 'Kundenprofil', tag: 3, dauer: 30,
    frage: 'Welche Jobs, Pains und Gains hat dieses Segment – und welche zählen am meisten?',
    braucht: ['synthese', 'baum', 'ziel'], ergibt: ['profil'],
    pruefliste: [
      'Das Profil beschreibt genau ein Segment.',
      'Jobs sind Aufgaben der Person – keine Ergebnisse und keine Funktionen eures Produkts.',
      'Neben funktionalen Jobs steht mindestens ein sozialer oder emotionaler.',
      'Pains und Gains sind konkret: „mehr als fünf Leute in der Schlange“ statt „zu voll“.',
      'Kein Eintrag beschreibt euer Produkt oder eure Lösung.',
      'Die Ziel-Chance steht als Pain im Profil; jeder Eintrag verweist auf Zitat-IDs aus den Interviews.',
      'Jede Spalte ist für sich geordnet: Jobs nach Wichtigkeit, Pains nach Schwere, Gains nach Relevanz.',
    ],
    ki: 'Prüft gegen die häufigen Fehler: vermischte Segmente, Jobs mit Ergebnissen verwechselt, vage Pains, nur funktionale Jobs.',
    quelle: 'Osterwalder, Pigneur, Bernarda, Smith, „Value Proposition Design“ (2014), S. 44–80 (PDF)',
  },
  {
    slug: 'value-map', name: 'Value Map & Fit', tag: 3, dauer: 45,
    frage: 'Welche unserer drei Ideen trifft das Profil am besten – und wie genau schafft sie Wert?',
    braucht: ['profil', 'ideen'], ergibt: ['valuemap'],
    pruefliste: [
      'Für jede der drei Ideen von Tag 2 steht ein Lückensatz.',
      'Unter Produkte und Services steht nur, was für dieses Segment gedacht ist.',
      'Der Fit-Vergleich hakt jede Idee gegen die obersten Einträge des Profils ab (✓, ✗ oder ?).',
      'Gewählt ist die Idee mit dem besten Fit, mit einem Satz warum.',
      'Bei Schmerzlinderern und Gewinnerzeugern stehen keine Produkte, sondern was sie bewirken – mit der ID des Pains oder Gains.',
      'Die obersten Einträge des Profils sind adressiert – oder es steht da, warum nicht; was bewusst offen bleibt, ist markiert.',
    ],
    ki: 'Markiert Schmerzlinderer, die zu keinem Pain passen, und fragt nach jedem ✓ im Fit-Vergleich.',
    quelle: 'Osterwalder, Pigneur, Bernarda, Smith, „Value Proposition Design“ (2014), S. 44–118, 157–159 (PDF)',
  },
  {
    slug: 'concept-story', name: 'Concept Story', tag: 3, dauer: 75,
    frage: 'Warum versteht jemand in Sekunden, dass euer Produkt besser ist als das, was er heute tut?',
    braucht: ['annahmen', 'synthese', 'profil', 'valuemap'], ergibt: ['concept'],
    pruefliste: [
      'Alle sieben Stationen sind gefüllt; die Exposition beschreibt die Welt der Zielgruppe, was darin gut ist, und ihr großes Ziel – nicht das Produkt.',
      'Die steigende Handlung nennt Namen und Art des Produkts in einem Satz.',
      'Die Krise nennt mindestens eine heutige Alternative aus den Interviews und mindestens einen inneren Widerstand.',
      'Der Höhepunkt löst Pain und Krise auf und sagt, wie er anders und besser ist als die Alternativen.',
      'Neben der Story steht die einfache Lösung als Linie – und die Story hat ihr gegenüber Krise und Höhepunkt.',
      'Die fallende Handlung ist ein Gedanke, keine Handlung, und steht als Annahme mit ID bereit.',
      'Das Ende nennt das Ziel der Person und ein messbares Ziel des Geschäfts; jede Behauptung trägt eine J-, P-, G- oder Zitat-ID.',
    ],
    ki: 'Prüft, ob die Story Krise und Höhepunkt hat oder nur eine Linie ist; schreibt sie nicht um.',
    quelle: 'Donna Lichaw, The User’s Journey (Rosenfeld 2016), Kap. 2–4, 6–8',
  },
  {
    slug: 'geschaeftsmodell', name: 'Geschäftsmodell-Karten', tag: 3, dauer: 20,
    frage: 'Wer zahlt wofür – und welche Annahme steckt dahinter?',
    braucht: ['profil', 'valuemap', 'concept', 'annahmen', 'brief'], ergibt: ['geschaeftsmodell'],
    pruefliste: [
      'Wer? und Was? verweisen auf Kundenprofil und Value Map; Wie? und Wert? stehen neu da.',
      'Bei Wert? steht, wer wofür zahlt – und wie die Kundschaft heute bezahlt.',
      'Die wichtigsten Kosten sind als Posten genannt, nicht als „gering“.',
      'Das gewählte Muster ist benannt, und für jede andere Karte steht, warum sie verworfen wurde.',
      'Die Annahme, an der das Modell hängt, steht in der Annahmen-Map, Art „wirtschaftlich“, mit Wichtigkeit und Beleg – sie sagt, dass der Ertrag die Kosten deckt, nicht bloß, dass Umsatz entsteht.',
      'Nichts im Modell widerspricht der Krise der Concept Story oder einem Pain im Kundenprofil.',
    ],
    ki: 'Prüft, ob Wer, Was, Wie und Wert zusammenpassen; schlägt keine Muster vor.',
    quelle: 'Gassmann, Frankenberger, Csik: Geschäftsmodelle entwickeln, 2. Aufl. 2017 (St. Galler Business Model Navigator); Osterwalder u. a., Value Proposition Design, S. 115–118; Cagan, Inspired, S. 189–190, 277; Torres, Continuous Discovery Habits, S. 118, 125–128',
  },
  {
    slug: 'experiment', name: 'Experiment-Karte & Origin Story', tag: 3, dauer: 30,
    frage: 'Wie testen wir die riskanteste Annahme am billigsten?',
    braucht: ['annahmen', 'ideen', 'geschaeftsmodell'], ergibt: ['experimente', 'origin'],
    pruefliste: [
      'Die Karte testet die riskanteste noch offene Annahme und nennt ihre ID.',
      'Messgröße und Erfolgsschwelle stehen fest, bevor der Test läuft.',
      'Es ist der billigste Test, der die Frage beantwortet.',
      'Die Skizze der Origin Story unter der Karte führt von „nie davon gehört“ bis zum ersten Schritt.',
      'Für Aufsteller oder Landingpage ist notiert: erst der Pain, dann das Produkt, dann die Antwort auf die Hürde.',
    ],
    ki: 'Pre-Mortem, billigere Testvarianten, Schwelle für Erfolg vor dem Test.',
  },
  {
    slug: 'story-map', name: 'Story Map', tag: 3, dauer: 105,
    frage: 'Was bauen wir in welcher Reihenfolge, damit Nutzer*innen ihr Ziel erreichen?',
    braucht: ['valuemap', 'journey'], ergibt: ['storymap'],
    pruefliste: [
      'Die Aktivitäten im Backbone sind Verben aus Sicht der Nutzer*innen.',
      'Die Tasks stehen in der Reihenfolge, in der sie passieren.',
      'Unter den Tasks stehen Alternativen und Fehlerfälle.',
      'Jeder Slice ist nach dem Outcome benannt, das er erreicht.',
      'Der erste Slice ist ein Weg von Anfang bis Ende – nicht ein fertiger erster Schritt.',
      'Alle Basismerkmale (Kano) liegen im ersten Slice, dazu ein Begeisterungsmerkmal.',
    ],
    ki: 'Findet fehlende Fehlerwege und Alternativen; prüft, ob Slices nach Outcomes benannt sind.',
    quelle: 'Jeff Patton, User Story Mapping; Kano-Modell',
  },
  {
    slug: 'usage-story', name: 'Usage Story', tag: 3, dauer: 30,
    frage: 'Wo erlebt die Person im Kernablauf den Wert – und wie schnell ist danach Schluss?',
    braucht: ['annahmen', 'synthese', 'storymap', 'journey', 'profil', 'concept'], ergibt: ['usage'],
    pruefliste: [
      'Die Story hat eine Person aus den Interviews (Pseudonym, ID), Zeit, Ort und das Ziel aus der Concept Story.',
      'Der Auslöser ist ein Ereignis oder eine Aufforderung an einem Moment der Experience Map und passt zum Pain der Concept Story.',
      'Die Schritte sind die Tasks aus Slice 1 der Story Map, in ihrer Reihenfolge; jeder bringt die Person weiter als der vorige.',
      'Die Krise ist eine Hürde – Anmeldung, Bezahlen, Zweifel oder Bedienung – mit Beleg (Profil-, Annahme- oder Zitat-ID).',
      'Der Höhepunkt ist ein konkreter Bildschirm oder Moment, in dem die Person den Wert erlebt – und sagt, wie.',
      'Nach dem Höhepunkt kommen höchstens ein, zwei Schritte bis zum Ende; die Story endet nicht am Gipfel.',
      'Das Ende sagt, wo die Person steht und was die nächste Episode wäre.',
    ],
    ki: 'Prüft, ob der Höhepunkt nahe am Ende liegt und danach schnell Schluss ist.',
    quelle: 'Donna Lichaw, The User’s Journey (Rosenfeld 2016), Kap. 2, 5–8',
  },
  {
    slug: 'prototyp-spike', name: 'Prototyp-Spike & Usability-Test', tag: 3, dauer: 90,
    frage: 'Erreichen echte Menschen mit dem Prototyp den Höhepunkt?',
    braucht: ['usage', 'storymap'], ergibt: ['spike'],
    pruefliste: [
      'In docs/TESTS.md ist das Foto der Papierskizzen verlinkt – für jeden Bildschirm eine.',
      'Der Spike liegt in einem eigenen Branch und ist als Wegwerf-Prototyp gekennzeichnet.',
      'Der Prototyp bildet genau den Ablauf der Usage Story ab, bis zum Höhepunkt.',
      'Die Testaufgaben beschreiben ein Ziel, keine Bedienschritte.',
      'Nach den Tests (Hausaufgabe): Für jede Testperson steht fest, ob sie den Höhepunkt erreicht hat und wo sie hängen blieb.',
    ],
    ki: 'Baut den Wegwerf-Prototyp – erst nach der Papierskizze.',
  },
  {
    slug: 'scrum', name: 'Scrum im Team', tag: 4, dauer: 160,
    frage: 'Wie arbeiten wir als ein Team an drei Produkten?',
    braucht: [], ergibt: ['team'],
    pruefliste: [
      'Für jedes Produkt steht fest, wer Product Owner ist; alle drei sind Developer in allen drei Produkten.',
      'Es steht fest, wer im ersten Sprint Scrum Master ist – und dass die Rolle jeden Sprint wechselt.',
      'Sprintlänge, Zeiten der Events und das Daily zwischen den Kurstagen sind festgelegt.',
      'Die Definition of Done ist eine Liste prüfbarer Punkte und gilt für alle drei Produkte.',
      'Das Linear-Team ist genannt, und für jedes Produkt steht sein Linear-Projekt in der Tabelle.',
    ],
    ki: 'Keine Rolle – Scrum lernt ihr im Team und im Lego-Spiel.',
    quelle: 'Schwaber & Sutherland, Scrum Guide 2020',
  },
  {
    slug: 'backlog', name: 'Backlog aus Issues', tag: 4, dauer: 60,
    frage: 'Welche Issues ergeben sich aus dem ersten Slice – und in welcher Reihenfolge?',
    braucht: ['storymap', 'spike', 'experimente', 'team'], ergibt: ['issues'],
    pruefliste: [
      'Jedes Issue kommt aus Slice 1 der Story Map oder aus einem Testbefund und nennt seine Quelle.',
      'Jedes Issue hat Ziel (für wen, was, damit), Nicht im Umfang und „Fertig, wenn“.',
      'Jedes Issue ist ein senkrechter Schnitt: Danach kann jemand etwas, das vorher nicht ging.',
      'Kein Issue braucht mehr als einen Durchgang mit Claude; zu große sind geteilt.',
      'Die Reihenfolge ist begründet – mit RICE oder „Riskantestes zuerst“.',
    ],
    ki: 'INVEST-Prüfung, Vorschläge zum Schneiden zu großer Issues.',
  },
  {
    slug: 'akzeptanzkriterien', name: 'Akzeptanzkriterien', tag: 4, dauer: 45,
    frage: 'Woran prüfen wir, dass ein Issue fertig ist?',
    braucht: ['issues', 'brief', 'team'], ergibt: ['kriterien'],
    pruefliste: [
      'Jedes Kriterium hat die Form „Gegeben … wenn … dann …“ oder ist eine prüfbare Regel.',
      'Jedes Issue hat mindestens einen Fehler- oder Grenzfall.',
      'Kein Kriterium sagt, wie es gebaut wird.',
      'Jedes Kriterium lässt sich im Browser durchklicken.',
      'Hat das Produkt eine KI-Funktion: Es gibt Eval-Fälle mit erwartetem Verhalten und einer Schwelle.',
    ],
    ki: 'Ergänzt Negativ- und Grenzfälle – nachdem ihr den Normalfall geschrieben habt.',
  },
  {
    slug: 'schneiden', name: 'Schneiden statt Schätzen', tag: 4, dauer: 30,
    frage: 'Passt jedes Issue in einen Durchgang mit Claude – und versteht es das ganze Team?',
    braucht: ['issues', 'kriterien'], ergibt: ['geschnitten'],
    pruefliste: [
      'Zu jedem Issue für Sprint 1 steht als Kommentar, ob Claudes Plan in einen Durchgang passt.',
      'Was zu groß war, ist geteilt; jedes Teil ist wieder ein senkrechter Schnitt mit eigenen Akzeptanzkriterien.',
      'Was im Plan unklar war, steht jetzt in den Akzeptanzkriterien oder unter Nicht im Umfang.',
      'Jedes Issue haben die beiden anderen gelesen; ihre Fragen sind im Issue beantwortet.',
    ],
    ki: 'Macht im Plan-Modus einen Plan pro Issue, ohne zu bauen – ihr beurteilt, ob er in einen Durchgang passt.',
  },
  {
    slug: 'sprint', name: 'Sprint', tag: 4, dauer: 125,
    frage: 'Was liefern wir in diesem Sprint – und was lernen wir daraus?',
    braucht: ['geschnitten', 'team', 'brief'], ergibt: ['inkrement', 'sprintlog'],
    pruefliste: [
      'Jedes Produkt hat ein Sprint-Ziel in einem Satz, der sagt, was danach jemand kann – keine Liste von Issues.',
      'Die ausgewählten Issues stehen da; ab Sprint 2 sind es nicht mehr, als im Sprint davor fertig wurden.',
      'Die Definition of Done enthält ein gespeichertes Ereignis, das die Outcome-Metrik aus dem Produkt-Brief misst.',
      'Jedes erledigte Issue hat einen Beleg je Akzeptanzkriterium, den Link zum Pull Request und den Namen der Person, die ihn geprüft hat.',
      'Das Review hält fest, was gezeigt wurde, was Tests und Messung ergeben haben und was sich deshalb am Backlog ändert.',
      'Die Retro endet mit einer Maßnahme, einer verantwortlichen Person und dem Zeitpunkt, an dem ihr sie prüft.',
    ],
    ki: 'Baut die Issues als Developer im Rahmen der Definition of Done; prüft das Sprint-Ziel.',
  },
  {
    slug: 'pitch', name: 'Pitch', tag: 4, dauer: 45,
    frage: 'Überzeugt das Produkt – mit Belegen?',
    braucht: ['brief', 'concept', 'usage', 'origin', 'geschaeftsmodell', 'spike', 'inkrement', 'sprintlog', 'entscheidungen'], ergibt: ['pitch'],
    pruefliste: [
      'Der Einstieg ist die Concept Story: Die Nutzer*innen und ihr Problem kommen vor dem Produkt.',
      'Die Demo folgt der Usage Story, läuft live und endet am Höhepunkt; ein Video liegt als Plan B bereit.',
      'Jede Behauptung über Nutzer*innen hat einen Beleg mit ID: Zitat, Testbefund oder Messung.',
      'Mindestens eine widerlegte Annahme kommt vor – mit der Entscheidung, die daraus folgte.',
      'Die Zahlen der Outcome-Metrik stehen da, mit der Zahl der Personen dahinter, auch wenn sie klein ist.',
      'Es steht da, wer zahlt und wofür, und an welcher Annahme das Modell hängt.',
      'Der Schluss sagt, was ihr als Nächstes prüfen würdet und warum.',
    ],
    ki: 'Spielt einen skeptischen Investor; prüft jede Behauptung gegen das Entscheidungslog.',
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
  { n: 4, datum: '2026-11-28', titel: 'Scrum im Team', text: 'Ein Team, drei Produkte: Scrum, Backlog, Akzeptanzkriterien, Sprint-1-Planning, Pitch.' },
  { n: 5, datum: '2026-12-12', titel: 'Bauen & Review', text: 'Bauen, Usability-Tests über Kreuz, Sprint-1-Review, Retro, Sprint-2-Planning mit Störfall.' },
  { n: 6, datum: '2026-12-19', titel: 'Bauen', text: 'Sprint 2 fertig bauen und abnehmen: Der Prototyp steht.' },
  { n: 7, datum: '2027-01-07', titel: 'Präsentation', text: 'Finales Sprint-Review: Pitch, Live-Demo und Belege.' },
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

/** Werkstatt-Artefakt, das Claude zum Abgleich mit artefakt_lesen holt. */
function werkstattQuelle(id: string): ArtefaktName | undefined {
  const a = artefakt(id)!;
  return nurInWerkstatt(a) ? a.werkstatt : undefined;
}

const aufzaehlen = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} und ${xs.at(-1)}`);
const ausWerkstatt = (namen: ArtefaktName[]) => `${aufzaehlen(namen.map((n) => WERKSTATT_AKKUSATIV[n]))} (Werkzeug ${MCP_WERKZEUGE.artefaktLesen})`;

/** Wird das Ergebnis dieser Methode in der Werkstatt geprüft (Connector) statt als Datei im Repo? Mit pfad: immer die Datei. */
export function pruefungInWerkstatt(m: Methode, pfad?: string): boolean {
  return !pfad && m.ergibt.length > 0 && m.ergibt.every((id) => artefakt(id)?.werkstatt !== undefined);
}

const REGELN_ANFANG = 'Regeln: Zitier die Stelle, um die es geht. Nenn höchstens drei Befunde, die wichtigsten zuerst.';

/** Prompt „Prüfen lassen“: Claude liest das Ergebnis der Methode und zum Abgleich die Vorarbeit, prüft gegen die
 *  Prüfliste und ändert nichts. pfad: nur einen Teil prüfen (z. B. ein Transkript statt aller Interview-Dateien).
 *  Liegt das Ergebnis in der Werkstatt, prüft Claude es dort mit artefakt_pruefen – nie über eine Datei unter docs/. */
export function pruefPrompt(m: Methode, pfad?: string): string {
  if (!m.pruefliste) throw new Error(`pruefPrompt: Methode „${m.slug}“ hat keine Prüfliste`);
  const liste = m.pruefliste.map((p, i) => `${i + 1}. ${p}`);
  const werkstattAbgleich = [...new Set(m.braucht.map(werkstattQuelle).filter((n): n is ArtefaktName => !!n))];

  if (pruefungInWerkstatt(m, pfad)) {
    // Claude (claude.ai mit dem Connector) sieht nur die Mappe; Vorarbeit aus Dateien ließe sich so nicht lesen.
    const dateien = m.braucht.map(quelle).filter((p): p is string => !!p);
    if (dateien.length) throw new Error(`pruefPrompt: Methode „${m.slug}“ prüft in der Werkstatt, braucht aber Dateien: ${dateien.join(', ')}`);
    const namen = m.ergibt.map((id) => artefakt(id)!.werkstatt!);
    return [
      `Prüf ${aufzaehlen(namen.map((n) => WERKSTATT_AKKUSATIV[n]))} mit der Werkstatt (Werkzeug ${MCP_WERKZEUGE.artefaktPruefen}) gegen diese Prüfliste (${m.name}):`,
      ...liste,
      ...(werkstattAbgleich.length ? [`Zum Abgleich lies auch ${ausWerkstatt(werkstattAbgleich)}.`] : []),
      '',
      `${REGELN_ANFANG} Schreib nichts um und formulier keinen Text für mich – stell mir zu jedem Befund eine Frage, die mich weiterbringt. Passt alles, sag das in einem Satz.`,
    ].join('\n');
  }

  const pfade = pfad ? [pfad] : [...new Set(m.ergibt.map(quelle).filter((p): p is string => !!p))];
  // Viele Punkte lassen sich nur gegen die Vorarbeit prüfen (Zitate gegen Transkripte, IDs gegen das Kundenprofil).
  if (pfade.length === 0) throw new Error(`pruefPrompt: Methode „${m.slug}“ ergibt nichts, was Claude lesen kann`);
  // Ohne das, was Claude ohnehin liest – auch wenn pfad nur einen Teil davon nennt (z. B. ausgewählte Issues).
  const schonGelesen = new Set([...pfade, ...m.ergibt.map(quelle)]);
  const abgleich = [...new Set(m.braucht.map(quelle).filter((p): p is string => !!p && !schonGelesen.has(p)))];
  const teile = [abgleich.join(', '), werkstattAbgleich.length ? `aus der Werkstatt ${ausWerkstatt(werkstattAbgleich)}` : ''].filter(Boolean);
  return [
    `Lies ${pfade.join(' und ')}.${teile.length ? ` Zum Abgleich lies auch ${teile.join(' und ')}.` : ''} Prüf es gegen diese Liste (${m.name}):`,
    ...liste,
    '',
    `${REGELN_ANFANG} Schreib nichts um, ändere keine Datei und kein Issue – stell mir zu jedem Befund eine Frage, die mich weiterbringt. Passt alles, sag das in einem Satz.`,
  ].join('\n');
}
