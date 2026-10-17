// Platzhalter – T12 ersetzt diese Datei (MCP-Endpunkt).
// Gemountet unter /api/werkstatt/mcp: '/' = der Endpunkt selbst. /api/werkstatt/mcp/resource gehört oauthRouten
// (dort vor diesem Router registriert) und kommt hier nie an.
import { Hono } from 'hono';
import { nochNichtGebaut } from '../stub.js';
import type { Abhaengigkeiten, WerkstattEnv } from '../typen.js';

export function mcpRouten(_abh: Abhaengigkeiten): Hono<WerkstattEnv> {
  const r = new Hono<WerkstattEnv>();
  r.all('/*', nochNichtGebaut('mcp'));
  return r;
}
