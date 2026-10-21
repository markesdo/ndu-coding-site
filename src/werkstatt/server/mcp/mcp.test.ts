import { createHash, randomBytes } from 'node:crypto';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { METHODEN } from '../../../components/methoden';
import annahmenBeispiel from '../../beispiele/annahmen.json';
import briefBeispiel from '../../beispiele/brief.json';
import entscheidungenBeispiel from '../../beispiele/entscheidungen.json';
import interviewsBeispiel from '../../beispiele/interviews.json';
import { kohorteTest } from '../../kohorten/test';
import { ApiAusnahme } from '../antwort';
import { appErstellen } from '../app';
import { mapCache } from '../cache';
import { fakeSpeicher } from '../fake-speicher';
import { GithubAusnahme } from '../github/app-token';
import { lokaleAbhaengigkeiten, lokaleUmgebung } from '../lokal';
import { cookieName, sitzungErstellen } from '../sitzung';
import { wirdEingerichtet } from '../speicher-fehler';
import { MAX_ANFRAGE_BYTES } from './server';
import type { Cache } from '../typen';
import { MCP_WERKZEUGE } from '../../vertrag';
import { BEFUND_ARTEN } from '../../verknuepfungen';

const BASIS = 'http://localhost:4321';
const MCP = `${BASIS}/api/werkstatt/mcp`;
const CLAUDE_CLIENT = 'https://claude.ai/oauth/mcp-oauth-client-metadata';
const CALLBACK = 'https://claude.ai/api/mcp/auth_callback';
const FORM = { 'Content-Type': 'application/x-www-form-urlencoded' };
const START = 1_800_000_000_000;
const AUTOR = { name: 'Test', email: 'test@example.invalid' };

