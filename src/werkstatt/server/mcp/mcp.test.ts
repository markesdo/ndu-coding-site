import { createHash, randomBytes } from 'node:crypto';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { METHODEN } from '../../../components/methoden';
import annahmenBeispiel from '../../beispiele/annahmen.json';
import briefBeispiel from '../../beispiele/brief.json';
import { kohorteTest } from '../../kohorten/test';
import { ApiAusnahme } from '../antwort';
import { appErstellen } from '../app';
import { mapCache } from '../cache';
import { fakeSpeicher } from '../fake-speicher';
import { lokaleAbhaengigkeiten, lokaleUmgebung } from '../lokal';
import { cookieName, sitzungErstellen } from '../sitzung';
import type { Cache } from '../typen';

const BASIS = 'http://localhost:4321';
const MCP = `${BASIS}/api/werkstatt/mcp`;
const CLAUDE_CLIENT = 'https://claude.ai/oauth/mcp-oauth-client-metadata';
const CALLBACK = 'https://claude.ai/api/mcp/auth_callback';
const FORM = { 'Content-Type': 'application/x-www-form-urlencoded' };
const START = 1_800_000_000_000;
const AUTOR = { name: 'Test', email: 'test@example.invalid' };

// Zwei Studierende (A = 1001 sofie, B = 1002 jonas) und eine Lehrende (1000) in der Kohorte test.
// Beide Mappen sind angelegt und tragen eine Annahmen-Map mit erkennbar verschiedenem Text.
const TEXT_A = 'Wir glauben, dass Sofies Pendler*innen vorbestellen wollen.';
const TEXT_B = 'Wir glauben, dass Jonas’ Studierende nie vorbestellen.';

function mitText(text: string) {
  const d = structuredClone(annahmenBeispiel);
  d.annahmen[0].text = text;
  return d;
}

async function aufbau(opts: { cache?: Cache; origin?: string } = {}) {
  const uhr = { ms: START };
  const umgebung = {
    ...lokaleUmgebung(),
    zugang: {
      test: {
        lehrende: [1000],
        studierende: [
          { githubId: 1001, kuerzel: 'sofie' },
          { githubId: 1002, kuerzel: 'jonas' },
        ],
      },
    },
    origin: opts.origin ?? null,
  };
  const speicher = fakeSpeicher();
  for (const [githubId, kuerzel, text] of [
    [1001, 'sofie', TEXT_A],
    [1002, 'jonas', TEXT_B],
  ] as const) {
    const { repo } = await speicher.anlegen({ kohorte: 'test', rolle: 'studierende', kuerzel }, githubId);
    await speicher.speichern(repo, 'annahmen', { 'mappe/annahmen.json': `${JSON.stringify(mitText(text), null, 2)}\n` }, null, AUTOR, 'Annahmen');
  }
  // Nur Jonas hat einen Brief: so sieht man auch an der Übersicht, wessen Mappe gelesen wurde.
  await speicher.speichern('test-jonas', 'brief', { 'mappe/brief.json': `${JSON.stringify(briefBeispiel, null, 2)}\n` }, null, AUTOR, 'Brief');

  const abh = lokaleAbhaengigkeiten({ umgebung, speicher, jetzt: () => uhr.ms, cache: opts.cache ?? mapCache(() => uhr.ms) });
  const app = appErstellen(abh);
  const anfrage = (pfad: string, init: RequestInit = {}) => app.request(pfad.startsWith('http') ? pfad : `${BASIS}${pfad}`, init);
  return { app, abh, uhr, anfrage, speicher };
}
type Aufbau = Awaited<ReturnType<typeof aufbau>>;

function pkce() {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}
const form = (o: Record<string, string>) => new URLSearchParams(o).toString();

// Echter Ablauf über das OAuth-Modul: Sitzung -> Zustimmung -> Code -> Token.
async function codeHolen(h: Aufbau, githubId: number, rolle: 'studierende' | 'lehrende') {
  const { umgebung } = h.abh;
  const cookie = `${cookieName(umgebung.lokal)}=${await sitzungErstellen(
    { githubId, login: 'x', kohorte: 'test', rolle, exp: Math.floor(h.uhr.ms / 1000) + 3600 },
    umgebung.sessionSecret,
  )}`;
  const p = pkce();
  const r = await h.anfrage('/api/werkstatt/oauth/authorize', {
    method: 'POST',
    headers: { ...FORM, Origin: umgebung.origin ?? BASIS, Cookie: cookie },
    body: form({
      response_type: 'code',
      client_id: CLAUDE_CLIENT,
      redirect_uri: CALLBACK,
      code_challenge: p.challenge,
      code_challenge_method: 'S256',
      scope: 'mappe',
      entscheidung: 'erlauben',
    }),
  });
  expect(r.status).toBe(302);
  return { code: new URL(r.headers.get('location')!).searchParams.get('code')!, verifier: p.verifier };
}

