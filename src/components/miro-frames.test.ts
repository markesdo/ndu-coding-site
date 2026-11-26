import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { MIRO_FRAMES, MIRO_FRAMES_OHNE_ID } from './miro-frames';

const SEITEN = fileURLToPath(new URL('../pages', import.meta.url));
const dateien = (d: string): string[] => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? dateien(p) : n.endsWith('.astro') ? [p] : [];
});

const quellen = dateien(SEITEN).map((p) => ({ p, text: readFileSync(p, 'utf8') }));
const aufrufe = quellen.flatMap(({ p, text }) => [...text.matchAll(/<Miro(?:Frame|Link)\b[^>]*>/g)].map((m) => ({ p, tag: m[0] })));
const namen = aufrufe.map(({ tag }) => /name="([^"]+)"/.exec(tag)?.[1]);

describe('MIRO_FRAMES', () => {
  it('jede <MiroFrame>/<MiroLink> auf den Seiten nennt ihren Namen als festen Text', () => {
    expect(aufrufe.length).toBeGreaterThan(10);
    for (const { p, tag } of aufrufe) expect(tag, p).toMatch(/^<MiroFrame name="[^"]+" \/>$|^<MiroLink name="[^"]+">$/);
  });

  // Ein Link ohne Import fällt erst beim Bauen auf (ReferenceError beim Vorrendern) – hier schon im Test.
  it('jede Seite mit <MiroFrame>/<MiroLink> importiert die Komponente', () => {
    for (const { p, text } of quellen) {
      for (const k of ['MiroFrame', 'MiroLink']) if (text.includes(`<${k} `)) expect(text, `${p}: ${k}`).toMatch(new RegExp(`^import ${k} from '[./]+/components/${k}\\.astro';$`, 'm'));
    }
  });

  it('jeder Frame-Name aus den Seiten steht in der Karte – ein Tippfehler fällt hier auf', () => {
    for (const { p, tag } of aufrufe) {
      const name = /name="([^"]+)"/.exec(tag)![1];
      expect([...Object.keys(MIRO_FRAMES), ...MIRO_FRAMES_OHNE_ID], `${p}: ${name}`).toContain(name);
    }
  });

  it('jeder Eintrag der Karte wird auf einer Seite benutzt – sonst ist er tot oder der Name auf der Seite falsch', () => {
    for (const name of [...Object.keys(MIRO_FRAMES), ...MIRO_FRAMES_OHNE_ID]) expect(namen, name).toContain(name);
  });

  // Ab Tag 3 (21.11.2026) darf kein Platzhalter mehr offen sein: Ein Frame ohne ID ist am Beamer nur Text. Ob eine ID auf dem
  // Board noch lebt, prüft kein Test (kein Miro-Zugriff) – die geteilte T3 · 0 wurde gelöscht und durch drei Frames je Person ersetzt.
  it('am Kurstag ist kein Frame mehr ohne ID', () => {
    if (Date.now() < Date.parse('2026-11-21T00:00:00+01:00')) return;
    expect(MIRO_FRAMES_OHNE_ID).toStrictEqual([]);
  });

  it('ein Frame ohne ID steht nicht zugleich mit ID in der Karte', () => {
    for (const name of MIRO_FRAMES_OHNE_ID) expect(Object.keys(MIRO_FRAMES), name).not.toContain(name);
  });

  it('Frame-IDs sind Zahlen und kommen nur einmal vor', () => {
    const ids = Object.values(MIRO_FRAMES);
    for (const id of ids) expect(id).toMatch(/^\d+$/);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
