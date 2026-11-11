import type { Notiz } from './typen';

// Begleiter-Notizen zu /innolab/methoden/entscheidungslog (Tag 1, 12:10–12:15; danach Nachschlagen an jedem Kurstag).
// Thomke: gedruckte Seiten aus quellen/thomke/text.txt. Torres: Seiten aus quellen/torres/text.txt (=====PAGE n=====).
// Das Entscheidungslog ist eine eigene Methode des Kurses; nächste Quelle ist die Learning Card und
// der Schritt „Decide“ bei Bland & Osterwalder, „Testing Business Ideas“ (TBI, gedruckt = PDF − 16).
// Mom Test: gedruckt = PDF + 1. Gilad, „Evidence-Guided“: EPUB, Kapitel + Abschnitt.
export const NOTIZEN_ENTSCHEIDUNGSLOG: Record<string, Notiz> = {
  warum: {
    live: [
      'Frage von der Folie stellen, Timer 2 min, jede*r allein.',
      '„Schaut erst danach in euren Brief: Steht dort der Grund – und was ihr ausgeschlossen habt?“',
      'Dann die drei Punkte aufdecken, je ein Satz.',
      'HiPPO erklären: highest-paid person’s opinion, die Meinung der Chefin.',
    ],
    verstaendnis: {
      frage: 'Ein Test geht gegen eure Lieblingsidee aus. Was passiert ohne Log fast von selbst?',
      antwort: 'Man sucht Fehler im Test und erklärt das Ergebnis weg – gute Ergebnisse glaubt man sofort, schlechte nimmt man auseinander (Thomke S. 14, 126). Steht vorher im Log, was ihr glaubt und warum, fällt das Umdeuten auf.',
      falsch: '„Wir übernehmen das Ergebnis“ – das ist das Ziel, aber nicht, was Menschen von selbst tun.',
    },
    ueberleitung: 'Was ihr davon habt, seht ihr am Weg bis Tag 7.',
    kern: [
      {
        text: 'Thomke: „we tend to happily accept ‚good‘ results that confirm our beliefs because they feel right. But we challenge and thoroughly investigate ‚bad‘ results that go against our assumptions.“ Beispiel: Ein Manager hält ein Testergebnis („weniger Information verkauft besser“) für einen Softwarefehler und will den Test wiederholen, bis er zu seiner Erfahrung passt.',
        quelle: 'Stefan H. Thomke, The Scientific Mindset, S. 14',
      },
      {
        text: 'Thomke, „Insist That Data Overrides Opinions“: „When results align with our beliefs, we accept them without hesitation; when they don’t, we probe them relentlessly.“ Und: „Nothing stalls experiments faster than a so-called HiPPO—highest-paid person’s opinion.“',
        quelle: 'Stefan H. Thomke, The Scientific Mindset, S. 126',
      },
      {
        text: 'Torres: Wer Stakeholdern nur Schlussfolgerungen zeigt, „we aren’t sharing the journey we took to reach those conclusions. Instead, we are inviting our stakeholders to an opinion battle—a battle we have no chance of winning.“ Darum „The HiPPO always wins“.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 169',
      },
      {
        text: 'Bland, Falle „Failure to Learn and Adapt“: „When you don’t take time to analyze the evidence to generate insights and action.“ Manche Teams testen so viel, dass sie das Ziel aus den Augen verlieren: „The goal is not to test and learn. The goal is to decide, based on evidence and insights, to progress from idea to business.“ Gegenmittel: Zeit, um Ergebnisse zu verdichten und die Idee anzupassen, und Rituale.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 315',
      },
      {
        text: 'Fitzpatrick über Notizen: „notes make it harder to lie to yourself. And when, months later, you decide to adjust the business’s direction, you’ll be able to return to your notes instead of having to go do a whole new set of interviews.“ Und: „Notes are useless if you don’t look at them.“',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 105, 108',
      },
      {
        text: 'Gilad erzählt, wie Greg Linden bei Amazon Empfehlungen im Warenkorb vorschlug und ein Senior VP das Feature verbot; ein heimlicher A/B-Test zeigte deutlich mehr Umsatz pro Kunde, der VP lenkte ein. Dazu: „Relying on opinions and intuition, even if they come from experts, leaves us exposed to false positives … and false negatives … The antidote is learning.“',
        quelle: 'Itamar Gilad, Evidence-Guided, Kap. 4 „Steps“, Einstieg und Abschnitt „Learning and Evidence-Guided Decisions“',
      },
    ],
    fragen: [
      {
        frage: 'Wir sind doch nur drei – wer soll da eine HiPPO sein?',
        antwort: 'Im Kurs am ehesten Markus, an Tag 7 die Gäste. Und die eigene Lieblingsidee wirkt genauso: Wer nur Schlussfolgerungen zeigt, lädt zum Meinungsstreit ein (Torres S. 169).',
      },
    ],
  },

  nutzen: {
    live: [
      '„Im Jänner fragt man euch: Warum sieht euer Produkt so aus? Hier wächst die Antwort.“',
      'Fluss von links: jeder Tag bringt Zeilen, Tag 7 nutzt sie.',
      'Claude prüft nur, was ohne Beleg dasteht – schreibt keine Zeile.',
      'Feedback von dir hängt an einer Zeile, etwa D3.',
    ],
    ueberleitung: 'Wie so eine Zeile aussieht: vier Felder.',
    kern: [
      {
        text: 'Wo das Log im Kurs vorkommt (auf den Seiten nachgeprüft): Synthese-Vorgehen Schritt 4 „Zeilen im Entscheidungslog“ (Tag 2); Ziel-Chance „eine Zeile im Entscheidungslog“ (Tag 3); Value Map „Die Wahl kommt als Zeile ins Entscheidungslog, mit dem Fit als Beleg“ (Tag 3); Lernkarte „→ Zeile im Entscheidungslog“ (Experiment-Karte, Tag 4 Hausaufgabe, Tag 5 Debrief); Backlog „Weicht ihr vom Bauchgefühl ab, steht der Grund im Entscheidungslog“ und Störfall (Tag 5); Pitch: „die Belege in Lernkarten, Testbefunden und Entscheidungslog“; Tag-7-Retro: „eine Entscheidung im Entscheidungslog, die ohne die Methode anders ausgefallen wäre“.',
        quelle: 'Kurs: synthese.astro, ziel-chance.astro, value-map.astro, experiment.astro, tag-4.astro, tag-5.astro, backlog.astro, pitch.astro, tag-7.astro',
      },
      {
        text: 'Torres: Die Arbeit zeigen statt nur Schlussfolgerungen, zusammengefasst so, dass sie „highlights your key decision points and the options that you considered“. Sie sagt das über den Opportunity Solution Tree; das Log zeigt dieselben Entscheidungen als Verlauf.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 34, 169–171',
      },
      {
        text: 'Thomke, Tipps „Commitment“: „Define specific changes you will make based on the results. Put mechanisms in place to ensure the results are acted on, not ignored.“ Dazu S. 86: eine Entscheidungsmatrix, die mögliche Ergebnisse vor den Daten mit Handlungen verknüpft.',
        quelle: 'Stefan H. Thomke, The Scientific Mindset, S. 86, 103',
      },
      {
        text: 'Bland: Erkenntnisse sind „the foundation to make informed business decisions and take action“ – sie wirken erst, wenn daraus eine Entscheidung wird.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 54',
      },
      {
        text: 'Werkstatt: Feedback der Lehrenden kann an einer Zeile des Entscheidungslogs hängen (Zeilen-ID D…); Claude liest es über den Connector mit und geht darauf ein, schreibt aber selbst kein Feedback und keine Zeilen.',
        quelle: 'Kurs: werkstatt/feedback.ts (zeilePasst), MCP-Anweisungen der Werkstatt',
      },
    ],
    fragen: [
      {
        frage: 'Reicht es nicht, vor dem Pitch alles zusammenzuschreiben?',
        antwort: 'Dann schreibt ihr aus der Erinnerung – und die macht aus „geraten“ im Nachhinein „gewusst“. Die Zeile mit Datum hält fest, was ihr damals wusstet (Thomke S. 14; Mom Test S. 105).',
      },
    ],
  },

  zeile: {
    live: [
      'Vier Felder von links nach rechts, Beispiel D3 der Kaffeebar.',
      '„Ihr dürft beim Beleg ehrlich ‚noch keiner‘ schreiben – das ist eine Annahme, kein Makel.“',
      'Bezug Coding-Kurs: dort Stack und Regeln, hier Produktentscheidungen mit Beleg.',
    ],
    verstaendnis: {
      frage: 'Ihr seid euch bei der Zielgruppe unsicher – jetzt eintragen oder warten, bis ihr einen Beleg habt?',
      antwort: 'Jetzt eintragen, mit Beleg „noch keiner“: Die Zeile hält fest, wovon ihr ausgeht – eine Annahme, die ihr als Nächstes testet.',
      falsch: 'Warten, bis es belegt ist – dann fehlt genau der Ausgangspunkt, den das Log später sichtbar ersetzt, so wie D3 bei der Kaffeebar D1.',
    },
    ueberleitung: 'Und wann kommt eine Zeile dazu?',
    kern: [
      {
        text: 'Das Entscheidungslog ist eine eigene Methode des Kurses. Am nächsten kommt die Learning Card von Bland & Osterwalder: Kopf mit „Date of Learning“ und „Person Responsible“, dann vier Schritte – „We believed that …“ (Hypothese), „We observed …“ (Beobachtung, mit „Data Reliability“), „From that we learned that …“ (Erkenntnis, mit „Action Required“), „Therefore, we will …“ (Entscheidung und nächste Schritte). Datum, Beleg-Stärke und Entscheidung sind im Log, die Herleitung steht im Grund.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 55',
      },
      {
        text: 'Arbeitsteilung im Kurs: Die Annahmen-Map ist ein Stand (was wir glauben, wie gut belegt), Interviews und Lernkarten sind Beobachtungen, das Log ist der Verlauf (was wir darum getan haben). Kette A… → I…/E… → D…. Eine Log-Zeile mit „noch keiner“ ist ein Kandidat für die Map. Kurs-Festlegung, keine Quelle.',
        quelle: 'Kurs: methoden.ts (annahmen, entscheidungslog), Prüfpunkt annahmen-getan-quelle',
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
        antwort: 'Nein. Die Map sammelt, was stimmen muss, und sucht die riskanteste Annahme – ein Stand. Das Log hält fest, was ihr entschieden habt und worauf das steht – ein Verlauf. Eine Log-Zeile mit „noch keiner“ ist ein Kandidat für die Map.',
      },
    ],
  },

  wann: {
    live: [
      '„Eine Zeile, wenn ihr etwas wählt, verwerft, ändert oder bewusst behaltet.“',
      'Satzanfang: „Ich habe … gewählt, weil …; Beleg: Stufe (ID).“',
      'Falle: kein Protokoll jedes Interviews, nur was Brief oder Map ändert.',
      'Learning Card von links: das „Darum“ ist die Zeile.',
    ],
    verstaendnis: {
      frage: 'Im Interview erzählt jemand etwas Überraschendes, an Brief und Annahmen-Map ändert es nichts. Zeile oder nicht?',
      antwort: 'Keine Zeile – es steht im Snapshot. Eine Zeile kommt erst, wenn ihr deshalb etwas wählt, verwerft, ändert oder bewusst behaltet.',
      falsch: '„Jede Überraschung ist eine Zeile“ – dann wird das Log ein Interviewprotokoll und die Entscheidungen gehen darin unter.',
    },
    ueberleitung: 'Wie das über zwei Wochen aussieht, zeigt die Kaffeebar.',
    kern: [
      {
        text: 'Bei Bland folgt auf „Learn“ ausdrücklich „Decide“: Gelerntes muss in Handlung übersetzt werden, weil „what you’ve learned has an expiration date“. Handlung heißt dort: nächste Schritte, informierte Entscheidungen auf Basis der Erkenntnisse, und „decisions to abandon, change, and/or continue testing a business idea“.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 62',
      },
      {
        text: 'Die drei Entscheidungen nach einem Test: Persevere (weiter, mit stärkerem Experiment oder der nächsten wichtigen Hypothese), Pivot (ein Element der Idee deutlich ändern – frühere Evidenz kann dann irrelevant werden und muss neu getestet werden), Kill (die Idee aufgeben). Eine „ersetzt“-Zeile im Log ist im Kleinen ein Pivot.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 61',
      },
      {
        text: 'Gegen „Failure to Learn and Adapt“ empfiehlt Bland Zeit zum Verdichten und „Create rituals to keep your eyes on the prize“; dazu einen festen Rhythmus mit wöchentlichem „Learning“ (Evidenz verdichten, Erkenntnisse, Aktionen) und „Deciding“ (Lernergebnisse, Hindernisse, Entscheidungen). Die fünf Minuten am Ende jedes Kurstags sind die Kursform davon.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 68, 315',
      },
      {
        text: 'Fitzpatrick, Ablauf nach einer Reihe von Gesprächen: Notizen und wichtige Zitate mit dem Team durchgehen, „Update your beliefs and plans“, die nächsten drei großen Fragen festlegen. Nach jedem Gespräch: „The goal is to ensure the learning is now on paper and in everyone’s head“ – das „leads to better decisions, prevents arguments“.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 103, 110',
      },
    ],
    fragen: [
      {
        frage: 'Was zählt als Entscheidung?',
        antwort: 'Alles, was festlegt, für wen ihr baut, was ihr baut oder bewusst nicht baut – z. B. Zielgruppe, ein „Nicht“ aus dem Brief, der Outcome, die Ziel-Chance, die gewählte Idee. Technische Projektregeln bleiben im Repo.',
      },
      {
        frage: 'Auch wenn wir nach einer Claude-Prüfung nichts ändern?',
        antwort: 'Ja, gerade dann: Stimmt ein Befund nicht oder lasst ihr es bewusst so, kommt eine Zeile ins Log – was ihr lasst und warum, mit Beleg oder „noch keiner“ (so steht es unter „Prüfen“ auf jeder Methodenseite).',
      },
    ],
  },

  beispiel: {
    live: [
      'Zeitleiste links nach rechts: 22.10. ist heute, 05.11. nach den Interviews.',
      'Warum „egal wohin“: I3 fährt zur Uni, nicht nach Wien.',
      '„Auch Verwerfen ist eine Entscheidung: D4 streicht das Vorbestellen, und genau das gehört ins Log.“',
      'Zum Schluss die vier Zeilen als 30-Sekunden-Pitch vorlesen (Handout).',
      'Fragen: Was ist noch offen? D4 steht nur auf „gesagt“.',
    ],
    verstaendnis: {
      frage: 'Was sieht die Kaffeebar durch das Log, was sie im aktuellen Brief allein nicht sähe?',
      antwort: 'Dass die Zielgruppe am Anfang geraten war (D1, „noch keiner“) und erst die Interviews sie geschärft haben (D3) – und dass D4 nur auf „gesagt“ steht, also das nächste Experiment braucht. Der Brief zeigt nur den Stand, das Log den Weg.',
      falsch: '„Die aktuelle Zielgruppe“ – die steht auch im Brief; das Log zeigt, woher sie kommt und wie sicher sie ist.',
    },
    ueberleitung: 'Schaut auf die Belege von D2, D3 und D4: Die sind nicht gleich viel wert.',
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
        antwort: 'Ja, das Beispiel läuft dem Kurs voraus: D1 und D2 entstehen heute, die Interviews kommen bis Tag 2, D3 und D4 danach. So seht ihr heute schon, wohin das Log führt.',
      },
    ],
  },

  'beleg-staerke': {
    live: [
      'Wenn hinten: überspringen, kommt nach dem Mittag in der Annahmen-Map wieder.',
      '„Ein ‚Würde ich nutzen‘ hört ihr von fast allen – darum ist gesagt kaum besser als noch keiner.“',
      'Streng trennen: erzählt = konkretes Ereignis, „meistens …“ zählt als gesagt.',
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
      {
        text: 'Umkehrbar entscheiden steht auch in den Kursquellen: Thomke beschreibt Amazons Unterscheidung zwischen „two-way door decisions“, „which are reversible and can be made quickly by small groups“, und „one-way door decisions“, die sorgfältig abgewogen werden müssen (S. 130). Torres: Die meisten Entscheidungen in der Discovery sind umkehrbar; wer sie testet, kann schnell korrigieren, und „Visualizing each decision point and the options that you considered … will help you revisit past decisions when needed“ (S. 31, dort über den Opportunity Solution Tree); Priorisierungen als umkehrbar behandeln, „we’ll simply revisit the decision when we need to“ (S. 103). Darum darf D4 auf schwachem Beleg stehen – sie ist umkehrbar und wird ersetzt, wenn ein Test etwas anderes zeigt.',
        quelle: 'Stefan H. Thomke, The Scientific Mindset, S. 130; Teresa Torres, Continuous Discovery Habits, S. 31, 103',
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
      {
        frage: 'Und wenn wir bewusst gegen einen Beleg entscheiden wollen?',
        antwort: 'Erlaubt, aber offen: Die Zeile nennt den Beleg, der dagegen spricht, mit Stufe und ID, und im Grund steht, warum ihr trotzdem so entscheidet. Netflix nahm für „Grace and Frankie“ Bilder mit Tomlin und Fonda, obwohl Tomlin allein mehr Klicks brachte – „the experimental evidence made the decision more transparent“ (Stefan H. Thomke, The Scientific Mindset, S. 127; Ausnahmen erlaubt S. 87). Kasten im Handout unter dieser Folie; als Folie an Tag 3 auf der Experiment-Karte.',
      },
    ],
  },

  vorgehen: {
    live: [
      'Werkstatt öffnen lassen, Timer starten; zwei gute Zeilen reichen.',
      '„Fast überall wird noch keiner stehen – das ist richtig so, kein Versäumnis.“',
      '„Gespeicherte Zeilen könnt ihr nicht mehr ändern – lest sie vor dem Speichern kurz gegen.“',
    ],
    ueberleitung: 'Zum Schluss: Was davon gehört in eure Interviews?',
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
      'Frage von der Folie stellen, reihum je einen Satz sammeln, nicht diskutieren.',
      'Muster Kaffeebar: offene Frage im Brief → A1 → Interviews → D4.',
      '„Nach den Interviews zieht ihr euer Log nach – das gehört zur Hausaufgabe bis Tag 2.“',
    ],
    ueberleitung: 'Aus diesen unbelegten Sätzen baut ihr nach der Mittagspause die Annahmen-Map.',
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
