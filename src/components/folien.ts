// Folien im Beamer: Was ← / → (und T) als Nächstes tun. Ohne DOM, damit testbar (Handler in Layout.astro).
// Reihenfolge vorwärts: Seitenkopf zu Ende lesen, dann zur Folie → Schritte aufdecken → Auflösung zeigen → Rest einer zu
// langen Folie → nächste Folie (oder data-weiter / data-ende der Folie) → nächste Seite. Rückwärts: Schritte verdecken →
// vorige Folie → Seitenanfang (Titel, Ablauf) → vorige Seite.
//
// Wo man steht (lage), misst Layout.astro an der aktuellen Folie (aktuelleFolie):
// - 'vor':   ihre Oberkante liegt noch unter der Kopfleiste – man liest den Seitenkopf (Titel, Ablauf, Hinweise).
// - 'auf':   sie füllt den Bildschirm (oder ein Teil von ihr).
// - 'unter': sie liegt ganz über dem Bildschirm – man liest Handout-Text nach ihr (etwa #faden auf Tag 4).
// Regel für 'vor' und 'unter': → handelt nie für eine Folie, die man nicht sieht (keine Schritte, kein data-weiter). Es
// geht zur nächsten Folie, sobald deren Oberkante im Bildschirm liegt; sonst einen Bildschirm weiter, damit kein Text
// übersprungen wird. Nach der letzten Folie bis zum Seitenende, dann gilt das Ende der letzten Folie. ← springt von
// 'unter' auf diese Folie selbst (nicht auf die davor).

export type Weiter = 'hierhin' | 'runter' | 'schritt' | 'aufloesung' | 'folie' | 'sprung' | 'ende' | 'seite';
export type Zurueck = 'schritt' | 'hierhin' | 'folie' | 'anfang' | 'seite';
export type Lage = 'vor' | 'auf' | 'unter';

export function weiter(z: {
  /** Fehlt: 'auf'. */
  lage?: Lage;
  /** 'vor': Oberkante dieser Folie, 'unter': Oberkante der nächsten liegt noch unter dem Bildschirm. */
  zielUnterhalb?: boolean;
  /** Unter dem Bildschirm kommt noch Seite (zählt für 'unter' ohne nächste Folie). */
  seiteRestUnten?: boolean;
  /** Die Folie ist höher als der Bildschirm und reicht noch unter ihn. */
  restUnten?: boolean;
  versteckteSchritte: number;
  offeneAufloesung: boolean;
  naechsteFolie: boolean;
  /** Folie mit data-weiter: an ihrem Ende dorthin statt zur nächsten Folie oder Seite. */
  sprung?: boolean;
  /** Folie mit data-ende: an ihrem Ende passiert nichts mehr (Ende des Kurstags). */
  ende?: boolean;
}): Weiter {
  const lage = z.lage ?? 'auf';
  const amEnde = (): Weiter => (z.ende ? 'ende' : z.sprung ? 'sprung' : 'seite');
  if (lage === 'vor') return z.zielUnterhalb ? 'runter' : 'hierhin';
  if (lage === 'unter') {
    if (z.naechsteFolie) return z.zielUnterhalb ? 'runter' : 'folie';
    return z.seiteRestUnten ? 'runter' : amEnde();
  }
  if (z.versteckteSchritte > 0) return 'schritt';
  if (z.offeneAufloesung) return 'aufloesung';
  if (z.restUnten) return 'runter';
  if (z.ende) return 'ende';
  if (z.sprung) return 'sprung';
  return z.naechsteFolie ? 'folie' : 'seite';
}

/**
 * Wie weit „runter“ scrollt (px): ein Bildschirm unter der Kopfleiste, mit 48 px Überlappung – aber nie weiter als bis
 * zum nächsten Halt (rest: Abstand vom unteren Bildschirmrand bis zur Oberkante der nächsten Folie, zum Ende einer zu
 * langen Folie oder zum Seitenende). Dort steht der Halt genau am unteren Rand: Alles davor war zu sehen, und Chrome
 * rastet nicht ein (beamer.css, scroll-snap proximity) – ragte die Folie ein Stück in den Bildschirm, zöge das Einrasten
 * sie hoch und der Text darüber wäre übersprungen.
 */
