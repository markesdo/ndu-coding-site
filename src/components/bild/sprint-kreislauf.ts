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

export type Rolle = 'po' | 'sm' | 'dev' | 'stakeholder';
/** Abzeichen je Rolle: Kürzel im Bild, Name in der Legende. Stakeholder gehören nicht zum Scrum Team (abgesetzt). */
export const ROLLEN: Record<Rolle, { kurz: string; name: string; team: boolean }> = {
  po: { kurz: 'PO', name: 'Product Owner', team: true },
  sm: { kurz: 'SM', name: 'Scrum Master', team: true },
  dev: { kurz: 'Dev', name: 'Developers', team: true },
  stakeholder: { kurz: 'Stakeholder', name: 'Stakeholder', team: false },
};
/**
 * Wer an welchem Event teilnimmt (Scrum Guide 2020): Planning „The whole Scrum Team“ (S. 8); Daily „a 15-minute event
 * for the Developers“ (S. 9); Review: das Scrum Team mit „key stakeholders“ (S. 9); Retrospektive: das Scrum Team (S. 10).
 */
export const TEILNAHME: Record<'planning' | 'daily' | 'review' | 'retro', Rolle[]> = {
  planning: ['po', 'sm', 'dev'],
  daily: ['dev'],
  review: ['po', 'sm', 'dev', 'stakeholder'],
  retro: ['po', 'sm', 'dev'],
};
/** Nur im Handout: wann Product Owner oder Scrum Master beim Daily dabei sind (Wortlaut wie auf scrum.astro, S. 9). */
export const DAILY_HINWEIS = 'Product Owner oder Scrum Master nehmen teil, wenn sie selbst an Einträgen des Sprint Backlogs arbeiten – „they participate as Developers“.';
/** Rechte Ringseite (statt „Implementation“ im Vorbild); das Inkrement geht gleich daneben ab. Guide S. 5: Developers
 * „are committed to creating any aspect of a usable Increment each Sprint“. */
export const BAUEN = 'Developers bauen';

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
// Der Sprint ist ein dickes, offenes Stadion (zwei Halbkreise, oben und unten gerade), gegen den Uhrzeigersinn wie im
// Vorbild: Unten ist die Gerade das Sprint Planning; von dort geht es rechts hoch (Developers bauen), oben nach links
// (Sprint Review), links hinunter (Retrospektive), und die große Pfeilspitze am Ende zeigt flach von links auf den
// Planning-Balken – der nächste Sprint beginnt gleich nach dem vorigen. Winkel in Grad, mathematisch (0° = rechts,
// 90° = oben), jeweils um die Mitte des rechten oder linken Halbkreises.

export const B_BREITE = 1000;
export const B_HOEHE = 520;
export const MITTE = { x: 500, y: 228 };
export const R = 140;
/** Länge der Geraden oben und unten. */
export const GERADE = 200;
export const RECHTS = { x: MITTE.x + GERADE / 2, y: MITTE.y };
export const LINKS = { x: MITTE.x - GERADE / 2, y: MITTE.y };
/** Stärke des Rings und des Planning-Balkens. */
export const RING_B = 34;
export const BALKEN_Y = MITTE.y + R;
export const OBEN_Y = MITTE.y - R;
/** Ende des Rings auf dem linken Halbkreis, kurz vor der Unterkante: Die Pfeilspitze liegt fast waagrecht. */
export const RING_ENDE = 265;
export const END_SPITZE = 30;
export const RETRO = { mitte: 180, halb: 45 };
export const INKREMENT_WINKEL = -15;
/**
 * Textbogen rechts, frei von der Daily-Schleife: gegen den Uhrzeigersinn, also von unten nach oben – unten steht die
 * Schrift aufrecht, oben um 90° gedreht wie „Retrospektive“ links. Im Uhrzeigersinn stünde sie unten kopfüber.
 */
export const BAUEN_BOGEN = { von: -82, bis: 22, gegen: true };

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
 * Uhrzeigersinn (so laufen Textpfade, damit Schrift links von unten nach oben und rechts von oben nach unten liest).
 */
export function bogen(a1: number, a2: number, r = R, m = MITTE, gegen = true): string {
  const p1 = punkt(a1, r, m), p2 = punkt(a2, r, m);
  const spanne = Math.abs(a2 - a1);
  return `M${p1.x} ${p1.y}A${r} ${r} 0 ${spanne > 180 ? 1 : 0} ${gegen ? 0 : 1} ${p2.x} ${p2.y}`;
}

/**
 * Richtung „oben“ der Buchstaben auf einem Textbogen bei grad (Bildschirmkoordinaten, y nach unten). gegen = Laufrichtung
 * des Textpfads. y nahe 1 heißt: die Buchstaben stehen kopfüber.
 */
