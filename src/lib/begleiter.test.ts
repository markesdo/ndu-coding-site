import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { METHODEN } from '../components/methoden';
import { MIRO_FRAMES, MIRO_FRAMES_OHNE_ID } from '../components/miro-frames';
import { NOTIZEN } from '../data/begleiter';
import { anzeige, fremdeSeite, type Zustand } from '../components/begleiter-anzeige';
import { TAG_1 } from '../data/begleiter/tag';
import KAFFEEBAR_INTERVIEWS from '../werkstatt/beispiele/interviews.json';
import {
  TAG_1_SEITEN, ablaufBloecke, begleiterFolien, bloeckeAus, folienGruppe, kartenPfade, folieZu, folienAus, folienPlan, hhmm, kurstagAus, layoutTitel, notizenMitFremdemFrame, notizenOhneFolie,
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
  it('alle Seiten des Tages in der Tagesreihenfolge, 63 Folien', () => {
    expect([...new Set(folien.map((f) => f.pfad))]).toStrictEqual(TAG_1_SEITEN);
    expect(folien).toHaveLength(63);
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
  it('jede Notiz zeigt auf eine existierende Folie – auch auf Seiten außerhalb von Tag 1', () => {
    const alle = Object.entries(quellen).flatMap(([pfad, q]) => folienAus(pfad, q));
    expect(notizenOhneFolie(alle, NOTIZEN)).toStrictEqual([]);
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
    // Frames, die auf dem Board noch angelegt werden (miro-frames.ts, Platzhalter ohne ID), gelten als bekannt.
    const bekannt = { ...MIRO_FRAMES, ...Object.fromEntries(MIRO_FRAMES_OHNE_ID.map((n) => [n, ''])) };
    expect(notizenMitFremdemFrame(NOTIZEN, bekannt)).toStrictEqual([]);
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

describe('kartenPfade', () => {
  it('nur Innolab-Seiten außerhalb von Tag 1, ohne Begleiter und Routen mit Parametern', () => {
    const quellen = Object.fromEntries(['/', '/ideen', '/innolabx', '/innolab', '/innolab/tag-1', '/innolab/methoden/interview', '/innolab/begleiter',
      '/innolab/tag-2', '/innolab/methoden/baum', '/innolab/werkstatt/[id]'].map((p) => [p, '']));
    expect(kartenPfade(quellen)).toStrictEqual(['/innolab', '/innolab/methoden/baum', '/innolab/tag-2']);
  });
});

// Was der Begleiter (pages/innolab/begleiter.astro) mit einer Beamer-Position macht: folieZu auf begleiterFolien, dann
// anzeige/fremdeSeite – dieselben Funktionen wie im Seiten-Skript, mit den echten Seiten und Notizen.
describe('Begleiter folgt auch außerhalb von Tag 1, wo es Notizen gibt', () => {
  const folien = begleiterFolien(quellen, NOTIZEN);
  const karten = new Set(kartenPfade(quellen));
  const folgt: Zustand = { index: 0, folgen: true, meldung: 'frage' };
  const beamer = (pfad: string, anker: string) => {
    const z = anzeige(folgt, { art: 'position', index: folieZu(folien, pfad, anker) });
    return { z, karte: fremdeSeite(z, pfad, karten) };
  };
  it('Beamer auf experiment#sagen-tun: diese Folie mit ihren live-Stichworten, keine Karte', () => {
    const { z, karte } = beamer('/innolab/methoden/experiment', 'sagen-tun');
    expect(karte).toBeNull();
    expect(z.meldung).toBe('ok');
    const f = folien[z.index];
    expect(`${f.pfad}#${f.id}`).toBe('/innolab/methoden/experiment#sagen-tun');
    expect(NOTIZEN[f.pfad][f.id].live).toStrictEqual(NOTIZEN['/innolab/methoden/experiment']['sagen-tun'].live);
  });
  it('folgt Folie für Folie, auch auf Folien der Seite ohne eigene Notiz', () => {
    const a = beamer('/innolab/methoden/experiment', 'vorher-entscheiden').z.index;
    expect(beamer('/innolab/methoden/experiment', 'gegen-den-beleg').z.index).toBe(a + 1);
    expect(folien[beamer('/innolab/methoden/experiment', 'origin-story').z.index].id).toBe('origin-story');
    expect(folien[beamer('/innolab/tag-5', 'debrief').z.index].id).toBe('debrief');
  });
  it('Seite ohne Notizen (story-map): weiter die Karte, die letzte Folie bleibt stehen', () => {
    expect(NOTIZEN['/innolab/methoden/story-map']).toBeUndefined();
    const { z, karte } = beamer('/innolab/methoden/story-map', '');
    expect(z.meldung).toBe('nicht-tag-1');
    expect(z.index).toBe(0);
    expect(karte).toBe('/innolab/methoden/story-map');
  });
  // Tag 3, 10:30–12:00: Ziel-Chance und How Might We – jede Folie hat Stichworte, der Beamer auf einer neuen Folie zeigt sie.
  it('Tag 3: jede Folie von ziel-chance und hmw hat eine Notiz mit mindestens einem live-Stichwort', () => {
    const seiten = ['/innolab/methoden/ziel-chance', '/innolab/methoden/hmw'];
    const tag3 = seiten.flatMap((p) => folienAus(p, quellen[p] ?? ''));
    // Seit 20.11.2026 ganz ohne Ulwick (nach beispiel-ulwick und aufloesung auch ulwick-outcomes und ulwick gestrichen): 18 Folien.
    expect(tag3).toHaveLength(18);
    expect(tag3.filter((f) => /ulwick/i.test(f.id)).map((f) => f.id)).toStrictEqual([]);
    expect(tag3.filter((f) => !NOTIZEN[f.pfad]?.[f.id]?.live?.some((s) => s.trim() !== '')).map((f) => `${f.pfad}#${f.id}`)).toStrictEqual([]);
    const { z, karte } = beamer('/innolab/methoden/hmw', 'bauen');
    expect(karte).toBeNull();
    expect(`${folien[z.index].pfad}#${folien[z.index].id}`).toBe('/innolab/methoden/hmw#bauen');
  });
  // Tag 3, 09:00–09:25: Experience Map nachschärfen – vor dem Baum, jede Folie mit Stichworten.
  it('Tag 3: experience-map steht vor dem Baum, jede Folie hat eine Notiz mit mindestens einem live-Stichwort', () => {
    const pfad = '/innolab/tag-3/experience-map';
    const seite = folienAus(pfad, quellen[pfad] ?? '');
    expect(seite).toHaveLength(11);
    expect(seite.filter((f) => !NOTIZEN[pfad]?.[f.id]?.live?.some((s) => s.trim() !== '')).map((f) => `${f.pfad}#${f.id}`)).toStrictEqual([]);
    const reihe = [...new Set(folien.map((f) => f.pfad))];
    expect(reihe.indexOf(pfad) + 1).toBe(reihe.indexOf('/innolab/methoden/baum'));
  });
  // 19.11. (Markus): Die eigene Map geht Markus mit jeder Person auf T3 · 0 durch, 15 min (3 × 5); die Kaffeebar-Folien
  // davor in etwa 10 min; der Block bleibt 09:00–09:25. 20.11. (Markus, Entwurf E2): drei Anläufe still in 2 min, dann
  // eine offene Frage an alle (1 min, von uebungMinuten nicht mitgezählt, steckt in den gut 6 min).
  it('Tag 3: experience-map – Durchgang 15 min auf T3 · 0, Übungen passen in den 25-min-Block', () => {
    const pfad = '/innolab/tag-3/experience-map';
    const n = NOTIZEN[pfad] ?? {};
    expect(uebungMinuten(n['drei-anlaeufe']?.uebung?.dauer)).toBe(2);
    expect(quellen[pfad]).toContain('<Timer minuten={2} />');
    expect(uebungMinuten(n['eure-map']?.uebung?.dauer)).toBe(15);
    expect(n['eure-map']?.miro?.frame).toBe('T3 · 0 · So entsteht eure Map - Sofie');
    for (const name of ['Sofie', 'Joachim', 'Hewen']) expect(quellen[pfad]).toContain(`<MiroLink name="T3 · 0 · So entsteht eure Map - ${name}">${name}</MiroLink>`);
    const summe = Object.values(n).reduce((a, x) => a + (uebungMinuten(x.uebung?.dauer) ?? 0), 0);
    // 2 (drei Anläufe, still) + 15 (Durchgang); die offene Frage und die übrigen Kaffeebar-Folien brauchen gut 6 min.
    expect(summe).toBeLessThanOrEqual(25 - 6);
  });
  // 20.11. (Markus): „Drei bis fünf“ stammt aus Torres’ Buchclub-Leitfaden, IDs und Zählung sind Format dieses Kurses –
  // auf Folie und im Begleiter steht der Grund, kein Etikett „Kursregel“.
  it('Tag 3: experience-map – kein Etikett „Kursregel“ auf der Seite und im Begleiter', () => {
    const pfad = '/innolab/tag-3/experience-map';
    expect(quellen[pfad]?.match(/Kursregel/g) ?? []).toStrictEqual([]);
    expect(JSON.stringify(NOTIZEN[pfad]).match(/Kursregel/g) ?? []).toStrictEqual([]);
    expect(quellen[pfad]).toContain('Buchclub-Leitfaden zu Kapitel 6');
  });
  // 20.11. (Markus, Entscheidung 8): Auf dem Baum werden „zwoelf“ (Übung „Welche jeweils zuerst?“, Reihum, Timer) und „warum“
  // (Auflösung) eine Folie „Liste oder Baum?“ – Anker #warum bleibt, keine Übung, keine Auflösung, kein Timer.
  it('Tag 3: baum – „Liste oder Baum?“ ersetzt zwoelf und warum, ohne Übung', () => {
    const pfad = '/innolab/methoden/baum';
    const q = quellen[pfad] ?? '';
    expect(folienAus(pfad, q).map((f) => f.id).slice(0, 3)).toStrictEqual(['nur-outcome', 'warum', 'eltern-kind']);
    const folie = q.slice(q.indexOf('id="warum"'), q.indexOf('id="eltern-kind"'));
    expect(folie).toContain('Liste oder Baum?</h2>');
    expect(folie).toContain('Die Liste zeigt Einträge. Der Baum zeigt, was zusammengehört.');
    expect(folie.match(/<Timer|<Aufloesung|reihum/gi) ?? []).toStrictEqual([]);
    expect(Object.keys(NOTIZEN[pfad] ?? {}).filter((k) => k === 'zwoelf')).toStrictEqual([]);
    expect(NOTIZEN[pfad]?.warum?.uebung).toBeUndefined();
    expect(NOTIZEN[pfad]?.warum?.ueberleitung).toBe('Woher kommen die Teilchancen?');
    // Entscheidung 11: Mini-Baum ③ wie Torres S. 84–85 – 9 zerfällt in „Wer spielt mit?“, „Welche Art Serie?“ …; 11 leuchtet nicht mit.
    const drei = q.match(/\{ nr: 3,[^\n]*\}/)?.[0] ?? '';
    expect(drei).toContain("kinder: ['Wer spielt mit?', 'Welche Art Serie?', '…'], nummern: [9],");
    expect(drei).toContain("text: '9 zerfällt in kleinere Chancen, etwa ‚Wer spielt mit?‘.'");
  });
  // Entscheidung 12 (20.11. spät): Inventar – Frage 2 zählt („X von N“), Frage 1 und 3 sortieren aus, dann unter den Moment;
  // kein „Kursregel“, kein vierter Punkt. Die Kaffeebar-Demo läuft mit derselben Regel: erster Schluck Outcome nein, mitbestellen ja.
  it('Tag 3: baum – Inventar zählt statt filtert, Kaffeebar-Demo mit derselben Regel', () => {
    const pfad = '/innolab/methoden/baum';
    const q = quellen[pfad] ?? '';
    expect(q.match(/Kursregel/g) ?? []).toStrictEqual([]);
    expect(JSON.stringify(NOTIZEN[pfad]).match(/Kursregel/g) ?? []).toStrictEqual([]);
    const inventar = q.slice(q.indexOf('id="inventar"'), q.indexOf('id="drei-fragen"'));
    const fragen = inventar.slice(inventar.indexOf('<ol>'), inventar.indexOf('</ol>'));
    expect(fragen.match(/<li/g) ?? []).toHaveLength(3);
    expect(fragen).toContain('<strong>In wie vielen Interviews gehört?</strong> → „X von N“ auf die Karte.');
    expect(inventar).toContain('<strong>Dann:</strong> unter den Moment, in dem sie vorkommt');
    expect(inventar.match(/1 und 3 Ja/g) ?? []).toStrictEqual([]);
    const demo = q.slice(q.indexOf('id="drei-fragen"'), q.indexOf('id="map-baum"'));
    const zeile = (t: string) => demo.split('<tr>').find((z) => z.includes(t)) ?? '';
    expect(zeile('erste Schluck')).toContain('<td class="antwort">bleibt auf dem Snapshot</td>');
    expect(zeile('mitbestellen')).toContain('<strong>in den Baum</strong>, „1 von 5“');
    expect(demo.match(/Nur in einem Interview/g) ?? []).toStrictEqual([]);
    // Entscheidung 13: „beispiel“ ohne Reihum, Antwort 3 und Schlusszeile im beschlossenen Wortlaut.
    const beispiel = q.slice(q.indexOf('id="beispiel"'), q.indexOf('id="firmensicht"'));
    expect(beispiel).toContain('Drei Fragen an den Baum – jede an alle, dann aufdecken.');
    expect(beispiel.match(/reihum/gi) ?? []).toStrictEqual([]);
    expect(beispiel).toContain('Nein: Der Moment ‚Halle‘ fasst sie schon zusammen – eine Ebene dazwischen wäre doppelt.');
    expect(beispiel).toContain('<strong>Einmal gehört, treibt den Outcome:</strong> in den Baum mit ‚1 von 5‘ (mitbestellen). <strong>Treibt ihn nicht:</strong> bleibt im Snapshot (erster Schluck, gehetzt im Büro).');
    expect(JSON.stringify(NOTIZEN[pfad]?.beispiel).match(/reihum/gi) ?? []).toStrictEqual([]);
    expect(quellen['/innolab/tag-3/experience-map']).toContain('Miro, T3 · 0: <MiroLink name="T3 · 0 · So entsteht eure Map - Kaffeebar">Beispiel: Kaffeebar</MiroLink> · <MiroLink name="T3 · 0 · So entsteht eure Map - Sofie">');
  });
  // Entscheidung 14 (20.11. spät): firmensicht bleibt Anti-Muster 1 und bekommt ein Rezept für die eigene übergeordnete
  // Chance; „(ergänzt)“ überall in dieser Form, ohne ID und Zählung; auf „Liste oder Baum?“ gestrichelt, nicht grau.
  it('Tag 3: baum – Rezept für die ergänzte übergeordnete Chance, „(ergänzt)“ einheitlich', () => {
    const pfad = '/innolab/methoden/baum';
    const q = quellen[pfad] ?? '';
    const folie = q.slice(q.indexOf('id="firmensicht"'), q.indexOf('id="senkrecht"'));
    expect(folie).toContain('Aus Sicht der Kundschaft, nicht der Firma</h2>');
    const rezept = folie.slice(folie.indexOf('<div class="rezept"'), folie.indexOf('</div>', folie.indexOf('<div class="rezept"')));
    expect(rezept.match(/<li>/g) ?? []).toHaveLength(6);
    expect(rezept).toContain('<li><strong>„(ergänzt)“</strong> – ohne ID, ohne Zählung.</li>');
    expect(q).toContain('{b.ergaenzt && <em> (ergänzt)</em>}');
    expect(q.match(/\.mb-ergaenzt \{[^}]*color: var\(--muted\)/g) ?? []).toStrictEqual([]);
    expect(q).toContain('mit welcher ID (außer „(ergänzt)“)?');
    expect(q).toContain('übergeordnete Chance nach dem Rezept oben rechts im Frame.');
    expect(JSON.stringify(NOTIZEN[pfad]).match(/Keine übergeordnete Chance erfinden/g) ?? []).toStrictEqual([]);
  });
  // Entscheidung 15 (20.11. spät): Kein Reihum an der Kaffeebar – Baum „drei-fragen“ und „beispiel“, Ziel-Chance „bauchwahl“:
  // Fragen an alle, niemand wird aufgerufen. Entscheidung 26 (21.11.): „bauchwahl“ ganz ohne Abstimmung – welcher Ast
  // zuerst, beantworten die vier Linsen (Torres S. 99–101).
  it('Tag 3: kein „reihum“ auf baum#drei-fragen, baum#beispiel und ziel-chance#bauchwahl, auch nicht im Begleiter', () => {
    const folie = (pfad: string, id: string) => {
      const q = quellen[pfad] ?? '';
      const a = q.indexOf(`id="${id}"`);
      return q.slice(a, q.indexOf('<Folie', a));
    };
    const stellen = [
      folie('/innolab/methoden/baum', 'drei-fragen'), folie('/innolab/methoden/baum', 'beispiel'), folie('/innolab/methoden/ziel-chance', 'bauchwahl'),
      JSON.stringify(NOTIZEN['/innolab/methoden/baum']?.['drei-fragen']), JSON.stringify(NOTIZEN['/innolab/methoden/baum']?.beispiel),
      JSON.stringify(NOTIZEN['/innolab/methoden/ziel-chance']?.bauchwahl),
    ];
    expect(stellen.every((s) => s.length > 50)).toBe(true);
    expect(stellen.flatMap((s) => s.match(/reihum/gi) ?? [])).toStrictEqual([]);
    const bauchwahl = [folie('/innolab/methoden/ziel-chance', 'bauchwahl'), JSON.stringify(NOTIZEN['/innolab/methoden/ziel-chance']?.bauchwahl)];
    expect(bauchwahl.flatMap((s) => s.match(/Wer will seinen Grund sagen|Hand heben/g) ?? [])).toStrictEqual([]);
    expect(bauchwahl[0]).toContain('<p class="folie-satz">Drei Äste, drei Momente. Welcher zuerst, beantworten die vier Linsen.</p>');
  });
  // Entscheidung 16 (20.11. spät): „vorgehen“ in drei Schritten (12 + 10 + 13 = 35 min), ohne Claude-Schritt; auf der
  // Baum-Seite und im Begleiter keine Claude-/Bildschirmfoto-Prüfung mehr, kein Feld „Nur in einem Interview“, kein T2 · 2 als Anleitung.
  it('Tag 3: baum#vorgehen – drei Schritte, 35 min, ohne Claude', () => {
    const pfad = '/innolab/methoden/baum';
    const q = quellen[pfad] ?? '';
    const folie = q.slice(q.indexOf('id="vorgehen"'), q.indexOf('id="anti-muster"'));
    const schritte = folie.slice(folie.indexOf('<ol'), folie.indexOf('</ol>'));
    expect(schritte.match(/<li/g) ?? []).toHaveLength(3);
    expect([...schritte.matchAll(/<Timer minuten=\{(\d+)\} \/>/g)].map((m) => Number(m[1]))).toStrictEqual([12, 10, 13]);
    expect(folie).toContain('<p>Markus kommt zu jedem Baum.</p>');
    const n = NOTIZEN[pfad] ?? {};
    expect(uebungMinuten(n.vorgehen?.uebung?.dauer)).toBe(35);
    expect(n.vorgehen?.uebung?.dauer).toBe('35 min (12 + 10 + 13)');
    expect([q, JSON.stringify(n)].flatMap((s) => s.match(/Claude|Bildschirmfoto|Nur in einem Interview|T2 · 2/g) ?? [])).toStrictEqual([]);
  });
  // Entscheidung 17 (20.11. spät): „euer-baum“ – fünf Zeilen (wo, schon da, neue Karte, verbinden, gelbe Karte), Kaffeebar-Baum in
  // Miro-Farben statt Torres S. 26; der alte Punkt „Frage 2 markiert/zählt“ ist weg. Dazu: inventar Frage 1 – Lösung → Bedürfnis dahinter.
  it('Tag 3: baum#euer-baum – fünf Handgriffe, Kaffeebar-Baum statt S. 26; inventar Frage 1 mit Lösungs-Ausgang', () => {
    const q = quellen['/innolab/methoden/baum'] ?? '';
    const folie = q.slice(q.indexOf('id="euer-baum"'), q.indexOf('id="vorgehen"'));
    const zeilen = folie.slice(folie.indexOf('<ol'), folie.indexOf('</ol>'));
    expect((zeilen.match(/<li[ >]/g) ?? []).length).toBe(5);
    expect([...zeilen.matchAll(/<strong>([^<]+):<\/strong>/g)].map((m) => m[1])).toStrictEqual(['Wo', 'Schon da', 'Neue Karte', 'Verbinden', 'Gelbe Karte']);
    expect(folie.match(/ost\.jpg|S\. 26|Frage 2 (zählt|markiert)/g) ?? []).toStrictEqual([]);
    expect(folie).toContain('<Baum momente miro knoten={KAFFEEBAR_BAUM_MIRO}');
    expect(folie).toContain('Kaffeebar-Baum (ausgedacht).');
    const inventar = q.slice(q.indexOf('id="inventar"'), q.indexOf('id="drei-fragen"'));
    expect(inventar).toContain('Lösung → Bedürfnis dahinter formulieren, neu prüfen. Sonst Nein → bleibt auf dem Snapshot.');
  });
  // Entscheidung 18 (20.11. spät): „vier-muster“ – Karte 1 mit dem Kaffeebar-Beispiel aus „beispiel“ statt „Die Oberfläche ist
  // schwer bedienbar.“ (bei Torres S. 88, nicht S. 94), jede Karte mit „→ besser:“.
  it('Tag 3: baum#vier-muster – ein Torres-Beispiel, drei Kaffeebar-Beispiele, je mit besserer Fassung', () => {
    const pfad = '/innolab/methoden/baum';
    const q = quellen[pfad] ?? '';
    const folie = q.slice(q.indexOf('id="vier-muster"'), q.indexOf('id="euer-baum"'));
    expect(folie).toContain('Ein Beispiel von Torres, drei von der Kaffeebar – je mit besserer Fassung.');
    expect(folie.match(/→ besser:/g) ?? []).toHaveLength(4);
    expect(folie.match(/Oberfläche ist schwer bedienbar/g) ?? []).toStrictEqual([]);
    expect(JSON.stringify(NOTIZEN[pfad]?.['vier-muster']).match(/interface is hard to use|Oberfläche/g) ?? []).toStrictEqual([]);
    // Karte 1 übernimmt die Antwort von „beispiel“ wörtlich: Beide Folien zeigen dieselben Konstanten.
    const beispiel = q.slice(q.indexOf('id="beispiel"'), q.indexOf('id="firmensicht"'));
    for (const t of ['{ZU_BREIT.t}', '{BESSER.map(']) {
      expect(beispiel).toContain(t);
      expect(folie).toContain(t);
    }
    expect(q).toContain("const ZU_BREIT = { t: '„Ich weiß nicht, ob es sich bis zur Abfahrt ausgeht.“', ids: ['I3-2', 'I3-3'] };");
  });
  // Entscheidung 23 (21.11. früh): Die besseren Karten tragen ihre Zitat-IDs, aus BELEGE wie im Baum – Halle ohne I3-2.
  it('Tag 3: baum#beispiel und #vier-muster – die besseren Karten tragen genau die IDs aus BELEGE', () => {
    const pfad = '/innolab/methoden/baum';
    const q = quellen[pfad] ?? '';
    const vorspann = q.slice(0, q.indexOf('\n---', 4));
    const start = vorspann.indexOf('const BELEGE');
    const belege: Record<string, string[]> = Object.fromEntries([...vorspann.slice(start, vorspann.indexOf('};', start)).matchAll(/'(„[^']*“)': \[([^\]]*)\]/g)]
      .map((m) => [m[1], [...m[2].matchAll(/'([^']+)'/g)].map((x) => x[1])]));
    const anfang = vorspann.indexOf('const BESSER');
    const besser = vorspann.slice(anfang, vorspann.indexOf('].map(', anfang));
    const karten = [...besser.matchAll(/t: '(„[^']*“)', moment: '([^']+)'/g)].map((m) => ({ t: m[1], moment: m[2], ids: belege[m[1]] }));
    expect(karten).toStrictEqual([
      { t: '„Geht sich ein Kaffee noch aus?“', moment: 'Halle', ids: ['I2-4', 'I3-1', 'I5-2'] },
      { t: '„Wann ist mein Kaffee fertig?“', moment: 'Warten', ids: ['I2-5', 'I3-2', 'I3-3'] },
    ]);
    expect(vorspann).toContain('].map((b) => ({ ...b, ids: BELEGE[b.t] ?? [] }));');
    // Jede ID steht in den Kaffeebar-Interviews (die Seite prüft das zusätzlich beim Bauen).
    const ids = new Set(KAFFEEBAR_INTERVIEWS.interviews.flatMap((iv) => iv.zitate.map((z) => z.id)));
    expect(karten.flatMap((k) => k.ids ?? []).filter((id) => !ids.has(id))).toStrictEqual([]);
    // Beide Folien zeigen die IDs jeder besseren Karte, klein wie die übrigen IDs.
    const beispiel = q.slice(q.indexOf('id="beispiel"'), q.indexOf('id="firmensicht"'));
    const muster = q.slice(q.indexOf('id="vier-muster"'), q.indexOf('id="euer-baum"'));
    expect(beispiel.match(/<span class="baum-antwort" data-schritt data-besser>.*<\/span>/)?.[0]).toContain('{b.t} <small class="ids">{b.ids.join(\', \')}</small>');
    expect(muster.match(/<em class="besser" data-besser>.*<\/em>/)?.[0]).toContain('{b.t} <small class="ids">({b.moment} · {b.ids.join(\', \')})</small>');
    // Begleiter: Die Zitate bleiben, umgeschrieben wird der Satz (Torres S. 70; Probe S. 92).
    expect(NOTIZEN[pfad]?.beispiel?.live).toContain('„Die Zitate bleiben – umgeschrieben wird der Satz auf der Karte. Jedes Zitat geht dorthin, wo es gesagt wurde.“');
    expect(JSON.stringify(NOTIZEN[pfad]?.beispiel?.kern)).toContain('Opportunities don’t need to be exact quotes, but you should frame them using your customer’s words.');
  });
  // Entscheidung 19 (20.11. spät): Woher die Chancen kommen (Werkstatt, Feld „Chancen“) und dass ein Zitat noch keine Chance ist.
  it('Tag 3: baum – vorgehen nennt die Quelle der Chancen, inventar: „Ein Zitat ist noch keine Chance“', () => {
    const pfad = '/innolab/methoden/baum';
    const q = quellen[pfad] ?? '';
    const vorgehen = q.slice(q.indexOf('id="vorgehen"'), q.indexOf('id="anti-muster"'));
    // Entscheidung 20: Die Chancen liegen vorab im Streifen „Ungeprüft“ im Baum-Frame.
    expect(vorgehen).toContain('Eure Chancen liegen im Streifen „Ungeprüft“ unten im Frame: jede durch die drei Fragen → unter ihren Moment, Gleiches zusammenlegen, „X von 3“. Was liegen bleibt, bleibt im Snapshot.');
    expect(q).toContain('und unten eure Chancen im Streifen „Ungeprüft“.</li>');
    expect(JSON.stringify(NOTIZEN[pfad]?.vorgehen?.ablauf)).toContain('Ansage 9:25');
    const inventar = q.slice(q.indexOf('id="inventar"'), q.indexOf('id="drei-fragen"'));
    expect(inventar).toContain('<p class="zitat-chance">Moment ohne Karte? Ein Zitat ist noch keine Chance – fragt: Was braucht die Person hier?</p>');
    expect(NOTIZEN[pfad]?.vorgehen?.live).toContain('„Ein Zitat ist noch keine Chance – fragt: Was braucht die Person hier?“');
    // 9:25: zuerst die grüne Karte an jedem Baum prüfen (Produkt-Outcome, zählbar, Frage 3) – ohne Namen im Live-Stichwort.
    expect(NOTIZEN[pfad]?.vorgehen?.live[0]).toBe('Kurz an jeden Baum: grüne Karte – Produkt-Outcome, zählbar, trägt Frage 3?');
    expect(JSON.stringify(NOTIZEN[pfad]?.vorgehen?.ablauf?.achten)).toContain('Produkt-Outcome, nicht Geschäftszahl; zählbar; lässt sich Frage 3');
    expect(NOTIZEN[pfad]?.vorgehen?.live.length).toBeLessThanOrEqual(5);
    expect(NOTIZEN[pfad]?.vorgehen?.live.join(' ').match(/Sofie|Joachim|Hewen/g) ?? []).toStrictEqual([]);
  });
  // Entscheidung 21 (20.11. spät): I3-2 fiel nur beim Anstehen und Warten. Die Halle-Chance „Geht sich ein Kaffee noch aus?“
  // trägt I2-4, I3-1, I5-2 (3 von 5), die Warten-Chance „Wann ist mein Kaffee fertig?“ I2-5, I3-2, I3-3 (2 von 5).
  it('Tag 3: Kaffeebar – die Halle-Chance trägt nirgends I3-2, die Warten-Chance schon', () => {
    // Entscheidung 37 (21.11.): auch die Experience Map (Tag 2) nennt die Halle-Chance mit I3-1.
    const texte = ['/innolab/methoden/baum', '/innolab/methoden/ziel-chance', '/innolab/methoden/journey-map'].flatMap((p) => [quellen[p] ?? '', JSON.stringify(NOTIZEN[p] ?? {})]);
    expect(quellen['/innolab/methoden/journey-map']).toContain('„Geht sich ein Kaffee noch aus?“ (I2-4, I3-1, I5-2)');
    // Entscheidung 39: auch die Warten-Chance auf der Experience Map wie im Baum.
    expect(quellen['/innolab/methoden/journey-map']).toContain('„Wann ist mein Kaffee fertig?“ (I2-5, I3-2, I3-3)');
    const halle = texte.flatMap((s) => [...s.matchAll(/Geht sich ein Kaffee noch aus\?“(?:'\s*:\s*\[|\s*\()([^)\]]*)/g)].map((m) => m[1])).filter((ids) => /I\d-\d/.test(ids));
    expect(halle.length).toBeGreaterThan(2);
    expect(halle.filter((ids) => ids.includes('I3-2'))).toStrictEqual([]);
    expect(halle.filter((ids) => ids.includes('I3-1')).length).toBe(halle.length);
    expect(quellen['/innolab/methoden/baum']).toContain("'„Wann ist mein Kaffee fertig?“': ['I2-5', 'I3-2', 'I3-3'],");
    // Code-Review 21.11.: beide Seiten mit IDs, damit der Gleichstand lesbar ist.
    expect(quellen['/innolab/methoden/ziel-chance']).toContain('<td>„Geht sich …“: I2-4, I3-1, I5-2 gegen „Wenn ich anstehe …“: I2-2, I3-4, I4-1 – je 3 von 5</td>');
    // Entscheidung 32 (21.11.): Im Kundenprofil ist die Halle-Chance P1 – mit denselben IDs wie im Baum.
    expect(quellen['/innolab/methoden/kundenprofil']).toContain('<td>P1 Nicht wissen, ob sich ein Kaffee bis zur Abfahrt ausgeht (I2-4, I3-1, I5-2)</td>');
    // „Sie entscheiden erst in der Halle“ belegt I5-3 („Das entscheid ich, wenn ich die Halle seh.“), nicht I5-2 („Wenn es voll ist,
    // lass ich es.“ – Beleg der Halle-Chance). Überall dieselben drei IDs.
    const halleBelege = texte.flatMap((s) => [...s.matchAll(/entscheiden erst in der Halle \((?:Belege )?([^)]*)\)|u\. a\. ([^→]*)→ Moment „Halle: entscheiden“/g)].map((m) => (m[1] ?? m[2] ?? '').trim())).filter((ids) => /I\d-\d/.test(ids));
    expect(halleBelege.length).toBeGreaterThanOrEqual(3);
    expect([...new Set(halleBelege)]).toStrictEqual(['I2-4, I3-1, I5-3']);
  });
  // Entscheidung 11: An Tag 3 heißen die Kaffeebar-Momente wie die Spalten beim Zählen, keine Ich-Sätze – auf der
  // Experience Map (auch KaffeebarMap), im Baum und auf Ziel-Chance. Tag 2 und Tag 4 bleiben, wie sie unterrichtet wurden.
  it('Tag 3: Kaffeebar-Momente als Tätigkeitsnamen auf experience-map, baum und ziel-chance', () => {
    const SAETZE = /Ich komme in die Halle und entscheide|Ich stehe an und warte auf meinen Kaffee|Ich bin im Zug/g;
    const seiten = ['/innolab/tag-3/experience-map', '/innolab/methoden/baum', '/innolab/methoden/ziel-chance'];
    expect(seiten.flatMap((p) => [...(quellen[p] ?? '').matchAll(SAETZE)].map((m) => `${p}: ${m[0]}`))).toStrictEqual([]);
    expect(seiten.flatMap((p) => JSON.stringify(NOTIZEN[p] ?? {}).match(SAETZE) ?? [])).toStrictEqual([]);
    expect(quellen['/innolab/tag-3/experience-map']).toContain('<KaffeebarMap namen="taetigkeit" />');
  });
  // 20.11. spät (Markus, Entscheidung 10): Oben hängt der Momentname von heute früh (T3 · 0), kein Satz der Kundschaft; die
  // Bildunterschrift „Vier Momente, vier oberste Chancen“ wird erklärt (Torres’ eigene Sätze, S. 70 wörtlich).
  it('Tag 3: baum#oberste-ebene – Momentname von T3 · 0, Moment = wann, Chance = was die Person dann bewegt', () => {
    const q = quellen['/innolab/methoden/baum'] ?? '';
    const folie = q.slice(q.indexOf('id="oberste-ebene"'), q.indexOf('id="inventar"'));
    expect(folie.match(/Von Tag 2:/g) ?? []).toStrictEqual([]);
    expect(folie).toContain('<strong>Von heute früh (T3 · 0):</strong>');
    expect(folie).toContain('Moment = wann (oben). Chance = was die Person dann bewegt (darunter).');
    expect(folie).toContain('„Opportunities don’t need to be exact quotes, but you should frame them using your customer’s words“ (S. 70)');
  });
  // 20.11. spät (Markus, Punkt 9): Momentkarte = Name + Zählung. Kein Beispielzitat, keine ID-Liste auf den Karten von
  // „zusammen“, keine Prüffrage nach Zitat-IDs unter zwei Momenten; „Welche Zitate gehören hierher?“ gehört zum Zusammenlegen.
  it('Tag 3: experience-map – Moment = Name + Zählung, keine Zitate oder IDs auf der Momentkarte', () => {
    const pfad = '/innolab/tag-3/experience-map';
    const q = quellen[pfad] ?? '';
    const zusammen = q.slice(q.indexOf('id="zusammen"'), q.indexOf('id="anlauf-c"'));
    const karte = zusammen.match(/class="karte"[\s\S]*?<\/span>\s*<\/li>/)?.[0] ?? '';
    expect(karte).toContain('{zaehlung(z.g)}');
    expect(karte.match(/<b>|class="id"|class="ids"|z\.zitat|z\.id\b/g) ?? []).toStrictEqual([]);
    expect(q.match(/Zitat-ID unter zwei Momenten|darunter alle Zitat-IDs/g) ?? []).toStrictEqual([]);
    expect(q).toContain('<span>erzählt in N von M Interviews</span>');
    expect(q).toMatch(/<strong>Zusammenlegen:<\/strong>[^<]*welche Zitate gehören hierher\?/);
    expect(JSON.stringify(NOTIZEN[pfad]).match(/Zitat-ID unter zwei|dieser IDs/g) ?? []).toStrictEqual([]);
  });
  // 21.11. (Entscheidung 65): Gezählt werden Interviews, nicht Geschichten – „N von M Interviews“, auf keiner Seite und in
  // keinem Begleiter mehr „von M Geschichten“ oder „Gezählt werden Geschichten“.
  it('Zählung: keine Seite und kein Begleiter zählt Geschichten statt Interviews', () => {
    const ALT = /\b(?:[A-Z]|\d+|eine[mr]?|zwei|drei|vier|fünf|sechs) von (?:[A-Z]|\d+|drei|vier|fünf|sechs) Geschichten|Gezählt werden Geschichten|M = (?:alle )?(?:eure|eigenen) Geschichten|Zahl der Geschichten|wie vielen? Geschichten|Geschichten mit (?:diesem Knoten|Zitat)/g;
    const texte: Record<string, string> = {
      ...quellen,
      begleiter: JSON.stringify(NOTIZEN),
      'kaffeebar-skizzen.ts': readFileSync('src/data/kaffeebar-skizzen.ts', 'utf8'),
    };
    const funde = Object.entries(texte).flatMap(([pfad, text]) => (text.match(ALT) ?? []).map((m) => `${pfad}: ${m}`));
    expect(funde).toStrictEqual([]);
    expect(quellen['/innolab/tag-3/experience-map']).toContain('Gezählt werden Interviews, nicht Zitate: fünf Zitate, drei Interviews.');
    expect(quellen['/innolab/tag-3']).toContain('erzählt in N von M Interviews');
  });
  // 21.11. (Entscheidung 69): Die gelbe Karte auf baum#euer-baum nennt dieselbe ID-Regel wie Handout und Begleiter.
  it('Tag 3: baum#euer-baum – gelbe Karte mit einer Zitat-ID je Interview', () => {
    const q = quellen['/innolab/methoden/baum'] ?? '';
    const folie = q.slice(q.indexOf('id="euer-baum"'), q.indexOf('id="vorgehen"'));
    expect(folie).toContain('<strong>Gelbe Karte:</strong> Satz der Kundschaft · Zitat-IDs (eine je Interview genügt) · „X von N“ – auch „1 von 3“ kommt in den Baum.');
  });
  // Tag 2 (12.11.): Eröffnung, die drei Methoden, Abschluss – der Begleiter folgt jeder Folie, und jede hat Stichworte.
  const TAG_2_SEITEN = ['/innolab/tag-2', '/innolab/methoden/synthese', '/innolab/methoden/journey-map', '/innolab/methoden/baum', '/innolab/tag-2/abschluss'];
  it('Tag 2: jede Folie der vier Seiten hat eine Notiz mit mindestens einem live-Stichwort', () => {
    const tag2 = TAG_2_SEITEN.flatMap((p) => folienAus(p, quellen[p] ?? ''));
    expect(tag2.length).toBeGreaterThan(30);
    expect(tag2.filter((f) => !NOTIZEN[f.pfad]?.[f.id]?.live?.some((s) => s.trim() !== '')).map((f) => `${f.pfad}#${f.id}`)).toStrictEqual([]);
  });
  it('Tag 2: Seiten in Tagesreihenfolge, Beamer auf synthese#warum zeigt diese Folie', () => {
    const reihenfolge = [...new Set(folien.map((f) => f.pfad))].filter((p) => TAG_2_SEITEN.includes(p));
    expect(reihenfolge).toStrictEqual(TAG_2_SEITEN);
    const { z, karte } = beamer('/innolab/methoden/synthese', 'warum');
    expect(karte).toBeNull();
    expect(`${folien[z.index].pfad}#${folien[z.index].id}`).toBe('/innolab/methoden/synthese#warum');
  });
  it('Tag 1 unverändert: dieselben Folien vorn, gleiche Indizes, eine Gruppe', () => {
    const tag1 = tagFolien(quellen);
    expect(folien.slice(0, tag1.length)).toStrictEqual(tag1);
    expect(folien.length).toBeGreaterThan(tag1.length);
    expect(new Set(tag1.map((f) => folienGruppe(f.pfad)))).toStrictEqual(new Set(['tag-1']));
    expect(beamer('/innolab/methoden/entscheidungslog', 'beleg-staerke').z.index).toBe(folieZu(tag1, '/innolab/methoden/entscheidungslog', 'beleg-staerke'));
  });
  // Entscheidungen 30 und 31 (21.11.): Tag 3 ohne Entscheidungslog und ohne docs/ZIEL-CHANCE.md – die Begründung steht im
  // Feld „Begründen“ auf Miro T3 · 1, Schritt 4 ist nur der Stern im Baum. Die Zweiwegtür ist als Bild erzählt.
  it('Tag 3: Ziel-Chance ohne Entscheidungslog und ohne docs/ZIEL-CHANCE.md, Begründung auf T3 · 1', () => {
    const zc = quellen['/innolab/methoden/ziel-chance'] ?? '';
    const texte = [zc, JSON.stringify(NOTIZEN['/innolab/methoden/ziel-chance'] ?? {}), quellen['/innolab/tag-3'] ?? '',
      quellen['/innolab/methoden/kundenprofil'] ?? '', quellen['/innolab/methoden/hmw'] ?? ''];
    expect(texte.every((t) => t.length > 1000)).toBe(true);
    expect(texte.flatMap((t) => t.match(/Entscheidungslog|ZIEL-CHANCE\.md|ins Log/g) ?? [])).toStrictEqual([]);
    expect(zc).toContain('<li data-schritt><strong>Festhalten:</strong> Ziel-Chance im Baum mit dem Stern markieren. <Timer minuten={3} /></li>');
    expect(zc).toContain('<Prompt label="Vorlage · eure Spalte in T3 · 1">');
    expect(quellen['/innolab/tag-3']).toContain('Feld „Begründen“ auf T3 · 1');
    const tuer = zc.slice(zc.indexOf('id="zweiwegtuer"'), zc.indexOf('id="vorgehen"'));
    expect(tuer).toContain('id="zweiwegtuer">Einwegtür oder Zweiwegtür?</h2>');
    expect(tuer.match(/<li data-schritt>/g) ?? []).toHaveLength(4);
    expect(tuer.match(/Darum heute mit Uhr|schneller lernen/g) ?? []).toStrictEqual([]);
  });
  // Entscheidung 34 (21.11.): Kundenprofil `konkret` – drei Proben mit je einer Nachfrage. Die Kaffeebar-Zeile bleibt offen:
  // I5-2 nennt keine Zahl, die Zahl hat nur I3-4 (eine andere Person), und „P2“ kennt auf dieser Folie noch niemand.
  it('Tag 3: kundenprofil#konkret – Nachfrage-Spalte, Kaffeebar offen, kein P2; profil ohne „mehr als x Minuten“', () => {
    const q = quellen['/innolab/methoden/kundenprofil'] ?? '';
    const konkret = q.slice(q.indexOf('id="konkret"'), q.indexOf('<Folie', q.indexOf('id="konkret"')));
    const beamer = konkret.slice(0, konkret.indexOf('<div class="nur-handout">'));
    expect(konkret).toContain('id="konkret">Konkret, kein Spiegelbild, ein Warum weiter</h2>');
    expect(beamer).toContain('<thead><tr><th>zuerst notiert</th><th>Nachfrage</th><th>im Profil</th></tr></thead>');
    expect(beamer.match(/<tr data-schritt><td><strong>(Vage|Gespiegelt|Oberflächlich|Kaffeebar):<\/strong>/g) ?? []).toHaveLength(4);
    expect(beamer).toContain('<td><strong>Kaffeebar:</strong> „Wenn es voll ist, lass ich es.“ (I5-2)</td><td>Ab wie vielen Leuten?</td><td>offen – Frage fürs nächste Interview</td>');
    expect(beamer).toContain('<p data-schritt>Eine Zahl gibt es bei einer anderen Person: „Bei mehr als fünf Leuten lass ich es.“ (I3-4)</p>');
    expect([konkret, JSON.stringify(NOTIZEN['/innolab/methoden/kundenprofil']?.konkret)].flatMap((t) => t.match(/zusammen ergeben sie P2|– P2\b/g) ?? [])).toStrictEqual([]);
    expect(beamer.match(/\bP2\b/g) ?? []).toStrictEqual([]);
    const profil = q.slice(q.indexOf('id="profil"'), q.indexOf('<div class="nur-handout">', q.indexOf('id="profil"')));
    expect(profil).toContain('<li data-schritt><strong>Pains:</strong> schlechte Ergebnisse, Hindernisse, Risiken.</li>');
  });
  // Entscheidung 35 (21.11.): Kundenprofil ohne Reihum – `jane` ohne Übung (Titelfrage rhetorisch), `profil` mit Frage an alle.
  it('Tag 3: kein „reihum“ auf der Kundenprofil-Seite und in ihren Notizen; jane ohne Übung', () => {
    const q = quellen['/innolab/methoden/kundenprofil'] ?? '';
    const n = NOTIZEN['/innolab/methoden/kundenprofil'] ?? {};
    const texte = [q, JSON.stringify(n)];
    expect(texte.every((t) => t.length > 1000)).toBe(true);
    expect(texte.flatMap((t) => t.match(/reihum/gi) ?? [])).toStrictEqual([]);
    expect(n.jane?.uebung).toBeUndefined();
    expect(n.jane?.ablauf).toBeUndefined();
    expect(n.jane?.kern?.length).toBe(2);
  });
  // Entscheidungen 36 und 38 (21.11.): Kundenprofil `vorgehen` in fünf Schritten, 2 + 5 + 4 + 3 + 4 = 18 min (Titel = Timer-Summe,
  // wie die Miro-Karte „So geht's“); Jobs aus den Snapshots, nicht aus den Momenten der Map und nicht „aus Tag 1“.
  it('Tag 3: kundenprofil#vorgehen – fünf Schritte, Timer 18 min, Jobs aus den Snapshots', () => {
    const q = quellen['/innolab/methoden/kundenprofil'] ?? '';
    const n = NOTIZEN['/innolab/methoden/kundenprofil'] ?? {};
    expect([q, JSON.stringify(n)].flatMap((t) => t.match(/Jobs aus Tag 1/g) ?? [])).toStrictEqual([]);
    const folie = q.slice(q.indexOf('id="vorgehen"'), q.indexOf('<Folie', q.indexOf('id="vorgehen"')));
    expect(folie).toContain('id="vorgehen">So geht ihr vor (18 min)</h2>');
    const schritte = folie.slice(folie.indexOf('<ol'), folie.indexOf('</ol>'));
    const timer = [...schritte.matchAll(/<li data-schritt>.*?<Timer minuten=\{(\d+)\} \/><\/li>/g)].map((m) => Number(m[1]));
    expect(timer).toStrictEqual([2, 5, 4, 3, 4]);
    expect(timer.reduce((a, b) => a + b, 0)).toBe(18);
    expect(schritte).toContain('<li data-schritt><strong>Wessen Profil?</strong>');
    expect(schritte).toContain('<li data-schritt><strong>Jobs aus den Snapshots:</strong> Welche Aufgabe wollte die Person in ihrer Geschichte erledigen? Mit Zitat-ID – oder ohne, dann mit „?“ als Vermutung. Dann einmal „Warum?“: der soziale oder emotionale Job dahinter – ohne Zitat ein „?“.');
    expect(q.match(/aus den Momenten eurer Map|Jeder Moment ist ein Job/g) ?? []).toStrictEqual([]);
    expect(n.vorgehen?.uebung?.dauer).toBe('18 min (2 + 5 + 4 + 3 + 4)');
    expect(uebungMinuten(n.vorgehen?.uebung?.dauer)).toBe(18);
  });
  // Entscheidung 70 (21.11.): neue Folie `job-arten` direkt nach `profil` – Tabelle Art · Probe · Im Buch · Kaffeebar, je Zeile ein Klick,
  // letzter Klick J1 → warum? → J2; Kaffeebar-Jobs wortgleich mit `beispiel`. `profil` nennt die Arten nicht mehr.
  it('Tag 3: kundenprofil#job-arten – nach profil, Tabelle mit drei Arten, Warum-Zeile, Begleiter', () => {
    const q = quellen['/innolab/methoden/kundenprofil'] ?? '';
    const n = NOTIZEN['/innolab/methoden/kundenprofil'] ?? {};
    const ids = [...q.matchAll(/<h2 id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.slice(ids.indexOf('profil'), ids.indexOf('profil') + 3)).toStrictEqual(['profil', 'job-arten', 'konkret']);
    const a = q.indexOf('id="job-arten"');
    const folie = q.slice(a, q.indexOf('<div class="nur-handout">', a));
    expect(folie).toContain('id="job-arten">Drei Arten von Jobs</h2>');
    expect(folie).toContain('<p class="folie-satz">Erledigen, dastehen, sich fühlen.</p>');
    expect(folie).toContain('<div class="kp-job-arten"');
    expect(folie).toContain('<thead><tr><th>Art</th><th>Probe</th><th>Im Buch</th><th>Kaffeebar</th></tr></thead>');
    const zeilen = [...folie.matchAll(/<tr data-schritt><td><strong>([^<]+)<\/strong><\/td><td>[^<]+<\/td><td>[^<]+<\/td><td>([^<]+)<\/td><\/tr>/g)].map((m) => [m[1], m[2]]);
    expect(zeilen).toStrictEqual([
      ['Funktional', 'J1 Auf dem Weg zum Zug Kaffee besorgen (I2-4, I5-3)'],
      ['Sozial', 'J3 Im Büro nicht als die*der Gehetzte ankommen (I4-5)'],
      ['Emotional', 'J2 Den Arbeitstag nicht gehetzt beginnen (I1-1, I4-5)'],
    ]);
    // Wortlaut und Zitat-IDs wie auf `beispiel` (dort steht die Art zwischen Job und IDs).
    const beispiel = q.slice(q.indexOf('id="beispiel"'), q.indexOf('</tbody>', q.indexOf('id="beispiel"')));
    for (const [art, job] of zeilen) {
      const [text, belege] = job.split(' (');
      expect(beispiel).toContain(`<td>${text} · ${art.toLowerCase()} (${belege}</td>`);
    }
    expect(folie).toContain('<p data-schritt><strong>Vom einen zum anderen:</strong> Kaffee besorgen (J1) – warum? Um den Arbeitstag nicht gehetzt zu beginnen (J2).</p>');
    expect(q).toContain('<li data-schritt><strong>Jobs:</strong> was jemand erledigen will – in den Worten der Kundschaft.</li>');
    // Code-Review 21.11.: ein Ergebnis ohne „Ich will …“, damit die Frage nicht mit der Regel „Ich will … → Job“ kollidiert.
    expect(n['job-arten']?.verstaendnis?.frage).toBe('„Pünktlich im Büro ankommen“ – emotionaler Job oder Gain?');
    expect(n.beispiel?.live?.[0]).toBe('J1–J3 nicht vorlesen (job-arten).');
  });
  // Entscheidungen 71–73 (21.11.): `vorgehen` Schritt 5 geht die sechs Fehler durch; Einträge ohne Zitat sind erlaubt, mit „?“;
  // der Folien-Satz nennt das Ergänzen; Prüfpunkt kundenprofil-ziel-chance lässt „?“ zu.
  it('Tag 3: kundenprofil#vorgehen – Schritt 5 sechs Fehler, ohne Zitat mit „?“, Folien-Satz', () => {
    const q = quellen['/innolab/methoden/kundenprofil'] ?? '';
    const n = NOTIZEN['/innolab/methoden/kundenprofil'] ?? {};
    const a = q.indexOf('id="vorgehen"');
    const folie = q.slice(a, q.indexOf('</Folie>', a));
    expect(folie).toContain('<p class="folie-satz">Aus Baum und Interviews füllen, dann ergänzen, was ihr vermutet (mit „?“) – je Spalte ordnen.</p>');
    expect(folie).toContain('<li data-schritt><strong>Ordnen und prüfen:</strong> Skalen, je Spalte, oberste drei nummerieren (J1, P1, G1); dann die sechs Fehler durchgehen (nächste Folie) – was ihr findet, korrigiert ihr gleich. <Timer minuten={4} /></li>');
    expect(folie).toContain('Zuerst füllt ihr das Profil aus dem, was ihr habt: Baum und Interviews, mit Zitat-IDs – so beruht es auf Belegen und nicht auf dem Bauch. Dann ergänzt ihr, was ihr vermutet, mit „?“: Das Buch erlaubt, mit Vermutungen zu beginnen, solange ihr sie prüft ({VPD}, S. 65, 67). Jedes „?“ ist eine Frage fürs nächste Interview. Beim Ordnen stehen belegte Einträge im Zweifel über Vermutungen.');
    // Ein Satz statt drei: die Regel steht nicht doppelt, und „aus dem Bauch“ verbietet keine Vermutungen.
    expect(folie.match(/Einträge ohne Zitat dürfen ins Profil|nicht aus dem Bauch kommt|Das Buch erlaubt auch/g) ?? []).toStrictEqual([]);
    expect(n.vorgehen?.ablauf?.achten).toContain('Pains, die nicht im Baum stehen, dürfen dazu – mit „?“.');
    // Entscheidung 74 (21.11.): mit job-arten dauert die Theorie etwa 13 Minuten.
    expect(folie).toContain('Dazu etwa 13 Minuten Theorie mit Jane und der Kaffeebar.');
    expect(folie.match(/einen der sechs Fehler bei euch markieren/g) ?? []).toStrictEqual([]);
    expect(n.vorgehen?.live).toContain('Wer in 4 min nicht durchkommt: zuerst „zu vage“, „eigenes Angebot“.');
    expect(JSON.stringify(n.vorgehen).match(/Kein Eintrag ohne Zitat|einen Fehler markieren|einen der sechs Fehler/g) ?? []).toStrictEqual([]);
    const pp = METHODEN.find((m) => m.slug === 'kundenprofil')!.pruefliste!.find((x) => x.id === 'kundenprofil-ziel-chance')!;
    expect(pp.text).toBe('Die Ziel-Chance steht als Pain im Profil; jeder Eintrag verweist auf Zitat-IDs aus den Interviews oder trägt ein „?“ (Vermutung).');
  });
  // Entscheidung 37 (21.11.): Tag 3 ohne Dateien im Repo – die Abschluss-Checkliste zeigt auf die Miro-Frames, ohne Commit.
  it('Tag 3: Abschluss-Checkliste ohne docs-Dateien und ohne „Committet und gepusht“', () => {
    const q = quellen['/innolab/tag-3'] ?? '';
    const liste = q.slice(q.indexOf('<Checklist id="il-tag3-abschluss'), q.indexOf(']} />', q.indexOf('<Checklist id="il-tag3-abschluss')));
    expect(liste).toContain('<Checklist id="il-tag3-abschluss-v6"');
    expect(liste.match(/\.md\b|im Repo|Committet|gepusht/g) ?? []).toStrictEqual([]);
    expect(liste).toContain('T3 · 4 · Canvas · euer Name');
    // Auch die Ideation (Folgeauftrag zu Entscheidung 37): kein Entscheidungslog D… mehr in den Notizen von Tag 3.
    for (const p of ['/innolab/methoden/baum', '/innolab/methoden/ideation']) expect(JSON.stringify(NOTIZEN[p] ?? {}).match(/Entscheidungslog|\(D\d\)/g) ?? [], p).toStrictEqual([]);
  });
  // Entscheidung 38 (21.11.) und „kein Reihum“: Value Map ohne Kursregel-Etikett, ohne Entscheidungslog, ohne docs-Dateien,
  // ohne Reihum; die Frage beim 1:1 ist das ✗ des Spitzenreiters oben im Profil.
  it('Tag 3: value-map ohne Kursregel, Entscheidungslog, docs-Dateien und Reihum', () => {
    const q = quellen['/innolab/methoden/value-map'] ?? '';
    const n = NOTIZEN['/innolab/methoden/value-map'] ?? {};
    const texte = [q, JSON.stringify(n)];
    expect(texte.every((x) => x.length > 1000)).toBe(true);
    expect(texte.flatMap((x) => x.match(/Kursregel|Entscheidungslog|ins Log|docs\/(IDEEN|VALUE-MAP|KUNDENPROFIL)\.md|reihum|nach einem Kreuz/gi) ?? [])).toStrictEqual([]);
    // Entscheidung 68 (21.11.): 1:1 ab Minute 5, die Frage zielt auf das ✗ des Spitzenreiters aus dem Vergleich der Lückensätze.
    expect(q).toContain('Ab Minute 5 geht Markus von Canvas zu Canvas und fragt bei jeder Person: „Euer Spitzenreiter hat ein ✗ oben im Profil – nehmt ihr das bewusst in Kauf, und warum?“ – oder, wenn oben kein ✗ steht: „Was bleibt oben offen?“. Gemeint ist das ✗ aus dem Vergleich der drei Lückensätze.');
    expect(n.vorgehen?.ablauf?.schritte?.[1]).toContain('Markus geht ab Minute 5 zu jeder Person (Hewen, Joachim, Sofie, je drei Minuten) und fragt: „Euer Spitzenreiter hat ein ✗ oben im Profil – nehmt ihr das bewusst in Kauf, und warum?“ – oder, wenn oben kein ✗ steht: „Was bleibt oben offen?“');
    expect(n.vorgehen?.uebung?.form).toBe('allein; Markus fragt je nach dem ✗ des Spitzenreiters: bewusst in Kauf – warum? Ohne ✗ oben: Was bleibt oben offen?');
    expect(n.vorgehen?.live).toContain('1:1 ab Minute 5, je 3 min: Hewen, Joachim, Sofie.');
    expect(n.vorgehen?.live).toContain('Frage: ✗ des Spitzenreiters oben bewusst? Sonst: Was bleibt oben offen?');
    expect(texte.flatMap((x) => x.match(/Verzichtet ihr bewusst darauf|bewusst verzichtet – und warum/g) ?? [])).toStrictEqual([]);
    expect(uebungMinuten(n.vorgehen?.uebung?.dauer)).toBe(36);
  });
  // Entscheidungen 67 und 76 (21.11.): fünf Schritte (Option B), Titel = Summe der Timer (36 min), je Schritt Ort und Name
  // (wählen · füllen · ordnen · Fit prüfen · Festhalten und prüfen), Legende; die „?“ bleiben, wo sie entstehen – kein Sammeln im Feld.
  // Produkte tragen im Quadrat keine ID, darum nirgends „jeder Zettel mit P- oder G-ID“; fit-kaffeebar mit zwei Produkt-Zeilen.
  it('Tag 3: value-map#vorgehen – fünf Schritte, 36 min, Legende, „?“ bleiben stehen, nur Pain Reliever und Gain Creator mit P- oder G-ID', () => {
    const q = quellen['/innolab/methoden/value-map'] ?? '';
    const n = NOTIZEN['/innolab/methoden/value-map'] ?? {};
    const a = q.indexOf('id="vorgehen"');
    const folie = q.slice(a, q.indexOf('</Folie>', a));
    expect(folie).toContain('id="vorgehen">So geht ihr vor (36 min)</h2>');
    expect(folie).toContain('<p class="folie-satz">Einmal T3 · 4, dann nur noch euer Canvas: wählen, füllen, ordnen, prüfen.</p>');
    const schritte = folie.slice(folie.indexOf('<ol'), folie.indexOf('</ol>'));
    const timer = [...schritte.matchAll(/<li data-schritt>.*?<Timer minuten=\{(\d+)\} \/><\/li>/g)].map((m) => Number(m[1]));
    expect(timer).toStrictEqual([5, 15, 5, 9, 2]);
    expect(timer.reduce((x, y) => x + y, 0)).toBe(36);
    expect([...schritte.matchAll(/<li data-schritt><strong>([^<]+)<\/strong>/g)].map((m) => m[1])).toStrictEqual([
      'T3 · 4, euer Feld – wählen:', 'Euer Canvas, Quadrat – füllen:', 'Skalen links – ordnen:', 'Skalen – Fit prüfen:', 'Festhalten und prüfen:',
    ]);
    expect(schritte).toContain('<li data-schritt><strong>Euer Canvas, Quadrat – füllen:</strong> den Sticky mit dem Satz des Spitzenreiters mitnehmen. Aus dem Satz, dann aus dem Profil von oben: Products & Services ohne ID · Pain Relievers mit P-ID · Gain Creators mit G-ID.');
    expect(schritte).toContain('<li data-schritt><strong>Festhalten und prüfen:</strong> rechts ein Zeichen je Zettel · links jeder ✓ mit ID · jedes ? mit Frage. Die ? bleiben, wo sie stehen – an Tag 4 werden sie Annahmen. <Timer minuten={2} /></li>');
    expect(folie).toContain('<p class="small vm-legende-vorgehen">✓ trifft · ✗ trifft nicht · ? wissen wir nicht – beim Vergleich am Satz, beim Fit am Zettel.</p>');
    // Kaffeebar-Beispiele bei Füllen und Fit prüfen; die zu Wählen und Ordnen stehen aus Platzgründen im Handout (1280×720).
    expect([...schritte.matchAll(/<em class="vm-bsp">(Kaffeebar:[^<]+)<\/em>/g)].map((m) => m[1])).toStrictEqual(['Kaffeebar: „… ob der Kaffee vor der Abfahrt fertig ist (P1)“.', 'Kaffeebar: G2 ✗ · J4 ?']);
    expect(folie).toContain('Bei der Kaffeebar wird Satz 2, „Im Gehen bestellen“, der Spitzenreiter.');
    expect(folie).toContain('bei der Kaffeebar steht der P1-Zettel ganz oben.');
    // Die „?“ bleiben, wo sie entstehen: nirgends mehr „alle ? ins Feld“ oder „gesammelt“ – Seite, Begleiter, Tag 3, Tag 4, Prüfliste.
    const sammeln = /alle „?\?“[^.]*ins Feld|„\?“ ins Feld|ins Feld auf T3 · 4|gesammelt habt|stehen gesammelt|alle „\?“ im Feld/g;
    const orte = [q, JSON.stringify(n), quellen['/innolab/tag-3'] ?? '', quellen['/innolab/methoden/experiment'] ?? '', JSON.stringify(METHODEN.find((m) => m.slug === 'value-map'))];
    expect(orte.flatMap((x) => x.match(sammeln) ?? [])).toStrictEqual([]);
    expect(folie).toContain('Die „?“ bleiben, wo sie entstanden sind: die aus dem Vergleich am Satz in eurem Feld in T3 · 4, die aus dem Fit am Zettel auf den Skalen.');
    expect(n.vorgehen?.uebung?.dauer).toBe('36 min (5 + 15 + 5 + 9 + 2)');
    expect((n.vorgehen?.ablauf?.schritte ?? []).map((x) => x.split(' (')[0])).toStrictEqual(['Wählen', 'Füllen', 'Ordnen', 'Fit prüfen', 'Festhalten und prüfen']);
    expect(folie).toContain('Produkte bekommen im Quadrat keine ID');
    expect(folie).toContain('Dazu neun Minuten Theorie mit der Kaffeebar.');
    expect([q, JSON.stringify(n)].flatMap((x) => x.match(/jeder (grüne )?Zettel mit (P- oder G-)?ID|je mit P- oder G-ID|zeigt erst der Test/g) ?? [])).toStrictEqual([]);
    expect(q).toContain('Die Value Map schreibt aus und ergänzt – jeder Pain Reliever und Gain Creator mit <span style="white-space:nowrap">P- oder G-ID</span>.</p>');
    const fit = q.slice(q.indexOf('id="fit-kaffeebar"'), q.indexOf('</tbody>', q.indexOf('id="fit-kaffeebar"')));
    expect([...fit.matchAll(/<tr data-schritt><td>Products & Services<\/td><td>([^<]+)<\/td><td>([^<]+)<\/td><td>([^<]+)<\/td><\/tr>/g)].map((m) => m.slice(1))).toStrictEqual([
      ['QR-Code an der Hallentür, Bestellung im Browser ohne App', 'J1 Kaffee besorgen', '✓'],
      ['Express-Ausgabe mit drei Standardgetränken', 'J1 Kaffee besorgen', '✓'],
    ]);
    // Wortlaut der Produkte wie auf `vom-satz`.
    expect(q).toContain('<td>QR-Code an der Hallentür, Bestellung im Browser ohne App · Express-Ausgabe mit drei Standardgetränken</td>');
    expect(q).toContain('P4 (Automat als Notlösung – kein Zettel links nennt den Automaten).');
  });
  // Entscheidung 39 (21.11.): Tag 3 liegt ganz auf Miro – keine Datei in docs/ auf den Seiten und in den Notizen von Tag 3,
  // kein Callout zu docs/, Commit und Source Control.
  it('Tag 3: keine docs-Dateien auf den Seiten und in den Notizen von Tag 3', () => {
    const seiten = ['/innolab/tag-3', '/innolab/methoden/baum', '/innolab/methoden/ziel-chance', '/innolab/methoden/kundenprofil',
      '/innolab/methoden/hmw', '/innolab/methoden/ideation', '/innolab/methoden/value-map'];
    const texte = seiten.flatMap((p) => [quellen[p] ?? '', JSON.stringify(NOTIZEN[p] ?? {})]);
    expect(seiten.every((p) => (quellen[p] ?? '').length > 1000)).toBe(true);
    expect(texte.flatMap((x) => x.match(/docs\/|(ZIEL-CHANCE|KUNDENPROFIL|HMW|IDEEN|VALUE-MAP)\.md|Source Control/g) ?? [])).toStrictEqual([]);
  });
  // Entscheidungen 40 und 41 (21.11.): HMW ohne Reihum; `coast` mit alter Frage im ersten Fluss und dem Warum-Satz am Schluss.
  it('Tag 3: kein „reihum“ auf der HMW-Seite und in ihren Notizen; coast mit alter Frage', () => {
    const q = quellen['/innolab/methoden/hmw'] ?? '';
    const n = NOTIZEN['/innolab/methoden/hmw'] ?? {};
    const texte = [q, JSON.stringify(n)];
    expect(texte.every((x) => x.length > 1000)).toBe(true);
    expect(texte.flatMap((x) => x.match(/reihum/gi) ?? [])).toStrictEqual([]);
    expect(n['sweet-spot']?.uebung?.form).toBe('Frage an alle, je Karte eine Antwort, dann aufdecken');
    const coast = q.slice(q.indexOf('id="coast"'), q.indexOf('<p class="nur-handout">', q.indexOf('id="coast"')));
    expect(coast).toContain("{ t: 'Alte Frage', sub: '„How can we make a better green-stripe bar?“' },");
    expect(coast).not.toContain("t: 'Ergebnis'");
    expect(coast).toContain('<p data-schritt><strong>Bei euch ist der Warum-Schritt schon getan: Eure Ziel-Chance steht in den Worten der Kundschaft.</strong></p>');
  });
  // Entscheidungen 42 und 43 (21.11.): `warum` vergleicht können/könnten, „sollen“ nur im Handout; `bruecke` stellt Lösungswunsch
  // und Frage an die Chance gegeneinander, auf Deutsch; die Grundform lautet auf `bruecke`, `bauen` und in der Vorlage gleich.
  it('Tag 3: hmw#warum und hmw#bruecke – Vergleich, deutsche Frage, Grundform gleichlautend', () => {
    const q = quellen['/innolab/methoden/hmw'] ?? '';
    const folie = (id: string) => { const a = q.indexOf(`id="${id}"`); return q.slice(a, q.indexOf('<div class="nur-handout">', a)); };
    const warum = folie('warum');
    expect(warum).toContain('<p class="folie-satz">„Wie können wir …?“ oder „Wie könnten wir …?“ – was ändert der Konjunktiv?</p>');
    expect(warum).toContain('<li><strong>könnten</strong> – Was wäre möglich? – geprüft wird später.</li>');
    expect(warum.match(/sollen/gi) ?? []).toStrictEqual([]);
    const bruecke = folie('bruecke');
    expect(bruecke).toContain("sub: '„Wie könnten wir ‚Ich mag keine Werbung‘ angehen?“'");
    expect(bruecke.match(/How might we|commercials/g) ?? []).toStrictEqual([]);
    expect(bruecke).toContain('<p data-schritt><strong>Eure erste Frage:</strong> „Wie könnten wir ‚[eure Ziel-Chance]‘ angehen?“</p>');
    expect(q.match(/Grundform nach Torres|feste Form/g) ?? []).toStrictEqual([]);
    expect(q).toContain('die Grundform „Wie könnten wir ‚[eure Ziel-Chance]‘ angehen?“, ist Kursformat.');
    expect(NOTIZEN['/innolab/methoden/hmw']?.warum?.ueberleitung).toBe('Wie kommt ihr von eurer Chance zu so einer Frage? Torres zeigt, warum die Chance in die Frage gehört.');
  });
  // Entscheidung 44 (21.11.): `bauen` als drei Fragen mit sprechenden Etiketten statt „genauer/weiter“; die Probe steht nur
  // auf `sweet-spot`; die Grundform lautet wie auf `bruecke`.
  it('Tag 3: hmw#bauen – Grundform, mit Person und Moment, eine Ebene höher; kein genauer/weiter', () => {
    const q = quellen['/innolab/methoden/hmw'] ?? '';
    const n = NOTIZEN['/innolab/methoden/hmw'] ?? {};
    const a = q.indexOf('id="bauen"');
    const bauen = q.slice(a, q.indexOf('<div class="nur-handout">', a));
    expect(bauen).toContain('<li data-schritt><strong>Grundform:</strong> „Wie könnten wir ‚Geht sich ein Kaffee noch aus?‘ angehen?“</li>');
    expect(bauen).toContain('<li data-schritt><strong>Mit Person und Moment (H1):</strong> Wer, in welchem Moment? –');
    // Entscheidung 64 (21.11.): „Eine Ebene höher“ statt „Ein Warum höher“; die Zeile „Warum will die Person das?“ bleibt.
    expect(bauen).toContain('<li data-schritt><strong>Eine Ebene höher (H2):</strong> Warum will die Person das? –');
    expect([q, JSON.stringify(n)].flatMap((x) => x.match(/Warum höher/gi) ?? [])).toStrictEqual([]);
    expect(q).toContain('<li data-schritt><strong>Allein:</strong> die Grundform und zwei Varianten zu eurer Ziel-Chance – eine mit Person und Moment, eine eine Ebene höher (Warum will die Person das?). <Timer minuten={7} /></li>');
    expect(bauen.match(/Probe|Sweet Spot|<Fluss/g) ?? []).toStrictEqual([]);
    expect([q, JSON.stringify(n)].flatMap((x) => x.match(/Genauer \(H1\)|Weiter \(H2\)|eine weiter, eine genauer|H1 genauer|H2 weiter\b|Stufe weiter|Variante weiter|„genauer“/g) ?? [])).toStrictEqual([]);
    // Vorlage wie das Beispiel: Grundform, H1, H2 – kein H3.
    expect(q).toContain('- Grundform: Wie könnten wir ‚[eure Ziel-Chance]‘ angehen?\n- H1 (mit Person und Moment): Wie könnten wir […]?\n- H2 (eine Ebene höher): Wie könnten wir […]?');
    expect(q.match(/H3|H\[n\]/g) ?? []).toStrictEqual([]);
    expect(q).toContain('Dort fragt ihr es am Job (Osterwalder u. a., „Value Proposition Design“, S. 80), hier an der Chance');
  });
  // Runde 16 (21.11.): Ideation ohne Etikett „Kursregel“ – wo der Kurs von Torres abweicht, steht der Grund.
  it('Tag 3: ideation ohne „Kursregel“ und „Regel dieses Kurses“, auch nicht im Begleiter', () => {
    const q = quellen['/innolab/methoden/ideation'] ?? '';
    const texte = [q, JSON.stringify(NOTIZEN['/innolab/methoden/ideation'] ?? {})];
    expect(texte.every((x) => x.length > 1000)).toBe(true);
    expect(texte.flatMap((x) => x.match(/Kursregel|Regel dieses Kurses/g) ?? [])).toStrictEqual([]);
    expect(q).toContain('allein aus, weil ihr drei Produkte habt.</p>');
  });
  // Code-Review 21.11.: Tag 4 und 5 zeigen für Kundenprofil und Value Map auf Miro, nicht auf docs-Dateien.
  it('Tag 4+: Vorlagen und Handouts nennen Kundenprofil und Value Map auf Miro, keine docs-Datei', () => {
    const seiten = ['concept-story', 'experiment', 'geschaeftsmodell', 'pitch', 'story-map'].map((s) => `/innolab/methoden/${s}`);
    expect(seiten.every((p) => (quellen[p] ?? '').length > 1000)).toBe(true);
    expect(seiten.flatMap((p) => (quellen[p] ?? '').match(/(KUNDENPROFIL|VALUE-MAP)\.md/g) ?? [])).toStrictEqual([]);
    expect(quellen['/innolab/methoden/experiment']).toContain('Erste Kandidaten für Annahmen sind die „?“ von Tag 3 auf Miro: am Satz im Feld „Ideen vergleichen und wählen“ (T3 · 4), aus dem Ideen-Vergleich aller drei Ideen, und am Zettel in eurem Canvas, aus dem Fit.');
  });
  // Entscheidungen 45–47 (21.11.): Pfad HMW → Ideation sichtbar; Ideation ohne Reihum, Titel = Summe der Timer;
  // Ziel-Chance mit „Ausschlaggebend“ / „Spricht dagegen“ statt „tragende Linse“.
  it('Tag 3: Pfad zur Ideation, Ideation ohne Reihum mit 59 min, Ziel-Chance ohne „tragend“', () => {
    const hmw = quellen['/innolab/methoden/hmw'] ?? '';
    const id = quellen['/innolab/methoden/ideation'] ?? '';
    const t3 = quellen['/innolab/tag-3'] ?? '';
    const pfad = "{ t: 'Ziel-Chance', sub: 'was ihr lösen wollt' },";
    expect([hmw, t3].map((x) => x.includes(pfad) && x.includes("{ t: 'Value Map & Fit', sub: 'eine ausarbeiten und prüfen' },"))).toStrictEqual([true, true]);
    expect(hmw).toContain('<p data-schritt><strong>Mit dieser Frage geht ihr in die Ideation:</strong> Sie steht oben in eurer Spalte, ihr und die zwei anderen sammelt Ideen dazu.</p>');
    expect(id).toContain('<strong>Die Frage öffnet, die Ziel-Chance entscheidet:</strong> Gesammelt wird zur Frage, aussortiert und gewählt an der Ziel-Chance.');
    expect(id).toContain('erst Ziel-Chance, Frage und Situation lesen, dann Ideen-Stickies an die Frage legen');
    expect([hmw, id].flatMap((x) => x.match(/Alle Ideen dort beantworten sie|Beantwortet:/g) ?? [])).toStrictEqual([]);
    const ni = NOTIZEN['/innolab/methoden/ideation'] ?? {};
    expect([id, JSON.stringify(ni)].flatMap((x) => x.match(/reihum/gi) ?? [])).toStrictEqual([]);
    const vorgehen = id.slice(id.indexOf('id="vorgehen"'), id.indexOf('</ol>', id.indexOf('id="vorgehen"')));
    const timer = [...vorgehen.matchAll(/<Timer minuten=\{(\d+)\} \/>/g)].reduce((a, m) => a + Number(m[1]), 0);
    expect(vorgehen).toContain(`So geht ihr vor (${timer} min)</h2>`);
    expect(uebungMinuten(ni.vorgehen?.uebung?.dauer)).toBe(timer);
    const zc = quellen['/innolab/methoden/ziel-chance'] ?? '';
    const pl = METHODEN.find((m) => m.slug === 'ziel-chance')!.pruefliste!.map((p) => p.text).join(' ');
    expect([zc, JSON.stringify(NOTIZEN['/innolab/methoden/ziel-chance'] ?? {}), pl].flatMap((x) => x.match(/tragend|die sie trägt|Wahl trägt/gi) ?? [])).toStrictEqual([]);
    expect(zc).toContain('- Ausschlaggebend: [Linse – ein Satz]\n- Spricht dagegen: [Linse – ein Satz]');
  });
  // Entscheidungen 50–52 (21.11.): varianten mit Gegenüber und Probe, analogien als Tabelle (Problem · wer löst es · Idee),
  // beispiel mit Link zur Kaffeebar-Spalte; ein Wort für die Unterscheidung: „Art“.
  it('Tag 3: ideation varianten, analogien, beispiel – Probe, Tabelle, Miro-Link, „Art“', () => {
    const q = quellen['/innolab/methoden/ideation'] ?? '';
    const n = JSON.stringify(NOTIZEN['/innolab/methoden/ideation'] ?? {});
    const folie = (id: string) => { const a = q.indexOf(`id="${id}"`); return q.slice(a, q.indexOf('</Folie>', a)); };
    expect(folie('varianten')).toContain('<p class="breit" data-schritt><strong>Probe:</strong> Löst jede der drei die Ziel-Chance auf einem anderen Weg?</p>');
    expect(folie('varianten')).toContain('<Callout type="warn" title="Eine Idee, drei Formen">');
    const an = folie('analogien');
    expect(an).toContain('<thead><tr><th>Problem</th><th>Wer löst so etwas schon?</th><th>Idee für uns</th></tr></thead>');
    expect(an).toContain('<td data-schritt>Flughafen: Wartezeit an der Sicherheitskontrolle</td>');
    expect([q, n].flatMap((x) => x.match(/Boarding-Gruppen nach Abflugzeit|passt weniger genau|Policen vergleichen|Vergleich von Policen|aus einer anderen Kategorie/g) ?? [])).toStrictEqual([]);
    expect(an.slice(0, an.indexOf('nur-handout')).match(/Who else|18 Ideen/g) ?? []).toStrictEqual([]);
    expect(folie('beispiel')).toContain('<MiroLink name="T3 · 3 · Ideation">T3 · 3 · Ideation, Spalte Kaffeebar</MiroLink>');
    expect(MIRO_FRAMES['T3 · 3 · Ideation']).toBeTruthy();
  });
  // Entscheidung 56 (21.11.): Die Idee von Tag 1 steht auf dem Beamer – ein Sticky unter vielen, ohne Vorsprung.
  it('Tag 3: ideation#vorgehen – Idee von Tag 1 als ein Sticky, ohne Vorsprung', () => {
    const q = quellen['/innolab/methoden/ideation'] ?? '';
    const a = q.indexOf('id="vorgehen"');
    const schritte = q.slice(a, q.indexOf('</ol>', a));
    expect(schritte).toContain('Eure Idee von Tag 1 darf als ein Sticky dazu – ohne Vorsprung.');
    expect(NOTIZEN['/innolab/methoden/ideation']?.vorgehen?.live).toContain('Idee von Tag 1: ein Sticky unter vielen, kein Vorsprung.');
  });
  // Entscheidungen 57, 75 und 76 (21.11.): Fit prüfen in drei Schritten. `fit` = das Verfahren mit je einem Zettel, `fit-kaffeebar`
  // = Schritt 1 (links), `fit-kaffeebar-rechts` = Schritt 2 und 3. Reihenfolge: beispiel → value-map → vom-satz → produkt-wirkung →
  // fit → fit-kaffeebar → fit-kaffeebar-rechts → vorgehen; drei-fits nur noch im Handout von uebertrag.
  it('Tag 3: value-map – Fit in drei Folien, Reihenfolge, Schrittnamen gleich, J4 im Miro-Wortlaut', () => {
    const q = quellen['/innolab/methoden/value-map'] ?? '';
    const ids = [...q.matchAll(/<h2 id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids).toStrictEqual(['beispiel', 'value-map', 'vom-satz', 'produkt-wirkung', 'fit', 'fit-kaffeebar', 'fit-kaffeebar-rechts', 'vorgehen', 'vorlage', 'pruefen', 'uebertrag']);
    const folie = (id: string) => { const a = q.indexOf(`id="${id}"`); return q.slice(a, q.indexOf('<div class="nur-handout">', a)); };
    const fit = folie('fit');
    expect(fit).toContain('<p class="folie-satz">Erst links, dann rechts, dann von oben lesen.</p>');
    expect([...fit.matchAll(/<tr data-schritt><td><strong>([^<]+)<\/strong>/g)].map((m) => m[1])).toStrictEqual(['1 Links, Zettel für Zettel:', '2 Rechts, was übrig ist:', '3 Von oben lesen:']);
    expect(fit).toContain('<p class="small vm-fit-fuss">✓ trifft · ✗ trifft nicht · ? wissen wir nicht.');
    // 21.11.: Der Punkt „Links, das Quadrat“ sagt, dass jeder Zettel geprüft wird, auch die Produkte (Abbildung S. 109: Haken auch
    // an den gelben Produkten). Welche ID ein Produkt bekommt, zeigt fit-kaffeebar; wer nichts trifft, wird gestrichen – auch ein
    // Produkt. Im Punkt statt in Schritt 1, weil die Tabellenspalte sonst über 1280 × 720 hinausläuft.
    expect(fit).toContain('<li><strong>Links, das Quadrat:</strong> eure Value Map. Geprüft wird jeder Zettel, auch die Produkte. ✓ heißt:');
    expect(fit.match(/Produkte nur, wenn|sie treffen Jobs/g) ?? []).toStrictEqual([]);
    // Code-Review 21.11.: J4 ist halb getroffen (Anstehen über P2) – darum „?“; höchstes ✗ wie auf fit-kaffeebar-rechts.
    expect(fit).toContain('<td>Kein Zettel links nennt G2; J4 nur halb (Anstehen über P2) → ?</td>');
    expect(fit).toContain('Höchstes ✗: J2 und G2 – bewusst?');
    expect(fit.match(/Höchstes ✗: J2 – /g) ?? []).toStrictEqual([]);
    // Vorlage: die „?“ bleiben, wo sie stehen – keine Liste „Offene ?“.
    expect(q).toContain('## „?“ – wo sie stehen: am Satz (T3 · 4) und am Zettel (Canvas)');
    expect(q.match(/Offene „\?“/g) ?? []).toStrictEqual([]);
    expect(q.match(/Leitfragen zu den drei Feldern liegen in T3 · 4/g) ?? []).toStrictEqual([]);
    const fk = folie('fit-kaffeebar');
    expect(fk).toContain('<p class="folie-satz">Schritt 1: links, Zettel für Zettel.</p>');
    expect(fk).toContain('<thead><tr><th>Feld</th><th>Zettel (links)</th><th>trifft</th><th>Zeichen</th></tr></thead>');
    expect(fk.match(/<tr data-schritt>/g) ?? []).toHaveLength(7);
    expect(fk).toContain('<tr data-schritt><td>Gegenprobe (Kurs-Beispiel)</td><td>Treuepunkte ab der zehnten Bestellung</td><td>nichts</td><td>kein ✓</td></tr>');
    expect(fk).toContain('<td>Pain Reliever</td><td>Statt anzustehen: in 20 Sekunden im Gehen bestellen</td>');
    expect(fk).toContain('<p class="breit" data-schritt><strong>Trifft ein Zettel nichts:</strong> kein ✓ – streichen oder umformulieren. Ein ✗ gibt es links nicht.</p>');
    const fr = folie('fit-kaffeebar-rechts');
    expect(fr).toContain('id="fit-kaffeebar-rechts">Fit prüfen: die Kaffeebar, rechts</h2>');
    expect(fr).toContain('<thead><tr><th>Eintrag (rechts)</th><th>getroffen von</th><th>Zeichen</th><th>warum</th></tr></thead>');
    expect(fr).toContain('<p class="small">Selbstkontrolle: Rechts trägt jeder Zettel genau ein Zeichen. Links hat jeder ✓ eine ID.</p>');
    // Dieselben drei Schrittnamen auf fit, den beiden Kaffeebar-Folien und in vorgehen Schritt 4.
    for (const name of ['1 Links, Zettel für Zettel:', '2 Rechts, was übrig ist:', '3 Von oben lesen:']) expect(fk + fr, name).toContain(`<strong>${name}</strong>`);
    expect(q).toContain('<strong>Skalen – Fit prüfen:</strong> Links, Zettel für Zettel: ✓ auf den Zettel und auf den Eintrag, den er trifft. Rechts, was übrig ist: ✗ oder ? mit Frage. Von oben lesen.');
    // J4 im Wortlaut von Miro, auf Folie und im Handout; die alte Frage nirgends.
    expect(fr).toContain('<td>J4 Anstehen und bezahlen</td><td>Anstehen: P2-Zettel · Bezahlen: offen</td><td>?</td><td>Zahlen sie lieber bar an der Ausgabe – oder vorher online?</td>');
    expect(q).toContain('ob Pendler*innen lieber bar an der Ausgabe zahlen oder vorher online, wissen wir nicht.');
    const n = NOTIZEN['/innolab/methoden/value-map'] ?? {};
    expect([q, JSON.stringify(n)].flatMap((x) => x.match(/im Gehen im Browser|Bezahlen sie im Gehen/g) ?? [])).toStrictEqual([]);
    expect(n['fit-kaffeebar']?.live.some((l) => l.startsWith('Wenn hinten:'))).toBe(true);
    expect(n['fit-kaffeebar-rechts']?.live.some((l) => l.startsWith('Wenn hinten:'))).toBe(true);
    for (const k of ['fit', 'fit-kaffeebar', 'fit-kaffeebar-rechts']) expect(n[k]?.live.length ?? 0, k).toBeLessThanOrEqual(5);
    // Schaufenster (Entscheidung 76.3).
    expect(q).toContain('<li data-schritt><strong>Gelb:</strong> was ihr anbietet – was im Schaufenster läge.</li>');
    expect(q).toContain('„existing value proposition“ (S. 99)');
    expect(n.beispiel?.ueberleitung).toBe('Spitzenreiter gewählt. Nur für ihn kommt jetzt die linke Hälfte.');
  });
  // Entscheidungen 58–61 (21.11.): Brücke vom Lückensatz zur Value Map, Lückensatz mit ID-Slots, korrigierte Kaffeebar-Sätze,
  // ideation#beispiel ohne „18 Ideen“ und ohne Express-Kasse.
  it('Tag 3: vom-satz, drei-fits im Handout, Lückensatz-Vorlage mit IDs, korrigierter Satz 3, keine „18 Ideen“', () => {
    const vm = quellen['/innolab/methoden/value-map'] ?? '';
    const id = quellen['/innolab/methoden/ideation'] ?? '';
    const a = vm.indexOf('id="vom-satz"');
    const vom = vm.slice(a, vm.indexOf('</Folie>', a));
    expect(vom).toContain('<p class="breit" data-schritt><strong>Der Satz ist der Anfang:</strong> ein Pain, ein Gain.');
    expect(vom).toContain('<tr data-schritt><td>… zeigt, ob der Kaffee vor der Abfahrt fertig ist (P1)</td><td>→ Pain Reliever</td>');
    expect(vm).toContain('<p class="small vm-legende">✓ trifft · ✗ trifft nicht · ? wissen wir nicht</p>');
    expect(vm).toContain('<h3 id="drei-fits">');
    expect(vm.match(/<h2 id="drei-fits"/g) ?? []).toStrictEqual([]);
    expect(vm).toContain('indem er die Frage erübrigt, ob es sich noch ausgeht (P1), und ihnen den Kaffee in die Hand gibt, bevor der Zug einfährt (G1) – anders als der Automat.');
    expect(vm).toContain('indem sie das Raten vor der Schlange beendet (P1) – anders als der Automat.');
    expect(vm.match(/dorthin bringt, wo sie warten|hilft …, indem/g) ?? []).toStrictEqual([]);
    expect(NOTIZEN['/innolab/methoden/value-map']?.['drei-fits']).toBeUndefined();
    expect(id).toContain('die <strong>[Job]</strong> wollen (J…), indem es <strong>[Pain]</strong> [verringert] (P…) und <strong>[Gain]</strong> [ermöglicht] (G…)');
    expect(id).toContain('(„G –“)');
    expect(id).toContain('<strong>Mit diesen drei Sätzen geht ihr in den nächsten Block:</strong>');
    expect([id, JSON.stringify(NOTIZEN['/innolab/methoden/ideation'] ?? {})].flatMap((x) => x.match(/18 Ideen|der 18\b|aus 18|Express-Kasse wie im Supermarkt/g) ?? [])).toStrictEqual([]);
  });
  // Entscheidungen 62 und 63 (21.11.): produkt-wirkung mit zwei Zetteln, die der Satz nicht nennt; der Ort der Lückensätze
  // (T3 · 3, Feld „Drei Ideen als Lückensätze“) steht auf den Folien, kopiert wird nach T3 · 4.
  it('Tag 3: produkt-wirkung mit zwei Zetteln, Ort der Lückensätze auf ideation und value-map', () => {
    const vm = quellen['/innolab/methoden/value-map'] ?? '';
    const id = quellen['/innolab/methoden/ideation'] ?? '';
    const a = vm.indexOf('id="produkt-wirkung"');
    const pw = vm.slice(a, vm.indexOf('</Folie>', a));
    expect(pw.match(/<li>/g) ?? []).toHaveLength(2);
    expect(pw).toContain('<li>Statt anzustehen: in 20 Sekunden im Gehen bestellen</li>');
    expect(pw).toContain('<strong>B:</strong> Pain Reliever (P2)');
    expect(pw).toContain('<strong>Die Probe:</strong>');
    // Wählen vergleicht gegen dieselben fünf Einträge wie `beispiel` und Miro (J1, P1, P2, P3, G1).
    expect(vm).toContain('drei Lückensätze aus T3 · 3 auf die Stickies; je Satz ✓ ✗ ? zu den obersten Einträgen eures Profils (Kaffeebar: J1, P1, P2, P3, G1);');
    expect(vm).toContain('<thead><tr><th>Idee</th><th>J1 Kaffee besorgen</th><th>P1 ausgehen?</th><th>P2 Schlange</th><th>P3 wann fertig?</th><th>G1 vor dem Zug</th></tr></thead>');
    expect(id).toContain('<li data-schritt><strong>Lückensätze:</strong> je Idee einer, ins Feld „Drei Ideen als Lückensätze“ eurer Spalte – J-, P-, G-ID aus eurem Canvas.');
    expect(id).toContain('<Prompt label="Vorlage · eure Spalte in T3 · 3, Feld ‚Drei Ideen als Lückensätze‘">');
  });
  // Code-Review 21.11.: Abschluss-Checkliste mit dem Ideen-Vergleich in T3 · 4; Methodenkarte zeigt den zweiten Miro-Ort.
  it('Tag 3: Checkliste mit Ideen-Vergleich (T3 · 4), Methodenkarte mit miroAuch', () => {
    const q = quellen['/innolab/tag-3'] ?? '';
    expect(q).toContain('<Checklist id="il-tag3-abschluss-v6"');
    expect(q).toContain("'Ideen-Vergleich mit seinen „?“ im Feld „Ideen vergleichen und wählen“ (T3 · 4); die „?“ aus dem Fit am Zettel in eurem Canvas',");
    const karte = readFileSync('src/components/MethodenKarte.astro', 'utf8');
    expect(karte).toContain('{a.miroAuch && <> · Feld „{a.miroAuch.feld}“ im Frame „{a.miroAuch.frame}“</>}');
  });
});
