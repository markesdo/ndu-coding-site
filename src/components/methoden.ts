// Toolbox des Innolabs: jede Methode beantwortet eine Frage und ergibt ein Artefakt. Spätere Methoden bauen auf
// diesen Artefakten auf, statt sie neu zu erarbeiten (Pains etwa nur im Kundenprofil). methoden.test.ts prüft die Kette.
// Ohne Astro, damit testbar.

export type Ort = 'repo' | 'miro' | 'linear' | 'live' | 'vortrag';

export const ORTE: Record<Ort, string> = {
  repo: 'Repo',
  miro: 'Miro',
  linear: 'Linear',
  live: 'Live-App',
  vortrag: 'Präsentation',
};

export interface Artefakt {
  id: string;
  name: string;
  lebtIn: Ort[];
  /** Datei oder Abschnitt im Projekt-Repo, wenn es dort festgehalten wird. */
  pfad?: string;
}

export const ARTEFAKTE: Artefakt[] = [
  { id: 'brief', name: 'Produkt-Brief mit Outcome-Metrik', lebtIn: ['repo'], pfad: 'docs/PRODUKT.md' },
  { id: 'entscheidungen', name: 'Entscheidungslog', lebtIn: ['repo'], pfad: 'docs/ENTSCHEIDUNGEN.md' },
  { id: 'transkripte', name: 'Leitfaden und Interview-Transkripte (anonymisiert)', lebtIn: ['repo'], pfad: 'docs/interviews/' },
  { id: 'annahmen', name: 'Annahmen-Map', lebtIn: ['miro', 'repo'], pfad: 'docs/ANNAHMEN.md' },
  { id: 'synthese', name: 'Themen mit Zitat-IDs', lebtIn: ['miro', 'repo'], pfad: 'docs/interviews/SYNTHESE.md' },
  { id: 'profil', name: 'Kundenprofil (Jobs, Pains, Gains)', lebtIn: ['miro', 'repo'], pfad: 'docs/KUNDENPROFIL.md' },
  { id: 'journey', name: 'Journey Map mit Momenten der Wahrheit', lebtIn: ['miro', 'repo'], pfad: 'docs/JOURNEY.md' },
  { id: 'chancen', name: 'Chancen als HMW-Fragen', lebtIn: ['miro', 'repo'], pfad: 'docs/CHANCEN.md' },
  { id: 'ideen', name: 'Ideen mit Auswahl', lebtIn: ['miro', 'repo'], pfad: 'docs/IDEEN.md' },
  { id: 'valuemap', name: 'Value Map und Fit', lebtIn: ['miro', 'repo'], pfad: 'docs/VALUE-MAP.md' },
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
  { id: 'schaetzung', name: 'Schätzung', lebtIn: ['linear'] },
  { id: 'inkrement', name: 'Laufendes Inkrement', lebtIn: ['live', 'repo'] },
  { id: 'pitch', name: 'Pitch mit Demo und Belegen', lebtIn: ['vortrag'] },
];

export interface Methode {
  slug: string;
  name: string;
  /** Kurstag 1–7, an dem die Methode eingeführt wird. */
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
}

