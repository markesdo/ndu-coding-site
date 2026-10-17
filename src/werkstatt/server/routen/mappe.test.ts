import { describe, expect, it, vi } from 'vitest';
import annahmenBeispiel from '../../beispiele/annahmen.json';
import briefBeispiel from '../../beispiele/brief.json';
import { rendern } from '../../render';
import { ApiAusnahme } from '../antwort';
import { appErstellen } from '../app';
import { fakeSpeicher } from '../fake-speicher';
import { lokaleAbhaengigkeiten, lokaleUmgebung } from '../lokal';
import { COOKIE_WERKSTATT, sitzungErstellen, type Sitzung } from '../sitzung';
import { wirdEingerichtet } from '../speicher-fehler';
import type { Speicher } from '../typen';

const BASIS = 'http://localhost:4321';
// 21.10.2026, 22:30 UTC = 22.10.2026, 00:30 in Wien (Sommerzeit): Datum nach UTC wäre falsch.
const JETZT = Date.UTC(2026, 9, 21, 22, 30);
const HEUTE_WIEN = '2026-10-22';
const ZUGANG = { test: { lehrende: [1000], studierende: [{ githubId: 1001, kuerzel: 'sofie' }, { githubId: 1002, kuerzel: 'jonas' }] } };
const REPO = 'test-sofie';
const SOFIE = { githubId: 1001, login: 'sofie-x', kohorte: 'test', rolle: 'studierende' } as const;

function aufbau(opts: { anlegen?: Speicher['anlegen']; speichern?: Speicher['speichern'] } = {}) {
  const umgebung = { ...lokaleUmgebung(), zugang: ZUGANG };
  const fake = fakeSpeicher();
  const anlegen = vi.fn(opts.anlegen ?? fake.anlegen);
  const speicher: Speicher = { ...fake, anlegen, speichern: opts.speichern ?? fake.speichern };
  const app = appErstellen(lokaleAbhaengigkeiten({ umgebung, speicher, jetzt: () => JETZT }));

  async function cookie(s: Omit<Sitzung, 'exp'> = SOFIE): Promise<string> {
    const wert = await sitzungErstellen({ ...s, exp: Math.floor(JETZT / 1000) + 3600 }, umgebung.sessionSecret);
    return `${COOKIE_WERKSTATT}=${wert}`;
  }
  async function holen(pfad: string, s?: Omit<Sitzung, 'exp'>) {
    return app.request(`${BASIS}/api/werkstatt/mappe${pfad}`, { headers: { Cookie: await cookie(s) } });
  }
  async function rohSpeichern(name: string, body: string, s?: Omit<Sitzung, 'exp'>) {
    return app.request(`${BASIS}/api/werkstatt/mappe/${name}`, {
      method: 'PUT',
      headers: { Cookie: await cookie(s), Origin: BASIS, 'Content-Type': 'application/json' },
      body,
    });
  }
  const speichern = (name: string, body: unknown, s?: Omit<Sitzung, 'exp'>) => rohSpeichern(name, JSON.stringify(body), s);
  return { app, fake, anlegen, holen, speichern, rohSpeichern };
}

async function mitMappe(opts: Parameters<typeof aufbau>[0] = {}) {
  const t = aufbau(opts);
  await t.fake.anlegen({ kohorte: 'test', rolle: 'studierende', kuerzel: 'sofie' }, 1001);
  return t;
}

