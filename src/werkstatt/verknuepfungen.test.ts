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

// Die meisten Tests gehen von A1 ohne Beleg aus (Stand vor den Interviews): A1 „noch keiner“, keine IDs, keine Notiz.
// Dann nennt die Annahmen-Map kein Interview, alle fünf sind verwaist.
function kaffeebarA1Offen(): ReturnType<typeof kaffeebar> {
  const m = kaffeebar();
  const a1 = m.annahmen.annahmen[0];
  Object.assign(a1, { beleg: 'keiner', belegIds: [] });
  delete a1.belegNotiz;
  return m;
}

// Die Kaffeebar hat eine Lücke mit Absicht: A2 und A4 stehen auf „getan“ ohne Quelle (Begleiter: „nachfragen“).
const GETAN_OHNE_QUELLE = ['A2', 'A4'].map((id) => ({
  art: 'fehlender-beleg', artefakt: 'annahmen', ort: id, text: `${id} hat die Belegstufe „getan“, nennt aber keine Quelle (Beleg-Notiz). Ein Interview-Zitat belegt höchstens „erzählt“. Wo liegt das beobachtete Verhalten?`,
}));
// Und A1, die riskanteste Annahme, steht auf „noch keiner“, obwohl fünf Interviews gespeichert sind.
const A1_RISKANTESTE = {
  art: 'riskanteste-ohne-beleg', artefakt: 'annahmen', ort: 'A1', id: 'A1', text: 'A1 ist deine riskanteste Annahme und hat noch keinen Beleg, obwohl 5 Interviews gespeichert sind. Was hast du dazu gehört?',
};
// Verwaist ist ein Interview, das weder die Annahmen-Map noch eine lesbare alte Log-Zeile nennt. Bei der Kaffeebar nennt
// D3 alle fünf – ohne Log (oder ohne D3) würden sie verwaisen.
const verwaist = (ids: string[]) => ids.map((id) => ({ art: 'verwaist', artefakt: 'interviews', ort: id, id, text: `${id} wird in der Annahmen-Map nicht als Beleg genannt.` }));
const ALLE_VERWAIST = verwaist(['I1', 'I2', 'I3', 'I4', 'I5']);
const KAFFEEBAR_BEFUNDE = [...GETAN_OHNE_QUELLE, A1_RISKANTESTE];
// Für Tests, die nur die Annahmen betreffen: ohne die Verwaist-Befunde.
const KERN_BEFUNDE = [...GETAN_OHNE_QUELLE, A1_RISKANTESTE];
const ohneVerwaist = (m: MappeDaten) => verknuepfungenPruefen(m).befunde.filter((b) => b.art !== 'verwaist');

