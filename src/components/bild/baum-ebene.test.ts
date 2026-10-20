import { describe, expect, it } from 'vitest';
import { baumEbene } from './baum-ebene';

describe('baumEbene', () => {
  it('ohne Momente: Outcome, Chance, Lösung, Experiment nach der Tiefe', () => {
    expect([0, 1, 2, 3, 4].map((t) => baumEbene(t, false).name)).toStrictEqual(['Outcome', 'Chance', 'Lösung', 'Experiment', 'Experiment']);
  });

  it('mit Momenten: Tiefe 1 ist Moment, darunter Chance – die Ebenen darunter rücken eine Stufe tiefer', () => {
    expect([0, 1, 2, 3, 4, 5].map((t) => baumEbene(t, true).name)).toStrictEqual(['Outcome', 'Moment', 'Chance', 'Lösung', 'Experiment', 'Experiment']);
    expect(baumEbene(1, true).klasse).toBe('em');
    expect(baumEbene(2, true).klasse).toBe('e1');
  });
});
