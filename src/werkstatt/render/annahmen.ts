import type { Annahme, Annahmen } from '../schemas/index.js';
import { belegText, datumAt, einzeilig, zelle } from './format.js';

const ART_TEXT: Record<Annahme['art'], string> = {
  wuenschenswert: 'wünschenswert',
  machbar: 'machbar',
  wirtschaftlich: 'wirtschaftlich',
  bedienbar: 'bedienbar',
  ethisch: 'ethisch',
};

// Tabelle wie in der Vorlage auf der Methodenseite „Annahmen-Map“.
export function annahmenRendern(d: Annahmen): string {
  const kopf = `| ID | Wir glauben, dass … | Art | Wichtig | Beleg |
|----|---------------------|-----|---------|-------|`;
  const zeilen = d.annahmen.map((a) => {
    const id = a.id === d.riskanteste ? `**${a.id}** (riskanteste)` : `**${a.id}**`;
    return `| ${id} | ${zelle(a.text)} | ${ART_TEXT[a.art]} | ${a.wichtig} | ${belegText(a.beleg, a.belegIds, a.belegNotiz)} |`;
  });
  return `# Annahmen

Stand: ${datumAt(d.stand)}

Riskanteste Annahme: ${d.riskanteste !== undefined ? einzeilig(d.riskanteste) : 'noch keine gewählt'}

${d.annahmen.length > 0 ? [kopf, ...zeilen].join('\n') : 'Noch keine Annahmen eingetragen.'}
`;
}
