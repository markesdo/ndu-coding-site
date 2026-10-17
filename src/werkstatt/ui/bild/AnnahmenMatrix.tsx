import type { Annahme } from '../../schemas/index.js';
import { annahmenPunkte } from './annahmen-punkte.js';
import { Matrix2x2 } from './Matrix2x2.js';

export { annahmenPunkte };

// Achsen und Felder wie auf annahmen.astro: nach oben wichtig, nach rechts belegt, „Zuerst testen“ (ol) hervorgehoben.
const ACHSEN = {
  y: { label: 'wichtig', unten: 'weniger', oben: 'sehr' },
  x: { label: 'belegt', links: 'kein Beleg', rechts: 'starker Beleg' },
  felder: ['Zuerst testen', 'Darauf bauen', 'Später prüfen', 'Abhaken'] as [string, string, string, string],
  hervor: 'ol' as const,
};

export function AnnahmenMatrix({ annahmen, riskanteste }: { annahmen: readonly Annahme[]; riskanteste: string | null }) {
  return <Matrix2x2 label="Annahmen-Map: nach oben wichtig, nach rechts belegt; oben links zuerst testen" {...ACHSEN} punkte={annahmenPunkte(annahmen, riskanteste)} />;
}
