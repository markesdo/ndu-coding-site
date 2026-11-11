// NDU-42: mögliche Fassung über die Routen. Lehrende der Kohorte hinterlegen sie an erlaubten Zeilen; die Person sieht
// sie erst, wenn sie die Zeile selbst geändert oder geantwortet hat – vorher steht der Text in keiner Antwort, auch nicht
// in der Datei im Repo (die sie lesen kann) und nicht in der Commit-Nachricht. Studierende setzen weder Fassung noch Stand.
import { afterEach, describe, expect, it, vi } from 'vitest';
import annahmenBeispiel from '../../beispiele/annahmen.json';
import briefBeispiel from '../../beispiele/brief.json';
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
const ANDERE = { githubId: 2000, login: 'andere', kohorte: 'test', rolle: 'lehrende' } as const;
const SOFIE = { githubId: 1001, login: 'sofie-x', kohorte: '2026', rolle: 'studierende' } as const;
const JETZT = Date.parse('2026-11-11T09:00:00Z');
const SPAETER = Date.parse('2026-11-12T08:00:00Z');
const FASSUNG = 'Wir glauben, dass die Bar morgens [Zahl aus deinen Interviews] Bestellungen in 30 Minuten schafft.';
const json = (x: unknown) => `${JSON.stringify(x, null, 2)}\n`;

afterEach(() => vi.restoreAllMocks());

