import { TAGE } from '../../components/methoden';
import { kohorte2026 } from './2026';
import { describe, expect, it } from 'vitest';
import { KOHORTEN } from './index';
import { kohorteTest } from './test';

describe('Kohorten', () => {
  it('Testkohorte ist ausdrücklich aktiv und beginnt vor allen echten Jahrgängen', () => {
    expect(kohorteTest.status).toBe('aktiv');
    expect(kohorteTest.beginn).toBe('2000-01-01');
    for (const k of KOHORTEN) if (k.id !== 'test') expect(k.beginn > kohorteTest.beginn, k.id).toBe(true);
  });
});

describe('kohorte2026.termine', () => {
  it('kommen aus TAGE, keine zweite Liste', () => {
    expect(Object.keys(kohorte2026.termine)).toEqual(TAGE.map((t) => `tag${t.n}`));
    for (const t of TAGE) expect(kohorte2026.termine[`tag${t.n}`], `tag${t.n}`).toBe(t.datum ?? null);
  });
  it('tag1 und tag2 sind die Daten aus TAGE (Tag 2 am 12.11. nach der Absage im Oktober)', () => {
    expect(kohorte2026.termine.tag1).toBe('2026-10-22');
    expect(kohorte2026.termine.tag2).toBe('2026-11-12');
  });
});

describe('Kohorten-IDs', () => {
  // githubSpeicher liest die Kohorte aus dem Präfix vor dem ersten `-` des Repo-Namens.
  it('enthalten keinen Bindestrich (nur a-z und 0-9) und sind eindeutig', () => {
    for (const k of KOHORTEN) expect(k.id, k.id).toMatch(/^[a-z0-9]+$/);
    expect(new Set(KOHORTEN.map((k) => k.id)).size).toBe(KOHORTEN.length);
  });
});
