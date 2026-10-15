import { describe, expect, it } from 'vitest';
import { BREAKPOINTS, INHALT_MAX, STEPS, aktiveKlassen, layoutBei, zustandAt } from './breite-steps';

describe('breite-steps', () => {
  it('hat acht Schritte mit Titel und Text', () => {
    expect(STEPS).toHaveLength(8);
    for (const s of STEPS) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.text.length).toBeGreaterThan(0);
    }
  });

  it('wirft bei Schritten außerhalb von 1–8 und bei Breiten außerhalb des Lineals', () => {
    expect(() => zustandAt(0)).toThrow(RangeError);
    expect(() => zustandAt(9)).toThrow(RangeError);
    expect(() => zustandAt(1.5)).toThrow(RangeError);
    expect(() => layoutBei(319)).toThrow(RangeError);
    expect(() => layoutBei(1441)).toThrow(RangeError);
  });

  it('Tailwind-Breakpoints: sm 640, md 768, lg 1024, xl 1280', () => {
    expect(BREAKPOINTS.map((b) => [b.name, b.px])).toStrictEqual([['sm', 640], ['md', 768], ['lg', 1024], ['xl', 1280]]);
  });

  it('Spalten wechseln genau an den Breakpoints – „ab“ heißt einschließlich', () => {
    expect([767, 768, 1023, 1024].map((b) => layoutBei(b).spalten)).toStrictEqual([1, 2, 2, 3]);
  });

  it('volle Navigation erst ab 1024 px, darunter der Menü-Knopf', () => {
    expect(layoutBei(1023).navigation).toBe('menue');
    expect(layoutBei(1024).navigation).toBe('voll');
  });

  it('der Inhalt wächst bis 1024 px mit, danach nur der Rand', () => {
    expect(layoutBei(900)).toMatchObject({ inhalt: 900, rand: 0 });
    expect(layoutBei(1440)).toMatchObject({ inhalt: INHALT_MAX, rand: 208 });
  });

  it('der fest breite Hinweis ragt bei 375 px um 241 px hinaus, ohne Fehler nie', () => {
    expect(layoutBei(375, { fehler: true }).ueberlauf).toBe(241);
    expect(layoutBei(375).ueberlauf).toBe(0);
    expect(layoutBei(1024, { fehler: true }).ueberlauf).toBe(0);
  });

  it('der Code markiert die Klasse, die gerade entscheidet', () => {
    expect(aktiveKlassen(375)).toStrictEqual(['hidden', 'flex', 'grid-cols-1']);
    expect(aktiveKlassen(768)).toStrictEqual(['hidden', 'flex', 'md:grid-cols-2']);
    expect(aktiveKlassen(1024)).toStrictEqual(['lg:flex', 'lg:hidden', 'lg:grid-cols-3']);
    expect(aktiveKlassen(1440)).toStrictEqual(['lg:flex', 'lg:hidden', 'lg:grid-cols-3', 'max-w-5xl']);
  });

  it('die Schritte gehen von 375 aus breiter – mobile first –, dann Fehler, Figma, freies Spiel', () => {
    expect(STEPS.map((_, i) => zustandAt(i + 1).breite)).toStrictEqual([375, 600, 768, 1024, 1440, 375, 900, 375]);
    expect(zustandAt(1).reihenfolge).toBe(true);
    expect(zustandAt(6).fehler).toBe(true);
    expect(zustandAt(7).figma).toBe(true);
    expect(zustandAt(8).frei).toBe(true);
    expect(STEPS.map((_, i) => zustandAt(i + 1).fehler).filter(Boolean)).toHaveLength(1);
  });

  it('jede Schrittbreite liegt auf dem Lineal', () => {
    for (let s = 1; s <= STEPS.length; s++) expect(() => layoutBei(zustandAt(s).breite)).not.toThrow();
  });
});
