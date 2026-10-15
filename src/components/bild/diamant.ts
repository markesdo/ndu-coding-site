// Diamant.astro: Eingaben prüfen und die Flächen berechnen. Ohne DOM, damit testbar.

/** Genau vier Phasen; hervor, falls gesetzt, eine davon – sonst fehlt die Hervorhebung stillschweigend. */
export function pruefeDiamant(phasen: number, hervor?: number): void {
  if (phasen !== 4) throw new Error(`Diamant: genau vier Phasen, waren ${phasen}`);
  if (hervor !== undefined && ![0, 1, 2, 3].includes(hervor)) throw new Error(`Diamant: hervor muss 0–3 sein, war ${hervor}`);
}

// x-Positionen im viewBox 0 0 800 200: linke Spitze, Mitte, rechte Spitze je Raute (2 px Abstand für die Linie).
const X = [[2, 200, 398], [402, 600, 798]] as const;
const OBEN = 4, MITTE = 100, UNTEN = 196;

/** Die zwei Rauten als SVG-Punktlisten. */
export const RAUTEN = X.map(([l, m, r]) => `${l},${MITTE} ${m},${OBEN} ${r},${MITTE} ${m},${UNTEN}`);

/** Die Hälfte einer Raute, die zu Phase 0–3 gehört (öffnend = linke Hälfte, schließend = rechte). */
export function phasenFlaeche(phase: number): string {
  const [l, m, r] = X[Math.floor(phase / 2)];
  return phase % 2 === 0 ? `${l},${MITTE} ${m},${OBEN} ${m},${UNTEN}` : `${m},${OBEN} ${r},${MITTE} ${m},${UNTEN}`;
}
