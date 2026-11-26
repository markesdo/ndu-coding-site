import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/story-map.astro (Tag 4, 28.11.2026, ab 11:30): Warm-up „euer Morgen“
// in sechs Schritten (alle selbst, je ein Frame „T4 · 1 · Warm-up · euer Morgen · Produkt n“), Begriffe, Theorie,
// Kaffeebar, dann die Übung in elf Schritten auf „T4 · 1 · Story Map“ (42 min). Patton = EPUB, zitiert nach Kapitel
// und Abschnitt. Markus zeigt das Warm-up an seinem eigenen Morgen auf seinem eigenen Miro-Board (Link nicht im Repo).
const PATTON = 'Jeff Patton, User Story Mapping (2014)';

export const NOTIZEN_STORY_MAP: Record<string, Notiz> = {
  warmup: {
    live: [
      'Wo wir stehen: E1 steht – jetzt, was ihr zuerst baut.',
      'Eigenes Board „Euer Morgen“ teilen (Link aus deinen Lesezeichen).',
      'Frames zeigen: Produkt 1 · 2 · 3, je sechs Karten oben.',
      'Farben: gelb Tasks, grün Aktivitäten, blau Details und Varianten.',
      '„Erst tun, dann kommen die Namen – wie bei Patton.“',
    ],
    kern: [{ text: '„It’s hands down my favorite way of teaching these basic mapping concepts.“', quelle: `${PATTON}, Kap. 5, Do Try This at Home, or at Work` }],
    miro: { frame: 'T4 · 1 · Warm-up · euer Morgen · Produkt 1', schritte: ['Jede*r öffnet den eigenen Frame (Produkt 1, 2 oder 3 = Spalte von links).', 'Karten 1–6 oben sind die Schritte dieser Folien; darunter die Arbeitsfläche mit Vorlage-Stickies.'] },
    ueberleitung: 'Schritt 1: Augen zu – was habt ihr heute als Erstes getan?',
  },

  'morgen-aufschreiben': {
    live: [
      '„Augen zu: Was habt ihr heute nach dem Aufwachen als Erstes getan?“',
      'Timer 4 min starten; dein eigener Morgen läuft auf deinem Board mit.',
      'Falle: Substantive („Kaffee“) – nachfragen: Was tust du dabei?',
      'Nach 4 min: zählen lassen, 15 bis 25 ist normal.',
      'Begriff erst jetzt: Task = etwas tun, um ein Ziel zu erreichen.',
    ],
    uebung: { dauer: '4 min', form: 'allein, eigener Warm-up-Frame' },
    kern: [
      { text: '„I expect it’ll take you three or four minutes to write all your stickies.“', quelle: `${PATTON}, Kap. 5, 1. Write Out Your Story a Step at a Time` },
      { text: '„Most people write somewhere between 15 and 25.“ – „User tasks are the basic building blocks of a story map.“', quelle: `${PATTON}, Kap. 5, Tasks Are What We Do` },
    ],
    ueberleitung: 'Jetzt bringt ihr sie in eine Reihenfolge.',
  },

  erzaehlfluss: {
    live: [
      'Timer 3 min: links das Erste, Gleichzeitiges stapeln.',
      '„Zeigt auf jedes Sticky: zuerst …, und dann …“',
      'Fehlendes fällt beim Erzählen auf – ergänzen lassen.',
      'Begriff: Erzählfluss = die Reihenfolge, in der man erzählt.',
    ],
    uebung: { dauer: '3 min', form: 'allein, eigener Warm-up-Frame' },
    kern: [{ text: '„Maps are organized left-to-right using a narrative flow: the order in which you’d tell the story.“', quelle: `${PATTON}, Kap. 5, 2. Organize Your Story` }],
    ueberleitung: 'Euer Morgen heute war einer von vielen – jetzt die anderen.',
  },

  varianten: {
    live: [
      'Drei Fragen vorlesen: gestern, kein Warmwasser, perfekter Morgen.',
      'Timer 4 min: blaue Stickies nach unten, unter den passenden Schritt.',
      'Bei Bedarf: Reihenfolge unklar? Dann ist sie egal.',
      'Begriff: Körper der Map – Details, Alternativen, Varianten, Ausnahmen.',
    ],
    uebung: { dauer: '4 min', form: 'allein, eigener Warm-up-Frame' },
    kern: [
      { text: '„Details, alternatives, variations, and exceptions fill in the body of a map.“', quelle: `${PATTON}, Kap. 5, 3. Explore Alternative Stories` },
      { text: '„If you’re arguing, it likely means that it doesn’t matter.“', quelle: `${PATTON}, Kap. 5, Keep the Flow` },
    ],
    ueberleitung: 'Die Map wird breit und tief – jetzt geben wir ihr ein Rückgrat.',
  },

  backbone: {
    live: [
      '„Welche Stickies dienen zusammen einem größeren Ziel?“',
      'Timer 3 min: grünes Sticky über jede Gruppe, ein Verb.',
      'Grüne Reihe mit „und dann“ vorlesen lassen.',
      'Begriff: Aktivität; die Reihe der Aktivitäten = Backbone.',
    ],
    uebung: { dauer: '3 min', form: 'allein, eigener Warm-up-Frame' },
    kern: [
      { text: '„Activities aggregate tasks directed at a common goal.“', quelle: `${PATTON}, Kap. 5, 4. Distill Your Map to Make a Backbone` },
      { text: '„Activities and high-level tasks form the backbone of a story map.“', quelle: `${PATTON}, Kap. 5, 4. Distill Your Map to Make a Backbone` },
    ],
    ueberleitung: 'Und jetzt der beste Teil: Ihr habt verschlafen.',
  },

  verschlafen: {
    live: [
      '„Der Wecker hat nicht geklingelt – in ein paar Minuten müsst ihr raus.“',
      'Pinkes Sticky links, gestrichelte Slice-Linie quer wie ein Gürtel.',
      'Timer 3 min: nach unten, was ihr heute nicht tut.',
      'Falle: Aktivitäten nach unten schieben – sie bleiben oben.',
    ],
    uebung: { dauer: '3 min', form: 'allein, eigener Warm-up-Frame' },
    kern: [{ text: '„Don’t move the activities down, even if there are no tasks left under them. Having the activity with no tasks in it lets you show that you aren’t going to hit that goal this morning.“', quelle: `${PATTON}, Kap. 5, 5. Slice Out Tasks That Help You Reach a Specific Outcome` }],
    ueberleitung: 'Oben ist es jetzt ziemlich leer – was tut ihr nur, wenn ihr spät dran seid?',
  },

  'verschlafen-slice': {
    live: [
      'Timer 2 min: ergänzen, was ihr nur heute tut.',
      'Patton: „Splash water on face“ statt Duschen.',
      'Begriff: Outcome = das Ziel links; Slice = alles, was es braucht.',
      '„Andere Ziele links – die Reihenfolge bleibt, die Tasks ändern sich.“',
    ],
    uebung: { dauer: '2 min', form: 'allein, eigener Warm-up-Frame' },
    kern: [{ text: '„Use slices to identify all the tasks and details relevant to a specific outcome.“', quelle: `${PATTON}, Kap. 5, 5. Slice Out Tasks That Help You Reach a Specific Outcome` }],
    ueberleitung: 'Eine Frage ist offen geblieben: Wie groß darf ein Sticky sein?',
  },

  zielebenen: {
    live: [
      'Dein Board: Goal-Level-Frame zeigen, drei Ebenen mit Farben.',
      '„Meereshöhe: Was ihr ohne Pause zu Ende bringt – Duschen.“',
      'Darüber Zusammenfassung „Fertig machen“, darunter „Haare waschen“.',
      'Metapher von Cockburn, Patton übernimmt sie.',
      'Timer 2 min: zu Kleines zusammenfassen, zu Großes zerlegen.',
    ],
    verstaendnis: {
      frage: 'Ist „Haare waschen“ ein Task auf Meereshöhe?',
      antwort: 'Nein, ein Teilschritt darunter: Er gehört zu „Duschen“, und niemand hört nach dem Haarewaschen auf und duscht später weiter.',
      falsch: '„Ja, weil es ein Verb ist“ – Verb-Sätze gibt es auf jeder Ebene; entscheidend ist, ob man ohne Pause zu Ende kommt.',
    },
    uebung: { dauer: '2 min', form: 'allein, eigener Warm-up-Frame' },
    kern: [
      { text: '„A sea-level task is one we’d expect to complete before intentionally stopping to do something else.“', quelle: `${PATTON}, Kap. 5, I’m Just More Detail-Oriented` },
      { text: '„Use the goal-level concept to help you aggregate small tasks or decompose large tasks.“', quelle: `${PATTON}, Kap. 5, I’m Just More Detail-Oriented` },
    ],
    ueberleitung: 'Damit habt ihr alle Begriffe schon getan – hier sind sie mit Namen.',
  },

  begriffe: {
    live: [
      'Nacheinander aufdecken, jeweils auf die eigene Morgen-Map zeigen.',
      '„Euer Morgen ist eine Story Map – mehr Begriffe braucht ihr nicht.“',
      'Weiter: dieselben Bausteine für das Produkt.',
    ],
    kern: [{ text: '„That’s It! You’ve Learned All the Important Concepts“ – Tasks, Zielebenen, Erzählfluss, Tiefe, Aktivitäten, Backbone, Slice.', quelle: `${PATTON}, Kap. 5` }],
    ueberleitung: 'Warum überhaupt eine Map und keine Liste? Garys Geschichte.',
  },

  warum: {
    live: [
      'Gary vorstellen: Musiker, Gründer von Mad Mimi.',
      'Ein Tag Mapping – dann Pattons Frage nach dem Gebauten.',
      '„Nearly none of it“ – die Liste hatte den falschen Anfang.',
    ],
    kern: [{ text: '„You’ve been building a lot of software so far, but how much of the software you’ve built is on this map we’ve created?“ – „Nearly none of it.“', quelle: `${PATTON}, Kap. 1, Gary and the Tragedy of the Flat Backlog` }],
    ueberleitung: 'Was zählt am Ende – das Gebaute oder was Menschen danach tun?',
  },

  outcome: {
    live: [
      'Output = was ihr baut; Outcome = was Menschen danach anders tun.',
      '„Es gibt immer mehr zu bauen als Zeit.“',
      'Brief zeigen: Euer Outcome steht seit Tag 1 drin.',
    ],
    kern: [{ text: '„Minimize output, and maximize outcome and impact.“', quelle: `${PATTON}, Read This First` }],
    ueberleitung: 'Euer Morgen war eine Jetzt-Map. Die Produkt-Map ist eine Später-Map.',
  },

  'jetzt-spaeter': {
    live: [
      'Jetzt-Map = Experience Map von Tag 2; Später-Map = heute.',
      '„Das Produkt ist live – ein Tag im Leben von …“',
      'Falle: Bildschirme statt Verb-Sätze – „Bestellseite“.',
    ],
    kern: [{ text: 'Now- und Later-Maps: „the concepts are the same in both“.', quelle: `${PATTON}, Kap. 5, It’s a Now Map, Not a Later Map` }],
    ueberleitung: 'Eine Produkt-Map hat oft mehr als eine Person, die handelt.',
  },

  anatomie: {
    live: [
      'Backbone oben, Körper darunter: große und kleine Dinge.',
      'Wer handelt: Personen-Sticky über dem Backbone, auch das System.',
      'Kaffeebar: ohne Barista kein Kaffee.',
    ],
    kern: [{ text: '„It’s just big things and little things.“', quelle: `${PATTON}, Kap. 2, Anatomy of a Big Map` }],
    ueberleitung: 'Wie findet ihr, was noch fehlt? Mit vier Fragen.',
  },

  erkunden: {
    live: [
      'Erst bis zum Ende, dann in die Tiefe.',
      'Vier Fragen einzeln aufdecken – sie kommen in Schritt 6 wieder.',
      '„So wächst nicht der Umfang, sondern euer Verständnis.“',
    ],
    kern: [{ text: '„Scope doesn’t creep; understanding grows.“', quelle: `${PATTON}, Kap. 2, Mapping Helps You Spot Holes in Your Story` }],
    ueberleitung: 'Wenn die Map voll ist: Wie schneidet ihr sie?',
  },

  schneiden: {
    live: [
      'Linie quer wie beim verschlafenen Morgen.',
      'Links das Ziel-Outcome, nicht das Feature.',
      'Untereinander: Roadmap aus Nutzen.',
    ],
    kern: [{ text: '„Notice how the list isn’t a bunch of features. It’s a list of real-world benefits.“', quelle: `${PATTON}, Kap. 2, Slice Out a Release Roadmap` }],
    ueberleitung: 'Der erste Slice ist besonders: Er soll laufen und lehren.',
  },

  lernen: {
    live: [
      'Laufendes Skelett: durch alle Aktivitäten, nicht tief in eine.',
      'Links dazu: „Wir lernen, ob … (A5)“.',
      'Drei Linien im Bild: läuft – besser – auslieferbar.',
      '„Ist es produktionsreif, habt ihr zu viel gebaut.“',
    ],
    kern: [{ text: '„what you build early may not be production ready. In fact, if it is, you’ve likely done too much“.', quelle: `${PATTON}, Kap. 3, Build to Learn` }],
    ueberleitung: 'So sieht das an der Kaffeebar aus.',
  },

  beispiel: {
    live: [
      'Backbone oben lesen, mit „und dann“.',
      'Zeile für Zeile: Pendler*in, Barista, wenn es schiefgeht.',
      'Dicke Linie = Schnitt; darunter Slice 2, Stammgast.',
      'Sternchen: kein Software-Schritt – bar zahlen reicht zum Lernen.',
    ],
    miro: { frame: 'T4 · 1 · Story Map', schritte: ['Kaffeebar-Map im Frame zeigen, falls dort aufgebaut.'] },
    ueberleitung: 'Wie das zu Pattons sechs Schritten passt.',
  },

  'sechs-schritte': {
    live: [
      'Pattons sechs Schritte, rechts, wo ihr sie gleich tut.',
      'Kursregel: 4 und 5 in einem Slice – Outcome und Lernziel.',
      'Schritt 6 erst an Tag 5.',
    ],
    kern: [{ text: '„I can boil down the last four chapters into just six steps.“', quelle: `${PATTON}, Kap. 5, Six Simple Steps to Story Mapping` }],
    ueberleitung: 'Jetzt eure Map – Schritt für Schritt.',
  },

  vorgehen: {
    live: [
      'Elf Schritte, jeder mit eigener Folie, Uhr und Prüffrage.',
      'Farblegende zeigen – gilt auf allen Story-Map-Frames.',
      'Kursregel: allein, du kommst ab Schritt 7 ins 1:1.',
      'Keine Runde über die Maps der anderen.',
    ],
    uebung: { dauer: '42 min (3 + 2 + 6 + 2 + 2 + 6 + 5 + 2 + 5 + 5 + 4)', form: 'allein, 1:1 mit Markus' },
    miro: { frame: 'T4 · 1 · Story Map', schritte: ['Jede*r mappt den eigenen Spitzenreiter im Story-Map-Frame.', 'Farben: Grün Aktivität, Gelb Task, Blau Details, Rot geht schief, Grau System, Orange/Pink Outcome, Violett wer handelt, * kein Software-Schritt.'] },
    ueberleitung: 'Schritt 1: der Rahmen.',
  },

  'schritt-rahmen': {
    live: [
      'Timer 3 min: Kopfzeile – für wen, Outcome aus dem Brief, Idee.',
      'Violette Stickies: Hauptperson und wer noch handeln muss.',
      'Fragen: Mensch, Verhalten, Idee – oder nur ein Produktname?',
    ],
    uebung: { dauer: '3 min', form: 'allein' },
    ueberleitung: 'Die Jetzt-Map habt ihr schon – holt euch daraus die Pains.',
  },

  'schritt-jetzt-map': {
    live: [
      'Timer 2 min: Experience Map öffnen, Momente lesen.',
      'Zwei, drei stärkste Pains mit Zitat-ID an den Rand.',
      '„Jeder dieser Pains braucht einen Task in der Später-Map.“',
    ],
    uebung: { dauer: '2 min', form: 'allein' },
    ueberleitung: 'Jetzt die Später-Map: ein Tag im Leben, wenn das Produkt live ist.',
  },

  'schritt-tasks': {
    live: [
      'Anfang beim Anlass im Alltag, Ende wenn der Outcome eintritt.',
      'Timer 6 min: gelbe Verb-Sätze, erst bis zum Ende.',
      'Falle: „klickt“, „ist auf Seite“ – fragen: wozu?',
      'Falle: „und“ auf dem Sticky – zwei Stickies.',
    ],
    uebung: { dauer: '6 min', form: 'allein' },
    ueberleitung: 'Über die Tasks kommen die Aktivitäten.',
  },

  'schritt-aktivitaeten': {
    live: [
      'Timer 2 min: grüne Stickies, Verb in der Sprache der Person.',
      'Falle: Trichter „Anbahnung, Information, Registrierung“.',
      'Fragen: Kommt das Produkt erst im letzten Drittel vor?',
    ],
    uebung: { dauer: '2 min', form: 'allein' },
    ueberleitung: 'Wer muss außer eurer Person noch etwas tun?',
  },

  'schritt-reihen': {
    live: [
      'Timer 2 min: zweite Person in eigene Reihe, violettes Sticky links.',
      'System grau, aktiv, nur wenn die Person wartet oder etwas sieht.',
      'Fragen: Wessen Reihe ist leer, obwohl ohne sie nichts ankommt?',
    ],
    uebung: { dauer: '2 min', form: 'allein' },
    ueberleitung: 'Jetzt in die Tiefe – mit den vier Fragen.',
  },

  'schritt-erkunden': {
    live: [
      'Timer 6 min: vier Zeilen – Genauer, Oder, Richtig gut, Geht schief.',
      'Mindestens ein rotes Sticky pro Aktivität.',
      'Falle: Kanal oder Feature-Name statt Verb-Satz.',
    ],
    uebung: { dauer: '6 min', form: 'allein' },
    ueberleitung: 'Und dann sucht ihr die Löcher.',
  },

  'schritt-loecher': {
    live: [
      'Timer 5 min: allein „Was ist, wenn …?“ und „Was dazwischen?“.',
      'Du gehst von Map zu Map, 1:1, je gut eine Minute.',
      'Ergänzen, nicht verteidigen.',
    ],
    uebung: { dauer: '5 min', form: 'allein, 1:1 mit Markus' },
    ueberleitung: 'Bevor ihr schneidet: Was soll Slice 1 bewirken?',
  },

  'schritt-outcome': {
    live: [
      'Timer 2 min: Outcome-Sticky orange oder pink, links an Slice 1.',
      '„[Wer] tut [was] statt [was bisher].“',
      'Darunter „Wir lernen, ob … (A…)“ mit Annahmen-ID.',
      'Falle: „können“, „wird informiert“, „Umsatz“.',
    ],
    uebung: { dauer: '2 min', form: 'allein' },
    ueberleitung: 'Jetzt die Linie – und schieben, nicht kopieren.',
  },

  'schritt-schneiden': {
    live: [
      'Timer 5 min: Linie, nach unten schieben – nicht kopieren.',
      'Pro Spalte eine Variante oben; „oder“ bleibt unten.',
      'Fragen: Was ist euer „bar an der Ausgabe“?',
      'Fragen: Welches Sticky oben fehlt der Lernfrage nicht?',
    ],
    uebung: { dauer: '5 min', form: 'allein' },
    ueberleitung: 'Reicht Slice 1? Das zeigt euch „und dann“.',
  },

  'schritt-durchgehen': {
    live: [
      'Timer 5 min: Slice 1 mit „und dann“ erzählen, Aktivitäten abhaken.',
      'Kein Haken: Schritt ergänzen oder laut sagen, warum nicht nötig.',
      'Fragen: An welchem Sticky passiert der Outcome?',
    ],
    uebung: { dauer: '5 min', form: 'allein' },
    ueberleitung: 'Zum Schluss ins Repo – und Claude nach Annahmen fragen.',
  },

  'schritt-festhalten': {
    live: [
      'Timer 4 min: auf Miro fertig – keine Datei, kein Commit.',
      'Claude Code mit Opus: Screenshot des Bereichs in den Prompt.',
      'Fragen: Steht jedes Sticky nur einmal auf der Map?',
      'Bei Bedarf: Claude Code noch nicht da? Prompt nach der Pause.',
    ],
    uebung: { dauer: '4 min', form: 'allein' },
    ueberleitung: 'Slice 1 steht – nach der Pause wird er zur Geschichte.',
  },

  uebertrag: {
    live: [
      'Slice 1 steht: Outcome, Lernfrage, eine Abkürzung mit *.',
      'Nach der Pause: Usage Story durch Slice 1.',
    ],
    ueberleitung: 'Nach der Pause erzählt ihr den Weg durch Slice 1 als Geschichte.',
  },
};
