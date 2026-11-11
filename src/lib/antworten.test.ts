import { describe, expect, it } from 'vitest';
import {
  MAX_TEXT, RUNDEN, absenderHash, absenderIp, absenderSchluessel, antwortSchluessel, laufSchluessel, antwortenGruppieren, eingabePruefen, idPruefen, indexSchluessel, rollePruefen,
  rundePruefen, standBauen, statusText, textBereinigen, texteFrei,
} from './antworten';

const ID = 'abcdefghijklmnop';
const netflix = RUNDEN.netflix;

describe('Antwortrunde: Eingabe prüfen', () => {
  it('Runde nur aus der Liste des Servers', () => {
    expect(rundePruefen('netflix')).toBe(netflix);
    expect(rundePruefen('zwoelf')).toBeNull();
    expect(rundePruefen('toString')).toBeNull();
    expect(rundePruefen('__proto__')).toBeNull();
    expect(rundePruefen(1)).toBeNull();
  });

  it('Rolle nur aus der Liste der Runde; eine Runde ohne Rollen nimmt keine', () => {
    expect(rollePruefen(netflix, 'design')).toBe('design');
    expect(rollePruefen(netflix, 'marketing')).toBeUndefined();
    expect(rollePruefen(netflix, undefined)).toBeUndefined();
    expect(rollePruefen(netflix, 'Design')).toBeUndefined();
    const ohne = { ...netflix, rollen: [] };
    expect(rollePruefen(ohne, undefined)).toBeNull();
    expect(rollePruefen(ohne, 'design')).toBeUndefined();
  });

  it('Text: getrimmt, Steuer- und Richtungszeichen raus, 1–200 Zeichen', () => {
    expect(textBereinigen('  Nur Serien unter Beliebt.  ')).toBe('Nur Serien unter Beliebt.');
    expect(textBereinigen(`Zeile 1\r\nZeile${String.fromCharCode(0)}2${String.fromCharCode(0x2028)}x${String.fromCharCode(0x202e)}!`)).toBe('Zeile 1 Zeile2 x!');
    expect(textBereinigen('   ')).toBeNull();
    expect(textBereinigen('\u0007')).toBeNull();
    expect(textBereinigen('x'.repeat(MAX_TEXT))).toBe('x'.repeat(MAX_TEXT));
    expect(textBereinigen('x'.repeat(MAX_TEXT + 1))).toBeNull();
    expect(textBereinigen('😀'.repeat(MAX_TEXT))).toBe('😀'.repeat(MAX_TEXT)); // Zeichen, nicht UTF-16-Einheiten
    expect(textBereinigen(42)).toBeNull();
    // HTML bleibt Text: Der Server speichert es so, die Seite setzt es nur als textContent.
    expect(textBereinigen('<img src=x onerror=alert(1)>')).toBe('<img src=x onerror=alert(1)>');
  });

  it('id: 16–64 Zeichen aus A–Z, a–z, 0–9, _ und -', () => {
    expect(idPruefen(ID)).toBe(ID);
    expect(idPruefen('0b6c1f0e-3c1a-4e8b-9a77-1f2d3c4b5a69')).not.toBeNull();
    expect(idPruefen('kurz')).toBeNull();
    expect(idPruefen('a'.repeat(65))).toBeNull();
    expect(idPruefen('abcdefghijklmnop:x')).toBeNull();
    expect(idPruefen('abcdefghijklmnop\n')).toBeNull();
  });

  it('Body: alles oder nichts', () => {
    expect(eingabePruefen({ runde: 'netflix', rolle: 'design', text: ' Suche fehlt ', id: ID }))
      .toStrictEqual({ runde: 'netflix', rolle: 'design', text: 'Suche fehlt', id: ID });
    expect(eingabePruefen({ runde: 'netflix', rolle: 'chef', text: 'x', id: ID })).toBeNull();
    expect(eingabePruefen({ runde: 'netflix', rolle: 'design', text: 'x'.repeat(201), id: ID })).toBeNull();
    expect(eingabePruefen({ runde: 'netflix', rolle: 'design', text: 'x', id: 'kurz' })).toBeNull();
    expect(eingabePruefen({ runde: 'gibtsnicht', rolle: 'design', text: 'x', id: ID })).toBeNull();
    expect(eingabePruefen(null)).toBeNull();
    expect(eingabePruefen('netflix')).toBeNull();
  });
});

