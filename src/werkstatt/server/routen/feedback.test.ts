// Feedback (NDU-35): Lehrende schreiben über /api/werkstatt/lehrende/feedback, Studierende lesen, antworten und setzen
// „erledigt“ über /api/werkstatt/mappe/feedback. Hier die Trennung der Rechte gegen den Fake-Speicher; den Wettlauf
// zweier Schreibender gegen GitHub prüft speicher.test.ts.
import { afterEach, describe, expect, it, vi } from 'vitest';
import annahmenBeispiel from '../../beispiele/annahmen.json';
import { FEEDBACK_PFAD } from '../../feedback';
import { appErstellen } from '../app';
import { fakeSpeicher } from '../fake-speicher';
import { lokaleAbhaengigkeiten, lokaleUmgebung } from '../lokal';
import { COOKIE_WERKSTATT, sitzungErstellen, type Sitzung } from '../sitzung';
import type { Speicher } from '../typen';

const BASIS = 'http://localhost:4321';
const ZUGANG = {
  '2026': { lehrende: [1000], studierende: [{ githubId: 1001, kuerzel: 'sofie' }, { githubId: 1002, kuerzel: 'jonas' }] },
  test: { lehrende: [2000], studierende: [{ githubId: 2001, kuerzel: 'tom' }] },
};
const MARKUS = { githubId: 1000, login: 'markus', kohorte: '2026', rolle: 'lehrende' } as const;
// Lehrt nur in der Kohorte test.
const ANDERE = { githubId: 2000, login: 'andere', kohorte: 'test', rolle: 'lehrende' } as const;
const SOFIE = { githubId: 1001, login: 'sofie-x', kohorte: '2026', rolle: 'studierende' } as const;
const JONAS = { githubId: 1002, login: 'jonas-x', kohorte: '2026', rolle: 'studierende' } as const;
const JETZT = Date.parse('2026-10-23T09:00:00Z');
const ARTEFAKT_JSON = `${JSON.stringify(annahmenBeispiel, null, 2)}\n`;

afterEach(() => vi.restoreAllMocks());