export function runterUm({ fensterHoehe, kopfleiste, rest }: { fensterHoehe: number; kopfleiste: number; rest: number }): number {
  return Math.max(0, Math.min(fensterHoehe - kopfleiste - 48, rest));
}

/** Was am fokussierten Element für „wird hier getippt?“ zählt: Tag klein ('' ohne Element), bei <input> der type. */
export type TastenZiel = { tag: string; typ?: string; bearbeitbar: boolean };

/**
 * Fokussiertes Element (bei Tastendruck: `e.composedPath()[0] ?? e.target`) → TastenZiel. `bearbeitbar` auch, wenn ein
 * Vorfahre contenteditable ist. Ohne Element (null) ist es kein Tippen.
 */
export function tastenZiel(el: {
  tagName?: string; type?: string; isContentEditable?: boolean; closest?: (selektor: string) => unknown;
} | null | undefined): TastenZiel {
  if (!el) return { tag: '', bearbeitbar: false };
  const bearbeitbar = !!el.isContentEditable || !!el.closest?.('[contenteditable]:not([contenteditable="false"])');
  return { tag: (el.tagName ?? '').toLowerCase(), typ: el.type, bearbeitbar };
}

/**
 * Soll eine Taste (←, →, B, T, [) die Folien steuern? Nein bei Wiederholung, bei schon behandelter Taste, bei offenem
 * Dialog oder Vollbild und beim Tippen. Getippt wird in Textfeldern, Auswahllisten, contenteditable und in Feldern, die
 * selbst mit ←/→ arbeiten (Radio, Regler). Ein Haken (Checkbox), ein Knopf oder ein Link behalten nach dem Mausklick den
 * Fokus – dort muss → weiter blättern, sonst bleibt die Folie nach dem Klick stehen.
 */
export function tasteSteuertFolien(z: {
  schonBehandelt?: boolean; wiederholt?: boolean; dialogOffen?: boolean; vollbild?: boolean; ziel: TastenZiel;
}): boolean {
  if (z.schonBehandelt || z.wiederholt || z.dialogOffen || z.vollbild) return false;
  const t = z.ziel;
  if (t.bearbeitbar || t.tag === 'textarea' || t.tag === 'select') return false;
  if (t.tag === 'input') return KEIN_TEXT.has((t.typ ?? 'text').toLowerCase());
  return true;
}
const KEIN_TEXT = new Set(['checkbox', 'button', 'submit', 'reset', 'image', 'file', 'color', 'hidden']);

/** Rückwärts verdeckt nur Schritte wieder; eine gezeigte Auflösung bleibt offen. Unter der Folie (lage 'unter'): zurück
 *  auf sie selbst – nicht auf die davor, sonst fehlte sie beim Zurückblättern. Im Seitenkopf ('vor') zählen ihre Schritte nicht. */
export function zurueck(z: { gezeigteSchritte: number; vorherigeFolie: boolean; kopfDarueber?: boolean; lage?: Lage }): Zurueck {
  if (z.lage === 'unter') return 'hierhin';
  if (z.lage !== 'vor' && z.gezeigteSchritte > 0) return 'schritt';
  if (z.lage !== 'vor' && z.vorherigeFolie) return 'folie';
  return z.kopfDarueber ? 'anfang' : 'seite';
}

/** Lage zur aktuellen Folie aus ihrem Rand (px im Viewport): darunter, wenn ihre Unterkante die Kopfleiste nicht mehr
 *  erreicht; davor, wenn ihre Oberkante noch darunter liegt. 4 px Spiel für Rundung. */
export function lageZurFolie(rand: { top: number; bottom: number }, kopfleiste: number): Lage {
  if (rand.bottom <= kopfleiste + 4) return 'unter';
  if (rand.top > kopfleiste + 4) return 'vor';
  return 'auf';
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
