// Nielsen (2000), „Why You Only Need to Test with 5 Users“: Anteil der gefundenen Usability-Probleme nach n Testpersonen,
// N(1 − (1 − L)^n) mit L ≈ 0,31 – dem Anteil, den eine einzelne Person im Schnitt aufdeckt.
export const NIELSEN_L = 0.31;

export function gefundenAnteil(n: number, l = NIELSEN_L): number {
  if (!(n >= 0) || !Number.isInteger(n)) throw new Error(`gefundenAnteil: n muss eine ganze Zahl ≥ 0 sein, war ${n}`);
  return 1 - (1 - l) ** n;
}
