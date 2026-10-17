import { describe, expect, it } from 'vitest';
import beispiel from '../../beispiele/entscheidungen.json';
import { artefaktParsen, type Entscheidungen } from '../../schemas/index.js';
import { serverStandNachSpeichern } from '../huelle.js';
import { datumAnzeigen, ersetzen, ersetztVon, gespeicherteIds, loeschen, zeileHinzufuegen } from './entscheidungen-hilfen.js';

const leer = (): Entscheidungen => ({ schema: 'entscheidungen@1', stand: '2026-10-22', entscheidungen: [] });
const kaffeebar = () => structuredClone(beispiel) as Entscheidungen;

describe('zeileHinzufuegen', () => {
  it('vergibt fortlaufende IDs mit dem heutigen Datum', () => {
    let d = leer();
    const vergeben: string[] = [];
    for (const erwartet of ['D1', 'D2', 'D3']) {
      const r = zeileHinzufuegen(d, vergeben, '2026-10-22');
      expect(r.id).toBe(erwartet);
      vergeben.push(r.id);
      d = r.daten;
    }
    expect(d.entscheidungen.map((e) => [e.id, e.datum, e.beleg])).toEqual([
      ['D1', '2026-10-22', 'keiner'], ['D2', '2026-10-22', 'keiner'], ['D3', '2026-10-22', 'keiner'],
    ]);
    expect(artefaktParsen('entscheidungen', d).ok).toBe(true);
  });

  it('verwendet eine gelöschte ID nie wieder', () => {
    let d = leer();
    const vergeben: string[] = [];
    for (let i = 0; i < 3; i++) {
      const r = zeileHinzufuegen(d, vergeben, '2026-10-22');
      vergeben.push(r.id);
      d = r.daten;
    }
    const weg = loeschen(d, 'D3', new Set());
    expect(weg.ok).toBe(true);
    if (!weg.ok) return;
    expect(weg.daten.entscheidungen.map((e) => e.id)).toEqual(['D1', 'D2']);
    const r = zeileHinzufuegen(weg.daten, vergeben, '2026-10-23');
    expect(r.id).toBe('D4');
  });

  it('ändert die Eingabe nicht', () => {
    const d = kaffeebar();
    const vorher = structuredClone(d);
    zeileHinzufuegen(d, [], '2026-11-06');
    expect(d).toStrictEqual(vorher);
  });
});

describe('ersetzen', () => {
  it('ersetzen(D2) lässt D2 unverändert und legt D<n> mit ersetzt D2 an', () => {
    const d = kaffeebar();
    const d2 = structuredClone(d.entscheidungen[1]);
    const r = ersetzen(d, 'D2', [], '2026-11-06');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.id).toBe('D5');
    expect(r.daten.entscheidungen[1]).toStrictEqual(d2);
    const neu = r.daten.entscheidungen.at(-1)!;
    expect(neu).toStrictEqual({
      id: 'D5', datum: '2026-11-06', entscheidung: d2!.entscheidung, grund: '', beleg: 'keiner', belegIds: [], ersetzt: 'D2',
    });
    expect(ersetztVon(r.daten, 'D2')?.id).toBe('D5');
    expect(artefaktParsen('entscheidungen', r.daten).ok).toBe(true);
  });

  it('nimmt auch vergebene, aber gelöschte IDs nicht wieder', () => {
    const r = ersetzen(kaffeebar(), 'D2', ['D7'], '2026-11-06');
    expect(r.ok && r.id).toBe('D8');
  });

  it('verweigert, eine schon ersetzte Zeile noch einmal zu ersetzen', () => {
    const d = kaffeebar(); // D1 ist schon durch D3 ersetzt
    const r = ersetzen(d, 'D1', [], '2026-11-06');
    expect(r).toStrictEqual({ ok: false, grund: 'D1 ist schon durch D3 ersetzt.' });
  });

  it('verweigert eine unbekannte Zeile', () => {
    expect(ersetzen(kaffeebar(), 'D9', [], '2026-11-06')).toStrictEqual({ ok: false, grund: 'Die Entscheidung D9 gibt es nicht.' });
  });
});

describe('loeschen', () => {
  it('verweigert gespeicherte Zeilen', () => {
    const r = loeschen(kaffeebar(), 'D4', new Set(['D1', 'D2', 'D3', 'D4']));
    expect(r).toStrictEqual({ ok: false, grund: 'D4 ist schon gespeichert und bleibt im Log. Ersetze sie stattdessen.' });
  });

  it('verweigert eine Zeile, die eine andere ersetzt (die neue zeigt sonst ins Leere)', () => {
    let d = leer();
    const a = zeileHinzufuegen(d, [], '2026-10-22');
    d = a.daten;
    const b = ersetzen(d, 'D1', ['D1'], '2026-10-22');
    expect(b.ok).toBe(true);
    if (!b.ok) return;
    expect(loeschen(b.daten, 'D1', new Set())).toStrictEqual({ ok: false, grund: 'D1 ist durch D2 ersetzt. Lösch zuerst D2.' });
    // Die ersetzende Zeile darf weg, dann ist D1 wieder frei.
    const c = loeschen(b.daten, 'D2', new Set());
    expect(c.ok).toBe(true);
    if (!c.ok) return;
    expect(ersetztVon(c.daten, 'D1')).toBeUndefined();
  });
});

describe('gespeichert aus der Editor-Hülle', () => {
  it('ohne Datei auf dem Server ist nichts gespeichert', () => {
    expect(gespeicherteIds(null)).toStrictEqual(new Set());
  });

  it('nach dem Speichern ist eine neue Zeile nicht mehr löschbar', () => {
    const r = zeileHinzufuegen(kaffeebar(), [], '2026-11-06'); // D5, noch nicht gespeichert
    expect(loeschen(r.daten, 'D5', gespeicherteIds(kaffeebar())).ok).toBe(true);
    const nachher = serverStandNachSpeichern(kaffeebar(), { basisSha: 'sha-2' }, r.daten);
    expect(loeschen(r.daten, 'D5', gespeicherteIds(nachher))).toStrictEqual({
      ok: false, grund: 'D5 ist schon gespeichert und bleibt im Log. Ersetze sie stattdessen.',
    });
  });

  it('nach einem Konflikt bleibt sie löschbar', () => {
    const r = zeileHinzufuegen(kaffeebar(), [], '2026-11-06');
    const nachher = serverStandNachSpeichern(kaffeebar(), { konflikt: true }, r.daten);
    expect(loeschen(r.daten, 'D5', gespeicherteIds(nachher)).ok).toBe(true);
  });
});

describe('Datum', () => {
  it('zeigt österreichisch an', () => {
    expect(datumAnzeigen('2026-10-22')).toBe('22.10.2026');
  });
});
