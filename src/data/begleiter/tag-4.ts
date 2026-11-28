import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/tag-4.astro (Sa 28.11.2026, online in Teams). Die Seite hat drei Stellen am Tag:
// 9:00 #arbeitsfluss (→ zur Value Map), 9:35 nach der Value Map #was-bauen-wir (→ zur Concept Story), 14:05 nach der
// Story Map #slice-im-baum (→ zur Usage Story; seit 28.11.2026), um 17:15 über scrum#weiter-tag-4 der Abschluss: #abschluss, #origin-beispiel, #hausaufgabe, #ende-tag-4. Der Begleiter findet jede
// Folie über die Beamer-Position; „nächste Folie der Seite“ im Panel stimmt darum nur innerhalb dieser Stellen – die
// Überleitungen nennen, wohin → wirklich führt.
// Zitate wie auf der Seite (Durchsicht 26.11.: Torres S. 26–27, 119; Lichaw Kap. 4; Bland S. 261). Was nicht aus den
// Quellen stammt, ist als „Kursformulierung“ oder „Kursregel“ markiert. #slice-im-baum (27.11.): Zitate gegen das PDF
// (Torres, gedruckte Seiten) und das EPUB (Patton, Kapitel und Abschnitt) geprüft; was die Quellen nicht sagen, steht
// dort als „Vorsicht beim Erzählen: …“, ohne Etikett (begleiter-tag-4.test.ts). Vorsicht-Hinweise (Audit 27.11.) stehen als
// letzte kern-Einträge und beginnen mit „Vorsicht beim Erzählen:“ oder „Nicht behaupten:“ (begleiter-vorsicht.test.ts).
const TORRES = 'Teresa Torres, Continuous Discovery Habits';
const PATTON = 'Jeff Patton, User Story Mapping';
const LICHAW = 'Donna Lichaw, The User’s Journey';
const BLAND = 'David J. Bland & Alexander Osterwalder, Testing Business Ideas';

