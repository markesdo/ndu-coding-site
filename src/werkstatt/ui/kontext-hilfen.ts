// Reine Hilfen für den Kontext im Zeigen-Modus (KontextPanel.tsx): Annahmen-Map und Leitfaden der Person neben dem
// Snapshot. Nur die von der Person geschriebenen Daten (daten) – nie Feedback, Lücken oder Prüfergebnisse.
import { annahmenSchema, type Annahme, type Annahmen } from '../schemas/annahmen.js';
import { leitfadenSchema, type Frage, type Leitfaden } from '../schemas/leitfaden.js';
import type { Interview, Quadrant } from '../schemas/index.js';
import { ANNAHMEN_ACHSEN } from './bild/AnnahmenMatrix.js';

export type KontextName = 'annahmen' | 'leitfaden';
export const KONTEXT_NAMEN: readonly KontextName[] = ['annahmen', 'leitfaden'];

/** Ein Teil des Kontexts. stand null = noch nie geladen; vorher null = erstes Laden (dann ist nichts „neu“). */
export interface KontextTeil<T> {
  stand: { daten: T | null; vorher: { daten: T | null } | null } | null;
  laedt: boolean;
  fehler: boolean;
}
export interface Kontext {
  annahmen: KontextTeil<Annahmen>;
  leitfaden: KontextTeil<Leitfaden>;
}
export const KONTEXT_LEER: Kontext = {
  annahmen: { stand: null, laedt: false, fehler: false },
  leitfaden: { stand: null, laedt: false, fehler: false },
};

/** Gelesene Daten prüfen; fehlt die Datei oder passt sie nicht zum Schema: null (nie der rohe Text). */
export function annahmenAus(daten: unknown): Annahmen | null {
  const r = annahmenSchema.safeParse(daten);
  return r.success ? r.data : null;
}
export function leitfadenAus(daten: unknown): Leitfaden | null {
  const r = leitfadenSchema.safeParse(daten);
  return r.success ? r.data : null;
}

/** Aus einer Antwort der API nur die Daten der Person, geprüft: Feedback, roher Text und alles andere bleiben draußen. */
export function kontextDaten<N extends KontextName>(name: N, antwort: { daten: unknown }): (N extends 'annahmen' ? Annahmen : Leitfaden) | null {
  return (name === 'annahmen' ? annahmenAus(antwort.daten) : leitfadenAus(antwort.daten)) as (N extends 'annahmen' ? Annahmen : Leitfaden) | null;
}

// Feldnamen der Annahmen-Map wie im Bild (AnnahmenMatrix): felder = [ol, or, ul, ur].
const [ol, or, ul, ur] = ANNAHMEN_ACHSEN.felder;
export const QUADRANT_TEXT: Record<Quadrant, string> = { ol, or, ul, ur };

/** Stützt sich die Annahme auf dieses Interview? Eine Beleg-ID ist ein Zitat des Snapshots (I2-4) oder das Interview
 *  selbst (I2). */
export function belegtImInterview(a: Pick<Annahme, 'belegIds'>, iv: Pick<Interview, 'id' | 'zitate'> | null): boolean {
  if (!iv) return false;
  const ids = new Set([iv.id, ...iv.zitate.map((z) => z.id)].map((x) => x.trim()));
  return a.belegIds.some((b) => ids.has(b.trim()));
}

/** IDs der Zeilen, die seit dem letzten Laden dazugekommen oder geändert sind. vorher null = erstes Laden: keine. */
export function neueZeilen<T extends { id: string }>(vorher: readonly T[] | null, nachher: readonly T[], schluessel: (x: T) => unknown = (x) => x): Set<string> {
  if (vorher === null) return new Set();
  const alt = new Map(vorher.map((x) => [x.id, JSON.stringify(schluessel(x))]));
  return new Set(nachher.filter((x) => alt.get(x.id) !== JSON.stringify(schluessel(x))).map((x) => x.id));
}

/** Neue oder geänderte Annahmen; ein Wechsel der riskantesten markiert beide Zeilen. */
export function neueAnnahmen(teil: KontextTeil<Annahmen>['stand']): Set<string> {
  if (!teil?.daten || !teil.vorher) return new Set();
  const alt = teil.vorher.daten;
  const mit = (d: Annahmen) => (a: Annahme) => ({ ...a, riskanteste: a.id === d.riskanteste });
  if (!alt) return new Set(teil.daten.annahmen.map((a) => a.id));
  return neueZeilen(alt.annahmen.map(mit(alt)), teil.daten.annahmen.map(mit(teil.daten)));
}

/** Neue oder geänderte Fragen und ob sich das Ziel geändert hat. */
export function neuerLeitfaden(teil: KontextTeil<Leitfaden>['stand']): { fragen: Set<string>; ziel: boolean } {
  if (!teil?.daten || !teil.vorher) return { fragen: new Set(), ziel: false };
  const alt = teil.vorher.daten;
  const fragen: readonly Frage[] | null = alt ? alt.fragen : [];
  return { fragen: neueZeilen(fragen, teil.daten.fragen), ziel: !!teil.daten.ziel.trim() && (alt?.ziel.trim() ?? '') !== teil.daten.ziel.trim() };
}

/** Taste K schaltet den Kontext um – nicht beim Tippen in Feldern und nicht mit Strg/Cmd/Alt (Kurzbefehle des Browsers). */
export function istKontextTaste(e: { key: string; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean; target?: EventTarget | null }): boolean {
  if (e.key !== 'k' && e.key !== 'K') return false;
  if (e.ctrlKey || e.metaKey || e.altKey) return false;
  const t = e.target as { tagName?: string; isContentEditable?: boolean } | null | undefined;
  if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName ?? ''))) return false;
  return true;
}
