// Kennung des aktuellen Deploys für „Neue Version – neu laden“. Beim Bauen als dist/version.json abgelegt;
// middleware.ts lässt die Datei ohne Kurspasswort durch (sonst käme beim Nachfragen die Login-Seite zurück).
import { BUILD } from '../lib/build';

export const GET = () =>
  new Response(JSON.stringify({ build: BUILD }), { headers: { 'Content-Type': 'application/json' } });
