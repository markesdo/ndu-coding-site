import { describe, expect, it } from 'vitest';
import { beamerSchalten, darfFuehren, dieserTabMeldet, einstieg, ersteFolieAbstand, klickAktion, kopfAnDenAnfang, praesentatorAngemeldet, type Seitenart, type Speicher, type Wurzel } from './beamer';

// Nur ein Tab, der melden kann, darf die Führung übernehmen (Code-Review 21.11.: Begleiter-Tab stahl sie dem Beamer).
describe('darfFuehren', () => {
  it('Schlüssel, Beamer an, nicht pausiert: ja', () => {
    expect(darfFuehren({ schluessel: 'k', beamer: true, pausiert: false })).toBe(true);
  });
  it('ohne Schlüssel, ohne Beamer oder pausiert: nein', () => {
    expect(darfFuehren({ schluessel: null, beamer: true, pausiert: false })).toBe(false);
    expect(darfFuehren({ schluessel: 'k', beamer: false, pausiert: false })).toBe(false);
    expect(darfFuehren({ schluessel: 'k', beamer: true, pausiert: true })).toBe(false);
  });
});

// Kopf nach dem Laden an den Anfang – aber nie gegen eine eigene Bewegung.
describe('kopfAnDenAnfang', () => {
  const lage = { beamer: true, anker: false, scrollY: 8, kopfleiste: 56, beruehrt: false };
  it('ein paar Pixel tief eingerastet, unberührt: zurück an den Anfang', () => {
    expect(kopfAnDenAnfang(lage)).toBe(true);
  });
  it('schon gescrollt, geklickt oder getippt: bleibt', () => {
    expect(kopfAnDenAnfang({ ...lage, beruehrt: true })).toBe(false);
  });
  it('mit #anker, ohne Beamer, ganz oben oder weiter als die Kopfleiste: bleibt', () => {
    expect(kopfAnDenAnfang({ ...lage, anker: true })).toBe(false);
    expect(kopfAnDenAnfang({ ...lage, beamer: false })).toBe(false);
    expect(kopfAnDenAnfang({ ...lage, scrollY: 0 })).toBe(false);
    expect(kopfAnDenAnfang({ ...lage, scrollY: 56 })).toBe(false);
  });
});

// Zwei Beamer-Tabs mit Schlüssel: Nur der zuletzt benutzte meldet (wo-ist.ts), sonst springt der Zähler im Begleiter.
describe('dieserTabMeldet', () => {
  it('zuletzt benutzter Tab meldet, der andere schweigt', () => {
    expect(dieserTabMeldet('tab-a', 'tab-a')).toBe(true);
    expect(dieserTabMeldet('tab-a', 'tab-b')).toBe(false);
  });
  it('Wechsel: nach Benutzung von B meldet nur noch B', () => {
    expect([dieserTabMeldet('tab-b', 'tab-a'), dieserTabMeldet('tab-b', 'tab-b')]).toStrictEqual([false, true]);
  });
  it('noch kein Tab festgelegt: jeder meldet', () => {
    expect(dieserTabMeldet(null, 'tab-a')).toBe(true);
  });
});

// Erste Folie im Beamer genau an der Falz: Seitenkopf = Titelbild, das erste → zeigt Folie 1 ganz.
describe('ersteFolieAbstand', () => {
  it('kurzer Seitenkopf: Abstand bis zur Falz', () => {
    expect(ersteFolieAbstand({ beamer: true, fensterHoehe: 720, folieOben: 400 })).toBe(320);
  });
  it('Bruchteile runden auf, damit die Folie nicht 1 px in den ersten Bildschirm ragt', () => {
    expect(ersteFolieAbstand({ beamer: true, fensterHoehe: 720, folieOben: 400.6 })).toBe(320);
  });
  it('Folie beginnt schon unter der Falz oder genau an ihr: kein Abstand', () => {
    expect(ersteFolieAbstand({ beamer: true, fensterHoehe: 720, folieOben: 900 })).toBe(0);
    expect(ersteFolieAbstand({ beamer: true, fensterHoehe: 720, folieOben: 720 })).toBe(0);
  });
  it('Beamer aus: kein Abstand', () => {
    expect(ersteFolieAbstand({ beamer: false, fensterHoehe: 720, folieOben: 400 })).toBe(0);
  });
  it('Seitenkopf rastet 8 px tiefer ein (1728 × 1117): Falz liegt 8 px tiefer', () => {
    expect(ersteFolieAbstand({ beamer: true, fensterHoehe: 1117, folieOben: 450, kopfOben: 8 })).toBe(675);
  });
  it('negativer kopfOben zählt als 0', () => {
    expect(ersteFolieAbstand({ beamer: true, fensterHoehe: 720, folieOben: 400, kopfOben: -5 })).toBe(320);
  });
});

// Ersatz für document.documentElement und localStorage (vitest läuft hier ohne DOM).
function wurzel(...attrs: string[]): Wurzel & { attrs: Map<string, string> } {
  const m = new Map(attrs.map((a) => [a, '']));
  return {
    attrs: m,
    hasAttribute: (n) => m.has(n),
    setAttribute: (n, v) => { m.set(n, v); },
    removeAttribute: (n) => { m.delete(n); },
    toggleAttribute: (n, an) => { const ja = an ?? !m.has(n); if (ja) m.set(n, ''); else m.delete(n); return ja; },
  };
}
function speicher(): Speicher & { daten: Map<string, string> } {
  const daten = new Map<string, string>();
  return { daten, setItem: (k, v) => { daten.set(k, v); }, removeItem: (k) => { daten.delete(k); } };
}
const lage = (praesentator: boolean, beamer: boolean, seite: Seitenart) => ({ praesentator, beamer, seite });

