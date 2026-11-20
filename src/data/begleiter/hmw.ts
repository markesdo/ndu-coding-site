import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/hmw.astro (Tag 3, 13:00–13:30; seit 19.11. nach Kundenprofil und Mittagspause).
// Kürzen, wenn hinten (in dieser Reihenfolge): warum, rahmen, sweet-spot.
// Vorwissen: „bekannt“ aus Need Finding / Market Research (vorwissen.ts).
// Berger = Blogausdruck S. 1–2 (quellen/berger/text.txt). Torres = gedruckte Seiten. Wedell-Wedellsborg = PDF-Seiten 1–10.
const BERGER = 'Warren Berger, The Secret Phrase Top Innovators Use, HBR Blog Network, 17.09.2012';
const TORRES = 'Teresa Torres, Continuous Discovery Habits';
const WW = 'Thomas Wedell-Wedellsborg, Are You Solving the Right Problems?, HBR Jan.–Feb. 2017';

export const NOTIZEN_HMW: Record<string, Notiz> = {
  rahmen: {
    live: [
      'Ist-Zeit notieren.',
      'Fragen: Wofür habt ihr How Might We in Need Finding benutzt?',
      'Aufzug von Tag 1: Welche Frage führt zum Spiegel?',
      'Aufdecken: zwei Fragen, zwei Lösungsräume.',
      '„Eure Frage entscheidet, welche Ideen am Nachmittag überhaupt entstehen.“',
      'Wenn hinten: nur die zwei Fragen zum Aufzug, ohne Handout-Punkte.',
    ],
    verstaendnis: {
      frage: 'Warum reicht es nicht, mit der Ziel-Chance direkt in die Ideation zu gehen?',
      antwort: 'Es ginge – Torres’ Grundform tut fast genau das. Aber die Formulierung legt fest, welche Lösungen in Reichweite sind. Mehrere Fassungen schreiben und eine wählen macht diese Entscheidung sichtbar.',
    },
    kern: [
      {
        text: 'Lösungsraum: „a cluster of solutions that share assumptions about what the problem is“. Beim Aufzug: „er ist langsam“ führt zu Motor, neuem Aufzug, Algorithmus; die andere Sicht zu Spiegeln. Die erste Sicht ist nicht falsch – es geht darum, ob es ein besseres Problem gibt.',
        quelle: `${WW}, S. 2`,
      },
      {
        text: 'Auf die Wörter achten: „Pay close attention to the wording, because even seemingly inconsequential word choices can surface a new perspective on the problem.“ Neue Lösungen kommen fast immer aus einer anderen Fassung des Problems.',
        quelle: `${WW}, S. 1, 7`,
      },
      {
        text: 'Torres: Das Bedürfnis statt der Lösung festzuhalten „opens up more of the solution space“. Die beiden Wie-könnten-Fragen zum Aufzug sind Kursformulierung; der Artikel behandelt How Might We nicht.',
        quelle: `${TORRES}, S. 69; Verbindung zu How Might We: Kurs`,
      },
    ],
    ueberleitung: 'Woher die Frageform kommt: von einer Seife.',
  },

  coast: {
    live: [
      'Erzählen: Irish Spring, sechs Kopien, keine besser.',
      'Fragen: Welche Frage hat das Team gestellt – und was fehlt ihr?',
      'Aufdecken: Warum?, Kundensicht, neue Frage, Coast.',
      '„Bei euch ist der Schritt schon getan: Eure Ziel-Chance steht in Kundenworten.“',
    ],
    geschichte: {
      text: 'Frühe 1970er, Procter & Gamble. Colgate-Palmolive hat mit Irish Spring Erfolg: eine Seife mit grünem Streifen, die Erfrischung verspricht. P&G testet ein halbes Dutzend eigene Streifenseifen – keine ist besser. Min Basadur wird dazugeholt und findet, das Team stelle die falsche Frage: „How can we make a better green-stripe bar?“ Er lässt Warum-Fragen stellen – „Why are we trying so hard to make another green-striped soap?“ – und den Blick vom Konkurrenzprodukt auf die Kundschaft wenden: Ihr ging es nie um Streifen, sondern darum, sich erfrischt zu fühlen. Am Ende steht „How might we create a more refreshing soap of our own?“ In wenigen Stunden entstehen Hunderte Ideen, das Team landet beim Thema Küste – und bei einer blau-weiß gestreiften Seife namens Coast, einer erfolgreichen eigenen Marke.',
      quelle: `${BERGER}, S. 2`,
    },
    verstaendnis: {
      frage: 'Was war an „How can we make a better green-stripe bar?“ falsch?',
      antwort: 'Zwei Dinge: Die Lösung steckt drin (eine Streifenseife), und die Frage schaut auf das Konkurrenzprodukt statt auf die Kundschaft (S. 2). Dazu „can“ statt „might“ (S. 1).',
      falsch: '„Nur das Wort can“ – die Frage wäre auch mit „might“ eine Lösung im Kostüm.',
    },
    kern: [
      {
        text: 'Hinter den drei Wörtern steht ein größerer Prozess: Basadur stellte erst mehrere Warum-Fragen und wechselte in die Sicht der Kundschaft. Er sagt, den meisten fehle Übung im Finden und Fassen von Problemen: „It’s not taught in MBA programs.“',
        quelle: `${BERGER}, S. 2`,
      },
    ],
    ueberleitung: 'Und warum genau diese drei Wörter?',
  },

  warum: {
    live: [
      'Kurz, weil bekannt: drei Wörter, drei Rollen.',
      'Fragen: Was ändert sich, wenn dort „können“ steht?',
      '„Im Deutschen trägt der Konjunktiv das might: könnten, nicht können.“',
      'Wenn hinten: in einem Satz, dann weiter.',
    ],
    kern: [
      {
        text: 'Basadur: Mit „can“ und „should“ urteilt man schon – können wir das, sollen wir? Mit „might“: „you’re able to defer judgment, which helps people to create options more freely, and opens up more possibilities.“',
        quelle: `${BERGER}, S. 1`,
      },
      {
        text: 'Tim Brown (IDEO): „The ‚how‘ part assumes there are solutions out there — it provides creative confidence“; „might“ erlaubt Ideen, die funktionieren oder nicht; „we“ heißt gemeinsam, auf den Ideen der anderen aufbauend.',
        quelle: `${BERGER}, S. 1`,
      },
      {
        text: 'Verbreitung: von Basadur über Scient und Charles Warren zu IDEO, dann Google und Facebook. Brown war anfangs skeptisch: „I was skeptical at first; it sounds a bit Californian.“ Später machten bei IDEO 700 Leute gemeinsam How Might We.',
        quelle: `${BERGER}, S. 2`,
      },
    ],
    ueberleitung: 'Wie kommt ihr von eurer Chance zu so einer Frage? Torres zeigt den Schritt.',
  },

  bruecke: {
    live: [
      'Fluss von links: Wunsch, Chance, Frage, Optionen.',
      'Fragen: Wie viele Wege gibt es zu „Werbung vorspulen“?',
      'Aufdecken: Grundform – die Chance steht wörtlich in der Frage.',
      '„Damit habt ihr eure erste Frage schon – noch bevor ihr nachdenkt.“',
    ],
    verstaendnis: {
      frage: 'Woran erkennt ihr, dass in einer Frage schon die Lösung steckt?',
      antwort: 'Es gibt nur einen Weg, sie zu beantworten. Torres’ Probe: „Is there more than one way to address this opportunity?“ (S. 94).',
    },
    kern: [
      {
        text: '„I wish I could fast-forward through commercials“ ist ein Lösungswunsch. Dahinter: „I don’t like commercials.“ Erst die Frage „How might we address ‚I don’t like commercials‘?“ bringt mehrere Optionen: unterhaltsamere Werbung, Vorspulen, ein Abo ohne Werbung. „An opportunity should have more than one potential solution.“',
        quelle: `${TORRES}, S. 94–95`,
      },
      {
        text: 'Dieselbe Frageform nutzt Torres schon in Kapitel 2 für das Vergleichen von Lösungen: „How else might we address this opportunity?“',
        quelle: `${TORRES}, S. 31`,
      },
    ],
    ueberleitung: 'Aus der Grundform werden jetzt drei Fragen.',
  },

  bauen: {
    live: [
      'Fluss am Beispiel durchgehen: Chance, Grundform, Varianten, Probe.',
      'Fragen: Warum will jemand wissen, ob es sich ausgeht?',
      'Aufdecken: H1 genauer, H2 weiter, dann die Falle.',
      '„Eine Variante weiter, eine genauer – dann habt ihr drei zum Vergleichen.“',
      'Aufdecken: Falle – H2 rutscht in die Nachbar-Chance, darum H1.',
    ],
    verstaendnis: {
      frage: 'Wozu drei Fragen, wenn ihr am Ende eine nehmt?',
      antwort: 'Um zu vergleichen statt die erste zu nehmen – dieselbe Logik wie bei den Geschwistern: nicht ob, sondern welche (Torres, S. 31). Auch Basadur kam über eine Reihe von Fragen zur letzten (Berger, S. 2).',
    },
    kern: [
      {
        text: 'Grundform: die Ziel-Chance wörtlich in „How might we address ‚…‘?“.',
        quelle: `${TORRES}, S. 94`,
      },
      {
        text: 'Weiter fragen: Basadur ließ eine Reihe ehrgeizigerer Fragen stellen, mit Warum-Fragen davor und dem Wechsel in die Sicht der Kundschaft. Die Variante „genauer“ (Person und Moment nennen) und die Reihenfolge der drei Schritte sind Kursformat.',
        quelle: `${BERGER}, S. 2; Schritte: Kursformat`,
      },
      {
        text: 'Proben: mehr als ein Weg (Torres, S. 94–95); ehrgeizig, aber erreichbar („ambitious, yet also achievable“, Berger, S. 2); „might“ statt „can“ oder „should“ (Berger, S. 1).',
        quelle: `${TORRES}, S. 94–95; ${BERGER}, S. 1–2`,
      },
      {
        text: 'Kaffeebar: H1 ist die Frage, mit der die Ideation am Nachmittag arbeitet. H2 („… auch dann zu ihrem Kaffee kommen, wenn es voll ist“) kommt aus der Warum-Frage und nimmt I5-2 beim Wort: „Wenn es voll ist, lass ich es.“ Dazu I3-4: „Bei mehr als fünf Leuten lass ich es.“ H2 ist das Beispiel für die Falle beim Weiterfragen: Sie reicht in die Nachbar-Chance „Wenn ich anstehe, reicht mir die Zeit nicht.“ hinein – darum wählt die Kaffeebar H1 (unsere Lesart).',
        quelle: 'ideation.astro, Folie beispiel; Werkstatt, Beispiel Kaffeebar (I5-2, I3-4)',
      },
    ],
    fragen: [
      {
        frage: 'Auf „Warum will jemand wissen, ob es sich ausgeht?“ kommt: „Weil der Zug vorgeht.“ Und jetzt?',
        antwort: 'Das ist die Nachbar-Chance „Wenn ich anstehe, reicht mir die Zeit nicht.“ (I2-2, I3-4, I4-1). Für H2 weiterfragen: Sie wollen den Kaffee und lassen ihn, wenn es voll ist (I5-2, I3-4). H2 reicht damit schon in die Nachbar-Chance hinein – darum nimmt die Kaffeebar H1 (unsere Lesart).',
      },
      {
        frage: 'Ist der Outcome-Satz nach Ulwick nicht schon die Frage?',
        antwort: 'Fast: Beide sind frei von Lösungen. Der Outcome-Satz ist zum Bewerten gebaut, mit Richtung und Maßeinheit (Ulwick, S. 95); die Frage soll Ideen öffnen. Wer eine Zielzahl hineinschreibt, landet bei Browns zu enger Frage (Berger, S. 2). Die Gegenüberstellung ist unsere.',
      },
    ],
    ueberleitung: 'Jetzt die Probe – an vier Fragen zur Kaffeebar.',
  },

  'sweet-spot': {
    live: [
      'Vier Fragen still lesen lassen.',
      'Reihum, laut: je eine Frage, die vierte nimmst du.',
      'Aufdecken: A Lösung drin, B zu weit, C passt, D zu eng.',
      'B gegen H2: H2 nennt Moment und Kaffee, B keins.',
      'Fragen: Wie viele Wege gibt es zur Ampel?',
      'Falle: D für gut halten, weil eine Zahl drinsteht.',
      'Wenn hinten: nur A und D laut sortieren.',
    ],
    uebung: { dauer: '3 min', form: 'reihum laut, dann aufdecken' },
    verstaendnis: {
      frage: 'Was unterscheidet „zu eng“ von „Lösung drin“?',
      antwort: '„Zu eng“ ist ein kleines, festes Ziel – Browns Beispiel: 5 % mehr Gewinn im nächsten Quartal (Berger, S. 2). „Lösung drin“ gibt den Weg vor – es gibt nur eine Antwort (Torres, S. 94).',
    },
    ablauf: {
      aufloesung: 'A: Die Ampel ist eine Lösung, es gibt nur einen Weg. B: zu weit – wie „solve world hunger“. D: zu eng – eine Zielzahl wie „profits by 5 percent“. C passt: aus Sicht der Pendler*innen, mehr als ein Weg, ehrgeizig und erreichbar.',
    },
    kern: [
      {
        text: 'Brown: am besten für Herausforderungen, die „ambitious, yet also achievable“ sind. Zu weit: „How might we solve world hunger?“ Zu eng: „How might we increase profits by 5 percent next quarter?“ Die richtige Frage zu finden ist ein Prozess: „You need to find the sweet spot.“',
        quelle: `${BERGER}, S. 2`,
      },
    ],
    ueberleitung: 'Jetzt eure Fragen.',
  },

  vorgehen: {
    live: [
      'Timer 7 min: Grundform plus zwei Varianten, allein.',
      'Nach 7 min: zwei Proben allein – je Frage zwei Wege notieren.',
      'Herumgehen, kein fester 1:1: auf eine Frage zeigen, fragen.',
      'Nach 12 min: eine Frage wählen, ein Satz warum.',
      'Falle: Ersatzfragen vorschlagen – nur fragen, was nicht stimmt.',
      '„Die gewählte Frage nehmt ihr nach fünf Minuten Pause in die Ideation mit.“',
    ],
    uebung: { dauer: '15 min (7 + 5 + 3)', form: 'allein, Markus geht herum' },
    miro: {
      frame: 'T3 · 2 · How Might We',
      schritte: [
        'Jede*r schreibt die drei Fragen als Zettel in die eigene Spalte, die Ziel-Chance darüber.',
        'Bei den Proben: die zwei Wege je Frage als kleine Zettel neben die Frage.',
        'Die gewählte Frage markieren; sie steht auch in docs/HMW.md.',
      ],
    },
    ablauf: {
      schritte: [
        'Allein (7 min): Grundform mit der eigenen Ziel-Chance, dann eine Variante weiter (Warum will die Person das?) und eine genauer (Person und Moment).',
        'Zwei Proben, allein (5 min): zu jeder Frage zwei verschiedene Wege notieren. Fällt nur einer ein, steckt die Lösung schon in der Frage (Torres S. 94: „Is there more than one way to address this …?“). Dann: zu weit oder zu eng – Sweet Spot? Kursformat statt Vorlesen zu dritt, weil jede*r ein eigenes Produkt hat.',
        'Wählen und festhalten (3 min): eine Frage, ein Satz warum, in docs/HMW.md.',
      ],
      achten: [
        'Jede Frage beginnt mit „Wie könnten wir …“ und hängt an der Ziel-Chance.',
        'Aus Sicht der Kundschaft, nicht des Produkts.',
        'Die weitere Variante bleibt bei derselben Chance. Rutscht sie in eine Nachbar-Chance (wie H2 der Kaffeebar), ist sie ein Hinweis, nicht die Wahl.',
      ],
      fehler: [
        'Lösung in der Frage („… per App …“).',
        'Eine Zielzahl in der Frage.',
        'Drei Fragen, die sich nur in einem Wort unterscheiden.',
        '„Wie können wir“ statt „Wie könnten wir“.',
      ],
    },
    ueberleitung: 'Eine letzte Probe für die gewählte Frage.',
  },

  uebertrag: {
    live: [
      'Allein prüfen: Stehen bei der gewählten Frage zwei Wege?',
      'Nur einer?',
      '„Dann steckt die Lösung schon in der Frage.“',
      'Ausblick: Nach fünf Minuten Pause 15 bis 20 Ideen zu dieser Frage.',
    ],
    kern: [
      {
        text: 'Probe „mehr als ein Weg“ und Sweet Spot als Abschluss.',
        quelle: `${TORRES}, S. 94–95; ${BERGER}, S. 2`,
      },
    ],
    ueberleitung: 'Fünf Minuten Pause – um 13:35 geht es mit der Ideation weiter.',
  },
};
