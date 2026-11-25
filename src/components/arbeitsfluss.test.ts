import { describe, expect, it } from 'vitest';
import { ARTEFAKTE, METHODEN } from './methoden';
import {
  BEZUG, FOKUS_Y, GEO, HOEHE, LINIEN, PUNKT_REM, abweichung, fokusPfade, fokusStammX, fokusText, frueher, quellen,
  quellenAusBraucht, tourStationen, ziele, OHNE_STATION, SPALTEN, STATIONEN, ZEILEN, ergebnisse, heutigerTag, kommtAus, punktX, schieneY,
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

  it('kein Lego4Scrum (dieses Kursjahr stillgelegt): keine Station, kein Text', () => {
    expect(STATIONEN.filter((s) => texte(s).some((t) => /Lego/i.test(t))).map((s) => s.id)).toStrictEqual([]);
  });

  it('Stationen stehen je Tag in der Reihenfolge des Ablaufs, Zeilen ohne Lücke', () => {
    const tag4 = STATIONEN.filter((s) => s.spalte === 4).sort((a, b) => a.zeile - b.zeile).map((s) => s.id);
    expect(tag4).toStrictEqual([
      'value-map-nachholen', 'concept-story', 'geschaeftsmodell', 'experiment', 'story-map',
      'usage-story', 'prototyp-spike', 'baum-loesungen', 'scrum', 'origin-story',
    ]);
    const tag2 = STATIONEN.filter((s) => s.spalte === 2).sort((a, b) => a.zeile - b.zeile).map((s) => s.id);
    expect(tag2).toStrictEqual(['synthese', 'belege', 'journey-map']);
    for (const sp of SPALTEN) {
      const z = STATIONEN.filter((s) => s.spalte === sp.n).map((s) => s.zeile);
      expect(z, sp.tag).toStrictEqual(z.map((_, i) => i + 1));
    }
  });

  it('der Baum wächst an Tag 4 bis zu den Tests: Outcome und Annahme laufen hindurch', () => {
    const b = station('baum-loesungen')!;
    expect(b.spalte).toBe(4);
    expect([...b.linien].sort()).toStrictEqual(['annahme', 'outcome']);
    expect(b.zeile).toBeGreaterThan(station('prototyp-spike')!.zeile);
    expect(kommtAus(b)).toStrictEqual(['Baum mit Chancen', 'Ziel-Chance', 'Drei Lückensätze', 'Karte E1', 'Karte E2']);
  });

  it('Value Map & Fit an Tag 4 ist eine Fortsetzung der Station von Tag 3, kein neues Ergebnis', () => {
    const v = station('value-map-nachholen')!;
    expect([v.spalte, v.zeile, v.fortsetzung, ergebnisse(v)]).toStrictEqual([4, 1, 'value-map', []]);
    expect(station(v.fortsetzung!)?.spalte).toBe(3);
  });

  it('stillgelegte Methoden (Entscheidungslog) haben keine Station', () => {
    expect(OHNE_STATION).toContain('entscheidungslog');
    expect(STATIONEN.filter((s) => s.methode && OHNE_STATION.includes(s.methode)).map((s) => s.id)).toStrictEqual([]);
  });

  it('Spalte und Kurstag der Methode stimmen überein (Tag 5–7 in Spalte 5)', () => {
    const ab = STATIONEN.filter((s) => s.methode).filter((s) => spalteVonTag(METHODEN.find((m) => m.slug === s.methode)!.tag) !== s.spalte);
    expect(ab.map((s) => s.id)).toStrictEqual([]);
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
    // Tag 1, Annahme: Zeilen 3 und 4, Schiene oben (seit NDU-74 nicht mehr unten) → Stamm endet an der unteren (Zeile 4).
    expect(spaltenPfade(1, 'annahme').stamm).toBe(`M${stammX(1, 'annahme')} ${schieneY('annahme')}V${zeileY(4)}`);
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
    expect(aeste).toStrictEqual([1, 3].map((z) => `M${stammX(2, 'beleg')} ${zeileY(z)}H${punktX(2)}`));
  });

  it('Höhe und Zeilen sind endliche Zahlen (sonst wären die Pfade „NaN“)', () => {
    expect(Number.isFinite(HOEHE) && Number.isFinite(zeileY(1))).toBe(true);
    expect(spaltenPfade(4, 'outcome').stamm).not.toMatch(/NaN/);
  });

  it('Schienen liegen außerhalb der Stationszeilen, alle oben (Annahme läuft nicht mehr als Rahmen unten herum)', () => {
    for (const l of LINIEN) expect(schieneY(l), l).toBeLessThan(zeileY(1) - 50);
    expect(schieneY('annahme')).toBeGreaterThan(0);
    expect(HOEHE).toBe(GEO.oben + ZEILEN * GEO.zeile);
  });

  it('Reihenfolge ohne Kreuzung: die oberste Schiene hat den Stamm ganz rechts', () => {
    const nachSchiene = [...LINIEN].sort((a, b) => schieneY(a) - schieneY(b));
    const nachStamm = [...LINIEN].sort((a, b) => stammX(1, b) - stammX(1, a));
    expect(nachSchiene).toStrictEqual(nachStamm);
  });
});

