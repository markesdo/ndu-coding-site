import { describe, expect, it } from 'vitest';
import { ARTEFAKT_NAMEN } from './namen';
import { ARTEFAKTE, artefaktParsen, BELEGSTUFEN, BELEGSTUFE_TEXT, MIGRATIONEN, punkt, quadrant, type Annahme } from './index';
import brief from '../beispiele/brief.json';
import entscheidungen from '../beispiele/entscheidungen.json';
import leitfaden from '../beispiele/leitfaden.json';
import annahmen from '../beispiele/annahmen.json';

const beispiele = { brief, entscheidungen, leitfaden, annahmen } as const;

function fehlerPfade(name: Parameters<typeof artefaktParsen>[0], roh: unknown): string[] {
  const r = artefaktParsen(name, roh);
  expect(r.ok).toBe(false);
  return r.ok ? [] : r.fehler.map((f) => f.pfad);
}

const klon = <T>(x: T): any => structuredClone(x);

describe('Kaffeebar-Beispiele', () => {
  for (const name of ARTEFAKT_NAMEN) {
    it(`${name}: gültig`, () => {
      const r = artefaktParsen(name, beispiele[name]);
      expect(r.ok, JSON.stringify(r)).toBe(true);
    });
  }
  it('Entscheidungen: D3 ersetzt D1 (Beispiel übt ersetzt)', () => {
    const r = artefaktParsen('entscheidungen', entscheidungen);
    if (!r.ok || !('entscheidungen' in r.daten)) throw new Error('unerwartet');
    expect((r.daten.entscheidungen as { id: string; ersetzt?: string }[]).find((z) => z.id === 'D3')?.ersetzt).toBe('D1');
  });
});

describe('ARTEFAKTE', () => {
  it('Slugs entsprechen den Methodenseiten', () => {
    expect(ARTEFAKTE.brief.slug).toBe('problem-rahmen');
    expect(ARTEFAKTE.entscheidungen.slug).toBe('entscheidungslog');
    expect(ARTEFAKTE.leitfaden.slug).toBe('interview');
    expect(ARTEFAKTE.annahmen.slug).toBe('annahmen');
  });
  for (const name of ARTEFAKT_NAMEN) {
    it(`${name}: leer('2026-10-22') ist gültig`, () => {
      expect(ARTEFAKTE[name].version).toBe(1);
      const leer = ARTEFAKTE[name].leer('2026-10-22') as { schema: string; stand: string };
      expect(leer.schema).toBe(`${name}@1`);
      expect(leer.stand).toBe('2026-10-22');
      const r = artefaktParsen(name, leer);
      expect(r.ok, JSON.stringify(r)).toBe(true);
    });
  }
  it('Belegstufen in dieser Reihenfolge', () => {
    expect([...BELEGSTUFEN]).toEqual(['keiner', 'gesagt', 'erzaehlt', 'getan']);
  });
  it('Migrationstabelle ist (noch) leer', () => {
    expect(Object.keys(MIGRATIONEN)).toEqual([]);
  });
});

describe('Anzeigetexte der Belegstufen', () => {
  it('wie auf den Kursseiten', () => {
    expect(BELEGSTUFE_TEXT).toStrictEqual({ keiner: 'noch keiner', gesagt: 'gesagt', erzaehlt: 'erzählt', getan: 'getan' });
  });
});

describe('artefaktParsen: allgemein', () => {
  it('kein Objekt → Fehler am Wurzelpfad', () => {
    for (const name of ARTEFAKT_NAMEN) expect(artefaktParsen(name, null).ok).toBe(false);
  });
  it('falsches schema → Fehler am Feld schema', () => {
    expect(fehlerPfade('brief', { ...klon(brief), schema: 'brief@9' })).toContain('schema');
    expect(fehlerPfade('brief', { ...klon(annahmen) })).toContain('schema');
  });
  it('stand muss ein echtes ISO-Datum sein', () => {
    for (const stand of ['22.10.2026', '2026-13-01', '2026-02-30', '']) {
      expect(fehlerPfade('brief', { ...klon(brief), stand }), stand).toContain('stand');
    }
  });
  it('Meldungen sind deutsch und nicht leer', () => {
    const r = artefaktParsen('brief', { ...klon(brief), fuerWen: 5 });
    if (r.ok) throw new Error('erwartet Fehler');
    const f = r.fehler.find((x) => x.pfad === 'fuerWen');
    expect(f?.meldung).toMatch(/Text/);
  });
});

