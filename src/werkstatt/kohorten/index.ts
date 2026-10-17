import { kohorte2026 } from './2026';
import { kohorteTest } from './test';
import type { Kohorte } from './typen';

export type { ArtefaktVersion, Kohorte, KohortenStatus } from './typen';

// Neuer Jahrgang = Datei anlegen und hier eintragen.
export const KOHORTEN: readonly Kohorte[] = [kohorte2026, kohorteTest];

export function kohorte(id: string): Kohorte | undefined {
  return KOHORTEN.find((k) => k.id === id);
}
