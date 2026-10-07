// Auftakt der Startseite (/start), Regie „Der Cursor läuft“: Zeiten und Entscheidungen als reine Funktionen, ohne DOM –
// damit testbar. Die Idee: Der Mensch tippt (Zeichen für Zeichen, unregelmäßig), dann „Enter“ – und die Buchstaben
// des Auftrags fliegen in die Überschrift. Was der Mensch beschreibt, wird zum Ergebnis.

/** Der getippte Auftrag. Auf schmalen Handys die kurze Fassung, damit er nicht umbricht. */
export const PROMPT_LANG = 'Bau mir eine App, in der Studierende Events anlegen.';
export const PROMPT_KURZ = 'Bau mir eine App für Campus-Events.';

/** Mono-Schrift: ein Zeichen ist 0,6 em breit. */
const ZEICHEN_EM = 0.6;
// „›“ + Leerzeichen + Block-Cursor (0,55em) + dessen Abstand (0,15em) = 1,9em ≈ 3,2 Zeichen; mit Reserve 3,5.
export const EXTRA_ZEICHEN = 3.5;
/**
 * Welcher Auftrag in welcher Größe, damit er sicher in eine Zeile passt: der lange, wenn er in der
 * Wunschgröße passt, sonst der kurze – notfalls etwas kleiner (nie unter `minPx`).
 */
export function promptWahl(verfuegbarPx: number, wunschPx: number, minPx = 11) {
  const breite = (t: string, px: number) => (t.length + EXTRA_ZEICHEN) * ZEICHEN_EM * px;
  if (breite(PROMPT_LANG, wunschPx) <= verfuegbarPx) return { text: PROMPT_LANG, px: wunschPx };
  const px = Math.min(wunschPx, verfuegbarPx / ((PROMPT_KURZ.length + EXTRA_ZEICHEN) * ZEICHEN_EM));
  return { text: PROMPT_KURZ, px: Math.max(minPx, Math.floor(px * 10) / 10) };
}

/**
 * Wohin „Weiter“ führt: zur Übersicht (für alle gleich). Wer im Beamer-Modus kommt (?beamer, nicht ?beamer=0), bleibt darin.
 * Ohne Anmeldung leitet die Middleware von dort zum Kurspasswort weiter und kehrt danach zurück (/login?weiter=%2F…).
 * Spiegelbild des Inline-Skripts in start.astro – Änderungen an beiden Stellen.
 */
export function weiterZiel(suche: string): string {
  const beamer = new URLSearchParams(suche).get('beamer');
  return beamer !== null && beamer !== '0' ? '/?beamer' : '/';
}

/** Regie in Sekunden (Storyboard). Die Sprungmarken der Zeitleiste heißen wie die Schlüssel. */
export const REGIE = {
  /** Allein der große Block-Cursor blinkt. */
  cursorSolo: 0,
  /** „›“ erscheint, der Cursor schrumpft auf Texthöhe. */
  chevron: 0.6,
  /** Tippen beginnt … */
  tippen: 0.9,
  /** … und endet spätestens hier (längere Aufträge werden gestaucht). */
  tippenEnde: 2.4,
  /** Das „Enter“: Licht flackert einmal auf, der Auftrag wird abgeschickt. */
  enter: 2.9,
  /** Die Buchstaben fliegen in die Überschrift. */
  flug: 3.0,
  flugDauer: 0.7,
  /** Größte zufällige Verzögerung einzelner Buchstaben beim Abflug. */
  flugStreuung: 0.25,
  /** Der Cursor landet hinter „AI“, die Dachzeile erscheint. */
  landung: 3.9,
  /** Der Druckkopf läuft: die Einleitung erscheint Wort für Wort. */
  druck: 4.0,
  druckEnde: 5.0,
  /** Die drei Tage werden gedruckt, einer nach dem anderen. */
  tage: 5.0,
  tageAbstand: 0.4,
  /** Pro Tag: Linie zeichnet sich, der Text folgt etwas später. */
  linie: 0.35,
  tagTextVersatz: 0.12,
  tagTextDauer: 0.26,
  /** Endzustand: „› weiter▮“ wartet. Nie automatisch weiter. */
  ende: 6.4,
} as const;

/** Wie lange zwischen Überspringen/Ende und dem ersten zulässigen „Weiter“ mindestens vergeht (ms). */
export const WEITER_SPERRE_MS = 300;
/** Höchstdauer vom Auslösen bis zur Navigation (ms). */
export const AUSGANG_MS = 450;

const TIPP_MS = 32;
const TIPP_STREUUNG = 14;
const KOMMA_PAUSE = 0.18;

/**
 * Zeitpunkte (Sekunden ab Start der Zeitleiste), zu denen die Zeichen des Auftrags erscheinen: unregelmäßig wie
 * ein Mensch, mit Pause nach dem Komma, gestaucht ins Fenster REGIE.tippen … REGIE.tippenEnde.
 * `zufall` liefert Werte in [0, 1).
 */
