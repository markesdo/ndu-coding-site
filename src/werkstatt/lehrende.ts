// Reine Hilfen der Lehrenden-Ansicht (Spec §3.7): Seit welchem Kurstag wird gezählt, und wie viele Commits sind das?
// Ohne Speicher, damit testbar; die Route steht in server/routen/lehrende.ts.
import { tagInWien } from '../lib/kurswahl.js';

export interface Kurstermin {
  tag: number;
  datum: string;
}

/** Kurstage mit Termin bis heute (JJJJ-MM-TT in Wien), nach Datum. Bezug ohne Wahl: der letzte Kurstag vor heute, damit
 *  zu Beginn von Tag 2 „seit Tag 1“ gilt; gibt es keinen, der Kurstag heute (am ersten Tag); sonst null.
 *  gewaehlt muss einer der Tage sein, sonst undefined (ungültige Wahl). */
export function bezugBestimmen(
  termine: Record<string, string | null>,
  heute: string,
  gewaehlt?: number,
): { tage: Kurstermin[]; bezug: Kurstermin | null } | undefined {
  const tage = Object.entries(termine)
    .map(([schluessel, datum]) => ({ tag: Number(/^tag(\d+)$/.exec(schluessel)?.[1]), datum }))
    .filter((t): t is Kurstermin => Number.isInteger(t.tag) && typeof t.datum === 'string' && t.datum <= heute)
    .sort((a, b) => a.datum.localeCompare(b.datum) || a.tag - b.tag);
  if (gewaehlt !== undefined) {
    const t = tage.find((x) => x.tag === gewaehlt);
    return t ? { tage, bezug: t } : undefined;
  }
  const vorHeute = tage.filter((t) => t.datum < heute);
  return { tage, bezug: vorHeute.at(-1) ?? tage.at(-1) ?? null };
}

/** Commits ab dem Kalendertag `seit` (Wien; null = alle). Sind es alle gelesenen und fehlen ältere, gibt es vielleicht
 *  mehr (mehr = true). zuletzt = der neueste Zeitpunkt. */
export function verlaufZaehlen(
  zeitpunkte: readonly string[],
  vollstaendig: boolean,
  seit: string | null,
): { commits: number; mehr: boolean; zuletzt: string | null } {
  const commits = seit === null ? zeitpunkte.length : zeitpunkte.filter((z) => tagInWien(new Date(z)) >= seit).length;
  return { commits, mehr: !vollstaendig && commits === zeitpunkte.length && commits > 0, zuletzt: zeitpunkte[0] ?? null };
}
