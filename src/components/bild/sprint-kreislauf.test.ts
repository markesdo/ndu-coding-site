import { describe, expect, it } from 'vitest';
import {
  ARTEFAKTE, EVENTS, SCHRITTE, TEILE, VERANTWORTLICHKEITEN, beschreibung, pruefeAufdecken, pruefeHervor, punkt, ringPfad,
  ringSpitze, RING_ENDE,
} from './sprint-kreislauf';

const quellen = import.meta.glob(['./SprintKreislauf.astro', './SprintKarte.astro', './sprint-kreislauf.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const scrum = Object.values(import.meta.glob('../../pages/innolab/methoden/scrum.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>)[0];

describe('Sprint-Kreislauf: Begriffe nach Scrum Guide 2020', () => {
  it('jedes Artefakt trägt seine Verpflichtung', () => {
    expect(ARTEFAKTE.map((a) => [a.name, a.verpflichtung])).toStrictEqual([
      ['Product Backlog', 'Produktziel'],
      ['Sprint Backlog', 'Sprint-Ziel'],
      ['Inkrement', 'Definition of Done'],
    ]);
  });

  it('vier Events im Sprint, drei Verantwortlichkeiten mit Developers', () => {
    expect(EVENTS.map((e) => e.name)).toStrictEqual(['Sprint Planning', 'Daily Scrum', 'Sprint Review', 'Retrospektive']);
    expect(VERANTWORTLICHKEITEN).toStrictEqual(['Product Owner', 'Scrum Master', 'Developers']);
  });

  it('kein Begriff aus Grafiken vor 2020 (Development Team, Demo, Meeting, Rolle, Product Increment)', () => {
    expect(Object.keys(quellen)).toHaveLength(3);
    // Kommentare dürfen das Vorbild nennen; geprüft wird, was gezeichnet oder vorgelesen wird.
    const ohneKommentare = Object.values(quellen).join('\n').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const alt of [/Development Team/i, /\bDemo\b/i, /Meeting/i, /\bRollen?\b/, /Product Increment/i]) {
      expect(ohneKommentare, String(alt)).not.toMatch(alt);
    }
    expect(beschreibung()).not.toMatch(/Development Team|Demo|Meeting/i);
  });

  it('schreibt Events, Artefakte und Verpflichtungen so wie die Methodenseite Scrum', () => {
    expect(scrum).toBeTruthy();
    for (const wort of [...EVENTS.map((e) => e.name), ...ARTEFAKTE.flatMap((a) => [a.name, a.verpflichtung]), ...VERANTWORTLICHKEITEN]) {
      expect(scrum, wort).toContain(wort);
    }
  });

  it('der Alt-Text nennt alle Events, Artefakte und Verpflichtungen und übernimmt den Takt', () => {
    const text = beschreibung('ein Sprint, 12.–19.12.');
    for (const wort of [...EVENTS.map((e) => e.name), ...ARTEFAKTE.flatMap((a) => [a.name, a.verpflichtung])]) expect(text, wort).toContain(wort);
    expect(text).toContain('ein Sprint, 12.–19.12.');
    expect(beschreibung()).toContain('höchstens ein Monat');
  });
});

describe('Sprint-Kreislauf: Eingaben', () => {
  it('jeder Teil steht in genau einer Aufdeck-Gruppe, Backlog zuerst, Retrospektive zuletzt', () => {
    expect(new Set(TEILE).size).toBe(TEILE.length);
    expect(TEILE).toHaveLength(8);
    expect(SCHRITTE[0]).toStrictEqual(['product-backlog']);
    expect(SCHRITTE.at(-1)).toStrictEqual(['retro']);
  });

  it('hervor: einzeln, als Liste oder gar nicht – Tippfehler brechen ab', () => {
    expect(pruefeHervor(undefined)).toStrictEqual([]);
    expect(pruefeHervor('daily')).toStrictEqual(['daily']);
    expect(pruefeHervor(['planning', 'sprint-backlog'])).toStrictEqual(['planning', 'sprint-backlog']);
    expect(() => pruefeHervor('demo')).toThrow(/hervor „demo“ unbekannt/);
    expect(() => pruefeHervor(['review', 'retrospektive'])).toThrow(/„retrospektive“ unbekannt/);
  });

  it('aufdecken: ganze Zahl von 0 bis zur Zahl der Gruppen', () => {
    for (const n of [undefined, 0, 3, SCHRITTE.length]) expect(() => pruefeAufdecken(n)).not.toThrow();
    for (const n of [-1, 1.5, SCHRITTE.length + 1]) expect(() => pruefeAufdecken(n), String(n)).toThrow(/aufdecken muss 0–6 sein/);
  });
});

describe('Sprint-Kreislauf: Geometrie', () => {
  it('der Ring beginnt unten und endet bei RING_ENDE', () => {
    const start = punkt(-90), ende = punkt(RING_ENDE);
    expect(ringPfad().startsWith(`M${start.x} ${start.y}`)).toBe(true);
    expect(ringPfad().endsWith(`${ende.x} ${ende.y}`)).toBe(true);
  });

  it('Pfeilspitzen laufen gegen den Uhrzeigersinn: rechts nach oben, oben nach links', () => {
    const spitzeVon = (grad: number) => ringSpitze(grad).split(' ')[0].split(',').map(Number);
    const rechts = punkt(0), oben = punkt(90);
    expect(spitzeVon(0)[1]).toBeLessThan(rechts.y);
    expect(spitzeVon(90)[0]).toBeLessThan(oben.x);
  });
});
