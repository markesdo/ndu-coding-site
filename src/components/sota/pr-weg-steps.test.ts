import { describe, expect, it } from 'vitest';
import { STEPS, mergeBereit, stateAt } from './pr-weg-steps';

const ALLE = STEPS.map((_, i) => i + 1);
const zustaende = ALLE.map(stateAt);

describe('pr-weg-steps', () => {
  it('hat elf Schritte mit Titel und Text', () => {
    expect(STEPS).toHaveLength(11);
    for (const s of STEPS) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.text.length).toBeGreaterThan(0);
    }
  });

  it('kennt keine Schritte außerhalb', () => {
    expect(() => stateAt(0)).toThrow();
    expect(() => stateAt(STEPS.length + 1)).toThrow();
  });

  it('gepusht ist nie mehr, als es Commits gibt', () => {
    for (const z of zustaende) expect(z.gepusht).toBeLessThanOrEqual(z.commits);
  });

  it('Commits liegen erst auf dem Mac, der Push bringt sie zu GitHub', () => {
    expect(stateAt(3)).toMatchObject({ commits: 2, gepusht: 0, vorschau: 'aus', pr: 'keiner' });
    expect(stateAt(4)).toMatchObject({ commits: 2, gepusht: 2, vorschau: 'baut', pr: 'keiner' });
  });

  it('Vercel baut erst, wenn etwas auf GitHub liegt', () => {
    for (const z of zustaende) if (z.vorschau !== 'aus') expect(z.gepusht).toBeGreaterThan(0);
  });

  it('der rote Build macht auch die Vorschau kaputt, der dritte Commit repariert beides', () => {
    expect(stateAt(6)).toMatchObject({ lint: 'ok', build: 'rot', vorschau: 'fehler', commits: 2 });
    expect(stateAt(7)).toMatchObject({ lint: 'ok', build: 'ok', vorschau: 'bereit', commits: 3, gepusht: 3 });
  });

  it('live ändert sich erst mit dem Merge', () => {
    for (const s of ALLE) expect(stateAt(s).live).toBe(stateAt(s).gemergt ? 'neu' : 'alt');
    expect(ALLE.filter((s) => stateAt(s).gemergt)).toStrictEqual([10, 11]);
  });

  it('gemergt wird nur, was bereit war', () => {
    expect(mergeBereit(stateAt(9))).toBe(true);
    for (const s of [1, 2, 3, 4, 5, 6, 7, 8]) expect(mergeBereit(stateAt(s))).toBe(false);
  });

  it('der Issue-Status folgt dem Weg: In Progress mit dem Branch, In Review mit dem PR, Done am Ende', () => {
    expect(zustaende.map((z) => z.issue)).toStrictEqual([
      'Todo', 'In Progress', 'In Progress', 'In Progress',
      'In Review', 'In Review', 'In Review', 'In Review', 'In Review', 'In Review', 'Done',
    ]);
  });

  it('nach dem Merge ist main auf dem Mac alt, bis ihr den Stand holt', () => {
    expect(stateAt(10).macAktuell).toBe(false);
    expect(stateAt(11).macAktuell).toBe(true);
    for (const s of ALLE.slice(0, 9)) expect(stateAt(s).macAktuell).toBe(true);
  });

  it('hervorgehoben ist, wo sich im Schritt etwas ändert', () => {
    expect(zustaende.map((z) => z.aktiv)).toStrictEqual([null, 'git', 'git', 'git', 'github', 'github', 'github', 'vercel', 'github', 'vercel', null]);
  });

  it('die Vorschau bleibt nach dem Aufräumen bestehen (Vercel löscht sie nicht mit dem Branch)', () => {
    expect(stateAt(11).vorschau).toBe('bereit');
  });

  it('nur der erste und der letzte Schritt zeigen alles gleichzeitig; gelöscht ist der Branch nur am Ende', () => {
    for (const s of ALLE) {
      expect(stateAt(s).aktiv === null).toBe(s === 1 || s === STEPS.length);
      expect(stateAt(s).geloescht).toBe(s === STEPS.length);
    }
  });
});
