import type { Brief } from '../schemas/index.js';
import { datumAt, liste, mehrzeilig } from './format.js';

// Überschriften wie in der Vorlage auf der Methodenseite „Problem-Rahmen“.
export function briefRendern(d: Brief): string {
  const nicht = liste(d.nicht);
  const offen = liste(d.offeneFragen);
  return `**Stand:** ${datumAt(d.stand)} — Problem-Rahmen, Innolab Tag 1

## 1. Für wen?
${mehrzeilig(d.fuerWen)}

## 2. Welches Problem?
${mehrzeilig(d.problem)}

Heute gelöst durch: ${mehrzeilig(d.heuteGeloestDurch)}

## 3. Was ist das Produkt in einem Satz?
${d.produktSatz !== undefined && d.produktSatz.trim() !== '' ? mehrzeilig(d.produktSatz) : 'Offen – steht nach Tag 3 fest.'}

## 4. Was macht es NICHT?
${nicht}

## 5. Was gehört ins MVP?
Kommt aus der Story Map (Tag 3).

## 6. Woran merken wir, dass es funktioniert?
Wir glauben: ${mehrzeilig(d.outcome.wirGlauben)}

Wir merken es: ${mehrzeilig(d.outcome.wirMerkenEs)}

## 7. Offene Fragen
${offen}
`;
}
