import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Vercel übersetzt api/*.ts Datei für Datei und lädt sie per Node-ESM (package.json "type": "module"): Ein relativer
// Import ohne .js-Endung findet dort nichts (ERR_MODULE_NOT_FOUND) – im Build und in vitest fällt das nicht auf.
const WURZEL = resolve(__dirname, '../..');
const IMPORT = /(?:^|\n)\s*(?:import|export)\s(?!type\s)[^'"]*?from\s*'(\.{1,2}\/[^']+)'/g;

function ohneEndung(datei: string, gesehen = new Set<string>()): string[] {
  if (gesehen.has(datei)) return [];
  gesehen.add(datei);
  const fehler: string[] = [];
  for (const [, pfad] of readFileSync(datei, 'utf8').matchAll(IMPORT)) {
    if (!pfad.endsWith('.js')) { fehler.push(`${relative(WURZEL, datei)}: '${pfad}'`); continue; }
    const ziel = join(dirname(datei), pfad.replace(/\.js$/, '.ts'));
    if (existsSync(ziel)) fehler.push(...ohneEndung(ziel, gesehen));
  }
  return fehler;
}

describe('Vercel-Funktionen (api/)', () => {
  it('alles, was api/*.ts lädt, importiert relativ mit .js-Endung', () => {
    const api = readdirSync(join(WURZEL, 'api')).filter((d) => d.endsWith('.ts'));
    expect(api).toContain('aufgedeckt.ts');
    expect(api.flatMap((d) => ohneEndung(join(WURZEL, 'api', d)))).toStrictEqual([]);
  });
});
