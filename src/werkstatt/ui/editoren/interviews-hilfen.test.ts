import { describe, expect, it } from 'vitest';
import { BELEG_FEHLT, belegFehlt, belegHilfe, neuesInterview, neuesZitat } from './interviews-hilfen';

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
});

describe('Interview-Editor: Tipp unter „Belege“', () => {
  const OHNE = 'Noch keine Zitate: Trag zuerst oben unter „Zitate“ ein, was die Person wörtlich gesagt hat. Dann kannst du hier ihre IDs wählen.';
  const MIT = 'Die Zitat-IDs, die diese Chance stützen – ohne ID kein Beleg.';

  it('ohne Zitate oder nur mit leeren: erst nach oben zu den Zitaten', () => {
    expect(belegHilfe([])).toBe(OHNE);
    expect(belegHilfe([{ text: '' }, { text: '   ' }])).toBe(OHNE);
  });

  it('sobald ein Zitat Text hat: die IDs als Beleg wählen', () => {
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

  it('der Hinweistext', () => {
    expect(BELEG_FEHLT).toBe('Diese Chance hat noch keinen Beleg – wähle mindestens eine Zitat-ID.');
  });
});
