// Antworten der Werkstatt-API: immer JSON, nie in einem Cache. Fehler als ApiFehler aus vertrag.ts.
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { ApiFehler } from '../vertrag.js';
import type { Abhaengigkeiten } from './typen.js';

const KOPF = { 'Cache-Control': 'no-store' };

export function json(c: Context, daten: unknown, status: ContentfulStatusCode = 200): Response {
  return c.json(daten, status, KOPF);
}

// felder nur, wenn es wirklich Feldfehler gibt (422 ungueltig nach der Schemaprüfung).
export function fehler(c: Context, status: ContentfulStatusCode, code: ApiFehler['code'], satz: string, felder?: ApiFehler['felder']): Response {
  const body: ApiFehler = felder ? { fehler: satz, code, felder } : { fehler: satz, code };
  return c.json(body, status, KOPF);
}

// Wer irgendwo tief drinnen abbrechen muss, wirft das; appErstellen macht daraus die passende Antwort.
export class ApiAusnahme extends Error {
  constructor(
    readonly status: ContentfulStatusCode,
    readonly code: ApiFehler['code'],
    readonly satz: string,
  ) {
    super(satz);
    this.name = 'ApiAusnahme';
  }
}

// Öffentliche Origin: WERKSTATT_ORIGIN (Prod), sonst die der Anfrage (Preview, lokal).
// Braucht eine Anfrage, die durch appErstellen läuft (dort wird abh gesetzt).
export function origin(c: Context): string {
  const abh = c.get('abh') as Abhaengigkeiten | undefined;
  if (!abh) throw new Error('origin(c) ohne appErstellen');
  return abh.umgebung.origin ?? new URL(c.req.url).origin;
}
