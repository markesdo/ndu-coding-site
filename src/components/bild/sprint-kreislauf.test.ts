import { describe, expect, it } from 'vitest';
import {
  ARTEFAKTE, BAUEN_BOGEN, BALKEN_Y, RETRO, schriftOben, B_BREITE, B_HOEHE, BAUEN, DAILY, DAILY_HINWEIS, EVENTS, LINKS, OBEN_Y, R, RECHTS, RING_B, ROLLEN, SCHRITTE,
  TEILE, TEILNAHME, VERANTWORTLICHKEITEN, balkenStart, beschreibung, bogen, dailyMitte, endSpitze, pruefeAufdecken,
  pruefeHervor, punkt, ringPfad, RING_ENDE, tangente, wer,
} from './sprint-kreislauf';

const quellen = import.meta.glob(['./SprintKreislauf.astro', './SprintKarte.astro', './SprintAbzeichen.astro', './sprint-kreislauf.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
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
    expect(Object.keys(quellen)).toHaveLength(4);
    // Kommentare dürfen das Vorbild nennen; geprüft wird, was gezeichnet oder vorgelesen wird.
    const ohneKommentare = Object.values(quellen).join('\n').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const alt of [/Development Team/i, /\bDemo\b/i, /Meeting/i, /Product Increment/i]) {
      expect(ohneKommentare, String(alt)).not.toMatch(alt);
    }
    // „Rolle“ heißt im Code der Typ der Abzeichen; gezeigt oder vorgelesen wird das Wort nicht (Guide 2020: accountabilities).
    const gezeigt = [beschreibung(), DAILY_HINWEIS, BAUEN, ...Object.values(ROLLEN).flatMap((r) => [r.kurz, r.name]), ...EVENTS.flatMap((e) => [e.name, e.sub])].join(' ');
    expect(gezeigt).not.toMatch(/Development Team|Demo|Meeting|\bRollen?\b|Implementation/i);
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

describe('Sprint-Kreislauf: wer an welchem Event teilnimmt (Scrum Guide 2020)', () => {
  it('Planning und Retrospektive: das Scrum Team; Daily: die Developers; Review: Scrum Team und Stakeholder', () => {
    expect(TEILNAHME).toStrictEqual({
      planning: ['po', 'sm', 'dev'],
      daily: ['dev'],
      review: ['po', 'sm', 'dev', 'stakeholder'],
      retro: ['po', 'sm', 'dev'],
    });
    expect(Object.keys(TEILNAHME).sort()).toStrictEqual(EVENTS.map((e) => e.id).sort());
  });

  it('Kürzel und Namen: PO, SM, Dev = Developers; Stakeholder gehören nicht zum Scrum Team', () => {
    expect(Object.values(ROLLEN).map((r) => [r.kurz, r.name, r.team])).toStrictEqual([
      ['PO', 'Product Owner', true], ['SM', 'Scrum Master', true], ['Dev', 'Developers', true], ['Stakeholder', 'Stakeholder', false],
    ]);
    expect(Object.values(ROLLEN).filter((r) => r.team).map((r) => r.name)).toStrictEqual(VERANTWORTLICHKEITEN);
  });

  it('Text für Handout und Alt-Text; der Daily-Hinweis zitiert den Guide wie scrum.astro', () => {
    expect(wer('daily')).toBe('Developers');
    expect(wer('review')).toBe('Product Owner, Scrum Master, Developers und Stakeholder');
    expect(beschreibung()).toContain('dabei: Developers)');
    expect(scrum).toContain('they participate as Developers');
    expect(DAILY_HINWEIS).toContain('they participate as Developers');
  });
});

describe('Sprint-Kreislauf: Geometrie', () => {
  it('der Ring beginnt rechts unten auf Höhe des Planning-Balkens und endet links bei RING_ENDE', () => {
    const ende = punkt(RING_ENDE, R, LINKS);
    expect(ringPfad().startsWith(`M${RECHTS.x} ${BALKEN_Y}`)).toBe(true);
    expect(ringPfad().endsWith(`${ende.x} ${ende.y}`)).toBe(true);
  });

  it('Laufrichtung gegen den Uhrzeigersinn: rechts nach oben, oben nach links, unten nach rechts', () => {
    expect(tangente(0).y).toBeLessThan(0);
    expect(tangente(90).x).toBeLessThan(0);
    expect(tangente(-90).x).toBeGreaterThan(0);
  });

  it('die Pfeilspitze am Ringende zeigt flach nach rechts auf den Anfang des Planning-Balkens', () => {
    const [spitzeX, spitzeY] = endSpitze().split(' ')[0].split(',').map(Number);
    const t = tangente(RING_ENDE);
    expect(Math.abs(Math.atan2(t.y, t.x) * 180 / Math.PI)).toBeLessThan(10);
    expect(Math.abs(spitzeY - BALKEN_Y)).toBeLessThan(RING_B / 2);
    expect(balkenStart() - spitzeX).toBeGreaterThan(0);
    expect(balkenStart() - spitzeX).toBeLessThan(12);
  });

  it('der Ring nimmt etwa 60 % der Bildhöhe ein; die Daily-Schleife liegt außen oben rechts und im Bild', () => {
    expect((BALKEN_Y - OBEN_Y + RING_B) / B_HOEHE).toBeGreaterThan(0.55);
    const d = dailyMitte();
    expect(d.x).toBeGreaterThan(RECHTS.x + R / 2);
    expect(d.y).toBeLessThan(RECHTS.y - R / 2);
    expect(d.y - DAILY.r - DAILY.b / 2).toBeGreaterThan(0);
    expect(d.x + DAILY.r + DAILY.b / 2).toBeLessThan(B_BREITE);
  });

  it('keine Ringschrift steht kopfüber: „Developers bauen“ rechts liest von unten nach oben, „Retrospektive“ links ebenso', () => {
    const schlimmste = (von: number, bis: number, gegen: boolean) => {
      let max = -1;
      for (let i = 0; i <= 20; i++) max = Math.max(max, schriftOben(von + ((bis - von) * i) / 20, gegen).y);
      return max;
    };
    expect(schriftOben(-90, true).y).toBe(-1);
    expect(schlimmste(BAUEN_BOGEN.von, BAUEN_BOGEN.bis, BAUEN_BOGEN.gegen)).toBeLessThan(0.75);
    expect(schlimmste(RETRO.mitte + RETRO.halb, RETRO.mitte - RETRO.halb, false)).toBeLessThan(0.75);
    // Gegenprobe: derselbe Bogen im Uhrzeigersinn stünde unten kopfüber.
    expect(schlimmste(BAUEN_BOGEN.bis, BAUEN_BOGEN.von, false)).toBeGreaterThan(0.9);
  });

  it('Textpfade laufen im Uhrzeigersinn (sweep 1); rechts steht „Developers bauen“ statt „Implementation“', () => {
    expect(bogen(225, 135, R, LINKS, false)).toMatch(/A140 140 0 0 1 /);
    expect(ringPfad()).toMatch(/A140 140 0 0 0 /);
    expect(BAUEN).toBe('Developers bauen');
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
