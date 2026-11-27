import type { Notiz } from './typen';

// Begleiter-Notizen zu /innolab/methoden/geschaeftsmodell (Tag 4, 20-min-Block). Seit 26.11.2026 ohne Musterkarten-Runde:
// rund 8 min Theorie an fünf Folien (warum-jetzt bis annahme), dann 10 min Übung (vorgehen), 2 min Übertrag als Brücke zur
// Experiment-Karte (seit 26.11.2026 nachts direkt danach; der Claude-Pro-Block steht jetzt auf tag-5#claude-pro-jetzt). Zeiten in den Stichworten nur relativ: Der Tagesplan verschiebt
// sich noch, folienPlan verteilt die 10 min ohne Übung auf die sechs übrigen Folien (je knapp 2 min). Die Karten stehen nur noch zum Nachschlagen im Handout.
// Vorwissen: „bekannt“ aus dem Entrepreneur Lab (vorwissen.ts) – Theorie kurz, das Dreieck nur abgleichen.
// Seiten: VPD nach PDF, Cagan gedruckt, Gassmann (EPUB) nach Abschnitt.
const GASSMANN = 'Gassmann, Frankenberger, Csik, Geschäftsmodelle entwickeln (2. Aufl. 2017)';
const VPD = 'Osterwalder u. a., Value Proposition Design (2014)';
const CAGAN = 'Marty Cagan, Inspired (2. Aufl. 2018)';
const TORRES = 'Teresa Torres, Continuous Discovery Habits (2021)';
const BLAND = 'Bland & Osterwalder, Testing Business Ideas (2019)';

