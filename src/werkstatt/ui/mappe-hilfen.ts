// Reine Hilfen für /innolab/mappe (MappeUebersicht.tsx): Rücksprünge der Anmeldung und Zeilen der Übersicht.
import { ARTEFAKTE, ARTEFAKT_NAMEN, type ArtefaktName } from '../schemas/index.js';
import type { MappeStand } from '../vertrag.js';

/** Texte zu ?fehler=… – die Anmeldung (routen/auth.ts) springt damit auf /innolab/mappe zurück. */
export const FEHLER_TEXT = {
  'nicht-freigeschaltet': 'Du bist für keinen Kurs freigeschaltet. Schreib Markus deinen GitHub-Namen.',
  'anmeldung-ungueltig': 'Die Anmeldung ist abgelaufen oder wurde in einem anderen Tab begonnen. Melde dich noch einmal an.',
  'anmeldung-fehlgeschlagen': 'Die Anmeldung bei GitHub hat nicht geklappt. Versuch es gleich noch einmal.',
} as const;

export type AnmeldeFehler = keyof typeof FEHLER_TEXT;

/** Nicht freigeschaltet: Neu anmelden hilft nicht, erst muss Markus die Person eintragen – die Seite lädt dann nichts. */
export function anmeldeFehler(suche: string): { code: AnmeldeFehler; text: string; neuAnmelden: boolean } | null {
  const code = new URLSearchParams(suche).get('fehler') ?? '';
  if (!Object.hasOwn(FEHLER_TEXT, code)) return null;
  const c = code as AnmeldeFehler;
  return { code: c, text: FEHLER_TEXT[c], neuAnmelden: c !== 'nicht-freigeschaltet' };
}

export interface MappeZeile {
  name: ArtefaktName;
  titel: string;
  href: string;
  vorhanden: boolean;
}

/** Alle Artefakte der Mappe in fester Reihenfolge; was in der Antwort fehlt, gilt als offen. */
export function mappeZeilen(stand: MappeStand): MappeZeile[] {
  return ARTEFAKT_NAMEN.map((name) => ({
    name,
    titel: ARTEFAKTE[name].titel,
    href: `/innolab/methoden/${ARTEFAKTE[name].slug}`,
    vorhanden: stand.artefakte.some((a) => a.name === name && a.vorhanden),
  }));
}
