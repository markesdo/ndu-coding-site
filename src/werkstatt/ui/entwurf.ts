// Entwurf im Browser: localStorage, pro Person (GitHub-ID), Kohorte und Artefakt. Jeder Zugriff in try/catch –
// im privaten Fenster, bei gesperrten Website-Daten oder vollem Speicher wirft localStorage; der Editor läuft dann ohne Entwurf weiter.
// Die Person steckt im Schlüssel, damit auf einem geteilten Rechner niemand den Entwurf der Vorgängerin sieht.
// Der Entwurf merkt sich den Stand (basisSha), auf dem er entstand: Nur auf demselben Stand wird er still wiederhergestellt.
import type { ArtefaktName } from '../schemas/index.js';

export const ENTWURF_PRAEFIX = 'ndu-werkstatt-';

export interface Entwurf {
  basisSha: string | null;
  daten: unknown;
}

const schluessel = (name: ArtefaktName, githubId: number, kohorte: string) => `${ENTWURF_PRAEFIX}${githubId}-${kohorte}-${name}`;

export function entwurfLaden(name: ArtefaktName, githubId: number, kohorte: string): Entwurf | null {
  try {
    const roh = localStorage.getItem(schluessel(name, githubId, kohorte));
    if (roh === null) return null;
    const e = JSON.parse(roh) as Partial<Entwurf> | null;
    if (typeof e !== 'object' || e === null || !('daten' in e)) return null;
    return { basisSha: typeof e.basisSha === 'string' ? e.basisSha : null, daten: e.daten };
  } catch {
    return null;
  }
}

/** true = gesichert. false = der Browser lässt es nicht zu; die Oberfläche darf dann nichts von „gesichert“ sagen. */
export function entwurfSichern(name: ArtefaktName, githubId: number, kohorte: string, basisSha: string | null, daten: unknown): boolean {
  try {
    localStorage.setItem(schluessel(name, githubId, kohorte), JSON.stringify({ basisSha, daten } satisfies Entwurf));
    return true;
  } catch {
    return false;
  }
}

export function entwurfLoeschen(name: ArtefaktName, githubId: number, kohorte: string): void {
  try {
    localStorage.removeItem(schluessel(name, githubId, kohorte));
  } catch {
    // nichts zu löschen, wenn der Speicher nicht erreichbar ist
  }
}

/** Beim Abmelden: alle Entwürfe dieses Browsers weg, egal von wem. */
export function entwuerfeLoeschen(): void {
  try {
    const weg: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k !== null && k.startsWith(ENTWURF_PRAEFIX)) weg.push(k);
    }
    for (const k of weg) localStorage.removeItem(k);
  } catch {
    // Speicher nicht erreichbar: nichts zu löschen
  }
}

/**
 * Womit der Editor startet. Ein Entwurf auf dem Stand des Servers wird still wiederhergestellt.
 * Auf einem anderen Stand zeigt der Editor den Server-Stand und hält den Entwurf zur ausdrücklichen Wahl bereit:
 * So überschreibt ein alter Entwurf nie unbemerkt Neueres.
 */
export function startStand<D>(server: { daten: D; basisSha: string | null }, entwurf: { basisSha: string | null; daten: D } | null): {
  daten: D;
  basisSha: string | null;
  /** true = die Daten sind ein unveröffentlichter Entwurf. */
  alsEntwurf: boolean;
  /** Entwurf auf anderem Stand: zur Wahl anbieten. */
  aelterEntwurf: D | null;
} {
  if (entwurf === null) return { daten: server.daten, basisSha: server.basisSha, alsEntwurf: false, aelterEntwurf: null };
  if (entwurf.basisSha === server.basisSha) return { daten: entwurf.daten, basisSha: server.basisSha, alsEntwurf: true, aelterEntwurf: null };
  return { daten: server.daten, basisSha: server.basisSha, alsEntwurf: false, aelterEntwurf: entwurf.daten };
}
