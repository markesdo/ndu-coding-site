import type { Notiz } from './typen';

// Begleiter-Notizen zu /innolab/methoden/experiment (Tag 4, 28.11.: 10:50–11:00 Claude Pro gemeinsam, 11:00–11:30
// Experiment-Karte mit 12 min Theorie und Beispiel, 18 min Übung). Jede Folie hat eine Notiz (begleiter-tag-4.test.ts).
// Die Origin Story steht seit 26.11. im Abschluss von Tag 4 (tag-4#abschluss), nicht mehr hier.
// Thomke: gedruckte Seiten aus quellen/thomke/text.txt (=====PAGE n=====); Torres: PDF-Seiten wie in
// quellen/torres/text.txt; Bland: gedruckte Seiten.
const THOMKE = 'Stefan H. Thomke, The Scientific Mindset';
const BLAND = 'David J. Bland & Alexander Osterwalder, Testing Business Ideas';
const TORRES = 'Teresa Torres, Continuous Discovery Habits';

export const NOTIZEN_EXPERIMENT: Record<string, Notiz> = {
  'annahmen-der-idee': {
    live: [
      'Zeit: 12 min Theorie und Beispiel bis zur Übung.',
      '„Ideen zu testen dauert Wochen – Annahmen gehen in Tagen.“',
      'Abbildung: Torres’ kleine Story Map, drei Beteiligte, Schritte über die Zeit.',
      'Fünf Arten: wünschenswert, bedienbar, machbar, wirtschaftlich, ethisch.',
    ],
    verstaendnis: {
      frage: 'Woher kommen die Annahmen, bevor ihr sie mappt?',
      antwort: 'Aus den Schritten, als gäbe es die Lösung schon: Wo ihr annehmt, dass jemand etwas tut, steckt eine Annahme. Dazu die Pre-Mortem-Frage und die wirtschaftliche Annahme aus dem Geschäftsmodell.',
      falsch: '„Aus der Value Map“ – dort stehen erste Kandidaten („?“), aber die Schritte decken die meisten auf.',
    },
    kern: [
      {
        text: '„Start by assuming the solution already exists.“ – „From a simple 5-step story map, we generated 20 assumptions.“',
        quelle: `${TORRES}, S. 119, 124`,
      },
      {
        text: 'Viability assumptions: „Should we build it?“ – eine der Arten neben Wünschbarkeit, Bedienbarkeit, Machbarkeit und Ethik.',
        quelle: `${TORRES}, S. 118`,
      },
      {
        text: 'Formulierung: „always phrase your assumptions such that you need them to be true: ‚Customers will remember their passwords.‘“',
        quelle: `${TORRES}, S. 131`,
      },
    ],
    ueberleitung: 'Torres macht das für drei Ideen – wir für eine. Warum?',
  },

  spitzenreiter: {
    live: [
      'Torres testet alle drei Ideen parallel – wir den Spitzenreiter.',
      'Kursregel: Abweichung von Torres, weil drei Personen, eine Idee für heute.',
      'Gemeinsame Annahmen zuerst: Scheitern sie, fallen alle drei.',
      'Unter die Karte: je eine Zeile für die anderen Ideen.',
    ],
    kern: [
      {
        text: '„You’ll want to story map, generate assumptions, and assumption map for each of your three ideas.“ – „If we test only one idea at a time, confirmation bias will rear its ugly head.“ – „we are looking for a clear front runner.“',
        quelle: `${TORRES}, S. 130, 134`,
      },
      {
        text: '„It’s common for ideas to share assumptions. It’s one of the reasons why assumption testing is faster than idea testing.“',
        quelle: `${TORRES}, S. 136`,
      },
    ],
    ueberleitung: 'Mit welcher Annahme fangt ihr an? Das zeigt die Map.',
  },

  map: {
    live: [
      'Die Map kennt ihr von Tag 1 – jetzt für die Idee.',
      'Höchstens zehn Minuten: relativ zueinander, nicht genau.',
      'Oben rechts: zwei, drei Annahmen, auf die ihr alles setzt.',
      'Reihenfolge nach Bland: erst wünschenswert, dann machbar, dann wirtschaftlich.',
    ],
    miro: { frame: 'T4 · 0 · Annahmen der Idee', schritte: ['Annahmen der Idee auf die Map: Beleg nach rechts, Wichtigkeit nach oben.'] },
    kern: [
      {
        text: '„this exercise does not need to be precise. You are mapping assumptions relative to each other.“ Getestet werden die Annahmen oben rechts – „the assumptions that Bland calls your ‚leap of faith‘ assumptions“.',
        quelle: `${TORRES}, S. 130`,
      },
      {
        text: 'Wichtig heißt: Ist die Hypothese falsch, „your business idea will fail and all other hypotheses become irrelevant.“',
        quelle: `${BLAND}, S. 38`,
      },
    ],
    ueberleitung: 'Bevor ihr eine Karte schreibt: ein Fall, in dem eine Studie fast eine gute Idee getötet hätte.',
  },
  'sagen-tun': {
    live: [
      'Nur die drei Fakten vorlesen, die Studie nicht bewerten.',
      'Timer 1 min, dann je ein Satz laut, nicht diskutieren.',
      'Falle: die Pointe andeuten („Menschen sagen ja oft …“).',
      'Rückfragen zu Intuit nur sachlich: Lohnabrechnung für kleine Firmen.',
    ],
    uebung: { dauer: '1 min', form: 'allein, dann je ein Satz laut' },
    ueberleitung: 'Jetzt seht ihr, was Intuit getan hat – vergleicht mit euren Sätzen.',
    ablauf: {
      schritte: [
        'Folie zeigen, die drei Punkte vorlesen.',
        'Timer 1 min: Jede*r schreibt einen Satz – was folgt aus „0 von 20“, und was tut ihr als Nächstes?',
        'Sätze laut sagen lassen, nicht kommentieren; dann zur nächsten Folie.',
      ],
      achten: [
        'Die Pointe nicht vorwegnehmen: kein „aber Menschen sagen ja oft …“ vor der Auflösung.',
        'Wer „trotzdem testen“ schreibt: nachfragen, mit welchem Test – fragen oder beobachten?',
      ],
      fehler: [
        '„Idee verwerfen“ ist kein Fehler der Studierenden, sondern genau der Schluss, den die nächste Folie herausfordert – nicht belächeln.',
      ],
    },
  },

  'sagen-tun-aufloesung': {
    live: [
      'Auflösung per Knopf – öffnet bei allen.',
      '„In der Studie wollte es keine*r – auf der Webseite klickten 58 %.“',
      'Fragen: Wer von euch hätte die Idee abgelegt?',
      'Brücke: Intuits Knopf ist ein Test wie E1 der Kaffeebar.',
    ],
    verstaendnis: {
      frage: 'Warum lag die Usability-Studie daneben und der Knopf auf der Webseite nicht?',
      antwort: 'In der Studie sagten Menschen, was sie vorziehen würden; am Knopf taten sie es, in ihrer echten Lage vor dem Zahltag. Thomke: Verhalten zu testen war nützlicher, als dem zu trauen, was sie sagen.',
      falsch: '„Weil 20 Personen zu wenige sind“ – Thomke begründet es nicht mit der Zahl, sondern mit sagen gegen tun.',
    },
    ueberleitung: 'Darum misst eure Karte eine Handlung, keine Meinung – so sieht sie aus.',
    ablauf: {
      schritte: [
        'Auflösung per Knopf auf dem Beamer öffnen (öffnet bei allen; sonst erst 17:30, Ende des Kurstags).',
        'Gesagt gegen getan zeigen, dann Gebaut und Philips aufdecken.',
        'Die eigenen Sätze mit der Auflösung vergleichen lassen: Wer hätte die Idee abgelegt, wer hätte wie getestet?',
      ],
      aufloesung: 'Gesagt: 0 von 20 interessiert (Usability-Studie). Getan: 58 % der neuen Nutzer*innen klicken „Pay employees first“, obwohl es die Funktion noch nicht gibt. Gebaut: Conversion +14 %, Millionen Zusatzumsatz. Philips: Fokusgruppe wählt Gelb, als Dank nehmen die meisten Schwarz.',
    },
    kern: [
      {
        text: 'Intuit: Ein Entwickler sah, dass etwa 50 % der Interessierten das Produkt für kleine Firmen 20 Minuten vor dem Zahltag ausprobierten; alle Anbieter brauchten Stunden bis Tage, um neue Kundschaft freizuschalten. Usability-Studie: „none of the twenty participants was interested in a fast payroll solution.“ Statt die Idee abzulegen, änderte Intuit die Webseite binnen 24 Stunden: „Pay employees first“ oder „Do set-up first“; wer den ersten Knopf klickte, las, die Funktion sei noch nicht fertig. „58 percent of new users picked ‚Pay employees first.‘“ Gebaut hob sie die Conversion um 14 % und brachte Millionen Zusatzumsatz.',
        quelle: `${THOMKE}, S. 72`,
      },
      {
        text: '„The team also learned that testing customers’ actual behavior was more useful than trusting what they say they would prefer.“ Thomke nennt das die „saying-doing gap“. Philips: In einer Fokusgruppe wählten die meisten Jugendlichen Gelb für einen Ghettoblaster; als Dank bekamen sie einen echten, in Gelb oder Schwarz – die meisten nahmen Schwarz.',
        quelle: `${THOMKE}, S. 72`,
      },
      {
        text: 'Solche Tests nennt Thomke informell: Prototyp-Versuche „may not follow strict protocols but are still useful as qualitative evidence. (The results of such experiments can become hypotheses that are tested more rigorously.)“',
        quelle: `${THOMKE}, S. 84`,
      },
      {
        text: 'Bland ordnet dasselbe als Achse der Belegstärke: „What people say in an interview or survey is not necessarily what they do in real life or will do in the future.“ Die Tabelle steht auf der Annahmen-Map von Tag 1.',
        quelle: `${BLAND}, S. 52`,
      },
    ],
    fragen: [
      {
        frage: 'Ist ein Knopf ohne Funktion nicht Täuschung?',
        antwort: 'Die Seite sagt es sofort: Bei Intuit kam die Meldung, die Funktion sei noch nicht fertig; bei E1 steht „Bestellen geht noch nicht“ auf der Seite, und wer einträgt, erfährt, wann es losgeht. Thomke zitiert die Regel von LinkedIn: keine Tests, die absichtlich eine schlechte Erfahrung liefern, Stimmungen verändern sollen oder Einstellungen übergehen (S. 133).',
      },
      {
        frage: 'Waren 20 Personen in der Studie nicht einfach zu wenig?',
        antwort: 'Thomke begründet den Unterschied nicht mit der Zahl, sondern damit, dass die Studie fragte und der Knopf beobachtete (S. 72).',
      },
    ],
  },

  karte: {
    live: [
      'Test Card zeigen: vier Zeilen von oben nach unten.',
      '„Wir messen eine Handlung, keine Meinung.“',
      'Schwelle als x von y: „16 of the 20 parents“, nicht 70 %.',
      'Falle: Schwelle erst nach dem Test festlegen.',
    ],
    verstaendnis: {
      frage: 'Warum „mindestens 3 von 10“ statt „30 %“?',
      antwort: 'Weil die Karte so festlegt, mit wie vielen Menschen ihr testet und wie viele das Verhalten zeigen müssen (Torres S. 136). Ein Prozentsatz verschweigt die Zahl der Getesteten.',
    },
    kern: [
      {
        text: 'Vier Teile: Hypothese, Test, Messgröße, Kriterium; Beispiel auf der Karte: „16 of the 20 parents“.',
        quelle: `${BLAND}, S. 44–46`,
      },
      {
        text: '„Instead of saying, ‚Some people choose sports,‘ we want to say, ‚At least 3 out of 10 people choose sports.‘ We want to define both how many people we’ll test with and how many people need to exhibit the behavior“.',
        quelle: `${TORRES}, S. 136`,
      },
    ],
    ueberleitung: 'Und was tut ihr, wenn die Zahl kommt? Das legt ihr auch vorher fest.',
  },

  'vorher-entscheiden': {
    live: [
      'Erst Folien-Satz vorlesen, dann die drei Bänder einzeln aufdecken.',
      '„Schreibt neben die Schwelle, was ihr bei jedem Ergebnis tut – bevor ihr zählt.“',
      'Kohl’s erzählen: Führung begeistert, Test zeigt Verlust, trotzdem gestoppt.',
      'Falle: „knapp darunter“ erst nach dem Test festlegen.',
    ],
    verstaendnis: {
      frage: 'E1 der Kaffeebar ergibt 8 von 30, die Schwelle war 10. Wer entscheidet jetzt, was passiert?',
      antwort: 'Die Karte: Die Zeile „Wir entscheiden vorher“ sagt für 5–9 schon, was folgt: wiederholen. Niemand muss nach dem Ergebnis neu verhandeln.',
      falsch: '„Wir schauen uns die Zahl an und überlegen dann“ – genau dann prüft man schlechte Ergebnisse so lange, bis sie passen (Thomke S. 14).',
    },
    ueberleitung: 'Und wenn ihr trotzdem anders entscheiden wollt? Das geht – aber offen.',
    kern: [
      {
        text: 'Erste von vier Regeln: „(1) commit to abide by results; (2) ensure proposed experiments are feasible; (3) make test results trustworthy; and (4) keep things simple.“',
        quelle: `${THOMKE}, S. 85`,
      },
      {
        text: '„Before conducting any test, stakeholders must agree on how they’ll proceed once the results are in. … they must be willing to walk away from a project if a hypothesis is not supported. One way to encourage this discipline is to prepare a decision matrix that links possible outcomes to predetermined actions before any data comes in.“ Dasselbe in den Tipps am Ende von Kap. 4 („Define specific changes you will make based on the results“, S. 103) und Kap. 5 (S. 116).',
        quelle: `${THOMKE}, S. 86`,
      },
      {
        text: 'Kohl’s: Viele in der Führung waren begeistert von Möbeln im Sortiment und erwarteten viel Zusatzumsatz. Test in 70 Läden über sechs Monate: Umsatz insgesamt gesunken, weil die übrigen Waren weniger Fläche hatten; Kohl’s verlor sogar Kundschaft. „the initiative was nevertheless scrapped.“',
        quelle: `${THOMKE}, S. 86–87`,
      },
      {
        text: 'Warum vorher: „we tend to happily accept ‚good‘ results that confirm our beliefs because they feel right. But we challenge and thoroughly investigate ‚bad‘ results that go against our assumptions.“ Beispiel: Ein Nutzer hielt ein Testwerkzeug für fehlerhaft, weil sein Ergebnis seiner Annahme widersprach – „fix the software and repeat the test until it agreed with his experience!“',
        quelle: `${THOMKE}, S. 14`,
      },
      {
        text: 'Die drei Bänder sind eine Form des Kurses. Die Befunde und was jeweils folgt, kommen von Bland: gestützt → nächste Hypothese oder derselbe Test stärker; widerlegt → verwerfen oder umschwenken; unklar → weiter testen.',
        quelle: `${BLAND}, S. 63`,
      },
    ],
    fragen: [
      {
        frage: 'Ist das nicht dasselbe wie die Schwelle?',
        antwort: 'Die Schwelle sagt, wann ihr recht habt. Die Zeile daneben sagt, was ihr dann tut – auch wenn ihr nicht recht habt. Thomke verlangt beides vor den Daten (S. 86).',
      },
      {
        frage: 'Woher wissen wir, wo „knapp darunter“ endet?',
        antwort: 'Ihr legt es fest, wie die Schwelle: eine Zahl, vor dem Test. Bei der Kaffeebar ist es 5 von 30 – eine Setzung, keine Regel aus dem Buch.',
      },
    ],
  },

  'gegen-den-beleg': {
    live: [
      'Netflix in drei Schritten erzählen, Fluss links nach rechts.',
      '„Ihr dürft gegen einen Beleg entscheiden – aber nicht so tun, als gäbe es ihn nicht.“',
      'Auf der Lernkarte: der Beleg dagegen und das Warum.',
      'Abgrenzung: dagegen entscheiden ja, Ergebnis umdeuten nein.',
    ],
    verstaendnis: {
      frage: 'Was hat Netflix gewonnen, obwohl die Entscheidung gegen die Daten ging?',
      antwort: 'Transparenz: Weil der Test da war, konnte niemand behaupten, Fonda bleibe im Bild, weil die Kundschaft es wolle. Der Grund war offen ein anderer – der Vertrag und die Beziehung zu Fonda.',
      falsch: '„Nichts, der Test war umsonst“ – ohne ihn hätte man die Entscheidung mit erfundenen Kundenwünschen begründen können.',
    },
    ueberleitung: 'Welcher Test liefert euch so einen Beleg? Dazu jetzt.',
    kern: [
      {
        text: 'Netflix: Tests zeigten, dass eine Werbung nur mit Lily Tomlin („Grace and Frankie“) mehr Klicks brachte als Werbung mit Tomlin und Jane Fonda. Das Content-Team fürchtete, Fonda vor den Kopf zu stoßen und womöglich ihren Vertrag zu verletzen. Nach heftigen Debatten – Belege gegen „strategic considerations“ – nahm Netflix Bilder mit beiden, „even though customer data didn’t support the decision. However, the experimental evidence made the decision more transparent. Nobody could argue that Fonda should remain in the promotion because customers preferred it.“',
        quelle: `${THOMKE}, S. 127`,
      },
      {
        text: '„Of course, there might be good reasons for rolling out an initiative even when the anticipated benefits are not supported by the data.“ Aber: Steht eine Initiative schon fest, soll man sie nicht Experiment nennen, sondern „a rollout, commitment, or implementation“; Lackmustest ist, ob sie sich leicht umkehren lässt.',
        quelle: `${THOMKE}, S. 87`,
      },
      {
        text: 'Thomke rahmt das als Ausnahme von „Data Overrides Opinions“: Die Ergebnisse sollen sich gegen starke Meinungen durchsetzen, „no matter whose opinions they are“; „Nothing stalls experiments faster than a so-called HiPPO—highest-paid person’s opinion.“',
        quelle: `${THOMKE}, S. 126`,
      },
    ],
    fragen: [
      {
        frage: 'Wann ist es legitim, gegen den Beleg zu entscheiden?',
        antwort: 'Wenn es einen Grund gibt, den der Test nicht misst – bei Netflix Vertrag und Beziehung, bei Thomkes Beispiel S. 87 Kundentreue statt Umsatz. Der Grund steht auf der Lernkarte, der Beleg bleibt sichtbar.',
      },
      {
        frage: 'Muss so eine Zeile anders aussehen als die anderen?',
        antwort: 'Nein, dieselben vier Spalten: Entscheidung, Grund, Beleg. Nur steht beim Beleg einer, der dagegen spricht, und der Grund erklärt, warum ihr trotzdem so entscheidet.',
      },
    ],
  },

  'welcher-test': {
    live: [
      'Blands vier Faustregeln, eine pro Klick.',
      '„Ein Test simuliert einen Moment – und ihr schaut, was Menschen tun.“',
      'Tabelle im Handout: Landing Page, Klick-Prototyp, Concierge, Wizard of Oz, Mock Sale.',
      'Fragen: Welcher davon passt zu eurer obersten Annahme?',
    ],
    kern: [
      {
        text: '„Go cheap and fast at the beginning.“ – „Increase the strength of evidence with multiple experiments for the same hypothesis.“ – „Always pick the experiment that produces the strongest evidence given your constraints.“ – „Reduce uncertainty as much as you can before you build anything.“',
        quelle: `${BLAND}, S. 93`,
      },
      {
        text: '„A strong assumption test simulates an experience, giving your participant the opportunity to behave either in accordance with your assumption or not.“',
        quelle: `${TORRES}, S. 135`,
      },
      {
        text: '„With assumption testing, most of our learning comes from failed tests.“',
        quelle: `${TORRES}, S. 138`,
      },
    ],
    ueberleitung: 'Alles zusammen an der Kaffeebar: Schritte, Annahmen, Map.',
  },

  beispiel: {
    live: [
      'Fünf Schritte, als gäbe es „Im Gehen bestellen“ schon.',
      'A5 ohne Beleg – I2-3 spricht sogar dagegen.',
      'Oben rechts A5, A7, A4: zuerst A5, wünschenswert vor allem.',
      'A8 teilen alle drei Ideen – kommt trotzdem nach A5.',
    ],
    verstaendnis: {
      frage: 'Warum testet die Kaffeebar A5 vor A8, obwohl gemeinsame Annahmen zuerst kommen sollen?',
      antwort: 'A8 ist teils belegt (I2-2, I4-2, I2-5) und steht darum oben in der Mitte; A5 hat gar keinen Beleg. Eine bewusste Ausnahme von der Regel.',
    },
    kern: [
      {
        text: 'Reihenfolge der Tests: zuerst Wünschbarkeit, dann Machbarkeit, dann Wirtschaftlichkeit – bestellt niemand, sind Datenschutz und Wirtschaftlichkeit egal.',
        quelle: `${BLAND}, S. 34–35`,
      },
      {
        text: 'Annahmen und Belege der Kaffeebar (A2–A8, I2-3 u. a.) stehen im Handout der Folie.',
        quelle: 'experiment.astro, Folie beispiel (Handout)',
      },
    ],
    ueberleitung: 'Für A5 die Karte E1.',
  },

  'karte-e1': {
    live: [
      'Neue Zeile zeigen: „Wir entscheiden vorher“, drei Bänder mit Zahlen.',
      '„Unter 5 schwenkt ihr um – das steht hier, bevor der erste Pendler vorbeikommt.“',
      'Bezug: unter 5 → Wartezeit-Anzeige aus der Zeile „Falls E1 scheitert“.',
    ],
    kern: [
      {
        text: 'Die Zeile verbindet jedes mögliche Ergebnis mit einer Handlung, bevor gezählt wird: „a decision matrix that links possible outcomes to predetermined actions before any data comes in.“ Ab 10 der Concierge (der stärkere Test aus dem Handout), 5–9 denselben Test wiederholen, unter 5 umschwenken auf die Wartezeit-Anzeige (A6). Die Grenze 5 ist eine Setzung der Kaffeebar.',
        quelle: `${THOMKE}, S. 86`,
      },
    ],
    fragen: [
      {
        frage: 'Und wenn an Tag 5 doch etwas anderes sinnvoll ist?',
        antwort: 'Dann entscheidet ihr offen dagegen: Auf der Lernkarte stehen der Beleg und der Grund (Folie „Gegen den Beleg entscheiden“). Die Zeile „Wir entscheiden vorher“ auf der Karte bleibt stehen.',
      },
    ],
  },

  'claude-pro-jetzt': {
    live: [
      'Timer 10 min starten, sobald alle die Folie sehen.',
      'Nach 5 min: Steht bei allen „Claude Pro“ im Startbild?',
      'Falle: Erstattung statt Kündigung – beendet Pro sofort.',
      'Wer hängt: 11:00 trotzdem Theorie, Hilfe vor 11:30.',
    ],
    uebung: { dauer: '10 min', form: 'alle zugleich, jede*r am eigenen Laptop' },
    ueberleitung: 'Claude Code läuft – jetzt die Annahmen eurer Idee.',
  },

  vorgehen: {
    live: [
      'Neu bei Schritt 4: Entscheidung vorab gehört auf jede Karte.',
      'Nach 13 min: Steht bei allen neben der Schwelle die Zeile?',
      'Nach 16 min: Annahme und E1 in den Baum – Timer 2 min.',
    ],
    kern: [
      {
        text: 'Prüfpunkt experiment-schwelle: Die Schwelle steht als „x von y“ fest, bevor der Test läuft – und mit ihr, was ihr bei welchem Ergebnis tut. Grundlage: Thomkes Entscheidungsmatrix vor den Daten.',
        quelle: `Kurs: methoden.ts, Prüfliste „experiment“; ${THOMKE}, S. 86`,
      },
    ],
    ueberleitung: 'Und wenn E1 gelaufen ist? Dann schreibt ihr die Lernkarte.',
  },

  lernkarte: {
    live: [
      'Learning Card zeigen: geglaubt, beobachtet, gelernt, darum.',
      'Erst der Beleg (gestützt, widerlegt, unklar, neu), dann die Handlung.',
      'Verlässlichkeit dazuschreiben: schwach, mittel oder stark – und warum.',
      'Wird an Tag 5 im Debrief vorgelesen.',
    ],
    verstaendnis: {
      frage: 'E1 ist widerlegt, ihr schwenkt auf die Wartezeit-Anzeige um. Was müsst ihr mit euren alten Belegen tun?',
      antwort: 'Prüfen, was weiter gilt und was neu zu testen ist: Ein Pivot macht frühere Belege oft irrelevant (Bland S. 61) – darum die Zeile „gilt weiter / neu zu testen“.',
    },
    kern: [
      {
        text: 'Entscheiden in zwei Schritten: Befund – „Evidence Supports Hypothesis“, „Evidence Refutes Hypothesis“, „Unclear Insight“ oder „New Insight“ (S. 63) –, dann Handlung: weitermachen, umschwenken oder verwerfen (S. 61).',
        quelle: `${BLAND}, S. 61, 63`,
      },
      {
        text: '„A pivot often means that some of your earlier evidence may be irrelevant to your new trajectory. It usually requires retesting elements of your business model that you’ve already tested.“',
        quelle: `${BLAND}, S. 61`,
      },
    ],
    ueberleitung: 'Zum Schluss: Wo steht euer Aufsteller?',
  },

  uebertrag: {
    live: [
      'Folien-Satz vorlesen: Wo kommt eure Zielgruppe ohnehin vorbei?',
      'Kein echter Ort: E1 als simulierter Moment, zehn Menschen, Bild am Handy.',
      'Schwelle für diese Form vorher neu schreiben, z. B. 4 von 10.',
    ],
    kern: [
      {
        text: '„A strong assumption test simulates an experience“; billige Formen für eine Woche sind u. a. ein simulierter Moment mit einem Mock-up.',
        quelle: `${TORRES}, S. 135, 142–144`,
      },
    ],
    ueberleitung: 'Weiter mit der Story Map: der Plan, nach Outcome geschnitten.',
  },
};
