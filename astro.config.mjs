import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Kurs-Website NDU Coding 2026 — statische Seite auf Vercel (Kurspasswort über middleware.ts, nur auf Vercel).
// site = eigene Domain in Vercel; daraus kommen die absoluten Adressen der Link-Vorschau.
export default defineConfig({
  site: 'https://ndu.datamonkeys.ai',
  trailingSlash: 'ignore',
  // Astro 7 entfernt Leerraum sonst nach JSX-Regeln – das kann Leerzeichen zwischen Inline-Elementen kosten.
  compressHTML: true,
  integrations: [react()],
});
