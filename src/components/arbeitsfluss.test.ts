import { describe, expect, it } from 'vitest';
import { ARTEFAKTE, METHODEN } from './methoden';
import {
  HOEHE, LINIEN, OHNE_STATION, SPALTEN, STATIONEN, ZEILEN, ergebnisse, heutigerTag, kommtAus, punktX, schieneY,
  spaltenPfade, spalteVonTag, stammX, station, stationVonArtefakt, woerter, zeileY,
} from './arbeitsfluss';

const texte = (s: (typeof STATIONEN)[number]) => [s.kurz, s.satz, s.gebrauchtIn, s.zusatz ?? '', s.jetzt ?? '', ...(s.kommtAus ?? [])];

describe('Stationen des Arbeitsflusses', () => {
  it('jede Methode bis Tag 4 hat eine Station (außer stillgelegten)', () => {
    const ohne = METHODEN.filter((m) => m.tag <= 4 && !OHNE_STATION.includes(m.slug))
      .filter((m) => !STATIONEN.some((s) => s.methode === m.slug)).map((m) => m.slug);
    expect(ohne).toStrictEqual([]);
  });

  it('kein Entscheidungslog: keine Station, kein Ergebnis, kein Text', () => {
    expect(STATIONEN.filter((s) => s.methode === 'entscheidungslog' || ergebnisse(s).includes('entscheidungen')).map((s) => s.id)).toStrictEqual([]);
    expect(STATIONEN.filter((s) => texte(s).some((t) => /Entscheidungslog/i.test(t))).map((s) => s.id)).toStrictEqual([]);
  });

  it('die Concept Story steht an Tag 4', () => {
    expect(station('concept-story')?.spalte).toBe(4);
  });

  it('jede Beschriftung hat höchstens fünf Wörter', () => {
    const lang = STATIONEN.filter((s) => woerter(s.kurz) > 5).map((s) => s.kurz);
    expect(lang).toStrictEqual([]);
    expect(woerter('Annahmen der Idee, Karte E1')).toBe(5);
    expect(woerter('Ein Satz mit sechs langen Wörtern')).toBe(6);
  });

  it('IDs eindeutig, Methoden und Artefakte bekannt, Raster gültig, jede Zelle einmal', () => {
    expect(new Set(STATIONEN.map((s) => s.id)).size).toBe(STATIONEN.length);
    for (const s of STATIONEN) {
      if (s.methode) expect(METHODEN.some((m) => m.slug === s.methode), s.id).toBe(true);
      for (const a of ergebnisse(s)) expect(ARTEFAKTE.some((x) => x.id === a), `${s.id}: ${a}`).toBe(true);
      expect(s.zeile >= 1 && s.zeile <= ZEILEN, s.id).toBe(true);
      expect(SPALTEN.some((sp) => sp.n === s.spalte), s.id).toBe(true);
      expect(s.linien.length > 0 && s.linien.every((l) => LINIEN.includes(l)), s.id).toBe(true);
    }
    const zellen = STATIONEN.map((s) => `${s.spalte}/${s.zeile}`);
    expect(new Set(zellen).size).toBe(zellen.length);
  });

  it('jedes Ergebnis bis Tag 4 entsteht an genau einer Station (das stillgelegte Log ausgenommen)', () => {
    const ids = METHODEN.filter((m) => m.tag <= 4 && !OHNE_STATION.includes(m.slug)).flatMap((m) => m.ergibt);
    for (const id of ids) expect(STATIONEN.filter((s) => ergebnisse(s).includes(id)).length, id).toBe(1);
  });

  it('genau ein Stern: Slice 1 der Story Map', () => {
    expect(STATIONEN.filter((s) => s.stern).map((s) => s.id)).toStrictEqual(['story-map']);
  });

  it('jede Linie läuft von Tag 1 bis Tag 5–7', () => {
    for (const l of LINIEN) {
      const sp = STATIONEN.filter((s) => s.linien.includes(l)).map((s) => s.spalte);
      expect([Math.min(...sp), Math.max(...sp)], l).toStrictEqual([1, 5]);
    }
  });
});