describe('Antwortrunde: Schlüssel und Stand', () => {
  it('Schlüssel pro Wiener Kurstag, Runde und id', () => {
    // 23:30 UTC am 11.11. ist in Wien schon der 12.11.
    const spaet = new Date('2026-11-11T23:30:00Z');
    expect(antwortSchluessel('netflix', ID, spaet)).toBe(`antwort:2026-11-12:netflix:0:${ID}`);
    expect(indexSchluessel('netflix', spaet)).toBe('antworten:2026-11-12:netflix:0');
    expect(antwortSchluessel('netflix', ID, new Date('2026-11-12T13:00:00Z'))).toBe(`antwort:2026-11-12:netflix:0:${ID}`);
    expect(antwortSchluessel('netflix', ID, new Date('2026-11-13T13:00:00Z'))).not.toBe(antwortSchluessel('netflix', ID, spaet));
    // Nach „Runde leeren“ ein neuer Lauf, neue Schlüssel.
    expect(antwortSchluessel('netflix', ID, spaet, '1763')).toBe(`antwort:2026-11-12:netflix:1763:${ID}`);
    expect(laufSchluessel('netflix', spaet)).toBe('antworten-lauf:2026-11-12:netflix');
    expect(absenderSchluessel('netflix', 'h', spaet, '7')).toBe('antworten-ip:2026-11-12:netflix:7:h');
  });

  it('Absender: x-real-ip von Vercel, sonst erste x-forwarded-for; gehasht, nie im Klartext', async () => {
    expect(absenderIp(new Headers({ 'x-real-ip': '203.0.113.7', 'x-forwarded-for': '198.51.100.1' }))).toBe('203.0.113.7');
    expect(absenderIp(new Headers({ 'x-forwarded-for': '198.51.100.1, 10.0.0.1' }))).toBe('198.51.100.1');
    expect(absenderIp(new Headers())).toBe('unbekannt');
    const h = await absenderHash('203.0.113.7');
    expect(h).toMatch(/^[0-9a-f]{24}$/);
    expect(h).not.toContain('203');
    expect(await absenderHash('203.0.113.8')).not.toBe(h);
  });

  it('frei erst nach dem Aufdecken oder ab der Rückfall-Uhrzeit', () => {
    const vorher = new Date('2026-11-12T13:30:00Z'); // 14:30 Wien
    expect(texteFrei(netflix, false, vorher)).toBe(false);
    expect(texteFrei(netflix, true, vorher)).toBe(true);
    expect(texteFrei(netflix, false, new Date('2026-11-12T17:00:00Z'))).toBe(true); // 18:00 Wien = NACH_NETFLIX
  });

  const eintraege = [
    { id: 'e'.repeat(16), rolle: 'entwicklung', text: 'Kinderfilme', zeit: 1 },
    { id: 'p'.repeat(16), rolle: 'produktmanagement', text: 'Nur Serien', zeit: 3 },
    { id: 'd'.repeat(16), rolle: 'design', text: 'Suche', zeit: 2 },
    { id: 'q'.repeat(16), rolle: 'produktmanagement', text: 'Angebot', zeit: 2 },
  ];

  it('vor dem Aufdecken nur Zahlen, keine Texte und keine ids', () => {
    const s = standBauen(netflix, eintraege, false, 'd'.repeat(16));
    expect(s).toStrictEqual({ anzahl: 4, rollen: { produktmanagement: 2, design: 1, entwicklung: 1 }, frei: false, eigene: true });
    expect(JSON.stringify(s)).not.toContain('Suche');
  });

  it('nach dem Aufdecken die Texte nach Rolle und Zeit, ohne ids', () => {
    const s = standBauen(netflix, eintraege, true);
    expect(s.antworten).toStrictEqual([
      { rolle: 'produktmanagement', text: 'Angebot' },
      { rolle: 'produktmanagement', text: 'Nur Serien' },
      { rolle: 'design', text: 'Suche' },
      { rolle: 'entwicklung', text: 'Kinderfilme' },
    ]);
    expect(JSON.stringify(s)).not.toContain('pppp');
    expect(standBauen(netflix, eintraege, true, 'x'.repeat(16)).eigene).toBe(false);
  });

  it('Gruppen für „Eure Sätze“ und die Statuszeile', () => {
    expect(antwortenGruppieren(netflix.rollen, [{ rolle: 'design', text: 'a' }, { rolle: 'produktmanagement', text: 'b' }, { rolle: 'design', text: 'c' }]))
      .toStrictEqual([{ label: 'Produktmanagement', texte: ['b'] }, { label: 'Design', texte: ['a', 'c'] }]);
    expect(antwortenGruppieren([], [{ rolle: null, text: 'a' }])).toStrictEqual([{ label: null, texte: ['a'] }]);
    expect(statusText(0, 3)).toBe('Noch keine Antworten.');
    expect(statusText(1, 3)).toBe('1 von 3 hat geantwortet.');
    expect(statusText(2, 3)).toBe('2 von 3 haben geantwortet.');
    expect(statusText(4, 3)).toBe('4 haben geantwortet.');
  });
});
