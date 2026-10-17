import { BELEGSTUFE_TEXT, type Annahme, type Annahmen } from '../schemas/index.js';
import { datumAt, zelle } from './format.js';

const ART_TEXT: Record<Annahme['art'], string> = {
  wuenschenswert: 'wünschenswert',
  machbar: 'machbar',
  wirtschaftlich: 'wirtschaftlich',
  bedienbar: 'bedienbar',
};

// Tabelle wie in der Vorlage auf der Methodenseite „Annahmen-Map“.
export function annahmenRendern(d: Annahmen): string {
  const kopf = `| ID | Wir glauben, dass … | Art | Wichtig | Beleg |
|----|---------------------|-----|---------|-------|`;
  const zeilen = d.annahmen.map((a) => {
    const id = a.id === d.riskanteste ? `**${a.id}** (riskanteste)` : `**${a.id}**`;
    const beleg = BELEGSTUFE_TEXT[a.beleg] + (a.belegIds.length > 0 ? ` (${a.belegIds.join(', ')})` : '');
    return `| ${id} | ${zelle(a.text)} | ${ART_TEXT[a.art]} | ${a.wichtig} | ${beleg} |`;
  });
  return `# Annahmen

**Stand:** ${datumAt(d.stand)}
Riskanteste Annahme: ${d.riskanteste ?? 'noch keine gewählt'}

${d.annahmen.length > 0 ? [kopf, ...zeilen].join('\n') : 'Noch keine Annahmen eingetragen.'}
`;
}
