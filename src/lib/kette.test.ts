import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { abfrageKette, jsonHolen } from './kette';

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
  it('Fehlerstatus oder kein JSON wirft', async () => {
    antwort('{}', { status: 500, headers: { 'Content-Type': 'application/json' } });
    await expect(jsonHolen('/api/position', 1000)).rejects.toThrow(/500/);
    antwort('<p>', { headers: { 'Content-Type': 'text/html' } });
    await expect(jsonHolen('/api/position', 1000)).rejects.toThrow(/kein JSON/);
  });
});
