import { z } from 'zod';
import { belegIds, belegstufe, doppelteIds, isoDatum, schemaKennung, text, zeilenId, type Belegstufe } from './gemeinsam';

export const ANNAHME_ARTEN = ['wuenschenswert', 'machbar', 'wirtschaftlich', 'bedienbar'] as const;
export const WICHTIGKEITEN = ['hoch', 'mittel', 'niedrig'] as const;

const annahmeSchema = z.object({
  id: zeilenId('A', 'ID der Annahme'),
  text: text('Annahme'),
  art: z.enum(ANNAHME_ARTEN, { error: 'Die Art der Annahme fehlt: wünschenswert, machbar, wirtschaftlich oder bedienbar.' }),
  wichtig: z.enum(WICHTIGKEITEN, { error: 'Die Wichtigkeit muss „hoch“, „mittel“ oder „niedrig“ sein.' }),
  beleg: belegstufe,
  belegIds,
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

// Wird abgeleitet, nie eingegeben: oben = wichtig, rechts = belegt. „ol“ heißt zuerst testen.
export function quadrant(a: Pick<Annahme, 'wichtig' | 'beleg'>): Quadrant {
  const oben = a.wichtig === 'hoch';
  const rechts = a.beleg === 'erzaehlt' || a.beleg === 'getan';
  return `${oben ? 'o' : 'u'}${rechts ? 'r' : 'l'}` as Quadrant;
}

const Y: Record<Annahme['wichtig'], number> = { hoch: 0.85, mittel: 0.5, niedrig: 0.15 };
const X: Record<Belegstufe, number> = { keiner: 0.1, gesagt: 0.35, erzaehlt: 0.65, getan: 0.9 };
const VERSATZ = 0.06;

const klemmen = (n: number) => Math.min(1, Math.max(0, n));

// Position im Bild (0 bis 1, y nach oben). Teilen sich Annahmen dieselbe Zelle (gleiche Wichtigkeit
// und Belegstufe), rückt jede weitere in Listenreihenfolge um 0,06 nach rechts unten.
export function punkt(a: Annahme, nachbarn: readonly Annahme[]): { x: number; y: number } {
  const zelle = nachbarn.filter((n) => n.wichtig === a.wichtig && n.beleg === a.beleg);
  const eigene = zelle.findIndex((n) => n.id === a.id);
  const k = eigene === -1 ? zelle.length : eigene;
  return { x: klemmen(X[a.beleg] + k * VERSATZ), y: klemmen(Y[a.wichtig] - k * VERSATZ) };
}
