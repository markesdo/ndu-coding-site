import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Dozent 27.11.2026: „the link is too early. we only want to have links where we really starting to work. so i dont miss
// theory which comes later.“ Eine Miro-Pille (<MiroFrame>) oder ein <MiroLink> holt Studierende aus der Präsentation auf das
// Board. Darum stehen sie im Beamer nur auf Arbeitsfolien: Folien, auf denen die Übung beginnt oder ein Schritt läuft.
//
// Kriterium „Arbeitsfolie“: Der Beamer-Teil der Folie enthält eine <Timer> – oder die Folie steht in ARBEIT_OHNE_UHR. Das
// sind Folien, die eine Übung eröffnen, ohne selbst eine Uhr zu haben; zwischen ihnen und der ersten Schritt-Folie kommt keine
// Theorie mehr (der Überblick „So geht ihr vor“ vor den Schritt-Folien, die Hausaufgabe). Theorie und Beispiele – auch die
// Kaffeebar auf Miro, die Markus nur zeigt – sind keine Arbeitsfolien.
// Was nur im Handout steht (Element mit Klasse nur-handout), sieht der Beamer nicht; dort dürfen Frames verlinkt sein.
//
// Bekannte Grenze: Jede <Timer> im Beamer-Teil macht eine Folie zur Arbeitsfolie. Eine Theoriefolie mit Uhr (etwa „2 min
// still lesen“) dürfte also einen Miro-Link tragen, ohne dass dieser Test anschlägt. Ebenso erkennt der Test Tags nur, wenn
// in ihren Attributen kein „>“ steht.

const SEITEN = [
  'tag-4', 'tag-5', 'tag-6', 'tag-7',
  'methoden/value-map', 'methoden/concept-story', 'methoden/geschaeftsmodell', 'methoden/story-map', 'methoden/usage-story',
  'methoden/prototyp-spike', 'methoden/scrum', 'methoden/backlog', 'methoden/pitch', 'methoden/akzeptanzkriterien',
  'methoden/schneiden', 'methoden/sprint',
  // TODO: methoden/experiment fehlt mit Absicht – ein anderer PR ordnet dort gerade die Miro-Links; danach hier aufnehmen.
];

/** Arbeitsfolien ohne <Timer>, je Seite der Schlüssel der Folie (id der Überschrift). */
const ARBEIT_OHNE_UHR: Record<string, string[]> = {
  'methoden/story-map': ['warmup', 'vorgehen'], // eröffnen Warm-up und Übung; jede Schritt-Folie danach hat ihre Uhr
  'methoden/prototyp-spike': ['vorgehen'], // Überblick über die vier Schritte, direkt danach Schritt 1 mit Uhr
  'tag-4': ['hausaufgabe'], // Arbeit bis Tag 5, ohne Uhr
};

const quelle = (s: string) => readFileSync(new URL(`../pages/innolab/${s}.astro`, import.meta.url), 'utf8');

