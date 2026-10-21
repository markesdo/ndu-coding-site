// Bausteine, die alle Artefakt-Schemas teilen: Belegstufe, Datum, IDs, Fehlerform.
import { z } from 'zod';
import { istId, type IdPraefix } from '../ids.js';
import { graphemAnzahl } from '../text.js';

// Reihenfolge ist die Skala „sagen → tun“.
export const BELEGSTUFEN = ['keiner', 'gesagt', 'erzaehlt', 'getan'] as const;
export type Belegstufe = (typeof BELEGSTUFEN)[number];

// Anzeigetexte wie auf den Kursseiten (Skala im Entscheidungslog).
export const BELEGSTUFE_TEXT: Record<Belegstufe, string> = {
  keiner: 'noch keiner',
  gesagt: 'gesagt',
  erzaehlt: 'erzählt',
  getan: 'getan',
};

export interface Feldfehler {
  pfad: string;
  meldung: string;
}

export const belegstufe = z.enum(BELEGSTUFEN, {
  error: 'Der Beleg muss „noch keiner“, „gesagt“, „erzählt“ oder „getan“ sein.',
});

// Pflichtfeld als Text; leer ist erlaubt (Entwürfe), Prüflisten-Hinweise sind keine Schemafehler.
export const text = (feld: string) => z.string({ error: `${feld}: bitte als Text eintragen.` });

export const schemaKennung = <N extends string>(name: N) =>
  z.literal(`${name}@1`, { error: `Diese Datei ist kein ${name}@1.` });

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

export function istIsoDatum(s: string): boolean {
  const t = ISO.exec(s);
  if (!t) return false;
  const [j, m, d] = [Number(t[1]), Number(t[2]), Number(t[3])];
  const datum = new Date(Date.UTC(j, m - 1, d));
  return datum.getUTCFullYear() === j && datum.getUTCMonth() === m - 1 && datum.getUTCDate() === d;
}

export const isoDatum = (feld: string) =>
  z
    .string({ error: `${feld}: bitte als Datum JJJJ-MM-TT eintragen.` })
    .refine(istIsoDatum, { error: `${feld}: bitte als Datum JJJJ-MM-TT eintragen, zum Beispiel 2026-10-22.` });

// Eigene ID einer Zeile: genau Präfix + Nummer (D3), ohne Unternummer.
export const zeilenId = (p: IdPraefix, feld: string) =>
  z
    .string({ error: `${feld}: bitte eine ID wie ${p}1 eintragen.` })
    .regex(new RegExp(`^${p}[1-9][0-9]*$`), { error: `${feld}: die ID muss wie ${p}1 aussehen.` });

// Verweis auf irgendeine ID der Mappe (I2-4, A3, E3).
export const verweisId = z
  .string({ error: 'Ein Verweis muss eine ID wie I2-4 sein.' })
  .refine(istId, { error: 'Ein Verweis muss eine ID wie I2-4 sein.' });

export const belegIds = z.array(verweisId, { error: 'Belege müssen eine Liste von IDs sein.' });

export const BELEG_NOTIZ_MAX = 120;

// Steuer- und Formatzeichen (z. B. U+202E dreht Text um) plus Zeilenumbrüche. Der Joiner in Emoji-Folgen (Join_Control) ist erlaubt.
const STEUERZEICHEN = /(?!\p{Join_Control})[\p{Cc}\p{Cf}\u2028\u2029\u0085]/u;

// Optional: Quelle oder Zahl zum Beleg (z. B. „Kassendaten September“), in Entscheidungslog und Annahmen-Map gleich.
// Das Schema lehnt ab statt zu bereinigen: Was gespeichert wird, ist genau das, was die Person sieht.
export const belegNotiz = z
  .string({ error: 'Beleg (Notiz): bitte als Text eintragen.' })
  .refine((s) => s.trim() !== '', { error: 'Beleg-Notiz: nicht leer – ohne Notiz das Feld weglassen' })
  .refine((s) => !STEUERZEICHEN.test(s), { error: 'Beleg-Notiz: eine Zeile, ohne Steuerzeichen' })
  .refine((s) => s === s.trim(), { error: 'Beleg-Notiz: ohne Leerzeichen am Anfang oder Ende' })
  .refine((s) => graphemAnzahl(s) <= BELEG_NOTIZ_MAX, { error: `Beleg (Notiz): höchstens ${BELEG_NOTIZ_MAX} Zeichen. Kürze die Notiz oder nenne nur die Quelle.` })
  .optional();

/** Zähler neben dem Notizfeld, z. B. „12/120“ (Grapheme, wie im Schema). */
export function belegNotizZaehler(notiz: string): string {
  return `${graphemAnzahl(notiz)}/${BELEG_NOTIZ_MAX}`;
}

/** Setzt die Beleg-Notiz (Entscheidung oder Annahme); nach trim() leer entfernt das Feld ganz (optional, nie als leerer
 *  Text gespeichert). Rand-Leerraum meldet das Schema. */
export function belegNotizSetzen<Z extends { belegNotiz?: string }>(zeile: Z, notiz: string): Omit<Z, 'belegNotiz'> & { belegNotiz?: string } {
  const { belegNotiz: _alt, ...rest } = zeile;
  return notiz.trim() === '' ? rest : { ...rest, belegNotiz: notiz };
}

// Doppelte IDs in einer Liste: Fehler am zweiten Vorkommen, Pfad <index>.id (relativ zur Liste).
export function doppelteIds(zeilen: readonly { id: string }[], ctx: z.RefinementCtx, meldung: string): void {
  const gesehen = new Set<string>();
  zeilen.forEach((z0, i) => {
    if (gesehen.has(z0.id)) ctx.addIssue({ code: 'custom', path: [i, 'id'], message: meldung });
    gesehen.add(z0.id);
  });
}
