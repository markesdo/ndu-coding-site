// Karten (Experiment-Karte, Lernkarte, Vorlagen der Miro-Frames) als Darstellung statt als Prompt zum Kopieren
// (Dozent 27.11.2026: die Karten stehen auf Miro). Ohne Astro, damit testbar.
// Eingabe wie bisher im Prompt: erste Zeile = Titel, jede weitere Zeile eine Zeile der Karte; eingerückte Zeilen
// gehören zur Zeile davor. Der feste Satzanfang (bis zum ersten Doppelpunkt oder ein bekannter Satzanfang) wird fett.

/** Satzanfänge ohne Doppelpunkt, die auf Blands Test Card und Learning Card stehen. */
export const SATZANFAENGE = [
  'Wir glauben, dass',
  'Wir glaubten, dass',
  'Um das zu prüfen,',
  'Wir haben recht, wenn',
  'Wir messen',
  'Der Prototyp zeigt',
  'Er läuft',
  'Er hat nicht:',
  'Weicht ab von „Wir entscheiden vorher“?',
] as const;

export interface Teil { text: string; luecke: boolean }
export interface KartenZeile { stamm: string; rest: Teil[] }

/** „[…]“ und „[x von y]“ sind Lücken (in Vorlagen grau). */
export function teile(text: string): Teil[] {
  return text.split(/(\[[^\]]*\])/).filter(Boolean).map((t) => ({ text: t, luecke: /^\[[^\]]*\]$/.test(t) }));
}

/** Eine Zeile in festen Satzanfang und Rest teilen. */
export function zeileTeilen(zeile: string): KartenZeile {
  const z = zeile.trim();
  // Der Rest beginnt ohne Leerzeichen (die Darstellung setzt eins nach dem fetten Satzanfang); Leerzeichen zwischen Lücken
  // und Text bleiben stehen („wenn [x] von 5“).
  const rest = (r: string) => teile(r.replace(/^\s+/, ''));
  const bekannt = SATZANFAENGE.find((s) => z.startsWith(s));
  if (bekannt) {
    // Folgt dem bekannten Satzanfang direkt ein Doppelpunkt („Wir messen:“), gehört er zum fetten Teil.
    const stamm = z.slice(bekannt.length).startsWith(':') ? `${bekannt}:` : bekannt;
    return { stamm, rest: rest(z.slice(stamm.length)) };
  }
  const d = z.indexOf(':');
  // Ein Doppelpunkt früh in der Zeile, nicht in einer Lücke oder einem Zitat: Satzanfang bis dorthin.
  if (d > 0 && d <= 48 && !/[[„]/.test(z.slice(0, d))) return { stamm: z.slice(0, d + 1), rest: rest(z.slice(d + 1)) };
  return { stamm: '', rest: rest(z) };
}

/** Text wie im Prompt → Titel und Zeilen. */
export function karteAus(text: string): { titel: Teil[]; zeilen: KartenZeile[] } {
  const roh = text.replace(/^\n+|\n+$/g, '').split('\n');
  const zeilen: string[] = [];
  for (const z of roh.slice(1)) {
    if (/^\s+\S/.test(z) && zeilen.length) zeilen[zeilen.length - 1] += ` ${z.trim()}`;
    else if (z.trim()) zeilen.push(z);
  }
  return { titel: teile(roh[0] ?? ''), zeilen: zeilen.map(zeileTeilen) };
}
