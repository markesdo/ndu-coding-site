// NDU-42: mögliche Fassung – Schema (abwärtskompatibel), erlaubte Stellen, eine offene je Artefakt, Siegel und die Regel,
// wann sie offen ist. Die Routen (wer was sieht und setzen darf) prüft routen/fassung.test.ts.
import { describe, expect, it } from 'vitest';
import annahmenBeispiel from '../beispiele/annahmen.json';
import briefBeispiel from '../beispiele/brief.json';
import {
  FASSUNG_MAX, FeedbackAbgelehnt, antworten, erledigtSetzen, fassungErlaubt, fassungTextPruefen, fassungZeilenText, feedbackJson, feedbackLeer,
  feedbackParsen, feedbackSchreiben, type Feedback,
} from '../feedback';
import { aufgedecktSetzen, fassungFrei, fassungOeffnen, fassungVersiegeln, zeilenStand } from './fassung';

const D1 = '2026-11-11T10:00:00.000Z';
const D2 = '2026-11-12T09:00:00.000Z';
const KEY = { kid: 'k1', key: new Uint8Array(32).fill(7) };
const ORT = { repo: '2026-sofie', artefakt: 'annahmen' as const, zeilenId: 'A2' };
const STAND = `sha256:${'a'.repeat(64)}`;
const SIEGEL = `f1.k1.${'A'.repeat(60)}`;

const mitFassung = (f: Feedback, artefakt: 'annahmen' | 'brief' | 'leitfaden' | 'interviews' | 'entscheidungen' = 'annahmen', zeilenId: string | undefined = 'A2') =>
  feedbackSchreiben(f, { artefakt, zeilenId, text: 'Woher stammt die 40?', autor: 'markus', datum: D1, fassung: { siegel: SIEGEL, zeilenStand: STAND } });

describe('feedback@1 mit Fassung: Schema', () => {
  it('alte Dateien ohne die neuen Felder bleiben gültig', () => {
    const alt = { schema: 'feedback@1', eintraege: [{ id: 'FB1', artefakt: 'annahmen', zeilenId: 'A2', von: 'lehrende', autor: 'markus', text: 'x', datum: D1 }] };
    expect(feedbackParsen(alt)).toStrictEqual({ ok: true, daten: alt });
  });

  it('Fassung mit Zeilenstand und aufgedecktAm: gültig und unverändert gelesen', () => {
    const f = aufgedecktSetzen(mitFassung(feedbackLeer()), ['FB1'], D2);
    expect(f.eintraege[0]).toStrictEqual({ id: 'FB1', artefakt: 'annahmen', zeilenId: 'A2', von: 'lehrende', autor: 'markus', text: 'Woher stammt die 40?', datum: D1, fassung: SIEGEL, zeilenStand: STAND, aufgedecktAm: D2 });
    expect(feedbackParsen(JSON.parse(feedbackJson(f)))).toStrictEqual({ ok: true, daten: f });
  });

  it('abgelehnt: Fassung an einer Antwort, an einer verbotenen Stelle, ohne Zeilenstand; Zeilenstand ohne Fassung; Klartext statt Siegel', () => {
    const basis = { id: 'FB1', artefakt: 'annahmen', zeilenId: 'A2', von: 'lehrende', autor: 'markus', text: 'x', datum: D1 };
    const faelle: [string, unknown[]][] = [
      ['an Antwort', [basis, { id: 'FB2', artefakt: 'annahmen', zeilenId: 'A2', von: 'studierende', autor: 's', text: 'y', datum: D1, antwortAuf: 'FB1', fassung: SIEGEL, zeilenStand: STAND }]],
      ['Entscheidung', [{ ...basis, artefakt: 'entscheidungen', zeilenId: 'D1', fassung: SIEGEL, zeilenStand: STAND }]],
      ['Zitat', [{ ...basis, artefakt: 'interviews', zeilenId: 'I1-2', fassung: SIEGEL, zeilenStand: STAND }]],
      ['ganzes Artefakt', [{ ...basis, zeilenId: undefined, fassung: SIEGEL, zeilenStand: STAND }]],
      ['Brief „Für wen?“', [{ ...basis, artefakt: 'brief', zeilenId: 'fuerWen', fassung: SIEGEL, zeilenStand: STAND }]],
      ['ohne Zeilenstand', [{ ...basis, fassung: SIEGEL }]],
      ['Zeilenstand allein', [{ ...basis, zeilenStand: STAND }]],
      ['aufgedecktAm allein', [{ ...basis, aufgedecktAm: D2 }]],
      ['Klartext', [{ ...basis, fassung: 'Wir glauben, dass [Zahl] …', zeilenStand: STAND }]],
      ['Zeilenstand falsche Form', [{ ...basis, fassung: SIEGEL, zeilenStand: 'abc' }]],
    ];
    for (const [name, eintraege] of faelle) expect(feedbackParsen({ schema: 'feedback@1', eintraege }).ok, name).toBe(false);
  });
});

