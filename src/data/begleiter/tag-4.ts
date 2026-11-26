import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/tag-4.astro (Sa 28.11.2026, online in Teams). Die Seite hat drei Stellen am Tag:
// 9:00 #arbeitsfluss (→ zur Value Map), nach der Value Map #was-bauen-wir und #slice-im-baum (→ zur Concept Story), um 17:15
// über scrum#weiter-tag-4 der Abschluss: #abschluss, #origin-beispiel, #hausaufgabe, #ende-tag-4. Der Begleiter findet jede
// Folie über die Beamer-Position; „nächste Folie der Seite“ im Panel stimmt darum nur innerhalb dieser Stellen – die
// Überleitungen nennen, wohin → wirklich führt.
// Zitate wie auf der Seite (Durchsicht 26.11.: Torres S. 26–27, 119; Lichaw Kap. 4; Bland S. 261). Was nicht aus den
// Quellen stammt, ist als „Kursformulierung“ oder „Kursregel“ markiert.
const TORRES = 'Teresa Torres, Continuous Discovery Habits';
const LICHAW = 'Donna Lichaw, The User’s Journey';
const BLAND = 'David J. Bland & Alexander Osterwalder, Testing Business Ideas';

export const NOTIZEN_TAG_4: Record<string, Notiz> = {
  // 9:00–9:05, direkt nach dem Ablauf; → führt zur Value Map (9:05), nicht zu „Was bauen wir?“.
  arbeitsfluss: {
    live: [
      'Zeit: 5 min; Ist-Zeit notieren.',
      'Spalten per → aufdecken: was von Tag 1 bis 3 da ist.',
      '„Heute wird aus Spalte 4 ein Prototyp – zuerst holen wir Value Map und Fit nach.“',
      'Pfeil → führt zur Value Map, nicht zu „Was bauen wir?“.',
    ],
    ueberleitung: 'Zuerst holen wir nach, was von Tag 3 offen ist: Value Map und Fit.',
  },

  // 9:35–9:40, nach value-map#uebertrag: Erst jetzt ist der Spitzenreiter bestätigt. Vorschau, ohne Schritte.
  'was-bauen-wir': {
    live: [
      'Zeit: 5 min zusammen mit „Slice 1 im Baum“.',
      '„Slice 1 ist die kleinste Version eures Spitzenreiters, die von Anfang bis Ende durchgeht.“',
      'Drei Zuläufe zeigen: je woher die Linie kommt, was daraus wird.',
      'Falle: Slice 1 als Feature-Liste; gemeint ist ein ganzer Weg.',
    ],
    verstaendnis: {
      frage: 'Was heißt „von Anfang bis Ende“ bei Slice 1?',
      antwort: 'Eine Person kommt mit dem Slice einmal durch ihren ganzen Weg bis zum Ziel – dünn, aber vollständig. Nicht ein einzelner Bildschirm und nicht die wichtigste Funktion allein.',
      falsch: '„Die wichtigste Funktion zuerst“ – eine Funktion ohne Weg lässt sich im Usability-Test nicht durchspielen.',
    },
    kern: [
      {
        text: 'Die drei Zuläufe: Beleg (Interviews, Experience Map) liefert den Inhalt, Outcome (Produkt-Brief) das Maß, Annahme das Lernziel – daraus wird E1. Wie Slice 1 nach Outcome geschnitten wird, kommt erst in der Story Map; hier nur die Vorschau.',
        quelle: 'Kursformulierung; Arbeitsfluss (/innolab/arbeitsfluss)',
      },
    ],
    ueberleitung: 'Und wo hängt Slice 1 in eurem Baum?',
  },

  // Letzte Folie des Morgens: → führt zur Concept Story (story-bogen), nicht in den Abschluss.
  'slice-im-baum': {
    live: [
      'Links der Pfad im Baum, rechts was bei Slice 1 steht.',
      '„Slice 1 ist kein Knoten im Baum – er macht den Spitzenreiter konkret.“',
      'Annahme nur ankündigen: gewählt wird an der Experiment-Karte.',
      'Tag 5: Annahme hält → Slice bleibt; fällt sie → zurück in den Baum.',
    ],
    kern: [
      {
        text: 'Unter einer Lösung hängen bei Torres nur die Annahmen-Tests; Slice 1 ist darum kein Knoten im Baum, sondern liegt auf der Story Map.',
        quelle: `${TORRES}, S. 26–27`,
      },
      {
        text: '„Story mapping forces you to get specific about how an idea will work and what you expect your end-users will do. While many teams use story mapping to align around product requirements, it’s also a great technique for helping us to surface underlying assumptions“',
        quelle: `${TORRES}, S. 119`,
      },
    ],
    ueberleitung: 'Damit Slice 1 überzeugt, braucht er eine Geschichte: eure Concept Story.',
  },

  // 17:15–17:30, von scrum#weiter-tag-4; ← führt dorthin zurück.
  abschluss: {
    live: [
      'Zeit: 15 min mit Beispiel und Hausaufgabe.',
      '„Die Origin Story ist der Text für euren Aufsteller oder eure Landingpage – für E1.“',
      'Stationen per → aufdecken; Exposition und Auslöser wie Concept Story.',
      'Falle: Handlung „anmelden“ statt Ziel der Person („start training“).',
    ],
    verstaendnis: {
      frage: 'Was unterscheidet die Origin Story von der Concept Story?',
      antwort: 'Die Concept Story erzählt, warum das Produkt besser ist als das, was jemand heute tut. Die Origin Story erzählt, wie jemand zum ersten Mal Kunde wird – sie endet mit genau einer Handlung, die man messen kann.',
      falsch: '„Dieselbe Story, nur kürzer“ – der Höhepunkt ist ein anderer: Hier sieht jemand den Wert, dort erlebt er ihn.',
    },
    kern: [
      {
        text: '„An origin story is the story of how someone becomes your customer for the first time“ – die Brücke zwischen Concept Story und Usage Story.',
        quelle: `${LICHAW}, Kap. 4`,
      },
      {
        text: 'Am Ende genau eine Handlung und ihre Messung: „you call your main character to action and determine how to measure that action“. Die Handlung benennt das Ziel der Person: „start training“ statt „sign up“.',
        quelle: `${LICHAW}, Kap. 4 (FitCounter)`,
      },
    ],
    ueberleitung: 'Wie das aussieht, zeigt der Aufsteller der Kaffeebar.',
  },

  // Neu seit der Durchsicht 26.11.: Das Beispiel stand nur im Handout.
  'origin-beispiel': {
    live: [
      'Text lesen lassen, dann Reihenfolge zeigen: Pain, Produkt, Hürde.',
      'Per →: die eine Handlung, dann die Messgröße von E1.',
      '„Eure Handlung benennt das Ziel der Person – nicht ‚E-Mail hinterlassen‘.“',
      'Fragen: Welche eine Handlung misst euer E1?',
    ],
    kern: [
      {
        text: 'Dieselbe Reihenfolge empfiehlt Bland für eine Landingpage: Wertversprechen, Handlung, darunter Pains, Lösung, Gains.',
        quelle: `${BLAND}, S. 261`,
      },
    ],
    ueberleitung: 'Und das ist eure Hausaufgabe – sie beginnt mit genau diesem Text.',
  },

  hausaufgabe: {
    live: [
      'Reihenfolge: Origin Story, Aufsteller, E1, Lernkarte; Tests optional.',
      'E1 läuft bis drei Werktage vor Tag 5.',
      'Ganze Liste: Checkliste im Handout der Seite.',
      'Alles auf Miro oder in der Werkstatt – keine Dateien schreiben.',
      'Fragen: Wo steht bei jeder*m der Aufsteller oder die Landingpage?',
    ],
    ueberleitung: 'Tag 5 beginnt mit dem, was eure Tests gezeigt haben.',
  },

  // Letzte Folie des Tages: → bleibt stehen (Folie ende).
  'ende-tag-4': {
    live: [
      '„Tag 5 am 12. Dezember beginnt mit dem Test-Debrief: Was haben E1 und eure Tests gezeigt?“',
      'Offene Fragen sammeln, dann Besprechung beenden.',
      'Pfeil → bleibt hier stehen.',
    ],
  },
};
