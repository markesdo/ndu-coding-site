import { describe, expect, it } from 'vitest';
import { TAGE } from '../components/methoden';
import annahmen from './beispiele/annahmen.json';
import brief from './beispiele/brief.json';
import entscheidungen from './beispiele/entscheidungen.json';
import interviews from './beispiele/interviews.json';
import leitfaden from './beispiele/leitfaden.json';
import { kohorte2026 } from './kohorten/2026';
import { ARTEFAKT_NAMEN, artefaktParsen, type ArtefaktName, type DatenVon } from './schemas/index';
import { rendern } from './render/index';
import { BRIEF_TAG1_FELDER } from './statistik';
import { artefaktStand, faelligBis, faelligZuTag, inArbeitAn, INTERVIEWS_SOLL, kurstagBestimmen } from './tag-stand';

const roh = { brief, entscheidungen, leitfaden, annahmen, interviews } as const;
function laden<N extends ArtefaktName>(name: N): DatenVon<N> {
  const r = artefaktParsen(name, structuredClone(roh[name]));
  if (!r.ok) throw new Error(`${name}: Beispiel passt nicht zum Schema`);
  return r.daten;
}

describe('kurstagBestimmen (Termine der Kohorte 2026: Tag 1 am 22.10., Tag 2 offen, Tag 3 am 21.11.)', () => {
  const t = kohorte2026.termine;
  it('vor dem ersten Termin: Tag 1 als nächster', () => {
    expect(kurstagBestimmen(t, '2026-10-21')).toMatchObject({ tag: 1, datum: '2026-10-22', lage: 'naechster' });
  });
  it('am Kurstag: heute', () => {
    expect(kurstagBestimmen(t, '2026-10-22')).toMatchObject({ tag: 1, lage: 'heute', titel: TAGE[0].titel });
  });
  it('nach Tag 1, Tag 2 noch ohne Termin: nächster Termin ist Tag 3, Tag 2 steht in ohneTermin', () => {
    expect(kurstagBestimmen(t, '2026-10-30')).toStrictEqual({ tag: 3, titel: TAGE[2].titel, datum: '2026-11-21', lage: 'naechster', ohneTermin: [2] });
  });

  it('nach Datum, nicht nach Nummer: ein verschobener Tag 2 nach Tag 3 kommt an seinem Termin', () => {
    const verschoben = { ...t, tag2: '2026-11-25' };
    expect(kurstagBestimmen(verschoben, '2026-11-15')).toMatchObject({ tag: 3, lage: 'naechster', ohneTermin: [] });
    expect(kurstagBestimmen(verschoben, '2026-11-22')).toMatchObject({ tag: 2, datum: '2026-11-25', lage: 'naechster' });
  });
  it('nach dem letzten Termin, Tag 2 weiter offen: vorbei, Tag 2 in ohneTermin', () => {
    expect(kurstagBestimmen(t, '2027-02-01')).toMatchObject({ tag: 7, lage: 'vorbei', ohneTermin: [2] });
  });

  it('nur Tag 1 datiert und vorbei: Tag 2 ohne Termin ist der nächste', () => {
    expect(kurstagBestimmen({ tag1: '2026-10-22' }, '2026-10-30')).toMatchObject({ tag: 2, datum: null, lage: 'naechster', ohneTermin: [] });
  });

  it('nach dem letzten Termin: vorbei', () => {
    expect(kurstagBestimmen({ ...t, tag2: '2026-11-07' }, '2027-02-01')).toMatchObject({ tag: 7, lage: 'vorbei' });
  });
  it('gewählter Tag gewinnt; ohne Termine: Tag 1', () => {
    expect(kurstagBestimmen(t, '2026-10-21', 3)).toMatchObject({ tag: 3, datum: '2026-11-21', lage: 'gewaehlt' });
    expect(kurstagBestimmen({}, '2026-10-21')).toMatchObject({ tag: 1, datum: null, lage: 'naechster' });
  });
});

describe('Fälligkeit', () => {
  it('alle Tag-1-Artefakte und die Interviews (Hausaufgabe) sind zu Tag 2 fällig', () => {
    for (const n of ARTEFAKT_NAMEN) expect(faelligZuTag(n), n).toBe(2);
    expect(faelligBis(1, ARTEFAKT_NAMEN)).toStrictEqual([]);
    expect(faelligBis(2, ARTEFAKT_NAMEN)).toStrictEqual([...ARTEFAKT_NAMEN]);
    expect(inArbeitAn(1, ARTEFAKT_NAMEN)).toStrictEqual([...ARTEFAKT_NAMEN]);
    expect(faelligBis(2, ['brief', 'annahmen'])).toStrictEqual(['brief', 'annahmen']);
  });

  it('jedes Werkstatt-Artefakt hat einen Fälligkeitstag innerhalb des Kurses', () => {
    for (const n of ARTEFAKT_NAMEN) {
      expect(faelligZuTag(n), n).toBeGreaterThanOrEqual(1);
      expect(faelligZuTag(n), n).toBeLessThanOrEqual(TAGE.at(-1)!.n);
    }
  });
});

