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

describe('Werkstatt im Innolab-Menü', () => {
  it('führt zu „Meine Mappe“, „Claude verbinden“ und dem Datenschutzhinweis, nach den Kurstagen (das Blättern durch Tag 1–7 bleibt gleich)', () => {
    const gruppe = NAV.innolab.find((g) => g.h === 'Werkstatt');
    expect(gruppe?.items).toStrictEqual([
      { href: '/innolab/mappe', t: 'Meine Mappe' },
      { href: '/innolab/werkstatt/claude', t: 'Claude verbinden' },
      { href: '/innolab/werkstatt/interview-datenschutz', t: 'Datenschutz für Interviewte' },
    ]);
    expect(NAV.innolab.at(-1)).toBe(gruppe);
  });
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

  it('verträgt Schrägstriche am Ende wie bereichVon', () => {
    expect(nachbarn('/setup/')).toEqual(nachbarn('/setup'));
    expect(nachbarn('/innolab//').danach).toEqual({ href: '/innolab/methoden', t: 'Toolbox: alle Methoden' });
  });

  it('gibt für Seiten außerhalb des Menüs nichts zurück', () => {
    expect(nachbarn('/praesentator')).toEqual({ vorher: undefined, danach: undefined });
  });
});
