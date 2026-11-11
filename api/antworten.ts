// Antwortrunde – Vercel-Funktion wie api/aufgedeckt.ts, hinter dem Kurspasswort (middleware.ts); Logik in lib/antworten.ts.
// POST { runde, rolle, text, id }: alle Angemeldeten, kein Präsentator-Schlüssel. Jede Browser-id hat ihren eigenen Eintrag
// pro Runde und Kurstag und überschreibt nur den. Nach dem Aufdecken nimmt der Server nichts mehr an (409).
// GET ?runde=…[&id=…]: { anzahl, rollen, frei } immer; die Texte (antworten) nur, wenn die Auflösung der Runde heute
// aufgedeckt ist (Kennung wie <Aufloesung gruppe=…>, Speicher aus api/aufgedeckt.ts) oder ihr `ab` erreicht ist.
// Speicher: Vercel Runtime Cache. Er kann keine Schlüssel aufzählen, darum zusätzlich eine Liste der ids (Index). Der Index
// wird gelesen-geändert-geschrieben; damit zwei gleichzeitige Antworten sich dort nicht verdrängen, prüft der POST nach dem
// Schreiben nach und trägt sich notfalls neu ein, und die Seite schickt ihre Antwort noch einmal, wenn GET ?id= „eigene:
// false“ meldet. Die Antwort selbst liegt unter ihrem eigenen Schlüssel und geht nie verloren.
import { getCache } from '@vercel/functions';
import { json } from '../src/lib/praesentator-api.js'; // .js-Endung wie in middleware.ts
import { ohneRuntimeCache } from '../src/lib/runtime-cache.js';
import { aufgedecktSchluessel } from '../src/lib/aufgedeckt.js';
import {
  MAX_ANTWORTEN, MAX_BODY, SPERRE_MS, TTL_SEKUNDEN, antwortSchluessel, eingabePruefen, gespeichertPruefen, idPruefen,
  indexPruefen, indexSchluessel, rundePruefen, standBauen, texteFrei, type Gespeichert, type Runde,
} from '../src/lib/antworten.js';

const NAME = 'antworten';
/** So oft prüft ein POST nach, ob seine id im Index steht. */
const NACHSEHEN = 4;

type Cache = ReturnType<typeof getCache>;

async function frei(cache: Cache, runde: Runde, jetzt: Date): Promise<boolean> {
  return texteFrei(runde, Boolean(await cache.get(aufgedecktSchluessel(runde.kennung, jetzt))), jetzt);
}

export async function GET(request: Request): Promise<Response> {
  if (ohneRuntimeCache()) return json({ fehler: 'Runtime Cache nicht verfügbar' }, 503);
  const suche = new URL(request.url).searchParams;
  const name = suche.get('runde');
  const runde = rundePruefen(name);
  if (!runde || !name) return json({ fehler: 'Unbekannte Runde' }, 400);
  const jetzt = new Date();
  const cache = getCache();
  const [index, offen] = await Promise.all([cache.get(indexSchluessel(name, jetzt)), frei(cache, runde, jetzt)]);
  const ids = [...new Set(indexPruefen(index))].slice(0, MAX_ANTWORTEN);
  const eintraege = (await Promise.all(ids.map(async (id) => {
    const g = gespeichertPruefen(await cache.get(antwortSchluessel(name, id, jetzt)));
    return g ? { ...g, id } : null;
  }))).filter((e): e is Gespeichert & { id: string } => e !== null);
  return json(standBauen(runde, eintraege, offen, idPruefen(suche.get('id'))));
}

export async function POST(request: Request): Promise<Response> {
  if (ohneRuntimeCache()) return json({ fehler: 'Runtime Cache nicht verfügbar' }, 503);
  const roh = await request.text().catch(() => '');
  if (roh.length > MAX_BODY) return json({ fehler: 'Zu groß' }, 413);
  let body: unknown = null;
  try { body = JSON.parse(roh); } catch { /* bleibt null → 400 */ }
  const e = eingabePruefen(body);
  if (!e) return json({ fehler: 'Ungültige Antwort' }, 400);
  const runde = rundePruefen(e.runde)!;
  const jetzt = new Date();
  const cache = getCache();
  if (await frei(cache, runde, jetzt)) return json({ fehler: 'Schon aufgedeckt' }, 409);

  const schluessel = antwortSchluessel(e.runde, e.id, jetzt);
  const vorher = gespeichertPruefen(await cache.get(schluessel));
  if (vorher && jetzt.getTime() - vorher.zeit < SPERRE_MS) return json({ fehler: 'Zu schnell' }, 429);
  const ixSchluessel = indexSchluessel(e.runde, jetzt);
  const index = indexPruefen(await cache.get(ixSchluessel));
  if (!index.includes(e.id) && index.length >= MAX_ANTWORTEN) return json({ fehler: 'Zu viele Antworten' }, 429);

  const eintrag: Gespeichert = { rolle: e.rolle, text: e.text, zeit: jetzt.getTime() };
  await cache.set(schluessel, eintrag, { ttl: TTL_SEKUNDEN, name: NAME });
  // In den Index, dann nachsehen: Hat eine gleichzeitige Antwort unsere id überschrieben, noch einmal eintragen.
  let liste = index;
  for (let i = 0; i < NACHSEHEN && !liste.includes(e.id); i++) {
    await cache.set(ixSchluessel, [...liste, e.id], { ttl: TTL_SEKUNDEN, name: NAME });
    await new Promise((r) => setTimeout(r, 30 + Math.random() * 70));
    liste = indexPruefen(await cache.get(ixSchluessel));
  }
  return json({ ok: true });
}