describe('Brief', () => {
  it('produktSatz ist optional und wird gelesen', () => {
    const r = artefaktParsen('brief', { ...klon(brief), produktSatz: 'Kaffee im Gehen' });
    expect(r.ok).toBe(true);
  });
  it('fehlendes outcome.wirMerkenEs → Pfad outcome.wirMerkenEs', () => {
    const b = klon(brief);
    delete b.outcome.wirMerkenEs;
    expect(fehlerPfade('brief', b)).toContain('outcome.wirMerkenEs');
  });
});

describe('Entscheidungen', () => {
  it('doppelte ID → Fehler am zweiten Vorkommen', () => {
    const e = klon(entscheidungen);
    e.entscheidungen[1].id = 'D1';
    expect(fehlerPfade('entscheidungen', e)).toContain('entscheidungen.1.id');
  });
  it('ersetzt zeigt auf unbekannte D-ID → Fehler', () => {
    const e = klon(entscheidungen);
    e.entscheidungen[2].ersetzt = 'D9';
    expect(fehlerPfade('entscheidungen', e)).toContain('entscheidungen.2.ersetzt');
  });
  it('ersetzt darf nicht auf sich selbst zeigen', () => {
    const e = klon(entscheidungen);
    e.entscheidungen[2].ersetzt = 'D3';
    expect(fehlerPfade('entscheidungen', e)).toContain('entscheidungen.2.ersetzt');
  });
  it('ungültige ID-Form und falsches Präfix → Fehler', () => {
    const e = klon(entscheidungen);
    e.entscheidungen[0].id = 'A1';
    expect(fehlerPfade('entscheidungen', e)).toContain('entscheidungen.0.id');
  });
  it('belegIds müssen IDs sein', () => {
    const e = klon(entscheidungen);
    e.entscheidungen[2].belegIds = ['I1', 'Interview 3'];
    expect(fehlerPfade('entscheidungen', e)).toContain('entscheidungen.2.belegIds.1');
  });
  it('unbekannte Belegstufe → Fehler', () => {
    const e = klon(entscheidungen);
    e.entscheidungen[0].beleg = 'stark';
    expect(fehlerPfade('entscheidungen', e)).toContain('entscheidungen.0.beleg');
  });
});

describe('Leitfaden', () => {
  it('doppelte Frage-ID → Fehler am zweiten Vorkommen', () => {
    const l = klon(leitfaden);
    l.fragen[1].id = 'F1';
    expect(fehlerPfade('leitfaden', l)).toContain('fragen.1.id');
  });
  it('falsche art → Fehler an der Zeile', () => {
    const l = klon(leitfaden);
    l.fragen[2].art = 'zusatz';
    expect(fehlerPfade('leitfaden', l)).toContain('fragen.2.art');
  });
});

