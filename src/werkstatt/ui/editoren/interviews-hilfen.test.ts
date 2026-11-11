import { describe, expect, it } from 'vitest';
import { belegFehlt, belegHilfe, belegHinweis, belegUmschalten, naechstesZitat, neuesInterview, neuesZitat, waisen, zitateMitText } from './interviews-hilfen';

describe('Interview-Editor: neue Einträge', () => {
  it('neues Interview: nächste freie I-ID, Datum heute, ohne Einwilligung', () => {
    expect(neuesInterview([{ id: 'I1' }, { id: 'I3' }], '2026-10-23')).toStrictEqual({
      id: 'I4', datum: '2026-10-23', pseudonym: '', einwilligung: false, zitat: '', kurzinfos: '',
      einsichten: [], chancen: [], notizen: '', zitate: [],
    });
  });

  it('neues Zitat zählt nur die Zitate dieses Interviews weiter', () => {
    expect(neuesZitat('I2', [{ id: 'I2-1' }, { id: 'I2-3' }, { id: 'I12-9' }])).toStrictEqual({ id: 'I2-4', text: '' });
    expect(neuesZitat('I2', [])).toStrictEqual({ id: 'I2-1', text: '' });
  });

  it('überspringt IDs, auf die eine Chance noch verweist: letztes Zitat gelöscht, neues bekommt nicht dessen ID', () => {
    // I2-3 war das letzte Zitat und ist Beleg einer Chance; nach dem Löschen sind nur I2-1 und I2-2 übrig.
    expect(neuesZitat('I2', [{ id: 'I2-1' }, { id: 'I2-2' }], ['I2-1', 'I2-3'])).toStrictEqual({ id: 'I2-4', text: '' });
    expect(neuesZitat('I2', [], ['I2-2', 'I12-9'])).toStrictEqual({ id: 'I2-3', text: '' });
  });

  it('naechstesZitat (Knopf „Zitat hinzufügen“) zählt die Belege aller Chancen des Interviews mit', () => {
    const iv = { ...neuesInterview([], '2026-11-12'), id: 'I2', zitate: [{ id: 'I2-1', text: 'Ja.' }], chancen: [{ text: 'A', belege: ['I2-1'] }, { text: 'B', belege: ['I2-2'] }] };
    expect(naechstesZitat(iv)).toStrictEqual({ id: 'I2-3', text: '' });
  });
});

describe('Interview-Editor: Tipp unter „Belege“', () => {
  const MIT = 'Kreuze die Zitate an, die diese Chance stützen – ohne Zitat kein Beleg. Ein Zitat darf mehrere Chancen stützen.';

  it('ohne Zitate oder nur mit leeren: kein Tipp (der Leerzustand von BelegAuswahl sagt es schon)', () => {
    expect(belegHilfe([])).toBeUndefined();
    expect(belegHilfe([{ text: '' }, { text: '   ' }])).toBeUndefined();
  });

  it('sobald ein Zitat Text hat: Zitate ankreuzen', () => {
    expect(belegHilfe([{ text: '' }, { text: 'Wenn ich auf die Uhr schauen muss, geh ich.' }])).toBe(MIT);
  });
});

describe('Interview-Editor: Hinweis „Chance ohne Beleg“ (NDU-56)', () => {
  it('Chance mit Text und ohne Zitat-ID: Hinweis', () => {
    expect(belegFehlt({ text: 'Will nicht in der Schlange warten.', belege: [] })).toBe(true);
  });

  it('frische Zeile ohne Text (auch nur Leerzeichen): kein Hinweis', () => {
    expect(belegFehlt({ text: '', belege: [] })).toBe(false);
    expect(belegFehlt({ text: '   ', belege: [] })).toBe(false);
  });

  it('mit mindestens einer Zitat-ID: kein Hinweis', () => {
    expect(belegFehlt({ text: 'Will nicht in der Schlange warten.', belege: ['I1-2'] })).toBe(false);
  });
});

