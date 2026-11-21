import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/kundenprofil.astro (Tag 3, 11:30–12:00; seit 19.11. vor HMW und Ideation, damit das Profil ohne Ideen im Kopf entsteht – VPD S. 78–79).
// Vorwissen: Kundenprofil „bekannt“ aus Entrepreneur Lab & Prototyping (vorwissen.ts) – Theorie zu Jobs, Pains, Gains kurz,
// dafür das, was hier anders ist: Belege aus dem Baum, Kontext, konkret statt vage.
// VPD-Seiten = Seitenzahlen der PDF-Ausgabe, wie in quellen/vpd/text.txt (nicht die der gedruckten Ausgabe).
const VPD = 'Osterwalder u. a., Value Proposition Design';

export const NOTIZEN_KUNDENPROFIL: Record<string, Notiz> = {
  canvas: {
    live: [
      'Ist-Zeit notieren.',
      'Fragen: Canvas schon einmal gefüllt – woher kamen damals die Zettel?',
      '„Heute kommt jeder Zettel aus eurem Baum, mit Zitat-ID.“',
      'Rechts Kundschaft, links Angebot, Fit in der Mitte.',
      'Falle: den Canvas noch einmal von vorn erklären.',
    ],
    kern: [
      {
        text: 'Der Canvas hat zwei Seiten: Kundenprofil (Verständnis der Kundschaft klären) und Value Map (wie ihr Wert schaffen wollt). „You achieve Fit between the two when one meets the other.“',
        quelle: `${VPD}, S. 44`,
      },
      {
        text: 'Kursbezug: Torres ordnet die Belege als Baum, um eine Chance zu wählen; Osterwalder als Profil neben dem Angebot, um eine Idee zu prüfen. Dieselben Belege, zwei Anordnungen.',
        quelle: 'kundenprofil.astro, Folie canvas (Einordnung dieses Kurses)',
      },
    ],
    fragen: [
      {
        frage: 'Wir kennen das Profil schon – warum noch einmal?',
        antwort: 'Weil ihr es diesmal nicht aus dem Kopf füllt, sondern aus fünf Interviews, und weil es heute einen Zweck hat: Am Nachmittag messt ihr drei Ideen daran.',
      },
    ],
    ueberleitung: 'Bevor ihr füllt: Lernt eine Kundin kennen.',
  },

  // NEU – erst machen
  jane: {
    live: [
      'Steckbrief zeigen, nichts dazu sagen.',
      'Reihum, je ein Satz: „Was bietet ihr Jane an?“',
      'Dann reihum: „Was müsstet ihr dafür noch wissen?“',
      'Falle: die Antwort „Kontext“ vorwegnehmen.',
    ],
    uebung: { dauer: '2 min', form: 'zu dritt, reihum laut, zwei Runden' },
    ablauf: {
      schritte: [
        'Folie zeigen: Jane Moviegoer, wie ein Kinobetreiber sie üblicherweise beschreibt.',
        'Runde 1 reihum: ein Angebot für Jane in einem Satz.',
        'Runde 2 reihum: eine Sache, die ihr wissen müsstet, um zu sagen, ob das Angebot trifft.',
      ],
      achten: [
        'Die Angebote dürfen naheliegend sein (größere Leinwand, Snacks, Online-Tickets) – genau so beginnt der Kinobetreiber im Buch.',
        'Fällt „mit wem geht sie?“ oder „warum geht sie?“: festhalten, das ist die nächste Folie.',
      ],
      aufloesung: 'Nächste Folie: Dieselbe Jane hat je nach Anlass andere Jobs, Pains und Gains – der Steckbrief sagt davon nichts.',
    },
    kern: [
      {
        text: 'Der Besitzer einer Kinokette will neue Wertversprechen entwerfen. Er könnte bei den Merkmalen beginnen – neueste Leinwände, Bildtechnik, Snacks, Events –, aber: „those only really matter if customers care about them“.',
        quelle: `${VPD}, S. 127`,
      },
      {
        text: 'Der übliche Weg: psychodemografische Profile. Jane Moviegoer: 20–30 Jahre, obere Mittelschicht, 100.000 $ im Jahr, verheiratet, zwei Kinder; mag Actionfilme, Popcorn und Limo, steht nicht gern an („Does not like waiting in line“), kauft Tickets online, geht einmal im Monat.',
        quelle: `${VPD}, S. 128–129`,
      },
    ],
    ueberleitung: 'Der Kinobetreiber im Buch hat genau diese Frage gestellt: Wann geht Jane ins Kino, und mit wem?',
  },

  // NEU – Auflösung
  kontext: {
    live: [
      'Aufdecken: Mittwochnachmittag mit Kindern, Samstagabend zu zweit.',
      'Bei Bedarf: dritter Anlass im Buch – allein zur Recherche.',
      'Mit den Fragen vergleichen, die alle eben genannt haben.',
      '„Dieselbe Person, andere Jobs – je nach Anlass.“',
      'Brücke Kaffeebar: werktags 7:15–7:45 ist ein Anlass, kein Steckbrief.',
      'Fragen: In welchem Anlass steckt euer Segment?',
    ],
    verstaendnis: {
      frage: 'Was sagt der Steckbrief über Jane – und was das Profil mit Kontext?',
      antwort: 'Der Steckbrief sagt, wer sie ist (Alter, Einkommen, Vorlieben). Das Profil sagt, was sie in einer bestimmten Situation erledigen will, was sie stört und was sie sich wünscht – und nur daran lässt sich ein Angebot messen (S. 128, 130).',
      falsch: '„Der Steckbrief ist falsch“ – das Buch ergänzt ihn, es ersetzt ihn nicht (S. 127–128).',
    },
    kern: [
      {
        text: '„Priorities change depending on a customer’s context.“ Je nach Kontext werden manche Jobs wichtiger, andere unwichtiger; ein Restaurant wird mittags nach anderen Kriterien beurteilt als abends.',
        quelle: `${VPD}, S. 130`,
      },
      {
        text: 'Drei Kontexte derselben Kinogängerin: Kindernachmittag (Mittwochnachmittag, mit Kindern und vielleicht deren Freund*innen, nach der Schule und vor dem Abendessen), Date Night (Samstagabend, mit Partner*in, Kinder betreut), eigene Recherche (jederzeit, allein, muss mitschreiben können). „Add contextual elements to your customer profiles if necessary.“',
        quelle: `${VPD}, S. 131–133`,
      },
      {
        text: 'Aus den Abbildungen gelesen – Kindernachmittag: Job „occupy kids“, Pain „noise in the room“, Gain „kids are happy and calm“. Date Night: Job „connect with each other“, Pains „waiting in line“ und „not intimate enough“, Gain „leads to great conversation“.',
        quelle: `${VPD}, Abbildungen S. 131 und 132 (Haftnotizen, nicht im Fließtext)`,
      },
      {
        text: '„A (potential) customer exists independently of your value proposition.“ Das Profil breit halten, nicht nur, was zum eigenen Angebot passt. Und: „Very different value propositions may address similar jobs, pains, and gains.“ – das Kino konkurriert auch mit dem Film zu Hause, dem Abendessen, dem Spa.',
        quelle: `${VPD}, S. 128 und S. 134`,
      },
    ],
    fragen: [
      {
        frage: 'Ist ein Kontext dasselbe wie ein Segment?',
        antwort: 'Nein. Das Segment sagt, wessen Profil es ist; der Kontext, in welcher Situation. Das Buch empfiehlt, Kontext bei Bedarf dazuzuschreiben, weil er das Angebot später einschränkt (S. 131). Bei der Kaffeebar steht beides in einer Zeile: Pendler*innen, werktags 7:15–7:45.',
      },
    ],
    ueberleitung: 'Was ins Profil kommt, kennt ihr schon. Wer erklärt es?',
  },

  profil: {
    live: [
      'Vorwissen nutzen: reihum je ein Feld erklären lassen.',
      'Nur ergänzen: soziale und emotionale Jobs, unterstützende Jobs.',
      '„Jobs in den Worten der Kundschaft – eure Zitate liefern sie.“',
      'Zeit: höchstens anderthalb Minuten.',
    ],
    verstaendnis: {
      frage: 'Ist „in der Kassenschlange stehen“ ein Job oder ein Pain?',
      antwort: 'Im Buch ein unterstützender Job in der Rolle der Käufer*in („standing in a checkout line“, S. 55). Ein Pain wird daraus erst mit einem Maß: „mehr als x Minuten in der Schlange“ (S. 58).',
      falsch: '„Ein Pain, Anstehen nervt ja“ – ohne Maß ist es nur die Tätigkeit.',
    },
    kern: [
      {
        text: 'Jobs: was Kund*innen in Arbeit und Leben erledigen wollen, in ihren eigenen Worten. Funktional, sozial (wie man vor anderen dasteht), persönlich/emotional (wie man sich fühlen will); dazu unterstützende Jobs als Käufer*in, Mitgestalter*in, Weitergeber*in.',
        quelle: `${VPD}, S. 52, 54–55`,
      },
      {
        text: 'Pains: unerwünschte Ergebnisse, Hindernisse, Risiken. Gains: erforderlich, erwartet, gewünscht, unerwartet.',
        quelle: `${VPD}, S. 57 und S. 61–62`,
      },
    ],
    ueberleitung: 'Der häufigste Fehler dabei: zu vage – und Gains als umgedrehte Pains.',
  },

  // NEU
  konkret: {
    live: [
      'Fragen: Ab wie vielen Minuten ist Warten für euch Zeitverschwendung?',
      'Aufdecken: „mehr als x Minuten“ statt „Zeitverschwendung“.',
      'Gehalt: Erhöhung und Kürzung sind nur Spiegelbilder.',
      'Besser: Hindernis und Risiko als Pains.',
      'Kaffeebar: „voll“ (I5-2) und „mehr als fünf Leute“ (I3-4) – zwei Interviews.',
    ],
    verstaendnis: {
      frage: 'Gain „schneller Kaffee“, Pain „langsamer Kaffee“ – was fehlt?',
      antwort: 'Beides ist dieselbe Aussage, einmal umgedreht, und ohne Maß. Besser: ein Pain, der ein Hindernis oder Risiko benennt, und ein Maß, an dem die Kundschaft selbst misst (S. 58, 80).',
    },
    kern: [
      {
        text: 'Pains konkret machen: Sagt jemand, das Anstehen sei Zeitverschwendung, fragt nach, ab wie vielen Minuten – und notiert „wasting more than x minutes standing in line“. Wer weiß, woran die Kundschaft misst, entwirft bessere Pain Relievers.',
        quelle: `${VPD}, S. 58`,
      },
      {
        text: 'Pains gegen Gains: Zum Job „mehr Geld verdienen“ schreibt man anfangs „Gehaltserhöhung“ in Gains und „Gehaltskürzung“ in Pains. Besser: herausfinden, wie viel mehr sich wie ein Gain anfühlt; als Pain das Hindernis („my employer doesn’t give raises“) und das Risiko (sich die Studiengebühren des Kindes vielleicht nicht leisten können).',
        quelle: `${VPD}, S. 80`,
      },
      {
        text: '„Ask “why” several times until you really understand your customers’ jobs to be done.“ Beispiel: Warum eine Fremdsprache lernen? „Maybe because the “real” customer job to be done is to improve his CV.“ Und warum das? Um mehr zu verdienen.',
        quelle: `${VPD}, S. 80`,
      },
      {
        text: 'Kaffeebar: „Wenn es voll ist, lass ich es.“ (I5-2) und „Bei mehr als fünf Leuten lass ich es.“ (I3-4) sind zwei Personen. Das Maß für P2 („mehr als fünf Leute“) kommt aus I3-4, nicht aus einer präzisierten Aussage von I5.',
        quelle: 'Werkstatt, Beispiel Kaffeebar, Interviews I3 und I5; kundenprofil.astro, Folie beispiel',
      },
    ],
    fragen: [
      {
        frage: 'In unseren Interviews hat niemand eine Zahl genannt. Was dann?',
        antwort: 'Dann schreibt ihr den Pain so konkret, wie das Zitat es hergibt, und notiert die fehlende Zahl als Frage fürs nächste Interview. Keine Zahl erfinden.',
      },
    ],
    ueberleitung: 'Nicht alles im Profil ist gleich wichtig.',
  },

  rangfolge: {
    live: [
      'Abbildung: wichtigste Zettel oben.',
      'Jede Spalte für sich: Wichtigkeit, Schwere, Relevanz.',
      '„Ihr dürft mit eurer Einschätzung anfangen – die Interviews prüfen sie.“',
    ],
    kern: [
      {
        text: 'Jobs nach Wichtigkeit, Pains danach, wie extrem sie für die Kundschaft sind, Gains danach, wie unverzichtbar. In jeder Spalte das Wichtigste oben.',
        quelle: `${VPD}, S. 67–70, 76`,
      },
      {
        text: '„It doesn’t matter if you start out with a ranking that is based on what you think is important to your potential customers as long as you strive to test that ranking“ – bis sie die Sicht der Kundschaft wiedergibt.',
        quelle: `${VPD}, S. 67`,
      },
    ],
    ueberleitung: 'So sieht das bei der Kaffeebar aus.',
  },

  beispiel: {
    live: [
      'Fragen: Wo steht die Ziel-Chance vom Vormittag im Profil?',
      'Aufdecken: P1, mit denselben Zitat-IDs.',
      'Zeigen: P2 konkret – „mehr als fünf Leute“.',
      'Zeigen: G2 hat ein eigenes Zitat, kein umgedrehter Pain.',
      'Fragen: Warum ist J1 ein Job und kein Ergebnis?',
    ],
    verstaendnis: {
      frage: 'Warum ist „rechtzeitig mit Kaffee im Zug sitzen“ kein Job?',
      antwort: 'Es beschreibt ein Ergebnis. Der Job ist die Aufgabe („auf dem Weg zum Zug Kaffee besorgen“); Ergebnisse stehen bei den Gains. „Mixing jobs and outcomes“ ist einer der sechs Fehler (S. 78).',
    },
    kern: [
      {
        text: 'Kaffeebar: ein Segment (Pendler*innen, werktags 7:15–7:45). P1 ist die Ziel-Chance, P2 bis P4 die anderen Chancen aus dem Baum, konkreter gefasst; die Gains sind neu aus den Snapshots. J1 funktional, J2 emotional, J3 sozial.',
        quelle: 'kundenprofil.astro, Folie beispiel',
      },
      {
        text: 'Ein Ausschnitt: „A good customer profile is full of sticky notes“.',
        quelle: `${VPD}, S. 79`,
      },
    ],
    ueberleitung: 'Jetzt euer Profil – aus eurem Baum.',
  },

  vorgehen: {
    live: [
      'Zuerst oben im Canvas: Segment und Anlass, eine Zeile.',
      'Timer 7 min: Ziel-Chance und Ast als Pains, mit Zitat-IDs.',
      'Nach 7 min: Gains aus den Snapshots, ein sozialer oder emotionaler Job.',
      'Nach 14 min: alles auf die Skalen, ordnen, dann die Fehlerliste.',
      'Falle: an eine Lösung denken – Ideen gibt es noch keine.',
      'Wenn hinten: Ordnen auf die obersten drei je Spalte beschränken.',
    ],
    uebung: { dauer: '18 min (7 + 7 + 4)', form: 'allein, jede*r für das eigene Produkt' },
    miro: {
      frame: 'T3 · 4 · Canvas · Sofie',
      schritte: [
        'Jede*r arbeitet im eigenen Canvas-Frame „T3 · 4 · Canvas · Name“, rechte Hälfte (Links auf der Folie; der Link oben führt zu Sofie, Joachim und Hewen liegen darunter).',
        'Gelbe Chancen aus dem eigenen Baum duplizieren (Cmd+D) und als Pains in den Kreis legen; Zitat-IDs bleiben dran.',
        'Dann alle Stickies auf die drei Skalen rechts unten schieben, je Spalte das Wichtigste oben (VPD S. 76), dann nummerieren (J1 …, P1 …, G1 …); Segment und Anlass als Überschrift.',
      ],
    },
    ablauf: {
      schritte: [
        'Übernehmen (7 min): zuerst oben in den Canvas eine Zeile mit Segment und Anlass (wie bei der Kaffeebar), dann die Ziel-Chance als P1, ihr Ast als weitere Pains, mit Zitat-IDs; Jobs aus Tag 1.',
        'Ergänzen (7 min): Gains aus den Snapshots, so konkret wie die Zitate; mindestens ein sozialer oder emotionaler Job.',
        'Ordnen und prüfen (4 min): alle Stickies auf die Skalen, jede Spalte für sich, Wichtigstes oben; dann die sechs Fehler durchgehen.',
      ],
      achten: [
        'Ein Segment, ein Anlass – wer zwei hat, wählt das Segment der Ziel-Chance.',
        'Keine erfundene Kundin, keine Persona: Das Segment sind die Interviewten aus dem Produkt-Brief (VPD S. 72 „Select customer segment“).',
        'Kein Eintrag ohne Zitat-ID; was vermutet ist, bekommt ein „?“.',
        'Kein Eintrag beschreibt das eigene Produkt: „proceed like an anthropologist and “forget” what you are offering“ (S. 79).',
      ],
      fehler: [
        'Gains als umgedrehte Pains.',
        'Jobs, die Ergebnisse sind.',
        'Zahlen erfinden, um konkret zu wirken.',
      ],
    },
    ueberleitung: 'Vier Minuten ordnen – und dabei diese Liste daneben.',
  },

  fehler: {
    live: [
      'Nicht vortragen: Liste bleibt während des Ordnens stehen.',
      'Jede*r hakt still am eigenen Profil ab.',
      'Allein: welchen der sechs im eigenen Profil? Markus fragt nach.',
      '„Vergesst kurz euer Angebot – beschreibt die Menschen.“',
    ],
    kern: [
      {
        text: 'Sechs häufige Fehler: mehrere Segmente in einem Profil; Jobs und Ergebnisse vermischt; nur funktionale Jobs; Jobs, Pains und Gains mit dem eigenen Wertversprechen im Kopf; zu wenige Einträge; zu vage Pains und Gains.',
        quelle: `${VPD}, S. 78`,
      },
      {
        text: 'Gegenmittel aus den Best Practices: wie eine Anthropologin vorgehen und „forget“, was man anbietet – ein Verlag soll nicht nur Jobs rund um Bücher kartieren, weil Leser*innen auch Berater*innen, YouTube oder ein MBA zur Wahl haben.',
        quelle: `${VPD}, S. 79`,
      },
    ],
    ueberleitung: 'Das Profil steht. Nach der Mittagspause sucht ihr Ideen – und messt sie an diesem Profil.',
  },
};
