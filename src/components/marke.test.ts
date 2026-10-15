import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { STANDARD_MARKE, markeTeilen } from './marke-name';

describe('Marke', () => {
  it('Name darf nach „programmieren_“ und notfalls im Wort umbrechen – nie über den Rand', () => {
    const html = readFileSync(new URL('./Marke.astro', import.meta.url), 'utf8');
    expect(html).toMatch(/<span class="brand-name">\{vorne\}<wbr\s*\/?>\{hinten\}<\/span>/);
    expect(markeTeilen(STANDARD_MARKE)).toEqual(['programmieren_', 'mit_ai']);
    expect(markeTeilen('innolab_2026')).toEqual(['innolab_', '2026']);
    expect(markeTeilen('innolab')).toEqual(['innolab', '']);
    expect(html).toMatch(/\.brand-name\s*\{[^}]*overflow-wrap:\s*anywhere/);
  });

  it('Kopfleiste einzeilig (kürzt mit „…“), überall sonst mit Umbruch', () => {
    const layout = readFileSync(new URL('../layouts/Layout.astro', import.meta.url), 'utf8');
    expect(layout).toMatch(/<strong class="topbar-brand"><Marke einzeilig[^>]*\/><\/strong>/);
    expect(layout).toMatch(/<a class="brand"[^>]*><Marke(?! einzeilig)[^>]*\/><\/a>/);
    // Beide Stellen nehmen den Namen des Kurses – sonst stünde im Innolab der Name des Coding-Kurses.
    expect(layout).toMatch(/<strong class="topbar-brand"><Marke einzeilig name=\{kurs\.marke\} zeichen=\{kurs\.zeichen\} \/><\/strong>/);
    expect(layout).toMatch(/<a class="brand"[^>]*><Marke name=\{kurs\.marke\} zeichen=\{kurs\.zeichen\} \/><\/a>/);
  });

  it('kein Ort schreibt den Namen noch selbst – sonst fehlt dort der Umbruch', () => {
    const src = fileURLToPath(new URL('..', import.meta.url));
    const dateien = (d: string): string[] => readdirSync(d).flatMap((n) => {
      const p = join(d, n);
      return statSync(p).isDirectory() ? dateien(p) : /\.(astro|ts|css)$/.test(n) && !n.endsWith('.test.ts') ? [p] : [];
    });
    const treffer = dateien(src).filter((p) => !p.endsWith('marke-name.ts') && readFileSync(p, 'utf8').includes('programmieren_mit_ai'));
    expect(treffer).toStrictEqual([]);
  });
});