describe('GET /api/werkstatt/mappe', () => {
  it('ohne Cookie → 401 nicht-angemeldet', async () => {
    const { app } = aufbau();
    for (const pfad of ['', '/brief']) {
      const r = await app.request(`${BASIS}/api/werkstatt/mappe${pfad}`);
      expect(r.status).toBe(401);
      expect(await r.json()).toMatchObject({ code: 'nicht-angemeldet' });
    }
    const p = await app.request(`${BASIS}/api/werkstatt/mappe/brief`, {
      method: 'PUT',
      headers: { Origin: BASIS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ daten: briefBeispiel, basisSha: null }),
    });
    expect(p.status).toBe(401);
  });

  it('liefert MappeStand der eigenen Mappe', async () => {
    const t = await mitMappe();
    const r = await t.holen('');
    expect(r.status).toBe(200);
    expect(r.headers.get('cache-control')).toBe('no-store');
    expect(await r.json()).toStrictEqual({
      kohorte: 'test',
      repo: REPO,
      artefakte: [
        { name: 'brief', vorhanden: false },
        { name: 'entscheidungen', vorhanden: false },
        { name: 'leitfaden', vorhanden: false },
        { name: 'annahmen', vorhanden: false },
      ],
    });
    expect(t.anlegen).not.toHaveBeenCalled();
  });

  it('erstes Anlegen beim Login gescheitert → GET mappe legt an und liefert 200', async () => {
    const t = aufbau();
    expect(await t.fake.werkstattJson(REPO)).toBeNull();
    const r = await t.holen('');
    expect(r.status).toBe(200);
    expect(t.anlegen).toHaveBeenCalledTimes(1);
    expect(t.anlegen).toHaveBeenCalledWith({ kohorte: 'test', rolle: 'studierende', kuerzel: 'sofie' }, 1001);
    expect((await r.json()).repo).toBe(REPO);
    expect(await t.fake.werkstattJson(REPO)).toStrictEqual({ kohorte: 'test', githubId: 1001 });
  });

  it('Anlegen scheitert erneut → 503 wird-eingerichtet', async () => {
    const t = aufbau({ anlegen: async () => { throw wirdEingerichtet(); } });
    const r = await t.holen('');
    expect(r.status).toBe(503);
    expect(await r.json()).toMatchObject({ code: 'wird-eingerichtet' });
    expect(t.anlegen).toHaveBeenCalledTimes(1);
  });

  it('Anlegen scheitert mit einem unerwarteten Fehler → 503 wird-eingerichtet', async () => {
    const t = aufbau({ anlegen: async () => { throw new Error('GitHub kaputt'); } });
    const fehlerLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    const r = await t.holen('');
    fehlerLog.mockRestore();
    expect(r.status).toBe(503);
    expect(await r.json()).toMatchObject({ code: 'wird-eingerichtet' });
  });

  it('Repo mit fremder werkstatt.json → 403 nicht-freigeschaltet, auch für Artefakte', async () => {
    const t = aufbau();
    // Repo gleichen Namens, aber für eine andere GitHub-ID angelegt.
    await t.fake.anlegen({ kohorte: 'test', rolle: 'studierende', kuerzel: 'sofie' }, 1002);
    const r = await t.holen('');
    expect(r.status).toBe(403);
    expect(await r.json()).toMatchObject({ code: 'nicht-freigeschaltet' });
    expect((await t.holen('/brief')).status).toBe(403);
    expect((await t.speichern('brief', { daten: briefBeispiel, basisSha: null })).status).toBe(403);
    expect(t.fake.commits(REPO)).toHaveLength(0);
  });

  it('Lehrende: GET mappe 200 ohne Repo, Artefakt-Routen 403', async () => {
    const t = aufbau();
    const lehrende = { githubId: 1000, login: 'markus-x', kohorte: 'test', rolle: 'lehrende' } as const;
    const r = await t.holen('', lehrende);
    expect(r.status).toBe(200);
    expect(await r.json()).toStrictEqual({ kohorte: 'test', repo: '', artefakte: [] });
    expect(t.anlegen).not.toHaveBeenCalled();
    const g = await t.holen('/brief', lehrende);
    expect(g.status).toBe(403);
    expect(await g.json()).toMatchObject({ code: 'nicht-freigeschaltet' });
    expect((await t.speichern('brief', { daten: briefBeispiel, basisSha: null }, lehrende)).status).toBe(403);
  });
});

describe('GET /api/werkstatt/mappe/:artefakt', () => {
  it('fehlende Datei → daten und basisSha null', async () => {
    const t = await mitMappe();
    const r = await t.holen('/brief');
    expect(r.status).toBe(200);
    expect(await r.json()).toStrictEqual({ name: 'brief', daten: null, basisSha: null });
  });

  it('unbekannter Name → 404 unbekannt', async () => {
    const t = await mitMappe();
    for (const name of ['interviews', 'constructor', '..%2Fwerkstatt']) {
      const r = await t.holen(`/${name}`);
      expect(r.status).toBe(404);
      expect(await r.json()).toMatchObject({ code: 'unbekannt' });
    }
    const p = await t.speichern('interviews', { daten: {}, basisSha: null });
    expect(p.status).toBe(404);
    expect(t.fake.commits(REPO)).toHaveLength(0);
  });

  it('Mappe noch nicht angelegt → 503 wird-eingerichtet (ohne anzulegen)', async () => {
    const t = aufbau();
    const r = await t.holen('/brief');
    expect(r.status).toBe(503);
    expect(await r.json()).toMatchObject({ code: 'wird-eingerichtet' });
    expect(t.anlegen).not.toHaveBeenCalled();
  });
});

