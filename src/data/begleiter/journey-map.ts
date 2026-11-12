import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/journey-map.astro (Tag 2, 15:25–16:25). Vorwissen: „unsicher“, als
// „customer journey“ aus dem Entrepreneur Lab genannt (vorwissen.ts) – zuerst fragen; ist es bekannt, Erleben und Knoten
// nur streifen und die Zeit für „Momente werden Äste“ und die Übung nutzen.
// Torres-Seiten = gedruckte Seiten aus quellen/torres/text.txt.
const TORRES = 'Teresa Torres, Continuous Discovery Habits';
const KANE = 'Lexie Kane, The Peak–End Rule: How Impressions Become Memories, Nielsen Norman Group (2018)';
const KAHNEMAN = 'Daniel Kahneman u. a., When More Pain Is Preferred to Less: Adding a Better End, Psychological Science 4 (1993), S. 401–405';

export const NOTIZEN_JOURNEY_MAP: Record<string, Notiz> = {
  wofuer: {
    live: [
      'Fragen: Wer kennt Customer Journey aus dem Entrepreneur Lab?',
      'Wenn bekannt: nur den Unterschied betonen – Momente werden Äste.',
      '„Die Map ist euer Bild der Kundschaft: Sie führt durch Interviews und ordnet den Baum.“',
      'Hewen: Outcome bestätigen lassen – Outcome, kein Output (Torres S. 47).',
      'Fragen: Joachim – „Was tun die Menschen danach anders?“',
      'Fragen: Was auf eurer Map von Tag 1 war nur vermutet?',
    ],
    verstaendnis: {
      frage: 'Wofür braucht ihr die Map, wenn ihr schon fünf Snapshots habt?',
      antwort: 'Sie gibt dem Chancenraum Struktur: Ihre Momente werden die obersten Äste des Baums, damit sich die Äste nicht überschneiden (S. 86–87). Und sie hält das gemeinsame Bild, sonst laufen die Sichten im Team auseinander (S. 57).',
      falsch: '„Für die Präsentation“ – sie ist ein Denkwerkzeug des Teams.',
    },
    kern: [
      {
        text: 'Jede*r im Trio zeichnet zuerst die eigene Map; gemeinsam ergeben sie ein reicheres Bild. Die gemeinsame Map „will guide your customer interviews, and it will help give structure to the opportunity space. It can and should evolve week over week as your team learns about your customers.“',
        quelle: `${TORRES}, S. 51`,
      },
      {
        text: 'Im Interview: die Map nutzen, um die Geschichte zu verfolgen – auf bestimmte Knoten hören, nach ausgelassenen Knoten fragen.',
        quelle: `${TORRES}, S. 66`,
      },
      {
        text: 'Für den Baum: „Oftentimes this is as simple as mapping each node in your experience map to the top level of opportunities on your opportunity solution tree.“',
        quelle: `${TORRES}, S. 86`,
      },
      {
        text: 'Weiterentwickeln, nicht neu zeichnen: Die erste gemeinsame Map enthielt „hunches and possibilities, not truth“ – aber sie machte sichtbar, was das Team zu wissen glaubte, wo es offene Fragen hatte und was die Interviews prüfen sollten.',
        quelle: `${TORRES}, S. 51`,
      },
      {
        text: 'Anti-Muster: „Moving forward as if your map is true“ und „Forgetting to refine and evolve your map as you learn more“ – sonst gehen die Sichten auseinander, selbst bei denselben Quelldaten.',
        quelle: `${TORRES}, S. 57`,
      },
    ],
    ueberleitung: 'Erst die Frage, was überhaupt auf die Map gehört.',
  },

  erleben: {
    live: [
      'Fragen: Was stimmt an der oberen Reihe nicht?',
      'Aufdecken: der Morgen von I2, mit der Stelle, wo sie aufgibt.',
      '„Ihr zeichnet nicht euer Produkt, sondern wie die Kundschaft es erlebt.“',
      'Customer Journey nur als Brücke nennen, nicht vertiefen.',
    ],
    verstaendnis: {
      frage: 'Die Map einer App zeigt „Startseite → Suche → Detailseite → Kasse“. Was fehlt?',
      antwort: 'Das Erleben der Kundschaft: wo sie hängen bleibt, was schiefgeht, wie sie umsteuert und wo sie aufgibt – und der Zusammenhang außerhalb des Produkts. Torres: keine Abfolge von Bildschirmen, sondern der Ablauf, wie die Kundschaft ihn erlebt (S. 54).',
      falsch: '„Mehr Bildschirme“ – es fehlt nicht Detail, sondern die Sicht.',
    },
    kern: [
      {
        text: '„don’t focus on your product. Instead, draw the experience of your customer.“ Das Trio zeichnete keinen „screen-by-screen wireflow“, sondern den Ablauf, wie die Kundschaft ihn erlebte: wo sie hängen blieb, was schiefging, wie sie umsteuerte, wo sie aufgab. Beim Streaming: Wann und wo spielt Video eine Rolle, wie hören Menschen von Inhalten, mit wem schauen sie, welche Hindernisse gibt es?',
        quelle: `${TORRES}, S. 54`,
      },
    ],
    ueberleitung: 'Wie zeichnet man das? Mit Knoten und Verbindungen.',
  },

  knoten: {
    live: [
      'Abbildung lesen: hören, erzählen, suchen, „?“, Film, Ende.',
      '„Kästchen, Pfeile, Strichmännchen – schön muss es nicht sein.“',
      'Fragen: Wo auf der Skizze geht es hin und zurück?',
      'Wenn bekannt: Folie in einer Minute.',
    ],
    kern: [
      {
        text: 'Zeichnen macht das eigene Denken sichtbar; so sieht man leichter Lücken und was nicht ganz stimmt. Kästchen, Pfeile, Strichmännchen reichen.',
        quelle: `${TORRES}, S. 53–54`,
      },
      {
        text: '„Language is vague.“ Zwei Menschen glauben, sie seien sich einig, und gehen doch mit verschiedenen Bildern hinaus; Zeichnen zwingt, konkret zu werden.',
        quelle: `${TORRES}, S. 55`,
      },
      {
        text: '„A node is a distinct moment in time, an action, or an event, while links are what connect nodes together.“ Verbindungen zeigen auch Schleifen (Netflix, nichts gefunden, weiter zu YouTube). Zum Schluss Kontext an jeden Schritt: denken, fühlen, tun.',
        quelle: `${TORRES}, S. 56`,
      },
    ],
    ueberleitung: 'Eure Map von Tag 1 war so gezeichnet, aber aus Vermutungen – jetzt zeichnet ihr sie aus euren Geschichten.',
  },

  geschichten: {
    live: [
      'Vier Schritte zeigen, die Skizzen auf Papier sind der Rohstoff.',
      '„Welche Knoten tauchen in Geschichte um Geschichte auf? Das ist eure Map.“',
      'Falle: zu stark zusammenlegen; Wiederholungen, Abbrüche weglassen; Einzelfälle auf die Map.',
    ],
    kern: [
      {
        text: 'Hat die Map noch keine klaren Momente, die Zeichnungen aus den Interviews nehmen: jeden Knoten beschriften, Muster suchen („What nodes are showing up in story after story?“), die häufigsten zu einer Map zusammenfügen.',
        quelle: `${TORRES}, S. 86–87`,
      },
      {
        text: 'Wie zusammengefügt wird, steht auf S. 87 nicht; wir nehmen die Regeln der gemeinsamen Map aus Kap. 4. Ohne eigene Skizzen (synthetische Ersatz-Transkripte): erst jede Geschichte skizzieren, „the nodes and the links that make up the story“, höchstens drei, Map mit „Synthetisch“ markieren.',
        quelle: `${TORRES}, S. 56, 70; Kursregel`,
      },
      {
        text: 'Ähnliche Knoten zusammenlegen, aber nicht so verallgemeinern, dass wichtige Details verloren gehen; nicht nur den glatten Weg zeichnen, sondern auch Wiederholungen, Abbrüche aus Frust und Schleifen.',
        quelle: `${TORRES}, S. 56`,
      },
    ],
    ueberleitung: 'Was markiert ihr in jeder Geschichte? Den stärksten Moment und das Ende.',
  },

  'peak-end': {
    live: [
      'Erst fragen: Welchen Durchgang würdet ihr wiederholen?',
      'Aufdecken: Die meisten wählen den längeren – er endet besser.',
      '„Markiert in jeder Geschichte den stärksten Moment und das Ende – im Guten wie im Schlechten.“',
      'Marke: Wort, Zitat-ID, Zahl – „Tief · I3-3 · 2 von 5“.',
      '„2 von 5“: in zwei Geschichten liegt der Tiefpunkt hier.',
    ],
    kern: [
      {
        text: 'Peak-End-Regel: Intensive Momente und das Ende eines Erlebnisses zählen beim späteren Urteil am meisten. Versuch von Kahneman, Fredrickson, Schreiber und Redelmeier (1993): „last impressions are lasting impressions“.',
        quelle: KANE,
      },
      {
        text: '32 Studenten; 60 s bei 14 °C gegen dieselben 60 s plus 30 s, in denen das Wasser langsam auf etwa 15 °C stieg („still painful but distinctly less so for most subjects“, S. 401). 22 von 32 (69 %) wählten den längeren Durchgang zur Wiederholung; von den 21 mit spürbar weniger Schmerz am Ende 17 (81 %), die übrigen 11 teilten sich 6 zu 5 (S. 403).',
        quelle: KAHNEMAN,
      },
      {
        text: 'Stärkster Moment = die Stelle, an der die Person im Zitat am deutlichsten Gefühl zeigt. Erst je Geschichte, dann auf der Map der Moment, auf den die meisten zeigen (zeigen gleich viele auf zwei Momente: beide, je mit Zahl), mit der Zahl dazu („Tief · I3-3 · 2 von 5“ = in zwei Geschichten liegt der Tiefpunkt dort; anders als „Geschichten mit diesem Knoten: 3 von 5“, das zählt Vorkommen). N von M: in N von M Geschichten, M = alle eigenen Geschichten (bei drei synthetischen: von 3). Marke als Wort mit Zitat-ID und Zahl, kein Emoji, kein eigener Knoten – das Gefühl ist ein Wegweiser zur Ursache (Torres S. 95); Smileys auf Papier ok (S. 57). Am Zitat festmachen und zählen ist Kursregel, nicht Quelle.',
        quelle: `${TORRES}, S. 57, 95; Kursregel`,
      },
    ],
    ueberleitung: 'Aus den Knoten werden die Momente – und die tragen den Baum.',
  },

  momente: {
    live: [
      'Reihe oben: vier Momente der Experience Map, jeder wird ein Ast.',
      'Kreis oben ist kein Moment, sondern das Outcome (Wurzel).',
      '„Keine Überschneidung: Sonst könnt ihr nicht an einer Chance nach der anderen arbeiten.“',
      'Fragen: Welche drei bis fünf Momente hat die Kaffeebar?',
    ],
    verstaendnis: {
      frage: 'Warum dürfen sich die obersten Äste nicht überschneiden?',
      antwort: 'Bei Überschneidung lässt sich nicht an einer Chance arbeiten, ohne die anderen mitzuziehen. Getrennte Zeitpunkte machen die Äste unterscheidbar (S. 86–87).',
    },
    kern: [
      {
        text: 'Distinctness: „If there’s overlap, then we can’t work on one at a time.“ Beide Wege – Schritte der Map oder Zeichnungen aus den Interviews – ordnen den Chancenraum nach unterscheidbaren Momenten.',
        quelle: `${TORRES}, S. 86`,
      },
      {
        text: 'Streaming: Deciding to watch something, Choosing something to watch, Watching something, The end of the watching experience – daraus die vier obersten Chancen.',
        quelle: `${TORRES}, S. 87`,
      },
    ],
    ueberleitung: 'An der Kaffeebar: erst die Skizzen beschriften und zählen, dann die Map.',
  },

  beispiel: {
    live: [
      'Spaltenköpfe = Beschriften: ein Name für denselben Knoten.',
      'Fragen: Welche Spalte ist in beiden Reihen gefüllt? Zählen lassen.',
      'Aufdecken: Zählzeile – I1, I4, I5 stehen im Handout.',
      'Zusammengelegt: Anstehen und Warten – kein Zitat erzählt das Anstehen.',
      'Ein Tief auf der Map: Warten, I3-3 und I5-6.',
      'I4-4 gilt dem Automatenkaffee – Tief des Umwegs.',
      'Fragen: Woran erkennt ihr den Tiefpunkt? – Am Zitat, nicht am Bauchgefühl.',
      '„Der Automat ist ein Umweg – die Antwort auf das ‚?‘ von Tag 1.“',
    ],
    verstaendnis: {
      frage: 'Warum ist der Automat kein eigener Moment auf der Map?',
      antwort: 'Er ist eine Ausweichroute aus „Ich komme in die Halle“. Er gehört als Pfeil auf die Map, damit nicht nur der glatte Weg gezeichnet ist (Handout; Torres S. 56: Umwege, Schleifen, Abbrüche zeichnen).',
    },
    ueberleitung: 'Jetzt eure Map: erst allein, dann zu dritt.',
  },

  vorgehen: {
    live: [
      'Prüfliste kurz als Ziel zeigen (30 s), bevor alle starten.',
      'Timer 12 min: allein, Marken in jeder Skizze, Tag-1-Map daneben.',
      'Nach 12 min: reihum Spalte auf T2 · 1 zeigen, nicht verteidigen.',
      'Nach 22 min: drei bis fünf Momente, Marken übertragen.',
      'Je Moment ein Zitat mit Gefühl, Gefühlswort fett.',
      'Marke = Wort + Zitat-ID, keine Emojis; Smileys auf Papier ok.',
    ],
    uebung: { dauer: '35 min (12 + 10 + 8 + 5)', form: 'allein, dann zu dritt' },
    miro: {
      frame: 'T2 · 1 · Experience Map',
      schritte: [
        '„Alle zu mir holen“ auf T2 · 1; links die Kaffeebar als Muster.',
        'Allein in der eigenen Spalte: Knoten aus den Skizzen beschriften, in jeder Skizze stärksten Moment und Ende markieren, auf Papier oder gleich auf Miro, die Map von Tag 1 (T1 · 1) daneben.',
        'Zu dritt Spalte für Spalte, alle schauen auf dem Board mit (kein Bildschirm teilen); fragen, nicht verteidigen.',
        'Momente festlegen, jede*r in der eigenen Spalte: Überschneidendes zusammenlegen; drei bis fünf, je ein Zitat mit ID, Gefühlswort fett; Marken mit Zahl übertragen, etwa „Tief · I3-3 · 2 von 5“.',
      ],
    },
    ablauf: {
      schritte: [
        'Allein (12 min): Knoten aus den Skizzen beschriften, in jeder Skizze den stärksten Moment und das Ende markieren, auf Papier oder gleich in der eigenen Spalte auf T2 · 1 zusammenfügen, die Map von Tag 1 daneben.',
        'Zu dritt (10 min): Reihum die eigene Spalte auf T2 · 1 zeigen – alle schauen auf dem Board mit; die anderen fragen nach.',
        'Momente festlegen (8 min), in der eigenen Spalte auf T2 · 1, jede*r für das eigene Produkt: Knoten prüfen, Überschneidendes zusammenlegen (Torres S. 56, 86–87); drei bis fünf, in den Worten der Kundschaft. Jeder Moment mit einem Zitat mit ID, möglichst einem, in dem die Person Gefühl zeigt, das Gefühlswort fett; erzählt niemand ein Gefühl: „Gefühl: nicht erzählt“ (Frage fürs nächste Interview). Das Gefühl bleibt am Moment, kein eigener Knoten, keine Chance (Torres S. 56, 95; fett statt Smiley ist Kursregel). Dann die Marken übertragen, je mit der Zahl der Geschichten, deren Tiefpunkt oder Ende dort liegt: „Tief · I3-3 · 2 von 5“, „Ende · I3-5 · 1 von 5“ (N von M: in N von M Geschichten; M = alle eigenen Geschichten, bei drei synthetischen: von 3). Drei bis fünf ist ein Richtwert des Kurses (Torres S. 87: vier Momente).',
        'Prüfen (5 min, eigene Folie): Prüfliste allein, dann Claude mit einem Bild der eigenen Spalte aus Miro; eine Datei gibt es nicht. Schritte unter „Prüfen“ im Handout.',
      ],
      achten: [
        'Beim Zeigen: Fragen stellen, auf Unterschiede achten, die eigene Zeichnung nicht verteidigen (Torres S. 55).',
        'Momente in den Worten der Kundschaft („Ich stehe an und warte auf meinen Kaffee.“), nicht als Prozessschritt („Warteschlange“).',
        'Jeder Moment und jede Chance auf Miro nennt mindestens eine Zitat-ID aus der Werkstatt – ohne ID kein Beleg.',
      ],
      fehler: [
        'Die alte Map abhaken statt die Geschichten nachzuzeichnen.',
        'Nur den glatten Weg zeichnen, ohne Umwege, Wiederholungen und Abbrüche.',
        'Marken als Emoji oder eigener Knoten statt Wort mit Zitat-ID am Moment.',
        'Momente, die sich überschneiden.',
      ],
    },
    ueberleitung: 'Nach 30 Minuten: prüfen – erst ihr, dann Claude.',
  },

  'pruefen-folie': {
    live: [
      'Folie zeigen, wenn die 5 Minuten starten; Prüfliste zuerst.',
      'Prüfen 5 min: Prüfliste, Prompt einfügen, dann Foto, Cmd+V, senden.',
      '„Claude fragt, ihr entscheidet – ändern auf Miro oder Zeile ins Log.“',
    ],
    ablauf: {
      schritte: [
        'Prüfliste allein abhaken (auf der Seite unter „Prüfen“).',
        'Prompt „Prüfen lassen · Claude mit Bild aus Miro“ kopieren, in claude.ai (Werkstatt-Connector an) einfügen, noch nicht senden.',
        'Erst dann die Spalte auf T2 · 1 heranzoomen, Bildschirmfoto mit Cmd+Ctrl+Shift+4 – sonst überschreibt „Kopieren“ das Bild in der Zwischenablage.',
        'In claude.ai Cmd+V, das Bild hängt unter dem Prompt; absenden.',
        'Höchstens drei Befunde, je mit Zitat und Frage; die Frage selbst beantworten.',
      ],
    },
    ueberleitung: 'Zum Schluss des Blocks: eine Frage an eure Map.',
  },

  uebertrag: {
    live: [
      'Fragen: Was steht jetzt auf eurer Map, das an Tag 1 fehlte?',
      'Reihum, je ein Knoten.',
      'Wenn nichts: Geschichten nachgezeichnet oder alte Map abgehakt?',
    ],
    ueberleitung: 'Nach der Pause werden eure Momente die obersten Äste des Baums.',
  },
};
