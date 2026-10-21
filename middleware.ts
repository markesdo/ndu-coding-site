// Kurspasswort für die Website – Vercel Routing Middleware (plattformweit, nicht Astro-Middleware).
// Läuft nur auf Vercel; lokal (`astro dev`) gibt es kein Passwort.
// Frei: /start (Startseite vor dem Login), /login und /login/innolab (istLoginSeite), /logout (löscht nur das Cookie), /_astro/* (Schriften, Skripte, Bilder), Favicons, robots.txt,
// og.png und og-innolab.png (Bilder der Link-Vorschau – WhatsApp & Co. sind nicht angemeldet), version.json (nur die Commit-Kennung, für
// den Hinweis „Seite aktualisiert“ – sonst bekäme die Abfrage die Login-Seite zurück).
// Frei ist auch die Werkstatt: /api/werkstatt und alles darunter (nicht /api/werkstattx) sowie
// /.well-known/oauth-authorization-server/api/werkstatt/oauth und /.well-known/oauth-protected-resource/api/werkstatt/mcp
// sowie /.well-known/oauth-authorization-server und /.well-known/oauth-protected-resource ohne Suffix
// (OAuth-Metadaten für den Claude-Connector). Sie hat ihre eigene Anmeldung; vercel.json schreibt diese Pfade auf
// api/werkstatt.ts um. Andere /.well-known-Pfade bleiben gesperrt.
// Alles andere braucht das Cookie.
// Fehlt SITE_PASSWORD oder SITE_SESSION_SECRET, ist die Seite gesperrt (fail closed).
import { next } from '@vercel/functions';
import { GUELTIG_SEKUNDEN, abmeldenCookies, cookieLesen, istAbmelden, istLoginSeite, istOeffentlich, ohneAnmeldungZiel, passwortStimmt, sichererPfad, tokenErstellen, tokenGueltig, zugangsCookie, zumLogin } from './src/lib/kurszugang.js'; // .js-Endung nötig: ohne sie fand Vercels Middleware-Build das Modul nicht (500)

export const config = {
  matcher: ['/((?!_astro/|favicon(?:-innolab)?\\.svg$|favicon\\.ico$|robots\\.txt$|og(?:-innolab)?\\.png$|version\\.json$).*)'],
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

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  // Abmelden (Link „Abmelden“ in der Seitenleiste): Kurszugang und Werkstatt-Sitzung löschen, zur Startseite. GET ohne
  // CSRF-Schutz ist Absicht: Schlimmstenfalls meldet ein fremder Link Studierende ab – lästig, aber ohne Schaden an Daten.
  // Vor allen anderen Prüfungen: Es klappt ohne gültiges Cookie und ohne SITE_PASSWORD; alles andere bleibt fail closed.
  if (istAbmelden(url.pathname)) {
    const headers = new Headers({ Location: '/start', ...NOINDEX });
    for (const c of abmeldenCookies()) headers.append('Set-Cookie', c);
    return new Response(null, { status: 303, headers });
  }
  // Startseite: für alle, auch ohne Anmeldung (sie zeigt nur Titel und Kurstage) – und unabhängig davon,
  // ob das Kurspasswort gesetzt ist. Ebenso die Werkstatt (eigene Anmeldung, siehe istOeffentlich).
  // Alles andere bleibt ohne SITE_PASSWORD/SITE_SESSION_SECRET gesperrt.
  if (istOeffentlich(url.pathname)) return next({ headers: NOINDEX });

  const passwort = process.env.SITE_PASSWORD;
  const secret = process.env.SITE_SESSION_SECRET;
  if (!passwort || !secret) return gesperrt();

  const jetzt = Math.floor(Date.now() / 1000);

  if (istLoginSeite(url.pathname)) {
    if (request.method === 'POST') {
      const form = await request.formData().catch(() => null);
      const eingabe = typeof form?.get('passwort') === 'string' ? (form!.get('passwort') as string) : '';
      const ziel = sichererPfad(typeof form?.get('weiter') === 'string' ? (form!.get('weiter') as string) : '/');
      if (eingabe && await passwortStimmt(eingabe, passwort, secret)) {
        const token = await tokenErstellen(secret, passwort, jetzt);
        return weiter(ziel, {
          'Set-Cookie': zugangsCookie(token, GUELTIG_SEKUNDEN),
        });
      }
      // Verzögerung bremst nur einzelnes Ausprobieren, nicht parallele Anfragen. Der eigentliche Schutz ist ein
      // langes, zufälliges Kurspasswort; für mehr: Vercel-Firewall-Regel mit Rate Limit auf POST /login.
      await new Promise((r) => setTimeout(r, 800));
      // Zurück auf die Login-Seite des Kurses, zu dem das Ziel gehört (das Formular schickt immer an /login).
      return weiter(`${zumLogin(ziel)}&fehler=1`);
    }
    // Schon angemeldet? Dann direkt zum Ziel statt nochmal das Formular.
    if (await tokenGueltig(cookieLesen(request.headers.get('cookie')), secret, passwort, jetzt)) {
      // Ohne weiter: Startseite des Kurses dieser Login-Seite (/login/innolab → /innolab).
      const standard = url.pathname.startsWith('/login/innolab') ? '/innolab' : '/';
      return weiter(sichererPfad(url.searchParams.get('weiter') ?? standard));
    }
    return next({ headers: NOINDEX });
  }

  if (await tokenGueltig(cookieLesen(request.headers.get('cookie')), secret, passwort, jetzt)) {
    // private, no-store auch hier: Kursseiten (z. B. der Linear-Einladungslink auf Tag 3) gehören in keinen geteilten Cache.
    return next({ headers: NOINDEX });
  }
  // Schnittstellen bekommen eine klare Absage statt der Umleitung auf die Login-Seite (die sähe im fetch wie Erfolg aus).
  if (url.pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ fehler: 'Nicht angemeldet' }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8', ...NOINDEX } });
  }
  return weiter(ohneAnmeldungZiel(url.pathname, url.search));
}
