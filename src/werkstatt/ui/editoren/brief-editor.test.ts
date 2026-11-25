import { describe, expect, it } from 'vitest';
import beispiel from '../../beispiele/brief.json';
import { ARTEFAKTE, artefaktParsen, type Brief } from '../../schemas/index.js';
import { readFileSync } from 'node:fs';
import { briefKarten, produktSatzSetzen, PRODUKTSATZ_HILFE, PRODUKTSATZ_OFFEN } from './brief-hilfen.js';
import { briefRendern } from '../../render/brief.js';

const leer = ARTEFAKTE.brief.leer('2026-10-22');
const kaffeebar = beispiel as Brief;

describe('briefKarten', () => {
  it('liefert die Abschnitte 1 bis 7 in der Reihenfolge der Vorlage', () => {
    const k = briefKarten(leer);
    expect(k.map((x) => x.nr)).toStrictEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(k.map((x) => x.titel)).toStrictEqual([
      'Für wen?', 'Welches Problem?', 'Was ist das Produkt in einem Satz?', 'Was macht es NICHT?',
      'Was gehört ins MVP?', 'Woran merken wir, dass es funktioniert?', 'Offene Fragen',
    ]);
  });

  it('zeigt „Offen – steht nach Tag 4 fest.“, solange das Produkt in einem Satz leer ist', () => {
    const drei = briefKarten(leer)[2];
    expect(drei.absaetze).toStrictEqual([]);
    expect(drei.leerText).toBe(PRODUKTSATZ_OFFEN);
    expect(PRODUKTSATZ_OFFEN).toBe('Offen – steht nach Tag 4 fest.');
    // nur Leerzeichen zählt als leer
    expect(briefKarten({ ...leer, produktSatz: '   ' })[2].absaetze).toStrictEqual([]);
  });

  // NDU-66: Vorschau, Hilfe im Editor und Markdown nennen denselben Tag, an dem Abschnitt 3 feststeht (Tag 4).
  it('Hilfe im Editor, Vorschau und Markdown nennen denselben Tag für Abschnitt 3', () => {
    const tag = (s: string) => s.match(/nach Tag (\d)/)?.[1];
    expect(PRODUKTSATZ_HILFE).toBe('Lass das Feld heute leer. Es steht nach Tag 4 fest.');
    expect([tag(PRODUKTSATZ_HILFE), tag(PRODUKTSATZ_OFFEN), tag(briefRendern(leer))]).toStrictEqual(['4', '4', '4']);
    const editor = readFileSync(new URL('./BriefEditor.tsx', import.meta.url), 'utf8');
    expect(editor).toContain('hilfe={PRODUKTSATZ_HILFE}');
    expect(editor).not.toMatch(/nach Tag \d/);
  });

  it('zeigt den Satz, sobald er da ist', () => {
    expect(briefKarten({ ...leer, produktSatz: 'Kaffee vorbestellen.' })[2].absaetze).toStrictEqual(['Kaffee vorbestellen.']);
  });

  it('füllt die Karten aus dem Kaffeebar-Beispiel', () => {
    const k = briefKarten(kaffeebar);
    expect(k[0].absaetze[0]).toBe(kaffeebar.fuerWen);
    expect(k[1].absaetze).toStrictEqual([kaffeebar.problem, `Heute gelöst durch: ${kaffeebar.heuteGeloestDurch}`]);
    expect(k[3].punkte).toStrictEqual(kaffeebar.nicht);
    expect(k[5].absaetze).toStrictEqual([`Wir glauben: ${kaffeebar.outcome.wirGlauben}`, `Wir merken es: ${kaffeebar.outcome.wirMerkenEs}`]);
    expect(k[6].punkte).toStrictEqual(kaffeebar.offeneFragen);
  });

  it('lässt leere Listeneinträge in der Vorschau weg', () => {
    expect(briefKarten({ ...leer, nicht: ['', 'Kein Mittagsgeschäft'] })[3].punkte).toStrictEqual(['Kein Mittagsgeschäft']);
  });
});

describe('produktSatzSetzen', () => {
  it('entfernt den Schlüssel bei leerem Text, damit die Datei ihn nicht mitschleppt', () => {
    const r = produktSatzSetzen({ ...leer, produktSatz: 'x' }, '');
    expect(r).toStrictEqual(leer);
    expect('produktSatz' in r).toBe(false);
  });

  it('nur Leerzeichen zählt als leer (Schlüssel fällt weg)', () => {
    expect('produktSatz' in produktSatzSetzen({ ...leer, produktSatz: 'x' }, '  \n ')).toBe(false);
  });

  it('setzt den Satz und bleibt ein gültiger Brief', () => {
    const r = produktSatzSetzen(leer, 'Kaffee vorbestellen.');
    expect(r.produktSatz).toBe('Kaffee vorbestellen.');
    expect(artefaktParsen('brief', r).ok).toBe(true);
  });
});
