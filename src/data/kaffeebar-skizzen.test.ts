import { describe, expect, it } from 'vitest';
import KAFFEEBAR_INTERVIEWS from '../werkstatt/beispiele/interviews.json';
import { NOTIZEN_JOURNEY_MAP } from './begleiter/journey-map';
import { GRUPPEN, SKIZZEN, skizzenFehler, zaehlung, type Skizze } from './kaffeebar-skizzen';

const IDS = new Set(KAFFEEBAR_INTERVIEWS.interviews.flatMap((iv) => iv.zitate.map((z) => z.id)));

describe('Kaffeebar-Skizzen (Experience Map, Folien „gruppieren“ und „beispiel“)', () => {
  it('die echten Skizzen sind fehlerfrei', () => {
    expect(skizzenFehler(SKIZZEN, IDS)).toStrictEqual([]);
  });

  it('erkennt fremde ID, ID in der falschen Reihe, Notiz mit ID und Sticky ohne beides', () => {
    const kaputt: Skizze[] = [{ i: 'I3', stickies: [
      { t: 'gibt es nicht', id: 'I3-99' },
      { t: 'aus I2', id: 'I2-4' },
      { t: 'Notiz mit ID', id: 'I3-1', notiz: true },
      { t: 'nichts' },
    ] }];
    expect(skizzenFehler(kaputt, IDS)).toStrictEqual([
      'I3: I3-99 fehlt in werkstatt/beispiele/interviews.json',
      'I3: I2-4 gehört zu einer anderen Geschichte',
      'I3: Notiz „Notiz mit ID“ trägt eine ID (I3-1)',
      'I3: „nichts“ hat weder Zitat-ID noch notiz',
    ]);
  });

  it('Zählung: Geschichten, nicht Stickies; Notizen zählen nicht', () => {
    expect(GRUPPEN.map(({ g }) => zaehlung(g))).toStrictEqual(['3 von 5', '3 von 5', '2 von 5', '1 von 5']);
  });

  it('die Verständnisfrage im Begleiter nennt dieselbe Zählung der Halle wie die Folie', () => {
    const v = NOTIZEN_JOURNEY_MAP.gruppieren?.verstaendnis;
    expect(v?.frage).toContain(`„${zaehlung('a')}“`);
    const halle = SKIZZEN.flatMap((s) => s.stickies.filter((st) => st.g === 'a'));
    expect(v?.frage).toContain(`${['null', 'einen', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben'][halle.length]} Stickies`);
  });
});