export const NOTIZEN_TAG_4: Record<string, Notiz> = {
  // 9:00–9:05, direkt nach dem Ablauf; → führt zur Value Map (9:05), nicht zu „Was bauen wir?“.
  arbeitsfluss: {
    live: [
      'Zeit: 5 min; Ist-Zeit notieren.',
      'Spalten per → aufdecken: was von Tag 1 bis 3 da ist.',
      '„Heute wird aus Spalte 4 ein Prototyp auf Papier – zuerst Value Map und Fit.“',
      'Pfeil → führt zur Value Map, nicht zu „Was bauen wir?“.',
    ],
    ueberleitung: 'Zuerst holen wir nach, was von Tag 3 offen ist: Value Map und Fit.',
  },

  // 9:35–9:40, nach value-map#uebertrag: Erst jetzt ist der Spitzenreiter bestätigt. Vorschau, ohne Schritte.
  'was-bauen-wir': {
    live: [
      'Zeit: 3 min; danach direkt die Concept Story.',
      '„Slice 1 ist die kleinste Version eures Spitzenreiters, die von Anfang bis Ende durchgeht.“',
      'Drei Zuläufe zeigen: je woher die Linie kommt, was daraus wird.',
      'Falle: Slice 1 als Feature-Liste; gemeint ist ein ganzer Weg.',
      'Letzte Zeile aufdecken, dann weiter zur Concept Story.',
    ],
    verstaendnis: {
      frage: 'Was heißt „von Anfang bis Ende“ bei Slice 1?',
      antwort: 'Eine Person kommt mit dem Slice einmal durch ihren ganzen Weg bis zum Ziel – dünn, aber vollständig. Nicht ein einzelner Bildschirm und nicht die wichtigste Funktion allein.',
      falsch: '„Die wichtigste Funktion zuerst“ – eine Funktion ohne Weg lässt sich im Usability-Test nicht durchspielen.',
    },
    kern: [
      {
        text: 'Die drei Zuläufe: Beleg (Interviews, Experience Map) liefert den Inhalt, Outcome (Produkt-Brief) das Maß, Annahme das Lernziel – daraus wird E1. Wie Slice 1 nach Outcome geschnitten wird, kommt erst in der Story Map; hier nur die Vorschau.',
        quelle: 'Kursformulierung; Arbeitsfluss (/innolab/arbeitsfluss)',
      },
      {
        text: 'Vorsicht beim Erzählen: Alle Zahlen und Zitate der Kaffeebar sind ausgedacht, auch 40 in 30 Minuten, 20 Sekunden und 8 von 30. Nie als Beleg oder Erfahrungswert erzählen.',
        quelle: 'Kaffeebar: ausgedachtes Beispiel des Kurses, seit Tag 1 so markiert (tag-1, problem-rahmen)',
      },
    ],
    ueberleitung: 'Zuerst: Warum ist euer Spitzenreiter besser als heute? Dafür die Concept Story.',
  },

  // 14:05, Wiedereinstieg nach der Mittagspause (seit 28.11.2026): von story-map#uebertrag; → führt zur Usage Story
  // (usage-story#drei-storys), ← zurück zur Story Map. Steht in der Datei weiter direkt nach #was-bauen-wir.
  'slice-im-baum': {
    live: [
      'Zeilenweise lesen: links der Baum, rechts Slice 1 – je ein Gegenstück.',
      'Wer tut danach was anders? Brief oben, Slice 1 enger.',
      '„Slice 1 ist kein Knoten im Baum – er macht den Spitzenreiter konkret.“',
      'A5 ist die Kaffeebar – bei euch die ID eurer Karte E1.',
      'Tag 5: ab 10 Slice bleibt, 5–9 weiter testen, unter 5 Baum.',
    ],
    kern: [
      {
        text: 'Was heißt „Wer tut danach was anders?“ Die Folienfrage ist unsere Kurzform von Pattons Outcome-Begriff: nicht, was ihr baut (Output), sondern was Menschen danach anders tun. „We measure what people actually do differently to reach their goals as a consequence of what you’ve built“. Die Frage hat zwei Ebenen. Oben steht der Outcome aus dem Produkt-Brief. Im Baum ist er die Wurzel, „Mehr Pendler*innen steigen morgens mit Kaffee in den Zug“, und im Rahmen über der Map steht der Outcome aus dem Brief. Links an Slice 1 steht auf dem pinken Sticky ein engerer Satz in der Form „[Wer] tut [was] statt [was bisher]“: „Pendler*innen mit knapper Zeit bestellen im Gehen, statt zum Automaten auszuweichen, und haben den Kaffee vor der Abfahrt“. Der Slice-Outcome dient dem Outcome aus dem Brief: Wer im Gehen bestellt, steigt mit Kaffee ein. So zerlegt Patton ein großes Vorhaben: „The secret to breaking down that really big chunk of output was to focus on a smaller, specific outcome.“ Der engere Satz hat drei Vorteile. Man könnte ihn beobachten, sobald Slice 1 steht („Outcomes are often something you can observe right away after delivery“). A5 ist der Kern davon als Annahme: „Wer die Schlange sieht, bestellt am Aufsteller statt am Automaten“. A5 und E1 prüfen diesen Kern schon vorab, ohne das Produkt (Aufsteller an der Hallentür), und am Slice steht dazu „Wir lernen, ob sie es tun (A5)“. Und er nennt das alte Verhalten, das ersetzt wird: den Automaten. Beim Vorlesen der Folie heißt „derselbe Satz wie im Brief“ also: der Rahmen über der Map. An Slice 1 selbst wird der Satz enger.',
        quelle: `${PATTON}, Read This First, Software Isn’t the Point und OK, It’s Not Just About People; Kap. 2, Don’t Prioritize Features—Prioritize Outcomes; Kaffeebar: story-map#beispiel, A5: experiment#beispiel-map`,
      },
      {
        text: 'Zeile 1 – Outcome. Im Baum ist er die Wurzel: „The root of the tree is your desired outcome“. Auf der Story Map steht derselbe Satz aus dem Brief im Rahmen über der Map, und links an Slice 1 steht, wer danach was anders tut. So schneidet Patton: „Focus on outcomes—what users need to do and see when the system comes out—and slice out releases that will get you those outcomes.“ Links an jedem Slice hängen „their target outcomes“, und die Liste ist „a list of real-world benefits“, keine Feature-Liste. An der Kaffeebar: Wurzel „Mehr Pendler*innen steigen morgens mit Kaffee in den Zug“, links an Slice 1 „Pendler*innen mit knapper Zeit bestellen im Gehen, statt zum Automaten auszuweichen, und haben den Kaffee vor der Abfahrt“.',
        quelle: `${TORRES}, S. 26; ${PATTON}, Kap. 2, Slice Out a Minimum Viable Product Release und Slice Out a Release Roadmap`,
      },
      {
        text: 'Zeile 2 – Ziel-Chance. Unter der Wurzel liegt bei Torres der Chancenraum: „the customer needs, pain points, and desires that, if addressed, will drive your desired outcome“. Ihr habt eine Chance mit Stern gewählt. Auf der Story Map wird daraus der Weg eurer Person bis zum Höhepunkt, mit Zitat-IDs an den Tasks. Patton sagt, was hinter einem Outcome steht: „specific behavior changes for specific people engaged in specific activities“. An der Kaffeebar wird aus „Geht sich ein Kaffee noch aus?“ der Weg durch die Halle bis zum Zug. Der erste Task, Schlange und Tafel anschauen, trägt I2-4, eines der Zitate, die im Baum die Chance belegen (I2-4, I3-1, I5-2).',
        quelle: `${TORRES}, S. 26; ${PATTON}, Kap. 2, Don’t Prioritize Features—Prioritize Outcomes; Kaffeebar: story-map#beispiel`,
      },
      {
        text: 'Zeile 3 – Lösung, und warum „kein Knoten im Baum“. Unter dem Chancenraum liegt bei Torres „the solution space. This is where we’ll visually depict the solutions we are exploring“, darunter: „Below the solution space are assumption tests.“ Im Baum stehen mehrere Lösungen nebeneinander, damit man sie vergleicht: „Which of these three ideas best delivers on our target opportunity?“ Slice 1 ist keine vierte Idee in diesem Vergleich. Er ist der Bauplan des Spitzenreiters, die kleinste Menge Tasks, mit der der Outcome eintreten könnte. Patton: „Use slices to identify all the tasks and details relevant to a specific outcome“ und „The minimum viable solution is the smallest solution release that successfully achieves its desired outcomes.“ Der Baum vergleicht Lösungen, die Story Map macht eine davon baubar. Darum steht Slice 1 neben dem Spitzenreiter und nicht unter ihm.',
        quelle: `${TORRES}, S. 26–27, 113; ${PATTON}, Kap. 5, 5. Slice Out Tasks That Help You Reach a Specific Outcome; Kap. 2, Why We Argue So Much About MVP`,
      },
      {
        text: 'Zeile 4 – Test, und warum „Wir lernen, ob …“ die riskanteste Annahme ist. Unter dem Spitzenreiter hängt A5 mit E1. A5 („Wer die Schlange sieht, bestellt am Aufsteller statt am Automaten“) steht oben rechts auf der Annahmen-Map: wünschenswert, ohne Beleg, und I2-3 spricht sogar dagegen. Genau dort fängt Torres an: „your most important assumptions with the weakest evidence—the assumptions that Bland calls your ‚leap of faith‘ assumptions“. Patton schneidet nach dem Release eine Lernstrategie, denn auch eine minimale Lösung ist „a hypothesis until you prove otherwise. Use the map and discussion to help you find your biggest risks.“ Eric von Liquidnet hängt links an jeden Slice „a few words about what they want to learn in this release“. E1 prüft A5 vorab, ohne das Produkt: mit einem Aufsteller und einer Seite statt der Bestell-App. Slice 1 ist das erste Gebaute, an dem A5 sich im echten Ablauf zeigen würde. Dass die Lernfrage an Slice 1 selbst hängt und nicht an einem eigenen, kleineren Lern-Slice, ist eine Vereinfachung des Kurses (siehe unten).',
        quelle: `${TORRES}, S. 130; ${PATTON}, Kap. 5, Six Simple Steps to Story Mapping; Kap. 3, Build to Learn; A5, Map und Karte E1: experiment#beispiel-map`,
      },
      {
        text: 'Warum „Hätte … gehalten“: E1 läuft in diesem Kurs nicht. Im Debrief an Tag 5 wird die Karte E1 als Gedankenexperiment besprochen: Welches Band hättet ihr erwartet, und was hättet ihr dann getan? Im Baum wird E1 als „nicht gelaufen“ markiert. Was aus jedem Band folgt, steht schon auf der Karte, in der Zeile „Wir entscheiden vorher“. Ab 10 von 30 wäre A5 gestützt: Slice 1 bleibt, der nächste Test wäre ein Concierge. Bei 5 bis 9 ist es unklar: derselbe Test mit einer Änderung, Slice 1 bleibt vorerst. Unter 5 wäre A5 widerlegt: zurück in den Baum zur Geschwister-Idee Wartezeit-Anzeige an der Tür (sie hängt an A6), so steht es in „Wir entscheiden vorher“. Der Kaffeewagen am Bahnsteig ist erst der weitere Ausweg aus der Zeile „Falls E1 scheitert“ unter der Karte. Torres fasst die Wege so zusammen: „Failing faster is what allows us to quickly move on to the next assumption, idea, or opportunity.“ Stärkerer Test oder nächste Annahme heißt, der Slice bleibt. Nächste Idee heißt, eine Geschwister-Lösung unter derselben Ziel-Chance. Nächste Chance heißt, ein anderer Ast.',
        quelle: `Kursseiten: experiment (Karte E1, „Wir entscheiden vorher“, „Falls E1 scheitert“), tag-5#debrief und #debrief-ablauf; ${TORRES}, S. 139`,
      },
      {
        text: 'Vorsicht beim Erzählen: Torres hängt keine Slices in ihren Baum, und ihre Story Map hat eine andere Aufgabe. Sie mappt jede Idee „assuming the solution already exists“, um Annahmen zu finden („From a simple 5-step story map, we generated 20 assumptions“), und zwar für alle drei Ideen: „You’ll want to story map, generate assumptions, and assumption map for each of your three ideas.“ Pattons Slices kommen bei ihr nicht vor. Dass jede Zeile des Baums ein Gegenstück auf der Story Map hat, ist eine Verbindung, die der Kurs zieht.',
        quelle: `${TORRES}, S. 119, 124, 130`,
      },
      {
        text: 'Vorsicht beim Erzählen: Patton kennt keinen Opportunity Solution Tree. Sein Lernschnitt ist ein eigener, noch kleinerer Slice („Slice the map into even smaller minimum viable product experiments“). Dass Outcome und Lernfrage am selben Slice 1 hängen, ist eine Vereinfachung des Kurses (story-map#sechs-schritte). Auch „riskanteste Annahme“ als Ecke oben rechts auf der Map stammt von Torres und Bland. Patton fragt nur: „What are our biggest, riskiest assumptions? Where is the uncertainty?“',
        quelle: `${PATTON}, Kap. 5, Six Simple Steps to Story Mapping; Kap. 2, The New MVP Isn’t a Product at All!`,
      },
      {
        text: 'Vorsicht beim Erzählen: „derselbe Satz wie im Brief“ gilt für den Rahmen über der Map, nicht für das engere Outcome-Sticky an Slice 1 (siehe „Was heißt ‚Wer tut danach was anders?‘“ oben). Im Lern-Sticky der Kaffeebar steht neben A5 auch A2 (40 Bestellungen in 30 Minuten), im Baum hängt nur A5 mit E1. Und die Folie kennt zwei Ausgänge, die Karte E1 drei: Im mittleren Band wird weiter getestet, wie in der Lernkarte E1 der Kaffeebar (8 von 30, unklar, Spitzenreiter bleibt).',
        quelle: 'Kursseiten: story-map#beispiel, tag-4#slice-im-baum (Handout), tag-5#debrief (Lernkarte E1)',
      },
      {
        text: 'Vorsicht beim Erzählen: „Zurück in den Baum“ heißt bei Torres mehr, als die nächste Idee zu nehmen: „When we learn through testing that an idea won’t work, it’s not enough to move on to the next idea. We need to take time to reflect.“ Sie fragt dann: „What did I misunderstand about my customer?“ Ein widerlegtes A5 kann also auch die Ziel-Chance selbst in Frage stellen. Und auf einen einzelnen Test hin gibt Torres eine Chance nicht auf: „we aren’t likely to make this decision based on one failed test“.',
        quelle: `${TORRES}, S. 33, 139`,
      },
    ],
    geschichte: {
      text: 'Zum Vorlesen, von oben nach unten: Oben im Baum der Kaffeebar steht „Mehr Pendler*innen steigen morgens mit Kaffee in den Zug“. Derselbe Satz steht über der Story Map, und links an Slice 1 wird er konkret: Wer wenig Zeit hat, bestellt im Gehen, statt zum Automaten auszuweichen. Darunter die Ziel-Chance „Geht sich ein Kaffee noch aus?“. Auf der Story Map ist das der Weg der Pendlerin von der Halle, wo sie die Schlange sieht, bis zum ersten Schluck im Zug. Der Spitzenreiter „Im Gehen bestellen“ ist in Slice 1 ein Ablauf: Aufsteller sehen, scannen, eins aus drei wählen, Abfahrtszeit eintippen, „Fertig 7:31“ lesen, Becher nehmen, bar zahlen. Ganz unten hängt A5 mit E1, der Aufsteller an der Hallentür, und am Slice steht „Wir lernen, ob sie es tun (A5)“. An Tag 5 fragt ihr: Hätten 10 von 30 einen Zug eingetragen, bleibt der Slice; wären es unter 5 gewesen, ginge es zurück in den Baum, zur Wartezeit-Anzeige an der Tür.',
      quelle: 'Kaffeebar: tag-4#faden (Baum ab Tag 4), story-map#beispiel (Slice 1), experiment (Karte E1)',
    },
    fragen: [
      {
        frage: 'Warum steht am Slice nicht einfach der Satz aus dem Brief?',
        antwort: 'Weil sich der Satz aus dem Brief an einem Slice nicht ablesen lässt. „Mehr Pendler*innen steigen morgens mit Kaffee in den Zug“ ist das Ziel des ganzen Produkts, über alle Slices hinweg. Ob Pendler*innen mit knapper Zeit im Gehen bestellen, statt zum Automaten auszuweichen, ließe sich beobachten, sobald Slice 1 steht. A5 und E1 prüfen den Kern davon schon vorab, ohne das Produkt (Aufsteller an der Hallentür). Das „statt“ sagt außerdem, welches Verhalten wegfällt: das Ausweichen zum Automaten. Der Satz aus dem Brief bleibt im Rahmen über der Map stehen, der Slice-Outcome dient ihm.',
      },
      {
        frage: 'Warum hängen wir Slice 1 nicht einfach als Knoten unter den Spitzenreiter?',
        antwort: 'Weil der Baum Lösungen vergleicht und Slice 1 keine eigene Lösung ist. Unter einer Lösung hängen bei Torres nur die Annahmen-Tests (S. 27). Slice 1 beschreibt, wie der Spitzenreiter gebaut würde, und hätte im Baum kein Geschwister, mit dem man ihn vergleichen könnte. Verbunden sind beide über dieselbe ID: A5 hängt im Baum unter dem Spitzenreiter und steht am Lern-Sticky von Slice 1.',
      },
      {
        frage: 'Wenn E1 gar nicht läuft, woher wissen wir dann, ob der Slice bleibt?',
        antwort: 'Ihr wisst es nicht, und der Debrief tut auch nicht so. Geübt wird die Entscheidung, nicht das Ergebnis: Weil auf der Karte vor dem Test steht, was jedes Band bedeutet („Wir entscheiden vorher“), könnt ihr an Tag 5 durchspielen, was ihr bei 12, 7 oder 3 von 30 getan hättet. Die Entscheidung trifft jede Product Ownerin selbst und hält sie unter der Karte E1 und im Baum fest. Wer mit dem Prototyp getestet hat (E2), bringt dazu einen echten Befund mit.',
      },
    ],
    ueberleitung: 'Slice 1 steht und hängt am Baum – jetzt erzählt ihr den Weg durch ihn: die Usage Story.',
  },

  // 17:15–17:30, von scrum#weiter-tag-4; ← führt dorthin zurück.
  abschluss: {
    live: [
      'Zeit: 15 min mit Beispiel und Hausaufgabe.',
      '„Die Origin Story ist der Text für euren Aufsteller oder eure Landingpage – für E1.“',
      'Sieben Stationen per → aufdecken, wie im Frame.',
      'Falle: Handlung „anmelden“ statt Ziel der Person („start training“).',
    ],
    verstaendnis: {
      frage: 'Was unterscheidet die Origin Story von der Concept Story?',
      antwort: 'Die Concept Story erzählt, warum das Produkt besser ist als das, was jemand heute tut. Die Origin Story erzählt, wie jemand zum ersten Mal Kunde wird – sie endet mit genau einer Handlung, die man messen kann.',
      falsch: '„Dieselbe Story, nur kürzer“ – der Höhepunkt ist ein anderer: Hier sieht jemand den Wert, dort erlebt er ihn.',
    },
    kern: [
      {
        text: '„An origin story is the story of how someone becomes your customer for the first time“ – die Brücke zwischen Concept Story und Usage Story.',
        quelle: `${LICHAW}, Kap. 4`,
      },
      {
        text: 'Am Ende genau eine Handlung und ihre Messung: „you call your main character to action and determine how to measure that action“. Die Handlung benennt das Ziel der Person: „start training“ statt „sign up“.',
        quelle: `${LICHAW}, Kap. 4 (FitCounter)`,
      },
      {
        text: 'Vorsicht beim Erzählen: FitCounter hat Lichaw fiktionalisiert – kein echtes Start-up, keine echten Zahlen. Nur die Lehre zitieren: Die Handlung benennt das Ziel der Person.',
        quelle: `${LICHAW}, Kap. 3 („It is not a real company, nor a real product.“); Kap. 4`,
      },
    ],
    ueberleitung: 'Wie das aussieht, zeigt der Aufsteller der Kaffeebar.',
  },

  // Neu seit der Durchsicht 26.11.: Das Beispiel stand nur im Handout.
  'origin-beispiel': {
    live: [
      'Text lesen lassen, dann Reihenfolge zeigen: Pain, Produkt, Hürde.',
      'Per →: die eine Handlung, dann die Messgröße von E1.',
      '„Eure Handlung benennt das Ziel der Person – nicht ‚E-Mail hinterlassen‘.“',
      'Fragen: Welche eine Handlung misst euer E1?',
    ],
    kern: [
      {
        text: 'Pain zuerst ist die Lesart des Kurses von Lichaws Bogen der Origin Story (Abb. 4.3): Dort kommen erst Ausgangslage und Problem, dann wie sie vom Produkt erfährt, die Hürde, und erst dann sieht sie den Wert.',
        quelle: `Lesart des Kurses; ${LICHAW}, Kap. 4, Abb. 4.3`,
      },
      {
        text: 'Nicht behaupten: Bland empfehle dieselbe Reihenfolge. Bei ihm steht oben das Wertversprechen, darunter die Handlung, erst darunter Pains, Lösung und Gains (S. 261). Den Aufsteller mit dem Pain zu eröffnen, ist die Lesart des Kurses von Lichaws Bogen (Abb. 4.3).',
        quelle: `${BLAND}, Simple Landing Page, S. 261`,
      },
    ],
    ueberleitung: 'Und das ist eure Hausaufgabe – sie beginnt mit genau diesem Text.',
  },

  hausaufgabe: {
    live: [
      'Reihenfolge: Origin Story, Karte E1 fertig; Tests freiwillig.',
      'E1 läuft nicht – an Tag 5 besprechen, was die Karte gezeigt hätte.',
      'Bis Tag 5: Claude Code installieren; Pro erst an Tag 5.',
      'Alles auf Miro oder in der Werkstatt – keine Dateien schreiben.',
      'Fragen: Steht bei allen „Wir entscheiden vorher“ auf der Karte E1?',
    ],
    ueberleitung: 'Tag 5 beginnt mit eurer Karte E1 – und mit euren Tests, falls ihr getestet habt.',
  },

  // Letzte Folie des Tages: → bleibt stehen (Folie ende).
  'ende-tag-4': {
    live: [
      '„Tag 5 beginnt mit dem Test-Debrief: Was hätte E1 gezeigt – und was eure Tests?“',
      'Offene Fragen sammeln, dann Besprechung beenden.',
      'Pfeil → bleibt hier stehen.',
    ],
  },
};
