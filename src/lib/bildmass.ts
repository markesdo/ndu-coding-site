// Breite und Höhe eines Bildes aus seinem Dateikopf (PNG, JPEG) – für width/height am <img> (BuchAbbildung.astro).
// Ohne Maße reserviert der Browser für ein lazy geladenes Bild erst nach dem Laden Platz: Die Folie wächst dann im Beamer
// über den Bildschirm hinaus (Story Map #varianten +27 px bei 1280 × 720). Keine Abhängigkeit, nur die zwei Formate in public/quellen/.

export type Mass = { breite: number; hoehe: number };

/** Maße aus den Bytes einer PNG- oder JPEG-Datei; undefined bei anderem oder kaputtem Format. */
export function bildMass(b: Uint8Array): Mass | undefined {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  // PNG: Signatur, dann der IHDR-Block mit Breite und Höhe (je 4 Byte, big-endian) ab Byte 16.
  if (b.length >= 24 && v.getUint32(0) === 0x89504e47 && v.getUint32(12) === 0x49484452) {
    return { breite: v.getUint32(16), hoehe: v.getUint32(20) };
  }
  // JPEG: Segmente durchgehen bis zum ersten Start-of-Frame (SOF0–SOF15 außer DHT C4, JPG C8, DAC CC).
  if (b.length >= 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) return undefined;
      const marker = b[i + 1];
      if (marker === 0xff) { i += 1; continue; }
      const laenge = v.getUint16(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { hoehe: v.getUint16(i + 5), breite: v.getUint16(i + 7) };
      }
      i += 2 + laenge;
    }
  }
  return undefined;
}
