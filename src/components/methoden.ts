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
  /** Kurstag, an dem die Methode eingeführt wird (1–6; Tag 7 ist die Präsentation, dort kommt nichts Neues dazu). */
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
      'Die Outcome-Metrik beschreibt, was Menschen tun – nicht, was das Produkt kann – und ist mit 3–5 Menschen prüfbar.',
    ],
  },
  {
    slug: 'entscheidungslog', name: 'Entscheidungslog', tag: 1, dauer: 15,
    frage: 'Was haben wir geglaubt, wie geprüft, was gelernt – und was haben wir darum geändert?',
    braucht: ['brief'], ergibt: ['entscheidungen'],
    ki: 'Prüft am Ende jedes Tages, welche Entscheidung ohne Beleg dasteht.',
    pruefliste: [
      'Jede Zeile nennt Datum, Entscheidung und Grund.',
      'Jede Produktentscheidung nennt einen Beleg – oder ausdrücklich „noch keiner“.',
      'Keine Annahme ist als Tatsache formuliert („Pendler*innen wollen …“ statt „Wir glauben, dass …“).',
      'Wo ein Test etwas widerlegt hat, steht die Änderung als neue Zeile da – die alte bleibt stehen.',
    ],
  },
  {
    slug: 'interview', name: 'Jobs to be Done & Mom Test', tag: 1, dauer: 120,
    frage: 'Was tun Menschen heute wirklich, um ihren Job zu erledigen?',
    braucht: ['brief'], ergibt: ['transkripte'],
    pruefliste: [
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
    slug: 'synthese', name: 'Interview-Synthese', tag: 2, dauer: 60,
    frage: 'Welche Muster zeigen sich über alle Interviews?',
    braucht: ['transkripte', 'annahmen'], ergibt: ['synthese'],
    pruefliste: [
      'Jedes Thema ist ein Satz über Verhalten oder Erleben – kein Stichwort wie „Wartezeit“.',
      'Jedes Thema nennt Zitat-IDs aus mindestens zwei Interviews, oder es ist als Einzelfall markiert.',
      'Jedes Zitat steht wörtlich so im Transkript.',
      'Mindestens ein Thema widerspricht einer Annahme oder hat euch überrascht.',
      'In der Annahmen-Map ist die Spalte „Beleg“ nachgetragen.',
    ],
    ki: 'Clustert nach euch ein zweites Mal – jedes Thema nur mit wörtlichem Zitat und Datei.',
  },
  {
    slug: 'kundenprofil', name: 'Kundenprofil', tag: 2, dauer: 75,
    frage: 'Welche Jobs, Pains und Gains hat dieses Segment – und welche zählen am meisten?',
    braucht: ['synthese'], ergibt: ['profil'],
    pruefliste: [
      'Das Profil beschreibt genau ein Segment.',
      'Jobs sind Aufgaben der Person – keine Ergebnisse und keine Funktionen eures Produkts.',
      'Neben funktionalen Jobs steht mindestens ein sozialer oder emotionaler.',
      'Pains und Gains sind konkret: „mehr als 6 Minuten anstehen“ statt „zu lange“.',
      'Kein Eintrag beschreibt euer Produkt oder eure Lösung.',
      'Jeder Eintrag verweist auf ein Thema oder Zitat aus der Synthese.',
      'Die Einträge sind nach Chancenwert sortiert, die drei wichtigsten markiert.',
    ],
    ki: 'Prüft gegen die häufigen Fehler: vermischte Segmente, vage Pains, nur funktionale Jobs.',
    quelle: 'Strategyzer, Value Proposition Design',
  },
  {
    slug: 'journey-map', name: 'Journey Map', tag: 2, dauer: 120,
    frage: 'Wo im heutigen Ablauf entstehen die Pains – und wo entscheidet sich, ob jemand bleibt?',
    braucht: ['profil', 'synthese'], ergibt: ['journey'],
    pruefliste: [
      'Die Map beginnt vor dem ersten Kontakt und endet nach dem letzten.',
      'Sie beschreibt, was die Person tut und erlebt – nicht eure internen Abläufe.',
      'Wartezeiten und Leerlauf stehen als eigene Momente drin.',
      'Pains stehen als ID aus dem Kundenprofil an ihrem Moment; ein neuer Pain kommt zuerst ins Profil.',
      'Es gibt drei Momente der Wahrheit, jeder mit Beleg aus der Synthese.',
      'Für jeden Moment ist das Gefühl eingetragen.',
    ],
    ki: 'Findet Leerstellen und fragt nach dem Beleg für jeden Moment der Wahrheit.',
  },
  {
    slug: 'hmw', name: 'How Might We', tag: 2, dauer: 30,
    frage: 'Welche Chancen stecken in den Momenten der Wahrheit?',
    braucht: ['journey'], ergibt: ['chancen'],
    pruefliste: [
      'Jede Frage beginnt mit „Wie könnten wir …“ und hängt an einem Moment der Wahrheit (W1–W3).',
      'Keine Frage enthält schon eine Lösung.',
      'Keine Frage ist so weit, dass jede Idee passt.',
      'Ein bis zwei Fragen sind ausgewählt, mit einem Satz, warum sie am meisten auf das Outcome wirken.',
    ],
    ki: 'Prüft, ob eine Frage schon eine Lösung vorgibt oder zu weit ist.',
  },
  {
    slug: 'ideation', name: 'Ideation', tag: 2, dauer: 90,
    frage: 'Welche Lösungen gibt es – und welche verfolgen wir?',
    braucht: ['chancen'], ergibt: ['ideen'],
    pruefliste: [
      'Vor der KI-Runde stehen mindestens acht eigene Ideen.',
      'Ideen der anderen beiden aus dem Brainwriting sind drin.',
      'Ideen von Claude sind als solche markiert.',
      'Die Auswahl entstand durch stilles Abstimmen; die Begründung steht dabei.',
      'Die gewählte Idee beantwortet eine ausgewählte HMW-Frage und nennt deren ID.',
    ],
    ki: 'Erst nach den eigenen Runden: Analogien aus anderen Branchen, die Sicht sehr verschiedener Nutzer*innen, Fragen als neugierige*r Neue*r im Team.',
  },
  {
    slug: 'value-map', name: 'Value Map & Fit', tag: 3, dauer: 60,
    frage: 'Wie lindert unser Angebot die wichtigsten Pains und schafft die wichtigsten Gains?',
    braucht: ['profil', 'ideen'], ergibt: ['valuemap'],
    pruefliste: [
      'Unter Produkte und Services steht nur, was für dieses Segment gedacht ist.',
      'Bei Schmerzlinderern und Gewinnerzeugern stehen keine Produkte, sondern was sie bewirken.',
      'Jeder Schmerzlinderer und Gewinnerzeuger nennt die ID des Pains oder Gains, den er adressiert.',
      'Die drei wichtigsten Einträge des Kundenprofils sind adressiert – oder es steht da, warum nicht.',
      'Was bewusst offen bleibt, ist markiert; es wird nicht jeder Pain gelöst.',
    ],
    ki: 'Markiert Schmerzlinderer, die zu keinem Pain passen.',
    quelle: 'Strategyzer, Value Proposition Design',
  },
  {
    slug: 'concept-story', name: 'Concept Story', tag: 3, dauer: 75,
    frage: 'Warum ist das Produkt spannend – und was hält Menschen davon ab?',
    braucht: ['profil', 'valuemap'], ergibt: ['concept'],
    pruefliste: [
      'Alle sieben Stationen des Story-Bogens sind ausgefüllt.',
      'Die Exposition beschreibt die Welt der Zielgruppe, nicht das Produkt.',
      'Die Krise nennt echte Alternativen und mindestens eine innere Hürde.',
      'Der Höhepunkt ist eine spürbare Veränderung für die Person – nicht nur „alles in einem“.',
      'Das Ende nennt ein Ziel der Nutzer*innen und eines des Geschäfts.',
      'Jede Behauptung stützt sich auf Kundenprofil oder Value Map und nennt die ID.',
    ],
    ki: 'Sucht den flachen Moment: Gibt es einen echten Höhepunkt? Spielt gelangweiltes Publikum.',
    quelle: 'Donna Lichaw, The User’s Journey; ERRC-Raster aus Blue Ocean Strategy',
  },
  {
    slug: 'experiment', name: 'Experiment-Karte & Origin Story', tag: 3, dauer: 30,
    frage: 'Wie testen wir die riskanteste Annahme am billigsten?',
    braucht: ['annahmen', 'ideen'], ergibt: ['experimente', 'origin'],
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
    slug: 'story-map', name: 'Story Map', tag: 3, dauer: 120,
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
    frage: 'Wo ist im Kernablauf der Höhepunkt – und wie endet er?',
    braucht: ['storymap', 'journey', 'profil'], ergibt: ['usage'],
    pruefliste: [
      'Die Geschichte hat eine konkrete Person in einer konkreten Situation, mit Ziel.',
      'Der Auslöser hängt an einem Moment der Wahrheit aus der Journey Map.',
      'Die Schritte sind so klein, dass man sie im Prototyp nachbauen kann.',
      'Die Krise ist eine echte Hürde aus Kundenprofil oder Journey Map und nennt die ID.',
      'Der Höhepunkt liegt am Ende des Ablaufs, nicht in der Mitte.',
      'Das Ende sagt, wo die Person danach steht.',
    ],
    ki: 'Prüft, ob der „Boom“ am Ende liegt (Peak-End-Regel).',
    quelle: 'Donna Lichaw, The User’s Journey',
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
    slug: 'geschaeftsmodell', name: 'Geschäftsmodell-Karten', tag: 3, dauer: 20,
    frage: 'Wie trägt sich das Produkt?',
    braucht: ['valuemap', 'annahmen', 'brief'], ergibt: ['geschaeftsmodell'],
    pruefliste: [
      'Es steht da, wer zahlt und wofür.',
      'Mindestens drei Muster wurden durchgespielt, eins ist gewählt – mit Grund.',
      'Die wichtigsten Kosten sind genannt.',
      'Die Annahme, an der das Modell hängt, ist als eigene Zeile formuliert.',
    ],
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

/** Sieben Termine: Tag 1–4 und der Vormittag von Tag 5 Input und Übung (4½), Tag 5 nachmittags und Tag 6 Bauen (1½), Tag 7 Präsentation (½). */
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

/** Prompt „Prüfen lassen“: Claude liest das Ergebnis der Methode und zum Abgleich die Vorarbeit, prüft gegen die
 *  Prüfliste und ändert nichts. pfad: nur einen Teil prüfen (z. B. den Leitfaden statt aller Interview-Dateien). */
export function pruefPrompt(m: Methode, pfad?: string): string {
  if (!m.pruefliste) throw new Error(`pruefPrompt: Methode „${m.slug}“ hat keine Prüfliste`);
  const pfade = pfad ? [pfad] : m.ergibt.map((id) => artefakt(id)!.pfad).filter(Boolean);
  // Viele Punkte lassen sich nur gegen die Vorarbeit prüfen (Zitate gegen Transkripte, IDs gegen das Kundenprofil).
  const abgleich = [...new Set(m.braucht.map((id) => artefakt(id)!.pfad).filter((p): p is string => !!p && !pfade.includes(p)))];
  return [
    `Lies ${pfade.join(' und ')}.${abgleich.length ? ` Zum Abgleich lies auch ${abgleich.join(', ')}.` : ''} Prüf es gegen diese Liste (${m.name}):`,
    ...m.pruefliste.map((p, i) => `${i + 1}. ${p}`),
    '',
    'Regeln: Zitier die Stelle, um die es geht. Nenn höchstens drei Befunde, die wichtigsten zuerst. Schreib nichts um und ändere keine Datei – stell mir zu jedem Befund eine Frage, die mich weiterbringt. Passt alles, sag das in einem Satz.',
  ].join('\n');
}