/** In Kursreihenfolge – die Prüfung „braucht nur Früheres“ verlässt sich darauf. */
export const METHODEN: Methode[] = [
  {
    slug: 'problem-rahmen', name: 'Problem-Rahmen & Produkt-Brief', tag: 1, dauer: 60,
    frage: 'Welches Problem lösen wir für wen – und woran merken wir, dass es gelungen ist?',
    braucht: [], ergibt: ['brief'],
    ki: 'Findet versteckte Lösungen im Problemsatz und Ziele, die man nicht messen kann.',
  },
  {
    slug: 'entscheidungslog', name: 'Entscheidungslog', tag: 1, dauer: 15,
    frage: 'Was haben wir geglaubt, wie geprüft, was gelernt – und was haben wir darum geändert?',
    braucht: ['brief'], ergibt: ['entscheidungen'],
    ki: 'Prüft am Ende jedes Tages, welche Entscheidung ohne Beleg dasteht.',
  },
  {
    slug: 'interview', name: 'Jobs to be Done & Mom Test', tag: 1, dauer: 90,
    frage: 'Was tun Menschen heute wirklich, um ihren Job zu erledigen?',
    braucht: ['brief'], ergibt: ['transkripte'],
    ki: 'Markiert suggestive und hypothetische Fragen im Leitfaden und spielt zur Probe eine zurückhaltende Person aus der Zielgruppe.',
    quelle: 'Rob Fitzpatrick, The Mom Test; Clayton Christensen, Jobs to be Done',
  },
  {
    slug: 'annahmen', name: 'Annahmen-Map', tag: 1, dauer: 45,
    frage: 'Welche Annahmen müssen stimmen – und welche ist am riskantesten?',
    braucht: ['brief'], ergibt: ['annahmen'],
    ki: 'Red Team: sucht Annahmen, die ihr übersehen habt.',
    quelle: 'David J. Bland & Alex Osterwalder, Testing Business Ideas',
  },
  {
    slug: 'synthese', name: 'Interview-Synthese', tag: 2, dauer: 60,
    frage: 'Welche Muster zeigen sich über alle Interviews?',
    braucht: ['transkripte'], ergibt: ['synthese'],
    ki: 'Clustert nach euch ein zweites Mal – jedes Thema nur mit Zitat-ID.',
  },
  {
    slug: 'kundenprofil', name: 'Kundenprofil', tag: 2, dauer: 75,
    frage: 'Welche Jobs, Pains und Gains hat dieses Segment – und welche zählen am meisten?',
    braucht: ['synthese'], ergibt: ['profil'],
    ki: 'Prüft gegen die häufigen Fehler: vermischte Segmente, vage Pains, nur funktionale Jobs.',
    quelle: 'Strategyzer, Value Proposition Design',
  },
  {
    slug: 'journey-map', name: 'Journey Map', tag: 2, dauer: 120,
    frage: 'Wo im heutigen Ablauf entstehen die Pains – und wo entscheidet sich, ob jemand bleibt?',
    braucht: ['profil', 'synthese'], ergibt: ['journey'],
    ki: 'Findet Leerstellen und fragt nach dem Beleg für jeden Moment der Wahrheit.',
  },
  {
    slug: 'hmw', name: 'How Might We', tag: 2, dauer: 30,
    frage: 'Welche Chancen stecken in den Momenten der Wahrheit?',
    braucht: ['journey'], ergibt: ['chancen'],
    ki: 'Prüft, ob eine Frage schon eine Lösung vorgibt oder zu weit ist.',
  },
  {
    slug: 'ideation', name: 'Ideation', tag: 2, dauer: 90,
    frage: 'Welche Lösungen gibt es – und welche verfolgen wir?',
    braucht: ['chancen'], ergibt: ['ideen'],
    ki: 'Erst nach Crazy 8s und Brainwriting: Analogien aus anderen Branchen, sehr verschiedene Personas, naiver Mentee.',
  },
  {
    slug: 'value-map', name: 'Value Map & Fit', tag: 3, dauer: 60,
    frage: 'Wie lindert unser Angebot die wichtigsten Pains und schafft die wichtigsten Gains?',
    braucht: ['profil', 'ideen'], ergibt: ['valuemap'],
    ki: 'Markiert Schmerzlinderer, die zu keinem Pain passen.',
    quelle: 'Strategyzer, Value Proposition Design',
  },
  {
    slug: 'concept-story', name: 'Concept Story', tag: 3, dauer: 75,
    frage: 'Warum ist das Produkt spannend – und was hält Menschen davon ab?',
    braucht: ['profil', 'valuemap'], ergibt: ['concept'],
    ki: 'Sucht den flachen Moment: Gibt es einen echten Höhepunkt? Spielt gelangweiltes Publikum.',
    quelle: 'Donna Lichaw, The User’s Journey; ERRC-Raster aus Blue Ocean Strategy',
  },
  {
    slug: 'experiment', name: 'Experiment-Karte & Origin Story', tag: 3, dauer: 30,
    frage: 'Wie testen wir die riskanteste Annahme am billigsten?',
    braucht: ['annahmen', 'ideen'], ergibt: ['experimente', 'origin'],
    ki: 'Pre-Mortem, billigere Testvarianten, Schwelle für Erfolg vor dem Test.',
  },
  {
    slug: 'story-map', name: 'Story Map', tag: 3, dauer: 120,
    frage: 'Was bauen wir in welcher Reihenfolge, damit Nutzer*innen ihr Ziel erreichen?',
    braucht: ['valuemap', 'journey'], ergibt: ['storymap'],
    ki: 'Findet fehlende Fehlerwege und Alternativen; prüft, ob Slices nach Outcomes benannt sind.',
    quelle: 'Jeff Patton, User Story Mapping; Kano-Modell',
  },
  {
    slug: 'usage-story', name: 'Usage Story', tag: 3, dauer: 30,
    frage: 'Wo ist im Kernablauf der Höhepunkt – und wie endet er?',
    braucht: ['storymap'], ergibt: ['usage'],
    ki: 'Prüft, ob der „Boom“ am Ende liegt (Peak-End-Regel).',
    quelle: 'Donna Lichaw, The User’s Journey',
  },
  {
    slug: 'prototyp-spike', name: 'Prototyp-Spike & Usability-Test', tag: 3, dauer: 90,
    frage: 'Erreichen echte Menschen mit dem Prototyp den Höhepunkt?',
    braucht: ['usage', 'storymap'], ergibt: ['spike'],
    ki: 'Baut den Wegwerf-Prototyp – erst nach der Papierskizze.',
  },
  {
    slug: 'geschaeftsmodell', name: 'Geschäftsmodell-Karten', tag: 3, dauer: 20,
    frage: 'Wie trägt sich das Produkt?',
    braucht: ['valuemap'], ergibt: ['geschaeftsmodell'],
    ki: 'Spielt drei gezogene Muster gegen euer Produkt durch.',
    quelle: 'Gassmann, Frankenberger, Csik: St. Galler Business Model Navigator',
  },
  {
    slug: 'scrum', name: 'Scrum im Team', tag: 4, dauer: 300,
    frage: 'Wie arbeiten wir als ein Team an drei Produkten?',
    braucht: [], ergibt: ['team'],
    ki: 'Keine Rolle – Scrum lernt ihr im Team und im Lego-Spiel.',
    quelle: 'Schwaber & Sutherland, Scrum Guide 2020',
  },
  {
    slug: 'backlog', name: 'Backlog aus Issues', tag: 4, dauer: 60,
    frage: 'Welche Issues ergeben sich aus dem ersten Slice – und in welcher Reihenfolge?',
    braucht: ['storymap', 'spike', 'experimente', 'team'], ergibt: ['issues'],
    ki: 'INVEST-Prüfung, Vorschläge zum Schneiden zu großer Issues.',
  },
  {
    slug: 'akzeptanzkriterien', name: 'Akzeptanzkriterien', tag: 4, dauer: 60,
    frage: 'Woran prüfen wir, dass ein Issue fertig ist?',
    braucht: ['issues'], ergibt: ['kriterien'],
    ki: 'Ergänzt Negativ- und Grenzfälle – nachdem ihr den Normalfall geschrieben habt.',
  },
  {
    slug: 'schaetzen', name: 'Schätzen', tag: 5, dauer: 60,
    frage: 'Wie groß ist jedes Issue im Verhältnis zu den anderen?',
    braucht: ['issues', 'kriterien'], ergibt: ['schaetzung'],
    ki: 'Schätzt nicht mit (das würde ankern) – listet danach Risiken und Unbekanntes.',
  },
  {
    slug: 'sprint', name: 'Sprint', tag: 5, dauer: 120,
    frage: 'Was liefern wir in diesem Sprint – und was lernen wir daraus?',
    braucht: ['schaetzung', 'team', 'brief'], ergibt: ['inkrement'],
    ki: 'Baut die Issues als Developer im Rahmen der Definition of Done; prüft das Sprint-Ziel.',
  },
  {
    slug: 'pitch', name: 'Pitch', tag: 6, dauer: 60,
    frage: 'Überzeugt das Produkt – mit Belegen?',
    braucht: ['concept', 'usage', 'origin', 'geschaeftsmodell', 'inkrement', 'entscheidungen'], ergibt: ['pitch'],
    ki: 'Spielt einen skeptischen Investor; prüft jede Behauptung gegen das Entscheidungslog.',
  },
];

