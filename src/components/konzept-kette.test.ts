import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// „Weiter“ auf einer Konzeptseite folgt dem Tagesablauf, nicht dem Menü – Beamer ←/→ blättert genau so.
const weiter = (seite: string) => {
  const quelle = readFileSync(new URL(`../pages/konzepte/${seite}.astro`, import.meta.url), 'utf8');
  return quelle.match(/<FooterNav[^>]*\bnext=\{\{\s*href:\s*'([^']+)'/)?.[1];
};

describe('Konzeptseiten: Weiter führt zur nächsten Station des Tages', () => {
  it.each([
    ['app-anatomie', '/konzepte/git'],
    ['git', '/konzepte/llm'],
    ['llm', '/konzepte/coding-agent'],
    ['coding-agent', '/konzepte/prompting'],
    ['prompting', '/tag-1#uebung-1'],
    ['spezifikation', '/tag-1#uebung-2'],
    ['daten-backend', '/konzepte/mcp'],
    ['mcp', '/tag-2#uebung-3'],
    ['verifizieren', '/tag-2#uebung-4'],
    ['agenten-steuern', '/tag-2#uebung-5'],
    ['qualitaet', '/tag-3#werkstatt-1'],
    ['design-system', '/konzepte/ausblick'],
    ['ausblick', '/tag-3#werkstatt-2'],
  ])('%s → %s', (seite, ziel) => {
    expect(weiter(seite)).toBe(ziel);
  });
});
