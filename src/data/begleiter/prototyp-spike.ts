import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/prototyp-spike.astro (Tag 4, 28.11., 14:35–15:30, Prototyp auf Papier:
// rund 20 min Theorie und Beispiel, 33 min Übung als Rezept: Übersicht plus vier Schritt-Folien, Timer 10 + 3 + 10 + 10;
// danach Puffer bis 16:25). Seit 26.11.2026 nachts ohne Claude: Zeitbox, Bauen und Ansehen sind weg, gebaut wird an
// Tag 5 (Notiz tag-5 bauen-skizzen). Bland = gedruckte
// Seiten (PDF-Seite − 16); Torres = PDF-Seiten wie in quellen/torres/text.txt; Nielsen = NN/g-Artikel, wörtlich geprüft
// am 26.11.2026.
const BLAND = 'David J. Bland & Alexander Osterwalder, Testing Business Ideas';
const TORRES = 'Teresa Torres, Continuous Discovery Habits';

export const NOTIZEN_PROTOTYP_SPIKE: Record<string, Notiz> = {
  worum: {
    live: [
      'Anknüpfen: Usage Story, Stationen 2 bis 6 – daraus werden Bildschirme.',
      'Papier-Skizzen: ein Blatt pro Bildschirm oder lo-fi in Figma; Pfeile je Knopf.',
      'Figma nur lo-fi: Graustufen, keine Komponenten, keine Klicks – Ablauf zählt.',
      'Papier vor Claude: ihr entscheidet, an Tag 5 baut Claude genau das.',
      'Testen auf Papier: jemand tippt; nächstes Blatt legen oder Frame wechseln.',
    ],
    verstaendnis: {
      frage: 'Wozu zeichnet ihr erst auf Papier, wenn Claude Code den Prototyp an Tag 5 ohnehin baut?',
      antwort: 'Damit ihr jeden Bildschirm selbst entscheidet und den Ablauf testet, bevor eine Zeile Code steht. An Tag 5 baut Claude Code nach den Fotos oder Figma-Bildern eurer Skizzen. Ohne Papier bekämt ihr Claudes Vorstellung von eurem Produkt.',
    },
    kern: [
      {
        text: 'Pairing nach dem Papier-Prototyp: Clickable Prototype – „Use what you learned from the paper prototype testing to inform your clickable prototype design.“',
        quelle: `${BLAND}, S. 185`,
      },
      {
        text: 'Paper Prototype: „Sketched interface on paper, manipulated by another person to represent the software’s reactions to the customer interaction.“ – „ideal for rapidly testing the concept of your product quickly with customers.“',
        quelle: `${BLAND}, S. 182`,
      },
    ],
    fragen: [
      {
        frage: 'Dürfen wir Figma nehmen?',
        antwort: 'Ja, lo-fi: Graustufen-Rahmen mit Kästen, Text und Pfeilen, ein Frame pro Bildschirm, als Bild in euren Miro-Frame. Keine Farben, keine Komponenten, keine Klick-Verbindungen. Der Grund: Heute zählen Ablauf und Inhalt, nicht das Aussehen. Bland stellt den Papier-Prototyp an den Anfang, „ideal for rapidly testing the concept“ (S. 182); der klickbare kommt danach (S. 185) – bei euch an Tag 5, gebaut von Claude Code. Im Trockenlauf wechselt ihr den Frame statt das Blatt.',
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
      frage: 'Was zeigt euch der Papier-Prototyp – und was nicht?',
      antwort: 'Ob Menschen in einer Testsituation mit dem Ablauf zurechtkommen: Aufgabe geschafft, Zeit, wo gehangen. Nicht, ob sie es im echten Leben wollen – das prüft E1.',
      falsch: '„Ob das Produkt ankommt“ – ob jemand es will, zeigt E1. Und laut Bland ersetzt der Papier-Prototyp auch keinen richtigen Usability-Test mit Kund*innen (S. 182).',
    },
    kern: [
      {
        text: 'Paper Prototype: „not ideal as a replacement for proper usability with customers.“ Beleg: „Manual task completion is not necessarily strong evidence, but it will provide glimpses into where customers could get confused.“',
        quelle: `${BLAND}, S. 182, 184`,
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
      'Heute Trockenlauf untereinander; Zielgruppe freiwillig bis Tag 5.',
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
      'Zu zweit: eine*r führt und legt Blätter, eine*r notiert.',
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
      'Zeit nur notieren – auf Papier dauert das Umlegen mit.',
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
    ueberleitung: 'Wie das für die Kaffeebar aussieht: erst die Blätter, dann ausgedachte Befunde.',
  },

  beispiel: {
    live: [
      'Fünf Bildschirme zeigen: Blatt oder Frame; 3 ist der Höhepunkt.',
      'Figma-Modell kurz zeigen: so roh darf es sein.',
      'Kriterien: drei Tipps; heute Papier oder Figma, an Tag 5 am Handy.',
      'Nicht drin: Login, Zahlung, Datenbank.',
    ],
    fragen: [
      {
        frage: 'Papier oder Figma – was ist besser?',
        antwort: 'Keins von beiden. Heute zählen Ablauf und Inhalt, nicht das Aussehen: Kästen und Wörter reichen, ein Blatt oder Frame je Bildschirm. Wer Figma nimmt, bleibt lo-fi – Graustufen-Rahmen mit Kästen, Text und Pfeilen, keine Farben, keine Komponenten, keine Klick-Verbindungen. Im Trockenlauf legt ihr dann das nächste Blatt oder wechselt den Frame.',
      },
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
    ueberleitung: 'Jetzt ihr: 33 Minuten, vier Schritte.',
  },

  vorgehen: {
    live: [
      'Vier Schritte zeigen: Dauer und Ort je Schritt.',
      'Wo: Frame „T4 · 6 · Prototyp · Produkt n“, Felder 1 bis 4.',
      'Schritte 1–3 allein, nur Trockenlauf zu dritt.',
      '„Gebaut wird heute nichts – an Tag 5 baut Claude Code daraus.“',
    ],
    ueberleitung: 'Schritt 1: ein Blatt je Bildschirm.',
  },

  'schritt-papier': {
    live: [
      'Timer 10 min: Blatt oder Figma-Frame je Bildschirm, Stationen 2–6.',
      'Höhepunkt = eigenes Blatt mit Stern und wörtlichem Satz.',
      'Pfeil an jedem Knopf zur Nummer des nächsten Blatts.',
      'Blätter für den Trockenlauf bereitlegen, Fotos in Feld 1.',
    ],
    uebung: { dauer: '10 min', form: 'allein, Papier und Stift oder Figma lo-fi; Foto oder Bild je Bildschirm in Feld 1' },
    ueberleitung: 'Was muss der Prototyp zeigen? Drei Sätze – heute fürs Papier, an Tag 5 für Claude Code.',
  },

  'schritt-kriterien': {
    live: [
      'Timer 3 min: „zeigt … / läuft … / hat nicht …“.',
      'Prüfbar: Ja oder Nein – heute am Papier, Tag 5 am Handy.',
      'Drei kurze Sätze, prüfbar – an Tag 5 Auftrag für Claude.',
    ],
    uebung: { dauer: '3 min', form: 'allein, Feld 2 auf Miro' },
    kern: [
      {
        text: '„If we build what we agree to, what will we check to see that we’re done? The answer to this question is usually a short list of things to check. This list is often called acceptance criteria, or story tests.“',
        quelle: 'Jeff Patton, User Story Mapping, Kap. 6, 3. Confirmation',
      },
    ],
    ueberleitung: 'Bevor jemand testet: Karte E2.',
  },

  'schritt-karte': {
    live: [
      'Timer 10 min: Annahme, Aufgabe, Schwelle, „Wir entscheiden vorher“.',
      'Probe: Aufgabe laut lesen – kein Wort von den Knöpfen.',
      'Karte heute, auch wenn die Tests freiwillig sind.',
    ],
    uebung: { dauer: '10 min', form: 'allein, Feld 3 auf Miro' },
    ueberleitung: 'Und jetzt der eine Test heute: der Trockenlauf.',
  },

  'schritt-trockenlauf': {
    live: [
      'Timer 10 min, drei Runden à gut drei Minuten nach Tabelle.',
      'Wem er gehört: Blatt/Frame zeigen, Aufgabe vorlesen, nächstes Blatt/Frame.',
      'Dritte Person notiert in Feld 4, Zeile 0 des fremden Frames.',
      'Keine Kritik: kein Feedback, nächste Runde – geprüft wird der Ablauf.',
    ],
    uebung: { dauer: '10 min', form: 'zu dritt in Teams, drei Runden, Blätter vor der Kamera; keine Kritik' },
    ablauf: {
      achten: [
        'Kamera zeigt nur Hände und Blätter? Sonst Bildschirm teilen, Fotos in Feld 1 auf Miro.',
        'Knopf führt nirgendwohin: wer die Blätter legt, sagt nur „Da passiert nichts.“',
      ],
    },
    kern: [
      {
        text: '„Test it internally to make sure the flow works.“ Der Trockenlauf ist heute der Test des Prototyps; für die Schwelle von E2 zählt er nicht (Testpersonen mit dem Pain, freiwillig bis Tag 5).',
        quelle: `${BLAND}, S. 183`,
      },
      {
        text: 'Paper Prototype: „Sketched interface on paper, manipulated by another person to represent the software’s reactions to the customer interaction.“ Online-Form (Blätter vor der Kamera, die Testperson sagt an, wem der Prototyp gehört, legt das nächste Blatt) und „keine Kritik“ gehen über Bland hinaus.',
        quelle: `${BLAND}, S. 182; Kurs: prototyp-spike.astro, Folie schritt-trockenlauf (Handout)`,
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
    ueberleitung: 'Jetzt Puffer: fertig machen, was offen ist. Nach der Pause Agil und Scrum – wie ihr ab Tag 5 im Takt baut.',
  },
};
