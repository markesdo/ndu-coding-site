// Beamer-Modus zur Laufzeit umschalten – eine Regel für Layout.astro (Knopf „Beamer“, Taste B) und die Startseiten-Knöpfe
// „Beamer starten“ (PraesentatorEinstieg.astro). Wer Präsentator ist, entscheidet allein html[data-ist-praesentator]: das setzt
// BeamerStart.astro vor dem ersten Zeichnen aus dem Schlüssel im localStorage, wo-ist.ts hält es bei An- und Abmelden nach.
// Hier wird der Schlüssel also nicht noch einmal gelesen.

/** Das Nötigste von document.documentElement – so laufen die Tests ohne DOM. */
export type Wurzel = Pick<Element, 'hasAttribute' | 'toggleAttribute' | 'setAttribute' | 'removeAttribute'>;
export type Speicher = Pick<Storage, 'setItem' | 'removeItem'>;

/** Beamer an oder aus. Einschalten nur beim Präsentator (Regel in BeamerStart.astro), ausschalten immer.
 *  hell: Beamer heißt helles Thema; /start hat ein eigenes dunkles Farbschema und bleibt dabei.
 *  Gibt zurück, ob umgeschaltet wurde – ohne Schlüssel bleibt alles, wie es ist, auch wenn jemand den Knopf per DevTools einblendet. */
export function beamerSchalten(root: Wurzel, an: boolean, { hell = true, speicher }: { hell?: boolean; speicher?: Speicher } = {}): boolean {
  if (an && !root.hasAttribute('data-ist-praesentator')) return false;
  root.toggleAttribute('data-beamer', an);
  if (hell) { if (an) root.setAttribute('data-theme', 'light'); else root.removeAttribute('data-theme'); }
  try { if (an) speicher?.setItem('ndu-beamer', '1'); else speicher?.removeItem('ndu-beamer'); } catch {}
  return true;
}

/** Was unten auf /start und /innolab steht: beim Präsentator der Knopf „Beamer starten“, sonst der Link „Präsentator“;
 *  im Beamer-Modus selbst nichts (am Projektor stört beides). */
export function einstieg(root: Pick<Element, 'hasAttribute'>): 'knopf' | 'link' | 'nichts' {
  if (root.hasAttribute('data-beamer')) return 'nichts';
  return root.hasAttribute('data-ist-praesentator') ? 'knopf' : 'link';
}
