// Speicher auf GitHub (spec §3.3): ein privates Mappe-Repo pro Person, aus der Vorlage der Kohorte erzeugt.
// Ein Speicher für alle Jahrgänge: Org und Vorlage kommen pro Aufruf aus der Kohorte (anlegen: m.kohorte; sonst das
// Präfix `<kohorte>-` des Repo-Namens). Ein Speichern = ein Commit über die Git-Data-API. Konflikte gelten pro Artefakt:
// basisSha ist der Blob-SHA von mappe/<name>.json im Kopf von main (null = neu). Ein anderes Artefakt, das inzwischen
// gespeichert wurde, lässt das Ref-Update mit 422 „not a fast forward“ scheitern; dann bis zu dreimal auf dem neuen Kopf.
import { ARTEFAKT_NAMEN } from '../../schemas/index.js';
import { kohorte as kohorteNachId, type Kohorte } from '../../kohorten/index.js';
import { repoName } from '../../zugang.js';
import { ApiAusnahme } from '../antwort.js';
import { blobSha } from '../git-sha.js';
import { LOGIN_MUSTER, fremdesRepo, internerFehler as intern, unbekanntesRepo, wirdEingerichtet } from '../speicher-fehler.js';
import type { Cache, Speicher } from '../typen.js';
import { GithubAusnahme, ORG_RECHTE, githubAnfrage, githubFehler, jsonAusRepo, type InstallationToken } from './app-token.js';

export interface GithubSpeicherAbh {
  fetch: typeof fetch;
  cache: Cache;
  token: InstallationToken;
  // Committer aller Commits in dieser Org (Autor*in ist die Person).
  bot(org: string): Promise<{ name: string; email: string }>;
  // Kohorte zu einer ID; Standard: kohorte() aus src/werkstatt/kohorten.
  kohorteZu?(id: string): Kohorte | undefined;
  // In Tests steuerbar; Standard: setTimeout, Date.now, 8 s.
  schlafen?(ms: number): Promise<void>;
  jetzt?(): number;
  zeitlimitMs?: number;
}

const TAG_SEK = 24 * 60 * 60;
// Nach /generate ist main nicht sofort da: alle 1 s nachsehen, höchstens 8 s.
const WARTEN_SCHRITT_MS = 1000;
const WARTEN_HOECHSTENS_MS = 8000;
// Versuche, wenn das Ref-Update das Fast-Forward-Rennen gegen ein anderes Artefakt verliert.
const SPEICHER_VERSUCHE = 3;

const REPO_RECHTE = { contents: 'write' } as const;
// Collaborators einladen und prüfen: nur dafür, nur für dieses Repo.
const EINLADEN_RECHTE = { administration: 'write' } as const;
// „eingeladen“ nur kurz merken: kein erneutes PUT bei jedem Neuladen, aber die Annahme zeigt sich bald.
const EINGELADEN_SEK = 10 * 60;

const jsonPfad = (name: string) => `mappe/${name}.json`;
const pfadKodieren = (pfad: string) => pfad.split('/').map(encodeURIComponent).join('/');

const nameBelegt = () => new ApiAusnahme(409, 'konflikt', 'Für dich existiert schon ein anderes Repo mit diesem Namen. Schreib Markus.');
const vieleGleichzeitig = () => new ApiAusnahme(503, 'github-fehler', 'Gerade speichern viele gleichzeitig. Bitte gleich noch einmal.');

interface Zugriff {
  org: string;
  token: string;
  basis: string;
}

interface RepoInfo {
  id: number;
  vorlage: { name: string; owner: string } | null;
}

