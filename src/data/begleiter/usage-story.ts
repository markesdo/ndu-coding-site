import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/usage-story.astro (Tag 4, 28.11., 13:35–14:05: 12 min Theorie und
// Beispiel, 18 min Übung). Vorwissen „unsicher“ (Entrepreneur Lab: „kinda, not really?“): kurz nachfragen.
// Lichaw = EPUB, zitiert nach Kapitel und Abschnitt.
const LICHAW = 'Donna Lichaw, The User’s Journey (2016)';

export const NOTIZEN_USAGE_STORY: Record<string, Notiz> = {
  'usage-story': {
    live: [
      'Derselbe Bogen wie die Concept Story – jetzt Schritt für Schritt.',
      'Abbildung von links: Auslöser, Schritte, Hürde, Glühbirne am Gipfel.',
      '„Jeder Schritt wird relevanter als der vorige – nicht gut oder schlecht.“',
      'Höhepunkt: nicht dass, sondern wie das Problem gelöst wird.',
      'Kernaufgabe = der Weg durch Slice 1 eurer Story Map.',
    ],
    verstaendnis: {
      frage: 'Was unterscheidet die Usage Story von der Concept Story?',
      antwort: 'Die Concept Story erzählt, warum jemand das Produkt braucht; die Usage Story erzählt, wie jemand es nutzt – Schritt für Schritt, Bildschirm für Bildschirm, für einen Ablauf, den Menschen immer wieder gehen. Die Exposition ist dieselbe.',
      falsch: '„Die Usage Story ist die Concept Story, nur länger“ – sie erzählt einen einzelnen Ablauf, nicht das Produkt.',
    },
    kern: [
      {
        text: 'Steigende Handlung: „Each step should build the user’s interest and become more interesting or relevant than the last step.“ – „Things don’t get good or bad for your user. They get better and better.“',
        quelle: `${LICHAW}, Kap. 5`,
      },
      {
        text: '„What matters most for a usage story is not just that the problem is solved, but how it is solved.“ – „If just solving a problem is awesome enough, the story will flow well, yet be anti-climactic.“',
        quelle: `${LICHAW}, Kap. 5, Climax/Resolution`,
      },
      {
        text: '„Core tasks are interactions that you want and expect users to perform over and over again.“',
        quelle: `${LICHAW}, Kap. 5`,
      },
    ],
    ueberleitung: 'Wo genau gehört der Höhepunkt hin? Das kennt ihr schon von Tag 2.',
  },

  'nahe-am-ende': {
    live: [
      'Brücke zu Tag 2: Peak-End-Regel aus der Experience Map.',
      'Storyboard zeigen: Auslöser im zweiten, Höhepunkt im siebten Feld.',
      '„Nicht am Gipfel aufhören – danach ein, zwei Schritte, dann Schluss.“',
      'Boom darf klein sein, muss aber bedeutsam sein.',
    ],
    kern: [
      {
        text: '„The peak-end rule not at all coincidentally mirrors the structure of a narrative arc.“',
        quelle: `${LICHAW}, Kap. 5, Abb. 5.1`,
      },
      {
        text: '„humans need a little something near the end of an experience“; der Boom „can be as seemingly insignificant as a little animation on a tiny screen“ – „As long as that little something is significant, delightful, or impactful“.',
        quelle: `${LICHAW}, Kap. 8, Make Things Go Boom!`,
      },
      {
        text: '„the inciting incident and climax should happen on the second and seventh panel, respectively“.',
        quelle: `${LICHAW}, Kap. 7, Abb. 7.2`,
      },
      {
        text: '„The flow can’t just end on a high point—it has to go somewhere and take the user with it.“ Und: „the falling action or denouement should happen as quickly as possible.“',
        quelle: `${LICHAW}, Kap. 5 (Falling Action); Kap. 2`,
      },
    ],
    ueberleitung: 'So sieht das an der Kaffeebar aus – Pendler I1 um 7:27.',
  },

  beispiel: {
    live: [
      'Sieben Stationen einzeln aufdecken, je mit ID.',
      'Figur aus den Interviews: I1, Zug 7:38, „eigentlich immer knapp dran“.',
      'Krise: tippen im Gehen und der Zweifel, ob es reicht.',
      'Höhepunkt ist ein Satz: „Fertig 7:31. Dein Zug fährt 7:38.“',
      'Smile Test: Hier soll im Test das Lächeln kommen.',
    ],
    verstaendnis: {
      frage: 'Woran merkt ihr im Test, dass der Höhepunkt wirkt?',
      antwort: 'Die Person lächelt oder sagt „Ah, ich versteh’s“ bei Station 5 – Lichaws Smile Test; der Spike-Test zählt das als „Höhepunkt erreicht“.',
      falsch: '„Wenn sie die Bestellung abschickt“ – das ist ein Schritt der steigenden Handlung, nicht der erlebte Wert.',
    },
    kern: [
      {
        text: 'Smile Test: Die Smiley-Zeichnung auf der Storyline steht meist am Höhepunkt; „Once you’ve got a working prototype at any level of fidelity, you can test out your story to ensure that your climax is something that really makes your customers smile.“',
        quelle: `${LICHAW}, Kap. 6, Use the Smile Test`,
      },
      {
        text: 'Die Stationen hängen an den Belegen der Kaffeebar: Exposition I1-1, Auslöser am Moment „Ich komme in die Halle und entscheide.“, Krise P1 und I3-3, Ende I1-4 (Moment „Ich bin im Zug“); die Schritte sind die Tasks aus Slice 1.',
        quelle: 'usage-story.astro, Folie beispiel (Handout)',
      },
    ],
    ueberleitung: 'Jetzt eure eigene: eine Person, eine Kernaufgabe, sieben Stationen.',
  },

  vorgehen: {
    live: [
      'Timer je Schritt: 2 + 10 + 4 + 2 min.',
      'Person aus euren Interviews, mit Uhrzeit und Ort.',
      'Boom-Probe: nur Stationen 4–7 lesen – konkret, danach Schluss?',
      'Wenn hinten: nur Krise und Höhepunkt – die braucht der Prototyp.',
      'Festhalten in docs/STORYS.md, Abschnitt „Usage Story“.',
    ],
    uebung: { dauer: '18 min (2 + 10 + 4 + 2)', form: 'allein; Boom-Probe über Kreuz (A liest B, B liest C, C liest A)' },
    ablauf: {
      schritte: [
        'Kernaufgabe wählen: der Weg durch Slice 1, den Menschen immer wieder gehen (2 min).',
        'Sieben Stationen allein, mit Person aus den Interviews, Uhrzeit, Ort (10 min).',
        'Boom-Probe über Kreuz: nur die Stationen 4 bis 7 einer anderen Story lesen – ist der Höhepunkt ein konkreter Bildschirm oder Moment, kommen danach höchstens ein, zwei Schritte, wo würdest du lächeln? (4 min)',
        'Festhalten in docs/STORYS.md (2 min).',
      ],
      achten: [
        'Höhepunkt als Bildschirm oder Moment, nicht als „Problem gelöst“.',
        'Der Prototyp-Spike baut genau die Stationen 2 bis 6 – sie müssen konkret sein.',
      ],
    },
    kern: [
      {
        text: 'Lichaws Fragen zum Höhepunkt: „What value do you want the user to experience during this flow? What will make all of her conflict, crisis, and work she puts in so far be worthwhile?“ Zur fallenden Handlung: „how will you wrap this episode up as quickly as possible“.',
        quelle: `${LICHAW}, Kap. 5, Mapping the Usage Story`,
      },
    ],
    ueberleitung: 'Zum Schluss die eine Frage, an der euer Prototyp hängt.',
  },

  uebertrag: {
    live: [
      'Folien-Satz vorlesen: Was ist euer „Fertig 7:31“?',
      'Ein Satz oder Bild: Hier merkt die Person, es lohnt sich.',
      '„Könnt ihr ihn nicht zeigen, testet ihr eine Bestellseite, nicht euer Produkt.“',
    ],
    ueberleitung: 'Genau diesen Höhepunkt baut ihr jetzt: erst auf Papier, dann klickbar.',
  },
};
