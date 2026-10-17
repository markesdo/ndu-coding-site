// Attrappe der GitHub-REST-Endpunkte, die githubSpeicher und die App-Tokens benutzen – auf fetch-Ebene, damit in Tests
// die echte Implementierung läuft. Git-Modell: Blobs (echte Git-SHA), flache Trees (Pfad -> Blob), Commits mit Eltern,
// ein Ref `main`. `PATCH git/refs/heads/main` antwortet 422 genau dann, wenn parents[0] des neuen Commits nicht der
// aktuelle Kopf ist (echtes Fast-Forward-Modell, kein Schalter). Nur bei NODE_ENV ∈ {development, test}.
import { createHash } from 'node:crypto';
import { blobSha } from '../git-sha.js';
import { istLokal } from '../umgebung.js';

export interface FakeGitCommit {
  sha: string;
  tree: string;
  parents: string[];
  message: string;
  author: { name: string; email: string } | null;
  committer: { name: string; email: string } | null;
}

interface FakeRepo {
  id: number;
  name: string;
  blobs: Map<string, string>;
  trees: Map<string, Map<string, string>>;
  commits: Map<string, FakeGitCommit>;
  main: string | null;
  // Aus welcher Vorlage /generate das Repo erzeugt hat (GitHub: template_repository); null = keine.
  vorlage: { name: string; owner: string } | null;
  // Wie oft `GET git/ref/heads/main` noch 404 antwortet (GitHub kopiert die Vorlage nicht synchron).
  mainVerzoegerung: number;
}

export interface FakeAufruf {
  methode: string;
  pfad: string;
  body: unknown;
  token: string | null;
}

export interface FakeGithubZustand {
  org: string;
  installationId: number;
  bot: { slug: string; id: number };
  repos: Map<string, FakeRepo>;
  aufrufe: FakeAufruf[];
  // Ausgegebene Installations-Tokens mit ihrem Umfang.
  tokens: Map<string, { permissions: Record<string, string>; repositoryIds: number[] | null }>;
  // Läuft vor jedem PATCH auf git/refs/heads/main (z. B. ein anderer Tab speichert dazwischen).
  vorRefUpdate: ((repo: string) => void) | null;
  // Für frisch aus der Vorlage erzeugte Repos: so viele `GET git/ref/heads/main` antworten zuerst 404.
  mainVerzoegerung: number;
  // Liefert sie eine Antwort, kommt diese statt der normalen (Fehler von GitHub nachstellen).
  // Ein nie erfüllter Promise stellt ein hängendes GitHub nach (abbrechbar über das AbortSignal der Anfrage).
  stoerung: ((methode: string, pfad: string) => Response | Promise<Response> | undefined) | null;
  vorlageAnlegen(name: string, dateien: Record<string, string>): void;
  // opts.vorlage: als wäre es aus dieser Vorlage erzeugt (Owner Standard: die Org).
  repoAnlegen(name: string, dateien: Record<string, string> | null, opts?: { vorlage?: string; vorlageOwner?: string }): void;
  kopf(repo: string): string | null;
  commit(repo: string, sha: string): FakeGitCommit;
  // Dateien im Kopf von main (Pfad -> Inhalt).
  dateien(repo: string): Record<string, string>;
  // Wie eine Änderung direkt auf GitHub: ein Commit auf main, der `pfad` setzt.
  aendernVonAussen(repo: string, pfad: string, inhalt: string): void;
  aufrufeVon(methode: string, pfadEnde: string): FakeAufruf[];
}

const BASIS = 'https://api.github.com';

function sha1(text: string): string {
  return createHash('sha1').update(text).digest('hex');
}

function antwort(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}
const nichtGefunden = () => antwort(404, { message: 'Not Found' });

