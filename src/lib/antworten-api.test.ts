import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '../../api/antworten';
import { aufgedecktSchluessel } from './aufgedeckt';
import { MAX_ANTWORTEN, MAX_IDS_PRO_IP } from './antworten';

// Speicher wie der Runtime Cache; jeder Zugriff braucht etwas Zeit, damit gleichzeitige Antworten wirklich überlappen.
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
const id = (c: string) => c.repeat(16);
const senden = (body: unknown, kopf: Record<string, string> = {}) =>
  POST(new Request(URL_API, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-real-ip': '203.0.113.1', ...kopf }, body: typeof body === 'string' ? body : JSON.stringify(body) }));
// Jede id kommt standardmäßig von ihrer eigenen IP (wie drei Studierende zu Hause); ip setzt sie ausdrücklich.
const antwort = (i: string, rolle: string, text: string, ip = `ip-${i}`) => senden({ runde: 'netflix', rolle, text, id: i }, { 'x-real-ip': ip });
const leeren = (key?: string) => senden({ runde: 'netflix', leeren: true }, key ? { 'x-presenter-key': key } : {});
const lesen = async (extra = '') => (await GET(new Request(`${URL_API}?runde=netflix${extra}`))).json();
const aufdecken = () => daten.set(aufgedecktSchluessel('netflix', new Date()), true);
const spaeter = (ms: number) => vi.setSystemTime(new Date(Date.now() + ms));

describe('api/antworten', () => {
  beforeEach(() => {
    daten.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-12T13:10:00Z')); // Tag 2, 14:10 Wien
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

  it('vor dem Aufdecken nur Zahlen, danach die Texte; danach nimmt der Server nichts mehr an', async () => {
    expect((await antwort(id('a'), 'design', 'Wie sucht man einen Titel?')).status).toBe(200);
    expect((await antwort(id('b'), 'entwicklung', '<b>Kinderfilme</b>')).status).toBe(200);
    expect(await lesen()).toStrictEqual({ anzahl: 2, rollen: { produktmanagement: 0, design: 1, entwicklung: 1 }, frei: false });
    aufdecken();
    expect(await lesen()).toStrictEqual({
      anzahl: 2, rollen: { produktmanagement: 0, design: 1, entwicklung: 1 }, frei: true,
      antworten: [{ rolle: 'design', text: 'Wie sucht man einen Titel?' }, { rolle: 'entwicklung', text: '<b>Kinderfilme</b>' }],
    });
    spaeter(5000);
    expect((await antwort(id('a'), 'design', 'geändert')).status).toBe(409);
  });

  it('Präsentator-Schlüssel ändert nichts: Texte erst nach dem Aufdecken', async () => {
    vi.stubEnv('PRESENTER_KEY', 'geheim');
    await antwort(id('a'), 'design', 'geheim bis zum Zeichen');
    const r = await GET(new Request(`${URL_API}?runde=netflix`, { headers: { 'x-presenter-key': 'geheim' } }));
    expect(JSON.stringify(await r.json())).not.toContain('geheim bis zum Zeichen');
  });

  it('jede id überschreibt nur ihre eigene Antwort; zu schnell → 429', async () => {
    await antwort(id('a'), 'design', 'erste Fassung');
    expect((await antwort(id('a'), 'design', 'zu schnell')).status).toBe(429);
    await antwort(id('b'), 'produktmanagement', 'von b');
    spaeter(2500);
    expect((await antwort(id('a'), 'entwicklung', 'zweite Fassung')).status).toBe(200);
    aufdecken();
    expect((await lesen()).antworten).toStrictEqual([
      { rolle: 'produktmanagement', text: 'von b' },
      { rolle: 'entwicklung', text: 'zweite Fassung' },
    ]);
  });

  it('höchstens MAX_ANTWORTEN pro Runde; wer schon drin ist, darf weiter ändern', async () => {
    const ids = Array.from({ length: MAX_ANTWORTEN }, (_, i) => `id-${String(i).padStart(13, '0')}`);
    for (const i of ids) expect((await antwort(i, 'design', 'x')).status).toBe(200);
    expect((await antwort(id('z'), 'design', 'eine zu viel')).status).toBe(429);
    spaeter(2500);
    expect((await antwort(ids[0], 'design', 'geändert')).status).toBe(200);
    expect((await lesen()).anzahl).toBe(MAX_ANTWORTEN);
  });

  it('gleichzeitige Antworten: keine geht im Index verloren; ?id= meldet die eigene', async () => {
    const r = await Promise.all(['a', 'b', 'c', 'd'].map((c) => antwort(id(c), 'design', c)));
    expect(r.map((x) => x.status)).toStrictEqual([200, 200, 200, 200]);
    expect((await lesen()).anzahl).toBe(4);
    expect((await lesen(`&id=${id('c')}`)).eigene).toBe(true);
    expect((await lesen(`&id=${id('y')}`)).eigene).toBe(false);
  });

  it('ungültige Eingaben: 400/413, nichts gespeichert', async () => {
    expect((await antwort(id('a'), 'marketing', 'x')).status).toBe(400);
    expect((await antwort(id('a'), 'design', 'x'.repeat(201))).status).toBe(400);
    expect((await antwort('kurz', 'design', 'x')).status).toBe(400);
    expect((await senden({ runde: 'zwoelf', text: 'x', id: id('a') })).status).toBe(400);
    expect((await senden('kein json')).status).toBe(400);
    expect((await senden({ runde: 'netflix', rolle: 'design', text: 'x', id: id('a'), pad: 'x'.repeat(5000) })).status).toBe(413);
    expect((await GET(new Request(`${URL_API}?runde=gibtsnicht`))).status).toBe(400);
    expect((await lesen()).anzahl).toBe(0);
  });

  it('am nächsten Kurstag zählt der alte Stand nicht', async () => {
    await antwort(id('a'), 'design', 'x');
    vi.setSystemTime(new Date('2026-11-19T13:10:00Z'));
    expect((await lesen()).anzahl).toBe(0);
  });

  it(`höchstens ${MAX_IDS_PRO_IP} ids pro Absender-IP; andere IPs und schon gezählte ids sind nicht betroffen`, async () => {
    const ids = ['a', 'b', 'c', 'd', 'e'].map(id);
    for (const i of ids.slice(0, MAX_IDS_PRO_IP)) expect((await antwort(i, 'design', 'x', '198.51.100.9')).status).toBe(200);
    expect((await antwort(ids[MAX_IDS_PRO_IP], 'design', 'x', '198.51.100.9')).status).toBe(429);
    expect((await antwort(id('f'), 'design', 'x', '198.51.100.10')).status).toBe(200);
    spaeter(2500);
    expect((await antwort(ids[0], 'entwicklung', 'geändert', '198.51.100.9')).status).toBe(200);
    expect((await lesen()).anzahl).toBe(MAX_IDS_PRO_IP + 1);
  });

  it('viele neue ids gleichzeitig vom selben Absender: nach dem Nachzählen höchstens MAX_IDS_PRO_IP', async () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(id);
    await Promise.all(ids.map((i) => antwort(i, 'design', 'x', '198.51.100.9')));
    expect((await lesen()).anzahl).toBeLessThanOrEqual(MAX_IDS_PRO_IP);
    // Was zurückgenommen wurde, liegt auch nicht mehr als Antwort im Speicher.
    expect([...daten.keys()].filter((k) => k.startsWith('antwort:')).length).toBeLessThanOrEqual(MAX_IDS_PRO_IP);
  });

  it('IPv6: ein /64 ist ein Absender', async () => {
    for (const [i, c] of ['a', 'b', 'c', 'd'].entries()) expect((await antwort(id(c), 'design', 'x', `2001:db8:1:2::${i + 1}`)).status).toBe(200);
    expect((await antwort(id('e'), 'design', 'x', '2001:db8:1:2:ffff:1:2:3')).status).toBe(429);
    expect((await antwort(id('f'), 'design', 'x', '2001:db8:1:3::1')).status).toBe(200);
  });

  it('Runde leeren: nur mit Präsentator-Schlüssel; danach zählt nichts mehr, auch die IP-Grenze nicht', async () => {
    vi.stubEnv('PRESENTER_KEY', 'geheim');
    for (const c of ['a', 'b', 'c', 'd']) await antwort(id(c), 'design', c, '198.51.100.9');
    expect((await antwort(id('e'), 'design', 'x', '198.51.100.9')).status).toBe(429);
    expect((await leeren()).status).toBe(403);
    expect((await leeren('falsch')).status).toBe(403);
    expect((await lesen()).anzahl).toBe(4);
    spaeter(10);
    expect((await leeren('geheim')).status).toBe(200);
    expect(await lesen()).toStrictEqual({ anzahl: 0, rollen: { produktmanagement: 0, design: 0, entwicklung: 0 }, frei: false });
    expect((await antwort(id('e'), 'design', 'neu', '198.51.100.9')).status).toBe(200);
    expect((await lesen()).anzahl).toBe(1);
  });

  it('Runde leeren ohne PRESENTER_KEY: 503, nichts geleert', async () => {
    vi.stubEnv('PRESENTER_KEY', '');
    await antwort(id('a'), 'design', 'x');
    expect((await leeren('irgendwas')).status).toBe(503);
    expect((await lesen()).anzahl).toBe(1);
  });

  it('ohne Runtime Cache auf Vercel: 503', async () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('RUNTIME_CACHE_ENDPOINT', '');
    expect((await GET(new Request(`${URL_API}?runde=netflix`))).status).toBe(503);
    expect((await antwort(id('a'), 'design', 'x')).status).toBe(503);
  });
});
