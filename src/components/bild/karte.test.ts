import { describe, expect, it } from 'vitest';
import { karteAus, zeileTeilen } from './karte';

describe('Karte: Text wie im Prompt → Titel und Zeilen mit festem Satzanfang', () => {
  it('Satzanfänge der Test Card fett, Rest normal; Doppelpunkt-Zeilen bis zum Doppelpunkt', () => {
    expect(zeileTeilen('Wir glauben, dass Pendler*innen bestellen.')).toStrictEqual({ stamm: 'Wir glauben, dass', rest: [{ text: ' Pendler*innen bestellen.', luecke: false }] });
    expect(zeileTeilen('Wir entscheiden vorher: ab 10 → Concierge').stamm).toBe('Wir entscheiden vorher:');
    expect(zeileTeilen('Falls E1 scheitert: Wartezeit-Anzeige (A6)').stamm).toBe('Falls E1 scheitert:');
    // Kein Doppelpunkt im Satzanfang, wenn er in einer Lücke oder einem Zitat steht.
    expect(zeileTeilen('„Fertig 7:31“ steht da').stamm).toBe('');
  });
  it('Lücken „[…]“ getrennt; eingerückte Zeilen gehören zur Zeile davor', () => {
    const k = karteAus('E1 · A[n] ([Art])\nWir glauben, dass [...].\nUm das zu prüfen, geben wir:\n  „Aufgabe“');
    expect(k.titel.map((t) => t.luecke)).toStrictEqual([false, true, false, true, false]);
    expect(k.zeilen).toHaveLength(2);
    expect(k.zeilen[0].rest.filter((t) => t.luecke).map((t) => t.text)).toStrictEqual(['[...]']);
    expect(k.zeilen[1].rest.map((t) => t.text).join('')).toContain('„Aufgabe“');
  });
});
