import { describe, expect, it } from 'vitest';
import { MIRO_FRAMES } from '../components/miro-frames';
import { NOTIZEN } from '../data/begleiter';
import { TAG_1 } from '../data/begleiter/tag';
import {
  TAG_1_SEITEN, ablaufBloecke, bloeckeAus, folieZu, folienAus, folienPlan, hhmm, kurstagAus, layoutTitel, notizenMitFremdemFrame, notizenOhneFolie,
  pfadAusGlob, quelleTeile, quellenAusGlob, seitenLabel, stichwortForm, streichVerweis, tagFolien, tempo, uebungMinuten, wischErlaubt, type WischKnoten,
} from './begleiter';

// Dieselbe Glob-Form wie in pages/innolab/begleiter.astro (vom Projektwurzel aus, unabhängig vom Ordner der Datei).
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);

const QUELLE = `
<Layout>
  <h2 id="ablauf">Ablauf</h2>
  <Folie>
    <h2 id="a">A</h2>
    <p class="folie-satz">Eins.</p>
    <Video id="yt-123" /><Checklist id="cl-1" />
  </Folie>
  <Folie>
    <h2 id="b">B <em>mit</em> &amp; Tag (60 min)</h2>
    <h3 id="uebung-1-c">Übung 1 c</h3>
    <div data-id="x" id="kein-anker"></div>
  </Folie>
  <h2 id="werkstatt">In der Werkstatt speichern</h2>
  <h3 id="pruefen">Prüfen</h3>
  <Folie>
    <h2 id="c">C</h2>
  </Folie>
</Layout>`;

describe('folienAus', () => {
  it('liest je <Folie> die h2-id und den bereinigten Titel; Unter-Anker nur aus h2/h3', () => {
    expect(folienAus('/innolab/tag-1', QUELLE).map(({ id, titel, unterIds }) => ({ id, titel, unterIds }))).toStrictEqual([
      { id: 'a', titel: 'A', unterIds: ['ablauf'] },
      { id: 'b', titel: 'B mit & Tag', unterIds: ['uebung-1-c', 'werkstatt', 'pruefen'] },
      { id: 'c', titel: 'C', unterIds: [] },
    ]);
  });
  it('liest den Folien-Satz, ohne Satz null', () => {
    expect(folienAus('/innolab/tag-1', QUELLE).map((f) => f.satz)).toStrictEqual(['Eins.', null, null]);
  });
});

