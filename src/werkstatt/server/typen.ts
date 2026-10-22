// Gemeinsamer Vertrag der Werkstatt-Server-Teile: was jeder Router über appErstellen(abh) bekommt.
// Nur Typen. Implementiert in T4 (GithubIdentitaet), T5 (Speicher); lokal: fake-speicher.ts, fake-identitaet.ts.
import type { ArtefaktName } from '../schemas/index.js';
import type { Mitgliedschaft, Zugang } from '../zugang.js';

// Ein Schlüssel aus MCP_TOKEN_KEYS (`<kid>:<base64 32 B>`, kommagetrennt, erster = aktuell).
export interface Schluessel {
  kid: string;
  key: Uint8Array;
}

export interface Umgebung {
  githubAppId: string;
  githubPrivateKey: string;
  githubClientId: string;
  githubClientSecret: string;
  sessionSecret: string;
  tokenKeys: Schluessel[];
  zugang: Zugang;
  // WERKSTATT_ORIGIN (Prod); null = Origin der Anfrage (Preview, lokal). Immer über origin(c) lesen.
  origin: string | null;
  // NODE_ENV ∈ {development, test}.
  lokal: boolean;
}

// basisSha ist immer der Blob-SHA von mappe/<name>.json (null = die Datei gibt es nicht).
export interface Speicher {
  // Idempotent: ein zweiter Aufruf für dieselbe Person liefert dasselbe Repo; gehört es einer anderen GitHub-ID, wirft er.
  anlegen(m: Mitgliedschaft, githubId: number): Promise<{ repo: string }>;
  lesen(repo: string, name: ArtefaktName): Promise<{ daten: unknown | null; basisSha: string | null }>;
  // Ein Aufruf = ein Commit mit allen `dateien` (Pfad -> Inhalt). Konflikt nur, wenn basisSha nicht zur JSON-Datei
  // dieses Artefakts passt; ein anderes Artefakt blockiert nie.
  // readme: wenn angegeben, schreibt der Speicher README.md bei jedem Versuch neu – aus der Dateiliste des Stands,
  // auf dem genau dieser Commit landet (dieses Artefakt eingeschlossen). So bleibt es auch bei Wettläufen aktuell.
  speichern(
    repo: string,
    name: ArtefaktName,
    dateien: Record<string, string>,
    basisSha: string | null,
    autor: { name: string; email: string },
    nachricht: string,
    readme?: (vorhanden: { name: ArtefaktName; vorhanden: boolean }[]) => string,
  ): Promise<{ basisSha: string; commitUrl: string } | { konflikt: true }>;
  uebersicht(repo: string): Promise<{ name: ArtefaktName; vorhanden: boolean }[]>;
  // Verlauf von mappe/<name>.json auf main (Lehrenden-Ansicht): Commit-Zeitpunkte (ISO, neueste zuerst), höchstens
  // VERLAUF_HOECHSTENS (vertrag.ts). vollstaendig = false: es gibt ältere, die fehlen. Fehlt das Repo oder main: leer und vollständig.
  // Eine Anfrage bei GitHub pro Aufruf.
  verlauf(repo: string, name: ArtefaktName): Promise<{ zeitpunkte: string[]; vollstaendig: boolean }>;
  // Idempotent; lädt die Person ein, falls nötig; nie Schreibrechte (nur `pull`). 'eingeladen' = Einladung offen.
  // Der aktuelle Login kommt aus der unveränderlichen GitHub-ID, nie aus der Sitzung.
  lesezugriff(repo: string, githubId: number): Promise<'aktiv' | 'eingeladen'>;
  // null = Repo oder Datei fehlt.
  werkstattJson(repo: string): Promise<{ kohorte: string; githubId: number } | null>;
  // Feedback (NDU-35, mappe/feedback.json): das geparste JSON, null = Repo oder Datei fehlt. Kaputtes JSON wirft DateiUnlesbar.
  feedbackLesen(repo: string): Promise<unknown | null>;
  // Ein Commit, der mappe/feedback.json ändert. aendern bekommt den Stand am Kopf genau des Versuchs, auf dem der Commit
  // landet (null = Datei fehlt), und liefert den neuen Inhalt oder null (nichts zu ändern, kein Commit); wirft es, wird
  // nichts geschrieben. Verliert der Commit das Fast-Forward-Rennen (jemand anderes hat inzwischen gespeichert, auch
  // Feedback), beginnt der nächste Versuch auf dem neuen Kopf: Kein Eintrag geht verloren, und es gibt keinen Konflikt
  // für die Person (die Datei wird nur ergänzt). Kaputtes JSON wirft DateiUnlesbar.
  feedbackAendern(
    repo: string,
    aendern: (alt: unknown | null) => string | null,
    autor: { name: string; email: string },
    nachricht: string,
  ): Promise<{ commitUrl: string } | { unveraendert: true }>;
}

export interface GithubIdentitaet {
  loginUrl(state: string, redirectUri: string): string;
  codeEinloesen(code: string, redirectUri: string): Promise<{ githubId: number; login: string }>;
}

export interface Cache {
  // undefined = nicht vorhanden oder abgelaufen.
  get(k: string): Promise<unknown>;
  set(k: string, v: unknown, ttlSek: number): Promise<void>;
}

export interface Abhaengigkeiten {
  umgebung: Umgebung;
  speicher: Speicher;
  github: GithubIdentitaet;
  cache: Cache;
  // Millisekunden wie Date.now(); in Tests steuerbar.
  jetzt(): number;
}

// Hono-Env der Werkstatt-App: appErstellen legt abh in jede Anfrage (für origin(c)).
export interface WerkstattEnv {
  Variables: { abh: Abhaengigkeiten };
}
