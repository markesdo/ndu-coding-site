// Abgeschaltete Abschnitte einer Seite: {NAME && (<> … </>)} mit const NAME = false im Frontmatter rendert Astro nicht.
// Gliederung (Inhaltsverzeichnis) und Begleiter lesen aber den Quelltext; ohne diese Funktion stünden die Überschriften
// des Blocks trotzdem im Inhaltsverzeichnis und als Folien im Begleiter. Beispiel: Lego4Scrum in methoden/scrum.astro.

/** Quelltext ohne die Blöcke {NAME && (<>…</>)}, deren NAME im Frontmatter als const NAME = false steht. */
export function ohneAbgeschaltet(quelle: string): string {
  const aus = new Set([...quelle.matchAll(/^const (\w+) = false;$/gm)].map((m) => m[1]));
  if (aus.size === 0) return quelle;
  return quelle.replace(/\{(\w+) && \(<>[\s\S]*?<\/>\)\}/g, (block, name: string) => (aus.has(name) ? '' : block));
}