describe('Zeitplan', () => {
  const ABLAUF = `<div class="schedule" data-kurstag="2026-10-22">
    <Block time="09:00–09:10" type="plenum" title="Start &amp; Ziel" href="#a">x</Block>
    <Block time="09:10–09:20" type="pause" title="Pause" />
    <Block time="09:20–09:40" href="/innolab/tag-1#c" title="Rest">y</Block>
    <Block title="ohne Zeit" href="#b" />
  </div>`;
  const folien = folienAus('/innolab/tag-1', QUELLE);
  it('liest Blöcke mit Zeit (Minuten ab Mitternacht) und den Kurstag', () => {
    expect(bloeckeAus(ABLAUF)).toStrictEqual([
      { von: 540, bis: 550, titel: 'Start & Ziel', href: '#a' },
      { von: 550, bis: 560, titel: 'Pause', href: null },
      { von: 560, bis: 580, titel: 'Rest', href: '/innolab/tag-1#c' },
    ]);
    expect(kurstagAus(ABLAUF)).toBe('2026-10-22');
    expect(kurstagAus('<div>')).toBeNull();
  });
  it('Übungsdauer: führende Minuten, sonst null', () => {
    expect(uebungMinuten('60 min (15 + 10 + 15 + 10 + 10)')).toBe(60);
    expect(uebungMinuten('5 min')).toBe(5);
    expect(uebungMinuten('bis Tag 2; je Interview 20–30 min')).toBeNull();
    expect(uebungMinuten(undefined)).toBeNull();
  });
  it('Übung bekommt ihre Dauer, die übrigen Folien den Rest; Pausen zählen nicht', () => {
    const plan = folienPlan(folien, bloeckeAus(ABLAUF), (i) => (i === 1 ? 6 : null));
    expect(plan).toStrictEqual([
      { block: 'Start & Ziel', von: 540, bis: 550, sollVon: 540, sollBis: 544 },
      { block: 'Start & Ziel', von: 540, bis: 550, sollVon: 544, sollBis: 550 },
      { block: 'Rest', von: 560, bis: 580, sollVon: 560, sollBis: 580 },
    ]);
  });
  it('Übung länger als der Block: sie behält ihre volle Dauer, die Folien ohne Übung bekommen 0 min', () => {
    const plan = folienPlan(folien, bloeckeAus(ABLAUF), (i) => (i === 1 ? 60 : null));
    expect(plan.slice(0, 2).map((p) => [p!.sollVon, p!.sollBis])).toStrictEqual([[540, 540], [540, 600]]);
  });
  it('Block nur aus Übungen: auf den Block gestreckt, nie kürzer als die Übung', () => {
    const zwei = folienAus('/innolab/tag-1', '<Folie><h2 id="a">A</h2></Folie><Folie><h2 id="b">B</h2></Folie>');
    const plan = folienPlan(zwei, bloeckeAus('<Block time="09:00–09:20" title="B" href="#a" />'), () => 5);
    expect(plan.map((p) => [p!.sollVon, p!.sollBis])).toStrictEqual([[540, 550], [550, 560]]);
  });
  it('Folie vor dem ersten Block → null', () => {
    const plan = folienPlan(folien, bloeckeAus('<Block time="09:00–09:30" title="B" href="#b" />'), () => null);
    expect(plan[0]).toBeNull();
    expect(plan[2]).toStrictEqual({ block: 'B', von: 540, bis: 570, sollVon: 555, sollBis: 570 });
  });
  it('tempo: hinten, vorn, im Plan, Rest bis Blockende', () => {
    const p = { block: 'B', von: 540, bis: 570, sollVon: 550, sollBis: 560 };
    expect(tempo(p, 555)).toStrictEqual({ rest: 15, abweichung: 0 });
    expect(tempo(p, 567)).toStrictEqual({ rest: 3, abweichung: 7 });
    expect(tempo(p, 545)).toStrictEqual({ rest: 25, abweichung: -5 });
    expect(tempo(p, 575)).toStrictEqual({ rest: -5, abweichung: 15 });
  });
});

describe('hhmm', () => {
  it('rundet auf ganze Minuten und füllt mit Nullen auf', () => {
    expect(hhmm(540)).toBe('09:00');
    expect(hhmm(674.6)).toBe('11:15');
    expect(hhmm(59.6)).toBe('01:00');
    expect(hhmm(1005)).toBe('16:45');
  });
});

describe('ablaufBloecke', () => {
  it('liefert die Blöcke des Ablaufs', () => {
    expect(ablaufBloecke('<Block time="09:00–09:30" title="B" href="#b" />')).toHaveLength(1);
  });
  it('bricht ohne Quelle oder ohne Blöcke ab (Build schlägt fehl)', () => {
    expect(() => ablaufBloecke(undefined)).toThrow(/Ablauf/);
    expect(() => ablaufBloecke('')).toThrow(/Ablauf/);
    expect(() => ablaufBloecke('<div>kein Block</div>')).toThrow(/Ablauf/);
  });
});

