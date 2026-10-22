import { describe, expect, it } from 'vitest';
import { MAPPE_LEHRENDE, MAPPE_STUDIERENDE, NAV_MAPPE, NAV_ROLLE_SKRIPT, ROLLE_COOKIE, cookieHat, navMappeSetzen } from './nav-rolle';

// Menülinks (nur Text) und der Beamer-Knopf (data-fallback-next-t), beide mit NAV_MAPPE markiert, dazu ein fremder Link.
function dokument(start = MAPPE_STUDIERENDE) {
  const el = (attrs: Record<string, string>, textContent: string) => ({
    attrs: { ...attrs },
    textContent,
    hasAttribute(n: string) { return n in this.attrs; },
    setAttribute(n: string, v: string) { this.attrs[n] = v; },
  });
  const elemente = [
    el({ [NAV_MAPPE]: '' }, start),
    el({ [NAV_MAPPE]: '' }, start),
    el({ [NAV_MAPPE]: '', 'data-fallback-next-t': start }, ''),
    el({}, 'Claude verbinden'),
  ];
  const dok = { querySelectorAll: (s: string) => elemente.filter((e) => s === `[${NAV_MAPPE}]` && NAV_MAPPE in e.attrs) };
  const stand = () => elemente.map((e) => ({ attrs: e.attrs, text: e.textContent }));
  return { dok, stand };
}

const ausfuehren = (dok: unknown, cookie: string) => new Function('document', NAV_ROLLE_SKRIPT)({ ...(dok as object), cookie });

describe('navMappeSetzen', () => {
  it('Lehrende: Menülinks und „Weiter: …“ im Beamer, fremde Links bleiben', () => {
    const { dok, stand } = dokument();
    navMappeSetzen(dok as unknown as Document, true);
    expect(stand()).toStrictEqual([
      { attrs: { [NAV_MAPPE]: '' }, text: MAPPE_LEHRENDE },
      { attrs: { [NAV_MAPPE]: '' }, text: MAPPE_LEHRENDE },
      { attrs: { [NAV_MAPPE]: '', 'data-fallback-next-t': MAPPE_LEHRENDE }, text: '' },
      { attrs: {}, text: 'Claude verbinden' },
    ]);
  });
  it('Studierende nach „lehrende“ (Kontowechsel): zurück auf „Meine Mappe“', () => {
    const { dok, stand } = dokument(MAPPE_LEHRENDE);
    navMappeSetzen(dok as unknown as Document, false);
    expect(stand().map((e) => e.text)).toStrictEqual([MAPPE_STUDIERENDE, MAPPE_STUDIERENDE, '', 'Claude verbinden']);
    expect(stand()[2].attrs['data-fallback-next-t']).toBe(MAPPE_STUDIERENDE);
  });
});

describe('NAV_ROLLE_SKRIPT (Inline-Skript im Layout)', () => {
  it('Cookie „lehrende“: genau dasselbe Ergebnis wie navMappeSetzen(…, true)', () => {
    const skript = dokument();
    const direkt = dokument();
    ausfuehren(skript.dok, `andere=1; ${ROLLE_COOKIE}=lehrende; ndu_zugang=x`);
    navMappeSetzen(direkt.dok as unknown as Document, true);
    expect(skript.stand()).toStrictEqual(direkt.stand());
    expect(skript.stand()[0].text).toBe(MAPPE_LEHRENDE);
  });
  it('ohne Cookie, anderer Wert oder nur ähnlicher Name: bleibt „Meine Mappe“', () => {
    for (const cookie of ['', `${ROLLE_COOKIE}=studierende`, `x${ROLLE_COOKIE}=lehrende`, `${ROLLE_COOKIE}=lehrendex`]) {
      const { dok, stand } = dokument();
      const vorher = JSON.stringify(stand());
      ausfuehren(dok, cookie);
      expect(JSON.stringify(stand())).toBe(vorher);
    }
  });
  it('wirft nicht, wenn document.cookie wirft', () => {
    const { dok, stand } = dokument();
    const kaputt = { ...dok, get cookie(): string { throw new Error('gesperrt'); } };
    expect(() => new Function('document', NAV_ROLLE_SKRIPT)(kaputt)).not.toThrow();
    expect(stand()[0].text).toBe(MAPPE_STUDIERENDE);
  });
});

describe('cookieHat', () => {
  it('ganze Paare, mit und ohne Leerzeichen', () => {
    expect(cookieHat('a=1;b=2', 'b=2')).toBe(true);
    expect(cookieHat('a=1; b=2', 'b=2')).toBe(true);
    expect(cookieHat('a=1; bb=2', 'b=2')).toBe(false);
    expect(cookieHat('', 'b=2')).toBe(false);
  });
});
