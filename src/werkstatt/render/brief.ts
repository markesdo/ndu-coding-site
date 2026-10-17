import type { Brief } from '../schemas/index.js';
import { datumAt, einzeilig, mehrzeilig } from './format.js';

// Überschriften wie in der Vorlage auf der Methodenseite „Problem-Rahmen“.
export function briefRendern(d: Brief): string {
  const nicht = d.nicht.length > 0 ? d.nicht.map((n) => `- ${einzeilig(n)}`).join('\n') : '- Noch nichts eingetragen.';
  const offen = d.offeneFragen.length > 0 ? d.offeneFragen.map((f) => `- ${einzeilig(f)}`).join('\n') : '- Noch nichts eingetragen.';
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