describe('wischErlaubt', () => {
  const knoten = (tagName: string, klassen: string[] = [], parentElement: WischKnoten | null = null, breit = false): WischKnoten => ({
    tagName, classList: { contains: (k: string) => klassen.includes(k) }, parentElement, scrollWidth: breit ? 900 : 300, clientWidth: 300,
  });
  const artikel = knoten('ARTICLE');
  const live = knoten('SECTION', ['live'], artikel);
  const kopf = knoten('HEADER', ['kopf'], artikel);
  const vorbereitung = knoten('SECTION', ['vorbereitung'], artikel);
  it('im Kopf und im Live-Block ja', () => {
    expect(wischErlaubt(knoten('LI', [], knoten('UL', [], live)))).toBe(true);
    expect(wischErlaubt(knoten('H1', [], kopf))).toBe(true);
  });
  it('auf einem SVG-Icon im Kopf ja (kleingeschriebener tagName, Breiten fehlen)', () => {
    const svg: WischKnoten = { tagName: 'svg', classList: { contains: () => false }, parentElement: knoten('A', ['oeffnen'], kopf) };
    const pfad: WischKnoten = { tagName: 'path', classList: { contains: () => false }, parentElement: svg };
    expect(wischErlaubt(pfad)).toBe(true);
    const inPre: WischKnoten = { tagName: 'svg', classList: { contains: () => false }, parentElement: knoten('pre', [], live) };
    expect(wischErlaubt(inPre)).toBe(false);
  });
  it('in der Vorbereitung, außerhalb von Kopf und Live oder ohne Ziel nein', () => {
    expect(wischErlaubt(knoten('P', [], knoten('DIV', ['vb'], vorbereitung)))).toBe(false);
    expect(wischErlaubt(artikel)).toBe(false);
    expect(wischErlaubt(null)).toBe(false);
  });
  it('in waagerecht scrollbarem Inhalt, pre, table und Feldern nein, auch im Live-Block', () => {
    expect(wischErlaubt(knoten('SPAN', [], knoten('DIV', [], live, true)))).toBe(false);
    expect(wischErlaubt(knoten('CODE', [], knoten('PRE', [], live)))).toBe(false);
    expect(wischErlaubt(knoten('TD', [], knoten('TR', [], knoten('TABLE', [], live))))).toBe(false);
    expect(wischErlaubt(knoten('SUMMARY', [], knoten('DETAILS', [], live)))).toBe(false);
  });
});

describe('pfadAusGlob', () => {
  it('macht aus dem Glob-Schlüssel den Seitenpfad', () => {
    expect(pfadAusGlob('../pages/innolab/tag-1.astro')).toBe('/innolab/tag-1');
    expect(pfadAusGlob('../pages/innolab/index.astro')).toBe('/innolab');
    expect(pfadAusGlob('../pages/innolab/tag-1/abschluss.astro')).toBe('/innolab/tag-1/abschluss');
    expect(pfadAusGlob('/src/pages/innolab/methoden/annahmen.astro')).toBe('/innolab/methoden/annahmen');
  });
});

describe('folieZu', () => {
  const folien = [...folienAus('/innolab/tag-1', QUELLE), ...folienAus('/innolab/methoden/annahmen', QUELLE)];
  it('findet die Folie zur h2-id', () => {
    expect(folieZu(folien, '/innolab/methoden/annahmen', 'b')).toBe(4);
  });
  it('ordnet einen Unter-Anker der umschließenden Folie zu', () => {
    expect(folieZu(folien, '/innolab/tag-1', 'uebung-1-c')).toBe(1);
  });
  it('Anker außerhalb jeder Folie → letzte Folie davor, vor allen Folien → erste', () => {
    expect(folieZu(folien, '/innolab/tag-1', 'werkstatt')).toBe(1);
    expect(folieZu(folien, '/innolab/methoden/annahmen', 'pruefen')).toBe(4);
    expect(folieZu(folien, '/innolab/tag-1', 'ablauf')).toBe(0);
  });
  it('leerer oder unbekannter Anker auf einer Tag-1-Seite → erste Folie dieser Seite', () => {
    expect(folieZu(folien, '/innolab/methoden/annahmen', '')).toBe(3);
    expect(folieZu(folien, '/innolab/tag-1', 'gibt-es-nicht')).toBe(0);
    expect(folieZu(folien, '/innolab/tag-1', 'yt-123')).toBe(0);
  });
  it('Seite außerhalb von Tag 1 → null', () => {
    expect(folieZu(folien, '/innolab/tag-3', 'x')).toBeNull();
    expect(folieZu(folien, '/innolab/tag-3', 'a')).toBeNull();
  });
});

