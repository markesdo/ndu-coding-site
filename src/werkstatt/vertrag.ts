// Vertrag zwischen Browser, API und MCP-Connector: nur Typen und Konstanten, keine Logik.
import type { ArtefaktName, Feldfehler } from './schemas/index.js';
import type { Befund } from './verknuepfungen.js';
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

// Rückblick (nur Lehrende): Zählstand jeder Mappe der Kohorte. Fehlt eine Mappe noch, stehen dort Nullen.
export interface PersonZahlen {
  kuerzel: string;
  // Von BRIEF_FELDER (statistik.ts) ausgefüllt.
  briefFelder: number;
  entscheidungen: number;
  annahmen: number;
  fragen: number;
  // Artefakte, deren Datei nicht zum Schema passt (zählen als 0).
  unlesbar: ArtefaktName[];
  // Die Mappe ließ sich gerade nicht lesen (GitHub): Zahlen sind 0, nicht „nichts gemacht“.
  fehler?: true;
}

export interface Zahlen {
  kohorte: string;
  briefFelderGesamt: number;
  personen: PersonZahlen[];
}

// Lehrenden-Ansicht (Spec §3.7, nur Lehrende der Kohorte): alle Mappen einer Kohorte nebeneinander, nur lesend.
// Höchstens so viele Commits pro Artefakt liest der Speicher (eine Seite der GitHub-API); mehr heißt „100+“.
export const VERLAUF_HOECHSTENS = 100;

export interface LehrendenArtefakt {
  name: ArtefaktName;
  // offen = noch nicht gespeichert; unlesbar = die Datei passt nicht zum Format der Werkstatt.
  stand: 'vorhanden' | 'offen' | 'unlesbar';
  // Wie tag_stand (tag-stand.ts): ein Satz zum Umfang („2 von 5 Snapshots“), was fehlt, und ob noch nichts Eigenes
  // drinsteht. Nur bei vorhanden; sonst null, [] und false.
  umfang: string | null;
  fehlt: string[];
  leer: boolean;
  // Zu welchem Kurstag das Artefakt fällig ist (faelligZuTag in tag-stand.ts).
  faelligZuTag: number;
  // Commits an mappe/<name>.json seit dem Bezugstag (ab seinem Kalendertag in Wien); ohne Bezugstag alle.
  commits: number;
  // Es gab mehr Commits, als der Speicher liest (commits ist dann die Untergrenze).
  mehr: boolean;
  // Zeitpunkt des letzten Commits (ISO); null = nie gespeichert.
  zuletzt: string | null;
  // Gerendert wie mappe/<name>.md im Repo und im Connector; null, wenn nicht vorhanden.
  markdown: string | null;
}

export type LehrendenMappe =
  | {
      kuerzel: string;
      zustand: 'bereit';
      repo: string;
      repoUrl: string;
      // Letzter Commit über alle Artefakte (ISO); null = noch nie gespeichert.
      zuletzt: string | null;
      artefakte: LehrendenArtefakt[];
      luecken: Befund[];
    }
  // Die Person hat sich noch nicht angemeldet: es gibt noch kein Repo.
  | { kuerzel: string; zustand: 'keine-mappe' }
  // github = gerade nicht lesbar; zuordnung = das Repo gehört laut werkstatt.json nicht dieser Person (Kohorte).
  | { kuerzel: string; zustand: 'fehler'; grund: 'github' | 'zuordnung' };

export interface LehrendenAnsicht {
  kohorte: string;
  // Aktive Kohorten, in denen die Person lehrt (Auswahl), neueste zuerst.
  kohorten: { id: string; titel: string }[];
  // Welcher Kurstag dran ist (kurstagBestimmen in tag-stand.ts): heute oder der nächste.
  kurstag: { tag: number; titel: string; heute: boolean };
  // Spalten der Kohorte in Anzeigereihenfolge; hausaufgabe = zwischen zwei Kurstagen (Interviews).
  spalten: { name: ArtefaktName; faelligZuTag: number; hausaufgabe: boolean }[];
  // Kurstage mit Termin bis heute (Auswahl „Änderungen seit …“).
  tage: { tag: number; datum: string }[];
  // Seit diesem Kurstag wird gezählt; null = noch kein Kurstag vorbei, es zählen alle Commits.
  bezug: { tag: number; datum: string } | null;
  // Alphabetisch nach Kürzel.
  personen: LehrendenMappe[];
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
  // Nur Lehrende; 403 für Studierende.
  zahlen: { methode: 'GET', pfad: '/api/werkstatt/zahlen' },
  // Nur Lehrende der Kohorte; ?kohorte=<id>&seit=<Kurstag>, beide optional. 403 für alle anderen.
  lehrende: { methode: 'GET', pfad: '/api/werkstatt/lehrende' },
  mcp: { methode: 'ALL', pfad: '/api/werkstatt/mcp' },
} as const;

export const MCP_WERKZEUGE = {
  mappeUebersicht: 'mappe_uebersicht',
  artefaktLesen: 'artefakt_lesen',
  methodeErklaeren: 'methode_erklaeren',
  artefaktPruefen: 'artefakt_pruefen',
  verknuepfungenPruefen: 'verknuepfungen_pruefen',
  tagStand: 'tag_stand',
} as const;
