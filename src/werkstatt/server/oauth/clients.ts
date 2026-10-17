// Welche OAuth-Clients der Connector annimmt. Alle sind öffentliche CIMD-Clients (Client ID Metadata Document):
// Die client_id ist die https-URL ihres Metadaten-Dokuments. Dieser Server lädt die Dokumente nicht; die erlaubten
// redirect_uris stehen hier fest im Code. Ändert ein Client sein Dokument, ändert sich diese Datei (mit Review).
import type { Abhaengigkeiten } from '../typen.js';

export interface ErlaubterClient {
  redirectUris: string[];
}

// claude.ai (Web, Desktop, Mobil) – Anthropic-Doku „Authentication for connectors“, gelesen 17.10.2026.
// Die genaue client_id loggt die Probe (T15); danach kann sie hier festgepinnt werden.
const CLAUDE_HOST = 'claude.ai';
const CLAUDE_REDIRECT = 'https://claude.ai/api/mcp/auth_callback';

// Erweiterungspunkt Phase 1b: festgepinnte Clients mit genauer client_id, z. B. ChatGPT
// (`https://chatgpt.com/oauth/client.json`, redirect `https://chatgpt.com/connector_platform_oauth_redirect`).
// ChatGPT authentisiert sich mit private_key_jwt; das kommt mit Phase 1b dazu (Vorbild: capitelize
// src/oauth/client-assertion.ts und pinned-clients.ts) und ist hier bewusst noch nicht gebaut.
const GEPINNTE_CLIENTS: Readonly<Record<string, ErlaubterClient>> = Object.freeze({});

const MAX_LAENGE = 512;

export function clientErlaubt(clientId: string): ErlaubterClient | null {
  if (!clientId || clientId.length > MAX_LAENGE) return null;
  const gepinnt = Object.hasOwn(GEPINNTE_CLIENTS, clientId) ? GEPINNTE_CLIENTS[clientId] : undefined;
  if (gepinnt) return { redirectUris: [...gepinnt.redirectUris] };
  let u: URL;
  try {
    u = new URL(clientId);
  } catch {
    return null;
  }
  // CIMD: https, Host genau claude.ai, ohne Port und Zugangsdaten, mit Pfad.
  if (u.protocol !== 'https:' || u.hostname !== CLAUDE_HOST || u.port !== '' || u.username || u.password) return null;
  if (u.pathname === '/' || u.hash) return null;
  return { redirectUris: [CLAUDE_REDIRECT] };
}

// Jede neue client_id einmal pro Tag ins Log (für die Probe in T15). Nur die öffentliche client_id, nichts sonst.
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