describe('verknuepfungenPruefen', () => {
  // Das Beispiel selbst: A1 trägt die Gegenbelege I2-4, I3-1, I5-3 („spricht dagegen“, wie auf Synthese- und Pitch-Seite).
  // Verwaist bleiben I1 (die Entscheidung in der Halle steht dort nur in der Notiz) und I4 – keiner Annahme zugeordnet.
  it('Beispiel Kaffeebar: A1 mit Gegenbelegen, A2/A4 „getan“ ohne Quelle; kein Interview verwaist (D3 nennt I1–I5)', () => {
    expect(verknuepfungenPruefen(kaffeebar())).toStrictEqual({
      befunde: GETAN_OHNE_QUELLE,
      geprueft: ['brief', 'annahmen', 'leitfaden', 'interviews'],
      fehlen: [],
      unlesbar: [],
    });
  });

  it('Kaffeebar mit A1 ohne Beleg: Befund nur für „getan“ ohne Quelle; das stillgelegte Entscheidungslog wird nicht geprüft (NDU-70)', () => {
    expect(verknuepfungenPruefen(kaffeebarA1Offen())).toStrictEqual({
      befunde: KAFFEEBAR_BEFUNDE,
      geprueft: ['brief', 'annahmen', 'leitfaden', 'interviews'],
      fehlen: [],
      unlesbar: [],
    });
  });

  it('unbekannte IDs: fehlendes Zitat, fehlendes Interview, fehlende Annahme, späterer Kurstag', () => {
    const m = kaffeebarA1Offen();
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
    const m = kaffeebarA1Offen();
    m.annahmen.annahmen[0].belegIds = ['I8-1'];
    expect(verknuepfungenPruefen(m).befunde.find((b) => b.id === 'I8-1')?.text).toBe('A1 nennt I8-1 als Beleg. In „Interviews und Snapshots“ gibt es I8-1 nicht.');
  });

  it('Interviews noch nicht gespeichert: Beleg-IDs sind unbekannt, mit eigenem Satz; keine Verwaist-Befunde', () => {
    const k = kaffeebarA1Offen();
    k.annahmen.annahmen[0].belegIds = ['I2-4'];
    const m: MappeDaten = { ...k, interviews: null };
    const v = verknuepfungenPruefen(m);
    expect(v.fehlen).toStrictEqual(['interviews']);
    expect(v.befunde.find((b) => b.id === 'I2-4')).toStrictEqual({
      art: 'unbekannte-id', artefakt: 'annahmen', ort: 'A1', id: 'I2-4', text: 'A1 nennt I2-4 als Beleg. „Interviews und Snapshots“ ist noch nicht gespeichert, I2-4 gibt es darum noch nicht.',
    });
    expect(v.befunde.some((b) => b.art === 'verwaist')).toBe(false);
  });

  it('Interviews unlesbar: I-Verweise werden nicht als unbekannt gemeldet (nicht prüfbar), sondern die Datei als unlesbar', () => {
    const v = verknuepfungenPruefen({ ...kaffeebarA1Offen(), interviews: 'unlesbar' });
    expect(v.unlesbar).toStrictEqual(['interviews']);
    expect(v.geprueft).not.toContain('interviews');
    // Ohne lesbare Interviews lässt sich nicht zählen: kein Befund zur riskantesten Annahme.
    expect(v.befunde).toStrictEqual(GETAN_OHNE_QUELLE);
  });

  it('Entscheidungslog (stillgelegt, NDU-70): keine Befunde zu seinen Zeilen – weder fehlender Beleg noch unbekannte ID', () => {
    const m = kaffeebarA1Offen();
    const [, d2, d3, d4] = m.entscheidungen.entscheidungen;
    // Vor NDU-70 je ein Befund: D2 „getan“ ohne Notiz, D3 „getan“ nur mit Interviews, D4 mit unbekanntem Zitat, D9 im Text.
    delete d2.belegNotiz;
    d3.beleg = 'getan';
    d4.belegIds = ['I8-1'];
    d4.grund = 'Siehe D9';
    const v = verknuepfungenPruefen(m);
    expect(v.befunde.filter((b) => b.artefakt === 'entscheidungen')).toStrictEqual([]);
    expect(v.befunde).toStrictEqual(KAFFEEBAR_BEFUNDE);
  });

  it('Annahme: „gesagt“ oder „erzählt“ ohne Interview-Beleg ist ein Befund, „noch keiner“ nicht', () => {
    const m = kaffeebarA1Offen();
    m.annahmen.annahmen[0].beleg = 'gesagt';
    m.annahmen.annahmen[2].beleg = 'erzaehlt';
    m.annahmen.annahmen[1].belegIds = ['D2'];
    m.annahmen.annahmen[3].belegIds = ['D2'];
    expect(ohneVerwaist(m)).toStrictEqual([
      { art: 'fehlender-beleg', artefakt: 'annahmen', ort: 'A1', text: 'A1 hat die Belegstufe „gesagt“, nennt aber kein Interview oder Zitat als Beleg.' },
      { art: 'fehlender-beleg', artefakt: 'annahmen', ort: 'A3', text: 'A3 hat die Belegstufe „erzählt“, nennt aber kein Interview oder Zitat als Beleg.' },
    ]);
  });

  it('Annahme „gesagt“ oder „erzählt“: ein Verweis auf eine Entscheidung (D1) ersetzt kein Interview', () => {
    const m = kaffeebarA1Offen();
    const [a1, a2, a3, a4] = m.annahmen.annahmen;
    a1.beleg = 'gesagt';
    a1.belegIds = ['D1'];
    a3.beleg = 'erzaehlt';
    a3.belegIds = ['D1', 'I2-4'];
    a2.belegIds = ['D2'];
    a4.belegIds = ['D2'];
    expect(ohneVerwaist(m)).toStrictEqual([
      { art: 'fehlender-beleg', artefakt: 'annahmen', ort: 'A1', text: 'A1 hat die Belegstufe „gesagt“, nennt aber kein Interview oder Zitat als Beleg.' },
    ]);
  });

  it('Annahme „getan“: still mit einer Entscheidung, die selbst „getan“ ist und eine Quelle nennt (D2: Kassendaten September)', () => {
    const m = kaffeebarA1Offen();
    m.annahmen.annahmen[1].belegIds = ['D2'];
    m.annahmen.annahmen[3].belegIds = ['I2-4', 'D2'];
    expect(ohneVerwaist(m)).toStrictEqual([A1_RISKANTESTE]);
  });

  it('Annahme „getan“: Interview-Zitat, A- oder F-ID oder eine Entscheidung ohne eigene „getan“-Quelle reichen nicht', () => {
    // D1: noch keiner und ersetzt; D3 und D4: „gesagt“, nur mit Interviews belegt.
    for (const ids of [['I2-4'], ['I1'], ['A3'], ['F1'], ['D1'], ['D3'], ['D4'], ['D3', 'D4', 'I2-4']]) {
      const m = kaffeebarA1Offen();
      m.annahmen.annahmen[1].belegIds = ids;
      expect(ohneVerwaist(m), ids.join()).toStrictEqual(KERN_BEFUNDE);
    }
  });

  it('Entscheidung als Quelle für „getan“: nur selbst „getan“, nicht ersetzt und mit Beleg-Notiz; ihre Beleg-IDs zählen nie', () => {
    type Zeilen = ReturnType<typeof kaffeebar>['entscheidungen']['entscheidungen'];
    // A2 nennt D3; D3 wird verändert. Ergebnis: die fehlender-Beleg-Befunde zu A2.
    const fall = (aendern: (d: Zeilen) => void) => {
      const m = kaffeebarA1Offen();
      m.annahmen.annahmen[1].belegIds = ['D3'];
      aendern(m.entscheidungen.entscheidungen);
      return verknuepfungenPruefen(m).befunde.filter((b) => b.art === 'fehlender-beleg' && b.ort === 'A2');
    };
    const D3 = 2;
    // D3 „getan“ mit Notiz: trägt.
    expect(fall((d) => { d[D3]!.beleg = 'getan'; d[D3]!.belegNotiz = 'Strichliste Oktober'; })).toStrictEqual([]);
    // D3 „getan“ ohne Notiz, nur mit IDs: Interviews, A-Kreis zurück auf A2, F1, Ketten auf D2 (trägt selbst) und D4.
    for (const ids of [['I1', 'I2'], ['A2'], ['A1'], ['F1'], ['D2'], ['D4'], ['D1']]) {
      expect(fall((d) => { d[D3]!.beleg = 'getan'; d[D3]!.belegIds = ids; }), ids.join()).toHaveLength(1);
    }
    // D3 mit Notiz, aber nicht „getan“: trägt nicht.
    expect(fall((d) => { d[D3]!.belegNotiz = 'Strichliste Oktober'; })).toHaveLength(1);
    // Ersetzte Entscheidung (D1 wird von D3 ersetzt) ist Geschichte, auch mit „getan“ und Notiz. Der Befund zeigt auf die
    // Ersatzzeile, ohne das Wort Entscheidungslog (NDU-70).
    const m = kaffeebarA1Offen();
    m.annahmen.annahmen[1].belegIds = ['D1'];
    Object.assign(m.entscheidungen.entscheidungen[0]!, { beleg: 'getan', belegNotiz: 'Kassendaten August' });
    const [a2] = GETAN_OHNE_QUELLE.filter((b) => b.ort === 'A2');
    expect(verknuepfungenPruefen(m).befunde.filter((b) => b.ort === 'A2')).toStrictEqual([{ ...a2, text: `${a2!.text} D1 ist ersetzt – nennt die neue Zeile (D3).` }]);
  });

  it('IDs in einer Beleg-Notiz werden aufgelöst wie im Text: unbekannte melden, bekannte still', () => {
    const m = kaffeebarA1Offen();
    m.annahmen.annahmen[1].belegNotiz = 'Strichliste wie in D7, dazu I1';
    m.annahmen.annahmen[3].belegNotiz = 'Zählung, siehe I9';
    expect(verknuepfungenPruefen(m).befunde.filter((b) => b.art === 'unbekannte-id').map((b) => [b.ort, b.id])).toStrictEqual([['A2', 'D7'], ['A4', 'I9']]);
  });

  it('Annahme „getan“: unbekannte D-IDs neben aufgelösten ändern nichts; nur unbekannte D-IDs → nur der Befund zur ID', () => {
    const gemischt = kaffeebarA1Offen();
    gemischt.annahmen.annahmen[1].belegIds = ['D1', 'D9'];
    const v = verknuepfungenPruefen(gemischt).befunde.filter((b) => b.ort === 'A2');
    expect(v.map((b) => [b.art, b.id])).toStrictEqual([['unbekannte-id', 'D9'], ['fehlender-beleg', undefined]]);
    const mitTraeger = kaffeebarA1Offen();
    mitTraeger.annahmen.annahmen[1].belegIds = ['D2', 'D9'];
    expect(verknuepfungenPruefen(mitTraeger).befunde.filter((b) => b.ort === 'A2').map((b) => b.art)).toStrictEqual(['unbekannte-id']);
    const nurUnbekannt = kaffeebarA1Offen();
    nurUnbekannt.annahmen.annahmen[1].belegIds = ['D9'];
    expect(verknuepfungenPruefen(nurUnbekannt).befunde.filter((b) => b.ort === 'A2').map((b) => b.art)).toStrictEqual(['unbekannte-id']);
  });

  it('Annahme „getan“ mit D-ID: Log fehlt → nur der Befund zur unbekannten ID, ohne Verweis aufs Log; Log unlesbar → nicht prüfbar, still', () => {
    const fehlt = kaffeebarA1Offen();
    fehlt.annahmen.annahmen[1].belegIds = ['D2'];
    const v = verknuepfungenPruefen({ ...fehlt, entscheidungen: null });
    expect(v.fehlen).toStrictEqual([]);
    expect(v.befunde.filter((b) => b.ort === 'A2')).toStrictEqual([
      { art: 'unbekannte-id', artefakt: 'annahmen', ort: 'A2', id: 'D2', text: 'A2 nennt D2 als Beleg. In der Mappe gibt es D2 nicht.' },
    ]);
    expect(v.befunde.filter((b) => b.art === 'fehlender-beleg')).toStrictEqual(KAFFEEBAR_BEFUNDE.filter((b) => b.ort === 'A4'));
    // Eine unlesbare alte Datei wird nirgends gemeldet; ihre D-IDs lassen sich nicht prüfen – kein Befund zu A2.
    const unlesbar = kaffeebarA1Offen();
    unlesbar.annahmen.annahmen[1].belegIds = ['D2'];
    const u = verknuepfungenPruefen({ ...unlesbar, entscheidungen: 'unlesbar' });
    expect(u.unlesbar).toStrictEqual([]);
    expect(u.befunde.filter((b) => b.ort === 'A2')).toStrictEqual([]);
    expect(u.befunde.filter((b) => b.art !== 'verwaist')).toStrictEqual(KAFFEEBAR_BEFUNDE.filter((b) => b.ort !== 'A2'));
  });

  it('Annahme „getan“ mit Beleg-Notiz (Quelle außerhalb der Mappe) ist still, ohne Notiz bleibt der Befund', () => {
    const m = kaffeebarA1Offen();
    m.annahmen.annahmen[1].belegNotiz = 'Kassendaten September';
    expect(verknuepfungenPruefen(m).befunde).toStrictEqual(KAFFEEBAR_BEFUNDE.filter((b) => b.ort !== 'A2'));
  });

  it('Annahme „gesagt“ oder „erzählt“: eine Beleg-Notiz allein ersetzt kein Interview', () => {
    const m = kaffeebarA1Offen();
    const [a1, a2, a3, a4] = m.annahmen.annahmen;
    a1.beleg = 'gesagt';
    a1.belegNotiz = 'Gespräch am Bahnsteig';
    a3.beleg = 'erzaehlt';
    a3.belegNotiz = 'Umfrage Oktober';
    a2.belegNotiz = 'Kassendaten September';
    a4.belegNotiz = 'Strichliste';
    expect(ohneVerwaist(m)).toStrictEqual([
      { art: 'fehlender-beleg', artefakt: 'annahmen', ort: 'A1', text: 'A1 hat die Belegstufe „gesagt“, nennt aber kein Interview oder Zitat als Beleg.' },
      { art: 'fehlender-beleg', artefakt: 'annahmen', ort: 'A3', text: 'A3 hat die Belegstufe „erzählt“, nennt aber kein Interview oder Zitat als Beleg.' },
    ]);
  });

  it('Unternummer an einer Nicht-Interview-ID (D1-2): „gibt es nicht“, nicht „hat kein Zitat“', () => {
    const m = kaffeebarA1Offen();
    m.annahmen.annahmen[0].belegIds = ['D1-2'];
    expect(verknuepfungenPruefen(m).befunde.find((b) => b.id === 'D1-2')?.text).toBe('A1 nennt D1-2 als Beleg. In der Mappe gibt es D1-2 nicht.');
  });

  it('nur Interviews gespeichert (Hausaufgabe am ersten Abend): noch nichts verwaist', () => {
    const v = verknuepfungenPruefen({ ...kaffeebarA1Offen(), brief: null, entscheidungen: null, annahmen: null, leitfaden: null });
    expect(v.befunde).toStrictEqual([]);
  });

  it('Belegstufe „noch keiner“ ohne IDs ist kein fehlender Beleg (nur die riskanteste Annahme wird angesprochen)', () => {
    const m = kaffeebarA1Offen();
    for (const a of m.annahmen.annahmen) { a.beleg = 'keiner'; a.belegIds = []; }
    expect(ohneVerwaist(m)).toStrictEqual([A1_RISKANTESTE]);
  });

  describe('riskanteste Annahme ohne Beleg', () => {
    const riskanteste = (m: MappeDaten) => verknuepfungenPruefen(m).befunde.filter((b) => b.art === 'riskanteste-ohne-beleg');

    it('Kaffeebar: A1 ist riskanteste, „noch keiner“, fünf Interviews → ein Befund, der mit einer Frage endet', () => {
      expect(riskanteste(kaffeebarA1Offen())).toStrictEqual([A1_RISKANTESTE]);
    });

    it('still, sobald A1 einen Beleg hat: Stufe, ID oder Notiz', () => {
      const mitStufe = kaffeebarA1Offen();
      Object.assign(mitStufe.annahmen.annahmen[0], { beleg: 'gesagt', belegIds: ['I2-4'] });
      expect(riskanteste(mitStufe)).toStrictEqual([]);
      // Stufe „gesagt“ ohne Interview meldet schon „fehlender-beleg“, nicht doppelt.
      const nurStufe = kaffeebarA1Offen();
      nurStufe.annahmen.annahmen[0].beleg = 'gesagt';
      expect(verknuepfungenPruefen(nurStufe).befunde.filter((b) => b.ort === 'A1').map((b) => b.art)).toStrictEqual(['fehlender-beleg']);
      const mitId = kaffeebarA1Offen();
      mitId.annahmen.annahmen[0].belegIds = ['I3-1'];
      expect(riskanteste(mitId)).toStrictEqual([]);
      const mitNotiz = kaffeebarA1Offen();
      mitNotiz.annahmen.annahmen[0].belegNotiz = 'Zählung am Bahnsteig';
      expect(riskanteste(mitNotiz)).toStrictEqual([]);
    });

    it('Anrede: duzt die eine Person, wie der Tutor', () => {
      const [b] = riskanteste(kaffeebarA1Offen());
      expect(b?.text).toContain('deine riskanteste Annahme');
      expect(b?.text.endsWith('Was hast du dazu gehört?')).toBe(true);
    });

    it('Beleg-Notiz nur aus Leerraum zählt nicht als Beleg (wie bei den anderen Befunden)', () => {
      const m = kaffeebarA1Offen();
      m.annahmen.annahmen[0].belegNotiz = '   ';
      expect(riskanteste(m)).toStrictEqual([A1_RISKANTESTE]);
    });

    it('nur aufgelöste IDs zählen als Beleg: I9 gibt es nicht → Befund plus unbekannte ID; A3 gibt es → still', () => {
      const unbekannt = kaffeebarA1Offen();
      unbekannt.annahmen.annahmen[0].belegIds = ['I9'];
      expect(verknuepfungenPruefen(unbekannt).befunde.filter((b) => b.ort === 'A1').map((b) => [b.art, b.id])).toStrictEqual([
        ['unbekannte-id', 'I9'], ['riskanteste-ohne-beleg', 'A1'],
      ]);
      const bekannt = kaffeebarA1Offen();
      bekannt.annahmen.annahmen[0].belegIds = ['A3'];
      expect(riskanteste(bekannt)).toStrictEqual([]);
      // Neben einer unbekannten zählt eine aufgelöste ID.
      const gemischt = kaffeebarA1Offen();
      gemischt.annahmen.annahmen[0].belegIds = ['I9', 'I2-4'];
      expect(riskanteste(gemischt)).toStrictEqual([]);
    });

    it('D-ID bei unlesbarem Entscheidungslog lässt sich nicht prüfen und zählt im Zweifel als Beleg; ohne Log nicht', () => {
      const m = kaffeebarA1Offen();
      m.annahmen.annahmen[0].belegIds = ['D1'];
      expect(riskanteste({ ...m, entscheidungen: 'unlesbar' })).toStrictEqual([]);
      expect(riskanteste({ ...m, entscheidungen: null })).toStrictEqual([A1_RISKANTESTE]);
    });

    it('still ohne Interviews: nicht gespeichert, leere Liste oder nur leere Snapshots', () => {
      expect(riskanteste({ ...kaffeebarA1Offen(), interviews: null })).toStrictEqual([]);
      const keine = kaffeebarA1Offen();
      keine.interviews.interviews = [];
      expect(riskanteste(keine)).toStrictEqual([]);
      const leer = kaffeebarA1Offen();
      leer.interviews.interviews = leer.interviews.interviews.map((iv) => ({ ...iv, zitat: '', kurzinfos: '', notizen: '', einsichten: [], chancen: [], zitate: [] }));
      expect(riskanteste(leer)).toStrictEqual([]);
    });

    it('zählt nur Interviews mit Inhalt; bei einem steht die Einzahl', () => {
      const m = kaffeebarA1Offen();
      m.interviews.interviews = m.interviews.interviews.map((iv, i) => (i === 0 ? iv : { ...iv, zitat: '', kurzinfos: '', notizen: '', einsichten: [], chancen: [], zitate: [] }));
      expect(riskanteste(m).map((b) => b.text)).toStrictEqual(['A1 ist deine riskanteste Annahme und hat noch keinen Beleg, obwohl 1 Interview gespeichert ist. Was hast du dazu gehört?']);
    });

    it('still, wenn keine riskanteste Annahme markiert ist', () => {
      const m = kaffeebarA1Offen();
      delete m.annahmen.riskanteste;
      expect(riskanteste(m)).toStrictEqual([]);
    });

    it('folgt der Markierung: A3 als riskanteste, ebenfalls „noch keiner“', () => {
      const m = kaffeebarA1Offen();
      m.annahmen.riskanteste = 'A3';
      expect(riskanteste(m).map((b) => b.ort)).toStrictEqual(['A3']);
    });
  });

  it('Chance ohne Zitat als Beleg', () => {
    const m = kaffeebarA1Offen();
    m.interviews.interviews[1].chancen[0].belege = [];
    expect(verknuepfungenPruefen(m).befunde.filter((b) => b.artefakt === 'interviews' && b.art === 'fehlender-beleg')).toStrictEqual([
      { art: 'fehlender-beleg', artefakt: 'interviews', ort: 'I2 · Chance 1', text: 'I2 · Chance 1 hat kein Zitat als Beleg.' },
    ]);
  });

  it('verwaist: Interview, das kein Beleg der Annahmen-Map nennt; ein Zitat-Verweis zählt für das Interview', () => {
    const m = kaffeebarA1Offen();
    m.annahmen.annahmen[0].belegIds = ['I2-4', 'I3'];
    expect(verknuepfungenPruefen({ ...m, entscheidungen: null }).befunde.filter((b) => b.art === 'verwaist')).toStrictEqual(verwaist(['I1', 'I4', 'I5']));
  });

  it('verwaist: auch eine Nennung im Text einer Annahme zählt', () => {
    const m = kaffeebarA1Offen();
    m.annahmen.annahmen[0].belegIds = ['I1-2', 'I4'];
    m.annahmen.annahmen[2].text = 'Wie I2-4, I3-1 und I5 sagen, bestellt man im Gehen.';
    expect(verknuepfungenPruefen(m).befunde.filter((b) => b.art === 'verwaist')).toStrictEqual([]);
  });

  it('verwaist: Nennungen in einem lesbaren alten Entscheidungslog zählen weiter, als Beleg und im Text', () => {
    // D3 nennt I1 bis I5; ohne D3 nennt nur noch D4 die Interviews I2, I3, I5 über Zitate.
    const m = kaffeebarA1Offen();
    m.entscheidungen.entscheidungen[2].belegIds = [];
    expect(verknuepfungenPruefen(m).befunde.filter((b) => b.art === 'verwaist')).toStrictEqual(verwaist(['I1', 'I4']));
    m.entscheidungen.entscheidungen[0].grund = 'So hat es I1 erzählt.';
    expect(verknuepfungenPruefen(m).befunde.filter((b) => b.art === 'verwaist')).toStrictEqual(verwaist(['I4']));
    // Ohne lesbares Log nennt die Annahmen-Map (A1 offen) keines.
    expect(verknuepfungenPruefen({ ...m, entscheidungen: null }).befunde.filter((b) => b.art === 'verwaist')).toStrictEqual(ALLE_VERWAIST);
  });

  it('verwaist: nur die Annahmen-Map entscheidet – fehlt sie oder ist sie unlesbar, still; ein unlesbares Log schaltet nichts ab', () => {
    for (const annahmen of [null, 'unlesbar'] as const) {
      const v = verknuepfungenPruefen({ ...kaffeebarA1Offen(), annahmen });
      expect(v.befunde.some((b) => b.art === 'verwaist'), String(annahmen)).toBe(false);
    }
    const v = verknuepfungenPruefen({ ...kaffeebarA1Offen(), entscheidungen: 'unlesbar' });
    expect(v.befunde.filter((b) => b.art === 'verwaist')).toStrictEqual(ALLE_VERWAIST);
    expect(v.unlesbar).toStrictEqual([]);
  });

  it('IDs im Fließtext: Brief und Annahme; „S1“ und Wörter wie „A1-Kaffee“ bleiben still', () => {
    const m = kaffeebarA1Offen();
    m.brief.offeneFragen = ['Stimmt A7 noch?', 'Mit S1 oder Bus, von der A9?', 'Passt I2-4?'];
    m.annahmen.annahmen[2].text = 'Wie in F99 gefragt, A1-Kaffee';
    expect(verknuepfungenPruefen(m).befunde.filter((b) => b.art === 'unbekannte-id')).toStrictEqual([
      { art: 'unbekannte-id', artefakt: 'brief', ort: 'Brief · Offene Frage 1', id: 'A7', text: 'Brief · Offene Frage 1 nennt A7 im Text. Ist das eine ID? In „Annahmen-Map“ gibt es A7 nicht.' },
      { art: 'unbekannte-id', artefakt: 'annahmen', ort: 'A3', id: 'F99', text: 'A3 nennt F99 im Text. Ist das eine ID? In „Interviewleitfaden“ gibt es F99 nicht.' },
    ]);
  });

  it('IDs im Fließtext nach Wörtern auf -der, -den, -die („oder“, „wieder“, „Kunden“, „jeden“) werden geprüft', () => {
    const m = kaffeebarA1Offen();
    m.brief.offeneFragen = ['Laut I2-9 oder I4-9, wieder A8, den Kunden D8 und jeden F98 die I9 fragen?', 'Von der A9 auf die D8 Richtung A7.'];
    expect(verknuepfungenPruefen(m).befunde.filter((b) => b.art === 'unbekannte-id').map((b) => `${b.ort}: ${b.id}`)).toStrictEqual(
      ['I2-9', 'I4-9', 'A8', 'D8', 'F98'].map((id) => `Brief · Offene Frage 1: ${id}`),
    );
  });

  it('leere Mappe: nichts geprüft, alles fehlt, keine Befunde', () => {
    expect(verknuepfungenPruefen({ brief: null, entscheidungen: null, leitfaden: null, annahmen: null, interviews: null })).toStrictEqual({
      befunde: [],
      geprueft: [],
      fehlen: ['brief', 'annahmen', 'leitfaden', 'interviews'],
      unlesbar: [],
    });
  });
});

