// Antwortrunde – Vercel-Funktion wie api/aufgedeckt.ts, hinter dem Kurspasswort (middleware.ts); Logik in lib/antworten.ts.
// POST { runde, rolle, text, id }: alle Angemeldeten, kein Präsentator-Schlüssel. Jede Browser-id hat ihren eigenen Eintrag
// pro Runde und Kurstag und überschreibt nur den. Nach dem Aufdecken nimmt der Server nichts mehr an (409).
// POST { runde, leeren: true }: nur mit Präsentator-Schlüssel (x-presenter-key) – die Runde von heute neu beginnen.
// GET ?runde=…[&id=…]: { anzahl, rollen, frei } immer; die Texte (antworten) nur, wenn die Auflösung der Runde heute
// aufgedeckt ist (Kennung wie <Aufloesung gruppe=…>, Speicher aus api/aufgedeckt.ts) oder ihr `ab` erreicht ist.
// Grenzen: 30 Antworten pro Runde, 4 ids pro Absender-IP (gehasht), dieselbe id höchstens alle 2 s.
// Speicher: Vercel Runtime Cache. Er kann keine Schlüssel aufzählen, darum zusätzlich eine Liste der ids (Index). Der Index
// wird gelesen-geändert-geschrieben; damit zwei gleichzeitige Antworten sich dort nicht verdrängen, prüft der POST nach dem
// Schreiben nach und trägt sich notfalls neu ein, und die Seite schickt ihre Antwort noch einmal, wenn GET ?id= „eigene:
// false“ meldet. Die Antwort selbst liegt unter ihrem eigenen Schlüssel und geht nie verloren.
import { getCache } from '@vercel/functions';
import { json, praesentatorAbweisen } from '../src/lib/praesentator-api.js'; // .js-Endung wie in middleware.ts
import { ohneRuntimeCache } from '../src/lib/runtime-cache.js';
import { aufgedecktSchluessel } from '../src/lib/aufgedeckt.js';
import {
  MAX_ANTWORTEN, MAX_BODY, MAX_IDS_PRO_IP, SPERRE_MS, TTL_SEKUNDEN, absenderHash, absenderIp, absenderSchluessel,
  antwortSchluessel, eingabePruefen, gespeichertPruefen, idPruefen, indexPruefen, indexSchluessel, laufSchluessel,
  rundePruefen, standBauen, texteFrei, type Gespeichert, type Runde,
} from '../src/lib/antworten.js';

const NAME = 'antworten';
/** So oft prüft ein POST nach, ob seine id im Index steht. */
const NACHSEHEN = 4;

type Cache = ReturnType<typeof getCache>;

async function frei(cache: Cache, runde: Runde, jetzt: Date): Promise<boolean> {
  return texteFrei(runde, Boolean(await cache.get(aufgedecktSchluessel(runde.kennung, jetzt))), jetzt);
}

async function lauf(cache: Cache, runde: string, jetzt: Date): Promise<string> {
  const l = await cache.get(laufSchluessel(runde, jetzt));
  return typeof l === 'string' && /^\d{1,16}$/.test(l) ? l : '0';
}

const warten = () => new Promise((r) => setTimeout(r, 30 + Math.random() * 70));

/** id in eine Liste unter `schluessel` eintragen und nachsehen, ob sie dort bleibt (gleichzeitige Schreiber). */
async function eintragen(cache: Cache, schluessel: string, liste: string[], id: string): Promise<void> {
  for (let i = 0; i < NACHSEHEN && !liste.includes(id); i++) {
    await cache.set(schluessel, [...liste, id], { ttl: TTL_SEKUNDEN, name: NAME });
    await warten();
    liste = indexPruefen(await cache.get(schluessel));
  }
}

export async function GET(request: Request): Promise<Response> {
  if (ohneRuntimeCache()) return json({ fehler: 'Runtime Cache nicht verfügbar' }, 503);
  const suche = new URL(request.url).searchParams;
  const name = suche.get('runde');
  const runde = rundePruefen(name);
  if (!runde || !name) return json({ fehler: 'Unbekannte Runde' }, 400);
  const jetzt = new Date();
  const cache = getCache();
  const l = await lauf(cache, name, jetzt);
  const [index, offen] = await Promise.all([cache.get(indexSchluessel(name, jetzt, l)), frei(cache, runde, jetzt)]);
  const ids = [...new Set(indexPruefen(index))].slice(0, MAX_ANTWORTEN);
  const eintraege = (await Promise.all(ids.map(async (id) => {
    const g = gespeichertPruefen(await cache.get(antwortSchluessel(name, id, jetzt, l)));
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
  const jetzt = new Date();

  const b = body as { runde?: unknown; leeren?: unknown } | null;
  if (b?.leeren === true) {
    const abgewiesen = await praesentatorAbweisen(request);
    if (abgewiesen) return abgewiesen;
    if (!rundePruefen(b.runde)) return json({ fehler: 'Unbekannte Runde' }, 400);
    await getCache().set(laufSchluessel(b.runde as string, jetzt), String(jetzt.getTime()), { ttl: TTL_SEKUNDEN, name: NAME });
    return json({ ok: true });
  }

  const e = eingabePruefen(body);
  if (!e) return json({ fehler: 'Ungültige Antwort' }, 400);
  const runde = rundePruefen(e.runde)!;
  const cache = getCache();
  if (await frei(cache, runde, jetzt)) return json({ fehler: 'Schon aufgedeckt' }, 409);
  const l = await lauf(cache, e.runde, jetzt);

  const schluessel = antwortSchluessel(e.runde, e.id, jetzt, l);
  const ixSchluessel = indexSchluessel(e.runde, jetzt, l);
  const ipSchluessel = absenderSchluessel(e.runde, await absenderHash(absenderIp(request.headers)), jetzt, l);
  const [vorherRoh, indexRoh, ipRoh] = await Promise.all([cache.get(schluessel), cache.get(ixSchluessel), cache.get(ipSchluessel)]);
  const vorher = gespeichertPruefen(vorherRoh);
  if (vorher && jetzt.getTime() - vorher.zeit < SPERRE_MS) return json({ fehler: 'Zu schnell' }, 429);
  const index = indexPruefen(indexRoh);
  const vomAbsender = indexPruefen(ipRoh);
  if (!index.includes(e.id)) {
    if (index.length >= MAX_ANTWORTEN) return json({ fehler: 'Zu viele Antworten' }, 429);
    if (!vomAbsender.includes(e.id) && vomAbsender.length >= MAX_IDS_PRO_IP) return json({ fehler: 'Zu viele Antworten von hier' }, 429);
  }

  const eintrag: Gespeichert = { rolle: e.rolle, text: e.text, zeit: jetzt.getTime() };
  await cache.set(schluessel, eintrag, { ttl: TTL_SEKUNDEN, name: NAME });
  // In beide Listen, dann nachsehen: Hat eine gleichzeitige Antwort unsere id überschrieben, noch einmal eintragen.
  await Promise.all([eintragen(cache, ixSchluessel, index, e.id), eintragen(cache, ipSchluessel, vomAbsender, e.id)]);
  return json({ ok: true });
}
