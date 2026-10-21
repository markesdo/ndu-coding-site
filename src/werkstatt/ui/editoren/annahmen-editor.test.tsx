import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import beispiel from '../../beispiele/annahmen.json';
import type { Annahmen } from '../../schemas/index.js';
import { Bild } from './AnnahmenEditor';

describe('Annahmen-Editor: Textliste neben der Matrix', () => {
  it('zeigt Beleg-IDs und Beleg-Notiz wie das Markdown', () => {
    const d = structuredClone(beispiel) as Annahmen;
    d.annahmen[1] = { ...d.annahmen[1]!, belegIds: ['D2'], belegNotiz: 'Kassendaten September' };
    const h = renderToStaticMarkup(<Bild daten={d} />);
    expect(h).toContain('Beleg getan (D2; Kassendaten September)');
    // A4 ohne Zusatz: nur die Stufe.
    expect(h).toMatch(/<strong>A4<\/strong> wirtschaftlich · wichtig niedrig · Beleg getan<\/li>/);
  });
});
