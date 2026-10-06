// Kurspasswort für die Website – Vercel Routing Middleware (plattformweit, nicht Astro-Middleware).
// Läuft nur auf Vercel; lokal (`astro dev`) gibt es kein Passwort.
// Frei: /login, /_astro/* (Schriften, Skripte, Bilder), Favicon, robots.txt. Alles andere braucht das Cookie.
// Fehlt SITE_PASSWORD oder SITE_SESSION_SECRET, ist die Seite gesperrt (fail closed).
import { next } from '@vercel/functions';
import { COOKIE, GUELTIG_SEKUNDEN, cookieLesen, passwortStimmt, sichererPfad, tokenErstellen, tokenGueltig } from './src/lib/kurszugang.js'; // .js: Vercel lädt die Middleware als Node-ESM ohne Bundler

export const config = {
  matcher: ['/((?!_astro/|favicon\\.svg$|favicon\\.ico$|robots\\.txt$).*)'],
};

const NOINDEX = { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'private, no-store' };

function gesperrt(): Response {
  const html = '<!doctype html><html lang="de"><meta charset="utf-8"><meta name="robots" content="noindex, nofollow">'
    + '<meta name="viewport" content="width=device-width, initial-scale=1"><title>Gesperrt</title>'
    + '<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 1rem;line-height:1.5">'
    + '<h1>Diese Seite ist gerade nicht erreichbar.</h1><p>Bitte später noch einmal versuchen.</p></body></html>';
  return new Response(html, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', ...NOINDEX } });
}

function weiter(ort: string, extra: Record<string, string> = {}): Response {
  return new Response(null, { status: 303, headers: { Location: ort, ...NOINDEX, ...extra } });
}

const istLogin = (p: string) => p === '/login' || p === '/login/';

export default async function middleware(request: Request): Promise<Response> {
  const passwort = process.env.SITE_PASSWORD;
  const secret = process.env.SITE_SESSION_SECRET;
  if (!passwort || !secret) return gesperrt();

  const url = new URL(request.url);
  const jetzt = Math.floor(Date.now() / 1000);

  if (istLogin(url.pathname)) {
    if (request.method === 'POST') {
      const form = await request.formData().catch(() => null);
      const eingabe = typeof form?.get('passwort') === 'string' ? (form!.get('passwort') as string) : '';
      const ziel = sichererPfad(typeof form?.get('weiter') === 'string' ? (form!.get('weiter') as string) : '/');
      if (eingabe && await passwortStimmt(eingabe, passwort, secret)) {
        const token = await tokenErstellen(secret, passwort, jetzt);
        return weiter(ziel, {
          'Set-Cookie': `${COOKIE}=${token}; Path=/; Max-Age=${GUELTIG_SEKUNDEN}; HttpOnly; Secure; SameSite=Lax`,
        });
      }
      // Kleine Verzögerung bremst Durchprobieren.
      await new Promise((r) => setTimeout(r, 800));
      return weiter(`/login?fehler=1&weiter=${encodeURIComponent(ziel)}`);
    }
    // Schon angemeldet? Dann direkt zum Ziel statt nochmal das Formular.
    if (await tokenGueltig(cookieLesen(request.headers.get('cookie')), secret, passwort, jetzt)) {
      return weiter(sichererPfad(url.searchParams.get('weiter')));
    }
    return next({ headers: NOINDEX });
  }

  if (await tokenGueltig(cookieLesen(request.headers.get('cookie')), secret, passwort, jetzt)) {
    return next({ headers: { 'X-Robots-Tag': 'noindex, nofollow' } });
  }
  return weiter(`/login?weiter=${encodeURIComponent(sichererPfad(url.pathname + url.search))}`);
}
