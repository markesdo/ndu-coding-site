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

const hatZitate = (zitate: readonly { text: string }[]) => zitate.some((z) => z.text.trim() !== '');

/** Tipp unter „Belege“ (nur an der ersten Chance). Ohne Zitat mit Text kein Tipp: Dann zeigt BelegAuswahl an jeder
 *  Chance den Leerzustand „Noch keine Zitate …“, der dasselbe sagt. */
export function belegHilfe(zitate: readonly { text: string }[]): string | undefined {
  return hatZitate(zitate) ? 'Kreuze die Zitate an, die diese Chance stützen – ohne Zitat kein Beleg.' : undefined;
}

export const BELEG_FEHLT = 'Diese Chance hat noch keinen Beleg – kreuze mindestens ein Zitat an.';

/** Weicher Hinweis (NDU-56): Chance mit Text, aber ohne Zitat-ID. Eine frische, leere Zeile bleibt ohne Hinweis; speichern geht trotzdem. */
export function belegFehlt(chance: Chance): boolean {
  return chance.text.trim() !== '' && chance.belege.length === 0;
}

/** Hinweistext am Feld „Belege“. Nur, wenn es Zitate zum Ankreuzen gibt: Ohne Zitat mit Text sagt der Leerzustand von
 *  BelegAuswahl schon „zuerst oben Zitate eintragen, dann ankreuzen“ – ein zweiter Hinweis würde das nur wiederholen. */
export function belegHinweis(chance: Chance, zitate: readonly { text: string }[]): string | undefined {
  if (!belegFehlt(chance) || !hatZitate(zitate)) return undefined;
  return BELEG_FEHLT;
}

/** Ein Zitat als Beleg an- oder abwählen. Ergebnis in der Reihenfolge der Zitate (`zitatIds`), ohne Doppelte;
 *  Verweise auf Zitate, die es nicht mehr gibt (Waisen), bleiben hinten stehen, bis man sie abwählt. */
export function belegUmschalten(werte: readonly string[], id: string, an: boolean, zitatIds: readonly string[]): string[] {
  const gewaehlt = (z: string) => (z === id ? an : werte.includes(z));
  const zitate = [...new Set(zitatIds)].filter(gewaehlt);
  const waisen = [...new Set(werte)].filter((w) => !zitatIds.includes(w) && !(w === id && !an));
  return [...zitate, ...waisen];
}
