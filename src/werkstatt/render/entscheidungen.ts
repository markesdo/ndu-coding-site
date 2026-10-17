import { BELEGSTUFE_TEXT, type Entscheidung, type Entscheidungen } from '../schemas/index.js';
import { datumAt, einzeilig } from './format.js';

function beleg(e: Entscheidung): string {
  const stufe = BELEGSTUFE_TEXT[e.beleg];
  const teile = e.belegIds.map(einzeilig).join(', ');
  // Leere Notiz (Entwurf) zählt wie keine. IDs und Notiz teilen sich eine Klammer.
  const zusatz = [teile, e.belegNotiz ? einzeilig(e.belegNotiz) : ''].filter(Boolean).join('; ');
  return zusatz ? `${stufe} (${zusatz})` : stufe;
}

// Eine Zeile pro Entscheidung: Datum — Entscheidung — Grund — Beleg. Gelöscht wird nichts.
export function entscheidungenRendern(d: Entscheidungen): string {
  const zeilen = d.entscheidungen.map((e) => {
    const neue = d.entscheidungen.filter((x) => x.ersetzt === e.id).at(-1);
    let z = `- **${e.id}** ${datumAt(e.datum)} — ${einzeilig(e.entscheidung)} — ${einzeilig(e.grund)} — Beleg: ${beleg(e)}`;
    if (e.ersetzt !== undefined) z += ` — ersetzt **${e.ersetzt}**`;
    if (neue !== undefined) z += ` — ersetzt am ${datumAt(neue.datum)}`;
    return z;
  });
  return `# Entscheidungslog

**Stand:** ${datumAt(d.stand)}

${zeilen.length > 0 ? zeilen.join('\n') : 'Noch keine Entscheidungen eingetragen.'}
`;
}