describe('Wo eine Fassung stehen darf', () => {
  it('erlaubt: Outcome und Problem im Brief, Annahme, Leitfaden-Frage; sonst nicht', () => {
    for (const [a, z] of [['brief', 'outcome'], ['brief', 'problem'], ['annahmen', 'A2'], ['leitfaden', 'F1']] as const) expect(fassungErlaubt(a, z), `${a} ${z}`).toBe(true);
    for (const [a, z] of [['brief', 'fuerWen'], ['brief', 'nicht'], ['brief', undefined], ['annahmen', undefined], ['entscheidungen', 'D1'], ['interviews', 'I1'], ['interviews', 'I1-2'], ['leitfaden', 'A1']] as const) {
      expect(fassungErlaubt(a, z), `${a} ${z}`).toBe(false);
    }
  });

  it('feedbackSchreiben lehnt verbotene Stellen ab', () => {
    expect(() => mitFassung(feedbackLeer(), 'entscheidungen', 'D1')).toThrow(FeedbackAbgelehnt);
    expect(() => mitFassung(feedbackLeer(), 'interviews', 'I1-2')).toThrow(FeedbackAbgelehnt);
    expect(() => mitFassung(feedbackLeer(), 'annahmen', '')).toThrow(FeedbackAbgelehnt);
    expect(() => mitFassung(feedbackLeer(), 'brief', 'fuerWen')).toThrow(FeedbackAbgelehnt);
  });

  it('höchstens eine offene Fassung je Artefakt; nach „erledigt“ geht eine neue, an einem anderen Artefakt immer', () => {
    const f = mitFassung(feedbackLeer());
    expect(() => mitFassung(f, 'annahmen', 'A3')).toThrow('Zu Annahmen-Map gibt es schon eine offene mögliche Fassung (FB1). Eine neue geht erst, wenn sie erledigt ist.');
    // Feedback ohne Fassung geht weiter.
    expect(feedbackSchreiben(f, { artefakt: 'annahmen', zeilenId: 'A3', text: 'Und hier?', autor: 'markus', datum: D1 }).eintraege).toHaveLength(2);
    expect(mitFassung(f, 'leitfaden', 'F1').eintraege).toHaveLength(2);
    expect(mitFassung(erledigtSetzen(f, 'FB1', true), 'annahmen', 'A3').eintraege.at(-1)!.fassung).toBe(SIEGEL);
  });

  it('Text: eine Zeile, höchstens 300 Zeichen, ohne Steuerzeichen; leer = keine Fassung', () => {
    expect(fassungTextPruefen('  Wir glauben,\n dass [Zahl]  …  ')).toBe('Wir glauben, dass [Zahl] …');
    expect(fassungTextPruefen('   ')).toBeUndefined();
    expect(fassungTextPruefen(undefined)).toBeUndefined();
    expect(fassungTextPruefen('x'.repeat(FASSUNG_MAX))).toHaveLength(FASSUNG_MAX);
    expect(() => fassungTextPruefen('x'.repeat(FASSUNG_MAX + 1))).toThrow('Mögliche Fassung: höchstens 300 Zeichen.');
    expect(() => fassungTextPruefen(`a${String.fromCharCode(0x202e)}b`)).toThrow(FeedbackAbgelehnt);
    expect(() => fassungTextPruefen(42)).toThrow(FeedbackAbgelehnt);
  });
});

describe('Siegel', () => {
  it('öffnet nur mit demselben Ort und einem gelisteten Schlüssel; Klartext steht nicht im Siegel', async () => {
    const text = 'Wir glauben, dass die Bar [Zahl aus deinen Interviews] Bestellungen schafft.';
    const s = await fassungVersiegeln(text, ORT, [KEY]);
    expect(s).toMatch(/^f1\.k1\.[A-Za-z0-9_-]+$/);
    expect(s).not.toContain('Bestellungen');
    expect(await fassungOeffnen(s, ORT, [KEY])).toBe(text);
    // Rotation: neuer Schlüssel vorne, alter weiter gelistet.
    expect(await fassungOeffnen(s, ORT, [{ kid: 'k2', key: new Uint8Array(32).fill(9) }, KEY])).toBe(text);
    expect(await fassungOeffnen(s, { ...ORT, repo: '2026-jonas' }, [KEY])).toBeNull();
    expect(await fassungOeffnen(s, { ...ORT, zeilenId: 'A3' }, [KEY])).toBeNull();
    expect(await fassungOeffnen(s, ORT, [{ kid: 'k1', key: new Uint8Array(32).fill(8) }])).toBeNull();
    expect(await fassungOeffnen(`${s.slice(0, -2)}AA`, ORT, [KEY])).toBeNull();
    expect(await fassungOeffnen('kaputt', ORT, [KEY])).toBeNull();
  });

  it('das Siegel passt zur Form in feedback@1', async () => {
    const s = await fassungVersiegeln('x'.repeat(FASSUNG_MAX * 4), ORT, [KEY]);
    const f = feedbackSchreiben(feedbackLeer(), { artefakt: 'annahmen', zeilenId: 'A2', text: 't', autor: 'm', datum: D1, fassung: { siegel: s, zeilenStand: await zeilenStand('x') } });
    expect(feedbackParsen(JSON.parse(feedbackJson(f))).ok).toBe(true);
  });
});

