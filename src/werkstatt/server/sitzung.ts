// Sitzung der Werkstatt: signiertes Cookie nach dem GitHub-Login. Nur Web Crypto (wie lib/kurszugang.ts).
// Format: "<base64url(JSON)>.<base64url(HMAC-SHA256)>". Der Schlüssel leitet sich vom Session-Secret ab,
// mit eigenem Zusatz, damit das Secret nirgends sonst als roher HMAC-Schlüssel dient.
import type { Context, MiddlewareHandler } from 'hono';
import { deleteCookie } from 'hono/cookie';
import { b64url, cookieLesen, gleich } from '../../lib/kurszugang.js';
import { KOHORTEN } from '../kohorten/index.js';
import { mitgliedschaften, type Mitgliedschaft, type Rolle } from '../zugang.js';
import { fehler } from './antwort.js';
import type { Abhaengigkeiten } from './typen.js';

export const COOKIE_WERKSTATT = 'ndu_werkstatt';
// Außerhalb des lokalen Modus mit __Host-: nur Secure, Path=/, ohne Domain – kein Nachbar-Subdomain kann es setzen.
// Lokal (http://localhost, Safari) geht __Host- nicht, dort bleibt der einfache Name.
export function cookieName(lokal: boolean): string {
  return lokal ? COOKIE_WERKSTATT : `__Host-${COOKIE_WERKSTATT}`;
}
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
  Variables: { abh: Abhaengigkeiten; sitzung: Sitzung; mitgliedschaft: Mitgliedschaft };
}

const enc = new TextEncoder();
const dec = new TextDecoder();

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

// Sitzung der Anfrage samt der passenden aktuellen Mitgliedschaft oder null (ohne Antwort zu schreiben). Gilt nur,
// solange die Person laut aktueller Zugangsliste noch in dieser Kohorte (aktiv) und Rolle steht: entfernte Personen
// und archivierte Kohorten fallen raus.
export async function sitzungMitMitgliedschaft(c: Context, abh: Abhaengigkeiten): Promise<{ sitzung: Sitzung; mitgliedschaft: Mitgliedschaft } | null> {
  const cookie = cookieLesen(c.req.header('cookie') ?? null, cookieName(abh.umgebung.lokal));
  const s = await sitzungLesen(cookie, abh.umgebung.sessionSecret, Math.floor(abh.jetzt() / 1000));
  if (!s) return null;
  const m = mitgliedschaften(abh.umgebung.zugang, s.githubId, KOHORTEN).find((x) => x.kohorte === s.kohorte && x.rolle === s.rolle);
  return m ? { sitzung: s, mitgliedschaft: m } : null;
}

export async function sitzungDerAnfrage(c: Context, abh: Abhaengigkeiten): Promise<Sitzung | null> {
  return (await sitzungMitMitgliedschaft(c, abh))?.sitzung ?? null;
}

// Setzt c.var.sitzung (und mitgliedschaft) oder antwortet 401 nicht-angemeldet (und räumt ein ungültiges Cookie ab).
export const mitSitzung: MiddlewareHandler<SitzungEnv> = async (c, weiter) => {
  const abh = c.get('abh');
  const name = cookieName(abh.umgebung.lokal);
  const t = await sitzungMitMitgliedschaft(c, abh);
  if (!t) {
    if (cookieLesen(c.req.header('cookie') ?? null, name)) deleteCookie(c, name, { path: '/', secure: !abh.umgebung.lokal });
    return fehler(c, 401, 'nicht-angemeldet', 'Bitte melde dich mit GitHub an.');
  }
  c.set('sitzung', t.sitzung);
  c.set('mitgliedschaft', t.mitgliedschaft);
  return weiter();
};
