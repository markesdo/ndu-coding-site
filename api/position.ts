// „Wo ist Markus?“ – Vercel-Funktion neben der statischen Astro-Seite. Liegt hinter dem Kurspasswort (middleware.ts).
// GET: letzte Position für alle Angemeldeten. POST: nur mit Präsentator-Schlüssel (Header x-presenter-key = PRESENTER_KEY);
// falscher Schlüssel → 403 (401 heißt: Kurspasswort fehlt, kommt aus der Middleware).
// Speicher: Vercel Runtime Cache – flüchtig, reicht für „wo ist er gerade“; der Beamer-Tab sendet jede Minute neu.
import { getCache } from '@vercel/functions';
import { passwortStimmt } from '../src/lib/kurszugang.js'; // .js-Endung wie in middleware.ts
import { positionPruefen, type Position } from '../src/lib/position.js';

const SCHLUESSEL = 'position';
const TTL_SEKUNDEN = 6 * 60 * 60;

type Gespeichert = Position & { zeit: number };

function json(daten: unknown, status = 200): Response {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

// getCache() nimmt den echten Runtime Cache aus dem Anfrage-Kontext (in @vercel/functions: getContext().cache, nicht
// exportiert – gleiches Symbol wie dort), sonst den Build-Cache über RUNTIME_CACHE_ENDPOINT, sonst still einen
// Speicher pro Instanz. Auf Vercel hieße Letzteres: Studierende sehen je nach Instanz etwas anderes – lieber laut scheitern.
const KONTEXT = Symbol.for('@vercel/request-context');
function ohneRuntimeCache(): boolean {
  const kontext = (globalThis as Record<symbol, { get?: () => { cache?: unknown } } | undefined>)[KONTEXT]?.get?.();
  return Boolean(process.env.VERCEL) && !kontext?.cache && !process.env.RUNTIME_CACHE_ENDPOINT;
}

export async function GET(): Promise<Response> {
  if (ohneRuntimeCache()) return json({ fehler: 'Runtime Cache nicht verfügbar' }, 503);
  const gespeichert = (await getCache().get(SCHLUESSEL)) as Gespeichert | undefined;
  if (!gespeichert) return json({ position: null, jetzt: Date.now() });
  const { zeit, ...position } = gespeichert;
  return json({ position, zeit, jetzt: Date.now() });
}

export async function POST(request: Request): Promise<Response> {
  const key = process.env.PRESENTER_KEY;
  if (!key || ohneRuntimeCache()) return json({ fehler: 'Nicht eingerichtet' }, 503);
  const eingabe = request.headers.get('x-presenter-key') ?? '';
  if (!eingabe || !(await passwortStimmt(eingabe, key, key))) return json({ fehler: 'Falscher Präsentator-Schlüssel' }, 403);
  const position = positionPruefen(await request.json().catch(() => null));
  if (!position) return json({ fehler: 'Ungültige Position' }, 400);
  const gespeichert: Gespeichert = { ...position, zeit: Date.now() };
  await getCache().set(SCHLUESSEL, gespeichert, { ttl: TTL_SEKUNDEN, name: 'wo-ist-markus' });
  return json({ ok: true });
}
