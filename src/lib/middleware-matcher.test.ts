import { describe, expect, it } from 'vitest';
import { config } from '../../middleware';

// Vercel wendet den Matcher wie einen Pfad-Ausdruck an; für unsere Muster genügt ein verankerter RegExp.
const geschuetzt = (pfad: string) => config.matcher.some((m) => new RegExp(`^${m}$`).test(pfad));

describe('Kurspasswort-Matcher', () => {
  it('lässt das Bild der Link-Vorschau durch – WhatsApp & Co. sind nicht angemeldet', () => {
    expect(geschuetzt('/og.png')).toBe(false);
  });
  it('schützt weiterhin die Kursseiten', () => {
    expect(geschuetzt('/tag-1')).toBe(true);
    expect(geschuetzt('/')).toBe(true);
    expect(geschuetzt('/og.png.html')).toBe(true);
  });
});
