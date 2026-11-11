import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/baum.astro (Tag 2, 16:30–17:45). Kein Vorwissen eingetragen; der Baum
// ist seit Tag 1 der rote Faden, heute kommt die Ebene der Chancen dazu.
// Torres-Seiten = gedruckte Seiten aus quellen/torres/text.txt (Kap. 6, S. 78–95).
const TORRES = 'Teresa Torres, Continuous Discovery Habits';

export const NOTIZEN_BAUM: Record<string, Notiz> = {
  'nur-outcome': {
    live: [
      '„Aus einer Geschichte kommen Dutzende Chancen – euer Job sind die, die den Outcome treiben.“',
      'Abbildung von Tag 1 wiedererkennen lassen.',
      'Fragen: Wie heißt euer Outcome im Produkt-Brief?',
    ],
    kern: [
      {
        text: '„A single customer story might elicit dozens of opportunities.“ – „our job is not to address every customer opportunity. Our job is to address customer opportunities that drive our desired outcome. This is how we create value for our business while creating value for our customers.“ Zuerst die Chancen mit der größten Wirkung auf den Outcome; dafür erst eine Bestandsaufnahme.',
        quelle: `${TORRES}, S. 80`,
      },
      {
        text: 'Die Abbildung „Only include opportunities that are relevant to your outcome“ stand auf Tag 1.',
        quelle: `${TORRES}, S. 27`,
      },
    ],
    ueberleitung: 'Welche zuerst? Probiert es an zwölf Chancen.',
  },

  zwoelf: {
    live: [
      'Liste nicht erklären, alle lesen still.',
      'Timer 2 min: ein Satz in den Chat, abschicken auf dein Zeichen.',
      'Dann vorlesen: Wer hat wie verglichen?',
      'Falle: eine richtige Antwort andeuten – es gibt keine.',
    ],
    uebung: { dauer: '2 min', form: 'allein, ein Satz in den Teams-Chat' },
    ablauf: {
      schritte: [
        'Folie zeigen, die Liste still lesen lassen.',
        'Timer 2 min: Jede*r tippt, welche Chance zuerst und warum – noch nicht abschicken.',
        'Auf dein Zeichen abschicken, Sätze vorlesen, nicht werten. Dann zur nächsten Folie.',
      ],
      achten: [
        'Wer „Wer ist dieser Schauspieler?“ nimmt, weil leicht: genau die Frage, die Torres stellt – immer das Leichte vor dem Schweren?',
      ],
    },
    kern: [
      {
        text: 'Die zwölf Chancen aus dem Streaming-Beispiel, wie sie viele Teams als Opportunity Backlog führen. Besser als eine Chance allein, aber eine flache Liste ist schwer zu priorisieren: „opportunities come in different shapes and sizes. Some opportunities are interrelated, while others are subsets of others.“',
        quelle: `${TORRES}, S. 81–82`,
      },
    ],
    ueberleitung: 'Wenn euch der Vergleich schwerfiel: Genau das ist der Punkt.',
  },

  warum: {
    live: [
      'Mit den Chat-Sätzen verbinden: Wer stockte beim Vergleichen?',
      '„Eine flache Liste mischt Eltern, Kinder und Geschwister.“',
      'Beispiel Flugzeug und Zug: ähnlich, aber offline, Steckdose, Netz.',
    ],
    verstaendnis: {
      frage: 'Warum lassen sich „Ich finde nichts zum Schauen“ und „Mir sind die Folgen ausgegangen“ schlecht gegeneinander priorisieren?',
      antwort: 'Das zweite ist ein Grund – aber nicht der einzige – für das erste. Sie sind nicht unterscheidbar, sondern Eltern und Kind (S. 82).',
      falsch: '„Weil beide gleich wichtig sind“ – es geht um ihre Beziehung, nicht um ihre Wichtigkeit.',
    },
    kern: [
      {
        text: '„Is this show any good?“ wirkt groß und schwer, „Who is that actor?“ leicht. „Should we always prioritize easy over hard?“ – „The opportunity space is too complex to manage as a flat list.“',
        quelle: `${TORRES}, S. 82`,
      },
      {
        text: 'Bäume zeigen zwei Beziehungen: Eltern und Kinder (ein Kind ist eine Teilmenge der Eltern-Chance) und Geschwister.',
        quelle: `${TORRES}, S. 82`,
      },
    ],
    ueberleitung: 'Der Baum zeigt beides: Eltern und Kinder, Geschwister.',
  },

  'eltern-kind': {
    live: [
      'Abbildung: das Kind ist ein Grund, nicht der einzige.',
      'Fragen: Welche anderen Gründe füllen die Fragezeichen?',
      '„Geschwister sind ähnlich, aber eines lässt sich ohne das andere lösen.“',
    ],
    kern: [
      {
        text: '„I can’t find anything to watch“ ist die Eltern-Chance von „I’m out of episodes of my favorite shows“. Die Frage „What are some other reasons …?“ bringt Geschwister: „I can’t figure out how to search for a specific show“, „The show I was watching is no longer available“. Geschwister sind ähnlich, aber getrennt lösbar; wer ein Kind löst, löst die Eltern-Chance zum Teil.',
        quelle: `${TORRES}, S. 82–83`,
      },
    ],
    ueberleitung: 'Was bringt euch das? Große Chancen werden lösbar.',
  },

  'gross-loesbar': {
    live: [
      'Fragen: Wie würdet ihr „Ist diese Serie gut?“ lösen?',
      'Aufdecken: die vier Kinder – Menschen wählen Serien verschieden.',
      '„Erst ‚Wer spielt mit?‘: klein, schnell geliefert, ein Bedürfnis ganz gelöst.“',
      'Brücke zu Tag 1: Wert nach und nach liefern.',
    ],
    verstaendnis: {
      frage: 'Ist „Wer spielt mit?“ zu lösen nicht zu wenig, wenn die Frage „Ist diese Serie gut?“ lautet?',
      antwort: 'Es löst die große Chance nicht ganz, aber ein kleineres Bedürfnis vollständig – und liefert sofort Wert. Mit der Zeit sind so viele kleine gelöst, dass auch die große gelöst ist (S. 85).',
    },
    kern: [
      {
        text: 'Menschen lösen „Is this show any good?“ verschieden: nach der Art der Serie, nach den Schauspieler*innen. Daraus werden lösbarere Kinder: „What type of show is this?“, „Who is in this show?“, „Is this show similar to another show I’ve watched?“, „Who else is watching this show?“',
        quelle: `${TORRES}, S. 84–85`,
      },
      {
        text: 'Der Wert ist zweifach: Scheinbar Unlösbares wird lösbar, und Wert lässt sich nach und nach liefern – „at the heart of the Agile manifesto“. „Who is in this show?“ ist recht leicht und für viele ein Kriterium; so liefert man schnell.',
        quelle: `${TORRES}, S. 85`,
      },
    ],
    ueberleitung: 'Jetzt der Weg zum eigenen Baum: erst das Inventar.',
  },

  inventar: {
    live: [
      'Drei Fragen langsam vorlesen, jede einzeln.',
      '„Alle drei Ja – erst dann kommt die Chance in den Baum.“',
      'Falle: zu breite Chance, die unter zwei Momente passt.',
    ],
    kern: [
      {
        text: 'Für jede Chance aus den Snapshots: Bedürfnis, Schmerzpunkt oder Wunsch und keine Lösung? In mehr als einem Interview gehört? Treibt sie den Outcome? Alle drei Ja: unter den Ast, in dem sie vorkommt. Passt sie unter mehr als einen, ist sie zu breit – „The interface is hard to use“ wird zu mehreren genaueren Chancen.',
        quelle: `${TORRES}, S. 88`,
      },
    ],
    ueberleitung: 'Probieren wir es live an der Kaffeebar.',
  },

  'drei-fragen': {
    live: [
      'Zeile für Zeile: alle beantworten die drei Fragen laut.',
      'Erst nach der letzten Zeile aufdecken.',
      'Fragen: Was steckt hinter „per App vorbestellen“?',
      '„Nur bei einer Person? Bleibt auf dem Snapshot, kann wiederkommen.“',
    ],
    verstaendnis: {
      frage: '„Wenn der erste Schluck passt, ist der Morgen gerettet“ klingt wichtig. Warum kommt es nicht in den Baum?',
      antwort: 'Nur I1 hat es erzählt (I1-4); die zweite Frage, in mehr als einem Interview gehört, ist ein Nein. Es bleibt auf dem Snapshot – oft taucht so etwas später bei anderen wieder auf (S. 70, 88).',
      falsch: '„Weil es den Outcome nicht treibt“ – darüber entscheidet erst Frage 3, und die stellt sich hier nicht mehr.',
    },
    ablauf: {
      schritte: [
        'Pro Zeile die drei Fragen an den Raum stellen, Antworten sammeln.',
        'Nach der letzten Zeile den Schritt aufdecken: Dann erscheinen alle Antworten.',
      ],
      aufloesung: '„Per App vorbestellen“: Lösung, dahinter „Ich will den Zug nicht verpassen“. „Wenn ich anstehe, verpasse ich den Zug“ (I2, I3, I4) und „Wann ist mein Kaffee fertig?“ (I2, I3): in den Baum. Erster Schluck (nur I1) und Mitbestellen (nur I5): bleiben auf dem Snapshot.',
    },
    kern: [
      {
        text: 'Die drei Fragen: „Is this opportunity framed as a customer need, pain point, or desire and not a solution?“ – „Is this opportunity unique to this customer, or have we seen it in more than one interview?“ – „If we address this opportunity, will it drive our desired outcome?“',
        quelle: `${TORRES}, S. 88`,
      },
    ],
    ueberleitung: 'Was durchkommt, wird jetzt geordnet: Ast für Ast.',
  },

  struktur: {
    live: [
      'Abbildung: Flugzeug und Zug bekommen „unterwegs schauen“ als Eltern.',
      '„Ergänzte Eltern sind erlaubt – sie folgen aus den Kindern.“',
      'Fragen: Wie lange darf der erste Baum dauern?',
      'Erwartet: nicht 30 Minuten, aber auch nicht stundenlang feilen.',
    ],
    kern: [
      {
        text: 'Ast für Ast: Ähnliches gruppieren. Geschwister bekommen eine Eltern-Chance, die man ergänzen darf, wenn sie nicht gesagt wurde; was dasselbe meint, wird eine Chance („Entering a show name into the search box is hard“). Mini-Bäume weiter gruppieren, bis sie unter dem Moment hängen.',
        quelle: `${TORRES}, S. 89–91`,
      },
      {
        text: '„If you do your first tree in 30 minutes and think you are done, you are probably not thinking hard enough.“ Das Gegenteil, stundenlang am perfekten Baum zu feilen, ist auch falsch. „Do just enough to capture what you currently know.“',
        quelle: `${TORRES}, S. 91`,
      },
    ],
    ueberleitung: 'Zwei Fehler seht ihr euch jetzt an, die anderen vier prüft ihr beim Gegenlesen.',
  },

  firmensicht: {
    live: [
      'Fragen: Wer würde „mehr Streaming-Abos“ je so sagen?',
      '„Haben wir das gehört? Bei ergänzten Eltern: Kann ich mir vorstellen, dass jemand das sagt?“',
      'Kaffeebar-Probe: „mehr Umsatz am Morgen“ wäre Firmensicht.',
    ],
    verstaendnis: {
      frage: 'Woran erkennt ihr eine Chance aus Firmensicht?',
      antwort: 'Niemand aus der Zielgruppe würde sie so sagen. Test: Haben wir das in Interviews gehört? Bei ergänzten Eltern: Kann ich mir vorstellen, dass jemand das sagt – oder wünschen wir es uns nur (S. 92)?',
    },
    kern: [
      {
        text: '„No customer would ever say, ‚I wish I had more streaming-entertainment subscriptions.‘ But they might say, ‚I want access to more compelling content.‘ Review each opportunity on your tree and ask, ‚Have we heard this in interviews?‘“ Für ergänzte Eltern: „Can I imagine a customer saying this?“',
        quelle: `${TORRES}, S. 91–92`,
      },
    ],
    ueberleitung: 'Der zweite Fehler zeigt sich an der Form des Baums.',
  },

  senkrecht: {
    live: [
      'Abbildung: ein Stapel, kein Baum.',
      'Fragen: Sagen die drei dasselbe, oder fehlen Geschwister?',
      '„Wisst ihr nicht, welche fehlen? Dann ist das die Frage fürs nächste Interview.“',
    ],
    kern: [
      {
        text: 'Senkrechte Chancen: ein Elternteil mit einem Kind, das wieder nur ein Kind hat. Zwei Ursachen: Mehrere Interviews sagen dasselbe in anderen Worten – dann eine Chance daraus machen und den Rest streichen. Oder Geschwister fehlen: Löst jedes Kind die Eltern nur zum Teil, die fehlenden ergänzen; unbekannt, dann die Eltern-Chance in den nächsten Interviews erkunden.',
        quelle: `${TORRES}, S. 93–94`,
      },
    ],
    ueberleitung: 'So sieht der Baum der Kaffeebar nach fünf Interviews aus.',
  },

  beispiel: {
    live: [
      'Momente oben, darunter nur Chancen aus mindestens zwei Interviews.',
      'Fragen: Ist „Ich stehe an“ mit nur einer Chance senkrecht?',
      'Aufdecken: Was nur eine Person sagte, bleibt draußen.',
      '„Unter ‚Ich bin im Zug‘ hängt noch nichts – eine Frage fürs nächste Interview.“',
    ],
    verstaendnis: {
      frage: 'Ist „Ich stehe an“ mit nur einer Chance darunter ein senkrechter Stapel?',
      antwort: 'Noch nicht: Senkrecht heißt, unter einem einzelnen Kind folgt wieder genau ein Kind. Ein Ast mit einer Chance ist ehrlich – mehr haben fünf Interviews nicht hergegeben –, aber ein Hinweis, wonach ihr als Nächstes fragt (Handout; Torres S. 94).',
    },
    ueberleitung: 'Jetzt euer Baum: Inventar, Struktur, Gegenlesen.',
  },

  vorgehen: {
    live: [
      'Schritte aus dem Handout in den Teams-Chat kopieren.',
      'Timer 12 min: Inventar allein, unter die eigenen Momente.',
      'Nach 12 min: Struktur allein, Ast für Ast, Timer 10 min.',
      'Nach 22 min: Gegenlesen mit Checkliste, vier Minuten je Baum.',
      'Nach 34 min: BAUM.md, Prüfliste, Claude.',
    ],
    uebung: { dauer: '39 min (12 + 10 + 12 + 5)', form: 'allein, dann zu dritt reihum' },
    miro: {
      frame: 'T2 · 2 · Opportunity Solution Tree',
      schritte: [
        '„Alle zu mir holen“ auf T2 · 2; links die Kaffeebar: Outcome, drei Momente mit ihren Chancen, unten „Nur in einem Interview“.',
        'Allein in der eigenen Spalte: Momente aus T2 · 1 als oberste Reihe, darunter die Chancen aus den Snapshots.',
        'Was nur eine Person gesagt hat, ins gelbe Feld „Nur in einem Interview“.',
        'Gegenlesen: Die anderen kommentieren in fremden Spalten, statt zu verschieben.',
      ],
    },
    ablauf: {
      schritte: [
        'Schritte in den Teams-Chat kopieren (Karte „Für den Teams-Chat“ im Handout dieser Folie).',
        'Inventar allein (12 min): jede Chance durch die drei Fragen, unter ihren Moment.',
        'Struktur allein (10 min): Ast für Ast gruppieren, Eltern ergänzen, Dubletten zusammenlegen.',
        'Gegenlesen reihum (12 min): je Baum vier Minuten, die anderen beiden gehen die Checkliste der sechs Anti-Muster durch (nächste Folie).',
        'Festhalten und prüfen (5 min): docs/BAUM.md, Prüfliste, Claude.',
      ],
      achten: [
        'Chancen in den Worten der Kundschaft und mit Zitat-IDs aus mindestens zwei Interviews – ohne ID kein Beleg.',
        'Passt eine Chance unter zwei Momente, ist sie zu breit (Torres S. 88).',
        'Was offen bleibt, wird eine Frage für die nächsten Interviews.',
      ],
      fehler: [
        'Lösungen als Chancen („App“, „Express-Theke“).',
        'Alles aus jedem Snapshot übernehmen, ohne die drei Fragen.',
        'Am perfekten Baum feilen und das Gegenlesen verpassen.',
      ],
    },
    ueberleitung: 'Für das Gegenlesen: die Checkliste auf der nächsten Folie.',
  },

  'anti-muster': {
    live: [
      'Folie stehen lassen, solange alle gegenlesen.',
      'Pro Baum vier Minuten, dann wechseln.',
      'Punkte 1 und 2 sind bekannt, 3 bis 6 kurz erklären.',
      'Falle: Gefühl als Chance – nach der Ursache fragen.',
    ],
    kern: [
      {
        text: 'Mehrere Eltern: Sind die obersten Chancen eigene Zeitpunkte, hat keine Chance zwei Eltern; sonst ist sie zu breit. Nicht konkret: Themen, Gestaltungsregeln, Stimmungen („This is too hard“) sind keine Chancen, „Entering a movie title using the remote is hard“ schon.',
        quelle: `${TORRES}, S. 94`,
      },
      {
        text: 'Verkleidete Lösung: „I wish I could fast-forward through commercials“ lässt nur einen Weg zu; dahinter „I don’t like commercials“ – unterhaltsamere Werbung, Vorspulen, Abo ohne Werbung. Gefühle: ein Signal, dass eine Chance in der Nähe ist; „We can’t fix feelings“, ihre Ursache schon.',
        quelle: `${TORRES}, S. 94–95`,
      },
    ],
    fragen: [
      {
        frage: 'Was ist an „Ich will Werbung vorspulen“ falsch?',
        antwort: 'Es lässt nur eine Lösung zu, ist also eine verkleidete Lösung. Die Chance dahinter, „Ich mag keine Werbung“, lässt mehrere zu (Torres S. 94–95).',
      },
    ],
    ueberleitung: 'Zum Schluss eine Frage an euren Baum.',
  },

  uebertrag: {
    live: [
      'Fragen: Welcher Ast ist der vollste – und ist das der wichtigste?',
      '„Voll heißt nur: Dort habt ihr viel gehört.“',
      'Ausblick: Vergleichen und eine Ziel-Chance wählen an Tag 3.',
    ],
    ueberleitung: 'Jetzt zum Abschluss des Tages.',
  },
};
