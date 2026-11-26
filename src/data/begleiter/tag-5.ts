import type { Notiz } from './typen';

// Begleiter-Notizen zu /innolab/tag-5 (12.12.) – vorerst nur der Test-Debrief, Rückfrage aus Thomke. Seit 27.11.2026 läuft E1
// nicht: Die Karte E1 wird als Gedankenexperiment besprochen, die Kaffeebar-Lernkarte ist das Beispiel.
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
    ],
    fragen: [
      {
        frage: 'Ist es dann falsch, den Aufsteller zu verschieben?',
        antwort: 'Nicht unbedingt – aber es ist eine neue Entscheidung, die vom Plan abweicht. Sie gehört mit Grund auf die Lernkarte (Zeile „Beleg: … → darum: …“; bei euch: als Zeile unter der Karte E1), und der neue Test braucht seine eigene Zeile „Wir entscheiden vorher“.',
      },
    ],
  },
};
