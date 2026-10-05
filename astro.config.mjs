import { defineConfig } from 'astro/config';

// Kurs-Website NDU Coding 2026 — statische Seite, deploybar auf Vercel oder GitHub Pages.
export default defineConfig({
  site: 'https://ndu-coding-2026.vercel.app',
  trailingSlash: 'ignore',
  // Astro 7 entfernt Leerraum sonst nach JSX-Regeln – das kann Leerzeichen zwischen Inline-Elementen kosten.
  compressHTML: true,
});
