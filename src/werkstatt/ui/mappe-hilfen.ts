// Reine Hilfen für /innolab/mappe (MappeUebersicht.tsx): Rücksprünge der Anmeldung und Zeilen der Übersicht.
import { MOM_TEST_GRUPPE, NACH_MOM_TEST } from '../../components/innolab-zeiten.js';
import { AUFGEDECKT_MS, abfrageAbstand, gruppeFrei } from '../../lib/aufgedeckt.js';
import { ANSICHT_DEMO, ANSICHT_PARAM, MAPPE_DEMO, MAPPE_LEHRENDE, navMappeSetzen } from '../../lib/nav-rolle.js';
import { ARTEFAKTE, ARTEFAKT_NAMEN, type ArtefaktName } from '../schemas/index.js';
import { ROUTEN, type Ich, type MappeStand } from '../vertrag.js';

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

/** Der Leitfaden-Editor verrät die Regeln des Mom Test: frei wie die Auflösungen der Interview-Seite – sobald Markus die
 *  Gruppe „mom-test“ aufgedeckt hat (aufgedeckt aus /api/aufgedeckt), spätestens ab NACH_MOM_TEST; der Präsentator immer. */
export function leitfadenFrei(jetzt: Date, praesentator: boolean, aufgedeckt: readonly string[] = []): boolean {
  return gruppeFrei(MOM_TEST_GRUPPE, NACH_MOM_TEST, jetzt, aufgedeckt, praesentator);
}

/** Solange der Leitfaden zu ist: so oft bei /api/aufgedeckt nach MOM_TEST_GRUPPE fragen – oft am Kurstag von
 *  NACH_MOM_TEST, sonst selten (der Termin kann wandern). Wie die Auflösungen der Interview-Seite (abfrageAbstand). */
export function leitfadenAbstand(jetzt: Date): number {
  return abfrageAbstand([NACH_MOM_TEST], jetzt) ?? AUFGEDECKT_MS;
}

/** Lädt /innolab/mappe beim Öffnen? Nicht bei „nicht freigeschaltet“: Es gibt keine Sitzung, Laden zeigte nur „Melde dich an“.
 *  Wird nur einmal beim Öffnen entschieden – das spätere Leeren der Meldung darf kein zweites Laden auslösen. */
export function beimOeffnenLaden(rueckmeldung: { neuAnmelden: boolean } | null): boolean {
  return rueckmeldung === null || rueckmeldung.neuAnmelden;
}

/**
 * Holt /auth/ich und zieht den Menüeintrag zur Mappe nach (lib/nav-rolle.ts): Lehrende „Mappen der Kohorte“, Studierende
 * und Abgemeldete (null oder nicht-angemeldet) „Meine Mappe“. Andere Fehler sagen nichts über die Rolle: Menü bleibt,
 * der Fehler geht weiter. Das Rollen-Cookie setzt der Server mit derselben Antwort; hier nur diese Seite.
 */
export async function ichMitMenue(holen: () => Promise<Ich | null>, dok: Pick<Document, 'querySelectorAll'>): Promise<Ich | null> {
  try {
    const ich = await holen();
    navMappeSetzen(dok, ich !== null && ich.rolle === 'lehrende');
    return ich;
  } catch (e) {
    if ((e as { code?: unknown } | null)?.code === 'nicht-angemeldet') navMappeSetzen(dok, false);
    throw e;
  }
}

/** Überschrift und Lead von /innolab/mappe für Lehrende; Studierende behalten den statischen Text der Seite. */
export const LEHRENDEN_SEITE = {
  titel: MAPPE_LEHRENDE,
  lead: 'Was die Studierenden in ihren Mappen gespeichert haben: Stand, Änderungen seit dem letzten Kurstag, Lücken und Feedback. Die Mappen selbst nur lesen.',
} as const;

/** Überschrift und Lead der Demo-Mappe der Lehrenden (NDU-37, ?ansicht=demo). */
export const DEMO_SEITE = {
  titel: MAPPE_DEMO,
  lead: 'Deine eigene Mappe zum Vorführen: bearbeiten, speichern, „Für Claude kopieren“ und der Claude-Connector wie bei den Studierenden. Sie zählt in keiner Ansicht der Kohorte.',
} as const;

/** Die zwei Ansichten von /innolab/mappe für Lehrende: Mappen der Kohorte (Standard) oder die eigene Demo-Mappe. */
export type LehrendenWahl = 'kohorte' | 'demo';

/** Welche Ansicht die Adresse wählt: nur ?ansicht=demo ist die Demo-Mappe, alles andere die Kohorte. */
export function ansichtAusAdresse(suche: string): LehrendenWahl {
  return new URLSearchParams(suche).get(ANSICHT_PARAM) === ANSICHT_DEMO ? 'demo' : 'kohorte';
}

/** Fenstertitel für Lehrende: der Teil vor „ · “ (Seitentitel aus Layout.astro) wird ersetzt, der Kurs bleibt. */
export function lehrendenDokumentTitel(alt: string, titel: string = LEHRENDEN_SEITE.titel): string {
  const i = alt.indexOf(' · ');
  return i < 0 ? titel : `${titel}${alt.slice(i)}`;
}

/** Setzt Überschrift, Lead und Fenstertitel der Seite für Lehrende (nur Text, die Elemente markiert mappe.astro). */
export function lehrendenSeiteSetzen(dok: Pick<Document, 'querySelector' | 'title'>, wahl: LehrendenWahl = 'kohorte'): void {
  const texte = wahl === 'demo' ? DEMO_SEITE : LEHRENDEN_SEITE;
  const h1 = dok.querySelector('[data-mappe-titel]');
  const lead = dok.querySelector('[data-mappe-lead]');
  if (h1) h1.textContent = texte.titel;
  if (lead) lead.textContent = texte.lead;
  if (!dok.title.startsWith(texte.titel)) dok.title = lehrendenDokumentTitel(dok.title, texte.titel);
}

export const LEITFADEN_SPAETER = 'Öffnet ihr nach dem Mom Test auf der Interview-Seite.';

/** Anker der Überschrift „In der Werkstatt speichern“ direkt vor dem Editor (seiten.test.ts prüft, dass er dort steht). */
export const EDITOR_ANKER: Readonly<Record<ArtefaktName, string>> = {
  brief: 'werkstatt',
  entscheidungen: 'werkstatt',
  leitfaden: 'vorlage',
  annahmen: 'werkstatt',
  interviews: 'werkstatt',
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
 *  Ohne Org oder Repo nichts. */
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