describe('Kanten im Fokus (NDU-74)', () => {
  const ids = (l: { id: string }[]) => l.map((x) => x.id);

  it('von nennt nur bekannte Stationen und nie sich selbst', () => {
    for (const s of STATIONEN.filter((x) => x.von)) {
      expect(s.von!.filter((id) => !station(id)), s.id).toStrictEqual([]);
      expect(s.von, s.id).not.toContain(s.id);
      expect(new Set(s.von).size, s.id).toBe(s.von!.length);
    }
  });

  it('Zeitrichtung: jede Quelle liegt früher im Ablauf (frühere Spalte oder dieselbe, weiter oben)', () => {
    const rueckwaerts = STATIONEN.flatMap((s) => quellen(s).filter((q) => !frueher(q, s)).map((q) => `${q.id} → ${s.id}`));
    expect(rueckwaerts).toStrictEqual([]);
  });

  it('frueher erkennt eine Rückkante (sonst prüft der Test davor nichts)', () => {
    expect(frueher(station('origin-story')!, station('experiment')!)).toBe(false);
    expect(frueher(station('experiment')!, station('origin-story')!)).toBe(true);
    expect(frueher(station('baum')!, station('baum')!)).toBe(false);
  });

  it('keine losen Enden: jede Station hat eine Quelle (außer dem Start) und ein Ziel (außer sie endet oder ist Tag 5–7)', () => {
    expect(STATIONEN.filter((s) => quellen(s).length === 0).map((s) => s.id)).toStrictEqual(['map-entwurf']);
    expect(STATIONEN.filter((s) => ziele(s).length === 0 && !s.endet && s.spalte !== 5).map((s) => s.id)).toStrictEqual([]);
  });

  it('Ziele sind die Umkehrung der Quellen (plus, bei einer Fortsetzung, die späteren Ziele des Ursprungs)', () => {
    for (const s of STATIONEN) for (const q of quellen(s)) expect(ids(ziele(q)), `${q.id} → ${s.id}`).toContain(s.id);
    expect(ids(ziele(station('value-map-nachholen')!))).toStrictEqual(['concept-story', 'geschaeftsmodell', 'experiment', 'story-map', 'origin-story']);
  });

  it('Drift sichtbar: wo der Plan von braucht abweicht – feste Liste', () => {
    const ab = Object.fromEntries(STATIONEN.filter((s) => s.von).map((s) => [s.id, abweichung(s)]));
    expect(ab).toStrictEqual({
      'problem-rahmen': { dazu: ['map-entwurf'], weg: [] },
      belege: { dazu: ['annahmen', 'synthese'], weg: [] },
      kundenprofil: { dazu: ['problem-rahmen'], weg: [] },
      ideation: { dazu: ['ziel-chance'], weg: [] },
      'offene-fragen': { dazu: ['value-map'], weg: [] },
      'value-map-nachholen': { dazu: ['value-map'], weg: [] },
      experiment: { dazu: ['belege', 'offene-fragen'], weg: [] },
      'baum-loesungen': { dazu: ['baum', 'ziel-chance', 'ideation', 'experiment', 'prototyp-spike'], weg: [] },
      'origin-story': { dazu: ['experiment'], weg: ['annahmen', 'ideation', 'geschaeftsmodell'] },
      lernkarten: { dazu: ['experiment', 'prototyp-spike', 'baum-loesungen'], weg: [] },
      produktziel: { dazu: ['problem-rahmen', 'scrum'], weg: [] },
      backlog: { dazu: ['story-map', 'usage-story', 'prototyp-spike', 'origin-story', 'lernkarten', 'produktziel'], weg: [] },
    });
  });

  it('die Lücken aus B10 stehen im Plan, nicht in braucht (braucht verlängert die Prüf-Prompts)', () => {
    expect(ids(quellen(station('kundenprofil')!))).toContain('problem-rahmen');
    expect(ids(quellen(station('ideation')!))).toContain('ziel-chance');
    expect(METHODEN.find((m) => m.slug === 'kundenprofil')!.braucht).not.toContain('brief');
    expect(METHODEN.find((m) => m.slug === 'ideation')!.braucht).not.toContain('ziel');
  });

  it('ohne von folgen die Quellen aus braucht', () => {
    expect(ids(quellen(station('story-map')!))).toStrictEqual(ids(quellenAusBraucht(station('story-map')!)));
    expect(ids(quellen(station('prototyp-spike')!))).toStrictEqual(['annahmen', 'story-map', 'usage-story']);
  });

  it('Fußzeile: Kommt aus und Geht nach als Beschriftungen; Start und Ende mit eigenem Text', () => {
    expect(fokusText(station('prototyp-spike')!)).toStrictEqual({
      aus: 'Annahmen zum Problem · Story Map: Slice 1 · Usage Story mit Höhepunkt',
      nach: 'Baum: Lösungen und Tests · Lernkarten aus E1, E2 · Backlog, Sprint, Pitch',
    });
    expect(fokusText(station('map-entwurf')!).aus).toMatch(/beginnt/);
    expect(fokusText(station('backlog')!).nach).toBe(station('backlog')!.gebrauchtIn);
  });

  it('Tour: die Stationen eines Tags in der Reihenfolge des Ablaufs', () => {
    expect(ids(tourStationen(4))).toStrictEqual(STATIONEN.filter((s) => s.spalte === 4).sort((a, b) => a.zeile - b.zeile).map((s) => s.id));
    expect(tourStationen(4)).toHaveLength(10);
    expect(ids(tourStationen(6))).toStrictEqual(['lernkarten', 'produktziel', 'backlog']);
  });
});

