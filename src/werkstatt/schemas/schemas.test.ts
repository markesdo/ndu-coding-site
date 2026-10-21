import { describe, expect, it } from 'vitest';
import { ARTEFAKT_NAMEN } from './namen';
import { ARTEFAKTE, artefaktParsen, BELEGSTUFEN, BELEGSTUFE_TEXT, WICHTIGKEITEN, MIGRATIONEN, punkt, quadrant, BELEG_NOTIZ_MAX, type Annahme } from './index';
import brief from '../beispiele/brief.json';
import entscheidungen from '../beispiele/entscheidungen.json';
import leitfaden from '../beispiele/leitfaden.json';
import annahmen from '../beispiele/annahmen.json';
import interviews from '../beispiele/interviews.json';

const beispiele = { brief, entscheidungen, leitfaden, annahmen, interviews } as const;

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
    if (!r.ok) throw new Error('unerwartet');
    expect(r.daten.entscheidungen.find((e) => e.id === 'D3')?.ersetzt).toBe('D1');
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
  it('ersetzt zeigt auf eine spätere Zeile → Fehler', () => {
    const e = klon(entscheidungen);
    delete e.entscheidungen[2].ersetzt;
    e.entscheidungen[0].ersetzt = 'D2';
    expect(fehlerPfade('entscheidungen', e)).toContain('entscheidungen.0.ersetzt');
  });
  it('D1 ersetzt D2 und D2 ersetzt D1 (Zyklus) → Fehler', () => {
    const e = klon(entscheidungen);
    delete e.entscheidungen[2].ersetzt;
    e.entscheidungen[0].ersetzt = 'D2';
    e.entscheidungen[1].ersetzt = 'D1';
    expect(fehlerPfade('entscheidungen', e)).toContain('entscheidungen.0.ersetzt');
  });
  it('zwei Zeilen ersetzen dieselbe Zeile → Fehler an der zweiten', () => {
    const e = klon(entscheidungen);
    e.entscheidungen[1].ersetzt = 'D1'; // D3 ersetzt D1 schon
    expect(fehlerPfade('entscheidungen', e)).toContain('entscheidungen.2.ersetzt');
  });
  it('eine frühere Zeile ersetzen, jede höchstens einmal → gültig', () => {
    const e = klon(entscheidungen);
    e.entscheidungen[3].ersetzt = 'D2';
    expect(artefaktParsen('entscheidungen', e).ok).toBe(true);
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
  it('belegNotiz ist optional, höchstens 120 Zeichen und einzeilig', () => {
    const e = klon(entscheidungen);
    e.entscheidungen[1].belegNotiz = 'x'.repeat(120);
    expect(artefaktParsen('entscheidungen', e).ok).toBe(true);
    e.entscheidungen[1].belegNotiz = 'x'.repeat(121);
    expect(fehlerPfade('entscheidungen', e)).toContain('entscheidungen.1.belegNotiz');
    expect(JSON.stringify(artefaktParsen('entscheidungen', e))).toContain('höchstens 120 Zeichen');
    e.entscheidungen[1].belegNotiz = 'Kassendaten\nSeptember';
    expect(fehlerPfade('entscheidungen', e)).toContain('entscheidungen.1.belegNotiz');
    e.entscheidungen[1].belegNotiz = 5;
    expect(fehlerPfade('entscheidungen', e)).toContain('entscheidungen.1.belegNotiz');
  });
  it('belegNotiz lehnt Steuer- und Formatzeichen sowie Rand-Leerraum ab', () => {
    const e = klon(entscheidungen);
    const pruefe = (notiz: string) => {
      e.entscheidungen[1].belegNotiz = notiz;
      return JSON.stringify(artefaktParsen('entscheidungen', e));
    };
    for (const schlecht of ['a\u202Eb', 'a\u0085b', 'a\u2028b', 'a\u2029b', 'a\tb', 'a\u0000b']) {
      expect(pruefe(schlecht), JSON.stringify(schlecht)).toContain('eine Zeile, ohne Steuerzeichen');
    }
    for (const schlecht of [' ', ' x', 'x ', '\u00A0x']) {
      expect(pruefe(schlecht), JSON.stringify(schlecht)).toContain('ohne Leerzeichen am Anfang oder Ende');
    }
    expect(pruefe('Kassendaten September')).toContain('"ok":true');
    expect(pruefe('\u{1F469}\u200D\u{1F4BB} Kasse')).toContain('"ok":true');
  });
  it('belegNotiz zählt Grapheme: 120 zerlegte é erlaubt, 121 abgelehnt', () => {
    const e = klon(entscheidungen);
    e.entscheidungen[1].belegNotiz = 'e\u0301'.repeat(BELEG_NOTIZ_MAX);
    expect(artefaktParsen('entscheidungen', e).ok).toBe(true);
    e.entscheidungen[1].belegNotiz = 'e\u0301'.repeat(BELEG_NOTIZ_MAX + 1);
    expect(fehlerPfade('entscheidungen', e)).toContain('entscheidungen.1.belegNotiz');
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
  it('Art „ethisch“ (Torres, ab Tag 3) ist gültig, eine erfundene Art nicht', () => {
    const a = klon(annahmen);
    a.annahmen[0].art = 'ethisch';
    expect(artefaktParsen('annahmen', a).ok).toBe(true);
    a.annahmen[0].art = 'rechtlich';
    expect(fehlerPfade('annahmen', a)).toContain('annahmen.0.art');
  });
  it('wichtig außerhalb hoch/mittel/niedrig → Fehler', () => {
    const a = klon(annahmen);
    a.annahmen[0].wichtig = 'sehr';
    expect(fehlerPfade('annahmen', a)).toContain('annahmen.0.wichtig');
  });
  it('belegNotiz ist optional: alte Dateien ohne das Feld bleiben gültig, ohne dass es dazukommt', () => {
    const a = klon(annahmen);
    expect(a.annahmen.some((z: Record<string, unknown>) => 'belegNotiz' in z)).toBe(false);
    const r = artefaktParsen('annahmen', a);
    expect('fehler' in r ? r.fehler : []).toStrictEqual([]);
    if (!('daten' in r)) return;
    expect(r.daten.annahmen[1]).toStrictEqual(a.annahmen[1]);
  });
  it('belegNotiz bleibt beim Parsen erhalten, höchstens 120 Zeichen und einzeilig, mit denselben Meldungen wie im Entscheidungslog', () => {
    const a = klon(annahmen);
    a.annahmen[1].belegNotiz = 'Kassendaten September';
    const r = artefaktParsen('annahmen', a);
    expect('fehler' in r ? r.fehler : []).toStrictEqual([]);
    if (!('daten' in r)) return;
    expect(r.daten.annahmen[1]!.belegNotiz).toBe('Kassendaten September');
    a.annahmen[1].belegNotiz = 'x'.repeat(BELEG_NOTIZ_MAX);
    expect(artefaktParsen('annahmen', a).ok).toBe(true);
    const meldung = (notiz: unknown) => {
      a.annahmen[1].belegNotiz = notiz;
      const p = artefaktParsen('annahmen', a);
      return 'fehler' in p ? p.fehler.find((f) => f.pfad === 'annahmen.1.belegNotiz')?.meldung : undefined;
    };
    expect(meldung('x'.repeat(BELEG_NOTIZ_MAX + 1))).toBe('Beleg (Notiz): höchstens 120 Zeichen. Kürze die Notiz oder nenne nur die Quelle.');
    expect(meldung('Kassendaten\nSeptember')).toBe('Beleg-Notiz: eine Zeile, ohne Steuerzeichen');
    expect(meldung(' Kasse')).toBe('Beleg-Notiz: ohne Leerzeichen am Anfang oder Ende');
    expect(meldung(5)).toBe('Beleg (Notiz): bitte als Text eintragen.');
  });
});

const a = (wichtig: Annahme['wichtig'], beleg: Annahme['beleg'], id = 'A1'): Annahme => ({
  id, text: 't', art: 'machbar', wichtig, beleg, belegIds: [],
});

describe('quadrant', () => {
  it('hoch + keiner → or (zuerst testen, wie bei Bland und Torres)', () => {
    expect(quadrant({ wichtig: 'hoch', beleg: 'keiner' })).toBe('or');
  });
  it('niedrig + getan → ul', () => {
    expect(quadrant({ wichtig: 'niedrig', beleg: 'getan' })).toBe('ul');
  });
  it('alle Kombinationen', () => {
    expect(quadrant({ wichtig: 'hoch', beleg: 'gesagt' })).toBe('or');
    expect(quadrant({ wichtig: 'hoch', beleg: 'erzaehlt' })).toBe('ol');
    expect(quadrant({ wichtig: 'hoch', beleg: 'getan' })).toBe('ol');
    expect(quadrant({ wichtig: 'mittel', beleg: 'keiner' })).toBe('ur');
    expect(quadrant({ wichtig: 'niedrig', beleg: 'gesagt' })).toBe('ur');
    expect(quadrant({ wichtig: 'mittel', beleg: 'erzaehlt' })).toBe('ul');
  });
});

describe('punkt', () => {
  const XB = { getan: [0, 0.25], erzaehlt: [0.25, 0.5], gesagt: [0.5, 0.75], keiner: [0.75, 1] } as const;
  const YB = { niedrig: [0, 0.25], mittel: [0.25, 0.5], hoch: [0.5, 1] } as const;
  const zellen = BELEGSTUFEN.flatMap((beleg) => WICHTIGKEITEN.map((wichtig) => ({ beleg, wichtig })));
  const liste = (wichtig: Annahme['wichtig'], beleg: Annahme['beleg'], n: number) =>
    Array.from({ length: n }, (_, i) => a(wichtig, beleg, `A${i + 1}`));

  it('eine einzelne Annahme liegt in der Rechteckmitte ihrer Zelle', () => {
    expect(punkt(a('hoch', 'keiner'), [])).toEqual({ x: 0.875, y: 0.75 });
    expect(punkt(a('mittel', 'gesagt'), [])).toEqual({ x: 0.625, y: 0.375 });
    expect(punkt(a('niedrig', 'getan'), [])).toEqual({ x: 0.125, y: 0.125 });
    expect(punkt(a('hoch', 'erzaehlt'), [])).toEqual({ x: 0.375, y: 0.75 });
  });
  it.each(zellen.flatMap((z) => [1, 5, 12].map((n) => ({ ...z, n }))))(
    '$n Annahmen in $wichtig/$beleg: verschieden, im Rechteck und im passenden Quadranten',
    ({ wichtig, beleg, n }) => {
      const alle = liste(wichtig, beleg, n);
      const punkte = alle.map((p) => punkt(p, alle));
      expect(new Set(punkte.map((p) => `${p.x}|${p.y}`)).size).toBe(n);
      const [x0, x1] = XB[beleg];
      const [y0, y1] = YB[wichtig];
      for (const p of punkte) {
        expect(p.x).toBeGreaterThanOrEqual(x0);
        expect(p.x).toBeLessThanOrEqual(x1);
        expect(p.y).toBeGreaterThanOrEqual(y0);
        expect(p.y).toBeLessThanOrEqual(y1);
        expect(`${p.y > 0.5 ? 'o' : 'u'}${p.x > 0.5 ? 'r' : 'l'}`).toBe(quadrant({ wichtig, beleg }));
      }
    },
  );
  it('Nachbarzellen im selben Quadranten (mittel/keiner, mittel/gesagt, je 3): keine zwei Punkte näher als 0,05', () => {
    const alle = [
      ...liste('mittel', 'keiner', 3),
      ...liste('mittel', 'gesagt', 3).map((p) => ({ ...p, id: `B${p.id}` })),
    ];
    const punkte = alle.map((p) => punkt(p, alle));
    for (let i = 0; i < punkte.length; i++) {
      for (let j = i + 1; j < punkte.length; j++) {
        expect(Math.hypot(punkte[i]!.x - punkte[j]!.x, punkte[i]!.y - punkte[j]!.y)).toBeGreaterThanOrEqual(0.05);
      }
    }
  });
  it('Annahmen in anderen Zellen verschieben nicht', () => {
    const p1 = a('hoch', 'keiner', 'A1');
    const p2 = a('hoch', 'gesagt', 'A2');
    expect(punkt(p2, [p1, p2])).toEqual(punkt(p2, []));
  });
});

describe('Interviews', () => {
  it('ohne Einwilligung wird nicht gespeichert', () => {
    const roh = klon(interviews);
    roh.interviews[1].einwilligung = false;
    expect(fehlerPfade('interviews', roh)).toStrictEqual(['interviews.1.einwilligung']);
  });

  it('Pseudonym ist Pflicht', () => {
    const roh = klon(interviews);
    roh.interviews[0].pseudonym = '  ';
    expect(fehlerPfade('interviews', roh)).toStrictEqual(['interviews.0.pseudonym']);
  });

  it('Zitat-IDs gehören zum eigenen Interview', () => {
    const roh = klon(interviews);
    roh.interviews[1].zitate[0].id = 'I3-9';
    expect(fehlerPfade('interviews', roh)).toStrictEqual(['interviews.1.zitate.0.id']);
  });

  it('Belege einer Chance verweisen auf vorhandene Zitate desselben Interviews', () => {
    const roh = klon(interviews);
    roh.interviews[1].chancen[0].belege = ['I2-2', 'I2-7'];
    expect(fehlerPfade('interviews', roh)).toStrictEqual(['interviews.1.chancen.0.belege.1']);
  });

  it('doppelte Interview-IDs', () => {
    const roh = klon(interviews);
    roh.interviews[2].id = 'I2';
    roh.interviews[2].zitate = [];
    roh.interviews[2].chancen = [];
    expect(fehlerPfade('interviews', roh)).toStrictEqual(['interviews.2.id']);
  });
});

describe('Interviews: ein Fehler pro Stelle', () => {
  it('kaputte Zitat-ID meldet nur die Form, nicht zusätzlich den Besitz', () => {
    const roh = klon(interviews);
    roh.interviews[1].zitate[0].id = 'x';
    roh.interviews[1].chancen = [];
    expect(fehlerPfade('interviews', roh)).toStrictEqual(['interviews.1.zitate.0.id']);
  });
});
