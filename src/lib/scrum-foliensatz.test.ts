import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Scrum from '../pages/innolab/methoden/scrum.astro';
import Tag4 from '../pages/innolab/tag-4.astro';
import { bloeckeAus } from './begleiter';
import { AGIL_SCRUM_FOLIEN, FOLIENSATZ_URL } from './foliensatz';
import { MIRO_FRAMES } from '../components/miro-frames';
import { gliederung } from '../components/gliederung';
import { folienAus } from './begleiter';
import { textAusHtml } from '../components/abschnitt';
import { NOTIZEN_SCRUM } from '../data/begleiter/scrum';

// Entscheidung Markus 26.11.2026: Agil & Scrum an Tag 4 nach Variante B – 20 Folien aus dem Foliensatz, dann auf der
// Site „Wo wir abweichen“, die Übung „Kaffeebar auf der Scrum-Karte“ (4 + 3 min) und das Beispiel als Auflösung.
const SRC = fileURLToPath(new URL('..', import.meta.url));
const dateien = (d: string): string[] => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? dateien(p) : /\.(astro|ts|tsx|js|mjs|md|json)$/.test(n) ? [p] : [];
});
const QUELLE_T4 = readFileSync(new URL('../pages/innolab/tag-4.astro', import.meta.url), 'utf8');
const QUELLE_SCRUM = readFileSync(new URL('../pages/innolab/methoden/scrum.astro', import.meta.url), 'utf8');
const href = `href="${FOLIENSATZ_URL.replace(/&/g, '&amp;')}"`;
// Von der Überschrift bis zur nächsten <h2>. Beide Grenzen müssen da sein, sonst fiele der Ausschnitt still auf die
// ganze restliche Seite zurück (slice mit -1) und die Prüfungen darauf wären wertlos.
const ausschnitt = (html: string, id: string) => {
  const a = html.indexOf(`<h2 id="${id}"`);
  const b = html.indexOf('<h2 ', a + 1);
  expect(a, `<h2 id="${id}">`).toBeGreaterThan(0);
  expect(b, `nächste <h2> nach #${id}`).toBeGreaterThan(a);
  return html.slice(a, b);
};