/** Öffnender Tag eines Elements mit Klasse nur-handout – Tag-Name beliebig, class an beliebiger Stelle der Attribute. */
const HANDOUT_START = /<([A-Za-z][\w.-]*)\b(?=[^>]*\sclass="(?:[^"]*\s)?nur-handout(?:\s[^"]*)?")[^>]*>/;

/** Was der Beamer zeigt: ohne Kommentare und ohne jedes Element mit Klasse nur-handout (gleichnamige Tags verschachtelt
 *  gezählt, selbstschließende übersprungen). Fehlt das schließende Tag, wirft die Funktion, statt bis zum Ende zu schneiden. */
function imBeamer(folie: string): string {
  let s = folie.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  for (let m; (m = HANDOUT_START.exec(s));) {
    const start = m.index;
    if (m[0].endsWith('/>')) { s = s.slice(0, start) + s.slice(start + m[0].length); continue; }
    const tag = new RegExp(`</?${m[1].replace(/[.]/g, '\\.')}\\b[^>]*>`, 'g');
    tag.lastIndex = start;
    let tiefe = 0;
    let ende = -1;
    for (let t; (t = tag.exec(s));) {
      if (t[0].endsWith('/>')) continue;
      tiefe += t[0].startsWith('</') ? -1 : 1;
      if (tiefe === 0) { ende = tag.lastIndex; break; }
    }
    if (ende < 0) throw new Error(`nur-handout ohne schließendes </${m[1]}>: ${m[0]}`);
    s = s.slice(0, start) + s.slice(ende);
  }
  return s;
}

/** Folien einer Seite: Schlüssel (id der ersten Überschrift, sonst „#n“ ab 1), ganzer Quelltext und Beamer-Teil. */
function folien(q: string): { id: string; text: string; beamer: string }[] {
  return [...q.matchAll(/<Folie\b[^>]*>([\s\S]*?)<\/Folie>/g)].map((m, i) => ({
    id: /<h[23][^>]*\bid="([^"]+)"/.exec(m[1])?.[1] ?? `#${i + 1}`,
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
});

// Dozent 27.11.2026 (Usage Story „needs a link to miro“): Jede Folie, die einen Arbeitsblock eröffnet, zeigt im Beamer dasselbe
// Muster – oben die Miro-Pille (die Anleitung, wo es eine gibt, sonst der gemeinsame Frame), dazu die eigenen Frames je
// Produkt, das Kaffeebar-Beispiel und die Anleitung als Links, soweit es diese Frames auf dem Board gibt.
const P = (f: string) => [1, 2, 3].map((n) => `${f} · Produkt ${n}`);
const ERÖFFNEN: { s: string; id: string; pille: string; links: string[] }[] = [
  { s: 'methoden/value-map', id: 'vorgehen', pille: 'T3 · 4 · Kundenprofil & Value Map', links: [...P('T3 · 4 · Canvas'), ...P('T3 · 4 · Anleitung Value Map'), 'T3 · 4 · Anleitung Value Map · Kaffeebar'] },
  { s: 'methoden/concept-story', id: 'vorgehen', pille: 'T4 · 0 · Anleitung Concept Story', links: [...P('T4 · 0 · Concept Story'), 'T4 · 0 · Concept Story · Kaffeebar'] },
  { s: 'methoden/geschaeftsmodell', id: 'vorgehen', pille: 'T4 · 7 · Anleitung Geschäftsmodell', links: [...P('T4 · 7 · Geschäftsmodell'), 'T4 · 7 · Geschäftsmodell · Kaffeebar'] },
  { s: 'methoden/story-map', id: 'warmup', pille: 'T4 · 1 · Anleitung Warm-up · euer Morgen', links: P('T4 · 1 · Warm-up · euer Morgen') },
  { s: 'methoden/story-map', id: 'vorgehen', pille: 'T4 · 1 · Story Map', links: ['T4 · 1 · Anleitung Story Map'] },
  { s: 'methoden/usage-story', id: 'vorgehen', pille: 'T4 · 4 · Anleitung Usage Story', links: [...P('T4 · 4 · Usage Story'), 'T4 · 4 · Usage Story · Kaffeebar'] },
  { s: 'methoden/prototyp-spike', id: 'vorgehen', pille: 'T4 · 5 · Anleitung Prototyp', links: [...P('T4 · 5 · Prototyp'), 'T4 · 5 · Prototyp · Kaffeebar'] },
  { s: 'methoden/scrum', id: 'team', pille: 'T4 · 2 · Teamaufstellung & DoD', links: [] },
  { s: 'methoden/backlog', id: 'vorgehen', pille: 'T5 · 1 · Backlog-Reihenfolge', links: [] },
  { s: 'methoden/pitch', id: 'vorgehen', pille: 'T5 · 2 · Wertkurve & ERRC', links: [] },
  { s: 'tag-4', id: 'hausaufgabe', pille: 'T4 · 6 · Anleitung Origin Story', links: [...P('T4 · 6 · Origin Story'), 'T4 · 6 · Origin Story · Kaffeebar'] },
];

// Jeder Frame steht im Beamer einer Folie nur einmal: Trägt die Pille die Anleitung, gibt es keinen zweiten „Anleitung“-Link.
describe('Arbeitsfolien, die einen Block eröffnen: Pille, eigene Frames, Kaffeebar, Anleitung', () => {
  for (const { s, id, pille, links } of ERÖFFNEN) {
    it(`${s}#${id}`, () => {
      const f = folien(quelle(s)).find((x) => x.id === id);
      expect(f, `${s}#${id}`).toBeDefined();
      expect([...f!.beamer.matchAll(/<MiroFrame name="([^"]+)" \/>/g)].map((m) => m[1])).toStrictEqual([pille]);
      for (const l of links) expect(f!.beamer, l).toContain(`<MiroLink name="${l}">`);
      const namen = [...f!.beamer.matchAll(/<Miro(?:Frame|Link) name="([^"]+)"/g)].map((m) => m[1]);
      expect(namen.filter((n, i) => namen.indexOf(n) !== i), `${s}#${id}: Frame doppelt im Beamer`).toStrictEqual([]);
    });
  }
});

describe('imBeamer und folien', () => {
  it('entfernt Handout und Kommentare, auch verschachtelte divs, und lässt den Rest stehen', () => {
    const f = '<h2 id="x">X</h2>{/* <MiroLink name="k"> */}<p class="small nur-handout"><MiroLink name="a">a</MiroLink></p>'
      + '<div class="nur-handout"><div><MiroFrame name="b" /></div><p>c</p></div><p>sichtbar <MiroLink name="d">d</MiroLink></p>';
    expect(imBeamer(f)).toBe('<h2 id="x">X</h2><p>sichtbar <MiroLink name="d">d</MiroLink></p>');
    expect(istArbeit('irgendwo', { id: 'x', beamer: imBeamer(f) })).toBe(false);
    expect(istArbeit('irgendwo', { id: 'x', beamer: '<Timer minuten={3} />' })).toBe(true);
  });

  it('ein selbstschließendes div zählt nicht als Ebene', () => {
    const f = '<div class="nur-handout"><div class="leer" /><MiroLink name="a">a</MiroLink></div><p>rest</p>';
    expect(imBeamer(f)).toBe('<p>rest</p>');
    expect(imBeamer('<p>a</p><div class="nur-handout" /><p>b</p>')).toBe('<p>a</p><p>b</p>');
  });

  it('verschachtelte ul/li mit nur-handout', () => {
    const f = '<ul class="nur-handout"><li><ul><li><MiroLink name="a">a</MiroLink></li></ul></li></ul><ul><li>bleibt</li></ul>';
    expect(imBeamer(f)).toBe('<ul><li>bleibt</li></ul>');
    expect(imBeamer('<ul><li class="nur-handout"><MiroLink name="a">a</MiroLink></li><li>b</li></ul>')).toBe('<ul><li>b</li></ul>');
  });

  it('class nicht als erstes Attribut, beliebiger Tag-Name', () => {
    expect(imBeamer('<div data-x="1" class="small nur-handout"><MiroLink name="a">a</MiroLink></div><p>b</p>')).toBe('<p>b</p>');
    expect(imBeamer('<section id="s" class="nur-handout"><p>x</p></section>ok')).toBe('ok');
    // „nur-handout-xyz“ und „xnur-handout“ sind andere Klassen.
    expect(imBeamer('<p class="nur-handout-xyz">bleibt</p>')).toBe('<p class="nur-handout-xyz">bleibt</p>');
    expect(imBeamer('<p class="xnur-handout">bleibt</p>')).toBe('<p class="xnur-handout">bleibt</p>');
  });

  it('ohne schließendes Tag schlägt es laut fehl', () => {
    expect(() => imBeamer('<div class="nur-handout"><p>offen</p>')).toThrow(/ohne schließendes <\/div>/);
  });

  it('Folien ohne Überschrift-id heißen nach ihrer Stelle', () => {
    const q = '<Folie><h2 id="a">A</h2></Folie><Folie><p>ohne</p></Folie><Folie zurueck="/x"><h3 id="c">C</h3></Folie>';
    expect(folien(q).map((f) => f.id)).toStrictEqual(['a', '#2', 'c']);
  });
});
