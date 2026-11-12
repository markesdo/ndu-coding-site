// Kontext im Zeigen-Modus (Taste K): Annahmen-Map und Leitfaden der Person neben dem Snapshot (KontextPanel, Zeigen)
// und die reinen Hilfen (kontext-hilfen.ts).
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ANNAHMEN from '../beispiele/annahmen.json';
import KAFFEEBAR from '../beispiele/interviews.json';
import LEITFADEN from '../beispiele/leitfaden.json';
import type { Annahmen, Interview, Leitfaden } from '../schemas/index.js';
import type { LehrendenArtefakt, LehrendenInhalt } from '../vertrag.js';
import {
  annahmenAus, belegtImInterview, idAusInterview, interviewIds, istKontextTaste, KONTEXT_LEER, kontextDaten, kontextNeuIds, leitfadenAus, meldungMitKontext, mussKontextLaden,
  neueAnnahmen, neuerLeitfaden, neueZeilen, QUADRANT_TEXT, type Kontext,
} from './kontext-hilfen';
import { LeserKoerper, type LeserInhaltProps } from './LehrendenAnsicht';
import Zeigen, { type ZeigenProps } from './Zeigen';

const IVS = KAFFEEBAR.interviews as Interview[];
const I2 = IVS.find((i) => i.id === 'I2')!;
const I3 = IVS.find((i) => i.id === 'I3')!;
// Wie die Kaffeebar nach der Besprechung von I2 (Folie „beispiel“): A1 mit dem Gegenbeleg I2-4.
const AN: Annahmen = {
  ...(ANNAHMEN as Annahmen),
  annahmen: (ANNAHMEN as Annahmen).annahmen.map((a) => (a.id === 'A1' ? { ...a, beleg: 'gesagt', belegIds: ['I2-4'], belegNotiz: 'spricht dagegen' } : a.id === 'A3' ? { ...a, belegIds: ['I3-2'] } : a)),
};
const LF = LEITFADEN as Leitfaden;
const text = (h: string) => h.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"');

const teil = <T,>(daten: T | null, vorher?: T | null) => ({ laedt: false, fehler: false, stand: { daten, vorher: vorher === undefined ? null : { daten: vorher } } });
const kontext = (x: Partial<Kontext> = {}): Kontext => ({ annahmen: teil(AN), leitfaden: teil(LF), ...x });

const props = (x: Partial<ZeigenProps> = {}): ZeigenProps => ({
  personen: [{ kuerzel: 'sofie', anzahl: 5 }], person: 'sofie', interviews: IVS, vorher: null, nr: 1, laedt: false, fehler: null,
  stand: Date.UTC(2026, 10, 12, 13, 5), jetzt: Date.UTC(2026, 10, 12, 13, 6), meldung: '',
  kontext: kontext(), kontextOffen: true, kontextReiter: 'annahmen', kontextUmschalten: () => {}, reiterWaehlen: () => {},
  frage: 0, fragenOffen: true, frageWaehlen: () => {}, fragenUmschalten: () => {},
  personWaehlen: () => {}, nrWaehlen: () => {}, blaettern: () => {}, neuLaden: () => {}, beenden: () => {}, ...x,
});
const zeigen = (x: Partial<ZeigenProps> = {}) => renderToStaticMarkup(<Zeigen {...props(x)} />);
/** Zeilen der Annahmen-Liste: [Klassen, Text]. */
const zeilen = (h: string) => [...h.matchAll(/<li class="([^"]*zg-annahme[^"]*)">(.*?)<\/li>/g)].map((m) => [m[1], text(m[2])] as const);
const zeile = (h: string, id: string) => zeilen(h).find(([, t]) => t.startsWith(id))!;

