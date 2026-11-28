import type { Notiz } from './typen';

// Begleiter-Notizen zu /innolab/tag-5 (12.12.) – der Test-Debrief, Rückfrage aus Thomke. Seit 27.11.2026 läuft E1
// nicht: Die Karte E1 wird als Gedankenexperiment besprochen, die Kaffeebar-Lernkarte ist das Beispiel.
// Seit 26.11.2026 nachts (Dozent) auch der Block 9:25–9:40 mit Claude Pro, Claude Code und Linear (claude-pro-jetzt,
// claude-code-opus von experiment.ts hierher; linear-einrichten seit Code-Review #459) und der Einstieg ins Bauen um 14:30 (bauen-skizzen): Claude Code baut Slice 1 nach den
// Papier-Skizzen von Tag 4.
// Der Begleiter zeigt bisher nur Tag 1; die Notizen stehen bereit, der Test prüft die ids.
export const NOTIZEN_TAG_5: Record<string, Notiz> = {
  debrief: {
    live: [
      'E1 ist nicht gelaufen: Karte E1 als Gedankenexperiment.',
      'Fragen: Was hätte euch umstimmen können? Welches Band erwartet?',
      'Kaffeebar-Lernkarte als Beispiel: 8 von 30 → Band 5–9.',
      'Fragen: Ort des Aufstellers auch bei 12 von 30 hinterfragt?',
      'E2 nur, wer mit dem Prototyp getestet hat.',
    ],
    verstaendnis: {
      frage: 'Die Kaffeebar liegt mit 8 von 30 knapp unter der Schwelle und will den Aufsteller an die Schlange stellen. Was ist daran heikel?',
      antwort: 'Die Karte hatte für 5–9 „wiederholen“ festgelegt; der neue Ort ist erst nach dem Ergebnis aufgefallen. Hätte man ihn auch bei 12 von 30 hinterfragt? Thomke: Schlechte Ergebnisse prüft man gründlich, gute nimmt man gern hin.',
      falsch: '„Nichts, die Schwelle bleibt ja“ – die Schwelle bleibt, aber der Test wird nach dem Ergebnis geändert.',
    },
    kern: [
      {
        text: '„we tend to happily accept ‚good‘ results that confirm our beliefs because they feel right. But we challenge and thoroughly investigate ‚bad‘ results that go against our assumptions.“',
        quelle: 'Stefan H. Thomke, The Scientific Mindset, S. 14',
      },
      {
        text: 'Gegenmittel: „a decision matrix that links possible outcomes to predetermined actions before any data comes in“ – auf der Karte die Zeile „Wir entscheiden vorher“.',
        quelle: 'Stefan H. Thomke, The Scientific Mindset, S. 86',
      },
      {
        text: 'Vorsicht beim Erzählen: „Verlässlichkeit: mittel“ auf Lernkarte E1 ist unsere Einordnung. Bland nennt einen Eintrag „relatively weak evidence“ (S. 52) und rechnet die vier Achsen nicht zu einer Stufe zusammen; mittel wird es bei uns, weil der Aufsteller in der echten Situation steht.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 52, 55; Einordnung: Kurs',
      },
    ],
    fragen: [
      {
        frage: 'Ist es dann falsch, den Aufsteller zu verschieben?',
        antwort: 'Nicht unbedingt – aber es ist eine neue Entscheidung, die vom Plan abweicht. Sie gehört mit Grund auf die Lernkarte (Zeile „Beleg: … → darum: …“; bei euch: als Zeile unter der Karte E1), und der neue Test braucht seine eigene Zeile „Wir entscheiden vorher“.',
      },
    ],
  },

  'claude-pro-jetzt': {
    live: [
      'Timer 10 min starten, sobald alle die Folie sehen.',
      'Wer Pro oder Max hat: gleich zu Schritt 3.',
      'Falle: Erstattung statt Kündigung – beendet Pro sofort.',
      'Nach 4 min: Läuft bei allen Claude Code?',
    ],
    uebung: { dauer: '10 min', form: 'alle zugleich, jede*r am eigenen Laptop' },
    ablauf: {
      schritte: [
        'Pro neu abschließen (Monthly, 21,60 €) und gleich kündigen; wer Pro oder Max hat, überspringt beides. Läuft bis etwa 12. Jänner.',
        'Claude Code im Repo starten und mit demselben Konto anmelden.',
        'Weiterblättern, sobald die Ersten angemeldet sind: Opus und Test.',
      ],
      achten: [
        'Fehlt Claude Code noch (Tag 4 lief ohne): sofort das Setup-Skript starten, 15–25 min – Hilfe in der Pause.',
      ],
    },
    ueberleitung: 'Claude Code läuft – jetzt noch Opus wählen und kurz testen.',
  },

  'claude-code-opus': {
    live: [
      '„In Claude Code einmal /model opus – ab heute nehmt ihr überall Opus.“',
      'Test: Screenshot vom eigenen Concept-Story-Frame einfügen, ein Satz.',
      'Nach 8 min: Steht bei allen „Claude Pro“ im Startbild?',
      'Wer hängt: Hilfe gleich, auch während der Teamaufstellung.',
    ],
    ablauf: {
      schritte: [
        '/model opus in Claude Code; in der Claude-App Opus im Modellmenü.',
        'Screenshot des Frames „T4 · 1 · Concept Story · Produkt n“ einfügen (Ctrl+V), Prompt „Sag mir in einem Satz …“.',
      ],
      achten: [
        'Keine Versionsnummer nennen – nur „Opus“.',
        'Limit oder kein Opus: /model, das vorgeschlagene Standardmodell wählen, weiter.',
        'Bild kommt nicht an: die Screenshot-Datei ins Terminal ziehen.',
      ],
    },
    ueberleitung: 'Claude Code läuft – jetzt noch Linear, dann stellt ihr euch als Team auf.',
  },

  'linear-einrichten': {
    live: [
      'Timer 5 min: eine*r legt das Team an, lädt die anderen ein.',
      'Konten aus dem Coding-Kurs – niemand braucht ein neues.',
      'Dann jede*r: /mcp, Linear anmelden, /ndu-linear im eigenen Repo.',
      'Falle: als Gast eingeladen – im Team alle als Mitglied.',
      'Fragen: Steht bei allen docs/LINEAR.md im Repo?',
    ],
    uebung: { dauer: '5 min', form: 'eine*r im Browser, dann jede*r in Claude Code' },
    ablauf: {
      achten: [
        'Falsches Google-Konto im Browser: in /mcp trennen und neu anmelden.',
        'Kennt Claude /ndu-linear nicht: Prompt auf konzepte/linear#ndu-linear-fehlt.',
      ],
    },
    ueberleitung: 'Linear steht – jetzt stellt ihr euch als Team auf und schreibt eure Definition of Done.',
  },

  'bauen-skizzen': {
    live: [
      'Erst Mess-Issue und Branding, dann das erste Issue mit Oberfläche.',
      'Bilder dazu: Usage Story, Slice 1, Abnahmekriterien, Skizzen (Fotos oder Figma-Bilder).',
      'Claude zählt erst die Bildschirme auf – dann „Ja, los.“',
      'Fragen: Stimmt die Liste mit den Blättern von Tag 4?',
      'Falle: verschönern lassen – Farben kommen aus dem Branding.',
    ],
    uebung: { dauer: '65 + 60 min (zwei Bau-Blöcke)', form: 'jede*r am eigenen Laptop, Issues aus allen drei Produkten' },
    ablauf: {
      achten: [
        'Dreht sich Claude zweimal am selben Fehler: hingehen, nicht weiter probieren lassen.',
        'Vorschau verlangt Vercel-Anmeldung: Deployment Protection aus, sonst öffnen Testpersonen an Tag 6 den Link nicht.',
        'Kein Wegwerf-Branch mehr: Branch je Issue, Pull Request, Prüfung durch eine andere Person.',
      ],
    },
    kern: [
      {
        text: 'Pairing nach dem Papier-Prototyp: „Use what you learned from the paper prototype testing to inform your clickable prototype design.“ Bei euch wird daraus Slice 1 selbst, nicht ein Wegwerf-Prototyp (Kursregel).',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 185',
      },
    ],
    ueberleitung: 'Um 16:45: Abschluss – der Sprint läuft bis Tag 6.',
  },
};
