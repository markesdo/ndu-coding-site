import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError } from './api';

afterEach(() => vi.unstubAllGlobals());

describe('API-Client: Meldungen', () => {
  it('ohne Meldung des Servers bleibt der Text leer (kein „Speichern …“ beim Laden)', async () => {
    vi.stubGlobal('fetch', async () => new Response('Bad Gateway', { status: 502 }));
    const e = await api.lesen('brief').catch((x: unknown) => x);
    expect(e).toBeInstanceOf(ApiError);
    expect(e).toMatchObject({ status: 502, code: 'unbekannt', message: '' });
    vi.stubGlobal('fetch', async () => Promise.reject(new TypeError('offline')));
    expect(await api.lesen('brief').catch((x: unknown) => x)).toMatchObject({ status: 0, code: 'github-fehler', message: '' });
  });
  it('mit Meldung des Servers: Text, Code und Felder', async () => {
    const body = { fehler: 'Das lässt sich so nicht speichern.', code: 'ungueltig', felder: [{ pfad: 'x', meldung: 'y' }] };
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify(body), { status: 422 }));
    const e = await api.speichern('brief', { daten: {}, basisSha: null } as never).catch((x: unknown) => x);
    expect(e).toMatchObject({ status: 422, code: 'ungueltig', message: body.fehler, felder: body.felder });
  });
});
