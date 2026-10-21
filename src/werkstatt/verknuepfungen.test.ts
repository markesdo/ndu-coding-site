import { describe, expect, it } from 'vitest';
import annahmenRoh from './beispiele/annahmen.json';
import briefRoh from './beispiele/brief.json';
import entscheidungenRoh from './beispiele/entscheidungen.json';
import interviewsRoh from './beispiele/interviews.json';
import leitfadenRoh from './beispiele/leitfaden.json';
import { artefaktParsen, type ArtefaktName, type DatenVon } from './schemas/index';
import { verknuepfungenPruefen, verknuepfungenText, type MappeDaten } from './verknuepfungen';

function geparst<N extends ArtefaktName>(name: N, roh: unknown): DatenVon<N> {
  const p = artefaktParsen(name, roh);
  if (!p.ok) throw new Error(JSON.stringify(p.fehler));
  return p.daten;
}

// Kaffeebar-Mappe; jeder Test ändert eine Kopie.
function kaffeebar(): MappeDaten & { [K in ArtefaktName]: DatenVon<K> } {
  return {
    brief: geparst('brief', structuredClone(briefRoh)),
    entscheidungen: geparst('entscheidungen', structuredClone(entscheidungenRoh)),
    leitfaden: geparst('leitfaden', structuredClone(leitfadenRoh)),
    annahmen: geparst('annahmen', structuredClone(annahmenRoh)),
    interviews: geparst('interviews', structuredClone(interviewsRoh)),
  };
}

// Die Kaffeebar hat eine Lücke mit Absicht: A2 und A4 stehen auf „getan“ ohne Quelle (Begleiter: „nachfragen“).
const KAFFEEBAR_BEFUNDE = ['A2', 'A4'].map((id) => ({
  art: 'fehlender-beleg', artefakt: 'annahmen', ort: id, text: `${id} hat die Belegstufe „getan“, nennt aber keine Quelle als Beleg. Wo liegt das beobachtete Verhalten?`,
}));

