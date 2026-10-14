import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { BEREICHE, NAV, bereichVon, nachbarn, type Bereich } from './navigation';

const seiten = fileURLToPath(new URL('../pages/', import.meta.url));
const seiteExistiert = (href: string) =>
  href === '/' ? existsSync(`${seiten}index.astro`) : existsSync(`${seiten}${href.slice(1)}.astro`) || existsSync(`${seiten}${href.slice(1)}/index.astro`);

describe('bereichVon', () => {
  it('ordnet /innolab und alles darunter dem Innolab zu', () => {
    expect(bereichVon('/innolab')).toBe('innolab');
    expect(bereichVon('/innolab/')).toBe('innolab');
    expect(bereichVon('/innolab/methoden')).toBe('innolab');
  });

  it('lässt alles andere beim Coding-Kurs – auch Pfade, die nur ähnlich beginnen', () => {
    expect(bereichVon('/')).toBe('coding');
    expect(bereichVon('/tag-1')).toBe('coding');
    expect(bereichVon('/konzepte/linear')).toBe('coding');
    expect(bereichVon('/innolabor')).toBe('coding');
  });
});

describe('NAV', () => {
  for (const b of Object.keys(NAV) as Bereich[]) {
    const hrefs = NAV[b].flatMap((g) => g.items.map((i) => i.href));

    it(`${b}: jeder Menüpunkt führt auf eine vorhandene Seite`, () => {
      for (const h of hrefs) expect(seiteExistiert(h), h).toBe(true);
    });

    it(`${b}: kein Menüpunkt doppelt, und alle gehören zu diesem Kurs`, () => {
      expect(new Set(hrefs).size).toBe(hrefs.length);
      for (const h of hrefs) expect(bereichVon(h), h).toBe(b);
    });

    it(`${b}: die Startseite steht im Menü`, () => {
      expect(hrefs).toContain(BEREICHE[b].start);
    });
  }
});

describe('nachbarn', () => {
  it('blättert nicht vom letzten Coding-Punkt ins Innolab und nicht vom Innolab zurück', () => {
    const letzte = NAV.coding.flatMap((g) => g.items).at(-1)!.href;
    expect(nachbarn(letzte).danach).toBeUndefined();
    expect(nachbarn('/innolab').vorher).toBeUndefined();
  });

  it('kennt Vorgänger und Nachfolger innerhalb eines Kurses', () => {
    expect(nachbarn('/setup')).toEqual({ vorher: { href: '/', t: 'Übersicht' }, danach: { href: '/hilfe', t: 'Hilfe holen' } });
  });

  it('gibt für Seiten außerhalb des Menüs nichts zurück', () => {
    expect(nachbarn('/praesentator')).toEqual({ vorher: undefined, danach: undefined });
  });
});