export function githubSpeicher(abh: GithubSpeicherAbh): Speicher {
  const kohorteZu = abh.kohorteZu ?? kohorteNachId;
  const schlafen = abh.schlafen ?? ((ms: number) => new Promise<void>((fertig) => setTimeout(fertig, ms)));
  const jetzt = abh.jetzt ?? (() => Date.now());
  const anfrage = (z: Zugriff | string, methode: string, pfad: string, body?: unknown) =>
    typeof z === 'string'
      ? githubAnfrage(abh.fetch, z, methode, pfad, body, abh.zeitlimitMs)
      : githubAnfrage(abh.fetch, z.token, methode, `${z.basis}${pfad}`, body, abh.zeitlimitMs);

  const orgToken = (org: string) => abh.token({ org, rechte: ORG_RECHTE });
  const idSchluessel = (org: string, repo: string) => `gh-repo-id:${org}/${repo}`;
  const repoPfad = (org: string, repo: string) => `/repos/${encodeURIComponent(org)}/${encodeURIComponent(repo)}`;

  // Repo-Name `<kohorte>-<kuerzel>` → Kohorte. Kohorten-IDs enthalten keinen Bindestrich (2026, test).
  function kohorteDesRepos(repo: string): Kohorte {
    const i = repo.indexOf('-');
    const k = i > 0 ? kohorteZu(repo.slice(0, i)) : undefined;
    if (!k) throw unbekanntesRepo();
    return k;
  }

  // Metadaten mit dem Org-Token; merkt die ID. null = kein Repo.
  async function repoInfo(org: string, repo: string): Promise<RepoInfo | null> {
    const pfad = repoPfad(org, repo);
    const r = await anfrage(await orgToken(org), 'GET', pfad);
    if (r.status === 404) return null;
    if (r.status !== 200 || typeof r.daten?.id !== 'number') throw githubFehler('GET', pfad, r.status);
    await abh.cache.set(idSchluessel(org, repo), r.daten.id, TAG_SEK);
    const t = r.daten.template_repository;
    return { id: r.daten.id, vorlage: t && typeof t.name === 'string' ? { name: t.name, owner: String(t.owner?.login ?? '') } : null };
  }

  // Token für genau dieses Repo. Die ID wird einmal aufgelöst und gemerkt; scheitert die Token-Ausgabe mit einer
  // gemerkten ID (Repo gelöscht und neu angelegt), einmal neu auflösen. null = kein Repo.
  async function zugriff(repo: string, rechte: typeof REPO_RECHTE | typeof EINLADEN_RECHTE = REPO_RECHTE): Promise<Zugriff | null> {
    const { org } = kohorteDesRepos(repo);
    const basis = repoPfad(org, repo);
    const gemerkt = await abh.cache.get(idSchluessel(org, repo));
    if (typeof gemerkt === 'number') {
      try {
        return { org, basis, token: await abh.token({ org, repoId: gemerkt, rechte }) };
      } catch (e) {
        if (!(e instanceof GithubAusnahme && (e.githubStatus === 404 || e.githubStatus === 422))) throw e;
        await abh.cache.set(idSchluessel(org, repo), null, 1);
      }
    }
    const info = await repoInfo(org, repo);
    if (!info) return null;
    return { org, basis, token: await abh.token({ org, repoId: info.id, rechte }) };
  }

  // SHA des Kopfs von main; null, solange es main noch nicht gibt (leeres oder frisch erzeugtes Repo).
  async function kopfLesen(z: Zugriff): Promise<string | null> {
    const r = await anfrage(z, 'GET', '/git/ref/heads/main');
    if (r.status === 404 || r.status === 409) return null;
    if (r.status !== 200 || typeof r.daten?.object?.sha !== 'string') throw githubFehler('GET', 'git/ref/heads/main', r.status);
    return r.daten.object.sha as string;
  }

  // Pfade aller Dateien eines Baums (main oder Tree-SHA); leer, solange es main noch nicht gibt.
  async function baumPfade(z: Zugriff, baum: string): Promise<Set<string>> {
    const r = await anfrage(z, 'GET', `/git/trees/${baum}?recursive=1`);
    if (r.status === 200 && Array.isArray(r.daten?.tree)) {
      return new Set((r.daten.tree as { path: string; type: string }[]).filter((e) => e.type === 'blob').map((e) => e.path));
    }
    if (r.status === 404 || r.status === 409) return new Set();
    throw githubFehler('GET', `git/trees/${baum}`, r.status);
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

  const lesenSchluessel = (org: string, repo: string, githubId: number, stand: 'aktiv' | 'eingeladen') =>
    `gh-lesezugriff-${stand}:${org}/${repo}:${githubId}`;

  return {
    async lesezugriff(repo, githubId) {
      if (!Number.isSafeInteger(githubId) || githubId <= 0) throw intern('lesezugriff: ungültige GitHub-ID');
      const { org } = kohorteDesRepos(repo);
      for (const stand of ['aktiv', 'eingeladen'] as const) {
        if ((await abh.cache.get(lesenSchluessel(org, repo, githubId, stand))) === stand) return stand;
      }
      const z = await zugriff(repo, EINLADEN_RECHTE);
      if (!z) throw unbekanntesRepo();
      // Der Login ist umbenennbar, die ID nicht: den aktuellen Namen bei GitHub erfragen.
      const nutzerPfad = `/user/${githubId}`;
      const nutzer = await anfrage(z.token, 'GET', nutzerPfad);
      if (nutzer.status !== 200) throw githubFehler('GET', '/user/{id}', nutzer.status);
      const login = nutzer.daten?.login;
      if (typeof login !== 'string' || !LOGIN_MUSTER.test(login)) throw intern('lesezugriff: ungültiger GitHub-Login von GitHub');
      const pfad = `/collaborators/${encodeURIComponent(login)}`;
      const geprueft = await anfrage(z, 'GET', pfad);
      let stand: 'aktiv' | 'eingeladen';
      if (geprueft.status === 204) {
        stand = 'aktiv';
      } else if (geprueft.status === 404) {
        // Nie Schreibrechte: Lesende, die Werkstatt bleibt die einzige Schreiberin.
        const r = await anfrage(z, 'PUT', pfad, { permission: 'pull' });
        if (r.status === 204) stand = 'aktiv';
        else if (r.status === 201) stand = 'eingeladen';
        else throw githubFehler('PUT', 'collaborators', r.status);
      } else {
        throw githubFehler('GET', 'collaborators', geprueft.status);
      }
      await abh.cache.set(lesenSchluessel(org, repo, githubId, stand), stand, stand === 'aktiv' ? TAG_SEK : EINGELADEN_SEK);
      return stand;
    },

    async anlegen(m, githubId) {
      const k = kohorteZu(m.kohorte);
      if (!k) throw intern(`anlegen: unbekannte Kohorte ${m.kohorte}`);
      const repo = repoName(m);
      if (kohorteDesRepos(repo).id !== k.id) throw intern(`anlegen: Repo-Name ${repo} passt nicht zur Kohorte ${k.id}`);
      const org = k.org;
      const pruefen = (wj: { githubId: number }) => {
        if (wj.githubId !== githubId) throw fremdesRepo();
      };

      const pfad = `${repoPfad(org, k.vorlage)}/generate`;
      const r = await anfrage(await orgToken(org), 'POST', pfad, { owner: org, name: repo, private: true });
      if (r.status === 201 && typeof r.daten?.id === 'number') {
        await abh.cache.set(idSchluessel(org, repo), r.daten.id, TAG_SEK);
      } else if (r.status === 422 && /already exists/i.test(JSON.stringify(r.daten))) {
        // Zweiter Tab oder Wiederholung – aber nur ein Repo aus der Vorlage dieser Kohorte zählt als unseres.
        const info = await repoInfo(org, repo);
        if (!info || info.vorlage?.name !== k.vorlage || info.vorlage.owner !== org) throw nameBelegt();
        const z = await zugriff(repo);
        const wj = z && (await kopfLesen(z)) ? await werkstattJsonLesen(z) : null;
        if (wj) {
          pruefen(wj);
          return { repo };
        }
        // werkstatt.json fehlt noch (abgebrochener erster Versuch): unten nachtragen.
      } else {
        throw githubFehler('POST', pfad, r.status);
      }

      const z = await zugriff(repo);
      if (!z) throw wirdEingerichtet();
      // GitHub kopiert die Vorlage nicht garantiert synchron.
      const beginn = jetzt();
      while (!(await kopfLesen(z))) {
        if (jetzt() - beginn >= WARTEN_HOECHSTENS_MS) throw wirdEingerichtet();
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
      if (put.status === 409 || put.status === 422) {
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

    async speichern(repo, name, dateien, basisSha, autor, nachricht, readme) {
      const json = jsonPfad(name);
      const neu = dateien[json];
      if (neu === undefined) throw intern(`speichern ohne ${json}`);
      const z = await zugriff(repo);
      if (!z) throw unbekanntesRepo();
      const committer = await abh.bot(z.org);
      // Inhalte inline im Tree (GitHub legt die Blobs an); den neuen Blob-SHA kennen wir selbst.
      const eintraege = Object.entries(dateien).map(([path, content]) => ({ path, mode: '100644', type: 'blob', content }));
      const neuerSha = blobSha(neu);

      for (let versuch = 1; versuch <= SPEICHER_VERSUCHE; versuch++) {
        const kopf = await kopfLesen(z);
        if (!kopf) throw wirdEingerichtet();
        const [c, aktuell] = await Promise.all([anfrage(z, 'GET', `/git/commits/${kopf}`), dateiLesen(z, json, kopf)]);
        if (c.status !== 200 || typeof c.daten?.tree?.sha !== 'string') throw githubFehler('GET', 'git/commits', c.status);

        // Konflikt nur, wenn sich genau diese JSON-Datei seit dem Laden geändert hat.
        if ((aktuell?.sha ?? null) !== basisSha) return { konflikt: true };

        // README aus genau dem Baum, auf dem dieser Versuch aufsetzt (ein anderes Artefakt kann inzwischen dazugekommen sein).
        let baum = eintraege;
        if (readme) {
          const pfade = await baumPfade(z, c.daten.tree.sha);
          const vorhanden = ARTEFAKT_NAMEN.map((n) => ({ name: n, vorhanden: n === name || pfade.has(jsonPfad(n)) }));
          baum = [...eintraege.filter((e) => e.path !== 'README.md'), { path: 'README.md', mode: '100644', type: 'blob', content: readme(vorhanden) }];
        }
        const t = await anfrage(z, 'POST', '/git/trees', { base_tree: c.daten.tree.sha, tree: baum });
        if (t.status !== 201 || typeof t.daten?.sha !== 'string') throw githubFehler('POST', 'git/trees', t.status);
        const commit = await anfrage(z, 'POST', '/git/commits', { message: nachricht, tree: t.daten.sha, parents: [kopf], author: autor, committer });
        if (commit.status !== 201 || typeof commit.daten?.sha !== 'string') throw githubFehler('POST', 'git/commits', commit.status);

        const ref = await anfrage(z, 'PATCH', '/git/refs/heads/main', { sha: commit.daten.sha, force: false });
        if (ref.status === 200) return { basisSha: neuerSha, commitUrl: String(commit.daten.html_url) };
        // Nur 422 „not a fast forward“ heißt: inzwischen hat jemand anderes gespeichert → auf dem neuen Kopf von vorn.
        if (ref.status !== 422 || !/fast forward/i.test(String(ref.daten?.message ?? ''))) {
          throw githubFehler('PATCH', 'git/refs/heads/main', ref.status);
        }
      }
      // Kein Konflikt (unser Artefakt war jedes Mal unverändert), nur zu viel Betrieb.
      throw vieleGleichzeitig();
    },

    async uebersicht(repo) {
      const z = await zugriff(repo);
      if (!z) throw unbekanntesRepo();
      const pfade = await baumPfade(z, 'main');
      return ARTEFAKT_NAMEN.map((name) => ({ name, vorhanden: pfade.has(jsonPfad(name)) }));
    },

    async werkstattJson(repo) {
      const z = await zugriff(repo);
      return z ? werkstattJsonLesen(z) : null;
    },
  };
}
