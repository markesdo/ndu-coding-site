// Menüeintrag /innolab/mappe: statisch „Meine Mappe“ (Studierende, kein Flackern), für Lehrende „Mappen der Kohorte“.
// Die Rolle kennt erst die Mappe-Seite (/api/werkstatt/auth/ich); sie merkt sie sich hier, und das Skript im Layout
// setzt den Text danach auf jeder Seite, bevor das Menü gezeichnet wird.
export const ROLLE_KEY = 'ndu-werkstatt-rolle';
export const MAPPE_LEHRENDE = 'Mappen der Kohorte';
export const MAPPE_PFAD = '/innolab/mappe';
/** Markiert die Menülinks zur Mappe (Layout.astro). */
export const NAV_MAPPE = 'data-nav-mappe';

/** Merkt sich „lehrende“; Studierende und Abgemeldete (null) löschen den Eintrag. Der Speicher darf fehlen oder werfen. */
export function rolleMerken(speicher: () => Pick<Storage, 'setItem' | 'removeItem'>, rolle: string | null): void {
  try {
    if (rolle === 'lehrende') speicher().setItem(ROLLE_KEY, rolle);
    else speicher().removeItem(ROLLE_KEY);
  } catch {
    // Privates Fenster o. Ä.: dann bleibt der statische Text, auf der Mappe-Seite setzt ihn navMappeSetzen.
  }
}

/** Setzt die Menülinks zur Mappe auf den Lehrenden-Text. */
export function navMappeSetzen(dok: Pick<Document, 'querySelectorAll'>): void {
  dok.querySelectorAll(`[${NAV_MAPPE}]`).forEach((a) => { a.textContent = MAPPE_LEHRENDE; });
}

/** Inline-Skript fürs Layout (ohne Bundle, direkt nach dem Menü): wie navMappeSetzen, wenn „lehrende“ gemerkt ist. */
export const NAV_ROLLE_SKRIPT =
  `try{if(localStorage.getItem(${JSON.stringify(ROLLE_KEY)})==='lehrende')` +
  `document.querySelectorAll('[${NAV_MAPPE}]').forEach(function(a){a.textContent=${JSON.stringify(MAPPE_LEHRENDE)}})}catch(e){}`;
