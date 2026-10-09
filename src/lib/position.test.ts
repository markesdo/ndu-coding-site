import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ABFRAGE_MS, FEHLER_BIS_AUSBLENDEN, RUHIG_MS, alterText, naechsteAbfrage, nochmalLoeschen, positionHref, positionPruefen } from './position';
// Die Vercel-Funktion liegt in api/ – Tests dürfen dort nicht liegen, sonst würde Vercel sie als Funktion bauen.
import { GET, POST } from '../../api/position';

const gut = { pfad: '/tag-1', anker: 'uebung-1-b', titel: 'Tag 1 · Übung 1 b' };

describe('positionPruefen', () => {
  it('nimmt eine gültige Position und verwirft fremde Felder', () => {
    expect(positionPruefen({ ...gut, extra: '<script>' })).toStrictEqual(gut);
  });
  it('erlaubt einen leeren Anker (Seitenanfang) und Unterseiten', () => {
    expect(positionPruefen({ ...gut, pfad: '/konzepte/llm', anker: '' })).toStrictEqual({ ...gut, pfad: '/konzepte/llm', anker: '' });
  });
  it.each([
    ['fremde Adresse', { ...gut, pfad: '//evil.example' }],
    ['volle URL', { ...gut, pfad: 'https://evil.example/' }],
    ['Großbuchstaben im Pfad', { ...gut, pfad: '/Tag-1' }],
    ['Anker mit #', { ...gut, anker: '#uebung' }],
    ['Anker mit Anführungszeichen', { ...gut, anker: 'a"b' }],
    ['leerer Titel', { ...gut, titel: '  ' }],
    ['Titel zu lang', { ...gut, titel: 'x'.repeat(121) }],
    ['Steuerzeichen im Titel', { ...gut, titel: 'Tag\n1' }],
    ['fehlendes Feld', { pfad: '/tag-1', titel: 'Tag 1' }],
    ['kein Objekt', 'tag-1'],
  ])('lehnt ab: %s', (_, roh) => {
    expect(positionPruefen(roh)).toBeNull();
  });
});

describe('positionHref', () => {
  it('mit und ohne Anker', () => {
    expect(positionHref(gut)).toBe('/tag-1#uebung-1-b');
    expect(positionHref({ ...gut, anker: '' })).toBe('/tag-1');
  });
});

describe('nochmalLoeschen (Pause/Abmelden während einer laufenden Meldung)', () => {
  it('gespeichert, aber inzwischen pausiert oder abgemeldet → noch einmal löschen', () => {
    expect(nochmalLoeschen(true, true, true)).toBe(true);
    expect(nochmalLoeschen(true, false, false)).toBe(true);
  });
  it('normal weiter live, oder die Meldung ist gar nicht angekommen → nichts tun', () => {
    expect(nochmalLoeschen(true, false, true)).toBe(false);
    expect(nochmalLoeschen(false, true, false)).toBe(false);
  });
});

describe('naechsteAbfrage', () => {
  it('frische Position: alle 2 s, Knopf bleibt', () => {
    expect(naechsteAbfrage('frisch', 0)).toStrictEqual({ ms: ABFRAGE_MS, ausblenden: false });
    expect(ABFRAGE_MS).toBe(2000);
  });
  it('keine Position: Knopf weg, nur alle 15 s', () => {
    expect(naechsteAbfrage('leer', 0)).toStrictEqual({ ms: RUHIG_MS, ausblenden: true });
    expect(RUHIG_MS).toBe(15_000);
  });
  it('einzelne Fehler blenden nicht aus und bremsen nicht, erst drei in Folge', () => {
    expect(naechsteAbfrage('fehler', FEHLER_BIS_AUSBLENDEN - 1)).toStrictEqual({ ms: ABFRAGE_MS, ausblenden: false });
    expect(naechsteAbfrage('fehler', FEHLER_BIS_AUSBLENDEN)).toStrictEqual({ ms: RUHIG_MS, ausblenden: true });
    expect(FEHLER_BIS_AUSBLENDEN).toBe(3);
  });
});

