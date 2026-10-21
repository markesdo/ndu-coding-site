import { describe, expect, it } from 'vitest';
import beispiel from '../../beispiele/annahmen.json';
import { artefaktParsen, belegNotizSetzen, type Annahmen } from '../../schemas/index.js';
import { annahmeBelegNotizHilfe, annahmeNeu, annahmenSetzen, belegAnzeige, fehlendeArten, fehlendeArtenHinweis, getanOhneQuelleHinweis, riskantesteSetzen } from './annahmen-hilfen.js';

const kaffeebar = () => structuredClone(beispiel) as Annahmen;
const leer = (): Annahmen => ({ schema: 'annahmen@1', stand: '2026-10-22', annahmen: [] });

describe('belegNotizSetzen an einer Annahme', () => {
  it('setzt die Notiz und lässt die übrigen Felder; leer entfernt den Schlüssel ganz', () => {
    const a = kaffeebar().annahmen[1]!;
    expect(belegNotizSetzen(a, 'Kassendaten September')).toStrictEqual({ ...a, belegNotiz: 'Kassendaten September' });
    expect(belegNotizSetzen({ ...a, belegNotiz: 'x' }, ' ')).toStrictEqual(a);
  });
  it('neue Annahme hat keine Notiz', () => {
    expect('belegNotiz' in annahmeNeu([], [])).toBe(false);
  });
});

describe('getanOhneQuelleHinweis', () => {
  const HINWEIS = '„getan“ braucht eine Quelle: eine Beleg-Notiz oder eine Entscheidung (D…), die selbst „getan“ ist und eine Quelle nennt. Ein Interview-Zitat belegt höchstens „erzählt“.';
  it('„getan“ ohne Notiz und ohne D-ID: Hinweis; Interview-Zitat oder A-ID allein ändern daran nichts', () => {
    const a = kaffeebar().annahmen[1]!;
    expect(a.beleg).toBe('getan');
    expect(getanOhneQuelleHinweis(a)).toBe(HINWEIS);
    expect(getanOhneQuelleHinweis({ ...a, belegIds: ['I2-4', 'A3'] })).toBe(HINWEIS);
    expect(getanOhneQuelleHinweis({ ...a, belegNotiz: ' ' })).toBe(HINWEIS);
  });
  it('mit D-ID: der Editor kennt das Entscheidungslog nicht und sagt, was die Entscheidung selbst braucht', () => {
    const a = kaffeebar().annahmen[1]!;
    expect(getanOhneQuelleHinweis({ ...a, belegIds: ['I2-4', 'D2'] })).toBe('D2 trägt „getan“ nur, wenn die Entscheidung selbst „getan“ ist und eine Quelle nennt. Sonst hier die Quelle notieren.');
  });
  it('mit Beleg-Notiz still (auch neben einer D-ID), andere Stufen nie', () => {
    const a = kaffeebar().annahmen[1]!;
    expect(getanOhneQuelleHinweis({ ...a, belegNotiz: 'Kassendaten September' })).toBeNull();
    expect(getanOhneQuelleHinweis({ ...a, belegIds: ['D2'], belegNotiz: 'Kassendaten September' })).toBeNull();
    for (const beleg of ['keiner', 'gesagt', 'erzaehlt'] as const) expect(getanOhneQuelleHinweis({ ...a, beleg, belegIds: [] })).toBeNull();
  });
  it('Hilfe des Notizfelds erklärt „getan“ und nennt die Grenze', () => {
    expect(annahmeBelegNotizHilfe).toContain('beobachtet, gemessen oder bezahlt');
    expect(annahmeBelegNotizHilfe).toContain('Höchstens 120 Zeichen');
  });
});

describe('belegAnzeige', () => {
  it('Stufe, dann IDs und Notiz wie im Markdown, ohne Zusatz nur die Stufe', () => {
    const a = kaffeebar().annahmen[1]!;
    expect(belegAnzeige(a)).toBe('getan');
    expect(belegAnzeige({ ...a, belegNotiz: 'Kassendaten September' })).toBe('getan (Kassendaten September)');
    expect(belegAnzeige({ ...a, belegIds: ['D2', 'I2-4'], belegNotiz: 'Kassendaten September' })).toBe('getan (D2, I2-4; Kassendaten September)');
    expect(belegAnzeige({ ...a, beleg: 'keiner', belegIds: [''] })).toBe('noch keiner');
  });
});

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

describe('ethisch', () => {
  it('fehlt sie, gibt es keinen Hinweis – sie gehört nicht zu den vier Arten von Tag 1', () => {
    expect(kaffeebar().annahmen.some((a) => a.art === 'ethisch')).toBe(false);
    expect(fehlendeArtenHinweis(kaffeebar().annahmen)).toBeNull();
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