describe('Fokus-Pfade (NDU-74)', () => {
  it('Story Map: ein Pfad je beteiligter Spalte, Schiene im oberen Band, Stamm auf der mittleren Spur, kein NaN', () => {
    const s = station('story-map')!;
    const p = fokusPfade(s);
    const spalten = [...new Set([s, ...quellen(s), ...ziele(s)].map((x) => x.spalte))].sort();
    expect(Object.keys(p).map(Number)).toStrictEqual(spalten);
    for (const sp of spalten) {
      expect(p[sp], `Spalte ${sp}`).toContain(`M${fokusStammX(sp)} ${FOKUS_Y}V`);
      expect(p[sp]).not.toMatch(/NaN|undefined/);
    }
    expect(FOKUS_Y).toBeLessThan(zeileY(1) - 50);
    // Spalte 4: Ast zur Story Map selbst und zu ihren Zielen Usage Story und Spike.
    for (const id of ['story-map', 'usage-story', 'prototyp-spike']) expect(p[4]).toContain(`M${fokusStammX(4)} ${zeileY(station(id)!.zeile)}H${punktX(4)}`);
    // Schiene von Spalte 3 (Kundenprofil, Value Map) nach 4.
    expect(p[4]).toContain(`M${fokusStammX(3)} ${FOKUS_Y}H${fokusStammX(4)}`);
  });

  it('eine Station ohne Kanten außerhalb ihrer Spalte zeichnet nur in ihrer Spalte', () => {
    expect(Object.keys(fokusPfade(station('hmw')!))).toStrictEqual(['3']);
  });
});

describe('Lesbarkeit bei 1280×720 (NDU-74)', () => {
  const pxX = BEZUG.planBreite / (SPALTEN.length * GEO.breite); // px je Einheit quer
  const pxY = BEZUG.zeileHoehe / GEO.zeile; // px je Einheit hoch
  const spuren = [...LINIEN].sort((a, b) => GEO.kanal[a] - GEO.kanal[b]);

  it('Stämme mindestens 10 px auseinander, lichte Lücke mindestens 5 px', () => {
    for (let i = 1; i < spuren.length; i++) {
      const [a, b] = [spuren[i - 1], spuren[i]];
      const mitte = (GEO.kanal[b] - GEO.kanal[a]) * pxX;
      expect(mitte, `${a}–${b}`).toBeGreaterThanOrEqual(10);
      expect(mitte - (BEZUG.strich[a] + BEZUG.strich[b]) / 2, `${a}–${b}`).toBeGreaterThanOrEqual(5);
    }
  });

  it('kein Punkt verdeckt einen Stamm: mindestens 3 px Luft bis zum äußersten Stamm, auch beim größten Punkt', () => {
    const aussen = spuren.at(-1)!;
    const groesster = Math.max(...Object.values(PUNKT_REM)) * BEZUG.rem;
    const luft = (GEO.punktX - GEO.kanal[aussen]) * pxX - groesster / 2 - BEZUG.strich[aussen] / 2;
    expect(luft).toBeGreaterThanOrEqual(3);
  });

  it('Schienen mindestens 10 px auseinander, Äste am Umsteigepunkt mindestens 5 px', () => {
    const ys = LINIEN.map(schieneY).sort((a, b) => a - b);
    for (let i = 1; i < ys.length; i++) expect((ys[i] - ys[i - 1]) * pxY).toBeGreaterThanOrEqual(10);
    expect(GEO.astAbstand * pxY).toBeGreaterThanOrEqual(5);
  });
});