describe('verknuepfungenPruefen', () => {
  it('Kaffeebar: Beleg-IDs aus Entscheidungslog (I2-4, I1 …) werden aufgelöst; Befund nur für „getan“ ohne Quelle', () => {
    expect(verknuepfungenPruefen(kaffeebar())).toStrictEqual({
      befunde: KAFFEEBAR_BEFUNDE,
      geprueft: ['brief', 'entscheidungen', 'annahmen', 'leitfaden', 'interviews'],
      fehlen: [],
      unlesbar: [],
    });
  });

  it('unbekannte IDs: fehlendes Zitat, fehlendes Interview, fehlende Annahme, späterer Kurstag', () => {
    const m = kaffeebar();
    m.annahmen.annahmen[0].belegIds = ['I2-9', 'I7', 'A9', 'T1'];
    m.annahmen.annahmen[0].beleg = 'gesagt';
    expect(verknuepfungenPruefen(m).befunde.filter((b) => b.art === 'unbekannte-id')).toStrictEqual([
      { art: 'unbekannte-id', artefakt: 'annahmen', ort: 'A1', id: 'I2-9', text: 'A1 nennt I2-9 als Beleg. I2 hat kein Zitat I2-9.' },
      { art: 'unbekannte-id', artefakt: 'annahmen', ort: 'A1', id: 'I7', text: 'A1 nennt I7 als Beleg. In „Interviews und Snapshots“ gibt es I7 nicht.' },
      { art: 'unbekannte-id', artefakt: 'annahmen', ort: 'A1', id: 'A9', text: 'A1 nennt A9 als Beleg. In „Annahmen-Map“ gibt es A9 nicht.' },
      { art: 'unbekannte-id', artefakt: 'annahmen', ort: 'A1', id: 'T1', text: 'A1 nennt T1 als Beleg. T1 gehört zu einem späteren Kurstag; in der Mappe gibt es das noch nicht.' },
    ]);
  });

  it('Zitat eines Interviews, das es nicht gibt: „gibt es nicht“, nicht „hat kein Zitat“', () => {
    const m = kaffeebar();
    m.entscheidungen.entscheidungen[3].belegIds = ['I8-1'];
    expect(verknuepfungenPruefen(m).befunde.find((b) => b.id === 'I8-1')?.text).toBe('D4 nennt I8-1 als Beleg. In „Interviews und Snapshots“ gibt es I8-1 nicht.');
  });

  it('Interviews noch nicht gespeichert: Beleg-IDs sind unbekannt, mit eigenem Satz; keine Verwaist-Befunde', () => {
    const m: MappeDaten = { ...kaffeebar(), interviews: null };
    const v = verknuepfungenPruefen(m);
    expect(v.fehlen).toStrictEqual(['interviews']);
    expect(v.befunde.find((b) => b.id === 'I2-4')).toStrictEqual({
      art: 'unbekannte-id', artefakt: 'entscheidungen', ort: 'D4', id: 'I2-4', text: 'D4 nennt I2-4 als Beleg. „Interviews und Snapshots“ ist noch nicht gespeichert, I2-4 gibt es darum noch nicht.',
    });
    expect(v.befunde.some((b) => b.art === 'verwaist')).toBe(false);
  });

  it('Interviews unlesbar: I-Verweise werden nicht als unbekannt gemeldet (nicht prüfbar), sondern die Datei als unlesbar', () => {
    const v = verknuepfungenPruefen({ ...kaffeebar(), interviews: 'unlesbar' });
    expect(v.unlesbar).toStrictEqual(['interviews']);
    expect(v.geprueft).not.toContain('interviews');
    expect(v.befunde).toStrictEqual(KAFFEEBAR_BEFUNDE);
  });

  it('fehlender Beleg im Entscheidungslog: hohe Stufe ohne IDs und ohne Notiz; mit Notiz still; ersetzte Zeile still', () => {
    const m = kaffeebar();
    const [d1, d2] = m.entscheidungen.entscheidungen;
    delete d2.belegNotiz;
    // D1 wird von D3 ersetzt: Geschichte, kein Befund, auch mit hoher Stufe.
    d1.beleg = 'getan';
    const befunde = verknuepfungenPruefen(m).befunde.filter((b) => b.artefakt === 'entscheidungen');
    expect(befunde).toStrictEqual([
      { art: 'fehlender-beleg', artefakt: 'entscheidungen', ort: 'D2', text: 'D2 hat die Belegstufe „getan“, nennt aber weder eine ID noch eine Notiz zum Beleg.' },
    ]);
  });

  it('Annahme: „gesagt“ oder „erzählt“ ohne Interview-Beleg ist ein Befund, „noch keiner“ nicht', () => {
    const m = kaffeebar();
    m.annahmen.annahmen[0].beleg = 'gesagt';
    m.annahmen.annahmen[2].beleg = 'erzaehlt';
    m.annahmen.annahmen[1].belegIds = ['D1'];
    m.annahmen.annahmen[3].belegIds = ['D1'];
    expect(verknuepfungenPruefen(m).befunde).toStrictEqual([
      { art: 'fehlender-beleg', artefakt: 'annahmen', ort: 'A1', text: 'A1 hat die Belegstufe „gesagt“, nennt aber kein Interview oder Zitat als Beleg.' },
      { art: 'fehlender-beleg', artefakt: 'annahmen', ort: 'A3', text: 'A3 hat die Belegstufe „erzählt“, nennt aber kein Interview oder Zitat als Beleg.' },
    ]);
  });

  it('Annahme „gesagt“ oder „erzählt“: ein Verweis auf eine Entscheidung (D1) ersetzt kein Interview', () => {
    const m = kaffeebar();
    const [a1, a2, a3, a4] = m.annahmen.annahmen;
    a1.beleg = 'gesagt';
    a1.belegIds = ['D1'];
    a3.beleg = 'erzaehlt';
    a3.belegIds = ['D1', 'I2-4'];
    a2.belegIds = ['D1'];
    a4.belegIds = ['D1'];
    expect(verknuepfungenPruefen(m).befunde).toStrictEqual([
      { art: 'fehlender-beleg', artefakt: 'annahmen', ort: 'A1', text: 'A1 hat die Belegstufe „gesagt“, nennt aber kein Interview oder Zitat als Beleg.' },
    ]);
  });

  it('Annahme „getan“: ohne jede Quelle ein Befund, mit einer ID (auch D1) still', () => {
    const m = kaffeebar();
    m.annahmen.annahmen[1].belegIds = ['D1'];
    expect(verknuepfungenPruefen(m).befunde).toStrictEqual(KAFFEEBAR_BEFUNDE.filter((b) => b.ort === 'A4'));
  });

  it('Annahme „getan“ mit Beleg-Notiz (Quelle außerhalb der Mappe) ist still, ohne Notiz bleibt der Befund', () => {
    const m = kaffeebar();
    m.annahmen.annahmen[1].belegNotiz = 'Kassendaten September';
    expect(verknuepfungenPruefen(m).befunde).toStrictEqual(KAFFEEBAR_BEFUNDE.filter((b) => b.ort === 'A4'));
  });

  it('Annahme „gesagt“ oder „erzählt“: eine Beleg-Notiz allein ersetzt kein Interview', () => {
    const m = kaffeebar();
    const [a1, a2, a3, a4] = m.annahmen.annahmen;
    a1.beleg = 'gesagt';
    a1.belegNotiz = 'Gespräch am Bahnsteig';
    a3.beleg = 'erzaehlt';
    a3.belegNotiz = 'Umfrage Oktober';
    a2.belegNotiz = 'Kassendaten September';
    a4.belegNotiz = 'Strichliste';
    expect(verknuepfungenPruefen(m).befunde).toStrictEqual([
      { art: 'fehlender-beleg', artefakt: 'annahmen', ort: 'A1', text: 'A1 hat die Belegstufe „gesagt“, nennt aber kein Interview oder Zitat als Beleg.' },
      { art: 'fehlender-beleg', artefakt: 'annahmen', ort: 'A3', text: 'A3 hat die Belegstufe „erzählt“, nennt aber kein Interview oder Zitat als Beleg.' },
    ]);
  });

  it('Unternummer an einer Nicht-Interview-ID (D1-2): „gibt es nicht“, nicht „hat kein Zitat“', () => {
    const m = kaffeebar();
    m.entscheidungen.entscheidungen[3].belegIds = ['D1-2'];
    expect(verknuepfungenPruefen(m).befunde.find((b) => b.id === 'D1-2')?.text).toBe('D4 nennt D1-2 als Beleg. In „Entscheidungslog“ gibt es D1-2 nicht.');
  });

  it('nur Interviews gespeichert (Hausaufgabe am ersten Abend): noch nichts verwaist', () => {
    const v = verknuepfungenPruefen({ ...kaffeebar(), brief: null, entscheidungen: null, annahmen: null, leitfaden: null });
    expect(v.befunde).toStrictEqual([]);
  });

  it('Belegstufe „noch keiner“ ohne IDs ist kein fehlender Beleg', () => {
    const m = kaffeebar();
    for (const a of m.annahmen.annahmen) { a.beleg = 'keiner'; a.belegIds = []; }
    expect(verknuepfungenPruefen(m).befunde).toStrictEqual([]);
  });

  it('Chance ohne Zitat als Beleg', () => {
    const m = kaffeebar();
    m.interviews.interviews[1].chancen[0].belege = [];
    expect(verknuepfungenPruefen(m).befunde.filter((b) => b.artefakt === 'interviews')).toStrictEqual([
      { art: 'fehlender-beleg', artefakt: 'interviews', ort: 'I2 · Chance 1', text: 'I2 · Chance 1 hat kein Zitat als Beleg.' },
    ]);
  });

  it('verwaist: Interview, das kein Beleg nennt; ein Zitat-Verweis zählt für das Interview', () => {
    const m = kaffeebar();
    // D3 nennt I1 bis I5; ohne D3 nennt nur noch D4 die Interviews I2, I3, I5 über Zitate.
    m.entscheidungen.entscheidungen[2].belegIds = [];
    m.entscheidungen.entscheidungen[2].beleg = 'keiner';
    expect(verknuepfungenPruefen(m).befunde.filter((b) => b.art === 'verwaist')).toStrictEqual([
      { art: 'verwaist', artefakt: 'interviews', ort: 'I1', id: 'I1', text: 'I1 wird weder im Entscheidungslog noch in der Annahmen-Map als Beleg genannt.' },
      { art: 'verwaist', artefakt: 'interviews', ort: 'I4', id: 'I4', text: 'I4 wird weder im Entscheidungslog noch in der Annahmen-Map als Beleg genannt.' },
    ]);
  });

  it('verwaist: auch ein Beleg in der Annahmen-Map zählt', () => {
    const m = kaffeebar();
    m.entscheidungen.entscheidungen[2].belegIds = [];
    m.entscheidungen.entscheidungen[2].beleg = 'keiner';
    m.annahmen.annahmen[0].belegIds = ['I1-2', 'I4'];
    expect(verknuepfungenPruefen(m).befunde.filter((b) => b.art === 'verwaist')).toStrictEqual([]);
  });

  it('verwaist: auch eine Nennung im Text einer Entscheidung oder Annahme zählt', () => {
    const m = kaffeebar();
    m.entscheidungen.entscheidungen[2].belegIds = [];
    m.entscheidungen.entscheidungen[2].beleg = 'keiner';
    m.entscheidungen.entscheidungen[0].grund = 'So hat es I1 erzählt.';
    m.annahmen.annahmen[2].text = 'Wie I4-1 sagt, bestellt man im Gehen.';
    expect(verknuepfungenPruefen(m).befunde.filter((b) => b.art === 'verwaist')).toStrictEqual([]);
  });

  it('verwaist wird nicht beurteilt, wenn Entscheidungslog oder Annahmen-Map unlesbar sind', () => {
    for (const kaputt of ['entscheidungen', 'annahmen'] as const) {
      const v = verknuepfungenPruefen({ ...kaffeebar(), [kaputt]: 'unlesbar' });
      expect(v.befunde.some((b) => b.art === 'verwaist'), kaputt).toBe(false);
    }
  });

  it('IDs im Fließtext: Brief, Entscheidung und Annahme; „S1“ und Wörter wie „A1-Kaffee“ bleiben still', () => {
    const m = kaffeebar();
    m.brief.offeneFragen = ['Stimmt A7 noch?', 'Mit S1 oder Bus, von der A9?', 'Passt I2-4?'];
    m.entscheidungen.entscheidungen[0].grund = 'Siehe D9';
    m.annahmen.annahmen[2].text = 'Wie in F99 gefragt, A1-Kaffee';
    expect(verknuepfungenPruefen(m).befunde.filter((b) => b.art === 'unbekannte-id')).toStrictEqual([
      { art: 'unbekannte-id', artefakt: 'brief', ort: 'Brief · Offene Frage 1', id: 'A7', text: 'Brief · Offene Frage 1 nennt A7 im Text. Ist das eine ID? In „Annahmen-Map“ gibt es A7 nicht.' },
      { art: 'unbekannte-id', artefakt: 'entscheidungen', ort: 'D1', id: 'D9', text: 'D1 nennt D9 im Text. Ist das eine ID? In „Entscheidungslog“ gibt es D9 nicht.' },
      { art: 'unbekannte-id', artefakt: 'annahmen', ort: 'A3', id: 'F99', text: 'A3 nennt F99 im Text. Ist das eine ID? In „Interviewleitfaden“ gibt es F99 nicht.' },
    ]);
  });

  it('IDs im Fließtext nach Wörtern auf -der, -den, -die („oder“, „wieder“, „Kunden“, „jeden“) werden geprüft', () => {
    const m = kaffeebar();
    m.brief.offeneFragen = ['Laut I2-9 oder I4-9, wieder A8, den Kunden D8 und jeden F98 die I9 fragen?', 'Von der A9 auf die D8 Richtung A7.'];
    expect(verknuepfungenPruefen(m).befunde.filter((b) => b.art === 'unbekannte-id').map((b) => `${b.ort}: ${b.id}`)).toStrictEqual(
      ['I2-9', 'I4-9', 'A8', 'D8', 'F98'].map((id) => `Brief · Offene Frage 1: ${id}`),
    );
  });

  it('leere Mappe: nichts geprüft, alles fehlt, keine Befunde', () => {
    expect(verknuepfungenPruefen({ brief: null, entscheidungen: null, leitfaden: null, annahmen: null, interviews: null })).toStrictEqual({
      befunde: [],
      geprueft: [],
      fehlen: ['brief', 'entscheidungen', 'annahmen', 'leitfaden', 'interviews'],
      unlesbar: [],
    });
  });
});

