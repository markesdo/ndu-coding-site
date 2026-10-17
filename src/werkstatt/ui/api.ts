// Browser-Client der Werkstatt-API. Wirft ApiError mit status und code; Texte kommen vom Server (Spec §5).
import { ROUTEN, type ApiFehler, type ArtefaktAntwort, type Ich, type SpeichernAnfrage, type SpeichernAntwort } from '../vertrag.js';
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

const NETZ_FEHLER = 'Speichern gerade nicht möglich.';

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
    throw new ApiError(0, 'github-fehler', NETZ_FEHLER);
  }
}

async function fehlerAus(antwort: Response): Promise<ApiError> {
  let k: Partial<ApiFehler> = {};
  try {
    k = (await antwort.json()) as Partial<ApiFehler>;
  } catch {
    // kein JSON: Standardtext unten
  }
  const code = k.code ?? (antwort.status === 401 ? 'nicht-angemeldet' : 'unbekannt');
  return new ApiError(antwort.status, code, typeof k.fehler === 'string' ? k.fehler : NETZ_FEHLER, k.felder);
}

const artefaktPfad = (name: ArtefaktName) => ROUTEN.artefaktLesen.pfad.replace(':artefakt', encodeURIComponent(name));

export const api = {
  /** null = nicht angemeldet. */
  async ich(): Promise<Ich | null> {
    const a = await anfrage('GET', ROUTEN.ich.pfad);
    if (a.status === 401) return null;
    if (!a.ok) throw await fehlerAus(a);
    return (await a.json()) as Ich;
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
