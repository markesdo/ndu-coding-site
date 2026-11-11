import { describe, expect, it } from 'vitest';
import {
  MAX_TEXT, RUNDEN, antwortenGruppieren, eingabePruefen, gesendetGilt, platzSchluessel, rolleBesetzt, rollePruefen, rolleWaehlbar,
  rundePruefen, standBauen, statusText, textBereinigen, textPruefen, texteFrei,
} from './antworten';

const netflix = RUNDEN.netflix;

describe('Antwortrunde: Eingabe prüfen', () => {
  it('Runde nur aus der Liste des Servers', () => {
    expect(rundePruefen('netflix')).toBe(netflix);
    expect(rundePruefen('zwoelf')).toBeNull();
    expect(rundePruefen('toString')).toBeNull();
    expect(rundePruefen('__proto__')).toBeNull();
    expect(rundePruefen(1)).toBeNull();
  });

  it('Rolle nur aus der Liste der Runde', () => {
    expect(rollePruefen(netflix, 'design')).toBe('design');
    expect(rollePruefen(netflix, 'marketing')).toBeNull();
    expect(rollePruefen(netflix, undefined)).toBeNull();
    expect(rollePruefen(netflix, 'Design')).toBeNull();
    expect(rollePruefen(netflix, 'design:x')).toBeNull();
  });

  it('Text: getrimmt, Steuer- und Richtungszeichen raus, 1–120 Zeichen', () => {
    expect(MAX_TEXT).toBe(120);
    expect(textBereinigen('  Nur Serien unter Beliebt.  ')).toBe('Nur Serien unter Beliebt.');
    expect(textBereinigen(`Zeile 1\r\nZeile${String.fromCharCode(0)}2${String.fromCharCode(0x2028)}x${String.fromCharCode(0x202e)}!`)).toBe('Zeile 1 Zeile2 x!');
    expect(textBereinigen('   ')).toBeNull();
    expect(textBereinigen(String.fromCharCode(7))).toBeNull();
    expect(textBereinigen('x'.repeat(MAX_TEXT))).toBe('x'.repeat(MAX_TEXT));
    expect(textBereinigen('x'.repeat(MAX_TEXT + 1))).toBeNull();
    expect(textBereinigen('😀'.repeat(MAX_TEXT))).toBe('😀'.repeat(MAX_TEXT)); // Zeichen, nicht UTF-16-Einheiten
    expect(textBereinigen(42)).toBeNull();
    // HTML bleibt Text: Der Server speichert es so, die Seite setzt es nur als textContent.
    expect(textBereinigen('<img src=x onerror=alert(1)>')).toBe('<img src=x onerror=alert(1)>');
  });

  it('Grund für die Seite: leer (auch nach dem Bereinigen) oder zu lang', () => {
    expect(textPruefen('  ')).toStrictEqual({ fehler: 'leer' });
    expect(textPruefen(String.fromCharCode(0x202e, 7))).toStrictEqual({ fehler: 'leer' });
    expect(textPruefen('x'.repeat(121))).toStrictEqual({ fehler: 'lang' });
    expect(textPruefen(' ok ')).toStrictEqual({ text: 'ok' });
  });

  it('Body: alles oder nichts', () => {
    expect(eingabePruefen({ runde: 'netflix', rolle: 'design', text: ' Suche fehlt ' }))
      .toStrictEqual({ runde: 'netflix', konfig: netflix, rolle: 'design', text: 'Suche fehlt' });
    expect(eingabePruefen({ runde: 'netflix', rolle: 'chef', text: 'x' })).toBeNull();
    expect(eingabePruefen({ runde: 'netflix', rolle: 'design', text: 'x'.repeat(121) })).toBeNull();
    expect(eingabePruefen({ runde: 'gibtsnicht', rolle: 'design', text: 'x' })).toBeNull();
    expect(eingabePruefen(null)).toBeNull();
    expect(eingabePruefen('netflix')).toBeNull();
  });
});

