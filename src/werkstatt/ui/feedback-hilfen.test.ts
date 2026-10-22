import { describe, expect, it } from 'vitest';
import annahmenBeispiel from '../beispiele/annahmen.json';
import entscheidungenBeispiel from '../beispiele/entscheidungen.json';
import interviewsBeispiel from '../beispiele/interviews.json';
import leitfadenBeispiel from '../beispiele/leitfaden.json';
import { antworten, erledigtSetzen, feedbackLeer, feedbackSchreiben, gesehenSetzen, type Feedback } from '../feedback';
import { bezugText, feedbackDatum, lehrendeFeedbackPfad, mappeFeedback, neueIds, zeilenAuswahl, zellenFeedback } from './feedback-hilfen';
import { zelle, zellenLabel } from './lehrenden-hilfen';

const D = '2026-10-22T22:30:00.000Z';
const fb = (f: Feedback, artefakt: 'annahmen' | 'brief', text = 't') => feedbackSchreiben(f, { artefakt, text, autor: 'markus', datum: D });

describe('zeilenAuswahl: jede Zeile mit ID, beim Brief die Abschnitte', () => {
  it('Brief: Abschnitte, auch ohne gespeicherten Brief', () => {
    expect(zeilenAuswahl('brief', null).map((z) => z.wert)).toStrictEqual(['fuerWen', 'problem', 'produktSatz', 'nicht', 'outcome', 'offeneFragen']);
  });
  it('Annahmen, Entscheidungen, Leitfaden: ID und gekürzter Text; ohne Daten leer', () => {
    const a = zeilenAuswahl('annahmen', annahmenBeispiel);
    expect(a.map((z) => z.wert)).toStrictEqual(['A1', 'A2', 'A3', 'A4']);
    expect(a[1].text.startsWith('A2 · Wir glauben, dass die Bar morgens')).toBe(true);
    expect(a[1].text.endsWith(' …')).toBe(true);
    expect(zeilenAuswahl('entscheidungen', entscheidungenBeispiel).map((z) => z.wert)).toStrictEqual(['D1', 'D2', 'D3', 'D4']);
    expect(zeilenAuswahl('leitfaden', leitfadenBeispiel)).toHaveLength(9);
    expect(zeilenAuswahl('annahmen', null)).toStrictEqual([]);
  });
  it('Interviews: Interview (mit Pseudonym) und danach seine Zitate', () => {
    const w = zeilenAuswahl('interviews', interviewsBeispiel).map((z) => z.wert);
    expect(w.slice(0, 6)).toStrictEqual(['I1', 'I1-1', 'I1-2', 'I1-3', 'I1-4', 'I2']);
    expect(zeilenAuswahl('interviews', interviewsBeispiel)[0].text).toBe('I1 · Pendler, Zug 7:38');
  });
});

describe('Texte', () => {
  it('bezugText, feedbackDatum (Tag in Wien), Pfad', () => {
    expect(bezugText({ artefakt: 'annahmen', zeilenId: 'A2' })).toBe('zu A2');
    expect(bezugText({ artefakt: 'brief', zeilenId: 'problem' })).toBe('zu Welches Problem?');
    expect(bezugText({ artefakt: 'brief' })).toBe('zum ganzen Artefakt');
    expect(feedbackDatum(D)).toBe('23.10.2026');
    expect(lehrendeFeedbackPfad('2026', 'k 1')).toBe('/api/werkstatt/lehrende/feedback?kohorte=2026&person=k+1');
  });

  it('zellenFeedback: „1 offen · 1 Antwort“; kein Feedback oder nicht lesbar: null', () => {
    expect(zellenFeedback({ offen: 1, erledigt: 0, neu: 1, antworten: 1 })).toBe('1 offen · 1 Antwort');
    expect(zellenFeedback({ offen: 0, erledigt: 2, neu: 0, antworten: 3 })).toBe('2 erledigt · 3 Antworten');
    expect(zellenFeedback({ offen: 0, erledigt: 0, neu: 0, antworten: 0 })).toBeNull();
    expect(zellenFeedback(null)).toBeNull();
  });

  it('zellenLabel nennt das Feedback mit; ohne bleibt es wie bisher', () => {
    const a = { name: 'brief' as const, stand: 'vorhanden' as const, umfang: '4 von 6 Feldern', fehlt: [], leer: false, faelligZuTag: 2, faellig: true, commits: 0, mehr: false, zuletzt: null, feedback: null };
    expect(zellenLabel('k1', 'brief', zelle(a, null), '1 offen')).toBe('k1, Produkt-Brief: vorhanden, 4 von 6 Feldern, Feedback 1 offen');
    expect(zellenLabel('k1', 'brief', zelle(a, null))).toBe('k1, Produkt-Brief: vorhanden, 4 von 6 Feldern');
  });
});

describe('„neu“ und offen für die Studierenden', () => {
  it('mappeFeedback: neu bis geöffnet, offen bis erledigt; null ohne Feedback', () => {
    let f = fb(fb(feedbackLeer(), 'annahmen'), 'annahmen');
    expect(mappeFeedback(f.eintraege, 'annahmen')).toStrictEqual({ neu: 2, text: 'Feedback: 2 offen' });
    f = gesehenSetzen(f, 'annahmen');
    expect(mappeFeedback(f.eintraege, 'annahmen')).toStrictEqual({ neu: 0, text: 'Feedback: 2 offen' });
    f = erledigtSetzen(erledigtSetzen(f, 'FB1', true), 'FB2', true);
    expect(mappeFeedback(f.eintraege, 'annahmen')).toStrictEqual({ neu: 0, text: 'Feedback: 2 erledigt' });
    expect(mappeFeedback(f.eintraege, 'brief')).toBeNull();
  });

  it('neueIds: nur Feedback der Lehrenden dieses Artefakts, das noch nicht geöffnet ist; Antworten zählen nie', () => {
    let f = fb(fb(fb(feedbackLeer(), 'annahmen'), 'brief'), 'annahmen');
    f = antworten(f, { antwortAuf: 'FB1', text: 'a', autor: 's', datum: D });
    expect([...neueIds(f.eintraege, 'annahmen')]).toStrictEqual(['FB1', 'FB3']);
    expect([...neueIds(gesehenSetzen(f, 'annahmen').eintraege, 'annahmen')]).toStrictEqual([]);
    expect([...neueIds(gesehenSetzen(f, 'annahmen').eintraege, 'brief')]).toStrictEqual(['FB2']);
  });
});
