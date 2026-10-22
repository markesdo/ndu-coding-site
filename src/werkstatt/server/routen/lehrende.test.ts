import { afterEach, describe, expect, it, vi } from 'vitest';
import annahmenBeispiel from '../../beispiele/annahmen.json';
import briefBeispiel from '../../beispiele/brief.json';
import interviewsBeispiel from '../../beispiele/interviews.json';
import { artefaktParsen, type ArtefaktName } from '../../schemas';
import { artefaktStand, faelligZuTag } from '../../tag-stand';
import { verknuepfungenPruefen } from '../../verknuepfungen';
import { appErstellen } from '../app';
import { fakeSpeicher } from '../fake-speicher';
import { lokaleAbhaengigkeiten, lokaleUmgebung } from '../lokal';
import { COOKIE_WERKSTATT, sitzungErstellen, type Sitzung } from '../sitzung';
import { DateiUnlesbar } from '../speicher-fehler';
import type { Speicher } from '../typen';

const BASIS = 'http://localhost:4321';
// Kohorte 2026: Tag 1 am 22.10.2026, Tag 2 ohne Termin, Tag 3 am 21.11.2026 (aus TAGE).
const ZUGANG = {
  '2026': { lehrende: [1000], studierende: [{ githubId: 1001, kuerzel: 'sofie' }, { githubId: 1002, kuerzel: 'jonas' }, { githubId: 1003, kuerzel: 'lea' }] },
  test: { lehrende: [1000, 2000], studierende: [{ githubId: 2001, kuerzel: 'tom' }] },
};
const MARKUS = { githubId: 1000, login: 'markus', kohorte: '2026', rolle: 'lehrende' } as const;
// Lehrt nur in der Kohorte test.
const ANDERE = { githubId: 2000, login: 'andere', kohorte: 'test', rolle: 'lehrende' } as const;
const SOFIE = { githubId: 1001, login: 'sofie-x', kohorte: '2026', rolle: 'studierende' } as const;
const AUTOR = { name: 'sofie-x', email: 'x@example.invalid' };
const NAMEN: ArtefaktName[] = ['brief', 'entscheidungen', 'annahmen', 'leitfaden', 'interviews'];

afterEach(() => vi.restoreAllMocks());

const ms = (iso: string) => Date.parse(iso);
const SOFIE_ = (a: { personen: { kuerzel: string; artefakte?: unknown[]; luecken?: unknown[] }[] }) => a.personen.find((p) => p.kuerzel === 'sofie')! as { artefakte: any[]; luecken: any[] };
// Standard-Uhr 24.10.2026: der nächste Kurstag mit Termin ist Tag 3 (Tag 2 hat keinen).
const KURSTAG = 3;
// Noch kein Feedback (NDU-35): alle Zahlen 0.
const OHNE_FEEDBACK = { offen: 0, erledigt: 0, neu: 0, antworten: 0 };
const offen = (name: ArtefaktName) => ({ name, stand: 'offen', umfang: null, fehlt: [], leer: false, faelligZuTag: faelligZuTag(name), faellig: faelligZuTag(name) <= KURSTAG, commits: 0, mehr: false, zuletzt: null, feedback: OHNE_FEEDBACK });

