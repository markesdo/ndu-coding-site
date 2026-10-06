// Auftakt der Übersicht: Zeitplan und Entscheidungen als reine Funktionen, ohne DOM – damit testbar.
// Die Idee: Der Mensch tippt (Zeichen für Zeichen, unregelmäßig), die Maschine setzt Stücke (Tokens, schnell und gleichmäßig).

/** Gesamtdauer, die der Auftakt nie überschreitet (ms). */
export const AUFTAKT_MAX = 3800;

/** Der getippte Auftrag. Auf schmalen Handys die kurze Fassung, damit er nicht umbricht. */
export const PROMPT_LANG = 'Bau mir eine App, in der Studierende Events anlegen.';
export const PROMPT_KURZ = 'Bau mir eine App für Campus-Events.';
export const promptFuer = (breite: number) => (breite < 480 ? PROMPT_KURZ : PROMPT_LANG);

/**
 * Soll der Auftakt laufen, und soll sich der Browser das merken?
 * ?intro erzwingt ihn (für den Beamer), merkt ihn aber nie. Reduzierte Bewegung hat immer Vorrang.
 * Spiegelbild des Inline-Skripts in index.astro – Änderungen an beiden Stellen.
 */
export function auftaktStatus(o: { suche: string; gesehen: boolean; reduziert: boolean }) {
  if (o.reduziert) return { spielen: false, merken: false };
  if (new URLSearchParams(o.suche).has('intro')) return { spielen: true, merken: false };
  if (o.gesehen) return { spielen: false, merken: false };
  return { spielen: true, merken: true };
}

/** Die Überschrift in Stücken, wie ein Modell sie ausgibt. Unbekannter Text: Wort für Wort. */
export function tokens(text: string): string[] {
  if (text === 'Programmieren mit AI') return ['Program', 'mieren', ' mit', ' A', 'I'];
  return text.match(/\s*\S+/g) ?? [text];
}

/** Wörter (mit vorangestelltem Leerraum), aus denen der Einleitungssatz Stück für Stück entsteht. */
export const woerter = (text: string): string[] => text.match(/\s*\S+/g) ?? [];

export interface Zeitplan {
  /** Zeitpunkt (ms), zu dem Zeichen i des Auftrags erscheint. */
  tipp: number[];
  /** Der Auftrag verschwindet, die Überschrift beginnt zu landen. */
  wechsel: number;
  h1: number[];
  eyebrow: number;
  lead: number[];
  /** Pro Tag: Beginn der Linie; der Text folgt TAG_TEXT_VERSATZ später. */
  tage: number[];
  ende: number;
}

export const START = 100;
const TIPP_FENSTER = 1400; // Tippen endet spätestens bei START + 1400 ms
const TIPP_MS = 28;
const TIPP_STREUUNG = 12;
const KOMMA_PAUSE = 180;
export const HALTEN = 400; // einmal blinken: das „Nachdenken“
/** Der Auftrag blendet so schnell aus, dass er die landende Überschrift kaum überlappt. */
export const WECHSEL_MS = 200;
const H1_VERSATZ = 150;
export const LANDEN_MS = 220;
const H1_ABSTAND = 60;
const LEAD_START = 300;
const LEAD_FENSTER = 800;
export const LINIE_MS = 350;
export const TAG_TEXT_VERSATZ = 120;
export const TAG_TEXT_MS = 260;
const TAGE_ABSTAND = 120;

/**
 * Zeitplan für Auftrag, Überschrift, Einleitung und Tage. `zufall` liefert Werte in [0, 1).
 * Langes Tippen wird in das Tipp-Fenster gestaucht, deshalb bleibt das Ende immer ≤ AUFTAKT_MAX.
 */
export function zeitplan(o: { prompt: string; h1Tokens: number; leadWoerter: number; tage: number; zufall?: () => number }): Zeitplan {
  const zufall = o.zufall ?? Math.random;
  const abstaende: number[] = [];
  for (let i = 0; i < o.prompt.length; i++) {
    let d = TIPP_MS + (zufall() * 2 - 1) * TIPP_STREUUNG;
    if (i > 0 && o.prompt[i - 1] === ',') d += KOMMA_PAUSE;
    abstaende.push(Math.max(6, d));
  }
  const summe = abstaende.reduce((a, b) => a + b, 0);
  const faktor = summe > TIPP_FENSTER ? TIPP_FENSTER / summe : 1;
  const tipp: number[] = [];
  let t = START;
  for (const d of abstaende) { t += d * faktor; tipp.push(Math.round(t)); }

  const wechsel = (tipp.at(-1) ?? START) + HALTEN;
  const h1 = Array.from({ length: o.h1Tokens }, (_, i) => wechsel + H1_VERSATZ + i * H1_ABSTAND);
  const eyebrow = wechsel + LEAD_START;
  const leadAbstand = o.leadWoerter > 1 ? Math.min(32, LEAD_FENSTER / o.leadWoerter) : 0;
  const lead = Array.from({ length: o.leadWoerter }, (_, i) => Math.round(eyebrow + i * leadAbstand));
  const tageStart = eyebrow + LEAD_FENSTER;
  const tage = Array.from({ length: o.tage }, (_, i) => tageStart + i * TAGE_ABSTAND);
  const ende = Math.max(
    (h1.at(-1) ?? wechsel) + LANDEN_MS,
    (lead.at(-1) ?? eyebrow) + LANDEN_MS,
    tage.length ? tage.at(-1)! + TAG_TEXT_VERSATZ + TAG_TEXT_MS : 0,
  );
  return { tipp, wechsel, h1, eyebrow, lead, tage, ende };
}
