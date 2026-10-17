// Wer darf in welche Kohorte? Liste kommt aus der Umgebungsvariable WERKSTATT_ZUGANG, nie aus dem Repo.
import type { Kohorte } from './kohorten/typen.js';

export type Rolle = 'studierende' | 'lehrende';

export interface Zugang {
  [kohorte: string]: { lehrende: number[]; studierende: { githubId: number; kuerzel: string }[] };
}

export interface Mitgliedschaft {
  kohorte: string;
  rolle: Rolle;
  kuerzel: string | null;
}

// Kürzel landet im Repo-Namen: klein, ohne Pfadzeichen, 2 bis 21 Zeichen.
const KUERZEL = /^[a-z][a-z0-9-]{1,20}$/;

const FEHLER = 'WERKSTATT_ZUGANG ungültig';

function istGithubId(x: unknown): x is number {
  return typeof x === 'number' && Number.isSafeInteger(x) && x > 0;
}

export function zugangLesen(roh: string | undefined): Zugang {
  if (!roh) throw new Error(FEHLER);
  let daten: unknown;
  try {
    daten = JSON.parse(roh);
  } catch {
    throw new Error(FEHLER);
  }
  if (typeof daten !== 'object' || daten === null || Array.isArray(daten)) throw new Error(FEHLER);

  const zugang: Zugang = Object.create(null);
  for (const [id, eintrag] of Object.entries(daten)) {
    if (typeof eintrag !== 'object' || eintrag === null) throw new Error(FEHLER);
    const { lehrende, studierende } = eintrag as { lehrende?: unknown; studierende?: unknown };
    if (!Array.isArray(lehrende) || !lehrende.every(istGithubId)) throw new Error(FEHLER);
    if (!Array.isArray(studierende)) throw new Error(FEHLER);

    const gesehen = new Set<string>();
    // Jede GitHub-ID höchstens einmal je Kohorte, sonst ist die Rolle mehrdeutig.
    const ids = new Set<number>(lehrende);
    if (ids.size !== lehrende.length) throw new Error(FEHLER);
    for (const s of studierende) {
      if (typeof s !== 'object' || s === null) throw new Error(FEHLER);
      const { githubId, kuerzel } = s as { githubId?: unknown; kuerzel?: unknown };
      if (!istGithubId(githubId) || typeof kuerzel !== 'string' || !KUERZEL.test(kuerzel)) throw new Error(FEHLER);
      if (gesehen.has(kuerzel) || ids.has(githubId)) throw new Error(FEHLER);
      ids.add(githubId);
      gesehen.add(kuerzel);
    }
    zugang[id] = { lehrende, studierende: studierende as Zugang[string]['studierende'] };
  }
  return zugang;
}

// Nur aktive Kohorten, neueste zuerst. Lehrende haben kein Kürzel.
export function mitgliedschaften(z: Zugang, githubId: number, kohorten: readonly Kohorte[]): Mitgliedschaft[] {
  const treffer: Mitgliedschaft[] = [];
  for (const k of [...kohorten].filter((k) => k.status === 'aktiv').sort((a, b) => (a.id < b.id ? 1 : a.id > b.id ? -1 : 0))) {
    const eintrag = z[k.id];
    if (!eintrag) continue;
    if (eintrag.lehrende.includes(githubId)) treffer.push({ kohorte: k.id, rolle: 'lehrende', kuerzel: null });
    const s = eintrag.studierende.find((s) => s.githubId === githubId);
    if (s) treffer.push({ kohorte: k.id, rolle: 'studierende', kuerzel: s.kuerzel });
  }
  return treffer;
}

export function repoName(m: Mitgliedschaft): string {
  if (!m.kuerzel) throw new Error('Mitgliedschaft ohne Kürzel hat kein Repo');
  return `${m.kohorte}-${m.kuerzel}`;
}
