import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Dozent 27.11.2026: „the link is too early. we only want to have links where we really starting to work. so i dont miss
// theory which comes later.“ Eine Miro-Pille (<MiroFrame>) oder ein <MiroLink> holt Studierende aus der Präsentation auf das
// Board. Darum stehen sie im Beamer nur auf Arbeitsfolien: Folien, auf denen die Übung beginnt oder ein Schritt läuft.
//
// Kriterium „Arbeitsfolie“: Die Folie enthält eine <Timer> – oder ihre Überschrift-id steht in ARBEIT_OHNE_UHR. Das sind
// Folien, die eine Übung eröffnen, ohne selbst eine Uhr zu haben; zwischen ihnen und der ersten Schritt-Folie kommt keine
// Theorie mehr (der Überblick „So geht ihr vor“ vor den Schritt-Folien, die Hausaufgabe). Theorie und Beispiele – auch die
// Kaffeebar auf Miro, die Markus nur zeigt – sind keine Arbeitsfolien.
// Was nur im Handout steht (.nur-handout), sieht der Beamer nicht; dort dürfen Frames weiter verlinkt sein.

const SEITEN = [
  'tag-4', 'tag-5', 'tag-6', 'tag-7',
  'methoden/value-map', 'methoden/concept-story', 'methoden/geschaeftsmodell', 'methoden/story-map', 'methoden/usage-story',
  'methoden/prototyp-spike', 'methoden/scrum', 'methoden/backlog', 'methoden/pitch', 'methoden/akzeptanzkriterien',
  'methoden/schneiden', 'methoden/sprint',
  // TODO: methoden/experiment fehlt mit Absicht – ein anderer PR ordnet dort gerade die Miro-Links; danach hier aufnehmen.
];

/** Arbeitsfolien ohne <Timer>, je Seite die id der Überschrift. */
const ARBEIT_OHNE_UHR: Record<string, string[]> = {
  'methoden/story-map': ['warmup', 'vorgehen'], // eröffnen Warm-up und Übung; jede Schritt-Folie danach hat ihre Uhr
  'methoden/prototyp-spike': ['vorgehen'], // Überblick über die vier Schritte, direkt danach Schritt 1 mit Uhr
  'tag-4': ['hausaufgabe'], // Arbeit bis Tag 5, ohne Uhr
};

const quelle = (s: string) => readFileSync(new URL(`../pages/innolab/${s}.astro`, import.meta.url), 'utf8');

/** Was der Beamer zeigt: ohne Kommentare, ohne Blöcke und Absätze mit .nur-handout (div verschachtelt gezählt). */
function imBeamer(folie: string): string {
  let s = folie.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  s = s.replace(/<(p|ol|ul|li|span) class="[^"]*\bnur-handout\b[^"]*">[\s\S]*?<\/\1>/g, '');
  for (let i; (i = s.search(/<div class="[^"]*\bnur-handout\b[^"]*">/)) >= 0;) {
    const tag = /<\/?div\b[^>]*>/g;
    tag.lastIndex = i;
    let tiefe = 0;
    let ende = s.length;
    for (let m; (m = tag.exec(s));) {
      tiefe += m[0].startsWith('</') ? -1 : 1;
      if (tiefe === 0) { ende = tag.lastIndex; break; }
    }
    s = s.slice(0, i) + s.slice(ende);
  }
  return s;
}

/** Folien einer Seite: id der ersten Überschrift, ganzer Quelltext und Beamer-Teil. */
function folien(q: string): { id: string; text: string; beamer: string }[] {
  return [...q.matchAll(/<Folie\b[^>]*>([\s\S]*?)<\/Folie>/g)].map((m) => ({
    id: /<h[23][^>]*\bid="([^"]+)"/.exec(m[1])?.[1] ?? '',
    text: m[1],
    beamer: imBeamer(m[1]),
  }));
}

const MIRO = /<Miro(?:Frame|Link)\b/;
const istArbeit = (seite: string, f: { id: string; beamer: string }) =>
  /<Timer\b/.test(f.beamer) || (ARBEIT_OHNE_UHR[seite] ?? []).includes(f.id);

describe('Miro-Links nur auf Arbeitsfolien', () => {
  for (const s of SEITEN) {
    it(s, () => {
      const zuFrueh = folien(quelle(s)).filter((f) => MIRO.test(f.beamer) && !istArbeit(s, f)).map((f) => f.id);
      expect(zuFrueh, `${s}: Miro-Link auf Theorie- oder Beispielfolie`).toStrictEqual([]);
    });
  }

  it('die Prüfung greift: genug Folien mit Miro-Link im Beamer, jede Ausnahme existiert und hat einen', () => {
    const mitMiro = SEITEN.flatMap((s) => folien(quelle(s)).filter((f) => MIRO.test(f.beamer)));
    expect(mitMiro.length).toBeGreaterThan(30);
    for (const [s, ids] of Object.entries(ARBEIT_OHNE_UHR)) {
      for (const id of ids) {
        const f = folien(quelle(s)).find((x) => x.id === id);
        expect(f, `${s}#${id}`).toBeDefined();
        expect(f!.beamer, `${s}#${id}: Ausnahme ohne Miro-Link ist überflüssig`).toMatch(MIRO);
        expect(f!.beamer, `${s}#${id}: hat eine Uhr, braucht keine Ausnahme`).not.toMatch(/<Timer\b/);
      }
    }
  });

  it('imBeamer entfernt Handout und Kommentare, auch verschachtelte divs, und lässt den Rest stehen', () => {
    const f = '<h2 id="x">X</h2>{/* <MiroLink name="k"> */}<p class="small nur-handout"><MiroLink name="a">a</MiroLink></p>'
      + '<div class="nur-handout"><div><MiroFrame name="b" /></div><p>c</p></div><p>sichtbar <MiroLink name="d">d</MiroLink></p>';
    expect(imBeamer(f)).toBe('<h2 id="x">X</h2><p>sichtbar <MiroLink name="d">d</MiroLink></p>');
    expect(istArbeit('irgendwo', { id: 'x', beamer: imBeamer(f) })).toBe(false);
    expect(istArbeit('irgendwo', { id: 'x', beamer: '<Timer minuten={3} />' })).toBe(true);
  });
});
