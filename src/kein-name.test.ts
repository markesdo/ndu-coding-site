import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Das Repo ist öffentlich: Vornamen und Kürzel der Studierenden stehen in keiner Datei des Repos (außer docs/) – nicht
// in Seiten, Begleiter-Notizen, Code, Tests oder Dateinamen. Frames je Person heißen hier „Produkt 1/2/3“
// (miro-frames.ts), Testpersonen der Werkstatt sind erfunden.
//
// Die Namensliste steht bewusst nicht im Repo (auch nicht als Hash – Vornamen ließen sich per Wörterbuch zurückrechnen).
// Gesucht wird in dieser Reihenfolge:
//   1. Umgebungsvariable NAMEN_WAECHTER (kommagetrennt), z. B. als Secret in CI; leer oder nur Trenner zählt als nicht gesetzt;
//   2. .namen-waechter.local im Wurzelverzeichnis dieses Checkouts (steht in .gitignore);
//   3. namen-waechter.local im gemeinsamen Git-Verzeichnis (`git rev-parse --git-common-dir`, meist .git/) – gilt für den
//      Haupt-Checkout und alle Worktrees zugleich und wird nie committet.
// Dateien: ein Wort pro Zeile, # für Kommentare. Fehlt die Liste, wird die Prüfung lokal übersprungen (sichtbar als
// „skipped“); in CI (CI=true oder CI=1) schlägt sie fehl, damit sie dort nicht still ausfällt.
const WURZEL = fileURLToPath(new URL('..', import.meta.url));

function gemeinsamesGitVerzeichnis(): string | null {
  try {
    return resolve(WURZEL, execFileSync('git', ['rev-parse', '--git-common-dir'], { cwd: WURZEL, encoding: 'utf8' }).trim());
  } catch {
    return null;
  }
}

function namenLaden(
  env: string | undefined,
  wurzel: string,
  gitVerzeichnis: () => string | null,
): { namen: string[]; quelle: string | null } {
  const woerter = (roh: string[]) => [...new Set(roh.map((w) => w.trim().toLowerCase()).filter(Boolean))];
  const ausDatei = (p: string) => woerter(readFileSync(p, 'utf8').split('\n').filter((z) => !z.trim().startsWith('#')));
  const ausEnv = woerter((env ?? '').split(','));
  if (ausEnv.length > 0) return { namen: ausEnv, quelle: 'NAMEN_WAECHTER' };
  const lokal = join(wurzel, '.namen-waechter.local');
  if (existsSync(lokal)) return { namen: ausDatei(lokal), quelle: lokal };
  const git = gitVerzeichnis();
  const geteilt = git && join(git, 'namen-waechter.local');
  if (geteilt && existsSync(geteilt)) return { namen: ausDatei(geteilt), quelle: geteilt };
  return { namen: [], quelle: null };
}

const inCi = (wert: string | undefined) => ['true', '1'].includes((wert ?? '').trim().toLowerCase());

const { namen: NAMEN } = namenLaden(process.env.NAMEN_WAECHTER, WURZEL, gemeinsamesGitVerzeichnis);
const IN_CI = inCi(process.env.CI);

// Ab dieser Länge zählt ein Name auch als Teil eines Worts („…thon“, „…Canvas“); kürzere nur als ganzes Wort, sonst
// träfe ein Kürzel aus vier Buchstaben gewöhnliche Wörter.
const TEILWORT_AB = 5;

// Literaturangaben, die im Kurs zitiert werden (Torres, Ziel-Chance): Sie meinen niemanden aus dem Kurs. Nur genau diese
// Angaben sind ausgenommen; eine neue Quelle kommt bewusst hier dazu.
const ZITATE: readonly string[] = ['Chen et al. (2007)'];

// Die Liste häufiger Vornamen der Eigennamen-Prüfung meint niemanden, sondern löst den Hinweis „Vorname“ in
// Interview-Texten aus. Nur dieses Array ist ausgenommen, der Rest der Datei wird geprüft. Sein Inhalt ist festgenagelt
// (SHA-256 der sortierten Namen, kommagetrennt): Kommt ein Name dazu, muss das hier bewusst nachgezogen werden – sonst
// rutschte ein Name aus der Kohorte still in die Ausnahme.
const VORNAMEN_DATEI = 'src/werkstatt/eigennamen.ts';
const VORNAMEN_ARRAY = /const VORNAMEN = \[[^\]]*\];/;
const VORNAMEN_HASH = '579ea250dccd165c4c8e4b9fa6a4fce67e72638b6f2c3284f12c20066d601c9e';

