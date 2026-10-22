// Zahlen für den Rückblick am Ende eines Kurstags: was jede Person bisher in ihrer Mappe hat. Nur Zählen, kein Urteil
// über die Qualität. Gelesen wird wie beim Laden im Editor (migriert und geprüft); passt eine Datei nicht zum Schema,
// zählt sie als 0 und `unlesbar` nennt sie.
import { artefaktParsen, type ArtefaktName, type Brief } from './schemas/index.js';
import type { PersonZahlen } from './vertrag.js';

// Felder des Briefs, die an Tag 1 ausgefüllt sein sollen (produktSatz und offene Fragen kommen später).
// name wie im gerenderten Brief (render/brief.ts); tag-stand.ts nennt damit, was noch fehlt.
export const BRIEF_TAG1_FELDER: readonly { name: string; ausgefuellt: (b: Brief) => boolean }[] = [
  { name: 'Für wen?', ausgefuellt: (b) => !!b.fuerWen.trim() },
  { name: 'Welches Problem?', ausgefuellt: (b) => !!b.problem.trim() },
  { name: 'Heute gelöst durch', ausgefuellt: (b) => !!b.heuteGeloestDurch.trim() },
  { name: 'Was macht es NICHT?', ausgefuellt: (b) => b.nicht.some((n) => n.trim()) },
  { name: 'Wir glauben', ausgefuellt: (b) => !!b.outcome.wirGlauben.trim() },
  { name: 'Wir merken es', ausgefuellt: (b) => !!b.outcome.wirMerkenEs.trim() },
];
export const BRIEF_FELDER = BRIEF_TAG1_FELDER.length;

// roh[name]: Inhalt der Datei, null = gibt es nicht, UNLESBAR = kein JSON (z. B. direkt auf GitHub bearbeitet).
export const UNLESBAR = Symbol('unlesbar');

export function zaehlen(kuerzel: string, roh: Record<ArtefaktName, unknown | null>): PersonZahlen {
  const unlesbar: ArtefaktName[] = [];
  const parsen = <N extends ArtefaktName>(name: N) => {
    if (roh[name] === null) return null;
    if (roh[name] === UNLESBAR) { unlesbar.push(name); return null; }
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
    briefFelder: brief ? BRIEF_TAG1_FELDER.filter((f) => f.ausgefuellt(brief)).length : 0,
    entscheidungen: entscheidungen?.entscheidungen.length ?? 0,
    annahmen: annahmen?.annahmen.length ?? 0,
    fragen: leitfaden?.fragen.length ?? 0,
    unlesbar,
  };
}
