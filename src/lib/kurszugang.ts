// Kurspasswort für die Website: Token signieren und prüfen, Rücksprung-Pfad absichern.
// Nur Web Crypto (crypto.subtle) – läuft in der Vercel Routing Middleware (Edge) und in Vitest.

export const COOKIE = 'ndu_zugang';
export const GUELTIG_SEKUNDEN = 60 * 24 * 60 * 60; // 60 Tage

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer): string {
  let s = '';
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Schlüssel aus Geheimnis UND Passwort: Wird das Kurspasswort geändert, verlieren alte Cookies ihre Gültigkeit.
async function schluessel(secret: string, passwort: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', enc.encode(`${secret}\0${passwort}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}

async function hmac(key: CryptoKey, text: string): Promise<string> {
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(text)));
}

// Vergleich in konstanter Zeit (bei gleicher Länge); unterschiedliche Längen sind sofort ungleich.
export function gleich(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Passwortvergleich ohne Zeitverrat über die Länge: beide Seiten erst per HMAC auf gleiche Länge bringen.
export async function passwortStimmt(eingabe: string, passwort: string, secret: string): Promise<boolean> {
  const key = await schluessel(secret, 'vergleich');
  return gleich(await hmac(key, eingabe), await hmac(key, passwort));
}

// Token: "v1.<ablauf in Sekunden>.<signatur>" – enthält nie das Passwort.
export async function tokenErstellen(secret: string, passwort: string, jetztSek: number): Promise<string> {
  const nutzlast = `v1.${jetztSek + GUELTIG_SEKUNDEN}`;
  return `${nutzlast}.${await hmac(await schluessel(secret, passwort), nutzlast)}`;
}

export async function tokenGueltig(token: string | undefined, secret: string, passwort: string, jetztSek: number): Promise<boolean> {
  if (!token) return false;
  const teile = token.split('.');
  if (teile.length !== 3 || teile[0] !== 'v1' || !/^\d+$/.test(teile[1])) return false;
  const erwartet = await hmac(await schluessel(secret, passwort), `${teile[0]}.${teile[1]}`);
  if (!gleich(teile[2], erwartet)) return false;
  return Number(teile[1]) > jetztSek;
}

// Nur Pfade auf dieser Website als Rücksprung: muss mit genau einem "/" beginnen, kein "//", kein "\", keine Steuerzeichen.
// Alles andere (externe Adressen, "//evil.com", "/\evil.com", "javascript:") wird zur Startseite.
// Kodierte Varianten ("/%2F%2Fevil.com", "/%5Cevil.com") werden einmal dekodiert und genauso geprüft.
function unsicher(p: string): boolean {
  return !p.startsWith('/') || p.startsWith('//') || p.includes('\\') || /[\s\u0000-\u001f\u007f]/.test(p);
}

export function sichererPfad(roh: string | null | undefined): string {
  if (!roh || roh.length > 512 || unsicher(roh)) return '/';
  let dekodiert: string;
  try { dekodiert = decodeURIComponent(roh); } catch { return '/'; }
  if (unsicher(dekodiert)) return '/';
  try {
    const u = new URL(roh, 'https://kurs.invalid');
    if (u.origin !== 'https://kurs.invalid') return '/';
    if (u.pathname === '/login' || u.pathname.startsWith('/login/')) return '/';
    return u.pathname + u.search + u.hash;
  } catch {
    return '/';
  }
}

export function cookieLesen(header: string | null, name = COOKIE): string | undefined {
  if (!header) return undefined;
  for (const teil of header.split(';')) {
    const i = teil.indexOf('=');
    if (i > 0 && teil.slice(0, i).trim() === name) return teil.slice(i + 1).trim();
  }
  return undefined;
}
