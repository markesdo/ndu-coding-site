import { describe, expect, it } from 'vitest';
import { aktuelleFolie, restText, tasteSteuertFolien, timerFuerT, weiter, zurueck } from './folien';

describe('weiter (→ im Beamer)', () => {
  const folie = { versteckteSchritte: 0, offeneAufloesung: false, naechsteFolie: true };

  it('springt erst zur Folie, wenn man noch im Seitenkopf darüber steht', () => {
    expect(weiter({ ...folie, vorDerFolie: true, versteckteSchritte: 2 })).toBe('hierhin');
  });

  it('deckt dann den nächsten Schritt der Folie auf', () => {
    expect(weiter({ ...folie, versteckteSchritte: 2, offeneAufloesung: true })).toBe('schritt');
  });

  it('dann die Auflösung, bevor es zur nächsten Folie geht', () => {
    expect(weiter({ ...folie, offeneAufloesung: true })).toBe('aufloesung');
  });

  it('eine zu lange Folie erst zu Ende scrollen', () => {
    expect(weiter({ ...folie, restUnten: true })).toBe('runter');
  });

  it('dann die nächste Folie', () => {
    expect(weiter(folie)).toBe('folie');
  });

  it('nach der letzten Folie die nächste Seite', () => {
    expect(weiter({ ...folie, naechsteFolie: false })).toBe('seite');
  });
});

describe('zurueck (← im Beamer)', () => {
  it('verdeckt zuerst den zuletzt gezeigten Schritt – auch auf der ersten Folie unter dem Seitenkopf', () => {
    expect(zurueck({ gezeigteSchritte: 1, vorherigeFolie: false, kopfDarueber: true })).toBe('schritt');
  });

  it('dann die vorige Folie', () => {
    expect(zurueck({ gezeigteSchritte: 0, vorherigeFolie: true, kopfDarueber: true })).toBe('folie');
  });

  it('vor der ersten Folie an den Seitenanfang, danach die vorige Seite', () => {
    expect(zurueck({ gezeigteSchritte: 0, vorherigeFolie: false, kopfDarueber: true })).toBe('anfang');
    expect(zurueck({ gezeigteSchritte: 0, vorherigeFolie: false })).toBe('seite');
  });
});

describe('aktuelleFolie', () => {
  it('ist die letzte Folie, die die Kopfleiste erreicht hat', () => {
    expect(aktuelleFolie([48, 768, 1488], 48)).toBe(0);
    expect(aktuelleFolie([-672, 48, 768], 48)).toBe(1);
    expect(aktuelleFolie([-1300, -580, 48], 48)).toBe(2);
  });

  it('bleibt bei einer überlangen Folie, auch wenn die nächste schon näher an der Kopfleiste liegt', () => {
    expect(aktuelleFolie([-1152, 848], 48)).toBe(0);
  });

  it('im Seitenkopf über allen Folien die erste; ohne Folien -1', () => {
    expect(aktuelleFolie([300, 1000], 48)).toBe(0);
    expect(aktuelleFolie([], 48)).toBe(-1);
  });
});

describe('timerFuerT (Taste T)', () => {
  const aus = { sichtbar: true, laeuft: false };
  const verdeckt = { sichtbar: false, laeuft: false };

  it('nimmt den letzten sichtbaren Timer – Timer in noch verdeckten Schritten zählen nicht', () => {
    expect(timerFuerT([aus, aus, verdeckt, verdeckt])).toStrictEqual({ klick: 1, pausieren: [] });
  });

  it('pausiert den Timer des vorigen Schritts, wenn der nächste startet', () => {
    expect(timerFuerT([{ sichtbar: true, laeuft: true }, aus])).toStrictEqual({ klick: 1, pausieren: [0] });
  });

  it('pausiert den laufenden letzten Timer selbst, ohne andere anzufassen', () => {
    expect(timerFuerT([{ sichtbar: true, laeuft: true }, { sichtbar: true, laeuft: true }])).toStrictEqual({ klick: 1, pausieren: [] });
  });

  it('ohne sichtbaren Timer nichts', () => {
    expect(timerFuerT([verdeckt])).toBeUndefined();
    expect(timerFuerT([])).toBeUndefined();
  });
});

describe('restText', () => {
  it('zeigt Minuten und Sekunden, aufgerundet', () => {
    expect(restText(180_000)).toBe('3:00');
    expect(restText(61_001)).toBe('1:02');
    expect(restText(9_000)).toBe('0:09');
  });

  it('wird nie negativ', () => {
    expect(restText(-5_000)).toBe('0:00');
  });
});

describe('tasteSteuertFolien (Fokus nach dem Mausklick)', () => {
  const mit = (ziel: { tag: string; typ?: string; bearbeitbar?: boolean }, rest = {}) => tasteSteuertFolien({ ziel, ...rest });

  it('blättert ohne fokussiertes Element und auf Knopf, Link und Auflösungs-Inhalt', () => {
    expect(tasteSteuertFolien({})).toBe(true);
    expect(mit({ tag: 'button' })).toBe(true);
    expect(mit({ tag: 'a' })).toBe(true);
    expect(mit({ tag: 'div' })).toBe(true);
  });

  it('blättert weiter, wenn ein Haken oder Knopf-Input nach dem Klick den Fokus hat', () => {
    for (const typ of ['checkbox', 'button', 'submit', 'reset', 'image', 'file', 'color', 'hidden']) {
      expect(mit({ tag: 'input', typ }), typ).toBe(true);
    }
  });

  it('blättert nicht beim Tippen in Textfeld, Textbereich, Auswahl, contenteditable', () => {
    expect(mit({ tag: 'input', typ: 'text' })).toBe(false);
    expect(mit({ tag: 'input' })).toBe(false);
    expect(mit({ tag: 'input', typ: 'password' })).toBe(false);
    expect(mit({ tag: 'textarea' })).toBe(false);
    expect(mit({ tag: 'select' })).toBe(false);
    expect(mit({ tag: 'mark', bearbeitbar: true })).toBe(false);
  });

  it('lässt Radio und Regler die Pfeile behalten', () => {
    expect(mit({ tag: 'input', typ: 'radio' })).toBe(false);
    expect(mit({ tag: 'input', typ: 'range' })).toBe(false);
  });

  it('blättert nicht bei offenem Dialog, Vollbild, Wiederholung oder schon behandelter Taste', () => {
    expect(mit({ tag: 'button' }, { dialogOffen: true })).toBe(false);
    expect(mit({ tag: 'button' }, { vollbild: true })).toBe(false);
    expect(mit({ tag: 'button' }, { wiederholt: true })).toBe(false);
    expect(mit({ tag: 'button' }, { schonBehandelt: true })).toBe(false);
  });
});
