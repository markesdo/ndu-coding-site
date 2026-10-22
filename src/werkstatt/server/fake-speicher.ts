// Speicher im Arbeitsspeicher für Tests und den lokalen Dev-Server – dieselben Regeln wie der GitHub-Speicher (spec §3.3):
// basisSha = Git-Blob-SHA von mappe/<name>.json, Konflikt nur pro Artefakt, ein Speichern = ein Commit.
// Nur bei NODE_ENV ∈ {development, test}.
import { kohorte as kohorteNachId } from '../kohorten/index.js';
import { ARTEFAKT_NAMEN, type ArtefaktName } from '../schemas/index.js';
import { VERLAUF_HOECHSTENS } from '../vertrag.js';
import { repoName } from '../zugang.js';
import { blobSha } from './git-sha.js';
import { fremdesRepo, internerFehler, jsonAusRepo, unbekanntesRepo } from './speicher-fehler.js';
import type { Speicher } from './typen.js';
import { istLokal } from './umgebung.js';

export interface FakeCommit {
  dateien: Record<string, string>;
  autor: { name: string; email: string };
  nachricht: string;
}

export type FakeSpeicher = Speicher & {
  // Nur Commits aus speichern(); anlegen und aendernVonAussen zählen nicht.
  commits(repo: string): FakeCommit[];
  // Wie eine Änderung direkt auf GitHub: ändert mappe/<name>.json, damit ein vorher gelesener basisSha veraltet.
  aendernVonAussen(repo: string, name: ArtefaktName): void;
  // Die Person nimmt die Einladung an: lesezugriff meldet danach 'aktiv'.
  // Wirft ohne vorherige Einladung (wie fakeGithub).
  einladungAnnehmen(repo: string, githubId: number): void;
};

const jsonPfad = (name: ArtefaktName) => `mappe/${name}.json`;

// jetzt: Uhr für die Zeitpunkte der Commits (verlauf); Standard Date.now.
export function fakeSpeicher(opts: { jetzt?: () => number } = {}): FakeSpeicher {
  if (!istLokal(process.env)) throw new Error('fakeSpeicher nur bei NODE_ENV development oder test');
  const jetzt = opts.jetzt ?? (() => Date.now());
  // Schlüssel `${repo}:${githubId}`.
  const lesende = new Map<string, 'aktiv' | 'eingeladen'>();
  // zeiten[i] gehört zu commits[i] (ISO); getrennt, damit commits() unverändert bleibt.
  const repos = new Map<string, { dateien: Map<string, string>; commits: FakeCommit[]; zeiten: string[] }>();

  const repoHolen = (repo: string) => {
    const r = repos.get(repo);
    if (!r) throw unbekanntesRepo();
    return r;
  };
  const shaVon = (dateien: Map<string, string>, name: ArtefaktName) => {
    const inhalt = dateien.get(jsonPfad(name));
    return inhalt === undefined ? null : blobSha(inhalt);
  };

  return {
    async anlegen(m, githubId) {
      const repo = repoName(m);
      const vorhanden = repos.get(repo);
      if (vorhanden) {
        const wj = JSON.parse(vorhanden.dateien.get('werkstatt.json') ?? 'null') as { githubId: number } | null;
        if (wj && wj.githubId !== githubId) throw fremdesRepo();
        return { repo };
      }
      const k = kohorteNachId(m.kohorte);
      if (!k) throw internerFehler(`anlegen: unbekannte Kohorte ${m.kohorte}`);
      const dateien = new Map([['werkstatt.json', `${JSON.stringify({ kohorte: m.kohorte, githubId, schemaVersionen: k.artefakte }, null, 2)}\n`]]);
      repos.set(repo, { dateien, commits: [], zeiten: [] });
      return { repo };
    },

    async lesen(repo, name) {
      const inhalt = repos.get(repo)?.dateien.get(jsonPfad(name));
      if (inhalt === undefined) return { daten: null, basisSha: null };
      return { daten: jsonAusRepo(jsonPfad(name), inhalt), basisSha: blobSha(inhalt) };
    },

    async speichern(repo, name, dateien, basisSha, autor, nachricht, readme) {
      const r = repoHolen(repo);
      const neu = dateien[jsonPfad(name)];
      if (neu === undefined) throw internerFehler(`speichern ohne ${jsonPfad(name)}`);
      if (shaVon(r.dateien, name) !== basisSha) return { konflikt: true };
      const alle = { ...dateien };
      // README aus dem Stand, auf dem dieser Commit landet (wie githubSpeicher pro Versuch).
      if (readme) alle['README.md'] = readme(ARTEFAKT_NAMEN.map((n) => ({ name: n, vorhanden: n === name || r.dateien.has(jsonPfad(n)) })));
      for (const [pfad, inhalt] of Object.entries(alle)) r.dateien.set(pfad, inhalt);
      r.commits.push({ dateien: alle, autor: { ...autor }, nachricht });
      r.zeiten.push(new Date(jetzt()).toISOString());
      return { basisSha: blobSha(neu), commitUrl: `https://github.invalid/fake/${repo}/commit/${r.commits.length}` };
    },

    async uebersicht(repo) {
      const r = repoHolen(repo);
      return ARTEFAKT_NAMEN.map((name) => ({ name, vorhanden: r.dateien.has(jsonPfad(name)) }));
    },

    // Wie githubSpeicher, aber nur Commits aus speichern(), die mappe/<name>.json schreiben, neueste zuerst.
    async verlauf(repo, name) {
      const r = repos.get(repo);
      if (!r) return { zeitpunkte: [], vollstaendig: true };
      const zeitpunkte = r.zeiten.filter((_, i) => jsonPfad(name) in r.commits[i].dateien).reverse().slice(0, VERLAUF_HOECHSTENS);
      // Wie bei GitHub: eine volle Seite heißt „vielleicht gibt es ältere“.
      return { zeitpunkte, vollstaendig: zeitpunkte.length < VERLAUF_HOECHSTENS };
    },

    async lesezugriff(repo, githubId) {
      if (!Number.isSafeInteger(githubId) || githubId <= 0) throw internerFehler('lesezugriff: ungültige GitHub-ID');
      repoHolen(repo);
      const schluessel = `${repo}:${githubId}`;
      const stand = lesende.get(schluessel) ?? 'eingeladen';
      lesende.set(schluessel, stand);
      return stand;
    },

    einladungAnnehmen(repo, githubId) {
      const schluessel = `${repo}:${githubId}`;
      if (!lesende.has(schluessel)) throw new Error(`einladung-fehlt: ${repo} ${githubId}`);
      lesende.set(schluessel, 'aktiv');
    },

    async werkstattJson(repo) {
      const inhalt = repos.get(repo)?.dateien.get('werkstatt.json');
      return inhalt === undefined ? null : (JSON.parse(inhalt) as { kohorte: string; githubId: number });
    },

    commits(repo) {
      return [...(repos.get(repo)?.commits ?? [])];
    },

    aendernVonAussen(repo, name) {
      const r = repoHolen(repo);
      const alt = r.dateien.get(jsonPfad(name));
      r.dateien.set(jsonPfad(name), alt === undefined ? '{}\n' : `${alt}\n`);
    },
  };
}
