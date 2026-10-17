// Tokens der GitHub App: App-JWT (RS256) → Installation der Org → Installations-Token, org-weit oder auf ein Repo
// beschränkt (spec §3.3). Tokens liegen ~50 min im Cache (GitHub lässt sie 60 min gelten). Tokens und Schlüssel werden
// nie geloggt; Fehlermeldungen nennen nur Methode, Pfad und Status.
import { createPrivateKey } from 'node:crypto';
import { SignJWT } from 'jose';
import type { Cache } from '../typen.js';

export type Rechte = Record<string, 'read' | 'write'>;
export type InstallationToken = (opts: { org: string; repoId?: number; rechte: Rechte }) => Promise<string>;

export interface GithubAppAbh {
  fetch: typeof fetch;
  cache: Cache;
  // Millisekunden wie Date.now().
  jetzt(): number;
  // Erst beim ersten Token gelesen: ohne Secrets baut und startet die App trotzdem (produktion.ts).
  schluessel(): { appId: string; privateKeyPem: string };
}

const API = 'https://api.github.com';
const TOKEN_TTL_SEK = 50 * 60;
const TAG_SEK = 24 * 60 * 60;

// Eine Anfrage an die GitHub-REST-API. Wirft nie mit Antwortinhalt oder Token in der Meldung.
export async function githubAnfrage(
  f: typeof fetch,
  token: string | null,
  methode: string,
  pfad: string,
  body?: unknown,
): Promise<{ status: number; daten: any }> {
  const antwort = await f(`${API}${pfad}`, {
    method: methode,
    headers: {
      accept: 'application/vnd.github+json',
      ...(token === null ? {} : { authorization: `Bearer ${token}` }),
      'x-github-api-version': '2022-11-28',
      'user-agent': 'ndu-werkstatt',
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await antwort.text();
  let daten: unknown = null;
  try {
    daten = text ? JSON.parse(text) : null;
  } catch {
    daten = null;
  }
  return { status: antwort.status, daten };
}

export function githubFehler(methode: string, pfad: string, status: number): Error {
  return new Error(`github ${methode} ${pfad} → ${status}`);
}

// GitHub liefert den Schlüssel als PKCS#1 („BEGIN RSA PRIVATE KEY“); jose.importPKCS8 lehnt das ab, createPrivateKey nicht.
export async function appJwt(appId: string, privateKeyPem: string, jetztSek: number): Promise<string> {
  const schluessel = createPrivateKey(privateKeyPem);
  // iat 60 s zurück gegen Uhrenabweichung; exp unter den erlaubten 10 min.
  return new SignJWT({})
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(appId)
    .setIssuedAt(jetztSek - 60)
    .setExpirationTime(jetztSek + 540)
    .sign(schluessel);
}

function jwtFuer(abh: GithubAppAbh): Promise<string> {
  const { appId, privateKeyPem } = abh.schluessel();
  return appJwt(appId, privateKeyPem, Math.floor(abh.jetzt() / 1000));
}

function rechteText(rechte: Rechte): string {
  return Object.keys(rechte)
    .sort()
    .map((k) => `${k}=${rechte[k]}`)
    .join(',');
}

export function installationTokenGeber(abh: GithubAppAbh): InstallationToken {
  return async ({ org, repoId, rechte }) => {
    const schluessel = `gh-token:${org}:${repoId ?? 'org'}:${rechteText(rechte)}`;
    const gemerkt = await abh.cache.get(schluessel);
    if (typeof gemerkt === 'string') return gemerkt;

    const jwt = await jwtFuer(abh);
    const instSchluessel = `gh-installation:${org}`;
    let installation = await abh.cache.get(instSchluessel);
    if (typeof installation !== 'number') {
      const pfad = `/orgs/${encodeURIComponent(org)}/installation`;
      const r = await githubAnfrage(abh.fetch, jwt, 'GET', pfad);
      if (r.status !== 200 || typeof r.daten?.id !== 'number') throw githubFehler('GET', pfad, r.status);
      installation = r.daten.id as number;
      await abh.cache.set(instSchluessel, installation, TAG_SEK);
    }

    const pfad = `/app/installations/${installation}/access_tokens`;
    const r = await githubAnfrage(abh.fetch, jwt, 'POST', pfad, {
      permissions: rechte,
      ...(repoId === undefined ? {} : { repository_ids: [repoId] }),
    });
    if (r.status !== 201 || typeof r.daten?.token !== 'string') throw githubFehler('POST', pfad, r.status);
    await abh.cache.set(schluessel, r.daten.token, TOKEN_TTL_SEK);
    return r.daten.token as string;
  };
}

// Committer der Commits: der Bot der App, `<slug>[bot]` mit seiner noreply-Adresse (wie GitHub sie selbst schreibt).
export function botIdentitaetGeber(abh: GithubAppAbh): () => Promise<{ name: string; email: string }> {
  return async () => {
    const schluessel = 'gh-bot';
    const gemerkt = (await abh.cache.get(schluessel)) as { name: string; email: string } | undefined;
    if (gemerkt && typeof gemerkt.name === 'string' && typeof gemerkt.email === 'string') return gemerkt;

    const jwt = await jwtFuer(abh);
    const app = await githubAnfrage(abh.fetch, jwt, 'GET', '/app');
    if (app.status !== 200 || typeof app.daten?.slug !== 'string') throw githubFehler('GET', '/app', app.status);
    const name = `${app.daten.slug}[bot]`;
    const pfad = `/users/${encodeURIComponent(name)}`;
    // Öffentlicher Endpunkt; das JWT gilt dort nicht, also ohne Anmeldung.
    const nutzer = await githubAnfrage(abh.fetch, null, 'GET', pfad);
    if (nutzer.status !== 200 || typeof nutzer.daten?.id !== 'number') throw githubFehler('GET', pfad, nutzer.status);
    const bot = { name, email: `${nutzer.daten.id}+${name}@users.noreply.github.com` };
    await abh.cache.set(schluessel, bot, TAG_SEK);
    return bot;
  };
}
