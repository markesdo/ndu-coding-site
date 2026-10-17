// Tokens der GitHub App: App-JWT (RS256) → Installation der Org → Installations-Token, org-weit oder auf ein Repo
// beschränkt (spec §3.3). Tokens liegen ~50 min im Cache (GitHub lässt sie 60 min gelten). Tokens und Schlüssel werden
// nie geloggt; Fehlermeldungen nennen nur Methode, Pfad und Status.
import { createPrivateKey } from 'node:crypto';
import { SignJWT } from 'jose';
import { ApiAusnahme } from '../antwort.js';
import type { Cache } from '../typen.js';

export type Rechte = Record<string, 'read' | 'write'>;

// Org-weit: /generate (GitHub verlangt Administration write und zusätzlich Contents read), Repo-Namen auflösen,
// Bot-Nutzer abfragen. Alles im Repo nur mit einem Token für genau dieses Repo (speicher.ts).
export const ORG_RECHTE = { administration: 'write', contents: 'read' } as const;
export type InstallationToken = (opts: { org: string; repoId?: number; rechte: Rechte }) => Promise<string>;

export interface GithubAppAbh {
  fetch: typeof fetch;
  cache: Cache;
  // Millisekunden wie Date.now().
  jetzt(): number;
  // Erst beim ersten Token gelesen: ohne Secrets baut und startet die App trotzdem (produktion.ts).
  schluessel(): { appId: string; privateKeyPem: string };
  // Zeitlimit je GitHub-Anfrage; Standard 8 s.
  zeitlimitMs?: number;
}

const API = 'https://api.github.com';
const TOKEN_TTL_SEK = 50 * 60;
const TAG_SEK = 24 * 60 * 60;
export const ZEITLIMIT_MS = 8000;

// Eine Anfrage an die GitHub-REST-API. Wirft nie mit Antwortinhalt oder Token in der Meldung.
// Zeitlimit oder Netzfehler → githubFehler mit Status 0.
export async function githubAnfrage(
  f: typeof fetch,
  token: string | null,
  methode: string,
  pfad: string,
  body?: unknown,
  zeitlimitMs: number = ZEITLIMIT_MS,
): Promise<{ status: number; daten: any }> {
  let status: number;
  let text: string;
  try {
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
      signal: AbortSignal.timeout(zeitlimitMs),
    });
    status = antwort.status;
    text = await antwort.text();
  } catch (e) {
    const art = e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError') ? 'Zeitlimit' : 'Netzfehler';
    console.error(`werkstatt: github ${methode} ${pfad} – ${art}`);
    throw githubFehler(methode, pfad, 0);
  }
  let daten: unknown = null;
  try {
    daten = text ? JSON.parse(text) : null;
  } catch {
    daten = null;
  }
  return { status, daten };
}

const GITHUB_SATZ = 'GitHub ist gerade nicht erreichbar. Bitte gleich noch einmal versuchen.';

// 502 an die Person; der GitHub-Status bleibt für Aufrufer lesbar (z. B. veraltete gemerkte IDs bei 404/422).
export class GithubAusnahme extends ApiAusnahme {
  constructor(readonly githubStatus: number) {
    super(502, 'github-fehler', GITHUB_SATZ);
  }
}

// Unerwartete Antwort von GitHub → 502. Ins Log nur Methode, Pfad und Status (nie Token oder Antwortinhalt).
export function githubFehler(methode: string, pfad: string, status: number): GithubAusnahme {
  console.error(`werkstatt: github ${methode} ${pfad} → ${status}`);
  return new GithubAusnahme(status);
}

// Datei im Repo ist kein gültiges JSON (z. B. von Hand auf GitHub kaputt bearbeitet) → ebenfalls 502.
export function jsonAusRepo(pfad: string, inhalt: string): unknown {
  try {
    return JSON.parse(inhalt) as unknown;
  } catch {
    console.error(`werkstatt: kaputtes JSON in ${pfad}`);
    throw new ApiAusnahme(502, 'github-fehler', GITHUB_SATZ);
  }
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
  const anfrage = (token: string, methode: string, pfad: string, body?: unknown) =>
    githubAnfrage(abh.fetch, token, methode, pfad, body, abh.zeitlimitMs);
  return async ({ org, repoId, rechte }) => {
    const schluessel = `gh-token:${org}:${repoId ?? 'org'}:${rechteText(rechte)}`;
    const gemerkt = await abh.cache.get(schluessel);
    if (typeof gemerkt === 'string') return gemerkt;

    const jwt = await jwtFuer(abh);
    const instSchluessel = `gh-installation:${org}`;
    const gemerkteInstallation = await abh.cache.get(instSchluessel);
    let installation = typeof gemerkteInstallation === 'number' ? gemerkteInstallation : null;
    let ausCache = installation !== null;
    for (;;) {
      if (installation === null) {
        const pfad = `/orgs/${encodeURIComponent(org)}/installation`;
        const r = await anfrage(jwt, 'GET', pfad);
        if (r.status !== 200 || typeof r.daten?.id !== 'number') throw githubFehler('GET', pfad, r.status);
        installation = r.daten.id as number;
        await abh.cache.set(instSchluessel, installation, TAG_SEK);
      }
      const pfad = `/app/installations/${installation}/access_tokens`;
      const r = await anfrage(jwt, 'POST', pfad, {
        permissions: rechte,
        ...(repoId === undefined ? {} : { repository_ids: [repoId] }),
      });
      if (r.status === 201 && typeof r.daten?.token === 'string') {
        await abh.cache.set(schluessel, r.daten.token, TOKEN_TTL_SEK);
        return r.daten.token as string;
      }
      // Gemerkte Installation weg (App neu installiert): einmal neu abfragen. Cache kennt kein Löschen → überschreiben.
      if (ausCache && r.status === 404) {
        await abh.cache.set(instSchluessel, null, 1);
        installation = null;
        ausCache = false;
        continue;
      }
      throw githubFehler('POST', pfad, r.status);
    }
  };
}

// Committer der Commits: der Bot der App, `<slug>[bot]` mit seiner noreply-Adresse (wie GitHub sie selbst schreibt).
// /app mit dem App-JWT; /users mit dem Org-Installations-Token (authentifiziert, nicht im anonymen Rate-Limit).
export function botIdentitaetGeber(abh: GithubAppAbh, token: InstallationToken): (org: string) => Promise<{ name: string; email: string }> {
  return async (org) => {
    const schluessel = 'gh-bot';
    const gemerkt = (await abh.cache.get(schluessel)) as { name: string; email: string } | undefined | null;
    if (gemerkt && typeof gemerkt.name === 'string' && typeof gemerkt.email === 'string') return gemerkt;

    const app = await githubAnfrage(abh.fetch, await jwtFuer(abh), 'GET', '/app', undefined, abh.zeitlimitMs);
    if (app.status !== 200 || typeof app.daten?.slug !== 'string') throw githubFehler('GET', '/app', app.status);
    const name = `${app.daten.slug}[bot]`;
    const pfad = `/users/${encodeURIComponent(name)}`;
    const nutzer = await githubAnfrage(abh.fetch, await token({ org, rechte: ORG_RECHTE }), 'GET', pfad, undefined, abh.zeitlimitMs);
    if (nutzer.status !== 200 || typeof nutzer.daten?.id !== 'number') throw githubFehler('GET', pfad, nutzer.status);
    const bot = { name, email: `${nutzer.daten.id}+${name}@users.noreply.github.com` };
    await abh.cache.set(schluessel, bot, TAG_SEK);
    return bot;
  };
}
