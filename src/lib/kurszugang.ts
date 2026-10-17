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

// Ohne Kurspasswort erreichbar:
// - die Startseite /start (exakt, mit oder ohne Schrägstrich). Kein Präfix: /startseite, /start-x oder /start/geheim
//   bleiben geschützt. /login prüft die Middleware gesondert.
// - die Werkstatt: genau /api/werkstatt und alles darunter (/api/werkstattx nicht) sowie die zwei OAuth-Metadatenpfade,
//   die Claude unter /.well-known sucht. Die Werkstatt hat ihre eigene Anmeldung (GitHub, Sitzung, Bearer-Token).
const WERKSTATT = '/api/werkstatt';
const WERKSTATT_WELL_KNOWN = [
  '/.well-known/oauth-authorization-server/api/werkstatt/oauth',
  '/.well-known/oauth-protected-resource/api/werkstatt/mcp',
];

export function istOeffentlich(pfad: string): boolean {
  if (pfad === '/start' || pfad === '/start/') return true;
  if (pfad === WERKSTATT || pfad.startsWith(`${WERKSTATT}/`)) return true;
  return WERKSTATT_WELL_KNOWN.includes(pfad);
}

// Ohne Anmeldung: Wer die Wurzel / aufruft (etwa die Domain aus einer Nachricht), sieht zuerst die Kurswahl auf /start –
// mit derselben Suche, damit ?beamer erhalten bleibt. Jede andere Kursseite führt zum Kurspasswort und danach zurück.
export function ohneAnmeldungZiel(pfad: string, suche: string): string {
  if (pfad === '/') return `/start${suche}`;
  return zumLogin(pfad + suche);
}

// Login-Seite je Kurs: Innolab-Ziele führen zu /login/innolab (Innolab-Marke, eigene Link-Vorschau), alles andere zu
// /login. Die Middleware behandelt beide gleich; das Formular schickt immer an /login.
export function istLoginSeite(pfad: string): boolean {
  const p = pfad.length > 1 && pfad.endsWith('/') ? pfad.slice(0, -1) : pfad;
  return p === '/login' || p === '/login/innolab';
}

export function zumLogin(ziel: string): string {
  const sicher = sichererPfad(ziel);
  const pfad = new URL(sicher, 'https://kurs.invalid').pathname;
  const seite = pfad === '/innolab' || pfad.startsWith('/innolab/') ? '/login/innolab' : '/login';
  return `${seite}?weiter=${encodeURIComponent(sicher)}`;
}

// Login-Formular: Rücksprung-Ziel plus Anker. Den Anker (#lokal …) sieht der Server nie – der Browser hängt ihn
// nach der Umleitung an /login an. Er kommt nur dazu, wenn das Ziel noch keinen hat und das Ganze die Prüfung in
// sichererPfad besteht; sonst bliebe statt nur des Ankers das ganze Ziel auf der Strecke (Rücksprung auf /).
// Ausnahme: „#presenter=…“ (früherer Präsentator-Link, evtl. noch als Lesezeichen) geht nie mit – sonst landete der Schlüssel im Formular und beim Server.
export function zielMitAnker(weiter: string | null, anker: string): string | null {
  if (!weiter || !anker || weiter.includes('#') || anker.startsWith('#presenter=')) return weiter;
  const mit = weiter + anker;
  return sichererPfad(mit) === '/' && sichererPfad(weiter) !== '/' ? weiter : mit;
}

export function cookieLesen(header: string | null, name = COOKIE): string | undefined {
  if (!header) return undefined;
  for (const teil of header.split(';')) {
    const i = teil.indexOf('=');
    if (i > 0 && teil.slice(0, i).trim() === name) return teil.slice(i + 1).trim();
  }
  return undefined;
}