async function aufbau(opts: { speicher?: (fake: Speicher) => Partial<Speicher> } = {}) {
  const umgebung = { ...lokaleUmgebung(), zugang: ZUGANG };
  const fake = fakeSpeicher({ jetzt: () => JETZT });
  await fake.anlegen({ kohorte: '2026', rolle: 'studierende', kuerzel: 'sofie' }, 1001);
  await fake.anlegen({ kohorte: '2026', rolle: 'studierende', kuerzel: 'jonas' }, 1002);
  await fake.speichern('2026-sofie', 'annahmen', { 'mappe/annahmen.json': ARTEFAKT_JSON }, null, { name: 'sofie-x', email: 'x@example.invalid' }, 'Annahmen');
  const speicher: Speicher = { ...fake, ...(opts.speicher?.(fake) ?? {}) };
  const app = appErstellen(lokaleAbhaengigkeiten({ umgebung, speicher, jetzt: () => JETZT }));
  async function anfrage(methode: string, pfad: string, s?: Omit<Sitzung, 'exp'>, body?: unknown, extra: Record<string, string> = { Origin: BASIS }) {
    const headers: Record<string, string> = { ...extra };
    if (s) headers.Cookie = `${COOKIE_WERKSTATT}=${await sitzungErstellen({ ...s, exp: Math.floor(JETZT / 1000) + 3600 }, umgebung.sessionSecret)}`;
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    return app.request(`${BASIS}${pfad}`, { method: methode, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  }
  const schreiben = (s: Omit<Sitzung, 'exp'>, body: unknown, person = 'sofie', kohorte = '2026') =>
    anfrage('POST', `/api/werkstatt/lehrende/feedback?kohorte=${kohorte}&person=${person}`, s, body);
  const aendern = (s: Omit<Sitzung, 'exp'>, body: unknown) => anfrage('POST', '/api/werkstatt/mappe/feedback', s, body);
  const lesen = async (s: Omit<Sitzung, 'exp'> = SOFIE) => (await (await anfrage('GET', '/api/werkstatt/mappe/feedback', s)).json()).eintraege;
  const datei = (repo = '2026-sofie') => fake.feedbackLesen(repo);
  return { fake, anfrage, schreiben, aendern, lesen, datei };
}

const A2 = { artefakt: 'annahmen', zeilenId: 'A2', text: 'Woher stammt die Zahl in A2?' };

describe('Lehrende schreiben Feedback', () => {
  it('Lehrende der Kohorte: ein Commit nur an mappe/feedback.json, mit Autor; das Artefakt bleibt unverändert', async () => {
    const t = await aufbau();
    const r = await t.schreiben(MARKUS, A2);
    expect(r.status).toBe(200);
    const fb1 = { id: 'FB1', artefakt: 'annahmen', zeilenId: 'A2', von: 'lehrende', autor: 'markus', text: 'Woher stammt die Zahl in A2?', datum: new Date(JETZT).toISOString() };
    expect(await r.json()).toStrictEqual({ eintraege: [fb1] });
    const c = t.fake.commits('2026-sofie').at(-1)!;
    expect(Object.keys(c.dateien)).toStrictEqual([FEEDBACK_PFAD]);
    expect(c.autor).toStrictEqual({ name: 'markus', email: '1000+markus@users.noreply.github.com' });
    expect(c.nachricht).toBe('Feedback von markus: Annahmen-Map (A2)');
    expect((await t.fake.lesen('2026-sofie', 'annahmen')).daten).toStrictEqual(annahmenBeispiel);
    expect(await t.datei()).toStrictEqual({ schema: 'feedback@1', eintraege: [fb1] });
  });

  it('zum ganzen Artefakt (ohne Zeile): kein zeilenId-Schlüssel', async () => {
    const t = await aufbau();
    const r = await t.schreiben(MARKUS, { artefakt: 'brief', text: 'Klarer Rahmen.' });
    expect((await r.json()).eintraege[0]).toStrictEqual({ id: 'FB1', artefakt: 'brief', von: 'lehrende', autor: 'markus', text: 'Klarer Rahmen.', datum: new Date(JETZT).toISOString() });
  });

  it('Lehrende einer anderen Kohorte → 403, nichts geschrieben', async () => {
    const t = await aufbau();
    const vorher = t.fake.commits('2026-sofie').length;
    const r = await t.schreiben(ANDERE, A2);
    expect(r.status).toBe(403);
    expect((await r.json()).code).toBe('nicht-freigeschaltet');
    expect(t.fake.commits('2026-sofie')).toHaveLength(vorher);
    expect(await t.datei()).toBeNull();
  });

  it('Studierende können kein Feedback der Lehrenden schreiben – weder für sich noch für andere', async () => {
    const t = await aufbau();
    for (const person of ['sofie', 'jonas']) {
      expect((await t.schreiben(SOFIE, A2, person)).status, person).toBe(403);
    }
    expect(await t.datei()).toBeNull();
    expect(await t.datei('2026-jonas')).toBeNull();
  });

  it('Repo gehört laut werkstatt.json jemand anderem → 409, nichts geschrieben', async () => {
    const t = await aufbau({ speicher: (fake) => ({ werkstattJson: async (repo) => (repo === '2026-sofie' ? { kohorte: '2026', githubId: 4242 } : fake.werkstattJson(repo)) }) });
    const vorher = t.fake.commits('2026-sofie').length;
    const r = await t.schreiben(MARKUS, A2);
    expect(r.status).toBe(409);
    expect(t.fake.commits('2026-sofie')).toHaveLength(vorher);
    expect(await t.datei()).toBeNull();
  });

  it('unbekannte Person oder Artefakt → 404; Person ohne Mappe → 404; falsche Zeile oder leerer Text → 422', async () => {
    const t = await aufbau();
    expect((await t.schreiben(MARKUS, A2, 'niemand')).status).toBe(404);
    expect((await t.schreiben(MARKUS, { ...A2, artefakt: 'tagebuch' })).status).toBe(404);
    // Kohorte test: tom steht in der Zugangsliste, hat aber noch kein Repo.
    expect((await t.schreiben({ ...MARKUS, githubId: 2000, login: 'andere', kohorte: 'test' }, A2, 'tom', 'test')).status).toBe(404);
    const zeile = await t.schreiben(MARKUS, { ...A2, zeilenId: 'D2' });
    expect(zeile.status).toBe(422);
    expect((await zeile.json()).fehler).toBe('Diese Zeile gibt es in Annahmen-Map so nicht.');
    expect((await t.schreiben(MARKUS, { ...A2, text: '   ' })).status).toBe(422);
    expect(await t.datei()).toBeNull();
  });

  it('ohne Origin → 403 csrf', async () => {
    const t = await aufbau();
    const r = await t.anfrage('POST', '/api/werkstatt/lehrende/feedback?kohorte=2026&person=sofie', MARKUS, A2, {});
    expect(r.status).toBe(403);
    expect((await r.json()).code).toBe('csrf');
  });

  it('Lehrende setzen weder „erledigt“ noch antworten (die Route der Studierenden lehnt sie ab)', async () => {
    const t = await aufbau();
    await t.schreiben(MARKUS, A2);
    expect((await t.aendern(MARKUS, { aktion: 'erledigt', id: 'FB1', erledigt: true })).status).toBe(403);
    expect((await t.aendern(MARKUS, { aktion: 'antworten', antwortAuf: 'FB1', text: 'x' })).status).toBe(403);
    expect((await t.anfrage('GET', '/api/werkstatt/mappe/feedback', MARKUS)).status).toBe(403);
  });
});

describe('Lehrenden-Ansicht: Feedback in Matrix und Leser', () => {
  it('Zelle zählt offen, erledigt, neu und Antworten; der Leser liefert nur das Feedback dieses Artefakts', async () => {
    const t = await aufbau();
    await t.schreiben(MARKUS, A2);
    await t.schreiben(MARKUS, { artefakt: 'annahmen', text: 'Gesamt gut.' });
    await t.schreiben(MARKUS, { artefakt: 'brief', text: 'Brief fehlt noch.' });
    await t.aendern(SOFIE, { aktion: 'antworten', antwortAuf: 'FB1', text: 'Aus der Kassa.' });
    await t.aendern(SOFIE, { aktion: 'erledigt', id: 'FB2', erledigt: true });
    await t.aendern(SOFIE, { aktion: 'gesehen', artefakt: 'annahmen' });
    const a = await (await t.anfrage('GET', '/api/werkstatt/lehrende', MARKUS)).json();
    const sofie = a.personen.find((p: { kuerzel: string }) => p.kuerzel === 'sofie');
    const zahl = (n: string) => sofie.artefakte.find((x: { name: string }) => x.name === n).feedback;
    expect(zahl('annahmen')).toStrictEqual({ offen: 1, erledigt: 1, neu: 0, antworten: 1 });
    expect(zahl('brief')).toStrictEqual({ offen: 1, erledigt: 0, neu: 1, antworten: 0 });
    expect(zahl('leitfaden')).toStrictEqual({ offen: 0, erledigt: 0, neu: 0, antworten: 0 });
    const leser = await (await t.anfrage('GET', '/api/werkstatt/lehrende/artefakt?kohorte=2026&person=sofie&artefakt=annahmen', MARKUS)).json();
    expect(leser.feedback.map((e: { id: string }) => e.id)).toStrictEqual(['FB1', 'FB2', 'FB4']);
  });

  it('kaputtes feedback.json: Zahlen null, die Mappe kommt trotzdem; Schreiben wird abgelehnt, nichts überschrieben', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const t = await aufbau({ speicher: (fake) => ({ feedbackLesen: async (repo) => (repo === '2026-sofie' ? { schema: 'feedback@9' } : fake.feedbackLesen(repo)) }) });
    const a = await (await t.anfrage('GET', '/api/werkstatt/lehrende', MARKUS)).json();
    const sofie = a.personen.find((p: { kuerzel: string }) => p.kuerzel === 'sofie');
    expect(sofie.zustand).toBe('bereit');
    expect(sofie.artefakte.every((x: { feedback: unknown }) => x.feedback === null)).toBe(true);
    const leser = await (await t.anfrage('GET', '/api/werkstatt/lehrende/artefakt?kohorte=2026&person=sofie&artefakt=annahmen', MARKUS)).json();
    expect(leser.feedback).toBeNull();
    expect(leser.stand).toBe('vorhanden');
    expect(log).toHaveBeenCalled();
  });

  it('Datei im Repo passt nicht zum Schema: Schreiben → 502, die Datei bleibt, wie sie ist', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const t = await aufbau();
    await t.fake.feedbackAendern('2026-sofie', () => '{"schema":"feedback@1","eintraege":"kaputt"}\n', { name: 'x', email: 'x' }, 'von Hand');
    const r = await t.schreiben(MARKUS, A2);
    expect(r.status).toBe(502);
    expect(await t.datei()).toStrictEqual({ schema: 'feedback@1', eintraege: 'kaputt' });
  });
});

