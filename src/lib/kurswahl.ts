// Kurswahl auf der Startseite (/start): Das Innolab ist ausgegraut, bis der Coding-Kurs vorbei ist.
// Stichtag als Kalendertag in Wien – nicht in UTC, sonst öffnet es am Vorabend um 1 bzw. 2 Uhr Wiener Zeit zu spät oder zu früh.
import { zumLogin } from './kurszugang';

/** Tag nach dem letzten Coding-Tag; spätestens der erste Innolab-Tag (TAGE[0].datum in components/methoden.ts – seit der
 *  Absage am 16.10. ist das der 22.10.). kurswahl.test.ts prüft beide Grenzen. */
export const INNOLAB_AB = '2026-10-16';

/** Kalendertag in Wien als JJJJ-MM-TT. */
export function tagInWien(jetzt: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Vienna', year: 'numeric', month: '2-digit', day: '2-digit' }).format(jetzt);
}

/** Ist das Innolab auf der Startseite wählbar? Ab dem Stichtag (Wiener Kalendertag), davor ausgegraut. */
export function innolabOffen(jetzt: Date, ab = INNOLAB_AB): boolean {
  return tagInWien(jetzt) >= ab;
}

/** Ziel eines Kurses mit Beamer-Modus, wenn die Startseite mit ?beamer (nicht ?beamer=0) geöffnet wurde. */
export function kursZiel(pfad: string, suche: string): string {
  const beamer = new URLSearchParams(suche).get('beamer');
  return beamer !== null && beamer !== '0' ? `${pfad}?beamer` : pfad;
}

/** Link einer Kurskarte: immer über die Login-Seite des Kurses (zumLogin). Direkt auf / schickte die Middleware
 *  Abgemeldete zurück auf /start (Schleife); wer schon angemeldet ist, leitet die Login-Seite sofort zum Ziel weiter. */
export function kursLink(pfad: string, suche: string): string {
  return zumLogin(kursZiel(pfad, suche));
}
