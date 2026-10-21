import { afterEach, describe, expect, it, vi } from 'vitest';
import { json, praesentatorAbweisen } from './praesentator-api';

const anfrage = (key?: string) => new Request('https://kurs.invalid/api/x', { method: 'POST', headers: key === undefined ? {} : { 'x-presenter-key': key } });

describe('praesentatorAbweisen', () => {
  afterEach(() => vi.unstubAllEnvs());
  it('ohne PRESENTER_KEY 503, fehlender oder falscher Schlüssel 403, richtiger null', async () => {
    vi.stubEnv('PRESENTER_KEY', '');
    expect((await praesentatorAbweisen(anfrage('geheim')))?.status).toBe(503);
    vi.stubEnv('PRESENTER_KEY', 'geheim');
    expect((await praesentatorAbweisen(anfrage()))?.status).toBe(403);
    expect((await praesentatorAbweisen(anfrage('falsch')))?.status).toBe(403);
    expect(await praesentatorAbweisen(anfrage('geheim'))).toBeNull();
  });
  it('json: ohne Cache, als JSON', async () => {
    const r = json({ ok: true }, 201);
    expect(r.status).toBe(201);
    expect(r.headers.get('cache-control')).toBe('no-store');
    expect(await r.json()).toStrictEqual({ ok: true });
  });
});