describe('Studierende: lesen, antworten, erledigt, gesehen', () => {
  it('liest nur die eigene Mappe', async () => {
    const t = await aufbau();
    await t.schreiben(MARKUS, A2);
    expect((await t.lesen(SOFIE)).map((e: { id: string }) => e.id)).toStrictEqual(['FB1']);
    expect(await t.lesen(JONAS)).toStrictEqual([]);
  });

  it('Antwort: von studierende, Autor = Kürzel, Commit mit dem eigenen Login; Feedback der Lehrenden bleibt Wort für Wort', async () => {
    const t = await aufbau();
    await t.schreiben(MARKUS, A2);
    const vorher = structuredClone((await t.lesen())[0]);
    const r = await t.aendern(SOFIE, { aktion: 'antworten', antwortAuf: 'FB1', text: 'Aus den Kassendaten.', von: 'lehrende', autor: 'markus', id: 'FB1' });
    expect(r.status).toBe(200);
    const [fb1, fb2] = (await r.json()).eintraege;
    expect(fb1).toStrictEqual(vorher);
    expect(fb2).toStrictEqual({ id: 'FB2', artefakt: 'annahmen', zeilenId: 'A2', von: 'studierende', autor: 'sofie', text: 'Aus den Kassendaten.', datum: new Date(JETZT).toISOString(), antwortAuf: 'FB1' });
    expect(t.fake.commits('2026-sofie').at(-1)!.autor).toStrictEqual({ name: 'sofie-x', email: '1001+sofie-x@users.noreply.github.com' });
  });

  it('kein Weg, Feedback der Lehrenden anzulegen oder zu ändern: unbekannte Aktion → 422, Text bleibt', async () => {
    const t = await aufbau();
    await t.schreiben(MARKUS, A2);
    const vorher = await t.datei();
    for (const body of [
      { aktion: 'schreiben', artefakt: 'annahmen', text: 'Selbst gelobt.' },
      { aktion: 'aendern', id: 'FB1', text: 'Alles super.' },
      { aktion: 'loeschen', id: 'FB1' },
      { eintraege: [] },
    ]) {
      const r = await t.aendern(SOFIE, body);
      expect(r.status, JSON.stringify(body)).toBe(422);
    }
    expect(await t.datei()).toStrictEqual(vorher);
  });

  it('erledigt nur an Feedback der Lehrenden; wieder öffnen geht; an der eigenen Antwort → 422', async () => {
    const t = await aufbau();
    await t.schreiben(MARKUS, A2);
    await t.aendern(SOFIE, { aktion: 'antworten', antwortAuf: 'FB1', text: 'ok' });
    const erledigt = await (await t.aendern(SOFIE, { aktion: 'erledigt', id: 'FB1', erledigt: true })).json();
    expect(erledigt.eintraege[0].erledigt).toBe(true);
    const wieder = await (await t.aendern(SOFIE, { aktion: 'erledigt', id: 'FB1', erledigt: false })).json();
    expect(wieder.eintraege[0]).not.toHaveProperty('erledigt');
    expect((await t.aendern(SOFIE, { aktion: 'erledigt', id: 'FB2', erledigt: true })).status).toBe(422);
    expect((await t.aendern(SOFIE, { aktion: 'antworten', antwortAuf: 'FB2', text: 'x' })).status).toBe(422);
  });

  it('nicht für andere: Jonas erreicht Feedback in Sofies Mappe nicht', async () => {
    const t = await aufbau();
    await t.schreiben(MARKUS, A2);
    const vorher = await t.datei();
    expect((await t.aendern(JONAS, { aktion: 'erledigt', id: 'FB1', erledigt: true })).status).toBe(422);
    expect((await t.aendern(JONAS, { aktion: 'antworten', antwortAuf: 'FB1', text: 'Ich war’s.' })).status).toBe(422);
    expect(await t.datei()).toStrictEqual(vorher);
    expect(await t.datei('2026-jonas')).toBeNull();
  });

  it('gesehen: einmal ein Commit, danach keiner mehr', async () => {
    const t = await aufbau();
    await t.schreiben(MARKUS, A2);
    const n = t.fake.commits('2026-sofie').length;
    const r = await (await t.aendern(SOFIE, { aktion: 'gesehen', artefakt: 'annahmen' })).json();
    expect(r.eintraege[0].gesehen).toBe(true);
    expect(t.fake.commits('2026-sofie')).toHaveLength(n + 1);
    await t.aendern(SOFIE, { aktion: 'gesehen', artefakt: 'annahmen' });
    await t.aendern(SOFIE, { aktion: 'erledigt', id: 'FB1', erledigt: false });
    expect(t.fake.commits('2026-sofie')).toHaveLength(n + 1);
    expect((await t.aendern(SOFIE, { aktion: 'gesehen', artefakt: 'tagebuch' })).status).toBe(422);
  });

  it('ohne Origin → 403 csrf, nichts geschrieben', async () => {
    const t = await aufbau();
    await t.schreiben(MARKUS, A2);
    const vorher = await t.datei();
    const r = await t.anfrage('POST', '/api/werkstatt/mappe/feedback', SOFIE, { aktion: 'erledigt', id: 'FB1', erledigt: true }, {});
    expect(r.status).toBe(403);
    expect(await t.datei()).toStrictEqual(vorher);
  });

  it('Mappe gehört laut werkstatt.json jemand anderem → 403, nichts gelesen oder geschrieben', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const t = await aufbau({ speicher: (fake) => ({ werkstattJson: async (repo) => (repo === '2026-sofie' ? { kohorte: '2026', githubId: 4242 } : fake.werkstattJson(repo)) }) });
    await t.fake.feedbackAendern('2026-sofie', () => '{"schema":"feedback@1","eintraege":[]}\n', { name: 'x', email: 'x' }, 'x');
    expect((await t.anfrage('GET', '/api/werkstatt/mappe/feedback', SOFIE)).status).toBe(403);
    expect((await t.aendern(SOFIE, { aktion: 'gesehen', artefakt: 'annahmen' })).status).toBe(403);
  });

  it('Lehrende und Studierende gleichzeitig: kein Eintrag geht verloren', async () => {
    const t = await aufbau();
    await t.schreiben(MARKUS, A2);
    const r = await Promise.all([
      t.schreiben(MARKUS, { artefakt: 'annahmen', zeilenId: 'A1', text: 'Und A1?' }),
      t.aendern(SOFIE, { aktion: 'antworten', antwortAuf: 'FB1', text: 'Kassa.' }),
      t.aendern(SOFIE, { aktion: 'erledigt', id: 'FB1', erledigt: true }),
      t.schreiben(MARKUS, { artefakt: 'brief', text: 'Brief?' }),
    ]);
    expect(r.map((x) => x.status)).toStrictEqual([200, 200, 200, 200]);
    const alle = (await t.datei()) as { eintraege: { id: string; text: string; erledigt?: true }[] };
    expect(alle.eintraege.map((e) => e.text).sort()).toStrictEqual(['Brief?', 'Kassa.', 'Und A1?', 'Woher stammt die Zahl in A2?']);
    expect(new Set(alle.eintraege.map((e) => e.id)).size).toBe(4);
    expect(alle.eintraege.find((e) => e.id === 'FB1')!.erledigt).toBe(true);
  });
});
