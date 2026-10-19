import { describe, expect, it } from 'vitest';
import type { Zahlen } from '../vertrag';
import { kacheln, personZeile } from './zahlen-anzeige';

const Z: Zahlen = {
  kohorte: 'test',
  briefFelderGesamt: 6,
  personen: [
    { kuerzel: 'sofie', briefFelder: 6, entscheidungen: 3, annahmen: 8, fragen: 9, unlesbar: [] },
    { kuerzel: 'jonas', briefFelder: 4, entscheidungen: 2, annahmen: 5, fragen: 7, unlesbar: ['leitfaden'] },
    { kuerzel: 'mira', briefFelder: 0, entscheidungen: 0, annahmen: 0, fragen: 0, unlesbar: [], fehler: true },
  ],
};

describe('Zahlen-Anzeige', () => {
  it('summiert über die Gruppe; Brief gegen alle möglichen Felder', () => {
    expect(kacheln(Z).map((k) => k.zahl)).toStrictEqual(['13', '16', '5', '10 / 18']);
  });

  it('eine Zeile pro Person, Fehler und unlesbare Dateien sichtbar', () => {
    expect(Z.personen.map((p) => personZeile(p, 6))).toStrictEqual([
      'sofie: Brief 6/6 · 8 Annahmen · 9 Fragen · 3 Entscheidungen',
      'jonas: Brief 4/6 · 5 Annahmen · 7 Fragen · 2 Entscheidungen (nicht lesbar: leitfaden)',
      'mira: Mappe gerade nicht lesbar',
    ]);
  });
});