export function schriftOben(grad: number, gegen: boolean): { x: number; y: number } {
  const a = (grad * Math.PI) / 180;
  const d = gegen ? { x: -Math.sin(a), y: -Math.cos(a) } : { x: Math.sin(a), y: Math.cos(a) };
  return { x: +d.y.toFixed(3), y: +(-d.x).toFixed(3) };
}

/** Der Ring ohne Planning-Balken: rechts hoch, oben nach links, links hinunter bis RING_ENDE. */
export function ringPfad(): string {
  const ende = punkt(RING_ENDE, R, LINKS);
  return `M${RECHTS.x} ${BALKEN_Y}A${R} ${R} 0 0 0 ${RECHTS.x} ${OBEN_Y}H${LINKS.x}A${R} ${R} 0 0 0 ${ende.x} ${ende.y}`;
}

/** Dreieck als Pfeilspitze: Spitze gr vor (x, y), Basis 0,6·gr dahinter, Breite 1,6·gr, ausgerichtet nach (dx, dy). */
export function spitze(x: number, y: number, dx: number, dy: number, gr = 13): string {
  const l = Math.hypot(dx, dy);
  const ux = dx / l, uy = dy / l;
  const p = (a: number, b: number) => `${(x + a * ux - b * uy).toFixed(1)},${(y + a * uy + b * ux).toFixed(1)}`;
  return `${p(gr, 0)} ${p(-gr * 0.6, gr * 0.8)} ${p(-gr * 0.6, -gr * 0.8)}`;
}

/** Große Pfeilspitze am Ringende; ihre Basis sitzt genau am Ende des Rings. */
export function endSpitze(gr = END_SPITZE): string {
  const e = punkt(RING_ENDE, R, LINKS), t = tangente(RING_ENDE);
  return spitze(e.x + t.x * gr * 0.6, e.y + t.y * gr * 0.6, t.x, t.y, gr);
}

/** Der Planning-Balken beginnt knapp hinter der Spitze des Ringendes und läuft bis zum rechten Halbkreis. */
export function balkenStart(): number {
  const [x] = endSpitze().split(' ')[0].split(',').map(Number);
  return Math.round(x + 6);
}

/** Daily-Schleife: eigener kleiner Ring außen oben rechts, wie im Vorbild. */
export const DAILY = { winkel: 40, abstand: R + 62, r: 58, b: 28 };
export function dailyMitte(): { x: number; y: number } {
  return punkt(DAILY.winkel, DAILY.abstand, RECHTS);
}
/** Winkel (um die Schleifenmitte), an dem die Schleife den großen Ring berührt. */
export function dailyBeruehrung(): number {
  const d = dailyMitte();
  return (Math.atan2(-(RECHTS.y - d.y), RECHTS.x - d.x) * 180) / Math.PI + 360;
}

/** Breite eines Rollen-Abzeichens (Icon + Kürzel). */
export function abzeichenBreite(rolle: Rolle): number {
  return { po: 66, sm: 66, dev: 74, stakeholder: 156 }[rolle];
}
export const ABZEICHEN_H = 30;
export const ABZEICHEN_ABSTAND = 6;

/** Teilnehmende eines Events als Text, z. B. „Product Owner, Scrum Master und Developers“. */
export function wer(event: keyof typeof TEILNAHME): string {
  const namen = TEILNAHME[event].map((r) => ROLLEN[r].name);
  return namen.length === 1 ? namen[0] : `${namen.slice(0, -1).join(', ')} und ${namen.at(-1)}`;
}

/** Alt-Text des Bildes, aus denselben Daten wie die Beschriftung. */
export function beschreibung(takt?: string): string {
  const [pb, sb, ink] = ARTEFAKTE;
  const [planning, daily, review, retro] = EVENTS;
  return [
    `Der Sprint-Kreislauf nach dem Scrum Guide 2020. Links unten das ${pb.name} mit seiner Verpflichtung, dem ${pb.verpflichtung}.`,
    `Daraus wählt das ${planning.name} (${planning.sub}; dabei: ${wer('planning')}) die Arbeit für den ${SPRINT.name} (${takt ?? SPRINT.sub}): das ${sb.name} mit dem ${sb.verpflichtung}.`,
    `Im Sprint als Ring: täglich das ${daily.name} (dabei: ${wer('daily')}), eine kleine Schleife alle 24 Stunden; die ${BAUEN} das ${ink.name}, verpflichtet auf die ${ink.verpflichtung}.`,
    `Dann das ${review.name}, eine ${review.sub} (dabei: ${wer('review')}), und die ${retro.name} (dabei: ${wer('retro')}); danach beginnt der nächste Sprint mit dem nächsten Planning.`,
  ].join(' ');
}
