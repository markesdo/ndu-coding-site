// Folien im Beamer: Was ← / → als Nächstes tun. Ohne DOM, damit testbar (Handler in Layout.astro).
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

/** Restzeit des Timers als „m:ss“, auf volle Sekunden aufgerundet, nie negativ. */
export function restText(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