async function aufbau(opts: { jetzt?: string; speicher?: (fake: Speicher) => Partial<Speicher> } = {}) {
  const umgebung = { ...lokaleUmgebung(), zugang: ZUGANG };
  const uhr = { ms: ms('2026-10-21T12:00:00Z') };
  const fake = fakeSpeicher({ jetzt: () => uhr.ms });
  const speichern = async (repo: string, name: ArtefaktName, daten: unknown, wann: string) => {
    uhr.ms = ms(wann);
    const alt = await fake.lesen(repo, name);
    await fake.speichern(repo, name, { [`mappe/${name}.json`]: JSON.stringify(daten) }, alt.basisSha, AUTOR, 'x');
  };
  // Sofie: Brief vor Tag 1 und kurz nach Mitternacht in Wien am Tag 1 (UTC noch 21.10.), Annahmen und Interviews danach.
  // Lea: Mappe angelegt, noch nichts gespeichert. Jonas: noch nie angemeldet (kein Repo).
  await fake.anlegen({ kohorte: '2026', rolle: 'studierende', kuerzel: 'sofie' }, 1001);
  await fake.anlegen({ kohorte: '2026', rolle: 'studierende', kuerzel: 'lea' }, 1003);
  await fake.anlegen({ kohorte: 'test', rolle: 'studierende', kuerzel: 'tom' }, 2001);
  await speichern('2026-sofie', 'brief', briefBeispiel, '2026-10-21T08:00:00Z');
  await speichern('2026-sofie', 'brief', { ...briefBeispiel, problem: 'Neu' }, '2026-10-21T22:30:00Z');
  await speichern('2026-sofie', 'annahmen', annahmenBeispiel, '2026-10-23T09:00:00Z');
  await speichern('2026-sofie', 'annahmen', { ...annahmenBeispiel, riskanteste: 'A2' }, '2026-10-23T10:00:00Z');
  await speichern('2026-sofie', 'interviews', interviewsBeispiel, '2026-10-23T11:00:00Z');
  await speichern('test-tom', 'brief', briefBeispiel, '2026-10-23T11:00:00Z');
  uhr.ms = ms(opts.jetzt ?? '2026-10-24T10:00:00Z');

  const speicher: Speicher = { ...fake, ...(opts.speicher?.(fake) ?? {}) };
  const app = appErstellen(lokaleAbhaengigkeiten({ umgebung, speicher, jetzt: () => uhr.ms }));
  async function holen(pfad: string, s?: Omit<Sitzung, 'exp'>, init: RequestInit = {}) {
    const headers: Record<string, string> = { ...((init.headers as Record<string, string> | undefined) ?? {}) };
    if (s) headers.Cookie = `${COOKIE_WERKSTATT}=${await sitzungErstellen({ ...s, exp: Math.floor(uhr.ms / 1000) + 3600 }, umgebung.sessionSecret)}`;
    return app.request(`${BASIS}${pfad}`, { ...init, headers });
  }
  return { fake, speicher, holen, uhr };
}

const parsen = <N extends ArtefaktName>(name: N, roh: unknown) => {
  const p = artefaktParsen(name, roh);
  if (!p.ok) throw new Error(`Beispiel ${name} ungültig`);
  return p.daten;
};

