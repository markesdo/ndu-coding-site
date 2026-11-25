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

// ——— Geometrie im viewBox 0 0 1000 B_HOEHE ———
// Der Sprint ist ein offener Ring (gegen den Uhrzeigersinn, wie im Vorbild): Er beginnt unten, wo die Linie vom
// Product Backlog einläuft, und endet links unten mit einer Pfeilspitze zurück aufs Sprint Planning – der nächste
// Sprint beginnt gleich nach dem vorigen. Winkel in Grad, mathematisch (0° = rechts, 90° = oben).

export const B_BREITE = 1000;
export const B_HOEHE = 500;
export const MITTE = { x: 500, y: 222 };
export const R = 135;
/** Grundlinie: Product Backlog → Sprint Planning → unten in den Ring. */
export const LINIE_Y = MITTE.y + R;
export const RING_ENDE = 226;
export const WINKEL: Record<'daily' | 'inkrement' | 'review' | 'retro', number> = { daily: -22, inkrement: 25, review: 90, retro: 160 };
/** Pfeilspitzen auf dem Ring, jeweils zwischen zwei Stationen. */
export const PFEILE_RING = [-58, 2, 58, 126];
export const PLANNING_X = 420;

export function punkt(grad: number, r = R): { x: number; y: number } {
  const a = (grad * Math.PI) / 180;
  return { x: +(MITTE.x + r * Math.cos(a)).toFixed(1), y: +(MITTE.y - r * Math.sin(a)).toFixed(1) };
}

/** Ring von unten (-90°) gegen den Uhrzeigersinn bis RING_ENDE, als SVG-Pfad. */
export function ringPfad(): string {
  const start = punkt(-90);
  const mitte = punkt(90);
  const ende = punkt(RING_ENDE);
  // Zwei Bögen (je ≤ 180°), sweep 0 = gegen den Uhrzeigersinn auf dem Bildschirm.
  return `M${start.x} ${start.y}A${R} ${R} 0 0 0 ${mitte.x} ${mitte.y}A${R} ${R} 0 0 0 ${ende.x} ${ende.y}`;
}

/** Dreieck als Pfeilspitze an einem Punkt, ausgerichtet in Richtung (dx, dy). */
export function spitze(x: number, y: number, dx: number, dy: number, gr = 13): string {
  const l = Math.hypot(dx, dy);
  const ux = dx / l, uy = dy / l;
  const p = (a: number, b: number) => `${(x + a * ux - b * uy).toFixed(1)},${(y + a * uy + b * ux).toFixed(1)}`;
  return `${p(gr, 0)} ${p(-gr * 0.6, gr * 0.8)} ${p(-gr * 0.6, -gr * 0.8)}`;
}

/** Pfeilspitze auf dem Ring bei grad, in Laufrichtung (gegen den Uhrzeigersinn). */
export function ringSpitze(grad: number): string {
  const { x, y } = punkt(grad);
  const a = (grad * Math.PI) / 180;
  return spitze(x, y, -Math.sin(a), -Math.cos(a));
}

/** Daily-Schleife: kleiner Kreis außen am Ring, berührt ihn bei WINKEL.daily. */
export const DAILY_R = 44;
export function dailyMitte(): { x: number; y: number } {
  return punkt(WINKEL.daily, R + DAILY_R);
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
