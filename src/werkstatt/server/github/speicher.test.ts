// githubSpeicher gegen die fetch-Attrappe fakeGithub: die echte Implementierung läuft, nur GitHub ist nachgebaut.
import { createHash, generateKeyPairSync } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { kohorte2026 } from '../../kohorten/2026';
import type { Mitgliedschaft } from '../../zugang';
import { mapCache } from '../cache';
import { botIdentitaetGeber, installationTokenGeber } from './app-token';
import { fakeGithub } from './fake-github';
import { githubSpeicher } from './speicher';

const { privateKey: PEM } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

// Keine echten GitHub-IDs von Studierenden (Repo ist öffentlich).
const sofie: Mitgliedschaft = { kohorte: '2026', rolle: 'studierende', kuerzel: 'sofie' };
const autor = { name: 'sofiethon', email: '1001+sofiethon@users.noreply.github.com' };
const BOT = { name: 'ndu-werkstatt[bot]', email: '4242+ndu-werkstatt[bot]@users.noreply.github.com' };

function blobSha(inhalt: string): string {
  const bytes = Buffer.from(inhalt, 'utf8');
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}

function dateien(name: string, daten: unknown): Record<string, string> {
  return {
    [`mappe/${name}.json`]: `${JSON.stringify(daten, null, 2)}\n`,
    [`mappe/${name}.md`]: `# ${name}\n`,
    'README.md': `# Mappe (${name})\n`,
  };
}

function aufbau() {
  const gh = fakeGithub({ org: kohorte2026.org });
  gh.zustand.vorlageAnlegen(kohorte2026.vorlage, { 'README.md': '# Vorlage\n', 'AGENTS.md': '# Agenten\n' });
  const uhr = { ms: 1_800_000_000_000 };
  const cache = mapCache(() => uhr.ms);
  const app = { fetch: gh.fetch, cache, jetzt: () => uhr.ms, schluessel: () => ({ appId: '123456', privateKeyPem: PEM }) };
  const schlafen = vi.fn(async (ms: number) => {
    uhr.ms += ms;
  });
  const s = githubSpeicher({
    fetch: gh.fetch,
    cache,
    token: installationTokenGeber(app),
    bot: botIdentitaetGeber(app),
    kohorte: kohorte2026,
    schlafen,
    jetzt: () => uhr.ms,
  });
  return { gh, s, schlafen };
}

async function mitRepo() {
  const a = aufbau();
  const { repo } = await a.s.anlegen(sofie, 1001);
  return { ...a, repo };
}

