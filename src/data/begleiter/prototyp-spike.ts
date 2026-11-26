import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/prototyp-spike.astro (Tag 4, 28.11., 14:05–15:35: 15 min Theorie und
// Beispiel auf sieben Folien, 75 min Übung auf zwei Folien (55 + 20); Rest im Puffer 16:25–17:15). Bland = gedruckte
// Seiten (PDF-Seite − 16); Torres = PDF-Seiten wie in quellen/torres/text.txt; Nielsen = NN/g-Artikel, wörtlich geprüft
// am 26.11.2026.
const BLAND = 'David J. Bland & Alexander Osterwalder, Testing Business Ideas';
const TORRES = 'Teresa Torres, Continuous Discovery Habits';

export const NOTIZEN_PROTOTYP_SPIKE: Record<string, Notiz> = {
  worum: {
    live: [
      'Anknüpfen: Usage Story, Stationen 2 bis 6 – daraus werden Bildschirme.',
      'Papier-Skizzen: ein Blatt pro Bildschirm, von Hand; Pfeile, wohin jeder Knopf führt.',
      'Kursregel: Papier vor Claude – sonst wird Claudes Vorstellung getestet.',
      'Abnahmekriterien = drei Sätze; Zeitbox = 40 min, dann Schluss.',
    ],
    verstaendnis: {
      frage: 'Wozu zeichnet ihr erst auf Papier, wenn Claude Code den Prototyp ohnehin baut?',
      antwort: 'Damit ihr jeden Bildschirm selbst entscheidet: was draufsteht und welcher Knopf wohin führt. Claude Code baut nach dem Foto der Blätter. Ohne Papier testet ihr Claudes Vorstellung von eurem Produkt.',
    },
    kern: [
      {
        text: 'Extreme Programming Spike: „Define your acceptance criteria. Define your time box for the spike.“ – „not ideal for scaling the solution, as it is typically thrown away and re-created afterwards.“',
        quelle: `${BLAND}, S. 306–307`,
      },
      {
        text: 'Paper Prototype: „Sketched interface on paper, manipulated by another person to represent the software’s reactions to the customer interaction.“ – „ideal for rapidly testing the concept of your product quickly with customers.“',
        quelle: `${BLAND}, S. 182`,
      },
    ],
    ueberleitung: 'Was zeigt so ein Prototyp – und was zeigt er nicht?',
  },

  'was-er-zeigt': {
    live: [
      'Zwei Kästen: E1 – wollen sie es? E2 – kommen sie zurecht?',
      'Beobachtet wird: geschafft, Zeit, wo gehangen, wo gelächelt.',
      'Falle: Er belegt Bedienbarkeit, nicht ob jemand es will (E1).',
    ],
    verstaendnis: {
      frage: 'Was zeigt euch der Klick-Prototyp – und was nicht?',
      antwort: 'Ob Menschen in einer Testsituation mit dem Ablauf zurechtkommen: Aufgabe geschafft, Zeit, wo gehangen. Nicht, ob sie es im echten Leben wollen – das prüft E1.',
      falsch: '„Ob das Produkt ankommt“ – ob jemand es will, zeigt E1. Und laut Bland ersetzt der Klick-Prototyp auch keinen richtigen Usability-Test mit Kund*innen (S. 236).',
    },
    kern: [
      {
        text: '„Clickable prototype is ideal for rapidly testing the concept of your product quickly with customers at a higher fidelity than paper.“ – „not ideal as a replacement for proper usability with customers.“ Beleg: geschaffte Aufgaben, „a bit stronger than using paper“.',
        quelle: `${BLAND}, S. 236–238`,
      },
      {
        text: '„What people say in an interview or survey is not necessarily what they do in real life or will do in the future.“ – darum misst E1 eine Handlung im echten Leben, E2 die Bedienung im Test.',
        quelle: `${BLAND}, S. 52`,
      },
    ],
    ueberleitung: 'Wie läuft so ein Usability-Test – und mit wem?',
  },

  'usability-test': {
    live: [
      'Eine Testperson, eine Aufgabe, der Prototyp – alle schauen nur zu.',
      'Falle: Meinungsfragen („Gefällt dir das?“) – gemessen wird, was sie tut.',
      'Ergebnis sind Bedienprobleme; ob sie es will, zeigt E1.',
      'Heute nur der Trockenlauf; Tests mit Zielgruppe freiwillig bis Tag 5.',
    ],
    verstaendnis: {
      frage: 'Eine Testperson sagt am Ende: „Coole App, würde ich nutzen.“ Was davon notiert ihr?',
      antwort: 'Als Beleg nichts – das ist eine Meinung. Notiert wird, was sie getan hat: Ziel erreicht oder nicht, wo sie gehangen hat, wie lange es dauerte, wie sie am Höhepunkt reagiert hat.',
    },
    ueberleitung: 'Wie viele Testpersonen braucht ihr? Fünf – und warum gerade fünf, zeigt die Kurve.',
  },

  fuenf: {
    live: [
      'Kurve von links: eine Person findet rund 31 % der Bedienprobleme.',
      'Jede weitere wiederholt vieles – darum flacht die Kurve ab.',
      '„Nach fünf habt ihr rund 85 % der Bedienprobleme gesehen.“',
      'Wenn getestet wird: fünf ideal; zwei, drei finden schon gut die Hälfte.',
      'Falle: 85 % aller Probleme – gemeint sind nur Bedienprobleme.',
    ],
    verstaendnis: {
      frage: 'Warum nicht gleich fünfzehn Testpersonen auf einmal?',
      antwort: 'Ab der sechsten seht ihr fast nur Wiederholungen. Besser: fünf testen, die Probleme beheben, dann wieder fünf – die zweite Runde zeigt, ob das Beheben gewirkt hat und was dahinter auftaucht.',
    },
    kern: [
      {
        text: '„After the fifth user, you are wasting your time by observing the same findings repeatedly but not learning much new.“ Statt 15 auf einmal: „Spend this budget on 3 studies with 5 users each!“',
        quelle: 'Jakob Nielsen, „Why You Only Need to Test with 5 Users“, NN/g 2000, https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/',
      },
      {
        text: '„where N is the total number of usability problems in the design and L is the proportion of usability problems discovered while testing a single user. The typical value of L is 31%, averaged across a large number of projects we studied.“ – „As you add more and more users, you learn less and less because you will keep seeing the same things again and again.“',
        quelle: 'Jakob Nielsen, „Why You Only Need to Test with 5 Users“, NN/g 2000 (abgerufen 26.11.2026)',
      },
    ],
    ueberleitung: 'Und wie läuft ein einzelner Test?',
  },

  'test-ablauf': {
    live: [
      'Zwei Aufgaben vergleichen: Situation und Ziel gegen Bedienschritte.',
      'Laut denken vormachen: sagen, was man sieht, sucht, vorhat.',
      'Stockt sie: nur „Was würdest du jetzt tun?“ – nicht helfen.',
      'Zu zweit: eine*r führt, eine*r notiert im Frame; daraus U1, U2 …',
    ],
    verstaendnis: {
      frage: 'Ist „Scanne den Code und tippe auf Bestellen“ eine gute Testaufgabe?',
      antwort: 'Nein, sie verrät die Bedienschritte. Gut: „Du bist um 7:27 in der Halle, dein Zug fährt um 7:38. Hol dir einen Cappuccino.“ – Situation, Ziel, alle nötigen Informationen.',
    },
    kern: [
      {
        text: '„Recruit representative users“, „Give them representative tasks to perform.“, „Shut up and let the users do the talking.“',
        quelle: 'Jakob Nielsen, „Thinking Aloud: The #1 Usability Tool“, NN/g 2012, https://www.nngroup.com/articles/thinking-aloud-the-1-usability-tool/',
      },
      {
        text: 'Papier-Test: „Have one person conduct the interviews“, „Have another person write notes and act as a scribe.“; danach: „Where did they get stuck or confused?“ – „What did they get excited about?“',
        quelle: `${BLAND}, S. 183`,
      },
    ],
    ueberleitung: 'Auch dieser Test bekommt eine Karte – bevor die erste Person testet.',
  },

  'karte-e2': {
    live: [
      'Dieselben Zeilen wie E1, jetzt für A3 (bedienbar).',
      'Gemessen: Höhepunkt ohne Hilfe erreicht – ja oder nein.',
      'Die 20 Sekunden aus A3 notieren – Richtwert, nicht Schwelle.',
      'Vorher entschieden: ab 4 bauen · 3 nachtesten · unter 3 neu skizzieren.',
      'Testpersonen mit dem Pain, nicht die bequemsten.',
    ],
    kern: [
      {
        text: '„make sure that your participants experience the need, pain point, or desire represented by that target opportunity. Remember to recruit for variation. Don’t just test with the easiest audience to reach or the most vocal audience.“',
        quelle: `${TORRES}, S. 145`,
      },
      {
        text: 'Die Beobachtung am Höhepunkt ist Lichaws Smile Test: Lächelt die Person dort, wo die Usage Story den Höhepunkt hat? Sie steht neben „Höhepunkt erreicht“ und zählt nicht für die Schwelle.',
        quelle: 'Donna Lichaw, The User’s Journey, Kap. 6, Use the Smile Test',
      },
    ],
    fragen: [
      {
        frage: 'Warum 4 von 5 und nicht 5 von 5?',
        antwort: 'Eine Setzung der Kaffeebar, wie jede Schwelle: vorher festgelegt, als x von y. Wichtig ist, dass sie vor dem ersten Test steht.',
      },
      {
        frage: 'Woher kommen die drei Bänder von E2?',
        antwort: 'Eine Setzung der Kaffeebar in der Form von Karte E1 (Vorher entscheiden): ab 4 → Slice 1 bauen · 3 → Hänger beheben, mit drei weiteren testen · unter 3 → Ablauf neu skizzieren, E2 wiederholen. Weicht ihr später davon ab, steht der Grund auf der Lernkarte.',
      },
    ],
    ueberleitung: 'Wie das für die Kaffeebar aussieht: erst der Spike, dann ausgedachte Befunde.',
  },

  beispiel: {
    live: [
      'Fünf Blätter zeigen: eines pro Bildschirm; Blatt 3 ist der Höhepunkt.',
      'Abnahmekriterien: drei Tipps, läuft am Handy, „Prototyp – nicht echt“.',
      'Nicht drin: Login, Zahlung, Datenbank.',
    ],
    ueberleitung: 'Fünf Tests später: was dabei herauskommt.',
  },

  'beispiel-befunde': {
    live: [
      '„Die Befunde sind ausgedacht – achtet auf die Form.“',
      'Tabelle zeilenweise: ID, Befund, wie oft, Folge.',
      'U2: alle fünf suchten eine Abfahrtsliste – rückt in Slice 1.',
      'U3: Hinweis auf dem Höhepunkt-Bildschirm (Setzung der Kaffeebar).',
    ],
    kern: [
      {
        text: 'Fällt eine Annahme über eine Lösung, „we typically design around them. We evolve our ideas so that they no longer depend on the faulty assumption.“',
        quelle: `${TORRES}, S. 140`,
      },
    ],
    ueberleitung: 'Jetzt ihr: 75 Minuten – erst bauen, dann Karte und Trockenlauf.',
  },

  vorgehen: {
    live: [
      'Timer je Schritt: 10 + 5 + 40 min, dann zweite Folie.',
      'Falle: direkt bauen lassen, ohne Papierskizze.',
      'Claude Code mit Opus (/model opus); Eingabe: Screenshots, keine Dateien.',
      'Timer bei null: aufhören; zuerst den Höhepunkt-Bildschirm.',
      'Spike bleibt im Branch; Vercel-Vorschau fürs Handy.',
    ],
    uebung: { dauer: '55 min (10 + 5 + 40)', form: 'allein' },
    ablauf: {
      schritte: [
        'Papier, allein: vier bis sechs Blätter, eines pro Bildschirm der Usage Story, von Hand; der Höhepunkt ein eigenes Blatt; Pfeile, wohin jeder Knopf führt; Foto in den Frame „T4 · 5 · Prototyp · Produkt n“ (10 min).',
        'Abnahmekriterien und Zeitbox im selben Frame: was der Prototyp zeigen muss, bis wann, was er nicht hat (5 min).',
        'Bauen in Claude Code mit Opus (/model opus): Prompt „Spike · Claude Code“ aus dem Handout plus drei Screenshots – Usage Story, Story Map mit Slice 1, Frame mit Skizzen und Abnahmekriterien; Claude Code legt den Branch spike/[name] an; bei null aufhören (40 min).',
        'Am Handy ansehen als Vercel-Vorschau; der Spike bleibt im Branch.',
      ],
      achten: [
        'Nur Oberfläche: Daten im Speicher, kein Login, keine Bezahlung, keine Datenbank.',
        'Was in 40 Minuten fehlt, steht im Frame; weiter im Puffer ab 16:25.',
      ],
    },
    ueberleitung: 'Bevor jemand testet: Karte E2 – und ein Trockenlauf untereinander.',
  },

  'vorgehen-test': {
    live: [
      'Timer je Schritt: 10 + 10 min.',
      'Karte E2 mit „Wir entscheiden vorher“ – vor dem Trockenlauf.',
      'Trockenlauf online: Testperson denkt laut, wem er gehört, klickt.',
      'Kursregel – keine Kritik: kein Feedback danach, nur notieren.',
    ],
    uebung: { dauer: '20 min (10 + 10)', form: 'allein; Trockenlauf in drei Runden, keine Kritik' },
    ablauf: {
      schritte: [
        'Karte E2 und Testaufgabe auf Miro im selben Frame, mit der Zeile „Wir entscheiden vorher“ (10 min).',
        'Trockenlauf in drei Runden: A testet B, C schreibt; B testet C, A schreibt; C testet A, B schreibt – je gut drei Minuten (10 min).',
      ],
      achten: [
        'Wem der Prototyp gehört, teilt den Bildschirm und klickt; die Testperson sagt nur, was sie tun will.',
        'Kein Feedback danach: notiert wird nur, ob die Aufgabe verständlich und der Höhepunkt erreicht ist.',
      ],
    },
    kern: [
      {
        text: '„Test it internally to make sure the flow works.“ Der Trockenlauf ist heute der Test des Prototyps; für die Schwelle von E2 zählt er nicht (Testpersonen mit dem Pain, freiwillig bis Tag 5).',
        quelle: `${BLAND}, S. 183`,
      },
      {
        text: 'Online-Form des Trockenlaufs (Bildschirm teilen, die Testperson sagt an, wem der Prototyp gehört, klickt) und „keine Kritik“ sind Kursregeln: Die Testperson erfüllt eine Aufgabe, beurteilt wird nichts.',
        quelle: 'Kurs: prototyp-spike.astro, Folie vorgehen-test (Handout)',
      },
    ],
    ueberleitung: 'Zum Schluss noch eine Frage an eure Tests.',
  },

  uebertrag: {
    live: [
      'Folien-Satz vorlesen: Welcher Befund zeigt sich bei allen?',
      '„Ihr findet ihn nur, wenn ihr beim Test schweigt.“',
      'Bis Tag 5 freiwillig: Tests mit Menschen mit dem Pain; fünf ideal.',
      'Bedienbar sagt E2 – ob jemand es will, sagt E1.',
    ],
    ueberleitung: 'Nach der Pause: Agil und Scrum – wie ihr ab Tag 5 im Takt baut.',
  },
};
