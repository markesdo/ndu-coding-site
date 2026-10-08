// Ein Quiz soll Wissen prüfen, nicht Raten belohnen. Zwei Muster machen Antworten ohne Wissen erratbar:
// die richtige Antwort steht fast immer an derselben Stelle, oder sie ist fast immer die längste.
export interface QuizFrage {
  q: string;
  o: string[];
  a: number;
}

export function quizProbleme(fragen: QuizFrage[]): string[] {
  const probleme: string[] = [];
  for (const f of fragen) {
    if (!Number.isInteger(f.a) || f.a < 0 || f.a >= f.o.length) probleme.push(`a=${f.a} passt nicht zu ${f.o.length} Antworten bei „${f.q}“`);
  }
  if (probleme.length) return probleme;

  // Position: ab vier Fragen darf keine Stelle mehr als 60 % der richtigen Antworten tragen.
  if (fragen.length >= 4) {
    const zaehler = new Map<number, number>();
    for (const f of fragen) zaehler.set(f.a, (zaehler.get(f.a) ?? 0) + 1);
    for (const [stelle, n] of zaehler) {
      if (n / fragen.length > 0.6) probleme.push(`${n} von ${fragen.length} richtigen Antworten stehen an Stelle ${stelle + 1}`);
    }
  }

  // Länge: Die richtige Antwort darf höchstens bei der Hälfte der Fragen sichtbar die längste sein –
  // mehr als 10 % länger als jede andere. Ein, zwei Zeichen Unterschied fallen niemandem auf.
  const laengste = fragen.filter((f) => f.o.every((o, j) => j === f.a || o.length * 1.1 < f.o[f.a].length)).length;
  if (laengste > fragen.length / 2) probleme.push(`Bei ${laengste} von ${fragen.length} Fragen ist die richtige Antwort deutlich die längste`);

  return probleme;
}
