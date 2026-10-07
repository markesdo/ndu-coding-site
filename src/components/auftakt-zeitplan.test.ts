import { describe, expect, it } from 'vitest';
import {
  PROMPT_KURZ, PROMPT_LANG, REGIE,
  flugZuordnung, istWeiterTaste, ohneFlug, promptWahl, schreibungWechselt, tastenAktion, tippZeiten, weiterZiel,
} from './auftakt-zeitplan';

const TITEL = 'Programmieren mit AI';

describe('weiterZiel', () => {
  it('„Weiter“ führt zur Übersicht – für alle gleich', () => {
    expect(weiterZiel('')).toBe('/');
    expect(weiterZiel('?foo=1')).toBe('/');
  });
  it('wer im Beamer-Modus kommt, bleibt darin – ?beamer=0 schaltet ihn ab', () => {
    expect(weiterZiel('?beamer')).toBe('/?beamer');
    expect(weiterZiel('?beamer=1')).toBe('/?beamer');
    expect(weiterZiel('?x=1&beamer')).toBe('/?beamer');
    expect(weiterZiel('?beamer=0')).toBe('/');
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
    // Beamer 1280×720 und 1920×1080: der lange Auftrag, etwas kleiner als gewünscht, aber nicht unter 85 %.
    for (const [verfuegbar, wunsch] of [[1169.6, 35.2], [1758.4, 52.8]]) {
      const w = promptWahl(verfuegbar, wunsch);
      expect(w.text).toBe(PROMPT_LANG);
      expect(w.px).toBeGreaterThanOrEqual(wunsch * 0.85);
    }
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
    expect(lang).toBeGreaterThanOrEqual(16);
    expect(ohneFlug(flugZuordnung(PROMPT_LANG, TITEL), TITEL).length + lang).toBe(TITEL.replace(/ /g, '').length);
  });
  it('langer Auftrag: nur „P“ und „I“ wechseln die Schreibung, höchstens ein Buchstabe tippt sich ein', () => {
    const z = flugZuordnung(PROMPT_LANG, TITEL);
    expect(schreibungWechselt(PROMPT_LANG, z, TITEL).map((j) => TITEL[j])).toStrictEqual(['P', 'I']);
    expect(ohneFlug(z, TITEL).length).toBeLessThanOrEqual(1);
  });
  it('schreibungWechselt nennt genau die Ziele mit anderer Schreibung, aufsteigend', () => {
    expect(schreibungWechselt('pXa', [0, null, 2], 'Pba')).toStrictEqual([0]);
    expect(schreibungWechselt('ab', [0, 1], 'ab')).toStrictEqual([]);
    expect(schreibungWechselt('ip', [1, 0], 'PI')).toStrictEqual([0, 1]);
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
