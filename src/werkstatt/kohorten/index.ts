import { kohorte2026 } from './2026.js';
import { kohorteTest } from './test.js';
import { ARTEFAKT_NAMEN, type ArtefaktName } from '../schemas/namen.js';
import type { Kohorte } from './typen.js';

export type { ArtefaktVersion, Kohorte, KohortenStatus } from './typen.js';

/** Artefakte, die die Kohorte in der Werkstatt führt (aus artefakte: 'brief@1', …), in der Reihenfolge von ARTEFAKT_NAMEN. */
export function werkstattArtefakte(k: Kohorte): ArtefaktName[] {
  const namen = new Set(k.artefakte.map((v) => v.slice(0, v.lastIndexOf('@'))));
  return ARTEFAKT_NAMEN.filter((n) => namen.has(n));
}

// Neuer Jahrgang = Datei anlegen und hier eintragen.
export const KOHORTEN: readonly Kohorte[] = [kohorte2026, kohorteTest];

export function kohorte(id: string): Kohorte | undefined {
  return KOHORTEN.find((k) => k.id === id);
}
