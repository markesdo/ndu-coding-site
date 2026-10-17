import { defineConfig, envField } from 'astro/config';
import react from '@astrojs/react';

// Kurs-Website NDU Coding 2026 — statische Seite auf Vercel (Kurspasswort über middleware.ts, nur auf Vercel).
// site = eigene Domain in Vercel; daraus kommen die absoluten Adressen der Link-Vorschau.
// Dev-Testseite der Werkstatt-Editor-Hülle: nur im Dev-Server als Route eingehängt, nie im Build.
const werkstattTestseite = {
  name: 'werkstatt-testseite',
  hooks: {
    'astro:config:setup': ({ command, injectRoute }) => {
      if (command === 'dev') injectRoute({ pattern: '/innolab/werkstatt/test', entrypoint: './src/werkstatt/ui/dev/test-seite.astro' });
    },
  },
};

export default defineConfig({
  site: 'https://ndu.datamonkeys.ai',
  trailingSlash: 'ignore',
  // Astro 7 entfernt Leerraum sonst nach JSX-Regeln – das kann Leerzeichen zwischen Inline-Elementen kosten.
  compressHTML: true,
  integrations: [react(), werkstattTestseite],
  // Lokal: Werkstatt-API aus `npm run werkstatt:dev` (Hono mit Fake-Speicher). Auf Vercel ist es api/werkstatt.ts.
  // changeOrigin: false, damit der Host localhost:4321 bleibt – sonst sähe die API eine andere Origin als der Browser
  // und lehnte jedes Speichern als CSRF ab (die Kurzform mit nur der Adresse setzt changeOrigin: true).
  vite: {
    server: {
      proxy: { '/api/werkstatt': { target: 'http://localhost:8787', changeOrigin: false } },
    },
  },
  // Nur beim Build gelesen und in die Seite geschrieben (statisch) – nach dem Setzen oder Ändern neu deployen.
  env: {
    schema: {
      LINEAR_INVITE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
