import { z } from 'zod';
import { belegIds, belegstufe, doppelteIds, isoDatum, schemaKennung, text, zeilenId } from './gemeinsam';

const entscheidungSchema = z.object({
  id: zeilenId('D', 'ID der Entscheidung'),
  datum: isoDatum('Datum'),
  entscheidung: text('Entscheidung'),
  grund: text('Grund'),
  beleg: belegstufe,
  belegIds,
  // Die neue Zeile zeigt auf die alte; die alte wird nie gelöscht.
  ersetzt: zeilenId('D', 'Ersetzt').optional(),
});

export const entscheidungenSchema = z
  .object({
    schema: schemaKennung('entscheidungen'),
    stand: isoDatum('Stand'),
    entscheidungen: z
      .array(entscheidungSchema, { error: 'Die Entscheidungen müssen eine Liste sein.' })
      .superRefine((zeilen, ctx) => doppelteIds(zeilen, ctx, 'Diese ID gibt es schon. Jede Entscheidung braucht eine eigene ID.')),
  })
  .superRefine((d, ctx) => {
    const bekannt = new Set(d.entscheidungen.map((e) => e.id));
    d.entscheidungen.forEach((e, i) => {
      if (e.ersetzt === undefined) return;
      if (e.ersetzt === e.id) {
        ctx.addIssue({ code: 'custom', path: ['entscheidungen', i, 'ersetzt'], message: 'Eine Entscheidung kann sich nicht selbst ersetzen.' });
      } else if (!bekannt.has(e.ersetzt)) {
        ctx.addIssue({ code: 'custom', path: ['entscheidungen', i, 'ersetzt'], message: `Die Entscheidung ${e.ersetzt} gibt es nicht.` });
      }
    });
  });

export type Entscheidungen = z.infer<typeof entscheidungenSchema>;
export type Entscheidung = Entscheidungen['entscheidungen'][number];

export const entscheidungenLeer = (heute: string): Entscheidungen => ({
  schema: 'entscheidungen@1',
  stand: heute,
  entscheidungen: [],
});
