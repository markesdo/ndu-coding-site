// Prüfung aller Miro-Verweise (28.11.2026, nach dem Umnummerieren der Tag-4-Frames): alte Namen weg, jeder genannte Frame
// bekannt, keine fest eingetragene Board-Adresse, und die sichtbare Beschriftung eines Links passt zum Frame dahinter.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
// @ts-ignore – Skript ohne Typen; die Zuordnung steht nur dort, damit dieser Test die alten Namen nicht selbst enthält.
import { ALT_NEU, KURZFORMEN, umnummerieren } from '../../scripts/t4-frames-umnummerieren.mjs';
import { ARTEFAKTE } from '../components/methoden';
import { MIRO_FRAMES } from '../components/miro-frames';
import { NOTIZEN } from '../data/begleiter';

const SRC = fileURLToPath(new URL('..', import.meta.url));
const dateien = (d: string): string[] => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? dateien(p) : /\.(astro|ts|tsx|css|md|json|js|mjs)$/.test(n) ? [p] : [];
});
const QUELLEN = dateien(SRC).map((p) => ({ p: relative(SRC, p), text: readFileSync(p, 'utf8') }));
const SEITEN = QUELLEN.filter(({ p }) => p.startsWith('pages/'));

const bekannt = (n: string) => Object.hasOwn(MIRO_FRAMES, n) || Object.hasOwn(MIRO_FRAMES, n.replace(/Produkt n$/, 'Produkt 1'));
const ALT = [...(ALT_NEU as [string, string][]), ...(KURZFORMEN as [string, string][])].map(([alt]) => alt);
const NEU = (ALT_NEU as [string, string][]).map(([, neu]) => neu);

/** Fundstellen alter Frame-Namen in den Quellen (&amp; wie &). Ein „T4 · 0“ gibt es nach dem Umnummerieren gar nicht mehr. */
export function alteNamen(quellen: { p: string; text: string }[]): string[] {
  return quellen.flatMap(({ p, text: roh }) => {
    const text = roh.replaceAll('&amp;', '&');
    const treffer = ALT.filter((a) => text.includes(a));
    if (/T4 · 0(?!\d)/.test(text)) treffer.push('T4 · 0');
    return treffer.map((a) => `${p}: ${a}`);
  });
}

// Themenwörter: Steht eins in der Beschriftung, muss der Frame es auch im Namen tragen.
const THEMEN = ['Concept Story', 'Geschäftsmodell', 'Annahmen der Idee', 'Story Map', 'Warm-up', 'Usage Story', 'Prototyp', 'Scrum',
  'Origin Story', 'Lernkarten', 'Canvas', 'Ideation', 'Value Map', 'Baum', 'Experience Map'];

/** MiroLinks, deren Beschriftung nicht zum Frame passt. vorher = sichtbarer Text vor dem Link (ohne Markup, bis 140 Zeichen), in
 *  dem eine Reihe wie „Anleitung Produkt 1 · 2 · 3“ ihr gemeinsames Wort trägt. */
export function falscheBeschriftung(links: { name: string; text: string; vorher: string }[]): string[] {
  const fehler: string[] = [];
  for (const { name, text, vorher } of links) {
    const f = (grund: string) => fehler.push(`${name} ← „${text}“: ${grund}`);
    const zahl = /^(?:Produkt )?(\d)$/.exec(text.trim())?.[1];
    const produkt = /[·-] Produkt (\d)$/.exec(name)?.[1];
    if (zahl && produkt !== zahl) f(`Beschriftung Produkt ${zahl}, Frame ${produkt ? `Produkt ${produkt}` : 'ohne Produkt'}`);
    if (produkt && !text.includes(produkt)) f(`Frame Produkt ${produkt}, Beschriftung ohne ${produkt}`);
    if (/Anleitung/.test(text) && !/Anleitung/.test(name)) f('Beschriftung Anleitung, Frame keine Anleitung');
    if (/Anleitung/.test(name) && !/Anleitung/.test(text + vorher)) f('Frame ist eine Anleitung, Beschriftung sagt es nicht');
    // Ein geteilter Frame mit Spalte Kaffeebar („T3 · 3 · Ideation, Spalte Kaffeebar“) nennt den Frame selbst.
    if (/Kaffeebar/.test(text) && !/Kaffeebar/.test(name) && !text.includes(name)) f('Beschriftung Kaffeebar, Frame nicht');
    if (/(Beispiel|[·-]) Kaffeebar$/.test(name) && !/Kaffeebar/.test(text)) f('Frame Kaffeebar, Beschriftung nicht');
    if (/Lösung/.test(text) !== /Lösung/.test(name)) f('Lösung nur auf einer Seite');
    for (const t of THEMEN) if (text.includes(t) && !name.includes(t)) f(`Beschriftung ${t}, Frame nicht`);
  }
  return fehler;
}

