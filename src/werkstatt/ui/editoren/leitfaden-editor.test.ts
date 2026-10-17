import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import beispiel from '../../beispiele/leitfaden.json';
import { rendern } from '../../render/index.js';
import { ARTEFAKTE, artefaktParsen, type Frage, type Leitfaden } from '../../schemas/index.js';
import { EINSTIEG_VORLAGE, hatPlatzhalter, neueFrage } from './leitfaden-hilfen.js';

const leer = ARTEFAKTE.leitfaden.leer('2026-10-22');
const beispielFragen = (beispiel as Leitfaden).fragen.map((f) => f.text);

describe('neueFrage', () => {
  it('beginnt leer, als Kernfrage, mit F1', () => {
    expect(neueFrage([])).toStrictEqual({ id: 'F1', text: '', art: 'kern' });
  });

  it('vergibt fortlaufende IDs und nutzt gelöschte nicht wieder', () => {
    const f = (id: string): Frage => ({ id, text: 'a', art: 'kern' });
    expect(neueFrage([f('F1'), f('F2')]).id).toBe('F3');
    // Lücke bleibt Lücke: F2 fehlt, die nächste ID ist trotzdem F4.
    expect(neueFrage([f('F1'), f('F3')]).id).toBe('F4');
    expect(neueFrage([f('F2')]).id).toBe('F3');
  });
});

describe('Einstieg-Vorlage', () => {
  it('der leere Leitfaden ist mit dem Einstieg der Vorlage vorbefüllt und gültig', () => {
    const l = ARTEFAKTE.leitfaden.leer('2026-10-22');
    expect(l.einstieg).toBe(EINSTIEG_VORLAGE);
    expect(artefaktParsen('leitfaden', l).ok).toBe(true);
  });

  it('EINSTIEG_VORLAGE ist der Einstiegstext der Vorlage auf der Interview-Seite', () => {
    const seite = readFileSync('src/pages/innolab/methoden/interview.astro', 'utf8');
    const block = seite.slice(seite.indexOf('Vorlage · docs/interviews/LEITFADEN.md'));
    const treffer = /## Einstieg\n„([^\n]*)“\n/.exec(block);
    expect(treffer).not.toBeNull();
    expect(EINSTIEG_VORLAGE).toBe(treffer![1]);
  });

  it('erkennt den Platzhalter', () => {
    expect(hatPlatzhalter(EINSTIEG_VORLAGE)).toBe(true);
    expect(hatPlatzhalter('Ich will verstehen, wie du Kaffee kaufst.')).toBe(false);
  });
});

describe('Mom-Test-Pointe: keine Beispielfragen vorbefüllt', () => {
  it('kennt das Beispiel Fragen, sonst wäre der Test leer', () => {
    expect(beispielFragen.length).toBeGreaterThanOrEqual(5);
  });

  it('ein neuer Leitfaden enthält keinen Fragetext aus dem Kurs', () => {
    const neu = leer;
    expect(neu.fragen).toStrictEqual([]);
    const alles = JSON.stringify(neu) + rendern('leitfaden', neu);
    for (const t of beispielFragen) expect(alles).not.toContain(t);
  });

  it('auch die erste, neu angelegte Frage ist leer', () => {
    const mitFrage: Leitfaden = { ...leer, fragen: [neueFrage([])] };
    expect(mitFrage.fragen.map((f) => f.text)).toStrictEqual(['']);
    for (const t of beispielFragen) expect(JSON.stringify(mitFrage)).not.toContain(t);
  });

  it('die Einstiegsvorlage selbst ist keine der Beispielfragen', () => {
    expect(beispielFragen).not.toContain(EINSTIEG_VORLAGE);
  });
});
