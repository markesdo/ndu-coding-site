import { z } from 'zod';
import { isoDatum, schemaKennung, text } from './gemeinsam.js';

export const briefSchema = z.object({
  schema: schemaKennung('brief'),
  stand: isoDatum('Stand'),
  fuerWen: text('Für wen'),
  problem: text('Problem'),
  heuteGeloestDurch: text('Heute gelöst durch'),
  // Bleibt bis Tag 3 offen.
  produktSatz: text('Produkt in einem Satz').optional(),
  // Drei Einträge werden erwartet; das ist ein Prüflisten-Hinweis, kein Schemafehler.
  nicht: z.array(text('Was es nicht macht'), { error: '„Was es nicht macht“ muss eine Liste sein.' }),
  outcome: z.object(
    { wirGlauben: text('Wir glauben'), wirMerkenEs: text('Wir merken es') },
    { error: 'Das Outcome braucht „Wir glauben“ und „Wir merken es“.' },
  ),
  offeneFragen: z.array(text('Offene Frage'), { error: '„Offene Fragen“ muss eine Liste sein.' }),
});

export type Brief = z.infer<typeof briefSchema>;

export const briefLeer = (heute: string): Brief => ({
  schema: 'brief@1',
  stand: heute,
  fuerWen: '',
  problem: '',
  heuteGeloestDurch: '',
  nicht: [],
  outcome: { wirGlauben: '', wirMerkenEs: '' },
  offeneFragen: [],
});
