// Der Kriterien-Katalog hängt am Kaffeebar-Beispiel: Was als wörtlich markiert ist, muss dort stehen. Ändert jemand die
// Beispieldateien oder Methodenseiten, wird dieser Test rot, statt dass der Katalog still etwas anderes zeigt.
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import annahmen from './beispiele/annahmen.json';
import entscheidungen from './beispiele/entscheidungen.json';
import { BRIEF_ABSCHNITTE } from './feedback';
import { METHODEN } from '../components/methoden';
import { KRITERIEN, KRITERIUM_ID, kriterienFuer, kriterium, kriteriumBehalten, kriteriumPasst, type Fassung } from './kriterien';
import { ARTEFAKT_NAMEN } from './schemas/index';

const lesen = (pfad: string) => readFileSync(pfad, 'utf8');
const leerraum = (s: string) => s.replace(/\s+/g, ' ');

// Alle Texte einer JSON-Datei; die Fassung muss genau einer davon sein (nicht nur ein Stück daraus).
function jsonTexte(x: unknown): string[] {
  if (typeof x === 'string') return [x];
  if (Array.isArray(x)) return x.flatMap(jsonTexte);
  if (x && typeof x === 'object') return Object.values(x).flatMap(jsonTexte);
  return [];
}

function stehtIn(f: Fassung): boolean {
  if (f.fundort === undefined) return false;
  if (f.fundort.endsWith('.json')) return jsonTexte(JSON.parse(lesen(f.fundort))).includes(f.text);
  return leerraum(lesen(f.fundort)).includes(leerraum(f.text));
}

const fassungen = KRITERIEN.flatMap((k) => [['schwach', k.paar.schwach], ['stark', k.paar.stark]].map(([seite, f]) => ({ k, seite: seite as string, f: f as Fassung })));

