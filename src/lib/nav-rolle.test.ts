import { describe, expect, it } from 'vitest';
import { MAPPE_LEHRENDE, NAV_ROLLE_SKRIPT, ROLLE_KEY, navMappeSetzen, rolleMerken } from './nav-rolle';

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
    rolleMerken(() => s, 'lehrende');
    expect(daten).toStrictEqual({ [ROLLE_KEY]: 'lehrende' });
  });
  it('Studierende und Abgemeldete löschen den Eintrag, andere Schlüssel bleiben', () => {
    for (const rolle of ['studierende', null]) {
      const { daten, s } = speicher({ [ROLLE_KEY]: 'lehrende', anderes: 'x' });
      rolleMerken(() => s, rolle);
      expect(daten).toStrictEqual({ anderes: 'x' });
    }
  });
  it('wirft nicht, wenn der Speicher fehlt oder schreiben wirft', () => {
    expect(() => rolleMerken(() => { throw new Error('gesperrt'); }, 'lehrende')).not.toThrow();
    const kaputt = { setItem: () => { throw new Error('voll'); }, removeItem: () => { throw new Error('voll'); } };
    expect(() => rolleMerken(() => kaputt, 'lehrende')).not.toThrow();
    expect(() => rolleMerken(() => kaputt, null)).not.toThrow();
  });
});

describe('navMappeSetzen', () => {
  it('setzt alle markierten Menülinks', () => {
    const { links, dok } = dokument(['Meine Mappe', 'Meine Mappe']);
    navMappeSetzen(dok as unknown as Document);
    expect(links.map((l) => l.textContent)).toStrictEqual([MAPPE_LEHRENDE, MAPPE_LEHRENDE]);
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
