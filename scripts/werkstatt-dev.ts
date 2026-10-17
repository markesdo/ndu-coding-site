// Lokaler Werkstatt-Server: dieselbe Hono-App wie auf Vercel, aber mit Fake-Speicher und Test-Login.
// Start: `npm run werkstatt:dev` (Port 8787), daneben `npm run dev` – Astro reicht /api/werkstatt per Proxy hierher.
// Verweigert ohne NODE_ENV development oder test.
import { serve } from '@hono/node-server';
import { appErstellen } from '../src/werkstatt/server/app.js';
import { ANMELDE_PFAD, anmeldeSeite } from '../src/werkstatt/server/fake-identitaet.js';
import { lokaleAbhaengigkeiten } from '../src/werkstatt/server/lokal.js';
import { istLokal } from '../src/werkstatt/server/umgebung.js';

if (!istLokal(process.env)) {
  console.error('werkstatt-dev: nur mit NODE_ENV=development oder test (npm run werkstatt:dev setzt das).');
  process.exit(1);
}

const PORT = 8787;
const app = appErstellen(lokaleAbhaengigkeiten());

serve({
  port: PORT,
  hostname: 'localhost', // nur lokal erreichbar, nicht im WLAN
  fetch: (req: Request) => (new URL(req.url).pathname === ANMELDE_PFAD ? anmeldeSeite(req) : app.fetch(req)),
}, () => {
  console.log(`werkstatt-dev: http://localhost:${PORT}/api/werkstatt (Fake-Speicher, Test-Login unter ${ANMELDE_PFAD})`);
});
