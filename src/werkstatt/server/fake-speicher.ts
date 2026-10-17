// Speicher im Arbeitsspeicher für Tests und den lokalen Dev-Server – dieselben Regeln wie der GitHub-Speicher (spec §3.3):
// basisSha = Git-Blob-SHA von mappe/<name>.json, Konflikt nur pro Artefakt, ein Speichern = ein Commit.
// Nur bei NODE_ENV ∈ {development, test}.
import { kohorte as kohorteNachId } from '../kohorten/index.js';
import { ARTEFAKT_NAMEN, type ArtefaktName } from '../schemas/index.js';
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
};

const jsonPfad = (name: ArtefaktName) => `mappe/${name}.json`;

export function fakeSpeicher(): FakeSpeicher {
  if (!istLokal(process.env)) throw new Error('fakeSpeicher nur bei NODE_ENV development oder test');
  const repos = new Map<string, { dateien: Map<string, string>; commits: FakeCommit[] }>();

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
      repos.set(repo, { dateien, commits: [] });
      return { repo };
    },

    async lesen(repo, name) {
      const inhalt = repos.get(repo)?.dateien.get(jsonPfad(name));
      if (inhalt === undefined) return { daten: null, basisSha: null };
      return { daten: jsonAusRepo(jsonPfad(name), inhalt), basisSha: blobSha(inhalt) };
    },

    async speichern(repo, name, dateien, basisSha, autor, nachricht) {
      const r = repoHolen(repo);
      const neu = dateien[jsonPfad(name)];
      if (neu === undefined) throw internerFehler(`speichern ohne ${jsonPfad(name)}`);
      if (shaVon(r.dateien, name) !== basisSha) return { konflikt: true };
      for (const [pfad, inhalt] of Object.entries(dateien)) r.dateien.set(pfad, inhalt);
      r.commits.push({ dateien: { ...dateien }, autor: { ...autor }, nachricht });
      return { basisSha: blobSha(neu), commitUrl: `https://github.invalid/fake/${repo}/commit/${r.commits.length}` };
    },

    async uebersicht(repo) {
      const r = repoHolen(repo);
      return ARTEFAKT_NAMEN.map((name) => ({ name, vorhanden: r.dateien.has(jsonPfad(name)) }));
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
