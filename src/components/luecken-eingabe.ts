// Ausfüllbare Lücken in Prompt-Karten: Was nach dem Verlassen einer Lücke darin stehen bleibt.
// Leer oder nur Leerraum → der Platzhalter kommt zurück, damit nichts Leeres kopiert wird.
// Zeilenumbrüche (Enter, eingefügter Text) werden zu Leerzeichen – ein Prompt bleibt eine Eingabe.
export function lueckeNachEingabe(text: string, platzhalter: string): { text: string; gefuellt: boolean } {
  const sauber = text.replace(/\s+/g, ' ').trim();
  if (!sauber || sauber === platzhalter) return { text: platzhalter, gefuellt: false };
  return { text: sauber, gefuellt: true };
}
