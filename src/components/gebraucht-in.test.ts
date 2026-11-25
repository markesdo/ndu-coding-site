import { describe, expect, it } from 'vitest';
import { METHODEN, gebrauchtIn } from './methoden';
import KARTE from './MethodenKarte.astro?raw';

const m = (slug: string) => METHODEN.find((x) => x.slug === slug)!;
const slugs = (slug: string) => gebrauchtIn(m(slug)).map((x) => x.slug);

describe('gebrauchtIn (Umkehrung von braucht)', () => {
  it('nennt die Methoden, die das Ergebnis weiterverwenden, in Kursreihenfolge', () => {
    expect(slugs('story-map')).toStrictEqual(['usage-story', 'prototyp-spike', 'backlog']);
    expect(slugs('hmw')).toStrictEqual(['ideation']);
  });

  it('liefert für den Pitch (Ende des Kurses) nichts', () => {
    expect(slugs('pitch')).toStrictEqual([]);
  });

  it('ist für jedes Paar genau die Umkehrung von braucht', () => {
    for (const q of METHODEN) {
      for (const x of METHODEN) {
        const nutzt = x !== q && x.braucht.some((id) => q.ergibt.includes(id));
        expect(gebrauchtIn(q).includes(x), `${q.slug} → ${x.slug}`).toBe(nutzt);
      }
    }
  });
});

describe('MethodenKarte', () => {
  it('zeigt die Zeile „Wird gebraucht in“ aus gebrauchtIn', () => {
    expect(KARTE).toContain('Wird gebraucht in');
    expect(KARTE).toMatch(/gebrauchtIn\(m\)/);
  });
});
