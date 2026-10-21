// MCP-Endpunkt des Claude-Connectors: Streamable HTTP, stateless (ein neuer McpServer und Transport pro Anfrage,
// Antworten als JSON statt SSE). Gemountet unter /api/werkstatt/mcp: '/' = der Endpunkt selbst.
// /api/werkstatt/mcp/resource gehört oauthRouten (dort vor diesem Router registriert) und kommt hier nie an.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { Hono, type Context } from 'hono';
import { fehler, origin } from '../antwort.js';
import { SCOPE, issuer, wwwAuthenticate } from '../oauth/metadaten.js';
import { bearerPruefen } from '../oauth/routen.js';
import type { Abhaengigkeiten, WerkstattEnv } from '../typen.js';
import { anweisung } from './anweisung.js';
import { werkzeugeRegistrieren } from './werkzeuge.js';

// 401 nach RFC 6750 §3 / MCP-Autorisierung: Claude folgt resource_metadata zur Discovery.
// error="invalid_token" nur, wenn ein Bearer-Credential mitkam (RFC 6750 §3.1); sonst ohne Fehlercode.
function ohneZugang(c: Context<WerkstattEnv>, tokenDabei: boolean): Response {
  const teile = [wwwAuthenticate(c), `scope="${SCOPE}"`];
  if (tokenDabei) teile.push('error="invalid_token"');
  c.header('WWW-Authenticate', teile.join(', '));
  return fehler(c, 401, 'nicht-angemeldet', 'Bitte verbinde die Werkstatt in Claude neu.');
}

// Stateless: kein SSE-Strom (GET) und keine Sitzung zum Beenden (DELETE).
function nurPost(): Response {
  return new Response(JSON.stringify({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed.' }, id: null }), {
    status: 405,
    headers: { Allow: 'POST', 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

// '/' = /api/werkstatt/mcp; das leere Segment fängt /api/werkstatt/mcp/ (mit Schrägstrich) und sonst nichts,
// /mcp/resource und andere Unterpfade bleiben bei oauthRouten bzw. beim 404.
const PFADE = ['/', '/:leer{^$}'];

// Größte Anfrage, die das SDK liest (sonst 413). Werkzeugaufrufe der Werkstatt sind wenige KiB; der SDK-Standard
// (4 MiB) ließe Token-Inhaber große Körper in die Funktion schieben (vgl. GHSA-46jr-4wx8-v453).
export const MAX_ANFRAGE_BYTES = 64 * 1024;

export function mcpRouten(abh: Abhaengigkeiten): Hono<WerkstattEnv> {
  const r = new Hono<WerkstattEnv>();

  r.on('ALL', PFADE, async (c) => {
    // Innerhalb der Hono-Anfrage, damit ein Cache-Ausfall (503 als ApiAusnahme) bei onError ankommt.
    const kopf = c.req.header('authorization');
    const claims = await bearerPruefen(abh, kopf, issuer(c));
    if (!claims) return ohneZugang(c, /^Bearer\s/i.test(kopf ?? ''));
    if (c.req.method !== 'POST') return nurPost();

    const basis = origin(c);
    const server = new McpServer({ name: 'ndu-werkstatt', version: '1.0.0' }, { instructions: anweisung(`${basis}/innolab/mappe`) });
    werkzeugeRegistrieren(server, { abh, claims, origin: basis });
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true, maxRequestBodySize: MAX_ANFRAGE_BYTES });
    try {
      await server.connect(transport);
      const antwort = await transport.handleRequest(c.req.raw);
      antwort.headers.set('Cache-Control', 'no-store');
      return antwort;
    } finally {
      await server.close();
    }
  });

  return r;
}
