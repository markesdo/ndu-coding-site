// IDs der Mappe: Präfix + Nummer (A12), optional mit Unternummer (I2-4). Nummern beginnen bei 1.
export type IdPraefix = 'D' | 'F' | 'A' | 'I' | 'T' | 'J' | 'P' | 'G' | 'W' | 'H' | 'L' | 'E' | 'S';

const ID = /^[DFAITJPGWHLES][1-9][0-9]*(-[1-9][0-9]*)?$/;

export function istId(s: string): boolean {
  return ID.test(s);
}

// Größte vorhandene Nummer + 1; Lücken bleiben Lücken, damit eine ID nie zwei Dinge bedeutet.
export function naechsteId(p: IdPraefix, vorhandene: readonly string[]): string {
  const muster = new RegExp(`^${p}([1-9][0-9]*)$`);
  let max = 0;
  for (const v of vorhandene) {
    const treffer = muster.exec(v);
    if (treffer) max = Math.max(max, Number(treffer[1]));
  }
  return `${p}${max + 1}`;
}
