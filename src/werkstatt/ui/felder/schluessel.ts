// Stabile Schlüssel für Listenzeilen: unabhängig vom Inhalt, damit ein Eingabefeld (zum Beispiel die ID) beim Tippen
// nicht neu gebaut wird und den Fokus behält.

/** Passt die Schlüsselliste an die Länge der Liste an: kürzt oder hängt frische, nie zuvor vergebene Schlüssel an. */
export function schluesselAbgleichen(schluessel: readonly string[], laenge: number, zaehler: { n: number }): string[] {
  const neu = schluessel.slice(0, laenge);
  while (neu.length < laenge) neu.push(`z${zaehler.n++}`);
  return neu;
}

export function schluesselSchieben(schluessel: readonly string[], i: number, d: -1 | 1): string[] {
  const kopie = [...schluessel];
  [kopie[i], kopie[i + d]] = [kopie[i + d], kopie[i]];
  return kopie;
}
