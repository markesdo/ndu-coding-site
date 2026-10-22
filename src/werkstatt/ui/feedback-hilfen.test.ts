import { describe, expect, it, vi } from 'vitest';
import annahmenBeispiel from '../beispiele/annahmen.json';
import entscheidungenBeispiel from '../beispiele/entscheidungen.json';
import interviewsBeispiel from '../beispiele/interviews.json';
import leitfadenBeispiel from '../beispiele/leitfaden.json';
import { antworten, erledigtSetzen, feedbackLeer, feedbackSchreiben, gesehenSetzen, zeilenAuswahl, type Feedback, type FeedbackEintrag } from '../feedback';
import { bezugText, einzeln, feedbackDatum, feedbackLader, geordnet, laufendeAenderungen, lehrendeFeedbackPfad, mappeFeedback, neueIds, reihenfolge, zellenFeedback } from './feedback-hilfen';
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

// Von außen gesteuertes Versprechen: die Tests bestimmen, welche Antwort wann ankommt.
function gesteuert<T>() {
  let erfuellen!: (x: T) => void;
  let ablehnen!: (e: unknown) => void;
  const p = new Promise<T>((a, b) => { erfuellen = a; ablehnen = b; });
  return { p, erfuellen, ablehnen };
}
const takt = () => new Promise((r) => setTimeout(r, 0));
const stand = (text: string): FeedbackEintrag[] => [{ id: 'FB1', artefakt: 'annahmen', von: 'lehrende', autor: 'markus', text, datum: D }];

describe('Reihenfolge der Antworten (Editor und „Meine Mappe“)', () => {
  it('reihenfolge: eine ältere Antwort nach einer neueren fällt weg; scheitert die neuere, gilt die ältere', () => {
    const r = reihenfolge();
    const a = r.start();
    const b = r.start();
    expect(r.uebernehmen(b)).toBe(true);
    expect(r.uebernehmen(a)).toBe(false);
    const c = r.start();
    r.start(); // scheitert, kommt nie an
    expect(r.uebernehmen(c)).toBe(true);
  });

  it('Editor: späte Antwort auf „gesehen“ überschreibt kein späteres „erledigt“', async () => {
    const gesetzt: string[] = [];
    const anwenden = geordnet((e) => gesetzt.push(e[0].text), laufendeAenderungen());
    const gesehen = gesteuert<{ eintraege: FeedbackEintrag[] }>();
    const erledigt = gesteuert<{ eintraege: FeedbackEintrag[] }>();
    const g = anwenden(gesehen.p);
    const e = anwenden(erledigt.p);
    erledigt.erfuellen({ eintraege: stand('erledigt') });
    await e;
    gesehen.erfuellen({ eintraege: stand('gesehen, ohne erledigt') });
    await g;
    expect(gesetzt).toStrictEqual(['erledigt']);
  });

  it('laufendeAenderungen: ruhig() wartet auf alles, auch was währenddessen dazukommt; Scheitern zählt wie fertig', async () => {
    const l = laufendeAenderungen();
    const a = gesteuert<void>();
    const b = gesteuert<void>();
    l.merken(a.p);
    let fertig = false;
    void l.ruhig().then(() => { fertig = true; });
    l.merken(b.p).catch(() => {});
    a.erfuellen();
    await takt();
    expect(fertig).toBe(false);
    b.ablehnen(new Error('weg'));
    await takt();
    expect(fertig).toBe(true);
  });

  it('„Meine Mappe“ lädt nach dem Schließen erst, wenn „gesehen“ angekommen ist', async () => {
    const l = laufendeAenderungen();
    const gesehen = gesteuert<{ eintraege: FeedbackEintrag[] }>();
    // Der Editor hat „gesehen“ geschickt, die Antwort steht noch aus.
    const anwenden = geordnet(() => {}, l);
    const g = anwenden(gesehen.p);
    let server = 'neu';
    const holen = vi.fn(async () => stand(server));
    const gesetzt: string[] = [];
    const laden = feedbackLader(holen, (e) => gesetzt.push(e[0].text), l);
    const fertig = laden();
    await takt();
    expect(holen).not.toHaveBeenCalled();
    server = 'gesehen';
    gesehen.erfuellen({ eintraege: stand('gesehen') });
    await g;
    await fertig;
    expect(holen).toHaveBeenCalledTimes(1);
    expect(gesetzt).toStrictEqual(['gesehen']);
  });

  it('„Meine Mappe“: zwei Ladevorgänge, der ältere kommt zuletzt an und fällt weg; Fehler bleiben still', async () => {
    const antworten_ = [gesteuert<FeedbackEintrag[]>(), gesteuert<FeedbackEintrag[]>(), gesteuert<FeedbackEintrag[]>()];
    let i = 0;
    const gesetzt: string[] = [];
    const laden = feedbackLader(() => antworten_[i++].p, (e) => gesetzt.push(e[0].text), laufendeAenderungen());
    const alt = laden();
    const neu = laden();
    await takt();
    antworten_[1].erfuellen(stand('neu'));
    await neu;
    antworten_[0].erfuellen(stand('alt'));
    await alt;
    expect(gesetzt).toStrictEqual(['neu']);
    const kaputt = laden();
    await takt();
    antworten_[2].ablehnen(new Error('Netz weg'));
    await expect(kaputt).resolves.toBeUndefined();
    expect(gesetzt).toStrictEqual(['neu']);
  });

  it('einzeln: solange die eigene Anfrage läuft, tut ein zweiter Klick nichts; danach wieder frei', async () => {
    const gemeldet: boolean[] = [];
    const klick = einzeln((x) => gemeldet.push(x));
    const a = gesteuert<void>();
    const f = vi.fn(() => a.p);
    const erster = klick(f);
    const zweiter = klick(f);
    // Noch vor jeder Antwort: der zweite Klick hat nichts ausgelöst.
    expect(f).toHaveBeenCalledTimes(1);
    expect(gemeldet).toStrictEqual([true]);
    a.erfuellen();
    await Promise.all([erster, zweiter]);
    expect(gemeldet).toStrictEqual([true, false]);
    await klick(async () => {});
    expect(f).toHaveBeenCalledTimes(1);
    expect(gemeldet).toStrictEqual([true, false, true, false]);
  });
});