// Zwei Studierende (A = 1001 sofie, B = 1002 jonas) und eine Lehrende (1000) in der Kohorte test.
// Beide Mappen sind angelegt und tragen eine Annahmen-Map mit erkennbar verschiedenem Text.
// Ohne Markdown-Zeichen: So steht der Satz im Markdown wörtlich, und die Negativ-Prüfungen auf text() greifen.
const TEXT_A = 'Wir glauben, dass Sofies Pendlerinnen vorbestellen wollen.';
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

  it('Anfrage über MAX_ANFRAGE_BYTES mit gültigem Token -> 413, darunter normal', async () => {
    const h = await aufbau();
    const token = await accessToken(h);
    const kopf = { ...MCP_KOPF, Authorization: `Bearer ${token}` };
    const gross = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: { fuell: 'x'.repeat(MAX_ANFRAGE_BYTES) } });
    expect((await h.anfrage(MCP, { method: 'POST', headers: kopf, body: gross })).status).toBe(413);
    expect((await h.anfrage(MCP, { method: 'POST', headers: kopf, body: jsonrpc('tools/list') })).status).toBe(200);
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
    expect(anweisung).toContain(MCP_WERKZEUGE.verknuepfungenPruefen);
  });

  it('tools/list: genau die fünf Namen, alle readOnlyHint, deutsche Beschreibung', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    const { tools } = await c.listTools();
    expect(tools.map((t) => t.name).sort()).toStrictEqual(['artefakt_lesen', 'artefakt_pruefen', 'mappe_uebersicht', 'methode_erklaeren', 'verknuepfungen_pruefen']);
    expect(Object.values(MCP_WERKZEUGE).sort()).toStrictEqual(tools.map((t) => t.name).sort());
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
    expect(Object.keys(pruefen.outputSchema?.properties ?? {}).sort()).toStrictEqual(['anleitung', 'artefakt', 'markdown', 'pruefpunkte', 'titel', 'vorhanden']);
    // Die Arten der Befunde kommen aus verknuepfungen.ts, nicht aus einer zweiten Liste.
    const verkn = tools.find((t) => t.name === MCP_WERKZEUGE.verknuepfungenPruefen)!;
    const befund = (verkn.outputSchema?.properties as { befunde: { items: { properties: { art: { enum: string[] } } } } }).befunde;
    expect(befund.items.properties.art.enum).toStrictEqual([...BEFUND_ARTEN]);
    // Beschreibung und Prüfung stimmen überein: „getan“ ohne Beleg ist ein Befund.
    expect(verkn.description).toContain('„getan“ ohne Beleg');
    expect(pruefen.description).toMatch(/höchstens drei Befunde/);
  });

  it('artefakt_pruefen(annahmen): Markdown + sechs Prüfpunkte annahmen-1 … annahmen-6 aus methoden.ts', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'annahmen' } });
    expect(r.isError).toBeFalsy();
    const sc = r.structuredContent as { artefakt: string; markdown: string; pruefpunkte: { id: string; text: string }[] };
    const liste = METHODEN.find((m) => m.slug === 'annahmen')!.pruefliste!;
    expect(sc.pruefpunkte).toStrictEqual(liste.map((t, i) => ({ id: `annahmen-${i + 1}`, text: t })));
    expect(sc.pruefpunkte.map((p) => p.id)).toStrictEqual(['annahmen-1', 'annahmen-2', 'annahmen-3', 'annahmen-4', 'annahmen-5', 'annahmen-6']);
    expect(sc).not.toHaveProperty('befunde');
    expect(sc.markdown).toContain(TEXT_A);
    const t = text(r);
    expect(t).toContain(TEXT_A);
    expect(t).toContain('annahmen-6');
    expect(t).toContain(liste[5]);
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
      lesezugriff: 'unbekannt',
      artefakte: [
        { name: 'brief', vorhanden: false },
        { name: 'entscheidungen', vorhanden: false },
        { name: 'annahmen', vorhanden: true },
        { name: 'leitfaden', vorhanden: false },
        { name: 'interviews', vorhanden: false },
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
      ['verknuepfungen_pruefen', {}],
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

const KEINE_MAPPE = `Deine Mappe gibt es noch nicht. Öffne einmal die Werkstatt unter ${BASIS}/innolab/mappe, dann wird sie angelegt.`;
const ANLEITUNG_LEER = 'Noch nichts eingetragen. Bitte die Person, es zuerst selbst in der Werkstatt auszufüllen, und prüfe danach.';
const post = (h: Aufbau, pfad: string, kopf: Record<string, string> = {}) =>
  h.anfrage(pfad, { method: 'POST', headers: { ...MCP_KOPF, ...kopf }, body: jsonrpc('tools/list') });

describe('Runde R22', () => {
  it('ohne Mappe (Repo fehlt): alle Mappe-Werkzeuge antworten gleich', async () => {
    const h = await aufbau();
    h.abh.umgebung.zugang.test.studierende.push({ githubId: 1003, kuerzel: 'neu' });
    const c = await client(h, await accessToken(h, 1003));
    for (const [name, args] of [
      ['mappe_uebersicht', {}],
      ['artefakt_lesen', { artefakt: 'annahmen' }],
      ['artefakt_pruefen', { artefakt: 'annahmen' }],
      ['verknuepfungen_pruefen', {}],
    ] as const) {
      const r = await c.callTool({ name, arguments: args });
      expect(r.isError, name).toBe(true);
      expect(text(r), name).toBe(KEINE_MAPPE);
    }
  });

  it('Repo gehört laut werkstatt.json einer anderen GitHub-ID -> nichts lesen', async () => {
    const h = await aufbau();
    await h.speicher.anlegen({ kohorte: 'test', rolle: 'studierende', kuerzel: 'neu' }, 4242);
    await h.speicher.speichern('test-neu', 'annahmen', { 'mappe/annahmen.json': `${JSON.stringify(mitText('Fremder Text der Vorbesitzerin.'), null, 2)}\n` }, null, AUTOR, 'x');
    h.abh.umgebung.zugang.test.studierende.push({ githubId: 1003, kuerzel: 'neu' });
    const c = await client(h, await accessToken(h, 1003));
    for (const name of ['artefakt_lesen', 'artefakt_pruefen']) {
      const r = await c.callTool({ name, arguments: { artefakt: 'annahmen' } });
      expect(r.isError, name).toBe(true);
      expect(JSON.stringify(r), name).not.toContain('Fremder Text');
      expect(text(r), name).toMatch(/Frag Markus/);
    }
  });

  it('kaputtes JSON im Repo -> derselbe Hinweis wie bei falschem Format; echter GitHub-Ausfall bleibt allgemein', async () => {
    const h = await aufbau();
    await h.speicher.speichern('test-sofie', 'brief', { 'mappe/brief.json': '{ kaputt' }, null, AUTOR, 'kaputt');
    await h.speicher.speichern('test-sofie', 'entscheidungen', { 'mappe/entscheidungen.json': '{"schema":"entscheidungen@1"}\n' }, null, AUTOR, 'falsch');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const c = await client(h, await accessToken(h));
    for (const name of ['artefakt_lesen', 'artefakt_pruefen']) {
      const kaputt = await c.callTool({ name, arguments: { artefakt: 'brief' } });
      const falsch = await c.callTool({ name, arguments: { artefakt: 'entscheidungen' } });
      for (const r of [kaputt, falsch]) {
        expect(r.isError, name).toBe(true);
        expect(text(r), name).toMatch(/passt nicht zum Format/);
        expect(text(r), name).toMatch(/speichere sie neu/);
        expect(text(r), name).not.toMatch(/GitHub ist gerade nicht erreichbar/);
      }
    }
    vi.spyOn(h.speicher, 'lesen').mockRejectedValue(new GithubAusnahme(500));
    const r = await c.callTool({ name: 'artefakt_lesen', arguments: { artefakt: 'annahmen' } });
    expect(r.isError).toBe(true);
    expect(text(r)).toMatch(/GitHub ist gerade nicht erreichbar/);
    expect(text(r)).not.toMatch(/passt nicht zum Format/);
  });

  it('Speicher-Ausnahmen werden zu Sätzen für den Chat (kein „Seite neu laden“)', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    vi.spyOn(h.speicher, 'lesen').mockRejectedValue(wirdEingerichtet());
    const r = await c.callTool({ name: 'artefakt_lesen', arguments: { artefakt: 'annahmen' } });
    expect(r.isError).toBe(true);
    expect(text(r)).toMatch(/eingerichtet/);
    expect(text(r)).not.toMatch(/Seite|neu laden|Lade/);
  });

  it('Zugang zwischen bearerPruefen und Werkzeug entzogen -> „nicht mehr aktiv“', async () => {
    const h = await aufbau();
    const lesen = vi.spyOn(h.speicher, 'lesen');
    const c = await client(h, await accessToken(h));
    // Der Client holt vor dem ersten callTool die Werkzeugliste (für outputSchema); das vorher erledigen.
    await c.listTools();
    const voll = h.abh.umgebung.zugang;
    const leer = { test: { lehrende: [], studierende: [] } };
    // Erster Zugriff = bearerPruefen der Anfrage, jeder weitere = das Werkzeug.
    let zugriffe = 0;
    Object.defineProperty(h.abh.umgebung, 'zugang', { configurable: true, get: () => (zugriffe++ === 0 ? voll : leer) });
    const r = await c.callTool({ name: 'artefakt_lesen', arguments: { artefakt: 'annahmen' } });
    expect(zugriffe).toBeGreaterThan(1);
    expect(r.isError).toBe(true);
    expect(text(r)).toBe('Dein Zugang zur Werkstatt ist nicht mehr aktiv. Frag Markus.');
    expect(lesen).not.toHaveBeenCalled();
  });

  it('artefakt_pruefen: Tutor-Regeln auch in structuredContent (anleitung, im outputSchema)', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    const { tools } = await c.listTools();
    const schema = tools.find((t) => t.name === 'artefakt_pruefen')!.outputSchema!;
    expect(Object.keys(schema.properties ?? {})).toContain('anleitung');
    const r = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'annahmen' } });
    const anleitung = (r.structuredContent as { anleitung: string }).anleitung;
    expect(anleitung).toMatch(/[Hh]öchstens drei Befunde/);
    expect(anleitung).toMatch(/wörtlich/);
    expect(anleitung).toContain(`${BASIS}/innolab/mappe`);
    expect(text(r)).toContain(anleitung);
  });

  it('artefakt_pruefen ohne Inhalt: keine Zitat-Anleitung, Prüfpunkte zur Orientierung', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'leitfaden' } });
    expect(r.isError).toBeFalsy();
    const sc = r.structuredContent as { anleitung: string; vorhanden: boolean; pruefpunkte: unknown[] };
    expect(sc.vorhanden).toBe(false);
    expect(sc.anleitung).toBe(ANLEITUNG_LEER);
    expect(sc.pruefpunkte.length).toBeGreaterThan(0);
    expect(text(r)).toContain(ANLEITUNG_LEER);
    expect(text(r)).not.toMatch(/Zitat/);
  });

  it('error="invalid_token" nur bei einem Bearer-Credential (RFC 6750 §3.1)', async () => {
    const h = await aufbau();
    for (const kopf of [{}, { Authorization: 'Basic YWxhZGRpbjpvcGVuc2VzYW1l' }, { Authorization: '' }] as Record<string, string>[]) {
      const r = await post(h, MCP, kopf);
      expect(r.status, JSON.stringify(kopf)).toBe(401);
      expect(r.headers.get('www-authenticate'), JSON.stringify(kopf)).not.toContain('error=');
      expect(r.headers.get('www-authenticate'), JSON.stringify(kopf)).toContain('resource_metadata=');
    }
    for (const kopf of [{ Authorization: 'Bearer quatsch' }, { Authorization: 'bearer quatsch' }]) {
      const r = await post(h, MCP, kopf);
      expect(r.status).toBe(401);
      expect(r.headers.get('www-authenticate'), JSON.stringify(kopf)).toContain('error="invalid_token"');
    }
  });

  it('/api/werkstatt/mcp/ mit Schrägstrich verhält sich wie ohne; /mcp/resource bleibt Metadaten', async () => {
    const h = await aufbau();
    const ohne = await post(h, `${MCP}/`);
    expect(ohne.status).toBe(401);
    expect(ohne.headers.get('www-authenticate')).toContain(`resource_metadata="${BASIS}/api/werkstatt/mcp/resource"`);
    const token = await accessToken(h);
    const mit = await post(h, `${MCP}/`, { Authorization: `Bearer ${token}` });
    expect(mit.status).toBe(200);
    const namen = ((await mit.json()) as { result: { tools: { name: string }[] } }).result.tools.map((t) => t.name);
    expect(namen).toHaveLength(Object.keys(MCP_WERKZEUGE).length);
    const res = await h.anfrage('/api/werkstatt/mcp/resource');
    expect(await res.json()).toMatchObject({ resource: MCP });
    expect((await h.anfrage(`${MCP}/anderes`, { method: 'POST' })).status).toBe(404);
  });
});