describe('Kontext-Hilfen', () => {
  it('belegt im Interview: Zitat-ID des Snapshots oder die Interview-ID, sonst nicht', () => {
    const hier = interviewIds(I2);
    expect(belegtImInterview({ belegIds: ['I2-4'] }, hier)).toBe(true);
    expect(belegtImInterview({ belegIds: ['I2'] }, hier)).toBe(true);
    expect(belegtImInterview({ belegIds: [' I2-4 '] }, hier)).toBe(true);
    expect(belegtImInterview({ belegIds: ['I3-2', 'D1'] }, hier)).toBe(false);
    // I2-40 ist kein Zitat von I2 (kein Präfixvergleich).
    expect(belegtImInterview({ belegIds: ['I2-40', 'I22'] }, hier)).toBe(false);
    expect(belegtImInterview({ belegIds: [] }, hier)).toBe(false);
    expect(belegtImInterview({ belegIds: ['I2-4'] }, interviewIds(null))).toBe(false);
    expect(idAusInterview(' I2-5', hier)).toBe(true);
  });

  it('neue Zeilen: erstes Laden nichts; danach neue und geänderte IDs', () => {
    const a = [{ id: 'A1', t: 'x' }, { id: 'A2', t: 'y' }];
    expect(neueZeilen(null, a)).toStrictEqual(new Set());
    expect(neueZeilen(a, structuredClone(a))).toStrictEqual(new Set());
    expect(neueZeilen(a, [{ id: 'A1', t: 'x' }, { id: 'A2', t: 'z' }, { id: 'A3', t: 'n' }])).toStrictEqual(new Set(['A2', 'A3']));
  });

  it('neue Annahmen: nachgetragener Beleg und Wechsel der riskantesten', () => {
    const alt = ANNAHMEN as Annahmen;
    expect(neueAnnahmen(teil(AN).stand)).toStrictEqual(new Set());
    expect(neueAnnahmen(teil(AN, alt).stand)).toStrictEqual(new Set(['A1', 'A3']));
    expect(neueAnnahmen(teil({ ...alt, riskanteste: 'A2' }, alt).stand)).toStrictEqual(new Set(['A1', 'A2']));
    // Vorher gab es die Datei nicht: alles neu.
    expect(neueAnnahmen(teil(alt, null).stand)).toStrictEqual(new Set(['A1', 'A2', 'A3', 'A4']));
  });

  it('neuer Leitfaden: neue Frage und geändertes Ziel', () => {
    expect(neuerLeitfaden(teil(LF).stand)).toStrictEqual({ fragen: new Set(), ziel: false });
    const neu = { ...LF, ziel: 'Anders', fragen: [...LF.fragen, { id: 'F10', text: 'Warum der Automat?', art: 'nachfrage' as const }] };
    expect(neuerLeitfaden(teil(neu, LF).stand)).toStrictEqual({ fragen: new Set(['F10']), ziel: true });
  });

  it('Daten prüfen: unpassend oder fehlend = null, Feedback der Antwort bleibt draußen', () => {
    expect(annahmenAus(null)).toBeNull();
    expect(annahmenAus({ schema: 'annahmen@1', annahmen: 'kaputt' })).toBeNull();
    expect(leitfadenAus(LF)).toStrictEqual(LF);
    const antwort = { name: 'annahmen', stand: 'vorhanden', daten: AN, roh: null, feedback: [{ text: 'FEEDBACK-MARKE' }] };
    expect(kontextDaten('annahmen', antwort)).toStrictEqual(AN);
    expect(JSON.stringify(kontextDaten('annahmen', antwort))).not.toContain('FEEDBACK-MARKE');
  });

  it('sparsam laden: nur offen und nur einmal je Stand', () => {
    expect(mussKontextLaden(false, null, '0:1')).toBe(false);
    expect(mussKontextLaden(true, null, '0:1')).toBe(true);
    expect(mussKontextLaden(true, '0:1', '0:1')).toBe(false);
    // Neu laden bei offenem Kontext: wieder; bei zugeklapptem erst beim nächsten Öffnen.
    expect(mussKontextLaden(true, '0:1', '1:1')).toBe(true);
    expect(mussKontextLaden(false, '0:1', '1:1')).toBe(false);
  });

  it('Meldung nach Neu laden nennt auch neue Annahmen und Fragen', () => {
    const lf = { ...LF, fragen: [...LF.fragen, { id: 'F10', text: 'Warum der Automat?', art: 'nachfrage' as const }] };
    const k = kontext({ annahmen: teil(AN, ANNAHMEN as Annahmen), leitfaden: teil(lf, LF) });
    expect(kontextNeuIds(k)).toStrictEqual(['A1', 'A3', 'F10']);
    expect(kontextNeuIds(kontext())).toStrictEqual([]);
    expect(meldungMitKontext('Nichts Neues gespeichert', ['A1', 'F10'])).toBe('Neu oder geändert: A1, F10');
    expect(meldungMitKontext('Neu oder geändert: I2', ['A1'])).toBe('Neu oder geändert: I2, A1');
    expect(meldungMitKontext('Snapshot entfernt', ['A1'])).toBe('Snapshot entfernt · Neu oder geändert: A1');
    expect(meldungMitKontext('Nichts Neues gespeichert', [])).toBe('Nichts Neues gespeichert');
  });

  it('Taste K: nur ohne Strg/Cmd/Alt und nicht beim Tippen', () => {
    expect(istKontextTaste({ key: 'k' })).toBe(true);
    expect(istKontextTaste({ key: 'K' })).toBe(true);
    expect(istKontextTaste({ key: 'j' })).toBe(false);
    expect(istKontextTaste({ key: 'k', metaKey: true })).toBe(false);
    expect(istKontextTaste({ key: 'k', ctrlKey: true })).toBe(false);
    expect(istKontextTaste({ key: 'k', target: { tagName: 'INPUT' } as never })).toBe(false);
    expect(istKontextTaste({ key: 'k', target: { tagName: 'TEXTAREA' } as never })).toBe(false);
    expect(istKontextTaste({ key: 'k', target: { tagName: 'DIV', isContentEditable: true } as never })).toBe(false);
    expect(istKontextTaste({ key: 'k', target: { tagName: 'DIV' } as never })).toBe(true);
  });

  it('Feldnamen wie im Bild der Annahmen-Map', () => {
    expect(QUADRANT_TEXT).toStrictEqual({ ol: 'Beleg prüfen, darauf bauen', or: 'Zuerst testen', ul: 'Abhaken', ur: 'Später prüfen' });
  });
});

