import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { aufloesungKennung, aufloesungSteuerung, type AufloesungBox } from './aufloesung';
import { kennungPruefen } from '../lib/aufgedeckt';

const box = (kennung: string, gruppe?: string) => ({ kennung, gruppe, oeffnen: vi.fn<() => void>() }) satisfies AufloesungBox;

describe('aufloesungKennung', () => {
  it('Gruppe global, sonst Seite + Knopftext (ohne Schrägstrich am Ende)', () => {
    expect(aufloesungKennung('/innolab/methoden/interview/', 'mom-test', 'Prompt öffnen')).toBe('mom-test');
    expect(aufloesungKennung('/innolab/methoden/scrum/', undefined, 'Auflösung zeigen')).toBe('/innolab/methoden/scrum:Auflösung zeigen');
    expect(aufloesungKennung('/innolab/methoden/scrum', undefined, 'Auflösung zeigen')).toBe('/innolab/methoden/scrum:Auflösung zeigen');
    expect(aufloesungKennung('/', undefined, 'Zeigen')).toBe('/:Zeigen');
    // Dieselbe Normalform wie der Server (kennungPruefen): ohne Leerraum am Rand.
    expect(aufloesungKennung('/s', ' toast ', 'x')).toBe(kennungPruefen(' toast '));
    expect(aufloesungKennung('/s', undefined, 'Zeigen ')).toBe(kennungPruefen('/s:Zeigen '));
  });
});

describe('aufloesungSteuerung', () => {
  it('Beamer (Klick oder Pfeiltaste): meldet genau einmal und öffnet die ganze Gruppe', () => {
    const [a, b, c] = [box('mom-test', 'mom-test'), box('mom-test', 'mom-test'), box('toast', 'toast')];
    const melden = vi.fn();
    aufloesungSteuerung([a, b, c], melden).knopf(a, 'beamer');
    expect(melden.mock.calls).toStrictEqual([['mom-test']]);
    expect([a, b, c].map((x) => x.oeffnen.mock.calls.length)).toStrictEqual([1, 1, 0]);
  });
  it('Präsentator außerhalb des Beamers: Gruppe nur hier, keine Meldung', () => {
    const [a, b] = [box('mom-test', 'mom-test'), box('mom-test', 'mom-test')];
    const melden = vi.fn();
    aufloesungSteuerung([a, b], melden).knopf(a, 'praesentator');
    expect(melden).not.toHaveBeenCalled();
    expect([a, b].map((x) => x.oeffnen.mock.calls.length)).toStrictEqual([1, 1]);
  });
  it('Studierende: ein Klick öffnet nur diese Box und meldet nichts', () => {
    const [a, b] = [box('mom-test', 'mom-test'), box('mom-test', 'mom-test')];
    const melden = vi.fn();
    aufloesungSteuerung([a, b], melden).knopf(b, 'studi');
    expect(melden).not.toHaveBeenCalled();
    expect([a, b].map((x) => x.oeffnen.mock.calls.length)).toStrictEqual([0, 1]);
  });
  it('aufgedeckt: jede Box mit der Kennung samt Gruppe; Uhrzeit: die Gruppe', () => {
    const [a, b, c, d] = [box('/s:Zeigen'), box('/s:Zeigen'), box('toast', 'toast'), box('toast', 'toast')];
    const s = aufloesungSteuerung([a, b, c, d], vi.fn());
    s.aufgedeckt('/s:Zeigen');
    expect([a, b, c, d].map((x) => x.oeffnen.mock.calls.length)).toStrictEqual([1, 1, 0, 0]);
    s.uhr(d);
    expect([a, b, c, d].map((x) => x.oeffnen.mock.calls.length)).toStrictEqual([1, 1, 1, 1]);
  });
});