describe('Wann die Fassung offen ist', () => {
  const daten = annahmenBeispiel;
  const A2 = fassungZeilenText('annahmen', daten, 'A2')!;

  async function lage(stand: string | null) {
    const f = feedbackSchreiben(feedbackLeer(), { artefakt: 'annahmen', zeilenId: 'A2', text: 't', autor: 'm', datum: D1, fassung: { siegel: SIEGEL, zeilenStand: await zeilenStand(stand) } });
    return f;
  }

  it('Zeile unverändert → zu; nur Leerraum geändert → zu; Wortlaut geändert → offen; Zeile gelöscht → offen; Artefakt unlesbar → zu', async () => {
    const f = await lage(A2);
    const e = f.eintraege[0];
    expect(fassungFrei(e, f.eintraege, await zeilenStand(fassungZeilenText('annahmen', daten, 'A2')))).toBe(false);
    const leerraum = { ...daten, annahmen: daten.annahmen.map((a) => (a.id === 'A2' ? { ...a, text: `  ${a.text.replace(/ /g, '  ')} ` } : a)) };
    expect(fassungFrei(e, f.eintraege, await zeilenStand(fassungZeilenText('annahmen', leerraum, 'A2')))).toBe(false);
    const geaendert = { ...daten, annahmen: daten.annahmen.map((a) => (a.id === 'A2' ? { ...a, text: 'Wir glauben, dass die Bar morgens 25 Bestellungen schafft.' } : a)) };
    expect(fassungFrei(e, f.eintraege, await zeilenStand(fassungZeilenText('annahmen', geaendert, 'A2')))).toBe(true);
    const ohneA2 = { ...daten, annahmen: daten.annahmen.filter((a) => a.id !== 'A2') };
    expect(fassungFrei(e, f.eintraege, await zeilenStand(fassungZeilenText('annahmen', ohneA2, 'A2')))).toBe(true);
    expect(fassungFrei(e, f.eintraege, 'unbekannt')).toBe(false);
  });

  it('Antwort der Person → offen (und aufgedecktAm im selben Commit); aufgedecktAm bleibt offen, auch wenn die Zeile zurückgeändert wird', async () => {
    const f = await lage(A2);
    const g = antworten(f, { antwortAuf: 'FB1', text: 'Ich habe nachgezählt.', autor: 'sofie', datum: D2 });
    expect(g.eintraege[0].aufgedecktAm).toBe(D2);
    const ohneVermerk = { ...g, eintraege: [{ ...g.eintraege[0], aufgedecktAm: undefined }, g.eintraege[1]] };
    expect(fassungFrei(ohneVermerk.eintraege[0], ohneVermerk.eintraege, await zeilenStand(A2))).toBe(true);
    expect(fassungFrei(g.eintraege[0], g.eintraege, await zeilenStand(A2))).toBe(true);
    // Eine Antwort auf ein anderes Feedback öffnet sie nicht.
    const h = antworten(feedbackSchreiben(f, { artefakt: 'annahmen', text: 'Allgemein', autor: 'm', datum: D1 }), { antwortAuf: 'FB2', text: 'ok', autor: 'sofie', datum: D2 });
    expect(h.eintraege[0].aufgedecktAm).toBeUndefined();
    expect(fassungFrei(h.eintraege[0], h.eintraege, await zeilenStand(A2))).toBe(false);
  });

  it('Brief: Outcome zählt beide Felder; ein noch nicht gespeicherter Brief zählt als leer', () => {
    expect(fassungZeilenText('brief', briefBeispiel, 'outcome')).toBe(`${briefBeispiel.outcome.wirGlauben.replace(/\s+/g, ' ').trim()}\n${briefBeispiel.outcome.wirMerkenEs.replace(/\s+/g, ' ').trim()}`);
    expect(fassungZeilenText('brief', null, 'problem')).toBe('');
    expect(fassungZeilenText('brief', { ...briefBeispiel, problem: '' }, 'problem')).toBe('');
    expect(fassungZeilenText('annahmen', null, 'A2')).toBeNull();
  });
});
