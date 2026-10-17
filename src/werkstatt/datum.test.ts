import { describe, expect, it } from 'vitest';
import { heuteWien } from './datum.js';

describe('heuteWien', () => {
  it('heute in Wien, auch wenn es in UTC noch gestern ist', () => {
    expect(heuteWien(new Date('2026-10-21T22:30:00Z'))).toBe('2026-10-22');
    expect(heuteWien(new Date('2026-10-22T21:59:00Z'))).toBe('2026-10-22');
  });
});
