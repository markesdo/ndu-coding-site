// Discovery des Connectors: Issuer-Metadaten (RFC 8414) und Protected Resource Metadata (RFC 9728).
// Alle URLs aus origin(c): WERKSTATT_ORIGIN in Prod, sonst die Origin der Anfrage (Preview, lokal).
import type { Context } from 'hono';
import { origin } from '../antwort.js';

export const ISSUER_PFAD = '/api/werkstatt/oauth';
export const RESOURCE_PFAD = '/api/werkstatt/mcp';
export const RESOURCE_METADATEN_PFAD = '/api/werkstatt/mcp/resource';

// Nur die Rechte, die der Connector braucht; offline_access lässt Claude ein Refresh-Token anfordern.
export const SCOPE = 'mappe';

export const issuer = (c: Context) => `${origin(c)}${ISSUER_PFAD}`;
export const resource = (c: Context) => `${origin(c)}${RESOURCE_PFAD}`;

// Für den 401 des MCP-Endpunkts (T12): Claude folgt diesem Verweis (zuverlässigster Weg auf Serverless).
export function wwwAuthenticate(c: Context): string {
  return `Bearer resource_metadata="${origin(c)}${RESOURCE_METADATEN_PFAD}"`;
}

export function issuerMetadaten(c: Context) {
  const iss = issuer(c);
  return {
    issuer: iss,
    authorization_endpoint: `${iss}/authorize`,
    token_endpoint: `${iss}/token`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    // Claude nimmt CIMD nur, wenn beides da ist: CIMD-Unterstützung und „none“ (öffentlicher Client).
    token_endpoint_auth_methods_supported: ['none'],
    client_id_metadata_document_supported: true,
    authorization_response_iss_parameter_supported: true,
    scopes_supported: [SCOPE, 'offline_access'],
  };
}

export function resourceMetadaten(c: Context) {
  return {
    resource: resource(c),
    // Claude nimmt nur den ersten Eintrag.
    authorization_servers: [issuer(c)],
    scopes_supported: [SCOPE],
  };
}
