// Platzhalter – T11 ersetzt diese Datei (Mappe lesen und speichern).
// Gemountet unter /api/werkstatt/mappe: Pfade hier relativ dazu (z. B. '/:artefakt').
// CSRF (JSON + eigene Origin) für POST/PUT/PATCH/DELETE prüft schon appErstellen.
import { Hono } from 'hono';
import { nochNichtGebaut } from '../stub.js';
import type { Abhaengigkeiten, WerkstattEnv } from '../typen.js';

export function mappeRouten(_abh: Abhaengigkeiten): Hono<WerkstattEnv> {
  const r = new Hono<WerkstattEnv>();
  r.all('/*', nochNichtGebaut('mappe'));
  return r;
}
