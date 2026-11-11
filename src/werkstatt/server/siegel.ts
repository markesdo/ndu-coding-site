// Gemeinsames Siegel (AES-256-GCM, Web Crypto) für die Umschläge des Connectors (oauth/umschlag.ts) und die mögliche
// Fassung der Lehrenden (fassung.ts). Format `<version>.<kid>.<base64url(nonce | Chiffretext | Tag)>`, je Siegel eine
// frische 96-Bit-Nonce. Versiegelt wird mit dem ersten Schlüssel aus MCP_TOKEN_KEYS, geöffnet mit jedem gelisteten.
// Was zusätzlich authentifiziert wird (AAD) und wie der Klartext aussieht, bestimmen die Aufrufer.
// zweck: ohne = der Schlüssel aus MCP_TOKEN_KEYS direkt (Umschläge, wie bisher); mit = per HKDF-SHA-256 daraus
// abgeleitet (info = zweck), damit ein anderer Zweck nie denselben AES-Schlüssel nutzt.
import { ausB64url, b64url } from '../../lib/kurszugang.js';
import type { Schluessel } from './typen.js';

const NONCE_BYTES = 12;
const TAG_BYTES = 16;
// Kein Punkt im kid, sonst ließe sich das Format nicht mehr eindeutig zerlegen.
const KID = /^[A-Za-z0-9_-]{1,32}$/;

const enc = new TextEncoder();

// Importierte Schlüssel je Schlüssel-Objekt der Umgebung und Zweck (ein Import pro kid, Zweck und Prozess). WeakMap über
// die Bytes statt über den kid-Namen: Zwei Umgebungen mit gleichem kid, aber anderem Schlüssel verwechseln sich so nie.
const importiert = new WeakMap<Uint8Array, Map<string, Promise<CryptoKey>>>();

function aesSchluessel(key: Uint8Array, zweck: string | undefined): Promise<CryptoKey> {
  let jeZweck = importiert.get(key);
  if (!jeZweck) {
    jeZweck = new Map();
    importiert.set(key, jeZweck);
  }
  const name = zweck ?? '';
  let k = jeZweck.get(name);
  if (!k) {
    // Kopie: Web Crypto verlangt einen Puffer auf einem echten ArrayBuffer (Typen ab TS 5.7).
    k = zweck === undefined
      ? crypto.subtle.importKey('raw', new Uint8Array(key), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
      : crypto.subtle
        .importKey('raw', new Uint8Array(key), 'HKDF', false, ['deriveKey'])
        .then((basis) => crypto.subtle.deriveKey(
          { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: enc.encode(zweck) },
          basis,
          { name: 'AES-GCM', length: 256 },
          false,
          ['encrypt', 'decrypt'],
        ));
    jeZweck.set(name, k);
    // Ein fehlgeschlagener Import (falsche Länge) bleibt nicht hängen.
    const map = jeZweck;
    k.catch(() => map.delete(name));
  }
  return k;
}

export interface SiegelArt {
  version: string;
  zweck?: string;
  aad: (kid: string) => Uint8Array<ArrayBuffer>;
}

/** Versiegelt klar mit dem ersten Schlüssel. Wirft ohne Schlüssel oder bei ungeeignetem kid. */
export async function siegeln(art: SiegelArt, klar: Uint8Array<ArrayBuffer>, schluessel: Schluessel[]): Promise<string> {
  const erster = schluessel[0];
  if (!erster) throw new Error('versiegeln ohne Schlüssel');
  if (!KID.test(erster.kid)) throw new Error('MCP_TOKEN_KEYS: kid ungeeignet');
  const nonce = crypto.getRandomValues(new Uint8Array(NONCE_BYTES));
  const geheim = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce, additionalData: art.aad(erster.kid), tagLength: TAG_BYTES * 8 },
    await aesSchluessel(erster.key, art.zweck),
    klar,
  );
  const roh = new Uint8Array(NONCE_BYTES + geheim.byteLength);
  roh.set(nonce);
  roh.set(new Uint8Array(geheim), NONCE_BYTES);
  return `${art.version}.${erster.kid}.${b64url(roh)}`;
}

/** Klartext oder null für alles, was kein unversehrtes Siegel dieser Art unter einem gelisteten Schlüssel ist. Wirft nie
 *  und verrät nicht, welche Prüfung scheiterte. */
export async function entsiegeln(art: SiegelArt, siegel: string, schluessel: Schluessel[]): Promise<Uint8Array | null> {
  const teile = siegel.split('.');
  if (teile.length !== 3 || teile[0] !== art.version) return null;
  const [, kid, rumpf] = teile;
  const s = schluessel.find((k) => k.kid === kid);
  if (!s || !/^[A-Za-z0-9_-]+$/.test(rumpf)) return null;
  try {
    const roh = ausB64url(rumpf);
    if (roh.length < NONCE_BYTES + TAG_BYTES + 1) return null;
    return new Uint8Array(await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: roh.subarray(0, NONCE_BYTES), additionalData: art.aad(kid), tagLength: TAG_BYTES * 8 },
      await aesSchluessel(s.key, art.zweck),
      roh.subarray(NONCE_BYTES),
    ));
  } catch {
    return null;
  }
}
