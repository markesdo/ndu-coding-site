import { afterEach, describe, expect, it, vi } from 'vitest';
import { KENNUNG_UNGUELTIG, MAX_KENNUNGEN, MELDEN_NOCHMAL_MS, MELDEN_TIMEOUT_MS, NICHT_GEMELDET, SCHLUESSEL_FALSCH, abfrageAbstand, aufdeckenMelden, aufgedecktHolen, aufgedecktSchluessel, gefragteKennungen, kennungFehler, kennungPruefen } from './aufgedeckt';

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

describe('abfrageAbstand', () => {
  it('oft, wenn eine geschlossene Auflösung heute fällig wird; sonst selten; nichts zu → aufhören', () => {
    expect(abfrageAbstand(['2026-10-22T16:45'], KURSTAG)).toBe(4000);
    expect(abfrageAbstand(['2026-11-28T10:30', '2026-10-22T11:00'], KURSTAG)).toBe(4000);
    // Termin verschoben oder anderer Tag: trotzdem nachfragen, nur seltener.
    expect(abfrageAbstand(['2026-11-28T10:30'], KURSTAG)).toBe(30_000);
    expect(abfrageAbstand(['ungültig'], KURSTAG)).toBe(30_000);
    expect(abfrageAbstand([], KURSTAG)).toBeNull();
  });
});

describe('kennungFehler (Build-Prüfung in Aufloesung.astro)', () => {
  it('meldet Leerraum am Rand, zu lange und ungültige Kennungen; passt alles, null', () => {
    expect(kennungFehler(undefined, 'Zeigen', '/s:Zeigen')).toBeNull();
    expect(kennungFehler('toast', 'egal ', 'toast')).toBeNull();
    expect(kennungFehler(undefined, 'Zeigen ', '/s:Zeigen')).toMatch(/Leerraum.*knopf/);
    expect(kennungFehler(' toast', 'x', 'toast')).toMatch(/Leerraum.*gruppe/);
    expect(kennungFehler(undefined, 'x'.repeat(170), `/s:${'x'.repeat(170)}`)).toMatch(/höchstens 160/);
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

  it('der Hinweis kommt spätestens nach 11 s (zwei Versuche mit Zeitlimit, dazwischen warten)', () => {
    expect(2 * MELDEN_TIMEOUT_MS + MELDEN_NOCHMAL_MS).toBeLessThanOrEqual(11_000);
  });
  it('klappt es gleich: kein zweiter Versuch, kein Hinweis', async () => {
    const o = ablauf(new Response('{}'));
    expect(await aufdeckenMelden(o)).toBe(true);
    expect(o.senden).toHaveBeenCalledTimes(1);
    expect(o.hinweis).not.toHaveBeenCalled();
  });
  it('5xx, dann Erfolg: nach 3 s noch einmal, kein Hinweis', async () => {
    const o = ablauf(new Response('{}', { status: 503 }), new Response('{}'));
    expect(await aufdeckenMelden(o)).toBe(true);
    expect(o.warten).toHaveBeenCalledWith(3000);
    expect(o.senden).toHaveBeenCalledTimes(2);
    expect(o.hinweis).not.toHaveBeenCalled();
  });
  it('403 und 400: kein zweiter Versuch, eigener Hinweis', async () => {
    for (const [status, text] of [[403, SCHLUESSEL_FALSCH], [400, KENNUNG_UNGUELTIG]] as const) {
      const o = ablauf(new Response('{}', { status }), new Response('{}'));
      expect(await aufdeckenMelden(o)).toBe(false);
      expect(o.senden).toHaveBeenCalledTimes(1);
      expect(o.warten).not.toHaveBeenCalled();
      expect(o.hinweis.mock.calls).toStrictEqual([[text]]);
    }
  });
  it('Netzfehler, 5xx oder Umleitung zur Login-Seite: nach dem zweiten Versuch der allgemeine Hinweis', async () => {
    for (const [a, b] of [[new Error('offline'), umgeleitet()], [new Response('{}', { status: 500 }), new Error('offline')]] as const) {
      const o = ablauf(a, b);
      expect(await aufdeckenMelden(o)).toBe(false);
      expect(o.senden).toHaveBeenCalledTimes(2);
      expect(o.hinweis.mock.calls).toStrictEqual([[NICHT_GEMELDET]]);
    }
  });
});
