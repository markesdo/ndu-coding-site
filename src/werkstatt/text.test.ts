import { describe, expect, it } from 'vitest';
import { graphemAnzahl } from './text.js';

describe('graphemAnzahl', () => {
  it('zählt sichtbare Zeichen, nicht UTF-16-Einheiten', () => {
    expect(graphemAnzahl('')).toBe(0);
    expect(graphemAnzahl('abc')).toBe(3);
    expect(graphemAnzahl('e\u0301')).toBe(1);
    expect(graphemAnzahl('\u{1F469}\u200D\u{1F4BB}')).toBe(1);
    expect(graphemAnzahl('e\u0301'.repeat(120))).toBe(120);
  });
});
