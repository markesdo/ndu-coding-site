import { describe, expect, it } from 'vitest';
import { beamerSchalten, einstieg, klickAktion, praesentatorAngemeldet, type Seitenart, type Speicher, type Wurzel } from './beamer';

// Ersatz für document.documentElement und localStorage (vitest läuft hier ohne DOM).
function wurzel(...attrs: string[]): Wurzel & { attrs: Map<string, string> } {
  const m = new Map(attrs.map((a) => [a, '']));
  return {
    attrs: m,
    hasAttribute: (n) => m.has(n),
    setAttribute: (n, v) => { m.set(n, v); },
    removeAttribute: (n) => { m.delete(n); },
    toggleAttribute: (n, an) => { const ja = an ?? !m.has(n); if (ja) m.set(n, ''); else m.delete(n); return ja; },
  };
}
function speicher(): Speicher & { daten: Map<string, string> } {
  const daten = new Map<string, string>();
  return { daten, setItem: (k, v) => { daten.set(k, v); }, removeItem: (k) => { daten.delete(k); } };
}
const lage = (praesentator: boolean, beamer: boolean, seite: Seitenart) => ({ praesentator, beamer, seite });

describe('einstieg', () => {
  for (const seite of ['start', 'layout'] as const) {
    it(`${seite}: Präsentator sieht „Beamer starten“`, () => {
      expect(einstieg(lage(true, false, seite))).toBe('starten');
    });
    it(`${seite}: alle anderen sehen den Link „Präsentator“`, () => {
      expect(einstieg(lage(false, false, seite))).toBe('link');
    });
  }
  it('/start im Beamer-Modus: „Beamer beenden“, auch ohne Schlüssel', () => {
    expect(einstieg(lage(true, true, 'start'))).toBe('beenden');
    expect(einstieg(lage(false, true, 'start'))).toBe('beenden');
  });
  it('Layout-Seite im Beamer-Modus: nichts (dort gibt es den Knopf „Beamer“)', () => {
    expect(einstieg(lage(true, true, 'layout'))).toBe('nichts');
  });
});

describe('klickAktion', () => {
  it('Klick von Studierenden (Knopf per DevTools eingeblendet) tut nichts', () => {
    expect(klickAktion(lage(false, false, 'start'))).toBeNull();
    expect(klickAktion(lage(false, false, 'layout'))).toBeNull();
  });
  it('/start schaltet ein und behält sein Farbschema (hell: false)', () => {
    expect(klickAktion(lage(true, false, 'start'))).toStrictEqual({ an: true, hell: false });
  });
  it('Layout-Seite schaltet ein mit hellem Thema', () => {
    expect(klickAktion(lage(true, false, 'layout'))).toStrictEqual({ an: true, hell: true });
  });
  it('im Beamer-Modus schaltet der Klick aus – auch ohne Schlüssel', () => {
    expect(klickAktion(lage(false, true, 'start'))).toStrictEqual({ an: false, hell: false });
    expect(klickAktion(lage(true, true, 'layout'))).toStrictEqual({ an: false, hell: true });
  });
  it('Klick von Studierenden über die ganze Kette: Beamer bleibt aus, nichts gespeichert', () => {
    const r = wurzel();
    const s = speicher();
    const a = klickAktion(lage(r.hasAttribute('data-ist-praesentator'), false, 'start'));
    if (a) beamerSchalten(r, a.an, { hell: a.hell, speicher: s });
    expect(r.hasAttribute('data-beamer')).toBe(false);
    expect([...s.daten.keys()]).toStrictEqual([]);
  });
});

describe('beamerSchalten', () => {
  it('ohne Präsentator-Schlüssel tut Einschalten nichts', () => {
    const r = wurzel();
    const s = speicher();
    expect(beamerSchalten(r, true, { speicher: s })).toBe(false);
    expect([...r.attrs.keys()]).toStrictEqual([]);
    expect([...s.daten.keys()]).toStrictEqual([]);
  });
  it('beim Präsentator: Beamer an, helles Thema, Wahl gemerkt', () => {
    const r = wurzel('data-ist-praesentator');
    const s = speicher();
    expect(beamerSchalten(r, true, { speicher: s })).toBe(true);
    expect(r.hasAttribute('data-beamer')).toBe(true);
    expect(r.attrs.get('data-theme')).toBe('light');
    expect(s.daten.get('ndu-beamer')).toBe('1');
  });
  it('/start (hell: false) behält sein Farbschema', () => {
    const r = wurzel('data-ist-praesentator');
    r.setAttribute('data-theme', 'dark');
    beamerSchalten(r, true, { hell: false, speicher: speicher() });
    expect(r.hasAttribute('data-beamer')).toBe(true);
    expect(r.attrs.get('data-theme')).toBe('dark');
  });
  it('ausschalten geht immer, auch ohne Schlüssel', () => {
    const r = wurzel('data-beamer');
    r.setAttribute('data-theme', 'light');
    const s = speicher();
    s.setItem('ndu-beamer', '1');
    expect(beamerSchalten(r, false, { speicher: s })).toBe(true);
    expect([...r.attrs.keys()]).toStrictEqual([]);
    expect(s.daten.has('ndu-beamer')).toBe(false);
  });
  it('ein Speicher, der wirft (gesperrte Website-Daten), bricht das Umschalten nicht ab', () => {
    const r = wurzel('data-ist-praesentator');
    const kaputt: Speicher = { setItem: () => { throw new Error('gesperrt'); }, removeItem: () => { throw new Error('gesperrt'); } };
    expect(beamerSchalten(r, true, { speicher: kaputt })).toBe(true);
    expect(r.hasAttribute('data-beamer')).toBe(true);
  });
});

describe('praesentatorAngemeldet', () => {
  it('liest den Schlüssel; ohne oder mit werfendem Speicher: nein', () => {
    expect(praesentatorAngemeldet({ getItem: (k) => (k === 'ndu-presenter' ? 'x' : null) })).toBe(true);
    expect(praesentatorAngemeldet({ getItem: () => null })).toBe(false);
    expect(praesentatorAngemeldet({ getItem: () => { throw new Error('gesperrt'); } })).toBe(false);
    expect(praesentatorAngemeldet(undefined)).toBe(false);
  });
});
