import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('Marke', () => {
  it('Name darf nach „programmieren_“ und notfalls im Wort umbrechen – nie über den Rand', () => {
    const html = readFileSync(new URL('./Marke.astro', import.meta.url), 'utf8');
    expect(html).toMatch(/<span class="brand-name">programmieren_<wbr\s*\/?>mit_ai<\/span>/);
    expect(html).toMatch(/\.brand-name\s*\{[^}]*overflow-wrap:\s*anywhere/);
  });

  it('kein Ort schreibt den Namen noch selbst – sonst fehlt dort der Umbruch', () => {
    const src = fileURLToPath(new URL('..', import.meta.url));
    const dateien = (d: string): string[] => readdirSync(d).flatMap((n) => {
      const p = join(d, n);
      return statSync(p).isDirectory() ? dateien(p) : /\.(astro|ts|css)$/.test(n) && !n.endsWith('.test.ts') ? [p] : [];
    });
    const treffer = dateien(src).filter((p) => !p.endsWith('Marke.astro') && readFileSync(p, 'utf8').includes('programmieren_mit_ai'));
    expect(treffer).toStrictEqual([]);
  });
});
