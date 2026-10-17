// Folien im Beamer: Was ← / → (und T) als Nächstes tun. Ohne DOM, damit testbar (Handler in Layout.astro).
// Reihenfolge vorwärts: zur Folie, falls noch davor → Rest einer zu langen Folie → Schritte aufdecken →
// Auflösung zeigen → nächste Folie → nächste Seite. Rückwärts: Schritte verdecken → vorige Folie →
// Seitenanfang (Titel, Ablauf) → vorige Seite.

export type Weiter = 'hierhin' | 'runter' | 'schritt' | 'aufloesung' | 'folie' | 'seite';
export type Zurueck = 'schritt' | 'folie' | 'anfang' | 'seite';

export function weiter(z: {
  /** Die Folie liegt noch unterhalb (man steht im Seitenkopf darüber). */
  vorDerFolie?: boolean;
  /** Die Folie ist höher als der Bildschirm und reicht noch unter ihn. */
  restUnten?: boolean;
  versteckteSchritte: number;
  offeneAufloesung: boolean;
  naechsteFolie: boolean;
}): Weiter {
  if (z.vorDerFolie) return 'hierhin';
  if (z.versteckteSchritte > 0) return 'schritt';
  if (z.offeneAufloesung) return 'aufloesung';
  if (z.restUnten) return 'runter';
  return z.naechsteFolie ? 'folie' : 'seite';
}

/**
 * Soll eine Taste (←, →, B, T, [) die Folien steuern? Nein bei Wiederholung, bei schon behandelter Taste, bei offenem
 * Dialog oder Vollbild und beim Tippen. Getippt wird in Textfeldern, Auswahllisten, contenteditable und in Feldern, die
 * selbst mit ←/→ arbeiten (Radio, Regler). Ein Haken (Checkbox), ein Knopf oder ein Link behalten nach dem Mausklick den
 * Fokus – dort muss → weiter blättern, sonst bleibt die Folie nach dem Klick stehen.
 * `ziel` ist das fokussierte Element: Tag klein, bei <input> der type, `bearbeitbar` = isContentEditable.
 */
export function tasteSteuertFolien(z: {
  schonBehandelt?: boolean; wiederholt?: boolean; dialogOffen?: boolean; vollbild?: boolean;
  ziel?: { tag: string; typ?: string; bearbeitbar?: boolean };
}): boolean {
  if (z.schonBehandelt || z.wiederholt || z.dialogOffen || z.vollbild) return false;
  const t = z.ziel;
  if (!t) return true;
  if (t.bearbeitbar || t.tag === 'textarea' || t.tag === 'select') return false;
  if (t.tag === 'input') return KEIN_TEXT.has((t.typ ?? 'text').toLowerCase());
  return true;
}
const KEIN_TEXT = new Set(['checkbox', 'button', 'submit', 'reset', 'image', 'file', 'color', 'hidden']);

/** Rückwärts verdeckt nur Schritte wieder; eine gezeigte Auflösung bleibt offen. */
export function zurueck(z: { gezeigteSchritte: number; vorherigeFolie: boolean; kopfDarueber?: boolean }): Zurueck {
  if (z.gezeigteSchritte > 0) return 'schritt';
  if (z.vorherigeFolie) return 'folie';
  return z.kopfDarueber ? 'anfang' : 'seite';
}

/**
 * Aktuelle Folie: die letzte, deren Oberkante (px im Viewport) die Unterkante der Kopfleiste erreicht hat –
 * auch bei einer Folie, die höher als der Bildschirm ist. Liegen alle noch darunter, die erste; ohne Folien -1.
 */
export function aktuelleFolie(oberkanten: number[], kopfleiste: number): number {
  if (oberkanten.length === 0) return -1;
  let i = 0;
  oberkanten.forEach((o, j) => { if (o <= kopfleiste + 4) i = j; });
  return i;
}

/**
 * Taste T auf einer Folie: Gemeint ist der letzte sichtbare Timer (der Schritt, der gerade dran ist). Startet T ihn,
 * werden andere laufende Timer der Folie pausiert – sonst liefe der vorige Schritt unbemerkt weiter. Ohne sichtbaren
 * Timer nichts.
 */
export function timerFuerT(timer: { sichtbar: boolean; laeuft: boolean }[]): { klick: number; pausieren: number[] } | undefined {
  const klick = timer.map((t) => t.sichtbar).lastIndexOf(true);
  if (klick < 0) return undefined;
  const pausieren = timer[klick].laeuft ? [] : timer.flatMap((t, i) => (i !== klick && t.laeuft ? [i] : []));
  return { klick, pausieren };
}

/** Restzeit des Timers als „m:ss“, auf volle Sekunden aufgerundet, nie negativ. */
export function restText(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
