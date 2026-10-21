import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { MIRO_FRAMES } from './miro-frames';

const SEITEN = fileURLToPath(new URL('../pages', import.meta.url));
const dateien = (d: string): string[] => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? dateien(p) : n.endsWith('.astro') ? [p] : [];
});

const quellen = dateien(SEITEN).map((p) => ({ p, text: readFileSync(p, 'utf8') }));
const aufrufe = quellen.flatMap(({ p, text }) => [...text.matchAll(/<MiroFrame\b[^>]*>/g)].map((m) => ({ p, tag: m[0] })));

describe('MIRO_FRAMES', () => {
  it('jede <MiroFrame> auf den Seiten nennt ihren Namen als festen Text', () => {
    expect(aufrufe.length).toBeGreaterThan(10);
    for (const { p, tag } of aufrufe) expect(tag, p).toMatch(/^<MiroFrame name="[^"]+" \/>$/);
  });

  it('jeder Frame-Name aus den Seiten steht in der Karte – ein Tippfehler fällt hier auf', () => {
    for (const { p, tag } of aufrufe) {
      const name = /name="([^"]+)"/.exec(tag)![1];
      expect(Object.keys(MIRO_FRAMES), `${p}: ${name}`).toContain(name);
    }
  });

  it('Frame-IDs sind Zahlen und kommen nur einmal vor', () => {
    const ids = Object.values(MIRO_FRAMES);
    for (const id of ids) expect(id).toMatch(/^\d+$/);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