describe('alterText', () => {
  it('frisch → leer, ab 2 min „vor N min“, ab 30 min ausblenden', () => {
    expect(alterText(0)).toBe('');
    expect(alterText(119_999)).toBe('');
    expect(alterText(7 * 60_000 + 5000)).toBe('vor 7 min');
    expect(alterText(30 * 60_000 - 1)).toBe('vor 29 min');
    expect(alterText(30 * 60_000)).toBeNull();
  });
});

describe('api/position', () => {
  const senden = (body: unknown, key?: string) =>
    POST(new Request('https://kurs.invalid/api/position', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(key ? { 'x-presenter-key': key } : {}) },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }));

  beforeEach(() => {
    vi.stubEnv('VERCEL', '');
    vi.stubEnv('RUNTIME_CACHE_ENDPOINT', '');
    vi.stubEnv('PRESENTER_KEY', 'geheim-123');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

  it('ohne PRESENTER_KEY schreibt niemand (fail closed)', async () => {
    vi.stubEnv('PRESENTER_KEY', '');
    expect((await senden(gut, 'irgendwas')).status).toBe(503);
  });
  it('falscher oder fehlender Schlüssel → 403 (401 bleibt der Middleware: nicht angemeldet)', async () => {
    expect((await senden(gut, 'falsch')).status).toBe(403);
    expect((await senden(gut)).status).toBe(403);
  });
  it('kaputte Position → 400', async () => {
    expect((await senden({ ...gut, pfad: '//evil' }, 'geheim-123')).status).toBe(400);
    expect((await senden('kein json', 'geheim-123')).status).toBe(400);
  });
  it('richtiger Schlüssel → GET liefert genau diese Position, ohne Cache', async () => {
    expect((await senden(gut, 'geheim-123')).status).toBe(200);
    const r = await GET();
    expect(r.headers.get('cache-control')).toBe('no-store');
    const d = await r.json();
    expect(d.position).toStrictEqual(gut);
    expect(typeof d.zeit).toBe('number');
    expect(d.jetzt).toBeGreaterThanOrEqual(d.zeit);
  });
  it('Anmeldung ({ pruefen: true }) prüft nur den Schlüssel und speichert nichts', async () => {
    await senden({ aus: true }, 'geheim-123'); // Speicher aus früheren Tests leeren
    expect((await senden({ pruefen: true }, 'falsch')).status).toBe(403);
    expect((await senden({ pruefen: true }, 'geheim-123')).status).toBe(200);
    expect((await (await GET()).json()).position).toBeNull();
  });
  it('Pause ({ aus: true }) löscht die Position – nur mit Schlüssel', async () => {
    expect((await senden(gut, 'geheim-123')).status).toBe(200);
    expect((await senden({ aus: true }, 'falsch')).status).toBe(403);
    expect((await (await GET()).json()).position).toStrictEqual(gut);
    expect((await senden({ aus: true }, 'geheim-123')).status).toBe(200);
    expect((await (await GET()).json()).position).toBeNull();
  });
  it('auf Vercel mit Runtime Cache im Anfrage-Kontext (so läuft es deployt): speichert dort', async () => {
    vi.stubEnv('VERCEL', '1');
    const daten = new Map<string, unknown>();
    const cache = { get: async (k: string) => daten.get(k), set: async (k: string, v: unknown) => { daten.set(k, v); }, delete: async () => {}, expireTag: async () => {} };
    const KONTEXT = Symbol.for('@vercel/request-context');
    (globalThis as Record<symbol, unknown>)[KONTEXT] = { get: () => ({ cache }) };
    try {
      expect((await senden(gut, 'geheim-123')).status).toBe(200);
      expect(daten.size).toBe(1);
      expect((await (await GET()).json()).position).toStrictEqual(gut);
    } finally {
      delete (globalThis as Record<symbol, unknown>)[KONTEXT];
    }
  });
  it('auf Vercel ohne Runtime Cache lieber 503 als ein Speicher pro Instanz', async () => {
    vi.stubEnv('VERCEL', '1');
    expect((await GET()).status).toBe(503);
    expect((await senden(gut, 'geheim-123')).status).toBe(503);
  });
});