export const NOTIZEN_GESCHAEFTSMODELL: Record<string, Notiz> = {
  'warum-jetzt': {
    live: [
      'Zeit: rund 8 min Theorie, knapp 2 min je Folie.',
      'Bild von unten nach oben lesen: Papier, Markt, Bank.',
      '„Fit 1 habt ihr seit der Value Map heute Morgen auf Papier.“',
      '„Fit 3 erreicht ihr heute nicht. Ihr schreibt auf, woran er hängt.“',
    ],
    verstaendnis: {
      frage: 'Wann habt ihr Business Model Fit?',
      antwort: 'Wenn euer Wertversprechen mehr einbringt, als es kostet, es zu schaffen und zu liefern – mit Belegen aus dem Markt, nicht auf Papier.',
      falsch: '„Wenn wir ein Preismodell haben“ – ein Preis ist noch kein Beleg, dass der Ertrag die Kosten übersteigt.',
    },
    ueberleitung: 'Warum ausgerechnet jetzt, direkt vor der Experiment-Karte?',
    kern: [
      {
        text: 'Drei Stufen: „On Paper“ (Problem-Solution Fit), „In the Market“ (Product-Market Fit), „In the Bank“ (Business Model Fit). Zur ersten: „The fit you achieve is not yet proven and exists mainly on paper.“',
        quelle: `${VPD}, S. 117–118 (PDF)`,
      },
      {
        text: '„No value proposition–however great–can survive without a sound business model.“ „You don’t have business model fit until you can generate more revenues with your value proposition than you incur costs to create and deliver it“.',
        quelle: `${VPD}, S. 118 (PDF)`,
      },
      {
        text: '„The costs to produce, market and sell your product must be sufficiently less than the revenue your product generates.“',
        quelle: `${CAGAN}, S. 277`,
      },
    ],
  },

  'vor-experiment': {
    live: [
      'Fragen: Wer kennt Geschäftsmodelle aus dem Entrepreneur Lab?',
      'Grüne Kachel zeigen: dieselbe Map wie an Tag 1.',
      '„Funktioniert es für die Kundschaft – und auch für euch?“',
      'Falle: rechnen wollen. Ein Satz für die Map reicht.',
      'Getestet wird zuerst Wünschbarkeit: bei der Kaffeebar A5, nicht A4.',
    ],
    verstaendnis: {
      frage: 'Warum schreibt ihr die wirtschaftliche Annahme jetzt auf, wenn ihr sie doch nicht zuerst testet?',
      antwort: 'Damit sie auf der Map steht, wenn ihr die riskanteste wählt. Was nicht auf der Map steht, kann man nicht wählen – und viele Teams vergessen genau diese Art (Torres S. 128).',
      falsch: '„Weil das Geschäftsmodell als Erstes geklärt sein muss“ – Cagan nennt das in diesem Stadium „largely academic“; erst muss jemand das Produkt wollen.',
    },
    ueberleitung: 'Wie sieht ein Geschäftsmodell aus, wenn man es in vier Fragen fasst?',
    geschichte: {
      text: 'Wo wir im Tag stehen: Nach der Pause, ab 10:40, kommt das Geschäftsmodell. Um 11:00 folgt die Experiment-Karte: Annahmen der Idee, die Map, und dort wählt ihr die riskanteste. Die Map kennt ihr von Tag 1, mit Cagans vier Arten: wünschenswert, machbar, wirtschaftlich, bedienbar. Die meisten Teams haben einen blinden Fleck: „most teams have a bias toward one category or another.“ Ein Muster, das Torres nennt: „they always remember desirability and usability, but they forget viability.“ Darum schreibt ihr die wirtschaftliche Annahme jetzt auf – damit sie auf der Map steht, wenn ihr gleich wählt.',
      quelle: `Tagesplan tag-4.astro (10:40 Geschäftsmodell, 11:00 Experiment-Karte); ${CAGAN}, S. 24 (vier Risiken); ${TORRES}, S. 118, 128; „Darum jetzt“: Kursentscheidung`,
    },
    kern: [
      {
        text: '„Viability assumptions: Should we build it? There are many ideas that will work for our customers but won’t work for our business.“ Torres zählt fünf Arten, mit ethischen Annahmen; die Werkstatt arbeitet mit Cagans vier, „ethisch“ (Kann es schaden?) gibt es dort als Ergänzung.',
        quelle: `${TORRES}, S. 118`,
      },
      {
        text: '„most teams have a bias toward one category or another.“ … „Or they always remember desirability and usability, but they forget viability.“',
        quelle: `${TORRES}, S. 128`,
      },
      {
        text: '„while these are real risks, they are largely academic at this stage“; „you don’t need to spend your time doing pricing optimization testing, sales tools, marketing programs, and cutting costs, until and unless you have discovered a truly valuable product.“',
        quelle: `${CAGAN}, S. 189–190`,
      },
      {
        text: '„weniger Business-Plan, dafür mehr haptische Realisierung“.',
        quelle: `${GASSMANN}, I-2.5`,
      },
      {
        text: 'Vorsicht beim Erzählen: Torres sagt, die meisten Teams haben einen blinden Fleck – Wirtschaftlichkeit ist eines ihrer Beispiele, keine Statistik. Den blinden Fleck „most product teams“ nennt sie bei ethischen Annahmen.',
        quelle: `${TORRES}, S. 128`,
      },
    ],
    fragen: [
      {
        frage: 'Ist das nicht viel zu früh für ein Geschäftsmodell?',
        antwort: 'Zum Durchrechnen ja (Cagan S. 189–190). Heute geht es nur um den einen Satz, an dem das Modell hängt – damit er bei der Wahl der riskantesten Annahme nicht fehlt.',
      },
      {
        frage: 'Müssen wir einen Preis festlegen?',
        antwort: 'Nein. Ihr benennt das Modell und seine Annahme, ihr rechnet es nicht durch (Kursentscheidung). Cagan: Preis und Kosten sind echte Risiken, aber in diesem Stadium „largely academic“ (S. 189–190).',
      },
      {
        frage: 'Was, wenn bei uns niemand zahlt?',
        antwort: 'Dann steht bei Wert?, wer sonst zahlt oder zu welchem Ziel es beiträgt. Wer zahlt, muss nicht wer nutzt (Gassmann, Tabelle 2.2); Torres nennt Loss Leader (S. 118). Wirtschaftlich bleibt die Annahme trotzdem: „somewhere down the line, the idea must create enough value for the business to be worth the effort“ (S. 118).',
      },
      {
        frage: 'Warum testen wir sie nicht zuerst?',
        antwort: 'Bland testet in dieser Reihenfolge: erst Wünschbarkeit, dann Machbarkeit, dann Wirtschaftlichkeit (S. 34–35, 39). Bestellt bei der Kaffeebar niemand im Gehen (A5), ist A4 egal.',
      },
      {
        frage: 'Wie formulieren wir sie?',
        antwort: 'Als einen Satz „Wir glauben, dass …“, wie A4 der Kaffeebar: „Wir glauben, dass die zusätzlichen Bestellungen mehr einbringen, als Aufsteller, Bildschirm und Bestellseite kosten – ohne weitere Kraft am Morgen.“ Ertrag gegen Kosten, nicht bloß „mehr Umsatz“.',
      },
    ],
  },

  dreieck: {
    live: [
      'Kurz halten: aus dem Entrepreneur Lab bekannt, nur abgleichen.',
      'Wer? und Was? abhaken: Kundenprofil und Value Map.',
      '„Neu sind heute Wie? und Wert? – was ihr braucht, wer zahlt.“',
      'Kundschaft in der Mitte: keine Ecke ändert sich allein.',
    ],
    verstaendnis: {
      frage: 'Wo stehen bei euch Wer? und Was? schon?',
      antwort: 'Wer? im Kundenprofil, Was? in der Value Map – beide auf Miro (T3 · 4). Sie werden heute nur verwiesen, nicht neu geschrieben.',
    },
    ueberleitung: 'So sehen die zwei neuen Zeilen bei der Kaffeebar aus.',
    kern: [
      {
        text: 'Vier Dimensionen: Wer (Zielkunden), Was (Nutzenversprechen), Wie (Wertschöpfungskette), Wert (Ertragsmechanik: „Kostenstruktur und die Umsatzmechanismen“). Kundschaft im Zentrum – „immer und ohne Ausnahme“.',
        quelle: `${GASSMANN}, I-1.2`,
      },
      {
        text: 'Ziel jeder Geschäftsmodellinnovation: Wert schaffen und abschöpfen, „in den Worten eines uns bekannten CEOs: ‚Create value, capture value.‘“',
        quelle: `${GASSMANN}, I-1.2`,
      },
      {
        text: 'Partner stehen in der Checkliste für das neue Modell unter Wie? (Ressourcen, Aktivitäten & Fähigkeiten, Partner).',
        quelle: `${GASSMANN}, Tabelle 2.2 (I-2.4.1)`,
      },
      {
        text: 'Vorsicht beim Erzählen: „Über die Hälfte aller App-Entwickler verdient weniger als 1.000 US-Dollar im Monat“ stammt aus Gassmann (2017), ohne Quelle und Jahr – nicht als heutigen Stand erzählen.',
        quelle: `${GASSMANN}, I-2.2.2`,
      },
    ],
  },

  modell: {
    live: [
      'Graue Zeilen nur zeigen: stehen schon, nicht neu schreiben.',
      'Wie? aufdecken: alles, was es zum Liefern braucht.',
      'Wert? aufdecken: Ertrag und Kosten in einer Zeile.',
      'Fragen: Warum stehen die Kosten bei Wert?, nicht bei Wie?',
    ],
    verstaendnis: {
      frage: 'Warum stehen die Kosten bei Wert? und nicht bei Wie?',
      antwort: 'Weil Gassmann unter Wert? die Ertragsmechanik fasst: Kostenstruktur und Umsatzmechanismen; die Checkliste führt die Kostentreiber dort (Tabelle 2.2).',
      falsch: '„Weil die Kosten egal sind“ – sie sind gerade das, was gleich in die Annahme kommt.',
    },
    ueberleitung: 'Ob sich das trägt, wisst ihr nicht – daraus wird die Annahme.',
    kern: [
      {
        text: 'Kostentreiber: „Welches sind die wesentlichen Kosten in unserem Geschäftsmodell?“ Ertragsströme: „Wofür ist der Kunde bereit zu bezahlen? Wie bezahlen die Kunden momentan?“',
        quelle: `${GASSMANN}, Tabelle 2.2 (I-2.4.1)`,
      },
      {
        text: 'Bezahlt wird an der Ausgabe – wie in Slice 1 der Story Map („bar an der Ausgabe“). Kein Gebäck mehr: Das stand nur im Beispiel der gestrichenen Karten-Runde.',
        quelle: 'Kursbeispiel, story-map.astro',
      },
    ],
  },

  annahme: {
    live: [
      'Linie von links lesen; beim letzten Pfeil anhalten.',
      '„Mehr Kaffee im Zug ist noch kein Geschäft – was muss dazu stimmen?“',
      'A4 vorlesen, dann neu bewerten: wichtig hoch, Beleg noch keiner.',
      'Falle: „mehr Umsatz“ als Annahme – Ertrag über den Kosten.',
    ],
    verstaendnis: {
      frage: 'Warum reicht „Wir glauben, dass der Umsatz steigt“ nicht?',
      antwort: 'Mehr Umsatz kann mit mehr Kosten einhergehen. Prüfen wollt ihr, dass die zusätzlichen Bestellungen mehr einbringen, als sie kosten – das ist die wirtschaftliche Annahme.',
      falsch: '„Weil der Umsatz schon belegt ist“ – belegt ist nur der heutige Betrieb (A4 an Tag 1, Beleg „getan“).',
    },
    ueberleitung: 'Jetzt dasselbe für euer Produkt – zehn Minuten.',
    kern: [
      {
        text: '„Another way to generate assumptions, particularly viability assumptions, is to use your opportunity solution tree to work backwards from your solution back to your outcome.“ Satzanfang: „Addressing the target opportunity will drive the desired outcome because…“',
        quelle: `${TORRES}, S. 125`,
      },
      {
        text: '„we might also need to test the assumptions connecting our product outcome to our business outcome to uncover viability assumptions.“ Beispiel: „The cost of adding local channels will be offset by the gain from more renewals.“ Torres’ business outcome heißt im Kurs Impact.',
        quelle: `${TORRES}, S. 126`,
      },
      {
        text: 'Kursregel: A4 stand an Tag 1 als unwichtig mit Beleg „getan“ (heutiger Betrieb); mit den neuen Kosten wird sie neu bewertet – wichtig hoch, noch kein Beleg.',
        quelle: 'Kursbeispiel, Annahmen-Map der Kaffeebar',
      },
    ],
  },

  vorgehen: {
    live: [
      'Zeit: Übung 10 min, vier Timer: 4, 2, 2, 2.',
      'Timer 4 min: Wie? und Wert? auf Miro im eigenen Frame.',
      '1:1 ab Minute 2: Wer zahlt bei dir wofür?',
      'Nach 4 min: Linie, dann Annahme, je 2 min.',
      'Nach 8 min: Annahme in die Werkstatt, Art wirtschaftlich.',
    ],
    uebung: { dauer: '10 min (4 + 2 + 2 + 2)', form: 'allein am eigenen Produkt; Markus geht 1:1 von Person zu Person' },
    ueberleitung: 'Zum Schluss eine Frage, die ihr mitnehmt.',
    ablauf: {
      schritte: [
        'Schritt 1 (4 min): auf Miro in „T4 · 7 · Geschäftsmodell · Produkt n“; Wer? und Was? nur verweisen, Wie? und Wert? neu, Kosten als Posten.',
        'Schritt 2 (2 min): Linie „[Outcome] führt zu [Impact], weil …“ aus dem eigenen Problem-Rahmen.',
        'Schritt 3 (2 min): Annahme „Wir glauben, dass …“ – Ertrag über den Kosten.',
        'Schritt 4 (2 min): Annahme in die Annahmen-Map der Werkstatt, Art „wirtschaftlich“, Wichtigkeit, Beleg.',
      ],
      achten: [
        'Kosten als Posten, nicht als „gering“.',
        'Die Annahme stellt Ertrag gegen Kosten, nicht bloß „mehr Umsatz“.',
        'Niemand rechnet: ein Satz, keine Kalkulation.',
      ],
      fehler: [
        'Wer? und Was? werden neu formuliert statt verwiesen – dann driften sie von Kundenprofil und Value Map weg.',
      ],
    },
  },

  uebertrag: {
    live: [
      '„Wer zahlt bei euch – die Menschen, die es nutzen, oder jemand anderes?“',
      'Fragen: An welcher Zahl hängt euer Modell?',
      'Zahlt niemand: Wozu trägt es bei? Loss Leader ist erlaubt.',
      'Bei Bedarf: Musterkarten unten im Handout, keine Kurszeit.',
      'Zeit: Übertrag 2 min, dann gleich die Experiment-Karte.',
    ],
    verstaendnis: {
      frage: 'Muss jede Idee selbst Geld bringen?',
      antwort: 'Nein. Manche Ideen sind Loss Leader und tragen zu einem anderen Ziel bei (Torres S. 118) – dann steht bei Wert?, zu welchem.',
    },
    ueberleitung: 'Jetzt die Experiment-Karte: An welcher Annahme hängt euer Spitzenreiter?',
    kern: [
      {
        text: 'Checkliste Wer?: „Wer sind unsere Zielkunden?“, gleich danach „Für wen generieren wir (zusätzlichen) Wert?“',
        quelle: `${GASSMANN}, Tabelle 2.2 (I-2.4.1)`,
      },
      {
        text: '„some ideas are designed to be loss leaders and instead contribute to another business goal besides revenue.“',
        quelle: `${TORRES}, S. 118`,
      },
    ],
  },
};
