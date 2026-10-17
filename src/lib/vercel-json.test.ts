import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const konfig = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8')) as {
  rewrites: { source: string; destination: string }[];
};

// Ein benannter Parameter in der Quelle, der im Ziel fehlt, hängt Vercel als Query an (?pfad=…).
// Die Werkstatt-Funktion liest ihre Anfrage-URL und soll nichts Zusätzliches sehen.
describe('vercel.json Rewrites', () => {
  it('keine Quelle hat einen benannten Parameter, der im Ziel fehlt', () => {
    for (const { source, destination } of konfig.rewrites) {
      for (const [, name] of source.matchAll(/:([A-Za-z_]\w*)/g)) {
        expect(destination, `${source} -> ${destination}`).toContain(`:${name}`);
      }
    }
  });
  it('Werkstatt-Pfade laufen über eine unbenannte Gruppe', () => {
    expect(konfig.rewrites).toContainEqual({ source: '/api/werkstatt/(.*)', destination: '/api/werkstatt' });
  });
});
