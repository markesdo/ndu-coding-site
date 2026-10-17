// Platzhalter – T4 ersetzt diese Datei (GitHub-Login, Sitzungs-Cookie, Abmelden).
// Gemountet unter /api/werkstatt/auth: Pfade hier relativ dazu (z. B. '/ich' = /api/werkstatt/auth/ich).
// CSRF für POST /abmelden prüft schon appErstellen.
import { Hono } from 'hono';
import { nochNichtGebaut } from '../stub.js';
import type { Abhaengigkeiten, WerkstattEnv } from '../typen.js';

export function authRouten(_abh: Abhaengigkeiten): Hono<WerkstattEnv> {
  const r = new Hono<WerkstattEnv>();
  r.all('/*', nochNichtGebaut('auth'));
  return r;
}
