// Speicher auf GitHub (spec §3.3): ein privates Mappe-Repo pro Person, aus der Vorlage der Kohorte erzeugt.
// Ein Speichern = ein Commit über die Git-Data-API. Konflikte gelten pro Artefakt: basisSha ist der Blob-SHA von
// mappe/<name>.json im Kopf von main (null = neu). Ein anderes Artefakt, das inzwischen gespeichert wurde, lässt das
// Ref-Update mit 422 „not a fast forward“ scheitern; dann einmal von vorn auf dem neuen Kopf.
import { ARTEFAKT_NAMEN } from '../../schemas/index.js';
import { kohorte as kohorteVon, type Kohorte } from '../../kohorten/index.js';
import { repoName } from '../../zugang.js';
import type { Cache, Speicher } from '../typen.js';
import { githubAnfrage, githubFehler, jsonAusRepo, type InstallationToken } from './app-token.js';

export interface GithubSpeicherAbh {
  fetch: typeof fetch;
  cache: Cache;
  token: InstallationToken;
  // Committer aller Commits (Autor*in ist die Person).
  bot(): Promise<{ name: string; email: string }>;
  // Die Kohorte, deren Org die Repos gehören.
  kohorte: Kohorte;
  // In Tests steuerbar; Standard: setTimeout und Date.now.
  schlafen?(ms: number): Promise<void>;
  jetzt?(): number;
}

const TAG_SEK = 24 * 60 * 60;
// Nach /generate ist main nicht sofort da: alle 1 s nachsehen, höchstens 8 s.
const WARTEN_SCHRITT_MS = 1000;
const WARTEN_HOECHSTENS_MS = 8000;

// Org-weit für /generate (und das Auflösen von Repo-Namen); alles im Repo nur mit einem Token für genau dieses Repo.
// GitHub verlangt für /generate neben Administration write auch Contents read.
const ORG_RECHTE = { administration: 'write', contents: 'read' } as const;
const REPO_RECHTE = { contents: 'write' } as const;

const jsonPfad = (name: string) => `mappe/${name}.json`;
const pfadKodieren = (pfad: string) => pfad.split('/').map(encodeURIComponent).join('/');

interface Zugriff {
  token: string;
  basis: string;
}

