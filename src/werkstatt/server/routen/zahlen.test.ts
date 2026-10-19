import { afterEach, describe, expect, it, vi } from 'vitest';
import annahmenBeispiel from '../../beispiele/annahmen.json';
import briefBeispiel from '../../beispiele/brief.json';
import entscheidungenBeispiel from '../../beispiele/entscheidungen.json';
import leitfadenBeispiel from '../../beispiele/leitfaden.json';
import { appErstellen } from '../app';
import { fakeSpeicher } from '../fake-speicher';
import { lokaleAbhaengigkeiten, lokaleUmgebung } from '../lokal';
import { COOKIE_WERKSTATT, sitzungErstellen, type Sitzung } from '../sitzung';
import { DateiUnlesbar } from '../speicher-fehler';
import type { Speicher } from '../typen';

const BASIS = 'http://localhost:4321';
const JETZT = Date.UTC(2026, 9, 22, 14, 0);
const ZUGANG = { test: { lehrende: [1000], studierende: [{ githubId: 1001, kuerzel: 'sofie' }, { githubId: 1002, kuerzel: 'jonas' }] } };
const MARKUS = { githubId: 1000, login: 'markus', kohorte: 'test', rolle: 'lehrende' } as const;
const SOFIE = { githubId: 1001, login: 'sofie-x', kohorte: 'test', rolle: 'studierende' } as const;
const AUTOR = { name: 'sofie-x', email: 'x@example.invalid' };

afterEach(() => vi.restoreAllMocks());

async function aufbau(opts: { lesen?: (fake: Speicher) => Speicher['lesen']; werkstattJson?: Speicher['werkstattJson'] } = {}) {
  const umgebung = { ...lokaleUmgebung(), zugang: ZUGANG };
  const fake = fakeSpeicher();
  // Sofie hat alle vier Artefakte, Jonas noch keine Mappe.
  await fake.anlegen({ kohorte: 'test', rolle: 'studierende', kuerzel: 'sofie' }, 1001);
  const beispiele = { brief: briefBeispiel, entscheidungen: entscheidungenBeispiel, annahmen: annahmenBeispiel, leitfaden: leitfadenBeispiel };
  for (const [name, daten] of Object.entries(beispiele)) {
    await fake.speichern('test-sofie', name as keyof typeof beispiele, { [`mappe/${name}.json`]: JSON.stringify(daten) }, null, AUTOR, 'x');
  }
  const speicher: Speicher = { ...fake, lesen: opts.lesen ? opts.lesen(fake) : fake.lesen, werkstattJson: opts.werkstattJson ?? fake.werkstattJson };
  const app = appErstellen(lokaleAbhaengigkeiten({ umgebung, speicher, jetzt: () => JETZT }));
  async function holen(s?: Omit<Sitzung, 'exp'>) {
    const headers: Record<string, string> = {};
    if (s) headers.Cookie = `${COOKIE_WERKSTATT}=${await sitzungErstellen({ ...s, exp: Math.floor(JETZT / 1000) + 3600 }, umgebung.sessionSecret)}`;
    return app.request(`${BASIS}/api/werkstatt/zahlen`, { headers });
  }
  return { fake, holen };
}

const SOFIE_ZAHLEN = {
  kuerzel: 'sofie',
  briefFelder: 6,
  entscheidungen: entscheidungenBeispiel.entscheidungen.length,
  annahmen: annahmenBeispiel.annahmen.length,
  fragen: leitfadenBeispiel.fragen.length,
  unlesbar: [],
};
const NULLEN = (kuerzel: string) => ({ kuerzel, briefFelder: 0, entscheidungen: 0, annahmen: 0, fragen: 0, unlesbar: [] });

describe('GET /api/werkstatt/zahlen', () => {
  it('ohne Anmeldung → 401', async () => {
    const r = await (await aufbau()).holen();
    expect(r.status).toBe(401);
  });

  it('Studierende → 403, auch nicht die eigenen Zahlen', async () => {
    const r = await (await aufbau()).holen(SOFIE);
    expect(r.status).toBe(403);
    expect(await r.json()).toMatchObject({ code: 'nicht-freigeschaltet' });
  });

  it('Lehrende bekommen alle Mappen der Kohorte; fehlende Mappe = Nullen', async () => {
    const r = await (await aufbau()).holen(MARKUS);
    expect(r.status).toBe(200);
    expect(r.headers.get('cache-control')).toBe('no-store');
    expect(await r.json()).toStrictEqual({ kohorte: 'test', briefFelderGesamt: 6, personen: [SOFIE_ZAHLEN, NULLEN('jonas')] });
  });

  it('eine Mappe nicht lesbar: dort Nullen mit fehler, die anderen kommen trotzdem', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const t = await aufbau({ lesen: (fake) => async (repo, name) => { if (repo === 'test-sofie') throw new Error('GitHub weg'); return fake.lesen(repo, name); } });
    const r = await t.holen(MARKUS);
    expect(r.status).toBe(200);
    expect((await r.json()).personen).toStrictEqual([{ ...NULLEN('sofie'), fehler: true }, NULLEN('jonas')]);
  });

  it('Datei passt nicht zum Schema: zählt 0 und steht in unlesbar', async () => {
    const t = await aufbau();
    const alt = await t.fake.lesen('test-sofie', 'annahmen');
    await t.fake.speichern('test-sofie', 'annahmen', { 'mappe/annahmen.json': JSON.stringify({ ...annahmenBeispiel, annahmen: 'kaputt' }) }, alt.basisSha, AUTOR, 'x');
    const r = await t.holen(MARKUS);
    const sofie = (await r.json()).personen[0];
    expect(sofie).toStrictEqual({ ...SOFIE_ZAHLEN, annahmen: 0, unlesbar: ['annahmen'] });
  });

  it('kaputtes JSON in einer Datei: nur dieses Artefakt unlesbar, der Rest zählt', async () => {
    const t = await aufbau({ lesen: (fake) => async (repo, name) => { if (name === 'leitfaden') throw new DateiUnlesbar('mappe/leitfaden.json'); return fake.lesen(repo, name); } });
    const sofie = (await (await t.holen(MARKUS)).json()).personen[0];
    expect(sofie).toStrictEqual({ ...SOFIE_ZAHLEN, fragen: 0, unlesbar: ['leitfaden'] });
  });

  it('Repo gehört laut werkstatt.json jemand anderem: nicht mitzählen, fehler', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const t = await aufbau({ werkstattJson: async (repo) => (repo === 'test-sofie' ? { kohorte: 'test', githubId: 4242 } : null) });
    const r = await t.holen(MARKUS);
    expect((await r.json()).personen).toStrictEqual([{ ...NULLEN('sofie'), fehler: true }, NULLEN('jonas')]);
  });

  it('Brief: leere Felder zählen nicht, „nicht“ zählt einmal', async () => {
    const t = await aufbau();
    const halb = { ...briefBeispiel, problem: '  ', nicht: ['a', 'b'], outcome: { wirGlauben: 'x', wirMerkenEs: '' } };
    const alt = await t.fake.lesen('test-sofie', 'brief');
    await t.fake.speichern('test-sofie', 'brief', { 'mappe/brief.json': JSON.stringify(halb) }, alt.basisSha, AUTOR, 'x');
    const sofie = (await (await t.holen(MARKUS)).json()).personen[0];
    expect(sofie.briefFelder).toBe(4);
  });
});
