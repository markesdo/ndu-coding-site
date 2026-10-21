import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { beamerSchalten, einstieg, type Speicher, type Wurzel } from './beamer';

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

describe('einstieg', () => {
  it('Präsentator: Knopf „Beamer starten“', () => {
    expect(einstieg(wurzel('data-ist-praesentator'))).toBe('knopf');
  });
  it('alle anderen: Link „Präsentator“', () => {
    expect(einstieg(wurzel())).toBe('link');
  });
  it('im Beamer-Modus nichts', () => {
    expect(einstieg(wurzel('data-ist-praesentator', 'data-beamer'))).toBe('nichts');
  });
});

describe('beamerSchalten', () => {
  it('ohne Präsentator-Schlüssel tut Einschalten nichts (Knopf per DevTools eingeblendet)', () => {
    const r = wurzel();
    const s = speicher();
    expect(beamerSchalten(r, true, { speicher: s })).toBe(false);
    expect(r.hasAttribute('data-beamer')).toBe(false);
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
    beamerSchalten(r, true, { hell: false });
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
});

describe('Einbau', () => {
  const lies = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8');
  it('Startseite und Innolab-Übersicht zeigen den Einstieg, die Innolab-Seite über den Layout-Knopf', () => {
    expect(lies('../pages/start.astro')).toMatch(/<PraesentatorEinstieg \/>/);
    expect(lies('../pages/innolab/index.astro')).toMatch(/<PraesentatorEinstieg layout \/>/);
  });
  it('Layout.astro schaltet über dieselbe Regel', () => {
    expect(lies('../layouts/Layout.astro')).toMatch(/beamerSchalten\(root, an/);
  });
});
