import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Scrum from '../pages/innolab/methoden/scrum.astro';

// Die Folie „Scrum auf einem Bild“ (vorher „Scrum in vier Schritten“) zeigt den Sprint-Kreislauf: nach dem Agilen
// Manifest, vor den Verantwortlichkeiten, Schritt für Schritt aufgedeckt, mit Quellen- und Lizenzzeile.
describe('Scrum-Seite: Folie „Scrum auf einem Bild“', () => {
  it('steht zwischen Manifest und Verantwortlichkeiten, mit Grafik, Aufdecken, Quelle und Lizenz', async () => {
    const html = await (await AstroContainer.create()).renderToString(Scrum);
    const ids = [...html.matchAll(/<h2[^>]*\bid="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.slice(ids.indexOf('manifest'), ids.indexOf('manifest') + 3)).toStrictEqual(['manifest', 'scrum', 'verantwortlichkeiten']);
    expect(html).toContain('Scrum auf einem Bild</h2>');
    expect(html).not.toContain('Scrum in vier Schritten');

    const folie = html.slice(html.indexOf('id="scrum"'), html.indexOf('id="verantwortlichkeiten"'));
    expect(folie).toContain('id="sk-scrum"');
    expect(folie).toMatch(/role="img"/);
    // aufdecken={1}: Product Backlog sofort, die fünf übrigen Gruppen je ein Schritt.
    expect(folie.match(/data-gruppe="[^"]+" data-schritt/g) ?? []).toHaveLength(5);
    const quelle = folie.match(/<p class="sk-quelle[^"]*"[^>]*>([^<]+)<\/p>/)?.[1] ?? '';
    expect(quelle).toMatch(/Schwaber &(amp;)? Jeff Sutherland/);
    expect(quelle).toMatch(/Scrum Guide“ \(2020\)/);
    expect(quelle).toMatch(/CC BY-SA 4\.0/);
    // Was vorher als Liste auf der Folie stand, bleibt im Handout.
    for (const t of ['Absichtlich unvollständig', 'Transparenz, Überprüfung, Anpassung', 'Commitment, Fokus, Offenheit, Respekt, Mut']) expect(folie, t).toContain(t);
  }, 60_000);
});
