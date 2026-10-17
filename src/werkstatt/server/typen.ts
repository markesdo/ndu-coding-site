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
  speichern(
    repo: string,
    name: ArtefaktName,
    dateien: Record<string, string>,
    basisSha: string | null,
    autor: { name: string; email: string },
    nachricht: string,
  ): Promise<{ basisSha: string; commitUrl: string } | { konflikt: true }>;
  uebersicht(repo: string): Promise<{ name: ArtefaktName; vorhanden: boolean }[]>;
  // null = Repo oder Datei fehlt.
  werkstattJson(repo: string): Promise<{ kohorte: string; githubId: number } | null>;
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
