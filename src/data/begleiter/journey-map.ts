import type { Notiz } from './typen';
import { CHAT_JOURNEY_MAP } from './chat';

// Begleiter-Notizen zu src/pages/innolab/methoden/journey-map.astro (Tag 2, 15:25–16:25). Vorwissen: „unsicher“, als
// „customer journey“ aus dem Entrepreneur Lab genannt (vorwissen.ts) – zuerst fragen; ist es bekannt, Erleben und Knoten
// nur streifen und die Zeit für „Momente werden Äste“ und die Übung nutzen.
// Torres-Seiten = gedruckte Seiten aus quellen/torres/text.txt.
const TORRES = 'Teresa Torres, Continuous Discovery Habits';
const KANE = 'Lexie Kane, The Peak–End Rule: How Impressions Become Memories, Nielsen Norman Group (2018)';

export const NOTIZEN_JOURNEY_MAP: Record<string, Notiz> = {
  wofuer: {
    live: [
      'Fragen: Wer kennt Customer Journey aus dem Entrepreneur Lab?',
      'Wenn bekannt: nur den Unterschied betonen – Momente werden Äste.',
      '„Die Map ist euer Bild der Kundschaft: Sie führt durch Interviews und ordnet den Baum.“',
      'Hewen: Outcome bestätigen lassen – Outcome, kein Output (Torres S. 47).',
      'Fragen: Joachim – „Was tun die Menschen danach anders?“',
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
    ueberleitung: 'Eure Map von Tag 1 war genau so gezeichnet – aber aus Vermutungen.',
  },

  warum: {
    live: [
      'Fragen: Was auf eurer Map von Tag 1 war nur vermutet?',
      '„Eine Map fühlt sich schnell wahr an – sie ist ein Entwurf.“',
      'Fehler 2 betonen: sonst laufen die Bilder im Team auseinander.',
    ],
    kern: [
      {
        text: 'Die erste gemeinsame Map enthielt „hunches and possibilities, not truth“ – aber sie machte sichtbar, was das Team zu wissen glaubte, wo es offene Fragen hatte und was die Interviews prüfen sollten.',
        quelle: `${TORRES}, S. 51`,
      },
      {
        text: 'Anti-Muster: „Moving forward as if your map is true“ und „Forgetting to refine and evolve your map as you learn more“ – sonst gehen die Sichten auseinander, selbst bei denselben Quelldaten.',
        quelle: `${TORRES}, S. 57`,
      },
    ],
    ueberleitung: 'Neu zeichnet ihr sie diesmal aus euren Geschichten.',
  },

  geschichten: {
    live: [
      'Vier Schritte zeigen, die Skizzen auf Papier sind der Rohstoff.',
      '„Welche Knoten tauchen in Geschichte um Geschichte auf? Das ist eure Map.“',
      'Falle: zu stark zusammenlegen, Umwege und Abbrüche weglassen.',
    ],
    kern: [
      {
        text: 'Hat die Map noch keine klaren Momente, die Zeichnungen aus den Interviews nehmen: jeden Knoten beschriften, Muster suchen („What nodes are showing up in story after story?“), die häufigsten zu einer Map zusammenfügen.',
        quelle: `${TORRES}, S. 86–87`,
      },
      {
        text: 'Ähnliche Knoten zusammenlegen, aber nicht so verallgemeinern, dass wichtige Details verloren gehen; nicht nur den glatten Weg zeichnen, sondern auch Wiederholungen, Abbrüche aus Frust und Schleifen.',
        quelle: `${TORRES}, S. 56`,
      },
    ],
    ueberleitung: 'Aus den Knoten werden die Momente – und die tragen den Baum.',
  },

  momente: {
    live: [
      'Abbildung: vier Momente des Streaming-Beispiels als oberste Äste.',
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
    ueberleitung: 'Welche Momente zählen beim Erinnern am meisten? Höhepunkt und Ende.',
  },

  'peak-end': {
    live: [
      'Fragen: Welchen Durchgang würdet ihr wiederholen?',
      'Aufdecken: Die meisten wählen den längeren – er endet besser.',
      '„Markiert den stärksten Moment und das Ende – im Guten wie im Schlechten.“',
      'Klarstellen: Die Regel kommt von NN/g, nicht von Torres.',
    ],
    kern: [
      {
        text: 'Peak-End-Regel: Intensive Momente und das Ende eines Erlebnisses zählen beim späteren Urteil am meisten. Versuch von Kahneman, Fredrickson, Schreiber und Redelmeier (1993): 60 s bei 14 °C gegen dieselben 60 s plus 30 s bei 15 °C; laut NN/g wählten 80 % den zweiten Durchgang zur Wiederholung. „last impressions are lasting impressions“.',
        quelle: KANE,
      },
    ],
    ueberleitung: 'An der Kaffeebar: Was hat sich gegenüber Tag 1 geändert?',
  },

  beispiel: {
    live: [
      'Obere Reihe: die Map von Tag 1, das „?“ zeigen.',
      'Fragen: Was haben die Geschichten bestätigt, was ist neu?',
      'Aufdecken: das Warten auf den Kaffee – neuer Knoten, Tiefpunkt.',
      '„Der Automat ist ein Umweg, kein eigener Moment.“',
    ],
    verstaendnis: {
      frage: 'Warum ist der Automat kein eigener Moment auf der Map?',
      antwort: 'Er ist eine Ausweichroute aus „Ich komme in die Halle“. Er gehört als Pfeil auf die Map, damit nicht nur der glatte Weg gezeichnet ist (Handout; Torres S. 56: Umwege, Schleifen, Abbrüche zeichnen).',
    },
    ueberleitung: 'Jetzt eure Map: erst allein, dann zu dritt.',
  },

  vorgehen: {
    live: [
      'Schritte unten kopieren und in den Teams-Chat einfügen.',
      'Timer 10 min: allein, die Map von Tag 1 daneben.',
      'Nach 10 min: zu dritt zeigen, nicht verteidigen.',
      'Nach 22 min: drei bis fünf Momente, Höhepunkt und Ende.',
      'Nach 30 min: Prüfliste, dann Claude mit Bild der Map.',
    ],
    uebung: { dauer: '35 min (10 + 12 + 8 + 5)', form: 'allein, dann zu dritt' },
    chat: CHAT_JOURNEY_MAP,
    miro: {
      frame: 'T2 · 1 · Experience Map',
      schritte: [
        '„Alle zu mir holen“ auf T2 · 1; links die Kaffeebar als Muster.',
        'Allein in der eigenen Spalte: Knoten aus den Skizzen, auf Papier oder gleich auf Miro, die Map von Tag 1 (T1 · 1) daneben.',
        'Zu dritt Spalte für Spalte; Unterschiede zeichnen statt diskutieren.',
        'Momente markieren, jede*r in der eigenen Spalte: drei bis fünf, Höhepunkt und Ende, je mit Zitat-ID.',
      ],
    },
    ablauf: {
      schritte: [
        'Schritte in den Teams-Chat kopieren (Kasten „Für den Teams-Chat“ hier im Begleiter; dieselbe Karte steht im Handout).',
        'Allein (10 min): Knoten aus den Skizzen beschriften, auf Papier oder gleich in der eigenen Spalte auf T2 · 1, zusammenfügen, die Map von Tag 1 daneben.',
        'Zu dritt (12 min): Jede*r zeigt die eigene Map (Bildschirm teilen), die anderen fragen nach.',
        'Momente festlegen (8 min), in der eigenen Spalte auf T2 · 1, jede*r für das eigene Produkt: drei bis fünf, ohne Überschneidung, in den Worten der Kundschaft; Höhepunkt und Ende markieren; jeder Moment mit Zitat-ID.',
        'Prüfen (5 min): Prüfliste, dann Claude mit einem Bild der Map aus Miro; eine Datei gibt es nicht.',
      ],
      achten: [
        'Beim Zeigen: Fragen stellen, auf Unterschiede achten, die eigene Zeichnung nicht verteidigen (Torres S. 55).',
        'Streit über Details: den Unterschied zeichnen statt diskutieren (Torres S. 56–57).',
        'Momente in den Worten der Kundschaft („Ich stehe an.“), nicht als Prozessschritt („Warteschlange“).',
        'Jeder Moment und jede Chance auf Miro nennt mindestens eine Zitat-ID aus der Werkstatt – ohne ID kein Beleg.',
      ],
      fehler: [
        'Die alte Map abhaken statt die Geschichten nachzuzeichnen.',
        'Nur den glatten Weg zeichnen, ohne Umwege und Abbrüche.',
        'Momente, die sich überschneiden.',
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