describe('githubSpeicher.speichern', () => {
  it('speichern schreibt einen commit mit drei dateien', async () => {
    const { gh, s, repo } = await mitRepo();
    const vorher = gh.zustand.kopf(repo)!;
    const d = dateien('brief', { produkt: 'Leihbar' });
    const erg = await s.speichern(repo, 'brief', d, null, autor, 'Brief: Produkt eingetragen');
    if (!('basisSha' in erg)) throw new Error('Commit erwartet');

    const commitAufrufe = gh.zustand.aufrufeVon('POST', '/git/commits');
    expect(commitAufrufe).toHaveLength(1);
    const kopf = gh.zustand.kopf(repo)!;
    const c = gh.zustand.commit(repo, kopf);
    expect(c.parents).toStrictEqual([vorher]);
    expect(c.message).toBe('Brief: Produkt eingetragen');
    expect(c.author).toStrictEqual(autor);
    expect(c.author!.email).toBe('1001+sofiethon@users.noreply.github.com');
    expect(c.committer).toStrictEqual(BOT);

    // Alle drei Dateien im Kopf, Vorlage und werkstatt.json bleiben.
    const imKopf = gh.zustand.dateien(repo);
    for (const [pfad, inhalt] of Object.entries(d)) expect(imKopf[pfad], pfad).toBe(inhalt);
    expect(imKopf['AGENTS.md']).toBe('# Agenten\n');
    expect(JSON.parse(imKopf['werkstatt.json'])).toStrictEqual({ kohorte: '2026', githubId: 1001 });

    expect(erg.basisSha).toBe(blobSha(d['mappe/brief.json']));
    expect(erg.commitUrl).toBe(`https://github.com/ndu-innolab/${repo}/commit/${kopf}`);
    expect(await s.lesen(repo, 'brief')).toStrictEqual({ daten: { produkt: 'Leihbar' }, basisSha: erg.basisSha });
  });

  it('speichern mit dem pro Repo eingeschränkten Token (contents: write)', async () => {
    const { gh, s, repo } = await mitRepo();
    await s.speichern(repo, 'brief', dateien('brief', { a: 1 }), null, autor, 'Brief: neu');
    const [patch] = gh.zustand.aufrufeVon('PATCH', '/git/refs/heads/main');
    expect(patch.body).toStrictEqual({ sha: gh.zustand.kopf(repo), force: false });
    const umfang = gh.zustand.tokens.get(patch.token!);
    expect(umfang).toStrictEqual({ permissions: { contents: 'write' }, repositoryIds: [gh.zustand.repos.get(repo)!.id] });
  });

  it('speichern mit veraltetem basisSha', async () => {
    const { gh, s, repo } = await mitRepo();
    const erst = await s.speichern(repo, 'annahmen', dateien('annahmen', { annahmen: [] }), null, autor, 'Annahmen: neu');
    if (!('basisSha' in erst)) throw new Error('Commit erwartet');
    gh.zustand.aendernVonAussen(repo, 'mappe/annahmen.json', '{"annahmen":[{"id":"A1"}]}\n');
    const kopf = gh.zustand.kopf(repo);
    const commits = gh.zustand.aufrufeVon('POST', '/git/commits').length;

    const erg = await s.speichern(repo, 'annahmen', dateien('annahmen', { annahmen: [{ id: 'A2' }] }), erst.basisSha, autor, 'Annahmen: A2');
    expect(erg).toStrictEqual({ konflikt: true });
    expect(gh.zustand.kopf(repo)).toBe(kopf);
    expect(gh.zustand.aufrufeVon('POST', '/git/commits')).toHaveLength(commits);
    expect(gh.zustand.dateien(repo)['mappe/annahmen.json']).toBe('{"annahmen":[{"id":"A1"}]}\n');
  });

  it('neu (basisSha null), aber die Datei gibt es schon → Konflikt', async () => {
    const { gh, s, repo } = await mitRepo();
    gh.zustand.aendernVonAussen(repo, 'mappe/brief.json', '{}\n');
    expect(await s.speichern(repo, 'brief', dateien('brief', { a: 1 }), null, autor, 'Brief: neu')).toStrictEqual({ konflikt: true });
  });

  it('anderes artefakt blockiert nicht', async () => {
    const { gh, s, repo } = await mitRepo();
    // Zwei Tabs: beide lesen zuerst, dann speichert jeder sein Artefakt.
    const brief = await s.lesen(repo, 'brief');
    const annahmen = await s.lesen(repo, 'annahmen');
    expect(brief).toStrictEqual({ daten: null, basisSha: null });
    const a = await s.speichern(repo, 'brief', dateien('brief', { b: 1 }), brief.basisSha, autor, 'Brief: neu');
    const b = await s.speichern(repo, 'annahmen', dateien('annahmen', { annahmen: [] }), annahmen.basisSha, autor, 'Annahmen: neu');
    expect('basisSha' in a && 'basisSha' in b).toBe(true);
    expect(gh.zustand.aufrufeVon('POST', '/git/commits')).toHaveLength(2);
    const imKopf = gh.zustand.dateien(repo);
    expect(JSON.parse(imKopf['mappe/brief.json'])).toStrictEqual({ b: 1 });
    expect(JSON.parse(imKopf['mappe/annahmen.json'])).toStrictEqual({ annahmen: [] });
  });

  it('wettlauf beim ref-update', async () => {
    const { gh, s, repo } = await mitRepo();
    let einmal = true;
    gh.zustand.vorRefUpdate = (r) => {
      if (!einmal) return;
      einmal = false;
      // Ein anderer Tab speichert zwischen Commit und PATCH ein anderes Artefakt.
      gh.zustand.aendernVonAussen(r, 'mappe/brief.json', '{"von":"tab2"}\n');
    };
    const erg = await s.speichern(repo, 'annahmen', dateien('annahmen', { annahmen: [] }), null, autor, 'Annahmen: neu');
    expect('basisSha' in erg).toBe(true);
    expect(gh.zustand.aufrufeVon('PATCH', '/git/refs/heads/main')).toHaveLength(2);
    const imKopf = gh.zustand.dateien(repo);
    expect(imKopf['mappe/brief.json']).toBe('{"von":"tab2"}\n');
    expect(JSON.parse(imKopf['mappe/annahmen.json'])).toStrictEqual({ annahmen: [] });
    expect(gh.zustand.commit(repo, gh.zustand.kopf(repo)!).message).toBe('Annahmen: neu');
  });

  it('wettlauf zweimal verloren → Konflikt, kein dritter Versuch', async () => {
    const { gh, s, repo } = await mitRepo();
    let n = 0;
    gh.zustand.vorRefUpdate = (r) => gh.zustand.aendernVonAussen(r, 'mappe/brief.json', `{"n":${n++}}\n`);
    const erg = await s.speichern(repo, 'annahmen', dateien('annahmen', { annahmen: [] }), null, autor, 'Annahmen: neu');
    expect(erg).toStrictEqual({ konflikt: true });
    expect(gh.zustand.aufrufeVon('PATCH', '/git/refs/heads/main')).toHaveLength(2);
    expect(gh.zustand.dateien(repo)['mappe/annahmen.json']).toBeUndefined();
  });

  it('ohne die JSON-Datei des Artefakts in dateien wirft', async () => {
    const { s, repo } = await mitRepo();
    await expect(s.speichern(repo, 'brief', { 'README.md': '#' }, null, autor, 'x')).rejects.toThrow(/mappe\/brief\.json/);
  });
});

