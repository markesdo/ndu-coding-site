import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { bildMass } from './bildmass';

const png = (b: number, h: number) => {
  const d = new Uint8Array(24);
  const v = new DataView(d.buffer);
  v.setUint32(0, 0x89504e47); v.setUint32(4, 0x0d0a1a0a); v.setUint32(8, 13); v.setUint32(12, 0x49484452);
  v.setUint32(16, b); v.setUint32(20, h);
  return d;
};
// JPEG: SOI, ein APP0-Segment (wird übersprungen), dann SOF0 mit Höhe vor Breite.
const jpeg = (b: number, h: number) => new Uint8Array([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00,
  0xff, 0xc0, 0x00, 0x0b, 0x08, h >> 8, h & 255, b >> 8, b & 255, 0x01, 0x01, 0x11, 0x00,
]);

// JPEG mit EXIF (big-endian „MM“), IFD0 mit genau einem Eintrag Orientation = o, dann SOF0.
const jpegExif = (b: number, h: number, o: number) => {
  const exif = [0x45, 0x78, 0x69, 0x66, 0, 0, 0x4d, 0x4d, 0, 0x2a, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, o, 0, 0, 0, 0, 0, 0];
  const laenge = exif.length + 2;
  return new Uint8Array([
    0xff, 0xd8, 0xff, 0xe1, laenge >> 8, laenge & 255, ...exif,
    0xff, 0xc0, 0x00, 0x0b, 0x08, h >> 8, h & 255, b >> 8, b & 255, 0x01, 0x01, 0x11, 0x00,
  ]);
};

describe('bildMass (width/height für BuchAbbildung)', () => {
  // Review 2 #447: Marker ohne Längenfeld (TEM 01, RST0–7 D0–D7) – sonst liest der Lauf zwei Bytes Bild als Länge.
  it('überspringt Marker ohne Länge vor dem Start-of-Frame', () => {
    const b = new Uint8Array([
      0xff, 0xd8, 0xff, 0x01, 0xff, 0xd3,
      0xff, 0xc0, 0x00, 0x0b, 0x08, 394 >> 8, 394 & 255, 1000 >> 8, 1000 & 255, 0x01, 0x01, 0x11, 0x00,
    ]);
    expect(bildMass(b)).toStrictEqual({ breite: 1000, hoehe: 394 });
  });

  it('EXIF-Drehung 5–8 tauscht Breite und Höhe (der Browser zeigt das Bild gedreht), 1–4 nicht', () => {
    expect(bildMass(jpegExif(1000, 394, 6))).toStrictEqual({ breite: 394, hoehe: 1000 });
    expect(bildMass(jpegExif(1000, 394, 8))).toStrictEqual({ breite: 394, hoehe: 1000 });
    expect(bildMass(jpegExif(1000, 394, 1))).toStrictEqual({ breite: 1000, hoehe: 394 });
    expect(bildMass(jpegExif(1000, 394, 3))).toStrictEqual({ breite: 1000, hoehe: 394 });
  });

  it('liest Breite und Höhe aus PNG und JPEG – bei JPEG nach übersprungenen Segmenten', () => {
    expect(bildMass(png(1000, 394))).toStrictEqual({ breite: 1000, hoehe: 394 });
    expect(bildMass(jpeg(1000, 394))).toStrictEqual({ breite: 1000, hoehe: 394 });
  });

  it('anderes Format: undefined', () => {
    expect(bildMass(new TextEncoder().encode('GIF89a......................'))).toBeUndefined();
  });

  it('jedes Bild in public/quellen/ hat lesbare Maße (sonst bricht BuchAbbildung den Build ab)', () => {
    const wurzel = join(process.cwd(), 'public/quellen');
    const dateien = readdirSync(wurzel, { recursive: true, encoding: 'utf8' }).filter((d) => /\.(jpe?g|png)$/i.test(d));
    expect(dateien.length).toBeGreaterThan(50);
    const ohne = dateien.filter((d) => { const m = bildMass(readFileSync(join(wurzel, d))); return !m || m.breite < 50 || m.hoehe < 50; });
    expect(ohne).toStrictEqual([]);
  });

  // Gegenprobe am echten Bild: varianten.jpg (Story Map) ist 1000 × 394 (macOS sips).
  it('liest das Bild der Story-Map-Folie „varianten“ richtig', () => {
    expect(bildMass(readFileSync(join(process.cwd(), 'public/quellen/patton/varianten.jpg')))).toStrictEqual({ breite: 1000, hoehe: 394 });
  });
});
