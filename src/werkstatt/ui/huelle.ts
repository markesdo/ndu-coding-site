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
  | 'fehler';

export type Effekt = 'entwurfSichern' | 'entwurfLoeschen' | 'neuLaden';

export type Ereignis =
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
    case 'geladen':
      return zustand === 'laden' ? { zustand: 'bereit', effekte: [] } : bleibt;
    case 'ladenFehlgeschlagen': {
      if (zustand !== 'laden') return bleibt;
      // Beim Laden gibt es keinen Konflikt; ein 409 hier ist ein Fehler.
      const z = ausFehler(e.status, e.code);
      return { zustand: z === 'konflikt' ? 'fehler' : z, effekte: [] };
    }
    case 'geaendert':
      if (zustand === 'laden' || zustand === 'speichert') return bleibt;
      // Im Konflikt bleibt der Konflikt, der Entwurf wird trotzdem gesichert.
      return { zustand: zustand === 'konflikt' ? 'konflikt' : 'bereit', effekte: ['entwurfSichern'] };
    case 'speichern':
      // Der Entwurf wird vor dem Senden gesichert: Bricht die Verbindung ab, geht nichts verloren.
      if (zustand === 'bereit' || zustand === 'gespeichert' || zustand === 'fehler') {
        return { zustand: 'speichert', effekte: ['entwurfSichern'] };
      }
      return bleibt;
    case 'gespeichert':
      return zustand === 'speichert' ? { zustand: 'gespeichert', effekte: ['entwurfLoeschen'] } : bleibt;
    case 'speichernFehlgeschlagen':
      return zustand === 'speichert' ? { zustand: ausFehler(e.status, e.code), effekte: [] } : bleibt;
    case 'neuLaden':
      if (zustand === 'konflikt' || zustand === 'fehler' || zustand === 'wird-eingerichtet' || zustand === 'abgemeldet') {
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