describe('GET /api/werkstatt/lehrende – wer darf', () => {
  it('ohne Anmeldung → 401', async () => {
    expect((await (await aufbau()).holen('/api/werkstatt/lehrende')).status).toBe(401);
  });

  it('Studierende → 403, auch mit ?kohorte ihrer eigenen Kohorte', async () => {
    const t = await aufbau();
    for (const pfad of ['/api/werkstatt/lehrende', '/api/werkstatt/lehrende?kohorte=2026']) {
      const r = await t.holen(pfad, SOFIE);
      expect(r.status, pfad).toBe(403);
      expect(await r.json()).toStrictEqual({ code: 'nicht-freigeschaltet', fehler: 'Die Mappen der ganzen Kohorte sehen nur die Lehrenden dieser Kohorte.' });
    }
  });

  it('Studierende sehen weiter nur die eigene Mappe', async () => {
    const t = await aufbau();
    const r = await t.holen('/api/werkstatt/mappe', SOFIE);
    expect(r.status).toBe(200);
    expect((await r.json()).repo).toBe('2026-sofie');
    const brief = await t.holen('/api/werkstatt/mappe/brief', SOFIE);
    expect((await brief.json()).daten.problem).toBe('Neu');
  });

  it('Lehrende einer anderen Kohorte → 403 für 2026; ohne ?kohorte nur ihre eigene', async () => {
    const t = await aufbau();
    const r = await t.holen('/api/werkstatt/lehrende?kohorte=2026', ANDERE);
    expect(r.status).toBe(403);
    const eigen = await (await t.holen('/api/werkstatt/lehrende', ANDERE)).json();
    expect(eigen.kohorte).toBe('test');
    expect(eigen.kohorten).toStrictEqual([{ id: 'test', titel: 'Test' }]);
    expect(eigen.personen.map((p: { kuerzel: string }) => p.kuerzel)).toStrictEqual(['tom']);
  });

  it('unbekannte Kohorte → 403 (verrät nicht, ob es sie gibt)', async () => {
    const r = await (await aufbau()).holen('/api/werkstatt/lehrende?kohorte=1999', MARKUS);
    expect(r.status).toBe(403);
  });

  it('Lehrende in zwei Kohorten wählen; Standard ist die Kohorte der Sitzung', async () => {
    const t = await aufbau();
    const standard = await (await t.holen('/api/werkstatt/lehrende', MARKUS)).json();
    expect(standard.kohorte).toBe('2026');
    expect(standard.kohorten).toStrictEqual([{ id: '2026', titel: 'Innolab 26/27' }, { id: 'test', titel: 'Test' }]);
    const test = await (await t.holen('/api/werkstatt/lehrende?kohorte=test', MARKUS)).json();
    expect(test.kohorte).toBe('test');
    expect(test.personen.map((p: { kuerzel: string }) => p.kuerzel)).toStrictEqual(['tom']);
  });

  it('nur lesend: kein Commit, POST auf die Matrix gibt es nicht (ohne Origin schon vorher 403 csrf)', async () => {
    const t = await aufbau();
    const vorher = t.fake.commits('2026-sofie').length;
    await t.holen('/api/werkstatt/lehrende', MARKUS);
    await t.holen('/api/werkstatt/lehrende/artefakt?kohorte=2026&person=sofie&artefakt=brief', MARKUS);
    expect(t.fake.commits('2026-sofie')).toHaveLength(vorher);
    expect((await t.holen('/api/werkstatt/lehrende', MARKUS, { method: 'POST' })).status).toBe(403);
    const mitOrigin = { method: 'POST', headers: { Origin: BASIS, 'Content-Type': 'application/json' }, body: '{}' };
    expect((await t.holen('/api/werkstatt/lehrende', MARKUS, mitOrigin)).status).toBe(404);
    expect((await t.holen('/api/werkstatt/lehrende/artefakt', MARKUS, mitOrigin)).status).toBe(404);
  });
});

