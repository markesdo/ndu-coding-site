import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { Chance } from '../../schemas/index.js';
import { ChanceZeile, Vorschau } from './InterviewsEditor';
import { neuesInterview } from './interviews-hilfen';

const HINWEIS = 'Diese Chance hat noch keinen Beleg – wähle mindestens eine Zitat-ID.';
const ZITATE = [{ id: 'I1-1', text: 'Wenn ich auf die Uhr schauen muss, geh ich.' }];

const zeile = (chance: Chance, fehler: (pfad: string) => string | undefined = () => undefined) =>
  renderToStaticMarkup(<ChanceZeile chance={chance} setze={() => {}} nr={1} zitate={ZITATE} fehler={fehler} />);

describe('Interview-Editor: Beleg-Hinweis an der Chance (NDU-56)', () => {
  it('Chance mit Text und ohne Beleg: Hinweis am Feld „Belege“, mit aria-describedby verknüpft', () => {
    const h = zeile({ text: 'Will nicht in der Schlange warten.', belege: [] });
    const id = /<p class="wk-feldhinweis" id="([^"]+)">([^<]+)<\/p>/.exec(h);
    expect(id?.[2]).toBe(HINWEIS);
    expect(h).toContain(`aria-describedby="${id?.[1]}"`);
  });

  it('mit Beleg: kein Hinweis', () => {
    expect(zeile({ text: 'Will nicht in der Schlange warten.', belege: ['I1-1'] })).not.toContain('noch keinen Beleg');
  });

  it('frische, leere Chance: kein Hinweis', () => {
    expect(zeile({ text: '', belege: [] })).not.toContain('noch keinen Beleg');
  });

  it('Fehler am Feld „Belege“: Fehler statt Hinweis', () => {
    const h = zeile({ text: 'Will nicht in der Schlange warten.', belege: [] }, (pfad) => (pfad === 'belege' ? 'Belege müssen eine Liste von Zitat-IDs sein.' : undefined));
    expect(h).toContain('Belege müssen eine Liste von Zitat-IDs sein.');
    expect(h).not.toContain('noch keinen Beleg');
  });
});

describe('Interview-Vorschau: Chance ohne Beleg', () => {
  it('markiert nur die Chance ohne Beleg mit „– noch ohne Beleg“', () => {
    const iv = { ...neuesInterview([], '2026-11-12'), zitate: ZITATE, chancen: [
      { text: 'Ohne Beleg.', belege: [] },
      { text: 'Mit Beleg.', belege: ['I1-1'] },
    ] };
    const h = renderToStaticMarkup(<Vorschau daten={{ interviews: [iv] } as Parameters<typeof Vorschau>[0]['daten']} />);
    const punkte = [...h.matchAll(/<li>(.*?)<\/li>/g)].map((m) => m[1]!.replace(/<[^>]+>/g, ''));
    expect(punkte).toStrictEqual(['Ohne Beleg. – noch ohne Beleg', 'Mit Beleg. I1-1']);
  });
});