export function fakeGithub(opts: { org?: string; installationId?: number } = {}): { fetch: typeof fetch; zustand: FakeGithubZustand } {
  if (!istLokal(process.env)) throw new Error('fakeGithub nur bei NODE_ENV development oder test');
  let naechsteId = 5001;
  let tokenZaehler = 0;
  let zaehler = 0;

  const repoNeu = (name: string): FakeRepo => ({
    id: naechsteId++,
    name,
    blobs: new Map(),
    trees: new Map(),
    commits: new Map(),
    main: null,
    vorlage: null,
    mainVerzoegerung: 0,
  });
  const blobAblegen = (r: FakeRepo, inhalt: string) => {
    const sha = blobSha(inhalt);
    r.blobs.set(sha, inhalt);
    return sha;
  };
  const treeAblegen = (r: FakeRepo, eintraege: Map<string, string>) => {
    const sha = sha1(`tree ${JSON.stringify([...eintraege].sort())}`);
    r.trees.set(sha, new Map(eintraege));
    return sha;
  };
  const commitAblegen = (r: FakeRepo, c: Omit<FakeGitCommit, 'sha'>) => {
    // Zähler im Inhalt: zwei Commits mit gleichem Tree und Eltern bleiben verschieden (wie Zeitstempel bei Git).
    const sha = sha1(`commit ${JSON.stringify(c)} ${zaehler++}`);
    r.commits.set(sha, { sha, ...c });
    return sha;
  };
  const kopfTree = (r: FakeRepo) => (r.main ? r.trees.get(r.commits.get(r.main)!.tree)! : new Map<string, string>());
  const direktCommit = (r: FakeRepo, dateien: Record<string, string>, message: string) => {
    const eintraege = new Map(kopfTree(r));
    for (const [pfad, inhalt] of Object.entries(dateien)) eintraege.set(pfad, blobAblegen(r, inhalt));
    const tree = treeAblegen(r, eintraege);
    r.main = commitAblegen(r, { tree, parents: r.main ? [r.main] : [], message, author: null, committer: null });
  };

  const zustand: FakeGithubZustand = {
    org: opts.org ?? 'ndu-innolab',
    installationId: opts.installationId ?? 77,
    bot: { slug: 'ndu-werkstatt', id: 4242 },
    repos: new Map(),
    aufrufe: [],
    tokens: new Map(),
    vorRefUpdate: null,
    mainVerzoegerung: 0,
    stoerung: null,
    vorlageAnlegen(name, dateien) {
      zustand.repoAnlegen(name, dateien);
    },
    repoAnlegen(name, dateien, o = {}) {
      const r = repoNeu(name);
      if (o.vorlage) r.vorlage = { name: o.vorlage, owner: o.vorlageOwner ?? zustand.org };
      zustand.repos.set(name, r);
      if (dateien) direktCommit(r, dateien, 'Anfang');
    },
    kopf: (repo) => zustand.repos.get(repo)?.main ?? null,
    commit(repo, sha) {
      const c = zustand.repos.get(repo)?.commits.get(sha);
      if (!c) throw new Error(`commit-fehlt: ${repo} ${sha}`);
      return c;
    },
    dateien(repo) {
      const r = zustand.repos.get(repo);
      if (!r) throw new Error(`repo-fehlt: ${repo}`);
      return Object.fromEntries([...kopfTree(r)].map(([pfad, sha]) => [pfad, r.blobs.get(sha)!]));
    },
    aendernVonAussen(repo, pfad, inhalt) {
      const r = zustand.repos.get(repo);
      if (!r) throw new Error(`repo-fehlt: ${repo}`);
      direktCommit(r, { [pfad]: inhalt }, `Von außen: ${pfad}`);
    },
    aufrufeVon(methode, pfadEnde) {
      return zustand.aufrufe.filter((a) => a.methode === methode && a.pfad.endsWith(pfadEnde));
    },
  };

  // Repo-Endpunkte nur mit einem Installations-Token, dessen Umfang das Repo einschließt (sonst 404 wie bei GitHub).
  const darf = (token: string | null, r: FakeRepo) => {
    const t = token ? zustand.tokens.get(token) : undefined;
    return !!t && (t.repositoryIds === null || t.repositoryIds.includes(r.id));
  };

  async function bearbeiten(methode: string, pfad: string, suche: URLSearchParams, body: any, token: string | null): Promise<Response> {
    let m: RegExpMatchArray | null;

    if (methode === 'GET' && (m = pfad.match(/^\/orgs\/([^/]+)\/installation$/))) {
      if (!token?.startsWith('ey')) return antwort(401, { message: 'A JSON web token could not be decoded' });
      return m[1] === zustand.org ? antwort(200, { id: zustand.installationId }) : nichtGefunden();
    }
    if (methode === 'POST' && (m = pfad.match(/^\/app\/installations\/(\d+)\/access_tokens$/))) {
      if (!token?.startsWith('ey')) return antwort(401, { message: 'A JSON web token could not be decoded' });
      if (Number(m[1]) !== zustand.installationId) return nichtGefunden();
      const ids = body?.repository_ids as number[] | undefined;
      const bekannt = new Set([...zustand.repos.values()].map((x) => x.id));
      if (ids?.some((id) => !bekannt.has(id))) return antwort(422, { message: 'There is at least one repository that does not exist or is not accessible to the parent installation.' });
      const t = `ghs_fake_${zustand.installationId}_${++tokenZaehler}`;
      zustand.tokens.set(t, { permissions: body?.permissions ?? {}, repositoryIds: body?.repository_ids ?? null });
      return antwort(201, { token: t, expires_at: '2099-01-01T00:00:00Z' });
    }
    if (methode === 'GET' && pfad === '/app') {
      if (!token?.startsWith('ey')) return antwort(401, { message: 'A JSON web token could not be decoded' });
      return antwort(200, { slug: zustand.bot.slug });
    }
    if (methode === 'GET' && (m = pfad.match(/^\/users\/([^/]+)$/))) {
      if (!token || !zustand.tokens.has(token)) return antwort(401, { message: 'Bad credentials' });
      const login = decodeURIComponent(m[1]);
      return login === `${zustand.bot.slug}[bot]` ? antwort(200, { id: zustand.bot.id, login }) : nichtGefunden();
    }

    m = pfad.match(/^\/repos\/([^/]+)\/([^/]+)(\/.*)?$/);
    if (!m || m[1] !== zustand.org) return nichtGefunden();
    const rest = m[3] ?? '';
    const r = zustand.repos.get(m[2]);

    if (methode === 'POST' && rest === '/generate') {
      if (!r || !darf(token, r)) return nichtGefunden();
      // GitHub verlangt für /generate Administration write und zusätzlich Contents read.
      const rechte = zustand.tokens.get(token!)!.permissions;
      if (rechte.administration !== 'write' || (rechte.contents !== 'read' && rechte.contents !== 'write')) {
        return antwort(403, { message: 'Resource not accessible by integration' });
      }
      if (body?.owner !== zustand.org || typeof body?.name !== 'string' || body?.private !== true) return antwort(422, { message: 'Invalid request' });
      if (zustand.repos.has(body.name)) {
        return antwort(422, { message: 'Unprocessable Entity', errors: ['Could not clone: Name already exists on this account'] });
      }
      const neu = repoNeu(body.name);
      neu.vorlage = { name: r.name, owner: zustand.org };
      zustand.repos.set(body.name, neu);
      // Inhalt der Vorlage übernehmen, aber main erst nach der Verzögerung sichtbar.
      direktCommit(neu, zustand.dateien(r.name), 'Initial commit');
      neu.mainVerzoegerung = zustand.mainVerzoegerung;
      return antwort(201, { id: neu.id, name: neu.name, full_name: `${zustand.org}/${neu.name}` });
    }

    if (!r || !darf(token, r)) return nichtGefunden();
    if (methode === 'GET' && rest === '') {
      const vorlage = r.vorlage ? { name: r.vorlage.name, owner: { login: r.vorlage.owner } } : null;
      return antwort(200, { id: r.id, name: r.name, template_repository: vorlage });
    }

    const leer = () => antwort(409, { message: 'Git Repository is empty.' });
    const sichtbar = () => r.main !== null && r.mainVerzoegerung === 0;

    if (methode === 'GET' && rest === '/git/ref/heads/main') {
      if (r.mainVerzoegerung > 0) {
        r.mainVerzoegerung--;
        return nichtGefunden();
      }
      return r.main ? antwort(200, { ref: 'refs/heads/main', object: { sha: r.main, type: 'commit' } }) : nichtGefunden();
    }
    if (methode === 'GET' && (m = rest.match(/^\/git\/commits\/([0-9a-f]{40})$/))) {
      const c = r.commits.get(m[1]);
      return c ? antwort(200, { sha: c.sha, tree: { sha: c.tree }, parents: c.parents.map((sha) => ({ sha })) }) : nichtGefunden();
    }
    if (methode === 'GET' && (m = rest.match(/^\/git\/trees\/([^/]+)$/))) {
      if (!sichtbar()) return leer();
      const sha = m[1] === 'main' ? r.commits.get(r.main!)!.tree : m[1];
      const t = r.trees.get(sha);
      if (!t) return nichtGefunden();
      // Flaches Modell: recursive=1 liefert alle Blobs; ohne recursive dasselbe (in Tests reicht das).
      return antwort(200, { sha, truncated: false, tree: [...t].map(([path, s]) => ({ path, type: 'blob', mode: '100644', sha: s })) });
    }
    if (methode === 'GET' && (m = rest.match(/^\/contents\/(.+)$/))) {
      if (!sichtbar()) return nichtGefunden();
      const ref = suche.get('ref') ?? r.main!;
      const commitSha = ref === 'main' ? r.main! : ref;
      const c = r.commits.get(commitSha);
      if (!c) return nichtGefunden();
      const blob = r.trees.get(c.tree)!.get(decodeURIComponent(m[1]));
      if (!blob) return nichtGefunden();
      return antwort(200, { type: 'file', sha: blob, encoding: 'base64', content: Buffer.from(r.blobs.get(blob)!, 'utf8').toString('base64') });
    }
    if (methode === 'PUT' && (m = rest.match(/^\/contents\/(.+)$/))) {
      if (!sichtbar()) return leer();
      const p = decodeURIComponent(m[1]);
      const vorhanden = kopfTree(r).get(p);
      if (vorhanden && body?.sha !== vorhanden) return antwort(422, { message: `Invalid request.\n\n"sha" wasn't supplied.` });
      direktCommit(r, { [p]: Buffer.from(body.content, 'base64').toString('utf8') }, body.message);
      return antwort(vorhanden ? 200 : 201, { content: { path: p, sha: kopfTree(r).get(p) } });
    }
    if (methode === 'POST' && rest === '/git/blobs') {
      const inhalt = body.encoding === 'base64' ? Buffer.from(body.content, 'base64').toString('utf8') : String(body.content);
      return antwort(201, { sha: blobAblegen(r, inhalt) });
    }
    if (methode === 'POST' && rest === '/git/trees') {
      const basis = body.base_tree ? r.trees.get(body.base_tree) : new Map<string, string>();
      if (!basis) return antwort(422, { message: 'base_tree fehlt' });
      const eintraege = new Map(basis);
      // Einträge mit `sha` (vorhandener Blob) oder inline `content` (GitHub legt den Blob selbst an).
      for (const e of body.tree as { path: string; sha?: string; content?: string }[]) {
        if (typeof e.content === 'string') {
          eintraege.set(e.path, blobAblegen(r, e.content));
          continue;
        }
        if (!e.sha || !r.blobs.has(e.sha)) return antwort(422, { message: `blob fehlt: ${e.sha}` });
        eintraege.set(e.path, e.sha);
      }
      return antwort(201, { sha: treeAblegen(r, eintraege) });
    }
    if (methode === 'POST' && rest === '/git/commits') {
      if (!r.trees.has(body.tree)) return antwort(422, { message: 'tree fehlt' });
      for (const p of body.parents as string[]) if (!r.commits.has(p)) return antwort(422, { message: 'parent fehlt' });
      const sha = commitAblegen(r, {
        tree: body.tree,
        parents: body.parents,
        message: body.message,
        author: body.author ?? null,
        committer: body.committer ?? null,
      });
      return antwort(201, { sha, html_url: `https://github.com/${zustand.org}/${r.name}/commit/${sha}` });
    }
    if (methode === 'PATCH' && rest === '/git/refs/heads/main') {
      zustand.vorRefUpdate?.(r.name);
      const c = r.commits.get(body.sha);
      if (!c) return antwort(422, { message: 'Object does not exist' });
      // force: true überschreibt wie bei GitHub; sonst nur Fast-Forward.
      if (body.force !== true && c.parents[0] !== r.main) return antwort(422, { message: 'Update is not a fast forward' });
      r.main = c.sha;
      return antwort(200, { ref: 'refs/heads/main', object: { sha: c.sha, type: 'commit' } });
    }
    return nichtGefunden();
  }

  const fakeFetch: typeof fetch = async (eingabe, init) => {
    const url = new URL(typeof eingabe === 'string' || eingabe instanceof URL ? eingabe : eingabe.url);
    if (url.origin !== BASIS) throw new Error(`fakeGithub: unerwartete Adresse ${url.origin}`);
    const methode = (init?.method ?? 'GET').toUpperCase();
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    const kopfzeilen = new Headers(init?.headers);
    const auth = kopfzeilen.get('authorization');
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    zustand.aufrufe.push({ methode, pfad: url.pathname, body, token });
    const gestoert = zustand.stoerung?.(methode, url.pathname);
    const ergebnis = gestoert ? Promise.resolve(gestoert) : bearbeiten(methode, url.pathname, url.searchParams, body, token);
    const signal = init?.signal;
    if (!signal) return ergebnis;
    // Wie fetch: Abbruch über das Signal (z. B. AbortSignal.timeout) lässt die Anfrage scheitern.
    return Promise.race([
      ergebnis,
      new Promise<Response>((_, abbruch) => {
        if (signal.aborted) abbruch(signal.reason);
        signal.addEventListener('abort', () => abbruch(signal.reason), { once: true });
      }),
    ]);
  };

  return { fetch: fakeFetch, zustand };
}
