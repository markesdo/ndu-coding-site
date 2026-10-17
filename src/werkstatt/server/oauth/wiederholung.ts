// Antwort der ersten Rotation eines Refresh-Tokens, für Neuversuche kurz im Cache. Verschlüsselt mit einem Schlüssel
// aus dem alten Refresh-Token selbst (HKDF): Wer den Cache liest, aber das Token nicht hat, kann nichts damit anfangen.
// Der Cache-Schlüssel ist ein SHA-256 des Tokens; aus ihm folgt der HKDF-Schlüssel nicht.
import { b64url } from '../../../lib/kurszugang.js';

const INFO = new TextEncoder().encode('werkstatt:oauth:refresh-antwort');

function vonB64url(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, (z) => z.charCodeAt(0));
}

async function schluessel(refresh: string): Promise<CryptoKey> {
  const roh = await crypto.subtle.importKey('raw', new TextEncoder().encode(refresh), 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: INFO }, roh, { name: 'AES-GCM', length: 256 }, false, [
    'encrypt',
    'decrypt',
  ]);
}

export async function antwortVersiegeln(refresh: string, inhalt: unknown): Promise<{ iv: string; daten: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const daten = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await schluessel(refresh), new TextEncoder().encode(JSON.stringify(inhalt)));
  return { iv: b64url(iv), daten: b64url(daten) };
}

/** null, wenn nichts da ist oder es nicht zu diesem Token gehört. */
export async function antwortOeffnen(refresh: string, v: unknown): Promise<unknown> {
  if (typeof v !== 'object' || v === null) return null;
  const { iv, daten } = v as { iv?: unknown; daten?: unknown };
  if (typeof iv !== 'string' || typeof daten !== 'string') return null;
  try {
    const klar = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: vonB64url(iv) }, await schluessel(refresh), vonB64url(daten));
    return JSON.parse(new TextDecoder().decode(klar)) as unknown;
  } catch {
    return null;
  }
}
