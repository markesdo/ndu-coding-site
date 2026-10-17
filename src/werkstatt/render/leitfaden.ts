import type { Leitfaden } from '../schemas/index.js';
import { datumAt, einzeilig, zitat } from './format.js';

// Überschriften wie in der Vorlage auf der Methodenseite „Jobs to be Done & Mom Test“.
export function leitfadenRendern(d: Leitfaden): string {
  const kern = d.fragen.filter((f) => f.art === 'kern').map((f, i) => `${i + 1}. **${f.id}** ${einzeilig(f.text)}`);
  const nach = d.fragen.filter((f) => f.art === 'nachfrage').map((f) => `- **${f.id}** ${einzeilig(f.text)}`);
  return `# Interviewleitfaden

**Stand:** ${datumAt(d.stand)}

Ziel: ${einzeilig(d.ziel)}

Wen: ${einzeilig(d.wen)}

## Einstieg
${zitat(d.einstieg)}

## Kernfragen
${kern.length > 0 ? kern.join('\n') : 'Noch keine Fragen eingetragen.'}

## Nachfragen
${nach.length > 0 ? nach.join('\n') : 'Noch keine Fragen eingetragen.'}

## Abschluss
${zitat(d.abschluss)}
`;
}