const LINKS = SEITEN.flatMap(({ p, text }) => [...text.matchAll(/<MiroLink name="([^"]+)">([^<]*)<\/MiroLink>/g)]
  .map((m) => ({ p, name: m[1], text: m[2], vorher: text.slice(Math.max(0, m.index! - 400), m.index).replace(/<[^>]+>/g, '').slice(-140) })));

describe('Tag-4-Frames umnummeriert', () => {
  it('kein alter Tag-4-Name mehr in src', () => {
    expect(QUELLEN.length).toBeGreaterThan(100);
    // Diese Datei selbst nicht: Ihre Wächter-Proben nennen alte Namen.
    expect(alteNamen(QUELLEN.filter(({ p }) => p !== 'lib/miro-links-pruefung.test.ts'))).toStrictEqual([]);
  });
  it('der Wächter findet einen alten Namen, und das Skript ersetzt ihn', () => {
    const name = (ALT_NEU as [string, string][]).find(([a]) => a.startsWith('T4 · 6 · '))![0];
    const alt = `„${name} · Produkt n“`;
    expect(alteNamen([{ p: 'x', text: alt }])).toStrictEqual([`x: ${name}`]);
    expect(alteNamen([{ p: 'x', text: umnummerieren(alt) }])).toStrictEqual([]);
  });
  it('der Wächter findet ein bloßes „T4 · 0“ und alte Namen mit &amp;', () => {
    expect(alteNamen([{ p: 'x', text: 'links neben „T4 · 0“' }])).toStrictEqual(['x: T4 · 0']);
    expect(alteNamen([{ p: 'x', text: 'T4 · 03 ist kein Frame' }])).toStrictEqual([]);
    const team = (ALT_NEU as [string, string][]).find(([a]) => a.includes('&'))![0];
    expect(alteNamen([{ p: 'x', text: team.replace('&', '&amp;') }])).toStrictEqual([`x: ${team}`]);
  });
  it('das Skript ist wiederholbar und verkettet nicht', () => {
    for (const alt of ALT) expect(umnummerieren(umnummerieren(alt)), alt).toBe(umnummerieren(alt));
    expect(umnummerieren('T4 · 0 · Concept Story')).toBe('T4 · 1 · Concept Story');
  });
  it('jeder neue Name hat in MIRO_FRAMES eine ID, und jeder Tag-4-Eintrag dort folgt der neuen Zuordnung', () => {
    for (const neu of NEU) {
      const ids = Object.entries(MIRO_FRAMES).filter(([k]) => k.startsWith(neu)).map(([, id]) => id);
      expect(ids.length, neu).toBeGreaterThan(0);
      for (const id of ids) expect(id, neu).toMatch(/^\d+$/);
    }
    for (const k of Object.keys(MIRO_FRAMES).filter((k) => k.startsWith('T4 · '))) expect(NEU.some((n) => k.startsWith(n)), k).toBe(true);
  });
});

