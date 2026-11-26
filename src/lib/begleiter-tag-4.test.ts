import { describe, expect, it } from 'vitest';
import { NOTIZEN } from '../data/begleiter';
import { folienAus, quellenAusGlob } from './begleiter';

// Tag 4 (28.11.2026): Jede Folie der Methodenseiten, die der Begleiter an Tag 4 zeigt, hat eine Notiz mit mindestens
// einem live-Stichwort, und jede Notiz zeigt auf eine Folie dieser Seite (keine Reste gestrichener Folien, z. B. der
// Origin Story, die seit 26.11. im Abschluss von Tag 4 steht). Abgeschaltete Folien (Lego4Scrum, „Euer Produkt in
// einem Satz“) zählt folienAus nicht mit. scrum enthält auch die Tag-5-Folien team, dod, vorgehen, uebertrag.
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);

const SEITEN: Record<string, number> = {
  // Tagesseite: 9:00 Arbeitsfluss, 9:35 Was bauen wir? und Slice 1 im Baum, 17:15 Abschluss mit Beispiel, Hausaufgabe, Ende.
  '/innolab/tag-4': 7,
  // Seit 26.11.2026 nachts ohne die beiden Claude-Pro-Folien (jetzt auf tag-5).
  '/innolab/methoden/experiment': 18,
  // Story Map seit 26.11.2026 abends: Warm-up in sechs Schritten, Begriffe, Theorie, Kaffeebar, Übung in elf Schritt-Folien.
  '/innolab/methoden/story-map': 31,
  '/innolab/methoden/usage-story': 6,
  // Seit 26.11.2026 nachts Prototyp auf Papier: ohne Zeitbox, Bauen und Ansehen.
  '/innolab/methoden/prototyp-spike': 14,
  '/innolab/methoden/scrum': 16,
};

describe('Begleiter Tag 4: Notizen decken die Folien', () => {
  for (const [pfad, anzahl] of Object.entries(SEITEN)) {
    const folien = folienAus(pfad, quellen[pfad] ?? '');
    it(`${pfad}: ${anzahl} Folien, jede mit live-Stichwort`, () => {
      expect(folien).toHaveLength(anzahl);
      expect(folien.filter((f) => !NOTIZEN[pfad]?.[f.id]?.live?.some((s) => s.trim() !== '')).map((f) => f.id)).toStrictEqual([]);
    });
    it(`${pfad}: jede Notiz zeigt auf eine Folie der Seite`, () => {
      const ids = new Set(folien.map((f) => f.id));
      expect(Object.keys(NOTIZEN[pfad] ?? {}).filter((id) => !ids.has(id))).toStrictEqual([]);
    });
  }
  it('scrum: abgeschaltete Folien (Lego4Scrum, Produktsatz) haben keine Notiz', () => {
    const n = NOTIZEN['/innolab/methoden/scrum'];
    expect(['produktziel', 'lego', 'vision', 'produkt-board', 'lego-sprint', 'review-1', 'nachbesprechung'].filter((id) => id in n)).toStrictEqual([]);
  });
});