describe('GET /api/werkstatt/lehrende – Inhalt', () => {
  it('alle Mappen nebeneinander: Stand, fällig, Commits seit Tag 1 (Kalendertag in Wien), Lücken – ohne Inhalt', async () => {
    const t = await aufbau();
    const r = await t.holen('/api/werkstatt/lehrende', MARKUS);
    expect(r.status).toBe(200);
    expect(r.headers.get('cache-control')).toBe('no-store');
    const a = await r.json();
    expect(a.tage).toStrictEqual([{ tag: 1, datum: '2026-10-22' }]);
    expect(a.bezug).toStrictEqual({ tag: 1, datum: '2026-10-22' });

    const daten = {
      brief: parsen('brief', { ...briefBeispiel, problem: 'Neu' }),
      annahmen: parsen('annahmen', { ...annahmenBeispiel, riskanteste: 'A2' }),
      interviews: parsen('interviews', interviewsBeispiel),
    };
    const vorhanden = (name: 'brief' | 'annahmen' | 'interviews', commits: number, zuletzt: string) => {
      const st = artefaktStand(name, daten[name] as never);
      return {
        name, stand: 'vorhanden', umfang: st.umfang, fehlt: st.fehlt, leer: st.stand === 'leer', faelligZuTag: faelligZuTag(name), faellig: faelligZuTag(name) <= KURSTAG,
        commits, mehr: false, zuletzt, feedback: OHNE_FEEDBACK,
      };
    };
    const luecken = verknuepfungenPruefen({ brief: daten.brief, entscheidungen: null, leitfaden: null, annahmen: daten.annahmen, interviews: daten.interviews }).befunde;
    expect(luecken.length).toBeGreaterThan(0);

    expect(a.kurstag).toStrictEqual({ tag: 3, titel: 'Lösung, Story, Prototyp', lage: 'naechster' });
    expect(a.spalten).toStrictEqual([
      { name: 'brief', faelligZuTag: 2, hausaufgabe: false },
      { name: 'entscheidungen', faelligZuTag: faelligZuTag('entscheidungen'), hausaufgabe: false },
      { name: 'annahmen', faelligZuTag: faelligZuTag('annahmen'), hausaufgabe: false },
      { name: 'leitfaden', faelligZuTag: faelligZuTag('leitfaden'), hausaufgabe: false },
      { name: 'interviews', faelligZuTag: 2, hausaufgabe: true },
    ]);
    // Alphabetisch nach Kürzel, nicht in der Reihenfolge der Zugangsliste.
    expect(a.personen).toStrictEqual([
      { kuerzel: 'jonas', zustand: 'keine-mappe' },
      { kuerzel: 'lea', zustand: 'bereit', repo: '2026-lea', repoUrl: 'https://github.com/ndu-innolab/2026-lea', zuletzt: null, artefakte: NAMEN.map(offen), luecken: [] },
      {
        kuerzel: 'sofie',
        zustand: 'bereit',
        repo: '2026-sofie',
        repoUrl: 'https://github.com/ndu-innolab/2026-sofie',
        zuletzt: '2026-10-23T11:00:00.000Z',
        artefakte: [
          // Der Brief vom 21.10. (Wien) zählt nicht, der um 00:30 am 22.10. (Wien, UTC noch 21.10.) schon.
          vorhanden('brief', 1, '2026-10-21T22:30:00.000Z'),
          offen('entscheidungen'),
          vorhanden('annahmen', 2, '2026-10-23T10:00:00.000Z'),
          offen('leitfaden'),
          vorhanden('interviews', 1, '2026-10-23T11:00:00.000Z'),
        ],
        luecken,
      },
    ]);
  });

  it('Kurstag: heute, als Nächstes, nach dem letzten Termin vorbei', async () => {
    const heute = await (await (await aufbau({ jetzt: '2026-10-22T15:00:00Z' })).holen('/api/werkstatt/lehrende', MARKUS)).json();
    expect(heute.kurstag).toStrictEqual({ tag: 1, titel: 'Rahmen & Verstehen', lage: 'heute' });
    // Am Tag 1 ist noch nichts fällig (alles erst zu Tag 2), ab dem nächsten Kurstag schon.
    expect(SOFIE_(heute).artefakte.map((x) => x.faellig)).toStrictEqual(NAMEN.map((n) => faelligZuTag(n) <= 1));
    expect(SOFIE_(heute).artefakte.find((x) => x.name === 'brief')!.faellig).toBe(false);
    const spaeter = await (await (await aufbau()).holen('/api/werkstatt/lehrende', MARKUS)).json();
    expect(SOFIE_(spaeter).artefakte.find((x) => x.name === 'brief')!.faellig).toBe(true);
    const vorbei = await (await (await aufbau({ jetzt: '2027-02-01T10:00:00Z' })).holen('/api/werkstatt/lehrende', MARKUS)).json();
    expect(vorbei.kurstag).toMatchObject({ tag: 7, lage: 'vorbei' });
  });

  it('Lücke aus verknuepfungenPruefen: unbekannte ID in der Annahmen-Map', async () => {
    const t = await aufbau();
    const alt = await t.fake.lesen('2026-sofie', 'annahmen');
    const kaputt = { ...annahmenBeispiel, annahmen: annahmenBeispiel.annahmen.map((x, i) => (i === 0 ? { ...x, belegIds: ['I9-9'] } : x)) };
    await t.fake.speichern('2026-sofie', 'annahmen', { 'mappe/annahmen.json': JSON.stringify(kaputt) }, alt.basisSha, AUTOR, 'x');
    const a = await (await t.holen('/api/werkstatt/lehrende', MARKUS)).json();
    expect(SOFIE_(a).luecken).toContainEqual(expect.objectContaining({ art: 'unbekannte-id', artefakt: 'annahmen', id: 'I9-9' }));
  });

  it('am Tag 1 selbst zählt Tag 1; ab Tag 3 zählt Tag 3; ?seit wählt einen vergangenen Kurstag', async () => {
    const amTag1 = await (await (await aufbau({ jetzt: '2026-10-22T15:00:00Z' })).holen('/api/werkstatt/lehrende', MARKUS)).json();
    expect(amTag1.bezug).toStrictEqual({ tag: 1, datum: '2026-10-22' });

    const t = await aufbau({ jetzt: '2026-11-22T09:00:00Z' });
    const spaeter = await (await t.holen('/api/werkstatt/lehrende', MARKUS)).json();
    expect(spaeter.tage).toStrictEqual([{ tag: 1, datum: '2026-10-22' }, { tag: 3, datum: '2026-11-21' }]);
    expect(spaeter.bezug).toStrictEqual({ tag: 3, datum: '2026-11-21' });
    expect(SOFIE_(spaeter).artefakte[0]).toMatchObject({ name: 'brief', commits: 0, zuletzt: '2026-10-21T22:30:00.000Z' });

    const seit1 = await (await t.holen('/api/werkstatt/lehrende?seit=1', MARKUS)).json();
    expect(seit1.bezug).toStrictEqual({ tag: 1, datum: '2026-10-22' });
    expect(SOFIE_(seit1).artefakte[0]).toMatchObject({ name: 'brief', commits: 1 });
  });

  it('?seit für einen künftigen, terminlosen oder unsinnigen Tag → 422', async () => {
    const t = await aufbau();
    for (const seit of ['3', '2', 'abc', '0', '1.5']) {
      const r = await t.holen(`/api/werkstatt/lehrende?seit=${seit}`, MARKUS);
      expect(r.status, seit).toBe(422);
    }
  });

  it('Kohorte ohne Termine: kein Bezugstag, es zählen alle Commits', async () => {
    const a = await (await (await aufbau()).holen('/api/werkstatt/lehrende?kohorte=test', MARKUS)).json();
    expect(a.tage).toStrictEqual([]);
    expect(a.bezug).toBeNull();
    expect(a.personen[0].artefakte[0]).toMatchObject({ name: 'brief', commits: 1 });
  });
});

