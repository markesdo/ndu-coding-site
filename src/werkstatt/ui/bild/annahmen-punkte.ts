import { punkt, type Annahme } from '../../schemas/index.js';

export type MatrixPunkt = { t: string; x: number; y: number; hervor: boolean; farbe: string; art: string };

// Farbe und Text je Art wie auf der Folie „Vier Arten von Annahmen“ (VierArten.astro).
const ART: Record<Annahme['art'], { farbe: string; text: string }> = {
  wuenschenswert: { farbe: 'yellow', text: 'wünschenswert' },
  machbar: { farbe: 'blue', text: 'machbar' },
  wirtschaftlich: { farbe: 'green', text: 'wirtschaftlich' },
  bedienbar: { farbe: 'purple', text: 'bedienbar' },
};

const SCHRITT = 0.06;
const MAX_ZEICHEN = 40;

const kuerzen = (s: string) => (s.length > MAX_ZEICHEN ? `${s.slice(0, MAX_ZEICHEN).trimEnd()}…` : s);

// Schritt von einer Zelle weg in die Richtung des Quadranten, in der mehr Platz bleibt (Quadrantengrenze 0,5).
// So bleiben auch fünf Annahmen einer Zelle im Quadranten und liegen auf verschiedenen Punkten.
function richtung(wert: number): 1 | -1 {
  const [unten, oben] = wert < 0.5 ? [0, 0.5] : [0.5, 1];
  return oben - wert >= wert - unten ? 1 : -1;
}

export function annahmenPunkte(annahmen: readonly Annahme[], riskanteste: string | null): MatrixPunkt[] {
  const gesehen = new Map<string, number>();
  return annahmen.map((a) => {
    const zelle = `${a.wichtig}|${a.beleg}`;
    const k = gesehen.get(zelle) ?? 0;
    gesehen.set(zelle, k + 1);
    const basis = punkt(a, [a]);
    const runden = (v: number) => Math.round(v * 1000) / 1000;
    return {
      t: `${a.id} · ${kuerzen(a.text)}`,
      x: runden(basis.x + richtung(basis.x) * k * SCHRITT),
      y: runden(basis.y + richtung(basis.y) * k * SCHRITT),
      hervor: a.id === riskanteste,
      farbe: ART[a.art].farbe,
      art: ART[a.art].text,
    };
  });
}
