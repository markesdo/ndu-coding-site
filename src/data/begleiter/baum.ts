import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/baum.astro (Tag 3, 09:25–10:30; bis 12.11. für Tag 2 geplant, bis 19.11. 09:05–10:20). Kein
// Vorwissen eingetragen; der Baum ist seit Tag 1 der rote Faden, heute kommt die Ebene der Chancen dazu.
// Torres-Seiten = gedruckte Seiten aus quellen/torres/text.txt (Kap. 6, S. 78–95).
const TORRES = 'Teresa Torres, Continuous Discovery Habits';

export const NOTIZEN_BAUM: Record<string, Notiz> = {
  'nur-outcome': {
    live: [
      'Ist-Zeit notieren.',
      'Strich: jemand fragt ‚Wo sind wir?‘ oder nach einem Link.',
      'Seera erzählen: Geschäft bricht ein, zwei Bäume, neue Strategie in Wochen.',
      '„Aus einer Geschichte kommen Dutzende Chancen – euer Job sind die, die den Outcome treiben.“',
      'Fragen: Wie heißt euer Outcome im Produkt-Brief?',
    ],
    geschichte: {
      text: 'Torres eröffnet das Kapitel mit Ahmed Guijou, Product Director bei der Seera Group. März 2020: Saudi-Arabien, Heimat der meisten Kund*innen, schließt die Grenzen, das Geschäft mit Hotelbuchungen bricht über Nacht ein. Zugleich buchen Kund*innen häufiger Istrahas – große Anwesen mit Außenbereich, Grill und Pool, die man tageweise für Treffen in der Nähe mietet; das wusste das Team aus früheren Interviews. Es interviewt Gastgeber*innen und Gäste und findet auf beiden Seiten zahllose Chancen. „Rather than getting overwhelmed, they started mapping out the needs of each group on respective opportunity solution trees.“ Ein paar Wochen sammelt und sortiert das Team, bis Muster sichtbar werden; mit jedem Interview ändert sich die Struktur. Dann vergleicht es: Wo überschneiden sich die Bedürfnisse beider Seiten, was kann die Konkurrenz gut, wo sind Lücken? In wenigen Wochen kommt es vom eingebrochenen Geschäft zu einer neuen Marktchance und einer Produktstrategie. „That’s the power of opportunity mapping.“',
      quelle: `${TORRES}, S. 78–79`,
    },
    kern: [
      {
        text: '„A single customer story might elicit dozens of opportunities.“ – „our job is not to address every customer opportunity. Our job is to address customer opportunities that drive our desired outcome. This is how we create value for our business while creating value for our customers.“ Zuerst die Chancen mit der größten Wirkung auf den Outcome; dafür erst eine Bestandsaufnahme.',
        quelle: `${TORRES}, S. 80`,
      },
      {
        text: 'Die Abbildung „Only include opportunities that are relevant to your outcome“ stand auf Tag 1. Wofür der Baum da ist: „Mapping the opportunity space is how we give structure to the ill-structured problem of reaching our desired outcome.“',
        quelle: `${TORRES}, S. 27, 80`,
      },
    ],
    ueberleitung: 'Welche zuerst? Probiert es an zwölf Chancen.',
  },

  zwoelf: {
    live: [
      'Liste nicht erklären, alle lesen still.',
      'Timer 2 min: drei Paare, jede*r für sich.',
      'Reihum laut: drei Nummern und ein Satz zum schwersten Paar.',
      'Mitschreiben: wer welche Nummer, für die nächste Folie.',
      'Falle: eine richtige Wahl andeuten – Torres nennt keine.',
    ],
    uebung: { dauer: '2 min + 1 min reihum', form: 'allein entscheiden, dann reihum laut: drei Nummern und ein Satz' },
    ablauf: {
      schritte: [
        'Folie zeigen, die Liste still lesen lassen.',
        'Timer 2 min: Jede*r entscheidet für sich drei Paare – 1 oder 2, 7 oder 12, 9 oder 11 – und überlegt sich einen Satz zu dem Paar, das am schwersten fiel. Nichts tippen.',
        'Schritt aufdecken, dann reihum laut: Jede*r sagt die drei Nummern und den Satz. Du notierst die Nummern, damit du auf der nächsten Folie sagen kannst, wer was gewählt hat.',
      ],
      achten: [
        'Wer „weiß ich nicht“ sagen will: trotzdem entscheiden, den Zweifel in den Satz – genau den beschreibt Torres („I don’t know how to compare“, S. 82).',
        'Nicht werten und nicht nachfragen, bis alle drei gesprochen haben – sonst passen die anderen ihre Antwort an.',
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
    ueberleitung: 'Alle drei gehört? Dann sortieren wir die zwölf.',
  },

  warum: {
    live: [
      '1 oder 2: Teil gegen Ganzes – kein Entweder-oder.',
      '7 oder 12: Geschwister – ähnlich, nicht gleich.',
      '9 oder 11: groß gegen leicht – immer das Leichte zuerst?',
      '„Eine Liste mischt Großes, Kleines und Verwandtes.“',
      'Falle: eine Wahl richtig nennen; 4, 6, 8, 10 kommen beim Inventar.',
    ],
    verstaendnis: {
      frage: 'Warum lassen sich „Ich finde nichts zum Schauen“ und „Mir sind die Folgen ausgegangen“ schlecht gegeneinander priorisieren?',
      antwort: 'Das zweite ist ein Grund – aber nicht der einzige – für das erste. Sie stehen nicht nebeneinander („not distinct“), sondern als übergeordnete Chance und Teilchance (S. 82–83).',
      falsch: '„Weil beide gleich wichtig sind“ – es geht um ihre Beziehung, nicht um ihre Wichtigkeit.',
    },
    ablauf: {
      schritte: [
        'Auflösung per Knopf „Auflösung zeigen“ auf dem Beamer öffnen (öffnet bei allen; sonst erst um 23:59, Ende des Tages). Die Sätze von eben nicht wiederholen; deine Notizen, wer was gewählt hat, reichen.',
        'Schritt für Schritt aufdecken, je Schritt ein Paar: Wer 1 gewählt hat – „Und welchen Teil davon zuerst?“; wer 2 – „Ein Grund für 1, aber nicht der einzige“ (S. 82). 7 oder 12 – „Hängt an den Bedingungen: offline, Steckdose“ (S. 82). Wer 11 – „Immer das Leichte zuerst?“; wer 9 – „Wo fangt ihr an?“ (S. 82, 84–85). Zuletzt 4 · 6 · 8 · 10: kommen auf der Folie inventar.',
        'Fragen: Bei welchem Paar habt ihr zwei Gleichartige verglichen? Dann den letzten Satz aufdecken.',
      ],
      achten: [
        'Falle: 9 und 11 stehen nur zum Größenvergleich nebeneinander – keine Gruppe, 11 hängt nicht unter 9; in der Abbildung S. 89 stehen sie unter verschiedenen Momenten.',
        'Nur sortieren, was Torres sortiert: Ihre Teilchancen von 9 sind anders formuliert (S. 84–85); 4, 6, 8 und 10 hängt sie erst in der Abbildung S. 89 unter Momente (Folie inventar).',
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
    ueberleitung: 'Bevor Chancen hängen, braucht der Baum Äste: eure Momente.',
  },

  'oberste-ebene': {
    live: [
      'Abbildung von Tag 2 wiedererkennen lassen: vier Momente, vier Äste.',
      'Fragen: Wie heißen eure Momente auf T2 · 1?',
      '„Überschneiden sich die Äste, müsst ihr an allen Chancen zugleich arbeiten.“',
      'Aufdecken: Kaffeebar – drei Momente, der Automat ist ein Umweg.',
      'Bei Bedarf: „Schon gemacht?“ – Map: Moment, Baum: Bedürfnis.',
    ],
    verstaendnis: {
      frage: 'Warum dürfen sich die Äste nicht überschneiden?',
      antwort: 'Sonst lässt sich nicht an einer Chance nach der anderen arbeiten: Die Chancen verhaken sich, und man muss an allen zugleich arbeiten (S. 86). Darum sind die obersten Chancen eigene Zeitpunkte.',
      falsch: '„Damit der Baum ordentlich aussieht“ – es geht darum, eine Chance einzeln bearbeiten zu können.',
    },
    kern: [
      {
        text: '„We need each opportunity to be distinct from every other opportunity. If there’s overlap, then we can’t work on one at a time.“ Zwei Wege zu solchen Ästen: die Schritte der Experience Map oder die Schlüsselmomente aus den gezeichneten Geschichten. „Oftentimes this is as simple as mapping each node in your experience map to the top level of opportunities on your opportunity solution tree.“',
        quelle: `${TORRES}, S. 86`,
      },
      {
        text: 'Streaming: aus „Deciding to watch something“, „Choosing something to watch“, „Watching something“, „The end of the watching experience“ werden vier oberste Chancen. „the key is to make sure there is no overlap between the moments in time.“',
        quelle: `${TORRES}, S. 87`,
      },
      {
        text: 'Kaffeebar: drei Momente der Experience Map – Halle, Anstehen und Warten, Zug; der Automat ist ein Umweg, kein Moment. Die Studierenden haben drei bis fünf eigene Momente auf T2 · 1.',
        quelle: 'journey-map.astro, Folien beispiel und vorgehen',
      },
    ],
    fragen: [
      {
        frage: 'Bei Bedarf – „Haben wir das nicht schon bei der Map gemacht?“ Was ist beim Baum anders? (Handout: „Schon gemacht? Map und Baum“)',
        antwort: 'Auf der Map legt ihr Knoten zusammen, die denselben Moment der Geschichte meinen, über alle Geschichten (S. 56, 87). Im Baum ordnet ihr Chancen innerhalb eines Astes: Was dasselbe meint, wird eine Chance; Geschwister bekommen eine übergeordnete Chance (S. 89–90). Kaffeebar: „Ich bin um 7:28 da, das reicht nie für die Schlange.“ (I4-1) blieb auf der Map grau, im Baum belegt es „Wenn ich anstehe, reicht mir die Zeit nicht.“ Häufig falsch: „Dasselbe wie bei der Map, nur mit anderen Karten“ – die Map fragt nach dem Moment, der Baum nach dem Bedürfnis; neu ist die Ebene darüber, die übergeordnete Chance.',
      },
    ],
    ueberleitung: 'Die Äste stehen. Jetzt kommen die Chancen darunter – aber nicht jede.',
  },

  inventar: {
    live: [
      'Fragen: Wo hängen 4, 6, 8, 10 – und 9, 11?',
      'Drei Fragen langsam vorlesen, jede einzeln.',
      '„Alle drei Ja – erst dann kommt die Chance in den Baum.“',
      'Falle: zu breite Chance, die unter zwei Momente passt.',
    ],
    verstaendnis: {
      frage: 'Unter welchen Momenten hängen „Ist diese Serie gut?“ (9) und „Wer ist dieser Schauspieler?“ (11)?',
      antwort: '9 unter „I’m not sure what to watch.“, 11 unter „I’m watching a show.“ – zwei verschiedene Momente (Abbildung S. 89). 4 und 10 hängen beim Auswählen, 8 beim Schauen, 6 am Ende.',
    },
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
      'Pro Zeile: eine Person beantwortet die drei Fragen laut.',
      'Beim ersten Nein: „Stopp“ – die Zeile ist fertig.',
      'Die anderen: dafür oder dagegen? Erst dann die Zeile aufdecken.',
      'Zeile 1 vor dem Aufdecken: Was steckt hinter „per App vorbestellen“?',
      '„Nur bei einer Person? Ins Feld ‚Nur in einem Interview‘ – kann wiederkommen.“',
    ],
    verstaendnis: {
      frage: '„Wenn der erste Schluck passt, ist der Morgen gerettet“ klingt wichtig. Warum kommt es nicht in den Baum?',
      antwort: 'Nur I1 hat es erzählt (I1-4); die zweite Frage, in mehr als einem Interview gehört, ist ein Nein. Es kommt ins Feld „Nur in einem Interview“ (bei Torres: bleibt auf dem Snapshot) – oft taucht so etwas später bei anderen wieder auf (S. 70, 88).',
      falsch: '„Weil es den Outcome nicht treibt“ – darüber entscheidet erst Frage 3, und die stellt sich hier nicht mehr.',
    },
    ablauf: {
      schritte: [
        'Pro Zeile führt eine Person, reihum: die drei Fragen der Reihe nach laut beantworten, beim ersten Nein stoppen, dann sagen, wohin die Zeile kommt.',
        'Die anderen zwei sagen „dafür“ oder „dagegen“. Erst dann den Schritt aufdecken: Die Antworten dieser Zeile erscheinen.',
        'Zeile 1: vor dem Aufdecken fragen, welches Bedürfnis hinter der Lösung steckt. Zeile 2 ist dann dieses Bedürfnis, neu geprüft.',
        'Zeilen 4 und 5 gehen schnell: Es reicht, wohin die Zeile kommt, mit einem Satz Begründung.',
        'Letzter Schritt: Das Ergebnis erscheint. Überleiten zu den eigenen Snapshots.',
      ],
      aufloesung: '„Per App vorbestellen“: Lösung, dahinter „Ich will den Zug nicht verpassen“. „Wenn ich anstehe, reicht mir die Zeit nicht“ (I2, I3, I4) und „Wann ist mein Kaffee fertig?“ (I2; I3 in unserer Lesart): in den Baum. Erster Schluck (nur I1) und Mitbestellen (nur I5): ins Feld „Nur in einem Interview“ (bei Torres: bleiben auf dem Snapshot).',
    },
    kern: [
      {
        text: 'Die drei Fragen: „Is this opportunity framed as a customer need, pain point, or desire and not a solution?“ – „Is this opportunity unique to this customer, or have we seen it in more than one interview?“ – „If we address this opportunity, will it drive our desired outcome?“',
        quelle: `${TORRES}, S. 88`,
      },
      {
        text: 'Das Feld „Nur in einem Interview“ ist eine Ablage unten rechts in jedem Baum-Rahmen auf Miro. Dorthin kommt jede Chance, die nur eine Person erzählt hat – als Karte mit Zitat-ID, damit sie nicht verloren geht. Erzählt ein weiteres Interview dasselbe Bedürfnis – ein schon geführtes oder ein späteres, auch anders formuliert –, wandert die Karte in den Baum, unter ihren Moment. Bei Torres bleiben solche Chancen einfach auf dem Snapshot; das Feld macht sie im Baum sichtbar (Kursformat).',
        quelle: `${TORRES}, S. 70; Feld „Nur in einem Interview“: Kursformat`,
      },
      {
        text: '„Lösung → Bedürfnis dahinter neu prüfen“ am Beispiel „Per App vorbestellen“ (erste Zeile der Tabelle): Erst die Probe „Is there more than one way to address this opportunity?“ – hier gibt es nur einen Weg, die App; also eine Lösung. Dann das Bedürfnis dahinter suchen („uncover the implied opportunity“): Wozu vorbestellen? „Ich will den Zug nicht verpassen.“ Dieses Bedürfnis geht neu durch die drei Fragen: Bedürfnis – ja; in mehr als einem Interview – wörtlich vom Zug erzählt nur I3 (I3-3); dass die Zeit fürs Anstehen nicht reicht, sagt I4 fast wörtlich (I4-1), I2 schaut auf die Uhr und geht (I2-2), I3 hat eine Regel für die Schlange (I3-4); treibt den Outcome – ja. Es kommt also in den Baum, in den Worten der Interviews – das ist die nächste Zeile, „Wenn ich anstehe, reicht mir die Zeit nicht.“: eine Karte, nicht zwei. Gegenprobe: Für dieses Bedürfnis gibt es mehrere Wege – im Kaffeebar-Baum von Tag 1 hängen darunter Vorbestellen per App, Express-Theke und Kaffeewagen am Bahnsteig (Vorbestellen ist später verworfen, D4). „An opportunity should have more than one potential solution.“',
        quelle: `${TORRES}, S. 88, 94–95`,
      },
    ],
    ueberleitung: 'Was durchkommt, wird jetzt geordnet – Ast für Ast.',
  },

  struktur: {
    live: [
      'Abbildung: Flugzeug und Zug bekommen „unterwegs schauen“ darüber.',
      '„Ergänzte übergeordnete Chancen sind erlaubt – sie folgen aus den Teilchancen.“',
      'Fragen: Wie lange darf der erste Baum dauern?',
      '„Heute 22 Minuten: ein erster Entwurf, der mit jedem Interview wächst.“',
    ],
    kern: [
      {
        text: 'Ast für Ast: Ähnliches gruppieren. Geschwister bekommen eine übergeordnete Chance, die man ergänzen darf, wenn sie nicht gesagt wurde; was dasselbe meint, wird eine Chance („Entering a show name into the search box is hard“). Mini-Bäume weiter gruppieren, bis sie unter dem Moment hängen.',
        quelle: `${TORRES}, S. 89–91`,
      },
      {
        text: '„If you do your first tree in 30 minutes and think you are done, you are probably not thinking hard enough.“ Das Gegenteil, stundenlang am perfekten Baum zu feilen, ist auch falsch. „Do just enough to capture what you currently know.“ Und: „This isn’t a one-and-done exercise.“ – „You don’t have to do all of this work in your first draft.“ Heute 12 + 10 Minuten für Inventar und Struktur: ein erster Entwurf, überarbeitet nach dem Prüfen und bis Tag 4.',
        quelle: `${TORRES}, S. 91; Zeitplan: Kurs`,
      },
    ],
    ueberleitung: 'Probieren wir das an der Kaffeebar.',
  },

  beispiel: {
    live: [
      'Zeit: 4 min; pro Frage antwortet eine Person laut, reihum.',
      'Fragen: I3s Chance „… ob es sich ausgeht“ – unter welchen Moment?',
      'Fragen: „Geht sich ein Kaffee aus?“ und „Zeitnot“ – dasselbe oder Geschwister?',
      'Fragen: Fehlt über den drei Chancen in der Halle eine übergeordnete Chance?',
      '„Unter ‚Ich bin im Zug‘ hängt noch nichts – eine Frage fürs nächste Interview.“',
    ],
    uebung: { dauer: '4 min', form: 'zu dritt, reihum laut; erst antworten, dann aufdecken' },
    miro: {
      frame: 'Baum · Beispiel Kaffeebar',
      schritte: [
        '„Alle zu mir holen“ auf Baum · Beispiel Kaffeebar: Der Baum steht dort, die drei Fragen auf der Folie.',
      ],
    },
    ablauf: {
      schritte: [
        'Pro Frage antwortet eine Person laut mit Begründung; die anderen zwei sagen „dafür“ oder „dagegen“. Erst dann den Schritt aufdecken.',
        'Nach Frage 3 den letzten Schritt aufdecken: Was nur eine Person sagte, hängt nicht im Baum.',
      ],
      achten: [
        'Welches Zitat zu welchem Moment gehört, ist Lesart des Kurses: Auf der Map von Tag 2 steht I3-2 in der Spalte „Anstehen und Warten“.',
        'Keine übergeordnete Chance erfinden: Der Kaffeebar-Baum hat keine ergänzte Karte.',
      ],
      aufloesung: '1: zu breit, pro Moment eine Chance – Halle „Geht sich ein Kaffee noch aus?“ (I3-2), Warten „Wann ist mein Kaffee fertig?“ (I3-3; Torres S. 88). 2: Geschwister – das eine lässt sich lösen, ohne das andere zu lösen (S. 83). 3: nein, die drei führen schon zum Moment hinauf (S. 90–91).',
    },
    verstaendnis: {
      frage: 'Sind „Geht sich ein Kaffee noch aus?“ und „Wenn ich anstehe, reicht mir die Zeit nicht.“ Geschwister?',
      antwort: 'Ja: Man kann das eine erfüllen, ohne das andere zu erfüllen – beide sind eigene Bedürfnisse in der Halle (Torres S. 83). Unter dem Warte-Moment hängt nur „Wann ist mein Kaffee fertig?“: noch keine senkrechte Kette (S. 94), aber eine Frage fürs nächste Interview.',
    },
    kern: [
      {
        text: '„If it seems like it could live under more than one branch, reframe the opportunity to be more specific.“ Notfalls eine Chance je Moment. Geschwister gruppieren, bis eine Reihe zum Moment hinaufführt.',
        quelle: `${TORRES}, S. 88, 90–91`,
      },
    ],
    ueberleitung: 'Bevor ihr baut: die Anti-Muster, die im ersten Entwurf fast immer stecken.',
  },

  firmensicht: {
    live: [
      'Fragen: Wer würde „mehr Streaming-Abos“ je so sagen?',
      '„Haben wir das gehört? Bei ergänzten übergeordneten Chancen: Kann ich mir vorstellen, dass jemand das sagt?“',
      'Kaffeebar-Probe: „Ich wünsche mir mehr Kaffeebar-Umsatz“ (Tag 1) wäre Firmensicht.',
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
    ueberleitung: 'Vier weitere Anti-Muster, je mit einem Beispiel.',
  },

  'vier-muster': {
    live: [
      'Fragen: Was stimmt an jedem Beispiel nicht?',
      'Aufdecken: Karte für Karte, dann die bessere Fassung sagen (Handout).',
      'Falle: „Glücksspiel“ als Einzelfall abtun – die Ursache nennt I4 selbst (I4-1).',
      'Bei Bedarf: senkrechte Kette – Checkliste Nr. 2, Abbildung im Handout.',
      'Wenn hinten: überspringen, steht auf der Checkliste (anti-muster).',
    ],
    verstaendnis: {
      frage: 'Warum kommt „Anstellen ist ein Glücksspiel“ nicht so in den Baum?',
      antwort: 'Es ist ein Gefühl. Gefühle lassen sich nicht lösen, ihre Ursache schon: „Wenn ich anstehe, reicht mir die Zeit nicht“ (I2-2, I3-4, I4-1; Torres S. 95).',
      falsch: '„Weil es nur eine Person gesagt hat“ – die Ursache dahinter belegen drei Interviews, I4 selbst mit I4-1.',
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
        text: 'Lösung statt Chance, Test: „Is there more than one way to address this opportunity?“ Kaffeebar: „Per App vorbestellen“ (Snapshot-Beispiel Tag 1) ist eine Lösung, dahinter „Ich will den Zug nicht verpassen“ (Folie drei-fragen). Gefühl: „We can’t fix feelings“, ihre Ursache schon. Kaffeebar: „Anstellen ist ein Glücksspiel“ (I4-2) ist eher ein Gefühl, die Ursache „Wenn ich anstehe, reicht mir die Zeit nicht“ (I4-1; Folie beispiel).',
        quelle: `${TORRES}, S. 94–95; Kaffeebar: baum.astro, drei-fragen und beispiel`,
      },
    ],
    ueberleitung: 'Wo ihr das baut: euer Baum auf Miro.',
  },

  'euer-baum': {
    live: [
      'Zeit: 1 min Ebenen an der Torres-Abbildung zeigen: Outcome, Momente, Chancen.',
      '„Der Baum von Tag 1 war unsere Vermutung. Die Wurzel bleibt, die Äste kommen aus fünf Interviews.“',
      '„‚Vorbestellen‘ ist gefallen: 3 von 5 entscheiden erst in der Halle (D4).“',
      'Zeit: 3 min Griffe vorführen – Cmd+D, Linie ziehen, eine Karte darüber.',
      'Hewen: zuerst den Outcome wählen, dann die Momente darunter.',
    ],
    miro: {
      frame: 'Baum · Beispiel Kaffeebar',
      schritte: [
        '„Alle zu mir holen“ auf Baum · Beispiel Kaffeebar; die Folie mit der Torres-Abbildung daneben.',
        'Ebenen von oben zeigen: Outcome grün, Momente blau, Chancen gelb; Lösungen und Tests kommen später.',
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
    ueberleitung: 'Jetzt euer Baum: Inventar, Struktur, selbst prüfen.',
  },

  vorgehen: {
    live: [
      'Timer 12 min: erst Momente als blaue Karten, dann Inventar.',
      'Nach 12 min: Struktur allein, Linien ziehen, Timer 10 min.',
      'Nach 22 min: weiter zur Checkliste, selbst prüfen, Timer 9 min.',
      'Nach 31 min: Prüfliste, dann Claude mit Bildschirmfoto.',
      '1:1 ab Minute 10, je 5 min: Hewen, Joachim, Sofie.',
      'Wenige Interviews: volles Feld „Nur in einem Interview“, dünner Baum – normal.',
    ],
    uebung: { dauer: '35 min (12 + 10 + 9 + 4)', form: 'allein, Markus je 5 min am Baum' },
    miro: {
      frame: 'Baum · Beispiel Kaffeebar',
      schritte: [
        'Jede*r arbeitet im eigenen Frame „Baum · Name“ rechts neben der Kaffeebar; T2 · 2 ist nur die Anleitung.',
        'Momente aus T2 · 1 als blaue Reihe unter den Outcome, darunter gelbe Chancen mit Zitat-ID.',
        'Jede Karte hängt mit einer Linie an genau einer Karte darüber; was nur eine Person gesagt hat, ins Feld „Nur in einem Interview“.',
        'Selbst prüfen: jede*r im eigenen Frame, die Checkliste der Folie Anti-Muster daneben; Markus geht von Baum zu Baum.',
      ],
    },
    ablauf: {
      schritte: [
        'Inventar allein (12 min): zuerst die Momente aus T2 · 1 als blaue Karten unter den Outcome (Cmd+D), dann jede Chance aus den eigenen Snapshots durch die drei Fragen, in „Baum · Name“: Ja → gelbe Karte mit Zitat-IDs unter ihren Moment; nur ein Interview → ins Feld „Nur in einem Interview“; Lösung → Bedürfnis dahinter neu prüfen.',
        'Struktur allein (10 min): Ast für Ast gruppieren, übergeordnete Chancen ergänzen und mit „(ergänzt)“ beschriften, Dubletten zusammenlegen, jede Karte per Linie an genau eine Karte darüber; fehlen Geschwister, Zettel „Nächstes Interview: …“ neben die Karte.',
        'Selbst prüfen allein (9 min, Timer auf der Folie Anti-Muster): den eigenen Baum Karte für Karte mit den sechs Anti-Mustern durchgehen; je Fund entscheiden: ändern, Zettel „Nächstes Interview: …“ oder lassen, mit Grund. Markus kommt ab Minute 10 des Blocks je fünf Minuten an jeden Baum (Hewen, Joachim, Sofie – Hewen zuerst wegen Outcome und Chancen), zeigt auf eine Karte und fragt, ohne umzuschreiben. Torres lässt das Team den eigenen Baum befragen (S. 92); allein prüfen und die fünf Minuten sind Kursformat, weil jede*r ein eigenes Produkt hat.',
        'Claude (4 min): Prüfliste, dann Claude mit einem Bildschirmfoto des eigenen Frames aus Miro; eine Datei gibt es nicht. Einen Befund wählen, die Frage selbst beantworten: ändern auf Miro oder lassen, Zeile ins Log; der Rest bis Tag 4.',
      ],
      achten: [
        'Chancen in den Worten der Kundschaft und mit Zitat-IDs aus mindestens zwei Interviews – ohne ID kein Beleg.',
        'Passt eine Chance unter zwei Momente, ist sie zu breit (Torres S. 88).',
        'Was offen bleibt, wird eine Frage für die nächsten Interviews.',
      ],
      fehler: [
        'Lösungen als Chancen („App“, „Express-Theke“).',
        'Alles aus jedem Snapshot übernehmen, ohne die drei Fragen.',
        'Am perfekten Baum feilen und das Selbstprüfen verpassen.',
        'Karten ohne Linie oder an zwei Chancen – dann ist die Chance zu breit.',
      ],
    },
    ueberleitung: 'Zum Selbstprüfen: die Checkliste auf der nächsten Folie.',
  },

  'anti-muster': {
    live: [
      'Timer 9 min; jede*r prüft den eigenen Baum, Karte für Karte.',
      '„Je Fund: ändern, Zettel oder lassen – mit Grund.“',
      'Erstes Muster mit Torres: Haben wir das gehört – welche ID?',
      '1:1 läuft weiter: wer noch fehlt, kommt jetzt dran.',
      'Folie vier-muster übersprungen? Dann 3 bis 6 kurz erklären.',
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
        frage: 'Bei Bedarf – senkrechte Kette (Handout, Abbildung S. 93): Was prüft ihr, und in welcher Reihenfolge?',
        antwort: 'Erst: Sagen die Stufen dasselbe in anderen Worten? Dann zu einer Chance zusammenfassen. Sonst: Löst jede Stufe die darüber nur zum Teil? Dann fehlen Geschwister (S. 93–94). Welcher Fall die Abbildung ist, sagt Torres nicht. Unsere Lesart: „Is this show any good?“ und „Will I like this show?“ sagen fast dasselbe; „I don\'t like it when I start a show and it isn\'t good.“ löst die mittlere nur zum Teil – Geschwister wie „Who is in this show?“ (S. 84–85) fehlen. Häufig falsch: nur „Es fehlen Geschwister“ prüfen – zuerst kommt die Frage, ob die Stufen dasselbe sagen.',
      },
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
      'Ausblick: Vergleichen und eine Ziel-Chance wählen – gleich im nächsten Block.',
    ],
    ueberleitung: 'Nach der Pause: die Ziel-Chance.',
  },
};
