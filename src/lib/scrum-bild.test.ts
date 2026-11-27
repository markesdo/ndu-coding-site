import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Scrum from '../pages/innolab/methoden/scrum.astro';

// „Scrum auf einem Bild“ (vorher „Scrum in vier Schritten“) zeigt den Sprint-Kreislauf. Seit 27.11.2026 ist es keine
// Folie mehr, sondern ein Abschnitt der Nachlese (nur Handout): nach dem Agilen Manifest, vor den Verantwortlichkeiten,
// ganz aufgedeckt, mit Quellen- und Lizenzzeile.
describe('Scrum-Seite: „Scrum auf einem Bild“ in der Nachlese', () => {
  it('steht zwischen Manifest und Verantwortlichkeiten, mit Grafik, ganz aufgedeckt, Quelle und Lizenz', async () => {
    const html = await (await AstroContainer.create()).renderToString(Scrum);
    const ids = [...html.matchAll(/<h3[^>]*\bid="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.slice(ids.indexOf('manifest'), ids.indexOf('manifest') + 3)).toStrictEqual(['manifest', 'scrum', 'verantwortlichkeiten']);
    expect(html).toContain('Scrum auf einem Bild</h3>');
    expect(html).not.toContain('Scrum in vier Schritten');

    // Nicht nach id="scrum" suchen: so heißt auch die Methodenkarte oben auf der Seite.
    const von = html.indexOf('<h3 id="scrum"');
    const bis = html.indexOf('<h3 id="verantwortlichkeiten"');
    expect(von).toBeGreaterThan(0);
    expect(bis).toBeGreaterThan(von);
    const abschnitt = html.slice(von, bis);
    expect(abschnitt).toContain('id="sk-scrum"');
    expect(abschnitt).toMatch(/role="img"/);
    // Im Handout gibt es kein Aufdecken: alle sechs Gruppen sind da, keine wartet auf →.
    expect(abschnitt.match(/data-gruppe="[^"]+"/g) ?? []).toHaveLength(6);
    expect(abschnitt).not.toContain('data-schritt');
    const quelle = abschnitt.match(/<p class="sk-quelle[^"]*"[^>]*>([^<]+)<\/p>/)?.[1] ?? '';
    expect(quelle).toMatch(/Schwaber &(amp;)? Jeff Sutherland/);
    expect(quelle).toMatch(/Scrum Guide“ \(2020\)/);
    expect(quelle).toMatch(/CC BY-SA 4\.0/);
    for (const t of ['Absichtlich unvollständig', 'Transparenz, Überprüfung, Anpassung', 'Commitment, Fokus, Offenheit, Respekt, Mut']) expect(abschnitt, t).toContain(t);
  }, 60_000);
});
