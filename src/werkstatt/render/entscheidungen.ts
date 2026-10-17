import { BELEGSTUFE_TEXT, type Entscheidung, type Entscheidungen } from '../schemas/index.js';
import { datumAt } from './format.js';

function beleg(e: Entscheidung): string {
  const stufe = BELEGSTUFE_TEXT[e.beleg];
  return e.belegIds.length > 0 ? `${stufe} (${e.belegIds.join(', ')})` : stufe;
}

// Eine Zeile pro Entscheidung: Datum — Entscheidung — Grund — Beleg. Gelöscht wird nichts.
export function entscheidungenRendern(d: Entscheidungen): string {
  const zeilen = d.entscheidungen.map((e) => {
    const neue = d.entscheidungen.filter((x) => x.ersetzt === e.id).at(-1);
    let z = `- **${e.id}** ${datumAt(e.datum)} — ${e.entscheidung} — ${e.grund} — Beleg: ${beleg(e)}`;
    if (e.ersetzt !== undefined) z += ` — ersetzt **${e.ersetzt}**`;
    if (neue !== undefined) z += ` — ersetzt am ${datumAt(neue.datum)}`;
    return z;
  });
  return `# Entscheidungslog

**Stand:** ${datumAt(d.stand)}

${zeilen.length > 0 ? zeilen.join('\n') : 'Noch keine Entscheidungen eingetragen.'}
`;
}
