import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '../../api/aufgedeckt';

// Speicher wie der Runtime Cache, aber jeder Zugriff braucht etwas Zeit – so überlappen gleichzeitige Meldungen wirklich
// (ein Speicher, der sofort antwortet, verdeckte verlorene Updates).
vi.mock('@vercel/functions', () => {
  const daten = new Map<string, unknown>();
  const dauer = () => new Promise((r) => setTimeout(r, 5));
  return {
    getCache: () => ({
      get: async (k: string) => { await dauer(); return daten.get(k); },
      set: async (k: string, v: unknown) => { await dauer(); daten.set(k, v); },
    }),
  };
});
const URL_API = 'https://kurs.invalid/api/aufgedeckt';
const melden = (kennung: unknown, key = 'geheim') =>
  POST(new Request(URL_API, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-presenter-key': key }, body: JSON.stringify({ kennung }) }));
const lesen = async (...k: string[]) => (await GET(new Request(`${URL_API}?${new URLSearchParams(k.map((x) => ['k', x]))}`))).json();

describe('api/aufgedeckt', () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });

  it('Präsentator deckt auf, alle lesen es; falscher Schlüssel 403, ungültige Kennung 400', async () => {
    vi.stubEnv('PRESENTER_KEY', 'geheim');
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-22T08:05:00Z'));
    expect((await melden('toast', 'falsch')).status).toBe(403);
    expect((await melden('a\nb')).status).toBe(400);
    expect(await lesen('toast', 'mom-test')).toStrictEqual({ offen: [] });
    expect((await melden('toast')).status).toBe(200);
    expect((await melden('mom-test')).status).toBe(200);
    expect(await lesen('toast', 'mom-test', 'lego')).toStrictEqual({ offen: ['toast', 'mom-test'] });
    // Am nächsten Kurstag gilt der alte Stand nicht.
    vi.setSystemTime(new Date('2026-11-21T09:00:00Z'));
    expect(await lesen('toast', 'mom-test')).toStrictEqual({ offen: [] });
  });

  it('zwei Meldungen zugleich: keine geht verloren', async () => {
    vi.stubEnv('PRESENTER_KEY', 'geheim');
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-29T08:05:00Z'));
    const kennungen = ['a', 'b', 'c', 'd'];
    expect((await Promise.all(kennungen.map((k) => melden(k)))).map((r) => r.status)).toStrictEqual([200, 200, 200, 200]);
    expect(await lesen(...kennungen)).toStrictEqual({ offen: kennungen });
  });

  it('ohne PRESENTER_KEY nimmt niemand Meldungen an (503)', async () => {
    vi.stubEnv('PRESENTER_KEY', '');
    expect((await melden('toast')).status).toBe(503);
  });
});
