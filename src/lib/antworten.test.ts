import { describe, expect, it } from 'vitest';
import {
  EINGABE_STANDARD, MAX_TEXT, RUNDEN, antwortenGruppieren, betrifftRunde, eingabePruefen, eingabeTexte, gesendetGilt, platzSchluessel, rolleBesetzt, rollePruefen, rolleWaehlbar,
  geraetPruefen, platzBesetzt, rundePruefen, standBauen, statusText, textBereinigen, textPruefen, texteFrei, wahlFestText,
} from './antworten';

const netflix = RUNDEN.netflix;
const zwoelf = RUNDEN.zwoelf;
const rueckblick = RUNDEN.rueckblick;

// Wie die Rollen-Wahl heißt (nur Netflix).
const ROLLEN_WAHL = {
  wahl: 'Deine Rolle',
  wahlFehlt: 'Bitte zuerst deine Rolle wählen.',
  wahlBesetzt: 'Diese Rolle hat schon jemand – wählt eine andere.',
  wahlFest: 'deine Rolle ist {label} – ändern kannst du deine Antwort, nicht die Rolle.',
  aufgedeckt: 'Aufgedeckt – eure Sätze stehen auf der nächsten Folie.',
  gesendet: 'Gesendet – du kannst bis zum Aufdecken noch ändern.',
  rueckfall: 'Antwort bitte laut sagen.',
};

