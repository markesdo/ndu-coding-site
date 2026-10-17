// Reine Hilfen für /innolab/mappe (MappeUebersicht.tsx): Rücksprünge der Anmeldung und Zeilen der Übersicht.
import { aufgeloest } from '../../components/aufloesung.js';
import { NACH_MOM_TEST } from '../../components/innolab-zeiten.js';
import { ARTEFAKTE, ARTEFAKT_NAMEN, type ArtefaktName } from '../schemas/index.js';
import { ROUTEN, type MappeStand } from '../vertrag.js';

/** Texte zu ?fehler=… – die Anmeldung (routen/auth.ts) springt damit auf /innolab/mappe zurück. */
export const FEHLER_TEXT = {
  'nicht-freigeschaltet': 'Du bist für keinen Kurs freigeschaltet. Schreib Markus deinen GitHub-Namen.',
  'anmeldung-ungueltig': 'Die Anmeldung ist abgelaufen oder wurde in einem anderen Tab begonnen. Melde dich noch einmal an.',
  'anmeldung-fehlgeschlagen': 'Die Anmeldung bei GitHub hat nicht geklappt. Versuch es gleich noch einmal.',
} as const;

export type AnmeldeFehler = keyof typeof FEHLER_TEXT;

/** Nicht freigeschaltet: Neu anmelden hilft nicht, erst muss Markus die Person eintragen – die Seite lädt dann nichts. */
export function anmeldeFehler(suche: string): { code: AnmeldeFehler; text: string; neuAnmelden: boolean } | null {
  const code = new URLSearchParams(suche).get('fehler') ?? '';
  if (!Object.hasOwn(FEHLER_TEXT, code)) return null;
  const c = code as AnmeldeFehler;
  return { code: c, text: FEHLER_TEXT[c], neuAnmelden: c !== 'nicht-freigeschaltet' };
}

/** Die Adresse ohne ?fehler – nachdem die Anmeldung geklappt hat, soll ein Neuladen die Meldung nicht wieder zeigen. */
export function adresseOhneFehler(pfad: string, suche: string, hash: string): string {
  const p = new URLSearchParams(suche);
  p.delete('fehler');
  const rest = p.toString();
  return `${pfad}${rest ? `?${rest}` : ''}${hash}`;
}

/** Der Leitfaden-Editor verrät die Regeln des Mom Test: wie die Auflösungen der Interview-Seite erst ab NACH_MOM_TEST,
 *  der Präsentator (Markus) immer. */
export function leitfadenFrei(jetzt: Date, praesentator: boolean): boolean {
  return praesentator || aufgeloest(NACH_MOM_TEST, jetzt);
}

/** Lädt /innolab/mappe beim Öffnen? Nicht bei „nicht freigeschaltet“: Es gibt keine Sitzung, Laden zeigte nur „Melde dich an“.
 *  Wird nur einmal beim Öffnen entschieden – das spätere Leeren der Meldung darf kein zweites Laden auslösen. */
export function beimOeffnenLaden(rueckmeldung: { neuAnmelden: boolean } | null): boolean {
  return rueckmeldung === null || rueckmeldung.neuAnmelden;
}

export const LEITFADEN_SPAETER = 'Öffnet ihr nach dem Mom Test auf der Interview-Seite.';

/** Anker der Überschrift „In der Werkstatt speichern“ direkt vor dem Editor (seiten.test.ts prüft, dass er dort steht). */
export const EDITOR_ANKER: Readonly<Record<ArtefaktName, string>> = {
  brief: 'werkstatt',
  entscheidungen: 'werkstatt',
  leitfaden: 'vorlage',
  annahmen: 'werkstatt',
};

/** Überschrift direkt vor der Auflösung mit dem Leitfaden-Editor (seiten.test.ts prüft den Anker). Wer dort schon
 *  freigeschaltet ist (Knopf „Editor und Vorlage öffnen“), kommt so trotzdem an den Editor. */
export const LEITFADEN_LINK = `/innolab/methoden/${ARTEFAKTE.leitfaden.slug}#${EDITOR_ANKER.leitfaden}`;

/** Anmelden mit Rücksprung auf /innolab/mappe – ohne ?fehler, damit ein späteres Neuladen die alte Meldung nicht zeigt. */
export const LOGIN_HREF = `${ROUTEN.login.pfad}?weiter=${encodeURIComponent('/innolab/mappe')}`;

export interface MappeZeile {
  name: ArtefaktName;
  titel: string;
  href: string;
  vorhanden: boolean;
}


/** Alle Artefakte der Mappe in fester Reihenfolge; was in der Antwort fehlt, gilt als offen. */
export function mappeZeilen(stand: MappeStand): MappeZeile[] {
  return ARTEFAKT_NAMEN.map((name) => ({
    name,
    titel: ARTEFAKTE[name].titel,
    href: `/innolab/methoden/${ARTEFAKTE[name].slug}#${EDITOR_ANKER[name]}`,
    vorhanden: stand.artefakte.some((a) => a.name === name && a.vorhanden),
  }));
}

export type RepoHinweis =
  | { art: 'keine' }
  | { art: 'aktiv'; href: string }
  | { art: 'eingeladen'; href: string }
  | { art: 'unbekannt' };

/** Was die Seite über das Repo zeigt: Link erst, wenn der Lesezugriff aktiv ist; vorher die Einladung (href = Einladungsseite).
 *  Ohne Org oder Repo (Lehrende) nichts. */
export function repoHinweis(stand: Pick<MappeStand, 'repo' | 'lesezugriff'>, org: string | undefined): RepoHinweis {
  if (!org || !stand.repo) return { art: 'keine' };
  const basis = `https://github.com/${org}/${stand.repo}`;
  if (stand.lesezugriff === 'aktiv') return { art: 'aktiv', href: basis };
  if (stand.lesezugriff === 'eingeladen') return { art: 'eingeladen', href: `${basis}/invitations` };
  return { art: 'unbekannt' };
}

// Nach „Einladung annehmen“ (neuer Tab) kommt die Person zurück: Dann still nachsehen, höchstens alle 2 s.
// Gibt die Aufräumfunktion zurück. dok/fenster als Parameter, damit der Test sie durch EventTargets ersetzen kann.
export const RUECKKEHR_ABSTAND_MS = 2000;
export function rueckkehrBeobachten(
  dok: Pick<Document, 'addEventListener' | 'removeEventListener' | 'visibilityState'>,
  fenster: Pick<Window, 'addEventListener' | 'removeEventListener'>,
  nachsehen: () => void,
  jetzt: () => number = Date.now,
): () => void {
  let zuletzt = Number.NEGATIVE_INFINITY;
  const zurueck = () => {
    if (dok.visibilityState !== 'visible' || jetzt() - zuletzt < RUECKKEHR_ABSTAND_MS) return;
    zuletzt = jetzt();
    nachsehen();
  };
  dok.addEventListener('visibilitychange', zurueck);
  fenster.addEventListener('focus', zurueck);
  return () => {
    dok.removeEventListener('visibilitychange', zurueck);
    fenster.removeEventListener('focus', zurueck);
  };
}
