// Werkstatt als Connector in claude.ai. Der Link öffnet „Add custom connector“ mit Name und URL schon ausgefüllt.
// Nicht dokumentiert von Anthropic, am 17.10.2026 im Browser geprüft; die Seite nennt die URL deshalb auch zum Kopieren.
import { ROUTEN } from './vertrag.js';

export const CONNECTOR_NAME = 'NDU Werkstatt';

export function connectorUrl(seite: string | URL): string {
  return new URL(ROUTEN.mcp.pfad, seite).toString();
}

// encodeURIComponent statt URLSearchParams: Leerzeichen als %20, nicht „+“ (so wurde der Link geprüft).
export function connectorLink(seite: string | URL): string {
  return `https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=${encodeURIComponent(CONNECTOR_NAME)}&connectorUrl=${encodeURIComponent(connectorUrl(seite))}`;
}
