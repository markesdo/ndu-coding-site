import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/story-map.astro (Tag 4, 28.11.2026, 11:40–13:05): Warm-up „euer Morgen“
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
      'Satz der Folie langsam vorlesen: Augen zu, aufwachen, Erstes aufschreiben.',
      'Timer 4 min starten; dein eigener Morgen läuft auf deinem Board mit.',
      'Falle: Substantive („Kaffee“) – nachfragen: Was tust du dabei?',
      'Nach 4 min: zählen lassen, 15 bis 25 ist normal.',
      'Begriff erst jetzt: Task = etwas tun, um ein Ziel zu erreichen.',
    ],
    uebung: { dauer: '4 min', form: 'allein, eigener Warm-up-Frame' },
    kern: [
      { text: '„Close your eyes, and think back to the moment you woke up this morning. … What’s the first thing you recall doing? Now, open your eyes, and write it down on a sticky note.“', quelle: `${PATTON}, Kap. 5, 1. Write Out Your Story a Step at a Time` },
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
      'Drei Morgen vorlesen: typischer, bester, schlechtester.',
      'Timer 4 min: blaue Stickies nach unten, unter den passenden Schritt.',
      'Bei Bedarf: Reihenfolge unklar? Dann ist sie egal.',
      'Begriff: Körper der Map – Details, Alternativen, Varianten, Ausnahmen.',
    ],
    uebung: { dauer: '4 min', form: 'allein, eigener Warm-up-Frame' },
    kern: [
      { text: '„Details, alternatives, variations, and exceptions fill in the body of a map.“', quelle: `${PATTON}, Kap. 5, 3. Explore Alternative Stories` },
      { text: '„the typical day story, the fabulous day story, and the story that has an emergency or two“ – daher typischer, bester, schlechtester Morgen.', quelle: `${PATTON}, Kap. 5, 3. Explore Alternative Stories` },
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
    kern: [
      { text: '„You’ve been building a lot of software so far, but how much of the software you’ve built is on this map we’ve created?“ – „Nearly none of it.“', quelle: `${PATTON}, Kap. 1, Explore Details and Options` },
      { text: 'Das Problem der Liste: „A common way to use stories is to build a list of them, prioritize them, and begin talking about them and then turning them into software one at a time. That sounds pretty reasonable when you hear about it. But it can create some big problems.“', quelle: `${PATTON}, Kap. 1, Telling the Whole Story` },
      { text: 'Was Gary verloren hatte: „He’d written a bunch of story titles, put them in a list, and talked about them one at a time. The conversations were more about the details of what to build and less about this big picture. And there were a lot of holes in Gary’s big picture.“', quelle: `${PATTON}, Kap. 1, Tell Your Users’ Stories` },
      { text: 'Eine Liste hat nur eine Richtung: „If I put two cards down, one above the other, then people assume that the one above is more important.“ Die Map hat zwei: „if I put one to the left and another to the right, without saying a word I’ve indicated sequence“; und „One card above another can indicate priority. But it can also mean decomposition“.', quelle: `${PATTON}, Kap. 1, Frame Your Idea; Tell Your Users’ Stories` },
      { text: 'Die Map als Ganzes: „The part that most people look at is the map—that left-to-right shape with the steps people take to tell a big story. The top to bottom is about the details. But the critical parts that frame the product and give more context are often hung above and around the map.“', quelle: `${PATTON}, Kap. 1, Explore Details and Options` },
      { text: 'Der Backbone erzählt: „When you read the backbone of the map from left to right, it tells a story about all the people who use the system and what they do“ – „The left-to-right order is what I call a narrative flow“. Bei Globo.com, kurz vor der „flat backlog trap“: „You can’t plan a release until you can see it all together.“', quelle: `${PATTON}, Kap. 2, Map in a Narrative Flow Across Many Users and Systems; Mapping Helps Big Groups Build Shared Understanding` },
      { text: 'Was minimal ist, sieht man erst am Ganzen: „The goal is to minimize the amount we build.“ Patton zu Gary vor der Map: „if we built this much and you launched your product and just did this, that looks like it’d be a valuable product.“', quelle: `${PATTON}, Kap. 1, Describe Your Customers and Users; Explore Details and Options` },
      { text: 'Gemeinsames Verständnis: „No, it’s not that pile of cards on the floor. The something that’s really important is shared understanding.“ – „Shared documents aren’t shared understanding.“', quelle: `${PATTON}, Kap. 1, Tell Your Users’ Stories; Read This First, The Telephone Game` },
    ],
    geschichte: {
      text: 'Gary Levitt ist Musiker mit eigener Band, managt Bands und produziert im Studio – an dem Tag gerade Dutzende Intros und Outros für die Oprah-Winfrey-Show. Seine Idee: eine große Anwendung für Musiker*innen und Bandmanager, Mad Mimi, kurz für „music industry marketing interface“. Wer für ihn entwickelt, arbeitet agil und rät: alles auflisten, priorisieren, das Wichtigste zuerst bauen. Gary zahlt jedes Stück, das Geld rinnt davon, und die Software kommt seiner Vision kaum näher. Patton besucht ihn in Manhattan, mitten im Büro-Umzug. Sie reden und schreiben Karten: erst Garys Ziele, dann die Nutzertypen, dann ein Tag im Leben eines Bandmanagers, von links nach rechts – auf dem Boden, bis die Map an die Wand stößt. Am Ende fragt Patton, wie viel vom Gebauten auf der Map steht. Gary: „Nearly none of it … I was thinking about the whole big vision of this thing, the vision that would have taken me years to reach, and now that we’ve had this discussion I wouldn’t have started there at all.“ Danach konzentriert er sich zuerst auf den Bandmanager, der seine Fans per E-Mail bewirbt; Patton verspricht „a very happy ending“.',
      quelle: `${PATTON}, Kap. 1, Gary and the Tragedy of the Flat Backlog bis Explore Details and Options; Kap. 14, The secret to prioritization`,
    },
    verstaendnis: {
      frage: 'Was zeigt die Map, das eine priorisierte Liste nicht zeigen kann?',
      antwort: 'Die Reihenfolge der Geschichte: Von links nach rechts steht, was die Person nacheinander tut, mit Anfang und Ende; von oben nach unten Details und Wichtigkeit. Eine Liste hat nur eine Richtung, oben heißt wichtiger. Darum sieht man an ihr nicht, welche Schritte zusammen erst etwas Nutzbares ergeben – und nicht die Löcher dazwischen.',
      falsch: '„Die Map ist einfach übersichtlicher.“ – Es geht nicht um Optik: Gary hatte nach Wichtigkeit gebaut und trotzdem fast nichts von dem, was auf der Map stand.',
    },
    fragen: [
      {
        frage: 'Ist eine Liste dann falsch?',
        antwort: 'Nein, nur die flache Liste als Anfang. Auch die Karten einer Map sind ein Backlog: „The bunch of cards that describes the whole product … is called a product backlog“ (Kap. 6, 1. Card). Bei Eric ist das Backlog selbst eine Map – „Eric’s backlog is organized as a story map“ –, die Karten des obersten Slice wandern aufs Task-Board (Kap. 3, Build to Learn). Globo „sliced up its backlog“ (Kap. 14, There’s always too much). Zu einem guten Backlog: „it definitely isn’t the result of capturing a list of things people want built“ (Kap. 14, Einleitung).',
      },
      {
        frage: 'Ich baue allein und habe alles im Kopf – brauche ich das?',
        antwort: 'Gerade dann: „Even Gary—the guy who held the vision of the product in his head—didn’t have a clear understanding of the size and complexity of his product“ (Kap. 14, Discovery Is for Building Shared Understanding). „No matter how clear you are about your story, talking through it while you map will help you discover the holes in your own thinking“ (Kap. 1, Tell Your Users’ Stories).',
      },
      {
        frage: 'Was hat das mit unserem Produkt zu tun?',
        antwort: 'Kursübertrag, nicht aus dem Buch: Bisher steht euer Spitzenreiter als Lösung im Baum. Heute legt ihr ihn als Geschichte von links nach rechts, mit Slice 1 oben. An Tag 5 werden aus den Karten von Slice 1 eure ersten Issues für Claude Code – das Backlog kommt aus der Map, nicht umgekehrt.',
      },
    ],
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
    kern: [
      { text: '„what you build early may not be production ready. In fact, if it is, you’ve likely done too much“.', quelle: `${PATTON}, Kap. 3, Really Minimize Your Experiments` },
      { text: 'Was der erste Slice ist: „The first slice cuts all the way through the functionality. Once they build all those pieces, they can see the functionality working from end to end. It wouldn’t work in all the situations it needs to, and if they shipped to users this way, those users would howl.“', quelle: `${PATTON}, Kap. 4, Plan to Build Piece by Piece` },
      { text: 'Wozu: „They can learn a lot about the technical risks that might cause them trouble later on.“ – „I call this first slice a functional walking skeleton—a term I borrowed from Alistair Cockburn. I’ve heard others call this a ‚steel thread‘ or a ‚tracer bullet.‘“', quelle: `${PATTON}, Kap. 4, Plan to Build Piece by Piece` },
      { text: 'Eröffnung: „Focus on the essential features or user steps that cross through the entire product. Focus on things that are technically challenging or risky. Skip the optional things users might do. … Build just enough to see the product working end-to-end.“ Dann Mittelspiel (auffüllen, Regeln, Leistung testen) und Endspiel (verfeinern, Feedback einarbeiten).', quelle: `${PATTON}, Kap. 4, Opening-, Mid-, and Endgame Strategy` },
      { text: 'Kein Release: „Each of these slices isn’t a release to customers and users: it’s a milestone the team members will use to stop and take stock of where they are.“ – „Think of these slices as three different buckets with different learning goals for each.“', quelle: `${PATTON}, Kap. 4, Don’t Release Each Slice` },
      { text: 'Riskantes zuerst: Eric und sein Team „put the risky bits first—the parts that Eric or his team wanted to see working sooner so that they could course-correct before they put it in front of their customers.“', quelle: `${PATTON}, Kap. 4, It’s All About Risk` },
      { text: 'Lernen als Ziel: „Treat every release as an experiment and be mindful of what you want to learn.“ – Patton nennt das „a minimum viable product experiment—or MVPe for short. It’s the smallest thing I could build to learn something.“', quelle: `${PATTON}, Kap. 3, How to Do It the Wrong Way; Validated Learning` },
    ],
    geschichte: {
      text: 'Aaron und Mike von Workiva haben ein neues Feature in etwa drei Tagen erkundet: Kund*innen befragt, Prototypen in Axure gebaut und remote getestet, bis sie sicher waren, dass es gebraucht wird – und zwar ganz. Weglassen wie Globo.com können sie nicht mehr. Trotzdem schneiden sie ihre Map in drei Slices. Der erste geht quer durch alles: Sie sehen die Funktion einmal von Anfang bis Ende laufen, mit echten Daten und automatischen Tests. Nutzer*innen „would howl“, aber das Team lernt früh die technischen Risiken. Der zweite Slice baut auf, der dritte verfeinert. Keiner geht an Kund*innen; jeder ist ein Halt, um Bilanz zu ziehen. Ihre Map erzählen sie dem ganzen Team, und das findet technische Abhängigkeiten, die die beiden nie gefunden hätten.',
      quelle: `${PATTON}, Kap. 4, Einleitung bis Don’t Release Each Slice`,
    },
    verstaendnis: {
      frage: 'Ihr habt wenig Zeit: Baut ihr zuerst „Bestellen“ richtig gut – oder alle fünf Aktivitäten ganz dünn?',
      antwort: 'Einmal dünn durch alle fünf Aktivitäten – Handarbeit mit * eingeschlossen (bar zahlen, zum Zug gehen). Erst wenn es einmal von „In die Halle“ bis „Zum Zug“ durchgeht, seht ihr, ob es durchläuft: „Build just enough to see the product working end-to-end“ (Kap. 4, Opening-, Mid-, and Endgame Strategy). Dass ihr damit auch lernt, ob Pendler*innen im Gehen bestellen, kommt von Eric: „something less than minimal—just enough that potential users could do something useful with it“, ein „minimum viable product experiment“ (Kap. 3, Build to Learn; Validated Learning). Euer Slice 1 verbindet beides.',
      falsch: '„Erst das Wichtigste fertig.“ – So baut nach Patton ein Maurer eine Wand, Stück für Stück; das klappt nur, wenn jedes Teil so klar ist wie ein Ziegel (Kap. 4, What Would da Vinci Do?).',
    },
    fragen: [
      {
        frage: 'Ist das laufende Skelett schon das MVP?',
        antwort: 'Nein. Bei Workiva ist es ein interner Meilenstein gegen technisches Risiko, nicht für Kund*innen (Kap. 4, Don’t Release Each Slice; It’s All About Risk). Bei Eric geht der erste Slice an ausgewählte Entwicklungspartner: „something less than minimal—just enough that potential users could do something useful with it“ (Kap. 3, Build to Learn). Für den Kurs: Euer Slice 1 steht näher bei Eric – links steht, was ihr lernen wollt („Wir lernen, ob …“).',
      },
      {
        frage: 'Warum nicht ein Teil fertig bauen und dann das nächste?',
        antwort: 'Weil das voraussetzt, dass die Vision stimmt: „This way of creating things assumes our vision is correct and accurate.“ Patton zeichnete als Kind erst den Kopf perfekt, am Ende stimmten die Proportionen nicht; besser sei „sketching the whole composition first“ (Kap. 4, What Would da Vinci Do?). Dazu Knibergs Skateboard statt Rad für Rad (Kap. 3, How to Do It the Wrong Way) – kennt ihr von Tag 1.',
      },
      {
        frage: 'Was heißt das für unseren Slice 1 heute?',
        antwort: 'Kursübertrag, nicht aus dem Buch: Slice 1 ist euer dünner Weg durch alle Aktivitäten, links Outcome und „Wir lernen, ob …“. Nach der Pause erzählt ihr ihn als Usage Story, am Nachmittag baut ihr ihn als Prototyp auf Papier. An Tag 5 besprecht ihr im Test-Debrief, was Karte E1 gezeigt hätte (und E2, falls ihr getestet habt); dann werden aus seinen Karten die ersten Issues, die Claude Code nach euren Skizzen baut. Schritte mit * bleiben Handarbeit, etwa bar zahlen.',
      },
    ],
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
      'Kursregel: jede*r allein an der eigenen Map.',
    ],
    uebung: { dauer: '42 min (3 + 2 + 6 + 2 + 2 + 6 + 5 + 2 + 5 + 5 + 4)', form: 'allein' },
    miro: { frame: 'T4 · 1 · Story Map', schritte: ['Jede*r mappt den eigenen Spitzenreiter im Story-Map-Frame.', 'Farben: Grün Aktivität, Gelb Task, Blau Details, Rot geht schief, Grau System, Pink Outcome, Cyan „Wir lernen, ob“, Violett wer handelt, * kein Software-Schritt, Sprechblase offene Frage.'] },
    ueberleitung: 'Schritt 1: der Rahmen.',
  },

  'schritt-rahmen': {
    live: [
      'Timer 3 min: Kopfzeile „Für | Outcome (Brief) | Idee (Value Map)“.',
      'Violett „Wer handelt“: die Hauptperson, links vor dem Backbone.',
      'Fragen: Mensch, Verhalten, Idee – oder nur ein Produktname?',
    ],
    uebung: { dauer: '3 min', form: 'allein' },
    ueberleitung: 'Die Jetzt-Map habt ihr schon – holt euch daraus die Pains.',
  },

  'schritt-jetzt-map': {
    live: [
      'Timer 2 min: Experience Map öffnen, Momente lesen.',
      'Zwei, drei Pains, die Pain Relievers lindern, mit Zitat-ID an den Rand.',
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
      'Fragen: Hat jeder Pain am Rand einen Task, der ihn löst?',
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
      'Timer 2 min: violett „Wer noch“, ihre Tasks in die eigene Reihe.',
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
      'Offene Fragen als Sprechblase.',
    ],
    uebung: { dauer: '5 min', form: 'allein' },
    ueberleitung: 'Bevor ihr schneidet: Was soll Slice 1 bewirken?',
  },

  'schritt-outcome': {
    live: [
      'Timer 2 min: pinkes Outcome-Sticky links an den Tasks.',
      '„[Wer] tut [was] statt [was bisher].“',
      'Darunter cyan „Wir lernen, ob … (A_)“ mit Annahmen-ID.',
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
    ueberleitung: 'Zum Schluss: fertig auf Miro.',
  },

  'schritt-festhalten': {
    live: [
      'Timer 4 min: auf Miro fertig – keine Datei, kein Commit.',
      'Fragen: Steht jedes Sticky nur einmal auf der Map?',
      '„Heute kein Claude – an Tag 5 werden aus Slice 1 eure Issues.“',
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
