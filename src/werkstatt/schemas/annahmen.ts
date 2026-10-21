import { z } from 'zod';
import { belegIds, belegNotiz, belegstufe, doppelteIds, isoDatum, schemaKennung, text, zeilenId, type Belegstufe } from './gemeinsam.js';

// Die vier Arten von Tag 1 (nach Marty Cagan, wie auf der Kursseite) und Torres' fünfte Frage „Kann es schaden?“
// (Continuous Discovery Habits, S. 118, 126–128), die Tag 3 für die Annahmen einer Idee braucht.
export const TAG1_ARTEN = ['wuenschenswert', 'machbar', 'wirtschaftlich', 'bedienbar'] as const;
export const ANNAHME_ARTEN = [...TAG1_ARTEN, 'ethisch'] as const;
export const WICHTIGKEITEN = ['hoch', 'mittel', 'niedrig'] as const;

const annahmeSchema = z.object({
  id: zeilenId('A', 'ID der Annahme'),
  text: text('Annahme'),
  art: z.enum(ANNAHME_ARTEN, { error: 'Die Art der Annahme muss wünschenswert, machbar, wirtschaftlich, bedienbar oder ethisch sein.' }),
  wichtig: z.enum(WICHTIGKEITEN, { error: 'Die Wichtigkeit muss „hoch“, „mittel“ oder „niedrig“ sein.' }),
  beleg: belegstufe,
  belegIds,
  // Optional (kein neues Pflichtfeld, daher keine neue Version): Quelle außerhalb der Mappe, etwa für „getan“.
  belegNotiz,
});

export const annahmenSchema = z
  .object({
    schema: schemaKennung('annahmen'),
    stand: isoDatum('Stand'),
    riskanteste: zeilenId('A', 'Riskanteste Annahme').optional(),
    annahmen: z
      .array(annahmeSchema, { error: 'Die Annahmen müssen eine Liste sein.' })
      .superRefine((zeilen, ctx) => doppelteIds(zeilen, ctx, 'Diese ID gibt es schon. Jede Annahme braucht eine eigene ID.')),
  })
  .superRefine((d, ctx) => {
    if (d.riskanteste !== undefined && !d.annahmen.some((a) => a.id === d.riskanteste)) {
      ctx.addIssue({ code: 'custom', path: ['riskanteste'], message: `Die Annahme ${d.riskanteste} gibt es nicht.` });
    }
  });

export type Annahmen = z.infer<typeof annahmenSchema>;
export type Annahme = Annahmen['annahmen'][number];

export const annahmenLeer = (heute: string): Annahmen => ({
  schema: 'annahmen@1',
  stand: heute,
  annahmen: [],
});

export type Quadrant = 'ol' | 'or' | 'ul' | 'ur';

// Wird abgeleitet, nie eingegeben: oben = wichtig, rechts = wenig Beleg (wie bei Bland und Torres). „or“ heißt zuerst testen.
export function quadrant(a: Pick<Annahme, 'wichtig' | 'beleg'>): Quadrant {
  const oben = a.wichtig === 'hoch';
  const rechts = a.beleg === 'keiner' || a.beleg === 'gesagt';
  return `${oben ? 'o' : 'u'}${rechts ? 'r' : 'l'}` as Quadrant;
}

// Jede der 12 Zellen (Belegstufe × Wichtigkeit) hat ein eigenes Rechteck im Bild; die Rechtecke überschneiden
// sich nicht und liegen je ganz in einem Quadranten (Grenze bei 0,5), passend zu quadrant().
const X_BAND: Record<Belegstufe, readonly [number, number]> = {
  getan: [0, 0.25], erzaehlt: [0.25, 0.5], gesagt: [0.5, 0.75], keiner: [0.75, 1],
};
const Y_BAND: Record<Annahme['wichtig'], readonly [number, number]> = {
  niedrig: [0, 0.25], mittel: [0.25, 0.5], hoch: [0.5, 1],
};
const INNEN = 0.03;
const SPALTEN = 2;

// Position im Bild (0 bis 1, y nach oben). Eine einzelne Annahme liegt in der Mitte des Zellrechtecks. Teilen sich
// mehrere Annahmen dieselbe Zelle (gleiche Wichtigkeit und Belegstufe), liegen sie in Listenreihenfolge in einem
// Raster mit 2 Spalten (zeilenweise von oben links), gleichmäßig verteilt, mit 0,03 Abstand zum Rechteckrand.
export function punkt(a: Annahme, nachbarn: readonly Annahme[]): { x: number; y: number } {
  const zelle = nachbarn.filter((n) => n.wichtig === a.wichtig && n.beleg === a.beleg);
  const eigene = zelle.findIndex((n) => n.id === a.id);
  const k = eigene === -1 ? zelle.length : eigene;
  const anzahl = Math.max(zelle.length, k + 1);
  const [x0, x1] = X_BAND[a.beleg];
  const [y0, y1] = Y_BAND[a.wichtig];
  const links = x0 + INNEN;
  const rechts = x1 - INNEN;
  const unten = y0 + INNEN;
  const oben = y1 - INNEN;
  const zeilen = Math.ceil(anzahl / SPALTEN);
  const spalte = anzahl === 1 ? 0.5 : k % SPALTEN;
  const zeile = Math.floor(k / SPALTEN);
  const rund = (v: number) => Math.round(v * 1e6) / 1e6;
  return {
    x: rund(links + (rechts - links) * spalte),
    y: rund(zeilen === 1 ? (oben + unten) / 2 : oben - ((oben - unten) * zeile) / (zeilen - 1)),
  };
}
