import { afterEach, describe, expect, it, vi } from 'vitest';
import { MAX_KENNUNGEN, NICHT_GEMELDET, aufdeckenMelden, aufgedecktHolen, aufgedecktSchluessel, gefragteKennungen, heuteZuFragen, kennungPruefen } from './aufgedeckt';

// 22.10.2026 10:05 in Wien = 08:05 UTC (Sommerzeit bis 25.10.).
const KURSTAG = new Date('2026-10-22T08:05:00Z');
const NAECHSTER = new Date('2026-10-23T08:05:00Z');

describe('kennungPruefen', () => {
  it('Gruppe oder Seite + Knopftext, getrimmt', () => {
    expect(kennungPruefen(' mom-test ')).toBe('mom-test');
    expect(kennungPruefen('/innolab/methoden/scrum:Auflösung zeigen (nach Review 1)')).toBe('/innolab/methoden/scrum:Auflösung zeigen (nach Review 1)');
  });
  it('leer, zu lang, Steuerzeichen oder kein Text → null', () => {
    for (const roh of ['', '   ', 'x'.repeat(161), 'a\nb', 7, null, undefined, { k: 1 }]) expect(kennungPruefen(roh), String(roh)).toBeNull();
  });
});

describe('aufgedecktSchluessel / gefragteKennungen', () => {
  it('ein Schlüssel pro Kennung und Wiener Kalendertag – gestern gilt heute nicht', () => {
    expect(aufgedecktSchluessel('toast', KURSTAG)).toBe('aufgedeckt:2026-10-22:toast');
    expect(aufgedecktSchluessel('toast', NAECHSTER)).not.toBe(aufgedecktSchluessel('toast', KURSTAG));
  });
  it('nimmt nur gültige Kennungen, ohne Doppel, höchstens MAX_KENNUNGEN', () => {
    expect(gefragteKennungen(new URLSearchParams('k=toast&k=a%0Ab&k=toast&k=mom-test&x=y'))).toStrictEqual(['toast', 'mom-test']);
    const viele = new URLSearchParams(Array.from({ length: 50 }, (_, i) => ['k', `k${i}`]));
    expect(gefragteKennungen(viele)).toHaveLength(MAX_KENNUNGEN);
  });
});

describe('heuteZuFragen', () => {
  it('nur wenn eine geschlossene Auflösung heute fällig wird', () => {
    expect(heuteZuFragen(['2026-10-22T16:45'], KURSTAG)).toBe(true);
    expect(heuteZuFragen(['2026-11-28T10:30'], KURSTAG)).toBe(false);
    expect(heuteZuFragen([], KURSTAG)).toBe(false);
    expect(heuteZuFragen(['ungültig'], KURSTAG)).toBe(false);
  });
});

describe('aufgedecktHolen', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('fragt nach den Kennungen und liefert nur Texte zurück; ohne Kennungen keine Anfrage', async () => {
    const f = vi.fn(async (_url: string) => new Response('{"offen":["mom-test",7]}', { headers: { 'Content-Type': 'application/json' } }));
    vi.stubGlobal('fetch', f);
    expect(await aufgedecktHolen(['mom-test', '/x:Zeigen'])).toStrictEqual(['mom-test']);
    expect(f.mock.calls[0][0]).toBe('/api/aufgedeckt?k=mom-test&k=%2Fx%3AZeigen');
    expect(await aufgedecktHolen([])).toStrictEqual([]);
    expect(f).toHaveBeenCalledTimes(1);
  });
});

describe('aufdeckenMelden', () => {
  afterEach(() => vi.restoreAllMocks());
  const ablauf = (...antworten: (Response | Error)[]) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const senden = vi.fn(async () => { const a = antworten.shift()!; if (a instanceof Error) throw a; return a; });
    const warten = vi.fn(async (_ms: number) => {});
    const hinweis = vi.fn();
    return { senden, warten, hinweis };
  };
  const umgeleitet = () => { const r = new Response('<html>'); Object.defineProperty(r, 'redirected', { value: true }); return r; };

  it('klappt es gleich: kein zweiter Versuch, kein Hinweis', async () => {
    const o = ablauf(new Response('{}'));
    expect(await aufdeckenMelden(o)).toBe(true);
    expect(o.senden).toHaveBeenCalledTimes(1);
    expect(o.hinweis).not.toHaveBeenCalled();
  });
  it('Fehler, dann Erfolg: nach 3 s noch einmal, kein Hinweis', async () => {
    const o = ablauf(new Response('{}', { status: 503 }), new Response('{}'));
    expect(await aufdeckenMelden(o)).toBe(true);
    expect(o.warten).toHaveBeenCalledWith(3000);
    expect(o.senden).toHaveBeenCalledTimes(2);
    expect(o.hinweis).not.toHaveBeenCalled();
  });
  it('403, Netzfehler oder Umleitung zur Login-Seite: nach dem zweiten Versuch sieht der Präsentator den Hinweis', async () => {
    for (const [a, b] of [[new Response('{}', { status: 403 }), new Response('{}', { status: 403 })], [new Error('offline'), umgeleitet()]] as const) {
      const o = ablauf(a, b);
      expect(await aufdeckenMelden(o)).toBe(false);
      expect(o.senden).toHaveBeenCalledTimes(2);
      expect(o.hinweis).toHaveBeenCalledWith(NICHT_GEMELDET);
    }
  });
});
