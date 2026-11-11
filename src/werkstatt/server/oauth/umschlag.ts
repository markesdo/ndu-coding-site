// Versiegelte Umschläge für Codes und Tokens des Connectors: AES-256-GCM, keine Datenbank.
// Port von capitelize-outlook-mcp src/oauth/token-codec.ts, mit Web Crypto und Ablauf im Umschlag.
//
// Format: `v1.<kid>.<base64url(nonce | Chiffretext | Tag)>`, je Umschlag eine frische 96-Bit-Nonce.
// Zusätzlich authentifiziert (AAD) ist `v1|<kid>|<typ>`: Ein Access-Token lässt sich nicht als Refresh-Token öffnen,
// und ein kid lässt sich nicht gegen einen anderen tauschen – beides scheitert wie jede Manipulation.
//
// Schlüssel aus MCP_TOKEN_KEYS (abh.umgebung.tokenKeys): versiegelt wird mit dem ersten, geöffnet mit jedem gelisteten.
// Einen neuen kid vorne anstellen rotiert, ohne jemanden abzumelden; einen kid streichen macht seine Tokens ungültig.
import { entsiegeln, siegeln, type SiegelArt } from '../siegel.js';
import type { Schluessel } from '../typen.js';

export type UmschlagTyp = 'code' | 'access' | 'refresh';

const VERSION = 'v1';

const enc = new TextEncoder();
const dec = new TextDecoder();

// Das Siegel selbst (AES-GCM, Nonce, Format, Schlüsselwahl) steht in ../siegel.ts, gemeinsam mit der möglichen Fassung;
// Umschläge nutzen den Schlüssel aus MCP_TOKEN_KEYS direkt (ohne zweck), wie vor der Auslagerung.
const art = (typ: UmschlagTyp): SiegelArt => ({ version: VERSION, aad: (kid) => enc.encode(`${VERSION}|${kid}|${typ}`) });

// Ablauf `exp` (Sekunden seit 1970) steht mit im Umschlag. jetztSek nur für Tests anders als die Uhr.
export async function versiegeln(
  typ: UmschlagTyp,
  inhalt: object,
  ttlSek: number,
  schluessel: Schluessel[],
  jetztSek: number = Math.floor(Date.now() / 1000),
): Promise<string> {
  return siegeln(art(typ), enc.encode(JSON.stringify({ ...inhalt, typ, exp: jetztSek + ttlSek })), schluessel);
}

// Inhalt (mit `exp`, ohne `typ`) oder null für alles, was kein unversehrter, gültiger Umschlag dieses Typs unter einem
// gelisteten Schlüssel ist. Wirft nie und verrät nicht, welche Prüfung scheiterte.
export async function oeffnen(
  typ: UmschlagTyp,
  token: string,
  schluessel: Schluessel[],
  jetztSek: number,
): Promise<(Record<string, unknown> & { exp: number }) | null> {
  const klar = await entsiegeln(art(typ), token, schluessel);
  if (!klar) return null;
  try {
    const daten: unknown = JSON.parse(dec.decode(klar));
    if (typeof daten !== 'object' || daten === null || Array.isArray(daten)) return null;
    const { typ: t, ...inhalt } = daten as Record<string, unknown>;
    if (t !== typ || typeof inhalt.exp !== 'number' || inhalt.exp <= jetztSek) return null;
    return inhalt as Record<string, unknown> & { exp: number };
  } catch {
    return null;
  }
}
