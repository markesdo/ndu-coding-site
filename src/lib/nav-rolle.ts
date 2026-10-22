// Menüeintrag /innolab/mappe: statisch „Meine Mappe“ (Studierende, kein Flackern), für Lehrende „Mappen der Kohorte“.
// Die Rolle steht in einem lesbaren Cookie (ROLLE_COOKIE): Die Werkstatt setzt es beim GitHub-Login und bei jedem
// /auth/ich, löscht es für Studierende, beim Abmelden und mit einer ungültigen Sitzung (routen/auth.ts, sitzung.ts);
// /logout löscht es mit den anderen Cookies (abmeldenCookies). Das Skript im Layout liest es auf jeder Seite, bevor
// das Menü gezeichnet wird. Nur ein Hinweis fürs Menü: Keine Berechtigung hängt daran, der Server prüft die Rolle
// allein über die signierte Sitzung.
export const ROLLE_COOKIE = 'ndu-werkstatt-rolle';
export const ROLLE_LEHRENDE = 'lehrende';
export const MAPPE_PFAD = '/innolab/mappe';
export const MAPPE_STUDIERENDE = 'Meine Mappe';
export const MAPPE_LEHRENDE = 'Mappen der Kohorte';
/** Markiert die Menülinks zur Mappe und das „Weiter: …“ im Beamer, wenn es zur Mappe führt (Layout.astro). */
export const NAV_MAPPE = 'data-nav-mappe';

/** Das Cookie, wie es bei Lehrenden im Cookie-Header bzw. in document.cookie steht. */
export const ROLLE_PAAR = `${ROLLE_COOKIE}=${ROLLE_LEHRENDE}`;

/** Steht paar (name=wert) im Cookie-Header? Ohne Verweise nach außen, wie mappeTextSetzen (NAV_ROLLE_SKRIPT). */
export function cookieHat(cookie: string, paar: string): boolean {
  return cookie.split(';').some(function (teil) { return teil.trim() === paar; });
}

/**
 * Setzt den Text aller mit attr markierten Elemente: Menülinks direkt, beim Beamer-Knopf das data-fallback-next-t,
 * aus dem Layout.astro „Weiter: …“ füllt. Ohne Verweise nach außen: NAV_ROLLE_SKRIPT bettet genau diesen Quelltext
 * (toString) ins Layout ein, also nur Parameter und Literale.
 */
export function mappeTextSetzen(dok: Pick<Document, 'querySelectorAll'>, attr: string, text: string): void {
  dok.querySelectorAll('[' + attr + ']').forEach(function (a) {
    if (a.hasAttribute('data-fallback-next-t')) a.setAttribute('data-fallback-next-t', text);
    else a.textContent = text;
  });
}

/** Setzt die Einträge zur Mappe; auch zurück, wenn ein „lehrende“ nicht mehr stimmt (anderes Konto). */
export function navMappeSetzen(dok: Pick<Document, 'querySelectorAll'>, lehrende: boolean): void {
  mappeTextSetzen(dok, NAV_MAPPE, lehrende ? MAPPE_LEHRENDE : MAPPE_STUDIERENDE);
}

/** Inline-Skript fürs Layout (ohne Bundle, direkt nach dem Menü): dieselben zwei Funktionen, wenn das Cookie „lehrende“ sagt. */
export const NAV_ROLLE_SKRIPT =
  `try{if((${cookieHat.toString()})(document.cookie,${JSON.stringify(ROLLE_PAAR)}))` +
  `(${mappeTextSetzen.toString()})(document,${JSON.stringify(NAV_MAPPE)},${JSON.stringify(MAPPE_LEHRENDE)})}catch(e){}`;
