// Zustandsmaschine der Editor-Hülle: rein, ohne React und DOM. Die Komponente führt die Effekte aus.
// Regel: Der Entwurf wird nur gelöscht, wenn der Server das Speichern bestätigt hat.
import { artefaktParsen, type ArtefaktName, type Feldfehler } from '../schemas/index.js';

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