describe('einstieg', () => {
  for (const seite of ['start', 'layout'] as const) {
    it(`${seite}: Präsentator sieht „Beamer starten“`, () => {
      expect(einstieg(lage(true, false, seite))).toBe('starten');
    });
    it(`${seite}: alle anderen sehen den Link „Präsentator“`, () => {
      expect(einstieg(lage(false, false, seite))).toBe('link');
    });
  }
  it('/start im Beamer-Modus: „Beamer beenden“, auch ohne Schlüssel', () => {
    expect(einstieg(lage(true, true, 'start'))).toBe('beenden');
    expect(einstieg(lage(false, true, 'start'))).toBe('beenden');
  });
  it('Layout-Seite im Beamer-Modus: nichts (dort gibt es den Knopf „Beamer“)', () => {
    expect(einstieg(lage(true, true, 'layout'))).toBe('nichts');
  });
});

describe('klickAktion', () => {
  it('Klick von Studierenden (Knopf per DevTools eingeblendet) tut nichts', () => {
    expect(klickAktion(lage(false, false, 'start'))).toBeNull();
    expect(klickAktion(lage(false, false, 'layout'))).toBeNull();
  });
  it('/start schaltet ein und behält sein Farbschema (hell: false)', () => {
    expect(klickAktion(lage(true, false, 'start'))).toStrictEqual({ an: true, hell: false });
  });
  it('Layout-Seite schaltet ein mit hellem Thema', () => {
    expect(klickAktion(lage(true, false, 'layout'))).toStrictEqual({ an: true, hell: true });
  });
  it('im Beamer-Modus schaltet der Klick aus – auch ohne Schlüssel', () => {
    expect(klickAktion(lage(false, true, 'start'))).toStrictEqual({ an: false, hell: false });
    expect(klickAktion(lage(true, true, 'layout'))).toStrictEqual({ an: false, hell: true });
  });
  it('Klick von Studierenden über die ganze Kette: Beamer bleibt aus, nichts gespeichert', () => {
    const r = wurzel();
    const s = speicher();
    const a = klickAktion(lage(r.hasAttribute('data-ist-praesentator'), false, 'start'));
    if (a) beamerSchalten(r, a.an, { hell: a.hell, speicher: s });
    expect(r.hasAttribute('data-beamer')).toBe(false);
    expect([...s.daten.keys()]).toStrictEqual([]);
  });
});

describe('beamerSchalten', () => {
  it('ohne Präsentator-Schlüssel tut Einschalten nichts', () => {
    const r = wurzel();
    const s = speicher();
    expect(beamerSchalten(r, true, { speicher: s })).toBe(false);
    expect([...r.attrs.keys()]).toStrictEqual([]);
    expect([...s.daten.keys()]).toStrictEqual([]);
  });
  it('beim Präsentator: Beamer an, helles Thema, Wahl gemerkt', () => {
    const r = wurzel('data-ist-praesentator');
    const s = speicher();
    expect(beamerSchalten(r, true, { speicher: s })).toBe(true);
    expect(r.hasAttribute('data-beamer')).toBe(true);
    expect(r.attrs.get('data-theme')).toBe('light');
    expect(s.daten.get('ndu-beamer')).toBe('1');
  });
  it('Seite ohne Beamer (Werkstatt): Einschalten tut nichts, auch beim Präsentator; Ausschalten geht', () => {
    const r = wurzel('data-ist-praesentator', 'data-ohne-beamer');
    const s = speicher();
    s.setItem('ndu-beamer', '1');
    expect(beamerSchalten(r, true, { speicher: s })).toBe(false);
    expect(r.hasAttribute('data-beamer')).toBe(false);
    expect(s.daten.get('ndu-beamer')).toBe('1');
    expect(beamerSchalten(r, false, { speicher: s })).toBe(true);
  });
  it('/start (hell: false) behält sein Farbschema', () => {
    const r = wurzel('data-ist-praesentator');
    r.setAttribute('data-theme', 'dark');
    beamerSchalten(r, true, { hell: false, speicher: speicher() });
    expect(r.hasAttribute('data-beamer')).toBe(true);
    expect(r.attrs.get('data-theme')).toBe('dark');
  });
  it('ausschalten geht immer, auch ohne Schlüssel', () => {
    const r = wurzel('data-beamer');
    r.setAttribute('data-theme', 'light');
    const s = speicher();
    s.setItem('ndu-beamer', '1');
    expect(beamerSchalten(r, false, { speicher: s })).toBe(true);
    expect([...r.attrs.keys()]).toStrictEqual([]);
    expect(s.daten.has('ndu-beamer')).toBe(false);
  });
  it('ein Speicher, der wirft (gesperrte Website-Daten), bricht das Umschalten nicht ab', () => {
    const r = wurzel('data-ist-praesentator');
    const kaputt: Speicher = { setItem: () => { throw new Error('gesperrt'); }, removeItem: () => { throw new Error('gesperrt'); } };
    expect(beamerSchalten(r, true, { speicher: kaputt })).toBe(true);
    expect(r.hasAttribute('data-beamer')).toBe(true);
  });
});

describe('praesentatorAngemeldet', () => {
  it('liest den Schlüssel; ohne oder mit werfendem Speicher: nein', () => {
    expect(praesentatorAngemeldet({ getItem: (k) => (k === 'ndu-presenter' ? 'x' : null) })).toBe(true);
    expect(praesentatorAngemeldet({ getItem: () => null })).toBe(false);
    expect(praesentatorAngemeldet({ getItem: () => { throw new Error('gesperrt'); } })).toBe(false);
    expect(praesentatorAngemeldet(undefined)).toBe(false);
  });
});
