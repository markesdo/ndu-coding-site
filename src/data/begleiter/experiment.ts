import type { Notiz } from './typen';

// Begleiter-Notizen zu /innolab/methoden/experiment (Tag 4, 09:20–09:50; bis 12.11. für Tag 3 geplant) – vorerst nur die Folien aus Thomke und die,
// die sich dafür geändert haben. Der Begleiter zeigt bisher nur Tag 1; die Notizen stehen bereit, der Test prüft die ids.
// Thomke: gedruckte Seiten aus quellen/thomke/text.txt (=====PAGE n=====).
const THOMKE = 'Stefan H. Thomke, The Scientific Mindset';
const BLAND = 'David J. Bland & Alexander Osterwalder, Testing Business Ideas';

export const NOTIZEN_EXPERIMENT: Record<string, Notiz> = {
  'sagen-tun': {
    live: [
      'Nur die drei Fakten vorlesen, die Studie nicht bewerten.',
      'Timer 1 min, dann reihum je ein Satz, nicht diskutieren.',
      'Falle: die Pointe andeuten („Menschen sagen ja oft …“).',
      'Rückfragen zu Intuit nur sachlich: Lohnabrechnung für kleine Firmen.',
    ],
    uebung: { dauer: '1 min', form: 'allein, dann reihum je ein Satz' },
    ueberleitung: 'Jetzt seht ihr, was Intuit getan hat – vergleicht mit euren Sätzen.',
    ablauf: {
      schritte: [
        'Folie zeigen, die drei Punkte vorlesen.',
        'Timer 1 min: Jede*r schreibt einen Satz – was folgt aus „0 von 20“, und was tut ihr als Nächstes?',
        'Reihum vorlesen lassen, nicht kommentieren; dann zur nächsten Folie.',
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
      'Im Log: Beleg mit Stufe und ID, im Grund das Warum.',
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
        antwort: 'Wenn es einen Grund gibt, den der Test nicht misst – bei Netflix Vertrag und Beziehung, bei Thomkes Beispiel S. 87 Kundentreue statt Umsatz. Der Grund steht im Log, der Beleg bleibt sichtbar.',
      },
      {
        frage: 'Muss so eine Zeile anders aussehen als die anderen?',
        antwort: 'Nein, dieselben vier Spalten: Entscheidung, Grund, Beleg. Nur steht beim Beleg einer, der dagegen spricht, und der Grund erklärt, warum ihr trotzdem so entscheidet.',
      },
    ],
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
        antwort: 'Dann entscheidet ihr offen dagegen: neue Zeile im Entscheidungslog mit dem Beleg und dem Grund (Folie „Gegen den Beleg entscheiden“). Die Zeile auf der Karte bleibt stehen.',
      },
    ],
  },

  vorgehen: {
    live: [
      'Neu bei Schritt 4: Entscheidung vorab gehört auf jede Karte.',
      'Nach 15 min: Steht bei allen neben der Schwelle die Zeile?',
    ],
    kern: [
      {
        text: 'Prüfpunkt experiment-schwelle: Die Schwelle steht als „x von y“ fest, bevor der Test läuft – und mit ihr, was ihr bei welchem Ergebnis tut. Grundlage: Thomkes Entscheidungsmatrix vor den Daten.',
        quelle: `Kurs: methoden.ts, Prüfliste „experiment“; ${THOMKE}, S. 86`,
      },
    ],
  },
};