const speichernJson = (h: Aufbau, repo: string, name: 'entscheidungen' | 'interviews', daten: unknown) =>
  h.speicher.speichern(repo, name, { [`mappe/${name}.json`]: `${JSON.stringify(daten, null, 2)}\n` }, null, AUTOR, name);

describe('Interviews und Verknüpfungen (Phase 1b)', () => {
  it('artefakt_lesen(interviews): nur Felder des Schemas, ein zusätzliches Namensfeld kommt nie heraus', async () => {
    const h = await aufbau();
    const mitName = structuredClone(interviewsBeispiel) as typeof interviewsBeispiel & { interviews: Record<string, unknown>[] };
    // Jemand trägt direkt auf GitHub einen Klarnamen ein: das Schema kennt das Feld nicht, es wird verworfen.
    mitName.interviews[1].name = 'Maria Klarname';
    await speichernJson(h, 'test-sofie', 'interviews', mitName);
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: MCP_WERKZEUGE.artefaktLesen, arguments: { artefakt: 'interviews' } });
    expect(r.isError).toBeFalsy();
    expect(r.structuredContent).toStrictEqual(interviewsBeispiel);
    expect(JSON.stringify(r)).not.toContain('Klarname');
    expect(text(r)).toContain('## I2 · Pendlerin, Zug 7:42');
  });

  it('artefakt_lesen(interviews): Interview ohne Pseudonym -> keine Notizen, nur der Hinweis zum Neuspeichern', async () => {
    const h = await aufbau();
    const ohne = structuredClone(interviewsBeispiel);
    ohne.interviews[0].pseudonym = '';
    await speichernJson(h, 'test-sofie', 'interviews', ohne);
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: MCP_WERKZEUGE.artefaktLesen, arguments: { artefakt: 'interviews' } });
    expect(r.isError).toBe(true);
    expect(text(r)).toMatch(/passt nicht zum Format/);
    expect(JSON.stringify(r)).not.toContain(interviewsBeispiel.interviews[0].notizen.slice(0, 20));
    expect(JSON.stringify(r)).not.toContain(interviewsBeispiel.interviews[1].notizen.slice(0, 20));
  });

  it('verknuepfungen_pruefen: Beleg-IDs aus Entscheidungslog und Annahmen-Map werden gegen die Interviews aufgelöst', async () => {
    const h = await aufbau();
    await speichernJson(h, 'test-sofie', 'entscheidungen', entscheidungenBeispiel);
    await speichernJson(h, 'test-sofie', 'interviews', interviewsBeispiel);
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: MCP_WERKZEUGE.verknuepfungenPruefen, arguments: {} });
    expect(r.isError).toBeFalsy();
    // Sofies Annahmen-Map ist die Kaffeebar mit eigenem Text in A1. Den Brief hat nur Jonas.
    // Einzige Lücke: A2 und A4 der Kaffeebar stehen auf „getan“ ohne Quelle.
    expect(r.structuredContent).toStrictEqual({
      befunde: ['A2', 'A4'].map((id) => ({
        art: 'fehlender-beleg', artefakt: 'annahmen', ort: id, text: `${id} hat die Belegstufe „getan“, nennt aber keine Quelle: weder eine Beleg-Notiz noch eine Entscheidung, die selbst „getan“ ist und eine Quelle nennt. Ein Interview-Zitat belegt höchstens „erzählt“. Wo liegt das beobachtete Verhalten?`,
      })),
      geprueft: ['entscheidungen', 'annahmen', 'interviews'],
      fehlen: ['brief', 'leitfaden'],
      unlesbar: [],
    });
    expect(text(r)).toContain('## Fehlende Belege (2)');
    expect(text(r)).not.toContain('## Unbekannte IDs');
    expect(text(r)).toContain('Ändern kann die Person nur selbst');
    expect(text(r)).toContain(`${BASIS}/innolab/mappe`);
  });

  it('verknuepfungen_pruefen: unbekanntes Zitat I2-9 im Entscheidungslog wird gemeldet', async () => {
    const h = await aufbau();
    const e = structuredClone(entscheidungenBeispiel);
    e.entscheidungen[3].belegIds = ['I2-4', 'I2-9'];
    await speichernJson(h, 'test-sofie', 'entscheidungen', e);
    await speichernJson(h, 'test-sofie', 'interviews', interviewsBeispiel);
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: MCP_WERKZEUGE.verknuepfungenPruefen, arguments: {} });
    const befunde = (r.structuredContent as { befunde: { art: string; id?: string }[] }).befunde;
    expect(befunde.filter((b) => b.art === 'unbekannte-id')).toStrictEqual([
      { art: 'unbekannte-id', artefakt: 'entscheidungen', ort: 'D4', id: 'I2-9', text: 'D4 nennt I2-9 als Beleg. I2 hat kein Zitat I2-9.' },
    ]);
    expect(text(r)).toContain('## Unbekannte IDs (1)');
  });

  it('verknuepfungen_pruefen: unlesbare Datei wird gelistet statt das ganze Werkzeug abzubrechen; liest nur die eigene Mappe', async () => {
    const h = await aufbau();
    await h.speicher.speichern('test-sofie', 'interviews', { 'mappe/interviews.json': '{ kaputt' }, null, AUTOR, 'kaputt');
    const lesen = vi.spyOn(h.speicher, 'lesen');
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: MCP_WERKZEUGE.verknuepfungenPruefen, arguments: { repo: 'test-jonas' } });
    expect(r.isError).toBeFalsy();
    expect((r.structuredContent as { unlesbar: string[] }).unlesbar).toStrictEqual(['interviews']);
    expect(text(r)).toMatch(/Nicht lesbar.*Interviews und Snapshots/);
    expect(new Set(lesen.mock.calls.map((a) => a[0]))).toStrictEqual(new Set(['test-sofie']));
  });

  it('verknuepfungen_pruefen: GitHub-Ausfall -> allgemeiner Satz, kein Teilergebnis', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    vi.spyOn(h.speicher, 'lesen').mockRejectedValue(new GithubAusnahme(500));
    const r = await c.callTool({ name: MCP_WERKZEUGE.verknuepfungenPruefen, arguments: {} });
    expect(r.isError).toBe(true);
    expect(text(r)).toMatch(/GitHub ist gerade nicht erreichbar/);
  });
});
