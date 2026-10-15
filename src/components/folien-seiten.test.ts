import { describe, expect, it } from 'vitest';

// Jede Folie trägt ihre Aussage als ganzen Satz (Assertion-Evidence, INNOLAB-FORMAT.md). Sonst steht am Beamer nur die
// Überschrift da, solange alle Punkte noch verdeckte Schritte sind – die Folie wirkt leer.
const seiten = import.meta.glob('../pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

describe('Folien auf den Innolab-Seiten', () => {
  it('es gibt Seiten mit Folien (sonst prüft der Test nichts)', () => {
    const mitFolien = Object.values(seiten).filter((s) => s.includes('<Folie>'));
    expect(mitFolien.length).toBeGreaterThanOrEqual(4);
  });

  it('jede Folie hat einen Kernsatz (.folie-satz)', () => {
    const ohne: string[] = [];
    for (const [pfad, quelle] of Object.entries(seiten)) {
      for (const [, inhalt] of quelle.matchAll(/<Folie>([\s\S]*?)<\/Folie>/g)) {
        if (!inhalt.includes('class="folie-satz"')) ohne.push(`${pfad.split('pages/')[1]} #${inhalt.match(/<h2 id="([^"]+)"/)?.[1] ?? '?'}`);
      }
    }
    expect(ohne).toStrictEqual([]);
  });
});