export function githubSpeicher(abh: GithubSpeicherAbh): Speicher {
  const org = abh.kohorte.org;
  const schlafen = abh.schlafen ?? ((ms: number) => new Promise<void>((fertig) => setTimeout(fertig, ms)));
  const jetzt = abh.jetzt ?? (() => Date.now());
  const anfrage = (z: Zugriff | string, methode: string, pfad: string, body?: unknown) =>
    typeof z === 'string'
      ? githubAnfrage(abh.fetch, z, methode, pfad, body)
      : githubAnfrage(abh.fetch, z.token, methode, `${z.basis}${pfad}`, body);

  const orgToken = () => abh.token({ org, rechte: ORG_RECHTE });
  const idSchluessel = (repo: string) => `gh-repo-id:${org}/${repo}`;

  // Repo-Name → numerische ID (für repository_ids), einmal mit dem Org-Token aufgelöst und gemerkt. null = kein Repo.
  async function repoId(repo: string): Promise<number | null> {
    const gemerkt = await abh.cache.get(idSchluessel(repo));
    if (typeof gemerkt === 'number') return gemerkt;
    const pfad = `/repos/${encodeURIComponent(org)}/${encodeURIComponent(repo)}`;
    const r = await anfrage(await orgToken(), 'GET', pfad);
    if (r.status === 404) return null;
    if (r.status !== 200 || typeof r.daten?.id !== 'number') throw githubFehler('GET', pfad, r.status);
    await abh.cache.set(idSchluessel(repo), r.daten.id, TAG_SEK);
    return r.daten.id as number;
  }

  async function zugriff(repo: string): Promise<Zugriff | null> {
    const id = await repoId(repo);
    if (id === null) return null;
    return { token: await abh.token({ org, repoId: id, rechte: REPO_RECHTE }), basis: `/repos/${encodeURIComponent(org)}/${encodeURIComponent(repo)}` };
  }

  // SHA des Kopfs von main; null, solange es main noch nicht gibt (leeres oder frisch erzeugtes Repo).
  async function kopfLesen(z: Zugriff): Promise<string | null> {
    const r = await anfrage(z, 'GET', '/git/ref/heads/main');
    if (r.status === 404 || r.status === 409) return null;
    if (r.status !== 200 || typeof r.daten?.object?.sha !== 'string') throw githubFehler('GET', 'git/ref/heads/main', r.status);
    return r.daten.object.sha as string;
  }

  async function dateiLesen(z: Zugriff, pfad: string, ref?: string): Promise<{ inhalt: string; sha: string } | null> {
    const r = await anfrage(z, 'GET', `/contents/${pfadKodieren(pfad)}${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`);
    if (r.status === 404) return null;
    if (r.status !== 200 || typeof r.daten?.sha !== 'string' || typeof r.daten?.content !== 'string') {
      throw githubFehler('GET', `contents/${pfad}`, r.status);
    }
    return { inhalt: Buffer.from(r.daten.content, 'base64').toString('utf8'), sha: r.daten.sha };
  }

  async function werkstattJsonLesen(z: Zugriff): Promise<{ kohorte: string; githubId: number } | null> {
    const datei = await dateiLesen(z, 'werkstatt.json');
    if (!datei) return null;
    const wj = jsonAusRepo('werkstatt.json', datei.inhalt) as { kohorte?: unknown; githubId?: unknown } | null;
    // Unlesbar heißt nicht „frei“: lieber scheitern als ein Repo der falschen Person zuordnen.
    if (typeof wj?.kohorte !== 'string' || typeof wj?.githubId !== 'number') {
      console.error('werkstatt: werkstatt.json ohne kohorte/githubId');
      throw githubFehler('GET', 'contents/werkstatt.json', 200);
    }
    return { kohorte: wj.kohorte, githubId: wj.githubId };
  }

  return {
    async anlegen(m, githubId) {
      const k = kohorteVon(m.kohorte);
      if (!k || k.org !== org) throw new Error('kohorte-passt-nicht');
      const repo = repoName(m);
      const pruefen = (wj: { githubId: number }) => {
        if (wj.githubId !== githubId) throw new Error('repo-gehoert-anderer-person');
      };

      const pfad = `/repos/${encodeURIComponent(org)}/${encodeURIComponent(k.vorlage)}/generate`;
      const r = await anfrage(await orgToken(), 'POST', pfad, { owner: org, name: repo, private: true });
      if (r.status === 201 && typeof r.daten?.id === 'number') {
        await abh.cache.set(idSchluessel(repo), r.daten.id, TAG_SEK);
      } else if (r.status === 422 && /already exists/i.test(JSON.stringify(r.daten))) {
        // Zweiter Tab oder Wiederholung: Erfolg, wenn werkstatt.json zur Person passt; fehlt sie, unten nachtragen.
        const z = await zugriff(repo);
        const wj = z && (await kopfLesen(z)) ? await werkstattJsonLesen(z) : null;
        if (wj) {
          pruefen(wj);
          return { repo };
        }
      } else {
        throw githubFehler('POST', pfad, r.status);
      }

      const z = await zugriff(repo);
      if (!z) throw new Error('repo-nicht-bereit');
      // GitHub kopiert die Vorlage nicht garantiert synchron.
      const beginn = jetzt();
      while (!(await kopfLesen(z))) {
        if (jetzt() - beginn >= WARTEN_HOECHSTENS_MS) throw new Error('repo-nicht-bereit');
        await schlafen(WARTEN_SCHRITT_MS);
      }

      const vorhanden = await werkstattJsonLesen(z);
      if (vorhanden) {
        pruefen(vorhanden);
        return { repo };
      }
      const inhalt = `${JSON.stringify({ kohorte: m.kohorte, githubId, schemaVersionen: k.artefakte }, null, 2)}\n`;
      const put = await anfrage(z, 'PUT', '/contents/werkstatt.json', {
        message: 'Werkstatt: Mappe zugeordnet',
        content: Buffer.from(inhalt, 'utf8').toString('base64'),
      });
      if (put.status === 422) {
        // Ein zweiter Tab war schneller: dann muss dessen werkstatt.json passen.
        const wj = await werkstattJsonLesen(z);
        if (!wj) throw githubFehler('PUT', 'contents/werkstatt.json', put.status);
        pruefen(wj);
      } else if (put.status !== 201 && put.status !== 200) {
        throw githubFehler('PUT', 'contents/werkstatt.json', put.status);
      }
      return { repo };
    },

    async lesen(repo, name) {
      const z = await zugriff(repo);
      const datei = z ? await dateiLesen(z, jsonPfad(name)) : null;
      if (!datei) return { daten: null, basisSha: null };
      return { daten: jsonAusRepo(jsonPfad(name), datei.inhalt), basisSha: datei.sha };
    },

    async speichern(repo, name, dateien, basisSha, autor, nachricht) {
      const json = jsonPfad(name);
      if (dateien[json] === undefined) throw new Error(`speichern ohne ${json}`);
      const z = await zugriff(repo);
      if (!z) throw new Error(`repo-fehlt: ${repo}`);
      const committer = await abh.bot();

      // Blobs hängen nicht am Kopf: einmal anlegen, für beide Versuche.
      const eintraege: { path: string; mode: '100644'; type: 'blob'; sha: string }[] = [];
      for (const [pfad, inhalt] of Object.entries(dateien)) {
        const b = await anfrage(z, 'POST', '/git/blobs', { content: Buffer.from(inhalt, 'utf8').toString('base64'), encoding: 'base64' });
        if (b.status !== 201 || typeof b.daten?.sha !== 'string') throw githubFehler('POST', 'git/blobs', b.status);
        eintraege.push({ path: pfad, mode: '100644', type: 'blob', sha: b.daten.sha });
      }
      const neuerSha = eintraege.find((e) => e.path === json)!.sha;

      for (let versuch = 1; versuch <= 2; versuch++) {
        const kopf = await kopfLesen(z);
        if (!kopf) throw new Error(`repo-ohne-main: ${repo}`);
        const c = await anfrage(z, 'GET', `/git/commits/${kopf}`);
        if (c.status !== 200 || typeof c.daten?.tree?.sha !== 'string') throw githubFehler('GET', 'git/commits', c.status);

        // Konflikt nur, wenn sich genau diese JSON-Datei seit dem Laden geändert hat.
        const aktuell = (await dateiLesen(z, json, kopf))?.sha ?? null;
        if (aktuell !== basisSha) return { konflikt: true };

        const t = await anfrage(z, 'POST', '/git/trees', { base_tree: c.daten.tree.sha, tree: eintraege });
        if (t.status !== 201 || typeof t.daten?.sha !== 'string') throw githubFehler('POST', 'git/trees', t.status);
        const neu = await anfrage(z, 'POST', '/git/commits', { message: nachricht, tree: t.daten.sha, parents: [kopf], author: autor, committer });
        if (neu.status !== 201 || typeof neu.daten?.sha !== 'string') throw githubFehler('POST', 'git/commits', neu.status);

        const ref = await anfrage(z, 'PATCH', '/git/refs/heads/main', { sha: neu.daten.sha, force: false });
        if (ref.status === 200) return { basisSha: neuerSha, commitUrl: String(neu.daten.html_url) };
        // 422 „not a fast forward“: inzwischen hat jemand ein anderes Artefakt gespeichert → einmal von vorn.
        // Jeder andere 422 ist ein echter Fehler.
        if (ref.status !== 422 || !/fast forward/i.test(String(ref.daten?.message ?? ''))) {
          throw githubFehler('PATCH', 'git/refs/heads/main', ref.status);
        }
      }
      return { konflikt: true };
    },

    async uebersicht(repo) {
      const z = await zugriff(repo);
      if (!z) throw new Error(`repo-fehlt: ${repo}`);
      const r = await anfrage(z, 'GET', '/git/trees/main?recursive=1');
      let pfade = new Set<string>();
      if (r.status === 200 && Array.isArray(r.daten?.tree)) {
        pfade = new Set((r.daten.tree as { path: string; type: string }[]).filter((e) => e.type === 'blob').map((e) => e.path));
      } else if (r.status !== 404 && r.status !== 409) {
        throw githubFehler('GET', 'git/trees/main', r.status);
      }
      return ARTEFAKT_NAMEN.map((name) => ({ name, vorhanden: pfade.has(jsonPfad(name)) }));
    },

    async werkstattJson(repo) {
      const z = await zugriff(repo);
      return z ? werkstattJsonLesen(z) : null;
    },
  };
}
