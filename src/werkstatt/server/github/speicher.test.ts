// githubSpeicher gegen die fetch-Attrappe fakeGithub: die echte Implementierung läuft, nur GitHub ist nachgebaut.
import { createHash, generateKeyPairSync } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiAusnahme } from '../antwort';
import { kohorte2026 } from '../../kohorten/2026';
import type { Kohorte } from '../../kohorten/index';
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
const WERKSTATT_JSON = { kohorte: '2026', githubId: 1001, schemaVersionen: [...kohorte2026.artefakte] };
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

function aufbau(opts: { zeitlimitMs?: number } = {}) {
  const gh = fakeGithub({ org: kohorte2026.org });
  gh.zustand.vorlageAnlegen(kohorte2026.vorlage, { 'README.md': '# Vorlage\n', 'AGENTS.md': '# Agenten\n' });
  const uhr = { ms: 1_800_000_000_000 };
  const cache = mapCache(() => uhr.ms);
  const app = { fetch: gh.fetch, cache, jetzt: () => uhr.ms, schluessel: () => ({ appId: '123456', privateKeyPem: PEM }) };
  const schlafen = vi.fn(async (ms: number) => {
    uhr.ms += ms;
  });
  const token = installationTokenGeber(app);
  const s = githubSpeicher({
    fetch: gh.fetch,
    cache,
    token,
    bot: botIdentitaetGeber(app, token),
    schlafen,
    jetzt: () => uhr.ms,
    zeitlimitMs: opts.zeitlimitMs,
  });
  return { gh, s, schlafen, uhr };
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
    // Inhalte inline im Tree, keine eigenen Blob-Aufrufe.
    expect(gh.zustand.aufrufeVon('POST', '/git/blobs')).toHaveLength(0);
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
    expect(JSON.parse(imKopf['werkstatt.json'])).toStrictEqual(WERKSTATT_JSON);

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

  it('wettlauf zweimal verloren, dritter Versuch klappt', async () => {
    const { gh, s, repo } = await mitRepo();
    let n = 0;
    gh.zustand.vorRefUpdate = (r) => {
      if (n < 2) gh.zustand.aendernVonAussen(r, 'mappe/brief.json', `{"n":${n++}}\n`);
    };
    const erg = await s.speichern(repo, 'annahmen', dateien('annahmen', { annahmen: [] }), null, autor, 'Annahmen: neu');
    expect('basisSha' in erg).toBe(true);
    expect(gh.zustand.aufrufeVon('PATCH', '/git/refs/heads/main')).toHaveLength(3);
    expect(JSON.parse(gh.zustand.dateien(repo)['mappe/annahmen.json'])).toStrictEqual({ annahmen: [] });
  });

  it('wettlauf dreimal verloren → 503 github-fehler (kein falscher Konflikt), kein vierter Versuch', async () => {
    const { gh, s, repo } = await mitRepo();
    let n = 0;
    gh.zustand.vorRefUpdate = (r) => gh.zustand.aendernVonAussen(r, 'mappe/brief.json', `{"n":${n++}}\n`);
    const e = await alsFehler(s.speichern(repo, 'annahmen', dateien('annahmen', { annahmen: [] }), null, autor, 'Annahmen: neu'));
    expect([e.status, e.code, e.satz]).toStrictEqual([503, 'github-fehler', 'Gerade speichern viele gleichzeitig. Bitte gleich noch einmal.']);
    expect(gh.zustand.aufrufeVon('PATCH', '/git/refs/heads/main')).toHaveLength(3);
    expect(gh.zustand.dateien(repo)['mappe/annahmen.json']).toBeUndefined();
  });

  it('wettlauf gegen dasselbe Artefakt → beim Neuversuch Konflikt', async () => {
    const { gh, s, repo } = await mitRepo();
    let einmal = true;
    gh.zustand.vorRefUpdate = (r) => {
      if (einmal) gh.zustand.aendernVonAussen(r, 'mappe/annahmen.json', '{"annahmen":[{"id":"X"}]}\n');
      einmal = false;
    };
    const erg = await s.speichern(repo, 'annahmen', dateien('annahmen', { annahmen: [] }), null, autor, 'Annahmen: neu');
    expect(erg).toStrictEqual({ konflikt: true });
    expect(gh.zustand.aufrufeVon('PATCH', '/git/refs/heads/main')).toHaveLength(1);
  });

  it('ohne die JSON-Datei des Artefakts in dateien wirft', async () => {
    const { s, repo } = await mitRepo();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const e = await alsFehler(s.speichern(repo, 'brief', { 'README.md': '#' }, null, autor, 'x'));
    expect([e.status, e.code]).toStrictEqual([500, 'unbekannt']);
    expect(log.mock.calls.join(' ')).toContain('mappe/brief.json');
    log.mockRestore();
  });
});

