// Browser-Client der Werkstatt-API. Wirft ApiError mit status und code; Texte kommen vom Server (Spec §5).
import { ROUTEN, type ApiFehler, type ArtefaktAntwort, type FeedbackAktion, type FeedbackAntwort, type FeedbackSchreibenAnfrage, type Ich, type LehrendenAnsicht, type LehrendenInhalt, type MappeStand, type SpeichernAnfrage, type SpeichernAntwort } from '../vertrag.js';
import { entwuerfeLoeschen } from './entwurf.js';
import { lehrendeFeedbackPfad } from './feedback-hilfen.js';
import { anfragePfad, inhaltPfad } from './lehrenden-hilfen.js';
import type { ArtefaktName, Feldfehler } from '../schemas/index.js';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiFehler['code'],
    message: string,
    readonly felder?: Feldfehler[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Ohne Meldung des Servers (kein Netz, keine JSON-Antwort) bleibt der Text leer; die Anzeige wählt dann ihren eigenen.
const OHNE_MELDUNG = '';

async function anfrage(methode: string, pfad: string, body?: unknown): Promise<Response> {
  try {
    return await fetch(pfad, {
      method: methode,
      credentials: 'same-origin',
      headers: body === undefined ? { accept: 'application/json' } : { accept: 'application/json', 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // Kein Netz, Server aus, Zeitüberschreitung: wie „GitHub nicht erreichbar“ behandeln (Entwurf bleibt).
    throw new ApiError(0, 'github-fehler', OHNE_MELDUNG);
  }
}

async function fehlerAus(antwort: Response): Promise<ApiError> {
  let k: Partial<ApiFehler> = {};
  try {
    k = (await antwort.json()) as Partial<ApiFehler>;
  } catch {
    // kein JSON: ohne Meldung (die Anzeige wählt ihren Text)
  }
  const code = k.code ?? (antwort.status === 401 ? 'nicht-angemeldet' : 'unbekannt');
  return new ApiError(antwort.status, code, typeof k.fehler === 'string' ? k.fehler : OHNE_MELDUNG, k.felder);
}

const artefaktPfad = (name: ArtefaktName) => ROUTEN.artefaktLesen.pfad.replace(':artefakt', encodeURIComponent(name));

export const api = {
  /** Meldet ab und löscht alle Entwürfe dieses Browsers (geteilter Rechner). Die Entwürfe gehen auch weg, wenn die Anfrage scheitert. */
  async abmelden(): Promise<void> {
    entwuerfeLoeschen();
    const a = await anfrage('POST', ROUTEN.abmelden.pfad);
    if (!a.ok) throw await fehlerAus(a);
  },

  /** null = nicht angemeldet. */
  async ich(): Promise<Ich | null> {
    const a = await anfrage('GET', ROUTEN.ich.pfad);
    if (a.status === 401) return null;
    if (!a.ok) throw await fehlerAus(a);
    return (await a.json()) as Ich;
  },

  /** Stand der ganzen Mappe; legt sie beim ersten Mal an (503 „wird-eingerichtet“, solange das dauert). */
  async mappe(): Promise<MappeStand> {
    const a = await anfrage('GET', ROUTEN.mappe.pfad);
    if (!a.ok) throw await fehlerAus(a);
    return (await a.json()) as MappeStand;
  },

  /** Nur Lehrende: alle Mappen einer Kohorte (403 für alle anderen). Ohne kohorte die der Sitzung, ohne seit der letzte Kurstag. */
  async lehrende(kohorte?: string, seit?: number): Promise<LehrendenAnsicht> {
    const a = await anfrage('GET', anfragePfad(kohorte, seit));
    if (!a.ok) throw await fehlerAus(a);
    return (await a.json()) as LehrendenAnsicht;
  },

  /** Nur Lehrende: Inhalt eines Artefakts für den Leser (geprüfte Daten oder bei unlesbar der Rückfall roh). */
  async lehrendeInhalt(kohorte: string, person: string, artefakt: ArtefaktName): Promise<LehrendenInhalt> {
    const a = await anfrage('GET', inhaltPfad(kohorte, person, artefakt));
    if (!a.ok) throw await fehlerAus(a);
    return (await a.json()) as LehrendenInhalt;
  },

  /** Nur Lehrende der Kohorte: Feedback zu einem Artefakt (optional einer Zeile) schreiben. Antwort: alles Feedback dieses Artefakts. */
  async lehrendeFeedback(kohorte: string, person: string, inhalt: FeedbackSchreibenAnfrage): Promise<FeedbackAntwort> {
    const a = await anfrage('POST', lehrendeFeedbackPfad(kohorte, person), inhalt);
    if (!a.ok) throw await fehlerAus(a);
    return (await a.json()) as FeedbackAntwort;
  },

  /** Nur Studierende: das Feedback der eigenen Mappe. */
  async feedback(): Promise<FeedbackAntwort> {
    const a = await anfrage('GET', ROUTEN.feedbackLesen.pfad);
    if (!a.ok) throw await fehlerAus(a);
    return (await a.json()) as FeedbackAntwort;
  },

  /** Nur Studierende: antworten, erledigt setzen oder als gesehen markieren. */
  async feedbackAendern(aktion: FeedbackAktion): Promise<FeedbackAntwort> {
    const a = await anfrage('POST', ROUTEN.feedbackAendern.pfad, aktion);
    if (!a.ok) throw await fehlerAus(a);
    return (await a.json()) as FeedbackAntwort;
  },

  async lesen(name: ArtefaktName): Promise<ArtefaktAntwort> {
    const a = await anfrage('GET', artefaktPfad(name));
    if (!a.ok) throw await fehlerAus(a);
    return (await a.json()) as ArtefaktAntwort;
  },

  /** 409 ist kein Fehler, sondern ein erwartbarer Ausgang: `{ konflikt: true }`. */
  async speichern(name: ArtefaktName, daten: SpeichernAnfrage): Promise<SpeichernAntwort | { konflikt: true }> {
    const a = await anfrage('PUT', artefaktPfad(name), daten);
    if (a.status === 409) return { konflikt: true };
    if (!a.ok) throw await fehlerAus(a);
    return (await a.json()) as SpeichernAntwort;
  },
};
