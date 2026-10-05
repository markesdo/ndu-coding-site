import type { ImageMetadata } from 'astro';

// Screenshots der Schritt-für-Schritt-Anleitungen, z. B. bild('setup/github-1-formular').
const bilder = import.meta.glob<{ default: ImageMetadata }>('../assets/anleitung/**/*.jpg', { eager: true });

export function bild(name: string): ImageMetadata {
  const b = bilder[`../assets/anleitung/${name}.jpg`];
  if (!b) throw new Error(`Screenshot fehlt: ${name}`);
  return b.default;
}
