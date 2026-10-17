// Reine Hilfen des Brief-Editors: die Karten der Vorschau. Die Reihenfolge 1–7 ist die der Vorlage auf „Problem-Rahmen“.
import type { Brief } from '../../schemas/index.js';

export const PRODUKTSATZ_OFFEN = 'Offen – steht nach Tag 3 fest.';
export const MVP_HINWEIS = 'Kommt aus der Story Map (Tag 3).';

export interface BriefKarte {
  nr: number;
  titel: string;
  /** Absätze; leer = noch nichts eingetragen. */
  absaetze: string[];
  /** Aufzählung statt Absätzen. */
  punkte?: string[];
  /** Platzhalter, solange nichts da ist (zum Beispiel „Offen – steht nach Tag 3 fest.“). */
  leerText?: string;
}

const nichtLeer = (s: string | undefined): string[] => (s !== undefined && s.trim() !== '' ? [s.trim()] : []);
const punkte = (liste: readonly string[]): string[] => liste.map((s) => s.trim()).filter((s) => s !== '');

export function briefKarten(d: Brief): BriefKarte[] {
  const problem = nichtLeer(d.problem);
  if (d.heuteGeloestDurch.trim() !== '') problem.push(`Heute gelöst durch: ${d.heuteGeloestDurch.trim()}`);
  return [
    { nr: 1, titel: 'Für wen?', absaetze: nichtLeer(d.fuerWen), leerText: 'Noch nichts eingetragen.' },
    { nr: 2, titel: 'Welches Problem?', absaetze: problem, leerText: 'Noch nichts eingetragen.' },
    { nr: 3, titel: 'Was ist das Produkt in einem Satz?', absaetze: nichtLeer(d.produktSatz), leerText: PRODUKTSATZ_OFFEN },
    { nr: 4, titel: 'Was macht es NICHT?', absaetze: [], punkte: punkte(d.nicht), leerText: 'Noch nichts eingetragen.' },
    { nr: 5, titel: 'Was gehört ins MVP?', absaetze: [MVP_HINWEIS] },
    {
      nr: 6,
      titel: 'Woran merken wir, dass es funktioniert?',
      absaetze: [
        ...nichtLeer(d.outcome.wirGlauben).map((t) => `Wir glauben: ${t}`),
        ...nichtLeer(d.outcome.wirMerkenEs).map((t) => `Wir merken es: ${t}`),
      ],
      leerText: 'Noch nichts eingetragen.',
    },
    { nr: 7, titel: 'Offene Fragen', absaetze: [], punkte: punkte(d.offeneFragen), leerText: 'Noch nichts eingetragen.' },
  ];
}

/** Leerer Text im Feld „Produkt in einem Satz“ heißt: nicht gesetzt (Schlüssel fällt weg). */
export function produktSatzSetzen(d: Brief, wert: string): Brief {
  const { produktSatz: _alt, ...rest } = d;
  return wert.trim() === '' ? rest : { ...rest, produktSatz: wert };
}
