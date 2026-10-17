// Werkstatt-API – eine Vercel-Funktion für alles unter /api/werkstatt (Rewrites in vercel.json, auch die zwei
// /.well-known-Pfade). Vom Kurspasswort ausgenommen (istOeffentlich in src/lib/kurszugang.ts); eigene Anmeldung.
// Fehlen Secrets, baut die App trotzdem; erst Anfragen, die sie brauchen, antworten 503 (siehe produktion.ts).
import { appErstellen } from '../src/werkstatt/server/app.js'; // .js-Endung wie in api/position.ts
import { produktionsAbhaengigkeiten } from '../src/werkstatt/server/produktion.js';

const app = appErstellen(produktionsAbhaengigkeiten());

export default { fetch: (req: Request) => app.fetch(req) };
