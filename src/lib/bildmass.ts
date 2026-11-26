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
  // JPEG: Segmente durchgehen bis zum ersten Start-of-Frame (SOF0–SOF15 außer DHT C4, JPG C8, DAC CC). Steht vorher eine
  // EXIF-Drehung um 90° (Orientation 5–8), zeigt der Browser das Bild gedreht (image-orientation: from-image): Maße tauschen.
  if (b.length >= 4 && b[0] === 0xff && b[1] === 0xd8) {
    let gedreht = false;
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) return undefined;
      const marker = b[i + 1];
      if (marker === 0xff) { i += 1; continue; }
      // Marker ohne Länge: TEM (01) und RST0–7 (D0–D7).
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
      const laenge = v.getUint16(i + 2);
      if (marker === 0xe1) gedreht ||= exifGedreht(v, i + 4, laenge - 2);
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        const hoehe = v.getUint16(i + 5);
        const breite = v.getUint16(i + 7);
        return gedreht ? { breite: hoehe, hoehe: breite } : { breite, hoehe };
      }
      i += 2 + laenge;
    }
  }
  return undefined;
}

/** APP1-Segment ab start (nach Marker und Länge): „Exif\0\0“, TIFF-Kopf, IFD0 – Orientation (Tag 0x0112) 5–8 = um 90° gedreht. */
function exifGedreht(v: DataView, start: number, laenge: number): boolean {
  const ende = Math.min(v.byteLength, start + laenge);
  if (start + 14 > ende || v.getUint32(start) !== 0x45786966 || v.getUint16(start + 4) !== 0) return false;
  const tiff = start + 6;
  const klein = v.getUint16(tiff) === 0x4949; // „II“ = little-endian, „MM“ = big-endian
  const u16 = (o: number) => v.getUint16(o, klein);
  const ifd = tiff + v.getUint32(tiff + 4, klein);
  if (ifd + 2 > ende) return false;
  for (let n = 0, e = ifd + 2; n < u16(ifd) && e + 12 <= ende; n++, e += 12) {
    if (u16(e) === 0x0112) return u16(e + 8) >= 5 && u16(e + 8) <= 8;
  }
  return false;
}
