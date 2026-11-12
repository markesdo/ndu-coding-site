// Fragen-Leiste im Zeigen-Modus: eine der vier Fragen der Besprechungsrunde unten am geteilten Bildschirm (Tasten 1–4
// und F). Klicks, Fokus und das Zusammenspiel mit ←/→, K und Esc im Browser: werkzeuge/e2e/zeigen-fragen.mjs.
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import KAFFEEBAR from '../beispiele/interviews.json';
import type { Interview } from '../schemas/index.js';
import DemoZeigen from './DemoZeigen';
import { FRAGEN, fragenTaste, frageText } from './fragen-leiste';
import { KONTEXT_LEER } from './kontext-hilfen';
import { LeserKoerper } from './LehrendenAnsicht';
import Zeigen, { type ZeigenProps } from './Zeigen';

const IVS = KAFFEEBAR.interviews as Interview[];
const text = (h: string) => h.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"');
const props = (x: Partial<ZeigenProps> = {}): ZeigenProps => ({
  personen: [{ kuerzel: 'sofie', anzahl: 5 }], person: 'sofie', interviews: IVS, vorher: null, nr: 1, laedt: false, fehler: null,
  stand: Date.UTC(2026, 10, 12, 13, 5), jetzt: Date.UTC(2026, 10, 12, 13, 6), meldung: '',
  kontext: KONTEXT_LEER, kontextOffen: false, kontextReiter: 'annahmen', kontextUmschalten: () => {}, reiterWaehlen: () => {},
  frage: 0, fragenOffen: true, frageWaehlen: () => {}, fragenUmschalten: () => {},
  personWaehlen: () => {}, nrWaehlen: () => {}, blaettern: () => {}, neuLaden: () => {}, beenden: () => {}, ...x,
});
const zeigen = (x: Partial<ZeigenProps> = {}) => renderToStaticMarkup(<Zeigen {...props(x)} />);
/** Die Leiste: alles ab <footer class="zg-leiste"> bis </footer>; null, wenn es keine gibt. */
const leiste = (h: string) => h.match(/<footer class="zg-leiste[^"]*"[^>]*>.*?<\/footer>/)?.[0] ?? null;
const frageIn = (h: string) => text(h.match(/<p class="zg-leiste-text"[^>]*>(.*?)<\/p>/)?.[1] ?? '');

const WORTLAUT = [
  'Frage 1/4 · Was wurde gesagt? Die wichtigsten Zitate. → Snapshot',
  'Frage 2/4 · Was ändert sich? Welche Annahme wird gestützt, welche wackelt? → Kontext: Annahmen',
  'Frage 3/4 · Welche Fragen haben funktioniert, welche nicht? → Kontext: Leitfaden · zuerst, wer präsentiert',
  'Frage 4/4 · Was haben wir überhört? → Alle Zitate und Notizen',
];

describe('Fragen der Besprechung', () => {
  it('Wortlaut wie auf der Folie, an einer Stelle', () => {
    expect(FRAGEN).toStrictEqual([
      { frage: 'Was wurde gesagt? Die wichtigsten Zitate.', wo: 'Snapshot' },
      { frage: 'Was ändert sich? Welche Annahme wird gestützt, welche wackelt?', wo: 'Kontext: Annahmen' },
      { frage: 'Welche Fragen haben funktioniert, welche nicht?', wo: 'Kontext: Leitfaden · zuerst, wer präsentiert' },
      { frage: 'Was haben wir überhört?', wo: 'Alle Zitate und Notizen' },
    ]);
    expect([0, 1, 2, 3].map(frageText)).toStrictEqual(WORTLAUT);
  });

  it('Tasten 1–4 wählen die Frage, F blendet ein und aus', () => {
    expect(['1', '2', '3', '4'].map((key) => fragenTaste({ key }))).toStrictEqual([0, 1, 2, 3].map((nr) => ({ art: 'frage', nr })));
    expect(fragenTaste({ key: 'f' })).toStrictEqual({ art: 'umschalten' });
    expect(fragenTaste({ key: 'F' })).toStrictEqual({ art: 'umschalten' });
  });

  it('andere Tasten bleiben bei ihren Handlern: 0, 5, K, ←/→, Esc', () => {
    for (const key of ['0', '5', '9', 'k', 'K', 'ArrowLeft', 'ArrowRight', 'Escape', 'Enter', ' ']) expect(fragenTaste({ key })).toBeNull();
  });

  it('nicht mit Strg/Cmd/Alt und nicht beim Tippen', () => {
    for (const key of ['2', 'f']) {
      expect(fragenTaste({ key, metaKey: true })).toBeNull();
      expect(fragenTaste({ key, ctrlKey: true })).toBeNull();
      expect(fragenTaste({ key, altKey: true })).toBeNull();
      expect(fragenTaste({ key, target: { tagName: 'INPUT' } as never })).toBeNull();
      expect(fragenTaste({ key, target: { tagName: 'TEXTAREA' } as never })).toBeNull();
      expect(fragenTaste({ key, target: { tagName: 'SELECT' } as never })).toBeNull();
      expect(fragenTaste({ key, target: { tagName: 'DIV', isContentEditable: true } as never })).toBeNull();
      expect(fragenTaste({ key, target: { tagName: 'DIV' } as never })).not.toBeNull();
      expect(fragenTaste({ key, target: { tagName: 'BUTTON' } as never })).not.toBeNull();
    }
  });
});

