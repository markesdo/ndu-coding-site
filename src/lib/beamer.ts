// Beamer-Modus zur Laufzeit umschalten – eine Regel für Layout.astro (Knopf „Beamer“, Taste B), wo-ist.ts (Abmelden) und die
// Startseiten-Knöpfe „Beamer starten“ / „Beamer beenden“ (PraesentatorEinstieg.astro). Wer Präsentator ist, entscheidet
// html[data-ist-praesentator]: das setzt BeamerStart.astro vor dem ersten Zeichnen aus dem Schlüssel im localStorage; danach
// halten es wo-ist.ts (Seiten mit Layout) und PraesentatorEinstieg.astro (storage-Ereignis, auch auf /start) nach.

/** localStorage-Schlüssel des Präsentators (gesetzt auf /praesentator, wo-ist.ts). BeamerStart.astro (is:inline) nennt ihn wörtlich. */
export const PRAESENTATOR_SCHLUESSEL = 'ndu-presenter';
/** Gemerkter Beamer-Modus (nur beim Präsentator). */
export const BEAMER_SCHLUESSEL = 'ndu-beamer';

/** Das Nötigste von document.documentElement – so laufen die Tests ohne DOM. */
export type Wurzel = Pick<Element, 'hasAttribute' | 'toggleAttribute' | 'setAttribute' | 'removeAttribute'>;
export type Speicher = Pick<Storage, 'setItem' | 'removeItem'>;

/** localStorage, falls erreichbar (privates Fenster, gesperrte Website-Daten, Tests ohne DOM: undefined). */
export function sichererSpeicher(): Storage | undefined {
  try { return globalThis.localStorage ?? undefined; } catch { return undefined; }
}

/** Liegt der Präsentator-Schlüssel in diesem Browser? */
export function praesentatorAngemeldet(speicher: Pick<Storage, 'getItem'> | undefined = sichererSpeicher()): boolean {
  try { return Boolean(speicher?.getItem(PRAESENTATOR_SCHLUESSEL)); } catch { return false; }
}

/** Beamer an oder aus. Einschalten nur beim Präsentator (Regel in BeamerStart.astro), ausschalten immer.
 *  hell: Beamer heißt helles Thema; /start hat ein eigenes dunkles Farbschema und bleibt dabei.
 *  Gibt zurück, ob umgeschaltet wurde – ohne Schlüssel bleibt alles, wie es ist, auch wenn jemand den Knopf per DevTools einblendet. */
export function beamerSchalten(
  root: Wurzel,
  an: boolean,
  { hell = true, speicher = sichererSpeicher() }: { hell?: boolean; speicher?: Speicher } = {},
): boolean {
  if (an && !root.hasAttribute('data-ist-praesentator')) return false;
  root.toggleAttribute('data-beamer', an);
  if (hell) { if (an) root.setAttribute('data-theme', 'light'); else root.removeAttribute('data-theme'); }
  try { if (an) speicher?.setItem(BEAMER_SCHLUESSEL, '1'); else speicher?.removeItem(BEAMER_SCHLUESSEL); } catch {}
  return true;
}

/** start: /start (ohne Layout, eigenes dunkles Farbschema, kein anderer Knopf zum Ausschalten); layout: Seite mit Layout.astro. */
export type Seitenart = 'start' | 'layout';
type Lage = { praesentator: boolean; beamer: boolean; seite: Seitenart };

/** Was unten auf /start und /innolab steht. Präsentator: „Beamer starten“, sonst der Link „Präsentator“.
 *  Im Beamer-Modus auf Layout-Seiten nichts (dort gibt es den Knopf „Beamer“ und Taste B); auf /start „Beamer beenden“ –
 *  auch ohne Schlüssel (in einem anderen Tab abgemeldet), denn ausschalten muss immer gehen. */
export function einstieg({ praesentator, beamer, seite }: Lage): 'starten' | 'beenden' | 'link' | 'nichts' {
  if (beamer) return seite === 'start' ? 'beenden' : 'nichts';
  return praesentator ? 'starten' : 'link';
}

/** Was ein Klick auf den Knopf tut: null = nichts (Studierende, auch wenn der Knopf per DevTools eingeblendet ist).
 *  Das Ergebnis geht an beamerSchalten(), das die Präsentator-Regel noch einmal selbst prüft. */
export function klickAktion({ praesentator, beamer, seite }: Lage): { an: boolean; hell: boolean } | null {
  const hell = seite !== 'start';
  if (beamer) return { an: false, hell };
  return praesentator ? { an: true, hell } : null;
}
