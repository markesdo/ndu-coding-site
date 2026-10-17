import { kohorte2026 } from './2026.js';
import { kohorteTest } from './test.js';
import type { Kohorte } from './typen.js';

export type { ArtefaktVersion, Kohorte, KohortenStatus } from './typen.js';

// Neuer Jahrgang = Datei anlegen und hier eintragen.
export const KOHORTEN: readonly Kohorte[] = [kohorte2026, kohorteTest];

export function kohorte(id: string): Kohorte | undefined {
  return KOHORTEN.find((k) => k.id === id);
}
