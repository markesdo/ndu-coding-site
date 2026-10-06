import { describe, expect, it } from 'vitest';
import {
  PROMPT_KURZ, PROMPT_LANG, REGIE,
  flugZuordnung, istWeiterTaste, ohneFlug, promptWahl, tastenAktion, tippZeiten, weiterZiel,
} from './auftakt-zeitplan';

const TITEL = 'Programmieren mit AI';

describe('weiterZiel', () => {
  it('„Weiter“ führt zu Tag 1', () => {
    expect(weiterZiel('')).toBe('/tag-1');
    expect(weiterZiel('?foo=1')).toBe('/tag-1');
  });
  it('wer im Beamer-Modus kommt, bleibt darin – ?beamer=0 schaltet ihn ab', () => {
    expect(weiterZiel('?beamer')).toBe('/tag-1?beamer');
    expect(weiterZiel('?beamer=1')).toBe('/tag-1?beamer');
    expect(weiterZiel('?x=1&beamer')).toBe('/tag-1?beamer');
    expect(weiterZiel('?beamer=0')).toBe('/tag-1');
  });
});

describe('promptWahl', () => {
  // Unabhängig gerechnet: „›“, Leerzeichen (je 0,6em), Cursor 0,55em + 0,15em Abstand – nicht EXTRA_ZEICHEN wiederverwenden.
  const zeilenBreite = (text: string, px: number) => (text.length * 0.6 + 0.6 + 0.6 + 0.55 + 0.15) * px;
  it('der gewählte Auftrag passt immer in eine Zeile – vom kleinen Handy bis zum Beamer', () => {
    for (const verfuegbar of [288, 343, 358, 400, 488, 568, 700, 860, 1100, 1700]) {
      for (const wunsch of [16.8, 28, 44]) {
        const w = promptWahl(verfuegbar, wunsch);
        expect(zeilenBreite(w.text, w.px)).toBeLessThanOrEqual(verfuegbar + 0.5);
      }
    }
  });
  it('lang, wo Platz ist; kurz am Handy, notfalls etwas kleiner', () => {
    expect(promptWahl(1700, 44)).toStrictEqual({ text: PROMPT_LANG, px: 44 });
    expect(promptWahl(358, 18).text).toBe(PROMPT_KURZ);
    expect(promptWahl(358, 18).px).toBeLessThan(18);
  });
});

describe('tippZeiten', () => {
  it('liegt für beide Aufträge und jede Streuung im Tipp-Fenster, streng nacheinander', () => {
    for (const p of [PROMPT_LANG, PROMPT_KURZ, 'x'.repeat(400)]) for (const z of [0, 0.5, 0.999]) {
      const t = tippZeiten(p, () => z);
      expect(t).toHaveLength(p.length);
      expect(t[0]).toBeGreaterThan(REGIE.tippen);
      expect(t.at(-1)!).toBeLessThanOrEqual(REGIE.tippenEnde + 0.001);
      for (let i = 1; i < t.length; i++) expect(t[i]).toBeGreaterThan(t[i - 1]);
    }
  });
  it('nach dem Komma eine hörbare Pause', () => {
    const t = tippZeiten(PROMPT_LANG, () => 0.5);
    const komma = PROMPT_LANG.indexOf(',');
    expect(t[komma + 1] - t[komma]).toBeGreaterThanOrEqual((t[3] - t[2]) + 0.1);
  });
  it('das Tippen endet vor dem „Enter“ – dazwischen blinkt der Cursor', () => {
    expect(tippZeiten(PROMPT_LANG, () => 0.999).at(-1)!).toBeLessThan(REGIE.enter - 0.3);
  });
});

