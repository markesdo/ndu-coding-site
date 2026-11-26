import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/scrum.astro. Zwei Tage auf einer Seite:
// - Tag 4 (28.11., 16:35–17:15, Variante B): Theorie aus dem Foliensatz (27 min), dann hier „Wo wir abweichen“ (2 min),
//   Kaffeebar auf der Scrum-Karte (4 + 3 min), Gleis-1-Express (4 min); „Weiter heute“ führt in den Abschluss (17:15).
//   Die Folien agil … fertig und planen sind Nachlese im Handout: an Tag 4 im Beamer überspringen.
// - Tag 5 (12.12., 09:25–10:05): team, dod, vorgehen, uebertrag – im Code unten markiert.
// Abgeschaltet und darum ohne Notiz (folienAus lässt sie weg): produktziel (PRODUKTSATZ_AN_TAG_4), Lego4Scrum.
// Guide und Jeffries = gedruckte Seiten.
const GUIDE = 'Ken Schwaber & Jeff Sutherland, The Scrum Guide (2020)';
const JEFFRIES = 'Ron Jeffries, The Nature of Software Development (2015)';
const MANIFEST = 'Manifesto for Agile Software Development (2001), https://agilemanifesto.org';
const NACHLESE = 'Nachlese-Folie: an Tag 4 überspringen, nur bei Fragen zeigen.';

