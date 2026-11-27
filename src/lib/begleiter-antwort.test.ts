import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import { NOTIZEN } from '../data/begleiter';
import Begleiter from '../pages/innolab/begleiter.astro';

// Markus 27.11.: Antworten im Begleiter stehen offen da, ohne Klick. Die Antwort zur Verständnisfrage gehört zum
// Live-Block (bleibt also auch bei „Nur live“ sichtbar) und steckt in keinem <details>.
const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

describe('Begleiter: Antworten ohne Klick', () => {
  it('jede Antwort zur Verständnisfrage steht als „Antwort:“ im Live-Block, ohne <details>', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Begleiter);
    const antworten = Object.values(NOTIZEN).flatMap((je) => Object.values(je).flatMap((n) => (n.verstaendnis ? [n.verstaendnis.antwort] : [])));
    expect(antworten.length).toBeGreaterThan(0);

    const absaetze = [...html.matchAll(/<p class="antwort"[^>]*><span[^>]*>Antwort:<\/span>\s*([\s\S]*?)<\/p>/g)].map((m) => m[1].replace(/<!--[\s\S]*?-->/g, '').trim());
    for (const a of antworten) expect(absaetze, a).toContain(escape(a).trim());

    // Kein Antwort-Klappteil mehr, auch kein anderes <details> im Frage-Kasten.
    expect(html).not.toMatch(/<summary[^>]*>\s*Antwort/);
    const kaesten = [...html.matchAll(/<div class="check"[^>]*>([\s\S]*?)<\/div>/g)].map((m) => m[1]);
    expect(kaesten.length).toBe(absaetze.length);
    expect(kaesten.filter((k) => k.includes('<details'))).toStrictEqual([]);

    // Live-Block, nicht Vorbereitung: vor jeder Antwort ist der nächste Abschnitt ein Live-Block.
    const stellen = [...html.matchAll(/<p class="antwort"/g)].map((m) => m.index!);
    expect(stellen.length).toBe(absaetze.length);
    const imLive = stellen.filter((i) => {
      const davor = html.slice(0, i);
      return davor.lastIndexOf('class="live"') > davor.lastIndexOf('class="vorbereitung"');
    });
    expect(imLive.length).toBe(stellen.length);
  });
});
