// Interviews mit Snapshot (Hausaufgabe nach Tag 1): eine Datei für alle Gespräche einer Person.
// Snapshot-Felder nach Teresa Torres, „Continuous Discovery Habits“ (2021), S. 67–70: Zitat, Kurzinfos, Einsichten,
// Chancen. Die Skizze der Geschichte bleibt auf Miro. Nur pseudonymisiert: Rohnotizen und Aufnahmen kommen nie hierher.
import { z } from 'zod';
import { doppelteIds, isoDatum, schemaKennung, text, zeilenId } from './gemeinsam.js';

// Zitat-ID: Interview-Nummer und laufende Nummer (I2-4).
const ZITAT_ID = /^I([1-9][0-9]*)-[1-9][0-9]*$/;

const zitatSchema = z.object({
  id: z.string({ error: 'ID des Zitats: bitte eine ID wie I1-1 eintragen.' }).regex(ZITAT_ID, { error: 'ID des Zitats: die ID muss wie I1-1 aussehen.' }),
  text: text('Zitat'),
});

// Chance = Bedürfnis, Schmerzpunkt oder Wunsch in den Worten der Person, keine Lösung (Torres S. 69–70).
// belege: Zitat-IDs aus demselben Interview.
const chanceSchema = z.object({
  text: text('Chance'),
  belege: z.array(z.string().regex(ZITAT_ID, { error: 'Ein Beleg muss eine Zitat-ID wie I1-2 sein.' }), { error: 'Belege müssen eine Liste von Zitat-IDs sein.' }),
});

const interviewSchema = z
  .object({
    id: zeilenId('I', 'ID des Interviews'),
    datum: isoDatum('Datum'),
    pseudonym: text('Pseudonym').refine((s) => s.trim().length > 0, { error: 'Pseudonym: bitte eintragen, zum Beispiel „Pendlerin, Zug 7:42“ – keinen Namen.' }),
    // Ohne Einwilligung wird nichts gespeichert.
    einwilligung: z.literal(true, { error: 'Einwilligung: ohne Einwilligung der Person wird das Interview nicht gespeichert.' }),
    zitat: text('Einprägsames Zitat'),
    kurzinfos: text('Kurzinfos'),
    einsichten: z.array(text('Einsicht'), { error: 'Die Einsichten müssen eine Liste sein.' }),
    chancen: z.array(chanceSchema, { error: 'Die Chancen müssen eine Liste sein.' }),
    notizen: text('Notizen'),
    zitate: z
      .array(zitatSchema, { error: 'Die Zitate müssen eine Liste sein.' })
      .superRefine((zeilen, ctx) => doppelteIds(zeilen, ctx, 'Diese ID gibt es schon. Jedes Zitat braucht eine eigene ID.')),
  })
  .superRefine((iv, ctx) => {
    const nummer = iv.id.slice(1);
    iv.zitate.forEach((z0, i) => {
      if (ZITAT_ID.exec(z0.id)?.[1] !== nummer) ctx.addIssue({ code: 'custom', path: ['zitate', i, 'id'], message: `Das Zitat gehört zu ${iv.id} und braucht eine ID wie ${iv.id}-1.` });
    });
    const vorhanden = new Set(iv.zitate.map((z0) => z0.id));
    iv.chancen.forEach((c, i) => c.belege.forEach((b, j) => {
      if (!vorhanden.has(b)) ctx.addIssue({ code: 'custom', path: ['chancen', i, 'belege', j], message: `${b} gibt es in ${iv.id} nicht.` });
    }));
  });

export const interviewsSchema = z.object({
  schema: schemaKennung('interviews'),
  stand: isoDatum('Stand'),
  interviews: z
    .array(interviewSchema, { error: 'Die Interviews müssen eine Liste sein.' })
    .superRefine((zeilen, ctx) => doppelteIds(zeilen, ctx, 'Diese ID gibt es schon. Jedes Interview braucht eine eigene ID.')),
});

export type Interviews = z.infer<typeof interviewsSchema>;
export type Interview = Interviews['interviews'][number];
export type Chance = Interview['chancen'][number];

export const interviewsLeer = (heute: string): Interviews => ({ schema: 'interviews@1', stand: heute, interviews: [] });
