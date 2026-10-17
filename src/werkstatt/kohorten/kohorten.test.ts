import { describe, expect, it } from 'vitest';
import { KOHORTEN } from './index';
import { kohorteTest } from './test';

describe('Kohorten', () => {
  it('Testkohorte ist ausdrücklich aktiv und beginnt vor allen echten Jahrgängen', () => {
    expect(kohorteTest.status).toBe('aktiv');
    expect(kohorteTest.beginn).toBe('2000-01-01');
    for (const k of KOHORTEN) if (k.id !== 'test') expect(k.beginn > kohorteTest.beginn, k.id).toBe(true);
  });
});