describe('Übergangsstreifen auf den Methodenseiten', () => {
  const seiten = import.meta.glob('../pages/innolab/methoden/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
  const quelle = (slug: string) => seiten[`../pages/innolab/methoden/${slug}.astro`];

  it('jede Station mit Methodenseite hat ihren Streifen dort, genau einmal', () => {
    const mitSeite = STATIONEN.filter((s) => s.methode && quelle(s.methode));
    expect(mitSeite.length).toBeGreaterThan(15);
    const fehlt = mitSeite.filter((s) => (quelle(s.methode!).match(new RegExp(`<Uebergang station="${s.id}"`, 'g')) ?? []).length !== 1);
    expect(fehlt.map((s) => s.id)).toStrictEqual([]);
  });

  it('kein Streifen verweist auf eine unbekannte Station', () => {
    const ids = Object.values(seiten).flatMap((q) => [...q.matchAll(/<Uebergang station="([^"]+)"/g)].map((m) => m[1]));
    expect(ids.filter((id) => !station(id))).toStrictEqual([]);
  });
});

describe('kommtAus', () => {
  it('folgt ohne Überschreibung aus braucht – als Beschriftungen der Stationen', () => {
    expect(kommtAus(station('kundenprofil')!)).toStrictEqual(['Snapshots mit Zitat-IDs', 'Baum mit Chancen', 'Ziel-Chance']);
    expect(kommtAus(station('value-map')!)).toStrictEqual(['Kundenprofil', 'Drei Lückensätze']);
  });

  it('nimmt die Überschreibung, wo eine steht', () => {
    expect(kommtAus(station('origin-story')!)).toStrictEqual(['Concept Story', 'Value Map', 'Karte E1']);
  });

  it('lässt das stillgelegte Log weg und hat für jede Station mit Methode etwas', () => {
    expect(stationVonArtefakt('entscheidungen')).toBeUndefined();
    for (const s of STATIONEN.filter((x) => x.methode)) expect(kommtAus(s).length, s.id).toBeGreaterThan(0);
  });
});

describe('Kurstag und Spalte', () => {
  it('Tag 5, 6 und 7 teilen sich Spalte 5', () => {
    expect([1, 4, 5, 6, 7].map(spalteVonTag)).toStrictEqual([1, 4, 5, 5, 5]);
  });

  it('heute ist der letzte Termin am oder vor dem Datum', () => {
    const tage = [{ n: 1, datum: '2026-10-22' }, { n: 2, datum: '2026-11-12' }, { n: 3 }];
    expect(heutigerTag('2026-10-21', tage)).toBeUndefined();
    expect(heutigerTag('2026-10-22', tage)).toBe(1);
    expect(heutigerTag('2026-11-20', tage)).toBe(2);
  });
});

describe('Geometrie', () => {
  it('Stamm reicht von der Schiene bis zur fernsten Station der Linie in der Spalte', () => {
    // Tag 1, Annahme: Zeilen 7 und 8, Schiene unten → Stamm endet an der oberen (Zeile 7).
    expect(spaltenPfade(1, 'annahme').stamm).toBe(`M${stammX(1, 'annahme')} ${schieneY('annahme')}V${zeileY(7)}`);
    // Tag 3, Beleg: Zeilen 1–6, Schiene oben → bis Zeile 6.
    expect(spaltenPfade(3, 'beleg').stamm).toBe(`M${stammX(3, 'beleg')} ${schieneY('beleg')}V${zeileY(6)}`);
  });

  it('Schiene verbindet mit der letzten früheren Spalte der Linie, überspringt leere', () => {
    expect(spaltenPfade(1, 'outcome').schiene).toBeUndefined();
    expect(spaltenPfade(2, 'outcome')).toStrictEqual({ aeste: [] });
    expect(spaltenPfade(3, 'outcome').schiene).toBe(`M${stammX(1, 'outcome')} ${schieneY('outcome')}H${stammX(3, 'outcome')}`);
  });

  it('ein Ast je Station der Linie, vom Stamm zum Punkt', () => {
    const { aeste } = spaltenPfade(2, 'beleg');
    expect(aeste).toStrictEqual([2, 3].map((z) => `M${stammX(2, 'beleg')} ${zeileY(z)}H${punktX(2)}`));
  });

  it('Schienen liegen außerhalb der Stationszeilen', () => {
    expect(schieneY('outcome')).toBeLessThan(zeileY(1) - 50);
    expect(schieneY('beleg')).toBeLessThan(zeileY(1) - 50);
    expect(schieneY('annahme')).toBeGreaterThan(zeileY(ZEILEN) + 50);
    expect(schieneY('annahme')).toBeLessThan(HOEHE);
  });
});
