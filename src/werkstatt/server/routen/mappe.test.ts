import { describe, expect, it, vi } from 'vitest';
import annahmenBeispiel from '../../beispiele/annahmen.json';
import briefBeispiel from '../../beispiele/brief.json';
import entscheidungenBeispiel from '../../beispiele/entscheidungen.json';
import { rendern } from '../../render';
import { ApiAusnahme } from '../antwort';
import { appErstellen } from '../app';
import { fakeSpeicher } from '../fake-speicher';
import { lokaleAbhaengigkeiten, lokaleUmgebung } from '../lokal';
import { COOKIE_WERKSTATT, sitzungErstellen, type Sitzung } from '../sitzung';
import { DateiUnlesbar, GITHUB_SATZ, wirdEingerichtet } from '../speicher-fehler';
import type { Speicher } from '../typen';

const BASIS = 'http://localhost:4321';
// 21.10.2026, 22:30 UTC = 22.10.2026, 00:30 in Wien (Sommerzeit): Datum nach UTC wäre falsch.
const JETZT = Date.UTC(2026, 9, 21, 22, 30);
const HEUTE_WIEN = '2026-10-22';
const ZUGANG = { test: { lehrende: [1000], studierende: [{ githubId: 1001, kuerzel: 'sofie' }, { githubId: 1002, kuerzel: 'jonas' }] } };
const REPO = 'test-sofie';
const SOFIE = { githubId: 1001, login: 'sofie-x', kohorte: 'test', rolle: 'studierende' } as const;

