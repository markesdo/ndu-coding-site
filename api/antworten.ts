// Antwortrunde – Vercel-Funktion wie api/aufgedeckt.ts, hinter dem Kurspasswort (middleware.ts); Logik in lib/antworten.ts.
// POST { runde, rolle, text }: alle Angemeldeten, kein Präsentator-Schlüssel. Schreibt den festen Platz der Rolle für heute
// (wer zuletzt schickt, gilt). Nach dem Aufdecken nimmt der Server nichts mehr an (409).
// POST { runde, leeren: true }: nur mit Präsentator-Schlüssel (x-presenter-key) – die Plätze der Runde von heute löschen
// und ihr Aufdecken von heute zurücknehmen (nach einer Probe ist die Runde wieder offen; Aufdecken geht erneut).
// GET ?runde=…: { anzahl, vergeben, frei } immer; die Texte (antworten) nur, wenn die Auflösung der Runde heute aufgedeckt
// ist (Kennung wie <Aufloesung gruppe=…>, Speicher aus api/aufgedeckt.ts) oder ihr `ab` erreicht ist.
// Speicher: Vercel Runtime Cache, ein Schlüssel pro Runde, Kurstag und Rolle – kein Lesen-Ändern-Schreiben, keine Listen.
// Restrisiko: Wer angemeldet ist, kann die Antwort einer Rolle überschreiben (Kurspasswort, 3 Studierende, Leeren, Chat).
// Ein POST, der im selben Augenblick wie das Aufdecken ankommt, kann noch durchrutschen (Prüfen, dann Schreiben) – harmlos.
import { getCache } from '@vercel/functions';
import { json, praesentatorAbweisen } from '../src/lib/praesentator-api.js'; // .js-Endung wie in middleware.ts
import { ohneRuntimeCache } from '../src/lib/runtime-cache.js';
import { aufgedecktSchluessel } from '../src/lib/aufgedeckt.js';
import {
  MAX_BODY, TTL_SEKUNDEN, eingabePruefen, gespeichertPruefen, platzSchluessel, rundePruefen, standBauen, texteFrei,
  type Gespeichert, type Runde,
} from '../src/lib/antworten.js';

type Cache = ReturnType<typeof getCache>;

async function frei(cache: Cache, runde: Runde, jetzt: Date): Promise<boolean> {
  return texteFrei(runde, Boolean(await cache.get(aufgedecktSchluessel(runde.kennung, jetzt))), jetzt);
}

export async function GET(request: Request): Promise<Response> {
  if (ohneRuntimeCache()) return json({ fehler: 'Runtime Cache nicht verfügbar' }, 503);
  const name = new URL(request.url).searchParams.get('runde');
  const runde = rundePruefen(name);
  if (!runde || !name) return json({ fehler: 'Unbekannte Runde' }, 400);
  const jetzt = new Date();
  const cache = getCache();
  const [offen, ...plaetze] = await Promise.all([
    frei(cache, runde, jetzt),
    ...runde.rollen.map(async (r) => gespeichertPruefen(await cache.get(platzSchluessel(name, r.id, jetzt)))),
  ]);
  return json(standBauen(runde, plaetze as (Gespeichert | null)[], offen as boolean));
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
    const runde = rundePruefen(b.runde);
    if (!runde) return json({ fehler: 'Unbekannte Runde' }, 400);
    const cache = getCache();
    await Promise.all([
      ...runde.rollen.map((r) => cache.delete(platzSchluessel(b.runde as string, r.id, jetzt))),
      cache.delete(aufgedecktSchluessel(runde.kennung, jetzt)),
    ]);
    return json({ ok: true });
  }

  const e = eingabePruefen(body);
  if (!e) return json({ fehler: 'Ungültige Antwort' }, 400);
  const cache = getCache();
  if (await frei(cache, e.konfig, jetzt)) return json({ fehler: 'Schon aufgedeckt' }, 409);
  const eintrag: Gespeichert = { text: e.text, zeit: jetzt.getTime() };
  await cache.set(platzSchluessel(e.runde, e.rolle, jetzt), eintrag, { ttl: TTL_SEKUNDEN, name: 'antworten' });
  return json({ ok: true });
}
