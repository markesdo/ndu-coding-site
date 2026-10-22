import { describe, expect, it } from 'vitest';
import { MAPPE_LEHRENDE, MAPPE_STUDIERENDE, NAV_ROLLE_SKRIPT, ROLLE_KEY, navMappeSetzen, rolleMerken } from './nav-rolle';

function speicher(start: Record<string, string> = {}) {
  const daten = { ...start };
  return {
    daten,
    s: {
      getItem: (k: string) => (k in daten ? daten[k] : null),
      setItem: (k: string, v: string) => { daten[k] = v; },
      removeItem: (k: string) => { delete daten[k]; },
    },
  };
}

function dokument(texte: string[]) {
  const links = texte.map((t) => ({ textContent: t }));
  return { links, dok: { querySelectorAll: (s: string) => (s === '[data-nav-mappe]' ? links : []) } };
}

describe('rolleMerken', () => {
  it('merkt sich Lehrende', () => {
    const { daten, s } = speicher();
    rolleMerken(() => s, true);
    expect(daten).toStrictEqual({ [ROLLE_KEY]: 'lehrende' });
  });
  it('Studierende und Abgemeldete löschen den Eintrag, andere Schlüssel bleiben', () => {
    const { daten, s } = speicher({ [ROLLE_KEY]: 'lehrende', anderes: 'x' });
    rolleMerken(() => s, false);
    expect(daten).toStrictEqual({ anderes: 'x' });
  });
  it('wirft nicht, wenn der Speicher fehlt oder schreiben wirft', () => {
    expect(() => rolleMerken(() => { throw new Error('gesperrt'); }, true)).not.toThrow();
    const kaputt = { setItem: () => { throw new Error('voll'); }, removeItem: () => { throw new Error('voll'); } };
    expect(() => rolleMerken(() => kaputt, true)).not.toThrow();
    expect(() => rolleMerken(() => kaputt, false)).not.toThrow();
  });
});

describe('navMappeSetzen', () => {
  it('Lehrende: setzt alle markierten Menülinks', () => {
    const { links, dok } = dokument([MAPPE_STUDIERENDE, MAPPE_STUDIERENDE]);
    navMappeSetzen(dok as unknown as Document, true);
    expect(links.map((l) => l.textContent)).toStrictEqual([MAPPE_LEHRENDE, MAPPE_LEHRENDE]);
  });
  it('Studierende nach gemerktem „lehrende“ (Kontowechsel): zurück auf „Meine Mappe“', () => {
    const { links, dok } = dokument([MAPPE_LEHRENDE]);
    navMappeSetzen(dok as unknown as Document, false);
    expect(links[0].textContent).toBe(MAPPE_STUDIERENDE);
  });
});

describe('NAV_ROLLE_SKRIPT (Inline-Skript im Layout)', () => {
  const ausfuehren = (dok: unknown, ls: unknown) => new Function('document', 'localStorage', NAV_ROLLE_SKRIPT)(dok, ls);

  it('Lehrende gemerkt: Menülink zeigt „Mappen der Kohorte“', () => {
    const { links, dok } = dokument(['Meine Mappe']);
    ausfuehren(dok, speicher({ [ROLLE_KEY]: 'lehrende' }).s);
    expect(links[0].textContent).toBe(MAPPE_LEHRENDE);
  });
  it('nichts oder etwas anderes gemerkt: bleibt „Meine Mappe“', () => {
    for (const start of [{}, { [ROLLE_KEY]: 'studierende' }]) {
      const { links, dok } = dokument(['Meine Mappe']);
      ausfuehren(dok, speicher(start).s);
      expect(links[0].textContent).toBe('Meine Mappe');
    }
  });
  it('wirft nicht, wenn localStorage wirft', () => {
    const { links, dok } = dokument(['Meine Mappe']);
    expect(() => ausfuehren(dok, { getItem: () => { throw new Error('gesperrt'); } })).not.toThrow();
    expect(links[0].textContent).toBe('Meine Mappe');
  });
});