describe('Kriterien-Katalog', () => {
  it('13 Kriterien mit eindeutiger, stabiler ID', () => {
    const ids = KRITERIEN.map((k) => k.id);
    expect(ids).toStrictEqual([
      'output-statt-outcome', 'outcome-nicht-messbar', 'loesung-im-problem', 'zielgruppe-zu-vage', 'zwei-zielgruppen',
      'art-der-annahme', 'annahme-nicht-pruefbar', 'zwei-annahmen-in-einer', 'beleg-ohne-quelle', 'beleg-ueberschaetzt',
      'meinungsfrage', 'verallgemeinerung', 'suggestivfrage',
    ]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(kriterium('meinungsfrage')?.name).toBe('Meinungsfrage statt Geschichte');
    expect(kriterium('gibt-es-nicht')).toBeUndefined();
  });

  it('jede ID hat die Form, die feedback@1 liest (sonst wäre die Datei nach dem Schreiben unlesbar)', () => {
    expect(KRITERIEN.map((k) => k.id).filter((id) => !KRITERIUM_ID.test(id))).toStrictEqual([]);
  });

  it.each(KRITERIEN.map((k) => [k.id, k] as const))('%s: Name, Artefakte, Abschnitte nur beim Brief', (_, k) => {
    expect(k.name.trim()).not.toBe('');
    expect(k.artefakte.length).toBeGreaterThan(0);
    expect(k.artefakte.every((a) => (ARTEFAKT_NAMEN as readonly string[]).includes(a))).toBe(true);
    if (k.abschnitte !== undefined) {
      expect(k.artefakte).toContain('brief');
      expect(k.abschnitte.length).toBeGreaterThan(0);
      expect(k.abschnitte.every((a) => Object.hasOwn(BRIEF_ABSCHNITTE, a))).toBe(true);
    }
  });

  it.each(KRITERIEN.map((k) => [k.id, k] as const))('%s: Paar mit schwach, stark, warum; schwach ≠ stark', (_, k) => {
    const { schwach, stark, warum } = k.paar;
    for (const f of [schwach, stark]) {
      expect(f.text.trim()).not.toBe('');
      // Genau eins von beidem: wörtlich gefunden oder für den Katalog formuliert.
      expect((f.fundort !== undefined) !== (f.formuliert === true)).toBe(true);
    }
    expect(stark.fundort).toBeTruthy();
    expect(`${schwach.text}|${schwach.zusatz ?? ''}`).not.toBe(`${stark.text}|${stark.zusatz ?? ''}`);
    expect(warum.trim()).toMatch(/[.!?]$/);
  });

  it.each(KRITERIEN.map((k) => [k.id, k] as const))('%s: Quelle mit Methodenseite (Anker vorhanden, Linktext wie die Seite) und Buchseite', (_, k) => {
    expect(k.quelle.seiten.length).toBeGreaterThan(0);
    for (const { href, titel } of k.quelle.seiten) {
      const m = /^\/innolab\/([a-z0-9/-]+)#([a-z0-9-]+)$/.exec(href);
      expect(m, href).not.toBeNull();
      const datei = `src/pages/innolab/${m![1]}.astro`;
      expect(existsSync(datei), datei).toBe(true);
      // Linktext: „Seite – Überschrift des Ankers“, beides wörtlich (Name aus methoden.ts bzw. „Tag N“, h2 der Seite).
      const h2 = new RegExp(`<h2 id="${m![2]}">([^<]*)</h2>`).exec(lesen(datei));
      expect(h2, `${href}: Anker fehlt`).not.toBeNull();
      const methode = /^methoden\/(.+)$/.exec(m![1]);
      const tag = /^tag-(\d+)$/.exec(m![1]);
      const seite = methode ? METHODEN.find((x) => x.slug === methode[1])?.name : tag ? `Tag ${tag[1]}` : undefined;
      expect(titel).toBe(`${seite} – ${h2![1]}`);
    }
    // Zwei Links auf dieselbe Seite sind am Text zu unterscheiden.
    expect(new Set(k.quelle.seiten.map((s) => s.titel)).size).toBe(k.quelle.seiten.length);
    expect(k.quelle.buch).toMatch(/S\. \d/);
    // Value Proposition Design wird nach PDF-Seite zitiert.
    if (k.quelle.buch.includes('Value Proposition Design')) expect(k.quelle.buch).toMatch(/Value Proposition Design“ \(2014\), S\. [\d, –]+ \(PDF\)/);
    if (k.quelle.kursregel !== undefined) expect(k.quelle.kursregel).toMatch(/^\S.*[.!?]$/);
  });

  it.each(fassungen.filter((x) => x.f.fundort !== undefined).map((x) => [`${x.k.id} ${x.seite}`, x.f] as const))(
    '%s steht wörtlich im Kaffeebar-Material',
    (_, f) => {
      expect(existsSync(f.fundort!), f.fundort).toBe(true);
      expect(stehtIn(f), `${f.text} fehlt in ${f.fundort}`).toBe(true);
    },
  );

  it('Zusätze passen zum Beispiel: Art von A3, Belege von D4', () => {
    const a3 = annahmen.annahmen.find((a) => a.id === 'A3')!;
    const art = kriterium('art-der-annahme')!.paar;
    expect(art.stark.text).toBe(a3.text);
    expect(art.stark.zusatz).toBe('Art: bedienbar');
    expect(a3.art).toBe('bedienbar');
    expect(art.schwach.zusatz).not.toBe(art.stark.zusatz);

    const d4 = entscheidungen.entscheidungen.find((e) => e.id === 'D4')!;
    const beleg = kriterium('beleg-ohne-quelle')!.paar;
    expect(beleg.stark.text.startsWith(`${d4.entscheidung} — ${d4.grund} — Beleg: ${d4.beleg} (${d4.belegIds.join(', ')}`)).toBe(true);
    expect(beleg.schwach.text).toBe(`${d4.entscheidung} — ${d4.grund} — Beleg: ${d4.beleg}`);
    // Zu stark eingestuft: dieselbe Zeile, aber „getan“ statt der Stufe, die D4 im Beispiel hat.
    const ueber = kriterium('beleg-ueberschaetzt')!.paar;
    expect(d4.beleg).toBe('gesagt');
    expect(ueber.stark.text).toBe(beleg.stark.text);
    expect(ueber.schwach.text).toBe(`${d4.entscheidung} — ${d4.grund} — Beleg: getan (${d4.belegIds.join(', ')})`);

    // Zwei Annahmen in einer: die starke ist A2 (machbar), das Geld steht als eigene Annahme A4 (wirtschaftlich).
    const a2 = annahmen.annahmen.find((a) => a.id === 'A2')!;
    const a4 = annahmen.annahmen.find((a) => a.id === 'A4')!;
    const zwei = kriterium('zwei-annahmen-in-einer')!.paar;
    expect([zwei.stark.text, a2.art, a4.art]).toStrictEqual([a2.text, 'machbar', 'wirtschaftlich']);
    expect(zwei.stark.zusatz).toBe('Art: machbar; ob es sich rechnet, steht als eigene Annahme A4');

    // Zwei Zielgruppen: die starke Fassung ist die Entscheidung D3, die D1 ersetzt.
    const d3 = entscheidungen.entscheidungen.find((e) => e.id === 'D3')!;
    expect([kriterium('zwei-zielgruppen')!.paar.stark.text, d3.ersetzt]).toStrictEqual([d3.entscheidung, 'D1']);
  });
});

describe('Welche Kriterien passen (NDU-41)', () => {
  const ids = (a: Parameters<typeof kriterienFuer>[0], z?: string) => kriterienFuer(a, z).map((k) => k.id);

  it('je Artefakt und Brief-Abschnitt nur die passenden, in der Reihenfolge des Katalogs', () => {
    expect(ids('brief')).toStrictEqual(['output-statt-outcome', 'outcome-nicht-messbar', 'loesung-im-problem', 'zielgruppe-zu-vage', 'zwei-zielgruppen']);
    expect(ids('brief', 'outcome')).toStrictEqual(['output-statt-outcome', 'outcome-nicht-messbar']);
    expect(ids('brief', 'problem')).toStrictEqual(['loesung-im-problem']);
    expect(ids('brief', 'fuerWen')).toStrictEqual(['zielgruppe-zu-vage', 'zwei-zielgruppen']);
    expect(ids('brief', 'nicht')).toStrictEqual([]);
    expect(ids('annahmen', 'A2')).toStrictEqual(['art-der-annahme', 'annahme-nicht-pruefbar', 'zwei-annahmen-in-einer', 'beleg-ohne-quelle', 'beleg-ueberschaetzt']);
    expect(ids('entscheidungen')).toStrictEqual(['annahme-nicht-pruefbar', 'beleg-ohne-quelle', 'beleg-ueberschaetzt']);
    expect(ids('leitfaden', 'F1')).toStrictEqual(['meinungsfrage', 'verallgemeinerung', 'suggestivfrage']);
    expect(ids('interviews')).toStrictEqual([]);
  });

  it('kriteriumBehalten: nach einem Wechsel der Zeile bleibt nur ein Kriterium, das noch passt', () => {
    expect(kriteriumBehalten('brief', 'outcome', 'output-statt-outcome')).toBe('output-statt-outcome');
    expect(kriteriumBehalten('brief', 'problem', 'output-statt-outcome')).toBe('');
    expect(kriteriumBehalten('brief', undefined, 'output-statt-outcome')).toBe('output-statt-outcome');
    expect(kriteriumBehalten('brief', 'outcome', '')).toBe('');
    expect(kriteriumBehalten('brief', 'outcome', 'gibt-es-nicht')).toBe('');
  });

  it('kriteriumPasst: Artefakt zuerst, Abschnitt nur beim Brief', () => {
    const k = kriterium('loesung-im-problem')!;
    expect(kriteriumPasst(k, 'brief', 'problem')).toBe(true);
    expect(kriteriumPasst(k, 'brief')).toBe(true);
    expect(kriteriumPasst(k, 'brief', 'outcome')).toBe(false);
    // Nur noch der Brief: Torres S. 94–95 handelt von Chancen, nicht von Annahmen.
    expect(kriteriumPasst(k, 'annahmen', 'A2')).toBe(false);
    expect(kriteriumPasst(k, 'leitfaden')).toBe(false);
    const beleg = kriterium('beleg-ohne-quelle')!;
    expect(kriteriumPasst(beleg, 'annahmen', 'A2') && kriteriumPasst(beleg, 'entscheidungen', 'D4')).toBe(true);
  });
});