describe('GET /api/werkstatt/lehrende – Fehler je Person', () => {
  it('GitHub scheitert beim Lesen einer Mappe: dort fehler, die anderen kommen', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const t = await aufbau({ speicher: (fake) => ({ lesen: async (repo, name) => { if (repo === '2026-sofie') throw new Error('GitHub weg'); return fake.lesen(repo, name); } }) });
    const r = await t.holen('/api/werkstatt/lehrende', MARKUS);
    // Eine kaputte Mappe bricht nie die ganze Antwort ab.
    expect(r.status).toBe(200);
    const a = await r.json();
    expect(a.personen[2]).toStrictEqual({ kuerzel: 'sofie', zustand: 'fehler', grund: 'github' });
    expect(a.personen[1]).toMatchObject({ kuerzel: 'lea', zustand: 'bereit' });
  });

  it('GitHub scheitert beim Verlauf: dort fehler, die anderen kommen', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const t = await aufbau({ speicher: (fake) => ({ verlauf: async (repo, name) => { if (repo === '2026-lea') throw new Error('GitHub weg'); return fake.verlauf(repo, name); } }) });
    const r = await t.holen('/api/werkstatt/lehrende', MARKUS);
    // Eine kaputte Mappe bricht nie die ganze Antwort ab.
    expect(r.status).toBe(200);
    const a = await r.json();
    expect(a.personen[1]).toStrictEqual({ kuerzel: 'lea', zustand: 'fehler', grund: 'github' });
    expect(a.personen[2]).toMatchObject({ kuerzel: 'sofie', zustand: 'bereit' });
  });

  it('Repo gehört laut werkstatt.json jemand anderem: fehler, und aus dem Repo wird nichts gelesen', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const gelesen: string[] = [];
    const t = await aufbau({
      speicher: (fake) => ({
        werkstattJson: async (repo) => (repo === '2026-sofie' ? { kohorte: '2026', githubId: 4242 } : fake.werkstattJson(repo)),
        lesen: async (repo, name) => { gelesen.push(repo); return fake.lesen(repo, name); },
        verlauf: async (repo, name) => { gelesen.push(repo); return fake.verlauf(repo, name); },
      }),
    });
    const r = await t.holen('/api/werkstatt/lehrende', MARKUS);
    // Eine kaputte Mappe bricht nie die ganze Antwort ab.
    expect(r.status).toBe(200);
    const a = await r.json();
    expect(a.personen[2]).toStrictEqual({ kuerzel: 'sofie', zustand: 'fehler', grund: 'zuordnung' });
    expect(gelesen).not.toContain('2026-sofie');
    expect(gelesen).toContain('2026-lea');
  });

  it('werkstatt.json aus einer anderen Kohorte: fehler', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const t = await aufbau({ speicher: (fake) => ({ werkstattJson: async (repo) => (repo === '2026-sofie' ? { kohorte: 'test', githubId: 1001 } : fake.werkstattJson(repo)) }) });
    const r = await t.holen('/api/werkstatt/lehrende', MARKUS);
    // Eine kaputte Mappe bricht nie die ganze Antwort ab.
    expect(r.status).toBe(200);
    const a = await r.json();
    expect(a.personen[2]).toStrictEqual({ kuerzel: 'sofie', zustand: 'fehler', grund: 'zuordnung' });
  });

  it('kaputtes JSON oder falsches Format: nur dieses Artefakt unlesbar, ohne Markdown', async () => {
    const t = await aufbau({ speicher: (fake) => ({ lesen: async (repo, name) => { if (name === 'brief') throw new DateiUnlesbar('mappe/brief.json'); return fake.lesen(repo, name); } }) });
    const alt = await t.fake.lesen('2026-sofie', 'interviews');
    await t.fake.speichern('2026-sofie', 'interviews', { 'mappe/interviews.json': JSON.stringify({ interviews: 'kaputt' }) }, alt.basisSha, AUTOR, 'x');
    const r = await t.holen('/api/werkstatt/lehrende', MARKUS);
    // Eine kaputte Mappe bricht nie die ganze Antwort ab.
    expect(r.status).toBe(200);
    const a = await r.json();
    const [brief, , annahmen, , interviews] = SOFIE_(a).artefakte;
    expect(brief).toStrictEqual({ name: 'brief', stand: 'unlesbar', umfang: null, fehlt: [], leer: false, faelligZuTag: 2, faellig: true, commits: 1, mehr: false, zuletzt: '2026-10-21T22:30:00.000Z', feedback: OHNE_FEEDBACK });
    expect(interviews).toMatchObject({ name: 'interviews', stand: 'unlesbar', umfang: null, commits: 2 });
    expect(annahmen).toMatchObject({ stand: 'vorhanden' });
  });
});

