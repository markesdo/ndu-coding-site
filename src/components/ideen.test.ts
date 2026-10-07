import { describe, expect, it } from 'vitest';
import { ideen } from './ideen';

const istKi = (issue: string) => /\bKI\b/.test(issue);

describe('Projektideen', () => {
  it('jede Idee hat 3–5 Issues – die Größe, die die Seite verspricht', () => {
    for (const i of ideen) expect(i.s.length, i.t).toBeGreaterThanOrEqual(3);
    for (const i of ideen) expect(i.s.length, i.t).toBeLessThanOrEqual(5);
  });
  it('KI-Projekte bauen die KI als letztes Issue und nur dort', () => {
    for (const i of ideen.filter(i => i.ki)) {
      expect(istKi(i.s.at(-1)!), i.t).toBe(true);
      expect(i.s.slice(0, -1).filter(istKi), i.t).toStrictEqual([]);
    }
  });
  it('Ideen ohne KI-Label erwähnen keine KI in den Issues', () => {
    for (const i of ideen.filter(i => !i.ki)) expect(i.s.filter(istKi), i.t).toStrictEqual([]);
  });
});
