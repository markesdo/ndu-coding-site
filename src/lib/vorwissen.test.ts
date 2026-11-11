import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { METHODEN } from '../components/methoden';
import { VORWISSEN } from '../data/begleiter/vorwissen';
import { stichwortForm, vorwissenHinweis } from './begleiter';

describe('Vorwissen (Begleiter)', () => {
  it('jeder Slug ist eine Methode', () => {
    const slugs = new Set(METHODEN.map((m) => m.slug));
    expect(Object.keys(VORWISSEN).filter((s) => !slugs.has(s))).toStrictEqual([]);
  });

  it('Hinweis je Grad, mit LV und Antwort der Studierenden', () => {
    expect(vorwissenHinweis('/innolab/methoden/hmw')).toStrictEqual({
      grad: 'bekannt',
      titel: 'Schon bekannt: aus „Need Finding / Market Research“, Theorie kurz halten',
      frage: 'Fragen: Was habt ihr dort dazu gemacht?',
      notiz: null,
    });
    expect(vorwissenHinweis('/innolab/methoden/synthese')).toStrictEqual({
      grad: 'teilweise',
      titel: 'Teilweise bekannt: aus „Need Finding / Market Research“, Theorie kurz, Lücken füllen',
      frage: 'Fragen: Was davon kennt ihr schon, was fehlt?',
      notiz: 'Antwort: „mäßig?“',
    });
    expect(vorwissenHinweis('/innolab/methoden/usage-story')).toStrictEqual({
      grad: 'unsicher',
      titel: 'Vielleicht bekannt: aus „Entrepreneur Lab & Prototyping“, kurz nachfragen',
      frage: 'Fragen: Kennt ihr das, vielleicht unter anderem Namen?',
      notiz: 'Antwort: „kinda, not really?“',
    });
  });

  it('kein Hinweis für unbekannte Methoden und andere Seiten', () => {
    expect(vorwissenHinweis('/innolab/methoden/baum')).toBeNull();
    expect(vorwissenHinweis('/innolab/tag-1')).toBeNull();
    expect(vorwissenHinweis('/innolab/methoden/hmw/extra')).toBeNull();
    expect(vorwissenHinweis('/innolab/methoden/constructor')).toBeNull();
  });

  it('Regieanweisungen: Stichwort vorn, höchstens 12 Wörter (typen.ts)', () => {
    for (const slug of Object.keys(VORWISSEN)) {
      const h = vorwissenHinweis(`/innolab/methoden/${slug}`)!;
      for (const zeile of [h.titel, h.frage]) {
        expect(stichwortForm(zeile).cue, zeile).not.toBeNull();
        expect(zeile.split(/\s+/).filter((w) => /\p{L}/u.test(w)).length, zeile).toBeLessThanOrEqual(12);
      }
    }
  });

  // Nur der Begleiter darf das Vorwissen zeigen: keine Seite für Studierende und nicht der Beamer. Auch lib/begleiter.ts
  // (vorwissenHinweis) bleibt Begleiter-Dateien vorbehalten.
  it('nur Begleiter-Dateien importieren das Vorwissen', () => {
    const erlaubt = new Set([
      'src/pages/innolab/begleiter.astro', 'src/components/BegleiterVorwissen.astro', 'src/components/BegleiterQuelle.astro',
      'src/lib/begleiter.ts', 'src/lib/begleiter.test.ts', 'src/lib/vorwissen.test.ts',
    ]);
    const dateien = (ordner: string): string[] => readdirSync(ordner).flatMap((n) => {
      const p = join(ordner, n);
      return statSync(p).isDirectory() ? dateien(p) : [p];
    });
    const nutzer = (muster: RegExp) => dateien('src').filter((p) => /\.(astro|ts|tsx|js|mjs)$/.test(p) && muster.test(readFileSync(p, 'utf8')));
    expect(nutzer(/data\/begleiter\/vorwissen|BegleiterVorwissen|\bvorwissenHinweis\b|(?:lib|\.)\/begleiter['".]/).filter((p) => !erlaubt.has(p))).toStrictEqual([]);
  });
});
