import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { gedrueckt, speicherOs, startZustand, waehle, waehleOs, zeigeBlock } from './umgebung.js';

const MAC_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/141.0 Safari/537.36';
const WIN_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/141.0 Safari/537.36';
const leer = { query: null, gespeichert: null, alt: null, userAgent: MAC_UA };

describe('startZustand', () => {
  it('ohne alles: Laptop, OS aus dem Browser', () => {
    expect(startZustand(leer)).toStrictEqual({ umgebung: 'lokal', os: 'mac' });
    expect(startZustand({ ...leer, userAgent: WIN_UA })).toStrictEqual({ umgebung: 'lokal', os: 'windows' });
  });

  it('gespeicherte Wahl gilt', () => {
    expect(startZustand({ ...leer, gespeichert: 'windows' })).toStrictEqual({ umgebung: 'lokal', os: 'windows' });
    expect(startZustand({ ...leer, gespeichert: 'mac', userAgent: WIN_UA })).toStrictEqual({ umgebung: 'lokal', os: 'mac' });
    expect(startZustand({ ...leer, gespeichert: 'codespace', userAgent: WIN_UA })).toStrictEqual({ umgebung: 'codespace', os: 'windows' });
  });

  it('alter Schlüssel ndu-os: das OS übernehmen', () => {
    expect(startZustand({ ...leer, alt: 'windows' })).toStrictEqual({ umgebung: 'lokal', os: 'windows' });
    expect(startZustand({ ...leer, alt: 'mac', userAgent: WIN_UA })).toStrictEqual({ umgebung: 'lokal', os: 'mac' });
  });

  it('?umgebung= schlägt die gespeicherte Wahl', () => {
    expect(startZustand({ ...leer, query: 'mac', gespeichert: 'codespace' })).toStrictEqual({ umgebung: 'lokal', os: 'mac' });
    expect(startZustand({ ...leer, query: 'codespace', gespeichert: 'windows', alt: 'windows' })).toStrictEqual({ umgebung: 'codespace', os: 'windows' });
  });

  it('ungültige Werte werden ignoriert', () => {
    expect(startZustand({ ...leer, query: 'linux', gespeichert: 'lokal', alt: 'amiga' })).toStrictEqual({ umgebung: 'lokal', os: 'mac' });
  });
});

describe('waehle und gedrueckt', () => {
  const lokalWin = { umgebung: 'lokal', os: 'windows' } as const;

  it('Codespace behält das OS, Laptop-Knöpfe setzen beides', () => {
    expect(waehle(lokalWin, 'codespace')).toStrictEqual({ umgebung: 'codespace', os: 'windows' });
    expect(waehle(lokalWin, 'mac')).toStrictEqual({ umgebung: 'lokal', os: 'mac' });
  });

  it('genau ein Knopf ist gedrückt', () => {
    const knoepfe = ['codespace', 'mac', 'windows'] as const;
    expect(knoepfe.filter((w) => gedrueckt(lokalWin, w))).toStrictEqual(['windows']);
    expect(knoepfe.filter((w) => gedrueckt({ umgebung: 'codespace', os: 'windows' }, w))).toStrictEqual(['codespace']);
  });
});

describe('Nur-OS-Umschalter (Setup, Abschnitt lokal)', () => {
  it('ändert nur das OS – eine Codespace-Wahl bleibt', () => {
    expect(waehleOs({ umgebung: 'codespace', os: 'mac' }, 'windows')).toStrictEqual({ umgebung: 'codespace', os: 'windows' });
    expect(waehleOs({ umgebung: 'lokal', os: 'mac' }, 'windows')).toStrictEqual({ umgebung: 'lokal', os: 'windows' });
  });

  it('speichert im Codespace nur das OS, im Laptop-Modus die Wahl', () => {
    expect(speicherOs({ umgebung: 'codespace', os: 'mac' }, 'windows')).toStrictEqual({ schluessel: 'ndu-os', wert: 'windows' });
    expect(speicherOs({ umgebung: 'lokal', os: 'mac' }, 'windows')).toStrictEqual({ schluessel: 'ndu-umgebung', wert: 'windows' });
  });

  it('nach dem Neuladen gilt im Codespace das gespeicherte OS', () => {
    expect(startZustand({ query: null, gespeichert: 'codespace', alt: 'windows', userAgent: 'Macintosh' })).toStrictEqual({ umgebung: 'codespace', os: 'windows' });
  });
});

describe('zeigeBlock (Anker in einen ausgeblendeten Teil)', () => {
  const cs = { umgebung: 'codespace', os: 'windows' } as const;

  it('codespace/lokal schalten die Umgebung, mac/windows nur das OS', () => {
    expect(zeigeBlock(cs, 'lokal')).toStrictEqual({ umgebung: 'lokal', os: 'windows' });
    expect(zeigeBlock(cs, 'mac')).toStrictEqual({ umgebung: 'codespace', os: 'mac' });
    expect(zeigeBlock({ umgebung: 'lokal', os: 'mac' }, 'codespace')).toStrictEqual({ umgebung: 'codespace', os: 'mac' });
  });

  it('unbekannter Wert ändert nichts', () => {
    expect(zeigeBlock(cs, 'linux')).toBe(cs);
  });
});

describe('UmgebungWahl.astro', () => {
  const quelle = readFileSync(new URL('./UmgebungWahl.astro', import.meta.url), 'utf8');

  it('bettet genau diese Datei ein, statt die Logik zu kopieren', () => {
    expect(quelle).toContain("import logik from './umgebung.js?raw'");
    expect(quelle).toContain('set:html={logikSkript}');
  });

  it('die eingebettete Logik läuft als klassisches Skript und gibt dieselben Antworten', () => {
    const roh = readFileSync(new URL('./umgebung.js', import.meta.url), 'utf8');
    const klassisch = roh.replace(/^export /gm, '');
    expect(klassisch).not.toMatch(/^\s*(export|import)\b/m);
    // Die Rückgabezeile genau so aus UmgebungWahl.astro nehmen: Fehlt dort eine Funktion, wirft schon dieser Aufruf.
    const rueckgabe = quelle.match(/^return \{.*\};$/m)?.[0];
    expect(rueckgabe).toBeDefined();
    let u: Record<string, any> = {};
    expect(() => { u = new Function(`${klassisch}\n${rueckgabe}`)(); }).not.toThrow();
    expect(Object.values(u).every((f) => typeof f === 'function')).toBe(true);
    expect(u.startZustand({ ...leer, query: 'windows' })).toStrictEqual({ umgebung: 'lokal', os: 'windows' });
    expect(u.zeigeBlock({ umgebung: 'lokal', os: 'mac' }, 'codespace')).toStrictEqual({ umgebung: 'codespace', os: 'mac' });
  });
});