describe('verknuepfungenText', () => {
  it('Befunde nach Art gruppiert, mit Anzahl', () => {
    const m = kaffeebar();
    m.entscheidungen.entscheidungen[2].belegIds = [];
    m.entscheidungen.entscheidungen[2].beleg = 'keiner';
    m.entscheidungen.entscheidungen[3].belegIds = [];
    const t = verknuepfungenText(verknuepfungenPruefen({ ...m, leitfaden: null, brief: 'unlesbar' }));
    expect(t).toBe([
      '# Verknüpfungen der Mappe',
      '',
      'Geprüft: Entscheidungslog, Annahmen-Map, Interviews und Snapshots.',
      'Noch nicht gespeichert: Interviewleitfaden.',
      'Nicht lesbar (passt nicht zum Format der Werkstatt, dort neu speichern): Produkt-Brief.',
      '',
      '## Fehlende Belege (2)',
      ...KAFFEEBAR_BEFUNDE.map((b) => `- ${b.text}`),
      '',
      '## Verwaiste Elemente (5)',
      ...['I1', 'I2', 'I3', 'I4', 'I5'].map((id) => `- ${id} wird weder im Entscheidungslog noch in der Annahmen-Map als Beleg genannt.`),
    ].join('\n'));
  });

  it('ohne Befunde: ein Satz; leere Mappe sagt das', () => {
    expect(verknuepfungenText({ befunde: [], geprueft: [], fehlen: [], unlesbar: [] })).toBe(
      '# Verknüpfungen der Mappe\n\nGeprüft: nichts, die Mappe ist noch leer.\n\nKeine Lücken: Jede genannte ID gibt es, jede Belegstufe hat einen Beleg, jedes Interview wird genannt.',
    );
  });
});
