import { describe, expect, it } from 'vitest';
import {
  ANTWORT_MAX, FEEDBACK_MAX, FeedbackAbgelehnt, antworten, erledigtSetzen, faeden, feedbackJson, feedbackLeer, feedbackParsen, feedbackSchreiben,
  feedbackZaehlen, gesehenSetzen, zeilePasst, zeilenName, type Feedback,
} from './feedback';

const D1 = '2026-10-22T10:00:00.000Z';
const D2 = '2026-10-23T09:30:00.000Z';
const lehrende = (f: Feedback, artefakt: 'annahmen' | 'brief' | 'interviews' = 'annahmen', zeilenId?: string, text = 'Woher stammt die Zahl?') =>
  feedbackSchreiben(f, { artefakt, zeilenId, text, autor: 'markus', datum: D1 });

describe('feedback@1: Schema', () => {
  it('fehlende Datei ist leer; leere Datei und volle Datei sind gültig', () => {
    expect(feedbackParsen(null)).toStrictEqual({ ok: true, daten: { schema: 'feedback@1', eintraege: [] } });
    const f = antworten(lehrende(feedbackLeer(), 'annahmen', 'A2'), { antwortAuf: 'FB1', text: 'Aus der Kassa.', autor: 'sofie', datum: D2 });
    const p = feedbackParsen(JSON.parse(feedbackJson(f)));
    expect(p).toStrictEqual({ ok: true, daten: f });
    expect(feedbackJson(f).endsWith('}\n')).toBe(true);
  });

  it('Eintrag der Lehrenden: ohne zeilenId fehlt der Schlüssel ganz (nicht undefined)', () => {
    const f = lehrende(feedbackLeer(), 'brief');
    expect(f.eintraege[0]).toStrictEqual({ id: 'FB1', artefakt: 'brief', von: 'lehrende', autor: 'markus', text: 'Woher stammt die Zahl?', datum: D1 });
  });

  it.each([
    ['falsches Schema', { schema: 'feedback@2', eintraege: [] }],
    ['unbekanntes Feld oben', { schema: 'feedback@1', eintraege: [], note: 1 }],
    ['unbekanntes Feld im Eintrag (z. B. eine Note)', { schema: 'feedback@1', eintraege: [{ id: 'FB1', artefakt: 'brief', von: 'lehrende', autor: 'm', text: 't', datum: D1, note: 2 }] }],
    ['Zeile passt nicht zum Artefakt', { schema: 'feedback@1', eintraege: [{ id: 'FB1', artefakt: 'annahmen', zeilenId: 'D3', von: 'lehrende', autor: 'm', text: 't', datum: D1 }] }],
    ['doppelte ID', { schema: 'feedback@1', eintraege: [1, 2].map(() => ({ id: 'FB1', artefakt: 'brief', von: 'lehrende', autor: 'm', text: 't', datum: D1 })) }],
    ['Antwort ohne antwortAuf', { schema: 'feedback@1', eintraege: [{ id: 'FB1', artefakt: 'brief', von: 'studierende', autor: 's', text: 't', datum: D1 }] }],
    ['Antwort auf eine Antwort', { schema: 'feedback@1', eintraege: [
      { id: 'FB1', artefakt: 'brief', von: 'lehrende', autor: 'm', text: 't', datum: D1 },
      { id: 'FB2', artefakt: 'brief', von: 'studierende', autor: 's', text: 't', datum: D1, antwortAuf: 'FB1' },
      { id: 'FB3', artefakt: 'brief', von: 'studierende', autor: 's', text: 't', datum: D1, antwortAuf: 'FB2' },
    ] }],
    ['erledigt an einer Antwort', { schema: 'feedback@1', eintraege: [
      { id: 'FB1', artefakt: 'brief', von: 'lehrende', autor: 'm', text: 't', datum: D1 },
      { id: 'FB2', artefakt: 'brief', von: 'studierende', autor: 's', text: 't', datum: D1, antwortAuf: 'FB1', erledigt: true },
    ] }],
    ['Lehrende antworten auf etwas', { schema: 'feedback@1', eintraege: [{ id: 'FB1', artefakt: 'brief', von: 'lehrende', autor: 'm', text: 't', datum: D1, antwortAuf: 'FB1' }] }],
    ['kein ISO-Zeitpunkt', { schema: 'feedback@1', eintraege: [{ id: 'FB1', artefakt: 'brief', von: 'lehrende', autor: 'm', text: 't', datum: '22.10.2026' }] }],
    ['leerer Text', { schema: 'feedback@1', eintraege: [{ id: 'FB1', artefakt: 'brief', von: 'lehrende', autor: 'm', text: '  ', datum: D1 }] }],
  ])('ungültig: %s', (_, roh) => {
    expect(feedbackParsen(roh).ok).toBe(false);
  });

  it('Zeilen-IDs je Artefakt; der Brief hat Abschnitte statt IDs', () => {
    expect(['A2', 'A12'].every((z) => zeilePasst('annahmen', z))).toBe(true);
    expect(zeilePasst('annahmen', 'D2')).toBe(false);
    expect(zeilePasst('interviews', 'I2-4') && zeilePasst('interviews', 'I2')).toBe(true);
    expect(zeilePasst('leitfaden', 'F1') && zeilePasst('entscheidungen', 'D3')).toBe(true);
    expect(zeilePasst('brief', 'problem')).toBe(true);
    expect(zeilePasst('brief', 'A1') || zeilePasst('brief', 'toString') || zeilePasst('brief', '__proto__')).toBe(false);
    expect(zeilenName('brief', 'problem')).toBe('Welches Problem?');
    expect(zeilenName('annahmen', 'A2')).toBe('A2');
  });
});