describe('Fragen-Leiste im Zeigen-Modus', () => {
  it('Start: Frage 1 sichtbar, Knopf 1 gedrückt', () => {
    const h = zeigen();
    expect(leiste(h)).not.toBeNull();
    expect(frageIn(h)).toBe(WORTLAUT[0]);
    expect([...leiste(h)!.matchAll(/<button[^>]*aria-pressed="(true|false)"[^>]*>(\d)<\/button>/g)].map((m) => [m[2], m[1]]))
      .toStrictEqual([['1', 'true'], ['2', 'false'], ['3', 'false'], ['4', 'false']]);
  });

  it('jede der vier Fragen, genau im Wortlaut', () => {
    expect([0, 1, 2, 3].map((frage) => frageIn(zeigen({ frage })))).toStrictEqual(WORTLAUT);
  });

  it('nur fester Kursinhalt: keine Daten aus der Mappe, keine Zahlen außer „Frage n/4“', () => {
    const t = text(leiste(zeigen({ frage: 1, kontextOffen: true }))!);
    expect(t.replace(/\s+/g, ' ')).not.toMatch(/sofie|I\d|A\d|Snapshot \d|Stand/);
  });

  it('F aus: keine Frage auf dem Bildschirm, nur der Knopf zum Einblenden', () => {
    const h = zeigen({ fragenOffen: false, frage: 2 });
    expect(text(h)).not.toContain('Frage 3/4');
    expect(text(h)).not.toContain(FRAGEN[2].frage);
    expect(leiste(h)).toMatch(/aria-expanded="false"[^>]*>.*?Fragen \(F\)/);
  });

  it('eingeblendet: Knopf zum Ausblenden mit aria-expanded=true und Kürzel F', () => {
    expect(leiste(zeigen())).toMatch(/<button[^>]*aria-expanded="true"[^>]*aria-keyshortcuts="F"[^>]*aria-label="Fragen ausblenden \(F\)"/);
  });

  it('unter Snapshot und Kontext, nicht darin (eigene Zeile unten)', () => {
    const h = zeigen({ kontextOffen: true });
    const flaeche = h.indexOf('class="zg-flaeche');
    const fuss = h.indexOf('<footer class="zg-leiste');
    expect(flaeche).toBeGreaterThan(0);
    expect(fuss).toBeGreaterThan(h.indexOf('id="zg-kontext"'));
    expect(h.endsWith('</footer></div>')).toBe(true);
  });

  it('außerhalb von Zeigen keine Leiste: Leser ohne Zeigen und Demo zu', () => {
    const lesen = {
      ansicht: { kohorte: 'k', bezug: null, personen: [] } as never,
      p: { kuerzel: 'sofie', zustand: 'bereit', repo: 'x/sofie', repoUrl: 'https://github.com/x/sofie', artefakte: [], luecken: [] } as never,
      a: { name: 'interviews', stand: 'vorhanden', umfang: '', fehlt: [], leer: false, faelligZuTag: 2, faellig: true, commits: 1, mehr: false, zuletzt: null, feedback: null } as never,
      inhalt: { schluessel: 'k/sofie/interviews', zustand: 'bereit', inhalt: { name: 'interviews', stand: 'vorhanden', daten: KAFFEEBAR, roh: null, feedback: [] } } as never,
      wechseln: () => {}, schliessen: () => {}, feedbackGeschrieben: () => {}, zeigenStarten: () => {},
    };
    for (const h of [renderToStaticMarkup(<LeserKoerper zeigen={null} lesen={lesen} />), renderToStaticMarkup(<DemoZeigen person="Demo-Mappe" />)]) {
      expect(h).not.toContain('zg-leiste');
      expect(h).not.toContain(FRAGEN[0].frage);
    }
    // Gegenprobe: im Zeigen-Modus des Lesers steht sie da.
    expect(frageIn(renderToStaticMarkup(<LeserKoerper zeigen={props()} lesen={lesen} />))).toBe(WORTLAUT[0]);
  });
});
