import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/problem-rahmen.astro (Tag 1).
// Seitenangaben: Torres = PDF-Seite (wie auf der Kursseite zitiert), HBR = Seite im Kurs-PDF
// (Reprint, gedruckt im Heft S. 76–83), Cagan = gedruckte Seite (PDF − 22).
export const NOTIZEN_PROBLEM_RAHMEN: Record<string, Notiz> = {
  worum: {
    live: [
      'Theorie knapp halten: Die Übung braucht die volle Stunde.',
      'Mittlere Frage betonen: Outcome wird Wurzel des Opportunity Solution Tree.',
      '„Alles im Brief ist heute eine Annahme. Abschnitt 3, das Produkt in einem Satz, bleibt offen.“',
      'Coding-Kurs-Produkt: übertragen, Abschnitte 1, 2, 4, 6 schärfen, Änderungen ins Entscheidungslog.',
    ],
    ueberleitung: 'Beim Problem passiert euch am ehesten der häufigste Fehler – so verbreitet, dass er eine eigene Folie bekommt.',
    kern: [
      {
        text: 'Discovery hat eine Struktur: Sie beginnt mit einem klaren Outcome, das den Rahmen setzt. Darunter liegt der Raum der Chancen (Bedürfnisse, Schmerzpunkte, Wünsche der Kundschaft) – das ist die Problem-Rahmung, die den Lösungsraum erst öffnet. Erst darunter kommen Lösungen und Annahmentests. Die Wurzel des Opportunity Solution Tree ist das gewünschte Outcome.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 26–27',
      },
      {
        text: 'Ein Outcome statt einer Feature-Liste lässt Platz für Zweifel: Eine feste Roadmap täuscht Sicherheit vor, ein Outcome sagt sinngemäß „Wir wissen, dass das Problem gelöst werden muss, aber nicht, wie am besten“ („We know we need this problem solved, but we don’t know the best way to solve it.“). Das Team darf mehrere Lösungen probieren und umschwenken.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 39',
      },
      {
        text: 'Cagan (nicht auf der Folie zitiert, Hintergrund): „fall in love with the problem, not the solution“. Erste Lösungen lösen das Problem meistens nicht so, dass ein Geschäft daraus wird; hinter jeder Roadmap-Idee steckt ein Problem, das man herausarbeiten muss. Wenig Zeit am Anfang für die Rahmung macht einen großen Unterschied.',
        quelle: 'Marty Cagan, Inspired, S. 178',
      },
      {
        text: 'Cagans „Opportunity Assessment“ stellt vor jeder Discovery vier Fragen: Welches Geschäftsziel? Woran erkennt ihr Erfolg? Welches Problem der Kundschaft? Welche Zielgruppe? Das deckt sich mit Für wen / Welches Problem / Woran merkt ihr es; das Geschäftsziel fehlt im Brief (beim Kaffeebar-Beispiel steckt es im Impact „mehr Umsatz am Morgen“ auf der Fehler-2-Folie). Cagan betont: Wer allen gefallen will, gefällt niemandem – darum eine konkrete Zielgruppe.',
        quelle: 'Marty Cagan, Inspired, S. 179–181',
      },
    ],
    fragen: [
      {
        frage: 'Warum dürfen wir das Produkt nicht schon heute in einem Satz beschreiben?',
        antwort: 'Weil ihr sonst in den Interviews nur noch hört, was zur Lösung passt. Abschnitt 3 kommt, wenn Interviews und Tests den Rahmen gestützt haben.',
      },
      {
        frage: 'Wir haben schon ein Produkt aus dem Coding-Kurs – fangen wir neu an?',
        antwort: 'Nein. Übertragen, Abschnitte 1, 2, 4 und 6 schärfen, jede Änderung als Zeile ins Entscheidungslog.',
      },
      {
        frage: 'Wie konkret muss „für wen“ sein?',
        antwort: 'Eine konkrete Person in einer konkreten Situation, so dass ihr wisst, wen ihr morgen interviewt – wie „Pendler*innen, die werktags zwischen 7:15 und 7:45 auf den Zug nach Wien warten“.',
      },
    ],
  },

  'fehler-1': {
    live: [
      'Nur schwache Fassung zeigen, Raum fragen, Antworten abwarten, dann aufdecken.',
      'Kaffeebar ist erfunden und begleitet den ganzen Kurs.',
      '„Gibt es mehr als eine Art, das zu lösen? Wenn nein, habt ihr eine verkleidete Lösung.“',
      'Vorspulen-Beispiel erzählen (geschichte): App zum Vorbestellen ist das Vorspulen.',
      'Falle: Gefühl als Problem („gestresst“) – nach der Ursache fragen.',
    ],
    ueberleitung: 'Was die starke Fassung bringt, seht ihr, wenn wir die möglichen Lösungen darunter aufmalen.',
    kern: [
      {
        text: 'Torres nennt das „solutions in disguise“: Kundschaft äußert oft Lösungswünsche, die wie Chancen klingen. Prüffrage: Gibt es mehr als einen Weg, das anzugehen? Wörtlich: „An opportunity should have more than one potential solution. Otherwise, it’s simply a solution in disguise.“ Dann sucht man die dahinterliegende Chance.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 94–95',
      },
      {
        text: 'Wedell-Wedellsborg: Wer handeln will, springt schnell in den Lösungsmodus, ohne zu prüfen, ob das Problem verstanden ist. Kreative Lösungen kommen fast immer aus einer anderen Definition des Problems, nicht aus tieferem Graben im schon definierten.',
        quelle: 'Thomas Wedell-Wedellsborg, Are You Solving the Right Problems?, HBR Jan.–Feb. 2017, S. 1',
      },
      {
        text: 'Torres warnt auch vor Gefühlen als Chance („Ich bin gestresst“): Gefühle kann man nicht beheben, wohl aber ihre Ursache. Ein Gefühl im Problemsatz ist ein Wegweiser zur Ursache, nicht das Problem selbst.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 95',
      },
    ],
    geschichte: {
      text: 'Torres’ Beispiel aus einem Streaming-Interview: Eine Kundin sagt „Ich wünschte, ich könnte Werbung vorspulen.“ Das klingt wie eine Chance, ist aber ein Lösungswunsch – es gibt genau eine Art, Vorspulen anzubieten, nämlich Vorspulen. Dahinter liegt die eigentliche Chance: „Ich mag keine Werbung.“ Fragt man nun, wie man das angehen könnte, gibt es plötzlich mehrere Wege: unterhaltsamere Werbung wie beim Super Bowl, Vorspulen wie gewünscht, oder ein Abo ohne Werbung. Genau das passiert bei der Kaffeebar: „App zum Vorbestellen“ ist das Vorspulen, die Schlange vor der Abfahrt ist die Werbung, die keiner mag.',
      quelle: 'Teresa Torres, Continuous Discovery Habits, S. 94–95',
    },
    fragen: [
      {
        frage: 'Aber die Inhaberin will doch eine App – warum nicht einfach bauen?',
        antwort: 'Vielleicht ist die App am Ende die beste Lösung. Nur entscheidet ihr das, nachdem ihr Alternativen gesehen habt, nicht im Problemsatz. Die nächste Folie zeigt, dass dasselbe Problem drei Lösungen zulässt.',
      },
      {
        frage: 'Ist „Kaffee“ nicht auch schon eine Lösung?',
        antwort: 'Gute Frage, genau dahin geht die Reframing-Folie: „Stellt das Ziel infrage – geht es um Kaffee oder darum, wach im Büro anzukommen?“ Für die Kaffeebar selbst ist Kaffee gesetzt; für euer Produkt lohnt die Frage, ob euer Ziel eigentlich ein anderes ist.',
      },
    ],
  },

  loesungsraum: {
    live: [
      'Fragen: Welche Lösungen erlaubt die schwache Fassung?',
      '„Unter der starken Fassung ist Platz für bessere Ideen, die erst in euren Interviews auftauchen.“',
      'Haken zeigen: Alle drei Lösungen teilen dieselbe Sicht, Schlange zu lang.',
      'Charlotte-Geschichte erzählen: verliebt in Lösung, eigentlich Motivationsproblem.',
    ],
    ueberleitung: 'Wenn alle drei Lösungen an derselben Sicht hängen, fragt ihr euch: Gibt es ein besseres Problem?',
    kern: [
      {
        text: 'Wedell-Wedellsborg nennt eine solche Gruppe einen „solution space“: Lösungen, die dieselben Annahmen darüber teilen, was das Problem ist. Beim Aufzug: neuer Lift, stärkerer Motor, besserer Algorithmus – alle gehen davon aus, dass der Aufzug zu langsam ist.',
        quelle: 'Thomas Wedell-Wedellsborg, Are You Solving the Right Problems?, HBR Jan.–Feb. 2017, S. 2',
      },
      {
        text: 'Im Opportunity Solution Tree hängen unter jeder Chance mehrere Lösungen; das ist Absicht. Eine Chance mit nur einer möglichen Lösung ist eine verkleidete Lösung.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 26, 95',
      },
      {
        text: 'Cagan: Meist braucht es mehrere Anläufe, bis eine Lösung das eigentliche Problem löst. Darum die Breite oben im Baum offen halten.',
        quelle: 'Marty Cagan, Inspired, S. 178',
      },
    ],
    geschichte: {
      text: 'Ein kleines europäisches Unternehmen klagt über zu wenig Innovation in der Belegschaft. Das Management hat eine Innovationstrainings-Methode entdeckt, die allen gefällt, und diskutiert schon, wie man sie einführt. Der Geschäftsführer holt seine Assistentin Charlotte dazu. Sie sagt: Sie sei seit zwölf Jahren im Haus und habe drei Managementteams ein neues Innovations-Framework einführen sehen, keines habe funktioniert. Da merkt das Team: Es hat sich in eine Lösung verliebt, bevor es das Problem verstanden hatte. Die Leute konnten innovieren, waren aber nicht engagiert – ein Motivations-, kein Fähigkeitsproblem. Statt Workshops gab es mehr Autonomie, flexible Arbeitszeiten und mehr Mitsprache; nach 18 Monaten hatten sich die Zufriedenheitswerte verdoppelt, vier Jahre später gewann die Firma einen Preis als bester Arbeitgeber des Landes.',
      quelle: 'Thomas Wedell-Wedellsborg, Are You Solving the Right Problems?, HBR Jan.–Feb. 2017, S. 5–6',
    },
    fragen: [
      {
        frage: 'Warum stehen beim „Vorbestellen per App“ mehr Ebenen als bei den anderen?',
        antwort: 'Auf dieser Folie sind die Tests ausgeblendet. Im vollen Kaffeebar-Baum hängt unter der App ein Test („Bestellen 3 von 10 per WhatsApp vor?“) – das kommt später bei Annahmen und Experimenten.',
      },
    ],
  },

  reframing: {
    live: [
      'Aufzug erzählen: Beschwerden, alle wollen schnelleren Lift, Verwaltung hängt Spiegel.',
      'Fragen: Welches Problem löst der Spiegel?',
      '„Die erste Sicht ist nicht falsch. Ihr prüft nur, ob es ein besseres Problem gibt.“',
      'Erst danach Kaffeebar aufdecken: Wartezeit-Anzeige an der Tür.',
      'Bei Bedarf: Tierheim-Geschichte aus „Zum Erzählen“, nur wenn Zeit ist.',
    ],
    ueberleitung: 'Der Rahmen hat einen zweiten Teil, das Outcome – und dort passiert euch der zweite typische Fehler.',
    kern: [
      {
        text: 'Wörtlich: „The point of reframing is not to find the “real” problem but, rather, to see if there is a better one to solve.“ Probleme haben meist mehrere Ursachen. Der Aufzug lässt sich auch als Spitzenlast-Problem rahmen (zu viele wollen gleichzeitig fahren) – Lösung: gestaffelte Mittagspausen.',
        quelle: 'Thomas Wedell-Wedellsborg, Are You Solving the Right Problems?, HBR Jan.–Feb. 2017, S. 2–3',
      },
      {
        text: 'Die Umfragezahlen: 106 Führungskräfte aus 91 Unternehmen in 17 Ländern; 85 % stimmten (voll) zu, ihre Organisation sei schlecht in der Problemdiagnose, 87 %, dass das erhebliche Kosten verursacht. Weniger als jede*r Zehnte sah sich nicht betroffen.',
        quelle: 'Thomas Wedell-Wedellsborg, Are You Solving the Right Problems?, HBR Jan.–Feb. 2017, S. 1',
      },
      {
        text: 'Die drei Praktiken der Folie (von sieben): Definitionen schriftlich in ganzen Sätzen sammeln, Stichpunkte sind zu knapp, Wortwahl genau lesen (S. 6–7). Positive Ausnahmen („bright spots“): Wann trat das Problem nicht auf, was war anders (S. 9)? Das Ziel infrage stellen: Fensterstreit – eine Person will frische Luft, die andere keinen Zug; gelöst durch das Fenster im Nebenraum (S. 9). Die übrigen vier: Legitimität schaffen, Außenstehende einbeziehen, fragen was fehlt, andere Problemkategorien probieren.',
        quelle: 'Thomas Wedell-Wedellsborg, Are You Solving the Right Problems?, HBR Jan.–Feb. 2017, S. 5–9',
      },
      {
        text: 'Kategorie wechseln (Praktik 5): Bei Nickelodeon brachen fast alle Kinder bei der Anmeldung einer neuen App ab, weil das Kabel-TV-Passwort der Familie nötig war. Das Team sah ein Usability-Problem und fuhr Hunderte A/B-Tests – ohne Erfolg. Dann die neue Kategorie: ein Gefühlsproblem. Eine Passwortabfrage heißt für Zehnjährige „verbotenes Terrain“, sie fürchteten Ärger. Ein kurzes Video, dass man die Eltern fragen darf, brachte eine zehnfache Anmeldequote.',
        quelle: 'Thomas Wedell-Wedellsborg, Are You Solving the Right Problems?, HBR Jan.–Feb. 2017, S. 8',
      },
      {
        text: 'Am Ende des Artikels: Reframing mit echten Tests verbinden – die Methode ist begrenzt durch das Wissen der Leute im Raum, also bald raus zur Kundschaft. Und keine Diagnose-Checkliste: „A checklist for problem diagnosis tends to discourage actual thinking“.',
        quelle: 'Thomas Wedell-Wedellsborg, Are You Solving the Right Problems?, HBR Jan.–Feb. 2017, S. 10',
      },
    ],
    geschichte: {
      text: 'Tierheime in den USA: Laut ASPCA kommen jedes Jahr über drei Millionen Hunde ins Heim, etwa 1,4 Millionen werden adoptiert. Jahrzehntelang heißt die Antwort „mehr Adoptionen“ – Plakate mit traurigen Hunden, „Rette ein Leben“. Lori Weise von Downtown Dog Rescue in Los Angeles rahmt das Problem neu: Rund 30 % der Hunde werden von ihren Besitzer*innen abgegeben. Die gelten in der Szene als herzlos, Weise sieht ein Armutsproblem – eine Kaution für den Hund beim neuen Vermieter, eine 10-Dollar-Tollwutimpfung ohne Zugang zum Tierarzt. Ab April 2013 fragt ein Heim in South L.A. jede abgebende Familie ohne Vorwurf, ob sie den Hund lieber behalten würde, und hilft dann. Die Kosten pro Tier sinken von durchschnittlich 85 auf etwa 60 Dollar, und 75 % der Besitzer*innen wollten ihr Tier eigentlich behalten. Das Ziel hat sich verschoben: von „mehr adoptieren“ zu „Hunde gar nicht erst ins Heim“.',
      quelle: 'Thomas Wedell-Wedellsborg, Are You Solving the Right Problems?, HBR Jan.–Feb. 2017, S. 3–4',
    },
    zusatz: [
      {
        titel: 'Gepäckband in Houston: längerer Weg, weniger Beschwerden',
        text: 'Der Flughafen Houston bekam viele Beschwerden über das Warten am Gepäckband. Mehr Personal senkte die Wartezeit auf durchschnittlich acht Minuten, innerhalb der Branchenwerte – die Beschwerden blieben. Die Analyse: eine Minute Fußweg, sieben Minuten Stehen am Band. Der Flughafen verlegte die Ankunftsgates weiter weg und leitete das Gepäck auf das äußerste Band, der Weg wurde sechsmal länger. Die Beschwerden fielen auf nahezu null. Wie der Spiegel: Das Problem war nicht die Dauer, sondern das leere Warten.',
        quelle: 'Alex Stone, „Why Waiting Is Torture“, The New York Times, 18.08.2012; Zusammenfassung mit Zitaten: https://www.psychologicalscience.org/news/why-waiting-is-torture.html',
      },
      {
        titel: 'Warum die Wartezeit-Anzeige wirken könnte: Maisters Thesen zum Warten',
        text: 'David Maister formulierte 1985 acht Thesen zur Psychologie von Warteschlangen, darunter: „Occupied Time Feels Shorter Than Unoccupied Time“ (das ist der Spiegel), „Uncertain Waits Are Longer than Known, Finite Waits“ und „Unexplained Waits Are Longer than Explained Waits“. Die Kaffeebar-Neurahmung „Geht sich ein Kaffee bis zur Abfahrt aus?“ zielt genau auf die Unsicherheit. Ob die Anzeige wirkt, ist trotzdem eine Annahme, die getestet werden muss.',
        quelle: 'David H. Maister, The Psychology of Waiting Lines (1985), in: Czepiel/Solomon/Surprenant (Hg.), The Service Encounter, Lexington Books; online: https://davidmaister.com/blog/201/The-Psychology-of-Waiting-Lines.html',
      },
    ],
    fragen: [
      {
        frage: 'Ist der Spiegel nicht Manipulation?',
        antwort: 'Er ändert, wie sich das Warten anfühlt, nicht wie lange es dauert. Das ist eine legitime Lösung für das Problem, über das sich die Leute beschweren. Wedell-Wedellsborg sagt ausdrücklich, dass der neue Aufzug auch funktioniert hätte – der Spiegel ist nur die bessere Lösung.',
      },
      {
        frage: 'Woher wissen wir, ob unsere neue Rahmung besser ist?',
        antwort: 'Noch gar nicht. Beide Rahmungen sind Annahmen; die Interviews ab heute Nachmittag zeigen, welche die Leute wirklich haben. Wedell-Wedellsborg: Reframing immer mit echten Tests verbinden (S. 10). In den Beispielinterviews von Tag 2 sagt ein Student „Ich weiß nie, wie lange das dauert.“ (I3-2) – das stützt die Rahmung mit der Unsicherheit.',
      },
      {
        frage: 'Wie finde ich bei uns positive Ausnahmen?',
        antwort: 'Fragt: Wer hat das Problem nicht, und warum? Bei der Kaffeebar: Wer erwischt den Zug doch mit Kaffee? In den Beispielinterviews von Tag 2 hat jemand eine eigene Regel – „Bei mehr als fünf Leuten lass ich es.“ (I3-4) –, ein anderer „Zehn Minuten hab ich meistens.“ (I5-1).',
      },
    ],
  },

  'fehler-2': {
    live: [
      'Wieder erst schwache Fassung zeigen: Was ist an „500 Downloads“ schwach?',
      '„Downloads zählen, was ihr baut. Ob jemand seinen Zug mit Kaffee erwischt, zeigen sie nicht.“',
      'tails.com vom Vormittag aufgreifen: Kalender-Ziel hätte auf Lösung festgelegt.',
      'Falle: Zielzahl schon heute – erst Lernziel, Zahl auf Experiment-Karte.',
    ],
    verstaendnis: {
      frage: 'Ist „Viele nutzen die Vorbestell-Funktion“ ein gutes Outcome? Warum?',
      antwort: 'Nein: Das ist eine Traction-Metrik, sie misst die Nutzung einer Funktion und legt auf eine Lösung fest. Ein Outcome ist geändertes Verhalten, etwa „mehr steigen mit Kaffee in den Zug“.',
      falsch: '„Ja, es misst doch, was Menschen tun“ – aber nur mit einer bestimmten Funktion, das lässt keinen Spielraum für andere Lösungen.',
    },
    ueberleitung: 'Jetzt kennt ihr beide Fehler – Zeit, euren eigenen Rahmen zu schreiben.',
    kern: [
      {
        text: 'Torres zitiert Josh Seiden: „An outcome is a change in human behavior that drives business results.“ Daher die Kursformel: Gemessen wird, was Menschen tun.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 37 (Motto von Kap. 3, Zitat aus Josh Seiden, Outcomes Over Output)',
      },
      {
        text: 'Drei Arten: Ein Business Outcome misst, wie gut das Geschäft vorankommt (Umsatz, Kosten; oft nachlaufend). Ein Product Outcome misst, wie gut das Produkt das Geschäft voranbringt, und liegt im Einflussbereich des Teams. Eine Traction-Metrik misst die Nutzung einer bestimmten Funktion. Auf der Folie: Impact = Business Outcome, Outcome = Product Outcome, Downloads sind Output.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 40',
      },
      {
        text: 'Vorlaufende statt nachlaufende Indikatoren: Nachlaufende messen erst, wenn es zu spät ist, und versetzen das Team in den Reaktionsmodus. Ein Team bekommt besser einen vorlaufenden Indikator.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 40',
      },
      {
        text: 'Die Traction-Falle: Wer die Nutzung einer bestimmten Funktion zum Ziel macht, sieht aus wie outcome-orientiert, ist aber auf einen Output fixiert und hat keinen Spielraum für andere Lösungen. Traction-Metriken nur zum Optimieren einer schon bestätigten Lösung, nicht zum Entdecken.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 41–42',
      },
      {
        text: 'Lernziel vor Leistungsziel: Forschung zu komplexen Aufgaben zeigt, dass schwierige konkrete Ziele schaden können, solange das Team keine Strategie hat; ein anfängliches Lernziel („herausfinden, was wirken könnte“) war wirksamer. Bei einem neuen Outcome also erst lernen, dann die Zielzahl setzen.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 44–45',
      },
    ],
    geschichte: {
      text: 'Erinnere an die tails.com-Geschichte vom Vormittag (Folie „Drei Arten von Zielen“): Aus den Interviews wurden zwei sofort messbare Product Outcomes, wahrgenommener Wert und Anzahl der Hunde, die das Futter mögen. Genau hier liegt Fehler 2: Hätte das Team „Nutzung eines Umstellungskalenders“ als Ziel genommen, wäre es auf eine Lösung festgelegt – und stecken geblieben, falls niemand den Kalender will.',
      quelle: 'Teresa Torres, Continuous Discovery Habits, S. 37–38, 41',
    },
    fragen: [
      {
        frage: 'Warum nicht gleich „mehr Umsatz am Morgen“ als Outcome?',
        antwort: 'Das ist der Impact (Business Outcome). Er hängt auch an Preisen, Personal, Wetter – das Team steuert ihn nicht allein, und er zeigt sich spät. Torres: Teams kommen mit einem Product Outcome weiter (S. 40–41).',
      },
      {
        frage: 'Wie messen wir „mehr steigen mit Kaffee in den Zug“, ohne Zahl?',
        antwort: 'Erst beobachten, an wenigen Personen – das reicht für Tag 1. Wie viele es in einem Test sein müssen, legt ihr erst auf der Experiment-Karte fest. Torres: erst Lernziel, dann Leistungsziel (S. 44).',
      },
      {
        frage: 'Sind Downloads nicht trotzdem nützlich?',
        antwort: 'Als Nebenzahl ja, als Ziel nein: Sie messen, dass ihr etwas gebaut und verteilt habt, nicht ob sich für die Pendler*innen etwas ändert.',
      },
    ],
  },

  vorgehen: {
    live: [
      'Alle auf Frame T1 · 2 holen, Timer 15 min starten.',
      'Nach 15 min: Outcome-Feld; auf Zielzahlen und Downloads achten.',
      'Nach 25 min: Dreierrunden, nur Fragen, keine Lösungen; je 5 min.',
      'Nach 40 min: Werkstatt, Brief speichern, Abschnitt 3 offen, 5 leer.',
      'Nach 50 min: erst Prüfliste selbst, dann Claude.',
    ],
    ueberleitung: 'Zum Abschluss die Frage, die ihr euch für euer eigenes Produkt stellt.',
    uebung: { dauer: '60 min (15 + 10 + 15 + 10 + 10)', form: 'allein, dann zu dritt reihum, dann jede*r für sich in der Werkstatt' },
    miro: {
      frame: 'T1 · 2 · Problem-Rahmen & Produkt-Brief',
      schritte: [
        '„Alle zu mir holen“ auf T1 · 2. Links die Kaffeebar: in jedem der fünf Felder ein Sticky, von „Pendler*innen nach Wien, 7:15 bis 7:45“ bis zum Outcome „Mehr Pendler*innen steigen morgens mit Kaffee in den Zug“.',
        'Jede*r in die eigene Spalte „Produkt von: …“: fünf Felder untereinander – Für wen?, Welches Problem?, Heute gelöst durch, Macht es NICHT, Outcome: Wir merken es, wenn …',
        'Schritt 1 (15 min): ein gelbes Sticky pro Feld in die ersten vier Felder, ganze Sätze, keine Lösung, kein Produktname. Bei „Macht es NICHT“ je Ding ein Sticky, damit es bei einem Gedanken pro Sticky bleibt.',
        'Schritt 2 (10 min): das Outcome als Sticky ins fünfte Feld, „Wir glauben, dass … Wir merken es, wenn …“.',
        'Dreierrunde: „Alle zu mir holen“ und Spalte für Spalte vorlesen. Die anderen fragen mündlich; wer etwas festhalten will, kommentiert das Sticky, statt es zu ändern.',
        'Ab Schritt 4 vom Board in die Werkstatt: Die Stickies sind die Vorlage für den Produkt-Brief („Bearbeiten“ im Handout).',
      ],
    },
    ablauf: {
      schritte: [
        'Allein, 15 min: je ein Sticky für Für wen?, Welches Problem?, Wie heute gelöst?, Was macht es nicht (drei Dinge)?',
        'Outcome, 10 min: „Wir glauben, dass … Wir merken es, wenn …“ – beobachtbares Verhalten, keine Funktion, keine Zielzahl.',
        'Dreierrunde, 15 min: reihum vorlesen; die anderen fragen nur „Woran würdest du das merken?“, „Ist das schon eine Lösung?“, „Gibt es ein besseres Problem – wer hat es nicht, und warum?“',
        'Festhalten, 10 min: jede*r speichert den eigenen Brief in der Werkstatt („Bearbeiten“ im Handout), Abschnitt 3 offen, 5 leer.',
        'Prüfen, 10 min: Prüfliste im Handout selbst durchgehen, dann Claude: den Prompt aus „Prüfen lassen“ kopieren und in claude.ai einfügen. Mit Connector liest Claude den Brief selbst. Ohne Connector darunter den Brief aus „Für Claude kopieren“ im Editor einfügen.',
      ],
      achten: [
        'Ganze Sätze statt Stichworte: Wedell-Wedellsborg rät, Problemdefinitionen in Satzform zu sammeln, weil Stichpunkte zu verdichtet sind und Unterschiede verstecken (HBR, S. 7).',
        'In der Runde Input, keine Lösungen: Außenstehende sollen das Denken der Problem-Eigentümer anstoßen, nicht das Problem lösen (HBR, S. 6).',
        '„Für wen“ ist eine Situation mit Zeit und Ort, nicht eine Zielgruppe wie „Studierende“.',
        '„Was macht es nicht“ nennt drei Dinge, die naheliegen würden – nicht drei absurde.',
        'Bei drei Personen braucht die Dreierrunde etwa 5 min pro Person; auf die Zeit achten.',
        'Was von Claude zurückkommt: höchstens drei Befunde mit Zitat, zu jedem eine Frage; umgeschrieben wird nichts. Jede*r entscheidet selbst, was davon in den Brief kommt: Claude findet, ihr entscheidet.',
        'Am guten Brief findet Claude oft Kleinigkeiten (etwa „Lieferung setzt eine Lösungsrichtung voraus“). Ein Befund ist eine Frage, kein Fehler.',
      ],
      fehler: [
        'Produktname oder Funktion im Problemsatz („unsere App …“, „eine Plattform für …“).',
        'Outcome als Output oder Traction: Downloads, Anmeldungen, „nutzt Funktion X“.',
        'Zielzahl schon heute („80 % …“) statt beobachtbarem Verhalten an wenigen Personen.',
        '„Heute gelöst durch“ leer gelassen – auch „gar nicht“ ist eine Antwort.',
        'Abschnitt 3 („Produkt in einem Satz“) trotzdem ausgefüllt.',
        'Nur den Text aus „Für Claude kopieren“ einfügen, ohne den Prompt: Dann schreibt Claude den Brief um und erfindet Zahlen.',
      ],
    },
    kern: [
      {
        text: 'Warum erst allein schreiben: Gruppen gehen oft auseinander im Glauben, sich einig zu sein, und merken Wochen später, dass jede*r etwas anderes meinte – und in einer dieser Sichten steckt vielleicht die bessere Rahmung. Wedell-Wedellsborg sammelt die Definitionen vorab, schriftlich, in Sätzen, und zeigt sie ohne Namen, damit Status nicht mitbewertet wird.',
        quelle: 'Thomas Wedell-Wedellsborg, Are You Solving the Right Problems?, HBR Jan.–Feb. 2017, S. 6–7',
      },
      {
        text: 'Ein Beispiel dazu: Führungskräfte aus der Bauwirtschaft schreiben ihre Hindernisse auf Flipcharts. Erste Beobachtung der Gruppe: Fast keine Definition enthält das Wort „ich“ – überall „mein Team …“, „der Markt …“. Das verschiebt das Gespräch hin zu mehr eigener Verantwortung. Wortwahl genau lesen lohnt.',
        quelle: 'Thomas Wedell-Wedellsborg, Are You Solving the Right Problems?, HBR Jan.–Feb. 2017, S. 7',
      },
      {
        text: 'Die Prüfliste ist ein Formatcheck (Lösung im Satz? Verhalten statt Funktion?), kein Ersatz für das Nachdenken in der Runde. Wedell-Wedellsborg warnt ausdrücklich vor Diagnose-Checklisten, weil sie das Denken bremsen.',
        quelle: 'Thomas Wedell-Wedellsborg, Are You Solving the Right Problems?, HBR Jan.–Feb. 2017, S. 10',
      },
    ],
    fragen: [
      {
        frage: 'Claude schreibt, es könne artefakt_pruefen nicht aufrufen. Was nun?',
        antwort: 'Im Gespräch ist kein Connector aktiv. Den Brief aus „Für Claude kopieren“ unter den Prompt einfügen; der Prompt sagt Claude, dann die eingefügten Texte zu nehmen.',
      },
      {
        frage: 'Machen wir einen gemeinsamen Brief oder jede*r einen eigenen?',
        antwort: 'Jede*r speichert den eigenen Brief in der Werkstatt; die Dreierrunde schärft die einzelnen Rahmen.',
      },
      {
        frage: 'Was, wenn mir in der Runde jemand eine bessere Rahmung vorschlägt?',
        antwort: 'Übernehmen ist erlaubt, wenn sie dich überzeugt – und es gehört als Zeile ins Entscheidungslog, mit dem Grund.',
      },
    ],
  },

  uebertrag: {
    live: [
      'Zwei, drei Teams antworten lassen, je ein Satz.',
      '„Passt es nicht in einen Satz, ist das kein Versagen, sondern eine offene Frage für Abschnitt 7.“',
      'Kaffeebar-Beispiel für Abschnitt 7: Entscheiden Pendler*innen schon vor dem Bahnhof?',
      '„Euer Rahmen ist durch euer Wissen begrenzt – darum bald raus zur Kundschaft, in die Interviews.“',
    ],
    ueberleitung: 'Was ihr heute festlegt und später ändert, braucht ein Gedächtnis – dafür kommt jetzt das Entscheidungslog.',
    kern: [
      {
        text: 'Reframing ist durch das Wissen der Leute im Raum begrenzt. Darum nicht zu lange am Schreibtisch rahmen, sondern bald raus zur Kundschaft – Denken und Testen zusammen bringen die Ergebnisse.',
        quelle: 'Thomas Wedell-Wedellsborg, Are You Solving the Right Problems?, HBR Jan.–Feb. 2017, S. 10',
      },
      {
        text: 'Ein neues Outcome braucht Zeit zum Lernen, was es bewegt; Sonjas Team wusste anfangs nicht, was es finden würde, und hat die Metrik mit dem Gelernten angepasst. Offene Fragen sind also normal.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 43–44',
      },
    ],
    fragen: [
      {
        frage: 'Was, wenn wir merken, dass unser Problem gar nicht existiert?',
        antwort: 'Dann habt ihr früh und billig etwas gelernt. Der Rahmen ist eine Annahme; ändert sich etwas, kommt es als neue Zeile ins Entscheidungslog, die alte bleibt stehen.',
      },
    ],
  },
};
