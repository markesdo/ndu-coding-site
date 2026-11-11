import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { Chance } from '../../schemas/index.js';
import BelegAuswahl from './BelegAuswahl';
import { ChanceZeile, Vorschau } from './InterviewsEditor';
import { neuesInterview } from './interviews-hilfen';

const HINWEIS = 'Diese Chance hat noch keinen Beleg – kreuze mindestens ein Zitat an.';
const ZITATE = [{ id: 'I1-1', text: 'Wenn ich auf die Uhr schauen muss, geh ich.' }];

const zeile = (chance: Chance, fehler: (pfad: string) => string | undefined = () => undefined) =>
  renderToStaticMarkup(<ChanceZeile chance={chance} setze={() => {}} nr={1} zitate={ZITATE} fehler={fehler} />);

describe('Interview-Editor: Belege der Chance zum Ankreuzen', () => {
  it('ChanceZeile zeigt die Zitate des Interviews mit Text als Kästchen, die gewählten angekreuzt', () => {
    const h = zeile({ text: 'Will nicht warten.', belege: ['I1-1'] });
    expect(h).toContain('class="wk-verweise wk-belegwahl"');
    expect(h).toMatch(/<label class="wk-beleg"><input type="checkbox" checked=""\/><span class="wk-karte-nr">I1-1<\/span><span>„Wenn ich auf die Uhr schauen muss, geh ich\.“<\/span><\/label>/);
  });

  it('ohne Zitate: nur der Leerzustand, kein zweiter Hinweis, der dasselbe sagt', () => {
    const h = renderToStaticMarkup(<ChanceZeile chance={{ text: 'Will nicht warten.', belege: [] }} setze={() => {}} nr={0} zitate={[]} fehler={() => undefined} />);
    expect(h.match(/zuerst oben/g)).toHaveLength(1);
    expect(h).not.toContain('wk-feldhinweis');
  });
});

describe('Interview-Editor: Beleg-Hinweis an der Chance (NDU-56)', () => {
  it('Chance mit Text und ohne Beleg: Hinweis am Feld „Belege“, mit aria-describedby verknüpft', () => {
    const h = zeile({ text: 'Will nicht in der Schlange warten.', belege: [] });
    const id = /<p class="wk-feldhinweis" id="([^"]+)">([^<]+)<\/p>/.exec(h);
    expect(id?.[2]).toBe(HINWEIS);
    expect(h).toContain(`aria-describedby="${id?.[1]}"`);
  });

  it('mit Beleg: kein Hinweis', () => {
    expect(zeile({ text: 'Will nicht in der Schlange warten.', belege: ['I1-1'] })).not.toContain('noch keinen Beleg');
  });

  it('frische, leere Chance: kein Hinweis', () => {
    expect(zeile({ text: '', belege: [] })).not.toContain('noch keinen Beleg');
  });

  it('Fehler am Feld „Belege“: Fehler statt Hinweis', () => {
    const h = zeile({ text: 'Will nicht in der Schlange warten.', belege: [] }, (pfad) => (pfad === 'belege' ? 'Belege müssen eine Liste von Zitat-IDs sein.' : undefined));
    expect(h).toContain('Belege müssen eine Liste von Zitat-IDs sein.');
    expect(h).not.toContain('noch keinen Beleg');
  });
});

const LANG = 'Ich stehe jeden Morgen um 7:29 in der Halle, sechs Leute vor mir, und rechne aus, ob der Kaffee den Zug heute noch zulässt.';
const DREI = [
  { id: 'I6-1', text: LANG },
  { id: 'I6-2', text: 'Wenn ich auf die Uhr schauen muss, geh ich.' },
  { id: 'I6-3', text: 'Am liebsten hätte ich den Becher schon in der Hand.' },
];
const wahl = (props: Partial<Parameters<typeof BelegAuswahl>[0]> = {}) =>
  renderToStaticMarkup(<BelegAuswahl label="Belege (Zitat-IDs)" zitate={DREI} werte={[]} onChange={() => {}} {...props} />);
