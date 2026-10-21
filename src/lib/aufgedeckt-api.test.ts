import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '../../api/aufgedeckt';

// Außerhalb von Vercel nimmt getCache() einen Speicher im Prozess (runtime-cache.ts) – genug für den Ablauf.
const melden = (kennung: unknown, key = 'geheim') =>
  POST(new Request('https://kurs.invalid/api/aufgedeckt', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-presenter-key': key }, body: JSON.stringify({ kennung }) }));

describe('api/aufgedeckt', () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });

  it('Präsentator deckt auf, alle lesen es; falscher Schlüssel 403, ungültige Kennung 400', async () => {
    vi.stubEnv('PRESENTER_KEY', 'geheim');
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-22T08:05:00Z'));
    expect((await melden('toast', 'falsch')).status).toBe(403);
    expect((await melden('a\nb')).status).toBe(400);
    expect((await melden('toast')).status).toBe(200);
    expect((await melden('mom-test')).status).toBe(200);
    expect(await (await GET()).json()).toStrictEqual({ offen: ['toast', 'mom-test'] });
    // Am nächsten Kurstag gilt der alte Stand nicht.
    vi.setSystemTime(new Date('2026-11-21T09:00:00Z'));
    expect(await (await GET()).json()).toStrictEqual({ offen: [] });
  });

  it('ohne PRESENTER_KEY nimmt niemand Meldungen an (503)', async () => {
    vi.stubEnv('PRESENTER_KEY', '');
    expect((await melden('toast')).status).toBe(503);
  });
});
