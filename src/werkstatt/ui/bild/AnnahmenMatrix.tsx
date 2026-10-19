import type { Annahme } from '../../schemas/index.js';
import { annahmenPunkte } from './annahmen-punkte.js';
import { Matrix2x2 } from './Matrix2x2.js';

// Achsen und Felder wie auf annahmen.astro: nach oben wichtig, nach rechts weniger Beleg, „Zuerst testen“ (or) hervorgehoben.
const ACHSEN = {
  y: { label: 'wichtig', unten: 'weniger', oben: 'sehr' },
  x: { label: 'Unsicherheit', links: 'starker Beleg', rechts: 'kein Beleg' },
  felder: ['Beleg prüfen, darauf bauen', 'Zuerst testen', 'Abhaken', 'Später prüfen'] as [string, string, string, string],
  hervor: 'or' as const,
};

export function AnnahmenMatrix({ annahmen, riskanteste }: { annahmen: readonly Annahme[]; riskanteste?: string | null }) {
  return <Matrix2x2 label="Annahmen-Map: nach oben wichtig, nach rechts weniger Beleg; oben rechts zuerst testen" {...ACHSEN} punkte={annahmenPunkte(annahmen, riskanteste)} />;
}
