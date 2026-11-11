import { describe, expect, it } from 'vitest';
import { kartenPfade, quellenAusGlob } from '../lib/begleiter';
import { anzeige, fremdeSeite, type Zustand } from './begleiter-anzeige';

const folgt: Zustand = { index: 2, folgen: true, meldung: 'ok' };
const vonHand: Zustand = { index: 2, folgen: false, meldung: 'keine-verbindung' };

describe('anzeige (Begleiter)', () => {
  it('folgt einer Beamer-Position', () => {
    expect(anzeige(folgt, { art: 'position', index: 5 })).toStrictEqual({ index: 5, folgen: true, meldung: 'ok' });
    expect(anzeige({ ...folgt, meldung: 'keine-verbindung' }, { art: 'position', index: 2 })).toStrictEqual({ index: 2, folgen: true, meldung: 'ok' });
  });
  it('springt beim Blättern von Hand nicht um, wenn der Beamer weiterzieht', () => {
    expect(anzeige(vonHand, { art: 'position', index: 5 })).toStrictEqual(vonHand);
    expect(anzeige(vonHand, { art: 'fehler' })).toStrictEqual(vonHand);
    expect(anzeige(vonHand, { art: 'leer' })).toStrictEqual(vonHand);
    expect(anzeige(vonHand, { art: 'position', index: null })).toStrictEqual(vonHand);
  });
  it('Beamer nicht auf Tag 1: Meldung, Folie bleibt', () => {
    expect(anzeige(folgt, { art: 'position', index: null })).toStrictEqual({ index: 2, folgen: true, meldung: 'nicht-tag-1' });
  });
  it('API nicht erreichbar: Meldung, Folie bleibt, Folgen läuft weiter', () => {
    expect(anzeige(folgt, { art: 'fehler' })).toStrictEqual({ index: 2, folgen: true, meldung: 'keine-verbindung' });
  });
  it('keine Position gemeldet', () => {
    expect(anzeige(folgt, { art: 'leer' })).toStrictEqual({ index: 2, folgen: true, meldung: 'keine-position' });
  });
  it('Blättern pausiert das Folgen', () => {
    expect(anzeige(folgt, { art: 'blaettern', index: 7 })).toStrictEqual({ index: 7, folgen: false, meldung: 'ok' });
  });
  it('„Dem Beamer folgen“ schaltet das Folgen wieder ein und vergisst die alte Meldung, bis der Beamer antwortet', () => {
    expect(anzeige(vonHand, { art: 'folgen' })).toStrictEqual({ index: 2, folgen: true, meldung: 'frage' });
    expect(anzeige(anzeige(vonHand, { art: 'folgen' }), { art: 'position', index: 4 })).toStrictEqual({ index: 4, folgen: true, meldung: 'ok' });
  });
});

describe('fremdeSeite (Karte außerhalb von Tag 1)', () => {
  // Dieselben Karten wie in pages/innolab/begleiter.astro: alle Innolab-Seiten außerhalb von Tag 1.
  const karten = new Set(kartenPfade(quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>)));
  const draussen = anzeige(folgt, { art: 'position', index: null });
  it('zeigt eine Karte für jede Innolab-Seite außerhalb von Tag 1, mit und ohne Vorwissen', () => {
    for (const pfad of ['/innolab/methoden/synthese', '/innolab/methoden/baum', '/innolab/methoden/journey-map', '/innolab/tag-2', '/innolab/tag-7', '/innolab/methoden', '/innolab']) {
      expect(fremdeSeite(draussen, pfad, karten), pfad).toBe(pfad);
    }
  });
  it('keine Karte für Tag-1-Seiten, den Begleiter und Seiten außerhalb des Innolabs', () => {
    for (const pfad of ['/innolab/tag-1', '/innolab/methoden/interview', '/innolab/tag-1/abschluss', '/innolab/begleiter', '/', '/ideen']) {
      expect(karten.has(pfad), pfad).toBe(false);
      expect(fremdeSeite(draussen, pfad, karten), pfad).toBeNull();
    }
  });
  it('keine Karte, wenn von Hand geblättert, auf Tag 1 oder ohne Beamer-Pfad', () => {
    expect(fremdeSeite({ ...draussen, folgen: false }, '/innolab/methoden/baum', karten)).toBeNull();
    expect(fremdeSeite(folgt, '/innolab/methoden/baum', karten)).toBeNull();
    expect(fremdeSeite(draussen, null, karten)).toBeNull();
  });
});