describe('Kontext im Zeigen-Modus', () => {
  it('zu: kein Panel, Knopf „Kontext (K)“ mit aria-expanded=false', () => {
    const h = zeigen({ kontextOffen: false });
    expect(h).not.toContain('zg-kontext');
    expect(h).not.toContain('Wir glauben');
    expect(h).toMatch(/aria-expanded="false"[^>]*>.*?Kontext \(K\)/);
    expect(h).toContain('class="zg-flaeche"');
  });

  it('offen: Panel neben dem Snapshot, Reiter Annahmen gewählt', () => {
    const h = zeigen();
    expect(h).toMatch(/aria-expanded="true"[^>]*>.*?Kontext \(K\)/);
    expect(h).toContain('class="zg-flaeche zg-mit-kontext"');
    expect(h.match(/class="snap"/g)).toHaveLength(1);
    expect(h).toMatch(/aria-pressed="true"[^>]*>Annahmen</);
    expect(h).toMatch(/aria-pressed="false"[^>]*>Leitfaden</);
    expect(text(h)).not.toContain('Kernfragen');
  });

  it('Annahmen: ID, Text, Art, Wichtigkeit, Beleg, Feld, Beleg-IDs und Notiz', () => {
    const [, t] = zeile(zeigen(), 'A1');
    expect(t).toContain('A1');
    expect(t).toContain('Wir glauben, dass Pendler*innen schon vor der Ankunft');
    expect(t).toContain('wünschenswert · wichtig: hoch · Beleg: gesagt · Zuerst testen');
    expect(t).toContain('I2-4');
    expect(t).toContain('spricht dagegen');
    expect(zeile(zeigen(), 'A2')[1]).toContain('machbar · wichtig: hoch · Beleg: getan · Beleg prüfen, darauf bauen');
    expect(zeile(zeigen(), 'A3')[1]).toContain('Beleg: noch keiner');
    expect(zeilen(zeigen())).toHaveLength(4);
  });

  it('riskanteste Annahme markiert, die anderen nicht', () => {
    const h = zeigen();
    expect(zeile(h, 'A1')[1]).toContain('riskanteste');
    expect(zeilen(h).filter(([, t]) => t.includes('riskanteste'))).toHaveLength(1);
  });

  it('hervorgehoben: Annahmen mit Beleg aus dem gezeigten Snapshot – bei I2 A1, bei I3 A3', () => {
    const bei2 = zeigen({ nr: 1 });
    expect(zeile(bei2, 'A1')[0]).toContain('zg-belegt');
    expect(zeile(bei2, 'A1')[1]).toContain('Beleg aus diesem Interview');
    expect(zeilen(bei2).filter(([k]) => k.includes('zg-belegt')).map(([, t]) => t.slice(0, 2))).toStrictEqual(['A1']);
    expect(bei2).toContain('<span class="zg-id zg-id-hier">I2-4</span>');
    const bei3 = zeigen({ nr: 2 });
    expect(zeilen(bei3).filter(([k]) => k.includes('zg-belegt')).map(([, t]) => t.slice(0, 2))).toStrictEqual(['A3']);
    expect(bei3).toContain('<span class="zg-id">I2-4</span>');
  });

  it('keine Warnungen und keine Zahlen', () => {
    const t = text(zeigen());
    expect(t).not.toMatch(/ohne Beleg|fehlt|Lücke|von 4|\d+ Annahmen/);
  });

  it('Leitfaden: Ziel, Kern- und Nachfragen mit ID; Wen, Einstieg und Abschluss nicht', () => {
    const h = zeigen({ kontextReiter: 'leitfaden' });
    const t = text(h);
    expect(h).toMatch(/aria-pressed="true"[^>]*>Leitfaden</);
    expect(t).toContain('Ziel' + LF.ziel);
    expect(t).toContain('KernfragenF1 Erzähl mir vom letzten Morgen');
    expect(t).toContain('NachfragenF6 Warum?');
    expect(t).not.toContain(LF.wen);
    expect(t).not.toContain('Danke, dass du dir Zeit nimmst');
    expect(t).not.toContain(LF.abschluss);
    expect(zeilen(h)).toHaveLength(0);
  });

  it('leer, fehlend, unlesbar: ein neutraler Satz', () => {
    const leer = kontext({ annahmen: teil({ ...AN, annahmen: [] }), leitfaden: teil(null) });
    expect(text(zeigen({ kontext: leer }))).toContain('Noch keine Annahmen eingetragen.');
    expect(text(zeigen({ kontext: leer, kontextReiter: 'leitfaden' }))).toContain('Noch kein Leitfaden.');
    expect(text(zeigen({ kontext: kontext({ annahmen: teil(null) }) }))).toContain('Noch keine Annahmen eingetragen.');
  });

  it('vor dem ersten Laden (Start, Personenwechsel): „lädt …“, nie „Noch keine …“', () => {
    for (const kontextReiter of ['annahmen', 'leitfaden'] as const) {
      const t = text(zeigen({ kontext: KONTEXT_LEER, kontextReiter }));
      expect(t).not.toContain('Noch keine Annahmen eingetragen.');
      expect(t).not.toContain('Noch kein Leitfaden.');
      expect(t).toContain('lädt …');
    }
  });

  it('Meldung im Kopf: mit offenem Kontext auch dessen Änderungen, zugeklappt nicht', () => {
    const k = kontext({ annahmen: teil(AN, ANNAHMEN as Annahmen) });
    expect(text(zeigen({ kontext: k, meldung: 'Nichts Neues gespeichert' }))).toContain('Neu oder geändert: A1, A3 · Stand');
    expect(text(zeigen({ kontext: k, meldung: 'Nichts Neues gespeichert', kontextOffen: false }))).toContain('Nichts Neues gespeichert · Stand');
  });

  it('doppelte Beleg-ID: beide Chips', () => {
    const a = { ...AN, annahmen: [{ ...AN.annahmen[0], belegIds: ['I2-4', 'I2-4'] }] };
    expect(zeigen({ kontext: kontext({ annahmen: teil(a) }) }).match(/<span class="zg-id zg-id-hier">I2-4<\/span>/g)).toHaveLength(2);
  });

  it('lädt und Fehler: neutral', () => {
    expect(text(zeigen({ kontext: { ...KONTEXT_LEER, annahmen: { stand: null, laedt: true, fehler: false } } }))).toContain('lädt …');
    expect(text(zeigen({ kontext: { ...KONTEXT_LEER, annahmen: { stand: null, laedt: false, fehler: true } } }))).toContain('Lässt sich gerade nicht laden.');
  });

  it('nach Neu laden: neue oder geänderte Zeilen mit Marke „neu“, beim ersten Laden keine', () => {
    expect(zeigen()).not.toContain('snap-neu');
    const alt = ANNAHMEN as Annahmen;
    const h = zeigen({ kontext: kontext({ annahmen: teil(AN, alt) }) });
    expect(zeilen(h).filter(([k]) => k.includes('snap-neu')).map(([, t]) => t.slice(0, 2))).toStrictEqual(['A1', 'A3']);
    expect(h.match(/class="snap-neu-marke"/g)).toHaveLength(2);
    const lf = { ...LF, fragen: [...LF.fragen, { id: 'F10', text: 'Warum der Automat?', art: 'nachfrage' as const }] };
    const hl = zeigen({ kontextReiter: 'leitfaden', kontext: kontext({ leitfaden: teil(lf, LF) }) });
    expect(text(hl)).toContain('F10 Warum der Automat? neu');
    expect(hl.match(/class="snap-neu-marke"/g)).toHaveLength(1);
  });
});

