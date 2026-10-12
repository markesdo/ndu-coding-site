import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BUILD } from './build';
import { GET } from '../pages/version.json';
import { MAX_MS, PRUEF_MS, brauchtHinweis, naechstePruefung, versionAus, ziel } from './neu-laden';

describe('versionAus', () => {
  it('nimmt nur { build: Kennung }', () => {
    expect(versionAus({ build: 'a1b2c3' })).toBe('a1b2c3');
    expect(versionAus({ build: '' })).toBeNull();
    expect(versionAus({ build: 42 })).toBeNull();
    expect(versionAus({})).toBeNull();
    expect(versionAus(null)).toBeNull();
  });
  it('die Login-Seite (HTML statt JSON) zählt nicht als Version', () => {
    expect(versionAus('<!doctype html><title>Kurspasswort</title>')).toBeNull();
    expect(versionAus({ build: '<script>' })).toBeNull();
  });
});

describe('brauchtHinweis', () => {
  it('zeigt den Hinweis bei einer anderen Version', () => {
    expect(brauchtHinweis('aaa', 'bbb', null)).toBe(true);
  });
  it('nicht bei derselben Version oder ohne Antwort', () => {
    expect(brauchtHinweis('aaa', 'aaa', null)).toBe(false);
    expect(brauchtHinweis('aaa', null, null)).toBe(false);
  });
  it('lokal (Seite ohne Kennung) nie', () => {
    expect(brauchtHinweis('', 'bbb', null)).toBe(false);
  });
  it('weggeklickt bleibt weg – bis zur nächsten Version', () => {
    expect(brauchtHinweis('aaa', 'bbb', 'bbb')).toBe(false);
    expect(brauchtHinweis('aaa', 'ccc', 'bbb')).toBe(true);
  });
});

describe('naechstePruefung', () => {
  it('normal jede Minute', () => {
    expect(naechstePruefung(true, 0)).toBe(PRUEF_MS);
  });
  it('nach Fehlern verdoppelt, mit Obergrenze', () => {
    expect(naechstePruefung(false, 1)).toBe(PRUEF_MS);
    expect(naechstePruefung(false, 2)).toBe(2 * PRUEF_MS);
    expect(naechstePruefung(false, 3)).toBe(4 * PRUEF_MS);
    expect(naechstePruefung(false, 20)).toBe(MAX_MS);
  });
});

describe('ziel', () => {
  it('hängt den Abschnitt als Anker an, ohne die Suche zu verlieren', () => {
    expect(ziel('/tag-1', '?umgebung=mac', 'uebung-1-b')).toBe('/tag-1?umgebung=mac#uebung-1-b');
    expect(ziel('/tag-1', '', null)).toBe('/tag-1');
  });
});

describe('dieselbe Kennung an beiden Enden', () => {
  // Seite und /version.json müssen die Kennung aus derselben Quelle nehmen, sonst meldet jede Seite „neue Version“.
  it('Layout und version.json lesen lib/build', () => {
    const layout = readFileSync(new URL('../layouts/Layout.astro', import.meta.url), 'utf8');
    const endpunkt = readFileSync(new URL('../pages/version.json.ts', import.meta.url), 'utf8');
    expect(layout).toMatch(/from '\.\.\/lib\/build'/);
    expect(layout).toMatch(/<meta name="ndu-build" content=\{BUILD\}/);
    expect(endpunkt).toMatch(/from '\.\.\/lib\/build'/);
  });
  it('version.json liefert genau BUILD', async () => {
    expect(await GET().json()).toStrictEqual({ build: BUILD });
  });
});