describe('GET /api/werkstatt/lehrende/artefakt – Inhalt für den Leser', () => {
  const pfad = (person: string, artefakt: string, kohorte = '2026') => `/api/werkstatt/lehrende/artefakt?kohorte=${kohorte}&person=${person}&artefakt=${artefakt}`;

  it('Lehrende bekommen die mit dem Editor-Schema geprüften Daten – pseudonymisiert wie bei der Person', async () => {
    const t = await aufbau();
    const r = await t.holen(pfad('sofie', 'interviews'), MARKUS);
    expect(r.status).toBe(200);
    expect(r.headers.get('cache-control')).toBe('no-store');
    const a = await r.json();
    expect(a).toStrictEqual({ name: 'interviews', stand: 'vorhanden', daten: parsen('interviews', interviewsBeispiel), roh: null, feedback: [] });
    expect(a.daten.interviews[0].pseudonym).toBe(interviewsBeispiel.interviews[0].pseudonym);
    expect(await (await t.holen(pfad('sofie', 'leitfaden'), MARKUS)).json()).toStrictEqual({ name: 'leitfaden', stand: 'offen', daten: null, roh: null, feedback: [] });
  });

  it('Studierende 403 (auch für die eigene Mappe), Lehrende einer anderen Kohorte 403, ohne Anmeldung 401', async () => {
    const t = await aufbau();
    expect((await t.holen(pfad('sofie', 'brief'), SOFIE)).status).toBe(403);
    expect((await t.holen(pfad('sofie', 'brief'), ANDERE)).status).toBe(403);
    expect((await t.holen(pfad('sofie', 'brief'))).status).toBe(401);
  });

  it('Person nicht in der Kohorte, unbekanntes Artefakt, noch keine Mappe → 404', async () => {
    const t = await aufbau();
    expect((await t.holen(pfad('tom', 'brief'), MARKUS)).status).toBe(404);
    expect((await t.holen(pfad('sofie', 'quatsch'), MARKUS)).status).toBe(404);
    expect((await t.holen(pfad('jonas', 'brief'), MARKUS)).status).toBe(404);
  });

  it('Repo gehört laut werkstatt.json jemand anderem: 409, und gelesen wird nichts', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const gelesen: string[] = [];
    const t = await aufbau({
      speicher: (fake) => ({
        werkstattJson: async (repo) => (repo === '2026-sofie' ? { kohorte: '2026', githubId: 4242 } : fake.werkstattJson(repo)),
        lesen: async (repo, name) => { gelesen.push(repo); return fake.lesen(repo, name); },
      }),
    });
    const r = await t.holen(pfad('sofie', 'brief'), MARKUS);
    expect(r.status).toBe(409);
    expect(gelesen).toStrictEqual([]);
  });

  it('falsches Format: unlesbar, ohne Daten, mit dem JSON als Rückfall; kaputtes JSON ohne roh', async () => {
    const t = await aufbau({ speicher: (fake) => ({ lesen: async (repo, name) => { if (name === 'brief') throw new DateiUnlesbar('mappe/brief.json'); return fake.lesen(repo, name); } }) });
    const alt = await t.fake.lesen('2026-sofie', 'interviews');
    await t.fake.speichern('2026-sofie', 'interviews', { 'mappe/interviews.json': JSON.stringify({ interviews: 'kaputt' }) }, alt.basisSha, AUTOR, 'x');
    const iv = await (await t.holen(pfad('sofie', 'interviews'), MARKUS)).json();
    expect(iv).toStrictEqual({ name: 'interviews', stand: 'unlesbar', daten: null, roh: JSON.stringify({ interviews: 'kaputt' }, null, 2), feedback: [] });
    expect(await (await t.holen(pfad('sofie', 'brief'), MARKUS)).json()).toStrictEqual({ name: 'brief', stand: 'unlesbar', daten: null, roh: null, feedback: [] });
  });

  it('GitHub scheitert: 502', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const t = await aufbau({ speicher: () => ({ lesen: async () => { throw new Error('GitHub weg'); } }) });
    expect((await t.holen(pfad('sofie', 'brief'), MARKUS)).status).toBe(502);
  });

  it('die Matrix trägt keinen Inhalt mehr (der Leser holt ihn einzeln)', async () => {
    const a = await (await (await aufbau()).holen('/api/werkstatt/lehrende', MARKUS)).json();
    for (const x of SOFIE_(a).artefakte) {
      expect(x).not.toHaveProperty('daten');
      expect(x).not.toHaveProperty('markdown');
    }
  });
});

