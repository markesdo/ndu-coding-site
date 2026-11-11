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

/** Neues Zitat in Interview `interviewId`: I2-1, I2-2 … nach der höchsten Nummer dieses Interviews. Mitgezählt werden
 *  auch IDs, auf die eine Chance noch als Beleg verweist (`belege`): Sonst bekäme ein neues Zitat nach dem Löschen des
 *  letzten die alte ID und wäre still als Beleg einer alten Chance angekreuzt. */
export function neuesZitat(interviewId: string, vorhandene: readonly { id: string }[], belege: readonly string[] = []): { id: string; text: string } {
  const praefix = `${interviewId}-`;
  const max = [...vorhandene.map((z) => z.id), ...belege].reduce((m, id) => {
    const n = id.startsWith(praefix) ? Number(id.slice(praefix.length)) : 0;
    return Number.isSafeInteger(n) && n > m ? n : m;
  }, 0);
  return { id: `${praefix}${max + 1}`, text: '' };
}

/** Neues Zitat für den Knopf „Zitat hinzufügen“: zählt die Zitate und alle Belege der Chancen dieses Interviews mit. */
export const naechstesZitat = (iv: { id: string; zitate: readonly { id: string }[]; chancen: readonly Chance[] }) =>
  neuesZitat(iv.id, iv.zitate, iv.chancen.flatMap((c) => c.belege));

export const neueChance = (): Chance => ({ text: '', belege: [] });

/** Zitate, die man als Beleg ankreuzen kann: die mit Text. */
export const zitateMitText = <Z extends { text: string }>(zitate: readonly Z[]): Z[] => zitate.filter((z) => z.text.trim() !== '');

/** Belege, deren Zitat es im Interview gar nicht gibt (wie im Schema: ein Zitat mit leerem Text gibt es noch). Ohne Doppelte. */
export const waisen = (werte: readonly string[], zitate: readonly { id: string }[]): string[] =>
  [...new Set(werte)].filter((w) => !zitate.some((z) => z.id === w));

const hatZitate = (zitate: readonly { text: string }[]) => zitateMitText(zitate).length > 0;

/** Tipp unter „Belege“ (nur an der ersten Chance). Ohne Zitat mit Text kein Tipp: Dann zeigt BelegAuswahl an jeder
 *  Chance den Leerzustand „Noch keine Zitate …“, der dasselbe sagt. */
export function belegHilfe(zitate: readonly { text: string }[]): string | undefined {
  return hatZitate(zitate) ? 'Kreuze die Zitate an, die diese Chance stützen – ohne Zitat kein Beleg. Ein Zitat darf mehrere Chancen stützen.' : undefined;
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

/** Ein Zitat als Beleg an- oder abwählen, ohne die übrigen Belege umzusortieren. Abwählen entfernt nur diese ID.
 *  Anwählen setzt sie vor den ersten Beleg, dessen Zitat weiter hinten steht (sonst ans Ende); die Reihenfolge der
 *  anderen bleibt, wie sie ist, Waisen eingeschlossen. Schon gewählt: keine Änderung, kein Doppelter. */
export function belegUmschalten(werte: readonly string[], id: string, an: boolean, zitate: readonly { id: string }[]): string[] {
  if (!an) return werte.filter((w) => w !== id);
  if (werte.includes(id)) return [...werte];
  const pos = (w: string) => zitate.findIndex((z) => z.id === w);
  const eigene = pos(id);
  const davor = eigene < 0 ? -1 : werte.findIndex((w) => pos(w) > eigene);
  return davor < 0 ? [...werte, id] : [...werte.slice(0, davor), id, ...werte.slice(davor)];
}
