// Zahlen für den Rückblick am Ende eines Kurstags: was jede Person bisher in ihrer Mappe hat. Nur Zählen, kein Urteil
// über die Qualität. Gelesen wird wie beim Laden im Editor (migriert und geprüft); passt eine Datei nicht zum Schema,
// zählt sie als 0 und `unlesbar` nennt sie.
import { artefaktParsen, type ArtefaktName } from './schemas/index.js';
import type { PersonZahlen } from './vertrag.js';

// Felder des Briefs, die an Tag 1 ausgefüllt sein sollen (produktSatz und offene Fragen kommen später).
export const BRIEF_FELDER = 6;

const gefuellt = (t: string | undefined) => (t?.trim() ? 1 : 0);

export function zaehlen(kuerzel: string, roh: Record<ArtefaktName, unknown | null>): PersonZahlen {
  const unlesbar: ArtefaktName[] = [];
  const parsen = <N extends ArtefaktName>(name: N) => {
    if (roh[name] === null) return null;
    const p = artefaktParsen(name, roh[name]);
    if (p.ok) return p.daten;
    unlesbar.push(name);
    return null;
  };
  const brief = parsen('brief');
  const entscheidungen = parsen('entscheidungen');
  const annahmen = parsen('annahmen');
  const leitfaden = parsen('leitfaden');
  return {
    kuerzel,
    briefFelder: brief
      ? gefuellt(brief.fuerWen) + gefuellt(brief.problem) + gefuellt(brief.heuteGeloestDurch)
        + (brief.nicht.some((n) => n.trim()) ? 1 : 0) + gefuellt(brief.outcome.wirGlauben) + gefuellt(brief.outcome.wirMerkenEs)
      : 0,
    entscheidungen: entscheidungen?.entscheidungen.length ?? 0,
    annahmen: annahmen?.annahmen.length ?? 0,
    fragen: leitfaden?.fragen.length ?? 0,
    unlesbar,
  };
}
