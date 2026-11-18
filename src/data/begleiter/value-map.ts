import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/value-map.astro (Tag 3, 15:10–15:55). Kein Vorwissen eingetragen.
// VPD-Seiten = Seitenzahlen der PDF-Ausgabe, wie in quellen/vpd/text.txt (nicht die der gedruckten Ausgabe).
const VPD = 'Osterwalder u. a., Value Proposition Design';

export const NOTIZEN_VALUE_MAP: Record<string, Notiz> = {
  'value-map': {
    live: [
      'Abbildung: die Value Map des Buchs über sich selbst.',
      'Gelb links: was es gibt. Grün: was es bewirkt.',
      '„Pains und Gains hat die Kundschaft. Schmerzlinderer und Gewinnerzeuger entscheidet ihr.“',
      'Nicht alles lindern – wenige Pains, die aber extrem gut.',
    ],
    verstaendnis: {
      frage: 'Worüber entscheidet ihr – und worüber die Kundschaft?',
      antwort: 'Ihr entscheidet (entwerft), wie ihr Wert schafft: Produkte, Schmerzlinderer, Gewinnerzeuger. Welche Jobs, Pains und Gains es gibt, entscheidet die Kundschaft (S. 103).',
      falsch: '„Wir entscheiden, welche Pains wichtig sind“ – ihr wählt nur aus, welche ihr angeht.',
    },
    kern: [
      {
        text: 'Produkte und Services sind schlicht die Liste dessen, was ihr anbietet: „all the items your customers can see in your shop window“. Sie schaffen nicht allein Wert, nur im Verhältnis zu einem Segment und seinen Jobs, Pains und Gains.',
        quelle: `${VPD}, S. 83`,
      },
      {
        text: 'Schmerzlinderer beschreiben, wie genau das Angebot bestimmte Pains verringert; nicht für jeden Pain – das schafft kein Wertversprechen. Gewinnerzeuger ebenso für Gains.',
        quelle: `${VPD}, S. 86–87, 89`,
      },
      {
        text: '„You have control over the former, whereas you don’t have control over the latter.“ Und: „The best ones address those that matter most to customers and do so extremely well.“',
        quelle: `${VPD}, S. 103`,
      },
      {
        text: 'Abbildung (aus der Grafik gelesen): gelb die Produkte – „Book“, „Value Proposition Canvas“, „exclusive online companion“; grün Wirkungen wie „helps shape ideas“ und „minimizes risk of (big) failure“. Unter der Grafik zu beiden Wirkungsfeldern: „Don’t add products or services here.“',
        quelle: `${VPD}, S. 93`,
      },
    ],
    ueberleitung: 'Produkt oder Wirkung – das verwechselt fast jede*r. Probiert es.',
  },

  // NEU – erst machen
  'produkt-wirkung': {
    live: [
      'Vier Zettel der Kaffeebar, reihum je einer: welches Feld?',
      'Erst alle vier beantworten lassen, dann aufdecken.',
      'A und C: Produkte. B: Schmerzlinderer P1. D: Gewinnerzeuger G1.',
      'Probe: Steht es im Schaufenster – oder sagt es, was sich ändert?',
      'Wenn hinten: nur B und A, als Paar.',
    ],
    uebung: { dauer: '2 min', form: 'zu dritt, reihum laut; der vierte Zettel gemeinsam' },
    ablauf: {
      schritte: [
        'Vier Zettel zeigen: A „QR-Code an der Hallentür“, B „Beim Bestellen steht, ob der Kaffee vor der Abfahrt fertig ist“, C „Express-Ausgabe mit drei Standardgetränken“, D „Der Kaffee steht bereit, wenn man an der Ausgabe ankommt“.',
        'Reihum: je ein Zettel, ein Feld (Produkte & Services, Schmerzlinderer, Gewinnerzeuger), ein Halbsatz warum.',
        'Aufdecken und vergleichen.',
      ],
      achten: [
        'Bei B und D nach der ID fragen: Welchen Pain, welchen Gain im Profil der Kaffeebar trifft der Zettel?',
        'Es ist in Ordnung, wenn ein Zettel Pain und Gain zugleich trifft (S. 103).',
      ],
      aufloesung: 'A und C sind Produkte & Services (Schaufenster). B ist ein Schmerzlinderer für P1, D ein Gewinnerzeuger für G1. Der zweithäufigste Fehler im Buch: „Add products and services to the pain reliever and gain creator fields.“ (S. 105)',
    },
    kern: [
      {
        text: 'Schmerzlinderer und Gewinnerzeuger sind Erklärungen oder Eigenschaften, die die Wertschöpfung ausdrücklich machen; die Beispiele des Buchs: „helps save time“ und „well-designed“.',
        quelle: `${VPD}, S. 105`,
      },
      {
        text: 'Die vier Zettel stammen aus der ausgearbeiteten Value Map der Kaffeebar für „Im Gehen bestellen“.',
        quelle: 'value-map.astro, Folie beispiel (Handout)',
      },
    ],
    ueberleitung: 'Für eine ganze Map pro Idee fehlt die Zeit. Das Buch hat eine Abkürzung.',
  },

  'ad-libs': {
    live: [
      'Lückensatz vorlesen, Lücken mit dem Finger zeigen.',
      '„Ein Satz pro Idee – er zwingt euch zu sagen, wie sie Wert schafft.“',
      'Job, Pain, Gain kommen aus eurem Profil, mit ID.',
      'Falle: am ersten Satz feilen – drei rohe Sätze sind das Ziel.',
    ],
    verstaendnis: {
      frage: 'Woher kommen Job, Pain und Gain im Lückensatz?',
      antwort: 'Aus dem Kundenprofil von eben, am besten aus den obersten Einträgen. Neu ist im Satz nur das Angebot und wie es wirkt.',
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
    ueberleitung: 'Drei Sätze, ein Profil. Wie vergleicht ihr sie?',
  },

  fit: {
    live: [
      'Abbildung: Haken und Kreuze am Profil des Buchs.',
      'Haken: trifft einen Job, Pain oder Gain. Kreuz: bleibt offen.',
      '„Kreuze sind erlaubt. Es zählt, was oben im Profil getroffen ist.“',
      'Falle: Haken zählen statt hinschauen, welche Einträge getroffen sind.',
    ],
    verstaendnis: {
      frage: 'Idee A hat fünf Haken unten im Profil, Idee B zwei ganz oben. Welche hat den besseren Fit?',
      antwort: 'B. Fit heißt: wichtige Jobs, extreme Pains, unverzichtbare Gains (S. 108) – die stehen oben. Das Buch fragt nicht nach der Zahl der Haken, sondern wie gut das Wertversprechen wirklich passt (S. 113).',
      falsch: '„A, mehr Haken“ – die Anzahl sagt nichts über die Wichtigkeit.',
    },
    kern: [
      {
        text: 'Fit entsteht, wenn Kund*innen von einem Wertversprechen begeistert sind, weil es wichtige Jobs adressiert, extreme Pains lindert und unverzichtbare Gains schafft. „Your customers are the judge, jury, and executioner of your value proposition.“',
        quelle: `${VPD}, S. 108–109`,
      },
      {
        text: 'Haken zeigen, was Schmerzlinderer und Gewinnerzeuger treffen; „Xs show which jobs, pains, and gains the value proposition does not address.“',
        quelle: `${VPD}, S. 110`,
      },
      {
        text: 'Prüfung Eintrag für Eintrag. „If a pain reliever or gain creator doesn’t fit anything, it may not be creating customer value.“ Und: „Don’t worry if you haven’t checked all pains/gains–you can’t satisfy them all.“',
        quelle: `${VPD}, S. 112–113`,
      },
    ],
    fragen: [
      {
        frage: 'Was, wenn eine Idee alles abhakt?',
        antwort: 'Dann misstraut dem Profil: Wenn eine Map alles adressiert, „it’s probably because you’re not honest about all the jobs, pains, and gains that should be in your customer profile“ (S. 106). Wertversprechen heißt auswählen (S. 105).',
      },
    ],
    ueberleitung: 'Einmal gemeinsam, an der Kaffeebar.',
  },

  beispiel: {
    live: [
      'Drei Lückensätze vorlesen, Tabelle noch leer.',
      'Reihum: Welche Idee trifft am meisten – und welchen Eintrag nicht?',
      'Zeile für Zeile aufdecken, mit euren Antworten vergleichen.',
      'Das „?“ beim Kaffeewagen: eine Annahme, kein Kreuz.',
      '„Bewusst offen“ zeigen: J2, J3, G2, G3, P4.',
    ],
    uebung: { dauer: '1 min vor dem Aufdecken', form: 'zu dritt, reihum laut: eine Zahl, ein Eintrag' },
    verstaendnis: {
      frage: 'Wofür steht das „?“ beim Kaffeewagen unter P2?',
      antwort: 'Für eine Annahme: Ob es am Bahnsteig keine Schlange gibt, weiß niemand. Sie käme in die Annahmen-Map, wenn diese Idee weiterginge – kein Haken und kein Kreuz.',
    },
    kern: [
      {
        text: 'Kaffeebar: drei Lückensätze am selben Profil. „Im Gehen bestellen“ trifft J1, P1, P2, P3 und G1; die Anzeige an der Hallentür nur J1 und P1; der Kaffeewagen J1, P1 und G1, P2 offen als „?“. Bewusst offen bleiben J2, J3, G2, G3, P4.',
        quelle: 'value-map.astro, Folie beispiel',
      },
      {
        text: 'Wertversprechen heißt wählen: „Realize that great value propositions are about making choices regarding which jobs, pains, and gains to address and which to forgo.“',
        quelle: `${VPD}, S. 105`,
      },
    ],
    ueberleitung: 'Spitzenreiter auf Papier. Was heißt „auf Papier“?',
  },

  'drei-fits': {
    live: [
      'Abbildung von unten nach oben: Papier, Markt, Bank.',
      '„Heute erreicht ihr Stufe 1 – mehr nicht.“',
      'Stufe 2 sind eure Tests ab Tag 4.',
      'Die Wahl ist umkehrbar: Die anderen zwei Ideen bleiben liegen.',
      'Wenn hinten: nur Stufe 1 und der Satz zur Umkehrbarkeit.',
    ],
    verstaendnis: {
      frage: 'Was ist nach heute belegt – und was nicht?',
      antwort: 'Belegt (durch die Interviews): Der Kundschaft sind bestimmte Jobs, Pains und Gains wichtig. Nicht belegt: dass sie sich für euer Wertversprechen interessiert. „The fit you achieve is not yet proven and exists mainly on paper.“ (S. 117)',
      falsch: '„Die Idee mit dem besten Fit ist bestätigt“ – bestätigt ist nur das Problem, nicht die Lösung.',
    },
    kern: [
      {
        text: 'Drei Stufen: Problem-Solution Fit („On Paper“), Product-Market Fit („In the Market“), Business Model Fit („In the Bank“).',
        quelle: `${VPD}, S. 115–118`,
      },
      {
        text: 'Problem-Solution Fit: Belege, dass der Kundschaft bestimmte Jobs, Pains und Gains wichtig sind, und ein Wertversprechen dazu – man entwirft mehrere Alternativen und sucht die mit dem besten Fit. „The fit you achieve is not yet proven and exists mainly on paper.“ Nächster Schritt: Belege für das Wertversprechen sammeln oder neu entwerfen.',
        quelle: `${VPD}, S. 117`,
      },
    ],
    ueberleitung: 'Jetzt ihr: drei Sätze, ein Vergleich, eine Map.',
  },

  vorgehen: {
    live: [
      'Timer 8 min: drei Lückensätze, roh.',
      'Nach 8 min: Haken, Kreuze, Fragezeichen gegen die obersten Einträge.',
      'Nach 15 min: zu dritt, je Person gut zweieinhalb Minuten.',
      'Nach 23 min: Value Map der gewählten Idee, mit IDs.',
      'Nach 31 min: VALUE-MAP.md und eine Zeile ins Entscheidungslog.',
      'Wenn hinten: Value Map nur mit je einem Schmerzlinderer und Gewinnerzeuger.',
    ],
    uebung: { dauer: '34 min (8 + 7 + 8 + 8 + 3)', form: 'allein, in der Mitte zu dritt reihum' },
    miro: {
      frame: 'T3 · 4 · Kundenprofil & Value Map',
      schritte: [
        'Eigene Spalte: „Drei Lückensätze“, darunter „Fit: ✓ ✗ ?“, darunter „Value Map der gewählten Idee“.',
        'Die drei Ideen aus „Drei für den Vergleich in T3 · 4“ (Frame T3 · 3) herüberduplizieren.',
        'Zu dritt: „Alle zu mir holen“ auf die Spalte, die dran ist; die anderen zeigen mit dem Cursor auf ein Kreuz und fragen.',
      ],
    },
    ablauf: {
      schritte: [
        'Lückensätze (8 min): je Idee ein Satz; Job, Pain und Gain mit ID aus dem eigenen Profil.',
        'Fit vergleichen (7 min): jede Idee gegen die obersten Einträge – ✓, ✗ oder ?.',
        'Zu dritt (8 min): Jede*r zeigt die Wahl in einem Satz; die anderen fragen nach einem Kreuz und einem Fragezeichen.',
        'Value Map (8 min): Produkte & Services, Schmerzlinderer, Gewinnerzeuger der gewählten Idee, je mit P- oder G-ID; „bewusst offen“ dazuschreiben.',
        'Festhalten (3 min): docs/VALUE-MAP.md; eine Zeile ins Entscheidungslog: gewählt, Fit als Beleg, „auf Papier“. Claude-Prüfung bis Tag 4.',
      ],
      achten: [
        'Gewählt wird nach den obersten Einträgen, nicht nach der Zahl der Haken.',
        'Jedes „?“ ist eine Annahme und wird später eine Zeile in der Annahmen-Map.',
        'Bei Schmerzlinderern steht eine Wirkung, kein Produkt.',
      ],
      fehler: [
        'Die Lieblingsidee bekommt großzügig Haken, die anderen strenge Kreuze.',
        'Das Profil wird nachträglich an die Idee angepasst.',
        'Alles abgehakt, nichts „bewusst offen“.',
      ],
    },
    ueberleitung: 'Zum Schluss ein Blick auf eure Wahl.',
  },

  uebertrag: {
    live: [
      'Fragen: Trifft eure gewählte Idee den obersten Pain – oder die bequemen?',
      'Reihum: der oberste Eintrag, den eure Idee nicht trifft.',
      '„Wenige Pains, die aber extrem gut.“',
      'Ausblick: Nach der Pause die Geschichte dazu – der Story-Bogen.',
    ],
    kern: [
      {
        text: 'Gute Wertversprechen konzentrieren sich auf wenige Pains, die sie extrem gut lindern; die besten adressieren, was der Kundschaft am wichtigsten ist.',
        quelle: `${VPD}, S. 86–87, 103`,
      },
    ],
    ueberleitung: 'Fünf Minuten Pause, dann: Warum sollte das jemanden interessieren?',
  },
};
