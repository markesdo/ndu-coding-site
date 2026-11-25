// SprintKreislauf.astro: Begriffe, Aufdeck-Reihenfolge und Geometrie des Sprint-Kreislaufs. Ohne DOM, damit testbar.
// Begriffe wie auf /innolab/methoden/scrum (Scrum Guide 2020): Verantwortlichkeiten statt Rollen, Developers statt
// Development Team, Review als Arbeitssitzung (keine Demo), je Artefakt eine Verpflichtung.

export type Teil = 'product-backlog' | 'planning' | 'sprint-backlog' | 'sprint' | 'daily' | 'inkrement' | 'review' | 'retro';

export interface Event { id: Teil; name: string; sub: string }
export interface Artefakt { id: Teil; name: string; verpflichtung: string }

/** Die vier Events im Sprint, in zeitlicher Reihenfolge. Unterzeilen wie die Fluss-Leiste auf scrum.astro. */
export const EVENTS: Event[] = [
  { id: 'planning', name: 'Sprint Planning', sub: 'Warum? Was? Wie?' },
  { id: 'daily', name: 'Daily Scrum', sub: '15 Minuten, Plan für heute' },
  { id: 'review', name: 'Sprint Review', sub: 'Arbeitssitzung mit Stakeholdern' },
  { id: 'retro', name: 'Retrospektive', sub: 'Wie werden wir besser?' },
];

/** Die drei Artefakte, je mit ihrer Verpflichtung (Guide S. 10–12, Handout-Tabelle auf scrum.astro). */
export const ARTEFAKTE: Artefakt[] = [
  { id: 'product-backlog', name: 'Product Backlog', verpflichtung: 'Produktziel' },
  { id: 'sprint-backlog', name: 'Sprint Backlog', verpflichtung: 'Sprint-Ziel' },
  { id: 'inkrement', name: 'Inkrement', verpflichtung: 'Definition of Done' },
];

export const SPRINT = { name: 'Sprint', sub: 'höchstens ein Monat' };
export const VERANTWORTLICHKEITEN = ['Product Owner', 'Scrum Master', 'Developers'];

/**
 * Aufdeck-Gruppen in der Reihenfolge, in der sie am Beamer per → erscheinen (und im Quelltext stehen müssen):
 * erst das Backlog, dann der Weg einmal durch den Sprint, zuletzt das Ergebnis.
 */
export const SCHRITTE: Teil[][] = [
  ['product-backlog'],
  ['planning', 'sprint-backlog'],
  ['sprint', 'daily'],
  ['inkrement'],
  ['review'],
  ['retro'],
];

export const TEILE: Teil[] = SCHRITTE.flat();

/** hervor: ein Teil oder mehrere; ein Tippfehler soll beim Bauen auffallen, nicht als Folie ohne Hervorhebung. */
export function pruefeHervor(hervor: string | string[] | undefined): Teil[] {
  const liste = hervor === undefined ? [] : Array.isArray(hervor) ? hervor : [hervor];
  for (const h of liste) {
    if (!TEILE.includes(h as Teil)) throw new Error(`SprintKreislauf: hervor „${h}“ unbekannt (erlaubt: ${TEILE.join(', ')})`);
  }
  return liste as Teil[];
}

/** aufdecken: so viele Gruppen sofort sichtbar (0–6), die übrigen per →. Ohne Angabe ist alles sofort da. */
export function pruefeAufdecken(aufdecken: number | undefined): void {
  if (aufdecken === undefined) return;
  if (!Number.isInteger(aufdecken) || aufdecken < 0 || aufdecken > SCHRITTE.length) {
    throw new Error(`SprintKreislauf: aufdecken muss 0–${SCHRITTE.length} sein, war ${aufdecken}`);
  }
}

// ——— Geometrie im viewBox 0 0 B_BREITE B_HOEHE ———
// Der Sprint ist ein dicker, offener Ring (gegen den Uhrzeigersinn, wie im Vorbild): Das Sprint Planning ist der
// Balken, der unten einläuft; der Ring endet links unten mit einer großen Pfeilspitze zurück aufs Planning – der
// nächste Sprint beginnt gleich nach dem vorigen. Event-Namen stehen auf dem Ring. Winkel in Grad, mathematisch
// (0° = rechts, 90° = oben).

export const B_BREITE = 1000;
export const B_HOEHE = 520;
export const MITTE = { x: 540, y: 238 };
export const R = 150;
/** Stärke des Rings und des Planning-Balkens. */
export const RING_B = 34;
/** Unterkante des Rings = Höhe des Planning-Balkens. */
export const BALKEN_Y = MITTE.y + R;
export const RING_ENDE = 205;
/** Wo die Namen auf dem Ring stehen (Mitte, halbe Breite des Bogens) und wo das Inkrement abgeht. */
export const BOGEN: Record<'review' | 'retro', { mitte: number; halb: number }> = { review: { mitte: 90, halb: 30 }, retro: { mitte: 162, halb: 30 } };
export const INKREMENT_WINKEL = -12;
/** Kleine Winkelpfeile auf dem Ring, zwischen den Namen. */
export const WINKELPFEILE = [-52, 14, 126];

