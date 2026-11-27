import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Karte from './Karte.astro';
import { karteAus, zeileTeilen } from './karte';

describe('Karte: Text wie im Prompt → Titel und Zeilen mit festem Satzanfang', () => {
  it('Satzanfänge der Test Card fett, Rest normal; Doppelpunkt-Zeilen bis zum Doppelpunkt', () => {
    expect(zeileTeilen('Wir glauben, dass Pendler*innen bestellen.')).toStrictEqual({ stamm: 'Wir glauben, dass', rest: [{ text: 'Pendler*innen bestellen.', luecke: false }] });
    expect(zeileTeilen('Wir entscheiden vorher: ab 10 → Concierge').stamm).toBe('Wir entscheiden vorher:');
    expect(zeileTeilen('Falls E1 scheitert: Wartezeit-Anzeige (A6)').stamm).toBe('Falls E1 scheitert:');
    // Kein Doppelpunkt im Satzanfang, wenn er in einer Lücke oder einem Zitat steht.
    expect(zeileTeilen('„Fertig 7:31“ steht da').stamm).toBe('');
  });
  // Code-Review #458: Leerzeichen zwischen Lücke und Text bleiben; „Wir messen:“ mit Doppelpunkt im fetten Teil.
  it('Leerzeichen um Lücken bleiben, nur der Anfang des Rests wird gekürzt', () => {
    const z = zeileTeilen('Wir haben recht, wenn [x] von 5 den Höhepunkt ohne Hilfe erreichen.');
    expect(z.stamm).toBe('Wir haben recht, wenn');
    expect(z.rest.map((t) => t.text).join('')).toBe('[x] von 5 den Höhepunkt ohne Hilfe erreichen.');
    expect(zeileTeilen('Wir entscheiden vorher: ab [x] → [...] · unter [...]').rest.map((t) => t.text).join('')).toBe('ab [x] → [...] · unter [...]');
  });
  it('bekannter Satzanfang mit Doppelpunkt: der Doppelpunkt ist fett', () => {
    expect(zeileTeilen('Wir messen: wer bei Schlange zum Automaten geht')).toStrictEqual({ stamm: 'Wir messen:', rest: [{ text: 'wer bei Schlange zum Automaten geht', luecke: false }] });
    expect(zeileTeilen('Wir messen [Handlung].').stamm).toBe('Wir messen');
  });
  // 27.11.2026: Karte E1 folgt der Vorlage („Wir messen, wer …“) – das Komma gehört zum fetten Teil, kein Leerzeichen davor.
  it('bekannter Satzanfang mit Komma: das Komma ist fett', () => {
    expect(zeileTeilen('Wir messen, wer bei Schlange zum Automaten geht')).toStrictEqual({ stamm: 'Wir messen,', rest: [{ text: 'wer bei Schlange zum Automaten geht', luecke: false }] });
  });
  it('Lücken „[…]“ getrennt; eingerückte Zeilen gehören zur Zeile davor', () => {
    const k = karteAus('E1 · A[n] ([Art])\nWir glauben, dass [...].\nUm das zu prüfen, geben wir:\n  „Aufgabe“');
    expect(k.titel.map((t) => t.luecke)).toStrictEqual([false, true, false, true, false]);
    expect(k.zeilen).toHaveLength(2);
    expect(k.zeilen[0].rest.filter((t) => t.luecke).map((t) => t.text)).toStrictEqual(['[...]']);
    expect(k.zeilen[1].rest.map((t) => t.text).join('')).toContain('„Aufgabe“');
  });
  it('gerendert: Leerzeichen zwischen Lücke und Text bleiben, „Wir messen:“ ganz fett', async () => {
    const html = await (await AstroContainer.create()).renderToString(Karte, { props: { text: 'E2\nWir haben recht, wenn [x] von 5 den Höhepunkt erreichen.\nWir messen: Zeit bis dahin\nWir messen, wer einträgt.' } });
    const ohneAttr = html.replace(/ data-astro-[a-z-]+(="[^"]*")?/g, '');
    expect(ohneAttr).toContain('<strong>Wir haben recht, wenn</strong> <span class="luecke">[x]</span> von 5 den Höhepunkt erreichen.');
    expect(ohneAttr).toContain('<strong>Wir messen:</strong> Zeit bis dahin');
    expect(ohneAttr).toContain('<strong>Wir messen,</strong> wer einträgt.');
    expect(ohneAttr).not.toContain(' ,');
  }, 60_000);
});
