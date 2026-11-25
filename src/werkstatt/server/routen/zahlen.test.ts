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
const ZUGANG = { test: { lehrende: [1000], studierende: [{ githubId: 1001, kuerzel: 'mara' }, { githubId: 1002, kuerzel: 'jonas' }] } };
const MARKUS = { githubId: 1000, login: 'markus', kohorte: 'test', rolle: 'lehrende' } as const;
const MARA = { githubId: 1001, login: 'mara-x', kohorte: 'test', rolle: 'studierende' } as const;
const AUTOR = { name: 'mara-x', email: 'x@example.invalid' };

afterEach(() => vi.restoreAllMocks());

async function aufbau(opts: { lesen?: (fake: Speicher) => Speicher['lesen']; werkstattJson?: Speicher['werkstattJson'] } = {}) {
  const umgebung = { ...lokaleUmgebung(), zugang: ZUGANG };
  const fake = fakeSpeicher();
  // Mara hat alle vier Artefakte, Jonas noch keine Mappe.
  await fake.anlegen({ kohorte: 'test', rolle: 'studierende', kuerzel: 'mara' }, 1001);
  const beispiele = { brief: briefBeispiel, entscheidungen: entscheidungenBeispiel, annahmen: annahmenBeispiel, leitfaden: leitfadenBeispiel };
  for (const [name, daten] of Object.entries(beispiele)) {
    await fake.speichern('test-mara', name as keyof typeof beispiele, { [`mappe/${name}.json`]: JSON.stringify(daten) }, null, AUTOR, 'x');
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

const MARA_ZAHLEN = {
  kuerzel: 'mara',
  briefFelder: 6,
  // Das gespeicherte Entscheidungslog wird seit NDU-70 nicht mehr gelesen.
  entscheidungen: 0,
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
    const r = await (await aufbau()).holen(MARA);
    expect(r.status).toBe(403);
    expect(await r.json()).toMatchObject({ code: 'nicht-freigeschaltet' });
  });

  it('Lehrende bekommen alle Mappen der Kohorte; fehlende Mappe = Nullen', async () => {
    const r = await (await aufbau()).holen(MARKUS);
    expect(r.status).toBe(200);
    expect(r.headers.get('cache-control')).toBe('no-store');
    expect(await r.json()).toStrictEqual({ kohorte: 'test', briefFelderGesamt: 6, personen: [MARA_ZAHLEN, NULLEN('jonas')] });
  });

  it('eine Mappe nicht lesbar: dort Nullen mit fehler, die anderen kommen trotzdem', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const t = await aufbau({ lesen: (fake) => async (repo, name) => { if (repo === 'test-mara') throw new Error('GitHub weg'); return fake.lesen(repo, name); } });
    const r = await t.holen(MARKUS);
    expect(r.status).toBe(200);
    expect((await r.json()).personen).toStrictEqual([{ ...NULLEN('mara'), fehler: true }, NULLEN('jonas')]);
  });

  it('Datei passt nicht zum Schema: zählt 0 und steht in unlesbar', async () => {
    const t = await aufbau();
    const alt = await t.fake.lesen('test-mara', 'annahmen');
    await t.fake.speichern('test-mara', 'annahmen', { 'mappe/annahmen.json': JSON.stringify({ ...annahmenBeispiel, annahmen: 'kaputt' }) }, alt.basisSha, AUTOR, 'x');
    const r = await t.holen(MARKUS);
    const mara = (await r.json()).personen[0];
    expect(mara).toStrictEqual({ ...MARA_ZAHLEN, annahmen: 0, unlesbar: ['annahmen'] });
  });

  it('kaputtes JSON in einer Datei: nur dieses Artefakt unlesbar, der Rest zählt', async () => {
    const t = await aufbau({ lesen: (fake) => async (repo, name) => { if (name === 'leitfaden') throw new DateiUnlesbar('mappe/leitfaden.json'); return fake.lesen(repo, name); } });
    const mara = (await (await t.holen(MARKUS)).json()).personen[0];
    expect(mara).toStrictEqual({ ...MARA_ZAHLEN, fragen: 0, unlesbar: ['leitfaden'] });
  });

  // NDU-70: Das stillgelegte Entscheidungslog wird nicht gelesen – weder „nicht lesbar“ noch ein GitHub-Fehler darauf
  // betrifft die Person.
  it('Entscheidungslog stillgelegt: kaputt oder GitHub-Fehler darauf ändert nichts an der Zeile der Person', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    for (const fehlerArt of ['unlesbar', 'github'] as const) {
      const t = await aufbau({ lesen: (fake) => async (repo, name) => {
        if (name === 'entscheidungen') throw fehlerArt === 'unlesbar' ? new DateiUnlesbar('mappe/entscheidungen.json') : new Error('GitHub weg');
        return fake.lesen(repo, name);
      } });
      const mara = (await (await t.holen(MARKUS)).json()).personen[0];
      expect(mara, fehlerArt).toStrictEqual(MARA_ZAHLEN);
    }
  });

  it('Repo gehört laut werkstatt.json jemand anderem: nicht mitzählen, fehler', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const t = await aufbau({ werkstattJson: async (repo) => (repo === 'test-mara' ? { kohorte: 'test', githubId: 4242 } : null) });
    const r = await t.holen(MARKUS);
    expect((await r.json()).personen).toStrictEqual([{ ...NULLEN('mara'), fehler: true }, NULLEN('jonas')]);
  });

  it('Brief: leere Felder zählen nicht, „nicht“ zählt einmal', async () => {
    const t = await aufbau();
    const halb = { ...briefBeispiel, problem: '  ', nicht: ['a', 'b'], outcome: { wirGlauben: 'x', wirMerkenEs: '' } };
    const alt = await t.fake.lesen('test-mara', 'brief');
    await t.fake.speichern('test-mara', 'brief', { 'mappe/brief.json': JSON.stringify(halb) }, alt.basisSha, AUTOR, 'x');
    const mara = (await (await t.holen(MARKUS)).json()).personen[0];
    expect(mara.briefFelder).toBe(4);
  });
});
