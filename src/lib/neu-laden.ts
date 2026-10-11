// „Neue Version – neu laden“: Vergleich und Takt ohne DOM, damit testbar. Eingebunden über components/neu-laden.ts.
// Jede Seite trägt beim Bauen die Commit-Kennung (lib/build.ts) als <meta name="ndu-build">; /version.json nennt die
// des aktuellen Deploys. Weichen sie ab, zeigt die Seite einen Hinweis – neu geladen wird nur auf Klick.

/** So oft fragt ein sichtbarer Tab nach. */
export const PRUEF_MS = 60_000;
/** Kommt der Tab nach vorn, wird gleich geprüft – aber nicht öfter als so. */
export const MIN_ABSTAND_MS = 10_000;
/** Bei wiederholten Fehlern höchstens so lange warten. */
export const MAX_MS = 10 * 60_000;
/** Eine Abfrage gibt nach so langer Zeit auf. */
export const TIMEOUT_MS = 8000;

const KENNUNG = /^[0-9a-z_-]{1,64}$/i;

/** Antwort von /version.json prüfen: nur { build: "<Kennung>" } zählt; die Login-Seite (HTML) oder Unsinn → null. */
export function versionAus(roh: unknown): string | null {
  if (!roh || typeof roh !== 'object') return null;
  const { build } = roh as Record<string, unknown>;
  return typeof build === 'string' && KENNUNG.test(build) ? build : null;
}

/**
 * Hinweis zeigen? Nur wenn die Seite eine Kennung hat (lokal nicht), der Server eine andere meldet
 * und genau diese nicht schon weggeklickt wurde – die nächste neue Version zeigt ihn wieder.
 */
export function brauchtHinweis(geladen: string, neu: string | null, verworfen: string | null): boolean {
  return Boolean(geladen && neu && neu !== geladen && neu !== verworfen);
}

/** Wartezeit bis zur nächsten Abfrage: normal PRUEF_MS, nach Fehlern verdoppelt bis MAX_MS. */
export function naechstePruefung(ok: boolean, fehlerInFolge: number): number {
  if (ok) return PRUEF_MS;
  return Math.min(PRUEF_MS * 2 ** Math.max(0, fehlerInFolge - 1), MAX_MS);
}

/** Adresse fürs Neuladen: derselbe Abschnitt als Anker, damit man dort landet, auch wenn sich darüber etwas verschoben hat. */
export function ziel(pfad: string, suche: string, anker: string | null): string {
  return anker ? `${pfad}${suche}#${anker}` : `${pfad}${suche}`;
}