describe('verknuepfungenText', () => {
  it('Befunde nach Art gruppiert, mit Anzahl', () => {
    const m = kaffeebarA1Offen();
    m.entscheidungen.entscheidungen[2].belegIds = [];
    m.entscheidungen.entscheidungen[2].beleg = 'keiner';
    m.entscheidungen.entscheidungen[3].belegIds = [];
    const t = verknuepfungenText(verknuepfungenPruefen({ ...m, leitfaden: null, brief: 'unlesbar' }));
    expect(t).toBe([
      '# Verknüpfungen der Mappe',
      '',
      'Geprüft: Annahmen-Map, Interviews und Snapshots.',
      'Noch nicht gespeichert: Interviewleitfaden.',
      'Nicht lesbar (passt nicht zum Format der Werkstatt, dort neu speichern): Produkt-Brief.',
      '',
      '## Fehlende Belege (2)',
      ...GETAN_OHNE_QUELLE.map((b) => `- ${b.text}`),
      '',
      '## Verwaiste Elemente (5)',
      ...['I1', 'I2', 'I3', 'I4', 'I5'].map((id) => `- ${id} wird in der Annahmen-Map nicht als Beleg genannt.`),
      '',
      '## Riskanteste Annahme ohne Beleg (1)',
      `- ${A1_RISKANTESTE.text}`,
    ].join('\n'));
  });

  it('ohne Befunde: ein Satz; leere Mappe sagt das', () => {
    expect(verknuepfungenText({ befunde: [], geprueft: [], fehlen: [], unlesbar: [] })).toBe(
      '# Verknüpfungen der Mappe\n\nGeprüft: nichts, die Mappe ist noch leer.\n\nKeine Lücken: Jede genannte ID gibt es, jede Belegstufe hat einen Beleg, jedes Interview wird genannt, und die riskanteste Annahme hat einen Beleg oder es gibt noch keine Interviews.',
    );
  });
});
