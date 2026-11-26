import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/prototyp-spike.astro (Tag 4, 28.11., 14:45–16:25: rund 22 min Theorie und
// Beispiel, 75 min Übung als Rezept: Übersicht plus sieben Schritt-Folien, Timer 10 + 3 + 2 + 40 + 10 + 10; was offen
// bleibt, freiwillig zu Hause). Bland = gedruckte
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
    ueberleitung: 'Angenommen, die Kaffeebar testet mit fünf Menschen: Das käme dabei heraus.',
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
    ueberleitung: 'Jetzt ihr: 75 Minuten, sechs Schritte.',
  },

  vorgehen: {
    live: [
      'Sechs Schritte zeigen: Dauer und Ort je Schritt.',
      'Wo: Frame „T4 · 5 · Prototyp · Produkt n“, Felder 1 bis 6.',
      'Schritte 1–5 allein, nur Trockenlauf zu dritt.',
      'Tests mit Zielgruppe freiwillig bis Tag 5.',
    ],
    ueberleitung: 'Schritt 1: ein Blatt je Bildschirm.',
  },

  'schritt-papier': {
    live: [
      'Timer 10 min: ein Blatt je Bildschirm, Stationen 2 bis 6.',
      'Höhepunkt = eigenes Blatt mit Stern und wörtlichem Satz.',
      'Pfeil an jedem Knopf zur Nummer des nächsten Blatts.',
      'Falle: direkt bauen lassen, ohne Papier – Kursregel.',
    ],
    uebung: { dauer: '10 min', form: 'allein, Papier und Stift; Foto je Blatt in Feld 1' },
    ueberleitung: 'Woran seht ihr, dass der Prototyp fertig genug ist? Drei Sätze.',
  },

  'schritt-kriterien': {
    live: [
      'Timer 3 min: „zeigt … / läuft … / hat nicht …“.',
      'Prüfbar: jede Zeile später am Handy mit Ja oder Nein.',
      'Format in drei Sätzen ist Kursregel; Bland verlangt Kriterien vorab.',
    ],
    uebung: { dauer: '3 min', form: 'allein, Feld 2 auf Miro' },
    kern: [
      {
        text: '„If we build what we agree to, what will we check to see that we’re done? The answer to this question is usually a short list of things to check. This list is often called acceptance criteria, or story tests.“',
        quelle: 'Jeff Patton, User Story Mapping, Kap. 6, 3. Confirmation',
      },
      {
        text: '„Define your acceptance criteria.“ – „Determine if the acceptance criteria were successfully met.“',
        quelle: `${BLAND}, S. 307`,
      },
    ],
    ueberleitung: 'Und wann hört ihr auf? Die Zeitbox.',
  },

  'schritt-zeitbox': {
    live: [
      'Timer 2 min: jetzt plus 40 Minuten eintragen.',
      'Zuerst der Höhepunkt-Bildschirm, dann der Weg dorthin.',
      'Bei null aufhören; Fehlendes ins Feld 3.',
    ],
    uebung: { dauer: '2 min', form: 'allein, Feld 3 auf Miro' },
    kern: [
      {
        text: '„Before performing a spike, clearly define the acceptance criteria and time box so that everyone is clear on the goal before getting started. These can turn into never-ending research projects if left unchecked.“ – „It is aggressively time boxed for a reason“.',
        quelle: `${BLAND}, S. 308`,
      },
    ],
    ueberleitung: 'Jetzt baut Claude Code – nach euren Bildern.',
  },

  'schritt-bauen': {
    live: [
      'Timer 40 min starten; dieselbe Uhr steht auf der nächsten Folie.',
      'Fenster von 11:00, dann /model opus; kein Opus: /model, Standard.',
      'Bilder mit ctrl + V: Usage Story, Slice 1, Kriterien, Skizzen.',
      'Claude zählt erst die Bildschirme auf – dann „Ja, los.“',
    ],
    uebung: { dauer: '40 min (Schritt 4, zwei Folien)', form: 'allein, Claude Code im eigenen Repo' },
    ablauf: {
      achten: [
        'Niemand öffnet oder schreibt eine Datei; VS Code ist nur der Rahmen ums Claude-Terminal.',
        'Story Map nur mit Backbone und Slice 1 abfotografieren; Skizzen-Fotos zusätzlich direkt einfügen.',
        'Nur Oberfläche, Route /spike, die bestehende App bleibt unverändert.',
      ],
    },
    ueberleitung: 'Ansehen, nachbessern, sichern – der Timer läuft weiter.',
  },

  'schritt-ansehen': {
    live: [
      'Weg bis zum Höhepunkt selbst klicken, Fenster schmal.',
      'Ein Satz je Fehler, mit dem Namen des Blatts.',
      'Fünf Minuten vor Schluss: Prompt „Spike sichern“ – Link fürs Handy.',
      'Bei null aufhören, drei Kriterien in Feld 4 ankreuzen.',
      'Bei Bedarf: Vercel-Anmeldung aus (Deployment Protection).',
    ],
    ablauf: {
      achten: [
        'Dreht sich Claude zweimal am selben Fehler: hingehen, nicht weiter probieren lassen.',
        'Scheitern Push oder Vorschau um 15:55: weiter mit der Adresse auf dem Mac, Link zu Hause.',
      ],
    },
    ueberleitung: 'Bevor jemand testet: Karte E2.',
  },

  'schritt-karte': {
    live: [
      'Timer 10 min: Annahme, Aufgabe, Schwelle, „Wir entscheiden vorher“.',
      'Probe: Aufgabe laut lesen – kein Wort von den Knöpfen.',
      'Karte heute, auch wenn die Tests freiwillig sind.',
    ],
    uebung: { dauer: '10 min', form: 'allein, Feld 5 auf Miro' },
    ueberleitung: 'Und jetzt der eine Test heute: der Trockenlauf.',
  },

  'schritt-trockenlauf': {
    live: [
      'Timer 10 min, drei Runden à gut drei Minuten nach Tabelle.',
      'Wem er gehört: teilt, liest vor, klickt nur Angesagtes.',
      'Dritte Person notiert in Zeile 0 des fremden Frames.',
      'Kursregel – keine Kritik: kein Feedback, nächste Runde.',
    ],
    uebung: { dauer: '10 min', form: 'zu dritt in Teams, drei Runden; keine Kritik' },
    kern: [
      {
        text: '„Test it internally to make sure the flow works.“ Der Trockenlauf ist heute der Test des Prototyps; für die Schwelle von E2 zählt er nicht (Testpersonen mit dem Pain, freiwillig bis Tag 5).',
        quelle: `${BLAND}, S. 183`,
      },
      {
        text: 'Online-Form des Trockenlaufs (Bildschirm teilen, die Testperson sagt an, wem der Prototyp gehört, klickt) und „keine Kritik“ sind Kursregeln: Die Testperson erfüllt eine Aufgabe, beurteilt wird nichts.',
        quelle: 'Kurs: prototyp-spike.astro, Folie schritt-trockenlauf (Handout)',
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