describe('Interview-Editor: Text des Beleg-Hinweises', () => {
  const MIT_ZITATEN = 'Diese Chance hat noch keinen Beleg – kreuze mindestens ein Zitat an.';
  const ohneBeleg = { text: 'Will nicht in der Schlange warten.', belege: [] };

  it('mit einem Zitat mit Text: Zitat ankreuzen', () => {
    expect(belegHinweis(ohneBeleg, [{ text: '' }, { text: 'Wenn ich auf die Uhr schauen muss, geh ich.' }])).toBe(MIT_ZITATEN);
  });

  it('ohne Zitate oder nur mit leeren: kein Hinweis (der Leerzustand von BelegAuswahl sagt es schon)', () => {
    expect(belegHinweis(ohneBeleg, [])).toBeUndefined();
    expect(belegHinweis(ohneBeleg, [{ text: '  ' }])).toBeUndefined();
  });

  it('kein Hinweis bei leerer Chance oder mit Beleg, auch ohne Zitate', () => {
    expect(belegHinweis({ text: '', belege: [] }, [])).toBeUndefined();
    expect(belegHinweis({ ...ohneBeleg, belege: ['I1-1'] }, [{ text: 'Zitat' }])).toBeUndefined();
  });
});

describe('Interview-Editor: Beleg an- und abwählen (belegUmschalten)', () => {
  const ZITATE = [{ id: 'I6-1' }, { id: 'I6-2' }, { id: 'I6-3' }];

  it('anwählen fügt hinzu', () => {
    expect(belegUmschalten([], 'I6-2', true, ZITATE)).toStrictEqual(['I6-2']);
  });

  it('abwählen entfernt nur diese ID, die anderen bleiben in ihrer Reihenfolge', () => {
    expect(belegUmschalten(['I6-3', 'I6-1', 'I6-2'], 'I6-1', false, ZITATE)).toStrictEqual(['I6-3', 'I6-2']);
  });

  it('anwählen setzt die ID an ihre Zitat-Stelle, ohne die vorhandenen umzusortieren', () => {
    expect(belegUmschalten(['I6-3'], 'I6-1', true, ZITATE)).toStrictEqual(['I6-1', 'I6-3']);
    expect(belegUmschalten(['I6-1'], 'I6-3', true, ZITATE)).toStrictEqual(['I6-1', 'I6-3']);
    // Vorhandene, unsortierte Liste: I6-3 vor I6-1 bleibt so; I6-2 kommt vor den ersten Beleg mit späterem Zitat.
    expect(belegUmschalten(['I6-3', 'I6-1'], 'I6-2', true, ZITATE)).toStrictEqual(['I6-2', 'I6-3', 'I6-1']);
  });

  it('kein Doppelter: schon gewähltes noch einmal anwählen ändert nichts', () => {
    expect(belegUmschalten(['I6-2', 'I6-1'], 'I6-2', true, ZITATE)).toStrictEqual(['I6-2', 'I6-1']);
  });

  it('Waise bleibt an ihrer Stelle stehen, bis man sie abwählt', () => {
    expect(belegUmschalten(['I6-4', 'I6-2'], 'I6-1', true, ZITATE)).toStrictEqual(['I6-4', 'I6-1', 'I6-2']);
    expect(belegUmschalten(['I6-4', 'I6-2'], 'I6-3', true, ZITATE)).toStrictEqual(['I6-4', 'I6-2', 'I6-3']);
    expect(belegUmschalten(['I6-4', 'I6-2'], 'I6-2', false, ZITATE)).toStrictEqual(['I6-4']);
    expect(belegUmschalten(['I6-4', 'I6-2'], 'I6-4', false, ZITATE)).toStrictEqual(['I6-2']);
  });
});

describe('Interview-Editor: Zitate mit Text und Waisen (eine Quelle für Editor und Hinweise)', () => {
  it('zitateMitText: nur Zitate mit Text', () => {
    expect(zitateMitText([{ id: 'I6-1', text: ' ' }, { id: 'I6-2', text: 'Ja.' }])).toStrictEqual([{ id: 'I6-2', text: 'Ja.' }]);
  });

  it('waisen: nur Belege ohne Zitat dieser ID – ein Zitat mit leerem Text gibt es noch (wie im Schema)', () => {
    expect(waisen(['I6-1', 'I6-4', 'I6-4'], [{ id: 'I6-1', text: '' }])).toStrictEqual(['I6-4']);
  });
});