describe('Miro-Verweise', () => {
  it('jeder Frame der Begleiter (miro.frame) und der Methoden-Artefakte (miro, miroAuch) steht in MIRO_FRAMES', () => {
    const namen = [
      ...Object.values(NOTIZEN).flatMap((s) => Object.values(s).map((n) => n.miro?.frame)),
      ...ARTEFAKTE.flatMap((a) => [a.miro, a.miroAuch?.frame]),
    ].filter((n): n is string => !!n);
    expect(namen.length).toBeGreaterThan(30);
    expect(namen.filter((n) => !bekannt(n))).toStrictEqual([]);
  });

  it('jeder Frame-Name in „…“ auf den Seiten und in den Begleitern steht in MIRO_FRAMES', () => {
    // miro-frames.ts selbst nicht: Ihre Kommentare nennen frühere Namen (z. B. „T3 · 5 · Annahmen der Idee“).
    const namen = QUELLEN.filter(({ p }) => /^(pages|data|components)\//.test(p) && !p.endsWith('.test.ts') && p !== 'components/miro-frames.ts')
      .flatMap(({ p, text }) => [...text.matchAll(/„((?:T\d · \d+ · |Baum · )[^“]+)“/g)].map((m) => ({ p, n: m[1].replaceAll('&amp;', '&') })));
    expect(namen.length).toBeGreaterThan(50);
    expect(namen.filter(({ n }) => !bekannt(n)).map(({ p, n }) => `${p}: ${n}`)).toStrictEqual([]);
  });

  it('keine fest eingetragene Board-Adresse und kein moveToWidget mit fremder ID in src', () => {
    const ids = new Set(Object.values(MIRO_FRAMES));
    const fest = QUELLEN.filter(({ p }) => !p.endsWith('.test.ts') && p !== 'lib/miro-board.ts')
      .flatMap(({ p, text }) => [...text.matchAll(/miro\.com\/app\/board\/[^\s"'`)]*|moveToWidget=(\d+)/g)]
        .filter((m) => !(m[1] && ids.has(m[1]))).map((m) => `${p}: ${m[0]}`));
    expect(fest).toStrictEqual([]);
  });

  it('die Beschriftung jedes MiroLinks passt zum Frame (Produkt n, Anleitung, Kaffeebar, Lösung)', () => {
    expect(LINKS.length).toBeGreaterThan(100);
    expect(falscheBeschriftung(LINKS)).toStrictEqual([]);
  });

  it('der Beschriftungs-Wächter erkennt vertauschte Links', () => {
    expect(falscheBeschriftung([
      { name: 'T4 · 8 · Origin Story · Produkt 2', text: '3', vorher: '' },
      { name: 'T4 · 8 · Origin Story · Kaffeebar', text: 'Anleitung', vorher: '' },
      { name: 'T4 · 8 · Anleitung Origin Story', text: 'Kaffeebar', vorher: '' },
      { name: 'T4 · 8 · Anleitung Lernkarten', text: 'Lernkarten', vorher: 'Anleitung auf Miro: ' },
      { name: 'T4 · 8 · Anleitung Lernkarten', text: 'Origin Story', vorher: 'Anleitung auf Miro: ' },
    ])).toStrictEqual([
      'T4 · 8 · Origin Story · Produkt 2 ← „3“: Beschriftung Produkt 3, Frame Produkt 2',
      'T4 · 8 · Origin Story · Produkt 2 ← „3“: Frame Produkt 2, Beschriftung ohne 2',
      'T4 · 8 · Origin Story · Kaffeebar ← „Anleitung“: Beschriftung Anleitung, Frame keine Anleitung',
      'T4 · 8 · Origin Story · Kaffeebar ← „Anleitung“: Frame Kaffeebar, Beschriftung nicht',
      'T4 · 8 · Anleitung Origin Story ← „Kaffeebar“: Frame ist eine Anleitung, Beschriftung sagt es nicht',
      'T4 · 8 · Anleitung Origin Story ← „Kaffeebar“: Beschriftung Kaffeebar, Frame nicht',
      'T4 · 8 · Anleitung Lernkarten ← „Origin Story“: Beschriftung Origin Story, Frame nicht',
    ]);
  });
});
