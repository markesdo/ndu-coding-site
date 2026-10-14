import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BEREICHE } from '../lib/navigation';

// Innolab-Marke: „?“ statt „›“, Laborgrün statt Koralle – über html[data-bereich] (Layout.astro) und global.css.
const css = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../layouts/Layout.astro', import.meta.url), 'utf8');
const marke = readFileSync(new URL('./Marke.astro', import.meta.url), 'utf8');

/** Variablen aus dem ersten Regelblock, dessen Selektor genau so lautet. */
function block(selektor: string): Record<string, string> {
  const start = css.indexOf(`${selektor} {`);
  if (start < 0) throw new Error(`kein Block für ${selektor}`);
  const inhalt = css.slice(start + selektor.length + 2, css.indexOf('}', start));
  return Object.fromEntries([...inhalt.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

function leuchtdichte(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const kontrast = (a: string, b: string) => {
  const [h, d] = [leuchtdichte(a), leuchtdichte(b)].sort((x, y) => y - x);
  return (h + 0.05) / (d + 0.05);
};

describe('Innolab-Marke', () => {
  it('Bildmarke fragt („?“), der Coding-Kurs bleibt beim Prompt („›“)', () => {
    expect(BEREICHE.innolab.zeichen).toBe('?');
    expect(BEREICHE.coding.zeichen).toBeUndefined();
    expect(marke).toMatch(/zeichen = '›'/);
    expect(marke).toMatch(/<span class="brand-mark" aria-hidden="true">\{zeichen\}<i><\/i><\/span>/);
  });

  it('Layout setzt den Kurs aufs <html> und nimmt dessen Favicon', () => {
    expect(layout).toMatch(/<html lang="de" data-bereich=\{bereich\}>/);
    expect(layout).toMatch(/<link rel="icon" href=\{kurs\.favicon \?\? '\/favicon\.svg'\}/);
    expect(BEREICHE.innolab.favicon).toBe('/favicon-innolab.svg');
    expect(existsSync(new URL('../../public/favicon-innolab.svg', import.meta.url))).toBe(true);
    expect(existsSync(new URL('../../public/og-innolab.png', import.meta.url))).toBe(true);
  });

  it('Bildmarke nimmt ihre Farbe aus --marke, im Innolab Laborgrün', () => {
    expect(css).toMatch(/\.brand-mark \{[^}]*color: var\(--marke\)/);
    expect(block(':root[data-bereich="innolab"]')['--marke']).toBe('#c6f432');
  });

  // --accent zeichnet auch Linien und Icons auf hellem Grund (Fluss, Orientierung), --on-accent ist Schrift auf --accent.
  it('Akzentfarben lesbar auf Hell (Seitengrund und Eyebrow)', () => {
    const hell = block(':root');
    const t = block(':root[data-bereich="innolab"]');
    expect(kontrast(t['--accent'], hell['--bg'])).toBeGreaterThanOrEqual(4.5);
    expect(kontrast(t['--accent-ink'], hell['--bg'])).toBeGreaterThanOrEqual(4.5);
    expect(kontrast(t['--accent-ink'], t['--accent-soft'])).toBeGreaterThanOrEqual(4.5);
    expect(kontrast(t['--on-accent'], t['--accent'])).toBeGreaterThanOrEqual(4.5);
  });

  it('Akzentfarben lesbar auf Dunkel – über System-Einstellung und data-theme gleich', () => {
    const dunkel = block(':root[data-theme="dark"]');
    const sys = block(':root[data-bereich="innolab"]:not([data-theme="light"])');
    const thema = block(':root[data-bereich="innolab"][data-theme="dark"]');
    expect(thema).toStrictEqual(sys);
    expect(kontrast(sys['--accent'], dunkel['--bg'])).toBeGreaterThanOrEqual(4.5);
    expect(kontrast(sys['--accent-ink'], sys['--eyebrow-bg'])).toBeGreaterThanOrEqual(4.5);
    expect(kontrast(sys['--on-accent'], sys['--accent'])).toBeGreaterThanOrEqual(4.5);
  });
});
