import { describe, expect, it } from 'vitest';
import { quellenAusGlob } from './begleiter';
import { METHODEN, pruefPrompt } from '../components/methoden';
import { NOTIZEN } from '../data/begleiter';

// Entscheidung Markus 26.11.2026: In der Value Map zeigen Pain Relievers, Gain Creators und (beim Fit) Produkte mit Pfeil
// auf den Profil-Eintrag, den sie treffen – „(→ P1)“ heißt „lindert P1“, nicht „ist P1“. Profil-Einträge rechts behalten
// ihre eigene ID („P1 Nicht wissen, ob es sich ausgeht“); die Lückensätze aus der Ideation behalten „(J1) … (P1) … (G1)“.
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
// Auf der Seite steht nach dem Pfeil ein &nbsp;, damit „(→ P1)“ im Beamer nicht umbricht; hier wie ein Leerzeichen gelesen.
const vmRoh = quellen['/innolab/methoden/value-map'] ?? '';
const vm = vmRoh.replaceAll('→&nbsp;', '→ ');
const folie = (id: string) => {
  const a = vm.indexOf(`id="${id}"`);
  return vm.slice(a, vm.indexOf('</Folie>', a));
};

// Eine ID in Klammern ohne Pfeil: „(P1)“, „(G1, …)“, „(<strong>P1)“, „(P…)“ – und blanke Formen am Zettel:
// „Pain Reliever P2“, „Zettel P2“, „P2-Zettel“ (Review #444).
const OHNE_PFEIL = /\((?:<strong>)?[JPG](?:\d|…)|(?:Pain Reliever|Gain Creator|Zettel) [JPG]\d|\b[JPG]\d-Zettel/g;
// Lückensätze („Unser… – anders als der Automat.“, ohne inneres „“) und die linke Spalte von vom-satz (Halbsatz aus dem Lückensatz).
const LUECKENSATZ = /„Unsere? [^“]*?– anders als der Automat\.“/g;
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
    expect(folie('pr-finden')).toContain('meist mit Verb; (→ P…) dahinter.</li>');
    expect(folie('gc-finden')).toContain('meist mit Verb; (→ G…) dahinter.</li>');
    expect(folie('vorgehen')).toContain('Products & Services ohne ID · Pain Relievers mit (→ P…) · Gain Creators mit (→ G…).');
    expect(vm).toContain('- Pain Relievers: [was sich für die Kundschaft ändert] (→ P…; auch → J… oder → G…) (unverzichtbarste oben)');
    expect(vm).toContain('- Gain Creators: [was sich für die Kundschaft ändert] (→ G…; auch → J… oder → P…) (unverzichtbarste oben)');
  });

  it('nach dem Pfeil ein &nbsp; auf der Seite – außer in der Vorlage (Prompt zum Kopieren)', () => {
    const vorlage = vmRoh.slice(vmRoh.indexOf('<Prompt label="Vorlage'), vmRoh.indexOf('</Prompt>', vmRoh.indexOf('<Prompt label="Vorlage')));
    const ohneVorlage = vmRoh.replace(vorlage, '');
    expect(ohneVorlage.match(/\(→ [JPG]|→ [JPG](?:\d|…)/g) ?? []).toStrictEqual([]);
    expect(ohneVorlage.match(/→&nbsp;[JPG]/g)?.length).toBeGreaterThan(20);
    expect(vorlage.match(/&nbsp;/g) ?? []).toStrictEqual([]);
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
    expect(n).toContain('ein Zettel je Wirkung (VPD S. 100–101) mit (→ P…) oder (→ G…), auch (→ J…)');
    expect(n).toContain('A: Products & Services. B: Pain Reliever (→ P2).');
  });

  it('Prüfliste: Studierende lesen nur die Pfeil-Form, Claude toleriert die alte (Review #444)', () => {
    const m = METHODEN.find((x) => x.slug === 'value-map')!;
    const p = m.pruefliste!.find((x) => x.id === 'value-map-wirkung')!;
    expect(p.text).toBe('Bei Pain Relievers und Gain Creators stehen keine Produkte, sondern was sich für die Kundschaft ändert – mit der ID dessen, was der Zettel trifft: (→ P1), (→ G1), auch (→ J1) oder zwei IDs wie (→ P2, G1).');
    expect(p.frage).toBe('Eine ID ohne Pfeil wie „(P1)“ ist die ältere Schreibweise und kein Befund; frag nur nach, wenn unklar ist, was der Zettel trifft.');
    // Die Toleranz landet im Prüf-Prompt (pruefFragen), nicht in der Checkliste.
    expect(pruefPrompt(m)).toContain('Bei value-map-wirkung: Eine ID ohne Pfeil wie „(P1)“ ist die ältere Schreibweise und kein Befund');
  });

  it('Entscheidungen 26.11. (Runde 2): Satz statt „Satz mit Verb“, Pfeil auch auf Job/Gain, Ideen-Zettel ersetzt, Website-Check beim Füllen', () => {
    // A1: kein „ein Satz mit Verb“ mehr; die Regel steht als Regel dieses Kurses, „well-designed“ zählt.
    expect(vm.match(/[Ss]atz mit Verb/g) ?? []).toStrictEqual([]);
    expect(folie('pr-finden')).toContain('Ebenfalls Regeln dieses Kurses: „ein Satz, der sagt, was sich für die Kundschaft ändert – meist mit Verb“ (das Buch lässt auch Eigenschaften wie „well-designed“ zu, S. 105)');
    expect(folie('produkt-wirkung')).toContain('Die Regel dieses Kurses für die hellgrünen Zettel: ein Satz, der sagt, was sich für die Kundschaft ändert – meist mit Verb; eine Eigenschaft wie „well-designed“ zählt, wenn sie genau das sagt.');
    // A2: Pfeil auf Job oder Gain, zwei IDs bei Pain und Gain.
    expect(folie('pr-finden')).toContain('Der Pfeil zeigt auf das, was der Zettel trifft (S. 93, 112) – meist einen Pain, aber auch einen Job oder Gain, etwa (→ J1) oder (→ G2). Trifft ein Zettel Pain und Gain zugleich, ist das erlaubt (S. 103); dann trägt er zwei IDs, etwa (→ P2, G1).');
    expect(folie('gc-finden')).toContain('(S. 103); dann trägt der Zettel zwei IDs, etwa (→ P2, G1).');
    // A3: Ideen-Zettel wird durch die Produkte ersetzt.
    expect(folie('ps-finden')).toContain('<li data-schritt><strong>Idee zerlegen:</strong> ein gelber Zettel je Produkt oder Dienst – sie ersetzen den Ideen-Zettel aus dem Satz.</li>');
    expect(folie('vorgehen')).toContain('den gelben Ideen-Zettel ersetzt ihr durch die Produkte und Dienste, in die ihr die Idee zerlegt.');
    expect(JSON.stringify(NOTIZEN['/innolab/methoden/value-map']?.vorgehen ?? {})).toContain('Idee → Products & Services (wird ersetzt durch die Produkte, in die ihr sie zerlegt)');
    // A4: Website-Frage entscheidet beim Wählen und kommt beim Füllen als Check wieder.
    const schritte = folie('vorgehen').slice(folie('vorgehen').indexOf('<ol'), folie('vorgehen').indexOf('</ol>'));
    const fuellen = schritte.slice(schritte.indexOf('Euer Canvas, Quadrat'), schritte.indexOf('Skalen links'));
    expect(schritte.slice(0, schritte.indexOf('Euer Canvas, Quadrat'))).toContain('Was davon ist die Website, die ihr baut – und trifft sie allein noch P1?');
    expect(fuellen).toContain('<strong>Check:</strong> Welcher gelbe Zettel ist die Website – trifft sie allein noch P1?');
    expect(NOTIZEN['/innolab/methoden/value-map']?.vorgehen?.ablauf?.schritte?.[1]).toContain('Check: Welcher gelbe Zettel ist die Website – trifft sie allein noch P1?');
  });

  it('Quellenprüfung 26.11.: ✗ nur rechts und nur ohne anderen Treffer, Seiten, Kursvorgehen gekennzeichnet, S. 96', () => {
    const n = JSON.stringify(NOTIZEN['/innolab/methoden/value-map'] ?? {});
    // Befund 1: „kein Zettel → ✗“ nirgends mehr; das ✗ bekommt der Eintrag rechts, wenn ihn kein anderer Zettel trifft.
    expect([vm, n].flatMap((x) => x.match(/wird beim Fit ein ✗/g) ?? [])).toStrictEqual([]);
    expect(folie('pr-finden')).toContain('<li data-schritt><strong>Nein:</strong> kein Zettel. Trifft ihn auch kein anderer Zettel, bekommt der Pain beim Fit rechts ein ✗ – das ist erlaubt.</li>');
    expect(n).toContain('„Kein Zettel zu einem Pain ist erlaubt. Trifft ihn auch kein anderer, bekommt er beim Fit rechts ein ✗.“');
    // Befund 2: Seiten für das ✗ und die Erlaubnis.
    expect(folie('vorgehen')).toContain('bekommt er beim Fit rechts ein ✗ – das ist erlaubt (S. 110, 113; zum Verzicht S. 105–106).');
    // Befund 3: Profil von oben ist das Vorgehen des Kurses.
    expect(folie('pr-finden')).toContain('das Vorgehen, das Profil Pain für Pain von oben durchzugehen; das Buch fragt vom Angebot her (S. 87, 100) und verlangt nur den Fokus auf die extremen Pains (S. 86).');
    expect(folie('gc-finden')).toContain('Die Gains von oben durchzugehen ist wie bei den Pains das Vorgehen dieses Kurses; das Buch fragt vom Angebot her (S. 90, 101).');
    // Befund 7: Kursregeln im Begleiter nicht mit Buchseiten belegt.
    expect(n).not.toContain('Produkte ohne ID (VPD S. 99–101, 105)');
    expect(n).toContain('IDs, „Profil von oben“ und „Produkte ohne ID“ sind Regeln dieses Kurses.');
    // Befund 8: S. 96.
    expect(vm).toContain('Das Buch sieht das vor: „if you don’t have one yet, sketch out how you intend to create value with a new idea“ (S. 96).');
    // Befund 11: Bündel statt Features.
    expect(vm.match(/Features/g) ?? []).toStrictEqual([]);
    expect(folie('ps-finden')).toContain('<strong>Nur dieses Segment:</strong> nicht alle eure Produkte, nur das Bündel für dieses Segment.');
  });

  it('Review #444: „ID mit Pfeil dazu“ auf fit, im Handout und im Begleiter', () => {
    const n = NOTIZEN['/innolab/methoden/value-map'] ?? {};
    expect([vm, JSON.stringify(n)].flatMap((x) => x.match(/[Ww]as trifft er\? ID dazu|schreibt die ID dazu|trifft er etwas, ID dazu/g) ?? [])).toStrictEqual([]);
    expect(folie('fit')).toContain('<td><strong>1 Links, Zettel für Zettel:</strong> Was trifft er? ID mit Pfeil dazu, ✓ auf beide.</td>');
    expect(folie('fit')).toContain('Ihr schreibt die ID mit Pfeil dazu, etwa (→ P1), und setzt ein ✓');
    expect(n.vorgehen?.ablauf?.schritte?.[3]).toContain('trifft er etwas, ID mit Pfeil dazu, etwa (→ P1),');
    expect(n.fit?.live).toContain('Klick 1: Zettel vorlesen. Was trifft er? P1 – also (→ P1).');
  });
});
