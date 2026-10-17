import { z } from 'zod';
import { doppelteIds, isoDatum, schemaKennung, text, zeilenId } from './gemeinsam';

const frageSchema = z.object({
  id: zeilenId('F', 'ID der Frage'),
  text: text('Frage'),
  art: z.enum(['kern', 'nachfrage'], { error: 'Die Art der Frage muss „kern“ oder „nachfrage“ sein.' }),
});

export const leitfadenSchema = z.object({
  schema: schemaKennung('leitfaden'),
  stand: isoDatum('Stand'),
  ziel: text('Ziel'),
  wen: text('Wen'),
  einstieg: text('Einstieg'),
  fragen: z
    .array(frageSchema, { error: 'Die Fragen müssen eine Liste sein.' })
    .superRefine((zeilen, ctx) => doppelteIds(zeilen, ctx, 'Diese ID gibt es schon. Jede Frage braucht eine eigene ID.')),
  abschluss: text('Abschluss'),
});

export type Leitfaden = z.infer<typeof leitfadenSchema>;
export type Frage = Leitfaden['fragen'][number];

export const leitfadenLeer = (heute: string): Leitfaden => ({
  schema: 'leitfaden@1',
  stand: heute,
  ziel: '',
  wen: '',
  einstieg: '',
  fragen: [],
  abschluss: '',
});
