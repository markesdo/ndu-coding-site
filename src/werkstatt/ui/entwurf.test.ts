import { ARTEFAKT_NAMEN, ARTEFAKTE, artefaktParsen, type ArtefaktName } from '../schemas/index';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { entwuerfeLoeschen, entwurfLaden, entwurfLoeschen, entwurfNachCommitLoeschen, entwurfNormalisieren, entwurfSichern, startStand } from './entwurf';

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

describe('unvollständige Entwürfe', () => {
  it('Objekt-Form wird auch dann wiederhergestellt, wenn das Schema scheitern würde', () => {
    entwurfSichern('annahmen', ICH, 'test', 'sha-1', { schema: 'annahmen@1', stand: 'gestern', annahmen: [] });
    expect(entwurfLaden('annahmen', ICH, 'test')?.daten).toStrictEqual({ schema: 'annahmen@1', stand: 'gestern', annahmen: [] });
  });

  it('nur nicht parsebarer Müll wird ignoriert', () => {
    for (const roh of ['{kaputt', '"text"', '42', 'null', '[]', '{"basisSha":"x"}', '{"basisSha":"x","daten":"text"}', '{"basisSha":"x","daten":[1]}', '{"basisSha":"x","daten":null}']) {
      g.localStorage!.setItem('ndu-werkstatt-1001-test-brief', roh);
      expect(entwurfLaden('brief', ICH, 'test'), roh).toBeNull();
    }
  });
});

describe('Entwurf nach einem späten Commit', () => {
  const daten = { x: 1 };

  it('löscht den Entwurf nur, wenn Stand und Inhalt dem Gesendeten entsprechen', () => {
    entwurfSichern('brief', ICH, 'test', 'sha-1', daten);
    expect(entwurfNachCommitLoeschen('brief', ICH, 'test', 'sha-1', { x: 1 })).toBe(true);
    expect(entwurfLaden('brief', ICH, 'test')).toBeNull();
  });

  it('lässt einen Entwurf stehen, der inzwischen weitergeschrieben wurde (anderer Inhalt)', () => {
    entwurfSichern('brief', ICH, 'test', 'sha-1', { x: 2 });
    expect(entwurfNachCommitLoeschen('brief', ICH, 'test', 'sha-1', { x: 1 })).toBe(false);
    expect(entwurfLaden('brief', ICH, 'test')?.daten).toStrictEqual({ x: 2 });
  });

  it('lässt einen Entwurf auf anderem Stand stehen', () => {
    entwurfSichern('brief', ICH, 'test', 'sha-2', daten);
    expect(entwurfNachCommitLoeschen('brief', ICH, 'test', 'sha-1', daten)).toBe(false);
    expect(entwurfLaden('brief', ICH, 'test')).not.toBeNull();
  });

  it('Datei neu (null) passt zu null', () => {
    entwurfSichern('brief', ICH, 'test', null, daten);
    expect(entwurfNachCommitLoeschen('brief', ICH, 'test', null, daten)).toBe(true);
  });
});

describe('entwurfNormalisieren: falsch geformte Entwürfe lassen die Anzeige nicht abstürzen', () => {
  const leer = (name: ArtefaktName) => ARTEFAKTE[name].leer('2026-10-22');
  const annahmen = () => leer('annahmen') as { annahmen: Record<string, unknown>[]; stand: string };

  it('{} ergibt den leeren Stand', () => {
    expect(entwurfNormalisieren('annahmen', annahmen(), {})).toStrictEqual(annahmen());
  });

  it('eine Liste, die keine ist, wird zur leeren Liste', () => {
    expect((entwurfNormalisieren('annahmen', annahmen(), { annahmen: 'x' }) as { annahmen: unknown }).annahmen).toStrictEqual([]);
  });

  it('Zeilen {} bekommen alle Felder, Listenfelder bleiben Listen', () => {
    const r = entwurfNormalisieren('annahmen', annahmen(), { annahmen: [{}, 7, null, { id: 'A2', belegIds: 'x' }] }) as { annahmen: Record<string, unknown>[] };
    expect(r.annahmen).toHaveLength(2);
    for (const z of r.annahmen) expect(Object.keys(z).sort()).toStrictEqual(['art', 'beleg', 'belegIds', 'id', 'text', 'wichtig']);
    expect(r.annahmen[1]).toMatchObject({ id: 'A2', belegIds: [] });
  });

  it('gültige Felder des Entwurfs bleiben, falsche Typen fallen auf die Vorlage zurück', () => {
    const r = entwurfNormalisieren('annahmen', annahmen(), {
      stand: 5, riskanteste: 'A1', annahmen: [{ id: 'A1', text: 'T', belegIds: ['I1', 3, 'I2'], art: 'machbar' }],
    }) as Record<string, unknown> & { annahmen: Record<string, unknown>[] };
    expect(r.stand).toBe('2026-10-22');
    expect(r.riskanteste).toBe('A1');
    expect(r.annahmen[0]).toMatchObject({ id: 'A1', text: 'T', art: 'machbar', belegIds: ['I1', 'I2'] });
  });

  it('verschachtelte Objekte und Stringlisten (Brief)', () => {
    const r = entwurfNormalisieren('brief', ARTEFAKTE.brief.leer('2026-10-22'), { outcome: 'x', nicht: ['a', 1, 'b'], offeneFragen: {} }) as Record<string, unknown>;
    expect(r.outcome).toStrictEqual({ wirGlauben: '', wirMerkenEs: '' });
    expect(r.nicht).toStrictEqual(['a', 'b']);
    expect(r.offeneFragen).toStrictEqual([]);
  });

  it('für alle Artefakte: Müll-Entwürfe lassen sich prüfen, ohne zu werfen', () => {
    for (const name of ARTEFAKT_NAMEN) {
      for (const roh of [{}, { [name]: 'x' }, { fragen: [{}], entscheidungen: [{}], annahmen: [{}] }, { outcome: null }]) {
        const n = entwurfNormalisieren(name, ARTEFAKTE[name].leer('2026-10-22'), roh);
        expect(() => artefaktParsen(name, n), name).not.toThrow();
      }
    }
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
