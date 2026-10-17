import { describe, expect, it } from 'vitest';
import { CONNECTOR_NAME, connectorLink, connectorUrl } from './connector.js';

const SEITE = 'https://ndu.datamonkeys.ai';

describe('Connector-Link für claude.ai', () => {
  it('URL des MCP-Servers kommt aus der Route', () => {
    expect(connectorUrl(SEITE)).toBe('https://ndu.datamonkeys.ai/api/werkstatt/mcp');
    expect(connectorUrl(new URL(`${SEITE}/`))).toBe('https://ndu.datamonkeys.ai/api/werkstatt/mcp');
  });

  it('Link öffnet den ausgefüllten Dialog (am 17.10. in claude.ai geprüft)', () => {
    expect(CONNECTOR_NAME).toBe('NDU Werkstatt');
    expect(connectorLink(SEITE)).toBe(
      'https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=NDU%20Werkstatt&connectorUrl=https%3A%2F%2Fndu.datamonkeys.ai%2Fapi%2Fwerkstatt%2Fmcp',
    );
  });
});
