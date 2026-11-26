import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/prototyp-spike.astro (Tag 4, 28.11., 14:05–15:35: 15 min Theorie und
// Beispiel, 75 min Übung; Rest im Puffer 16:25–17:15). Bland = gedruckte Seiten (PDF-Seite − 16); Torres = PDF-Seiten
// wie in quellen/torres/text.txt; Nielsen = NN/g-Artikel, wörtlich geprüft am 26.11.2026.
const BLAND = 'David J. Bland & Alexander Osterwalder, Testing Business Ideas';
const TORRES = 'Teresa Torres, Continuous Discovery Habits';

export const NOTIZEN_PROTOTYP_SPIKE: Record<string, Notiz> = {
  worum: {
    live: [
      '„Ein Spike ist Code zum Lernen, nicht zum Behalten.“',
      'Kursregel: Papier vor Claude – sonst testet ihr Claudes Vorstellung.',
      'Spike wie im Extreme Programming: Abnahmekriterien, Zeitbox, wegwerfen.',
      'Falle: Er belegt Bedienbarkeit, nicht ob jemand es will (E1).',
    ],
    verstaendnis: {
      frage: 'Was zeigt euch der Klick-Prototyp – und was nicht?',
      antwort: 'Ob Menschen in einer Testsituation mit dem Ablauf zurechtkommen: Aufgabe geschafft, Zeit, wo gehangen. Nicht, ob sie es im echten Leben wollen – das prüft E1.',
      falsch: '„Ob das Produkt ankommt“ – dafür ist der Prototyp laut Bland kein Ersatz für echte Nutzung.',
    },
    kern: [
      {
        text: '„Clickable prototype is ideal for rapidly testing the concept of your product quickly with customers at a higher fidelity than paper.“ – „not ideal as a replacement for proper usability with customers.“ Beleg: geschaffte Aufgaben, „a bit stronger than using paper“.',
        quelle: `${BLAND}, S. 236–238`,
      },
      {
        text: 'Extreme Programming Spike: „Define your acceptance criteria. Define your time box for the spike.“ – „not ideal for scaling the solution, as it is typically thrown away and re-created afterwards.“',
        quelle: `${BLAND}, S. 306–307`,
      },
      {
        text: '„What people say in an interview or survey is not necessarily what they do in real life or will do in the future.“ – darum misst E1 eine Handlung im echten Leben, E2 die Bedienung im Test.',
        quelle: `${BLAND}, S. 52`,
      },
    ],
    ueberleitung: 'Wen testet ihr, und wie viele? Fünf reichen.',
  },

  fuenf: {
    live: [
      'Kurve: Nach fünf Personen kommt kaum Neues.',
      'Aufgabe als Situation und Ziel, nie „tippe auf Bestellen“.',
      '„Laut denken lassen – und ihr schweigt.“',
      'Zu zweit: eine*r führt, eine*r schreibt mit.',
    ],
    verstaendnis: {
      frage: 'Ist „Scanne den Code und tippe auf Bestellen“ eine gute Testaufgabe?',
      antwort: 'Nein, sie verrät die Bedienschritte. Gut: „Du bist um 7:27 in der Halle, dein Zug fährt um 7:38. Hol dir einen Cappuccino.“ – Situation, Ziel, alle nötigen Informationen.',
    },
    kern: [
      {
        text: '„After the fifth user, you are wasting your time by observing the same findings repeatedly but not learning much new.“ Statt 15 auf einmal: „Spend this budget on 3 studies with 5 users each!“',
        quelle: 'Jakob Nielsen, „Why You Only Need to Test with 5 Users“, NN/g 2000, https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/',
      },
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
      'Dieselben vier Zeilen wie E1, jetzt für A3 (bedienbar).',
      'Gemessen: Höhepunkt ohne Hilfe erreicht – ja oder nein.',
      'Die 20 Sekunden aus A3 notieren – Richtwert, nicht Schwelle.',
      'Testpersonen mit dem Pain, nicht die bequemsten.',
    ],
    kern: [
      {
        text: '„make sure that your participants experience the need, pain point, or desire represented by that target opportunity. Remember to recruit for variation. Don’t just test with the easiest audience to reach or the most vocal audience.“',
        quelle: `${TORRES}, S. 145`,
      },
      {
        text: 'Die Beobachtung am Höhepunkt ist Lichaws Smile Test: Lächelt die Person dort, wo die Usage Story den Höhepunkt hat?',
        quelle: 'Donna Lichaw, The User’s Journey, Kap. 6, Use the Smile Test',
      },
    ],
    fragen: [
      {
        frage: 'Warum 4 von 5 und nicht 5 von 5?',
        antwort: 'Eine Setzung der Kaffeebar, wie jede Schwelle: vorher festgelegt, als x von y. Wichtig ist, dass sie vor dem ersten Test steht.',
      },
    ],
    ueberleitung: 'Wie das für die Kaffeebar ausgeht – mit ausgedachten Befunden.',
  },

  beispiel: {
    live: [
      'Fünf Papierbildschirme; der Höhepunkt hat einen eigenen.',
      'Abnahmekriterien: drei Tipps, läuft am Handy, „Prototyp – nicht echt“.',
      '„Die Befunde sind ausgedacht – achtet auf die Form.“',
      'U2: alle fünf suchten eine Abfahrtsliste – rückt in Slice 1.',
    ],
    kern: [
      {
        text: 'Fällt eine Annahme über eine Lösung, „we typically design around them. We evolve our ideas so that they no longer depend on the faulty assumption.“',
        quelle: `${TORRES}, S. 140`,
      },
    ],
    ueberleitung: 'Jetzt ihr: 75 Minuten, fünf Schritte.',
  },

  vorgehen: {
    live: [
      'Timer je Schritt: 10 + 5 + 40 + 10 + 10 min.',
      'Falle: direkt bauen lassen, ohne Papierskizze.',
      'Stopp bei null: zuerst den Höhepunkt-Bildschirm.',
      'Spike bleibt im Branch – nie in main mergen.',
      'Trockenlauf online: Testperson sagt an, Besitzerin klickt.',
    ],
    uebung: { dauer: '75 min (10 + 5 + 40 + 10 + 10)', form: 'allein; Trockenlauf über Kreuz in drei Runden' },
    ablauf: {
      schritte: [
        'Papier, allein: vier bis sechs Skizzen, eine je Bildschirm der Usage Story, der Höhepunkt eigener Bildschirm; Foto (10 min).',
        'Abnahmekriterien und Zeitbox in docs/TESTS.md: was der Prototyp zeigen muss, bis wann, was er nicht hat (5 min).',
        'Bauen mit dem Spike-Prompt: Branch spike/[name], Foto anhängen; am Handy prüfen (40 min).',
        'Karte E2 und Testaufgabe schreiben (10 min).',
        'Trockenlauf über Kreuz: A testet B, C schreibt; B testet C, A schreibt; C testet A, B schreibt – je gut drei Minuten (10 min).',
      ],
      achten: [
        'Nur Oberfläche: Daten im Speicher, kein Login, keine Bezahlung, keine Datenbank.',
        'Trockenlauf prüft nur: Ist die Aufgabe verständlich, ist der Höhepunkt da?',
        'Was in 40 Minuten fehlt, steht in docs/TESTS.md; weiter im Puffer ab 16:25.',
      ],
    },
    kern: [
      {
        text: '„Test it internally to make sure the flow works.“ Der Trockenlauf zählt darum nicht als Testperson.',
        quelle: `${BLAND}, S. 183`,
      },
      {
        text: 'Online-Form des Trockenlaufs (Bildschirm teilen, die Testperson sagt an, die Besitzerin klickt) ist eine Kursregel.',
        quelle: 'Kurs: prototyp-spike.astro, Folie vorgehen (Handout)',
      },
    ],
    ueberleitung: 'Bevor ihr loslegt, noch eine Frage an eure Tests.',
  },

  uebertrag: {
    live: [
      'Folien-Satz vorlesen: Was wird euer U2?',
      '„Ihr findet ihn nur, wenn ihr beim Test den Mund haltet.“',
      'Bedienbar sagt E2 – ob jemand es will, sagt E1.',
    ],
    ueberleitung: 'Nach der Pause: Agil und Scrum – wie ihr ab Tag 5 im Takt baut.',
  },
};
