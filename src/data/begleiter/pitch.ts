import type { Notiz } from './typen';

// Begleiter-Notizen zu /innolab/methoden/pitch (Tag 5, 13:20–14:05) – vorerst nur die zwei Folien, die Thomke geändert hat.
// Der Begleiter zeigt bisher nur Tag 1; die Notizen stehen bereit, der Test prüft die ids.
const THOMKE = 'Stefan H. Thomke, The Scientific Mindset';

export const NOTIZEN_PITCH: Record<string, Notiz> = {
  aufbau: {
    live: [
      'Vier Teile mit Minuten zeigen, Bogen links nach rechts.',
      '„Belege, nicht Beweise: Ein Test kann euch widerlegen, aber nie endgültig recht geben.“',
      'Bezug Experiment-Karte: Risiko senken, nicht beweisen.',
    ],
    kern: [
      {
        text: '„The scientific method is not about proving things. Rather, the method fuels ongoing disputes that weed out the wrong ideas and replaces them with better ideas.“ Das Vertrauen in eine Hypothese wächst, solange Experimente sie nicht widerlegen – „Until one does.“',
        quelle: `${THOMKE}, S. 170`,
      },
      {
        text: 'Einstein, bei Thomke: „No amount of experimentation can ever prove me right; a single experiment can prove me wrong.“',
        quelle: `${THOMKE}, S. 11`,
      },
    ],
    fragen: [
      {
        frage: 'Warum nicht „bewiesen“, wenn die Zahl doch klar ist?',
        antwort: 'Weil der nächste Test sie widerlegen kann (Thomke S. 11, 170) – und weil eure Zahlen klein sind. „Belegt“ mit dem Sicherheits-Wort der Lernkarte sagt genau, wie weit sie tragen.',
      },
    ],
  },

  belege: {
    live: [
      'Punkte einzeln aufdecken; bei der Gegenfrage kurz stehen bleiben.',
      '„Wäre das auch ohne euer Produkt passiert? Beantwortet das, bevor jemand im Publikum fragt.“',
      'Kaffeebar: 5 von 6 rechtzeitig – hätten die drei den Zug sowieso erwischt?',
      'Falle: Vielnutzer*innen als Beleg für Wirkung nehmen.',
    ],
    verstaendnis: {
      frage: 'Fünf von sechs Abholungen kamen vor der Abfahrt. Warum ist das noch kein Beleg für den Outcome?',
      antwort: 'Es fehlt der Vergleich: Vielleicht hätten die drei ihren Zug auch ohne Bestellung im Gehen erwischt. Erst Morgen ohne das Produkt zeigen, ob es den Unterschied macht.',
      falsch: '„Weil sechs Fälle zu wenige sind“ – stimmt auch, aber selbst sechzig wären ohne Vergleich nur ein Zusammenhang.',
    },
    kern: [
      {
        text: 'Die kontrafaktische Frage: „Would sales have increased if we had not offered a coupon?“ Man kann nicht in der Zeit zurück und dieselbe Lage ohne Eingriff wiederholen; darum sind Anekdoten selten harte Belege.',
        quelle: `${THOMKE}, S. 111`,
      },
      {
        text: 'Microsoft Office: Zwei Teams schlossen aus Beobachtungsdaten, ihre neue Profi-Funktion senke die Abwanderung. Aber wer Profi-Funktionen ausprobiert, nutzt Office viel, und Vielnutzer*innen wandern seltener ab – auch wer Fehlermeldungen bekommt, bleibt eher. Yahoo: Beobachtung ergab bis zu 1.198 % mehr Suchen durch Werbung, das kontrollierte Experiment 5,4 %.',
        quelle: `${THOMKE}, S. 113`,
      },
    ],
    fragen: [
      {
        frage: 'Wir haben keine Vergleichsgruppe – was sagen wir dann?',
        antwort: 'Genau das: „Ein Hinweis auf den Outcome, noch kein Beleg“, wie im Pitch der Kaffeebar, und welcher Vergleich als Nächstes käme. Das ist ehrlicher als eine Zahl ohne Gegenfrage.',
      },
    ],
  },
};
