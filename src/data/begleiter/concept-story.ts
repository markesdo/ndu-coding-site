import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/concept-story.astro (Tag 3, 16:00–16:30 Story-Bogen; seit 20.11.2026
// nur Theorie – die Übung entfällt, 16:30–17:15 ist Puffer für die Übungen des Tages).
// Vorwissen: „unsicher“ – „storyboard“ aus dem Entrepreneur Lab genannt (vorwissen.ts). Zuerst fragen; das Storyboard
// selbst kommt an Tag 4 (usage-story.astro), heute geht es um den Bogen dahinter.
// Zeit (Entscheidung 66, 21.11.): Die Sprechzeiten in den live-Stichworten ergeben zusammen rund 47 min, also deutlich
// mehr als die 30 min des Blocks. Gekürzt wird nicht (Markus: „dont cut – improve it“): Der Block läuft bei Bedarf über
// und nimmt sich die Zeit aus dem Puffer bis 17:15. Deshalb gibt es auf dieser Seite keine „Wenn hinten“-Zeilen.
// Lichaw liegt als EPUB vor: Quellen mit Kapitel + Abschnitt; neuere Einträge zusätzlich mit Seite nach den
// Seitenmarken der Druckausgabe im EPUB. Was nicht von Lichaw stammt, ist als „Kursformulierung“ markiert.
const LICHAW = 'Donna Lichaw, The User’s Journey';

export const NOTIZEN_CONCEPT_STORY: Record<string, Notiz> = {
  'story-bogen': {
    live: [
      'Zeit: Ist-Zeit notieren; Sprechzeit ~3 min.',
      'Fragen: Wer hat im Entrepreneur Lab ein Storyboard gezeichnet?',
      '„Ihr wisst nicht, ob eure Idee gut ist? Lichaw sagt: Das ist eine Geschichte.“',
      'Drei Fragen zeigen: Hauptfigur und Ziel stehen schon im Kundenprofil.',
      'Lichaws Film erzählen; dann Bogen: x Zeit, y Spannung, Cliffhanger.',
    ],
    verstaendnis: {
      frage: 'Was ist ein Cliffhanger auf dieser Kurve?',
      antwort: 'Eine Geschichte, die endet, während die Spannung noch steigt oder am Gipfel steht – sie klingt nicht ab (Kap. 2, Story Has a Structure).',
      falsch: '„Ein besonders spannendes Ende“ – gemeint ist ein fehlendes Ende.',
    },
    geschichte: {
      text: '2004 zeigte Lichaw im Master ihren Dokumentarfilm zum Jahresende vor rund 100 Leuten. Kaum war der Film aus, noch bevor das Licht anging, meldete sich ein Kommilitone: „I can’t believe you made me sit through that. What was the point?“ Ihr Urteil über den eigenen Film: „no conflict, no climax, and no resolution—ergo, no story“. Ein Produkt ist wie ein Film etwas, das Menschen erleben – es braucht eine Geschichte als Fundament.',
      quelle: `${LICHAW}, Kap. 1 (Einleitung), S. 2`,
    },
    kern: [
      {
        text: 'Warum für euch: „Let’s say that you want to build a new product, but aren’t sure if it’s a good idea? That’s a story.“ Ebenso: „You want to figure out how your product should work? Story.“ Und vor jedem neuen Projekt drei Fragen: „What’s the story? Who is the hero? What is the hero’s goal?“',
        quelle: `${LICHAW}, Introduction (vor Kap. 1), S. xiii–xiv`,
      },
      {
        text: 'Bezug zu heute: Hauptfigur und Ziel stehen seit dem Vormittag im Kundenprofil (Segment, Jobs); offen ist die erste Frage. Danach prüft ihr am Bogen, was in euren Prototyp kommt (Folie „Die Story entscheidet, was ihr baut“). Nicht sagen, dass die Concept Story an Tag 4 geschrieben wird – dafür gibt es dort keinen Block.',
        quelle: 'Kursformulierung; vgl. Lichaw, Kap. 3, Supporting the Story, S. 33',
      },
      {
        text: '„Whether you plan for it or not, your customers use their story-driven brains to understand your product and what it’s like to use your product.“ Und zum Weitererzählen: „The better the story, the better the experience, the better the word of mouth.“ Wer etwas mit Geschichte erlebt, erinnert sich eher, sieht Wert und Nutzen, tut sich leichter und will es wiederholen.',
        quelle: `${LICHAW}, Kap. 1, Why Story?`,
      },
      {
        text: 'Aristoteles: Jede Geschichte braucht Figuren, Ziele und Konflikt, verbunden durch eine Struktur. Anfang, Mitte, Ende; die Mitte dauert am längsten. „When the story doesn’t wind down and instead ends while the action is still rising or at a peak, the story is called a cliffhanger.“',
        quelle: `${LICHAW}, Kap. 2 (Einleitung) und Story Has a Structure, Abb. 2.1–2.2`,
      },
      {
        text: 'Storyboard (Vorwissen): bei Lichaw eines von mehreren Mitteln, eine Storyline zu zeigen – „a visual representation of your story that is laid out as panels in a grid“, höchstens neun Felder. Es kommt an Tag 4 bei der Usage Story.',
        quelle: `${LICHAW}, Kap. 7, Storyboard`,
      },
    ],
    fragen: [
      {
        frage: 'Ist das nicht einfach Storytelling fürs Marketing?',
        antwort: 'Nein. Lichaw: „concept stories don’t just help you figure out how to talk about a product, but how to build the product“ (Kap. 3, Supporting the Story). Dazu kommt später eine eigene Folie.',
      },
    ],
    ueberleitung: 'Probiert den Bogen gleich aus – an einem einzigen Bild.',
  },

  facetime: {
    live: [
      'Zeit: Sprechzeit ~3 min.',
      'Bild zeigen, nichts sagen.',
      'Fragen: Welches Produkt? Woran erkennt ihr das? Antworten laut.',
      'Nachfragen, bis die Geschichte da ist: wer, warum lachen, warum Video?',
      '„Euer Gehirn sucht in allem, was es sieht, eine Geschichte – mit Struktur.“',
    ],
    uebung: { dauer: '2 min', form: 'Antworten laut, je ein Satz; dann aufdecken' },
    verstaendnis: {
      frage: 'Woher wisst ihr, dass es FaceTime ist?',
      antwort: 'Aus der Geschichte, die ihr ergänzt: ältere Menschen, vielleicht Großeltern; sie lachen über die Enkel, die weit weg wohnen; hinfliegen geht nicht regelmäßig; also anrufen, mit Video. Nichts davon steht im Bild.',
      falsch: '„Weil man ein iPhone sieht“ – das Gerät allein sagt nicht, welche App.',
    },
    kern: [
      {
        text: 'Abb. 2.11, ein Standbild aus einem Apple-Werbespot. Lichaw fragt: „What do you see? How do you know that these people are using FaceTime?“ Die Antwort ist eine erschlossene Geschichte: „This is the type of computational math that your brain makes during a series of microseconds“. Und: „Your brain seeks out a story in the data it consumes. And that story has a structure to it, whether you realize it or not.“',
        quelle: `${LICHAW}, Kap. 2, Building Products with Story, Abb. 2.11`,
      },
      {
        text: '„Story is not only a tool your brain uses to understand what you see, it’s a tool your brain uses to understand what you experience.“ Die schnelle Rechnung beim ersten Hören von einem Produkt heißt in Kap. 3 „the mental calculation“ – die Concept Story.',
        quelle: `${LICHAW}, Kap. 2, Building Products with Story; Kap. 3, How Concept Stories Work`,
      },
    ],
    ablauf: {
      schritte: [
        'Bild zeigen, Frage stellen: Welches Produkt? Woran erkennt ihr das?',
        'Antworten laut, je ein Satz. Nachfragen, bis Figur, Ziel und Problem genannt sind.',
        'Aufdecken: FaceTime, dann der Satz zum Gehirn.',
      ],
      achten: [
        'Kommt eine witzige falsche Antwort (bei Lichaw: „Tinder for seniors“), aufnehmen: Auch die hat eine Geschichte, mit der man einen Prototyp testen könnte.',
      ],
      aufloesung: 'FaceTime. Erkannt wird es nicht am Gerät, sondern an der Geschichte, die alle in Sekundenbruchteilen ergänzen (Kap. 2, Building Products with Story).',
    },
    ueberleitung: 'Diese Geschichte hat eine Struktur – sieben Stationen, an einem Film.',
  },

  stationen: {
    live: [
      'Fragen: Wer kennt „Zurück in die Zukunft“?',
      'Zeit: Sprechzeit ~4 min; Film an der Abbildung, je Station ein Satz.',
      '„Ihr müsst Marty nicht mögen. Ihr müsst nur verstehen, was er will.“',
      'Krise betonen: Nichts hat funktioniert, das Ziel ist weiter weg denn je.',
      'Bei Bedarf: Film unbekannt – Drachen-Zeichnung der Abbildung erzählen.',
    ],
    verstaendnis: {
      frage: 'Worin unterscheiden sich Auslöser und Krise?',
      antwort: 'Der Auslöser ist das Problem, das die Figur losschickt (Marty strandet 1955). Die Krise ist der Punkt des größten Konflikts auf dem Weg: Nichts hat funktioniert (er beginnt zu verschwinden). Der Höhepunkt löst beides.',
      falsch: '„Die Krise ist das Problem“ – das Problem steht schon am Auslöser.',
    },
    kern: [
      {
        text: 'Exposition: Welt, Figuren, ein großes Ziel. „You don’t have to like him. You just have to understand him, his goals and why he wants to pursue them.“ Auslöser: Ein Problem stellt sich zwischen Figur und Ziel – der Ruf zum Handeln.',
        quelle: `${LICHAW}, Kap. 2, Exposition; Inciting Incident or Problem`,
      },
      {
        text: 'Steigende Handlung: „Without conflict, endings come too easily, and the audience is unconvinced or bored or both.“ Krise: „Nothing the hero has done has worked, and he is further from the goal than ever.“',
        quelle: `${LICHAW}, Kap. 2, Rising Action; Crisis`,
      },
      {
        text: 'Höhepunkt: der wichtigste Teil, löst Problem und Hürde; daran erinnert man sich. „Climax is why you are glad that you tuned in and stayed tuned in.“ Fallende Handlung: „Humans, it turns out, need closure.“ – aber so schnell wie möglich. Ende: „Characters grow throughout a story and should be changed by the end.“',
        quelle: `${LICHAW}, Kap. 2, Climax or Resolution; Falling Action or Denouement; End`,
      },
    ],
    geschichte: {
      text: 'Zurück in die Zukunft (1985), Station für Station: Marty hat Pläne, Doc hat eine Zeitmaschine (Exposition). Doc wird angeschossen, Marty landet 1955 und kommt nicht zurück (Auslöser). Mit dem jungen Doc sucht er einen Weg; seine Mutter verliebt sich in ihn, Biff wird sein Gegner (steigende Handlung). Weil die Eltern nicht zusammenfinden, beginnt er zu verschwinden (Krise). Die Eltern küssen sich, der Blitz am Uhrturm schickt ihn zurück (Höhepunkt). Zu Hause ist es besser als vorher (fallende Handlung); alles ist perfekt, sagt Marty (Ende).',
      quelle: `${LICHAW}, Kap. 2, Story Has a Structure, Abb. 2.4–2.10`,
    },
    ueberleitung: 'Wer ist die Figur in eurer Geschichte? Nicht ihr.',
  },

  hauptfigur: {
    live: [
      '„Die Hauptfigur ist die Person am anderen Ende – die, die es erlebt.“',
      'Abbildung: jede Linie eine Figur, ein eigener Weg.',
      'Brücke: Segment aus dem Kundenprofil vom Vormittag.',
      'Falle: das Produkt oder das Team als Held erzählen.',
      'Zeit: Sprechzeit ~2 min, mit der iPod-Geschichte.',
    ],
    geschichte: {
      text: '„In 2006, people said that they wanted an iPod that made phone calls. In 2007, instead they got a new way to communicate.“ Lichaw rät, so oft „warum“ zu fragen, bis das eigentliche Ziel da ist: Ein iPod, der telefoniert? Warum? Weil es bequem wäre. Warum? Weil man nur ein Gerät tragen will. Warum? … Für euch: Das große Ziel eurer Hauptfigur steht im Kundenprofil unter den Jobs, nicht in eurer Idee.',
      quelle: `${LICHAW}, Kap. 8, Goals Can Change, S. 135; „Für euch“ ist Kursformulierung`,
    },
    kern: [
      {
        text: 'Die Hauptfigur: „your main character must be the person on the other end, i.e., the person experiencing the story“. Figuren sind keine erfundenen Traumkund*innen: „They are based on real people, real goals, real behaviors, and real stories.“ Erfinden geht nur – „as long as you validate it later“.',
        quelle: `${LICHAW}, Kap. 8, Stories Are Character-Driven`,
      },
      {
        text: '„Systems are complex. Human experiences are linear.“ Jede Figur, jeder Anwendungsfall, jeder wichtige Weg bekommt eine eigene Story; Storys können sich kreuzen.',
        quelle: `${LICHAW}, Kap. 8, Choose Your Own Adventure, Abb. 8.2`,
      },
      {
        text: '„People don’t care about your product or brand. They care about themselves.“ Nach Kathy Sierra: Es zählt, was die Menschen mit dem Produkt können, nicht, was das Produkt kann.',
        quelle: `${LICHAW}, Kap. 2, Building Products with Story`,
      },
    ],
    fragen: [
      {
        frage: 'Wir haben mehrere Segmente. Mehrere Storys?',
        antwort: 'Eine: für das Segment eures Kundenprofils. Lichaw: Unterscheiden sich die Storys stark, getrennt entwerfen; meist reicht eine mit notierten Unterschieden (Kap. 3, Falling Action, Hinweis „Different strokes for different personas?“).',
      },
    ],
    ueberleitung: 'Eine Figur und ein Ziel reichen noch nicht. Probe an einer Geschichte, die ihr kennt.',
  },

  pinocchio: {
    live: [
      'Zeit: Sprechzeit ~2 min; vier Kästen vorlesen, nichts erklären.',
      'Fragen: Was fehlt? Antworten laut, je ein Satz.',
      'Noch nicht aufdecken – erst alle drei gehört.',
      '„Ohne Konflikt ist es keine Geschichte – nur Dinge, die passieren.“',
      'Falle: „Es ist zu kurz“ – auch lang bliebe es flach.',
    ],
    uebung: { dauer: '1 min', form: 'Antworten laut, je ein Satz; dann aufdecken' },
    verstaendnis: {
      frage: 'Figur und Ziel sind da. Warum ist es trotzdem keine Geschichte?',
      antwort: 'Es wirkt keine Kraft gegen die Figur. Ohne Konflikt ist es eine Folge von Ereignissen („a series of events—stuff happening“).',
      falsch: '„Weil Details fehlen“ – mehr Details machen aus einer Linie keinen Bogen.',
    },
    kern: [
      {
        text: '„Once upon a time, there was a wooden doll named Pinocchio. He wanted to become a real human boy. So he went out, bought some magic, and transformed into a boy. The end.“ – „Stories wouldn’t be stories without conflict. They would be a series of events—stuff happening.“ Jede Figur und jedes Ziel braucht eine Kraft, die dagegen wirkt.',
        quelle: `${LICHAW}, Kap. 8, Conflict Is Key`,
      },
      {
        text: 'Für Produkte: „it is not your job to place obstacles in the way, but instead to consider them and plan around them“. Die Hürden gibt es schon; ihr plant sie ein.',
        quelle: `${LICHAW}, Kap. 8, Conflict Is Key`,
      },
    ],
    ablauf: {
      schritte: [
        'Folie zeigen, die vier Kästen vorlesen.',
        'Antworten laut: Was fehlt? Nicht werten.',
        'Aufdecken: Figur und Ziel sind da – nichts steht dazwischen. Dann der zweite Punkt.',
      ],
      aufloesung: 'Es fehlt der Konflikt: eine Kraft, die gegen Figur und Ziel wirkt. Lichaw: „Stories wouldn’t be stories without conflict.“ (Kap. 8, Conflict Is Key)',
    },
    ueberleitung: 'Lichaw macht daraus eine Formel.',
  },

  'a-mal-b': {
    live: [
      'Zeit: Sprechzeit ~3 min; Abbildung: zwei Pfeile, ein Gipfel.',
      '„A ist die Kraft zum Ziel, B die Kraft dagegen. Zusammen ergeben sie den Gipfel.“',
      'iPhone: A zwei Geräte in einem, B kein neues Gerät kaufen.',
      'Fragen: Was ist B bei der Kaffeebar?',
      'Falle: Zahl der Lattes nennen – das Buch widerspricht sich.',
    ],
    verstaendnis: {
      frage: 'Was ist B bei der Kaffeebar?',
      antwort: 'Was gegen die Pendlerin wirkt: Der Automat ist schon schnell (I1-3), verzichten geht auch (I3-4) – und ob sie im Gehen bestellen, ist offen (Annahme A3).',
      falsch: '„Die Schlange“ – die Schlange ist das Problem (Auslöser), B wirkt gegen die Lösung.',
    },
    kern: [
      {
        text: '„A represents forward momentum, which is the force that a character exerts to meet his or her goal with your product or service. B is the force or forces that act against your character“ – multipliziert ergeben sie C, den Höhepunkt. iPhone: A will ein 2-in-1-Gerät, um besser zu kommunizieren; B will kein neues Gerät kaufen oder fürchtet die Bedienung. „Then C is what wins: a 3-in-1 device that works like magic and is easy to use.“',
        quelle: `${LICHAW}, Kap. 8, Math Is Fun, Abb. 8.1`,
      },
      {
        text: 'Nicht zitieren: Kap. 7 (Build and Communicate) nennt 1.000 bestellte Lattes, Kap. 8 (Math Is Fun) 4.000.',
        quelle: `${LICHAW}, Kap. 7 und Kap. 8`,
      },
    ],
    fragen: [
      {
        frage: 'Warum „mal“ und nicht „plus“?',
        antwort: 'Lichaw begründet es nicht; sie nennt es eine Formel, „you didn’t learn in math class“. Als Bild lesen: Fehlt eine der Kräfte, gibt es keinen Gipfel.',
      },
    ],
    ueberleitung: 'Was passiert, wenn B fehlt? Apple hatte so eine Version.',
  },

  flach: {
    live: [
      'Zeit: Sprechzeit ~3 min; Punkte 1–3 aufdecken, dann die Frage.',
      'Fragen: Was fehlt dieser Geschichte? Antworten laut.',
      'Nicht auflösen – die Antwort ist die nächste Folie.',
      '„Die Geschichte hat eine Struktur. Aber sie ist nicht hoch.“',
      'Gestrichelte Linie zeigen: so hoch könnte der Bogen sein.',
    ],
    uebung: { dauer: '1 min', form: 'Antworten laut; Auflösung auf der nächsten Folie' },
    kern: [
      {
        text: '„Six months before the iPhone 1 announcement, Apple filed a patent for a different kind of device“ – im Grunde ein iPod, der telefoniert. Als Geschichte: „I love my iPod; I love my mobile phone.“ – „I don’t love carrying two devices, and I wish I could have my iPod and phone all in one.“ – „iPhone to the rescue!“ – „I now have a way to have my iPod and phone in one device.“',
        quelle: `${LICHAW}, Kap. 3, Avoiding the Anticlimactic, Abb. 3.5–3.6`,
      },
      {
        text: 'Die Struktur ist da, aber „the structure isn’t very tall“: Es fehlen Krise und Höhepunkt, die einer Geschichte Höhe geben. „Our brains don’t like flat.“ Jobs zeigte in der Keynote 2007 zum Spaß ein Gerät, das dem Prototyp ähnelte, bevor er das echte iPhone vorstellte.',
        quelle: `${LICHAW}, Kap. 3, Avoiding the Anticlimactic`,
      },
    ],
    ablauf: {
      aufloesung: 'Es fehlen Krise und Höhepunkt. Die flache Version hat Exposition, Problem, Produkt und Ende – eine Linie. (Kap. 3, Avoiding the Anticlimactic)',
    },
    ueberleitung: 'Und so sah die Version aus, die Apple vorgestellt hat.',
  },

  hoch: {
    live: [
      'Zeit: Sprechzeit ~3 min; Abbildung: Krise als Hürde, Höhepunkt als Glühbirne.',
      '„2-in-1 war eine Linie. 3-in-1 war der Gipfel.“',
      'Krise vorlesen: iPod, Handys, Smartphones, Preis, Bedienung.',
      '„Niemand hatte nach drei Geräten in einem gefragt.“',
      'Fragen: Was ist bei euch die einfache Lösung?',
    ],
    verstaendnis: {
      frage: 'Was hat die Version von 2007, das der Patent-Version fehlt?',
      antwort: 'Eine Krise (schon ein iPod und ein Handy, Preis, Angst vor dem Touchscreen) und einen Höhepunkt, der sie auflöst: das beste Gerät zum Kommunizieren, das „wie Magie“ funktioniert.',
      falsch: '„Mehr Funktionen“ – es zählt, dass der Höhepunkt die Krise auflöst.',
    },
    kern: [
      {
        text: '„No one had asked for a three-in-one communication device.“ Jobs nannte zuerst das Problem (Smartphones taugen nichts), dann drei Produkte – iPod, Telefon, Internet-Kommunikator – und fragte: „Are you getting it?“',
        quelle: `${LICHAW}, Kap. 3 (Einleitung)`,
      },
      {
        text: 'Krise beim iPhone: schon ein iPod oder Handy, der Preis, die Angst vor dem Touchscreen ohne Tastatur. Höhepunkt: der beste Weg zu kommunizieren, mit Internet, Karten, E-Mail. „A concept without a conflict and a resulting climax is a flat story—literally just a line.“',
        quelle: `${LICHAW}, Kap. 3, Crisis; Climax/Resolution; Abb. 3.4`,
      },
      {
        text: '„A simple solution, an iPhone that made phone calls, was flat.“ – „One was a 2-in-1 device, the other 3-in-1.“ Die Probe aus Lichaws Fragenliste: „What is the straightforward solution to the problem?“ und „What is the awesome solution to the problem?“',
        quelle: `${LICHAW}, Kap. 3, Avoiding the Anticlimactic; What Is a Concept Story?`,
      },
    ],
    ueberleitung: 'Die Story war mehr als die Rede dazu: Sie hat entschieden, was gebaut wurde.',
  },

  'baut-mit': {
    live: [
      'Zeit: Sprechzeit ~2 min.',
      '„Das erste iPhone hatte aufwendige Animation – aber kein Kopieren und Einfügen.“',
      'Fragen: Warum diese Reihenfolge?',
      '„Die Story sagt nicht nur, wie ihr redet, sondern was ihr baut.“',
      'Brücke: Eine geschriebene Story schneidet später den Prototyp.',
    ],
    verstaendnis: {
      frage: 'Warum Animation vor Kopieren und Einfügen?',
      antwort: 'Der Höhepunkt versprach ein Gerät, das „wie Magie“ funktioniert. Dafür musste der Touchscreen leicht zu bedienen sein, und das leistete die Animation. Kopieren und Einfügen trug zu diesem Höhepunkt nichts bei.',
      falsch: '„Weil es schöner aussah“ – sie stützte das Wertversprechen.',
    },
    kern: [
      {
        text: '„Animation supported the story. Cut-and-paste did not.“ Die Story bestimmte die Anforderungen: „concept stories don’t just help you figure out how to talk about a product, but how to build the product.“ Kein Marketing kann ein Produkt tragen, das die versprochene Story nicht einlöst.',
        quelle: `${LICHAW}, Kap. 3, Supporting the Story`,
      },
      {
        text: '„Everything you want that person to experience must drive the story forward. If it doesn’t, you cut it out.“ Der Bezug zur Story Map ist ein Übertrag des Kurses.',
        quelle: `${LICHAW}, Kap. 8, Stories Are Character-Driven; Kursregel`,
      },
    ],
    ueberleitung: 'Lichaw kennt drei Arten von Storys. Heute geht es um die erste.',
  },

  'drei-storys': {
    live: [
      '„Verstehen, sehen, erleben – drei Storys auf demselben Bogen.“',
      'Heute nur Concept; Origin und Usage, mit Storyboard, an Tag 4.',
      'Exposition betonen: einmal schreiben, dreimal verwenden.',
      'Lichaws Pinterest-Mail erzählen: unscheinbar, und doch ihre Origin Story.',
      'Zeit: Sprechzeit ~2 min, mit der Pinterest-Geschichte.',
    ],
    geschichte: {
      text: '2011 bekam Lichaw eine Einladung zu Pinterest. „The email wasn’t pretty. The copy wasn’t mind-blowing.“ Trotzdem war sie nach wenigen Minuten überzeugte Nutzerin: Die Mail kam im Namen ihrer Partnerin und versprach eigene Sammlungen zum Teilen – genau das, was Lichaw mit Rezepten und Einrichtungsideen ohnehin mühsam tat. Diese Mail war Teil ihrer Origin Story, „the story of how someone becomes your customer for the first time“ – der Brücke zwischen Concept Story und Usage Story.',
      quelle: `${LICHAW}, Kap. 4 (Einleitung) und What Is an Origin Story?, S. 44–45, Abb. 4.1`,
    },
    kern: [
      {
        text: '„In a concept story, the climax occurs when your customer understands the value of a product; in an origin story, it happens when the user sees the value of a product.“ Bei der Usage Story erlebt die Person den Wert.',
        quelle: `${LICHAW}, Kap. 4, How Origin Stories Work, Climax/Resolution`,
      },
      {
        text: '„The material in the exposition is the same in all three stories: origin, concept, and usage.“',
        quelle: `${LICHAW}, Kap. 4, How Origin Stories Work, Exposition`,
      },
    ],
    ueberleitung: 'Jetzt derselbe Bogen, gefüllt mit einem Produkt.',
  },

  'concept-story': {
    live: [
      'Zeit: Ist-Zeit notieren; Sprechzeit ~3 min, mit der BOOM-Karte.',
      '„Das ist die Rechnung, die jemand in Sekunden macht, wenn er von euch hört.“',
      'Abbildung von links lesen, nur bis zur Hürde.',
      'Krise = Konkurrenz: Produkt, heutiger Weg, Widerstand gegen Neues.',
    ],
    verstaendnis: {
      frage: 'Was steht in der Krise, wenn es kein Konkurrenzprodukt gibt?',
      antwort: 'Wie die Menschen ihr Problem heute lösen („an alternative way that people currently solve their problems“) oder ihr Widerstand, etwas Neues anzufangen.',
      falsch: '„Dann gibt es keine Krise“ – eine heutige Lösung gibt es fast immer.',
    },
    kern: [
      {
        text: 'Die Concept Story zeigt, was das Produkt ist und wie die Kundschaft darüber denkt: „the mental calculation that someone makes when they first hear about your product“. Sie dauert Sekunden. Drei Zwecke: eine gemeinsame Vision vermitteln, darauf ausrichten, daran priorisieren.',
        quelle: `${LICHAW}, Kap. 3, What Is a Concept Story?; How Concept Stories Work, Abb. 3.1`,
      },
      {
        text: 'Auslöser: „If there isn’t a problem, then there is no solution…and without either, there is no story.“ Das Problem muss nicht groß sein, und meist lösen es die Menschen heute schon irgendwie.',
        quelle: `${LICHAW}, Kap. 3, Inciting Incident/Problem`,
      },
      {
        text: '„Think of the crisis as the competition.“ Drei Formen: ein anderes Produkt; „an alternative way that people currently solve their problems“; oder emotional: „resistance to change or people not wanting to adopt something new“.',
        quelle: `${LICHAW}, Kap. 3, Crisis`,
      },
    ],
    geschichte: {
      text: 'Die Autor*innen von Breaking Bad hängen eine ganze Staffel als Karten an die Wand: „They map the story out before they write a line of dialogue or shoot a single scene.“ Nahe am Ende der Storyline von Staffel 4 hängt eine Karte mit einem einzigen Wort: „BOOM.“ Lichaw: „Mapping the story helps TV writers make things go BOOM. And it will help you, someone who builds products, make things go BOOM as well.“ Für euch: Die Concept Story ist diese Wand für euer Produkt – gelegt, bevor ihr etwas baut.',
      quelle: `${LICHAW}, Kap. 1, Making Things Go BOOM!, S. 2–3 (Abb. 1.1–1.2 liegen nicht vor; ohne Bild erzählen); „Für euch“ ist Kursformulierung`,
    },
    ueberleitung: 'Dann kommt der Gipfel – und was danach bleibt.',
  },

  hoehepunkt: {
    live: [
      '„Der Höhepunkt ist euer Wertversprechen: anders und besser als heute.“',
      'Fallende Handlung: ein Gedanke, keine Handlung – halbes Telefongespräch erzählen.',
      '„Dieser Gedanke ist eine Hypothese. Er kommt in die Annahmen-Map.“',
      'Zeit: Sprechzeit ~3 min; Ende: Ziel der Person und des Geschäfts, messbar.',
      'Falle: fallende Handlung als „meldet sich an“ – das ist Tag 4.',
    ],
    verstaendnis: {
      frage: 'Warum ist die fallende Handlung eine Annahme?',
      antwort: 'Sie behauptet, was jemand nach dem Hören denkt. Das wisst ihr nicht; Lichaw: als Hypothese mit echten Menschen prüfen.',
      falsch: '„Weil sie in der Zukunft liegt“ – entscheidend ist, dass sie ungeprüft ist.',
    },
    kern: [
      {
        text: '„The way that your product enables users to resolve these problems becomes its value proposition. Implicit in the value proposition is that it’s not only different, but also better than the alternative ways your customer has to solve this problem.“',
        quelle: `${LICHAW}, Kap. 3, Climax/Resolution`,
      },
      {
        text: 'Takeaway: „Falling action for concept stories should still remain in the realm of thought, rather than action.“ Und: „If you posit this falling action as a hypothesis, you should test it with real people.“ iPhone: überzeugt, neugierig oder skeptisch – drei mögliche Gedanken.',
        quelle: `${LICHAW}, Kap. 3, Falling Action`,
      },
      {
        text: 'Ende: „at the end, your customers can see themselves meeting their goal“; das Ziel des Geschäfts muss dazu passen. Ziele sind messbar, für Figur und Geschäft.',
        quelle: `${LICHAW}, Kap. 3, End; Kap. 8, Goals Are Measurable`,
      },
    ],
    geschichte: {
      text: 'Warum nervt ein Handygespräch, von dem man nur eine Hälfte hört, mehr als ein ganzes? Lichaw: „your brain naturally wants to complete the conversation“. Forschende nennen das einen „halfalogue“. „Humans, it turns out, need closure. Stories, likewise, need closure so that humans can feel closure.“ Für euch: Hört eure Story am Gipfel auf, fehlt dieser Abschluss – deshalb gehören Takeaway und Ende dazu.',
      quelle: `${LICHAW}, Kap. 2, Falling Action or Denouement, S. 15–16 (die Studie belegt Lichaw in Fußnote 1, hier nicht geprüft); „Für euch“ ist Kursformulierung`,
    },
    ueberleitung: 'Lichaw füllt den Bogen einmal ganz aus – für Slack.',
  },

  slack: {
    live: [
      'Stationen 1–4 aufdecken, zügig.',
      'Fragen: Was muss der Höhepunkt jetzt auflösen? Antworten laut.',
      'Aufdecken: alles an einem Ort – und überall.',
      '„Leichter als E-Mail wäre die Linie gewesen.“',
      'Zeit: Sprechzeit ~4 min.',
    ],
    verstaendnis: {
      frage: 'Was muss der Höhepunkt bei Slack auflösen?',
      antwort: 'Beides: das Problem (nichts ist an einem Ort) und die Krise (es gibt schon Gmail, Chat, Basecamp – und niemand will sich noch irgendwo anmelden). Antwort: eine Lösung für alles, überall erreichbar.',
      falsch: '„Dass E-Mail kompliziert ist“ – Schwierigkeit war nicht das Problem.',
    },
    kern: [
      {
        text: 'Slack, Station für Station: „Busy professionals“ mit mehr Werkzeugen denn je; trotzdem ist es mühsam, alles im Blick und an einem Ort zu behalten. Slack: „An online collaboration tool.“ Krise: Gmail, IM, Basecamp und „What, sign up for another online service? Ack. No.“ Höhepunkt: „Unlike the competition, Slack is a one-stop solution.“ Takeaway: sich Slack mit dem Team vorstellen – „…and maybe never using email again.“',
        quelle: `${LICHAW}, Kap. 3, Mapping a Concept Story, An Example: Slack, Abb. 3.7`,
      },
      {
        text: '„there is always a simple solution to every story, which can look like a straight line“. Besser allein reicht nicht immer; „leicht zu bedienen“ ist eine langweilige Geschichte, wenn Schwierigkeit nicht das Problem ist.',
        quelle: `${LICHAW}, Kap. 3, Mapping a Concept Story`,
      },
    ],
    ueberleitung: 'Dieselben sieben Stationen – jetzt für die Kaffeebar.',
  },

  beispiel: {
    live: [
      'Zeit: Sprechzeit ~5 min; Stationen 1–4 aufdecken, IDs aus Profil und Interviews.',
      'Fragen: Was muss der Höhepunkt auflösen? Antworten laut.',
      'Aufdecken: „Fertig 7:31. Dein Zug fährt 7:38.“',
      'Fragen: Was denkt die Pendlerin danach?',
      'Flach-Probe zeigen: Wartezeit-Anzeige an der Tür – eine Linie.',
    ],
    verstaendnis: {
      frage: 'Warum ist die Wartezeit-Anzeige eine Linie?',
      antwort: 'Sie hat Problem, Produkt und Ende, aber keine Krise: Sie setzt sich mit Automat und Verzicht nicht auseinander, also löst ihr Höhepunkt nichts auf.',
      falsch: '„Weil sie technisch einfacher ist“ – einfach zu bauen ist nicht dasselbe wie flach.',
    },
    kern: [
      {
        text: 'Die Krise der Kaffeebar stammt aus den Interviews: der Automat („halt Notlösung, aber er ist schnell“, I1-3; I4-3, I4-4) oder Verzicht (I3-4, I5-2). Der Widerstand, im Gehen zu tippen, ist unsere Annahme (A3). Der Höhepunkt löst P1–P3 und liefert G1. Die fallende Handlung ist das Gegenbild zu I2-2. Das Ende nennt den Outcome aus dem Produkt-Brief: mehr Pendler*innen steigen morgens mit Kaffee in den Zug.',
        quelle: 'Kursbeispiel Kaffeebar (kundenprofil.astro, value-map.astro, Produkt-Brief und Annahmen-Map in der Werkstatt); Aufbau nach Lichaw, Kap. 3, Mapping a Concept Story',
      },
    ],
    ablauf: {
      schritte: [
        'Stationen 1–4 aufdecken.',
        'Antworten laut: Was muss der Höhepunkt auflösen? Dann Station 5 aufdecken.',
        'Antworten laut: Was denkt die Pendlerin danach? Dann 6 und 7.',
        'Flach-Probe aufdecken und die Linie neben die Story stellen.',
      ],
      achten: [
        'Jede Behauptung hat eine ID – das ist die Messlatte für die eigene Story.',
        'Station 6 steht in „…“ und ist als Annahme markiert.',
      ],
    },
    ueberleitung: 'Woher kamen die Antworten? Fast alle standen schon da.',
  },

  woher: {
    live: [
      '„Ihr erfindet nichts. Fast jede Station steht schon in euren Dateien.“',
      'Zeit: Sprechzeit ~3 min; FitCounter, dann Tabelle Zeile für Zeile.',
      'Betonen: Nur Station 6 ist neu – und eine Annahme.',
      'Fragen: Welche Station ist bei euch am dünnsten belegt?',
      'Falle: Krise aus dem Kopf – sie steht in den Interviews.',
    ],
    verstaendnis: {
      frage: 'Welche Station schreibt ihr ganz neu?',
      antwort: 'Die fallende Handlung: was die Person nach dem Hören denkt. Alles andere kommt aus Kundenprofil, Value Map, Interviews und Produkt-Brief.',
      falsch: '„Den Höhepunkt“ – er steht als Pain Reliever und Gain Creator in der Value Map.',
    },
    kern: [
      {
        text: '„Stories are not something that you make up“ – „Stories for products come from data“. Die Zuordnung der Stationen zu Kundenprofil, Value Map, Interviews und Produkt-Brief ist eine Regel dieses Kurses.',
        quelle: `${LICHAW}, Kap. 6 (Einleitung); Kursregel`,
      },
      {
        text: 'Lichaws Fragen je Station, u. a. „What’s good in her world as it relates to your product or service?“, „What mental hurdles might keep her from adopting your solution?“, „What do you want people to think, feel, or envision after learning about your product?“, „How will you know you’re on the right path?“',
        quelle: `${LICHAW}, Kap. 3, Mapping a Concept Story`,
      },
    ],
    fragen: [
      {
        frage: 'Unsere Interviews nennen keine Alternative. Was dann?',
        antwort: 'Dann steht in der Krise, was die Interviewten heute tun, auch wenn es „nichts“ ist, plus der innere Widerstand. Fehlt beides, ist das eine Lücke für das nächste Interview – als Annahme notieren, nicht erfinden.',
      },
    ],
    geschichte: {
      text: 'FitCounter, ein Fitness-Start-up, das Lichaw ausdrücklich fiktionalisiert hat („It is not a real company, nor a real product.“): Die Gratis-Videos hatten viele Aufrufe, aber „very few website visitors signed up to become members, and even fewer of the members paid“. Es gab eine kleine Gruppe treuer, zahlender Kund*innen, die „superfans“ – und niemand im Team verstand, warum sie das Produkt liebten. Erst Gespräche mit ihnen ergaben die Concept Story: eigene Trainingspläne aus kurzen Videos. Und dann der Befund: „But this was not the concept behind our current product.“ Für euch: Die Story kam aus den Gesprächen, nicht aus dem Kopf.',
      quelle: `${LICHAW}, Kap. 3, Finding the Concept Story at FitCounter, S. 38–42, Abb. 3.8; Fall fiktionalisiert (S. 38), kein Beleg; „Für euch“ ist Kursformulierung`,
    },
    ueberleitung: 'Aus der Story wird am Ende ein Satz.',
  },

  'ein-satz': {
    live: [
      'Muster zeigen, Kaffeebar-Satz vorlesen.',
      '„Der Satz ist die Story in klein: Figur, Problem, Produkt, Krise, Höhepunkt.“',
      'Falle: mit dem Satz anfangen – erst die sieben Stationen.',
      '„Heute bleibt es Theorie – eine eigene Story schreibt ihr heute nicht.“',
      'Zeit: Sprechzeit ~2 min; danach Puffer bis 17:15.',
    ],
    kern: [
      {
        text: '„For [target customer] who has [customer need], [product name] is a [market category] that [one key benefit]. Unlike [competition], the product [unique differentiator].“ Zielkunde = Hauptfigur, Bedürfnis = Auslöser, Name, Kategorie und Nutzen = steigende Handlung, Konkurrenz = Krise, Unterschied = Höhepunkt. Das Format übernimmt Lichaw von gamestorming.com (Fußnote 4).',
        quelle: `${LICHAW}, Kap. 7, Elevator Pitch`,
      },
    ],
    geschichte: {
      text: 'Als Steve Jobs 2007 das iPhone vorstellte, war das Gerät in seiner Hand kein fertiges iPhone, sondern „a semi-functional prototype“ – eine Requisite, die die Vision und die Story trug. Jobs ließ seine Vision und Story durch alles laufen, vom Design über die Präsentation bis zum Prototyp. Der Satz ist die kürzeste Form dieser Story: Wo ihr keinen Bogen zeichnen könnt, „you can speak a few words and see how people respond“.',
      quelle: `${LICHAW}, Kap. 7, Elevator Pitch, S. 127–128; Build and Communicate, S. 129 (die Latte-Zahl dort nicht nennen); Brücke zum Satz ist Kursformulierung`,
    },
    ueberleitung: 'Damit endet die Theorie. Bis 17:15 holt ihr nach, was vom Tag offen ist.',
  },
};
