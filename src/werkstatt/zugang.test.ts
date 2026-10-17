import { describe, expect, it } from 'vitest';
import { mitgliedschaften, repoName, zugangLesen } from './zugang';
import type { Kohorte } from './kohorten/typen';

function kohorte(id: string, status: Kohorte['status'] = 'aktiv'): Kohorte {
  return { id, kurs: 'innolab', titel: `Innolab ${id}`, org: 'test-org', vorlage: `mappe-vorlage-${id}`, status, artefakte: [], termine: {} };
}

const zugang = zugangLesen(JSON.stringify({
  '2026': { lehrende: [9001], studierende: [{ githubId: 1001, kuerzel: 'anna' }, { githubId: 1002, kuerzel: 'ben' }] },
  '2027': { lehrende: [9001], studierende: [{ githubId: 1001, kuerzel: 'anna2' }] },
}));

describe('mitgliedschaften', () => {
  it('Person in zwei aktiven Kohorten: neueste zuerst', () => {
    const m = mitgliedschaften(zugang, 1001, [kohorte('2026'), kohorte('2027')]);
    expect(m.map((x) => x.kohorte)).toEqual(['2027', '2026']);
    expect(m[0]).toEqual({ kohorte: '2027', rolle: 'studierende', kuerzel: 'anna2' });
  });
  it('archivierte Kohorte zählt nicht', () => {
    const m = mitgliedschaften(zugang, 1001, [kohorte('2026', 'archiviert'), kohorte('2027')]);
    expect(m.map((x) => x.kohorte)).toEqual(['2027']);
  });
  it('unbekannte ID: leer', () => {
    expect(mitgliedschaften(zugang, 4242, [kohorte('2026'), kohorte('2027')])).toEqual([]);
  });
  it('Kohorte ohne Zugangseintrag: leer', () => {
    expect(mitgliedschaften(zugang, 1001, [kohorte('2030')])).toEqual([]);
  });
  it('Lehrende: Rolle lehrende, kein Kürzel', () => {
    const m = mitgliedschaften(zugang, 9001, [kohorte('2026'), kohorte('2027')]);
    expect(m).toStrictEqual([
      { kohorte: '2027', rolle: 'lehrende', kuerzel: null },
      { kohorte: '2026', rolle: 'lehrende', kuerzel: null },
    ]);
  });
});

describe('zugangLesen', () => {
  it('undefined wirft', () => {
    expect(() => zugangLesen(undefined)).toThrow('WERKSTATT_ZUGANG ungültig');
  });
  it('kaputtes JSON wirft', () => {
    expect(() => zugangLesen('{')).toThrow('WERKSTATT_ZUGANG ungültig');
  });
  it('doppeltes Kürzel in einer Kohorte wirft', () => {
    const roh = JSON.stringify({ '2026': { lehrende: [], studierende: [{ githubId: 1, kuerzel: 'anna' }, { githubId: 2, kuerzel: 'anna' }] } });
    expect(() => zugangLesen(roh)).toThrow('WERKSTATT_ZUGANG ungültig');
  });
  it('gleiches Kürzel in verschiedenen Kohorten ist erlaubt', () => {
    const roh = JSON.stringify({
      '2026': { lehrende: [], studierende: [{ githubId: 1, kuerzel: 'anna' }] },
      '2027': { lehrende: [], studierende: [{ githubId: 2, kuerzel: 'anna' }] },
    });
    expect(() => zugangLesen(roh)).not.toThrow();
  });
  it('"Sofie" (Großbuchstabe) wirft', () => {
    const roh = JSON.stringify({ '2026': { lehrende: [], studierende: [{ githubId: 1, kuerzel: 'Sofie' }] } });
    expect(() => zugangLesen(roh)).toThrow('WERKSTATT_ZUGANG ungültig');
  });
  it('Kürzel mit Pfadzeichen oder zu kurz/lang wirft', () => {
    for (const k of ['a', '../x', 'a b', '1abc', 'a'.repeat(22)]) {
      const roh = JSON.stringify({ '2026': { lehrende: [], studierende: [{ githubId: 1, kuerzel: k }] } });
      expect(() => zugangLesen(roh), k).toThrow('WERKSTATT_ZUGANG ungültig');
    }
  });
  it('falsche Form wirft', () => {
    expect(() => zugangLesen('[]')).toThrow('WERKSTATT_ZUGANG ungültig');
    expect(() => zugangLesen('{"2026":{"lehrende":"x","studierende":[]}}')).toThrow('WERKSTATT_ZUGANG ungültig');
    expect(() => zugangLesen('{"2026":{"lehrende":[],"studierende":[{"githubId":"1","kuerzel":"anna"}]}}')).toThrow('WERKSTATT_ZUGANG ungültig');
  });
});

describe('repoName', () => {
  it('Kohorte-Kürzel', () => {
    expect(repoName({ kohorte: '2026', rolle: 'studierende', kuerzel: 'anna' })).toBe('2026-anna');
  });
  it('Lehrende ohne Kürzel: wirft', () => {
    expect(() => repoName({ kohorte: '2026', rolle: 'lehrende', kuerzel: null })).toThrow();
  });
});