describe('Änderungen', () => {
  it('feedbackSchreiben: fortlaufende IDs, Text getrimmt, \\r\\n wie \\n; falsche Zeile oder Text abgelehnt', () => {
    const f = lehrende(lehrende(feedbackLeer(), 'annahmen', 'A2'), 'annahmen', undefined, '  Zweitens\r\nund so  ');
    expect(f.eintraege.map((e) => e.id)).toStrictEqual(['FB1', 'FB2']);
    expect(f.eintraege[1].text).toBe('Zweitens\nund so');
    expect(() => lehrende(f, 'annahmen', 'D1')).toThrow(FeedbackAbgelehnt);
    expect(() => lehrende(f, 'annahmen', undefined, '   ')).toThrow(FeedbackAbgelehnt);
    expect(() => lehrende(f, 'annahmen', undefined, 'x'.repeat(FEEDBACK_MAX + 1))).toThrow(/höchstens 1500/);
    expect(() => lehrende(f, 'annahmen', undefined, 'gedreht \u202E')).toThrow(/Steuerzeichen/);
    // Leere Zeile ('' oder null aus dem Formular) heißt: zum ganzen Artefakt.
    expect(feedbackSchreiben(feedbackLeer(), { artefakt: 'brief', zeilenId: '', text: 't', autor: 'm', datum: D1 }).eintraege[0]).not.toHaveProperty('zeilenId');
  });

  it('IDs nach Lücken: die größte + 1, nie eine ID doppelt', () => {
    const f: Feedback = { schema: 'feedback@1', eintraege: [{ id: 'FB7', artefakt: 'brief', von: 'lehrende', autor: 'm', text: 't', datum: D1 }] };
    expect(lehrende(f).eintraege.at(-1)!.id).toBe('FB8');
  });

  it('antworten: nur auf Feedback der Lehrenden, erbt Artefakt und Zeile; kurz', () => {
    const f = antworten(lehrende(feedbackLeer(), 'interviews', 'I2-4'), { antwortAuf: 'FB1', text: 'Mach ich.', autor: 'sofie', datum: D2 });
    expect(f.eintraege[1]).toStrictEqual({ id: 'FB2', artefakt: 'interviews', zeilenId: 'I2-4', von: 'studierende', autor: 'sofie', text: 'Mach ich.', datum: D2, antwortAuf: 'FB1' });
    expect(() => antworten(f, { antwortAuf: 'FB2', text: 'x', autor: 'sofie', datum: D2 })).toThrow(FeedbackAbgelehnt);
    expect(() => antworten(f, { antwortAuf: 'FB9', text: 'x', autor: 'sofie', datum: D2 })).toThrow(FeedbackAbgelehnt);
    expect(() => antworten(f, { antwortAuf: 'FB1', text: 'x'.repeat(ANTWORT_MAX + 1), autor: 'sofie', datum: D2 })).toThrow(FeedbackAbgelehnt);
    expect(feedbackParsen(f).ok).toBe(true);
  });

  it('erledigtSetzen ändert nur erledigt; wieder offen entfernt den Schlüssel; unverändert = dieselbe Datei', () => {
    const f = lehrende(feedbackLeer(), 'annahmen', 'A2');
    const erledigt = erledigtSetzen(f, 'FB1', true);
    const { erledigt: _e, ...ohne } = erledigt.eintraege[0];
    expect(ohne).toStrictEqual(f.eintraege[0]);
    expect(erledigt.eintraege[0].erledigt).toBe(true);
    expect(erledigtSetzen(erledigt, 'FB1', true)).toBe(erledigt);
    expect(erledigtSetzen(erledigt, 'FB1', false).eintraege[0]).toStrictEqual(f.eintraege[0]);
    expect(() => erledigtSetzen(f, 'FB1', 'ja')).toThrow(FeedbackAbgelehnt);
    const mitAntwort = antworten(f, { antwortAuf: 'FB1', text: 'x', autor: 's', datum: D2 });
    expect(() => erledigtSetzen(mitAntwort, 'FB2', true)).toThrow(FeedbackAbgelehnt);
  });

  it('gesehenSetzen: nur Feedback der Lehrenden dieses Artefakts; nichts Neues = dieselbe Datei', () => {
    const f = lehrende(lehrende(feedbackLeer(), 'annahmen'), 'brief');
    const g = gesehenSetzen(f, 'annahmen');
    expect(g.eintraege.map((e) => e.gesehen)).toStrictEqual([true, undefined]);
    expect(gesehenSetzen(g, 'annahmen')).toBe(g);
    expect(gesehenSetzen(f, 'leitfaden')).toBe(f);
  });
});