describe('Antwortrunde: Plätze und Stand', () => {
  it('ein Platz pro Wiener Kurstag, Runde und Rolle', () => {
    // 23:30 UTC am 11.11. ist in Wien schon der 12.11.
    const spaet = new Date('2026-11-11T23:30:00Z');
    expect(platzSchluessel('netflix', 'design', spaet)).toBe('antwort:2026-11-12:netflix:design');
    expect(platzSchluessel('netflix', 'design', new Date('2026-11-12T13:00:00Z'))).toBe('antwort:2026-11-12:netflix:design');
    expect(platzSchluessel('netflix', 'design', new Date('2026-11-13T13:00:00Z'))).toBe('antwort:2026-11-13:netflix:design');
  });

  it('frei erst nach dem Aufdecken oder ab der Rückfall-Uhrzeit', () => {
    const vorher = new Date('2026-11-12T13:30:00Z'); // 14:30 Wien
    expect(texteFrei(netflix, false, vorher)).toBe(false);
    expect(texteFrei(netflix, true, vorher)).toBe(true);
    expect(texteFrei(netflix, false, new Date('2026-11-12T17:00:00Z'))).toBe(true); // 18:00 Wien = NACH_NETFLIX
  });

  const plaetze = [{ text: 'Nur Serien', zeit: 3 }, null, { text: 'Kinderfilme', zeit: 1 }];

  it('vor dem Aufdecken nur, welche Rollen geantwortet haben', () => {
    const s = standBauen(netflix, plaetze, false);
    expect(s).toStrictEqual({ anzahl: 2, vergeben: ['produktmanagement', 'entwicklung'], frei: false });
    expect(JSON.stringify(s)).not.toContain('Serien');
  });

  it('nach dem Aufdecken die Texte in der Reihenfolge der Rollen', () => {
    expect(standBauen(netflix, plaetze, true).antworten).toStrictEqual([
      { rolle: 'produktmanagement', text: 'Nur Serien' },
      { rolle: 'entwicklung', text: 'Kinderfilme' },
    ]);
  });

  it('Abgleich mit dem Server: „Gesendet“ nur, solange die eigene Rolle belegt ist; fremd belegte Rolle erkennen', () => {
    expect(gesendetGilt(['design'], 'design')).toBe(true);
    expect(gesendetGilt([], 'design')).toBe(false); // nach „Runde leeren“
    expect(gesendetGilt(['design'], null)).toBe(false);
    expect(rolleBesetzt(['design'], 'design', null)).toBe(true);
    expect(rolleBesetzt(['design'], 'design', 'design')).toBe(false); // die eigene – ändern erlaubt
    expect(rolleBesetzt(['design'], 'entwicklung', null)).toBe(false);
    expect(rolleBesetzt(['design'], null, null)).toBe(false);
  });

  it('wählbare Rollen: vor dem Senden die freien, nach dem Senden nur die eigene, nach dem Leeren wieder alle freien', () => {
    const waehlbar = (vergeben: string[], eigene: string | null) => netflix.rollen.map((r) => r.id).filter((r) => rolleWaehlbar(r, vergeben, eigene));
    expect(waehlbar([], null)).toStrictEqual(['produktmanagement', 'design', 'entwicklung']);
    expect(waehlbar(['produktmanagement'], null)).toStrictEqual(['design', 'entwicklung']);
    expect(waehlbar(['produktmanagement', 'design'], 'design')).toStrictEqual(['design']);
    expect(waehlbar([], null)).toHaveLength(3); // nach „Runde leeren“: eigeneRolle wieder null
  });

  it('Gruppen für „Eure Sätze“ und die Statuszeile', () => {
    expect(antwortenGruppieren(netflix.rollen, [{ rolle: 'design', text: 'a' }, { rolle: 'produktmanagement', text: 'b' }]))
      .toStrictEqual([{ label: 'Produktmanagement', texte: ['b'] }, { label: 'Design', texte: ['a'] }]);
    expect(statusText(0, 3)).toBe('Noch keine Antworten.');
    expect(statusText(1, 3)).toBe('1 von 3 hat geantwortet.');
    expect(statusText(2, 3)).toBe('2 von 3 haben geantwortet.');
    expect(statusText(3, 3)).toBe('3 haben geantwortet.');
  });
});
