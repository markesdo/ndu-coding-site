// Umgebung der Werkstatt aus process.env. Fehlermeldungen nennen nur Variablennamen, nie Werte.
import { zugangLesen } from '../zugang.js';
import type { Schluessel, Umgebung } from './typen.js';

// Lokale Abkürzungen (Fakes, Test-Login) nur hier; alles andere, auch ein fehlender Wert, ist nicht lokal.
export function istLokal(env: NodeJS.ProcessEnv): boolean {
  return env.NODE_ENV === 'development' || env.NODE_ENV === 'test';
}

function pflicht(env: NodeJS.ProcessEnv, name: string): string {
  const wert = env[name];
  if (!wert || !wert.trim()) throw new Error(`${name} fehlt`);
  return wert;
}

// `<kid>:<base64 32 B>`, kommagetrennt, erster = aktuell.
function schluesselLesen(roh: string): Schluessel[] {
  const FEHLER = 'MCP_TOKEN_KEYS ungültig';
  const liste: Schluessel[] = [];
  for (const teil of roh.split(',')) {
    const i = teil.indexOf(':');
    const kid = teil.slice(0, i).trim();
    const b64 = teil.slice(i + 1).trim();
    if (i < 1 || !kid || !/^[A-Za-z0-9+/]+={0,2}$/.test(b64)) throw new Error(FEHLER);
    const key = new Uint8Array(Buffer.from(b64, 'base64'));
    if (key.length !== 32 || liste.some((s) => s.kid === kid)) throw new Error(FEHLER);
    liste.push({ kid, key });
  }
  return liste;
}

function originLesen(roh: string | undefined): string | null {
  if (!roh) return null;
  try {
    const u = new URL(roh);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error();
    return u.origin;
  } catch {
    throw new Error('WERKSTATT_ORIGIN ungültig');
  }
}

export function umgebungLesen(env: NodeJS.ProcessEnv): Umgebung {
  const sessionSecret = pflicht(env, 'WERKSTATT_SESSION_SECRET');
  if (sessionSecret.length < 32) throw new Error('WERKSTATT_SESSION_SECRET zu kurz (mindestens 32 Zeichen)');
  let zugang;
  try {
    zugang = zugangLesen(pflicht(env, 'WERKSTATT_ZUGANG'));
  } catch (e) {
    throw new Error((e as Error).message.startsWith('WERKSTATT_ZUGANG') ? (e as Error).message : 'WERKSTATT_ZUGANG ungültig');
  }
  return {
    githubAppId: pflicht(env, 'GITHUB_APP_ID'),
    // Vercel speichert mehrzeilige Werte oft mit wörtlichem \n.
    githubPrivateKey: pflicht(env, 'GITHUB_APP_PRIVATE_KEY').replace(/\\n/g, '\n'),
    githubClientId: pflicht(env, 'GITHUB_APP_CLIENT_ID'),
    githubClientSecret: pflicht(env, 'GITHUB_APP_CLIENT_SECRET'),
    sessionSecret,
    tokenKeys: schluesselLesen(pflicht(env, 'MCP_TOKEN_KEYS')),
    zugang,
    origin: originLesen(env.WERKSTATT_ORIGIN),
    lokal: istLokal(env),
  };
}
