import { punkt, type Annahme } from '../../schemas/index.js';

export type MatrixPunkt = { id: string; t: string; x: number; y: number; hervor: boolean; farbe: string; art: string };

// Farbe und Text je Art wie auf der Folie „Vier Arten von Annahmen“ (VierArten.astro).
const ART: Record<Annahme['art'], { farbe: string; text: string }> = {
  wuenschenswert: { farbe: 'yellow', text: 'wünschenswert' },
  machbar: { farbe: 'blue', text: 'machbar' },
  wirtschaftlich: { farbe: 'green', text: 'wirtschaftlich' },
  bedienbar: { farbe: 'purple', text: 'bedienbar' },
  ethisch: { farbe: 'muted', text: 'ethisch' },
};

const MAX_ZEICHEN = 40;

// Nach Zeichen, nicht nach UTF-16-Einheiten: ein Emoji wird nie mittendrin zerschnitten.
function kuerzen(s: string): string {
  const zeichen = Array.from(s);
  return zeichen.length > MAX_ZEICHEN ? `${zeichen.slice(0, MAX_ZEICHEN).join('').trimEnd()}…` : s;
}

export function annahmenPunkte(annahmen: readonly Annahme[], riskanteste: string | null | undefined): MatrixPunkt[] {
  return annahmen.map((a) => ({
    id: a.id,
    t: `${a.id} · ${kuerzen(a.text)}`,
    ...punkt(a, annahmen),
    hervor: a.id === riskanteste,
    farbe: ART[a.art].farbe,
    art: ART[a.art].text,
  }));
}
