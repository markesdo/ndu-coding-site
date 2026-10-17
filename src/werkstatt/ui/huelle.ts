// Zustandsmaschine der Editor-Hülle: rein, ohne React und DOM. Die Komponente führt die Effekte aus.
// Regel: Der Entwurf wird nur gelöscht, wenn der Server das Speichern bestätigt hat.
import { artefaktParsen, type ArtefaktName, type Feldfehler } from '../schemas/index.js';
import type { ApiFehler, Ich } from '../vertrag.js';

export type HuellenZustand =
  | 'laden'
  | 'abgemeldet'
  | 'wird-eingerichtet'
  | 'bereit'
  | 'speichert'
  | 'gespeichert'
  | 'konflikt'
  | 'fehler' // Speichern gescheitert (der Entwurf bleibt)
  | 'ladefehler'; // Laden gescheitert: es gibt nichts zu bearbeiten

export type Effekt = 'entwurfSichern' | 'entwurfLoeschen' | 'neuLaden';

export type Ereignis =
  | { typ: 'oeffnen' }
  | { typ: 'geladen' }
  | { typ: 'ladenFehlgeschlagen'; status: number; code?: string }
  | { typ: 'geaendert' }
  | { typ: 'speichern' }
  | { typ: 'gespeichert' }
  | { typ: 'speichernFehlgeschlagen'; status: number; code?: string }
  | { typ: 'neuLaden' };

function ausFehler(status: number, code?: string): HuellenZustand {
  if (status === 401 || code === 'nicht-angemeldet') return 'abgemeldet';
  if (code === 'wird-eingerichtet') return 'wird-eingerichtet';
  if (status === 409 || code === 'konflikt') return 'konflikt';
  return 'fehler';
}

export function huelle(zustand: HuellenZustand, e: Ereignis): { zustand: HuellenZustand; effekte: Effekt[] } {
  const bleibt = { zustand, effekte: [] as Effekt[] };
  switch (e.typ) {
    case 'oeffnen':
      // Jedes Öffnen beginnt von vorn; die Komponente leert dazu zugleich ihre Daten (leererStand).
      return { zustand: 'laden', effekte: [] };
    case 'geladen':
      return zustand === 'laden' ? { zustand: 'bereit', effekte: [] } : bleibt;
    case 'ladenFehlgeschlagen': {
      if (zustand !== 'laden') return bleibt;
      // Beim Laden gibt es keinen Konflikt; ein 409 hier ist ein Fehler.
      const z = ausFehler(e.status, e.code);
      return { zustand: z === 'konflikt' || z === 'fehler' ? 'ladefehler' : z, effekte: [] };
    }
    case 'geaendert':
      // Wer nichts geladen hat, kann nichts ändern: Tippen heilt keinen Ladefehler.
      if (zustand === 'laden' || zustand === 'speichert' || zustand === 'ladefehler') return bleibt;
      // Im Konflikt bleibt der Konflikt, der Entwurf wird trotzdem gesichert.
      return { zustand: zustand === 'konflikt' ? 'konflikt' : 'bereit', effekte: ['entwurfSichern'] };
    case 'speichern':
      // Der Entwurf wird vor dem Senden gesichert: Bricht die Verbindung ab, geht nichts verloren.
      if (darfSpeichern(zustand)) {
        return { zustand: 'speichert', effekte: ['entwurfSichern'] };
      }
      return bleibt;
    case 'gespeichert':
      return zustand === 'speichert' ? { zustand: 'gespeichert', effekte: ['entwurfLoeschen'] } : bleibt;
    case 'speichernFehlgeschlagen':
      return zustand === 'speichert' ? { zustand: ausFehler(e.status, e.code), effekte: [] } : bleibt;
    case 'neuLaden':
      if (zustand === 'konflikt' || zustand === 'fehler' || zustand === 'ladefehler' || zustand === 'wird-eingerichtet' || zustand === 'abgemeldet') {
        return { zustand: 'laden', effekte: ['neuLaden'] };
      }
      return bleibt;
  }
}

type Code = ApiFehler['code'];

export type LadeErgebnis<A> =
  | { typ: 'abgemeldet' }
  | { typ: 'fehler'; ich: Ich | null; status: number; code: Code; meldung: string | null }
  | { typ: 'geladen'; ich: Ich; antwort: A };

/** Fehler, wie sie der API-Client wirft (ApiError); alles andere zählt als unbekannt, ohne Meldung. */
function alsFehler(e: unknown): { status: number; code: Code; meldung: string | null } {
  if (typeof e === 'object' && e !== null && 'status' in e && 'code' in e) {
    const { status, code, message } = e as { status: number; code: Code; message?: unknown };
    return { status, code, meldung: typeof message === 'string' && message !== '' ? message : null };
  }
  return { status: 0, code: 'unbekannt', meldung: null };
}

/**
 * Laden der Editor-Hülle, ohne React: Anmeldung, dann (falls /auth/ich noch kein Repo kennt) GET mappe, das ein
 * fehlendes Repo anlegt oder mit eigener Meldung ablehnt, dann das Artefakt. Was nicht passt, sagt der Server samt
 * Meldung (Lehrende, fremde Mappe, unlesbare Datei); die Hülle zeigt diese Meldung statt eines eigenen Satzes.
 */