describe('flugZuordnung', () => {
  for (const prompt of [PROMPT_LANG, PROMPT_KURZ]) {
    const z = flugZuordnung(prompt, TITEL);
    it(`jedes Ziel höchstens einmal, nur Buchstaben auf Buchstaben (${prompt.length} Zeichen)`, () => {
      expect(z).toHaveLength(prompt.length);
      const ziele = z.filter((x): x is number => x !== null);
      expect(new Set(ziele).size).toBe(ziele.length);
      z.forEach((j, i) => {
        if (j === null) return;
        expect(prompt[i]).toMatch(/\p{L}/u);
        expect(prompt[i].toLowerCase()).toBe(TITEL[j].toLowerCase());
      });
    });
    it(`Leerzeichen und Satzzeichen fliegen nie (${prompt.length} Zeichen)`, () => {
      z.forEach((j, i) => { if (!/\p{L}/u.test(prompt[i])) expect(j).toBeNull(); });
    });
    it(`deterministisch (${prompt.length} Zeichen)`, () => {
      expect(flugZuordnung(prompt, TITEL)).toStrictEqual(z);
    });
  }
  it('Satzzeichen fliegen nie, auch wenn der Titel dasselbe Zeichen hat', () => {
    expect(flugZuordnung('a-b,', 'a-b,')).toStrictEqual([0, null, 2, null]);
  });
  it('gleiche Schreibung vor anderer Schreibung: „A“ nimmt das große A aus „App“', () => {
    const z = flugZuordnung(PROMPT_LANG, TITEL);
    const a = TITEL.indexOf('A');
    expect(PROMPT_LANG[z.indexOf(a)]).toBe('A');
  });
  it('ein exakter Treffer wird nicht von einem Ziel in anderer Schreibung verdrängt', () => {
    // Nur ein „p“: Es gehört dem kleinen „p“ im Titel, nicht dem großen „P“, obwohl „P“ vorn steht.
    expect(flugZuordnung('xp', 'Pp')).toStrictEqual([null, 1]);
  });
  it('unter mehreren Kandidaten der mit der nächsten relativen Position', () => {
    // Titel „ab“: Das „a“ am Anfang des Auftrags passt zum „a“ am Anfang des Titels.
    expect(flugZuordnung('a--a', 'ab')).toStrictEqual([0, null, null, null]);
    expect(flugZuordnung('--aa', 'ba')).toStrictEqual([null, null, null, 1]);
  });
  it('die meisten Buchstaben der Überschrift kommen aus dem Auftrag', () => {
    const lang = flugZuordnung(PROMPT_LANG, TITEL).filter((x) => x !== null).length;
    expect(lang).toBeGreaterThanOrEqual(14);
    expect(ohneFlug(flugZuordnung(PROMPT_LANG, TITEL), TITEL).length + lang).toBe(TITEL.replace(/ /g, '').length);
  });
});

describe('Tasten', () => {
  it('Enter vor dem „Enter“ der Regie schickt ab, danach springt es ans Ende', () => {
    expect(tastenAktion('Enter', 1.5)).toBe('abschicken');
    expect(tastenAktion('Enter', REGIE.enter + 0.1)).toBe('ueberspringen');
  });
  it('Esc und andere Tasten überspringen, Tab und Umschalttasten nicht', () => {
    expect(tastenAktion('Escape', 1)).toBe('ueberspringen');
    expect(tastenAktion('x', 4)).toBe('ueberspringen');
    expect(tastenAktion('Tab', 1)).toBe('ignorieren');
    expect(tastenAktion('Shift', 1)).toBe('ignorieren');
    expect(tastenAktion('F5', 1)).toBe('ignorieren');
    expect(tastenAktion('F11', 4)).toBe('ignorieren');
    expect(tastenAktion('F', 4)).toBe('ueberspringen');
  });
  it('„Weiter“: Enter, Leertaste, Pfeil rechts, Bild ab (Clicker) – sonst nichts', () => {
    for (const t of ['Enter', ' ', 'ArrowRight', 'PageDown']) expect(istWeiterTaste(t)).toBe(true);
    for (const t of ['Escape', 'a', 'ArrowLeft', 'Tab']) expect(istWeiterTaste(t)).toBe(false);
  });
});

describe('Regie', () => {
  it('die Reihenfolge stimmt und das Ende liegt nach allem anderen', () => {
    expect(REGIE.chevron).toBeLessThan(REGIE.tippen);
    expect(REGIE.tippenEnde).toBeLessThan(REGIE.enter);
    expect(REGIE.flug + REGIE.flugDauer + REGIE.flugStreuung).toBeLessThanOrEqual(REGIE.landung + 0.06);
    expect(REGIE.druckEnde).toBeLessThanOrEqual(REGIE.tage);
    const letzterTag = REGIE.tage + 2 * REGIE.tageAbstand;
    expect(Math.max(letzterTag + REGIE.linie, letzterTag + REGIE.tagTextVersatz + REGIE.tagTextDauer)).toBeLessThanOrEqual(REGIE.ende);
  });
});
