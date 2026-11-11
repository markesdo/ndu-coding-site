// Reine Hilfen des Interview-Editors: neue Einträge mit der nächsten freien ID.
import { naechsteId } from '../../ids.js';
import type { Chance, Interview } from '../../schemas/index.js';

// Im Entwurf darf die Einwilligung noch fehlen; gespeichert wird erst mit Haken (Schema: einwilligung: true).
export type InterviewEntwurf = Omit<Interview, 'einwilligung'> & { einwilligung: boolean };

/** Neues Interview: nächste freie I-ID, Datum heute, alles andere leer, Einwilligung noch nicht gesetzt. */
export function neuesInterview(vorhandene: readonly { id: string }[], heute: string): InterviewEntwurf {
  return {
    id: naechsteId('I', vorhandene.map((iv) => iv.id)),
    datum: heute,
    pseudonym: '',
    einwilligung: false,
    zitat: '',
    kurzinfos: '',
    einsichten: [],
    chancen: [],
    notizen: '',
    zitate: [],
  };
}

/** Neues Zitat in Interview `interviewId`: I2-1, I2-2 … nach der höchsten vorhandenen Nummer dieses Interviews. */
export function neuesZitat(interviewId: string, vorhandene: readonly { id: string }[]): { id: string; text: string } {
  const praefix = `${interviewId}-`;
  const max = vorhandene.reduce((m, z) => {
    const n = z.id.startsWith(praefix) ? Number(z.id.slice(praefix.length)) : 0;
    return Number.isSafeInteger(n) && n > m ? n : m;
  }, 0);
  return { id: `${praefix}${max + 1}`, text: '' };
}

export const neueChance = (): Chance => ({ text: '', belege: [] });

/** Tipp unter „Belege“: Ohne Zitat mit Text gibt es keine ID zum Wählen – dann zuerst nach oben zu den Zitaten. */
export function belegHilfe(zitate: readonly { text: string }[]): string {
  return zitate.some((z) => z.text.trim() !== '')
    ? 'Die Zitat-IDs, die diese Chance stützen – ohne ID kein Beleg.'
    : 'Noch keine Zitate: Trag zuerst oben unter „Zitate“ ein, was die Person wörtlich gesagt hat. Dann kannst du hier ihre IDs wählen.';
}

export const BELEG_FEHLT = 'Diese Chance hat noch keinen Beleg – wähle mindestens eine Zitat-ID.';

/** Weicher Hinweis (NDU-56): Chance mit Text, aber ohne Zitat-ID. Eine frische, leere Zeile bleibt ohne Hinweis; speichern geht trotzdem. */
export function belegFehlt(chance: Chance): boolean {
  return chance.text.trim() !== '' && chance.belege.length === 0;
}