describe('Seitennamen', () => {
  it('liest den Layout-Titel in allen Schreibweisen und löst Entitäten auf', () => {
    expect(layoutTitel('<Layout title="A &amp; B">')).toBe('A & B');
    expect(layoutTitel("<Layout title='Einfach'>")).toBe('Einfach');
    expect(layoutTitel('<Layout description="x" title={`Vorlage`}>')).toBe('Vorlage');
    expect(layoutTitel('<Layout title={"Doppelt"}>')).toBe('Doppelt');
    expect(layoutTitel('<Layout title={`Tag ${n}`}>')).toBeNull();
    expect(layoutTitel('<Layout title={titel}>')).toBeNull();
  });
  it('ohne lesbaren Titel: Name aus der Liste der Tag-1-Seiten', () => {
    expect(seitenLabel('/innolab/methoden/interview', '<Layout title={t}>')).toBe('Jobs to be Done & Mom Test');
  });
  it('alle sechs Seiten von Tag 1 haben einen Namen, keinen Pfad', () => {
    const namen = TAG_1_SEITEN.map((p) => seitenLabel(p, quellen[p] ?? ''));
    expect(namen.filter((n) => n.startsWith('/') || n === '')).toStrictEqual([]);
    expect(TAG_1_SEITEN.map((p) => layoutTitel(quellen[p] ?? ''))).not.toContain(null);
  });
});

