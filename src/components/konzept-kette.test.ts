import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Zurück und Weiter auf einer Konzeptseite folgen dem Tagesablauf, nicht dem Menü – Beamer ←/→ blättert genau so.
const ziel = (seite: string, richtung: 'prev' | 'next') => {
  const quelle = readFileSync(new URL(`../pages/konzepte/${seite}.astro`, import.meta.url), 'utf8');
  return quelle.match(new RegExp(`<FooterNav[^>]*\\b${richtung}=\\{\\{\\s*href:\\s*'([^']+)'`))?.[1];
};

describe('Konzeptseiten: Zurück zur Station davor, Weiter zur nächsten Station des Tages', () => {
  it.each([
    ['app-anatomie', '/tag-1#konzept-1', '/konzepte/git'],
    ['git', '/konzepte/app-anatomie', '/konzepte/llm'],
    ['llm', '/konzepte/git', '/konzepte/coding-agent'],
    ['coding-agent', '/konzepte/llm', '/konzepte/prompting'],
    ['prompting', '/konzepte/coding-agent', '/tag-1#uebung-1'],
    ['spezifikation', '/tag-1#konzept-3', '/tag-1#uebung-2'],
    ['daten-backend', '/tag-2#konzept-4', '/konzepte/mcp'],
    ['mcp', '/konzepte/daten-backend', '/tag-2#uebung-3'],
    ['verifizieren', '/tag-2#konzept-5', '/tag-2#uebung-4'],
    ['agenten-steuern', '/tag-2#konzept-6', '/tag-2#uebung-5'],
    ['qualitaet', '/tag-3#konzept-7', '/tag-3#werkstatt-1'],
    ['design-system', '/tag-3#konzept-8', '/konzepte/ausblick'],
    ['ausblick', '/konzepte/design-system', '/tag-3#werkstatt-2'],
  ])('%s: ← %s, → %s', (seite, zurueck, weiter) => {
    expect([ziel(seite, 'prev'), ziel(seite, 'next')]).toStrictEqual([zurueck, weiter]);
  });
});
