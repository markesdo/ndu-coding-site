import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { bloeckeAus, quellenAusGlob } from './begleiter';
import { NOTIZEN } from '../data/begleiter';
import { MIRO_FRAMES } from '../components/miro-frames';

// Durchsicht Tag 4 (26.11.2026, Consult Abschnitt 5): Jede Folie der Tagesseite im Beamer allein verständlich.
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const seite = (p: string) => quellen[p] ?? '';
const folie = (p: string, id: string) => {
  const q = seite(p);
  const a = q.indexOf(`<h2 id="${id}">`);
  return a < 0 ? '' : q.slice(q.lastIndexOf('<Folie', a), q.indexOf('</Folie>', a));
};
/** Was im Beamer steht: die Folie ohne ihr Handout (div.nur-handout am Ende der Folie). */
const beamer = (f: string) => (f.includes('<div class="nur-handout">') ? f.slice(0, f.indexOf('<div class="nur-handout">')) : f);
const T4 = '/innolab/tag-4';

describe('Tag 4: „Was bauen wir?“ konkret', () => {
  it('Satz definiert Slice 1; die drei Zuläufe sagen, woher und was daraus wird', () => {
    const f = folie(T4, 'was-bauen-wir');
    expect(f).toContain('<p class="folie-satz">Bis 15:35 einen klickbaren Prototyp von Slice 1 – der kleinsten Version eures Spitzenreiters, die von Anfang bis Ende durchgeht.</p>');
    expect(f).not.toContain('die Tests davon');
    expect(f).toContain('beleg="liefert den Inhalt: den Weg eurer Person – aus Interviews und Experience Map."');
    expect(f).toContain('outcome="liefert das Maß: was Menschen danach anders tun – aus eurem Brief."');
    expect(f).toContain('annahme="liefert das Lernziel: was der Slice zeigen muss – daraus wird Test E1."');
  });

  it('die Komponente zeigt die Texte aus den Props; der Arbeitsfluss behält die neutralen Vorgaben', () => {
    const roh = readFileSync(new URL('../components/bild/WasBauenWir.astro', import.meta.url), 'utf8');
    for (const l of ['beleg', 'outcome', 'annahme']) expect(roh, l).toContain(`<strong>{LINIE.${l}.name}</strong> {${l}}</span>`);
    expect(roh).toContain("beleg = 'liefert den Inhalt: der Weg bis zum Höhepunkt.'");
    const af = folie('/innolab/arbeitsfluss', 'was-bauen-wir');
    expect(af).toContain('<WasBauenWir>An Tag 4 entsteht euer Slice 1.');
    expect(af).not.toMatch(/\b(beleg|outcome|annahme)="/);
  });
});

describe('Tag 4: Origin Story im Beamer', () => {
  it('#abschluss: was dabei herauskommt, und „sie“ wie in den Stationen', () => {
    expect(folie(T4, 'abschluss')).toContain('<p class="folie-satz">Wie jemand euren Wert zum ersten Mal sieht – und was sie dann tut. Ergebnis: der Text für euren Test E1.</p>');
  });

  it('#origin-beispiel folgt auf #abschluss; der Aufstellertext steht im Beamer, nicht mehr im Handout des Abschlusses', () => {
    const q = seite(T4);
    expect(q.indexOf('<h2 id="origin-beispiel">')).toBeGreaterThan(q.indexOf('<h2 id="abschluss">'));
    expect(q.indexOf('<h2 id="origin-beispiel">')).toBeLessThan(q.indexOf('<h2 id="hausaufgabe">'));
    const f = folie(T4, 'origin-beispiel');
    expect(f).toContain('<h2 id="origin-beispiel">Am Beispiel: der Aufsteller der Kaffeebar</h2>');
    expect(f).toContain('<p class="folie-satz">Erst der Pain, dann das Produkt, dann die Antwort auf die Hürde.</p>');
    expect(beamer(f)).toContain('<Prompt label="Beispiel · Origin Story als Aufstellertext" kopieren={false}>Zug in 8 Minuten, Schlange bis zur Tür?');
    expect([...beamer(f).matchAll(/<li data-schritt>([\s\S]*?)<\/li>/g)].map((m) => m[1])).toStrictEqual([
      '<strong>Die eine Handlung:</strong> „Trag deinen Zug ein“ – nicht „E-Mail hinterlassen“.',
      '<strong>Sie ist die Messgröße von E1.</strong>',
    ]);
    expect(f.slice(f.indexOf('<div class="nur-handout">'))).toContain('({BLAND}, S. 261)');
    expect(folie(T4, 'abschluss')).not.toContain('<Prompt');
    expect(q.match(/Origin Story als Aufstellertext/g)).toHaveLength(1);
  });
});

describe('Tag 4: Hausaufgabe mit Datum', () => {
  it('Satz nennt Tag 5 mit Datum und die zwei Tests zuerst', () => {
    expect(folie(T4, 'hausaufgabe')).toContain('<p class="folie-satz">Bis Tag 5 am 12. Dezember: Origin Story, dann E1 mit echten Menschen – Usability-Tests, wenn ihr Zeit habt.</p>');
  });
});

describe('Tag 4: Ablauf-Texte und Namen (Durchsicht 26.11.)', () => {
  const bloecke = bloeckeAus(seite(T4));
  const text = (titel: string) => {
    const q = seite(T4);
    const a = q.indexOf(`title="${titel}"`);
    return a < 0 ? '' : q.slice(q.indexOf('>', a) + 1, q.indexOf('</Block>', a));
  };
  it('Concept Story: Theorie = alle Folien, dann 30 min auf Miro im eigenen Frame', () => {
    expect(text('Story-Bogen + Concept Story')).toBe('Theorie, alle Folien (etwa 20 min): sieben Stationen, A × B = C, flach oder hoch. Dann 30 min schreiben, allein, auf Miro in „T4 · 0 · Concept Story · Produkt n“: sieben Stationen, Flach-Probe, festhalten.');
  });
  it('Geschäftsmodell: Titel wie die Seite, Text mit Linie und Annahme', () => {
    expect(bloecke.map((b) => b.titel)).toContain('Geschäftsmodell');
    expect(text('Geschäftsmodell')).toBe('Wer, Was, Wie, Wert; die Linie vom Outcome zum Geld; die wirtschaftliche Annahme für die Map.');
  });
  // Seit 26.11. abends: kein Übertrag in docs/STORYS.md; der Testprompt liest einen Screenshot des Frames, mit Opus.
  it('10:50: Claude Pro und Claude Code mit Opus, Testprompt mit Screenshot des Concept-Story-Frames', () => {
    const t = text('Claude Pro und Claude Code, gemeinsam');
    expect(t).toContain('mit Opus (<code>/model opus</code>)');
    expect(t).toContain('Screenshot eures Concept-Story-Frames einfügen – „Sag mir in einem Satz, worum es in meiner Concept Story geht.“');
    expect(t).not.toContain('docs/');
  });
  it('kein „Geschäftsmodell-Karten“ mehr auf Tag 4, Concept Story und Value Map; Pitch ohne Gebäck', () => {
    for (const p of [T4, '/innolab/methoden/concept-story', '/innolab/methoden/value-map']) {
      expect(seite(p).length, p).toBeGreaterThan(1000);
      expect(seite(p), p).not.toContain('Geschäftsmodell-Karten');
    }
    expect(seite('/innolab/methoden/concept-story')).toContain("next={{ href: '/innolab/methoden/geschaeftsmodell', t: 'Geschäftsmodell' }}");
    expect(seite('/innolab/methoden/pitch')).toContain('Wer zahlt wofür: Kaffee zum normalen Preis, bezahlt an der Ausgabe.');
    expect(seite('/innolab/methoden/pitch')).not.toContain('Gebäck');
  });
});

describe('Begleiter: Notizen zur Tagesseite Tag 4', () => {
  it('jede Folie hat eine Notiz, registriert vor der Value Map (Tagesbeginn 9:00)', () => {
    const n = NOTIZEN[T4] ?? {};
    expect(Object.keys(n)).toStrictEqual(['arbeitsfluss', 'was-bauen-wir', 'slice-im-baum', 'abschluss', 'origin-beispiel', 'hausaufgabe', 'ende-tag-4']);
    const seiten = Object.keys(NOTIZEN);
    expect(seiten.indexOf(T4)).toBe(seiten.indexOf('/innolab/methoden/value-map') - 1);
  });
});

const SEITEN_MIT_FRAMES = [T4, '/innolab/methoden/concept-story', '/innolab/methoden/geschaeftsmodell'];
/** Frames, die Fable noch baut (Stand 26.11. abends); Namen genau wie auf den Seiten. */
const OFFEN = [
  'T4 · 2 · Geschäftsmodell · Produkt n',
  'T4 · 4 · Usage Story · Produkt n',
  'T4 · 5 · Prototyp · Produkt n',
  'T4 · 6 · Origin Story · Produkt n',
  'T4 · 6 · Lernkarten · Produkt n',
];
// NACHTRAG 26.11. abends: Studierende schreiben keine docs/*.md mehr – alles auf Miro oder in der Werkstatt.
describe('Tag 4 ohne docs-Dateien für Studierende', () => {
  it('Tagesseite, Concept Story und Geschäftsmodell nennen außerhalb von Kommentaren keine docs-Datei', () => {
    const ohneKommentar = (q: string) => q.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\/.*$/gm, '');
    for (const p of [T4, '/innolab/methoden/concept-story', '/innolab/methoden/geschaeftsmodell']) {
      expect(seite(p).length, p).toBeGreaterThan(1000);
      expect(ohneKommentar(seite(p)).match(/docs\/[A-Z-]+\.md|committet und gepusht/g) ?? [], p).toStrictEqual([]);
    }
    for (const p of [T4, '/innolab/methoden/concept-story', '/innolab/methoden/geschaeftsmodell']) expect(JSON.stringify(NOTIZEN[p] ?? {}), p).not.toMatch(/docs\//);
  });

  it('Hausaufgabe: Checkliste -v6 nennt Miro-Frames, der Spike bleibt in seinem Branch', () => {
    const f = folie(T4, 'hausaufgabe');
    expect(f).toContain('<Checklist id="il-tag4-hausaufgabe-5-v6" items={[');
    for (const w of ['„T4 · 0 · Concept Story · Produkt n“', '„T4 · 2 · Geschäftsmodell · Produkt n“', '„T4 · 1 · Story Map“', '„T4 · 4 · Usage Story · Produkt n“', '„T4 · 6 · Origin Story · Produkt n“', '„T4 · 6 · Lernkarten · Produkt n“', '„T4 · 5 · Prototyp · Produkt n“', 'Der Spike liegt in seinem eigenen Branch auf GitHub']) expect(f, w).toContain(w);
  });

  // Jeder Frame-Name „T4 · …“ auf diesen Seiten steht in miro-frames.ts (bei „Produkt n“: mit Produkt 1) – oder in OFFEN, solange
  // Fable den Frame noch baut. Kommt die ID, wandert der Name nach miro-frames.ts und fliegt hier raus. Auf der Seite steht dann
  // ein MiroLink statt des Kommentars „TODO Miro-ID“.
  it('jeder genannte T4-Frame ist bekannt (MIRO_FRAMES) oder steht ausdrücklich in OFFEN', () => {
    const { offen, unbekannt, gesehen } = frameCheck(SEITEN_MIT_FRAMES.map(seite));
    expect(gesehen.length).toBeGreaterThan(5);
    expect(unbekannt).toStrictEqual([]);
    // OFFEN ohne Reste: Jeder offene Name wird noch genannt und hat noch keine ID.
    expect(OFFEN.filter((n) => !offen.includes(n))).toStrictEqual([]);
    for (const n of OFFEN) expect(Object.keys(MIRO_FRAMES), n).not.toContain(n.replace(/Produkt n$/, 'Produkt 1'));
  });

  it('der Wächter erkennt einen Frame, der weder bekannt noch offen ist, und einen ohne Anführungszeichen', () => {
    expect(frameCheck(['auf Miro in „T4 · 9 · Erfunden · Produkt n“.']).unbekannt).toStrictEqual(['T4 · 9 · Erfunden · Produkt n']);
    expect(frameCheck(['auf Miro (T4 · 6 · Origin Story).']).unbekannt).toStrictEqual(['ohne „…“: T4 · 6 · Origin Story).']);
    expect(frameCheck(['<MiroLink name="T4 · 0 · Concept Story · Produkt 1">', '„T4 · 6 · Origin Story · Produkt n“']).unbekannt).toStrictEqual([]);
  });

  it.todo(`Miro-IDs fehlen noch: ${OFFEN.join('; ')}`);
});

/** Frame-Namen aus Quelltexten (ohne Kommentare): in „…“ oder als name="…". Jedes andere „T4 · “ gilt als unbekannt. */
function frameCheck(quellen: string[]) {
  const gesehen: string[] = [];
  const unbekannt: string[] = [];
  for (const roh of quellen) {
    const q = roh.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/^\s*\/\/.*$/gm, '');
    const namen = [...q.matchAll(/„(T4 · [^“]+)“|name="(T4 · [^"]+)"/g)].map((m) => m[1] ?? m[2]);
    gesehen.push(...namen);
    const rest = q.replace(/„T4 · [^“]+“|name="T4 · [^"]+"/g, '');
    unbekannt.push(...(rest.match(/T4 · [^<,;]{0,40}/g) ?? []).map((t) => `ohne „…“: ${t.trim()}`));
  }
  const bekannt = (n: string) => Object.hasOwn(MIRO_FRAMES, n) || Object.hasOwn(MIRO_FRAMES, n.replace(/Produkt n$/, 'Produkt 1'));
  const offen = [...new Set(gesehen.filter((n) => OFFEN.includes(n)))];
  unbekannt.unshift(...new Set(gesehen.filter((n) => !bekannt(n) && !OFFEN.includes(n))));
  return { gesehen, offen, unbekannt };
}
