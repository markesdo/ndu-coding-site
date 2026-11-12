// Direktlink in einen Editor: /innolab/mappe?bearbeiten=annahmen öffnet nach dem Laden der Mappe gleich den Editor der
// Annahmen-Map (EditorHuelle), einmal. Rein und getestet; die Hülle entfernt den Parameter danach (history.replaceState).
import { MAPPE_PFAD } from '../../lib/nav-rolle.js';
import { ARTEFAKT_NAMEN, type ArtefaktName } from '../schemas/index.js';

export const BEARBEITEN_PARAM = 'bearbeiten';

/** Der Editor, den die Adresse öffnen will; unbekannte, leere oder fehlende Werte: null. */
export function bearbeitenAusAdresse(suche: string): ArtefaktName | null {
  const wert = new URLSearchParams(suche).get(BEARBEITEN_PARAM);
  return wert !== null && (ARTEFAKT_NAMEN as readonly string[]).includes(wert) ? (wert as ArtefaktName) : null;
}

/** Die Adresse ohne ?bearbeiten – ein Neuladen oder Zurück öffnet den Editor nicht noch einmal. */
export function adresseOhneBearbeiten(pfad: string, suche: string, hash: string): string {
  const p = new URLSearchParams(suche);
  p.delete(BEARBEITEN_PARAM);
  const rest = p.toString();
  return `${pfad}${rest ? `?${rest}` : ''}${hash}`;
}

/** Link für Folien und Texte: öffnet den Editor in der eigenen Mappe. */
export function bearbeitenHref(name: ArtefaktName): string {
  return `${MAPPE_PFAD}?${BEARBEITEN_PARAM}=${name}`;
}

/** Hängt ?bearbeiten an einen Pfad der eigenen Seite (für den Rücksprung nach der Anmeldung). */
export function mitBearbeiten(pfad: string, name: ArtefaktName | null): string {
  if (name === null) return pfad;
  const u = new URL(pfad, 'https://x.invalid');
  u.searchParams.set(BEARBEITEN_PARAM, name);
  return u.pathname + u.search + u.hash;
}

/** Was /innolab/mappe gerade zeigt (MappeUebersicht). */
export type MappeSicht = 'laden' | 'abgemeldet' | 'einrichten' | 'bereit' | 'lehrende' | 'fehler';

/** Darf ?bearbeiten in der Adresse der Mappe stehen bleiben? Nur ein bekannter Wert, und nur solange noch ein Editor
 *  ihn verbrauchen kann: beim Laden, im Einrichten, abgemeldet (für den Rücksprung nach der Anmeldung) und in der
 *  eigenen Mappe, deren Editor ihn beim Öffnen selbst entfernt. Leser der Lehrenden, Fehler oder ein Editor, der gar
 *  nicht dasteht (Leitfaden vor dem Mom Test): sofort weg. */
export function bearbeitenBleibt(suche: string, sicht: MappeSicht, editorDa: (name: ArtefaktName) => boolean = () => true): boolean {
  const name = bearbeitenAusAdresse(suche);
  if (name === null) return false;
  if (sicht === 'bereit') return editorDa(name);
  return sicht === 'laden' || sicht === 'abgemeldet' || sicht === 'einrichten';
}

/** Öffnet die Hülle von selbst? Nur der passende Editor, nicht im Beamer (dort wäre der Dialog unsichtbar). */
export function direktOeffnen(suche: string, name: ArtefaktName, beamer: boolean): boolean {
  return !beamer && bearbeitenAusAdresse(suche) === name;
}