function aufbau(opts: { anlegen?: Speicher['anlegen']; speichern?: Speicher['speichern']; lesen?: Speicher['lesen'] } = {}) {
  const umgebung = { ...lokaleUmgebung(), zugang: ZUGANG };
  const fake = fakeSpeicher();
  const anlegen = vi.fn(opts.anlegen ?? fake.anlegen);
  const speicher: Speicher = { ...fake, anlegen, speichern: opts.speichern ?? fake.speichern, lesen: opts.lesen ?? fake.lesen };
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
  return { app, fake, anlegen, holen, speichern, rohSpeichern, cookie, umgebung };
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

  it('werkstatt.json mit passender ID, aber anderer Kohorte → 403 auf allen Routen, kein Commit', async () => {
    const t = aufbau();
    await t.fake.anlegen({ kohorte: 'test', rolle: 'studierende', kuerzel: 'sofie' }, 1001);
    // Der Fake schreibt immer die eigene Kohorte; ein test-sofie mit fremder Kohorte in werkstatt.json wird nachgestellt.
    const fremd = { ...t.fake, werkstattJson: async (repo: string) => (repo === REPO ? { kohorte: 'andere', githubId: 1001 } : null) };
    const app = appErstellen(lokaleAbhaengigkeiten({ umgebung: t.umgebung, speicher: fremd, jetzt: () => JETZT }));
    const kopf = { Cookie: await t.cookie() };
    for (const r of [
      await app.request(`${BASIS}/api/werkstatt/mappe`, { headers: kopf }),
      await app.request(`${BASIS}/api/werkstatt/mappe/brief`, { headers: kopf }),
      await app.request(`${BASIS}/api/werkstatt/mappe/brief`, { method: 'PUT', headers: { ...kopf, Origin: BASIS, 'Content-Type': 'application/json' }, body: JSON.stringify({ daten: briefBeispiel, basisSha: null }) }),
    ]) {
      expect(r.status).toBe(403);
      expect(await r.json()).toMatchObject({ code: 'nicht-freigeschaltet' });
    }
    expect(t.fake.commits(REPO)).toHaveLength(0);
  });

  it('Anlegen scheitert mit 409 oder 502 → 503 wird-eingerichtet, nicht 409', async () => {
    for (const ausnahme of [new ApiAusnahme(409, 'konflikt', 'x'), new ApiAusnahme(502, 'github-fehler', 'y')]) {
      const t = aufbau({ anlegen: async () => { throw ausnahme; } });
      const log = vi.spyOn(console, 'error').mockImplementation(() => {});
      const r = await t.holen('');
      log.mockRestore();
      expect(r.status).toBe(503);
      expect(await r.json()).toMatchObject({ code: 'wird-eingerichtet' });
    }
  });

  it('Anlegen meldet fremdes Repo (403) → 403 geht durch', async () => {
    const t = aufbau({ anlegen: async () => { throw new ApiAusnahme(403, 'nicht-freigeschaltet', 'fremd'); } });
    const r = await t.holen('');
    expect(r.status).toBe(403);
    expect(await r.json()).toMatchObject({ code: 'nicht-freigeschaltet' });
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

describe('GET /api/werkstatt/mappe/:artefakt – kaputte Datei', () => {
  it('kaputtes JSON im Repo → 502 mit eigenem Hinweis statt „GitHub nicht erreichbar“', async () => {
    const t = await mitMappe({ lesen: async () => { throw new DateiUnlesbar('mappe/brief.json'); } });
    const r = await t.holen('/brief');
    expect(r.status).toBe(502);
    const body = (await r.json()) as { code: string; fehler: string };
    expect(body.code).toBe('github-fehler');
    expect(body.fehler).not.toBe(GITHUB_SATZ);
    expect(body.fehler).toContain('Produkt-Brief: Die gespeicherte Datei lässt sich nicht lesen');
  });
});

describe('PUT /api/werkstatt/mappe/entscheidungen – Zeilen bleiben', () => {
  const [d1, d2] = entscheidungenBeispiel.entscheidungen;
  const basis = { schema: 'entscheidungen@1', stand: '2026-10-22', entscheidungen: [d1, d2] };

  async function gespeichert() {
    const t = await mitMappe();
    const r = await t.speichern('entscheidungen', { daten: basis, basisSha: null });
    expect(r.status).toBe(200);
    return { t, sha: ((await r.json()) as { basisSha: string }).basisSha };
  }

  it('gespeicherte Entscheidung löschen → 422 mit Feldfehler, kein Commit', async () => {
    const { t, sha } = await gespeichert();
    const r = await t.speichern('entscheidungen', { daten: { ...basis, entscheidungen: [d2] }, basisSha: sha });
    expect(r.status).toBe(422);
    const body = (await r.json()) as { code: string; felder: { pfad: string; meldung: string }[] };
    expect(body.code).toBe('ungueltig');
    expect(body.felder).toStrictEqual([{ pfad: 'entscheidungen', meldung: 'D1: Gespeicherte Entscheidungen lassen sich nicht löschen – ersetze sie stattdessen.' }]);
    expect(t.fake.commits(REPO)).toHaveLength(1);
  });

  it('neue Zeile anfügen, die eine gespeicherte über ersetzt ablöst → 200', async () => {
    const { t, sha } = await gespeichert();
    const d3 = { id: 'D3', datum: '2026-11-05', entscheidung: 'Auch Linz', grund: 'Interviews', beleg: 'erzaehlt', belegIds: [], ersetzt: 'D1' };
    const r = await t.speichern('entscheidungen', { daten: { ...basis, entscheidungen: [d1, d2, d3] }, basisSha: sha });
    expect(r.status).toBe(200);
    expect(JSON.parse(t.fake.commits(REPO)[1].dateien['mappe/entscheidungen.json']).entscheidungen).toHaveLength(3);
  });

  it('ersetzt einer gespeicherten Zeile nachträglich ändern → 422', async () => {
    const { t } = await gespeichert();
    const d3 = { id: 'D3', datum: '2026-11-05', entscheidung: 'Auch Linz', grund: 'Interviews', beleg: 'erzaehlt', belegIds: [], ersetzt: 'D1' };
    const zwei = await t.speichern('entscheidungen', { daten: { ...basis, entscheidungen: [d1, d2, d3] }, basisSha: (await (await t.holen('/entscheidungen')).json()).basisSha });
    expect(zwei.status).toBe(200);
    const sha = ((await zwei.json()) as { basisSha: string }).basisSha;
    for (const neuD3 of [{ ...d3, ersetzt: 'D2' }, (({ ersetzt: _, ...rest }) => rest)(d3)]) {
      const r = await t.speichern('entscheidungen', { daten: { ...basis, entscheidungen: [d1, d2, neuD3] }, basisSha: sha });
      expect(r.status).toBe(422);
      expect((await r.json()).felder).toStrictEqual([{ pfad: 'entscheidungen.2', meldung: 'D3: Gespeicherte Entscheidungen lassen sich nicht ändern – ersetze sie stattdessen.' }]);
    }
    expect(t.fake.commits(REPO)).toHaveLength(2);
  });

  it('Inhalt einer gespeicherten Zeile ändern → 422 an der Zeile, kein Commit', async () => {
    const { t, sha } = await gespeichert();
    const geaendert = [
      { ...d2, entscheidung: 'Doch Mittagsgeschäft' },
      { ...d2, grund: 'anders' },
      { ...d2, datum: '2026-10-23' },
      { ...d2, beleg: 'gesagt' },
      { ...d2, belegIds: ['I1'] },
      { ...d2, ersetzt: 'D1' },
    ];
    for (const neu of geaendert) {
      const r = await t.speichern('entscheidungen', { daten: { ...basis, entscheidungen: [d1, neu] }, basisSha: sha });
      expect(r.status).toBe(422);
      expect((await r.json()).felder).toStrictEqual([{ pfad: 'entscheidungen.1', meldung: 'D2: Gespeicherte Entscheidungen lassen sich nicht ändern – ersetze sie stattdessen.' }]);
    }
    expect(t.fake.commits(REPO)).toHaveLength(1);
  });

  it('unveränderte gespeicherte Zeilen (auch in anderer Schlüsselreihenfolge) → 200', async () => {
    const { t, sha } = await gespeichert();
    const umgestellt = Object.fromEntries(Object.entries(d1).reverse());
    const r = await t.speichern('entscheidungen', { daten: { ...basis, entscheidungen: [umgestellt, d2] }, basisSha: sha });
    expect(r.status).toBe(200);
  });

  it('veralteter basisSha → 409 (nicht 422 gegen eine fremde Fassung)', async () => {
    const { t, sha } = await gespeichert();
    t.fake.aendernVonAussen(REPO, 'entscheidungen');
    const r = await t.speichern('entscheidungen', { daten: { ...basis, entscheidungen: [d2] }, basisSha: sha });
    expect(r.status).toBe(409);
  });

  it('stand setzt der Server, auch wenn der Browser keinen schickt', async () => {
    const { t, sha } = await gespeichert();
    const { stand: _, ...ohneStand } = basis;
    const r = await t.speichern('entscheidungen', { daten: ohneStand, basisSha: sha });
    expect(r.status).toBe(200);
    expect(JSON.parse(t.fake.commits(REPO)[1].dateien['mappe/entscheidungen.json']).stand).toBe(HEUTE_WIEN);
    expect(JSON.parse(t.fake.commits(REPO)[0].dateien['mappe/entscheidungen.json']).stand).toBe(HEUTE_WIEN);
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

  it('Nachricht: Steuerzeichen raus, nach Codepunkten auf 100 gekürzt', async () => {
    const t = await mitMappe();
    await t.speichern('brief', { daten: briefBeispiel, basisSha: null, nachricht: 'a\u0000b\u001bc\u007fd' });
    expect(t.fake.commits(REPO)[0].nachricht).toBe('Produkt-Brief: a b c d');
    const sha = (await (await t.holen('/brief')).json()).basisSha;
    await t.speichern('brief', { daten: briefBeispiel, basisSha: sha, nachricht: `${'x'.repeat(99)}😀😀` });
    const n = t.fake.commits(REPO)[1].nachricht;
    expect(n).toBe(`Produkt-Brief: ${'x'.repeat(99)}😀`);
    expect(n.isWellFormed()).toBe(true);
  });

  it('Nachricht kein Text → 422, kein Commit', async () => {
    const t = await mitMappe();
    for (const nachricht of [42, null, ['a'], { a: 1 }]) {
      const r = await t.speichern('brief', { daten: briefBeispiel, basisSha: null, nachricht });
      expect(r.status).toBe(422);
      expect(await r.json()).toMatchObject({ code: 'ungueltig' });
    }
    expect(t.fake.commits(REPO)).toHaveLength(0);
  });

  it('Fehler des Speichers gehen unverändert durch (502 github-fehler)', async () => {
    const t = await mitMappe({ speichern: async () => { throw new ApiAusnahme(502, 'github-fehler', 'Speichern gerade nicht möglich.'); } });
    const r = await t.speichern('brief', { daten: briefBeispiel, basisSha: null });
    expect(r.status).toBe(502);
    expect(await r.json()).toStrictEqual({ code: 'github-fehler', fehler: 'Speichern gerade nicht möglich.' });
  });
});