const hash = (w: string) => createHash('sha256').update(w).digest('hex');
const vornamenHash = (array: string) => hash([...array.matchAll(/'([^']+)'/g)].map((m) => m[1]).sort().join(','));

// Alle Dateien des Repos: getrackte und neue, noch nicht ignorierte (damit ein Name vor dem Commit auffällt); docs/ nicht
// (Planungsnotizen, bekannte Grenze). Ohne Git schlägt das fehl, statt still nichts zu prüfen. Nur reguläre Dateien: Ein
// ungetrackter Symlink auf ein Verzeichnis (etwa node_modules → Haupt-Checkout in einem Worktree) ließe readFileSync
// mit EISDIR scheitern.
function repoDateien(wurzel: string = WURZEL): string[] {
  const roh = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: wurzel, encoding: 'utf8' });
  return [...new Set(roh.split('\0').filter(Boolean))].filter((p) => {
    if (p.startsWith('docs/')) return false;
    try { return statSync(join(wurzel, p)).isFile(); } catch { return false; }
  });
}

// Wörter aus Buchstaben, zusätzlich an camelCase-Grenzen getrennt („mapeName“, „HTMLParser“ → „HTML“, „Parser“);
// „Annas“ zählt auch als „anna“ (Genitiv).
function verboteneWoerter(text: string, namen: readonly string[], zitate: readonly string[] = ZITATE): string[] {
  const ganz = new Set(namen);
  const teil = namen.filter((n) => n.length >= TEILWORT_AB);
  const funde = new Set<string>();
  const ohneZitate = zitate.reduce((t, z) => t.split(z).join(''), text);
  for (const [wort] of ohneZitate.matchAll(/\p{L}+/gu)) {
    for (const stueck of [wort, ...wort.split(/(?<=\p{Ll})(?=\p{Lu})|(?<=\p{Lu})(?=\p{Lu}\p{Ll})/u)]) {
      const klein = stueck.toLowerCase();
      const varianten = klein.endsWith('s') ? [klein, klein.slice(0, -1)] : [klein];
      if (varianten.some((w) => ganz.has(w)) || teil.some((n) => klein.includes(n))) funde.add(stueck);
    }
  }
  return [...funde];
}

