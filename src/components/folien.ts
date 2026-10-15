// Folien im Beamer: Was ← / → als Nächstes tun. Ohne DOM, damit testbar (Handler in Layout.astro).
// Reihenfolge vorwärts: Schritte der Folie aufdecken → Auflösung zeigen → nächste Folie → nächste Seite.

export type Weiter = 'schritt' | 'aufloesung' | 'folie' | 'seite';
export type Zurueck = 'schritt' | 'folie' | 'seite';

export function weiter(z: { versteckteSchritte: number; offeneAufloesung: boolean; naechsteFolie: boolean }): Weiter {
  if (z.versteckteSchritte > 0) return 'schritt';
  if (z.offeneAufloesung) return 'aufloesung';
  return z.naechsteFolie ? 'folie' : 'seite';
}

/** Rückwärts verdeckt nur Schritte wieder; eine gezeigte Auflösung bleibt offen. */
export function zurueck(z: { gezeigteSchritte: number; vorherigeFolie: boolean }): Zurueck {
  if (z.gezeigteSchritte > 0) return 'schritt';
  return z.vorherigeFolie ? 'folie' : 'seite';
}

/** Index der Folie, deren Oberkante (px im Viewport) am nächsten an der Unterkante der Kopfleiste liegt; ohne Folien -1. */
export function aktuelleFolie(oberkanten: number[], kopfleiste: number): number {
  let beste = -1;
  oberkanten.forEach((o, i) => {
    if (beste < 0 || Math.abs(o - kopfleiste) < Math.abs(oberkanten[beste] - kopfleiste)) beste = i;
  });
  return beste;
}

/** Restzeit des Timers als „m:ss“, auf volle Sekunden aufgerundet, nie negativ. */
export function restText(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