describe('Lesen und Zählen', () => {
  it('faeden und feedbackZaehlen: offen, erledigt, neu, Antworten je Artefakt', () => {
    let f = lehrende(lehrende(lehrende(feedbackLeer(), 'annahmen', 'A2'), 'annahmen'), 'brief');
    f = antworten(f, { antwortAuf: 'FB1', text: 'a', autor: 's', datum: D2 });
    f = erledigtSetzen(gesehenSetzen(f, 'annahmen'), 'FB2', true);
    expect(feedbackZaehlen(f.eintraege, 'annahmen')).toStrictEqual({ offen: 1, erledigt: 1, neu: 0, antworten: 1 });
    expect(feedbackZaehlen(f.eintraege, 'brief')).toStrictEqual({ offen: 1, erledigt: 0, neu: 1, antworten: 0 });
    expect(feedbackZaehlen(f.eintraege, 'leitfaden')).toStrictEqual({ offen: 0, erledigt: 0, neu: 0, antworten: 0 });
    const fa = faeden(f.eintraege, 'annahmen');
    expect(fa.map((x) => [x.feedback.id, x.antworten.map((a) => a.id)])).toStrictEqual([['FB1', ['FB4']], ['FB2', []]]);
  });
});

// NDU-41: optionales Kriterium aus dem Katalog an Feedback der Lehrenden, weiter feedback@1.
describe('Kriterium am Feedback', () => {
  const mit = (f: Feedback, artefakt: 'annahmen' | 'brief' | 'leitfaden', zeilenId: string | undefined, kriterium: unknown) =>
    feedbackSchreiben(f, { artefakt, zeilenId, kriterium, text: 'Schau dir das Paar an.', autor: 'markus', datum: D1 });

  it('alte feedback@1-Datei (NDU-35, ohne Kriterium) bleibt gültig und unverändert', () => {
    // Wortwörtlich wie eine Datei, die die Werkstatt vor NDU-41 geschrieben hat.
    const alt = JSON.parse(`{
  "schema": "feedback@1",
  "eintraege": [
    { "id": "FB1", "artefakt": "annahmen", "zeilenId": "A2", "von": "lehrende", "autor": "markus", "text": "Woher stammt die Zahl?", "datum": "${D1}", "gesehen": true, "erledigt": true },
    { "id": "FB2", "artefakt": "annahmen", "zeilenId": "A2", "von": "studierende", "autor": "sofie", "text": "Aus der Kassa.", "datum": "${D2}", "antwortAuf": "FB1" },
    { "id": "FB3", "artefakt": "brief", "von": "lehrende", "autor": "markus", "text": "Klarer Rahmen.", "datum": "${D2}" }
  ]
}`);
    const p = feedbackParsen(alt);
    expect(p).toStrictEqual({ ok: true, daten: alt });
    // Weiterschreiben auf der alten Datei: bleibt feedback@1, alte Einträge Wort für Wort.
    const neu = mit((p as { daten: Feedback }).daten, 'brief', 'outcome', 'output-statt-outcome');
    expect(neu.schema).toBe('feedback@1');
    expect(neu.eintraege.slice(0, 3)).toStrictEqual(alt.eintraege);
    expect(feedbackParsen(JSON.parse(feedbackJson(neu)))).toStrictEqual({ ok: true, daten: neu });
  });

  it('feedbackSchreiben speichert die ID des Kriteriums; ohne Kriterium fehlt der Schlüssel ganz', () => {
    const f = mit(feedbackLeer(), 'brief', 'outcome', 'output-statt-outcome');
    expect(f.eintraege[0]).toStrictEqual({ id: 'FB1', artefakt: 'brief', zeilenId: 'outcome', kriterium: 'output-statt-outcome', von: 'lehrende', autor: 'markus', text: 'Schau dir das Paar an.', datum: D1 });
    for (const leer of [undefined, null, '']) expect(mit(feedbackLeer(), 'brief', 'outcome', leer).eintraege[0]).not.toHaveProperty('kriterium');
  });

  it('Kriterium muss es geben und zu Artefakt und Brief-Abschnitt passen', () => {
    // Zum ganzen Brief passt jedes Brief-Kriterium, zu einem Abschnitt nur seine.
    expect(mit(feedbackLeer(), 'brief', undefined, 'zwei-zielgruppen').eintraege[0].kriterium).toBe('zwei-zielgruppen');
    expect(mit(feedbackLeer(), 'annahmen', 'A3', 'art-der-annahme').eintraege[0].kriterium).toBe('art-der-annahme');
    expect(() => mit(feedbackLeer(), 'brief', 'problem', 'output-statt-outcome')).toThrow('„Output statt Outcome“ passt nicht zu „Welches Problem?“.');
    expect(() => mit(feedbackLeer(), 'annahmen', 'A2', 'meinungsfrage')).toThrow('„Meinungsfrage statt Geschichte“ passt nicht zu A2.');
    expect(() => mit(feedbackLeer(), 'leitfaden', undefined, 'zwei-zielgruppen')).toThrow('„Zwei Zielgruppen in einer“ passt nicht zu Interviewleitfaden.');
    for (const falsch of ['gibt-es-nicht', 'toString', '__proto__', 42, ['meinungsfrage'], { id: 'meinungsfrage' }]) {
      expect(() => mit(feedbackLeer(), 'leitfaden', undefined, falsch), String(falsch)).toThrow(FeedbackAbgelehnt);
    }
  });

  it('Antworten erben kein Kriterium; im Schema gibt es das Kriterium nur am Feedback der Lehrenden', () => {
    const f = antworten(mit(feedbackLeer(), 'annahmen', 'A3', 'art-der-annahme'), { antwortAuf: 'FB1', text: 'Stimmt.', autor: 'sofie', datum: D2 });
    expect(f.eintraege[1]).not.toHaveProperty('kriterium');
    const antwortMitKriterium = structuredClone(f);
    (antwortMitKriterium.eintraege[1] as { kriterium?: string }).kriterium = 'art-der-annahme';
    expect(feedbackParsen(antwortMitKriterium).ok).toBe(false);
  });

  it('Lesen prüft nur die Form: ein Kriterium, das der Katalog nicht (mehr) kennt, macht die Datei nicht unlesbar', () => {
    const roh = { schema: 'feedback@1', eintraege: [{ id: 'FB1', artefakt: 'brief', kriterium: 'frueher-mal', von: 'lehrende', autor: 'm', text: 't', datum: D1 }] };
    expect(feedbackParsen(roh).ok).toBe(true);
    for (const form of ['Output statt Outcome', 'a b', '', '-a', 'A-b', 42]) {
      expect(feedbackParsen({ ...roh, eintraege: [{ ...roh.eintraege[0], kriterium: form }] }).ok, String(form)).toBe(false);
    }
  });
});