describe('githubSpeicher.anlegen', () => {
  it('erzeugt das Repo aus der Vorlage, privat, mit dem org-weiten Token (administration)', async () => {
    const { gh, s } = aufbau();
    expect(await s.anlegen(sofie, 1001)).toStrictEqual({ repo: '2026-sofie' });
    const [gen] = gh.zustand.aufrufeVon('POST', '/generate');
    expect(gen.pfad).toBe('/repos/ndu-innolab/mappe-vorlage-2026/generate');
    expect(gen.body).toStrictEqual({ owner: 'ndu-innolab', name: '2026-sofie', private: true });
    expect(gh.zustand.tokens.get(gen.token!)).toStrictEqual({ permissions: { administration: 'write' }, repositoryIds: null });
    expect(await s.werkstattJson('2026-sofie')).toStrictEqual({ kohorte: '2026', githubId: 1001 });
  });

  it('anlegen wartet auf main', async () => {
    const { gh, s, schlafen } = aufbau();
    gh.zustand.mainVerzoegerung = 2;
    await s.anlegen(sofie, 1001);
    expect(gh.zustand.aufrufeVon('GET', '/git/ref/heads/main')).toHaveLength(3);
    expect(schlafen.mock.calls).toStrictEqual([[1000], [1000]]);
    const imKopf = gh.zustand.dateien('2026-sofie');
    expect(JSON.parse(imKopf['werkstatt.json'])).toStrictEqual({ kohorte: '2026', githubId: 1001 });
    expect(imKopf['AGENTS.md']).toBe('# Agenten\n');
  });

  it('main kommt nicht innerhalb von 8 s → wirft', async () => {
    const { gh, s, schlafen } = aufbau();
    gh.zustand.mainVerzoegerung = 100;
    await expect(s.anlegen(sofie, 1001)).rejects.toThrow('repo-nicht-bereit');
    expect(schlafen).toHaveBeenCalledTimes(8);
  });

  it('anlegen ist idempotent', async () => {
    const { gh, s } = aufbau();
    await s.anlegen(sofie, 1001);
    const kopf = gh.zustand.kopf('2026-sofie');
    expect(await s.anlegen(sofie, 1001)).toStrictEqual({ repo: '2026-sofie' });
    expect(gh.zustand.aufrufeVon('POST', '/generate')).toHaveLength(2);
    // Kein zweites werkstatt.json.
    expect(gh.zustand.kopf('2026-sofie')).toBe(kopf);
    await expect(s.anlegen(sofie, 1002)).rejects.toThrow('repo-gehoert-anderer-person');
  });

  it('Repo existiert schon ohne werkstatt.json (abgebrochener erster Versuch) → wird nachgetragen', async () => {
    const { gh, s } = aufbau();
    gh.zustand.repoAnlegen('2026-sofie', { 'README.md': '# Vorlage\n' });
    expect(await s.anlegen(sofie, 1001)).toStrictEqual({ repo: '2026-sofie' });
    expect(await s.werkstattJson('2026-sofie')).toStrictEqual({ kohorte: '2026', githubId: 1001 });
  });

  it('unbekannte Kohorte wirft', async () => {
    const { s } = aufbau();
    await expect(s.anlegen({ kohorte: 'gibtsnicht', rolle: 'studierende', kuerzel: 'sofie' }, 1001)).rejects.toThrow();
  });
});

