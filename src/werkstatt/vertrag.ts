// Vertrag zwischen Browser, API und MCP-Connector: nur Typen und Konstanten, keine Logik.
import type { FeedbackEintrag, FeedbackZahlen } from './feedback.js';
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
  // Zu welchem Kurstag das Artefakt fällig ist (faelligZuTag in tag-stand.ts), und ob es zum Kurstag der Ansicht
  // (heute oder der nächste) schon fällig ist (faelligBis in tag-stand.ts).
  faelligZuTag: number;
  faellig: boolean;
  // Commits an mappe/<name>.json seit dem Bezugstag (ab seinem Kalendertag in Wien); ohne Bezugstag alle.
  commits: number;
  // Es gab mehr Commits, als der Speicher liest (commits ist dann die Untergrenze).
  mehr: boolean;
  // Zeitpunkt des letzten Commits (ISO); null = nie gespeichert.
  zuletzt: string | null;
  // Feedback der Lehrenden zu diesem Artefakt (NDU-35): offen, erledigt, noch nicht geöffnet, Antworten.
  // null = mappe/feedback.json ließ sich nicht lesen.
  feedback: FeedbackZahlen | null;
}

// Inhalt eines Artefakts für den Leser, erst beim Öffnen geholt (GET /api/werkstatt/lehrende/artefakt).
export interface LehrendenInhalt {
  name: ArtefaktName;
  stand: LehrendenArtefakt['stand'];
  // Mit dem Schema des Editors geprüft (wie DatenVon<name>); null, wenn offen oder unlesbar.
  daten: unknown | null;
  // Nur bei unlesbar, wenn die Datei gültiges JSON ist, aber nicht zum Schema passt: ihr Inhalt als Text (Rückfall im
  // Leser). Kaputtes JSON liefert der Speicher nicht mit: dann null.
  roh: string | null;
  // Feedback und Antworten zu diesem Artefakt; null = mappe/feedback.json ließ sich nicht lesen (dann auch kein Schreiben).
  feedback: FeedbackEintrag[] | null;
}

// Feedback (NDU-35). Lehrende: POST /api/werkstatt/lehrende/feedback?kohorte=…&person=…
export interface FeedbackSchreibenAnfrage {
  artefakt: ArtefaktName;
  // Zeilen-ID (A2, I2-4) oder beim Brief der Abschnitt (problem); fehlt = zum ganzen Artefakt.
  zeilenId?: string;
  text: string;
}

// Studierende: POST /api/werkstatt/mappe/feedback, genau eine Änderung.
export type FeedbackAktion =
  | { aktion: 'antworten'; antwortAuf: string; text: string }
  | { aktion: 'erledigt'; id: string; erledigt: boolean }
  | { aktion: 'gesehen'; artefakt: ArtefaktName };

// Antwort beider Seiten: alle Einträge der Mappe (Lehrende: nur die des Artefakts) nach der Änderung.
export interface FeedbackAntwort {
  eintraege: FeedbackEintrag[];
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
  // Welcher Kurstag dran ist (kurstagBestimmen in tag-stand.ts): heute, der nächste, oder der letzte, wenn der Kurs vorbei ist.
  kurstag: { tag: number; titel: string; lage: 'heute' | 'naechster' | 'vorbei' };
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
  // Inhalt eines Artefakts für den Leser; ?kohorte=<id>&person=<Kürzel>&artefakt=<name>, dieselben Prüfungen.
  lehrendeArtefakt: { methode: 'GET', pfad: '/api/werkstatt/lehrende/artefakt' },
  // Feedback schreiben (nur Lehrende der Kohorte, nie ins Artefakt); ?kohorte=<id>&person=<Kürzel>, dieselben Prüfungen.
  lehrendeFeedback: { methode: 'POST', pfad: '/api/werkstatt/lehrende/feedback' },
  // Eigenes Feedback lesen bzw. antworten, erledigt setzen, als gesehen markieren (nur Studierende, eigene Mappe).
  feedbackLesen: { methode: 'GET', pfad: '/api/werkstatt/mappe/feedback' },
  feedbackAendern: { methode: 'POST', pfad: '/api/werkstatt/mappe/feedback' },
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
