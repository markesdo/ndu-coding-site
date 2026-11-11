import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '../../api/antworten';
import { aufgedecktSchluessel } from './aufgedeckt';

// Speicher wie der Runtime Cache; jeder Zugriff braucht etwas Zeit, damit gleichzeitige Anfragen wirklich überlappen.
const daten = vi.hoisted(() => new Map<string, unknown>());
vi.mock('@vercel/functions', () => {
  const dauer = () => new Promise((r) => setTimeout(r, 5));
  return {
    getCache: () => ({
      get: async (k: string) => { await dauer(); return daten.get(k); },
      set: async (k: string, v: unknown) => { await dauer(); daten.set(k, structuredClone(v)); },
      delete: async (k: string) => { await dauer(); daten.delete(k); },
    }),
  };
});

const URL_API = 'https://kurs.invalid/api/antworten';
const senden = (body: unknown, kopf: Record<string, string> = {}) =>
  POST(new Request(URL_API, { method: 'POST', headers: { 'Content-Type': 'application/json', ...kopf }, body: typeof body === 'string' ? body : JSON.stringify(body) }));
const antwort = (rolle: string, text: string) => senden({ runde: 'netflix', rolle, text });
const leeren = (key?: string) => senden({ runde: 'netflix', leeren: true }, key ? { 'x-presenter-key': key } : {});
const lesen = async () => (await GET(new Request(`${URL_API}?runde=netflix`))).json();
const aufdecken = () => daten.set(aufgedecktSchluessel('netflix', new Date()), true);

describe('api/antworten', () => {
  beforeEach(() => {
    daten.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-12T13:10:00Z')); // Tag 2, 14:10 Wien
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

  it('vor dem Aufdecken nur die vergebenen Rollen, danach die Texte; danach nimmt der Server nichts mehr an', async () => {
    expect((await antwort('design', 'Wie sucht man einen Titel?')).status).toBe(200);
    expect((await antwort('entwicklung', '<b>Kinderfilme</b>')).status).toBe(200);
    expect(await lesen()).toStrictEqual({ anzahl: 2, vergeben: ['design', 'entwicklung'], frei: false });
    aufdecken();
    expect(await lesen()).toStrictEqual({
      anzahl: 2, vergeben: ['design', 'entwicklung'], frei: true,
      antworten: [{ rolle: 'design', text: 'Wie sucht man einen Titel?' }, { rolle: 'entwicklung', text: '<b>Kinderfilme</b>' }],
    });
    expect((await antwort('design', 'geändert')).status).toBe(409);
    expect((await lesen()).antworten[0].text).toBe('Wie sucht man einen Titel?');
  });

  it('Präsentator-Schlüssel ändert nichts: Texte erst nach dem Aufdecken', async () => {
    vi.stubEnv('PRESENTER_KEY', 'geheim');
    await antwort('design', 'geheim bis zum Zeichen');
    const r = await GET(new Request(`${URL_API}?runde=netflix`, { headers: { 'x-presenter-key': 'geheim' } }));
    expect(JSON.stringify(await r.json())).not.toContain('geheim bis zum Zeichen');
  });

  it('dieselbe Rolle überschreibt ihren Platz; die anderen Rollen bleiben', async () => {
    await antwort('produktmanagement', 'von PM');
    await antwort('design', 'erste Fassung');
    await antwort('design', 'zweite Fassung');
    expect((await lesen()).anzahl).toBe(2);
    aufdecken();
    expect((await lesen()).antworten).toStrictEqual([
      { rolle: 'produktmanagement', text: 'von PM' },
      { rolle: 'design', text: 'zweite Fassung' },
    ]);
  });

  it('gleichzeitige Antworten verschiedener Rollen: keine geht verloren; höchstens drei Schlüssel', async () => {
    const r = await Promise.all(['produktmanagement', 'design', 'entwicklung', 'design'].map((x) => antwort(x, x)));
    expect(r.map((x) => x.status)).toStrictEqual([200, 200, 200, 200]);
    expect((await lesen()).vergeben).toStrictEqual(['produktmanagement', 'design', 'entwicklung']);
    expect([...daten.keys()].filter((k) => k.startsWith('antwort:'))).toHaveLength(3);
  });

  it('ungültige Eingaben: 400/413, nichts gespeichert', async () => {
    expect((await antwort('marketing', 'x')).status).toBe(400);
    expect((await antwort('design', 'x'.repeat(201))).status).toBe(400);
    expect((await antwort('design', '   ')).status).toBe(400);
    expect((await senden({ runde: 'zwoelf', rolle: 'design', text: 'x' })).status).toBe(400);
    expect((await senden('kein json')).status).toBe(400);
    expect((await senden({ runde: 'netflix', rolle: 'design', text: 'x', pad: 'x'.repeat(5000) })).status).toBe(413);
    expect((await GET(new Request(`${URL_API}?runde=gibtsnicht`))).status).toBe(400);
    expect((await lesen()).anzahl).toBe(0);
    expect(daten.size).toBe(0);
  });

  it('Runde leeren: nur mit Präsentator-Schlüssel; danach leer', async () => {
    vi.stubEnv('PRESENTER_KEY', 'geheim');
    await antwort('design', 'a');
    await antwort('entwicklung', 'b');
    expect((await leeren()).status).toBe(403);
    expect((await leeren('falsch')).status).toBe(403);
    expect((await lesen()).anzahl).toBe(2);
    expect((await leeren('geheim')).status).toBe(200);
    expect(await lesen()).toStrictEqual({ anzahl: 0, vergeben: [], frei: false });
    expect((await antwort('design', 'neu')).status).toBe(200);
    expect((await lesen()).anzahl).toBe(1);
  });

  it('Runde leeren ohne PRESENTER_KEY: 503, nichts geleert', async () => {
    vi.stubEnv('PRESENTER_KEY', '');
    await antwort('design', 'x');
    expect((await leeren('irgendwas')).status).toBe(503);
    expect((await lesen()).anzahl).toBe(1);
  });

  it('am nächsten Kurstag zählt der alte Stand nicht', async () => {
    await antwort('design', 'x');
    vi.setSystemTime(new Date('2026-11-19T13:10:00Z'));
    expect((await lesen()).anzahl).toBe(0);
  });

  it('ohne Runtime Cache auf Vercel: 503', async () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('RUNTIME_CACHE_ENDPOINT', '');
    expect((await GET(new Request(`${URL_API}?runde=netflix`))).status).toBe(503);
    expect((await antwort('design', 'x')).status).toBe(503);
  });
});