export function punkt(grad: number, r = R, m = MITTE): { x: number; y: number } {
  const a = (grad * Math.PI) / 180;
  return { x: +(m.x + r * Math.cos(a)).toFixed(1), y: +(m.y - r * Math.sin(a)).toFixed(1) };
}

/** Laufrichtung gegen den Uhrzeigersinn bei grad (Bildschirmkoordinaten). */
export function tangente(grad: number): { x: number; y: number } {
  const a = (grad * Math.PI) / 180;
  return { x: -Math.sin(a), y: -Math.cos(a) };
}

/**
 * Bogen von a1 nach a2 (Grad). gegen = true: gegen den Uhrzeigersinn (Laufrichtung des Sprints), sonst im
 * Uhrzeigersinn (so laufen Textpfade, damit Schrift oben von links nach rechts und links von unten nach oben liest).
 */
export function bogen(a1: number, a2: number, r = R, m = MITTE, gegen = true): string {
  const p1 = punkt(a1, r, m), p2 = punkt(a2, r, m);
  const spanne = Math.abs(a2 - a1);
  return `M${p1.x} ${p1.y}A${r} ${r} 0 ${spanne > 180 ? 1 : 0} ${gegen ? 0 : 1} ${p2.x} ${p2.y}`;
}

/** Ring von unten (-90°) gegen den Uhrzeigersinn bis RING_ENDE (zwei Bögen, je ≤ 180°). */
export function ringPfad(): string {
  const ende = punkt(RING_ENDE);
  return `${bogen(-90, 90)}A${R} ${R} 0 0 0 ${ende.x} ${ende.y}`;
}

/** Dreieck als Pfeilspitze: Spitze gr vor (x, y), Basis 0,6·gr dahinter, Breite 1,6·gr, ausgerichtet nach (dx, dy). */
export function spitze(x: number, y: number, dx: number, dy: number, gr = 13): string {
  const l = Math.hypot(dx, dy);
  const ux = dx / l, uy = dy / l;
  const p = (a: number, b: number) => `${(x + a * ux - b * uy).toFixed(1)},${(y + a * uy + b * ux).toFixed(1)}`;
  return `${p(gr, 0)} ${p(-gr * 0.6, gr * 0.8)} ${p(-gr * 0.6, -gr * 0.8)}`;
}

/** Große Pfeilspitze am Ringende; ihre Basis sitzt genau am Ende des Rings. */
export function endSpitze(gr = 38): string {
  const e = punkt(RING_ENDE), t = tangente(RING_ENDE);
  return spitze(e.x + t.x * gr * 0.6, e.y + t.y * gr * 0.6, t.x, t.y, gr);
}

/** Winkelpfeil (Chevron) auf dem Ring bei grad, in Laufrichtung. */
export function winkelpfeil(grad: number, gr = 8): string {
  const p = punkt(grad), t = tangente(grad);
  const a = (grad * Math.PI) / 180, n = { x: Math.cos(a), y: -Math.sin(a) };
  const f = (u: number, v: number) => `${(p.x + t.x * u + n.x * v).toFixed(1)},${(p.y + t.y * u + n.y * v).toFixed(1)}`;
  return `${f(-gr * 0.6, gr)} ${f(gr * 0.6, 0)} ${f(-gr * 0.6, -gr)}`;
}

/** Daily-Schleife: eigener kleiner Ring außen oben rechts, wie im Vorbild. */
export const DAILY = { winkel: 38, abstand: R + 62, r: 58, b: 28 };
export function dailyMitte(): { x: number; y: number } {
  return punkt(DAILY.winkel, DAILY.abstand);
}
/** Winkel (um die Schleifenmitte), an dem die Schleife den großen Ring berührt. */
export function dailyBeruehrung(): number {
  const d = dailyMitte();
  return (Math.atan2(-(MITTE.y - d.y), MITTE.x - d.x) * 180) / Math.PI + 360;
}

/** Alt-Text des Bildes, aus denselben Daten wie die Beschriftung. */
export function beschreibung(takt?: string): string {
  const [pb, sb, ink] = ARTEFAKTE;
  const [planning, daily, review, retro] = EVENTS;
  return [
    `Der Sprint-Kreislauf nach dem Scrum Guide 2020. Links das ${pb.name} mit seiner Verpflichtung, dem ${pb.verpflichtung}.`,
    `Daraus wählt das ${planning.name} (${planning.sub}) die Arbeit für den ${SPRINT.name} (${takt ?? SPRINT.sub}): das ${sb.name} mit dem ${sb.verpflichtung}.`,
    `Im Sprint als Kreis: täglich das ${daily.name}, eine kleine Schleife alle 24 Stunden; daraus entsteht das ${ink.name}, verpflichtet auf die ${ink.verpflichtung}.`,
    `Dann das ${review.name}, eine ${review.sub}, und die ${retro.name}; danach beginnt der nächste Sprint mit dem nächsten Planning.`,
  ].join(' ');
}