describe('Annahmen', () => {
  it('fehlende art in Zeile 2 → annahmen.1.art mit deutscher Meldung', () => {
    const a = klon(annahmen);
    delete a.annahmen[1].art;
    const r = artefaktParsen('annahmen', a);
    if (r.ok) throw new Error('erwartet Fehler');
    const f = r.fehler.find((x) => x.pfad === 'annahmen.1.art');
    expect(f).toBeDefined();
    expect(f?.meldung).toMatch(/Art/);
  });
  it('riskanteste: A9 ohne A9 → Fehler am Pfad riskanteste', () => {
    const a = klon(annahmen);
    a.riskanteste = 'A9';
    const r = artefaktParsen('annahmen', a);
    if (r.ok) throw new Error('erwartet Fehler');
    expect(r.fehler.map((f) => f.pfad)).toContain('riskanteste');
  });
  it('doppelte ID → Fehler', () => {
    const a = klon(annahmen);
    a.annahmen[3].id = 'A2';
    expect(fehlerPfade('annahmen', a)).toContain('annahmen.3.id');
  });
  it('wichtig außerhalb hoch/mittel/niedrig → Fehler', () => {
    const a = klon(annahmen);
    a.annahmen[0].wichtig = 'sehr';
    expect(fehlerPfade('annahmen', a)).toContain('annahmen.0.wichtig');
  });
});

const a = (wichtig: Annahme['wichtig'], beleg: Annahme['beleg'], id = 'A1'): Annahme => ({
  id, text: 't', art: 'machbar', wichtig, beleg, belegIds: [],
});

describe('quadrant', () => {
  it('hoch + keiner → ol (zuerst testen)', () => {
    expect(quadrant({ wichtig: 'hoch', beleg: 'keiner' })).toBe('ol');
  });
  it('niedrig + getan → ur', () => {
    expect(quadrant({ wichtig: 'niedrig', beleg: 'getan' })).toBe('ur');
  });
  it('alle Kombinationen', () => {
    expect(quadrant({ wichtig: 'hoch', beleg: 'gesagt' })).toBe('ol');
    expect(quadrant({ wichtig: 'hoch', beleg: 'erzaehlt' })).toBe('or');
    expect(quadrant({ wichtig: 'hoch', beleg: 'getan' })).toBe('or');
    expect(quadrant({ wichtig: 'mittel', beleg: 'keiner' })).toBe('ul');
    expect(quadrant({ wichtig: 'niedrig', beleg: 'gesagt' })).toBe('ul');
    expect(quadrant({ wichtig: 'mittel', beleg: 'erzaehlt' })).toBe('ur');
  });
});

describe('punkt', () => {
  it('Grundwerte einer allein stehenden Annahme', () => {
    expect(punkt(a('hoch', 'keiner'), [])).toEqual({ x: 0.1, y: 0.85 });
    expect(punkt(a('mittel', 'gesagt'), [])).toEqual({ x: 0.35, y: 0.5 });
    expect(punkt(a('niedrig', 'getan'), [])).toEqual({ x: 0.9, y: 0.15 });
    expect(punkt(a('hoch', 'erzaehlt'), [])).toEqual({ x: 0.65, y: 0.85 });
  });
  it('zwei Annahmen in derselben Zelle bekommen verschiedene Punkte, nach rechts unten versetzt', () => {
    const p1 = a('hoch', 'keiner', 'A1');
    const p2 = a('hoch', 'keiner', 'A2');
    const alle = [p1, p2];
    const k1 = punkt(p1, alle);
    const k2 = punkt(p2, alle);
    expect(k1).not.toEqual(k2);
    expect(k2.x).toBeCloseTo(k1.x + 0.06, 10);
    expect(k2.y).toBeCloseTo(k1.y - 0.06, 10);
  });
  it('Annahmen in anderen Zellen verschieben nicht', () => {
    const p1 = a('hoch', 'keiner', 'A1');
    const p2 = a('hoch', 'gesagt', 'A2');
    expect(punkt(p2, [p1, p2])).toEqual({ x: 0.35, y: 0.85 });
  });
  it('Versatz wird auf [0, 1] geklemmt', () => {
    const viele = Array.from({ length: 30 }, (_, i) => a('niedrig', 'getan', `A${i + 1}`));
    for (const p of viele) {
      const k = punkt(p, viele);
      expect(k.x).toBeLessThanOrEqual(1);
      expect(k.y).toBeGreaterThanOrEqual(0);
    }
  });
});
