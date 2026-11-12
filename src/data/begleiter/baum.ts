import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/baum.astro (Tag 2, 16:35–17:50). Kein Vorwissen eingetragen; der Baum
// ist seit Tag 1 der rote Faden, heute kommt die Ebene der Chancen dazu.
// Torres-Seiten = gedruckte Seiten aus quellen/torres/text.txt (Kap. 6, S. 78–95).
const TORRES = 'Teresa Torres, Continuous Discovery Habits';

export const NOTIZEN_BAUM: Record<string, Notiz> = {
  'nur-outcome': {
    live: [
      'Ist-Zeit notieren.',
      'Strich: jemand fragt ‚Wo sind wir?‘ oder nach einem Link.',
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
      'Freien Platz wählen (ohne Bedeutung); alle antworten auf der eigenen Seite.',
      'Timer 2 min: 1 oder 2, 7 oder 12, 9 oder 11.',
      'Dazu ein Satz: Welches Paar fiel am schwersten?',
      'Noch nicht aufdecken – erst alle drei abgeschickt.',
      'Falle: eine richtige Wahl andeuten – Torres nennt keine.',
      'Antwortrunde: wie viele von 3 ohne Nachhelfen?',
    ],
    uebung: { dauer: '2 min', form: 'allein, drei Nummern und ein Satz auf der Seite; dann gemeinsam aufdecken (Rückfall: laut)' },
    ablauf: {
      schritte: [
        'Folie zeigen, die Liste still lesen lassen.',
        'Alle öffnen die Folie auf dem eigenen Gerät und wählen einen freien Platz (Platz 1–3, ohne Bedeutung). Timer 2 min: Jede*r entscheidet drei Paare – 1 oder 2, 7 oder 12, 9 oder 11 –, tippt die drei Nummern und einen Satz zu dem Paar, das am schwersten fiel, und schickt ab. Der Beamer zeigt nur „2 von 3 haben geantwortet“.',
        'Erst wenn alle drei abgeschickt haben, zur nächsten Folie: Dort deckst du alle drei gleichzeitig auf. Steht auf der Seite „Antwort bitte laut sagen.“ (Server weg), sagt jede*r Nummer und Satz laut.',
      ],
      achten: [
        'Wer „weiß ich nicht“ schreiben will: trotzdem entscheiden, den Zweifel in den Satz – genau den beschreibt Torres („I don’t know how to compare“, S. 82).',
        'Nicht werten und nicht nachfragen, bevor aufgedeckt ist – sonst passen die anderen ihre Antwort an.',
        'Drei Plätze, je einer pro Person; Testantworten: auf der Seite ohne Beamer „Runde leeren“.',
      ],
    },
    kern: [
      {
        text: 'Die zwölf Chancen aus dem Streaming-Beispiel, wie sie viele Teams als Opportunity Backlog führen. Besser als eine Chance allein, aber eine flache Liste ist schwer zu priorisieren: „opportunities come in different shapes and sizes. Some opportunities are interrelated, while others are subsets of others.“',
        quelle: `${TORRES}, S. 81–82`,
      },
      {
        text: 'Die drei Paare sind die, die Torres selbst vergleicht: 1 und 2, 7 und 12, 9 und 11. Die erzwungene Wahl ist eine Übung dieses Kurses.',
        quelle: `${TORRES}, S. 82; Kursregel`,
      },
    ],
    ueberleitung: 'Alle drei abgeschickt? Dann decken wir gemeinsam auf – und sortieren die zwölf.',
  },

  warum: {
    live: [
      'Aufdecken, Sätze vorlesen: Welches Paar fiel am schwersten?',
      '1 oder 2: Teil gegen Ganzes – kein Entweder-oder.',
      '7 oder 12: Geschwister – ähnlich, nicht gleich.',
      '9 oder 11: groß gegen leicht – immer das Leichte zuerst?',
      '„Eine Liste mischt Großes, Kleines und Verwandtes.“',
      'Falle: eine Wahl richtig nennen; 4, 6, 8, 10 einsortieren.',
    ],
    verstaendnis: {
      frage: 'Warum lassen sich „Ich finde nichts zum Schauen“ und „Mir sind die Folgen ausgegangen“ schlecht gegeneinander priorisieren?',
      antwort: 'Das zweite ist ein Grund – aber nicht der einzige – für das erste. Sie stehen nicht nebeneinander („not distinct“), sondern als übergeordnete Chance und Teilchance (S. 82–83).',
      falsch: '„Weil beide gleich wichtig sind“ – es geht um ihre Beziehung, nicht um ihre Wichtigkeit.',
    },
    ablauf: {
      schritte: [
        'Auflösung per Knopf „Auflösung zeigen“ auf dem Beamer öffnen (öffnet bei allen; sonst erst um 23:59, Ende des Tages). Sie zeigt zuerst „Eure Sätze“ nach Platz; fehlt einer, laut sagen lassen. Vorlesen, ohne zu werten. Eure Nummern leuchten in der Sortierung auf (Nummer am Satzanfang; doppelt gewählt: ×2).',
        'Schritt für Schritt aufdecken, je Schritt ein Paar: Wer 1 gewählt hat – „Und welchen Teil davon zuerst?“; wer 2 – „Damit ist 1 nur zum Teil gelöst“ (S. 83). 7 oder 12 – „Hängt an den Bedingungen: offline, Steckdose“ (S. 82). Wer 11 – „Immer das Leichte zuerst?“; wer 9 – „Wo fangt ihr an?“ (S. 82, 84–85). Zuletzt 4 · 6 · 8 · 10.',
        'Fragen: Bei welchem Paar habt ihr zwei Gleichartige verglichen? Dann den letzten Satz aufdecken.',
      ],
      achten: [
        'Falle: 9 und 11 stehen nur zum Größenvergleich nebeneinander – keine Gruppe, 11 hängt nicht unter 9.',
        'Nur sortieren, was Torres sortiert: ihre Teilchancen von 9 sind anders formuliert (S. 84–85); 4, 6, 8 und 10 bleiben offen.',
      ],
      aufloesung: 'Nur bei 7 und 12 – Geschwister unter einer ergänzten Chance. 1 und 2 sind Ganzes und Teil, 9 und 11 verschieden groß. Torres: „It’s hard to answer these questions when prioritizing opportunities of different shapes and sizes against each other“ (S. 82).',
    },
    kern: [
      {
        text: '„Is this show any good?“ wirkt groß und schwer, „Who is that actor?“ leicht. „Should we always prioritize easy over hard?“ – „The opportunity space is too complex to manage as a flat list.“',
        quelle: `${TORRES}, S. 82`,
      },
      {
        text: 'Bäume zeigen zwei Beziehungen: übergeordnete Chance und Teilchance („a child opportunity (or sub-opportunity) is a subset of a parent opportunity“) und Geschwister. „I’m out of episodes …“ ist „one reason—but not the only reason“ für „I can’t find anything to watch“; „I can’t figure out how to search for a specific show“ und „The show I was watching is no longer available“ kommen „as siblings“ dazu.',
        quelle: `${TORRES}, S. 82–83`,
      },
      {
        text: '„I want to watch my shows on my flight“ und „… on my train commute“ hängen unter der übergeordneten Chance „I want to watch my shows on the go“: jeder Kontext ein eigenes Bedürfnis, die Ähnlichkeit bleibt sichtbar. Und: „the tree structure is going to be invaluable when it comes time to assessing and prioritizing opportunities.“',
        quelle: `${TORRES}, S. 84–85`,
      },
    ],
    ueberleitung: 'Torres’ Bild dazu: oben „Ich finde nichts zum Schauen“, darunter die Gründe.',
  },

  'eltern-kind': {
    live: [
      'Abbildung: der erste Mini-Baum von eben, wie Torres ihn zeichnet.',
      'Fragen: Welche anderen Gründe füllen die Fragezeichen?',
      '„Geschwister sind ähnlich, aber eines lässt sich ohne das andere lösen.“',
    ],
    kern: [
      {
        text: '„I can’t find anything to watch“ ist die übergeordnete Chance von „I’m out of episodes of my favorite shows“. Die Frage „What are some other reasons …?“ bringt Geschwister: „I can’t figure out how to search for a specific show“, „The show I was watching is no longer available“. Geschwister sind ähnlich, aber getrennt lösbar; wer eine Teilchance löst, löst die übergeordnete Chance zum Teil.',
        quelle: `${TORRES}, S. 82–83`,
      },
    ],
    ueberleitung: 'Was bringt euch das? Große Chancen werden lösbar.',
  },

  'gross-loesbar': {
    live: [
      'Fragen: Wie würdet ihr „Ist diese Serie gut?“ lösen?',
      'Aufdecken: die vier Teilchancen – Menschen wählen Serien verschieden.',
      '„Erst ‚Wer spielt mit?‘: klein, schnell geliefert, ein Bedürfnis ganz gelöst.“',
      'Brücke zu Tag 1: Wert nach und nach liefern.',
      'Wenn hinten: überspringen, Kern steht im Handout.',
    ],
    verstaendnis: {
      frage: 'Ist „Wer spielt mit?“ zu lösen nicht zu wenig, wenn die Frage „Ist diese Serie gut?“ lautet?',
      antwort: 'Es löst die große Chance nicht ganz, aber ein kleineres Bedürfnis vollständig – und liefert sofort Wert. Mit der Zeit sind so viele kleine gelöst, dass auch die große gelöst ist (S. 85).',
    },
    kern: [
      {
        text: 'Menschen lösen „Is this show any good?“ verschieden: nach der Art der Serie, nach den Schauspieler*innen. Daraus werden lösbarere Teilchancen: „What type of show is this?“, „Who is in this show?“, „Is this show similar to another show I’ve watched?“, „Who else is watching this show?“',
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
        'Pro Zeile die drei Fragen in die Runde stellen, Antworten laut sammeln.',
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
      'Abbildung: Flugzeug und Zug bekommen „unterwegs schauen“ darüber.',
      '„Ergänzte übergeordnete Chancen sind erlaubt – sie folgen aus den Teilchancen.“',
      'Fragen: Wie lange darf der erste Baum dauern?',
      'Erwartet: nicht 30 Minuten, aber auch nicht stundenlang feilen.',
    ],
    kern: [
      {
        text: 'Ast für Ast: Ähnliches gruppieren. Geschwister bekommen eine übergeordnete Chance, die man ergänzen darf, wenn sie nicht gesagt wurde; was dasselbe meint, wird eine Chance („Entering a show name into the search box is hard“). Mini-Bäume weiter gruppieren, bis sie unter dem Moment hängen.',
        quelle: `${TORRES}, S. 89–91`,
      },
      {
        text: '„If you do your first tree in 30 minutes and think you are done, you are probably not thinking hard enough.“ Das Gegenteil, stundenlang am perfekten Baum zu feilen, ist auch falsch. „Do just enough to capture what you currently know.“',
        quelle: `${TORRES}, S. 91`,
      },
    ],
    ueberleitung: 'Jetzt die Anti-Muster: zwei ausführlich, vier im Überblick.',
  },

  firmensicht: {
    live: [
      'Fragen: Wer würde „mehr Streaming-Abos“ je so sagen?',
      '„Haben wir das gehört? Bei ergänzten übergeordneten Chancen: Kann ich mir vorstellen, dass jemand das sagt?“',
      'Kaffeebar-Probe: „mehr Umsatz am Morgen“ wäre Firmensicht.',
    ],
    verstaendnis: {
      frage: 'Woran erkennt ihr eine Chance aus Firmensicht?',
      antwort: 'Niemand aus der Zielgruppe würde sie so sagen. Test: Haben wir das in Interviews gehört? Bei ergänzten übergeordneten Chancen: Kann ich mir vorstellen, dass jemand das sagt – oder wünschen wir es uns nur (S. 92)?',
    },
    kern: [
      {
        text: '„No customer would ever say, ‚I wish I had more streaming-entertainment subscriptions.‘ But they might say, ‚I want access to more compelling content.‘ Review each opportunity on your tree and ask, ‚Have we heard this in interviews?‘“ Für ergänzte übergeordnete Chancen: „Can I imagine a customer saying this?“',
        quelle: `${TORRES}, S. 91–92`,
      },
    ],
    ueberleitung: 'Der zweite Fehler zeigt sich an der Form des Baums.',
  },

  senkrecht: {
    live: [
      'Abbildung: eine Kette, kein Baum.',
      'Frag den Raum (Box unten): erst „dasselbe?“, dann „fehlen Geschwister?“.',
      'Zettel „Nächstes Interview: …“ ist Kursregel; Torres: in Interviews erkunden.',
      'Wenn hinten: überspringen, steht auf der Checkliste (anti-muster).',
    ],
    kern: [
      {
        text: 'Senkrechte Kette („vertical opportunities“): eine Chance mit nur einer Teilchance, die wieder nur eine Teilchance hat. Zwei Ursachen: Mehrere Interviews sagen dasselbe in anderen Worten – dann eine Chance daraus machen und den Rest streichen. Oder Geschwister fehlen: Löst jede Teilchance die übergeordnete Chance nur zum Teil, die fehlenden ergänzen; unbekannt, dann die übergeordnete Chance in den nächsten Interviews erkunden.',
        quelle: `${TORRES}, S. 93–94`,
      },
    ],
    verstaendnis: {
      frage: 'Was prüft ihr bei Torres’ Kette – und in welcher Reihenfolge?',
      antwort: 'Erst: Sagen die Stufen dasselbe in anderen Worten? Dann zu einer Chance zusammenfassen. Sonst: Löst jede Stufe die darüber nur zum Teil? Dann fehlen Geschwister (S. 93–94). Welcher Fall die Abbildung ist, sagt Torres nicht. Unsere Lesart: „Is this show any good?“ und „Will I like this show?“ sagen fast dasselbe; „I don\'t like it when I start a show and it isn\'t good.“ löst die mittlere nur zum Teil – Geschwister wie „Who is in this show?“ (S. 84–85) fehlen.',
      falsch: '„Es fehlen Geschwister“ als einzige Prüfung – zuerst kommt die Frage, ob die Stufen dasselbe sagen.',
    },
    ueberleitung: 'Vier weitere Anti-Muster, je mit einem Beispiel.',
  },

  'vier-muster': {
    live: [
      'Fragen: Was stimmt an jedem Beispiel nicht?',
      'Aufdecken: Karte für Karte, dann die bessere Fassung sagen (Handout).',
      'Falle: „Glücksspiel“ als Einzelfall abtun – I4-2 stützt eine belegte Chance.',
      'Wenn hinten: überspringen, steht auf der Checkliste (anti-muster).',
    ],
    verstaendnis: {
      frage: 'Warum kommt „Anstellen ist ein Glücksspiel“ nicht so in den Baum?',
      antwort: 'Es ist ein Gefühl. Gefühle lassen sich nicht lösen, ihre Ursache schon: „Wenn ich anstehe, verpasse ich meinen Zug“ (I2-2, I3-4, I4-2; Torres S. 95).',
      falsch: '„Weil es nur eine Person gesagt hat“ – I4-2 stützt eine Chance, die drei Interviews belegen.',
    },
    kern: [
      {
        text: 'Zu breit: „If you are finding that an opportunity should ladder up to more than one parent, it’s framed too broadly. Get more specific. Define one opportunity for each moment in time …“ Beispiel von S. 88: „The interface is hard to use“ wird zu „I can’t figure out how to find a specific show that I have in mind“, „I don’t like entering a show name using the remote“, „I can’t remember what episode I watched last“.',
        quelle: `${TORRES}, S. 88, 94`,
      },
      {
        text: 'Nicht konkret: „I wish this was easy to use“, „This is too hard“, „I want to do everything on the go“ sind Themen, Gestaltungsregeln oder Stimmungen; konkreter: „I wish finding a show to watch was easier“, „Entering a movie title using the remote is hard“, „I want to watch shows on my train commute“.',
        quelle: `${TORRES}, S. 94`,
      },
      {
        text: 'Lösung statt Chance, Test: „Is there more than one way to address this opportunity?“ Kaffeebar: „Per App vorbestellen“ (Snapshot-Beispiel Tag 1) ist eine Lösung, dahinter „Ich will den Zug nicht verpassen“ (Folie drei-fragen). Gefühl: „We can’t fix feelings“, ihre Ursache schon. Kaffeebar: „Anstellen ist ein Glücksspiel“ (I4-2) ist eher ein Gefühl, die Ursache „Wenn ich anstehe, verpasse ich meinen Zug“ (Folie beispiel).',
        quelle: `${TORRES}, S. 94–95; Kaffeebar: baum.astro, drei-fragen und beispiel`,
      },
    ],
    ueberleitung: 'So sieht der Baum der Kaffeebar nach fünf Interviews aus.',
  },

  beispiel: {
    live: [
      'Momente oben, darunter nur Chancen aus mindestens zwei Interviews.',
      'Fragen: Sind die zwei Zeit-Chancen in der Halle Geschwister?',
      'Aufdecken: Was nur eine Person sagte, bleibt draußen.',
      '„Unter ‚Ich bin im Zug‘ hängt noch nichts – eine Frage fürs nächste Interview.“',
    ],
    verstaendnis: {
      frage: 'Sind „Geht sich ein Kaffee noch aus?“ und „Wenn ich anstehe, verpasse ich meinen Zug.“ Geschwister?',
      antwort: 'Ja: Man kann das eine erfüllen, ohne das andere zu erfüllen – beide sind eigene Bedürfnisse in der Halle (Torres S. 83). Unter dem Warte-Moment hängt nur „Wann ist mein Kaffee fertig?“: noch keine senkrechte Kette (S. 94), aber eine Frage fürs nächste Interview.',
    },
    ueberleitung: 'Wo ihr das baut: euer Baum auf Miro.',
  },

  'euer-baum': {
    live: [
      'Zeit: 5 min Torres-Abbildung neben „Baum · Beispiel Kaffeebar“ zeigen.',
      '„Der Baum von Tag 1 war unsere Vermutung. Die Wurzel bleibt, die Äste kommen aus fünf Interviews.“',
      '„‚Vorbestellen‘ ist gefallen: 3 von 5 entscheiden erst in der Halle (D4).“',
      'Zeit: 3 min Griffe vorführen – Cmd+D, Linie ziehen, eine Karte darüber.',
      'Hewen: zuerst den Outcome wählen, dann die Momente darunter.',
    ],
    miro: {
      frame: 'Baum · Beispiel Kaffeebar',
      schritte: [
        '„Alle zu mir holen“ auf Baum · Beispiel Kaffeebar; die Folie mit der Torres-Abbildung daneben.',
        'Ebenen von oben zeigen: Outcome grün, Momente blau, Chancen gelb; Lösungen und Tests kommen an Tag 3.',
        'Vorführen: Karte mit Cmd+D duplizieren, vom blauen Punkt der oberen Karte zur unteren ziehen, Karte verschieben – die Linie geht mit.',
        'Jede*r öffnet „Baum · eigener Name“: Outcome und je eine blaue und gelbe Karte stehen schon.',
      ],
    },
    kern: [
      {
        text: 'Der Baum von oben nach unten: ein Outcome, darunter Chancen über mehrere Ebenen, unter einer Ziel-Chance mehrere Lösungen, unter jeder Lösung Annahmen-Tests.',
        quelle: `${TORRES}, S. 26–27`,
      },
      {
        text: 'Kaffeebar, Entscheidungslog D4: „Vorbestellen vor der Ankunft verworfen“ – 3 von 5 sagen, sie entscheiden erst in der Halle (Belege I2-4, I3-1, I5-3).',
        quelle: 'Werkstatt, Beispiel Kaffeebar, Entscheidungslog D4',
      },
    ],
    ueberleitung: 'Jetzt euer Baum: Inventar, Struktur, Gegenlesen.',
  },

  vorgehen: {
    live: [
      'Timer 12 min: erst Momente als blaue Karten, dann Inventar.',
      'Nach 12 min: Struktur allein, Linien ziehen, Timer 10 min.',
      'Nach 22 min: weiter zur Checkliste, Timer 12 min dort.',
      'Nach 34 min: Prüfliste, dann Claude mit Bild des Baums.',
    ],
    uebung: { dauer: '39 min (12 + 10 + 12 + 5)', form: 'allein, dann zu dritt reihum' },
    miro: {
      frame: 'Baum · Beispiel Kaffeebar',
      schritte: [
        'Jede*r arbeitet im eigenen Frame „Baum · Name“ rechts neben der Kaffeebar; T2 · 2 ist nur die Anleitung.',
        'Momente aus T2 · 1 als blaue Reihe unter den Outcome, darunter gelbe Chancen mit Zitat-ID.',
        'Jede Karte hängt mit einer Linie an genau einer Karte darüber; was nur eine Person gesagt hat, in den Streifen „Nur in einem Interview“.',
        'Gegenlesen: Die anderen kommentieren im fremden Baum, statt zu verschieben.',
      ],
    },
    ablauf: {
      schritte: [
        'Inventar allein (12 min): zuerst die Momente aus T2 · 1 als blaue Karten unter den Outcome (Cmd+D), dann jede Chance durch die drei Fragen, in „Baum · Name“ unter ihren Moment; Einzelfälle in den Streifen „Nur in einem Interview“.',
        'Struktur allein (10 min): Ast für Ast gruppieren, übergeordnete Chancen ergänzen und mit „(ergänzt)“ beschriften, Dubletten zusammenlegen, jede Karte per Linie an genau eine Karte darüber; fehlen Geschwister, Zettel „Nächstes Interview: …“ neben die Karte.',
        'Gegenlesen reihum (12 min, Timer auf der Folie Anti-Muster): je Baum vier Minuten, die anderen beiden gehen die Checkliste der sechs Anti-Muster durch.',
        'Prüfen (5 min): Prüfliste, dann Claude mit einem Bild des Baums aus Miro; eine Datei gibt es nicht. Einen Befund wählen, die Frage selbst beantworten: ändern auf Miro oder lassen, Zeile ins Log; der Rest bis Tag 3.',
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
        'Karten ohne Linie oder an zwei Chancen – dann ist die Chance zu breit.',
      ],
    },
    ueberleitung: 'Für das Gegenlesen: die Checkliste auf der nächsten Folie.',
  },

  'anti-muster': {
    live: [
      'Timer 12 min hier starten, Folie stehen lassen.',
      'Pro Baum vier Minuten, dann wechseln.',
      'Folie vier-muster übersprungen? Dann 3 bis 6 kurz erklären.',
      'Falle: Gefühl als Chance – nach der Ursache fragen.',
    ],
    kern: [
      {
        text: 'Hängt an zwei Chancen: Sind die obersten Chancen eigene Zeitpunkte, hängt keine Chance an zwei übergeordneten Chancen; sonst ist sie zu breit. Nicht konkret: Themen, Gestaltungsregeln, Stimmungen („This is too hard“) sind keine Chancen, „Entering a movie title using the remote is hard“ schon.',
        quelle: `${TORRES}, S. 94`,
      },
      {
        text: 'Lösung statt Chance: „I wish I could fast-forward through commercials“ lässt nur einen Weg zu; dahinter „I don’t like commercials“ – unterhaltsamere Werbung, Vorspulen, Abo ohne Werbung. Gefühle: ein Signal, dass eine Chance in der Nähe ist; „We can’t fix feelings“, ihre Ursache schon.',
        quelle: `${TORRES}, S. 94–95`,
      },
    ],
    fragen: [
      {
        frage: 'Was ist an „Ich will Werbung vorspulen“ falsch?',
        antwort: 'Es lässt nur eine Lösung zu, ist also eine Lösung statt einer Chance. Die Chance dahinter, „Ich mag keine Werbung“, lässt mehrere zu (Torres S. 94–95).',
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
