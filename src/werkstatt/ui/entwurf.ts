// Entwurf im Browser: localStorage, pro Kohorte und Artefakt. Jeder Zugriff in try/catch – im privaten Fenster,
// bei gesperrten Website-Daten oder voll gelaufenem Speicher wirft localStorage; der Editor läuft dann ohne Entwurf weiter.
import type { ArtefaktName } from '../schemas/index.js';

const schluessel = (name: ArtefaktName, kohorte: string) => `ndu-werkstatt-${kohorte}-${name}`;

export function entwurfLaden(name: ArtefaktName, kohorte: string): unknown | null {
  try {
    const roh = localStorage.getItem(schluessel(name, kohorte));
    return roh === null ? null : (JSON.parse(roh) as unknown);
  } catch {
    return null;
  }
}

/** true = gesichert. false = der Browser lässt es nicht zu; die Oberfläche darf dann nichts von „gesichert“ sagen. */
export function entwurfSichern(name: ArtefaktName, kohorte: string, daten: unknown): boolean {
  try {
    localStorage.setItem(schluessel(name, kohorte), JSON.stringify(daten));
    return true;
  } catch {
    return false;
  }
}

export function entwurfLoeschen(name: ArtefaktName, kohorte: string): void {
  try {
    localStorage.removeItem(schluessel(name, kohorte));
  } catch {
    // nichts zu löschen, wenn der Speicher nicht erreichbar ist
  }
}
