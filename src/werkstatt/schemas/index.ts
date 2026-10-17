// Öffentliche Fläche der Schemas: Browser, API und MCP importieren nur von hier.
import type { ZodType } from 'zod';
import type { ArtefaktName } from './namen';
import { briefLeer, briefSchema, type Brief } from './brief';
import { entscheidungenLeer, entscheidungenSchema, type Entscheidungen } from './entscheidungen';
import { leitfadenLeer, leitfadenSchema, type Leitfaden } from './leitfaden';
import { annahmenLeer, annahmenSchema, type Annahmen } from './annahmen';
import type { Feldfehler } from './gemeinsam';

export type { ArtefaktName } from './namen';
export { ARTEFAKT_NAMEN } from './namen';
export { BELEGSTUFEN, type Belegstufe, type Feldfehler } from './gemeinsam';
export type { Brief } from './brief';
export type { Entscheidungen, Entscheidung } from './entscheidungen';
export type { Leitfaden, Frage } from './leitfaden';
export { quadrant, punkt, type Annahmen, type Annahme, type Quadrant } from './annahmen';

export type ArtefaktDaten = Brief | Entscheidungen | Leitfaden | Annahmen;

const SCHEMAS: Record<ArtefaktName, ZodType<ArtefaktDaten>> = {
  brief: briefSchema,
  entscheidungen: entscheidungenSchema,
  leitfaden: leitfadenSchema,
  annahmen: annahmenSchema,
};

// slug = Methodenseite unter /innolab/methoden/.
export const ARTEFAKTE: Record<ArtefaktName, { titel: string; slug: string; version: 1; leer(heute: string): unknown }> = {
  brief: { titel: 'Produkt-Brief', slug: 'problem-rahmen', version: 1, leer: briefLeer },
  entscheidungen: { titel: 'Entscheidungslog', slug: 'entscheidungslog', version: 1, leer: entscheidungenLeer },
  leitfaden: { titel: 'Interviewleitfaden', slug: 'interview', version: 1, leer: leitfadenLeer },
  annahmen: { titel: 'Annahmen-Map', slug: 'annahmen', version: 1, leer: annahmenLeer },
};

// Schlüssel ist die Kennung der alten Fassung („annahmen@1“), Wert hebt sie eine Version an.
// Gelesen wird immer mit Migration im Speicher; geschrieben erst beim ausdrücklichen Speichern.
export const MIGRATIONEN: Record<string, (alt: unknown) => unknown> = {};

function istObjekt(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function migrieren(name: ArtefaktName, roh: unknown): unknown {
  const ziel = `${name}@${ARTEFAKTE[name].version}`;
  let aktuell = roh;
  // Schutz gegen zyklische Tabellen.
  for (let schritt = 0; schritt < 20; schritt++) {
    if (!istObjekt(aktuell) || typeof aktuell.schema !== 'string' || aktuell.schema === ziel) break;
    if (!Object.hasOwn(MIGRATIONEN, aktuell.schema)) break;
    aktuell = MIGRATIONEN[aktuell.schema](aktuell);
  }
  return aktuell;
}

export function artefaktParsen(
  name: ArtefaktName,
  roh: unknown,
): { ok: true; daten: ArtefaktDaten } | { ok: false; fehler: Feldfehler[] } {
  const r = SCHEMAS[name].safeParse(migrieren(name, roh));
  if (r.success) return { ok: true, daten: r.data };
  return {
    ok: false,
    fehler: r.error.issues.map((i) => ({ pfad: i.path.map(String).join('.'), meldung: i.message })),
  };
}