describe('githubSpeicher.lesen, uebersicht, werkstattJson', () => {
  it('lesen: Daten und Blob-SHA; fehlt die Datei → null', async () => {
    const { gh, s, repo } = await mitRepo();
    expect(await s.lesen(repo, 'leitfaden')).toStrictEqual({ daten: null, basisSha: null });
    gh.zustand.aendernVonAussen(repo, 'mappe/leitfaden.json', '{"fragen":[]}\n');
    expect(await s.lesen(repo, 'leitfaden')).toStrictEqual({ daten: { fragen: [] }, basisSha: blobSha('{"fragen":[]}\n') });
  });

  it('uebersicht: welche mappe/*.json es gibt, in Anzeigereihenfolge', async () => {
    const { s, repo } = await mitRepo();
    await s.speichern(repo, 'annahmen', dateien('annahmen', { annahmen: [] }), null, autor, 'Annahmen: neu');
    expect(await s.uebersicht(repo)).toStrictEqual([
      { name: 'brief', vorhanden: false },
      { name: 'entscheidungen', vorhanden: false },
      { name: 'leitfaden', vorhanden: false },
      { name: 'annahmen', vorhanden: true },
    ]);
  });

  it('werkstattJson: null, wenn das Repo fehlt', async () => {
    const { s } = aufbau();
    expect(await s.werkstattJson('2026-niemand')).toBeNull();
    expect(await s.lesen('2026-niemand', 'brief')).toStrictEqual({ daten: null, basisSha: null });
  });

  it('Repo-ID wird einmal aufgelöst und gemerkt', async () => {
    const { gh, s, repo } = await mitRepo();
    await s.lesen(repo, 'brief');
    await s.uebersicht(repo);
    await s.speichern(repo, 'brief', dateien('brief', { a: 1 }), null, autor, 'Brief: neu');
    // anlegen kennt die ID aus der 201-Antwort; danach nie ein GET /repos/{org}/{name}.
    expect(gh.zustand.aufrufe.filter((a) => a.methode === 'GET' && a.pfad === `/repos/ndu-innolab/${repo}`)).toHaveLength(0);
    const s2 = aufbauMitGleichemGithub(gh);
    await s2.lesen(repo, 'brief');
    await s2.lesen(repo, 'annahmen');
    expect(gh.zustand.aufrufe.filter((a) => a.methode === 'GET' && a.pfad === `/repos/ndu-innolab/${repo}`)).toHaveLength(1);
  });
});

function aufbauMitGleichemGithub(gh: ReturnType<typeof fakeGithub>) {
  const cache = mapCache();
  const app = { fetch: gh.fetch, cache, jetzt: () => Date.now(), schluessel: () => ({ appId: '123456', privateKeyPem: PEM }) };
  return githubSpeicher({ fetch: gh.fetch, cache, token: installationTokenGeber(app), bot: botIdentitaetGeber(app), kohorte: kohorte2026 });
}
