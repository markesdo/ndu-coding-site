import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/value-map.astro (Tag 3, 15:15–16:00; seit 19.11. nach der Ideation, die Lückensätze kommen von dort). Kein Vorwissen eingetragen.
// Tag 4 (28.11., 09:10–09:40, NDU-66): nur die Übung (vorgehen) wird nachgeholt, gekürzt auf 30 min, mit der Website-Frage beim Wählen
// und den drei Ideen als Lösungen im Baum zum Schluss; die Theorie lief an Tag 3.
// VPD-Seiten = Seitenzahlen der PDF-Ausgabe, wie in quellen/vpd/text.txt (nicht die der gedruckten Ausgabe).
const VPD = 'Osterwalder u. a., Value Proposition Design';

export const NOTIZEN_VALUE_MAP: Record<string, Notiz> = {
  'value-map': {
    live: [
      'Abbildung: die Value Map des Buchs über sich selbst.',
      'Gelb links: was ihr anbietet. Grün: was es bewirkt.',
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
    ueberleitung: 'Und woher nehmt ihr diese Zettel? Aus eurem Satz.',
  },

  // NEU – erst machen
  'vom-satz': {
    live: [
      'Satz 2 vorlesen – der Spitzenreiter von eben.',
      'Vor jedem Klick offen fragen: In welches Feld gehört dieser Teil?',
      '„Der Halbsatz vor (P1) ist euer erster Pain Reliever.“',
      'Die Idee wird ausgeschrieben: was im Schaufenster steht.',
      '„Ein Satz, ein Pain, ein Gain – die Map ergänzt.“',
      'Wenn hinten: nur Zeile Pain Reliever, dann letzter Klick.',
    ],
    verstaendnis: {
      frage: 'Was aus eurem Lückensatz kommt nicht in die linke Hälfte?',
      antwort: 'Segment, Job und Alternative. Segment und Job stehen rechts im Profil; die Alternative hat im Canvas kein Feld.',
      falsch: '„Der Job wird ein Produkt“ – der Job bleibt rechts; das Produkt trifft ihn.',
    },
    kern: [
      { text: 'Lückensatz: nur „Our ___“ zeigt auf das Quadrat („products and services“); die Lücken für Pain und Gain zeigen auf das Profil, je mit eigenem Verb.', quelle: `${VPD}, S. 184 (aus der Abbildung)` },
      { text: '„Pain relievers describe how exactly your products and services alleviate specific customer pains.“ Verb und Pain im Satz sind das in Rohform – Lesart dieses Kurses. Gain Creators ebenso.', quelle: `${VPD}, S. 86, 89` },
      { text: 'Ad-libs „Pinpoint how different alternatives create value“; der Canvas: „Flesh out possible directions“. Der Canvas entsteht für die gewählte Richtung.', quelle: `${VPD}, S. 158–159, 182` },
    ],
    ueberleitung: 'Zwei Zettel kommen dazu. In welches Feld gehören sie?',
  },

  'produkt-wirkung': {
    live: [
      'Allein still: welches Feld für jeden Zettel? Dann zugleich zeigen.',
      'Erst beide beantworten lassen, dann aufdecken.',
      'A: Products & Services. B: Pain Reliever P2.',
      'Probe: Steht es im Schaufenster – oder sagt es, was sich ändert?',
      'Wenn hinten: nur aufdecken und die Probe sagen.',
    ],
    uebung: { dauer: '1 min', form: 'allein still zuordnen, dann je Zettel alle zugleich zeigen (1, 2 oder 3 Finger); niemand wird aufgerufen' },
    ablauf: {
      schritte: [
        'Zwei Zettel zeigen, die der Lückensatz nicht nennt: A „Express-Ausgabe mit drei Standardgetränken“, B „Statt anzustehen: in 20 Sekunden im Gehen bestellen“.',
        'Allein still: beide Zettel einem Feld zuordnen (Products & Services, Pain Relievers, Gain Creators). Dann je Zettel alle zugleich zeigen: 1, 2 oder 3 Finger. Eine offene Frage an alle: Wer sagt in einem Halbsatz, warum? Niemanden aufrufen.',
        'Aufdecken und vergleichen.',
      ],
      achten: [
        'Bei B nach der ID fragen: Welchen Pain im Profil der Kaffeebar trifft der Zettel?',
        'Es ist in Ordnung, wenn ein Zettel Pain und Gain zugleich trifft (S. 103).',
      ],
      aufloesung: 'A ist ein Product & Service (Schaufenster). B ist ein Pain Reliever für P2. Einer der vier häufigen Fehler im Buch: „Add products and services to the pain reliever and gain creator fields.“ (S. 105)',
    },
    kern: [
      {
        text: 'Pain Relievers und Gain Creators sind Erklärungen oder Eigenschaften, die die Wertschöpfung ausdrücklich machen; die Beispiele des Buchs: „helps save time“ und „well-designed“.',
        quelle: `${VPD}, S. 105`,
      },
      {
        text: 'Die zwei Zettel stammen aus der ausgearbeiteten Value Map der Kaffeebar für „Im Gehen bestellen“; der Lückensatz nennt sie nicht.',
        quelle: 'value-map.astro, Folie beispiel (Handout)',
      },
    ],
    ueberleitung: 'Und wie prüft ihr, ob eine Map trifft?',
  },

  fit: {
    live: [
      'Abbildung: Quadrat = Value Map, jeder Zettel geprüft, auch Produkte. Kreis = Profil.',
      'Klick 1: Zettel vorlesen, offen fragen: Was trifft er? P1.',
      '„Ein Zettel, eine ID, zwei Haken – links und rechts.“',
      'Klick 2: Rest rechts – Kreuz, oder Fragezeichen mit Frage.',
      'Klick 3: von oben lesen. Nicht Haken zählen.',
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
        text: 'Haken zeigen, was Products & Services, Pain Relievers und Gain Creators treffen: „Check marks signify that products and services relieve pains or create gains and directly address one of the customers’ jobs, pains, or gains. Xs show which jobs, pains, and gains the value proposition does not address.“',
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
        frage: 'Zwei Haken – was ist der Unterschied?',
        antwort: 'Links: Dieser Zettel trifft etwas, die ID sagt was. Rechts: Dieser Eintrag ist getroffen. Sie entstehen zusammen in Schritt 1 (Abbildung S. 109, Note S. 110).',
      },
      {
        frage: 'Was, wenn eine Idee alles abhakt?',
        antwort: 'Dann misstraut dem Profil: Wenn eine Map alles adressiert, „it’s probably because you’re not honest about all the jobs, pains, and gains that should be in your customer profile“ (S. 106). Wertversprechen heißt auswählen (S. 105).',
      },
    ],
    ueberleitung: 'Jetzt alle Zettel der Kaffeebar. Schritt 1: links.',
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
    ueberleitung: 'Spitzenreiter gewählt. Nur für ihn kommt jetzt die linke Hälfte.',
  },

  'fit-kaffeebar': {
    live: [
      'Zettel links vorlesen, offen fragen: Was trifft er? Dann aufdecken.',
      'Zeilen 2 bis 4 zügig – gleiches Muster.',
      'Produkte: J1 kommt über die Produkte, nicht über einen Pain Reliever.',
      'Gegenprobe: trifft nichts – kein Haken, streichen oder umformulieren.',
      'Wenn hinten: nur Zeile 1, Produkt-Zeile, Gegenprobe.',
    ],
    kern: [
      {
        text: '„Go through Pain Relievers and Gain Creators one by one, and check to see whether they fit a customer job, pain, or gain. Put a check mark on each one that does.“',
        quelle: `${VPD}, S. 112`,
      },
      {
        text: '„If a pain reliever or gain creator doesn’t fit anything, it may not be creating customer value.“',
        quelle: `${VPD}, S. 113`,
      },
    ],
    ueberleitung: 'Links fertig. Was ist rechts übrig?',
  },

  'fit-kaffeebar-rechts': {
    live: [
      'Zeile 1: Diese fünf haben ihren Haken schon aus Schritt 1.',
      'Je Eintrag offen fragen: Trägt links ein Zettel diese ID?',
      'J4: Anstehen entfällt, Bezahlen offen – Fragezeichen mit Frage.',
      'Schritt 3: von oben lesen – höchstes Kreuz bewusst? Frage im 1:1.',
      'Wenn hinten: nur G2 und J4, dann Schritt 3.',
    ],
    verstaendnis: {
      frage: 'Woran seht ihr, dass ihr rechts fertig seid?',
      antwort: 'Jeder Zettel trägt genau ein Zeichen: ✓, ✗ oder ?.',
      falsch: '„Wenn alle Pain Relievers einen Haken haben“ – dann fehlt die rechte Seite.',
    },
    kern: [
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
    ueberleitung: 'Jetzt ihr: Spitzenreiter wählen, seine Map aus dem Satz bauen, den Fit prüfen.',
  },

  vorgehen: {
    live: [
      'Wozu vorlesen: wissen, was ihr heute ausarbeitet – und was offen bleibt.',
      'Timer 3 min: wählen oder bestätigen.',
      'Fragen: Was davon ist die Website – trifft sie allein noch P1?',
      'Nach 3 min: Satz-Sticky mitnehmen, Quadrat füllen – Timer 11 min.',
      '1:1 ab Minute 5, je 3 min: Produkt 3, 2, 1.',
      'Frage: ✗ des Spitzenreiters oben bewusst? Sonst: Was bleibt oben offen?',
      'Nach 14 min: ordnen auf den Skalen – Timer 4 min.',
      'Nach 18 min: Fit in drei Schritten – Timer 8 min.',
      'Nach 26 min: festhalten und prüfen – jedes ? mit Frage?',
      'Nach 28 min: drei Ideen unter den Stern im Baum.',
      'Wenn hinten: Value Map nur mit einem Pain Reliever, einem Gain Creator.',
    ],
    uebung: { dauer: '30 min (3 + 11 + 4 + 8 + 2 + 2)', form: 'allein; Markus fragt je nach dem ✗ des Spitzenreiters: bewusst in Kauf – warum? Ohne ✗ oben: Was bleibt oben offen?' },
    miro: {
      frame: 'T3 · 4 · Kundenprofil & Value Map',
      schritte: [
        'Wählen – T3 · 4, eigene Spalte, Feld „Ideen vergleichen und wählen“: die drei Lückensätze aus der Ideation gegen die obersten Einträge des Profils; jedes ? mit Frage bleibt am Satz.',
        'Füllen – Canvas-Frame „T3 · 4 · Canvas · Produkt n“: den Sticky mit dem Satz des Spitzenreiters links neben das Quadrat kopieren, dann die Value Map ins Quadrat (die drei Platzhalter überschreiben).',
        'Ordnen – alle Zettel auf die drei Skalen links unten, Unverzichtbares oben.',
        'Fit prüfen – auf den Skalen: Links, Zettel für Zettel: ID, ✓ auf Zettel und Eintrag; Rechts, was übrig ist: ✗ oder ? mit Frage, als letzte Zeile im Sticky; Von oben lesen.',
      ],
    },
    ablauf: {
      schritte: [
        'Wählen (3 min): wer zu Hause gewählt hat, bestätigt nur – mit der Frage: Was davon ist die Website, die ihr baut, und trifft sie allein noch P1? (Der Kurs baut eine Website; der Spitzenreiter darf hybrid sein, die Website ist der Teil, den ihr prototypt.) Sonst jeden Lückensatz aus der Ideation gegen die obersten Einträge – ✓, ✗ oder ?; dann den Spitzenreiter auf Papier wählen, ein Satz warum. Die anderen beiden bleiben offen (VPD S. 347–348, 117; Torres würde alle drei testen, S. 113).',
        'Füllen (11 min), Richtwert 2 + 9: den Sticky mit dem Satz des Spitzenreiters in den Canvas mitnehmen; a) aus dem Lückensatz drei Zettel – Idee → Products & Services, Halbsatz vor (P…) → Pain Reliever, Halbsatz vor (G…) → Gain Creator; b) Profil von oben: ein Zettel je Wirkung mit P- oder G-ID, kein Zettel, wo das Angebot nichts bewirkt; Produkte ohne ID (VPD S. 99–101, 105). Markus geht ab Minute 5 zu jeder Person (Produkt 3, 2, 1, je drei Minuten) und fragt: „Euer Spitzenreiter hat ein ✗ oben im Profil – nehmt ihr das bewusst in Kauf, und warum?“ – oder, wenn oben kein ✗ steht: „Was bleibt oben offen?“ – gemeint ist das ✗ aus dem Vergleich der drei Lückensätze (VPD S. 105–106). Kursformat statt Runde zu dritt, weil jede*r ein eigenes Produkt hat.',
        'Ordnen (4 min): alle Zettel auf die Skalen links unten, je Spalte, Unverzichtbares oben (VPD S. 102).',
        'Fit prüfen (8 min): Links, Zettel für Zettel – trifft er etwas, ID dazu, ✓ auf den Zettel und ✓ am Eintrag rechts; Rechts, was übrig ist – ✗, oder „?“ mit Frage, wo ihr es erst herausfinden müsst (das Buch kennt nur ✓ und ✗); Von oben lesen – oberste Einträge getroffen, höchstes ✗ bewusst? (VPD S. 109–113).',
        'Festhalten und prüfen (2 min): rechts ein Zeichen je Zettel, links jeder ✓ mit ID, jedes ? mit Frage. Die ? bleiben, wo sie stehen – am Satz in T3 · 4, am Zettel im Canvas; an der Experiment-Karte werden sie Annahmen. Claude-Prüfung nach dem Kurstag.',
        'Euer Baum – Lösungen (2 min): die drei Ideen als Lösungen unter den Stern an der Ziel-Chance („Baum · Produkt n“), den Spitzenreiter markieren (Torres, Continuous Discovery Habits, S. 25–27).',
      ],
      achten: [
        'Gewählt wird nach den obersten Einträgen, nicht nach der Zahl der Haken.',
        'Jedes „?“ wird an Tag 4 eine Annahme – auch die der beiden anderen Ideen.',
        'Bei Pain Relievers steht eine Wirkung, kein Produkt.',
        'Der Vergleich der Lückensätze ersetzt nicht den Fit am Ende: Das Buch prüft die ausgearbeitete Value Map (S. 112).',
        'Rechts trägt am Ende jeder Zettel ein Zeichen.',
        'Der Satz des Spitzenreiters liegt als Sticky im Canvas – kein Zurückspringen nach T3 · 4.',
        'Produkte tragen im Quadrat keine ID; ihre ID (J, P oder G) kommt beim Fit.',
        'Kein Zettel zu jedem Pain – die Kaffeebar hat sechs Zettel, als Beispiel, nicht als Regel.',
      ],
      fehler: [
        'Die Lieblingsidee bekommt großzügig Haken, die anderen strenge Kreuze.',
        'Das Profil wird nachträglich an die Idee angepasst.',
        'Alles abgehakt, nichts offen.',
        'Ein Pain Reliever ohne ID bekommt trotzdem einen Haken.',
        'Ein Produkt bekommt schon im Quadrat eine ID – oder eine P-ID für einen Pain, den es nicht direkt trifft.',
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
      'Aufdecken: Fit auf Papier ist kein Beweis – getestet wird ab Tag 4.',
      'Ausblick: gleich der Story-Bogen – und eure Concept Story.',
    ],
    kern: [
      {
        text: 'Gute Wertversprechen konzentrieren sich auf wenige Pains, die sie extrem gut lindern; die besten adressieren, was der Kundschaft am wichtigsten ist.',
        quelle: `${VPD}, S. 86–87, 103`,
      },
      {
        text: 'Drei Stufen: Problem-Solution Fit („On Paper“), Product-Market Fit („In the Market“), Business Model Fit („In the Bank“). „The fit you achieve is not yet proven and exists mainly on paper.“ Die Folie dazu steht seit 21.11. nur im Handout (Entscheidung 58).',
        quelle: `${VPD}, S. 115–118`,
      },
    ],
    ueberleitung: 'Direkt weiter: Warum sollte das jemanden interessieren?',
  },
};
