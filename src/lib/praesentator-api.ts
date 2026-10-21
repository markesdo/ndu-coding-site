// Gemeinsam für api/position.ts und api/aufgedeckt.ts: JSON-Antwort ohne Cache und der Schutz der Schreibzugriffe.
// .js-Endungen: Vercel lädt das per Node-ESM (lib/api-importe.test.ts).
import { passwortStimmt } from './kurszugang.js';
import { ohneRuntimeCache } from './runtime-cache.js';

export function json(daten: unknown, status = 200): Response {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

/** Schreiben nur mit Präsentator-Schlüssel (Header x-presenter-key = PRESENTER_KEY). null = erlaubt, sonst die Antwort:
 *  503 ohne PRESENTER_KEY oder Runtime Cache, 403 bei fehlendem oder falschem Schlüssel. */
export async function praesentatorAbweisen(request: Request): Promise<Response | null> {
  const key = process.env.PRESENTER_KEY;
  if (!key || ohneRuntimeCache()) return json({ fehler: 'Nicht eingerichtet' }, 503);
  const eingabe = request.headers.get('x-presenter-key') ?? '';
  if (!eingabe || !(await passwortStimmt(eingabe, key, key))) return json({ fehler: 'Falscher Präsentator-Schlüssel' }, 403);
  return null;
}
