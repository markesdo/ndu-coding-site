import { z } from 'zod';
import { belegIds, belegNotiz, belegstufe, doppelteIds, isoDatum, schemaKennung, text, zeilenId } from './gemeinsam.js';

const entscheidungSchema = z.object({
  id: zeilenId('D', 'ID der Entscheidung'),
  datum: isoDatum('Datum'),
  entscheidung: text('Entscheidung'),
  grund: text('Grund'),
  beleg: belegstufe,
  belegIds,
  // Optional: Quelle oder Zahl zum Beleg (z. B. „Kassendaten September“). Kein neues Pflichtfeld, daher keine neue Version.
  // Das Feld ist unveränderlich, darum lehnt das Schema ab statt zu bereinigen (anders als die Commit-Nachricht in server/routen/mappe.ts).
  belegNotiz,
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
    const position = new Map(d.entscheidungen.map((e, i) => [e.id, i]));
    const schonErsetzt = new Set<string>();
    d.entscheidungen.forEach((e, i) => {
      if (e.ersetzt === undefined) return;
      const pfad = ['entscheidungen', i, 'ersetzt'];
      const ziel = position.get(e.ersetzt);
      if (e.ersetzt === e.id) {
        ctx.addIssue({ code: 'custom', path: pfad, message: 'Eine Entscheidung kann sich nicht selbst ersetzen.' });
      } else if (ziel === undefined) {
        ctx.addIssue({ code: 'custom', path: pfad, message: `Die Entscheidung ${e.ersetzt} gibt es nicht.` });
      } else if (ziel > i) {
        // Nur nach hinten zeigen: Die neue Zeile steht unter der alten, so kann es keinen Zyklus geben.
        ctx.addIssue({ code: 'custom', path: pfad, message: `Die Entscheidung ${e.ersetzt} steht weiter unten. Eine Entscheidung kann nur eine frühere ersetzen.` });
      } else if (schonErsetzt.has(e.ersetzt)) {
        ctx.addIssue({ code: 'custom', path: pfad, message: `Die Entscheidung ${e.ersetzt} wird schon von einer anderen ersetzt.` });
      } else {
        schonErsetzt.add(e.ersetzt);
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