describe('Demo-Mappe der Lehrenden (NDU-37) bleibt aus den Ansichten der Kohorte', () => {
  it('nach Anlegen und Speichern: weder in der Matrix noch in den Zahlen noch im Leser', async () => {
    const t = await aufbau();
    const json = { Origin: BASIS, 'Content-Type': 'application/json' };
    expect((await t.holen('/api/werkstatt/mappe', MARKUS)).status).toBe(200);
    const put = await t.holen('/api/werkstatt/mappe/brief', MARKUS, { method: 'PUT', headers: json, body: JSON.stringify({ daten: briefBeispiel, basisSha: null }) });
    expect(put.status).toBe(200);
    expect(await t.fake.lesen('2026-demo-1000', 'brief')).toMatchObject({ daten: { problem: briefBeispiel.problem } });

    const a = await (await t.holen('/api/werkstatt/lehrende', MARKUS)).json();
    expect(a.personen.map((p: { kuerzel: string }) => p.kuerzel)).toStrictEqual(['jonas', 'lea', 'sofie']);
    const z = await (await t.holen('/api/werkstatt/zahlen', MARKUS)).json();
    expect(z.personen.map((p: { kuerzel: string }) => p.kuerzel).sort()).toStrictEqual(['jonas', 'lea', 'sofie']);
    for (const person of ['demo-1000', 'demo']) {
      const r = await t.holen(`/api/werkstatt/lehrende/artefakt?kohorte=2026&person=${person}&artefakt=brief`, MARKUS);
      expect(r.status, person).toBe(404);
    }
  });
});
