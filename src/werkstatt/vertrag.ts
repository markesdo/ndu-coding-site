// Vertrag zwischen Browser, API und MCP-Connector: nur Typen und Konstanten, keine Logik.
import type { ArtefaktName, Feldfehler } from './schemas/index.js';
import type { Rolle } from './zugang.js';

export interface ApiFehler {
  fehler: string;
  code:
    | 'nicht-angemeldet'
    | 'nicht-freigeschaltet'
    | 'wird-eingerichtet'
    | 'ungueltig'
    | 'konflikt'
    | 'github-fehler'
    | 'csrf'
    | 'unbekannt';
  felder?: Feldfehler[];
}

export interface MappeStand {
  kohorte: string;
  repo: string;
  // Lesezugriff der Person auf ihr Repo: 'unbekannt' bei Lehrenden, im MCP und wenn GitHub nicht antwortet.
  lesezugriff: 'aktiv' | 'eingeladen' | 'unbekannt';
  artefakte: { name: ArtefaktName; vorhanden: boolean }[];
}

export interface ArtefaktAntwort {
  name: ArtefaktName;
  daten: unknown | null;
  // Blob-SHA von mappe/<name>.json; null = die Datei gibt es noch nicht.
  // Pro Datei, damit verschiedene Artefakte einander nie blockieren.
  basisSha: string | null;
}

export interface SpeichernAnfrage {
  daten: unknown;
  basisSha: string | null;
  nachricht?: string;
}

export interface SpeichernAntwort {
  basisSha: string;
  commitUrl: string;
}

export interface Ich {
  githubId: number;
  login: string;
  kohorte: string;
  rolle: Rolle;
  // null = die Mappe wird noch eingerichtet.
  repo: string | null;
}

export const WERKSTATT_BASIS = '/api/werkstatt';

export const ROUTEN = {
  ich: { methode: 'GET', pfad: '/api/werkstatt/auth/ich' },
  login: { methode: 'GET', pfad: '/api/werkstatt/auth/login' }, // ?weiter=<Pfad auf dieser Website>
  callback: { methode: 'GET', pfad: '/api/werkstatt/auth/callback' },
  abmelden: { methode: 'POST', pfad: '/api/werkstatt/auth/abmelden' },
  mappe: { methode: 'GET', pfad: '/api/werkstatt/mappe' },
  artefaktLesen: { methode: 'GET', pfad: '/api/werkstatt/mappe/:artefakt' },
  // 409 mit code „konflikt“, wenn basisSha nicht mehr stimmt.
  artefaktSpeichern: { methode: 'PUT', pfad: '/api/werkstatt/mappe/:artefakt' },
  mcp: { methode: 'ALL', pfad: '/api/werkstatt/mcp' },
} as const;

export const MCP_WERKZEUGE = {
  mappeUebersicht: 'mappe_uebersicht',
  artefaktLesen: 'artefakt_lesen',
  methodeErklaeren: 'methode_erklaeren',
  artefaktPruefen: 'artefakt_pruefen',
} as const;
