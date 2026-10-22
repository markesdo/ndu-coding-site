import { describe, expect, it } from 'vitest';
import { abgehakt, altesFormat, haekchenLesen, haekchenSetzen } from './checkliste-stand';

const IDS = ['a-eins', 'a-zwei', 'a-drei'];

describe('Häkchen der Checkliste', () => {
  it('ohne ids: Array je Position wie bisher', () => {
    const h = haekchenLesen('[true,false,true]');
    expect(h).toStrictEqual([true, false, true]);
    expect(haekchenSetzen(h, 1, true)).toStrictEqual([true, true, true]);
  });

  it('mit ids: ein altes Array wird einmal nach Position übernommen und gleich zurückgeschrieben', () => {
    expect(haekchenLesen('[true,false,true]', IDS)).toStrictEqual({ 'a-eins': true, 'a-drei': true });
    expect(altesFormat('[true,false,true]', IDS)).toBe(true);
    expect(altesFormat('{"a-eins":true}', IDS)).toBe(false);
    expect(altesFormat('[true]', undefined)).toBe(false);
    expect(altesFormat(null, IDS)).toBe(false);
    expect(altesFormat('{kaputt', IDS)).toBe(false);
  });

  it('mit ids: das Häkchen bleibt am Punkt, wenn die Liste umsortiert wird', () => {
    let h = haekchenLesen(null, IDS);
    h = haekchenSetzen(h, 1, true, IDS);
    const gespeichert = JSON.stringify(h);
    const umsortiert = ['a-zwei', 'a-drei', 'a-eins'];
    const neu = haekchenLesen(gespeichert, umsortiert);
    expect(umsortiert.map((_, i) => abgehakt(neu, i, umsortiert))).toStrictEqual([true, false, false]);
  });

  it('mit ids: Abhaken entfernt, gestrichene IDs fallen beim nächsten Klick weg, Kaputtes gilt als leer', () => {
    const h = haekchenLesen(JSON.stringify({ 'a-eins': true, 'a-weg': true, 'a-zwei': 'ja' }), IDS);
    expect(h).toStrictEqual({ 'a-eins': true, 'a-weg': true });
    expect(haekchenSetzen(h, 0, false, IDS)).toStrictEqual({});
    expect(haekchenLesen('{kaputt', IDS)).toStrictEqual({});
    expect(haekchenLesen('"text"', IDS)).toStrictEqual({});
  });
});