describe('artefaktStand', () => {
  it('volle Mappe (Kaffeebar-Beispiel): alles ausgefüllt, nichts fehlt', () => {
    for (const n of ARTEFAKT_NAMEN) {
      const s = artefaktStand(n, laden(n));
      expect(s.stand, `${n}: ${s.fehlt.join('; ')}`).toBe('ausgefuellt');
      expect(s.fehlt, n).toStrictEqual([]);
    }
    expect(artefaktStand('interviews', laden('interviews')).umfang).toBe(`5 von ${INTERVIEWS_SOLL} Snapshots`);
    expect(artefaktStand('brief', laden('brief')).umfang).toBe('6 von 6 Feldern');
  });

  it('leere Mappe: nicht angelegt oder nur Vorlage -> leer', () => {
    for (const n of ARTEFAKT_NAMEN) expect(artefaktStand(n, null)).toMatchObject({ stand: 'leer', fehlt: [] });
    const lf = laden('leitfaden');
    expect(artefaktStand('leitfaden', { ...lf, ziel: '', wen: '', abschluss: '', fragen: [] }).stand).toBe('leer');
    expect(artefaktStand('interviews', { ...laden('interviews'), interviews: [] }).stand).toBe('leer');
    expect(artefaktStand('brief', 'unlesbar').stand).toBe('unlesbar');
  });

  it('teilweise: Interviews „2 von 5 Snapshots, I2 ohne Chance“', () => {
    const d = laden('interviews');
    d.interviews = d.interviews.slice(0, 2);
    d.interviews[1].chancen = [];
    d.interviews[1].einsichten = [' '];
    expect(artefaktStand('interviews', d)).toStrictEqual({
      artefakt: 'interviews',
      titel: expect.any(String),
      stand: 'duenn',
      umfang: '2 von 5 Snapshots',
      fehlt: ['noch 3 von 5 Interviews offen', 'I2 ohne Einsicht, Chance'],
    });
  });

  it('leere Interview-Zeilen zählen nicht als Snapshot', () => {
    const d = laden('interviews');
    for (const iv of d.interviews.slice(3)) Object.assign(iv, { zitat: '', kurzinfos: '', notizen: '', einsichten: [], chancen: [], zitate: [] });
    expect(artefaktStand('interviews', d)).toMatchObject({
      stand: 'duenn',
      umfang: '3 von 5 Snapshots',
      fehlt: ['noch 2 von 5 Interviews offen', 'I4 noch leer', 'I5 noch leer'],
    });
    expect(artefaktStand('interviews', 'nicht-gelesen').stand).toBe('nicht-gelesen');
  });

  it('Interviews: nur Zitate zählen als Snapshot; nur leere Zeilen sind leer', () => {
    const d = laden('interviews');
    const leerZeile = { zitat: '', kurzinfos: '', notizen: '', einsichten: [], chancen: [], zitate: [] };
    const nurZitate = { ...d, interviews: d.interviews.map((iv, i) => (i === 0 ? { ...iv, ...leerZeile, zitate: iv.zitate } : iv)) };
    expect(artefaktStand('interviews', nurZitate).umfang).toBe('5 von 5 Snapshots');
    const alleLeer = { ...d, interviews: d.interviews.map((iv) => ({ ...iv, ...leerZeile })) };
    expect(artefaktStand('interviews', alleLeer)).toMatchObject({ stand: 'leer', umfang: '0 von 5 Snapshots', fehlt: [] });
  });

  it('leere Zeilen zählen nicht (Annahmen, Entscheidungen); Brief mit nur offenen Fragen ist nicht leer', () => {
    const a = laden('annahmen');
    expect(artefaktStand('annahmen', { ...a, annahmen: [{ ...a.annahmen[0], text: ' ' }], riskanteste: a.annahmen[0].id })).toMatchObject({ stand: 'leer', umfang: '0 Annahmen' });
    // riskanteste zeigt auf eine Annahme ohne Text: zählt als nicht markiert.
    const ohneText = { ...a, annahmen: a.annahmen.map((x) => (x.id === a.riskanteste ? { ...x, text: '' } : x)) };
    expect(artefaktStand('annahmen', ohneText).fehlt).toContain('riskanteste Annahme nicht markiert');
    const e = laden('entscheidungen');
    expect(artefaktStand('entscheidungen', { ...e, entscheidungen: [{ ...e.entscheidungen[0], entscheidung: '', grund: '' }] }).stand).toBe('leer');
    const b = laden('brief');
    const leerBrief = { ...b, fuerWen: '', problem: '', heuteGeloestDurch: '', nicht: [], outcome: { wirGlauben: '', wirMerkenEs: '' }, produktSatz: undefined, offeneFragen: [] };
    expect(artefaktStand('brief', leerBrief).stand).toBe('leer');
    expect(artefaktStand('brief', { ...leerBrief, offeneFragen: ['Wer zahlt?'] })).toMatchObject({ stand: 'duenn', fehlt: [expect.stringMatching(/^fehlt: Für wen\?/)] });
  });

  it('ersetzte Entscheidung ohne Grund ist keine offene Lücke; Einzahl und mehr Interviews als verlangt', () => {
    const e = laden('entscheidungen');
    const d1 = { ...e.entscheidungen[0], id: 'D1', grund: '' };
    const d2 = { ...e.entscheidungen[0], id: 'D2', ersetzt: 'D1', grund: 'Weil die Interviews es zeigen.' };
    delete (d1 as { ersetzt?: string }).ersetzt;
    expect(artefaktStand('entscheidungen', { ...e, entscheidungen: [d1, d2] })).toMatchObject({ stand: 'ausgefuellt', umfang: '2 Entscheidungen', fehlt: [] });
    expect(artefaktStand('entscheidungen', { ...e, entscheidungen: [d1] })).toMatchObject({ umfang: '1 Entscheidung', fehlt: ['D1 ohne Grund'] });
    const iv = laden('interviews');
    const sieben = { ...iv, interviews: [...iv.interviews, { ...iv.interviews[0], id: 'I6', zitate: [] }, { ...iv.interviews[0], id: 'I7', zitate: [] }] };
    expect(artefaktStand('interviews', sieben).umfang).toBe('7 Snapshots (5 verlangt)');
  });

  it('Brief-Feldnamen stehen so im gerenderten Brief', () => {
    const md = rendern('brief', laden('brief'));
    for (const f of BRIEF_TAG1_FELDER) expect(md, f.name).toContain(f.name);
  });

  it('Leitfaden: nur Abschluss ist schon etwas Eigenes; eine leere Frage-Zeile nicht', () => {
    const lf = laden('leitfaden');
    const nichts = { ...lf, ziel: '', wen: '', abschluss: '', fragen: [] };
    expect(artefaktStand('leitfaden', { ...nichts, abschluss: 'Danke!' })).toMatchObject({ stand: 'duenn', fehlt: ['Ziel fehlt', '„Wen“ fehlt', 'keine Kernfragen', 'keine Nachfragen'] });
    expect(artefaktStand('leitfaden', { ...nichts, fragen: [{ id: 'F1', text: ' ', art: 'kern' as const }] }).stand).toBe('leer');
  });

  it('teilweise: Brief, Annahmen, Leitfaden, Entscheidungen nennen, was fehlt', () => {
    const b = laden('brief');
    b.problem = '';
    b.nicht = ['Keine Lieferung'];
    expect(artefaktStand('brief', b)).toMatchObject({ stand: 'duenn', umfang: '5 von 6 Feldern', fehlt: ['fehlt: Welches Problem?', '„Was macht es NICHT?“: 1 von 3'] });

    const a = laden('annahmen');
    a.annahmen = a.annahmen.filter((x) => x.art !== 'machbar' && x.id !== a.riskanteste);
    delete a.riskanteste;
    // Ohne die machbare und ohne die riskanteste Annahme (im Beispiel A1, wünschenswert) fehlen beide Arten.
    expect(artefaktStand('annahmen', a)).toMatchObject({
      stand: 'duenn',
      fehlt: ['keine Annahme der Art: wünschenswert, machbar', 'riskanteste Annahme nicht markiert'],
    });

    const l = laden('leitfaden');
    l.ziel = '';
    l.fragen = l.fragen.filter((f) => f.art === 'kern');
    expect(artefaktStand('leitfaden', l)).toMatchObject({ stand: 'duenn', fehlt: ['Ziel fehlt', 'keine Nachfragen'] });

    const e = laden('entscheidungen');
    // Die letzte Zeile ersetzt keine andere und wird von keiner ersetzt: eine offene Lücke.
    const letzte = e.entscheidungen.at(-1)!;
    letzte.grund = '';
    expect(artefaktStand('entscheidungen', e).fehlt).toStrictEqual([`${letzte.id} ohne Grund`]);
  });
});
