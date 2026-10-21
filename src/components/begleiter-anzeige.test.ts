import { describe, expect, it } from 'vitest';
import { anzeige, type Zustand } from './begleiter-anzeige';

const folgt: Zustand = { index: 2, folgen: true, meldung: 'ok' };
const vonHand: Zustand = { index: 2, folgen: false, meldung: 'keine-verbindung' };

describe('anzeige (Begleiter)', () => {
  it('folgt einer Beamer-Position', () => {
    expect(anzeige(folgt, { art: 'position', index: 5 })).toStrictEqual({ index: 5, folgen: true, meldung: 'ok' });
    expect(anzeige({ ...folgt, meldung: 'keine-verbindung' }, { art: 'position', index: 2 })).toStrictEqual({ index: 2, folgen: true, meldung: 'ok' });
  });
  it('springt beim Blättern von Hand nicht um, wenn der Beamer weiterzieht', () => {
    expect(anzeige(vonHand, { art: 'position', index: 5 })).toStrictEqual(vonHand);
    expect(anzeige(vonHand, { art: 'fehler' })).toStrictEqual(vonHand);
    expect(anzeige(vonHand, { art: 'leer' })).toStrictEqual(vonHand);
    expect(anzeige(vonHand, { art: 'position', index: null })).toStrictEqual(vonHand);
  });
  it('Beamer nicht auf Tag 1: Meldung, Folie bleibt', () => {
    expect(anzeige(folgt, { art: 'position', index: null })).toStrictEqual({ index: 2, folgen: true, meldung: 'nicht-tag-1' });
  });
  it('API nicht erreichbar: Meldung, Folie bleibt, Folgen läuft weiter', () => {
    expect(anzeige(folgt, { art: 'fehler' })).toStrictEqual({ index: 2, folgen: true, meldung: 'keine-verbindung' });
  });
  it('keine Position gemeldet', () => {
    expect(anzeige(folgt, { art: 'leer' })).toStrictEqual({ index: 2, folgen: true, meldung: 'keine-position' });
  });
  it('Blättern pausiert das Folgen', () => {
    expect(anzeige(folgt, { art: 'blaettern', index: 7 })).toStrictEqual({ index: 7, folgen: false, meldung: 'ok' });
  });
  it('„Dem Beamer folgen“ schaltet das Folgen wieder ein und vergisst die alte Meldung, bis der Beamer antwortet', () => {
    expect(anzeige(vonHand, { art: 'folgen' })).toStrictEqual({ index: 2, folgen: true, meldung: 'frage' });
    expect(anzeige(anzeige(vonHand, { art: 'folgen' }), { art: 'position', index: 4 })).toStrictEqual({ index: 4, folgen: true, meldung: 'ok' });
  });
});