describe('keine Namen von Studierenden im öffentlichen Repo', () => {
  it('der Wächter erkennt ein Wort aus der Liste: Genitiv, camelCase, Großschreibung, Teilwort', () => {
    const probe = ['probewort', 'kurz'];
    expect(verboteneWoerter('Feedback an Probewort und mädchen', probe)).toStrictEqual(['Probewort']);
    expect(verboteneWoerter('Probeworts Baum', probe)).toStrictEqual(['Probeworts']);
    expect(verboteneWoerter("const baumProbewort = 'test-probewort';", probe)).toStrictEqual(['baumProbewort', 'Probewort', 'probewort']);
    expect(verboteneWoerter('PROBEWORTCanvas', probe)).toStrictEqual(['PROBEWORTCanvas', 'PROBEWORT']);
    expect(verboteneWoerter('probewortthon', probe)).toStrictEqual(['probewortthon']);
    // Kurze Namen nur als ganzes Wort.
    expect(verboteneWoerter('Kurzfassung', probe)).toStrictEqual([]);
    expect(verboteneWoerter('Kurz notiert', probe)).toStrictEqual(['Kurz']);
    // Literaturangabe nur genau wie in der Liste der Zitate.
    const zitate = ['Probewort et al. (2007)'];
    expect(verboteneWoerter('Torres nennt Probewort et al. (2007).', probe, zitate)).toStrictEqual([]);
    expect(verboteneWoerter('Probewort et al. (2008)', probe, zitate)).toStrictEqual(['Probewort']);
    expect(verboteneWoerter('Probewort et al. sagt', probe, zitate)).toStrictEqual(['Probewort']);
    expect(verboteneWoerter('Probewort et al. (2007)', probe, [])).toStrictEqual(['Probewort']);
  });

  it('die Namensliste kommt aus Env, dann aus dem Checkout, dann aus dem gemeinsamen Git-Verzeichnis', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'namen-waechter-'));
    try {
      const checkout = join(tmp, 'worktree');
      const git = join(tmp, 'git');
      mkdirSync(checkout);
      mkdirSync(git);
      const gitDir = () => git;
      expect(namenLaden(undefined, checkout, gitDir)).toStrictEqual({ namen: [], quelle: null });
      expect(namenLaden(undefined, checkout, () => null)).toStrictEqual({ namen: [], quelle: null });
      writeFileSync(join(git, 'namen-waechter.local'), '# Kommentar\nGeteilt\n\nzwei\n');
      expect(namenLaden(undefined, checkout, gitDir)).toStrictEqual({ namen: ['geteilt', 'zwei'], quelle: join(git, 'namen-waechter.local') });
      writeFileSync(join(checkout, '.namen-waechter.local'), 'lokal\n');
      expect(namenLaden(undefined, checkout, gitDir).namen).toStrictEqual(['lokal']);
      expect(namenLaden(' Env , zwei,env', checkout, gitDir).namen).toStrictEqual(['env', 'zwei']);
      // Leer oder nur Trenner: wie nicht gesetzt, die Dateien gelten.
      expect(namenLaden('', checkout, gitDir).namen).toStrictEqual(['lokal']);
      expect(namenLaden(' , ,', checkout, gitDir).namen).toStrictEqual(['lokal']);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('repoDateien liest nur reguläre Dateien: ein ungetrackter Symlink auf ein Verzeichnis bleibt draußen', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'namen-waechter-repo-'));
    try {
      execFileSync('git', ['init', '-q'], { cwd: tmp });
      writeFileSync(join(tmp, 'a.txt'), 'a\n');
      mkdirSync(join(tmp, 'docs'));
      writeFileSync(join(tmp, 'docs', 'notiz.md'), 'n\n');
      const ziel = mkdtempSync(join(tmpdir(), 'namen-waechter-ziel-'));
      try {
        symlinkSync(ziel, join(tmp, 'verzeichnis-link'));
        symlinkSync(join(tmp, 'a.txt'), join(tmp, 'datei-link'));
        expect(repoDateien(tmp).sort()).toStrictEqual(['a.txt', 'datei-link']);
      } finally {
        rmSync(ziel, { recursive: true, force: true });
      }
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('CI zählt nur mit true oder 1 als gesetzt', () => {
    expect(['true', 'TRUE', '1'].map(inCi)).toStrictEqual([true, true, true]);
    expect([undefined, '', '0', 'false', 'no'].map(inCi)).toStrictEqual([false, false, false, false, false]);
  });

  it('die Ausnahme für die Vornamensliste der Eigennamen-Prüfung ist festgenagelt', () => {
    const array = VORNAMEN_ARRAY.exec(readFileSync(join(WURZEL, VORNAMEN_DATEI), 'utf8'))?.[0];
    expect(array, `${VORNAMEN_DATEI}: VORNAMEN fehlt`).toBeTruthy();
    expect(vornamenHash(array!), 'VORNAMEN geändert: prüfen, dass kein Name aus der Kohorte dazukam, dann VORNAMEN_HASH nachziehen').toBe(VORNAMEN_HASH);
  });

  it.skipIf(NAMEN.length === 0 && !IN_CI)('kein Name und kein Kürzel in den Dateien des Repos (außer docs/), Inhalt und Dateiname', () => {
    expect(NAMEN, 'keine Namensliste: NAMEN_WAECHTER, .namen-waechter.local oder <git-common-dir>/namen-waechter.local').not.toStrictEqual([]);
    const funde: string[] = [];
    const alle = repoDateien();
    expect(alle.length).toBeGreaterThan(500);
    expect(alle).toContain('src/kein-name.test.ts');
    expect(alle).toContain('README.md');
    for (const rel of alle) {
      const inhalt = readFileSync(join(WURZEL, rel));
      // Bilder und andere Binärdateien: nur der Dateiname.
      let text = inhalt.includes(0) ? rel : `${rel}\n${inhalt.toString('utf8')}`;
      if (rel === VORNAMEN_DATEI) text = text.replace(VORNAMEN_ARRAY, '');
      for (const wort of verboteneWoerter(text, NAMEN)) funde.push(`${rel}: ${wort}`);
    }
    expect(funde).toStrictEqual([]);
  });
});
