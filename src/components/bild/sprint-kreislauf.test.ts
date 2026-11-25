import { describe, expect, it } from 'vitest';
import {
  ARTEFAKTE, BALKEN_Y, B_HOEHE, DAILY, EVENTS, MITTE, R, RING_B, SCHRITTE, TEILE, VERANTWORTLICHKEITEN, beschreibung, bogen,
  dailyMitte, endSpitze, pruefeAufdecken, pruefeHervor, punkt, ringPfad, RING_ENDE, tangente,
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
  it('der Ring beginnt unten auf Höhe des Planning-Balkens und endet bei RING_ENDE', () => {
    const start = punkt(-90), ende = punkt(RING_ENDE);
    expect(start.y).toBe(BALKEN_Y);
    expect(ringPfad().startsWith(`M${start.x} ${start.y}`)).toBe(true);
    expect(ringPfad().endsWith(`${ende.x} ${ende.y}`)).toBe(true);
  });

  it('Laufrichtung gegen den Uhrzeigersinn: rechts nach oben, oben nach links, unten nach rechts', () => {
    expect(tangente(0).y).toBeLessThan(0);
    expect(tangente(90).x).toBeLessThan(0);
    expect(tangente(-90).x).toBeGreaterThan(0);
  });

  it('die große Pfeilspitze am Ringende zeigt nach unten auf den Planning-Balken und bleibt darüber', () => {
    const [spitzeX, spitzeY] = endSpitze().split(' ')[0].split(',').map(Number);
    const ende = punkt(RING_ENDE);
    expect(spitzeY).toBeGreaterThan(ende.y);
    expect(spitzeX).toBeGreaterThan(ende.x);
    expect(spitzeY).toBeLessThan(BALKEN_Y - RING_B / 2);
  });

  it('der Ring nimmt etwa 60 % der Bildhöhe ein; die Daily-Schleife liegt außen oben rechts und im Bild', () => {
    expect((2 * R + RING_B) / B_HOEHE).toBeGreaterThan(0.55);
    const d = dailyMitte();
    expect(d.x).toBeGreaterThan(MITTE.x + R);
    expect(d.y).toBeLessThan(MITTE.y - R / 2);
    expect(d.y - DAILY.r - DAILY.b / 2).toBeGreaterThan(0);
  });

  it('Textpfade laufen im Uhrzeigersinn (sweep 1), der Ring gegen ihn (sweep 0)', () => {
    expect(bogen(120, 60, R, MITTE, false)).toMatch(/A150 150 0 0 1 /);
    expect(ringPfad()).toMatch(/^M\S+ \S+A150 150 0 0 0 /);
  });
});

describe('Sprint-Kreislauf: am Beamer nur Namen', () => {
  const komponente = Object.entries(quellen).find(([k]) => k.endsWith('SprintKreislauf.astro'))![1];
  it('die Unterzeilen der Events stehen nur im Handout (nur-handout) und im <title>, nicht als Text im Bild', () => {
    expect(komponente).toMatch(/<figcaption class="[^"]*\bnur-handout\b/);
    expect(komponente).not.toMatch(/ev\.\w+\.sub\}<\/text/);
    expect(komponente).not.toMatch(/class="sk-sub"/);
  });
});
