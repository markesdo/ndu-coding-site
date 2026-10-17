// Öffentliche Fläche der Schemas: Browser, API und MCP importieren nur von hier.
import type { ZodType } from 'zod';
import type { ArtefaktName } from './namen.js';
import { briefLeer, briefSchema, type Brief } from './brief.js';
import { entscheidungenLeer, entscheidungenSchema, type Entscheidungen } from './entscheidungen.js';
import { leitfadenLeer, leitfadenSchema, type Leitfaden } from './leitfaden.js';
import { annahmenLeer, annahmenSchema, type Annahmen } from './annahmen.js';
import type { Feldfehler } from './gemeinsam.js';

export type { ArtefaktName } from './namen.js';
export { ARTEFAKT_NAMEN } from './namen.js';
export { BELEGSTUFEN, BELEGSTUFE_TEXT, type Belegstufe, type Feldfehler } from './gemeinsam.js';
export type { Brief } from './brief.js';
export { BELEG_NOTIZ_MAX, type Entscheidungen, type Entscheidung } from './entscheidungen.js';
export { EINSTIEG_VORLAGE, FRAGE_ARTEN, type Leitfaden, type Frage } from './leitfaden.js';
export { ANNAHME_ARTEN, WICHTIGKEITEN, quadrant, punkt, type Annahmen, type Annahme, type Quadrant } from './annahmen.js';

export type ArtefaktDaten = Brief | Entscheidungen | Leitfaden | Annahmen;

export type DatenVon<N extends ArtefaktName> = {
  brief: Brief;
  entscheidungen: Entscheidungen;
  leitfaden: Leitfaden;
  annahmen: Annahmen;
}[N];

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

export function istObjekt(x: unknown): x is Record<string, unknown> {
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

export function artefaktParsen<N extends ArtefaktName>(
  name: N,
  roh: unknown,
): { ok: true; daten: DatenVon<N> } | { ok: false; fehler: Feldfehler[] } {
  const r = SCHEMAS[name].safeParse(migrieren(name, roh));
  if (r.success) return { ok: true, daten: r.data as DatenVon<N> };
  return {
    ok: false,
    fehler: r.error.issues.map((i) => ({ pfad: i.path.map(String).join('.'), meldung: i.message })),
  };
}