async function aufbau(opts: { speicher?: (fake: Speicher) => Partial<Speicher> } = {}) {
  const uhr = { ms: JETZT };
  const umgebung = { ...lokaleUmgebung(), zugang: ZUGANG };
  const fake = fakeSpeicher({ jetzt: () => uhr.ms });
  await fake.anlegen({ kohorte: '2026', rolle: 'studierende', kuerzel: 'sofie' }, 1001);
  await fake.anlegen({ kohorte: '2026', rolle: 'studierende', kuerzel: 'jonas' }, 1002);
  await fake.speichern('2026-sofie', 'annahmen', { 'mappe/annahmen.json': json(annahmenBeispiel) }, null, { name: 'sofie-x', email: 'x@example.invalid' }, 'Annahmen');
  const speicher: Speicher = { ...fake, ...(opts.speicher?.(fake) ?? {}) };
  const app = appErstellen(lokaleAbhaengigkeiten({ umgebung, speicher, jetzt: () => uhr.ms }));
  async function anfrage(methode: string, pfad: string, s: Omit<Sitzung, 'exp'>, body?: unknown) {
    const headers: Record<string, string> = { Origin: BASIS };
    headers.Cookie = `${COOKIE_WERKSTATT}=${await sitzungErstellen({ ...s, exp: Math.floor(uhr.ms / 1000) + 3600 }, umgebung.sessionSecret)}`;
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    return app.request(`${BASIS}${pfad}`, { method: methode, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  }
  const schreiben = (s: Omit<Sitzung, 'exp'>, body: unknown, person = 'sofie', kohorte = '2026') =>
    anfrage('POST', `/api/werkstatt/lehrende/feedback?kohorte=${kohorte}&person=${person}`, s, body);
  const aendern = (body: unknown) => anfrage('POST', '/api/werkstatt/mappe/feedback', SOFIE, body);
  // Rohtext der Antwort: So fällt jede Stelle auf, an der der Text der Fassung stünde.
  const lesenRoh = async () => {
    const r = await anfrage('GET', '/api/werkstatt/mappe/feedback', SOFIE);
    expect(r.status).toBe(200);
    return r.text();
  };
  const lesen = async () => JSON.parse(await lesenRoh()).eintraege;
  const leser = async (artefakt = 'annahmen') => (await anfrage('GET', `/api/werkstatt/lehrende/artefakt?kohorte=2026&person=sofie&artefakt=${artefakt}`, MARKUS)).json();
  // Die Person ändert ihre Annahme über den Editor (dieselbe Route wie im Browser).
  async function annahmeAendern(id: string, text: string) {
    const alt = await fake.lesen('2026-sofie', 'annahmen');
    const daten = { ...annahmenBeispiel, annahmen: annahmenBeispiel.annahmen.map((a) => (a.id === id ? { ...a, text } : a)) };
    const r = await anfrage('PUT', '/api/werkstatt/mappe/annahmen', SOFIE, { daten, basisSha: alt.basisSha });
    expect(r.status).toBe(200);
  }
  return { fake, uhr, anfrage, schreiben, aendern, lesen, lesenRoh, leser, annahmeAendern, datei: () => fake.feedbackLesen('2026-sofie') };
}

const MIT_FASSUNG = { artefakt: 'annahmen', zeilenId: 'A2', text: 'Woher stammt die 40?', fassung: FASSUNG };

describe('Lehrende hinterlegen eine mögliche Fassung', () => {
  it('Datei und Commit tragen nur Siegel und Zeilenstand, nie den Text; Lehrende sehen Text und „zu“', async () => {
    const t = await aufbau();
    const r = await t.schreiben(MARKUS, MIT_FASSUNG);
    expect(r.status).toBe(200);
    const fb1 = (await r.json()).eintraege[0];
    expect(fb1).toStrictEqual({ id: 'FB1', artefakt: 'annahmen', zeilenId: 'A2', von: 'lehrende', autor: 'markus', text: 'Woher stammt die 40?', datum: new Date(JETZT).toISOString(), fassung: { zu: true, text: FASSUNG } });
    const datei = (await t.datei()) as { eintraege: Record<string, unknown>[] };
    expect(datei.eintraege[0].fassung).toMatch(/^f1\.lokal\.[A-Za-z0-9_-]+$/);
    expect(datei.eintraege[0].zeilenStand).toMatch(/^sha256:[0-9a-f]{64}$/);
    const c = t.fake.commits('2026-sofie').at(-1)!;
    expect(c.nachricht).toBe('Feedback von markus: Annahmen-Map (A2) mit möglicher Fassung');
    for (const inhalt of [...Object.values(c.dateien), c.nachricht]) {
      expect(inhalt).not.toContain('Zahl aus deinen Interviews');
      expect(inhalt).not.toContain('Bestellungen in 30 Minuten schafft');
    }
    expect((await t.leser()).feedback[0].fassung).toStrictEqual({ zu: true, text: FASSUNG });
  });

  it('Brief Outcome und Problem, Leitfaden-Frage: erlaubt (Brief auch, wenn er noch nicht gespeichert ist)', async () => {
    const t = await aufbau();
    expect((await t.schreiben(MARKUS, { artefakt: 'brief', zeilenId: 'problem', text: 'Wessen Problem?', fassung: '[Wer] verliert morgens [wie viel Zeit] beim Warten auf Kaffee.' })).status).toBe(200);
    await t.fake.speichern('2026-sofie', 'brief', { 'mappe/brief.json': json(briefBeispiel) }, null, { name: 's', email: 's@example.invalid' }, 'Brief');
    // Eine offene je Artefakt: erst erledigt, dann die nächste.
    await t.aendern({ aktion: 'antworten', antwortAuf: 'FB1', text: 'Meins.' });
    expect((await t.aendern({ aktion: 'erledigt', id: 'FB1', erledigt: true })).status).toBe(200);
    expect((await t.schreiben(MARKUS, { artefakt: 'brief', zeilenId: 'outcome', text: 'Was ändert sich?', fassung: 'Wir merken es, wenn [Verhalten] …' })).status).toBe(200);
  });

  it('verbotene Stellen → 422 mit Satz, nichts geschrieben: Entscheidung, Interview, Zitat, Brief-Abschnitt, ganzes Artefakt', async () => {
    const t = await aufbau();
    await t.fake.speichern('2026-sofie', 'entscheidungen', { 'mappe/entscheidungen.json': json((await import('../../beispiele/entscheidungen.json')).default) }, null, { name: 's', email: 's@example.invalid' }, 'E');
    await t.fake.speichern('2026-sofie', 'interviews', { 'mappe/interviews.json': json((await import('../../beispiele/interviews.json')).default) }, null, { name: 's', email: 's@example.invalid' }, 'I');
    const vorher = t.fake.commits('2026-sofie').length;
    for (const [artefakt, zeilenId] of [['entscheidungen', 'D1'], ['interviews', 'I1'], ['interviews', 'I1-1'], ['brief', 'fuerWen'], ['brief', undefined], ['annahmen', undefined]] as const) {
      const r = await t.schreiben(MARKUS, { artefakt, ...(zeilenId ? { zeilenId } : {}), text: 'Frage?', fassung: FASSUNG });
      expect(r.status, `${artefakt} ${zeilenId}`).toBe(422);
      expect((await r.json()).fehler).toBe('Eine mögliche Fassung geht nur an Outcome oder Problem im Brief, an einer Annahme oder an einer Leitfaden-Frage.');
    }
    expect(t.fake.commits('2026-sofie')).toHaveLength(vorher);
    expect(await t.datei()).toBeNull();
  });

  it('länger als 300 Zeichen → 422; höchstens eine offene je Artefakt → 422, nach „erledigt“ geht die nächste', async () => {
    const t = await aufbau();
    const lang = await t.schreiben(MARKUS, { ...MIT_FASSUNG, fassung: 'x'.repeat(301) });
    expect(lang.status).toBe(422);
    expect((await lang.json()).fehler).toBe('Mögliche Fassung: höchstens 300 Zeichen.');
    expect((await t.schreiben(MARKUS, MIT_FASSUNG)).status).toBe(200);
    const zweite = await t.schreiben(MARKUS, { ...MIT_FASSUNG, zeilenId: 'A3' });
    expect(zweite.status).toBe(422);
    expect((await zweite.json()).fehler).toBe('Zu Annahmen-Map gibt es schon eine offene mögliche Fassung (FB1). Eine neue geht erst, wenn sie erledigt ist.');
    expect((await t.datei() as { eintraege: unknown[] }).eintraege).toHaveLength(1);
    await t.aendern({ aktion: 'antworten', antwortAuf: 'FB1', text: 'Geschätzt.' });
    expect((await t.aendern({ aktion: 'erledigt', id: 'FB1', erledigt: true })).status).toBe(200);
    expect((await t.schreiben(MARKUS, { ...MIT_FASSUNG, zeilenId: 'A3' })).status).toBe(200);
  });

  it('Lehrende einer anderen Kohorte → 403; Studierende → 403; nichts geschrieben', async () => {
    const t = await aufbau();
    expect((await t.schreiben(ANDERE, MIT_FASSUNG)).status).toBe(403);
    expect((await t.schreiben(SOFIE, MIT_FASSUNG)).status).toBe(403);
    expect(await t.datei()).toBeNull();
  });
});

describe('Die Person sieht die Fassung erst nach eigener Überarbeitung', () => {
  it('Zeile unverändert → zu, der Text steht in keiner Antwort; andere Zeile geändert → weiter zu', async () => {
    const t = await aufbau();
    await t.schreiben(MARKUS, MIT_FASSUNG);
    const roh = await t.lesenRoh();
    expect(roh).not.toContain('Zahl aus deinen Interviews');
    expect(roh).not.toContain('f1.lokal.');
    expect(roh).not.toContain('sha256:');
    expect(JSON.parse(roh).eintraege[0].fassung).toStrictEqual({ zu: true });
    // Auch die Antworten der Änderungs-Route (gesehen, erledigt) tragen ihn nicht.
    const gesehen = await (await t.aendern({ aktion: 'gesehen', artefakt: 'annahmen' })).text();
    expect(gesehen).not.toContain('Zahl aus deinen Interviews');
    expect(JSON.parse(gesehen).eintraege[0].fassung).toStrictEqual({ zu: true });
    await t.annahmeAendern('A3', 'Wir glauben, dass Pendler*innen in 10 Sekunden bestellen.');
    expect((await t.lesen())[0].fassung).toStrictEqual({ zu: true });
    expect((await t.leser()).feedback[0].fassung.zu).toBe(true);
    // Kein Commit für freiSeit, solange sie zu ist.
    expect(t.fake.commits('2026-sofie').map((c) => c.nachricht).filter((n) => n.includes('mögliche Fassung zu'))).toStrictEqual([]);
  });

  it('Zeile geändert → frei schon beim Speichern (freiSeit im Commit nach dem Speichern), Lesen ohne weiteren Commit', async () => {
    const t = await aufbau();
    await t.schreiben(MARKUS, MIT_FASSUNG);
    await t.annahmeAendern('A2', 'Wir glauben, dass die Bar morgens 25 Bestellungen in 30 Minuten schafft.');
    const seit = new Date(JETZT).toISOString();
    const vermerkt = t.fake.commits('2026-sofie').filter((c) => c.nachricht === 'Feedback: mögliche Fassung zu FB1 frei');
    expect(vermerkt).toHaveLength(1);
    expect(vermerkt[0].autor.name).toBe('sofie-x');
    expect(JSON.stringify(vermerkt[0].dateien)).not.toContain('Zahl aus deinen Interviews');
    t.uhr.ms = SPAETER;
    // Lehrende sehen es gleich, ohne dass die Person ihr Feedback geöffnet hat.
    expect((await t.leser()).feedback[0].fassung).toStrictEqual({ zu: false, text: FASSUNG, freiSeit: seit });
    const vorher = t.fake.commits('2026-sofie').length;
    expect((await t.lesen())[0].fassung).toStrictEqual({ zu: false, text: FASSUNG, freiSeit: seit });
    expect(t.fake.commits('2026-sofie')).toHaveLength(vorher);
    // Zurückgeändert bleibt sie frei; ein zweites Speichern vermerkt nichts mehr.
    await t.annahmeAendern('A2', annahmenBeispiel.annahmen[1].text);
    expect((await t.lesen())[0].fassung).toStrictEqual({ zu: false, text: FASSUNG, freiSeit: seit });
    expect(t.fake.commits('2026-sofie').filter((c) => c.nachricht.includes('mögliche Fassung zu'))).toHaveLength(1);
  });

  it('Speichern einer anderen Zeile vermerkt nichts', async () => {
    const t = await aufbau();
    await t.schreiben(MARKUS, MIT_FASSUNG);
    await t.annahmeAendern('A3', 'Wir glauben, dass Pendler*innen in 10 Sekunden bestellen.');
    expect(t.fake.commits('2026-sofie').filter((c) => c.nachricht.includes('mögliche Fassung zu'))).toHaveLength(0);
    expect((await t.datei() as { eintraege: Record<string, unknown>[] }).eintraege[0]).not.toHaveProperty('freiSeit');
  });

  it('Rückfall: scheitert der Vermerk beim Speichern, holt das Lesen ihn nach (ein Commit), Speichern bleibt geglückt', async () => {
    let scheitern = true;
    const t = await aufbau({ speicher: (fake) => ({ feedbackAendern: (repo, aendern, autor, nachricht) => (scheitern && nachricht.includes('mögliche Fassung zu') ? Promise.reject(new Error('GitHub weg')) : fake.feedbackAendern(repo, aendern, autor, nachricht)) }) });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await t.schreiben(MARKUS, MIT_FASSUNG);
    await t.annahmeAendern('A2', 'Wir glauben, dass die Bar morgens 25 Bestellungen in 30 Minuten schafft.');
    expect((await t.datei() as { eintraege: Record<string, unknown>[] }).eintraege[0]).not.toHaveProperty('freiSeit');
    scheitern = false;
    t.uhr.ms = SPAETER;
    const seit = new Date(SPAETER).toISOString();
    expect((await t.lesen())[0].fassung).toStrictEqual({ zu: false, text: FASSUNG, freiSeit: seit });
    expect(t.fake.commits('2026-sofie').filter((c) => c.nachricht === 'Feedback: mögliche Fassung zu FB1 frei')).toHaveLength(1);
    expect((await t.datei() as { eintraege: Record<string, unknown>[] }).eintraege[0].freiSeit).toBe(seit);
  });

  it('Antwort → offen in derselben Antwort, freiSeit im Commit der Antwort', async () => {
    const t = await aufbau();
    await t.schreiben(MARKUS, MIT_FASSUNG);
    t.uhr.ms = SPAETER;
    const r = await t.aendern({ aktion: 'antworten', antwortAuf: 'FB1', text: 'Die 40 ist geschätzt.' });
    expect(r.status).toBe(200);
    const eintraege = (await r.json()).eintraege;
    expect(eintraege[0].fassung).toStrictEqual({ zu: false, text: FASSUNG, freiSeit: new Date(SPAETER).toISOString() });
    expect(t.fake.commits('2026-sofie').filter((c) => c.nachricht.includes('mögliche Fassung zu'))).toHaveLength(0);
  });

  it('Lesen liest das Artefakt nur, solange eine Fassung weder frei vermerkt noch beantwortet ist', async () => {
    const gelesen: string[] = [];
    const t = await aufbau({ speicher: (fake) => ({ lesen: (repo, name) => { gelesen.push(name); return fake.lesen(repo, name); } }) });
    await t.schreiben(MARKUS, MIT_FASSUNG);
    gelesen.length = 0;
    await t.lesen();
    expect(gelesen).toStrictEqual(['annahmen']);
    // Antwort ohne freiSeit (etwa eine Datei von vorher): offen durch die Antwort, kein Lesen nötig.
    await t.fake.feedbackAendern('2026-sofie', (roh) => {
      const f = roh as { schema: string; eintraege: Record<string, unknown>[] };
      return JSON.stringify({ ...f, eintraege: [...f.eintraege, { id: 'FB2', artefakt: 'annahmen', zeilenId: 'A2', von: 'studierende', autor: 'sofie', text: 'ok', datum: new Date(JETZT).toISOString(), antwortAuf: 'FB1' }] });
    }, { name: 'x', email: 'x@example.invalid' }, 'Antwort von außen');
    gelesen.length = 0;
    expect((await t.lesen())[0].fassung.zu).toBe(false);
    expect(gelesen).toStrictEqual([]);
  });

  it('Artefakt gerade nicht lesbar → bleibt zu (lieber zu als zu früh), Feedback kommt trotzdem', async () => {
    const t = await aufbau({ speicher: (fake) => ({ lesen: async (repo, name) => (name === 'annahmen' && repo === '2026-sofie' && geschrieben ? Promise.reject(new Error('GitHub weg')) : fake.lesen(repo, name)) }) });
    let geschrieben = false;
    await t.schreiben(MARKUS, MIT_FASSUNG);
    geschrieben = true;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const roh = await t.lesenRoh();
    expect(roh).not.toContain('Zahl aus deinen Interviews');
    expect(JSON.parse(roh).eintraege[0].fassung).toStrictEqual({ zu: true });
  });

  it('Studierende können Fassung, Zeilenstand oder freiSeit nicht setzen: zusätzliche Felder werden nie gelesen', async () => {
    const t = await aufbau();
    await t.schreiben(MARKUS, MIT_FASSUNG);
    const vorher = structuredClone(await t.datei()) as { eintraege: Record<string, unknown>[] };
    const fremd = { fassung: 'Meine eigene Fassung', zeilenStand: `sha256:${'0'.repeat(64)}`, freiSeit: new Date(JETZT).toISOString() };
    for (const body of [
      { aktion: 'gesehen', artefakt: 'annahmen', ...fremd },
      { aktion: 'erledigt', id: 'FB1', erledigt: false, ...fremd },
    ]) {
      expect((await t.aendern(body)).status).toBe(200);
    }
    const nachher = (await t.datei()) as { eintraege: Record<string, unknown>[] };
    expect(nachher.eintraege[0].fassung).toBe(vorher.eintraege[0].fassung);
    expect(nachher.eintraege[0].zeilenStand).toBe(vorher.eintraege[0].zeilenStand);
    expect(nachher.eintraege[0]).not.toHaveProperty('freiSeit');
    // Die Antwort selbst bekommt keine Fassung (nur die Antwort-Felder).
    await t.aendern({ aktion: 'antworten', antwortAuf: 'FB1', text: 'ok', ...fremd });
    const antwort = ((await t.datei()) as { eintraege: Record<string, unknown>[] }).eintraege[1];
    expect(Object.keys(antwort).sort()).toStrictEqual(['antwortAuf', 'artefakt', 'autor', 'datum', 'id', 'text', 'von', 'zeilenId']);
    // Studierende schreiben nie über die Route der Lehrenden.
    expect((await t.schreiben(SOFIE, { ...MIT_FASSUNG, zeilenId: 'A3' })).status).toBe(403);
  });
});

describe('Befunde aus dem Review (#317)', () => {
  it('„erledigt“ geht nicht, solange die Fassung zu ist (422); nach Überarbeiten oder Antwort schon', async () => {
    const t = await aufbau();
    await t.schreiben(MARKUS, MIT_FASSUNG);
    const r = await t.aendern({ aktion: 'erledigt', id: 'FB1', erledigt: true });
    expect(r.status).toBe(422);
    expect((await r.json()).fehler).toBe('Überarbeite zuerst die Zeile oder antworte.');
    expect(((await t.datei()) as { eintraege: Record<string, unknown>[] }).eintraege[0]).not.toHaveProperty('erledigt');
    await t.annahmeAendern('A2', 'Wir glauben, dass die Bar morgens 25 Bestellungen schafft.');
    expect((await t.aendern({ aktion: 'erledigt', id: 'FB1', erledigt: true })).status).toBe(200);
    // Mit Antwort statt Überarbeitung geht es auch; Feedback ohne Fassung nie gesperrt.
    await t.schreiben(MARKUS, { ...MIT_FASSUNG, artefakt: 'brief', zeilenId: 'problem' });
    expect((await t.aendern({ aktion: 'erledigt', id: 'FB2', erledigt: true })).status).toBe(422);
    await t.aendern({ aktion: 'antworten', antwortAuf: 'FB2', text: 'Ich würde die Gruppe enger fassen.' });
    expect((await t.aendern({ aktion: 'erledigt', id: 'FB2', erledigt: true })).status).toBe(200);
    await t.schreiben(MARKUS, { artefakt: 'annahmen', text: 'Allgemein.' });
    expect((await t.aendern({ aktion: 'erledigt', id: 'FB4', erledigt: true })).status).toBe(200);
  });

  it('Wieder öffnen (erledigt → offen) geht nicht, wenn zu diesem Artefakt schon eine andere Fassung offen ist', async () => {
    const t = await aufbau();
    await t.schreiben(MARKUS, MIT_FASSUNG);
    await t.annahmeAendern('A2', 'Wir glauben, dass die Bar morgens 25 Bestellungen schafft.');
    expect((await t.aendern({ aktion: 'erledigt', id: 'FB1', erledigt: true })).status).toBe(200);
    expect((await t.schreiben(MARKUS, { ...MIT_FASSUNG, zeilenId: 'A3' })).status).toBe(200);
    const r = await t.aendern({ aktion: 'erledigt', id: 'FB1', erledigt: false });
    expect(r.status).toBe(422);
    expect((await r.json()).fehler).toBe('FB1 lässt sich gerade nicht wieder öffnen: Zu Annahmen-Map ist schon eine andere mögliche Fassung offen (FB2). Setz zuerst FB2 auf erledigt.');
    expect(((await t.datei()) as { eintraege: { id: string; erledigt?: true }[] }).eintraege.find((e) => e.id === 'FB1')!.erledigt).toBe(true);
    // Feedback ohne Fassung lässt sich weiter wieder öffnen.
    await t.schreiben(MARKUS, { artefakt: 'annahmen', zeilenId: 'A4', text: 'Und hier?' });
    expect((await t.aendern({ aktion: 'erledigt', id: 'FB3', erledigt: true })).status).toBe(200);
    expect((await t.aendern({ aktion: 'erledigt', id: 'FB3', erledigt: false })).status).toBe(200);
  });

  it('300 Zeichen aus Mehrbyte-Graphemen (Flaggen, Familien-Emoji): 422 mit Satz, nie 500', async () => {
    const t = await aufbau();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    for (const zeichen of ['\u{1F1E6}\u{1F1F9}', '\u{1F468}‍\u{1F469}‍\u{1F467}‍\u{1F466}']) {
      const r = await t.schreiben(MARKUS, { ...MIT_FASSUNG, fassung: zeichen.repeat(300) });
      expect(r.status, zeichen).toBe(422);
      expect((await r.json()).fehler).toBe('Mögliche Fassung: zu lang (höchstens 300 Zeichen; manche Zeichen wie Emoji zählen mehrfach).');
    }
    // Knapp darunter geht es und lässt sich lesen.
    const ok = await t.schreiben(MARKUS, { ...MIT_FASSUNG, fassung: '\u{1F1E6}\u{1F1F9}'.repeat(140) });
    expect(ok.status).toBe(200);
    expect((await ok.json()).eintraege[0].fassung.text).toBe('\u{1F1E6}\u{1F1F9}'.repeat(140));
  });

  it('Artefakt passt nicht zum Format der Werkstatt: Fassung → 422 mit Satz, nicht 502', async () => {
    const t = await aufbau();
    await t.fake.speichern('2026-sofie', 'brief', { 'mappe/brief.json': json({ schema: 'brief@1', kaputt: true }) }, null, { name: 's', email: 's@example.invalid' }, 'Brief');
    for (const [artefakt, zeilenId] of [['brief', 'problem'], ['annahmen', 'A2']] as const) {
      if (artefakt === 'annahmen') await t.fake.speichern('2026-sofie', 'annahmen', { 'mappe/annahmen.json': json({ schema: 'annahmen@1', annahmen: 'kaputt' }) }, (await t.fake.lesen('2026-sofie', 'annahmen')).basisSha, { name: 's', email: 's@example.invalid' }, 'A');
      const r = await t.schreiben(MARKUS, { artefakt, zeilenId, text: 'Frage?', fassung: FASSUNG });
      expect(r.status, artefakt).toBe(422);
      expect((await r.json()).fehler).toBe('Das Artefakt passt gerade nicht zum Format der Werkstatt (vielleicht direkt auf GitHub geändert). Eine mögliche Fassung geht erst wieder, wenn es lesbar ist.');
    }
    expect(await t.datei()).toBeNull();
  });
});
