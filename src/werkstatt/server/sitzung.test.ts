import { describe, expect, it } from 'vitest';
import { COOKIE_WERKSTATT, sitzungErstellen, sitzungLesen, type Sitzung } from './sitzung';

const SECRET = 'a'.repeat(40);
const JETZT = 1_800_000_000;
const sitzung: Sitzung = { githubId: 1001, login: 'sofie-x', kohorte: 'test', rolle: 'studierende', exp: JETZT + 1000 };

describe('Sitzung', () => {
  it('Cookie heißt ndu_werkstatt', () => expect(COOKIE_WERKSTATT).toBe('ndu_werkstatt'));

  it('Rundlauf', async () => {
    const c = await sitzungErstellen(sitzung, SECRET);
    expect(await sitzungLesen(c, SECRET, JETZT)).toStrictEqual(sitzung);
  });

  it('manipulierte Nutzlast oder Signatur: null', async () => {
    const c = await sitzungErstellen(sitzung, SECRET);
    const [n, sig] = c.split('.');
    const fremd = btoa(JSON.stringify({ ...sitzung, rolle: 'lehrende' })).replace(/=+$/, '');
    expect(await sitzungLesen(`${fremd}.${sig}`, SECRET, JETZT)).toBeNull();
    expect(await sitzungLesen(`${n}.${sig.slice(0, -1)}${sig.endsWith('A') ? 'B' : 'A'}`, SECRET, JETZT)).toBeNull();
    expect(await sitzungLesen(c, 'b'.repeat(40), JETZT)).toBeNull();
  });

  it('abgelaufen, leer, Müll: null', async () => {
    const c = await sitzungErstellen(sitzung, SECRET);
    expect(await sitzungLesen(c, SECRET, sitzung.exp)).toBeNull();
    expect(await sitzungLesen(undefined, SECRET, JETZT)).toBeNull();
    expect(await sitzungLesen('müll', SECRET, JETZT)).toBeNull();
    expect(await sitzungLesen('a.b.c', SECRET, JETZT)).toBeNull();
  });

  it('signierte Nutzlast ohne gültige Form: null', async () => {
    const c = await sitzungErstellen({ ...sitzung, rolle: 'admin' as never }, SECRET);
    expect(await sitzungLesen(c, SECRET, JETZT)).toBeNull();
  });
});
