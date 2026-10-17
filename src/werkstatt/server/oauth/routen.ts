// Platzhalter – T7 ersetzt diese Datei (OAuth-Autorisierungsserver für den Connector).
// Anders als die übrigen Router wird dieser an der Wurzel gemountet und trägt VOLLE Pfade, weil er auch außerhalb von
// /api/werkstatt/oauth antwortet. appErstellen registriert ihn vor mcpRouten. Ihm gehören genau:
//   /api/werkstatt/oauth/*                                         (metadata, authorize, token, …)
//   /api/werkstatt/mcp/resource                                    (RFC 9728)
//   /.well-known/oauth-authorization-server/api/werkstatt/oauth    (RFC 8414, gleiches JSON wie oauth/metadata)
//   /.well-known/oauth-protected-resource/api/werkstatt/mcp        (RFC 9728, gleiches JSON wie mcp/resource)
//   /.well-known/oauth-authorization-server                        (ohne Suffix, dieselben Handler wie die Pfad-Variante)
//   /.well-known/oauth-protected-resource                          (ohne Suffix, dieselben Handler wie die Pfad-Variante)
// Nur diese Pfade registrieren, kein Sammelpfad wie '/*': der finge auch Anfragen der anderen Router ab.
// Ebenso kein use() ohne Pfad: diese Middleware liefe sonst bei jeder Werkstatt-Anfrage mit.
// CSRF (nur Origin, Formular erlaubt) für POST /api/werkstatt/oauth/authorize prüft schon appErstellen.
import { Hono } from 'hono';
import { nochNichtGebaut } from '../stub.js';
import type { Abhaengigkeiten, WerkstattEnv } from '../typen.js';

export function oauthRouten(_abh: Abhaengigkeiten): Hono<WerkstattEnv> {
  const r = new Hono<WerkstattEnv>();
  const stub = nochNichtGebaut('oauth');
  r.all('/api/werkstatt/oauth/*', stub);
  r.all('/api/werkstatt/mcp/resource', stub);
  r.all('/.well-known/oauth-authorization-server/api/werkstatt/oauth', stub);
  r.all('/.well-known/oauth-protected-resource/api/werkstatt/mcp', stub);
  r.all('/.well-known/oauth-authorization-server', stub);
  r.all('/.well-known/oauth-protected-resource', stub);
  return r;
}
