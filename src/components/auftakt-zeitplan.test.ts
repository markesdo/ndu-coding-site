import { describe, expect, it } from 'vitest';
import {
  AUFTAKT_MAX, HALTEN, PROMPT_KURZ, PROMPT_LANG, START, WECHSEL_MS,
  auftaktStatus, promptFuer, promptWahl, tokens, woerter, zeitplan,
} from './auftakt-zeitplan';

const LEAD = 'In drei Tagen von „Ich kann nicht programmieren“ zu einem eigenen, öffentlich erreichbaren Prototyp – ohne eine Zeile Code selbst zu schreiben.';
const plan = (prompt: string, zufall = () => 0.5) =>
  zeitplan({ prompt, h1Tokens: 5, leadWoerter: woerter(LEAD).length, tage: 3, zufall });

describe('auftaktStatus', () => {
  it('erster Besuch: spielen und merken', () => {
    expect(auftaktStatus({ suche: '', gesehen: false, reduziert: false })).toStrictEqual({ spielen: true, merken: true, folie: false });
  });
  it('zweiter Besuch: nicht spielen', () => {
    expect(auftaktStatus({ suche: '', gesehen: true, reduziert: false })).toStrictEqual({ spielen: false, merken: false, folie: false });
  });
  it('?intro spielt immer, merkt aber nie – auch beim ersten Besuch', () => {
    expect(auftaktStatus({ suche: '?intro', gesehen: true, reduziert: false })).toStrictEqual({ spielen: true, merken: false, folie: true });
    expect(auftaktStatus({ suche: '?beamer&intro', gesehen: false, reduziert: false })).toStrictEqual({ spielen: true, merken: false, folie: true });
  });
  it('reduzierte Bewegung: keine Animation, aber ?intro bleibt Eröffnungsfolie', () => {
    expect(auftaktStatus({ suche: '?intro', gesehen: false, reduziert: true })).toStrictEqual({ spielen: false, merken: false, folie: true });
    expect(auftaktStatus({ suche: '', gesehen: false, reduziert: true })).toStrictEqual({ spielen: false, merken: false, folie: false });
  });
});

describe('promptFuer', () => {
  it('unter 480 px die kurze Fassung, ab 480 px die lange', () => {
    expect(promptFuer(390)).toBe(PROMPT_KURZ);
    expect(promptFuer(479)).toBe(PROMPT_KURZ);
    expect(promptFuer(480)).toBe(PROMPT_LANG);
    expect(promptFuer(1440)).toBe(PROMPT_LANG);
  });
});

describe('promptWahl', () => {
  // Unabhängig gerechnet: „›“, Leerzeichen (je 0,6em), Cursor 0,55em + 0,15em Abstand – nicht EXTRA_ZEICHEN wiederverwenden.
  const zeilenBreite = (text: string, px: number) => (text.length * 0.6 + 0.6 + 0.6 + 0.55 + 0.15) * px;
  it('der gewählte Auftrag passt immer in eine Zeile – vom kleinen Handy bis zum Beamer', () => {
    for (const verfuegbar of [288, 343, 358, 400, 488, 568, 700, 860, 1100]) {
      const w = promptWahl(verfuegbar, 16.8);
      expect(zeilenBreite(w.text, w.px)).toBeLessThanOrEqual(verfuegbar + 0.5);
    }
  });
  it('lang, wo Platz ist; kurz am Handy, notfalls etwas kleiner', () => {
    expect(promptWahl(860, 16.8)).toStrictEqual({ text: PROMPT_LANG, px: 16.8 });
    expect(promptWahl(358, 16.38).text).toBe(PROMPT_KURZ);
    expect(promptWahl(358, 16.38).px).toBeLessThan(16.38);
  });
});

describe('tokens', () => {
  it('die Überschrift landet in fünf Stücken, die zusammen den Text ergeben', () => {
    const t = tokens('Programmieren mit AI');
    expect(t).toHaveLength(5);
    expect(t.join('')).toBe('Programmieren mit AI');
  });
  it('unbekannter Text: Wort für Wort, ohne Zeichen zu verlieren', () => {
    expect(tokens('Hallo schöne Welt').join('')).toBe('Hallo schöne Welt');
    expect(woerter(LEAD).join('')).toBe(LEAD);
  });
});

describe('zeitplan', () => {
  it('bleibt mit beiden Aufträgen und jeder Streuung unter 3,8 s', () => {
    for (const p of [PROMPT_LANG, PROMPT_KURZ]) for (const z of [0, 0.5, 0.999]) {
      expect(plan(p, () => z).ende).toBeLessThanOrEqual(AUFTAKT_MAX);
    }
  });
  it('ein sehr langer Auftrag wird gestaucht statt das Limit zu sprengen', () => {
    expect(plan('x'.repeat(400), () => 0.999).ende).toBeLessThanOrEqual(AUFTAKT_MAX);
  });
  it('nach dem Komma eine hörbare Pause, sonst gleichmäßiges Tippen', () => {
    const p = plan(PROMPT_LANG);
    const komma = PROMPT_LANG.indexOf(',');
    const nachKomma = p.tipp[komma + 1] - p.tipp[komma];
    const normal = p.tipp[3] - p.tipp[2];
    expect(nachKomma).toBeGreaterThanOrEqual(normal + 150);
  });
  it('erst tippen, dann halten, dann Überschrift, Einleitung, Tage – in dieser Reihenfolge', () => {
    const p = plan(PROMPT_LANG);
    expect(p.tipp[0]).toBeGreaterThan(START);
    expect(p.wechsel).toBe(p.tipp.at(-1)! + HALTEN);
    // Die Überschrift landet erst, wenn der Auftrag fast ausgeblendet ist.
    expect(p.h1[0]).toBeGreaterThanOrEqual(p.wechsel + WECHSEL_MS * 0.7);
    expect(p.lead[0]).toBeGreaterThan(p.h1[0]);
    expect(p.tage[0]).toBeGreaterThan(p.lead.at(-1)!);
    expect(p.h1).toHaveLength(5);
    expect(p.tage).toHaveLength(3);
  });
  it('die Zeichen erscheinen streng nacheinander', () => {
    const p = plan(PROMPT_LANG, () => 0);
    for (let i = 1; i < p.tipp.length; i++) expect(p.tipp[i]).toBeGreaterThan(p.tipp[i - 1]);
  });
});
