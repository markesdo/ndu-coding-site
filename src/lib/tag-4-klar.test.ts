import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { bloeckeAus, quellenAusGlob } from './begleiter';
import { NOTIZEN } from '../data/begleiter';
import { MIRO_FRAMES } from '../components/miro-frames';
import { bearbeitenHref } from '../werkstatt/ui/bearbeiten-link';

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
    expect(f).toContain('<p class="folie-satz">Heute einen Prototyp von Slice 1 auf Papier – der kleinsten Version eures Spitzenreiters, die von Anfang bis Ende durchgeht. An Tag 5 baut Claude Code daraus die echte Version.</p>');
    expect(f).not.toContain('die Tests davon');
    expect(f).toContain('beleg="liefert den Inhalt: den Weg eurer Person – aus Interviews und Experience Map."');
    expect(f).toContain('outcome="liefert das Maß: was Menschen danach anders tun – aus eurem Brief."');
    expect(f).toContain('annahme="liefert das Lernziel: was der Slice zeigen muss – daraus wird Test E1."');
  });

  // 28.11.2026 (Markus): Überleitung zur Concept Story als letzte Zeile im Beamer, als einziger Aufdeck-Schritt (die
  // Komponente steht hier mit schritte={false}). Kurzfassung, weil die lange Frage bei 1280×720 nicht passt.
  it('letzte Zeile im Beamer: zuerst die Frage, dafür die Concept Story', () => {
    const b = beamer(folie(T4, 'was-bauen-wir'));
    const zeile = '<p class="nur-beamer" data-schritt>Zuerst: Warum ist euer Spitzenreiter besser als heute? – die Concept Story.</p>';
    expect(b).toContain(zeile);
    expect(b.trimEnd().endsWith(zeile)).toBe(true);
    expect(b.match(/data-schritt\b/g) ?? []).toHaveLength(1);
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
    expect(folie(T4, 'abschluss')).toContain('<p class="folie-satz">Wie eine Person den Wert eures Produkts zum ersten Mal sieht – und was sie dann tut. Ergebnis: der Text für euren Test E1.</p>');
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
  // Dozent 27.11.2026: E1 läuft nicht; Tests mit Menschen sind freiwillig.
  it('Satz nennt Origin Story und Karte E1, Tests freiwillig', () => {
    expect(folie(T4, 'hausaufgabe')).toContain('<p class="folie-satz">Bis Tag 5: Origin Story und eure Karte E1 fertig – Tests mit Menschen sind freiwillig.</p>');
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
    expect(text('Story-Bogen + Concept Story')).toBe('Theorie, alle Folien (etwa 20 min): sieben Stationen, A × B = C, flach oder hoch. Dann 30 min schreiben, allein, auf Miro in „T4 · 0 · Concept Story · Produkt n“: sieben Stationen mit Flach-Probe als Check, festhalten.');
  });
  it('Geschäftsmodell: Titel wie die Seite, Text mit Linie und Annahme', () => {
    expect(bloecke.map((b) => b.titel)).toContain('Geschäftsmodell');
    expect(text('Geschäftsmodell')).toBe('Wer, Was, Wie, Wert; die Linie vom Outcome zum Geld; die wirtschaftliche Annahme für die Map.');
  });
  // Seit 26.11.2026 nachts: Claude Pro und Claude Code an Tag 5 (tag-5-claude-pro.test.ts); Tag 4 hat stattdessen einen Puffer.
  it('kein Claude-Block mehr an Tag 4; der Puffer nach dem Prototyp auf Papier sagt, was nachzuholen ist', () => {
    expect(bloecke.map((b) => b.titel)).not.toContain('Claude Pro und Claude Code, gemeinsam');
    expect(text('Prototyp auf Papier')).toBe('Papier-Skizzen oder lo-fi in Figma, Abnahmekriterien, Karte E2, Trockenlauf. Gebaut wird an Tag 5.');
    expect(text('Puffer: nachholen, was offen ist')).toBe('Allein fertig machen, was heute offen blieb – zuerst Papier-Prototyp und Karte E2, dann Story Map und Usage Story; Markus kommt ins 1:1.');
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

// Alle Seiten, die Tag-4-Frames nennen (Tag 4, seine Methoden, Tag 5). Seit 27.11.2026 haben alle Frames eine ID: OFFEN ist
// leer, und jeder genannte Name muss in miro-frames.ts stehen (bei „Produkt n“: mit Produkt 1).
const SEITEN_MIT_FRAMES = [T4, '/innolab/tag-5', ...['concept-story', 'geschaeftsmodell', 'experiment', 'story-map', 'usage-story', 'prototyp-spike', 'scrum'].map((s) => `/innolab/methoden/${s}`)];
/** Frames, deren ID noch fehlt; Namen genau wie auf den Seiten. Kommt ein neuer Frame ohne ID dazu: hier eintragen. */
const OFFEN: string[] = [];
// NACHTRAG 26.11. abends: Studierende schreiben keine docs/*.md mehr – alles auf Miro oder in der Werkstatt.
describe('Tag 4 ohne docs-Dateien für Studierende', () => {
  // Seit 27.11.2026 alle Seiten des Tages bis auf Scrum (dessen docs/TEAM.md gehört zu Tag 5) und ihre Begleiter-Notizen.
  it('Tagesseite und die Methoden von Tag 4 nennen außerhalb von Kommentaren keine docs-Datei', () => {
    const ohneKommentar = (q: string) => q.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\/.*$/gm, '');
    const seiten = [T4, ...['value-map', 'concept-story', 'geschaeftsmodell', 'experiment', 'story-map', 'usage-story', 'prototyp-spike'].map((x) => `/innolab/methoden/${x}`)];
    for (const p of seiten) {
      expect(seite(p).length, p).toBeGreaterThan(1000);
      expect(ohneKommentar(seite(p)).match(/docs\/[A-Z-]+\.md|committet und gepusht/g) ?? [], p).toStrictEqual([]);
      expect(JSON.stringify(NOTIZEN[p] ?? {}), p).not.toMatch(/docs\//);
    }
  });

  it('Hausaufgabe: Checkliste -v8 nennt Miro-Frames und Claude Code bis Tag 5', () => {
    const f = folie(T4, 'hausaufgabe');
    expect(f).toContain('<Checklist id="il-tag4-hausaufgabe-5-v8" items={[');
    // 27.11. abends: die Werkstatt erst am Abend, in der Reihenfolge der Nummern (sie vergibt die IDs selbst).
    expect(f).toContain('die neuen Annahmen der Idee in der <a href="/innolab/mappe?bearbeiten=annahmen">Annahmen-Map der Werkstatt</a>, in der Reihenfolge der Nummern ab A5\'');
    for (const w of ['„T4 · 0 · Concept Story · Produkt n“', '„T4 · 7 · Geschäftsmodell · Produkt n“', '„T4 · 1 · Story Map“', '„T4 · 4 · Usage Story · Produkt n“', '„T4 · 6 · Origin Story · Produkt n“', '„T4 · 6 · Lernkarten · Produkt n“', '„T4 · 5 · Prototyp · Produkt n“', 'Claude Code auf eurem Mac installiert']) expect(f, w).toContain(w);
    expect(f.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')).not.toMatch(/Spike/);
  });

  // Jeder Frame-Name „T4 · …“ auf diesen Seiten steht in miro-frames.ts (bei „Produkt n“: mit Produkt 1) – oder in OFFEN, solange
  // der Frame noch keine ID hat. Kommt die ID, wandert der Name nach miro-frames.ts und fliegt aus OFFEN.
  it('jeder genannte T4-Frame ist bekannt (MIRO_FRAMES) oder steht ausdrücklich in OFFEN', () => {
    for (const p of SEITEN_MIT_FRAMES) expect(seite(p).length, p).toBeGreaterThan(1000);
    const { offen, unbekannt, gesehen } = frameCheck(SEITEN_MIT_FRAMES.map(seite));
    expect(gesehen.length).toBeGreaterThan(30);
    expect(unbekannt).toStrictEqual([]);
    // OFFEN ohne Reste: Jeder offene Name wird noch genannt und hat noch keine ID.
    expect(OFFEN.filter((n) => !offen.includes(n))).toStrictEqual([]);
    for (const n of OFFEN) expect(Object.keys(MIRO_FRAMES), n).not.toContain(n.replace(/Produkt n$/, 'Produkt 1'));
  });

  it('der Wächter erkennt einen Frame, der weder bekannt noch offen ist, und einen ohne Anführungszeichen', () => {
    expect(frameCheck(['auf Miro in „T4 · 9 · Erfunden · Produkt n“.']).unbekannt).toStrictEqual(['T4 · 9 · Erfunden · Produkt n']);
    expect(frameCheck(['auf Miro (T4 · 6 · Origin Story).']).unbekannt).toStrictEqual(['ohne „…“: T4 · 6 · Origin Story).']);
    expect(frameCheck(['<Prompt label="Miro · T4 · 4 · Usage Story · Produkt n">', '<MiroLink name="T4 · 0 · Annahmen der Idee">T4 · 0 · Annahmen der Idee</MiroLink>']).unbekannt).toStrictEqual([]);
    expect(frameCheck(['<Prompt label="Miro · T4 · 4 · Usage Storys · Produkt n">']).unbekannt).toStrictEqual(['T4 · 4 · Usage Storys · Produkt n']);
    expect(frameCheck(['<MiroLink name="T4 · 0 · Concept Story · Produkt 1">', '„T4 · 6 · Origin Story · Produkt n“']).unbekannt).toStrictEqual([]);
    // Der alte Name des Geschäftsmodells (T4 · 2 ist die Teamaufstellung) und der lange Prototyp-Name sind unbekannt.
    expect(frameCheck(['„T4 · 2 · Geschäftsmodell · Produkt n“', '„T4 · 5 · Prototyp · Karte E2 und Befunde · Produkt n“']).unbekannt)
      .toStrictEqual(['T4 · 2 · Geschäftsmodell · Produkt n', 'T4 · 5 · Prototyp · Karte E2 und Befunde · Produkt n']);
  });

  it('wo die Seiten Produkt-Frames nennen, verlinken sie alle drei Produkte (keine TODO-Marken mehr)', () => {
    const alle = SEITEN_MIT_FRAMES.map(seite).join('\n');
    expect(alle).not.toMatch(/TODO Miro-ID/);
    for (const f of ['T4 · 7 · Geschäftsmodell', 'T4 · 4 · Usage Story', 'T4 · 5 · Prototyp', 'T4 · 6 · Origin Story', 'T4 · 6 · Lernkarten']) {
      for (const n of [1, 2, 3]) expect(alle, `${f} · Produkt ${n}`).toMatch(new RegExp(`<MiroLink name="${f} · Produkt ${n}">(Produkt )?${n}</MiroLink>`));
    }
  });
});

// Tag 5 liest, was an Tag 4 entstand, von Miro: Story Map und Befunde als Bilder, nicht aus docs-Dateien. Usability-Tests bis
// Tag 5 sind freiwillig – E2 und Befunde nur „falls getestet“.
describe('Tag 5 liest Tag 4 von Miro', () => {
  const T5 = ['/innolab/tag-5', ...['backlog', 'schneiden', 'sprint', 'akzeptanzkriterien'].map((x) => `/innolab/methoden/${x}`)];
  it('keine Tag-4-Datei (Story Map, Tests, Experimente, Storys, Geschäftsmodell) auf Tag 5 und seinen Methoden', () => {
    for (const p of T5) {
      expect(seite(p).length, p).toBeGreaterThan(1000);
      // Ausnahme: sprint#review nennt docs/TESTS.md für die Tests an Tag 6 (wie tag-6.astro) – eigene Entscheidung für Tag 6.
      const q = p.endsWith('/sprint') ? seite(p).replace('(U-IDs in <code>docs/TESTS.md</code>)', '') : seite(p);
      expect(q.match(/docs\/(STORY-MAP|TESTS|EXPERIMENTE|STORYS|GESCHAEFTSMODELL)\.md/g) ?? [], p).toStrictEqual([]);
    }
  });
  it('Prompts bekommen Bilder der Frames; E2 und Befunde sind freiwillig; U1–U3 verlinkt auf die Befunde', () => {
    expect(seite('/innolab/methoden/backlog')).toContain('Unter dieser Nachricht stehen Bilder aus Miro: meine Spalte im Frame „T4 · 1 · Story Map“ mit Slice 1 und, falls ich getestet habe, die Befunde aus meinem Frame „T4 · 5 · Prototyp · Produkt n“.');
    expect(seite('/innolab/methoden/schneiden')).toContain('Unter dieser Nachricht steht ein Bild meiner Story Map von Miro (meine Spalte im Frame „T4 · 1 · Story Map“, Slice 1).');
    const t5 = seite('/innolab/tag-5');
    expect(t5).toContain('<strong>Je Product Ownerin:</strong> Karte E1 und die zwei Fragen, E2 (falls getestet), Empfehlung');
    expect(t5).toContain('E2 und U1–U3 stehen auf der Seite <a href="/innolab/methoden/prototyp-spike#beispiel-befunde">');
    expect(seite('/innolab/methoden/prototyp-spike')).toContain('<h2 id="beispiel-befunde">');
  });
});

// Dozent 27.11.2026: Jede „So geht ihr vor“-/Schritt-Folie verlinkt, was die Studierenden brauchen – im Beamer und auf der
// Seite (die Seite ist ihr Handout): die eigenen Miro-Frames je Produkt, die Anleitung auf Miro und die Werkstatt, wo ein
// Schritt dort schreibt.
describe('So geht ihr vor: Frames, Anleitung und Werkstatt verlinkt', () => {
  const M = (s: string) => `/innolab/methoden/${s}`;
  const PS = ['vorgehen', 'schritt-papier', 'schritt-kriterien', 'schritt-karte', 'schritt-trockenlauf'];
  const FOLIEN: { p: string; id: string; produkt: string[]; frames: string[] }[] = [
    { p: M('value-map'), id: 'vorgehen', produkt: ['T3 · 4 · Canvas', 'T3 · 4 · Anleitung Value Map'], frames: ['T3 · 4 · Anleitung Value Map · Kaffeebar'] },
    { p: M('value-map'), id: 'vorgehen-fit', produkt: ['T3 · 4 · Canvas', 'Baum'], frames: [] },
    { p: M('concept-story'), id: 'vorgehen', produkt: ['T4 · 0 · Concept Story'], frames: ['T4 · 0 · Concept Story · Kaffeebar', 'T4 · 0 · Anleitung Concept Story'] },
    { p: M('geschaeftsmodell'), id: 'vorgehen', produkt: ['T4 · 7 · Geschäftsmodell'], frames: ['T4 · 7 · Geschäftsmodell · Kaffeebar', 'T4 · 7 · Anleitung Geschäftsmodell'] },
    { p: M('experiment'), id: 'vorgehen', produkt: [], frames: ['T4 · 0 · Annahmen der Idee', 'T4 · 0 · Anleitung Annahmen der Idee'] },
    { p: M('experiment'), id: 'vorgehen-karte', produkt: ['Baum'], frames: ['T4 · 0 · Annahmen der Idee', 'T4 · 0 · Anleitung Annahmen der Idee'] },
    { p: M('story-map'), id: 'warmup', produkt: ['T4 · 1 · Warm-up · euer Morgen'], frames: ['T4 · 1 · Anleitung Warm-up · euer Morgen'] },
    { p: M('story-map'), id: 'vorgehen', produkt: [], frames: ['T4 · 1 · Story Map', 'T4 · 1 · Anleitung Story Map'] },
    { p: M('usage-story'), id: 'vorgehen', produkt: ['T4 · 4 · Usage Story'], frames: ['T4 · 4 · Usage Story · Kaffeebar', 'T4 · 4 · Anleitung Usage Story'] },
    ...PS.map((id) => ({ p: M('prototyp-spike'), id, produkt: ['T4 · 5 · Prototyp'], frames: id === 'vorgehen' ? ['T4 · 5 · Prototyp · Kaffeebar', 'T4 · 5 · Anleitung Prototyp'] : [] })),
    { p: T4, id: 'hausaufgabe', produkt: ['T4 · 6 · Origin Story', 'T4 · 5 · Prototyp'], frames: ['T4 · 6 · Anleitung Origin Story', 'T4 · 0 · Annahmen der Idee'] },
  ];
  const ohne = (f: string, klasse: string) => f
    .replace(new RegExp(`<div class="${klasse}">[\\s\\S]*$`), '')
    .replace(new RegExp(`<(p|ol|ul) class="[^"]*\\b${klasse}\\b[^"]*">[\\s\\S]*?</\\1>`, 'g'), '');
  const verlinkt = (q: string, name: string) => q.includes(`<MiroLink name="${name}">`) || q.includes(`<MiroFrame name="${name}" />`);
  for (const { p, id, produkt, frames } of FOLIEN) {
    it(`${p}#${id}`, () => {
      const f = folie(p, id);
      expect(f.length, `${p}#${id}`).toBeGreaterThan(200);
      // Was im Beamer steht (ohne Handout) und was auf der Seite steht (ohne nur-beamer): beides verlinkt.
      for (const [ansicht, q] of [['Beamer', ohne(f, 'nur-handout')], ['Seite', ohne(f, 'nur-beamer')]] as const) {
        for (const pre of produkt) for (const n of [1, 2, 3]) expect(verlinkt(q, `${pre} · Produkt ${n}`), `${ansicht}: ${pre} · Produkt ${n}`).toBe(true);
        for (const name of frames) expect(verlinkt(q, name), `${ansicht}: ${name}`).toBe(true);
        if (/Annahmen-Map|Produkt-Brief|Werkstatt/.test(q.replace(/<[^>]+>/g, ''))) expect(q, `${ansicht}: Werkstatt-Link`).toMatch(/href="\/innolab\/mappe\?bearbeiten=(annahmen|brief)"/);
      }
    });
  }
  it('die Werkstatt-Links sind die Direktlinks der Mappe (bearbeitenHref)', () => {
    expect(bearbeitenHref('annahmen')).toBe('/innolab/mappe?bearbeiten=annahmen');
    expect(bearbeitenHref('brief')).toBe('/innolab/mappe?bearbeiten=brief');
  });
});

/** Frame-Namen aus Quelltexten (ohne Kommentare): in „…“, als name="…", als Text eines MiroLink (>…</MiroLink>) oder am Ende
 *  eines Prompt-Labels (label="Miro · …"). Jedes andere „T4 · “ gilt als unbekannt. */
function frameCheck(quellen: string[]) {
  const gesehen: string[] = [];
  const unbekannt: string[] = [];
  for (const roh of quellen) {
    const q = roh.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/^\s*\/\/.*$/gm, '');
    const muster = /„(T4 · [^“]+)“|name="(T4 · [^"]+)"|>(T4 · [^<]+)<\/MiroLink>|label="[^"]*?(T4 · [^"]+)"/g;
    const namen = [...q.matchAll(muster)].map((m) => m[1] ?? m[2] ?? m[3] ?? m[4]);
    gesehen.push(...namen);
    const rest = q.replace(muster, '');
    unbekannt.push(...(rest.match(/T4 · [^<,;]{0,40}/g) ?? []).map((t) => `ohne „…“: ${t.trim()}`));
  }
  const bekannt = (n: string) => Object.hasOwn(MIRO_FRAMES, n) || Object.hasOwn(MIRO_FRAMES, n.replace(/Produkt n$/, 'Produkt 1'));
  const offen = [...new Set(gesehen.filter((n) => OFFEN.includes(n)))];
  unbekannt.unshift(...new Set(gesehen.filter((n) => !bekannt(n) && !OFFEN.includes(n))));
  return { gesehen, offen, unbekannt };
}