export async function mappeLaden<A>(quelle: { ich(): Promise<Ich | null>; mappe(): Promise<unknown>; lesen(): Promise<A> }): Promise<LadeErgebnis<A>> {
  let ich: Ich | null = null;
  try {
    ich = await quelle.ich();
    if (ich === null) return { typ: 'abgemeldet' };
    if (ich.repo === null && ich.rolle === 'studierende') await quelle.mappe();
    return { typ: 'geladen', ich, antwort: await quelle.lesen() };
  } catch (e) {
    const f = alsFehler(e);
    if (f.status === 401 || f.code === 'nicht-angemeldet') return { typ: 'abgemeldet' };
    return { typ: 'fehler', ich, ...f };
  }
}

const TEXT = {
  datei: 'Die Datei in deiner Mappe passt nicht zum erwarteten Format. Sag Markus Bescheid.',
  ladenFehlt: 'Deine Mappe lässt sich gerade nicht laden.',
  speichernGesichert: 'Speichern gerade nicht möglich. Dein Entwurf ist auf diesem Gerät gesichert.',
  speichernUngesichert: 'Speichern gerade nicht möglich. Dein Entwurf konnte auf diesem Gerät nicht gesichert werden – lass diesen Tab offen.',
  gesichert: 'Dein Entwurf ist auf diesem Gerät gesichert.',
  ungesichert: 'Dein Entwurf konnte auf diesem Gerät nicht gesichert werden – lass diesen Tab offen.',
} as const;

// Abgelehnt, weil die Anfrage nicht passt: Neu versuchen hilft nicht, die Meldung des Servers sagt, was zu tun ist.
const ABGELEHNT: readonly string[] = ['nicht-freigeschaltet', 'ungueltig', 'csrf'];

/** Hinweis im Zustand „ladefehler“. `fehlerCode` „datei“ setzt die Hülle selbst (Datei passt nicht zum Schema). */
export function ladefehlerHinweis(fehlerCode: string | null, meldung: string | null): { text: string; nochmal: boolean } {
  if (fehlerCode === 'datei') return { text: TEXT.datei, nochmal: false };
  return { text: meldung ?? TEXT.ladenFehlt, nochmal: fehlerCode === null || !ABGELEHNT.includes(fehlerCode) };
}

/**
 * Hinweis im Zustand „fehler“ (Speichern gescheitert). Hat der Server abgelehnt, steht seine Meldung da, dazu jede
 * Feldmeldung (auch solche, die kein Formularfeld zeigt, etwa zu einer gespeicherten Entscheidung). Sonst gilt
 * „gerade nicht möglich“.
 */
export function speicherfehlerHinweis(fehlerCode: string | null, meldung: string | null, felder: readonly Feldfehler[], gesichert: boolean): { text: string; details: string[] } {
  if (fehlerCode !== null && ABGELEHNT.includes(fehlerCode) && meldung !== null) {
    return { text: `${meldung} ${gesichert ? TEXT.gesichert : TEXT.ungesichert}`, details: [...new Set(felder.map((f) => f.meldung))] };
  }
  return { text: gesichert ? TEXT.speichernGesichert : TEXT.speichernUngesichert, details: [] };
}

/** Das Statuswort der Statuszeile. Leer, wenn es nichts zu sagen gibt. */
export function statusText(zustand: HuellenZustand, hatEntwurf: boolean): string {
  if (zustand === 'gespeichert') return 'Gespeichert';
  if (zustand === 'konflikt') return 'Inzwischen geändert';
  if (zustand === 'laden' || zustand === 'wird-eingerichtet') return '';
  return hatEntwurf ? 'Entwurf' : '';
}

/** Gesperrt wird nur bei Schemafehlern. Prüflisten-Hinweise (zum Beispiel „keine machbare Annahme“) sind keine. */
export function speichernErlaubt(name: ArtefaktName, daten: unknown): { erlaubt: boolean; fehler: Feldfehler[] } {
  const r = artefaktParsen(name, daten);
  return r.ok ? { erlaubt: true, fehler: [] } : { erlaubt: false, fehler: r.fehler };
}

/** Nur aus diesen Zuständen geht ein Speichern los. Wer „speichert“ ist, sendet nicht noch einmal (kein doppeltes PUT). */
export function darfSpeichern(zustand: HuellenZustand): boolean {
  return zustand === 'bereit' || zustand === 'gespeichert' || zustand === 'fehler';
}

/** Was beim Öffnen gilt: nichts vom letzten Mal. Ein Ladefehler zeigt so nie alte Daten. */
export function leererStand(): { daten: null; dirty: false; basisSha: null; aelterEntwurf: null; gesichert: true } {
  return { daten: null, dirty: false, basisSha: null, aelterEntwurf: null, gesichert: true };
}

/** Neuversuche zählen nur innerhalb einer Einrichtungsphase; sobald etwas anderes passiert, beginnt das Zählen von vorn. */
export function versucheNach(zustand: HuellenZustand, versuche: number): number {
  return zustand === 'laden' || zustand === 'wird-eingerichtet' ? versuche : 0;
}

/**
 * Was auf dem Server liegt, für das Formular (zum Beispiel: welche Zeilen schon gespeichert sind). Nie ein Entwurf.
 * `roh` ist die Antwort des Servers (null = die Datei gibt es noch nicht), `geparst` dieselbe Datei nach dem Schema.
 */
export function serverStandNachLaden<D>(roh: unknown, geparst: D): D | null {
  return roh === null || roh === undefined ? null : geparst;
}

/** Nach dem Speichern: Geglückt → das Gesendete liegt jetzt auf dem Server; Konflikt → unverändert. */
export function serverStandNachSpeichern<D>(vorher: D | null, antwort: { konflikt: true } | { basisSha: string }, gesendet: D): D | null {
  return 'konflikt' in antwort ? vorher : gesendet;
}
