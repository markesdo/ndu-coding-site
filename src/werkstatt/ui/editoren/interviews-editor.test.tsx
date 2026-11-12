import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Chance } from '../../schemas/index.js';
import BelegAuswahl from './BelegAuswahl';
import IdZeile, { IdZeileAnsicht, idKopieren } from './IdKopieren';
import { ChanceZeile, EinsichtZeile, Vorschau } from './InterviewsEditor';
import { neuesInterview } from './interviews-hilfen';

const HINWEIS = 'Diese Chance hat noch keinen Beleg – kreuze mindestens ein Zitat an.';
const ZITATE = [{ id: 'I1-1', text: 'Wenn ich auf die Uhr schauen muss, geh ich.' }];

const zeile = (chance: Chance, fehler: (pfad: string) => string | undefined = () => undefined) =>
  renderToStaticMarkup(<ChanceZeile chance={chance} setze={() => {}} nr={1} zitate={ZITATE} fehler={fehler} />);

describe('Interview-Editor: Belege der Chance zum Ankreuzen', () => {
  it('ChanceZeile zeigt die Zitate des Interviews mit Text als Kästchen, die gewählten angekreuzt', () => {
    const h = zeile({ text: 'Will nicht warten.', belege: ['I1-1'] });
    expect(h).toContain('class="wk-verweise wk-belegwahl"');
    expect(h).toMatch(/<label class="wk-beleg"><input type="checkbox" checked=""\/><span class="wk-karte-nr">I1-1<\/span><span class="wk-beleg-text">„Wenn ich auf die Uhr schauen muss, geh ich\.“<\/span><\/label>/);
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
    expect(h).toMatch(/<p class="wk-hilfe" id="[^"]+">Noch keine Zitate/);
    expect(h).toContain('Noch keine Zitate: Trag zuerst oben unter „Zitate“ ein, was die Person wörtlich gesagt hat. Dann kannst du sie hier ankreuzen.</p>');
    expect(wahl()).not.toContain('Noch keine Zitate');
  });

  it('Waise: angekreuzte Zeile „gibt es nicht mehr“ am Ende, zum Abwählen', () => {
    const z = zeilen(wahl({ werte: ['I6-4', 'I6-1'] }));
    expect(z.map(text)).toStrictEqual([`I6-1 „${LANG}“`, 'I6-2 „Wenn ich auf die Uhr schauen muss, geh ich.“', 'I6-3 „Am liebsten hätte ich den Becher schon in der Hand.“', 'I6-4 – dieses Zitat gibt es nicht mehr']);
    expect(z.map((x) => x.includes('checked'))).toStrictEqual([true, false, false, true]);
  });

  it('Fehler ersetzt den Hinweis; das Fieldset nennt Hilfe und Fehler, nicht den Hinweis', () => {
    const h = wahl({ hilfe: 'Kreuze die Zitate an.', fehler: 'Beleg I6-9 ist kein Zitat dieses Interviews.', hinweis: 'Diese Chance hat noch keinen Beleg – kreuze mindestens ein Zitat an.' });
    const ids = (/<fieldset class="wk-verweise wk-belegwahl" aria-describedby="([^"]+)">/.exec(h)?.[1] ?? '').split(' ');
    const fehlerId = /<p class="wk-fehler" id="([^"]+)">Beleg I6-9/.exec(h)?.[1];
    const hilfeId = /<p class="wk-hilfe" id="([^"]+)">Kreuze/.exec(h)?.[1];
    expect(ids).toStrictEqual([hilfeId, fehlerId]);
    expect(ids.some((x) => x.endsWith('-hinweis'))).toBe(false);
    expect(h).not.toContain('wk-feldhinweis');
  });

  it('mit Fehler: jedes Kästchen ist ungültig markiert und mit dem Fehler verknüpft', () => {
    const h = wahl({ werte: ['I6-4'], fehler: 'I6-4 gibt es in I6 nicht.' });
    const fehlerId = /<p class="wk-fehler" id="([^"]+)">/.exec(h)?.[1];
    const kaestchen = [...h.matchAll(/<input type="checkbox"[^>]*>/g)].map((m) => m[0]);
    expect(kaestchen).toHaveLength(4);
    for (const k of kaestchen) {
      expect(k).toContain('aria-invalid="true"');
      expect(k).toContain(`aria-describedby="${fehlerId}"`);
    }
    expect(wahl()).not.toContain('aria-invalid');
  });

  it('Leerzustand ist mit dem Fieldset verknüpft', () => {
    const h = wahl({ zitate: [] });
    const leerId = /<p class="wk-hilfe" id="([^"]+)">Noch keine Zitate/.exec(h)?.[1];
    expect(leerId).toBeTruthy();
    expect(h).toContain(`<fieldset class="wk-verweise wk-belegwahl" aria-describedby="${leerId}">`);
  });

  it('gewähltes Zitat mit leerem Text: Zeile „(Zitat noch leer)“, angekreuzt, keine Waise', () => {
    const z = zeilen(wahl({ zitate: [{ id: 'I6-1', text: '' }, ...DREI.slice(1)], werte: ['I6-1'] }));
    expect(z.map(text)).toStrictEqual(['I6-1 (Zitat noch leer)', 'I6-2 „Wenn ich auf die Uhr schauen muss, geh ich.“', 'I6-3 „Am liebsten hätte ich den Becher schon in der Hand.“']);
    expect(z.map((x) => x.includes('checked'))).toStrictEqual([true, false, false]);
    expect(z[0]).toContain('wk-beleg-leer');
  });

  it('leeres, nicht gewähltes Zitat: keine Zeile', () => {
    expect(zeilen(wahl({ zitate: [{ id: 'I6-1', text: '' }, ...DREI.slice(1)] })).map(text)).toHaveLength(2);
  });

  it('doppelte Zitat-IDs im Entwurf: beide Zeilen, ohne Absturz', () => {
    expect(zeilen(wahl({ zitate: [DREI[1]!, DREI[1]!] })).map(text)).toStrictEqual(['I6-2 „Wenn ich auf die Uhr schauen muss, geh ich.“', 'I6-2 „Wenn ich auf die Uhr schauen muss, geh ich.“']);
  });
});