const zeilen = (h: string) => [...h.matchAll(/<label class="wk-beleg[^"]*">(.*?)<\/label>/g)].map((m) => m[1]!);
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

describe('BelegAuswahl: Zitate zum Ankreuzen', () => {
  it('eine Zeile je Zitat mit Text, in Zitat-Reihenfolge, mit vollem Text (nicht gekürzt)', () => {
    expect(LANG.length).toBeGreaterThanOrEqual(120);
    const h = wahl({ zitate: [...DREI, { id: 'I6-5', text: '   ' }] });
    expect(zeilen(h).map(text)).toStrictEqual([`I6-1 „${LANG}“`, 'I6-2 „Wenn ich auf die Uhr schauen muss, geh ich.“', 'I6-3 „Am liebsten hätte ich den Becher schon in der Hand.“']);
  });

  it('angekreuzt ist nur die gewählte Zeile', () => {
    const z = zeilen(wahl({ werte: ['I6-2'] }));
    expect(z.map((x) => x.includes('checked'))).toStrictEqual([false, true, false]);
  });

  it('kein freies ID-Feld mehr: keine datalist, kein „Hinzufügen“, kein Beispiel „I2-4“', () => {
    const h = wahl({ werte: ['I6-1'] });
    expect(h).not.toContain('<datalist');
    expect(h).not.toContain('Hinzufügen');
    expect(h).not.toContain('I2-4');
    expect(h).not.toContain('type="text"');
  });

  it('ohne Zitat mit Text: Leerzustand statt Zeilen', () => {
    const h = wahl({ zitate: [{ id: 'I6-1', text: ' ' }] });
    expect(zeilen(h)).toStrictEqual([]);
    expect(h).toContain('<p class="wk-hilfe">Noch keine Zitate: Trag zuerst oben unter „Zitate“ ein, was die Person wörtlich gesagt hat. Dann kannst du sie hier ankreuzen.</p>');
    expect(wahl()).not.toContain('Noch keine Zitate');
  });

  it('Waise: angekreuzte Zeile „gibt es nicht mehr“ am Ende, zum Abwählen', () => {
    const z = zeilen(wahl({ werte: ['I6-4', 'I6-1'] }));
    expect(z.map(text)).toStrictEqual([`I6-1 „${LANG}“`, 'I6-2 „Wenn ich auf die Uhr schauen muss, geh ich.“', 'I6-3 „Am liebsten hätte ich den Becher schon in der Hand.“', 'I6-4 – dieses Zitat gibt es nicht mehr']);
    expect(z.map((x) => x.includes('checked'))).toStrictEqual([true, false, false, true]);
  });

  it('Fehler ersetzt den Hinweis; beschrieben wird das Fieldset', () => {
    const h = wahl({ fehler: 'Beleg I6-9 ist kein Zitat dieses Interviews.', hinweis: 'Diese Chance hat noch keinen Beleg – kreuze mindestens ein Zitat an.' });
    expect(h).toContain('Beleg I6-9 ist kein Zitat dieses Interviews.');
    expect(h).not.toContain('wk-feldhinweis');
    const ids = /<fieldset class="wk-verweise wk-belegwahl" aria-describedby="([^"]+)">/.exec(h)?.[1];
    expect(h).toContain(`<p class="wk-fehler" id="${ids}">`);
  });
});

describe('Interview-Vorschau: Chance ohne Beleg', () => {
  it('markiert nur die Chance ohne Beleg mit „– noch ohne Beleg“', () => {
    const iv = { ...neuesInterview([], '2026-11-12'), zitate: ZITATE, chancen: [
      { text: 'Ohne Beleg.', belege: [] },
      { text: 'Mit Beleg.', belege: ['I1-1'] },
    ] };
    const h = renderToStaticMarkup(<Vorschau daten={{ interviews: [iv] } as Parameters<typeof Vorschau>[0]['daten']} />);
    const punkte = [...h.matchAll(/<li>(.*?)<\/li>/g)].map((m) => m[1]!.replace(/<[^>]+>/g, ''));
    expect(punkte).toStrictEqual(['Ohne Beleg. – noch ohne Beleg', 'Mit Beleg. I1-1']);
  });
});