export function tippZeiten(prompt: string, zufall: () => number = Math.random): number[] {
  const abstaende: number[] = [];
  for (let i = 0; i < prompt.length; i++) {
    let d = (TIPP_MS + (zufall() * 2 - 1) * TIPP_STREUUNG) / 1000;
    if (i > 0 && prompt[i - 1] === ',') d += KOMMA_PAUSE;
    abstaende.push(Math.max(0.006, d));
  }
  const fenster = REGIE.tippenEnde - REGIE.tippen;
  const summe = abstaende.reduce((a, b) => a + b, 0);
  const faktor = summe > fenster ? fenster / summe : 1;
  const zeiten: number[] = [];
  let t = REGIE.tippen;
  for (const d of abstaende) { t += d * faktor; zeiten.push(Math.round(t * 1000) / 1000); }
  return zeiten;
}

/**
 * Welcher Buchstabe des Auftrags in welche Stelle der Überschrift fliegt. Ergebnis: pro Zeichen des Auftrags
 * der Index in `titel` oder null (fliegt nicht – verweht). Regeln, in dieser Reihenfolge:
 * Leerzeichen und Satzzeichen fliegen nie; jedes Ziel bekommt höchstens einen Buchstaben; gleicher Buchstabe
 * (gleiche Schreibung) vor gleichem Buchstaben in anderer Schreibung; unter mehreren Kandidaten der, dessen relative
 * Position im Auftrag der Zielposition in der Überschrift am nächsten liegt (weniger Kreuzungen im Flug).
 * Deterministisch: gleiche Eingabe, gleiches Ergebnis. Ziele ohne Buchstaben erscheinen anders (Scramble).
 */
export function flugZuordnung(prompt: string, titel: string): (number | null)[] {
  const ergebnis: (number | null)[] = Array.from(prompt, () => null);
  const istBuchstabe = (c: string) => /\p{L}/u.test(c);
  const frei = new Set<number>();
  for (let i = 0; i < prompt.length; i++) if (istBuchstabe(prompt[i])) frei.add(i);
  const relP = (i: number) => (prompt.length > 1 ? i / (prompt.length - 1) : 0);
  const relT = (j: number) => (titel.length > 1 ? j / (titel.length - 1) : 0);

  const waehle = (j: number, passt: (c: string) => boolean): boolean => {
    let beste = -1;
    let besterAbstand = Infinity;
    for (const i of frei) {
      if (!passt(prompt[i])) continue;
      const abstand = Math.abs(relP(i) - relT(j));
      if (abstand < besterAbstand || (abstand === besterAbstand && i < beste)) { beste = i; besterAbstand = abstand; }
    }
    if (beste < 0) return false;
    ergebnis[beste] = j;
    frei.delete(beste);
    return true;
  };

  // Erst alle exakten Treffer verteilen, dann die in anderer Schreibung – so verdrängt „p“ nicht das „P“.
  const ziele = Array.from(titel, (c, j) => ({ c, j })).filter(({ c }) => istBuchstabe(c));
  const offen: { c: string; j: number }[] = [];
  for (const { c, j } of ziele) if (!waehle(j, (x) => x === c)) offen.push({ c, j });
  for (const { c, j } of offen) waehle(j, (x) => x.toLowerCase() === c.toLowerCase());
  return ergebnis;
}

/** Ziele der Überschrift, die keinen Buchstaben abbekommen haben (ohne Leerzeichen). */
export function ohneFlug(zuordnung: (number | null)[], titel: string): number[] {
  const belegt = new Set(zuordnung.filter((z): z is number => z !== null));
  const rest: number[] = [];
  for (let j = 0; j < titel.length; j++) if (titel[j].trim() && !belegt.has(j)) rest.push(j);
  return rest;
}

/**
 * Welche Taste was tut, solange die Zeitleiste läuft: Enter vor dem „Enter“ der Regie schickt sofort ab,
 * jede andere Taste (außer Tab und reinen Umschalttasten) springt ans Ende. Danach: nichts (Weiter regelt start.astro).
 */
export function tastenAktion(taste: string, zeit: number): 'abschicken' | 'ueberspringen' | 'ignorieren' {
  // Tab, Umschalttasten und Funktionstasten (F5 lädt neu, F11 Vollbild) bleiben beim Browser.
  if (['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(taste) || /^F\d{1,2}$/.test(taste)) return 'ignorieren';
  if (taste === 'Enter' && zeit < REGIE.enter) return 'abschicken';
  return 'ueberspringen';
}

/** Ist das Ereignis ein „Weiter“ (Enter, Leertaste, Pfeil rechts, Bild ab – das senden Präsentations-Clicker)? */
export const istWeiterTaste = (taste: string) => ['Enter', ' ', 'ArrowRight', 'PageDown'].includes(taste);
