// Ein Quiz soll Wissen prüfen, nicht Raten belohnen. Drei Muster machen Antworten ohne Wissen erratbar:
// Die richtige Antwort steht fast immer an derselben Stelle, oder sie ist fast immer sichtbar die längste
// oder die kürzeste. „Sichtbar“ heißt: mehr als 10 % Unterschied zu jeder anderen Antwort.
export interface QuizFrage {
  q: string;
  o: string[];
  /** Index der richtigen Antwort in o. */
  a: number;
}

const deutlichLaenger = (x: string, y: string) => x.length > y.length * 1.1;

export function quizProbleme(fragen: QuizFrage[]): string[] {
  const probleme: string[] = [];
  for (const f of fragen) {
    if (!Number.isInteger(f.a) || f.a < 0 || f.a >= f.o.length) probleme.push(`a=${f.a} passt nicht zu ${f.o.length} Antworten bei „${f.q}“`);
  }
  if (probleme.length) return probleme;
  const n = fragen.length;

  // Position: ab vier Fragen darf keine Stelle mehr als 60 % der richtigen Antworten tragen.
  if (n >= 4) {
    const zaehler = new Map<number, number>();
    for (const f of fragen) zaehler.set(f.a, (zaehler.get(f.a) ?? 0) + 1);
    for (const [stelle, k] of zaehler) {
      if (k / n > 0.6) probleme.push(`${k} von ${n} richtigen Antworten stehen an Stelle ${stelle + 1}`);
    }
  }

  // Länge: ab zwei Fragen darf die richtige Antwort höchstens bei der Hälfte sichtbar die längste sein, ebenso die kürzeste.
  if (n >= 2) {
    const andere = (f: QuizFrage) => f.o.filter((_, j) => j !== f.a);
    const laengste = fragen.filter((f) => andere(f).every((o) => deutlichLaenger(f.o[f.a], o))).length;
    const kuerzeste = fragen.filter((f) => andere(f).every((o) => deutlichLaenger(o, f.o[f.a]))).length;
    if (laengste > n / 2) probleme.push(`Bei ${laengste} von ${n} Fragen ist die richtige Antwort deutlich die längste`);
    if (kuerzeste > n / 2) probleme.push(`Bei ${kuerzeste} von ${n} Fragen ist die richtige Antwort deutlich die kürzeste`);
  }

  return probleme;
}
