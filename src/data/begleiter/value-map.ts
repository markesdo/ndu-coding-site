import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/value-map.astro (Tag 3, 15:15–16:00; seit 19.11. nach der Ideation, die Lückensätze kommen von dort). Kein Vorwissen eingetragen.
// VPD-Seiten = Seitenzahlen der PDF-Ausgabe, wie in quellen/vpd/text.txt (nicht die der gedruckten Ausgabe).
const VPD = 'Osterwalder u. a., Value Proposition Design';

export const NOTIZEN_VALUE_MAP: Record<string, Notiz> = {
  'value-map': {
    live: [
      'Abbildung: die Value Map des Buchs über sich selbst.',
      'Gelb links: was es gibt. Grün: was es bewirkt.',
      '„Pains und Gains hat die Kundschaft. Pain Relievers und Gain Creators entscheidet ihr.“',
      'Nicht alles lindern – wenige Pains, die aber extrem gut.',
    ],
    verstaendnis: {
      frage: 'Worüber entscheidet ihr – und worüber die Kundschaft?',
      antwort: 'Ihr entscheidet (entwerft), wie ihr Wert schafft: Products & Services, Pain Relievers, Gain Creators. Welche Jobs, Pains und Gains es gibt, entscheidet die Kundschaft (S. 103).',
      falsch: '„Wir entscheiden, welche Pains wichtig sind“ – ihr wählt nur aus, welche ihr angeht.',
    },
    kern: [
      {
        text: 'Products & Services sind schlicht die Liste dessen, was ihr anbietet: „all the items your customers can see in your shop window“. Sie schaffen nicht allein Wert, nur im Verhältnis zu einem Segment und seinen Jobs, Pains und Gains.',
        quelle: `${VPD}, S. 83`,
      },
      {
        text: 'Pain Relievers beschreiben, wie genau das Angebot bestimmte Pains verringert; nicht für jeden Pain – das schafft kein Wertversprechen. Gain Creators ebenso für Gains.',
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
      'Allein still: welches Feld für jeden Zettel? Dann zugleich zeigen.',
      'Erst alle vier beantworten lassen, dann aufdecken.',
      'A, C: Products & Services. B: Pain Reliever P1. D: Gain Creator G1.',
      'Probe: Steht es im Schaufenster – oder sagt es, was sich ändert?',
      'Wenn hinten: nur B und A, als Paar.',
    ],
    uebung: { dauer: '2 min', form: 'allein still zuordnen, dann je Zettel alle zugleich zeigen (1, 2 oder 3 Finger); niemand wird aufgerufen' },
    ablauf: {
      schritte: [
        'Vier Zettel zeigen: A „QR-Code an der Hallentür“, B „Beim Bestellen steht, ob der Kaffee vor der Abfahrt fertig ist“, C „Express-Ausgabe mit drei Standardgetränken“, D „Der Kaffee steht bereit, wenn man an der Ausgabe ankommt“.',
        'Allein still: alle vier Zettel einem Feld zuordnen (Products & Services, Pain Relievers, Gain Creators). Dann je Zettel alle zugleich zeigen: 1, 2 oder 3 Finger. Eine offene Frage an alle: Wer sagt in einem Halbsatz, warum? Niemanden aufrufen.',
        'Aufdecken und vergleichen.',
      ],
      achten: [
        'Bei B und D nach der ID fragen: Welchen Pain, welchen Gain im Profil der Kaffeebar trifft der Zettel?',
        'Es ist in Ordnung, wenn ein Zettel Pain und Gain zugleich trifft (S. 103).',
      ],
      aufloesung: 'A und C sind Products & Services (Schaufenster). B ist ein Pain Reliever für P1, D ein Gain Creator für G1. Einer der vier häufigen Fehler im Buch: „Add products and services to the pain reliever and gain creator fields.“ (S. 105)',
    },
    kern: [
      {
        text: 'Pain Relievers und Gain Creators sind Erklärungen oder Eigenschaften, die die Wertschöpfung ausdrücklich machen; die Beispiele des Buchs: „helps save time“ und „well-designed“.',
        quelle: `${VPD}, S. 105`,
      },
      {
        text: 'Die vier Zettel stammen aus der ausgearbeiteten Value Map der Kaffeebar für „Im Gehen bestellen“.',
        quelle: 'value-map.astro, Folie beispiel (Handout)',
      },
    ],
    ueberleitung: 'Und wie prüft ihr, ob eine Map trifft?',
  },

  fit: {
    live: [
      'Abbildung: jeder Zettel trägt ein Zeichen – links Haken, rechts Haken oder Kreuz.',
      'Haken links: trifft etwas. Rechts: getroffen oder offen.',
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
        text: 'Haken zeigen, was Pain Relievers und Gain Creators treffen; „Xs show which jobs, pains, and gains the value proposition does not address.“',
        quelle: `${VPD}, S. 110`,
      },
      {
        text: 'Abbildung (aus der Grafik gelesen): Haken an allen Zetteln der Value Map, auch den gelben Produkten; im Profil an jedem Zettel Haken oder rotes Kreuz. Keine Linien.',
        quelle: `${VPD}, S. 109`,
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
      'Allein still: Welche Idee trifft am meisten? Dann zugleich zeigen.',
      'Offene Frage an alle: Welchen Eintrag trifft sie nicht?',
      'Zeile für Zeile aufdecken, mit den Antworten aller vergleichen.',
      'Das „?“ beim Kaffeewagen: eine Annahme, kein Kreuz.',
    ],
    uebung: { dauer: '1 min vor dem Aufdecken', form: 'allein still, dann alle zugleich zeigen (1, 2 oder 3 Finger für die Idee); eine offene Frage an alle nach einem Eintrag' },
    verstaendnis: {
      frage: 'Wofür steht das „?“ beim Kaffeewagen unter P2?',
      antwort: 'Für eine Annahme: Ob es am Bahnsteig keine Schlange gibt, weiß niemand. Sie käme in die Annahmen-Map, wenn diese Idee weiterginge – kein Haken und kein Kreuz.',
    },
    kern: [
      {
        text: 'Kaffeebar: drei Lückensätze am selben Profil. „Im Gehen bestellen“ trifft J1, P1, P2, P3 und G1; die Anzeige an der Hallentür nur J1 und P1; der Kaffeewagen J1, P1 und G1, P2 offen als „?“. Die Value Map von „Im Gehen bestellen“ ist nach dem Profil geordnet (der Pain Reliever zu P1 oben).',
        quelle: 'value-map.astro, Folie beispiel (Handout)',
      },
      {
        text: 'Wertversprechen heißt wählen: „Realize that great value propositions are about making choices regarding which jobs, pains, and gains to address and which to forgo.“',
        quelle: `${VPD}, S. 105`,
      },
    ],
    ueberleitung: 'Spitzenreiter gewählt. Jetzt der Fit seiner Value Map, Schritt für Schritt.',
  },

  'fit-kaffeebar': {
    live: [
      'Tabelle zeilenweise: Zettel links vorlesen, offen fragen „Was trifft er?“, dann aufdecken.',
      'Produkt-Zeile: J1 kommt über das Produkt, nicht über einen Pain Reliever.',
      'Gegenprobe: trifft nichts – kein Haken, streichen.',
      'Schritt 2: Was rechts übrig ist, bekommt ✗ oder ?.',
      'Schritt 3: von oben lesen – höchstes Kreuz bewusst? Frage im 1:1.',
      'Wenn hinten: nur Zeile 1 der Tabelle, dann Schritt 2 und 3.',
    ],
    verstaendnis: {
      frage: 'Woran seht ihr, dass ihr rechts fertig seid?',
      antwort: 'Jeder Zettel trägt genau ein Zeichen: ✓, ✗ oder ?.',
      falsch: '„Wenn alle Pain Relievers einen Haken haben“ – dann fehlt die rechte Seite.',
    },
    kern: [
      {
        text: '„Go through Pain Relievers and Gain Creators one by one, and check to see whether they fit a customer job, pain, or gain. Put a check mark on each one that does.“',
        quelle: `${VPD}, S. 112`,
      },
      {
        text: '„If a pain reliever or gain creator doesn’t fit anything, it may not be creating customer value.“ Und: Haken zeigen das Getroffene, Kreuze das Nicht-Adressierte (S. 110); bewusst verzichten heißt „which to forgo“ (S. 105). Das „?“ ist ein Zeichen dieses Kurses.',
        quelle: `${VPD}, S. 105, 110, 113`,
      },
    ],
    fragen: [
      {
        frage: 'Wann ? und wann ✗?',
        antwort: '✗: Die Value Map sagt dazu nichts oder ihr verzichtet. ?: Ihr könnt es erst entscheiden, wenn ihr etwas herausgefunden habt – schreibt die Frage dazu.',
      },
    ],
    ueberleitung: 'Spitzenreiter auf Papier, Fit auf Papier. Was heißt „auf Papier“?',
  },

  'drei-fits': {
    live: [
      'Abbildung von unten nach oben: Papier, Markt, Bank.',
      '„Heute erreicht ihr Stufe 1 – mehr nicht.“',
      '„Stufe 2 sind eure Tests ab Tag 4.“',
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
    ueberleitung: 'Jetzt ihr: Spitzenreiter wählen, seine Map ordnen, den Fit prüfen.',
  },

  vorgehen: {
    live: [
      'Wozu vorlesen: wissen, was ihr heute ausarbeitet – und was offen bleibt.',
      'Timer 5 min: drei Lückensätze aus der Ideation vergleichen, Spitzenreiter wählen.',
      'Nach 5 min: Value Map im Canvas-Frame, ordnen – Timer 20 min.',
      '1:1 ab Minute 5, je 3 min: Hewen, Joachim, Sofie.',
      'Nach 25 min: Fit in drei Schritten, Timer 7 min.',
      'Nach 32 min: alle „?“ ins Feld auf T3 · 4.',
      'Wenn hinten: Value Map nur mit einem Pain Reliever, einem Gain Creator.',
    ],
    uebung: { dauer: '36 min (5 + 20 + 7 + 4)', form: 'allein; Markus fragt je nach einem ✗: bewusst verzichtet – und warum?' },
    miro: {
      frame: 'T3 · 4 · Kundenprofil & Value Map',
      schritte: [
        'T3 · 4, eigene Spalte: „Ideen vergleichen und wählen“ – die drei Lückensätze aus der Ideation gegen die obersten Einträge des Profils.',
        'Canvas-Frame „T3 · 4 · Canvas · Name“: Value Map des Spitzenreiters ins Quadrat, dann alle Stickies auf die drei Skalen links unten, Unverzichtbares oben.',
        'Fit auf den Skalen: links ✓ mit ID an jeden Zettel, der etwas trifft; rechts ✓, ✗ oder ? an jeden Eintrag, als letzte Zeile im Sticky; dann von oben lesen.',
      ],
    },
    ablauf: {
      schritte: [
        'Vergleichen und wählen (5 min): jeden Lückensatz aus der Ideation gegen die obersten Einträge – ✓, ✗ oder ?; dann den Spitzenreiter auf Papier wählen, ein Satz warum. Die anderen beiden bleiben offen (VPD S. 347–348, 117; Torres würde alle drei testen, S. 113).',
        'Value Map (20 min): Products & Services, Pain Relievers, Gain Creators des Spitzenreiters, je mit P- oder G-ID; dann je Spalte ordnen, Unverzichtbares oben (VPD S. 102). Markus geht ab Minute 5 zu jeder Person (Hewen, Joachim, Sofie, je drei Minuten) und fragt nach einem ✗ oben im Profil: Verzichtet ihr bewusst darauf – und warum? (VPD S. 105–106, 110, 113). Kursformat statt Runde zu dritt, weil jede*r ein eigenes Produkt hat.',
        'Fit prüfen (7 min): links Zettel für Zettel – trifft er etwas, ✓ mit ID und ✓ am Eintrag rechts; rechts ✗ an das, was übrig ist, „?“ wo ihr es erst herausfinden müsst (das Buch kennt nur ✓ und ✗); von oben lesen: oberste Einträge getroffen, höchstes ✗ bewusst? (VPD S. 109–113).',
        'Festhalten (4 min): alle „?“ – aus dem Vergleich der drei Ideen und aus dem Fit – ins Feld „Ideen vergleichen und wählen“ auf T3 · 4; an Tag 4 werden sie Annahmen. Claude-Prüfung bis Tag 4.',
      ],
      achten: [
        'Gewählt wird nach den obersten Einträgen, nicht nach der Zahl der Haken.',
        'Jedes „?“ wird an Tag 4 eine Annahme – auch die der beiden anderen Ideen.',
        'Bei Pain Relievers steht eine Wirkung, kein Produkt.',
        'Der Vergleich der Lückensätze ersetzt nicht den Fit am Ende: Das Buch prüft die ausgearbeitete Value Map (S. 112).',
        'Rechts trägt am Ende jeder Zettel ein Zeichen.',
      ],
      fehler: [
        'Die Lieblingsidee bekommt großzügig Haken, die anderen strenge Kreuze.',
        'Das Profil wird nachträglich an die Idee angepasst.',
        'Alles abgehakt, nichts offen.',
        'Ein Pain Reliever ohne ID bekommt trotzdem einen Haken.',
      ],
    },
    kern: [
      {
        text: 'Wählen vor dem Test ist im Buch vorgesehen: „choose among several alternatives before you test them in the real world“ – auch wenn am Ende die Kundschaft urteilt. Torres würde dagegen drei Ideen in die Annahmentests nehmen: „we will use prototyping and assumption testing to whittle our set down from three to one“.',
        quelle: `${VPD}, S. 347–348; Torres, Continuous Discovery Habits, S. 113`,
      },
    ],
    ueberleitung: 'Zum Schluss ein Blick auf eure Wahl.',
  },

  uebertrag: {
    live: [
      'Fragen: Trifft eure gewählte Idee den obersten Pain – oder die bequemen?',
      'Allein: obersten verfehlten Eintrag am Canvas markieren; Markus fragt nach.',
      '„Wenige Pains, die aber extrem gut.“',
      'Ausblick: gleich der Story-Bogen – heute als Theorie.',
    ],
    kern: [
      {
        text: 'Gute Wertversprechen konzentrieren sich auf wenige Pains, die sie extrem gut lindern; die besten adressieren, was der Kundschaft am wichtigsten ist.',
        quelle: `${VPD}, S. 86–87, 103`,
      },
    ],
    ueberleitung: 'Direkt weiter: Warum sollte das jemanden interessieren?',
  },
};
