// Zeitleiste.astro: welche Zeile welche ersetzt, und eine sichere id. Ohne DOM, damit testbar.

/** kurz: Stichwort für Verweise („ersetzt Zielgruppe vom 22.10.“), sonst der ganze Titel. */
export interface Eintrag { datum: string; t: string; kurz?: string; grund: string; beleg: string; ersetzt?: number; schritt?: boolean }

/**
 * Index der ersetzten Zeile → Index der ersetzenden. Ersetzt werden kann nur eine frühere Zeile, und jede nur
 * einmal – sonst ist die Reihenfolge im Log falsch, und das lieber beim Bauen als am Beamer.
 */
export function ersetzungen(eintraege: Eintrag[]): Record<number, number> {
  const ersetztDurch: Record<number, number> = {};
  eintraege.forEach((e, i) => {
    if (e.ersetzt === undefined) return;
    if (i === 0) throw new Error(`Zeitleiste: „${e.t}“ ist die erste Zeile und kann keine frühere ersetzen`);
    if (!Number.isInteger(e.ersetzt) || e.ersetzt < 0 || e.ersetzt >= i) {
      throw new Error(`Zeitleiste: „${e.t}“ ersetzt Zeile ${e.ersetzt}, erlaubt sind nur frühere (0–${i - 1})`);
    }
    if (ersetztDurch[e.ersetzt] !== undefined) {
      throw new Error(`Zeitleiste: Zeile ${e.ersetzt} wird doppelt ersetzt (von ${ersetztDurch[e.ersetzt]} und ${i})`);
    }
    ersetztDurch[e.ersetzt] = i;
  });
  return ersetztDurch;
}

/** Die id landet ungeschützt in einem CSS-Selektor – nur Kleinbuchstaben, Ziffern und Bindestrich, vorne ein Buchstabe. */
export function pruefeId(id: string): void {
  if (!/^[a-z][a-z0-9-]*$/.test(id)) throw new Error(`Zeitleiste: id „${id}“ taugt nicht als CSS-Selektor (a–z, 0–9, -)`);
}
