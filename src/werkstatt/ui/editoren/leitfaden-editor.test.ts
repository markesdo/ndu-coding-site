import { describe, expect, it } from 'vitest';
import beispiel from '../../beispiele/leitfaden.json';
import { rendern } from '../../render/index.js';
import { ARTEFAKTE, artefaktParsen, type Frage, type Leitfaden } from '../../schemas/index.js';
import { EINSTIEG_VORLAGE, einstiegVorbefuellen, neueFrage } from './leitfaden-hilfen.js';

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

describe('einstiegVorbefuellen', () => {
  it('füllt einen leeren Einstieg mit dem Text der Vorlage', () => {
    const d = einstiegVorbefuellen(leer);
    expect(d.einstieg).toBe(EINSTIEG_VORLAGE);
    expect(d.einstieg.startsWith('Danke, dass du dir Zeit nimmst.')).toBe(true);
    expect(d.einstieg).toContain('[Situation]');
  });

  it('lässt einen vorhandenen Einstieg unangetastet (gleiches Objekt)', () => {
    const eigener = { ...leer, einstieg: 'Hallo, ich bin Lena.' };
    expect(einstiegVorbefuellen(eigener)).toBe(eigener);
  });

  it('der vorbefüllte Leitfaden ist ein gültiger Leitfaden', () => {
    expect(artefaktParsen('leitfaden', einstiegVorbefuellen(leer)).ok).toBe(true);
  });
});

describe('Mom-Test-Pointe: keine Beispielfragen vorbefüllt', () => {
  it('kennt das Beispiel Fragen, sonst wäre der Test leer', () => {
    expect(beispielFragen.length).toBeGreaterThanOrEqual(5);
  });

  it('ein neuer Leitfaden enthält keinen Fragetext aus dem Kurs', () => {
    const neu = einstiegVorbefuellen(leer);
    expect(neu.fragen).toStrictEqual([]);
    const alles = JSON.stringify(neu) + rendern('leitfaden', neu);
    for (const t of beispielFragen) expect(alles).not.toContain(t);
  });

  it('auch die erste, neu angelegte Frage ist leer', () => {
    const mitFrage: Leitfaden = { ...einstiegVorbefuellen(leer), fragen: [neueFrage([])] };
    expect(mitFrage.fragen.map((f) => f.text)).toStrictEqual(['']);
    for (const t of beispielFragen) expect(JSON.stringify(mitFrage)).not.toContain(t);
  });

  it('die Einstiegsvorlage selbst ist keine der Beispielfragen', () => {
    expect(beispielFragen).not.toContain(EINSTIEG_VORLAGE);
  });
});
