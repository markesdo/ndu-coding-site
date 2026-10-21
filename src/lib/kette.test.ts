import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { abfrageKette, jsonHolen, zeitlimit } from './kette';

describe('abfrageKette', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

  it('plant die nächste Runde mit der Wartezeit, die die Runde zurückgibt', async () => {
    const runde = vi.fn(async () => 5000);
    abfrageKette({ runde, ruht: () => false, ruheMs: 1000 }).planen(0);
    await vi.advanceTimersByTimeAsync(0);
    expect(runde).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(4999);
    expect(runde).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(runde).toHaveBeenCalledTimes(2);
  });

  it('immer nur eine Runde zugleich – sofort() während einer Anfrage startet keine zweite', async () => {
    let fertig!: (ms: number) => void;
    const runde = vi.fn(() => new Promise<number>((r) => { fertig = r; }));
    const k = abfrageKette({ runde, ruht: () => false, ruheMs: 1000 });
    k.sofort();
    await vi.advanceTimersByTimeAsync(0);
    k.sofort();
    await vi.advanceTimersByTimeAsync(0);
    expect(runde).toHaveBeenCalledTimes(1);
    fertig(2000);
    await vi.advanceTimersByTimeAsync(2000);
    expect(runde).toHaveBeenCalledTimes(2);
  });

  it('ruht: keine Anfrage, ruhend() aufgerufen, in ruheMs wieder nachsehen', async () => {
    let ruht = true;
    const runde = vi.fn(async () => 5000);
    const ruhend = vi.fn();
    abfrageKette({ runde, ruht: () => ruht, ruhend, ruheMs: 1000 }).sofort();
    await vi.advanceTimersByTimeAsync(0);
    expect(runde).not.toHaveBeenCalled();
    expect(ruhend).toHaveBeenCalledTimes(1);
    ruht = false;
    await vi.advanceTimersByTimeAsync(1000);
    expect(runde).toHaveBeenCalledTimes(1);
  });

  it('reißt nach einer Ausnahme nicht ab', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const runde = vi.fn().mockRejectedValueOnce(new Error('kaputt')).mockResolvedValue(5000);
    abfrageKette({ runde, ruht: () => false, ruheMs: 1000 }).sofort();
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(1000);
    expect(runde).toHaveBeenCalledTimes(2);
  });

  it('ruht() oder ruhend() werfen: die Kette läuft weiter', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    let mal = 0;
    const runde = vi.fn(async () => 5000);
    abfrageKette({ runde, ruht: () => { if (mal++ === 0) throw new Error('localStorage gesperrt'); return false; }, ruheMs: 1000 }).sofort();
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(1000);
    expect(runde).toHaveBeenCalledTimes(1);
  });

  it('stoppen() in der laufenden Runde: keine weitere, auch nicht per sofort()', async () => {
    let k!: ReturnType<typeof abfrageKette>;
    const runde = vi.fn(async () => { k.stoppen(); return 1000; });
    k = abfrageKette({ runde, ruht: () => false, ruheMs: 1000 });
    k.sofort();
    await vi.advanceTimersByTimeAsync(5000);
    expect(runde).toHaveBeenCalledTimes(1);
    k.sofort();
    await vi.advanceTimersByTimeAsync(5000);
    expect(runde).toHaveBeenCalledTimes(1);
  });

  it('stoppen() hebt eine schon geplante Runde auf', async () => {
    const runde = vi.fn(async () => 1000);
    const k = abfrageKette({ runde, ruht: () => false, ruheMs: 1000 });
    k.planen(500);
    k.stoppen();
    await vi.advanceTimersByTimeAsync(5000);
    expect(runde).not.toHaveBeenCalled();
  });

  it('unbrauchbare Wartezeit (undefined, NaN, 0) → ruheMs statt Dauerfeuer', async () => {
    const runde = vi.fn(async () => undefined as unknown as number);
    abfrageKette({ runde, ruht: () => false, ruheMs: 1000 }).sofort();
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(999);
    expect(runde).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(runde).toHaveBeenCalledTimes(2);
  });
});

describe('zeitlimit', () => {
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
  it('ohne AbortSignal.timeout (Safari < 16) bricht der Ersatz nach ms ab', async () => {
    vi.useFakeTimers();
    const echt = AbortSignal;
    vi.stubGlobal('AbortSignal', new Proxy(echt, { has: (t, k) => k !== 'timeout' && k in t }));
    const s = zeitlimit(500);
    await vi.advanceTimersByTimeAsync(499);
    expect(s.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(s.aborted).toBe(true);
  });
});

describe('jsonHolen', () => {
  afterEach(() => vi.unstubAllGlobals());
  const antwort = (body: string, init: ResponseInit & { redirected?: boolean } = {}) => {
    const r = new Response(body, init);
    if (init.redirected) Object.defineProperty(r, 'redirected', { value: true });
    vi.stubGlobal('fetch', vi.fn(async () => r));
  };

  it('liefert das JSON, am Cache vorbei', async () => {
    antwort('{"build":"aaa"}', { headers: { 'Content-Type': 'application/json' } });
    expect(await jsonHolen('/version.json', 1000)).toStrictEqual({ build: 'aaa' });
    expect(vi.mocked(fetch).mock.calls[0][1]).toMatchObject({ cache: 'no-store' });
  });
  it('die Login-Seite nach einer Umleitung zählt nicht als Antwort', async () => {
    antwort('<!doctype html>', { headers: { 'Content-Type': 'text/html' }, redirected: true });
    await expect(jsonHolen('/version.json', 1000)).rejects.toThrow(/umgeleitet/);
  });
  it('eine hängende Anfrage bricht nach timeoutMs ab', async () => {
    // Hängt, bis das Signal abbricht – ohne Signal für immer.
    vi.stubGlobal('fetch', vi.fn((_u: string, o?: RequestInit) => new Promise((_, nein) => {
      o?.signal?.addEventListener('abort', () => nein(o.signal!.reason));
    })));
    const ausgang = await Promise.race([
      jsonHolen('/api/position', 50).then(() => 'antwort', () => 'abgebrochen'),
      new Promise((r) => setTimeout(() => r('hängt noch'), 500)),
    ]);
    expect(ausgang).toBe('abgebrochen');
  });
  it('Fehlerstatus oder kein JSON wirft', async () => {
    antwort('{}', { status: 500, headers: { 'Content-Type': 'application/json' } });
    await expect(jsonHolen('/api/position', 1000)).rejects.toThrow(/500/);
    antwort('<p>', { headers: { 'Content-Type': 'text/html' } });
    await expect(jsonHolen('/api/position', 1000)).rejects.toThrow(/kein JSON/);
  });
});
