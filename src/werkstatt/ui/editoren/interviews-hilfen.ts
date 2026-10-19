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
