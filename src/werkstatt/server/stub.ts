// Platzhalter für Router, die ein späterer Task baut: 501 als ApiFehler, markiert mit x-werkstatt-stub.
// Wird gelöscht, sobald kein Router ihn mehr benutzt.
import type { Context } from 'hono';
import { fehler } from './antwort.js';

export function nochNichtGebaut(bereich: string) {
  return (c: Context): Response => {
    c.header('x-werkstatt-stub', bereich);
    return fehler(c, 501, 'unbekannt', 'Diese Funktion der Werkstatt gibt es noch nicht.');
  };
}
