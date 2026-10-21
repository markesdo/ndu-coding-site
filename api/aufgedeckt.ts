// Aufdecken für alle – Vercel-Funktion wie api/position.ts, hinter dem Kurspasswort (middleware.ts).
// GET ?k=…&k=…: welche dieser Kennungen heute aufgedeckt sind, für alle Angemeldeten. POST { kennung }: nur mit
// Präsentator-Schlüssel (Header x-presenter-key = PRESENTER_KEY), sonst 403. Speicher: Vercel Runtime Cache, ein Eintrag
// pro Kennung und Kurstag (lib/aufgedeckt.ts) – jede Meldung schreibt nur ihren eigenen, darum geht keine verloren.
import { getCache } from '@vercel/functions';
import { passwortStimmt } from '../src/lib/kurszugang.js'; // .js-Endung wie in middleware.ts
import { ohneRuntimeCache } from '../src/lib/runtime-cache.js';
import { aufgedecktSchluessel, gefragteKennungen, kennungPruefen } from '../src/lib/aufgedeckt.js';

const TTL_SEKUNDEN = 18 * 60 * 60;

function json(daten: unknown, status = 200): Response {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export async function GET(request: Request): Promise<Response> {
  if (ohneRuntimeCache()) return json({ fehler: 'Runtime Cache nicht verfügbar' }, 503);
  const jetzt = new Date();
  const cache = getCache();
  const kennungen = gefragteKennungen(new URL(request.url).searchParams);
  const gesetzt = await Promise.all(kennungen.map(async (k) => Boolean(await cache.get(aufgedecktSchluessel(k, jetzt)))));
  return json({ offen: kennungen.filter((_, i) => gesetzt[i]) });
}

export async function POST(request: Request): Promise<Response> {
  const key = process.env.PRESENTER_KEY;
  if (!key || ohneRuntimeCache()) return json({ fehler: 'Nicht eingerichtet' }, 503);
  const eingabe = request.headers.get('x-presenter-key') ?? '';
  if (!eingabe || !(await passwortStimmt(eingabe, key, key))) return json({ fehler: 'Falscher Präsentator-Schlüssel' }, 403);
  const body: unknown = await request.json().catch(() => null);
  const kennung = kennungPruefen((body as { kennung?: unknown } | null)?.kennung);
  if (!kennung) return json({ fehler: 'Ungültige Kennung' }, 400);
  await getCache().set(aufgedecktSchluessel(kennung, new Date()), true, { ttl: TTL_SEKUNDEN, name: 'aufgedeckt' });
  return json({ ok: true });
}