describe('Foliensatz: eine Adresse, 20 Folien', () => {
  it('die Adresse des Foliensatzes steht nur in lib/foliensatz.ts', () => {
    expect(FOLIENSATZ_URL).toMatch(/^https:\/\/docs\.google\.com\/presentation\/d\/[\w-]+\//);
    const id = FOLIENSATZ_URL.split('/d/')[1].split('/')[0];
    const mit = dateien(SRC).filter((p) => readFileSync(p, 'utf8').includes(id)).map((p) => p.slice(SRC.length));
    expect(mit).toStrictEqual(['lib/foliensatz.ts']);
  });

  it('Variante B: 20 Folien aus dem Teil Agile & Scrum (1–62), Inkremente gleich nach dem Wasserfall', () => {
    const folien = AGIL_SCRUM_FOLIEN.split(', ').flatMap((t) => {
      const [von, bis = von] = t.split('–').map(Number);
      return Array.from({ length: bis - von + 1 }, (_, k) => von + k);
    });
    expect(folien).toHaveLength(20);
    expect(new Set(folien).size).toBe(20);
    expect(folien.every((n) => n >= 1 && n <= 62)).toBe(true);
    expect(folien.slice(0, 2)).toStrictEqual([3, 4]);
    // Nummern seit 26.11.2026, als die Folie zu den Inkrementen hinter den Wasserfall rückte (alt: 3, 61, 11, 26, 27–28 …).
    expect(AGIL_SCRUM_FOLIEN).toBe('3, 4, 12, 27–29, 38, 39, 42, 43, 44, 45, 47–49, 50, 51, 55, 57, 61');
  });
});

describe('Tag 4: Agil & Scrum 16:35–17:15 mit Foliensatz', () => {
  // Seit 27.11.2026 ohne Puffer: Der Block endet 17:15, direkt danach Origin Story & Hausaufgabe.
  it('der Block dauert 40 Minuten, endet 17:15, und der Abschluss schließt lückenlos an', () => {
    const b = bloeckeAus(QUELLE_T4);
    const i = b.findIndex((x) => x.titel === 'Agil & Scrum');
    expect(b[i]).toMatchObject({ von: 16 * 60 + 35, bis: 17 * 60 + 15, href: '/innolab/methoden/scrum#foliensatz' });
    expect(b[i + 1]).toMatchObject({ titel: 'Origin Story & Hausaufgabe', von: b[i].bis, bis: 17 * 60 + 30 });
    // Die Aufteilung im Handout von „So geht ihr vor“ ergibt genau die Länge des Blocks.
    const satz = QUELLE_SCRUM.match(/<p class="nur-handout">Agil &amp; Scrum: ([^]*?)\. „Euer Produkt/)?.[1] ?? '';
    const summe = [...satz.matchAll(/(\d+) Minuten/g)].reduce((a, m) => a + Number(m[1]), 0);
    expect(summe).toBe(b[i].bis - b[i].von);
    expect(QUELLE_SCRUM).toContain('<strong>Agil &amp; Scrum (Tag 4, 16:35–17:15):</strong>');
  });

  it('gerendert: der Ablauf von Tag 4 verlinkt den Foliensatz im Block Agil & Scrum (Beamer und Handout)', async () => {
    const html = await (await AstroContainer.create()).renderToString(Tag4);
    const a = html.indexOf('data-zeit="16:35–17:15"');
    expect(a).toBeGreaterThan(0);
    const block = html.slice(a, html.indexOf('data-zeit="17:15–17:30"', a));
    expect(block).toContain(href);
    expect(block).toContain('Kaffeebar auf der Scrum-Karte');
  }, 60_000);
});

describe('Scrum-Seite: Zeiger auf den Foliensatz und Übung vor dem Beispiel', () => {
  // Seit 27.11.2026 (Markus: „the numbers of the slides are not important“): Die Folie sagt in Stichworten, was der
  // Foliensatz bringt, und nennt keine Foliennummern; die stehen nur im Begleiter.
  it('gerendert: die Folie „foliensatz“ zeigt Link und Themen auf dem Beamer, ohne Foliennummern', async () => {
    const html = await (await AstroContainer.create()).renderToString(Scrum);
    const ids = [...html.matchAll(/<h2[^>]*\bid="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.slice(ids.indexOf('foliensatz'), ids.indexOf('foliensatz') + 3)).toStrictEqual(['foliensatz', 'nachlese', 'abweichungen']);
    const folie = ausschnitt(html, 'foliensatz');
    // Ohne Handout-Teil wäre „beamer“ die ganze Folie – dann bewiese der Test nicht, dass der Link auf dem Beamer steht.
    const handout = folie.indexOf('nur-handout');
    expect(handout).toBeGreaterThan(0);
    const beamer = folie.slice(0, handout);
    expect(beamer).not.toContain('Nachlese');
    expect(beamer).toContain(href);
    expect(textAusHtml(beamer.match(/<p class="folie-satz"[^>]*>([^]*?)<\/p>/)?.[1] ?? '')).toBe('Erst die Folien, dann hier weiter: wo wir abweichen, die Kaffeebar, das Beispiel.');
    expect([...beamer.matchAll(/<li\b[^>]*>([^]*?)<\/li>/g)].map((m) => textAusHtml(m[1]))).toStrictEqual([
      'Warum agil: Wasserfall gegen Inkremente, das Agile Manifest.',
      'Scrum nach dem Guide: der Kreislauf, drei Verantwortlichkeiten, der Sprint und seine Events.',
      'Fertig: das Inkrement und die Definition of Done.',
      'Danach hier: Wo wir abweichen → Kaffeebar auf der Scrum-Karte → Gleis-1-Express.',
    ]);
    expect(textAusHtml(beamer)).toContain('Foliensatz: „ndu – Innolab 26/27 Students parts“, Teil Agile & Scrum.');
    // Keine Foliennummern: weder die Auswahl noch der Bereich 1–62, auch nicht im Handout-Teil.
    expect(folie).not.toContain(AGIL_SCRUM_FOLIEN);
    expect(textAusHtml(folie)).not.toMatch(/Folien? \d|1–62/);
    expect(folie.slice(handout)).toContain('href="#nachlese"');
    // Auch „So geht ihr vor“ nennt den Foliensatz.
    expect(ausschnitt(html, 'vorgehen')).toContain(href);
  }, 60_000);

  it('Begleiter: die Nummern der gezeigten Folien stehen in der Notiz zu „foliensatz“', () => {
    expect(NOTIZEN_SCRUM.foliensatz.ablauf?.schritte?.join(' ')).toContain(`: ${AGIL_SCRUM_FOLIEN}.`);
    expect(QUELLE_SCRUM).not.toMatch(/import \{[^}]*AGIL_SCRUM_FOLIEN/);
  });
});

// Seit 27.11.2026: „Warum nicht Wasserfall“ bis „Fertig heißt fertig“ wiederholen den Foliensatz (Vergleich in
// tag4-vorbereitung/scrum-folien-vergleich.md) und sind darum keine Folien mehr, sondern die Nachlese im Handout.
describe('Scrum-Seite: Nachlese statt sechs Theorie-Folien', () => {
  const THEORIE = ['agil', 'manifest', 'scrum', 'verantwortlichkeiten', 'events', 'fertig'];

  it('Quelltext: ein nur-handout-Block mit h2 #nachlese und den sechs Ankern als h3, ohne <Folie>', () => {
    const von = QUELLE_SCRUM.indexOf('<div class="nur-handout">\n  <h2 id="nachlese">');
    expect(von).toBeGreaterThan(0);
    const bis = QUELLE_SCRUM.indexOf('<h2 id="abweichungen">', von);
    expect(bis).toBeGreaterThan(von);
    const block = QUELLE_SCRUM.slice(von, bis);
    expect([...block.matchAll(/<h3 id="([^"]+)">/g)].map((m) => m[1])).toStrictEqual(THEORIE);
    // Im Block steht keine Folie; er endet mit </div>, danach kommt nur die Folie mit #abweichungen.
    const innen = block.slice(0, block.lastIndexOf('<Folie>'));
    expect(innen).not.toMatch(/<\/?Folie\b/);
    expect(innen.trimEnd().endsWith('</div>')).toBe(true);
    expect(block).not.toContain('data-schritt');
    expect(block).not.toContain('aufdecken=');
  });

  it('Begleiter und Inhaltsverzeichnis: keine eigenen Folien mehr; die Anker gehören zur Folie „foliensatz“', () => {
    const folien = folienAus('/innolab/methoden/scrum', QUELLE_SCRUM);
    expect(folien.map((f) => f.id).filter((id) => THEORIE.includes(id))).toStrictEqual([]);
    expect(folien.find((f) => f.id === 'foliensatz')?.unterIds).toStrictEqual(['nachlese', ...THEORIE]);
    for (const id of THEORIE) expect(NOTIZEN_SCRUM, id).not.toHaveProperty(id);
    expect(gliederung(QUELLE_SCRUM).map((a) => a.id).slice(0, 3)).toStrictEqual(['foliensatz', 'nachlese', 'abweichungen']);
  });

  it('gerendert: die Nachlese steht im Handout mit Zitaten und Seitenzahlen, außerhalb jeder Folie', async () => {
    const html = await (await AstroContainer.create()).renderToString(Scrum);
    const von = html.indexOf('<h2 id="nachlese"');
    const bis = html.indexOf('<h2 id="abweichungen"');
    expect(von).toBeGreaterThan(0);
    expect(bis).toBeGreaterThan(von);
    // Der Abschnitt steckt in einem nur-handout-Element, das keine Folie ist.
    const davor = html.slice(0, von);
    expect(davor.slice(davor.lastIndexOf('<'))).toMatch(/^<div class="nur-handout"[^>]*>\s*$/);
    // Bis zur Folie mit #abweichungen (<section … data-folie>), nicht bis zu ihrer Überschrift.
    const ende = html.lastIndexOf('<section', bis);
    expect(ende).toBeGreaterThan(von);
    const nachlese = html.slice(von, ende);
    expect(nachlese).not.toContain('data-folie');
    for (const id of THEORIE) expect(nachlese).toContain(`<h3 id="${id}"`);
    const text = textAusHtml(nachlese);
    for (const t of [
      '„Until we begin to see the software, we can’t really tell how well we’re doing“ (Ron Jeffries, „The Nature of Software Development“ (2015), S. 20)',
      'we value the items on the left more.“',
      '„Inspection without adaptation is considered pointless“ (S. 3–4)',
      '„The Product Owner is one person, not a committee“ (S. 5–6)',
      '„The Sprint is a container for all other events.“',
      'it returns to the Product Backlog for future consideration.“',
    ]) expect(text, t).toContain(t);
    expect(nachlese).toContain('src="/quellen/jeffries/phasen.jpg"');
    expect(nachlese).toContain('id="sk-scrum"');
  }, 60_000);
});

describe('Scrum-Seite: Links auf die Theorie-Anker', () => {
  it('sprint.astro verlinkt #events, und den Anker gibt es noch', () => {
    const sprint = readFileSync(new URL('../pages/innolab/methoden/sprint.astro', import.meta.url), 'utf8');
    expect(sprint).toContain('href="/innolab/methoden/scrum#events"');
    expect(QUELLE_SCRUM).toContain('<h3 id="events">');
  });

  it('gerendert: Abweichungen → Übung → Beispiel; die Übung mit Timer 4 + 3 und den Frames je Person', async () => {
    const html = await (await AstroContainer.create()).renderToString(Scrum);
    const ids = [...html.matchAll(/<h2[^>]*\bid="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.slice(ids.indexOf('abweichungen'), ids.indexOf('abweichungen') + 3)).toStrictEqual(['abweichungen', 'kaffeebar-sortieren', 'beispiel']);
    const q = QUELLE_SCRUM.slice(QUELLE_SCRUM.indexOf('<h2 id="kaffeebar-sortieren">'), QUELLE_SCRUM.indexOf('<h2 id="beispiel">'));
    expect(q).toContain('Übung: Kaffeebar auf der Scrum-Karte</h2>');
    expect([...q.matchAll(/<li data-schritt>[^]*?<Timer minuten=\{(\d+)\} \/><\/li>/g)].map((m) => Number(m[1]))).toStrictEqual([4, 3]);
    expect(q).toContain('Still sortieren');
    for (const n of [1, 2, 3]) expect(q).toContain(`Produkt ${n}`);
    for (const n of [1, 2, 3]) expect(q).toContain(`<MiroLink name="T4 · 3 · Scrum · Kaffeebar sortieren · Produkt ${n}">Produkt ${n}</MiroLink>`);
    // Die Lösung ist auf dem Board bis zur Auflösung versteckt: kein Link aus der Übung, sondern erst auf „Am Beispiel“.
    expect(q).not.toContain('Kaffeebar · Lösung');
    const beispiel = QUELLE_SCRUM.slice(QUELLE_SCRUM.indexOf('<h2 id="beispiel">'), QUELLE_SCRUM.indexOf('</Folie>', QUELLE_SCRUM.indexOf('<h2 id="beispiel">')));
    expect(beispiel).toContain('<MiroLink name="T4 · 3 · Scrum · Kaffeebar · Lösung">');
  }, 60_000);
});

describe('Miro: Frames der Übung „Kaffeebar auf der Scrum-Karte“', () => {
  it('drei Frames je Person und der Lösungs-Frame stehen mit ihren IDs in MIRO_FRAMES', () => {
    const t4 = Object.fromEntries(Object.entries(MIRO_FRAMES).filter(([k]) => k.startsWith('T4 · 3 · Scrum')));
    expect(t4).toStrictEqual({
      'T4 · 3 · Scrum · Kaffeebar sortieren · Produkt 1': '3458764691686327549',
      'T4 · 3 · Scrum · Kaffeebar sortieren · Produkt 2': '3458764691686327550',
      'T4 · 3 · Scrum · Kaffeebar sortieren · Produkt 3': '3458764691686327551',
      'T4 · 3 · Scrum · Kaffeebar · Lösung': '3458764691686327552',
    });
  });
});

// Entscheidung Markus 26.11.2026: „Euer Produkt in einem Satz“ wandert in die Teamaufstellung an Tag 5. Die Folie bleibt im
// Quelltext, abgeschaltet mit PRODUKTSATZ_AN_TAG_4 = false – weder Beamer noch Handout, Inhaltsverzeichnis oder Begleiter.
describe('Scrum-Seite: „Euer Produkt in einem Satz“ abgeschaltet', () => {
  it('im Quelltext steht die Folie im abgeschalteten Block', () => {
    expect(QUELLE_SCRUM).toMatch(/^const PRODUKTSATZ_AN_TAG_4 = false;$/m);
    const von = QUELLE_SCRUM.indexOf('{PRODUKTSATZ_AN_TAG_4 && (<>');
    expect(von).toBeGreaterThan(0);
    expect(QUELLE_SCRUM.slice(von, QUELLE_SCRUM.indexOf('</>)}', von))).toContain('<h2 id="produktziel">Euer Produkt in einem Satz</h2>');
  });

  it('gerendert, im Inhaltsverzeichnis und im Begleiter: keine Folie „produktziel“; nach dem Beispiel Planen, dann Tag 5', async () => {
    const html = await (await AstroContainer.create()).renderToString(Scrum);
    expect(html).not.toContain('Euer Produkt in einem Satz</h2>');
    const ids = [...html.matchAll(/<h2[^>]*\bid="([^"]+)"/g)].map((m) => m[1]);
    expect(ids).not.toContain('produktziel');
    expect(ids.slice(ids.indexOf('beispiel'), ids.indexOf('beispiel') + 3)).toStrictEqual(['beispiel', 'planen', 'weiter-tag-4']);
    expect(gliederung(QUELLE_SCRUM).map((a) => a.id)).not.toContain('produktziel');
    expect(folienAus('/innolab/methoden/scrum', QUELLE_SCRUM).flatMap((f) => [f.id, ...f.unterIds])).not.toContain('produktziel');
    // Außerhalb des Blocks verweist nichts auf den Anker.
    expect(html).not.toContain('href="#produktziel"');
  }, 60_000);
});
