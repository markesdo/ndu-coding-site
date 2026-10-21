// „Wo ist Markus?“ – Vercel-Funktion neben der statischen Astro-Seite. Liegt hinter dem Kurspasswort (middleware.ts).
// GET: letzte Position für alle Angemeldeten. POST: nur mit Präsentator-Schlüssel (Header x-presenter-key = PRESENTER_KEY);
// falscher Schlüssel → 403 (401 heißt: Kurspasswort fehlt, kommt aus der Middleware). Body { aus: true } = Pause:
// Position löschen, damit der Knopf bei den Studierenden gleich verschwindet. Body { pruefen: true } = Anmeldung auf
// /praesentator: nur den Schlüssel prüfen, nichts speichern.
// Speicher: Vercel Runtime Cache – flüchtig, reicht für „wo ist er gerade“; der Beamer-Tab sendet jede Minute neu.
import { getCache } from '@vercel/functions';
import { json, praesentatorAbweisen } from '../src/lib/praesentator-api.js'; // .js-Endung wie in middleware.ts
import { ohneRuntimeCache } from '../src/lib/runtime-cache.js';
import { positionPruefen, type Position } from '../src/lib/position.js';

const SCHLUESSEL = 'position';
const TTL_SEKUNDEN = 6 * 60 * 60;

type Gespeichert = Position & { zeit: number };

export async function GET(): Promise<Response> {
  if (ohneRuntimeCache()) return json({ fehler: 'Runtime Cache nicht verfügbar' }, 503);
  const gespeichert = (await getCache().get(SCHLUESSEL)) as Gespeichert | undefined;
  if (!gespeichert) return json({ position: null, jetzt: Date.now() });
  const { zeit, ...position } = gespeichert;
  return json({ position, zeit, jetzt: Date.now() });
}

export async function POST(request: Request): Promise<Response> {
  const abgewiesen = await praesentatorAbweisen(request);
  if (abgewiesen) return abgewiesen;
  const body: unknown = await request.json().catch(() => null);
  if ((body as { pruefen?: unknown } | null)?.pruefen === true) return json({ ok: true });
  if ((body as { aus?: unknown } | null)?.aus === true) {
    await getCache().delete(SCHLUESSEL);
    return json({ ok: true });
  }
  const position = positionPruefen(body);
  if (!position) return json({ fehler: 'Ungültige Position' }, 400);
  const gespeichert: Gespeichert = { ...position, zeit: Date.now() };
  await getCache().set(SCHLUESSEL, gespeichert, { ttl: TTL_SEKUNDEN, name: 'wo-ist-markus' });
  return json({ ok: true });
}
