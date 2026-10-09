// „Wo ist Markus?“: Form der Position, Prüfung der Eingabe und Alter als Text – ohne DOM und ohne Vercel, damit testbar.
// Schreiben darf nur der Beamer-Tab mit Präsentator-Schlüssel (api/position.ts), lesen jede angemeldete Person.

export interface Position {
  /** Seite, z. B. „/tag-1“. */
  pfad: string;
  /** Sprungziel ohne „#“, z. B. „uebung-1-b“ oder „mcp-3“; leer = Seitenanfang. */
  anker: string;
  /** Anzeigename, z. B. „Tag 1 · Übung 1 b“. */
  titel: string;
}

/** Nach so langer Funkstille (kein Signal vom Beamer-Tab) wird der Knopf ausgeblendet. */
export const AUSBLENDEN_MS = 30 * 60 * 1000;
/** Ab diesem Alter zeigt der Knopf „· vor N min“. */
export const ALT_MS = 2 * 60 * 1000;

const PFAD = /^\/[a-z0-9/-]{0,80}$/;
const ANKER = /^[a-z0-9-]{0,80}$/;
const STEUERZEICHEN = /[\u0000-\u001f\u007f]/;

/** Eingabe aus dem Netz prüfen: nur bekannte Felder, nur harmlose Zeichen. Ungültig → null. */
export function positionPruefen(roh: unknown): Position | null {
  if (!roh || typeof roh !== 'object') return null;
  const { pfad, anker, titel } = roh as Record<string, unknown>;
  if (typeof pfad !== 'string' || !PFAD.test(pfad) || pfad.includes('//')) return null;
  if (typeof anker !== 'string' || !ANKER.test(anker)) return null;
  if (typeof titel !== 'string' || titel.trim() === '' || titel.length > 120 || STEUERZEICHEN.test(titel)) return null;
  return { pfad, anker, titel: titel.trim() };
}

/** Link zur Position. */
export function positionHref(p: Position): string {
  return p.anker ? `${p.pfad}#${p.anker}` : p.pfad;
}

/**
 * Kam eine Positionsmeldung an, während der Präsentator pausiert oder sich abgemeldet hat? Dann liegt sie evtl. nach dem
 * Löschen auf dem Server und muss noch einmal gelöscht werden – sonst sähen die Studierenden sie bis zu 30 min.
 */
export function nochmalLoeschen(antwortOk: boolean, pausiert: boolean, schluesselNochDa: boolean): boolean {
  return antwortOk && (pausiert || !schluesselNochDa);
}

/** „“ (frisch), „vor 7 min“; null = zu alt, Knopf ausblenden. */
export function alterText(alterMs: number): string | null {
  if (alterMs >= AUSBLENDEN_MS) return null;
  if (alterMs < ALT_MS) return '';
  return `vor ${Math.floor(alterMs / 60000)} min`;
}
