import { describe, expect, it } from 'vitest';
import { istId, naechsteId } from './ids';

describe('istId', () => {
  it('akzeptiert A12 und I2-4', () => {
    expect(istId('A12')).toBe(true);
    expect(istId('I2-4')).toBe(true);
  });
  it('lehnt A0, a1, I2-, leer und Fremdpräfixe ab', () => {
    for (const s of ['A0', 'a1', 'I2-', '', 'A', 'X1', 'A01', ' A1', 'A1 ', 'A1\n']) expect(istId(s), s).toBe(false);
  });
});

describe('naechsteId', () => {
  it('größte Nummer + 1', () => {
    expect(naechsteId('A', ['A1', 'A3'])).toBe('A4');
  });
  it('leer beginnt bei 1', () => {
    expect(naechsteId('D', [])).toBe('D1');
  });
  it('Lücken werden nie aufgefüllt', () => {
    expect(naechsteId('A', ['A1', 'A5'])).toBe('A6');
  });
  it('andere Präfixe und Unter-IDs zählen nicht', () => {
    expect(naechsteId('A', ['D9', 'I2-4', 'A2'])).toBe('A3');
  });
  it('A10 ist größer als A9', () => {
    expect(naechsteId('A', ['A9', 'A10'])).toBe('A11');
  });
});
