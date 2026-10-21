import type { Notiz } from './typen';

// Begleiter-Notizen zu /innolab/methoden/entscheidungslog (Tag 1, 12:10–12:15).
// Das Entscheidungslog ist eine eigene Methode des Kurses; nächste Quelle ist die Learning Card und
// der Schritt „Decide“ bei Bland & Osterwalder, „Testing Business Ideas“ (TBI, gedruckt = PDF − 16).
// Mom Test: gedruckt = PDF + 1. Gilad, „Evidence-Guided“: EPUB, Kapitel + Abschnitt.
export const NOTIZEN_ENTSCHEIDUNGSLOG: Record<string, Notiz> = {
  worum: {
    live: [
      'Kurz, fünf Minuten – aber das Log begleitet sie bis Tag 7 und ist am Ende das Rückgrat der Präsentation.',
      'Neu gegenüber dem Coding-Kurs: dort hielt Claude Stack und Regeln fest, hier geht es um Produktentscheidungen – darum die vierte Spalte „Beleg“.',
      '„Noch keiner“ ist erlaubt und ehrlich: Eine Entscheidung ohne Beleg ist eine Annahme – genau das Material für die Annahmen-Map gleich danach.',
      'Nichts wird gelöscht: Widerlegt ein Test etwas, kommt eine neue Zeile, die alte bekommt „ersetzt am …“.',
    ],
    ueberleitung: 'Wie das aussieht, wenn eine Entscheidung tatsächlich kippt, zeigt die Kaffeebar.',
    kern: [
      {
        text: 'Das Entscheidungslog ist eine eigene Methode des Kurses. Am nächsten kommt die Learning Card von Bland & Osterwalder: Sie hat vier Schritte – „We believed that …“ (Hypothese), „We observed …“ (Beobachtung), „From that we learned that …“ (Erkenntnis), „Therefore, we will …“ (Entscheidung und nächste Schritte). Das Log verdichtet das auf eine Zeile: geglaubt, geprüft, geändert.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 55',
      },
      {
        text: 'Bei Bland folgt auf „Learn“ ausdrücklich „Decide“: Gelerntes muss in Handlung übersetzt werden, weil Erkenntnisse ein Ablaufdatum haben. Handlung heißt dort: informierte Entscheidungen auf Basis der gesammelten Erkenntnisse – aufgeben, ändern oder weiter testen. Die Kette lautet Hypothese → Evidenz → Erkenntnis → Handlung.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 62',
      },
      {
        text: 'Die drei Entscheidungen nach einem Test: Persevere (weiter, mit stärkerem Experiment oder der nächsten wichtigen Hypothese), Pivot (ein Element der Idee deutlich ändern – frühere Evidenz kann dann irrelevant werden und muss neu getestet werden), Kill (die Idee aufgeben). Eine „ersetzt“-Zeile im Log ist im Kleinen ein Pivot.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 61',
      },
      {
        text: 'Unter den typischen Fallen nennt Bland „Failure to Learn and Adapt“: Teams testen so viel, dass sie vergessen, zu entscheiden. Das Ziel sei nicht testen und lernen, sondern auf Basis von Evidenz zu entscheiden. Gegenmittel: feste Zeit, um Ergebnisse zu verdichten und die Idee anzupassen, und Rituale – im Kurs die fünf Minuten am Ende jedes Kurstags.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 315',
      },
    ],
    zusatz: [
      {
        titel: 'Architecture Decision Records (Michael Nygard, 2011)',
        text: 'In der Softwareentwicklung hält man Architekturentscheidungen in kurzen, fortlaufend nummerierten Textdateien im Repo fest: Titel, Kontext, Entscheidung, Status, Konsequenzen. Nummern werden nie wiederverwendet. Wird eine Entscheidung zurückgenommen, bleibt der alte Eintrag stehen und wird als „superseded“ markiert, mit Verweis auf den Nachfolger – „es ist weiterhin wichtig zu wissen, dass es die Entscheidung war, aber nicht mehr ist“. Begründung: Wer später dazukommt und den Grund nicht kennt, kann eine Entscheidung nur blind übernehmen oder blind ändern. Das ist genau die Brücke zum Coding-Kurs – und das Muster „ersetzt am …“ im Log.',
        quelle: 'https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions',
      },
    ],
    fragen: [
      {
        frage: 'Warum nicht einfach die alte Zeile korrigieren?',
        antwort: 'Weil dann niemand mehr sieht, was ihr gelernt habt. Die Präsentation erzählt genau diesen Weg von geraten zu belegt. In der Werkstatt lassen sich gespeicherte Zeilen auch gar nicht ändern oder löschen, nur ersetzen.',
      },
      {
        frage: 'Ist das nicht dasselbe wie die Annahmen-Map?',
        antwort: 'Nein. Die Map sammelt, was stimmen muss, und sucht die riskanteste Annahme. Das Log hält fest, was ihr entschieden habt und worauf das steht. Eine Log-Zeile mit „noch keiner“ ist ein Kandidat für die Map.',
      },
      {
        frage: 'Was zählt als Entscheidung?',
        antwort: 'Alles, was festlegt, für wen ihr baut, was ihr baut oder bewusst nicht baut – z. B. Zielgruppe, ein „Nicht“ aus dem Brief, das Outcome. Technische Projektregeln bleiben im Repo.',
      },
    ],
  },

  beispiel: {
    live: [
      'Zeitleiste von links nach rechts erzählen: am 22.10. – also heute – zwei Zeilen, am 05.11. nach den Interviews zwei neue.',
      'D1 war geraten: Die Inhaberin sieht morgens die längste Schlange. Nach fünf Interviews ist die Zielgruppe schärfer – fester Morgenzug, Ziel egal (I3 fährt zur Uni, nicht nach Wien).',
      'D1 bleibt stehen, mit „ersetzt am 05.11.2026“; D3 sagt „ersetzt D1“.',
      'D4 zeigt: Auch ein Verwerfen ist eine Entscheidung. Vorbestellen vor der Ankunft fällt, weil drei von fünf erst in der Halle entscheiden.',
      'Format in der Mappe zeigen: hinter „Beleg:“ zuerst die Stufe, dann in Klammern IDs oder Notiz.',
    ],
    ueberleitung: 'Die Belege von D2, D3 und D4 sind nicht gleich viel wert – das zeigt die nächste Folie.',
    kern: [
      {
        text: 'Die Kaffeebar-Kette ist durchgängig: Im Brief steht als offene Frage, ob Pendler*innen schon vor der Ankunft entscheiden, ob sie Kaffee holen. Daraus wird A1, die riskanteste Annahme (Beleg „keiner“). Die Interviews widerlegen sie – das Ergebnis steht als D4 im Log.',
        quelle: 'Kaffeebar-Beispieldaten: brief.json (offeneFragen), annahmen.json (A1), entscheidungen.json (D4)',
      },
      {
        text: 'Belege für D4 in den Interviews: I2-4 „Ich schau auf die Tafel, dann auf die Schlange, und dann entscheid ich.“, I3-1 „Ich schau halt, wie es ausschaut, wenn ich vorbeikomm.“, I5-3 „Das entscheid ich, wenn ich die Halle seh.“ Bei I1 steht es nur in der Notiz („Schaut erst auf die Schlange, dann auf die Uhr.“) – deshalb die belegNotiz statt einer Zitat-ID.',
        quelle: 'Kaffeebar-Beispieldaten: interviews.json (I1 Notiz, I2-4, I3-1, I5-3)',
      },
      {
        text: 'D3 belegt die Zielgruppe mit allen fünf Interviews: Die Pseudonyme nennen feste Züge um 7:20, 7:35, 7:38, 7:42 und 7:50. I3 ist ein Student auf dem Weg zur Uni – darum „egal wohin“ statt „nach Wien“.',
        quelle: 'Kaffeebar-Beispieldaten: interviews.json (I1–I5, Pseudonyme und Kurzinfos)',
      },
      {
        text: 'Learning Cards bei Bland haben dieselbe Logik: Eine Hypothese („We believed that millennial parents prefer curated science projects …“) wird mit dem verglichen, was man beobachtet hat, und endet in „Therefore, we will …“. Drei Experimente zur selben Hypothese liefern drei Karten mit unterschiedlich starker Evidenz.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 53–55',
      },
    ],
    fragen: [
      {
        frage: 'Warum ist D2 „getan“, obwohl es keine IDs hat?',
        antwort: 'Der Beleg liegt außerhalb der Mappe: Kassendaten September. Das ist beobachtetes Verhalten, also stark – die Quelle steht als Notiz statt als ID.',
      },
      {
        frage: 'Die Interviews sind doch erst nach heute datiert?',
        antwort: 'Ja, das Beispiel läuft dem Kurs voraus: D1 und D2 entstehen heute, die Interviews kommen bis Tag 2, D3 und D4 danach. So sehen sie heute schon, wohin das Log führt.',
      },
    ],
  },

  'beleg-staerke': {
    live: [
      'Bei Zeitnot überspringen: Dieselbe Regel kommt nach dem Mittag in der Annahmen-Map („Was zählt als Beleg?“) noch einmal.',
      'Eine Regel: tun wiegt mehr als sagen.',
      'Vier Stufen: noch keiner, gesagt, erzählt, getan. „Gesagt“ ≈ nichts („Würde ich nutzen“ sagen fast alle).',
      'Streng: „erzählt“ = konkretes Ereignis, „gesagt“ = Meinung, Gewohnheit, Wunsch.',
      'Kaffeebar: D3 und D4 nur „gesagt“, D4 darum vorläufig.',
    ],
    ueberleitung: 'Jetzt fünf Minuten: eure ersten Zeilen im eigenen Log.',
    kern: [
      {
        text: 'Bland prüft die Stärke eines Belegs an vier Achsen, jeweils schwach gegen stark: Meinungen („I would …“, „I think … is important“, „I like …“) gegen Fakten/Ereignisse („Last week I …“, „I spent … on“); was Menschen sagen gegen was sie tun („What people say in an interview or survey is not necessarily what they do in real life or will do in the future.“); Laborsituation gegen echte Umgebung; kleine gegen große Investitionen (E-Mail-Anmeldung gegen Vorkauf oder Ruf aufs Spiel setzen). Die Kurs-Skala ist eine Vereinfachung dieser Tabelle.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 52',
      },
      {
        text: 'Wie sicher man sein darf, hängt bei Bland von drei Dingen ab: Art und Stärke der Evidenz (ein Interviewzitat ist ein schwacher Indikator, ein Kauf in einem simulierten Verkauf ein sehr starker), Zahl der Datenpunkte (fünf Zitate sind schwächer als hundert) und Zahl und Art der Experimente zur selben Hypothese. Wer nur Interviews oder Umfragen gemacht hat, ist „Not Really Confident“ und soll stärkere Experimente nachlegen.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 56–57',
      },
      {
        text: 'Der Mom Test nennt drei Formen von „Fluff“, die als Beleg nichts taugen: allgemeine Aussagen („I usually“, „I always“, „I never“), Zukunftsversprechen („I would“, „I will“) und hypothetische Vielleichts („I might“, „I could“). Gegenmittel: zurück zu konkreten Fällen in der Vergangenheit – wann es zuletzt passiert ist, wie die Person es gelöst hat. Das ist der Grund, warum „Meistens …“ im Kurs als „gesagt“ zählt, nicht als „erzählt“.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 28–29',
      },
      {
        text: 'Commitment ist bei Fitzpatrick das, was jemand aufgibt: Ein Kompliment kostet nichts und enthält darum keine Daten. Die wichtigsten Währungen sind Zeit, Ruf und Geld – das entspricht der Stufe „getan“.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 65',
      },
      {
        text: 'Gilads Confidence Meter ordnet Belege nach Herkunft und Menge: von eigener Überzeugung, Pitch Deck, thematischer Passung und Meinungen anderer (fast null) über Schätzungen, Anekdoten und Marktdaten bis zu Nutzer- und Kundendaten, Testergebnissen und Launch-Daten. Interviews zählen dort zu „User/Customer Evidence“ und damit höher als Umfragen oder Smoke Tests – eine andere Ordnung als bei Bland, deshalb nennt die Folie Gilad nur als „ähnlich“.',
        quelle: 'Itamar Gilad, Evidence-Guided, Kap. 3 „Ideas“, Abschnitt „Confidence“',
      },
    ],
    zusatz: [
      {
        titel: 'Einweg- und Zweiwegtüren (Amazon, Aktionärsbrief 2015, veröffentlicht April 2016)',
        text: 'Jeff Bezos unterscheidet zwei Arten von Entscheidungen: Typ 1 ist kaum umkehrbar („one-way doors“) und braucht langsame, sorgfältige Abwägung. Die meisten Entscheidungen sind Typ 2, umkehrbar („two-way doors“): Ist eine davon schlecht, öffnet man die Tür wieder und geht zurück – sie sollen schnell und von kleinen Gruppen getroffen werden. Große Organisationen neigen dazu, auch Typ-2-Entscheidungen wie Typ 1 zu behandeln, mit Langsamkeit und zu wenig Experimenten als Folge. Passt zu D4: auf schwachem Beleg entschieden, aber umkehrbar – darum ist es in Ordnung, jetzt zu entscheiden und später zu ersetzen. Bland gibt denselben Rat: umkehrbare und nicht umkehrbare Entscheidungen unterscheiden, bei den umkehrbaren schnell handeln (TBI S. 314).',
        quelle: 'https://www.sec.gov/Archives/edgar/data/1018724/000119312516530910/d168744dex991.htm',
      },
    ],
    fragen: [
      {
        frage: 'Bland zählt „In that situation I usually …“ zu den Fakten – warum ist das bei uns „gesagt“?',
        antwort: 'Stimmt, die Tabelle auf S. 52 führt das unter „Facts (events)“. Der Kurs folgt hier dem strengeren Mom Test (S. 28): „usually“ ist eine allgemeine Aussage. Erzählt ist nur ein konkretes Ereignis, etwa I3-3 („Einmal stand ich da, der Zug war schon eingefahren …“).',
      },
      {
        frage: 'Ist ein Beleg aus fünf Interviews nicht genug?',
        antwort: 'Für eine erste Richtung ja, sicher ist er nicht: Bei Bland ist man mit Interviews allein „not really confident“ (S. 57). Deshalb bleibt D4 vorläufig, bis ein Experiment zeigt, was Pendler*innen tun.',
      },
      {
        frage: 'Wo kommt „getan“ in unserem Projekt her?',
        antwort: 'Aus Zahlen, die es schon gibt (wie die Kassendaten), oder aus Experimenten ab Tag 3. In den Interviews bis Tag 2 kommt man meist bis „erzählt“.',
      },
    ],
  },

  vorgehen: {
    live: [
      'Fünf Minuten, jede*r im eigenen Log in der Werkstatt.',
      'Zwei bis drei Zeilen aus dem Problem-Rahmen, den sie gerade geschrieben haben: Zielgruppe, ein „Nicht“, das Outcome.',
      'Bei fast allem wird „noch keiner“ stehen – das ist richtig so und kein Versäumnis.',
      'Prüfen ist Hausaufgabe: zuerst selbst mit der Prüfliste, dann Claude. Ab jetzt: am Ende jedes Kurstags fünf Minuten fürs Log.',
    ],
    ueberleitung: 'Zum Schluss die Frage, was davon in die Interviews gehört.',
    uebung: { dauer: '5 min', form: 'allein, jede*r im eigenen Log' },
    ablauf: {
      schritte: [
        'Werkstatt öffnen, Artefakt „Entscheidungen“ (Abschnitt „In der Werkstatt speichern“ im Handout).',
        'Timer starten (5 min).',
        'Je Zeile: Datum, Entscheidung, Grund, Beleg-Stufe; IDs nur, wenn es schon welche gibt, sonst optional eine Notiz (z. B. Kassendaten).',
        'Speichern – gespeicherte Zeilen sind danach nicht mehr änderbar, also vorher kurz gegenlesen.',
        'Zum Abschluss reihum je eine Zeile vorlesen lassen: Entscheidung und Beleg-Stufe.',
      ],
      achten: [
        'Steht ein echter Grund da (warum so?), nicht nur die Entscheidung noch einmal anders formuliert?',
        'Ehrliche Stufe: Ein Bauchgefühl oder Gespräch mit Freund*innen ist „noch keiner“ oder höchstens „gesagt“, nicht „erzählt“.',
        'Annahmen nicht als Tatsache formuliert (Prüfliste): „Pendler*innen wollen …“ ist eine Behauptung, kein Grund.',
        'Produktentscheidungen, keine technischen Regeln (Stack, Sprache bleiben im Repo).',
      ],
      fehler: [
        'Beleg aufwerten, damit es besser aussieht – „gesagt“ statt „noch keiner“.',
        'Aufgaben statt Entscheidungen eintragen („Interviews machen“).',
        'Zu viele Zeilen in fünf Minuten; zwei gute reichen heute.',
        'Später eine widerlegte Zeile „korrigieren“ wollen, statt eine neue zu schreiben, die sie ersetzt.',
      ],
    },
    kern: [
      {
        text: 'Die Prüfliste der Methode: Jede Zeile nennt Datum, Entscheidung und Grund. Jede Produktentscheidung nennt einen Beleg – oder ausdrücklich „noch keiner“. Keine Annahme ist als Tatsache formuliert. Wo ein Test etwas widerlegt hat, steht die Änderung als neue Zeile da, die alte bleibt stehen und trägt „ersetzt am …“. Claude prüft danach nur, schreibt nichts um.',
        quelle: 'Kurs: methoden.ts, Prüfliste „entscheidungslog“',
      },
      {
        text: 'Bland empfiehlt einen festen Rhythmus statt einmaliger Auswertung: wöchentliches „Learning“ (Evidenz verdichten, Erkenntnisse, Aktionen) und ein „Deciding“-Treffen mit Lernergebnissen, Hindernissen und Entscheidungen. Die fünf Minuten am Ende jedes Kurstags sind die Kursform davon.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 68',
      },
    ],
    fragen: [
      {
        frage: 'Wir sind uns bei der Zielgruppe noch gar nicht sicher – trotzdem eintragen?',
        antwort: 'Ja, genau dann. Die Zeile hält fest, wovon ihr gerade ausgeht, mit „noch keiner“. Ändert sich das, ersetzt ihr sie – so wie D3 bei der Kaffeebar D1 ersetzt.',
      },
      {
        frage: 'Führen wir ein gemeinsames Log?',
        antwort: 'Nein, jede*r führt das eigene in der Werkstatt.',
      },
    ],
  },

  uebertrag: {
    live: [
      'Frage an alle drei: Welcher Satz in eurem Brief ist am wenigsten belegt?',
      'Reihum je ein Satz – das ist der Stoff für die Interviews bis Tag 2.',
      'Kaffeebar als Muster: offene Frage im Brief → riskanteste Annahme A1 → Interviews → D4.',
      'Hausaufgabe nennen: nach den Interviews das Log nachziehen.',
    ],
    ueberleitung: 'Aus diesen unbelegten Sätzen wird jetzt die Annahmen-Map – und zuerst die Frage, warum man Annahmen überhaupt sichtbar macht.',
    uebung: { form: 'reihum, je ein Satz' },
    kern: [
      {
        text: 'Bland warnt vor Bestätigungsfehlern: Teams verwerfen oder spielen Evidenz herunter, die ihrer Hypothese widerspricht. Gegenmittel sind unter anderem konkurrierende Hypothesen und mehrere Experimente pro Hypothese. Für die Interviews heißt das: nach dem fragen, was den Brief widerlegen könnte, nicht nach Bestätigung.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 315',
      },
      {
        text: 'Gilad: Die meisten Produktideen verbessern die Kennzahl nicht, für die sie gebaut wurden – er zitiert Kohavi u. a. (bei Microsoft nur ein Drittel der getesteten Ideen) und weitere Firmenzahlen. Und Menschen sind schlecht darin, die guten Ideen vorab zu erkennen. Darum lohnt es, den Brief als Sammlung von Annahmen zu lesen.',
        quelle: 'Itamar Gilad, Evidence-Guided, Kap. 3 „Ideas“, Abschnitte „Most Ideas Are Not Good“ und „We’re Bad at Picking the Best Ideas“',
      },
    ],
    fragen: [
      {
        frage: 'Und wenn alles im Brief unbelegt ist?',
        antwort: 'Normal an Tag 1. Dann entscheidet die Annahmen-Map gleich, was zuerst in die Interviews kommt: das, was sehr wichtig ist und kaum belegt.',
      },
    ],
  },
};
