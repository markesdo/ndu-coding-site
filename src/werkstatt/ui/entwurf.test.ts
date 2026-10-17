import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { entwuerfeLoeschen, entwurfLaden, entwurfLoeschen, entwurfSichern, startStand } from './entwurf';

function speicher(): Storage {
  const m = new Map<string, string>();
  return {
    get length() { return m.size; },
    clear: () => m.clear(),
    getItem: (k) => m.get(k) ?? null,
    key: (i) => [...m.keys()][i] ?? null,
    removeItem: (k) => { m.delete(k); },
    setItem: (k, v) => { m.set(k, String(v)); },
  };
}

const g = globalThis as { localStorage?: Storage };
let vorher: Storage | undefined;
beforeEach(() => { vorher = g.localStorage; g.localStorage = speicher(); });
afterEach(() => { g.localStorage = vorher; });

const ICH = 1001;

describe('entwurf', () => {
  it('sichert unter ndu-werkstatt-<githubId>-<kohorte>-<name> samt Stand und lädt wieder', () => {
    entwurfSichern('annahmen', ICH, 'test', 'sha-1', { a: 1 });
    expect(g.localStorage!.getItem('ndu-werkstatt-1001-test-annahmen')).not.toBeNull();
    expect(entwurfLaden('annahmen', ICH, 'test')).toStrictEqual({ basisSha: 'sha-1', daten: { a: 1 } });
    expect(entwurfLaden('annahmen', ICH, 'andere')).toBeNull();
    expect(entwurfLaden('brief', ICH, 'test')).toBeNull();
  });

  it('Entwurf einer anderen Person ist unsichtbar (geteilter Rechner)', () => {
    entwurfSichern('annahmen', 1001, 'test', null, { privat: true });
    expect(entwurfLaden('annahmen', 1002, 'test')).toBeNull();
  });

  it('Abmelden löscht alle Entwürfe, aber nichts anderes', () => {
    entwurfSichern('annahmen', 1001, 'test', null, {});
    entwurfSichern('brief', 1002, 'test', null, {});
    g.localStorage!.setItem('theme', 'dark');
    entwuerfeLoeschen();
    expect(entwurfLaden('annahmen', 1001, 'test')).toBeNull();
    expect(entwurfLaden('brief', 1002, 'test')).toBeNull();
    expect(g.localStorage!.getItem('theme')).toBe('dark');
  });

  it('löscht den Entwurf', () => {
    entwurfSichern('brief', ICH, 'test', null, { x: 1 });
    entwurfLoeschen('brief', ICH, 'test');
    expect(entwurfLaden('brief', ICH, 'test')).toBeNull();
  });

  it('kaputtes oder fremdförmiges JSON im Speicher gilt als kein Entwurf', () => {
    g.localStorage!.setItem('ndu-werkstatt-1001-test-brief', '{kaputt');
    expect(entwurfLaden('brief', ICH, 'test')).toBeNull();
    g.localStorage!.setItem('ndu-werkstatt-1001-test-brief', '"nur text"');
    expect(entwurfLaden('brief', ICH, 'test')).toBeNull();
  });

  it('localStorage wirft: kein Absturz, Rückgabe sagt es ehrlich', () => {
    const wirft = () => { throw new Error('gesperrt'); };
    g.localStorage = { ...speicher(), getItem: wirft, setItem: wirft, removeItem: wirft, key: wirft } as Storage;
    expect(entwurfSichern('brief', ICH, 'test', null, { x: 1 })).toBe(false);
    expect(entwurfLaden('brief', ICH, 'test')).toBeNull();
    expect(() => entwurfLoeschen('brief', ICH, 'test')).not.toThrow();
    expect(() => entwuerfeLoeschen()).not.toThrow();
  });

  it('ohne localStorage (kein Browser) ebenfalls kein Absturz', () => {
    g.localStorage = undefined;
    expect(entwurfSichern('brief', ICH, 'test', null, {})).toBe(false);
    expect(entwurfLaden('brief', ICH, 'test')).toBeNull();
  });
});

describe('startStand: Entwurf überschreibt nie unbemerkt Neueres', () => {
  const server = { daten: 'server', basisSha: 'sha-2' };

  it('gleicher Stand: der Entwurf kommt still zurück', () => {
    expect(startStand(server, { basisSha: 'sha-2', daten: 'entwurf' })).toStrictEqual({
      daten: 'entwurf', basisSha: 'sha-2', alsEntwurf: true, aelterEntwurf: null,
    });
  });

  it('anderer Stand: Server-Stand, Entwurf bleibt zur Wahl', () => {
    expect(startStand(server, { basisSha: 'sha-1', daten: 'entwurf' })).toStrictEqual({
      daten: 'server', basisSha: 'sha-2', alsEntwurf: false, aelterEntwurf: 'entwurf',
    });
  });

  it('Entwurf auf neuer Datei (null), Datei gibt es inzwischen: andere Stände', () => {
    const r = startStand(server, { basisSha: null, daten: 'entwurf' });
    expect(r.daten).toBe('server');
    expect(r.aelterEntwurf).toBe('entwurf');
  });

  it('beide null (Datei gibt es noch nicht): derselbe Stand', () => {
    expect(startStand({ daten: 'leer', basisSha: null }, { basisSha: null, daten: 'entwurf' }).daten).toBe('entwurf');
  });

  it('kein Entwurf: Server-Stand', () => {
    expect(startStand(server, null)).toStrictEqual({ daten: 'server', basisSha: 'sha-2', alsEntwurf: false, aelterEntwurf: null });
  });
});
