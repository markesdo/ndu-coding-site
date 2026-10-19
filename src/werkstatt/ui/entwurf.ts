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
    // Entwürfe sind oft unvollständig: Objekt-Form genügt, ob das Schema passt, zeigt der Editor an den Feldern.
    // Nur Müll (kein Objekt, daten kein Objekt) gilt als kein Entwurf.
    if (typeof e !== 'object' || e === null || Array.isArray(e)) return null;
    if (typeof e.daten !== 'object' || e.daten === null || Array.isArray(e.daten)) return null;
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

/**
 * Ein Commit kam erst nach dem Schließen oder Neu-Öffnen an: Der Entwurf, der genau das Gesendete enthält und auf dem
 * gespeicherten Stand beruht, ist jetzt veröffentlicht und kann weg. Ein Entwurf auf anderem Stand oder mit weiterem
 * Text bleibt. true = gelöscht.
 */
export function entwurfNachCommitLoeschen(name: ArtefaktName, githubId: number, kohorte: string, gesendeterStand: string | null, gesendeteDaten: unknown): boolean {
  const e = entwurfLaden(name, githubId, kohorte);
  if (e === null || e.basisSha !== gesendeterStand || JSON.stringify(e.daten) !== JSON.stringify(gesendeteDaten)) return false;
  entwurfLoeschen(name, githubId, kohorte);
  return true;
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

// Zeilenvorlagen der Listen, damit auch eine Zeile `{}` alle Felder hat. Das Schema-Modul bietet keine; Schlüssel: <artefakt>.<liste>.
const ZEILEN: Record<string, Record<string, unknown>> = {
  'annahmen.annahmen': { id: '', text: '', art: 'wuenschenswert', wichtig: 'mittel', beleg: 'keiner', belegIds: [] },
  'entscheidungen.entscheidungen': { id: '', datum: '', entscheidung: '', grund: '', beleg: 'keiner', belegIds: [] },
  'leitfaden.fragen': { id: '', text: '', art: 'kern' },
  'interviews.interviews': { id: '', datum: '', pseudonym: '', einwilligung: false, zitat: '', kurzinfos: '', einsichten: [], chancen: [], notizen: '', zitate: [] },
  'interviews.interviews.chancen': { text: '', belege: [] },
  'interviews.interviews.zitate': { id: '', text: '' },
};

const istObjekt = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);

function mische(vorlage: unknown, roh: unknown, pfad: string): unknown {
  if (Array.isArray(vorlage)) {
    if (!Array.isArray(roh)) return [...vorlage];
    const zeile = ZEILEN[pfad];
    return zeile ? roh.filter(istObjekt).map((r) => mische(zeile, r, pfad)) : roh.filter((x) => typeof x === 'string');
  }
  if (istObjekt(vorlage)) {
    const r = istObjekt(roh) ? roh : {};
    const aus: Record<string, unknown> = {};
    for (const k of Object.keys(vorlage)) aus[k] = mische(vorlage[k], r[k], `${pfad}.${k}`);
    // Weitere Felder (optionale wie „riskanteste“) bleiben, wenn sie Text sind.
    for (const k of Object.keys(r)) if (!(k in vorlage) && typeof r[k] === 'string') aus[k] = r[k];
    return aus;
  }
  return typeof roh === typeof vorlage ? roh : vorlage;
}

/**
 * Legt einen gespeicherten Entwurf über den leeren Stand: fehlende Felder kommen aus der Vorlage, Falschtypisiertes fällt
 * auf sie zurück, Listen bleiben Listen. So stürzen Formular, Vorschau und Markdown auch bei einem kaputten Entwurf nicht ab;
 * was inhaltlich nicht stimmt, melden die Feldfehler des Schemas.
 */
export function entwurfNormalisieren(name: ArtefaktName, leer: unknown, roh: unknown): unknown {
  return mische(leer, roh, name);
}