function einloesen(h: Aufbau, code: string, verifier: string) {
  return h.anfrage('/api/werkstatt/oauth/token', {
    method: 'POST',
    headers: FORM,
    body: form({ client_id: CLAUDE_CLIENT, grant_type: 'authorization_code', code, redirect_uri: CALLBACK, code_verifier: verifier }),
  });
}

async function accessToken(h: Aufbau, githubId = 1001, rolle: 'studierende' | 'lehrende' = 'studierende'): Promise<string> {
  const { code, verifier } = await codeHolen(h, githubId, rolle);
  const r = await einloesen(h, code, verifier);
  expect(r.status).toBe(200);
  return ((await r.json()) as { access_token: string }).access_token;
}

async function client(h: Aufbau, token: string): Promise<Client> {
  const transport = new StreamableHTTPClientTransport(new URL(MCP), {
    fetch: async (url, init) => h.app.request(url, init),
    requestInit: { headers: { Authorization: `Bearer ${token}` } },
  });
  const c = new Client({ name: 'test', version: '1.0.0' });
  await c.connect(transport);
  return c;
}

const text = (r: Awaited<ReturnType<Client['callTool']>>) =>
  (r.content as { type: string; text?: string }[]).map((t) => t.text ?? '').join('\n');

const jsonrpc = (method: string, params: unknown = {}) => JSON.stringify({ jsonrpc: '2.0', id: 1, method, params });
const MCP_KOPF = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' };

afterEach(() => {
  kohorteTest.status = 'aktiv';
  vi.restoreAllMocks();
});

