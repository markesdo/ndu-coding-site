// Versiegelte Umschläge für Codes und Tokens des Connectors: AES-256-GCM, keine Datenbank.
// Port von capitelize-outlook-mcp src/oauth/token-codec.ts, mit Web Crypto und Ablauf im Umschlag.
//
// Format: `v1.<kid>.<base64url(nonce | Chiffretext | Tag)>`, je Umschlag eine frische 96-Bit-Nonce.
// Zusätzlich authentifiziert (AAD) ist `v1|<kid>|<typ>`: Ein Access-Token lässt sich nicht als Refresh-Token öffnen,
// und ein kid lässt sich nicht gegen einen anderen tauschen – beides scheitert wie jede Manipulation.
//
// Schlüssel aus MCP_TOKEN_KEYS (abh.umgebung.tokenKeys): versiegelt wird mit dem ersten, geöffnet mit jedem gelisteten.
// Einen neuen kid vorne anstellen rotiert, ohne jemanden abzumelden; einen kid streichen macht seine Tokens ungültig.
import { b64url } from '../../../lib/kurszugang.js';
import type { Schluessel } from '../typen.js';

export type UmschlagTyp = 'code' | 'access' | 'refresh';

const VERSION = 'v1';
const NONCE_BYTES = 12;
const TAG_BYTES = 16;
// Kein Punkt im kid, sonst ließe sich das Format nicht mehr eindeutig zerlegen.
const KID = /^[A-Za-z0-9_-]{1,32}$/;

const enc = new TextEncoder();
const dec = new TextDecoder();

const aad = (kid: string, typ: UmschlagTyp) => enc.encode(`${VERSION}|${kid}|${typ}`);

function aesSchluessel(key: Uint8Array, zweck: 'encrypt' | 'decrypt'): Promise<CryptoKey> {
  // Kopie: Web Crypto verlangt einen Puffer auf einem echten ArrayBuffer (Typen ab TS 5.7).
  return crypto.subtle.importKey('raw', new Uint8Array(key), { name: 'AES-GCM' }, false, [zweck]);
}

// Ablauf `exp` (Sekunden seit 1970) steht mit im Umschlag. jetztSek nur für Tests anders als die Uhr.
export async function versiegeln(
  typ: UmschlagTyp,
  inhalt: object,
  ttlSek: number,
  schluessel: Schluessel[],
  jetztSek: number = Math.floor(Date.now() / 1000),
): Promise<string> {
  const erster = schluessel[0];
  if (!erster) throw new Error('versiegeln ohne Schlüssel');
  if (!KID.test(erster.kid)) throw new Error('MCP_TOKEN_KEYS: kid ungeeignet');
  const nonce = crypto.getRandomValues(new Uint8Array(NONCE_BYTES));
  const klar = enc.encode(JSON.stringify({ ...inhalt, typ, exp: jetztSek + ttlSek }));
  const geheim = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce, additionalData: aad(erster.kid, typ), tagLength: TAG_BYTES * 8 },
    await aesSchluessel(erster.key, 'encrypt'),
    klar,
  );
  const roh = new Uint8Array(NONCE_BYTES + geheim.byteLength);
  roh.set(nonce);
  roh.set(new Uint8Array(geheim), NONCE_BYTES);
  return `${VERSION}.${erster.kid}.${b64url(roh)}`;
}

// Inhalt (mit `exp`, ohne `typ`) oder null für alles, was kein unversehrter, gültiger Umschlag dieses Typs unter einem
// gelisteten Schlüssel ist. Wirft nie und verrät nicht, welche Prüfung scheiterte.
export async function oeffnen(
  typ: UmschlagTyp,
  token: string,
  schluessel: Schluessel[],
  jetztSek: number,
): Promise<(Record<string, unknown> & { exp: number }) | null> {
  const teile = token.split('.');
  if (teile.length !== 3 || teile[0] !== VERSION) return null;
  const [, kid, rumpf] = teile;
  const s = schluessel.find((k) => k.kid === kid);
  if (!s || !/^[A-Za-z0-9_-]+$/.test(rumpf)) return null;
  const roh = Buffer.from(rumpf, 'base64url');
  if (roh.length < NONCE_BYTES + TAG_BYTES + 1) return null;
  try {
    const klar = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: roh.subarray(0, NONCE_BYTES), additionalData: aad(kid, typ), tagLength: TAG_BYTES * 8 },
      await aesSchluessel(s.key, 'decrypt'),
      roh.subarray(NONCE_BYTES),
    );
    const daten: unknown = JSON.parse(dec.decode(klar));
    if (typeof daten !== 'object' || daten === null || Array.isArray(daten)) return null;
    const { typ: t, ...inhalt } = daten as Record<string, unknown>;
    if (t !== typ || typeof inhalt.exp !== 'number' || inhalt.exp <= jetztSek) return null;
    return inhalt as Record<string, unknown> & { exp: number };
  } catch {
    return null;
  }
}