/** Kurstage: 4½ Tage Input und Übung, 1½ Tage Bauen, ½ Tag Präsentation. */
export const TAGE: { n: number; titel: string; text: string }[] = [
  { n: 1, titel: 'Rahmen & Verstehen', text: 'Problem und Outcome festlegen, Interviews vorbereiten, Annahmen sichtbar machen.' },
  { n: 2, titel: 'Kunde & Erlebnis', text: 'Interviews auswerten, Kundenprofil, Journey Map, Chancen und Ideen.' },
  { n: 3, titel: 'Lösung, Story, Prototyp', text: 'Value Map, Concept und Usage Story, Story Map, erster Prototyp.' },
  { n: 4, titel: 'Scrum im Team', text: 'Ein Team, drei Produkte: Rollen, Events, Backlog, Akzeptanzkriterien.' },
  { n: 5, titel: 'Schätzen & Bauen', text: 'Planning Poker, Definition of Done, Sprint-Planning, Sprint 1.' },
  { n: 6, titel: 'Bauen & Review', text: 'Usability-Tests über Kreuz, Review, Retro, Sprint 2, Pitch vorbereiten.' },
  { n: 7, titel: 'Präsentation', text: 'Finales Sprint-Review: Pitch, Live-Demo und Belege.' },
];

export const artefakt = (id: string): Artefakt | undefined => ARTEFAKTE.find((a) => a.id === id);

/** Die Methode, die ein Artefakt erzeugt. */
export const erzeugtVon = (id: string): Methode | undefined => METHODEN.find((m) => m.ergibt.includes(id));

/** Methoden eines Kurstags, in Kursreihenfolge. */
export const methodenVonTag = (tag: number): Methode[] => METHODEN.filter((m) => m.tag === tag);