describe('PUT /api/werkstatt/mappe/:artefakt', () => {
  it('gültig → 200, ein Commit mit drei Dateien, stand = heute in Wien', async () => {
    const t = await mitMappe();
    const r = await t.speichern('brief', { daten: { ...briefBeispiel, stand: '2026-01-01' }, basisSha: null });
    expect(r.status).toBe(200);
    const antwort = (await r.json()) as { basisSha: string; commitUrl: string };
    expect(antwort.basisSha).toMatch(/^[0-9a-f]{40}$/);
    expect(typeof antwort.commitUrl).toBe('string');

    const commits = t.fake.commits(REPO);
    expect(commits).toHaveLength(1);
    const c = commits[0];
    expect(Object.keys(c.dateien).sort()).toStrictEqual(['README.md', 'mappe/brief.json', 'mappe/brief.md']);
    const gespeichert = JSON.parse(c.dateien['mappe/brief.json']);
    expect(gespeichert).toStrictEqual({ ...briefBeispiel, stand: HEUTE_WIEN });
    expect(c.dateien['mappe/brief.md']).toBe(rendern('brief', gespeichert));
    // README nach dem Speichern: der Brief ist vorhanden, die anderen noch offen.
    expect(c.dateien['README.md']).toContain('| Produkt-Brief | [mappe/brief.md](mappe/brief.md) |');
    expect(c.dateien['README.md']).toContain('| Annahmen-Map | noch offen |');
    expect(c.autor).toStrictEqual({ name: 'sofie-x', email: '1001+sofie-x@users.noreply.github.com' });
    expect(c.nachricht).toBe('Produkt-Brief: gespeichert über die Werkstatt');

    // Lesen danach liefert genau diesen Stand.
    const g = await t.holen('/brief');
    expect(await g.json()).toStrictEqual({ name: 'brief', daten: { ...briefBeispiel, stand: HEUTE_WIEN }, basisSha: antwort.basisSha });
    expect((await (await t.holen('')).json()).artefakte[0]).toStrictEqual({ name: 'brief', vorhanden: true });
  });

  it('ungültig → 422 ungueltig mit felder, kein Commit', async () => {
    const t = await mitMappe();
    const r = await t.speichern('brief', { daten: { ...briefBeispiel, problem: 42 }, basisSha: null });
    expect(r.status).toBe(422);
    const body = (await r.json()) as { code: string; fehler: string; felder: { pfad: string; meldung: string }[] };
    expect(body.code).toBe('ungueltig');
    expect(typeof body.fehler).toBe('string');
    expect(body.felder[0].pfad).toBe('problem');
    expect(body.felder[0].meldung.length).toBeGreaterThan(0);
    expect(t.fake.commits(REPO)).toHaveLength(0);
  });

  it('kaputte Anfrage (kein JSON, basisSha falsch, keine Daten) → 422, kein Commit', async () => {
    const t = await mitMappe();
    const kaputt = await t.rohSpeichern('brief', '{');
    expect(kaputt.status).toBe(422);
    expect(await kaputt.json()).toMatchObject({ code: 'ungueltig' });
    for (const body of [{ daten: briefBeispiel, basisSha: 7 }, { daten: briefBeispiel }, 'text', null, []]) {
      const r = await t.speichern('brief', body);
      expect(r.status).toBe(422);
      expect(await r.json()).toMatchObject({ code: 'ungueltig' });
    }
    expect(t.fake.commits(REPO)).toHaveLength(0);
  });

  it('veralteter basisSha → 409 konflikt, kein neuer Commit', async () => {
    const t = await mitMappe();
    const erst = (await (await t.speichern('brief', { daten: briefBeispiel, basisSha: null })).json()) as { basisSha: string };
    t.fake.aendernVonAussen(REPO, 'brief');
    const r = await t.speichern('brief', { daten: { ...briefBeispiel, problem: 'neu' }, basisSha: erst.basisSha });
    expect(r.status).toBe(409);
    expect(await r.json()).toMatchObject({ code: 'konflikt' });
    expect(t.fake.commits(REPO)).toHaveLength(1);
  });

  it('Brief und Annahmen nacheinander mit ihrem jeweils geladenen basisSha → beide 200', async () => {
    const t = await mitMappe();
    await t.speichern('brief', { daten: briefBeispiel, basisSha: null });
    await t.speichern('annahmen', { daten: annahmenBeispiel, basisSha: null });
    // Zwei Tabs laden beide Artefakte, dann speichern beide nacheinander.
    const brief = (await (await t.holen('/brief')).json()) as { basisSha: string };
    const annahmen = (await (await t.holen('/annahmen')).json()) as { basisSha: string };
    const a = await t.speichern('brief', { daten: { ...briefBeispiel, problem: 'geändert' }, basisSha: brief.basisSha });
    const b = await t.speichern('annahmen', { daten: { ...annahmenBeispiel, riskanteste: 'A2' }, basisSha: annahmen.basisSha });
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    const commits = t.fake.commits(REPO);
    expect(commits).toHaveLength(4);
    // Das README des letzten Commits kennt beide Artefakte.
    expect(commits[3].dateien['README.md']).toContain('[mappe/brief.md](mappe/brief.md)');
    expect(commits[3].dateien['README.md']).toContain('[mappe/annahmen.md](mappe/annahmen.md)');
    expect(commits[3].nachricht).toBe('Annahmen-Map: gespeichert über die Werkstatt');
  });

  it('eigene Nachricht: einzeilig hinter dem Titel', async () => {
    const t = await mitMappe();
    await t.speichern('brief', { daten: briefBeispiel, basisSha: null, nachricht: '  Problem geschärft\n  und Zielgruppe ' });
    expect(t.fake.commits(REPO)[0].nachricht).toBe('Produkt-Brief: Problem geschärft und Zielgruppe');
  });

  it('Fehler des Speichers gehen unverändert durch (502 github-fehler)', async () => {
    const t = await mitMappe({ speichern: async () => { throw new ApiAusnahme(502, 'github-fehler', 'Speichern gerade nicht möglich.'); } });
    const r = await t.speichern('brief', { daten: briefBeispiel, basisSha: null });
    expect(r.status).toBe(502);
    expect(await r.json()).toStrictEqual({ code: 'github-fehler', fehler: 'Speichern gerade nicht möglich.' });
  });
});