describe('Kontext im Leser der Lehrenden: nie Feedback, Lücken oder roher Text', () => {
  const artefakt: LehrendenArtefakt = { name: 'interviews', stand: 'vorhanden', umfang: '5 von 5 Snapshots', fehlt: ['FEHLT-MARKE'], leer: false, faelligZuTag: 2, faellig: true, commits: 1, mehr: false, zuletzt: null, feedback: null };
  const fb = [{ id: 'f1', von: 'lehrende', text: 'FEEDBACK-MARKE zu A1', zeile: 'A1' }] as never;
  // So kommt die Antwort von GET /api/werkstatt/lehrende/artefakt: mit Feedback.
  const antwortA: LehrendenInhalt = { name: 'annahmen', stand: 'vorhanden', daten: AN, roh: null, feedback: fb };
  const antwortL: LehrendenInhalt = { name: 'leitfaden', stand: 'unlesbar', daten: null, roh: '{"ROH-MARKE": 1}', feedback: fb };
  const k: Kontext = {
    annahmen: { laedt: false, fehler: false, stand: { daten: kontextDaten('annahmen', antwortA), vorher: null } },
    leitfaden: { laedt: false, fehler: false, stand: { daten: kontextDaten('leitfaden', antwortL), vorher: null } },
  };
  const lesen: LeserInhaltProps = {
    ansicht: { kohorte: 'k', bezug: null, personen: [] } as never,
    p: { kuerzel: 'sofie', zustand: 'bereit', repo: 'x/sofie', repoUrl: 'https://github.com/x/sofie', artefakte: [artefakt], luecken: [{ artefakt: 'annahmen', text: 'LUECKE-MARKE' }] } as never,
    a: artefakt,
    inhalt: { schluessel: 'k/sofie/interviews', zustand: 'bereit', inhalt: { name: 'interviews', stand: 'vorhanden', daten: KAFFEEBAR, roh: null, feedback: fb } },
    wechseln: () => {}, schliessen: () => {}, feedbackGeschrieben: () => {}, zeigenStarten: () => {},
  };

  it.each(['annahmen', 'leitfaden'] as const)('Reiter %s: Daten der Person ja, Feedback/Lücken/roh nein', (reiter) => {
    const h = renderToStaticMarkup(<LeserKoerper zeigen={props({ kontext: k, kontextReiter: reiter })} lesen={lesen} />);
    expect(h).toContain('zg-kontext');
    expect(h).not.toContain('FEEDBACK-MARKE');
    expect(h).not.toContain('LUECKE-MARKE');
    expect(h).not.toContain('FEHLT-MARKE');
    expect(h).not.toContain('ROH-MARKE');
    expect(h).not.toMatch(/class="fb|href=/);
    // Gegenprobe: die Daten der Person stehen da.
    if (reiter === 'annahmen') expect(text(h)).toContain('A1');
    else expect(text(h)).toContain('Noch kein Leitfaden.');
  });
});
