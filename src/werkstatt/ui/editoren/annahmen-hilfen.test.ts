import { describe, expect, it } from 'vitest';
import beispiel from '../../beispiele/annahmen.json';
import { artefaktParsen, type Annahmen } from '../../schemas/index.js';
import { annahmeNeu, annahmenSetzen, fehlendeArten, fehlendeArtenHinweis, riskantesteSetzen } from './annahmen-hilfen.js';

const kaffeebar = () => structuredClone(beispiel) as Annahmen;
const leer = (): Annahmen => ({ schema: 'annahmen@1', stand: '2026-10-22', annahmen: [] });

describe('annahmeNeu', () => {
  it('vergibt die nächste freie ID und nimmt gelöschte nicht wieder', () => {
    const d = kaffeebar();
    expect(annahmeNeu(d.annahmen, []).id).toBe('A5');
    // A5 und A6 wurden vergeben und wieder gelöscht: weiter mit A7.
    expect(annahmeNeu(d.annahmen, ['A5', 'A6']).id).toBe('A7');
    expect(annahmeNeu([], []).id).toBe('A1');
  });

  it('ist eine gültige, leere Annahme', () => {
    const d = leer();
    const neu = { ...d, annahmen: [annahmeNeu([], [])] };
    expect(artefaktParsen('annahmen', neu).ok).toBe(true);
    expect(neu.annahmen[0]).toStrictEqual({ id: 'A1', text: '', art: 'wuenschenswert', wichtig: 'mittel', beleg: 'keiner', belegIds: [] });
  });
});

describe('fehlendeArten', () => {
  it('Kaffeebar hat alle vier Arten: kein Hinweis', () => {
    expect(fehlendeArten(kaffeebar().annahmen)).toEqual([]);
    expect(fehlendeArtenHinweis(kaffeebar().annahmen)).toBeNull();
  });

  it('nennt eine fehlende Art', () => {
    const ohne = kaffeebar().annahmen.filter((a) => a.art !== 'machbar');
    expect(fehlendeArten(ohne)).toEqual(['machbar']);
    expect(fehlendeArtenHinweis(ohne)).toBe('Es fehlt noch eine Annahme der Art „machbar“.');
  });

  it('nennt mehrere fehlende Arten in der Reihenfolge der vier Arten', () => {
    const nur = kaffeebar().annahmen.filter((a) => a.art === 'bedienbar');
    expect(fehlendeArtenHinweis(nur)).toBe('Es fehlt noch je eine Annahme der Art „wünschenswert“, „machbar“ und „wirtschaftlich“.');
  });
});

describe('riskanteste', () => {
  it('fällt weg, wenn ihre Annahme gelöscht wird', () => {
    const d = kaffeebar(); // riskanteste: A1
    const neu = annahmenSetzen(d, d.annahmen.filter((a) => a.id !== 'A1'));
    expect(neu).toStrictEqual({ schema: d.schema, stand: d.stand, annahmen: d.annahmen.slice(1) });
    expect(artefaktParsen('annahmen', neu).ok).toBe(true);
  });

  it('bleibt, wenn eine andere gelöscht wird', () => {
    const d = kaffeebar();
    expect(annahmenSetzen(d, d.annahmen.slice(0, 2)).riskanteste).toBe('A1');
  });

  it('setzen und leeren', () => {
    const d = kaffeebar();
    expect(riskantesteSetzen(d, 'A3').riskanteste).toBe('A3');
    const ohne = riskantesteSetzen(d, '');
    expect('riskanteste' in ohne).toBe(false);
  });
});
