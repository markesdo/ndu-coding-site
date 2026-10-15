// Skala.astro: Stickies den Stufen zuordnen. Ohne DOM, damit testbar.

export interface SkalaPunkt { t: string; stufe: number; hervor?: boolean; schritt?: boolean }

/**
 * Stickies je Stufe, in der Reihenfolge der Eingabe. Eine Stufe außerhalb 0 … anzahl-1 ist ein Tippfehler
 * im Seitenquelltext – lieber den Build abbrechen als den Sticky stillschweigend verlieren.
 */
/** Eine Skala braucht Stufen, und hervor muss eine davon sein – sonst fehlt die Hervorhebung stillschweigend. */
export function pruefeSkala(anzahl: number, hervor?: number): void {
  if (anzahl < 1) throw new Error('Skala: mindestens eine Stufe');
  if (hervor !== undefined && (!Number.isInteger(hervor) || hervor < 0 || hervor >= anzahl)) {
    throw new Error(`Skala: hervor ist ${hervor}, erlaubt sind 0–${anzahl - 1}`);
  }
}

export function proStufe(punkte: SkalaPunkt[], anzahl: number): SkalaPunkt[][] {
  const stufen: SkalaPunkt[][] = Array.from({ length: anzahl }, () => []);
  for (const p of punkte) {
    if (!Number.isInteger(p.stufe) || p.stufe < 0 || p.stufe >= anzahl) {
      throw new Error(`Skala: „${p.t}“ hat Stufe ${p.stufe}, erlaubt sind 0–${anzahl - 1}`);
    }
    stufen[p.stufe].push(p);
  }
  return stufen;
}
