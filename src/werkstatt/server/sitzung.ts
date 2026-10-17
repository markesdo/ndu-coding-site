// Sitzung der Werkstatt: signiertes Cookie nach dem GitHub-Login. Nur Web Crypto (wie lib/kurszugang.ts).
// Format: "<base64url(JSON)>.<base64url(HMAC-SHA256)>". Der Schlüssel leitet sich vom Session-Secret ab,
// mit eigenem Zusatz, damit das Secret nirgends sonst als roher HMAC-Schlüssel dient.
import type { Context, MiddlewareHandler } from 'hono';
import { cookieLesen, gleich } from '../../lib/kurszugang.js';
import type { Rolle } from '../zugang.js';
import { fehler } from './antwort.js';
import type { Abhaengigkeiten } from './typen.js';

export const COOKIE_WERKSTATT = 'ndu_werkstatt';
export const GUELTIG_SEKUNDEN = 30 * 24 * 60 * 60; // 30 Tage

export interface Sitzung {
  githubId: number;
  login: string;
  kohorte: string;
  rolle: Rolle;
  // Ablauf in Sekunden seit 1970.
  exp: number;
}

export interface SitzungEnv {
  Variables: { abh: Abhaengigkeiten; sitzung: Sitzung };
}

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  let s = '';
  for (const b of bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function ausB64url(text: string): Uint8Array {
  const b = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(b, (z) => z.charCodeAt(0));
}

async function signieren(secret: string, text: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(`${secret}\0werkstatt-sitzung`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(text)));
}

export async function sitzungErstellen(s: Sitzung, secret: string): Promise<string> {
  const nutzlast = b64url(enc.encode(JSON.stringify(s)));
  return `${nutzlast}.${await signieren(secret, nutzlast)}`;
}

function istSitzung(x: unknown): x is Sitzung {
  if (typeof x !== 'object' || x === null) return false;
  const s = x as Record<string, unknown>;
  return Number.isSafeInteger(s.githubId) && typeof s.login === 'string' && typeof s.kohorte === 'string'
    && (s.rolle === 'studierende' || s.rolle === 'lehrende') && typeof s.exp === 'number';
}

export async function sitzungLesen(cookie: string | undefined, secret: string, jetztSek: number): Promise<Sitzung | null> {
  if (!cookie) return null;
  const teile = cookie.split('.');
  if (teile.length !== 2) return null;
  try {
    if (!gleich(teile[1], await signieren(secret, teile[0]))) return null;
    const daten: unknown = JSON.parse(dec.decode(ausB64url(teile[0])));
    if (!istSitzung(daten) || daten.exp <= jetztSek) return null;
    return daten;
  } catch {
    return null;
  }
}

// Sitzung der Anfrage oder null (ohne Antwort zu schreiben).
export async function sitzungDerAnfrage(c: Context, abh: Abhaengigkeiten): Promise<Sitzung | null> {
  return sitzungLesen(cookieLesen(c.req.header('cookie') ?? null, COOKIE_WERKSTATT), abh.umgebung.sessionSecret, Math.floor(abh.jetzt() / 1000));
}

// Setzt c.var.sitzung oder antwortet 401 nicht-angemeldet.
export const mitSitzung: MiddlewareHandler<SitzungEnv> = async (c, weiter) => {
  const s = await sitzungDerAnfrage(c, c.get('abh'));
  if (!s) return fehler(c, 401, 'nicht-angemeldet', 'Bitte melde dich mit GitHub an.');
  c.set('sitzung', s);
  return weiter();
};