describe('Zugang zum MCP-Endpunkt', () => {
  it('ohne Token -> 401 mit resource_metadata-Verweis und scope', async () => {
    const h = await aufbau();
    const r = await h.anfrage(MCP, { method: 'POST', headers: MCP_KOPF, body: jsonrpc('tools/list') });
    expect(r.status).toBe(401);
    const kopf = r.headers.get('www-authenticate') ?? '';
    expect(kopf).toMatch(/^Bearer /);
    expect(kopf).toContain(`resource_metadata="${BASIS}/api/werkstatt/mcp/resource"`);
    expect(kopf).toContain('scope="mappe"');
    expect(kopf).not.toContain('invalid_token');
  });

  it('ungültiges Token -> 401 mit error="invalid_token"', async () => {
    const h = await aufbau();
    const r = await h.anfrage(MCP, { method: 'POST', headers: { ...MCP_KOPF, Authorization: 'Bearer quatsch.quatsch' }, body: jsonrpc('tools/list') });
    expect(r.status).toBe(401);
    expect(r.headers.get('www-authenticate')).toContain('error="invalid_token"');
    expect(r.headers.get('www-authenticate')).toContain('resource_metadata=');
  });

  it('auch GET und DELETE ohne Token -> 401', async () => {
    const h = await aufbau();
    for (const method of ['GET', 'DELETE']) {
      const r = await h.anfrage(MCP, { method });
      expect(r.status, method).toBe(401);
    }
  });

  it('GET und DELETE mit Token -> 405 (stateless, kein SSE-Strom, keine Sitzung)', async () => {
    const h = await aufbau();
    const token = await accessToken(h);
    for (const method of ['GET', 'DELETE']) {
      const r = await h.anfrage(MCP, { method, headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' } });
      expect(r.status, method).toBe(405);
      expect(r.headers.get('allow')).toBe('POST');
    }
  });

  it('widerrufene Familie (Code zweimal eingelöst) -> 401', async () => {
    const h = await aufbau();
    const { code, verifier } = await codeHolen(h, 1001, 'studierende');
    const erstes = await einloesen(h, code, verifier);
    const token = ((await erstes.json()) as { access_token: string }).access_token;
    const vorher = await h.anfrage(MCP, { method: 'POST', headers: { ...MCP_KOPF, Authorization: `Bearer ${token}` }, body: jsonrpc('tools/list') });
    expect(vorher.status).toBe(200);
    expect((await einloesen(h, code, verifier)).status).toBe(400);
    const r = await h.anfrage(MCP, { method: 'POST', headers: { ...MCP_KOPF, Authorization: `Bearer ${token}` }, body: jsonrpc('tools/list') });
    expect(r.status).toBe(401);
  });

  it('aus der Zugangsliste entfernt -> 401', async () => {
    const h = await aufbau();
    const token = await accessToken(h);
    h.abh.umgebung.zugang.test.studierende = h.abh.umgebung.zugang.test.studierende.filter((s) => s.githubId !== 1001);
    const r = await h.anfrage(MCP, { method: 'POST', headers: { ...MCP_KOPF, Authorization: `Bearer ${token}` }, body: jsonrpc('tools/list') });
    expect(r.status).toBe(401);
  });

  it('Cache-Ausfall beim Prüfen des Tokens -> 503 als ApiFehler (nicht 500, nicht 401)', async () => {
    const h = await aufbau();
    const token = await accessToken(h);
    h.abh.cache.get = async () => {
      throw new ApiAusnahme(503, 'unbekannt', 'Die Werkstatt ist gerade nicht erreichbar. Bitte später noch einmal versuchen.');
    };
    const r = await h.anfrage(MCP, { method: 'POST', headers: { ...MCP_KOPF, Authorization: `Bearer ${token}` }, body: jsonrpc('tools/list') });
    expect(r.status).toBe(503);
    expect(await r.json()).toMatchObject({ code: 'unbekannt' });
  });

  it('/api/werkstatt/mcp/resource bleibt beim OAuth-Router (wird nicht überdeckt)', async () => {
    const h = await aufbau();
    const r = await h.anfrage('/api/werkstatt/mcp/resource');
    expect(r.status).toBe(200);
    expect(await r.json()).toMatchObject({ resource: MCP });
  });
});

describe('Werkzeuge', () => {
  it('initialize: Server-Anweisung als Tutor, auf Deutsch, mit Link zur Werkstatt', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    const anweisung = c.getInstructions() ?? '';
    expect(anweisung).toContain('Tutor');
    expect(anweisung).toMatch(/höchstens drei Befunde/i);
    expect(anweisung).toMatch(/wörtlich/);
    expect(anweisung).toContain(`${BASIS}/innolab/mappe`);
    expect(anweisung).not.toMatch(/\bSie\b/);
  });

  it('tools/list: genau die vier Namen, alle readOnlyHint, deutsche Beschreibung', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    const { tools } = await c.listTools();
    expect(tools.map((t) => t.name).sort()).toStrictEqual(['artefakt_lesen', 'artefakt_pruefen', 'mappe_uebersicht', 'methode_erklaeren']);
    for (const t of tools) {
      expect(t.annotations?.readOnlyHint, t.name).toBe(true);
      expect(t.description?.length ?? 0, t.name).toBeGreaterThan(60);
    }
    // Kein Werkzeug nimmt ein Argument, das ein Repo oder eine Person nennt.
    for (const t of tools) {
      const felder = Object.keys((t.inputSchema.properties ?? {}) as object);
      expect(felder.every((f) => f === 'artefakt' || f === 'slug'), `${t.name}: ${felder}`).toBe(true);
    }
    const pruefen = tools.find((t) => t.name === 'artefakt_pruefen')!;
    // Das outputSchema beschreibt nur, was der Server liefert; die Befunde schreibt Claude in die Antwort.
    expect(Object.keys(pruefen.outputSchema?.properties ?? {}).sort()).toStrictEqual(['artefakt', 'markdown', 'pruefpunkte', 'titel', 'vorhanden']);
    expect(pruefen.description).toMatch(/höchstens drei Befunde/);
  });

  it('artefakt_pruefen(annahmen): Markdown + fünf Prüfpunkte annahmen-1 … annahmen-5 aus methoden.ts', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'annahmen' } });
    expect(r.isError).toBeFalsy();
    const sc = r.structuredContent as { artefakt: string; markdown: string; pruefpunkte: { id: string; text: string }[] };
    const liste = METHODEN.find((m) => m.slug === 'annahmen')!.pruefliste!;
    expect(sc.pruefpunkte).toStrictEqual(liste.map((t, i) => ({ id: `annahmen-${i + 1}`, text: t })));
    expect(sc.pruefpunkte.map((p) => p.id)).toStrictEqual(['annahmen-1', 'annahmen-2', 'annahmen-3', 'annahmen-4', 'annahmen-5']);
    expect(sc).not.toHaveProperty('befunde');
    expect(sc.markdown).toContain(TEXT_A);
    const t = text(r);
    expect(t).toContain(TEXT_A);
    expect(t).toContain('annahmen-5');
    expect(t).toContain(liste[4]);
  });

  it('artefakt_pruefen(leitfaden): IDs mit dem Slug der Methodenseite (interview-1 …), auch ohne gespeichertes Artefakt', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'leitfaden' } });
    expect(r.isError).toBeFalsy();
    const sc = r.structuredContent as { vorhanden: boolean; pruefpunkte: { id: string }[] };
    expect(sc.vorhanden).toBe(false);
    expect(sc.pruefpunkte[0].id).toBe('interview-1');
    expect(sc.pruefpunkte).toHaveLength(METHODEN.find((m) => m.slug === 'interview')!.pruefliste!.length);
    expect(text(r)).toMatch(/noch nicht/);
  });

  it('token liest nur eigene Mappe: A sieht nie Bs Daten, auch nicht mit Zusatzargumenten', async () => {
    const h = await aufbau();
    const lesen = vi.spyOn(h.speicher, 'lesen');
    const uebersicht = vi.spyOn(h.speicher, 'uebersicht');
    const c = await client(h, await accessToken(h, 1001));

    const stand = await c.callTool({ name: 'mappe_uebersicht', arguments: { repo: 'test-jonas', githubId: 1002 } });
    expect(stand.structuredContent).toStrictEqual({
      kohorte: 'test',
      repo: 'test-sofie',
      artefakte: [
        { name: 'brief', vorhanden: false },
        { name: 'entscheidungen', vorhanden: false },
        { name: 'leitfaden', vorhanden: false },
        { name: 'annahmen', vorhanden: true },
      ],
    });

    for (const name of ['artefakt_lesen', 'artefakt_pruefen']) {
      const r = await c.callTool({ name, arguments: { artefakt: 'annahmen', repo: 'test-jonas', person: 'jonas' } });
      expect(text(r), name).toContain(TEXT_A);
      expect(JSON.stringify(r), name).not.toContain(TEXT_B);
    }
    const brief = await c.callTool({ name: 'artefakt_lesen', arguments: { artefakt: 'brief', repo: 'test-jonas' } });
    expect(brief.structuredContent).toBeUndefined();
    expect(JSON.stringify(brief)).not.toContain(briefBeispiel.problem.slice(0, 20));

    const repos = [...lesen.mock.calls.map((a) => a[0]), ...uebersicht.mock.calls.map((a) => a[0])];
    expect(repos.length).toBeGreaterThan(0);
    expect(new Set(repos)).toStrictEqual(new Set(['test-sofie']));
  });

  it('Token von B liest Bs Mappe (Gegenprobe)', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h, 1002));
    const r = await c.callTool({ name: 'artefakt_lesen', arguments: { artefakt: 'annahmen' } });
    expect(text(r)).toContain(TEXT_B);
    expect(JSON.stringify(r)).not.toContain(TEXT_A);
  });

  it('artefakt_lesen: Markdown aus rendern und structuredContent = Daten', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: 'artefakt_lesen', arguments: { artefakt: 'annahmen' } });
    expect(r.isError).toBeFalsy();
    expect(r.structuredContent).toStrictEqual(mitText(TEXT_A));
    expect(text(r)).toContain('# ');
    expect(text(r)).toContain(TEXT_A);
  });

  it('artefakt_lesen: ungültige Datei im Repo -> verständlicher Hinweis statt Absturz', async () => {
    const h = await aufbau();
    await h.speicher.speichern('test-sofie', 'entscheidungen', { 'mappe/entscheidungen.json': '{"schema":"entscheidungen@1"}\n' }, null, AUTOR, 'kaputt');
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: 'artefakt_lesen', arguments: { artefakt: 'entscheidungen' } });
    expect(r.isError).toBe(true);
    expect(text(r)).toContain('/innolab/mappe');
  });

  it('unbekanntes Artefakt -> Fehlerergebnis, kein Absturz', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: 'artefakt_lesen', arguments: { artefakt: 'test-jonas' } });
    expect(r.isError).toBe(true);
  });

  it('artefakt "" oder null -> isError-Ergebnis, kein Protokollfehler', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    for (const name of ['artefakt_pruefen', 'artefakt_lesen']) {
      for (const artefakt of ['', null]) {
        const r = await c.callTool({ name, arguments: { artefakt } });
        expect(r.isError, `${name}(${JSON.stringify(artefakt)})`).toBe(true);
        expect(text(r)).not.toContain(TEXT_A);
      }
    }
  });

  it('mappe_uebersicht verträgt "" und null in Argumenten (ChatGPT)', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    for (const args of [{}, { artefakt: '' }, { artefakt: null }]) {
      const r = await c.callTool({ name: 'mappe_uebersicht', arguments: args });
      expect(r.isError, JSON.stringify(args)).toBeFalsy();
      expect((r.structuredContent as { repo: string }).repo).toBe('test-sofie');
    }
  });

  it('Mappe noch nicht angelegt -> Hinweis auf die Werkstatt statt Absturz', async () => {
    const h = await aufbau();
    h.abh.umgebung.zugang.test.studierende.push({ githubId: 1003, kuerzel: 'neu' });
    const c = await client(h, await accessToken(h, 1003));
    const r = await c.callTool({ name: 'mappe_uebersicht', arguments: {} });
    expect(r.isError).toBe(true);
    expect(text(r)).toContain(`${BASIS}/innolab/mappe`);
  });

  it('interner Fehler im Speicher: keine Einzelheiten an den Client', async () => {
    const h = await aufbau();
    vi.spyOn(h.speicher, 'lesen').mockRejectedValue(new Error('GET /repos/ndu-innolab/test-sofie geheim'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: 'artefakt_lesen', arguments: { artefakt: 'annahmen' } });
    expect(r.isError).toBe(true);
    expect(text(r)).not.toContain('geheim');
    expect(text(r)).toMatch(/schiefgegangen/);
  });

  it('Lehrende-Token: Mappe-Werkzeuge antworten, dass die Lehrende-Ansicht später kommt', async () => {
    const h = await aufbau();
    const lesen = vi.spyOn(h.speicher, 'lesen');
    const c = await client(h, await accessToken(h, 1000, 'lehrende'));
    for (const [name, args] of [
      ['mappe_uebersicht', {}],
      ['artefakt_lesen', { artefakt: 'annahmen' }],
      ['artefakt_pruefen', { artefakt: 'annahmen' }],
    ] as const) {
      const r = await c.callTool({ name, arguments: args });
      expect(text(r), name).toMatch(/Lehrende-Ansicht/);
      expect(JSON.stringify(r), name).not.toContain(TEXT_A);
    }
    expect(lesen).not.toHaveBeenCalled();
    const m = await c.callTool({ name: 'methode_erklaeren', arguments: { slug: 'annahmen' } });
    expect(m.isError).toBeFalsy();
  });

  it('methode_erklaeren(interview): nur Felder aus methoden.ts plus Link, nichts aus der Auflösung', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: 'methode_erklaeren', arguments: { slug: 'interview' } });
    expect(r.isError).toBeFalsy();
    const m = METHODEN.find((x) => x.slug === 'interview')!;
    expect(r.structuredContent).toStrictEqual({
      slug: 'interview',
      name: m.name,
      frage: m.frage,
      pruefliste: m.pruefliste,
      ki: m.ki,
      quelle: m.quelle,
      link: `${BASIS}/innolab/methoden/interview`,
    });
    const alles = JSON.stringify(r);
    expect(alles).not.toContain('Ja, total!');
    expect(alles).not.toContain('<');
    expect(text(r)).toContain(m.frage);
    expect(text(r)).toContain(`${BASIS}/innolab/methoden/interview`);
  });

  it('methode_erklaeren und Anweisung: Links mit WERKSTATT_ORIGIN statt der Anfrage-Origin', async () => {
    const PROD = 'https://ndu.datamonkeys.ai';
    const h = await aufbau({ origin: PROD });
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: 'methode_erklaeren', arguments: { slug: 'annahmen' } });
    expect((r.structuredContent as { link: string }).link).toBe(`${PROD}/innolab/methoden/annahmen`);
    expect(c.getInstructions()).toContain(`${PROD}/innolab/mappe`);
  });

  it('methode_erklaeren: unbekannter Slug -> Fehlerergebnis mit den gültigen Slugs', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: 'methode_erklaeren', arguments: { slug: 'gibts-nicht' } });
    expect(r.isError).toBe(true);
    expect(text(r)).toContain('interview');
  });
});
