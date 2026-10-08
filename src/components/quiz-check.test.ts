import { describe, expect, it } from 'vitest';
import { quizProbleme } from './quiz-check';

const f = (a: number, o = ['aa', 'bb', 'cc']) => ({ q: 'Frage', o, a });

describe('quizProbleme', () => {
  it('gemischte Stellen, gleich lange Antworten: in Ordnung', () => {
    expect(quizProbleme([f(0), f(1), f(2), f(1)])).toStrictEqual([]);
  });

  it('meldet einen Index außerhalb der Antworten', () => {
    expect(quizProbleme([f(3)])).toStrictEqual(['a=3 passt nicht zu 3 Antworten bei „Frage“']);
  });

  it('meldet, wenn mehr als 60 % an derselben Stelle stehen', () => {
    expect(quizProbleme([f(1), f(1), f(1), f(0)])).toStrictEqual(['3 von 4 richtigen Antworten stehen an Stelle 2']);
  });

  it('prüft die Stelle erst ab vier Fragen', () => {
    expect(quizProbleme([f(1), f(1)])).toStrictEqual([]);
  });

  it('meldet, wenn die richtige Antwort meist die längste ist', () => {
    const lang = (a: number) => f(a, ['kurz', 'kurz', 'kurz'].map((o, j) => (j === a ? 'deutlich länger' : o)));
    expect(quizProbleme([lang(0), lang(1)])).toStrictEqual(['Bei 2 von 2 Fragen ist die richtige Antwort deutlich die längste']);
    expect(quizProbleme([lang(0), f(1)])).toStrictEqual([]);
  });

  it('ein paar Zeichen länger zählt nicht als Hinweis', () => {
    const knapp = (a: number) => f(a, ['zehn Zeichen', 'zehn Zeichen', 'zehn Zeichen'].map((o, j) => (j === a ? o + '!' : o)));
    expect(quizProbleme([knapp(0), knapp(1)])).toStrictEqual([]);
  });
});
