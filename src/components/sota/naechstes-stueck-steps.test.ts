import { describe, expect, it } from 'vitest';
import { STEPS, gewaehlterKandidat, spitze, summe, zustandAt, type Zustand } from './naechstes-stueck-steps';

const texte = (z: Zustand) => z.kontext.map((s) => s.text).join('');
const arten = (z: Zustand) => z.kontext.map((s) => s.art);

describe('naechstes-stueck-steps', () => {
  it('hat zwölf Schritte mit Titel und Text', () => {
    expect(STEPS).toHaveLength(12);
    for (const s of STEPS) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.text.length).toBeGreaterThan(0);
    }
  });

  it('wirft bei Schritten außerhalb von 1–12', () => {
    expect(() => zustandAt(0)).toThrow(RangeError);
    expect(() => zustandAt(13)).toThrow(RangeError);
    expect(() => zustandAt(1.5)).toThrow(RangeError);
  });

  it('jede Verteilung summiert sich auf 100 % und ist absteigend sortiert', () => {
    for (let step = 1; step <= 12; step++) {
      const v = zustandAt(step).verteilung;
      if (!v) continue;
      expect(summe(v)).toBe(100);
      const ps = v.kandidaten.map((k) => k.p);
      expect(ps).toStrictEqual([...ps].sort((a, b) => b - a));
    }
  });

  it('ein gewählter Kandidat steht immer in der Verteilung', () => {
    for (let step = 1; step <= 12; step++) {
      const z = zustandAt(step);
      if (z.gewaehlt === undefined) continue;
      expect(gewaehlterKandidat(z)).toBeDefined();
    }
  });

  it('Schritt 1 zeigt nur den Auftrag, noch keine Balken', () => {
    const z = zustandAt(1);
    expect(z.verteilung).toBeUndefined();
    expect(arten(z).every((a) => a === 'prompt')).toBe(true);
  });

  it('das gewählte Stück wird angehängt und ist danach Teil des Kontexts', () => {
    const vorher = zustandAt(3);
    const nachher = zustandAt(4);
    expect(nachher.kontext.slice(0, vorher.kontext.length)).toStrictEqual(vorher.kontext);
    const neu = nachher.kontext[vorher.kontext.length];
    expect(neu.art).toBe('erzeugt');
    expect(neu.text).toBe(gewaehlterKandidat(vorher)!.text);
  });

  it('Schritt 4 rechnet eine neue Verteilung', () => {
    expect(zustandAt(4).verteilung!.id).not.toBe(zustandAt(3).verteilung!.id);
  });

  it('Schritt 5 setzt den Text ohne Balken mit mehreren erzeugten Stücken fort', () => {
    const z = zustandAt(5);
    expect(z.verteilung).toBeUndefined();
    expect(arten(z).filter((a) => a === 'erzeugt').length).toBeGreaterThanOrEqual(4);
    expect(texte(z).startsWith(texte(zustandAt(4)))).toBe(true);
  });

  it('bei Code ist die Verteilung spitz, bei wenig Gesehenem flach', () => {
    expect(spitze(zustandAt(6).verteilung!)).toBeGreaterThanOrEqual(90);
    expect(spitze(zustandAt(7).verteilung!)).toBeLessThanOrEqual(25);
  });

  it('Schritt 8 wählt in der flachen Verteilung, Schritt 9 macht sie mit Doku spitz', () => {
    const flach = zustandAt(8);
    expect(flach.verteilung!.id).toBe(zustandAt(7).verteilung!.id);
    expect(gewaehlterKandidat(flach)).toBeDefined();

    const mitDoku = zustandAt(9);
    expect(arten(mitDoku)).toContain('doku');
    expect(spitze(mitDoku.verteilung!)).toBeGreaterThanOrEqual(90);
    // Gleiche Frage wie in Schritt 7 – nur die Doku davor ist neu.
    expect(texte(mitDoku).endsWith(texte(zustandAt(7)))).toBe(true);
    // In der flachen Verteilung gewinnt etwas anderes als mit Doku.
    expect(gewaehlterKandidat(flach)!.text).not.toBe(mitDoku.verteilung!.kandidaten[0].text);
  });

  it('Session 2 startet mit exakt demselben Auftrag und denselben Balken wie Session 1', () => {
    const s1 = zustandAt(3);
    const s2 = zustandAt(10);
    expect(s1.session).toBe(1);
    expect(s2.session).toBe(2);
    expect(s2.kontext).toStrictEqual(zustandAt(1).kontext);
    expect(s2.verteilung).toStrictEqual(s1.verteilung);
    expect(s2.gewaehlt).toBeUndefined();
  });

  it('in Session 2 fällt der Würfel auf einen anderen, schwächeren Kandidaten', () => {
    const s1 = gewaehlterKandidat(zustandAt(3))!;
    const s2 = gewaehlterKandidat(zustandAt(11))!;
    expect(s2.text).not.toBe(s1.text);
    expect(s2.p).toBeLessThan(s1.p);
  });

  it('Schritt 12 vergleicht zwei verschiedene Ergebnisse mit demselben Anfang', () => {
    const v = zustandAt(12).vergleich!;
    expect(v).toHaveLength(2);
    const [a, b] = v.map((e) => e.stuecke.map((s) => s.text).join(''));
    const auftrag = texte(zustandAt(1));
    expect(a.startsWith(auftrag)).toBe(true);
    expect(b.startsWith(auftrag)).toBe(true);
    expect(a).not.toBe(b);
    // Session 1 endet mit dem Text aus Schritt 5.
    expect(a).toBe(texte(zustandAt(5)));
  });

  it('Stück-IDs sind innerhalb eines Zustands eindeutig', () => {
    for (let step = 1; step <= 12; step++) {
      const z = zustandAt(step);
      const listen = [z.kontext, ...(z.vergleich ?? []).map((e) => e.stuecke)];
      for (const l of listen) expect(new Set(l.map((s) => s.id)).size).toBe(l.length);
    }
  });
});
