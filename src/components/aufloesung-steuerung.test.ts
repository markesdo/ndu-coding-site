import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { aufloesungKennung, aufloesungSteuerung, type AufloesungBox } from './aufloesung';

const box = (kennung: string, gruppe?: string) => ({ kennung, gruppe, oeffnen: vi.fn<() => void>() }) satisfies AufloesungBox;

describe('aufloesungKennung', () => {
  it('Gruppe global, sonst Seite + Knopftext (ohne Schrägstrich am Ende)', () => {
    expect(aufloesungKennung('/innolab/methoden/interview/', 'mom-test', 'Prompt öffnen')).toBe('mom-test');
    expect(aufloesungKennung('/innolab/methoden/scrum/', undefined, 'Auflösung zeigen')).toBe('/innolab/methoden/scrum:Auflösung zeigen');
    expect(aufloesungKennung('/innolab/methoden/scrum', undefined, 'Auflösung zeigen')).toBe('/innolab/methoden/scrum:Auflösung zeigen');
    expect(aufloesungKennung('/', undefined, 'Zeigen')).toBe('/:Zeigen');
  });
});

describe('aufloesungSteuerung', () => {
  it('Präsentator (Klick oder Pfeiltaste): meldet genau einmal und öffnet die ganze Gruppe', () => {
    const [a, b, c] = [box('mom-test', 'mom-test'), box('mom-test', 'mom-test'), box('toast', 'toast')];
    const melden = vi.fn();
    aufloesungSteuerung([a, b, c], melden).knopf(a, true);
    expect(melden.mock.calls).toStrictEqual([['mom-test']]);
    expect([a, b, c].map((x) => x.oeffnen.mock.calls.length)).toStrictEqual([1, 1, 0]);
  });
  it('Studierende: ein Klick öffnet nur diese Box und meldet nichts', () => {
    const [a, b] = [box('mom-test', 'mom-test'), box('mom-test', 'mom-test')];
    const melden = vi.fn();
    aufloesungSteuerung([a, b], melden).knopf(b, false);
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
