// Die Werkstatt-API als eine Hono-App. Nach Task 3 eingefroren: jeder spätere Task ersetzt nur seinen Router.
import { Hono, type MiddlewareHandler } from 'hono';
import { ApiAusnahme, fehler, origin } from './antwort.js';
import { mcpRouten } from './mcp/server.js';
import { oauthRouten } from './oauth/routen.js';
import { authRouten } from './routen/auth.js';
import { mappeRouten } from './routen/mappe.js';
import type { Abhaengigkeiten, WerkstattEnv } from './typen.js';

const AENDERND = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// CSRF: Der Browser schickt bei ändernden Anfragen immer Origin mit. Fremde oder fehlende Origin → 403.
// mitJson: zusätzlich Content-Type application/json – den kann ein fremdes Formular nicht setzen.
function csrf(opts: { mitJson: boolean; methoden?: Set<string> }): MiddlewareHandler<WerkstattEnv> {
  const methoden = opts.methoden ?? AENDERND;
  return async (c, weiter) => {
    if (!methoden.has(c.req.method)) return weiter();
    const typ = (c.req.header('content-type') ?? '').toLowerCase();
    const passt = c.req.header('origin') === origin(c) && (!opts.mitJson || typ.startsWith('application/json'));
    if (!passt) return fehler(c, 403, 'csrf', 'Diese Anfrage kam nicht von der Werkstatt-Seite und wurde abgelehnt.');
    return weiter();
  };
}

export function appErstellen(abh: Abhaengigkeiten): Hono<WerkstattEnv> {
  const app = new Hono<WerkstattEnv>();

  app.use(async (c, weiter) => {
    c.set('abh', abh);
    await weiter();
  });

  // Hono wendet diese Muster mit demselben Router an wie die Routen (auch für /mappe ohne Rest und kodierte Pfade).
  app.use('/api/werkstatt/mappe/*', csrf({ mitJson: true }));
  app.use('/api/werkstatt/auth/abmelden', csrf({ mitJson: false }));
  app.use('/api/werkstatt/oauth/authorize', csrf({ mitJson: false, methoden: new Set(['POST']) }));

  app.route('/api/werkstatt/auth', authRouten(abh));
  app.route('/api/werkstatt/mappe', mappeRouten(abh));
  // Vor mcpRouten: /api/werkstatt/mcp/resource gehört dem OAuth-Router (volle Pfade, siehe oauth/routen.ts).
  app.route('/', oauthRouten(abh));
  app.route('/api/werkstatt/mcp', mcpRouten(abh));

  app.notFound((c) => fehler(c, 404, 'unbekannt', 'Diese Adresse gibt es in der Werkstatt nicht.'));
  app.onError((err, c) => {
    if (err instanceof ApiAusnahme) return fehler(c, err.status, err.code, err.satz);
    // Nur Name und Meldung, keine Anfrage-Daten; Secrets stehen nie in Meldungen (umgebung.ts nennt nur Namen).
    console.error('werkstatt:', err instanceof Error ? `${err.name}: ${err.message}` : 'Fehler');
    return fehler(c, 500, 'unbekannt', 'In der Werkstatt ist etwas schiefgegangen. Bitte später noch einmal versuchen.');
  });

  return app;
}
