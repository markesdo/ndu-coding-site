import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { quizProbleme, type QuizFrage } from './quiz-check';

const f = (a: number, o = ['aa', 'bb', 'cc']) => ({ q: 'Frage', o, a });
const mit = (a: number, richtig: string, falsch: string) => f(a, [0, 1, 2].map((j) => (j === a ? richtig : falsch)));

describe('quizProbleme', () => {
  it('gemischte Stellen, gleich lange Antworten: in Ordnung', () => {
    expect(quizProbleme([f(0), f(1), f(2), f(1)])).toStrictEqual([]);
  });

  it('meldet einen Index außerhalb der Antworten', () => {
    expect(quizProbleme([f(3)])).toStrictEqual(['a=3 passt nicht zu 3 Antworten bei „Frage“']);
  });

  it('Stelle: mehr als 60 % ist zu viel, genau 60 % nicht', () => {
    expect(quizProbleme([f(1), f(1), f(1), f(0)])).toStrictEqual(['3 von 4 richtigen Antworten stehen an Stelle 2']);
    expect(quizProbleme([f(1), f(1), f(1), f(0), f(2)])).toStrictEqual([]);
  });

  it('Stelle: erst ab vier Fragen', () => {
    expect(quizProbleme([f(1), f(1)])).toStrictEqual([]);
  });

  it('Länge: deutlich die längste bei mehr als der Hälfte – genau die Hälfte geht noch', () => {
    const lang = (a: number) => mit(a, 'deutlich länger', 'kurz');
    expect(quizProbleme([lang(0), lang(1)])).toStrictEqual(['Bei 2 von 2 Fragen ist die richtige Antwort deutlich die längste']);
    expect(quizProbleme([lang(0), lang(1), f(2), f(0)])).toStrictEqual([]);
  });

  it('Länge: deutlich die kürzeste genauso', () => {
    const kurz = (a: number) => mit(a, 'kurz', 'deutlich länger');
    expect(quizProbleme([kurz(0), kurz(1)])).toStrictEqual(['Bei 2 von 2 Fragen ist die richtige Antwort deutlich die kürzeste']);
  });

  it('Länge: ein paar Zeichen Unterschied zählen nicht, eine einzelne Frage auch nicht', () => {
    expect(quizProbleme([mit(0, 'zehn Zeichen!', 'zehn Zeichen'), mit(1, 'zehn Zeichen!', 'zehn Zeichen')])).toStrictEqual([]);
    expect(quizProbleme([mit(2, 'eine deutlich längere Antwort', 'kurz')])).toStrictEqual([]);
  });
});

// Die einzelnen Quizze prüft der Build (Quiz.astro). Hier zusätzlich alle Fragen eines Tages zusammen:
// Einstiegsfragen haben nur zwei Fragen pro Quiz – über den Tag dürfen sie trotzdem kein Muster bilden.
const fragenDerSeite = (seite: string): QuizFrage[] => {
  const quelle = readFileSync(new URL(`../pages/${seite}.astro`, import.meta.url), 'utf8');
  const zeilen = quelle.split('\n').filter((z) => /^\s*\{ q: '/.test(z));
  return zeilen.map((z) => {
    const m = z.match(/^\s*\{ q: '(.*?)', o: \[(.*?)\], a: (\d+),/);
    if (!m) throw new Error(`Frage nicht lesbar: ${z.slice(0, 80)}`);
    return { q: m[1], o: [...m[2].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((x) => x[1]), a: Number(m[3]) };
  });
};

describe('alle Fragen eines Tages zusammen', () => {
  it.each([
    ['tag-1', 4],
    ['tag-2', 14],
    ['tag-3', 4],
  ])('%s: %i Fragen, kein Muster', (seite, anzahl) => {
    const fragen = fragenDerSeite(seite);
    expect(fragen.length).toBe(anzahl);
    expect(fragen.every((x) => x.o.length === 3)).toBe(true);
    expect(quizProbleme(fragen)).toStrictEqual([]);
  });
});