describe('Folien von Tag 1 (echte Seiten)', () => {
  const folien = tagFolien(quellen);
  it('alle Seiten des Tages in der Tagesreihenfolge, 52 Folien', () => {
    expect([...new Set(folien.map((f) => f.pfad))]).toStrictEqual(TAG_1_SEITEN);
    expect(folien).toHaveLength(52);
    expect(folien[0].pfad).toBe('/innolab/tag-1');
    expect(folien.at(-1)!.pfad).toBe('/innolab/tag-1/abschluss');
  });
  it('jede Folie hat eine id und einen bereinigten Titel (ohne Tags, Entitäten und „(60 min)“)', () => {
    expect(folien.filter((f) => !f.id || !f.titel || /[<>]|&\w+;|\(\d+\s*min\)/.test(f.titel))).toStrictEqual([]);
    expect(folien.find((f) => f.pfad === '/innolab/methoden/problem-rahmen' && f.id === 'vorgehen')?.titel).toBe('So geht ihr vor');
  });
  it('Anker außerhalb der Folien gehören zur Folie davor (problem-rahmen #werkstatt, #pruefen → #vorgehen)', () => {
    const i = folien.findIndex((f) => f.pfad === '/innolab/methoden/problem-rahmen' && f.id === 'vorgehen');
    expect(folieZu(folien, '/innolab/methoden/problem-rahmen', 'werkstatt')).toBe(i);
    expect(folieZu(folien, '/innolab/methoden/problem-rahmen', 'pruefen')).toBe(i);
    expect(folieZu(folien, '/innolab/tag-1', 'ablauf')).toBe(0);
  });
  it('jede Notiz zeigt auf eine existierende Folie', () => {
    expect(notizenOhneFolie(folien, NOTIZEN)).toStrictEqual([]);
  });
  it('jede Tag-1-Folie hat eine Notiz mit mindestens einem live-Stichwort', () => {
    const ohne = folien.filter((f) => !NOTIZEN[f.pfad]?.[f.id]?.live?.some((s) => s.trim() !== ''));
    expect(ohne.map((f) => `${f.pfad}#${f.id}`)).toStrictEqual([]);
  });
  it('der Ablauf von tag-1.astro ordnet jeder Folie einen Block zu, Blöcke lückenlos in Tagesreihenfolge', () => {
    const plan = folienPlan(folien, bloeckeAus(quellen['/innolab/tag-1']), () => null);
    expect(plan.every((p) => p !== null)).toBe(true);
    expect(plan[0]!.block).toBe('Kick-off');
    expect(plan.at(-1)!.block).toBe('Hausaufgabe & Abschluss');
    expect(plan.find((_, i) => folien[i].pfad === '/innolab/methoden/entscheidungslog')!.block).toBe('Entscheidungslog');
    expect(kurstagAus(quellen['/innolab/tag-1'])).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  // Übungen, die ihren Block füllen oder länger sind als Block minus Folien: Soll-Fenster = volle Timer-Dauer, und
  // solange der Timer läuft (vom Start des Fensters bis zu seinem Ende), meldet tempo nie „hinten“.
  const minutenJe = folien.map((f) => uebungMinuten(NOTIZEN[f.pfad]?.[f.id]?.uebung?.dauer));
  const echterPlan = folienPlan(folien, bloeckeAus(quellen['/innolab/tag-1']), (i) => minutenJe[i]);
  it.each([
    ['/innolab/methoden/problem-rahmen', 'vorgehen', 60, 670],
    ['/innolab/methoden/entscheidungslog', 'vorgehen', 5, 730],
    ['/innolab/methoden/annahmen', 'vorgehen', 45, 795],
    ['/innolab/methoden/interview', 'vorgehen', 90, 885],
  ])('%s#%s: Übung behält %i min ab Blockbeginn, tempo nie hinten, solange der Timer läuft', (pfad, id, min, von) => {
    const i = folien.findIndex((f) => f.pfad === pfad && f.id === id);
    expect(minutenJe[i]).toBe(min);
    const p = echterPlan[i]!;
    expect([p.sollVon, p.sollBis]).toStrictEqual([von, von + min]);
    expect(p.sollBis).toBeLessThanOrEqual(p.bis);
    for (let t = p.sollVon; t <= p.sollBis; t += 0.5) expect(tempo(p, t).abweichung).toBeLessThanOrEqual(0);
  });
  it('erkennt eine Notiz ohne Folie', () => {
    expect(notizenOhneFolie(folien, { '/innolab/tag-1': { gibtsnicht: { live: ['x'] } } })).toStrictEqual(['/innolab/tag-1#gibtsnicht']);
  });
});

// Stil der live-Stichworte (typen.ts): Satz zum Sagen ganz in „…“ höchstens 18 Wörter, sonst Regieanweisung, höchstens 12.
const woerter = (s: string) => s.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;
const zuLang = (s: string) => woerter(s) > (/^„[^“]*“\.?$/.test(s) ? 18 : 12);
// Feste Stichworte vor dem Doppelpunkt (typen.ts); diese Synonyme heißen dort anders.
const ALTE_CUES = /^(Fallstrick|Fallen|Zeitcheck|Uhr|Uhr prüfen|Checkpoint|Raum fragen|Bei Zeit|Bei Zeitnot[^:]*):/;

describe('Stil der Notizen', () => {
  it('erkennt zu lange Stichworte', () => {
    expect(zuLang('Portland erzählen: gute Absicht, viel Geld, falsches Produkt.')).toBe(false);
    expect(zuLang('eins zwei drei vier fünf sechs sieben acht neun zehn elf zwölf dreizehn')).toBe(true);
    expect(zuLang('„eins zwei drei vier fünf sechs sieben acht neun zehn elf zwölf dreizehn – ‚vierzehn‘?“')).toBe(false);
    expect(zuLang('„1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19.“')).toBe(true);
  });
  it('live-Stichworte nutzen die festen Stichworte (Falle, Zeit, Fragen, Bei Bedarf, Wenn hinten)', () => {
    const alt = Object.entries(NOTIZEN).flatMap(([pfad, je]) =>
      Object.entries(je).flatMap(([id, n]) => n.live.filter((s) => ALTE_CUES.test(s)).map((s) => `${pfad}#${id}: ${s}`)));
    expect(alt).toStrictEqual([]);
  });
  it('jedes live-Stichwort hält die Längengrenze ein', () => {
    const lang = Object.entries(NOTIZEN).flatMap(([pfad, je]) =>
      Object.entries(je).flatMap(([id, n]) => n.live.filter(zuLang).map((s) => `${pfad}#${id}: ${s}`)));
    expect(lang).toStrictEqual([]);
  });
  it('Verständnisfragen haben Frage und Antwort', () => {
    const leer = Object.entries(NOTIZEN).flatMap(([pfad, je]) =>
      Object.entries(je).filter(([, n]) => n.verstaendnis && (!n.verstaendnis.frage.trim() || !n.verstaendnis.antwort.trim())).map(([id]) => `${pfad}#${id}`));
    expect(leer).toStrictEqual([]);
  });
});

describe('Anzeige der Notizen', () => {
  it('stichwortForm: Zitat, Stichwort vorn, Takt', () => {
    expect(stichwortForm('„Sagt es.“')).toStrictEqual({ zitat: true, cue: null, rest: '„Sagt es.“', takt: null });
    expect(stichwortForm('Falle: Gefühl als Problem')).toStrictEqual({ zitat: false, cue: 'Falle', rest: 'Gefühl als Problem', takt: null });
    expect(stichwortForm('Nach 25 min: Dreierrunden')).toStrictEqual({ zitat: false, cue: 'Nach 25 min', rest: 'Dreierrunden', takt: 25 });
    expect(stichwortForm('Kaffeebar ist erfunden.')).toStrictEqual({ zitat: false, cue: null, rest: 'Kaffeebar ist erfunden.', takt: null });
    expect(stichwortForm('Frage „Was heißt: fertig?“ stellen').cue).toBe(null);
  });
  it('quelleTeile: URL als Link mit Host, Satzzeichen bleiben Text', () => {
    expect(quelleTeile('Klein, HBR: https://hbr.org/2007/09/premortem; vgl. Torres S. 125')).toStrictEqual([
      { text: 'Klein, HBR: ' }, { url: 'https://hbr.org/2007/09/premortem', host: 'hbr.org' }, { text: '; vgl. Torres S. 125' },
    ]);
    expect(quelleTeile('https://www.sec.gov/a.htm.')).toStrictEqual([{ url: 'https://www.sec.gov/a.htm', host: 'sec.gov' }, { text: '.' }]);
    expect(quelleTeile('Torres, S. 12')).toStrictEqual([{ text: 'Torres, S. 12' }]);
  });
  it('streichVerweis: Folien-id aus der Klammer am Ende', () => {
    expect(streichVerweis('Zappos weglassen (mvp).')).toStrictEqual({ text: 'Zappos weglassen', id: 'mvp', zusatz: '' });
    expect(streichVerweis('Probe 15 → 5 min (vorgehen, Schritt 3).')).toStrictEqual({ text: 'Probe 15 → 5 min', id: 'vorgehen', zusatz: ', Schritt 3' });
    expect(streichVerweis('Theorie knapp halten.')).toStrictEqual({ text: 'Theorie knapp halten.', id: null, zusatz: '' });
  });
});

describe('Tageskarte', () => {
  const titel = bloeckeAus(quellen['/innolab/tag-1']).filter((b) => b.href).map((b) => b.titel);
  it('jeder Streich-Verweis zeigt auf eine Folie in seinem Block', () => {
    const folien = tagFolien(quellen);
    const plan = folienPlan(folien, bloeckeAus(quellen['/innolab/tag-1']), () => null);
    const ins = Object.entries(TAG_1.bloecke).flatMap(([block, b]) => (b.streichen ?? []).map((x) => ({ block, ...streichVerweis(x) })))
      .filter((v) => v.id && !folien.some((f, i) => plan[i]?.block === v.block && (f.id === v.id || f.unterIds.includes(v.id!))));
    expect(ins).toStrictEqual([]);
  });
  it('jeder Block mit Link im Ablauf hat ein Lernziel, kein Eintrag ohne Block', () => {
    expect(titel.filter((t) => !TAG_1.bloecke[t]?.lernziel.trim())).toStrictEqual([]);
    expect(Object.keys(TAG_1.bloecke).filter((t) => !titel.includes(t))).toStrictEqual([]);
  });
  it('Material ist nicht leer, jede id eindeutig und kommafrei (Häkchen werden als Liste gespeichert)', () => {
    expect(TAG_1.material.length).toBeGreaterThan(0);
    const ids = TAG_1.material.map((m) => m.id);
    expect(ids.filter((id) => !/^[a-z0-9-]+$/.test(id))).toStrictEqual([]);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Miro-Frames in den Notizen', () => {
  it('jeder genannte Frame existiert auf dem Team-Board', () => {
    expect(notizenMitFremdemFrame(NOTIZEN, MIRO_FRAMES)).toStrictEqual([]);
  });
  it('erkennt einen unbekannten Frame-Namen', () => {
    const notizen = {
      '/innolab/tag-1': {
        a: { live: ['x'], miro: { frame: 'T1 · 1 · Experience Map', schritte: ['ok'] } },
        b: { live: ['x'], miro: { frame: 'T1 · 9 · Gibt es nicht', schritte: ['falsch'] } },
        c: { live: ['x'], miro: { schritte: ['ohne Frame'] } },
      },
    };
    expect(notizenMitFremdemFrame(notizen, MIRO_FRAMES)).toStrictEqual(['/innolab/tag-1#b: T1 · 9 · Gibt es nicht']);
  });
});