// Ohne Gruppe ist die Kennung Seite + Knopftext: Zwei solche Auflösungen mit demselben Knopf auf einer Seite gingen beim
// Aufdecken zusammen auf. Der Standardtext zählt mit.
const seiten = import.meta.glob('../pages/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
describe('Kennungen der Seiten', () => {
  it('keine Seite hat zwei Auflösungen ohne Gruppe mit demselben Knopftext', () => {
    const standard = readFileSync(new URL('./Aufloesung.astro', import.meta.url), 'utf8').match(/knopf = '([^']+)'/)?.[1];
    expect(standard).toBe('Auflösung zeigen');
    const doppelt: string[] = [];
    let ohneGruppe = 0;
    for (const [pfad, quelle] of Object.entries(seiten)) {
      const knoepfe = [...quelle.matchAll(/<Aufloesung\b([^>]*)>/g)]
        .map(([, attr]) => attr)
        .filter((attr) => !/\bgruppe=/.test(attr))
        .map((attr) => attr.match(/\bknopf=(?:"([^"]*)"|\{([^}]*)\})/)?.slice(1).find((x) => x !== undefined) ?? standard);
      ohneGruppe += knoepfe.length;
      for (const k of new Set(knoepfe)) if (knoepfe.filter((x) => x === k).length > 1) doppelt.push(`${pfad}: ${k}`);
    }
    expect(ohneGruppe).toBeGreaterThan(0);
    expect(doppelt).toStrictEqual([]);
  });
});

// Eine Gruppe öffnet sich beim Aufdecken für alle zugleich. Über zwei Folien hinweg verriete sie die Pointe einer späteren
// Übung – erlaubt nur, wo es gewollt ist: Toast (Video + Erklärung auf der Folgefolie) und MOM_TEST_GRUPPE (letzte
// Mom-Test-Übung „ausgraben“ + Material im Handout, das nicht auf einer Folie steht).
const GRUPPE_UEBER_FOLIEN: Record<string, string[]> = {
  '../pages/innolab/tag-1.astro': ['toast'],
  '../pages/innolab/methoden/interview.astro': ['{MOM_TEST_GRUPPE}'],
};
/** Gruppen einer Seite → in welchen Folien (Index, -1 = außerhalb) ihre Auflösungen stehen. */
function gruppenOrte(quelle: string): Map<string, Set<number>> {
  const folien = [...quelle.matchAll(/<Folie\b[^>]*>[\s\S]*?<\/Folie>/g)].map((m) => [m.index, m.index + m[0].length]);
  const orte = new Map<string, Set<number>>();
  for (const m of quelle.matchAll(/<Aufloesung\b([^>]*)>/g)) {
    const g = m[1].match(/\bgruppe=(?:"([^"]*)"|(\{[^}]*\}))/);
    if (!g) continue;
    const name = g[1] ?? g[2];
    const ort = folien.findIndex(([a, e]) => m.index > a && m.index < e);
    orte.set(name, (orte.get(name) ?? new Set()).add(ort));
  }
  return orte;
}
describe('Gruppen der Seiten', () => {
  it('jede Gruppe bleibt in einer Folie, außer den gewollten', () => {
    const quer = Object.entries(seiten).flatMap(([pfad, quelle]) =>
      [...gruppenOrte(quelle)].filter(([g, orte]) => orte.size > 1 && !GRUPPE_UEBER_FOLIEN[pfad]?.includes(g)).map(([g]) => `${pfad}: ${g}`));
    expect(quer).toStrictEqual([]);
    // Die Ausnahmen gibt es wirklich (sonst prüfte die Liste nichts mehr).
    for (const [pfad, gruppen] of Object.entries(GRUPPE_UEBER_FOLIEN)) for (const g of gruppen) expect(gruppenOrte(seiten[pfad]).get(g)?.size, `${pfad}: ${g}`).toBeGreaterThan(1);
  });
  it('MOM_TEST_GRUPPE: nur die letzte Übung („ausgraben“) und Editor, Prompt, Prüfliste', () => {
    const iv = seiten['../pages/innolab/methoden/interview.astro'];
    const boxen = [...iv.matchAll(/<h2 id="([^"]+)"|<Aufloesung\b([^>]*)>/g)].reduce<{ bei: string; in: string[] }>((s, m) => {
      if (m[1]) s.bei = m[1];
      else if (m[2].includes('gruppe={MOM_TEST_GRUPPE}')) s.in.push(s.bei);
      return s;
    }, { bei: '', in: [] }).in;
    expect(boxen).toStrictEqual(['ausgraben', 'vorlage', 'probe', 'pruefen']);
  });
});
