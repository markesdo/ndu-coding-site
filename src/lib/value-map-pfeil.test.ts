import { describe, expect, it } from 'vitest';
import { quellenAusGlob } from './begleiter';
import { METHODEN } from '../components/methoden';
import { NOTIZEN } from '../data/begleiter';

// Entscheidung Markus 26.11.2026: In der Value Map zeigen Pain Relievers, Gain Creators und (beim Fit) Produkte mit Pfeil
// auf den Profil-Eintrag, den sie treffen – „(→ P1)“ heißt „lindert P1“, nicht „ist P1“. Profil-Einträge rechts behalten
// ihre eigene ID („P1 Nicht wissen, ob es sich ausgeht“); die Lückensätze aus der Ideation behalten „(J1) … (P1) … (G1)“.
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const vm = quellen['/innolab/methoden/value-map'] ?? '';
const folie = (id: string) => {
  const a = vm.indexOf(`id="${id}"`);
  return vm.slice(a, vm.indexOf('</Folie>', a));
};

// Eine ID in Klammern ohne Pfeil: „(P1)“, „(G1, …)“, „(<strong>P1)“, „(P…)“.
const OHNE_PFEIL = /\((?:<strong>)?[JPG](?:\d|…)/g;
// Lückensätze („Unser… – anders als der Automat.“) und die linke Spalte von vom-satz (Halbsatz aus dem Lückensatz).
const LUECKENSATZ = /„Unsere? [\s\S]*?– anders als der Automat\.“/g;
const SATZ_SPALTE = /<td>… [^<]*<\/td><td>→ (?:Pain Reliever|Gain Creator)<\/td>/g;

// Die vier Wirkungs-Zettel der Kaffeebar, wie sie in der Value Map stehen.
const ZETTEL = [
  'Beim Bestellen steht, ob der Kaffee vor der Abfahrt fertig ist',
  'Statt anzustehen: in 20 Sekunden im Gehen bestellen',
  'Man sieht, wann der Kaffee fertig ist',
  'Der Kaffee steht bereit, wenn man an der Ausgabe ankommt',
];

describe('Value Map: Pfeil-IDs links (Entscheidung 26.11.)', () => {
  it('außerhalb der Lückensätze trägt keine ID in Klammern die alte Form', () => {
    const rest = vm.replace(LUECKENSATZ, '').replace(SATZ_SPALTE, '');
    expect(rest.match(OHNE_PFEIL) ?? []).toStrictEqual([]);
    expect(vm.match(/P-ID|G-ID|P- oder G-ID|P[123]-Zettel/g) ?? []).toStrictEqual([]);
  });

  it('die Zettel der Kaffeebar tragen, wo sie eine ID haben, die Pfeil-Form', () => {
    const treffer = ZETTEL.flatMap((z) => [...vm.matchAll(new RegExp(`${z} (?:<strong>)?\\(([^)]*)\\)`, 'g'))].map((m) => m[1]));
    // vom-satz und fit · vom-satz und pr-finden · vom-satz · vom-satz und gc-finden.
    expect(treffer).toStrictEqual(['→ P1', '→ P1', '→ P2', '→ P2', '→ P3', '→ G1', '→ G1']);
    expect(folie('produkt-wirkung')).toContain('<strong>B:</strong> Pain Reliever (→ P2)</p>');
    expect(folie('pr-finden')).toContain('ein Satz mit Verb, (→ P…) dahinter.</li>');
    expect(folie('gc-finden')).toContain('ein Satz mit Verb, (→ G…) dahinter.</li>');
    expect(folie('vorgehen')).toContain('Products & Services ohne ID · Pain Relievers mit (→ P…) · Gain Creators mit (→ G…).');
    expect(vm).toContain('- Pain Relievers: [wie genau] (→ P…) (unverzichtbarste oben)');
    expect(vm).toContain('- Gain Creators: [wie genau] (→ G…) (unverzichtbarste oben)');
  });

  it('Profil-Einträge rechts behalten ihre eigene ID, ohne Pfeil', () => {
    expect(folie('fit')).toContain('<td>P1 Nicht wissen, ob es sich ausgeht <strong>✓</strong></td>');
    expect(folie('fit').match(/<td>→ [JPG]\d/g) ?? []).toStrictEqual([]);
    expect(quellen['/innolab/methoden/kundenprofil']?.match(/\(→ /g) ?? []).toStrictEqual([]);
  });

  it('die Erklärung steht einmal, im Handout von pr-finden', () => {
    const satz = 'Links zeigt der Pfeil, worauf ein Zettel zielt: (→ P1) heißt ‚lindert P1‘, nicht ‚ist P1‘. Im Buch gibt es keine IDs – es verbindet beim Fit mit Haken (S. 110, 112); die IDs sind eine Regel dieses Kurses';
    expect(folie('pr-finden')).toContain(`<p class="nur-handout">`);
    expect(folie('pr-finden').slice(folie('pr-finden').indexOf('<p class="nur-handout">'))).toContain(satz);
    expect(vm.split('Links zeigt der Pfeil, worauf ein Zettel zielt').length - 1).toBe(1);
  });

  it('Lückensätze bleiben in der alten Form', () => {
    const saetze = vm.match(LUECKENSATZ) ?? [];
    expect(saetze).toHaveLength(4);
    for (const s of saetze) {
      expect(s).toContain('(J1)');
      expect(s).toContain('(P1)');
      expect(s.match(/\(→/g) ?? []).toStrictEqual([]);
    }
    expect(folie('vom-satz')).toContain('<tr data-schritt><td>… zeigt, ob der Kaffee vor der Abfahrt fertig ist (P1)</td><td>→ Pain Reliever</td><td>Beim Bestellen steht, ob der Kaffee vor der Abfahrt fertig ist (→ P1)</td></tr>');
    expect(folie('vom-satz')).toContain('<tr data-schritt><td>… ihn bereitstellt, wenn man an der Ausgabe ankommt (G1)</td><td>→ Gain Creator</td><td>Der Kaffee steht bereit, wenn man an der Ausgabe ankommt (→ G1)</td></tr>');
    expect(quellen['/innolab/methoden/ideation']).toContain('wollen (J…), indem es <strong>[Pain]</strong> [verringert] (P…) und <strong>[Gain]</strong> [ermöglicht] (G…)');
    // Begleiter: „Halbsatz vor (P1)“ meint den Lückensatz und bleibt.
    const n = JSON.stringify(NOTIZEN['/innolab/methoden/value-map'] ?? {});
    expect(n).toContain('„Der Halbsatz vor (P1) ist euer erster Pain Reliever.“');
    expect(n).toContain('Halbsatz vor (P…) → Pain Reliever, Halbsatz vor (G…) → Gain Creator');
  });

  it('Begleiter: Zettel links mit Pfeil, keine P-/G-ID-Formel', () => {
    const n = JSON.stringify(NOTIZEN['/innolab/methoden/value-map'] ?? {});
    expect(n.replace(/Halbsatz vor \([PG][^)]*\)/g, '').match(OHNE_PFEIL) ?? []).toStrictEqual([]);
    expect(n.match(/P-ID|G-ID|P- oder G-ID/g) ?? []).toStrictEqual([]);
    expect(n).toContain('ein Zettel je Wirkung mit (→ P…) oder (→ G…)');
    expect(n).toContain('A: Products & Services. B: Pain Reliever (→ P2).');
  });

  it('Prüfliste: Claude akzeptiert beide Schreibweisen', () => {
    const p = METHODEN.find((m) => m.slug === 'value-map')?.pruefliste?.find((x) => x.id === 'value-map-wirkung')?.text ?? '';
    expect(p).toContain('(→ P1)');
    expect(p).toContain('die ältere Schreibweise (P1) zählt genauso');
  });
});