export const NOTIZEN_SCRUM: Record<string, Notiz> = {
  // Tag 4
  foliensatz: {
    live: [
      'Foliensatz öffnen, Teil Agile & Scrum: nur die 20 angegebenen Folien.',
      'Zeit: 27 min Foliensatz, dann hier weiter.',
      'Wo Foliensatz und Guide verschieden klingen, gilt der Guide.',
      'Danach über den Link auf der Folie zu „Wo wir abweichen“.',
    ],
    kern: [
      {
        text: 'Begriffe nach dem Guide 2020: „Developers“ statt Development Team (S. 5); „The Sprint is a container for all other events“ (S. 7); „The Sprint Review is a working session and the Scrum Team should avoid limiting it to a presentation“ (S. 9).',
        quelle: `${GUIDE}, S. 5, 7, 9`,
      },
    ],
    ueberleitung: 'So weit der Guide. Jetzt: wo wir zu dritt mit drei Produkten davon abweichen.',
  },

  agil: {
    live: [
      NACHLESE,
      'Kern: Bis zum Test sieht niemand Software.',
      'Brücke: E1 und Usability-Tests zeigen es nach wenigen Tagen.',
    ],
    kern: [
      {
        text: '„Until we begin to see the software, we can’t really tell how well we’re doing.“ – „The activity-based product is a monolith.“ – „Instead, let’s plan for multiple releases from the very beginning.“',
        quelle: `${JEFFRIES}, S. 20, 22`,
      },
    ],
    ueberleitung: 'Was stattdessen zählt, haben 17 Leute 2001 aufgeschrieben.',
  },

  manifest: {
    live: [
      NACHLESE,
      '„Die Dinge rechts sind wertvoll – die links zählen mehr.“',
      'Prinzip 7: Fortschritt ist, was läuft.',
    ],
    kern: [
      {
        text: '„That is, while there is value in the items on the right, we value the items on the left more.“ Prinzip 7: „Working software is the primary measure of progress.“',
        quelle: MANIFEST,
      },
    ],
    ueberleitung: 'Scrum ist ein Rahmen, der diese Werte in Regeln fasst.',
  },

  scrum: {
    live: [
      NACHLESE,
      'Zyklus: Backlog, Sprint, Inkrement, prüfen und anpassen.',
      '„Absichtlich unvollständig: Regeln für die Zusammenarbeit, keine Anleitung.“',
    ],
    kern: [
      {
        text: '„Scrum is a lightweight framework that helps people, teams and organizations generate value through adaptive solutions for complex problems.“ – „The Scrum framework is purposefully incomplete, only defining the parts required to implement Scrum theory.“',
        quelle: `${GUIDE}, S. 3`,
      },
      {
        text: 'Drei Säulen: Transparenz, Überprüfung, Anpassung. „Inspection without adaptation is considered pointless.“ Werte: „Commitment, Focus, Openness, Respect, and Courage“.',
        quelle: `${GUIDE}, S. 3–4`,
      },
    ],
    ueberleitung: 'Wer macht was in diesem Kreislauf?',
  },

  verantwortlichkeiten: {
    live: [
      NACHLESE,
      'Seit 2020: drei Verantwortlichkeiten, keine Rollen.',
      'Product Owner ist eine Person, kein Gremium.',
    ],
    kern: [
      {
        text: '„Scrum defines three specific accountabilities“; „typically 10 or fewer people“; „they internally decide who does what, when, and how“.',
        quelle: `${GUIDE}, S. 5`,
      },
      {
        text: '„The Product Owner is one person, not a committee.“',
        quelle: `${GUIDE}, S. 6`,
      },
    ],
    ueberleitung: 'Und wie läuft ein Sprint von innen?',
  },

  events: {
    live: [
      NACHLESE,
      'Sprint = Behälter für vier Events, höchstens ein Monat.',
      'Drei Verpflichtungen: Produktziel, Sprint-Ziel, Definition of Done.',
    ],
    kern: [
      {
        text: '„The Sprint is a container for all other events.“ Im Sprint: „No changes are made that would endanger the Sprint Goal“; „Quality does not decrease“.',
        quelle: `${GUIDE}, S. 7`,
      },
      {
        text: 'Daily Scrum: „a 15-minute event for the Developers“, „held at the same time and place every working day of the Sprint“.',
        quelle: `${GUIDE}, S. 9`,
      },
    ],
    ueberleitung: 'Was heißt am Ende des Sprints „fertig“?',
  },

  fertig: {
    live: [
      NACHLESE,
      '„Done“ oder „not done“ – nichts dazwischen.',
      '„Unsere Definition of Done mit Messung schreibt ihr an Tag 5.“',
    ],
    kern: [
      {
        text: '„If a Product Backlog item does not meet the Definition of Done, it cannot be released or even presented at the Sprint Review. Instead, it returns to the Product Backlog for future consideration.“',
        quelle: `${GUIDE}, S. 12`,
      },
      {
        text: '„We can’t accept ‚90 percent done.‘ Features need to be ‚done‘ or ‚not done‘: there is no middle ground.“',
        quelle: `${JEFFRIES}, S. 46`,
      },
    ],
    ueberleitung: 'So weit der Guide – jetzt, wo wir abweichen.',
  },

  abweichungen: {
    live: [
      'Zeit: 2 min.',
      '„Drei Produkte, drei Personen: drei Scrum-Teams mit denselben Köpfen.“',
      'Je Produkt PO, Produktziel, Sprint-Ziel – gemeinsamer Takt.',
      'Ein Sprint, eine Woche; Daily dazwischen schriftlich in Linear.',
      'Warum offen sagen: Transparenz ist die erste Säule.',
    ],
    verstaendnis: {
      frage: 'Warum sind es drei Scrum-Teams und nicht eines?',
      antwort: 'Ein Scrum Team ist auf ein Produktziel ausgerichtet (Guide S. 5); ihr habt drei Produkte, also drei Produktziele. Weil es dieselben drei Personen sind, laufen die Sprints im selben Takt.',
      falsch: '„Ein Team, drei Product Owner“ – der Guide kennt pro Produkt genau einen Product Owner.',
    },
    kern: [
      {
        text: 'Ein Scrum Team ist „focused on one objective at a time, the Product Goal“.',
        quelle: `${GUIDE}, S. 5`,
      },
      {
        text: '„While implementing only parts of Scrum is possible, the result is not Scrum.“',
        quelle: `${GUIDE}, S. 13`,
      },
      {
        text: 'Abweichungen gegen den Guide: Sprints sind „fixed length events“ (S. 7) – bei uns nur einer, 12.12.–19.12.; das Daily „at the same time and place every working day“ (S. 9) – zwischen den Kurstagen schriftlich. Eine gemeinsame Definition of Done für alle drei Produkte ist eine Kursregel; der Guide verlangt sie nur für mehrere Teams am selben Produkt (S. 12).',
        quelle: `${GUIDE}, S. 7, 9, 12; Kursregel`,
      },
    ],
    ueberleitung: 'Passen die Begriffe schon? Probe an der Kaffeebar.',
  },

  'kaffeebar-sortieren': {
    live: [
      'Timer 4 min: still sortieren, jede*r im eigenen Frame.',
      'Kein Absprechen – die Auflösung soll Unterschiede zeigen.',
      'Lösungs-Frame erst nach dem Timer einblenden.',
      'Timer 3 min: nur Karten besprechen, die verschieden liegen.',
      'Planning, Sprint Backlog, Retro bekommen absichtlich keine Karte.',
    ],
    uebung: { dauer: '7 min (4 + 3)', form: 'allein und gleichzeitig, je ein Frame; Auflösung gemeinsam' },
    miro: {
      frame: 'T4 · 3 · Scrum · Kaffeebar · Lösung',
      schritte: [
        'Jede*r sortiert im eigenen Frame „T4 · 3 · Scrum · Kaffeebar sortieren · Produkt n“ (eure Spalten von links).',
        'Nach 4 min den Lösungs-Frame einblenden (Augen-Symbol).',
      ],
    },
    ablauf: {
      schritte: [
        'Acht Karten der Kaffeebar an die Stelle der Scrum-Grafik legen: je eine zu Produktziel, Product Backlog, Sprint-Ziel, Inkrement, Definition of Done, Daily Scrum, Stakeholdern im Sprint Review, Product Owner.',
        'Lösung einblenden, die drei Frames nebeneinander vergleichen.',
      ],
      achten: [
        'Nur über abweichende Karten sprechen, nicht alle acht durchgehen – das macht die nächste Folie.',
      ],
      aufloesung: 'Die Lösung geht die nächste Folie „Gleis-1-Express in Scrum-Begriffen“ Begriff für Begriff durch.',
    },
    ueberleitung: 'Die Lösung, Begriff für Begriff.',
  },

  beispiel: {
    live: [
      'Zeit: 4 min mit Übergang.',
      'Produktziel = Outcome-Satz aus dem Produkt-Brief.',
      'Sprint-Ziel: was danach jemand kann – nicht die Issue-Liste.',
      'Issue 6 ist die Messung – kommt aus der Definition of Done.',
    ],
    verstaendnis: {
      frage: 'Ist „Issues 1 bis 5 fertig“ ein gutes Sprint-Ziel?',
      antwort: 'Nein. Das Sprint-Ziel sagt, was danach jemand kann: „Pendler*innen bestellen im Gehen und sehen, ob ihr Kaffee vor dem Zug fertig ist.“ Die Auswahl der Issues kann sich ändern, das Ziel nicht.',
    },
    kern: [
      {
        text: 'Produktziel: „a future state of the product which can serve as a target“; Sprint-Ziel: „the single objective for the Sprint“, mit „flexibility in terms of the exact work needed to achieve it“.',
        quelle: `${GUIDE}, S. 10–11`,
      },
      {
        text: 'Inkrement: „In order to provide value, the Increment must be usable.“',
        quelle: `${GUIDE}, S. 11`,
      },
    ],
    ueberleitung: 'Wie viel davon schafft ihr in einem Sprint? Das ist Nachlese – gebaut wird ab Tag 5.',
  },

  planen: {
    live: [
      'Nachlese-Folie: nicht im 40-min-Plan, weiterblättern.',
      'Bei Bedarf: Yesterday’s Weather – so viel wie im Sprint davor.',
      'Schneiden statt Schätzen kommt an Tag 5.',
    ],
    kern: [
      {
        text: '„Yesterday’s Weather.“ „You’ll probably get as much done today as you did yesterday. In iterative projects, plan to do as much this iteration as you did last iteration.“',
        quelle: `${JEFFRIES}, S. 37`,
      },
      {
        text: '„When they need to predict how long things will take, they just count things done.“ – „It’s far better to do eight things well than ten things poorly.“',
        quelle: `${JEFFRIES}, S. 38, 41`,
      },
    ],
    ueberleitung: 'Für heute: gleich der Abschluss mit der Origin Story.',
  },

  'weiter-tag-4': {
    live: [
      'Teamaufstellung und Definition of Done kommen an Tag 5.',
      '„Jetzt Origin Story; den Prototyp baut Claude Code an Tag 5.“',
      'Pfeil → Abschluss Tag 4; das Panel zeigt die nächste Folie der Seite.',
    ],
    ueberleitung: 'Gleich: Origin Story und Hausaufgabe im Abschluss.',
  },

  // Tag 5 (12.12., 09:25–10:05): Einstieg von tag-5#debrief-ablauf; ← führt dorthin zurück.
  team: {
    live: [
      'Zeit: 40 min, Schritte 5 + 10 + 15 + 10.',
      'Schritt 1: Was muss die echte Version des Papier-Prototyps können?',
      'Je Produkt: Product Owner, Produktziel, Linear-Projekt; Scrum Master losen.',
      'Collaborator einladen – sonst kann niemand im fremden Repo bauen.',
    ],
    uebung: { dauer: '40 min (5 + 10 + 15 + 10)', form: 'alle drei gemeinsam auf Miro' },
    miro: { frame: 'T4 · 2 · Teamaufstellung & DoD', schritte: ['Drei Stichworte aus dem Papier-Prototyp, dann je Produkt Product Owner, Produktziel, Linear-Projekt, Scrum Master.'] },
    kern: [
      {
        text: 'Product Owner: „accountable for maximizing the value of the product“, entwickelt das Produktziel, erstellt und ordnet die Backlog-Einträge; „one person, not a committee“.',
        quelle: `${GUIDE}, S. 5–6`,
      },
      {
        text: 'Arbeiten Product Owner oder Scrum Master an Einträgen des Sprint Backlogs mit, „they participate as Developers“.',
        quelle: `${GUIDE}, S. 9`,
      },
    ],
    ueberleitung: 'Aus euren Stichworten wird jetzt die Definition of Done – mit der Messung.',
  },

  dod: {
    live: [
      'Jede Zeile muss im Browser, auf GitHub oder in Supabase prüfbar sein.',
      'Vierte Zeile: Das Mess-Ereignis kommt nach dem Merge noch an.',
      'Kein Name, keine E-Mail – A7 der Kaffeebar.',
      'Mess-Issue je Produkt in Stichworten; ausformuliert im Backlog.',
    ],
    verstaendnis: {
      frage: 'Warum gehört die Messung in die Definition of Done und nicht nur ins Backlog?',
      antwort: 'Ohne sie wisst ihr nach dem Sprint nur, dass etwas gebaut ist, nicht, ob es wirkt. Euer Produkt soll einen Outcome bewirken, also gehört dessen Messung zur Qualität des Inkrements – eine DoD „appropriate for the product“.',
    },
    kern: [
      {
        text: '„The Definition of Done is a formal description of the state of the Increment when it meets the quality measures required for the product.“ Ohne Standard der Organisation „the Scrum Team must create a Definition of Done appropriate for the product.“',
        quelle: `${GUIDE}, S. 12`,
      },
    ],
    ueberleitung: 'Was ihr davon wo festhaltet: docs/TEAM.md.',
  },

  vorgehen: {
    live: [
      'Überblick: Theorie war Tag 4, heute das eigene Team.',
      'docs/TEAM.md in allen drei Repos gleich.',
      'Abweichungen vom Guide als eigener Abschnitt übernehmen.',
    ],
    ueberleitung: 'Und wenn mitten im Sprint jemand etwas Neues will?',
  },

  uebertrag: {
    live: [
      'Folien-Satz vorlesen, eine Antwort je Product Owner.',
      '„Das Ziel bleibt; der Umfang darf neu verhandelt werden.“',
      'Neues landet im Product Backlog – das nächste Planning entscheidet.',
    ],
    kern: [
      {
        text: '„No changes are made that would endanger the Sprint Goal“; „Scope may be clarified and renegotiated with the Product Owner as more is learned.“',
        quelle: `${GUIDE}, S. 7`,
      },
    ],
    ueberleitung: 'Jetzt zehn Minuten Claude Pro und Claude Code, gemeinsam – nach der Pause wird aus Slice 1 euer Backlog.',
  },
};