describe('githubSpeicher.anlegen', () => {
  it('erzeugt das Repo aus der Vorlage, privat, mit dem org-weiten Token (administration write, contents read)', async () => {
    const { gh, s } = aufbau();
    // Fehler als Wert, damit fehlende Rechte hier auf der Assertion rot werden statt als Absturz.
    expect(await s.anlegen(sofie, 1001).catch((e: unknown) => e)).toStrictEqual({ repo: '2026-sofie' });
    const [gen] = gh.zustand.aufrufeVon('POST', '/generate');
    expect(gen.pfad).toBe('/repos/ndu-innolab/mappe-vorlage-2026/generate');
    expect(gen.body).toStrictEqual({ owner: 'ndu-innolab', name: '2026-sofie', private: true });
    expect(gh.zustand.tokens.get(gen.token!)).toStrictEqual({ permissions: { administration: 'write', contents: 'read' }, repositoryIds: null });
    expect(await s.werkstattJson('2026-sofie')).toStrictEqual({ kohorte: '2026', githubId: 1001 });
  });

  it('anlegen wartet auf main', async () => {
    const { gh, s, schlafen } = aufbau();
    gh.zustand.mainVerzoegerung = 2;
    await s.anlegen(sofie, 1001);
    expect(gh.zustand.aufrufeVon('GET', '/git/ref/heads/main')).toHaveLength(3);
    expect(schlafen.mock.calls).toStrictEqual([[1000], [1000]]);
    const imKopf = gh.zustand.dateien('2026-sofie');
    expect(JSON.parse(imKopf['werkstatt.json'])).toStrictEqual(WERKSTATT_JSON);
    expect(imKopf['AGENTS.md']).toBe('# Agenten\n');
  });

  it('main kommt nicht innerhalb von 8 s → wirft', async () => {
    const { gh, s, schlafen } = aufbau();
    gh.zustand.mainVerzoegerung = 100;
    const e = await alsFehler(s.anlegen(sofie, 1001));
    expect([e.status, e.code]).toStrictEqual([503, 'wird-eingerichtet']);
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
    const e = await alsFehler(s.anlegen(sofie, 1002));
    expect([e.status, e.code]).toStrictEqual([403, 'nicht-freigeschaltet']);
  });

  it('Repo existiert schon ohne werkstatt.json (abgebrochener erster Versuch) → wird nachgetragen', async () => {
    const { gh, s } = aufbau();
    gh.zustand.repoAnlegen('2026-sofie', { 'README.md': '# Vorlage\n' }, { vorlage: kohorte2026.vorlage });
    expect(await s.anlegen(sofie, 1001)).toStrictEqual({ repo: '2026-sofie' });
    expect(await s.werkstattJson('2026-sofie')).toStrictEqual({ kohorte: '2026', githubId: 1001 });
  });

  it('unbekannte Kohorte wirft', async () => {
    const { s } = aufbau();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const e = await alsFehler(s.anlegen({ kohorte: 'gibtsnicht', rolle: 'studierende', kuerzel: 'sofie' }, 1001));
    expect([e.status, e.code]).toStrictEqual([500, 'unbekannt']);
    expect(log.mock.calls.join(' ')).toContain('gibtsnicht');
    log.mockRestore();
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
  const token = installationTokenGeber(app);
  return githubSpeicher({ fetch: gh.fetch, cache, token, bot: botIdentitaetGeber(app, token) });
}

async function alsFehler(p: Promise<unknown>): Promise<ApiAusnahme> {
  const e = await p.then(
    () => null,
    (e: unknown) => e,
  );
  if (!(e instanceof ApiAusnahme)) throw new Error(`ApiAusnahme erwartet, bekam ${String(e)}`);
  return e;
}

describe('fakeGithub', () => {
  it('/generate verlangt administration: write und contents: read', async () => {
    const { gh } = aufbau();
    const app = { fetch: gh.fetch, cache: mapCache(), jetzt: () => Date.now(), schluessel: () => ({ appId: '1', privateKeyPem: PEM }) };
    const token = installationTokenGeber(app);
    const versuch = async (rechte: Record<string, 'read' | 'write'>) =>
      (await gh.fetch('https://api.github.com/repos/ndu-innolab/mappe-vorlage-2026/generate', {
        method: 'POST',
        headers: { authorization: `Bearer ${await token({ org: 'ndu-innolab', rechte })}` },
        body: JSON.stringify({ owner: 'ndu-innolab', name: '2026-x', private: true }),
      })).status;
    expect(await versuch({ administration: 'write' })).toBe(403);
    expect(await versuch({ contents: 'read' })).toBe(403);
    expect(await versuch({ administration: 'write', contents: 'read' })).toBe(201);
  });

  it('PATCH mit force: true überschreibt wie echtes GitHub', async () => {
    const { gh, s, repo } = await mitRepo();
    await s.speichern(repo, 'brief', dateien('brief', { a: 1 }), null, autor, 'Brief: neu');
    const alt = gh.zustand.commit(repo, gh.zustand.kopf(repo)!).parents[0];
    const antwort = await gh.fetch(`https://api.github.com/repos/ndu-innolab/${repo}/git/refs/heads/main`, {
      method: 'PATCH',
      headers: { authorization: `Bearer ${gh.zustand.aufrufeVon('PATCH', '/git/refs/heads/main')[0].token}` },
      body: JSON.stringify({ sha: alt, force: true }),
    });
    expect(antwort.status).toBe(200);
    expect(gh.zustand.kopf(repo)).toBe(alt);
  });
});

describe('GitHub-Fehler', () => {
  afterEach(() => vi.restoreAllMocks());

  it('Status außerhalb des Erwarteten → 502 github-fehler; ins Log nur Methode, Pfad, Status', async () => {
    const { gh, s, repo } = await mitRepo();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    gh.zustand.stoerung = (methode, pfad) =>
      methode === 'GET' && pfad.includes('/contents/') ? new Response('{"message":"geheim-im-body"}', { status: 500 }) : undefined;
    const e = await alsFehler(s.lesen(repo, 'brief'));
    expect(e.status).toBe(502);
    expect(e.code).toBe('github-fehler');
    expect(e.satz).toBe('GitHub ist gerade nicht erreichbar. Bitte gleich noch einmal versuchen.');
    const zeilen = log.mock.calls.map((c) => c.join(' ')).join('\n');
    expect(zeilen).toMatch(/GET .*contents\/mappe\/brief\.json.* 500/);
    expect(zeilen).not.toContain('geheim-im-body');
    expect(zeilen).not.toMatch(/ghs_|ey[A-Za-z0-9_-]{10}/);
  });

  it('kaputte JSON-Datei → 502 github-fehler mit Log', async () => {
    const { gh, s, repo } = await mitRepo();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    gh.zustand.aendernVonAussen(repo, 'mappe/brief.json', '{kaputt');
    const e = await alsFehler(s.lesen(repo, 'brief'));
    expect([e.status, e.code]).toStrictEqual([502, 'github-fehler']);
    expect(log.mock.calls.map((c) => c.join(' ')).join('\n')).toContain('mappe/brief.json');
  });

  it('kaputte werkstatt.json → 502 github-fehler', async () => {
    const { gh, s, repo } = await mitRepo();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    gh.zustand.aendernVonAussen(repo, 'werkstatt.json', 'nicht json');
    const e = await alsFehler(s.werkstattJson(repo));
    expect([e.status, e.code]).toStrictEqual([502, 'github-fehler']);
  });

  it('422 beim Ref-Update ohne „fast forward“ → github-fehler, kein Neuversuch', async () => {
    const { gh, s, repo } = await mitRepo();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    gh.zustand.stoerung = (methode, pfad) =>
      methode === 'PATCH' && pfad.endsWith('/git/refs/heads/main') ? new Response('{"message":"Validation Failed"}', { status: 422 }) : undefined;
    const e = await alsFehler(s.speichern(repo, 'brief', dateien('brief', { a: 1 }), null, autor, 'Brief: neu'));
    expect([e.status, e.code]).toStrictEqual([502, 'github-fehler']);
    expect(gh.zustand.aufrufeVon('PATCH', '/git/refs/heads/main')).toHaveLength(1);
  });
});

describe('anlegen: vorhandenes Repo nur übernehmen, wenn es aus der Vorlage stammt', () => {
  const BELEGT = [409, 'konflikt', 'Für dich existiert schon ein anderes Repo mit diesem Namen. Schreib Markus.'];
  it('ohne Vorlage → 409 konflikt, nichts geschrieben', async () => {
    const { gh, s } = aufbau();
    gh.zustand.repoAnlegen('2026-sofie', { 'README.md': '# Privat\n' });
    const kopf = gh.zustand.kopf('2026-sofie');
    const e = await alsFehler(s.anlegen(sofie, 1001));
    expect([e.status, e.code, e.satz]).toStrictEqual(BELEGT);
    expect(gh.zustand.kopf('2026-sofie')).toBe(kopf);
  });
  it('aus einer anderen Vorlage → 409 konflikt', async () => {
    const { gh, s } = aufbau();
    gh.zustand.repoAnlegen('2026-sofie', { 'README.md': '#\n' }, { vorlage: 'mappe-vorlage-2025' });
    const e = await alsFehler(s.anlegen(sofie, 1001));
    expect([e.status, e.code, e.satz]).toStrictEqual(BELEGT);
  });
  it('gleich benannte Vorlage einer fremden Org → 409 konflikt', async () => {
    const { gh, s } = aufbau();
    gh.zustand.repoAnlegen('2026-sofie', { 'README.md': '#\n' }, { vorlage: kohorte2026.vorlage, vorlageOwner: 'fremde-org' });
    const e = await alsFehler(s.anlegen(sofie, 1001));
    expect([e.status, e.code, e.satz]).toStrictEqual(BELEGT);
  });
});

describe('werkstatt.json-PUT im Wettlauf', () => {
  for (const status of [409, 422]) {
    it(`${status}: anderer Tab hat werkstatt.json derselben Person geschrieben → Erfolg; fremde ID → 403`, async () => {
      for (const [githubId, erwartet] of [[1001, 'ok'], [1002, 403]] as const) {
        const { gh, s } = aufbau();
        gh.zustand.stoerung = (methode, pfad) => {
          if (methode !== 'PUT' || !pfad.endsWith('/contents/werkstatt.json')) return undefined;
          gh.zustand.aendernVonAussen('2026-sofie', 'werkstatt.json', `${JSON.stringify({ kohorte: '2026', githubId })}\n`);
          return new Response('{"message":"is at 123 but expected 456"}', { status });
        };
        const erg = await s.anlegen(sofie, 1001).catch((e: unknown) => e);
        expect(gh.zustand.aufrufeVon('PUT', '/contents/werkstatt.json')).toHaveLength(1);
        if (erwartet === 'ok') expect(erg).toStrictEqual({ repo: '2026-sofie' });
        else expect([(erg as ApiAusnahme).status, (erg as ApiAusnahme).code]).toStrictEqual([403, 'nicht-freigeschaltet']);
      }
    });
  }
});

describe('Wächter: werkstatt.json ohne githubId', () => {
  it('gültiges JSON ohne githubId gilt nicht als frei', async () => {
    const { gh, s, repo } = await mitRepo();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    gh.zustand.aendernVonAussen(repo, 'werkstatt.json', '{"kohorte":"2026"}\n');
    const e = await alsFehler(s.werkstattJson(repo));
    expect([e.status, e.code]).toStrictEqual([502, 'github-fehler']);
    const f = await alsFehler(s.anlegen(sofie, 1001));
    expect([f.status, f.code]).toStrictEqual([502, 'github-fehler']);
    expect(gh.zustand.dateien(repo)['werkstatt.json']).toBe('{"kohorte":"2026"}\n');
    log.mockRestore();
  });
});

describe('Bot-Identität', () => {
  it('GET /users/<slug>[bot] mit dem Org-Installations-Token', async () => {
    const { gh, s, repo } = await mitRepo();
    await s.speichern(repo, 'brief', dateien('brief', { a: 1 }), null, autor, 'Brief: neu');
    const [aufruf] = gh.zustand.aufrufeVon('GET', '/users/ndu-werkstatt%5Bbot%5D');
    expect(aufruf.token).not.toBeNull();
    expect(gh.zustand.tokens.get(aufruf.token!)).toStrictEqual({ permissions: { administration: 'write', contents: 'read' }, repositoryIds: null });
  });
});

describe('gemerkte IDs veralten', () => {
  it('Repo gelöscht und neu angelegt: Token-Ausgabe scheitert mit der alten ID → neu auflösen, einmal neu versuchen', async () => {
    const { gh, s, repo, uhr } = await mitRepo();
    // Repo-Token abgelaufen (50 min), gemerkte ID (1 Tag) noch da.
    uhr.ms += 51 * 60_000;
    const alteId = gh.zustand.repos.get(repo)!.id;
    gh.zustand.repos.delete(repo);
    gh.zustand.repoAnlegen(repo, { 'mappe/brief.json': '{"neu":true}\n' }, { vorlage: kohorte2026.vorlage });
    expect(gh.zustand.repos.get(repo)!.id).not.toBe(alteId);
    expect((await s.lesen(repo, 'brief')).daten).toStrictEqual({ neu: true });
    const ids = gh.zustand.aufrufeVon('POST', '/access_tokens').map((a) => (a.body as { repository_ids?: number[] }).repository_ids?.[0]).filter((id) => id !== undefined);
    expect(ids.slice(-2)).toStrictEqual([alteId, gh.zustand.repos.get(repo)!.id]);
  });
});

describe('Zeitlimit', () => {
  it('hängt GitHub, bricht githubAnfrage nach dem Zeitlimit mit 502 github-fehler ab', async () => {
    const a = aufbau({ zeitlimitMs: 50 });
    const { repo: r2 } = await a.s.anlegen(sofie, 1001);
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    a.gh.zustand.stoerung = (_m, pfad) => (pfad.includes('/contents/') ? new Promise<Response>(() => {}) : undefined);
    const erg = await Promise.race([
      a.s.lesen(r2, 'brief').catch((e: unknown) => e),
      new Promise((fertig) => setTimeout(() => fertig('hängt'), 500)),
    ]);
    expect(erg).toBeInstanceOf(ApiAusnahme);
    expect([(erg as ApiAusnahme).status, (erg as ApiAusnahme).code]).toStrictEqual([502, 'github-fehler']);
    log.mockRestore();
  });
});

// Zwei aktive Jahrgänge in verschiedenen Orgs, ein Speicher: Org und Vorlage pro Aufruf aus der Kohorte.
describe('mehrere Jahrgänge gleichzeitig', () => {
  const kA: Kohorte = { ...kohorte2026, id: '2026', org: 'org-a', vorlage: 'vorlage-a' };
  const kB: Kohorte = { ...kohorte2026, id: '2027', org: 'org-b', vorlage: 'vorlage-b', beginn: '2027-10-21', artefakte: ['brief@1'] };

  function zweiOrgs() {
    const a = fakeGithub({ org: 'org-a', installationId: 71 });
    const b = fakeGithub({ org: 'org-b', installationId: 72 });
    a.zustand.vorlageAnlegen('vorlage-a', { 'README.md': '# A\n' });
    b.zustand.vorlageAnlegen('vorlage-b', { 'README.md': '# B\n' });
    const f: typeof fetch = async (eingabe, init) => {
      const pfad = new URL(String(eingabe)).pathname;
      const token = new Headers(init?.headers).get('authorization')?.slice(7) ?? '';
      let m = pfad.match(/^\/(?:orgs|repos)\/([^/]+)/);
      if (m) return (m[1] === 'org-b' ? b : a).fetch(eingabe, init);
      m = pfad.match(/^\/app\/installations\/(\d+)/);
      if (m) return (m[1] === '72' ? b : a).fetch(eingabe, init);
      return (b.zustand.tokens.has(token) ? b : a).fetch(eingabe, init);
    };
    const cache = mapCache();
    const app = { fetch: f, cache, jetzt: () => Date.now(), schluessel: () => ({ appId: '123456', privateKeyPem: PEM }) };
    const token = installationTokenGeber(app);
    const s = githubSpeicher({ fetch: f, cache, token, bot: botIdentitaetGeber(app, token), kohorteZu: (id) => [kA, kB].find((k) => k.id === id) });
    return { a, b, s };
  }

  it('anlegen, speichern, lesen je in der Org der Kohorte', async () => {
    const { a, b, s } = zweiOrgs();
    const alt = await s.anlegen({ kohorte: '2026', rolle: 'studierende', kuerzel: 'sofie' }, 1001);
    const neu = await s.anlegen({ kohorte: '2027', rolle: 'studierende', kuerzel: 'sofie' }, 1001);
    expect([alt.repo, neu.repo]).toStrictEqual(['2026-sofie', '2027-sofie']);
    expect(a.zustand.aufrufeVon('POST', '/generate')[0].pfad).toBe('/repos/org-a/vorlage-a/generate');
    expect(b.zustand.aufrufeVon('POST', '/generate')[0].pfad).toBe('/repos/org-b/vorlage-b/generate');
    expect(JSON.parse(b.zustand.dateien('2027-sofie')['werkstatt.json'])).toStrictEqual({ kohorte: '2027', githubId: 1001, schemaVersionen: ['brief@1'] });
    expect(a.zustand.repos.has('2027-sofie')).toBe(false);

    await s.speichern('2027-sofie', 'brief', dateien('brief', { jahr: 2027 }), null, autor, 'Brief: neu');
    await s.speichern('2026-sofie', 'brief', dateien('brief', { jahr: 2026 }), null, autor, 'Brief: neu');
    expect((await s.lesen('2027-sofie', 'brief')).daten).toStrictEqual({ jahr: 2027 });
    expect((await s.lesen('2026-sofie', 'brief')).daten).toStrictEqual({ jahr: 2026 });
    expect(JSON.parse(b.zustand.dateien('2027-sofie')['mappe/brief.json'])).toStrictEqual({ jahr: 2027 });
    expect(await s.werkstattJson('2027-sofie')).toStrictEqual({ kohorte: '2027', githubId: 1001 });
    expect((await s.uebersicht('2026-sofie')).find((x) => x.name === 'brief')?.vorhanden).toBe(true);
  });

  it('unbekanntes Präfix oder Name ohne Präfix → 404 unbekannt', async () => {
    const { s } = zweiOrgs();
    for (const repo of ['2030-sofie', 'sofie']) {
      for (const aufruf of [() => s.lesen(repo, 'brief'), () => s.uebersicht(repo), () => s.werkstattJson(repo), () => s.speichern(repo, 'brief', dateien('brief', {}), null, autor, 'x')]) {
        const e = await alsFehler(aufruf());
        expect([repo, e.status, e.code]).toStrictEqual([repo, 404, 'unbekannt']);
      }
    }
  });
});
