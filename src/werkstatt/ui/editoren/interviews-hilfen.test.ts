import { describe, expect, it } from 'vitest';
import { neuesInterview, neuesZitat } from './interviews-hilfen';

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
