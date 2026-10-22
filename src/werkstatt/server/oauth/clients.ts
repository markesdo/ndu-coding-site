// Welche OAuth-Clients der Connector annimmt. Alle sind öffentliche CIMD-Clients (Client ID Metadata Document):
// Die client_id ist die https-URL ihres Metadaten-Dokuments. Dieser Server lädt die Dokumente nicht; die erlaubten
// redirect_uris stehen hier fest im Code. Ändert ein Client sein Dokument, ändert sich diese Datei (mit Review).
import type { Abhaengigkeiten } from '../typen.js';

const MAX_LAENGE = 512;

export interface ErlaubterClient {
  // Für die Zustimmungsseite und das Log.
  name: string;
  // Wie man die Verbindung in diesem Client wieder trennt (Zustimmungsseite).
  trennen: string;
  // Genau so erlaubte Rücksprungadressen.
  redirectUris: string[];
  // Lokale App (RFC 8252 §7.3): http://localhost bzw. http://127.0.0.1 mit diesem Pfad und beliebigem Port – der Port
  // wechselt je Sitzung. Sonst nichts: kein https, kein anderer Host, keine Abfrage, kein Fragment.
  loopbackPfad?: string;
}

// claude.ai (Web, Desktop, Mobil) – Anthropic-Doku „Authentication for connectors“, gelesen 17.10.2026.
// Probe 17.10.2026: claude.ai meldet sich als `https://claude.ai/oauth/mcp-oauth-client-metadata`. Bewusst nicht auf
// genau diese ID verengt: redirect_uri ist ohnehin fest, und ein neuer Pfad bei Anthropic soll den Kurs nicht stoppen.
const CLAUDE_HOST = 'claude.ai';
const CLAUDE_REDIRECT = 'https://claude.ai/api/mcp/auth_callback';

// Claude Code (CLI) – eigenes CIMD, https://claude.ai/oauth/claude-code-client-metadata (gelesen 22.10.2026):
// öffentlicher Client, redirect_uris http://localhost/callback und http://127.0.0.1/callback, zur Laufzeit mit einem
// zufälligen freien Port (Doku: code.claude.com/docs/en/mcp, „Client registration“). Genau gepinnt, damit nur diese
// client_id auf einen Rücksprung an den eigenen Rechner darf.
export const CLAUDE_CODE_CLIENT = 'https://claude.ai/oauth/claude-code-client-metadata';

// Erweiterungspunkt Phase 1b: weitere festgepinnte Clients mit genauer client_id, z. B. ChatGPT
// (`https://chatgpt.com/oauth/client.json`, redirect `https://chatgpt.com/connector_platform_oauth_redirect`).
// ChatGPT authentisiert sich mit private_key_jwt; das kommt mit Phase 1b dazu (Vorbild: capitelize
// src/oauth/client-assertion.ts und pinned-clients.ts) und ist hier bewusst noch nicht gebaut.
const GEPINNTE_CLIENTS: Readonly<Record<string, ErlaubterClient>> = Object.freeze({
  [CLAUDE_CODE_CLIENT]: {
    name: 'Claude Code (auf diesem Rechner)',
    trennen: 'in Claude Code mit /mcp (Authentifizierung löschen)',
    redirectUris: [],
    loopbackPfad: '/callback',
  },
});

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1']);

/** Darf dieser Client auf diese Adresse zurückspringen? Genau, oder für lokale Apps als Loopback mit beliebigem Port.
 *  Die Adresse muss schon kanonisch kommen (keine Großbuchstaben, kein :80, kein Prozent-Kodieren im Pfad). */
export function redirectErlaubt(client: ErlaubterClient, uri: string): boolean {
  if (client.redirectUris.includes(uri)) return true;
  if (!client.loopbackPfad || uri.length > MAX_LAENGE) return false;
  let u: URL;
  try {
    u = new URL(uri);
  } catch {
    return false;
  }
  if (u.protocol !== 'http:' || !LOOPBACK_HOSTS.has(u.hostname) || u.pathname !== client.loopbackPfad) return false;
  // Kanonisch neu zusammengesetzt: Zugangsdaten, Abfrage, Fragment, Großschreibung oder :80 fallen hier heraus.
  return uri === `http://${u.hostname}${u.port ? `:${u.port}` : ''}${u.pathname}`;
}


export function clientErlaubt(clientId: string): ErlaubterClient | null {
  if (!clientId || clientId.length > MAX_LAENGE) return null;
  const gepinnt = Object.hasOwn(GEPINNTE_CLIENTS, clientId) ? GEPINNTE_CLIENTS[clientId] : undefined;
  if (gepinnt) return { ...gepinnt, redirectUris: [...gepinnt.redirectUris] };
  let u: URL;
  try {
    u = new URL(clientId);
  } catch {
    return null;
  }
  // CIMD: https, Host genau claude.ai, ohne Port und Zugangsdaten, mit Pfad.
  if (u.protocol !== 'https:' || u.hostname !== CLAUDE_HOST || u.port !== '' || u.username || u.password) return null;
  if (u.pathname === '/' || u.hash) return null;
  return { name: 'Claude (claude.ai)', trennen: 'in Claude unter den Connector-Einstellungen', redirectUris: [CLAUDE_REDIRECT] };
}

// Jede neue client_id einmal pro Tag ins Log, damit ein neuer Client (z. B. ChatGPT, Phase 1b) auffällt. Nur die öffentliche client_id.
// Nach bestem Bemühen: Fällt der Cache aus, wird lieber doppelt als gar nicht geloggt, und die Anmeldung läuft weiter.
export async function clientMelden(abh: Abhaengigkeiten, clientId: string): Promise<void> {
  const tag = new Date(abh.jetzt()).toISOString().slice(0, 10);
  const k = `werkstatt:oauth:client:${tag}:${clientId}`;
  try {
    if ((await abh.cache.get(k)) !== undefined) return;
    await abh.cache.set(k, 1, 24 * 60 * 60);
  } catch {
    // weiter: loggen
  }
  console.info(JSON.stringify({ werkstatt: 'oauth-client', tag, clientId }));
}
