import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { entwurfLaden, entwurfLoeschen, entwurfSichern } from './entwurf';

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

describe('entwurf', () => {
  it('sichert unter ndu-werkstatt-<kohorte>-<name> und lädt wieder', () => {
    entwurfSichern('annahmen', 'test', { a: 1 });
    expect(g.localStorage!.getItem('ndu-werkstatt-test-annahmen')).not.toBeNull();
    expect(entwurfLaden('annahmen', 'test')).toStrictEqual({ a: 1 });
    expect(entwurfLaden('annahmen', 'andere')).toBeNull();
    expect(entwurfLaden('brief', 'test')).toBeNull();
  });

  it('löscht den Entwurf', () => {
    entwurfSichern('brief', 'test', { x: 1 });
    entwurfLoeschen('brief', 'test');
    expect(entwurfLaden('brief', 'test')).toBeNull();
  });

  it('kaputtes JSON im Speicher gilt als kein Entwurf', () => {
    g.localStorage!.setItem('ndu-werkstatt-test-brief', '{kaputt');
    expect(entwurfLaden('brief', 'test')).toBeNull();
  });

  it('localStorage wirft: kein Absturz, Rückgabe sagt es ehrlich', () => {
    const wirft = () => { throw new Error('gesperrt'); };
    g.localStorage = { ...speicher(), getItem: wirft, setItem: wirft, removeItem: wirft } as Storage;
    expect(entwurfSichern('brief', 'test', { x: 1 })).toBe(false);
    expect(entwurfLaden('brief', 'test')).toBeNull();
    expect(() => entwurfLoeschen('brief', 'test')).not.toThrow();
  });

  it('ohne localStorage (kein Browser) ebenfalls kein Absturz', () => {
    g.localStorage = undefined;
    expect(entwurfSichern('brief', 'test', {})).toBe(false);
    expect(entwurfLaden('brief', 'test')).toBeNull();
  });
});
