import type { Entscheidungen } from '../schemas/index.js';
import { belegText, datumAt, einzeilig } from './format.js';

// Eine Zeile pro Entscheidung: Datum — Entscheidung — Grund — Beleg. Gelöscht wird nichts.
export function entscheidungenRendern(d: Entscheidungen): string {
  // Ersetzte ID -> ersetzende Zeile (bei mehreren gewinnt die spätere).
  const ersetzer = new Map<string, Entscheidungen['entscheidungen'][number]>();
  for (const x of d.entscheidungen) if (x.ersetzt !== undefined) ersetzer.set(x.ersetzt, x);
  const zeilen = d.entscheidungen.map((e) => {
    const neue = ersetzer.get(e.id);
    let z = `- **${e.id}** ${datumAt(e.datum)} — ${einzeilig(e.entscheidung)} — ${einzeilig(e.grund)} — Beleg: ${belegText(e.beleg, e.belegIds, e.belegNotiz)}`;
    if (e.ersetzt !== undefined) z += ` — ersetzt **${e.ersetzt}**`;
    if (neue !== undefined) z += ` — ersetzt am ${datumAt(neue.datum)}`;
    return z;
  });
  return `# Entscheidungslog

**Stand:** ${datumAt(d.stand)}

${zeilen.length > 0 ? zeilen.join('\n') : 'Noch keine Entscheidungen eingetragen.'}
`;
}
