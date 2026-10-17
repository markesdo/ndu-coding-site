import { afterEach, describe, expect, it, vi } from 'vitest';
import { fakeSpeicher } from './fake-speicher';
import type { Mitgliedschaft } from '../zugang';
import { kohorteTest } from '../kohorten/test';

const sofie: Mitgliedschaft = { kohorte: 'test', rolle: 'studierende', kuerzel: 'sofie' };
const autor = { name: 'sofie', email: '8+sofie@users.noreply.github.com' };

function dateien(name: string, daten: unknown): Record<string, string> {
  return { [`mappe/${name}.json`]: JSON.stringify(daten), [`mappe/${name}.md`]: `# ${name}`, 'README.md': '# Mappe' };
}

async function mitRepo() {
  const s = fakeSpeicher();
  const { repo } = await s.anlegen(sofie, 8);
  return { s, repo };
}

describe('fakeSpeicher', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('anlegen: Repo-Name aus der Mitgliedschaft, werkstatt.json mit Kohorte, GitHub-ID und Schema-Versionen der Kohorte', async () => {
    const { s, repo } = await mitRepo();
    expect(repo).toBe('test-sofie');
    expect(await s.werkstattJson(repo)).toStrictEqual({ kohorte: 'test', githubId: 8, schemaVersionen: [...kohorteTest.artefakte] });
    expect(await s.werkstattJson('test-niemand')).toBeNull();
  });

  it('lesezugriff: erst eingeladen, nach einladungAnnehmen aktiv; ungültiger Login und unbekanntes Repo werfen', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { s, repo } = await mitRepo();
    expect(await s.lesezugriff(repo, 'Probe-Login')).toBe('eingeladen');
    s.einladungAnnehmen(repo, 'probe-login');
    expect(await s.lesezugriff(repo, 'probe-login')).toBe('aktiv');
    await expect(s.lesezugriff(repo, '../x')).rejects.toMatchObject({ status: 500 });
    await expect(s.lesezugriff('test-niemand', 'probe-login')).rejects.toMatchObject({ status: 404 });
  });

  it('anlegen zweimal: ein Repo, Gespeichertes bleibt', async () => {
    const { s, repo } = await mitRepo();
    const erst = await s.speichern(repo, 'brief', dateien('brief', { a: 1 }), null, autor, 'Brief: neu');
    if (!('basisSha' in erst)) throw new Error('erster Commit erwartet');
    expect(await s.anlegen(sofie, 8)).toEqual({ repo });
    expect(s.commits(repo)).toHaveLength(1);
    const gelesen = await s.lesen(repo, 'brief');
    expect(gelesen.daten).toEqual({ a: 1 });
    expect(gelesen.basisSha).toBe(erst.basisSha);
  });

  it('anlegen für ein Repo, das einer anderen Person gehört, wirft', async () => {
    const { s } = await mitRepo();
    // Wie githubSpeicher: 403 nicht-freigeschaltet.
    await expect(s.anlegen(sofie, 9)).rejects.toMatchObject({ status: 403, code: 'nicht-freigeschaltet' });
  });

  it('lesen ohne Datei: daten und basisSha null', async () => {
    const { s, repo } = await mitRepo();
    expect(await s.lesen(repo, 'annahmen')).toEqual({ daten: null, basisSha: null });
  });

  it('speichern: ein Commit mit allen Dateien, Autor und Nachricht; basisSha = Blob-SHA der JSON-Datei', async () => {
    const { s, repo } = await mitRepo();
    const r = await s.speichern(repo, 'brief', { 'mappe/brief.json': 'hello\n', 'README.md': '# x' }, null, autor, 'Brief: neu');
    // Git-Blob-SHA von "hello\n" – wie GitHub ihn liefert.
    expect(r).toEqual({ basisSha: 'ce013625030ba8dba906f756967f9e9ca394464a', commitUrl: expect.stringContaining(repo) });
    expect(s.commits(repo)).toEqual([{ dateien: { 'mappe/brief.json': 'hello\n', 'README.md': '# x' }, autor, nachricht: 'Brief: neu' }]);
  });

  it('veralteter basisSha: konflikt und kein Commit', async () => {
    const { s, repo } = await mitRepo();
    const r = await s.speichern(repo, 'annahmen', dateien('annahmen', { v: 1 }), null, autor, 'Annahmen: neu');
    if (!('basisSha' in r)) throw new Error('erster Commit erwartet');
    s.aendernVonAussen(repo, 'annahmen');
    const zweit = await s.speichern(repo, 'annahmen', dateien('annahmen', { v: 2 }), r.basisSha, autor, 'Annahmen: geändert');
    expect(zweit).toEqual({ konflikt: true });
    expect(s.commits(repo)).toHaveLength(1);
    expect((await s.lesen(repo, 'annahmen')).basisSha).not.toBe(r.basisSha);
  });

  it('basisSha null, obwohl die Datei schon existiert: konflikt', async () => {
    const { s, repo } = await mitRepo();
    await s.speichern(repo, 'brief', dateien('brief', { v: 1 }), null, autor, 'Brief: neu');
    expect(await s.speichern(repo, 'brief', dateien('brief', { v: 2 }), null, autor, 'Brief: zweiter Tab')).toEqual({ konflikt: true });
    expect(s.commits(repo)).toHaveLength(1);
  });

  it('zwei verschiedene Artefakte mit je eigenem basisSha: zwei Commits', async () => {
    const { s, repo } = await mitRepo();
    // Beide Tabs laden zuerst, dann speichern sie nacheinander.
    const briefSha = (await s.lesen(repo, 'brief')).basisSha;
    const annahmenSha = (await s.lesen(repo, 'annahmen')).basisSha;
    const a = await s.speichern(repo, 'brief', dateien('brief', { b: 1 }), briefSha, autor, 'Brief: neu');
    const b = await s.speichern(repo, 'annahmen', dateien('annahmen', { a: 1 }), annahmenSha, autor, 'Annahmen: neu');
    expect('basisSha' in a && 'basisSha' in b).toBe(true);
    expect(s.commits(repo).map((c) => c.nachricht)).toEqual(['Brief: neu', 'Annahmen: neu']);
  });

  it('passender basisSha nach eigenem Speichern: kein Konflikt', async () => {
    const { s, repo } = await mitRepo();
    const r = await s.speichern(repo, 'brief', dateien('brief', { v: 1 }), null, autor, 'Brief: neu');
    if (!('basisSha' in r)) throw new Error('erster Commit erwartet');
    const zweit = await s.speichern(repo, 'brief', dateien('brief', { v: 2 }), r.basisSha, autor, 'Brief: weiter');
    expect('basisSha' in zweit && zweit.basisSha).not.toBe(r.basisSha);
    expect((await s.lesen(repo, 'brief')).daten).toEqual({ v: 2 });
  });

  it('speichern mit readme: README aus dem Stand beim Commit, dieses Artefakt eingeschlossen', async () => {
    const { s, repo } = await mitRepo();
    await s.speichern(repo, 'brief', dateien('brief', { a: 1 }), null, autor, 'Brief: neu');
    const d = dateien('annahmen', { annahmen: [] });
    delete d['README.md'];
    await s.speichern(repo, 'annahmen', d, null, autor, 'Annahmen: neu', (v) => v.filter((x) => x.vorhanden).map((x) => x.name).join(','));
    expect(s.commits(repo)[1].dateien['README.md']).toBe('brief,annahmen');
  });

  it('uebersicht: alle Artefakte mit vorhanden', async () => {
    const { s, repo } = await mitRepo();
    await s.speichern(repo, 'leitfaden', dateien('leitfaden', {}), null, autor, 'Leitfaden: neu');
    expect(await s.uebersicht(repo)).toEqual([
      { name: 'brief', vorhanden: false },
      { name: 'entscheidungen', vorhanden: false },
      { name: 'leitfaden', vorhanden: true },
      { name: 'annahmen', vorhanden: false },
    ]);
  });

  it('speichern oder uebersicht für ein Repo, das es nicht gibt → 404 unbekannt wie githubSpeicher', async () => {
    const s = fakeSpeicher();
    await expect(s.speichern('test-niemand', 'brief', dateien('brief', {}), null, autor, 'x')).rejects.toMatchObject({ status: 404, code: 'unbekannt' });
    await expect(s.uebersicht('test-niemand')).rejects.toMatchObject({ status: 404, code: 'unbekannt' });
  });

  it('speichern ohne die JSON-Datei → 500 unbekannt mit Log wie githubSpeicher', async () => {
    const { s, repo } = await mitRepo();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(s.speichern(repo, 'brief', { 'README.md': '#' }, null, autor, 'x')).rejects.toMatchObject({ status: 500, code: 'unbekannt' });
    expect(log.mock.calls.join(' ')).toContain('mappe/brief.json');
    log.mockRestore();
  });

  it('verweigert außerhalb von development und test', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => fakeSpeicher()).toThrow();
  });
});