const details = (h: string) => /<details class="wk-belege-auswahl"([^>]*)>/.exec(h);
const gewaehlt = (h: string) => {
  const liste = /<ul class="wk-belege-gewaehlt"[^>]*>(.*?)<\/ul>/.exec(h)?.[1];
  return liste === undefined ? undefined : [...liste.matchAll(/<li[^>]*>(.*?)<\/li>/g)].map((m) => text(m[1]!));
};
const summary = (h: string) => /<summary[^>]*>(.*?)<\/summary>/.exec(h)?.[1]?.replace(/<!-- -->/g, '');

describe('BelegAuswahl: Auswahl einklappbar, Gewähltes immer sichtbar', () => {
  it('offen (mit Fehler): keine Liste gewählter Zitate über den Kästchen – die Haken zeigen dasselbe', () => {
    const h = wahl({ werte: ['I6-1'], fehler: 'Kaputt.' });
    expect(details(h)?.[1]).toBe(' open=""');
    expect(gewaehlt(h)).toBeUndefined();
  });

  it('Zähler: gewählte und alle zählen nur Zitate mit Text; leere und Waisen stehen in der Liste', () => {
    const h = wahl({ zitate: [{ id: 'I6-1', text: '' }, { id: 'I6-2', text: 'x' }], werte: ['I6-1', 'I6-9'] });
    expect(summary(h)).toBe('Zitate auswählen (0 von 1 gewählt)');
    expect(gewaehlt(h)).toStrictEqual(['I6-1 (Zitat noch leer)', 'I6-9 – dieses Zitat gibt es nicht mehr']);
  });

  it('doppelte Zitat-ID im Entwurf: in der Liste und im Zähler nur einmal', () => {
    const h = wahl({ zitate: [DREI[1]!, DREI[1]!], werte: ['I6-2'] });
    expect(gewaehlt(h)).toStrictEqual(['I6-2 „Wenn ich auf die Uhr schauen muss, geh ich.“']);
    expect(summary(h)).toBe('Zitate auswählen (1 von 1 gewählt)');
  });

  it('ohne Belege: Auswahl offen, keine Liste gewählter Zitate', () => {
    const h = wahl();
    expect(details(h)?.[1]).toBe(' open=""');
    expect(gewaehlt(h)).toBeUndefined();
  });

  it('mit Belegen: Auswahl zu, darüber genau die gewählten Zitate mit vollem Text', () => {
    const h = wahl({ werte: ['I6-1', 'I6-3'] });
    expect(details(h)?.[1]).toBe('');
    expect(gewaehlt(h)).toStrictEqual([`I6-1 „${LANG}“`, 'I6-3 „Am liebsten hätte ich den Becher schon in der Hand.“']);
    expect(h.indexOf('wk-belege-gewaehlt')).toBeLessThan(h.indexOf('<details'));
    // Die Kästchen stecken alle in der Auswahl.
    const innen = /<details[^>]*>(.*)<\/details>/.exec(h)?.[1] ?? '';
    expect(zeilen(innen)).toHaveLength(3);
  });

  it('Waise und leeres Zitat stehen in der Liste der gewählten; die Waise bleibt zum Abwählen in der Auswahl', () => {
    const h = wahl({ zitate: [{ id: 'I6-1', text: '' }, ...DREI.slice(1)], werte: ['I6-1', 'I6-9'] });
    expect(gewaehlt(h)).toStrictEqual(['I6-1 (Zitat noch leer)', 'I6-9 – dieses Zitat gibt es nicht mehr']);
    const innen = /<details[^>]*>(.*)<\/details>/.exec(h)?.[1] ?? '';
    expect(zeilen(innen).filter((z) => z.includes('checked')).map(text)).toStrictEqual(['I6-1 (Zitat noch leer)', 'I6-9 – dieses Zitat gibt es nicht mehr']);
  });

  it('mit Fehler: Auswahl offen, auch wenn Belege gewählt sind', () => {
    expect(details(wahl({ werte: ['I6-1'], fehler: 'Beleg I6-9 ist kein Zitat dieses Interviews.' }))?.[1]).toBe(' open=""');
  });

  it('Zusammenfassung zählt gewählte gegen Zitate mit Text', () => {
    expect(summary(wahl({ zitate: [...DREI, { id: 'I6-5', text: ' ' }], werte: ['I6-1', 'I6-2'] }))).toBe('Zitate auswählen (2 von 3 gewählt)');
    expect(summary(wahl())).toBe('Zitate auswählen (0 von 3 gewählt)');
  });

  it('ohne Zitate: keine Auswahl, nur der Leerzustand', () => {
    const h = wahl({ zitate: [] });
    expect(h).not.toContain('<details');
    expect(h).toContain('Noch keine Zitate');
  });

  it('Hilfe, Fehler und Hinweis stehen außerhalb der Auswahl, die Verknüpfung bleibt', () => {
    const h = wahl({ werte: ['I6-1'], hilfe: 'Kreuze die Zitate an.', hinweis: 'Hinweis.' });
    const aussen = h.replace(/<details.*<\/details>/, '');
    expect(aussen).toMatch(/<p class="wk-hilfe" id="[^"]+">Kreuze/);
    expect(aussen).toMatch(/<p class="wk-feldhinweis" id="[^"]+">Hinweis\.<\/p>/);
    const ids = (/<fieldset class="wk-verweise wk-belegwahl" aria-describedby="([^"]+)">/.exec(h)?.[1] ?? '').split(' ');
    expect(ids).toStrictEqual([/<p class="wk-hilfe" id="([^"]+)"/.exec(h)?.[1], /<p class="wk-feldhinweis" id="([^"]+)"/.exec(h)?.[1]]);
    const f = wahl({ werte: ['I6-1'], fehler: 'Kaputt.' }).replace(/<details.*<\/details>/, '');
    expect(f).toMatch(/<p class="wk-fehler" id="[^"]+">Kaputt\.<\/p>/);
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

describe('EinsichtZeile', () => {
  it('ist zweizeilig, damit ein ganzer Satz mit Zitat-IDs sichtbar bleibt', () => {
    const satz = 'Entscheidet erst in der Halle, nach Blick auf Tafel und Schlange; hat eine feste Grenze von sechs Leuten (I6-1, I6-8).';
    const html = renderToStaticMarkup(<EinsichtZeile wert={satz} setze={() => {}} nr={1} />);
    expect(html).toContain('<textarea');
    expect(html).toContain('rows="2"');
    expect(html).not.toContain('type="text"');
    expect(html).toContain(satz);
  });
});

describe('ID-Zeile: Zitat-ID kopieren', () => {
  afterEach(() => vi.unstubAllGlobals());
  const knopf = (h: string) => /<button[^>]*class="wk-id-kopieren"[^>]*>/.exec(h)?.[0] ?? '';

  it('Knopf neben der ID: type="button", deutscher Name mit der ID, Ansage-Bereich leer', () => {
    const h = renderToStaticMarkup(<IdZeile art="Zitat" id="I1-1" />);
    expect(h).toContain('ID: <strong>I1-1</strong>');
    expect(knopf(h)).toContain('type="button"');
    expect(knopf(h)).toContain('aria-label="Zitat-ID I1-1 kopieren"');
    expect(h).toMatch(/<svg[^>]*lucide-copy[^>]*aria-hidden="true"/);
    expect(h).toContain('<span class="wk-id-meldung" aria-live="polite"></span>');
  });

  it('Interview-ID: eigener Name', () => {
    expect(knopf(renderToStaticMarkup(<IdZeile art="Interview" id="I1" />))).toContain('aria-label="Interview-ID I1 kopieren"');
  });

  it('Klick kopiert genau die ID und meldet „kopiert“', async () => {
    const writeText = vi.fn(async () => {});
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    expect(await idKopieren('I1-1', null)).toBe('kopiert');
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith('I1-1');
  });

  it('Zwischenablage verweigert: „Zum Kopieren markiert“', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn(async () => { throw new Error('NotAllowedError'); }) } });
    expect(await idKopieren('I1-1', null)).toBe('Zum Kopieren markiert');
  });

  it('Zwischenablage fehlt ganz: „Zum Kopieren markiert“', async () => {
    vi.stubGlobal('navigator', {});
    expect(await idKopieren('I1-1', null)).toBe('Zum Kopieren markiert');
  });

  it('nach dem Kopieren: Häkchen statt Kopier-Symbol, „kopiert“ im Ansage-Bereich', () => {
    const h = renderToStaticMarkup(<IdZeileAnsicht art="Zitat" id="I1-1" meldung="kopiert" onKopieren={() => {}} />);
    expect(h).toMatch(/<svg[^>]*lucide-check[^>]*>/);
    expect(h).not.toMatch(/lucide-copy/);
    expect(h).toContain('<span class="wk-id-meldung" aria-live="polite">kopiert</span>');
  });

  it('nur markiert: Kopier-Symbol bleibt, Meldung sagt es', () => {
    const h = renderToStaticMarkup(<IdZeileAnsicht art="Zitat" id="I1-1" meldung="Zum Kopieren markiert" onKopieren={() => {}} />);
    expect(h).toMatch(/lucide-copy/);
    expect(h).not.toMatch(/lucide-check/);
    expect(h).toContain('aria-live="polite">Zum Kopieren markiert</span>');
  });

  it('der Knopf ruft beim Klick das Kopieren auf', () => {
    const onKopieren = vi.fn();
    const el = IdZeileAnsicht({ art: 'Zitat', id: 'I1-1', meldung: '', onKopieren });
    const btn = (el.props.children as React.ReactElement[]).find((c) => (c as React.ReactElement<{ className?: string }>)?.props?.className === 'wk-id-kopieren') as React.ReactElement<{ onClick: () => void }>;
    btn.props.onClick();
    expect(onKopieren).toHaveBeenCalledTimes(1);
  });
});
