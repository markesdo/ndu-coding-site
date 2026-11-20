import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/ideation.astro (Tag 3, 13:35–15:05; seit 19.11. nach dem Kundenprofil, endet mit den Lückensätzen). Kein Vorwissen eingetragen.
// VPD-Seiten = Seitenzahlen der PDF-Ausgabe, wie in quellen/vpd/text.txt.
// Torres-Seiten = gedruckte Seiten aus quellen/torres/text.txt (Kap. 8, S. 106–114; dazu S. 30–31 und S. 105).
const TORRES = 'Teresa Torres, Continuous Discovery Habits';
const VPD = 'Osterwalder u. a., Value Proposition Design';

export const NOTIZEN_IDEATION: Record<string, Notiz> = {
  // NEU
  vergleich: {
    live: [
      'Ist-Zeit notieren.',
      'Baum zeigen: unter der Ziel-Chance drei leere Plätze.',
      '„Nicht: Sollen wir das bauen? Sondern: Welche von dreien trifft die Chance am besten?“',
      'Fragen: Mit welcher Idee seid ihr an Tag 1 gekommen?',
      'Falle: Idee von Tag 1 schlechtreden – sie darf mit ins Rennen.',
    ],
    kern: [
      {
        text: 'Eine „whether or not“-Entscheidung fragt „Should we do this or not?“. Torres setzt dagegen den Vergleich: „Instead of falling in love with our first idea, we’ll ask, “What else could we build?”“',
        quelle: `${TORRES}, S. 30–31`,
      },
      {
        text: 'Ziel des Kapitels: „work with sets of solutions rather than fixating on your favorite solution“. Am Ende der Ideation steht die Vergleichsfrage: „Which of these three ideas best delivers on our target opportunity?“',
        quelle: `${TORRES}, S. 105 und S. 113`,
      },
    ],
    fragen: [
      {
        frage: 'Wir haben doch schon eine Idee – warum noch 15 weitere?',
        antwort: 'Weil sich eine einzelne Idee nur mit „ja oder nein“ beurteilen lässt. Erst drei Ideen zur selben Chance lassen sich gegeneinander prüfen (S. 31, S. 113). Die Idee von Tag 1 bleibt im Rennen.',
      },
    ],
    ueberleitung: 'Probiert es zuerst an der Kaffeebar: zwei Minuten, jede*r für sich.',
  },

  // NEU – erst machen
  'erste-ideen': {
    live: [
      'Frage H1 vorlesen, nichts erklären.',
      'Freie Fläche oder Papier – Kaffeebar-Spalte noch nicht zeigen.',
      'Timer 2 min: allein, ein Sticky pro Idee, durchnummeriert.',
      'Nach 2 min: reihum nur die erste Idee vorlesen.',
      'Falle: schon jetzt kommentieren oder werten.',
      'Danach: Stickies aller in die Kaffeebar-Spalte legen.',
    ],
    uebung: { dauer: '2 min + 1 min reihum', form: 'allein, dann reihum laut: nur Idee Nr. 1' },
    miro: {
      frame: 'T3 · 3 · Ideation',
      schritte: [
        'Die zwei Minuten laufen auf einer freien Fläche neben den Frames oder auf Papier: In der Kaffeebar-Spalte von T3 · 3 liegen schon Ideen des Beispiels, sie würden die Antworten vorwegnehmen.',
        'Jede*r schreibt eigene Stickies, in der Reihenfolge des Einfalls nummeriert (1, 2, 3 …). Nichts verschieben, nichts gruppieren – die Nummern braucht es auf der nächsten Folie.',
        'Erst nach der Runde: „Alle zu mir holen“ auf die Kaffeebar-Spalte; die Stickies aller kommen in „Ideen“ dazu.',
      ],
      vorschlaege: ['Ampel an der Hallentür', 'Bestellungen nach Abfahrtszeit aufrufen', 'Kaffee per Drohne'],
    },
    ablauf: {
      schritte: [
        'H1 vorlesen: „Wie könnten wir dafür sorgen, dass Pendler*innen beim Betreten der Halle wissen, ob sich ein Kaffee bis zur Abfahrt ausgeht?“',
        'Timer 2 min, alle schreiben still, auf einer freien Fläche oder auf Papier. Die Nummer auf dem Sticky ist die Reihenfolge des Einfalls.',
        'Reihum: Jede*r liest nur Idee Nr. 1 vor. Kein Kommentar.',
      ],
      achten: [
        'Die Nummern sind der Punkt der Übung – ohne sie fehlt der Vergleich in der Auflösung.',
        'Die Kaffeebar-Spalte zeigt schon drei Ideen des Beispiels (die Vorschläge unten). Sie bleibt bis nach der Runde zu; wer danach dieselbe Idee dort findet, legt die eigene trotzdem dazu.',
      ],
      aufloesung: 'Kommt auf der nächsten Folie: erste Ideen vergleichen, dann die Nummer der ungewöhnlichsten Idee nennen.',
    },
    kern: [
      {
        text: 'Die Zwei-Minuten-Runde ist eine Übung dieses Kurses, keine Methode aus dem Buch. Sie stellt den Befund nach, den Torres berichtet: erste Ideen sind selten die besten, die originellsten kommen spät.',
        quelle: `Kursregel; Befund: ${TORRES}, S. 107`,
      },
    ],
    ueberleitung: 'Jetzt schaut auf eure Nummern.',
  },

  menge: {
    live: [
      'Fragen: Wie ähnlich waren eure drei ersten Ideen?',
      'Fragen: Welche Nummer trägt eure ungewöhnlichste Idee?',
      'Erst dann aufdecken: schnell → vielfältiger → am Ende originell.',
      '„Unser Gehirn schließt die Schleife sofort. Wir halten sie heute länger offen.“',
      'Falle: Ergebnis hinbiegen, wenn es nicht passt – Torres sagt „tend to“.',
      'Wenn hinten: Backlog-Punkt weglassen, steht im Handout.',
    ],
    verstaendnis: {
      frage: 'Heißt „Menge führt zu Qualität“, dass jede Chance 20 Ideen braucht?',
      antwort: 'Nein. „Passwort vergessen“ muss niemand neu erfinden. Es lohnt sich bei strategischen Chancen, bei denen ihr euch unterscheiden wollt (S. 107) – eure Ziel-Chance ist so eine.',
      falsch: '„Je mehr Ideen, desto besser, immer“ – Torres begrenzt es ausdrücklich auf strategische Chancen.',
    },
    kern: [
      {
        text: 'Kapitelmotto (Leigh Thompson): „Creative teams know that quantity is the best predictor of quality.“',
        quelle: `${TORRES}, S. 106`,
      },
      {
        text: '„our first idea is rarely our best idea“. Kreativität wird an drei Größen gemessen: Zahl der Ideen (fluency), Vielfalt (flexibility), Neuheit (originality); die Zahl hängt mit den anderen beiden zusammen. „the most original ideas tend to be generated toward the end of the ideation session“ – darum: „we want to learn to keep the loop open longer“.',
        quelle: `${TORRES}, S. 107`,
      },
      {
        text: 'Teams ertrinken in Ideen und haben trotzdem zu wenige: Ordnet man Backlog und Roadmap den Chancen im Baum zu, „odds are we’ll have only one or two solutions for each opportunity“ – lauter erste Ideen zu vielen Chancen.',
        quelle: `${TORRES}, S. 107`,
      },
    ],
    geschichte: {
      text: 'Die Gegenprobe, die Torres selbst gibt: „You don’t need to reinvent the “forgot password” workflow“. Nicht jede Chance verdient eine Ideation – nur die, bei der ihr euch von anderen abheben wollt.',
      quelle: `${TORRES}, S. 107`,
    },
    fragen: [
      {
        frage: 'Bei uns kam die beste Idee gleich am Anfang – stimmt die Forschung dann nicht?',
        antwort: 'Torres berichtet eine Tendenz über viele Sitzungen, kein Gesetz für zwei Minuten. Ob eure erste die beste ist, wisst ihr erst, wenn ihr sie mit späteren vergleichen könnt.',
      },
    ],
    ueberleitung: 'Viele Ideen also. Alle in einen Raum und Brainstorming? Nicht ganz.',
  },

  brainstorming: {
    live: [
      'Fragen: Brainstorming – bunte Zettelwand oder fensterloser Raum? Reihum ein Wort.',
      'Osborn 1953: vier Regeln, die alle kennen.',
      'Aufdecken: Gruppe gegen gleich viele Einzelne – Einzelne gewinnen.',
      'Vier Gründe einzeln aufdecken, je ein Satz.',
      'Fragen: Welchen der vier habt ihr selbst schon erlebt?',
    ],
    verstaendnis: {
      frage: 'Womit wurden die Brainstorming-Gruppen in den Studien verglichen?',
      antwort: 'Mit derselben Zahl von Einzelnen, die allein Ideen sammeln. Die Einzelnen hatten zusammen mehr, vielfältigere und originellere Ideen (S. 108).',
      falsch: '„Mit einer einzelnen Person“ – dann wäre der Vergleich unfair; verglichen wird gleich viele Köpfe.',
    },
    kern: [
      {
        text: 'Brainstorming stammt von Alex Osborn, Manager einer Werbeagentur („Applied Imagination“, 1953). Vier Regeln: auf Menge achten, Urteil aufschieben, ungewöhnliche Ideen begrüßen, Ideen kombinieren und verbessern.',
        quelle: `${TORRES}, S. 108`,
      },
      {
        text: 'Jahrzehnte von Studien, Gruppe gegen gleich viele Einzelne: „Individuals generated more ideas, more diverse ideas, and more original ideas.“',
        quelle: `${TORRES}, S. 108`,
      },
      {
        text: 'Vier Gründe: social loafing (in der Gruppe verlässt man sich auf die anderen), Gruppenanpassung (frühe Ideen geben den Ton vor, man zensiert sich), production blocking (jemand redet, die eigene Idee ist weg), downward norm setting (die Gruppe pendelt sich beim schwächsten Mitglied ein).',
        quelle: `${TORRES}, S. 108–109`,
      },
    ],
    geschichte: {
      text: 'Torres’ Einstieg ins Kapitel: Bei „Brainstorming“ denken die einen an eine lebhafte Gruppe vor einer Wand voller bunter Zettel, die anderen an einen fensterlosen Besprechungsraum, in dem wenige Ideen rufen, eine Person mitschreibt und der Rest sich langweilt. Für die einen ein Allheilmittel, für die anderen ein Dilbert-Comic.',
      quelle: `${TORRES}, S. 106`,
    },
    ueberleitung: 'Wenn Einzelne besser sind – warum schwören dann so viele auf Brainstorming?',
  },

  // NEU
  illusion: {
    live: [
      'Frage stehen lassen, reihum eine Vermutung.',
      'Aufdecken: In der Gruppe steckt man seltener fest.',
      '„Es fühlt sich leichter an – also halten wir es für besser.“',
      'Brücke: Den Vorteil der Gruppe wollen wir trotzdem haben.',
      'Wenn hinten: Folie überspringen, ein Satz bei „Allein, teilen“.',
    ],
    verstaendnis: {
      frage: 'Was genau überschätzen Brainstorming-Gruppen?',
      antwort: 'Ihre eigene Leistung. Weil die Ideen der anderen über Hänger hinweghelfen, bleibt man seltener stecken – das fühlt sich produktiv an, obwohl Einzelne mehr und originellere Ideen liefern (S. 109).',
    },
    kern: [
      {
        text: 'Bernard Nijstad und Kolleg*innen (Universität Groningen) nennen es „the illusion of group productivity“: Gruppen überschätzen ihre Leistung und sind zufriedener, obwohl sie weniger liefern.',
        quelle: `${TORRES}, S. 109`,
      },
      {
        text: 'Erklärung: weniger „cognitive failures“ – Momente, in denen einem nichts einfällt. Allein hat man mehr davon; die Einzelnen mussten sich mehr anstrengen und kamen trotzdem weiter. „Working in a group feels easier, so we think we must be performing at a higher level.“',
        quelle: `${TORRES}, S. 109`,
      },
    ],
    ueberleitung: 'Geht beides – der Schub der Gruppe und die Leistung der Einzelnen? Ja.',
  },

  wechsel: {
    live: [
      'Fluss von links lesen: allein, teilen, allein, teilen.',
      '„Ihr hört die Ideen der anderen – aber neue Ideen schreibt jede*r allein.“',
      'Teilen heißt: erklären, nachfragen, weiterspinnen – nicht bewerten.',
      'Bei euch: allein entwickeln, einmal still Ideen spenden.',
      'Falle: Die Teilen-Runde wird zum Gruppen-Brainstorming.',
    ],
    verstaendnis: {
      frage: 'Wann in diesem Ablauf entstehen neue Ideen?',
      antwort: 'Nur in den Allein-Runden. Beim Teilen wird erklärt und nachgefragt; was dabei einfällt, schreibt jede*r danach allein auf. „They never ideated as a group, but they received the benefit of hearing each other’s ideas.“ (S. 110)',
      falsch: '„Beim Teilen, wenn alle zusammen weiterspinnen“ – genau das wäre wieder Brainstorming in der Gruppe.',
    },
    kern: [
      {
        text: 'Runa Korde und Paul Paulus (University of Texas at Arlington): Der Wechsel zwischen Ideen allein und Teilen in der Gruppe verbessert die Ideen der folgenden Einzelrunden. „They never ideated as a group, but they received the benefit of hearing each other’s ideas.“',
        quelle: `${TORRES}, S. 110`,
      },
      {
        text: 'Torres’ vier Schritte: 1. Ziel-Chance vergegenwärtigen, 2. allein Ideen sammeln, 3. im Team teilen (beschreiben, Fragen zulassen, weiterspinnen), 4. Schritte 2 und 3 wiederholen. „Repeat until you’ve generated between 15 and 20 ideas for your target opportunity.“',
        quelle: `${TORRES}, S. 112`,
      },
      {
        text: 'Ideation ist die eine Übung, die Torres mit dem ganzen Team empfiehlt: „The more diversity in the group, the more diverse ideas you’ll generate.“ Voraussetzung: Ziel-Chance und Kontext der Kundschaft vorher teilen.',
        quelle: `${TORRES}, S. 114`,
      },
    ],
    fragen: [
      {
        frage: 'Ich kenne das Produkt der anderen kaum – was soll ich da beitragen?',
        antwort: 'Ihr spendet nur, zwei Minuten still je Produkt: Wer weiter weg ist, bringt andere Ideen (S. 114). Den Kontext dafür gibt der Satz zu Beginn, in dem jede*r Ziel-Chance, HMW-Frage und Situation nennt.',
      },
    ],
    ueberleitung: 'Allein Ideen sammeln heißt auch: Irgendwann fällt euch nichts mehr ein.',
  },

  festgefahren: {
    live: [
      '„Feststecken passiert allen. Es heißt nicht, dass ihr unkreativ seid.“',
      'Vier Auswege einzeln aufdecken.',
      'Klettverschluss erzählen: Klette in der Socke.',
      'Zauberstab: wilde Idee zulassen, sie verbessert die machbaren.',
      'Claude erst nach der ersten Runde allein; Ideen von Claude markieren.',
    ],
    kern: [
      {
        text: 'Wer allein Ideen sammelt, bleibt früher oder später stecken. „You aren’t bad at generating ideas. You are creative.“ Tipp 1: nicht eine Stunde am Stück, Pausen, Ortswechsel.',
        quelle: `${TORRES}, S. 110`,
      },
      {
        text: 'Inkubation: Das Gehirn arbeitet weiter, wenn man aufhört, bewusst nachzudenken – besonders nachdem man die Ideen anderer gehört hat. Wer feststeckt, schläft darüber.',
        quelle: `${TORRES}, S. 111`,
      },
      {
        text: 'Extreme Nutzer*innen: Was will eine Vielnutzerin, was braucht jemand beim ersten Mal, Menschen mit Behinderungen, auf dem Land, in der Großstadt, Junge, Alte? Wilde Ideen: „pretend you have a magic wand—anything is possible“ – sie werden selten gebaut, verbessern aber die machbaren, wenn man mischt.',
        quelle: `${TORRES}, S. 111–112`,
      },
    ],
    geschichte: {
      text: '„Velcro was invented after the inventor found a cocklebur in his sock.“ Ihn interessierte, wie die Klette sich festhakt – daraus wurde der Klettverschluss. Torres’ Punkt: Viele neue Ideen kommen aus ganz anderen Gebieten.',
      quelle: `${TORRES}, S. 111`,
    },
    fragen: [
      {
        frage: 'Dürfen wir Claude gleich am Anfang fragen?',
        antwort: 'Nein, erst nach der ersten Runde allein – sonst geben Claudes Ideen den Ton vor wie die ersten Wortmeldungen in einer Gruppe (S. 108). Danach als Quelle für analoge Produkte und extreme Nutzer*innen; Ideen von Claude werden markiert. Das ist eine Regel dieses Kurses, nicht von Torres.',
      },
    ],
    ueberleitung: 'Den Ausweg über analoge Produkte üben wir einmal gemeinsam.',
  },

  // NEU – Kaffeebar gemeinsam
  analogien: {
    live: [
      'Torres’ Beispiel: Jobbörse schaut auf Shops, Reiseportale, Versicherungen.',
      'Fragen: Wer sagt Menschen, ob sich etwas vor Abfahrt ausgeht? Reihum.',
      'Antworten als Stickies in die Kaffeebar-Spalte.',
      'Aufdecken: Flughafen, Supermarkt – zwei Ideen der Kaffeebar.',
      'Falle: nur Cafés und Bäckereien nennen – weiter weg suchen.',
      'Express-Kasse passt weniger genau – zweite, schwächere Analogie.',
    ],
    uebung: { dauer: '2 min', form: 'zu dritt, reihum laut; du schreibst die Stickies' },
    miro: {
      frame: 'T3 · 3 · Ideation',
      schritte: [
        'Kaffeebar-Spalte: genannte Branchen als Stickies neben die Ideen aus der Zwei-Minuten-Runde.',
        'Zu jeder Branche eine Idee für die Kaffeebar daneben.',
      ],
      vorschlaege: ['Flughafen: Boarding-Gruppen → Bestellungen nach Abfahrtszeit aufrufen', 'Supermarkt: Express-Kasse'],
    },
    verstaendnis: {
      frage: 'Woran erkennt ihr ein brauchbares analoges Produkt?',
      antwort: 'An der Ähnlichkeit zur Ziel-Chance, nicht zur Branche: Jemand anderes muss ein Problem wie dieses lösen (S. 111, S. 114). Je weiter weg die Branche, desto eher kommen andere Ideen.',
      falsch: '„Am besten die direkte Konkurrenz“ – dort beginnt man, aber Torres sagt ausdrücklich: dann weiter schauen.',
    },
    kern: [
      {
        text: 'Erst die Konkurrenz, dann weiter: „What other industries have solved similar problems?“ Beispiel Jobbörse, die Recruiter*innen beim Bewerten von Kandidat*innen hilft: Wie helfen Online-Shops beim Bewerten von Produkten, Reiseportale beim Wählen eines Hotels, Versicherungen beim Vergleich von Policen?',
        quelle: `${TORRES}, S. 111`,
      },
      {
        text: 'Die Frage zum Mitnehmen: „Who else has to solve a problem like this?“ – je weiter die Branche entfernt ist, desto eher findet ihr verschiedenartige Ideen.',
        quelle: `${TORRES}, S. 114`,
      },
      {
        text: 'Kaffeebar: „Bestellungen nach Abfahrtszeit aufrufen (wie Boarding-Gruppen)“ und „Express-Kasse wie im Supermarkt“ stehen schon unter den 18 Ideen des Beispiels.',
        quelle: 'ideation.astro, Folie beispiel',
      },
    ],
    ueberleitung: 'Angenommen, es sind 18 Ideen. Wie werden daraus drei?',
  },

  auswahl: {
    live: [
      'Fluss lesen: aussortieren, punkten, drei, Check.',
      '„Einziges Kriterium: Wie gut trifft die Idee die Ziel-Chance?“',
      'Drei Punkte je Person, frei verteilt – auch alle auf eine.',
      'Kein klarer Sieger: kurz werben, neu punkten.',
      'Falle: nach „machbar“ oder „cool“ punkten.',
      'Bei euch: jede*r wählt die drei allein – Kursregel.',
      '„Wir wählen drei, nicht eine. Nach der Pause wird eine davon Spitzenreiter auf Papier.“',
    ],
    verstaendnis: {
      frage: 'Eine Idee ist großartig, löst aber eure Ziel-Chance nicht. Was passiert mit ihr?',
      antwort: 'Sie wird vor dem Punkten aussortiert und steht getrennt. Sonst macht ihr die Wahl der Ziel-Chance vom Vormittag rückgängig: „Don’t undo that work now.“ (S. 114)',
      falsch: '„Sie bleibt drin, gute Ideen wirft man nicht weg“ – sie geht nicht verloren, sie steht nur nicht zur Wahl.',
    },
    kern: [
      {
        text: 'Erst prüfen: „Does this idea solve the target opportunity?“ Teilweise reicht. Dass einige Ideen die Chance gar nicht lösen, ist eine normale Nebenwirkung des Ideensammelns.',
        quelle: `${TORRES}, S. 112–113`,
      },
      {
        text: 'Dot-Voting, weil „while we are better at generating ideas individually, we are better at evaluating ideas as a group“. Drei Stimmen je Person, frei verteilt. Kriterium ist nur die Ziel-Chance: „You aren’t voting for the coolest, shiniest ideas.“ Schwierige oder unmögliche Ideen werden noch nicht ausgeschlossen.',
        quelle: `${TORRES}, S. 113`,
      },
      {
        text: 'Mehrere Runden sind normal: ohne klaren Sieger wirbt jede*r kurz für die eigenen Punkte, dann neu punkten; ein klarer Sieger wird beiseitegelegt. Am Ende: „everyone on the team should be excited about at least one idea, and each idea should have a strong advocate in the group“.',
        quelle: `${TORRES}, S. 113`,
      },
      {
        text: 'Warum drei: „we don’t want to dot-vote to select one idea“. Von drei auf eine führen bei Torres Prototypen und Annahmentests; die Frage dafür: „Which of these three ideas best delivers on our target opportunity?“',
        quelle: `${TORRES}, S. 113`,
      },
    ],
    fragen: [
      {
        frage: 'Torres punktet im Team. Warum wählt ihr allein?',
        antwort: 'Torres: „Groups tend to evaluate ideas better than individuals because groups have a wider breadth of experience to draw on.“ (S. 113). Bei euch hat jede*r ein eigenes Produkt und kennt allein die Kundschaft dazu; darum wählt ihr allein, mit Torres’ einzigem Kriterium: Wie gut trifft die Idee die Ziel-Chance? Das ist eine Regel dieses Kurses.',
      },
      {
        frage: 'Bei Torres entscheiden Tests zwischen den dreien. Warum bei uns ein Spitzenreiter?',
        antwort: 'Story Map und Prototyp an Tag 4 brauchen eine Idee; das Buch von Osterwalder sieht vor, vor dem Test unter Alternativen zu wählen (VPD S. 347–348). Der Vergleich der Lückensätze ersetzt die Tests nicht: Die anderen beiden bleiben offen, ihre „?“ gehen mit in Tag 4. Das ist eine Entscheidung dieses Kurses.',
      },
    ],
    ueberleitung: 'Eine Falle beim Auswählen hat mit Raubkatzen zu tun.',
  },

  // NEU
  varianten: {
    live: [
      'Löwen, Tiger, Pumas erzählen.',
      'Kaffeebar: Ampel, Anzeige, Bahn-App – eine Idee, drei Formen.',
      '„In die Auswahl gehören drei verschiedene Arten von Idee.“',
      'Wenn hinten: überspringen, kommt beim Übertrag.',
    ],
    kern: [
      {
        text: 'Anti-Muster „Generating too many variations of the same idea“: Wer feststeckt, variiert. Beim Sammeln ist das in Ordnung, in der Auswahl der drei soll die Vielfalt so groß wie möglich sein – bewusst nach Ideen einer anderen Art suchen.',
        quelle: `${TORRES}, S. 114`,
      },
    ],
    geschichte: {
      text: 'Wer möglichst viele Tierarten aufzählen soll, landet schnell in einer Familie: „once we identify lions and tigers, we might add pumas, cheetahs, and snow leopards“. Viele Einträge, eine Kategorie.',
      quelle: `${TORRES}, S. 114`,
    },
    ueberleitung: 'So sieht das bei der Kaffeebar aus.',
  },

  beispiel: {
    live: [
      '„Im Beispiel wurden es 18 Ideen – eure von vorhin kommen dazu.“',
      'Aussortiert: Becher mit Deckel, mehr Sitzplätze – gut, andere Chance.',
      'Fragen: Welche drei Arten von Idee seht ihr?',
      'Aufdecken: Anzeige, Bestellweg, anderer Ort.',
      'Bei Bedarf: „Im Gehen bestellen“ ist nicht das verworfene Vorbestellen (D4).',
    ],
    verstaendnis: {
      frage: 'Warum ist „mehr Sitzplätze“ aussortiert, obwohl es Pendler*innen helfen würde?',
      antwort: 'Weil es die Ziel-Chance nicht löst: Wer in die Halle kommt, weiß damit immer noch nicht, ob sich ein Kaffee bis zur Abfahrt ausgeht (S. 112–114).',
    },
    kern: [
      {
        text: 'Kaffeebar: 18 Ideen zu H1; aussortiert, was die Ziel-Chance nicht löst; drei nach dem Punkten: Wartezeit an der Hallentür (Anzeige), Im Gehen bestellen mit Abfahrtszeit (Bestellweg), Kaffeewagen am Bahnsteig (anderer Ort). Varianten der Anzeige sind zusammengefasst.',
        quelle: `ideation.astro, Folie beispiel; Regel: ${TORRES}, S. 112–114`,
      },
      {
        text: 'Kaffeebar, Entscheidungslog D4: „Vorbestellen vor der Ankunft verworfen“ – 3 von 5 entscheiden erst in der Halle. „Im Gehen bestellen“ beginnt an der Hallentür und widerspricht D4 nicht.',
        quelle: 'Werkstatt, Beispiel Kaffeebar, Entscheidungslog D4; QR-Code an der Hallentür: value-map.astro, Folie beispiel',
      },
    ],
    ueberleitung: 'Aus jeder der drei wird ein Satz – gegen euer Profil.',
  },

  'ad-libs': {
    live: [
      'Lückensatz vorlesen, Lücken mit dem Finger zeigen.',
      '„Ein Satz pro Idee – er zwingt euch zu sagen, wie sie Wert schafft.“',
      '„Job, Pain und Gain kommen aus eurem Profil vom Vormittag, mit ID.“',
      'Kaffeebar-Satz zeigen: J1, P1, G1 – anders als der Automat.',
      'Falle: am ersten Satz feilen – drei rohe Sätze sind das Ziel.',
    ],
    verstaendnis: {
      frage: 'Woher kommen Job, Pain und Gain im Lückensatz?',
      antwort: 'Aus dem Kundenprofil vom Vormittag, am besten aus den obersten Einträgen. Neu ist im Satz nur das Angebot und wie es wirkt.',
      falsch: '„Die überlegen wir uns passend zur Idee“ – dann beschreibt das Profil das Angebot und nicht die Kundschaft.',
    },
    kern: [
      {
        text: 'Ad-libs sind neben Serviettenskizze und Canvas eine der Prototyp-Techniken, um verschiedene Richtungen schnell zu erkunden, bevor man eine ausarbeitet. „Prototype three to five different directions by filling out the blanks in the ad-lib below.“',
        quelle: `${VPD}, S. 156–159, 183`,
      },
      {
        text: 'Die Lücken laut Abbildung: products and services – customer segment – jobs to be done – eigenes Verb (z. B. reducing, avoiding) – eigenes Verb (z. B. increasing, enabling); als Tipp am Anfang oder Ende: unlike – competing value proposition.',
        quelle: `${VPD}, S. 184 (Beschriftungen aus der Abbildung)`,
      },
      {
        text: 'Prototyp-Regeln, die hier gelten: „Don’t fall in love with first ideas— create alternatives.“ Und für frühe Prototypen: „Spend a maximum of 5 to 15 minutes on sketching out your early prototypes.“, mit sichtbarem Timer.',
        quelle: `${VPD}, S. 165 und S. 161`,
      },
    ],
    ueberleitung: 'Jetzt ihr: drei Produkte, drei Fragen.',
  },

  vorgehen: {
    live: [
      'Timer 16 min: allein, Ideen zur eigenen Frage.',
      'Nach 16 min: Ideen-Spende still, je Produkt 2 min.',
      'Nach 22 min: wieder allein, 18 min; Auswege und Claude erlaubt.',
      '1:1 in dieser Runde, je 4 min: Sofie, Hewen, Joachim.',
      'Nach 40 min: auswählen allein, 7 min.',
      'Nach 47 min: Lückensätze gegen das Profil, 8 min.',
      'Nach 55 min: IDEEN.md, drei Ideen als Lückensätze.',
    ],
    uebung: { dauer: '59 min (16 + 6 + 18 + 7 + 8 + 4)', form: 'allein, dazwischen eine stille Ideen-Spende' },
    miro: {
      frame: 'T3 · 3 · Ideation',
      schritte: [
        'Jede*r hat eine Spalte für das eigene Produkt; bei der Ideen-Spende legen die anderen Stickies in „Ideen“ dazu.',
        'Ein Sticky pro Idee, eigene Farbe je Person; Ideen von Claude mit „(Claude)“.',
        'Auswählen allein: Was die Ziel-Chance nicht löst, in „Aussortiert“.',
        'Die drei Gewählten als Lückensätze in „Drei Ideen als Lückensätze“ (T3 · 3).',
      ],
    },
    ablauf: {
      schritte: [
        'Allein (16 min): Ideen zur eigenen HMW-Frage, ein Sticky pro Idee, in die eigene Spalte.',
        'Ideen-Spende, still (6 min): je Produkt 2 Minuten – die zwei anderen legen Ideen-Stickies an die Frage, ohne Diskussion; wem das Produkt gehört, liest nur mit. Kursformat statt Torres’ Teilen-Runde, weil jede*r ein eigenes Produkt hat.',
        'Wieder allein (18 min), bis 15 bis 20 Ideen stehen: angeregt von den gespendeten Ideen. Wer feststeckt: analoge Produkte, extreme Nutzer*innen, Zauberstab, dann Claude. Markus geht je 4 Minuten zu jeder Person (Sofie, Hewen, Joachim).',
        'Auswählen allein (7 min): aussortieren, was die Ziel-Chance nicht löst; drei Ideen verschiedener Art. Torres punktet im Team (S. 113); allein wählen ist Kursregel.',
        'Lückensätze (8 min): je Idee ein Satz, Job, Pain und Gain mit ID aus dem eigenen Profil vom Vormittag (VPD S. 183–184).',
        'Festhalten (4 min): docs/IDEEN.md mit den drei Lückensätzen, „Aussortiert“ und der Liste; Claude-Prüfung bis Tag 4, wenn die Zeit fehlt.',
      ],
      achten: [
        'Bei der Ideen-Spende wird nicht diskutiert und nicht bewertet – nur Stickies legen.',
        'Unter 15 Ideen bei einem Produkt: nicht strecken, sondern über Nacht ergänzen (Torres S. 114: nicht nur eine Sitzung).',
        'Wählen nur nach „trifft die Ziel-Chance“, nicht nach Aufwand.',
        'Die drei Gewählten sind drei Arten von Idee, keine Varianten.',
      ],
      fehler: [
        'Schon in der ersten Allein-Runde bewerten oder Stickies der anderen kommentieren.',
        'Bei der Spende kommentieren statt Ideen legen.',
        'Die Idee von Tag 1 wird ohne Prüfung gegen die Ziel-Chance durchgewinkt.',
        'Aussortierte Ideen werden gelöscht statt getrennt abgelegt.',
      ],
    },
    kern: [
      {
        text: 'Torres rät, Ideen nicht in einer einzigen Sitzung zu sammeln und die Inkubation zu nutzen. Was über Nacht einfällt, kommt dazu.',
        quelle: `${TORRES}, S. 114`,
      },
    ],
    ueberleitung: 'Bevor ihr festhaltet: ein Blick auf eure drei.',
  },

  uebertrag: {
    live: [
      'Fragen: Sind eure drei wirklich verschieden – oder Löwe, Tiger, Puma?',
      'Allein: je Idee ein Wort für ihre Art notieren.',
      'Bei drei Varianten: eine Idee anderer Art aus der Liste holen.',
      'Ausblick: Nach der Pause wird einer der drei Lückensätze Spitzenreiter.',
    ],
    kern: [
      {
        text: 'Für die Auswahl der drei gilt: so viel Vielfalt wie möglich; Varianten derselben Idee sind zum Sammeln gut, nicht für den Vergleich.',
        quelle: `${TORRES}, S. 114`,
      },
    ],
    ueberleitung: 'Nach der Pause: Welcher Lückensatz trifft, was eurer Kundschaft am wichtigsten ist?',
  },
};
