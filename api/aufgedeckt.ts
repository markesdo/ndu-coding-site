// Aufdecken für alle – Vercel-Funktion wie api/position.ts, hinter dem Kurspasswort (middleware.ts).
// GET: was heute aufgedeckt ist, für alle Angemeldeten. POST { kennung }: nur mit Präsentator-Schlüssel (Header
// x-presenter-key = PRESENTER_KEY), sonst 403. Speicher: Vercel Runtime Cache, ein Eintrag pro Kurstag (lib/aufgedeckt.ts).
import { getCache } from '@vercel/functions';
import { passwortStimmt } from '../src/lib/kurszugang.js'; // .js-Endung wie in middleware.ts
import { ohneRuntimeCache } from '../src/lib/runtime-cache.js';
import { aufdecken, heuteOffen, kennungPruefen, type Aufgedeckt } from '../src/lib/aufgedeckt.js';

const SCHLUESSEL = 'aufgedeckt';
const TTL_SEKUNDEN = 18 * 60 * 60;

function json(daten: unknown, status = 200): Response {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export async function GET(): Promise<Response> {
  if (ohneRuntimeCache()) return json({ fehler: 'Runtime Cache nicht verfügbar' }, 503);
  const stand = (await getCache().get(SCHLUESSEL)) as Aufgedeckt | undefined;
  return json({ offen: heuteOffen(stand, new Date()) });
}

export async function POST(request: Request): Promise<Response> {
  const key = process.env.PRESENTER_KEY;
  if (!key || ohneRuntimeCache()) return json({ fehler: 'Nicht eingerichtet' }, 503);
  const eingabe = request.headers.get('x-presenter-key') ?? '';
  if (!eingabe || !(await passwortStimmt(eingabe, key, key))) return json({ fehler: 'Falscher Präsentator-Schlüssel' }, 403);
  const body: unknown = await request.json().catch(() => null);
  const kennung = kennungPruefen((body as { kennung?: unknown } | null)?.kennung);
  if (!kennung) return json({ fehler: 'Ungültige Kennung' }, 400);
  const cache = getCache();
  const stand = aufdecken((await cache.get(SCHLUESSEL)) as Aufgedeckt | undefined, kennung, new Date());
  await cache.set(SCHLUESSEL, stand, { ttl: TTL_SEKUNDEN, name: 'aufgedeckt' });
  return json({ ok: true, offen: stand.offen });
}
