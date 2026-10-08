import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { inlineHtml, issuesLesen } from './backlog';

const kopie = readFileSync(new URL('../data/backlog.md', import.meta.url), 'utf8');

describe('issuesLesen', () => {
  it('liest alle Issues aus dem Backlog mit allen Feldern', () => {
    const issues = issuesLesen(kopie);
    expect([...issues.keys()]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    for (const issue of issues.values()) {
      expect(issue.ziel).toContain('damit');
      expect(issue.kriterien.length).toBeGreaterThanOrEqual(2);
      for (const k of issue.kriterien) expect(k).toMatch(/^Gegeben /);
      expect(issue.fertigWenn).not.toBe('');
    }
  });

  it('trennt Titel, Kriterien und Markdown sauber', () => {
    const md = [
      '## Tag 1',
      '',
      '### ✅ Issue 3 — Nach Kategorie filtern',
      '**Ziel:** Filtern – damit man findet.',
      '**Nicht im Umfang:** Suche.',
      '**Akzeptanzkriterien:**',
      '- Gegeben A, dann B.',
      '- Gegeben C, dann D.',
      '',
      '**Fertig, wenn:** geprüft.',
      '',
      '## Später',
      '- Kalender',
    ].join('\n');
    const issue = issuesLesen(md).get(3)!;
    expect(issue.titel).toBe('Nach Kategorie filtern');
    expect(issue.kriterien).toEqual(['Gegeben A, dann B.', 'Gegeben C, dann D.']);
    expect(issue.fertigWenn).toBe('geprüft.');
    expect(issue.markdown.startsWith('### ✅ Issue 3')).toBe(true);
    expect(issue.markdown).not.toContain('Später');
    expect(issue.markdown).not.toContain('Kalender');
  });

  it('bricht ab, wenn ein Feld fehlt', () => {
    const md = '### ⬜ Issue 1 — X\n**Ziel:** z – damit y.\n**Akzeptanzkriterien:**\n- Gegeben a\n\n**Fertig, wenn:** f';
    expect(() => issuesLesen(md)).toThrow(/Issue 1: Feld „Nicht im Umfang“ fehlt/);
  });
});

describe('inlineHtml', () => {
  it('setzt Code und Fett um und escaped HTML', () => {
    expect(inlineHtml('Tabelle `items` <b>**ihre**</b>')).toBe('Tabelle <code>items</code> &lt;b&gt;<strong>ihre</strong>&lt;/b&gt;');
  });
});

// Die Kopie muss dem Backlog im Template entsprechen – sonst zeigt die Website andere Issues als die Repos.
const template = new URL('../../../ndu-coding-2026/docs/BACKLOG.md', import.meta.url);
describe.runIf(existsSync(template))('Kopie des Template-Backlogs', () => {
  it('ist gleich dem Backlog im Template-Checkout (sonst: cp ../ndu-coding-2026/docs/BACKLOG.md src/data/backlog.md)', () => {
    expect(kopie).toBe(readFileSync(template, 'utf8'));
  });
});
