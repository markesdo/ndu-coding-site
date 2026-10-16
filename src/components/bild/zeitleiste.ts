// Zeitleiste.astro: welche Zeile welche ersetzt. Ohne DOM, damit testbar.

export interface Eintrag { datum: string; t: string; grund: string; beleg: string; ersetzt?: number; schritt?: boolean }

/**
 * ersetztDurch[i] = Index der Zeile, die Zeile i ersetzt. Ersetzt werden kann nur eine frühere Zeile, und jede nur
 * einmal – sonst ist die Reihenfolge im Log falsch, und das lieber beim Bauen als am Beamer.
 */
export function ersetzungen(eintraege: Eintrag[]): { ersetztDurch: Record<number, number> } {
  const ersetztDurch: Record<number, number> = {};
  eintraege.forEach((e, i) => {
    if (e.ersetzt === undefined) return;
    if (!Number.isInteger(e.ersetzt) || e.ersetzt < 0 || e.ersetzt >= i) {
      throw new Error(`Zeitleiste: „${e.t}“ ersetzt Zeile ${e.ersetzt}, erlaubt sind nur frühere (0–${i - 1})`);
    }
    if (ersetztDurch[e.ersetzt] !== undefined) {
      throw new Error(`Zeitleiste: Zeile ${e.ersetzt} wird doppelt ersetzt (von ${ersetztDurch[e.ersetzt]} und ${i})`);
    }
    ersetztDurch[e.ersetzt] = i;
  });
  return { ersetztDurch };
}