describe('Antwortrunde: Eingabe prüfen', () => {
  it('Runde nur aus der Liste des Servers', () => {
    expect(rundePruefen('netflix')).toBe(netflix);
    expect(rundePruefen('zwoelf')).toBe(zwoelf);
    expect(Object.keys(RUNDEN)).toEqual(expect.arrayContaining(['netflix', 'zwoelf']));
    expect(rundePruefen('zwölf')).toBeNull();
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

  it('Runde „zwoelf“ (Baum): eigene Kennung, drei neutrale Plätze statt der Netflix-Rollen', () => {
    expect(zwoelf.kennung).toBe('zwoelf');
    expect(zwoelf.rollen).toStrictEqual([
      { id: 'p1', label: 'Platz 1' }, { id: 'p2', label: 'Platz 2' }, { id: 'p3', label: 'Platz 3' },
    ]);
    expect(rollePruefen(zwoelf, 'p3')).toBe('p3');
    expect(rollePruefen(zwoelf, 'design')).toBeNull();
    expect(rollePruefen(zwoelf, 'person-1')).toBeNull();
    expect(eingabePruefen({ runde: 'zwoelf', rolle: 'p2', text: ' 3 – Suche fehlt ' }))
      .toStrictEqual({ runde: 'zwoelf', konfig: zwoelf, rolle: 'p2', text: '3 – Suche fehlt', geraet: null });
    expect(eingabePruefen({ runde: 'zwoelf', rolle: 'p2', text: 'x'.repeat(121) })).toBeNull();
    // Netflix behält die Rollen.
    expect(netflix.rollen.map((r) => r.id)).toStrictEqual(['produktmanagement', 'design', 'entwicklung']);
  });

  it('Texte der Eingabe: Netflix wie bisher, „zwoelf“ fragt nach drei Nummern, ohne „Rolle“', () => {
    expect(eingabeTexte(netflix)).toStrictEqual({
      label: 'Ein Satz aus deiner Rolle', hinweis: 'erst deine Rolle wählen, dann einen Satz abschicken.', platzhalter: '',
      ...ROLLEN_WAHL,
    });
    expect(eingabeTexte(netflix)).toStrictEqual(EINGABE_STANDARD);
    expect(eingabeTexte(zwoelf)).toStrictEqual({
      label: 'Drei Nummern (1 oder 2, 7 oder 12, 9 oder 11) und ein Satz: Welches Paar fiel am schwersten?',
      hinweis: 'erst einen Platz wählen, dann Nummern und Satz abschicken.',
      platzhalter: 'z. B. 2, 7, 11 – bei 9 oder 11 …',
      wahl: 'Dein Platz',
      wahlFehlt: 'Bitte zuerst einen Platz wählen.',
      wahlBesetzt: 'Diesen Platz hat schon jemand – wählt einen anderen.',
      wahlFest: 'du hast {label} – ändern kannst du deine Antwort, nicht den Platz.',
      aufgedeckt: ROLLEN_WAHL.aufgedeckt,
      gesendet: ROLLEN_WAHL.gesendet,
      rueckfall: ROLLEN_WAHL.rueckfall,
    });
    expect(Object.values(eingabeTexte(zwoelf)).filter((x) => /Rolle/.test(x))).toStrictEqual([]);
    // Teilweise eigene Texte: der Rest kommt vom Standard.
    expect(eingabeTexte({ ...zwoelf, eingabe: { label: 'X' } })).toStrictEqual({ ...EINGABE_STANDARD, label: 'X' });
  });

  it('Runde „rueckblick“ (Abschluss Tag 2): drei neutrale Plätze statt Rollen, eigene Texte ohne „Rolle“', () => {
    expect(rundePruefen('rueckblick')).toBe(rueckblick);
    expect(rueckblick.kennung).toBe('rueckblick');
    expect(rueckblick.rollen).toStrictEqual([
      { id: 'p1', label: 'Platz 1' }, { id: 'p2', label: 'Platz 2' }, { id: 'p3', label: 'Platz 3' },
    ]);
    expect(rollePruefen(rueckblick, 'p3')).toBe('p3');
    expect(rollePruefen(rueckblick, 'design')).toBeNull();
    expect(eingabePruefen({ runde: 'rueckblick', rolle: 'p2', text: ' Tief: Link gesucht ' }))
      .toStrictEqual({ runde: 'rueckblick', konfig: rueckblick, rolle: 'p2', text: 'Tief: Link gesucht', geraet: null });
    expect(eingabePruefen({ runde: 'rueckblick', rolle: 'p1', text: 'x'.repeat(121) })).toBeNull();
    const t = eingabeTexte(rueckblick);
    expect(t).toStrictEqual({
      label: 'Ein Satz, beginnt mit ‚Hoch:‘ oder ‚Tief:‘',
      hinweis: 'erst einen Platz wählen, dann deinen Satz abschicken.',
      platzhalter: 'Tief: … – ich habe gerade …',
      wahl: 'Dein Platz',
      wahlFehlt: 'Bitte zuerst einen Platz wählen.',
      wahlBesetzt: 'Diesen Platz hat schon jemand – wählt einen anderen.',
      wahlFest: 'du hast {label} – ändern kannst du deine Antwort, nicht den Platz.',
      aufgedeckt: 'Danke – die Runde ist zu. Eure Sätze liest Markus nach dem Kurs.',
      // Kein Aufdecken im Raum: ändern bis 18:15; Server weg – einfach weiter, nicht laut sammeln.
      gesendet: 'Gesendet – du kannst bis 18:15 noch ändern.',
      rueckfall: 'Geht gerade nicht – kein Problem, weiter geht’s.',
    });
    expect(Object.values(t).filter((x) => /Rolle/.test(x))).toStrictEqual([]);
    expect(wahlFestText(t, 'Platz 2')).toBe('du hast Platz 2 – ändern kannst du deine Antwort, nicht den Platz.');
    expect(wahlFestText(eingabeTexte(netflix), 'Design')).toBe('deine Rolle ist Design – ändern kannst du deine Antwort, nicht die Rolle.');
  });

  it('anonyme Browser-Kennung: optional (alte Seite), sonst 8–64 Zeichen aus A–Z, a–z, 0–9, _ und -', () => {
    expect(geraetPruefen(undefined)).toBeNull();
    expect(geraetPruefen(null)).toBeNull();
    expect(geraetPruefen('a1b2c3d4-e5f6')).toBe('a1b2c3d4-e5f6');
    expect(geraetPruefen('kurz')).toBeUndefined();
    expect(geraetPruefen('x'.repeat(65))).toBeUndefined();
    expect(geraetPruefen('<script>xx')).toBeUndefined();
    expect(geraetPruefen(12345678)).toBeUndefined();
    expect(eingabePruefen({ runde: 'rueckblick', rolle: 'p1', text: 'Hoch: x', geraet: 'abcdefgh' }))
      .toStrictEqual({ runde: 'rueckblick', konfig: rueckblick, rolle: 'p1', text: 'Hoch: x', geraet: 'abcdefgh' });
    expect(eingabePruefen({ runde: 'rueckblick', rolle: 'p1', text: 'Hoch: x', geraet: 'kurz' })).toBeNull();
  });

  it('Platz besetzt nur, wenn ein anderer Browser ihn mit Kennung hält', () => {
    const von = (geraet: string | null) => ({ text: 'x', zeit: 1, geraet });
    expect(platzBesetzt(null, 'aaaaaaaa')).toBe(false);
    expect(platzBesetzt(von('aaaaaaaa'), 'aaaaaaaa')).toBe(false);
    expect(platzBesetzt(von('aaaaaaaa'), 'bbbbbbbb')).toBe(true);
    expect(platzBesetzt(von('aaaaaaaa'), null)).toBe(true);
    expect(platzBesetzt(von(null), 'bbbbbbbb')).toBe(false);
    // Die Kennung geht nie an die Seite: standBauen gibt nur Rolle und Text heraus.
    expect(standBauen(rueckblick, [von('aaaaaaaa'), null, null], true))
      .toStrictEqual({ anzahl: 1, vergeben: ['p1'], frei: true, antworten: [{ rolle: 'p1', text: 'x' }] });
  });

  it('Body: alles oder nichts', () => {
    expect(eingabePruefen({ runde: 'netflix', rolle: 'design', text: ' Suche fehlt ' }))
      .toStrictEqual({ runde: 'netflix', konfig: netflix, rolle: 'design', text: 'Suche fehlt', geraet: null });
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
    // Eigene Plätze pro Runde: „zwoelf“ überschreibt die Netflix-Sätze nicht.
    expect(platzSchluessel('zwoelf', 'p1', spaet)).toBe('antwort:2026-11-12:zwoelf:p1');
  });

  it('frei erst nach dem Aufdecken oder ab der Rückfall-Uhrzeit', () => {
    const vorher = new Date('2026-11-12T13:30:00Z'); // 14:30 Wien
    expect(texteFrei(netflix, false, vorher)).toBe(false);
    expect(texteFrei(netflix, true, vorher)).toBe(true);
    expect(texteFrei(netflix, false, new Date('2026-11-12T17:00:00Z'))).toBe(false); // 18:00 Wien: Kursende, noch zu
    expect(texteFrei(netflix, false, new Date('2026-11-12T22:59:00Z'))).toBe(true); // 23:59 Wien = NACH_NETFLIX
  });

  it('Rückfall beider Runden: Ende von Tag 2, nicht Kursende – Verspätung schließt die Eingabe nicht', () => {
    expect(netflix.ab).toBe('2026-11-12T23:59');
    expect(zwoelf.ab).toBe(netflix.ab);
    // Rückblick: kein Aufdecken im Raum, lesbar ab Kursende (18:15 Wien), nicht erst um Mitternacht.
    expect(rueckblick.ab).toBe('2026-11-12T18:15');
  });

  it('„rueckblick“: eigene Plätze und eigenes Aufdecken – andere Runden öffnen sie nicht', () => {
    const imAbschluss = new Date('2026-11-12T16:55:00Z'); // 17:55 Wien
    expect(platzSchluessel('rueckblick', 'p1', imAbschluss)).toBe('antwort:2026-11-12:rueckblick:p1');
    expect(texteFrei(rueckblick, false, imAbschluss)).toBe(false);
    expect(texteFrei(rueckblick, true, imAbschluss)).toBe(true);
    expect(texteFrei(rueckblick, false, new Date('2026-11-12T17:14:00Z'))).toBe(false); // 18:14 Wien
    expect(texteFrei(rueckblick, false, new Date('2026-11-12T17:15:00Z'))).toBe(true); // 18:15 Wien = NACH_RUECKBLICK_TAG_2
    expect(betrifftRunde(rueckblick, 'zwoelf')).toBe(false);
    expect(betrifftRunde(rueckblick, 'rueckblick')).toBe(true);
  });

  it('„zwoelf“: zu bis zum eigenen Aufdecken oder bis zum Ende des Kurstags – Netflix aufdecken öffnet sie nicht', () => {
    const imBlock = new Date('2026-11-12T15:40:00Z'); // 16:40 Wien, Baum läuft
    expect(texteFrei(zwoelf, false, imBlock)).toBe(false);
    expect(texteFrei(zwoelf, true, imBlock)).toBe(true);
    expect(texteFrei(zwoelf, false, new Date('2026-11-12T17:30:00Z'))).toBe(false); // 18:30 Wien, Tag 2 verspätet
    expect(texteFrei(zwoelf, false, new Date('2026-11-12T22:59:00Z'))).toBe(true); // 23:59 Wien = NACH_ZWOELF
  });

  it('nach gemeldetem Aufdecken nur die eigene Runde sofort neu fragen', () => {
    expect(betrifftRunde(zwoelf, 'zwoelf')).toBe(true);
    expect(betrifftRunde(netflix, 'zwoelf')).toBe(false);
    expect(betrifftRunde(zwoelf, '/innolab/methoden/baum:Auflösung zeigen')).toBe(false);
    expect(betrifftRunde(zwoelf, undefined)).toBe(false);
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
