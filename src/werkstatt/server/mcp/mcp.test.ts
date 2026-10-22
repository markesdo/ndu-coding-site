import { createHash, randomBytes } from 'node:crypto';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { METHODEN } from '../../../components/methoden';
import { MOM_TEST_GRUPPE } from '../../../components/innolab-zeiten';
import { aufgedecktSchluessel } from '../../../lib/aufgedeckt';
import annahmenBeispiel from '../../beispiele/annahmen.json';
import briefBeispiel from '../../beispiele/brief.json';
import entscheidungenBeispiel from '../../beispiele/entscheidungen.json';
import interviewsBeispiel from '../../beispiele/interviews.json';
import leitfadenBeispiel from '../../beispiele/leitfaden.json';
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
import { antworten, erledigtSetzen, feedbackSchreiben } from '../../feedback';
import { feedbackAendern } from '../feedback';

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
    // IDs beim Zitieren, nur aus dem geprüften Artefakt, Fokus auf einen Prüfpunkt.
    expect(anweisung).toContain('Abschnitt „Artefakt“');
    expect(anweisung).toContain('I2-4');
    expect(anweisung).toMatch(/Vorarbeit zum Abgleich zitierst du nie/);
    expect(anweisung).toContain('pruefpunkt');
    // NDU-27: zuerst schauen, was da ist; nie das ganze Artefakt zurückkopieren.
    expect(anweisung).toContain(`Anfang des Gesprächs ${MCP_WERKZEUGE.mappeUebersicht}`);
    expect(anweisung).toContain(MCP_WERKZEUGE.tagStand);
    expect(anweisung).toMatch(/Kopier nie ein ganzes Artefakt zurück in den Chat/);
  });

  it('tools/list: genau die Namen aus MCP_WERKZEUGE, alle readOnlyHint, deutsche Beschreibung', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    const { tools } = await c.listTools();
    expect(tools.map((t) => t.name).sort()).toStrictEqual(['artefakt_lesen', 'artefakt_pruefen', 'mappe_uebersicht', 'methode_erklaeren', 'tag_stand', 'verknuepfungen_pruefen']);
    expect(Object.values(MCP_WERKZEUGE).sort()).toStrictEqual(tools.map((t) => t.name).sort());
    for (const t of tools) {
      expect(t.annotations?.readOnlyHint, t.name).toBe(true);
      expect(t.description?.length ?? 0, t.name).toBeGreaterThan(60);
    }
    // Kein Werkzeug nimmt ein Argument, das ein Repo oder eine Person nennt.
    for (const t of tools) {
      const felder = Object.keys((t.inputSchema.properties ?? {}) as object);
      expect(felder.every((f) => ['artefakt', 'slug', 'pruefpunkt', 'tag'].includes(f)), `${t.name}: ${felder}`).toBe(true);
    }
    const pruefen = tools.find((t) => t.name === 'artefakt_pruefen')!;
    // Das outputSchema beschreibt nur, was der Server liefert; die Befunde schreibt Claude in die Antwort.
    // Kein markdown: das Artefakt steht nur im Text des Ergebnisses.
    expect(Object.keys(pruefen.outputSchema?.properties ?? {}).sort()).toStrictEqual(['anleitung', 'artefakt', 'feedback', 'gesperrt', 'pruefpunkte', 'titel', 'vorarbeit', 'vorhanden']);
    // Die Arten der Befunde kommen aus verknuepfungen.ts, nicht aus einer zweiten Liste.
    const verkn = tools.find((t) => t.name === MCP_WERKZEUGE.verknuepfungenPruefen)!;
    const befund = (verkn.outputSchema?.properties as { befunde: { items: { properties: { art: { enum: string[] } } } } }).befunde;
    expect(befund.items.properties.art.enum).toStrictEqual([...BEFUND_ARTEN]);
    // Beschreibung und Prüfung stimmen überein: „getan“ ohne Beleg ist ein Befund.
    expect(verkn.description).toContain('„getan“ ohne Beleg');
    expect(pruefen.description).toMatch(/höchstens drei Befunde/);
    expect(Object.keys(pruefen.inputSchema.properties ?? {})).toContain('pruefpunkt');
    expect(pruefen.inputSchema.required).toStrictEqual(['artefakt']);
    expect(pruefen.description).toContain('pruefpunkt');
  });

  it('artefakt_pruefen(annahmen): Markdown + die Prüfpunkte aus methoden.ts mit festen IDs, ohne alte Positions-ID', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'annahmen' } });
    expect(r.isError).toBeFalsy();
    const sc = r.structuredContent as { artefakt: string; markdown: string; pruefpunkte: { id: string; text: string }[] };
    const liste = METHODEN.find((m) => m.slug === 'annahmen')!.pruefliste!;
    expect(sc.pruefpunkte).toStrictEqual(liste.map((p) => ({ id: p.id, text: p.text })));
    expect(sc.pruefpunkte.map((p) => p.id)).toStrictEqual([
      'annahmen-pruefbar', 'annahmen-arten', 'annahmen-wichtig-beleg', 'annahmen-riskanteste', 'annahmen-loesung', 'annahmen-getan-quelle',
    ]);
    expect(sc).not.toHaveProperty('befunde');
    expect(sc).not.toHaveProperty('markdown');
    const t = text(r);
    expect(t).toContain(TEXT_A);
    // Nummer und ID je Zeile: pruefpunkt nimmt beides an.
    expect(t).toContain(`\n1. annahmen-pruefbar: ${liste[0].text}\n`);
    expect(t).toContain(`\n6. annahmen-getan-quelle: ${liste[5].text}\n`);
    expect(t).not.toContain('annahmen-6');
  });

  it('artefakt_pruefen(leitfaden): IDs mit dem Slug der Methodenseite (interview-ziel …), auch ohne gespeichertes Artefakt', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'leitfaden' } });
    expect(r.isError).toBeFalsy();
    const sc = r.structuredContent as { vorhanden: boolean; pruefpunkte: { id: string }[] };
    expect(sc.vorhanden).toBe(false);
    expect(sc.pruefpunkte[0].id).toBe('interview-ziel');
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

  it('Lehrende-Token ohne Demo-Mappe: Satz mit dem Weg zur Demo-Mappe, nichts aus den Mappen der Studierenden (NDU-37)', async () => {
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
      expect(r.isError, name).toBe(true);
      expect(text(r), name).toBe(`Deine Demo-Mappe gibt es noch nicht. Öffne einmal „Meine Demo-Mappe“ unter ${BASIS}/innolab/mappe?ansicht=demo, dann wird sie angelegt.`);
      expect(JSON.stringify(r), name).not.toContain(TEXT_A);
    }
    expect(lesen).not.toHaveBeenCalled();
    const m = await c.callTool({ name: 'methode_erklaeren', arguments: { slug: 'annahmen' } });
    expect(m.isError).toBeFalsy();
  });

  it('Lehrende-Token mit Demo-Mappe: alle Mappe-Werkzeuge lesen test-demo-1000, nie eine Mappe der Studierenden (NDU-37)', async () => {
    const h = await aufbau();
    const TEXT_DEMO = 'Wir glauben, dass die Kaffeebar der Demo vorbestellen lässt.';
    const { repo } = await h.speicher.anlegen({ kohorte: 'test', rolle: 'lehrende', kuerzel: 'demo-1000' }, 1000);
    expect(repo).toBe('test-demo-1000');
    await h.speicher.speichern(repo, 'annahmen', { 'mappe/annahmen.json': `${JSON.stringify(mitText(TEXT_DEMO), null, 2)}\n` }, null, AUTOR, 'Annahmen');
    const lesen = vi.spyOn(h.speicher, 'lesen');
    const c = await client(h, await accessToken(h, 1000, 'lehrende'));

    const u = await c.callTool({ name: 'mappe_uebersicht', arguments: {} });
    expect(u.isError).toBeFalsy();
    expect(u.structuredContent).toMatchObject({ kohorte: 'test', repo: 'test-demo-1000' });
    expect(text(u)).toContain('Deine Demo-Mappe (Kohorte test, zählt nicht als Mappe der Kohorte):');
    expect(text(u)).toContain(`${BASIS}/innolab/mappe?ansicht=demo`);
    for (const [name, args] of [
      ['artefakt_lesen', { artefakt: 'annahmen' }],
      ['artefakt_pruefen', { artefakt: 'annahmen' }],
    ] as const) {
      const r = await c.callTool({ name, arguments: args });
      expect(r.isError, name).toBeFalsy();
      expect(text(r), name).toContain(TEXT_DEMO);
      expect(JSON.stringify(r), name).not.toContain(TEXT_A);
      expect(JSON.stringify(r), name).not.toContain(TEXT_B);
    }
    expect((await c.callTool({ name: 'verknuepfungen_pruefen', arguments: {} })).isError).toBeFalsy();
    expect(new Set(lesen.mock.calls.map(([r]) => r))).toStrictEqual(new Set(['test-demo-1000']));
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
      // Feste IDs wie in artefakt_pruefen, ohne die alte Positions-ID (alt).
      pruefliste: m.pruefliste!.map((p) => ({ id: p.id, text: p.text })),
      ki: m.ki,
      quelle: m.quelle,
      link: `${BASIS}/innolab/methoden/interview`,
    });
    const alles = JSON.stringify(r);
    expect(alles).not.toContain('Ja, total!');
    expect(alles).not.toContain('<');
    expect(text(r)).toContain(m.frage);
    expect(text(r)).toContain(`${BASIS}/innolab/methoden/interview`);
    m.pruefliste!.forEach((p, i) => expect(text(r)).toContain(`\n${i + 1}. ${p.id}: ${p.text}\n`));
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
        art: 'fehlender-beleg', artefakt: 'annahmen', ort: id, text: `${id} hat die Belegstufe „getan“, nennt aber keine Quelle: weder eine Beleg-Notiz noch eine Entscheidung, die selbst „getan“ ist und eine Beleg-Notiz hat. Ein Interview-Zitat belegt höchstens „erzählt“. Wo liegt das beobachtete Verhalten?`,
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

// NDU-24: Vorarbeit zum Abgleich; NDU-25: Fokus auf einen Prüfpunkt.
describe('artefakt_pruefen: Vorarbeit und Prüfpunkt im Fokus', () => {
  const LEITFADEN = `${JSON.stringify(leitfadenBeispiel, null, 2)}\n`;
  const ZIEL = leitfadenBeispiel.ziel.replace(/\*/g, '\\*');
  const sc = (r: Awaited<ReturnType<Client['callTool']>>) =>
    r.structuredContent as { pruefpunkte: { id: string; text: string }[]; vorarbeit: { artefakt: string; titel: string; vorhanden: boolean }[]; anleitung: string };

  it('leitfaden: Brief und Annahmen-Map kommen mit, getrennt nach dem Artefakt; Markdown nicht doppelt', async () => {
    const h = await aufbau();
    await h.speicher.speichern('test-jonas', 'leitfaden', { 'mappe/leitfaden.json': LEITFADEN }, null, AUTOR, 'Leitfaden');
    const c = await client(h, await accessToken(h, 1002));
    const r = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'leitfaden' } });
    expect(r.isError).toBeFalsy();
    expect(sc(r).vorarbeit).toStrictEqual([
      { artefakt: 'brief', titel: 'Produkt-Brief', vorhanden: true },
      { artefakt: 'annahmen', titel: 'Annahmen-Map', vorhanden: true },
    ]);
    const t = text(r);
    const artefakt = t.indexOf('## Artefakt');
    const brief = t.indexOf('## Vorarbeit zum Abgleich: Produkt-Brief (brief)');
    const annahmen = t.indexOf('## Vorarbeit zum Abgleich: Annahmen-Map (annahmen)');
    const anleitung = t.indexOf('## So antwortest du');
    expect(artefakt).toBeGreaterThan(-1);
    expect(brief).toBeGreaterThan(artefakt);
    expect(annahmen).toBeGreaterThan(brief);
    expect(anleitung).toBeGreaterThan(annahmen);
    expect(t.slice(artefakt, brief)).toContain(ZIEL);
    expect(t.slice(annahmen, anleitung)).toContain(TEXT_B);
    // Überschriften der eingebetteten Artefakte stehen unter den ##-Abschnitten, sonst endete „Artefakt“ bei der ersten.
    expect(t.slice(brief, annahmen)).toContain('\n#### 1. Für wen?');
    expect(t.slice(artefakt, brief)).toContain('\n### Interviewleitfaden\n');
    expect(t.split('\n').filter((z) => /^#{1,2} /.test(z))).toStrictEqual([
      '# Prüfung: Interviewleitfaden',
      '## Prüfpunkte (Jobs to be Done & Mom Test)',
      '## Artefakt',
      '## Vorarbeit zum Abgleich: Produkt-Brief (brief)',
      '## Vorarbeit zum Abgleich: Annahmen-Map (annahmen)',
      '## So antwortest du',
    ]);
    // Das geprüfte Artefakt steht genau einmal im Ergebnis, nicht noch einmal in structuredContent.
    expect(t.split(ZIEL)).toHaveLength(2);
    expect(JSON.stringify(r.structuredContent)).not.toContain(leitfadenBeispiel.ziel);
    expect(sc(r).anleitung).toMatch(/Vorarbeit dient nur zum Abgleich; aus ihr zitierst du nicht/);
    expect(sc(r).anleitung).toMatch(/nur aus dem Abschnitt „Artefakt“ und nenn die ID der Zeile, wo sie eine hat \(wie F4\)/);
    // Die A-IDs der Vorarbeit sind kein Beispiel für Stellen im Leitfaden.
    expect(sc(r).anleitung).not.toMatch(/A3/);
    expect(sc(r).anleitung).not.toMatch(/nicht abgleichen/);
  });

  it('fehlende Vorarbeit -> klarer Hinweis im Text, vorhanden: false, Anleitung sagt es weiter', async () => {
    const h = await aufbau();
    // Sofie hat eine Annahmen-Map, aber keinen Brief.
    await h.speicher.speichern('test-sofie', 'leitfaden', { 'mappe/leitfaden.json': LEITFADEN }, null, AUTOR, 'Leitfaden');
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'leitfaden' } });
    expect(r.isError).toBeFalsy();
    expect(sc(r).vorarbeit.map((v) => [v.artefakt, v.vorhanden])).toStrictEqual([
      ['brief', false],
      ['annahmen', true],
    ]);
    const t = text(r);
    expect(t).toContain('## Vorarbeit zum Abgleich: Produkt-Brief (brief)');
    expect(t).toContain('Produkt-Brief: noch nicht ausgefüllt. Was sich darauf bezieht, lässt sich nicht abgleichen.');
    expect(t).toContain(TEXT_A);
    expect(sc(r).anleitung).toMatch(/dass du sie nicht abgleichen konntest/);
    expect(sc(r).anleitung).toMatch(/nur bei „noch nicht ausgefüllt“, dass sie fehlt/);
  });

  it('unlesbare Vorarbeit verhindert die Prüfung nicht', async () => {
    const h = await aufbau();
    // Jonas hat schon einen Brief: überschreiben mit seinem aktuellen basisSha.
    const { basisSha } = await h.speicher.lesen('test-jonas', 'brief');
    expect(await h.speicher.speichern('test-jonas', 'brief', { 'mappe/brief.json': '{ kaputt' }, basisSha, AUTOR, 'kaputt')).not.toHaveProperty('konflikt');
    await h.speicher.speichern('test-jonas', 'leitfaden', { 'mappe/leitfaden.json': LEITFADEN }, null, AUTOR, 'Leitfaden');
    const c = await client(h, await accessToken(h, 1002));
    const r = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'leitfaden' } });
    expect(r.isError).toBeFalsy();
    expect(sc(r).vorarbeit.find((v) => v.artefakt === 'brief')?.vorhanden).toBe(false);
    expect(text(r)).toMatch(/Produkt-Brief: Diese Datei passt nicht zum Format/);
    expect(text(r)).toContain(ZIEL);
  });

  it('GitHub-Ausfall bei der Vorarbeit: Prüfung läuft, Hinweis statt Brief', async () => {
    const h = await aufbau();
    await h.speicher.speichern('test-jonas', 'leitfaden', { 'mappe/leitfaden.json': LEITFADEN }, null, AUTOR, 'Leitfaden');
    const echt = h.speicher.lesen.bind(h.speicher);
    vi.spyOn(h.speicher, 'lesen').mockImplementation((repo, name) => (name === 'brief' ? Promise.reject(new GithubAusnahme(500)) : echt(repo, name)));
    const fehler = vi.spyOn(console, 'error').mockImplementation(() => {});
    const c = await client(h, await accessToken(h, 1002));
    const r = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'leitfaden' } });
    expect(r.isError).toBeFalsy();
    expect(text(r)).toContain('Produkt-Brief: ließ sich gerade nicht lesen.');
    expect(text(r)).toContain(ZIEL);
    expect(sc(r).vorarbeit.find((v) => v.artefakt === 'brief')?.vorhanden).toBe(false);
    expect(fehler).toHaveBeenCalled();
  });

  it('brief: Anleitung ohne Zeilen-ID (der Brief hat keine)', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h, 1002));
    const r = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'brief' } });
    expect(sc(r).anleitung).toMatch(/Zitiere nur aus dem Abschnitt „Artefakt“\./);
    expect(sc(r).anleitung).not.toMatch(/ID der Zeile/);
  });

  it('leeres Artefakt: keine Vorarbeit mitgeliefert; Methode ohne Vorarbeit: kein Abschnitt', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h, 1002));
    const leer = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'leitfaden' } });
    expect(sc(leer).vorarbeit).toStrictEqual([]);
    expect(text(leer)).not.toContain('Vorarbeit');
    expect(text(leer)).not.toContain(TEXT_B);
    const brief = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'brief' } });
    expect(sc(brief).vorarbeit).toStrictEqual([]);
    expect(text(brief)).not.toContain('Vorarbeit');
  });

  it('mit pruefpunkt: nur dieser Punkt, mehr als drei Stellen erlaubt, Frage nach dem nächsten', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    const liste = METHODEN.find((m) => m.slug === 'annahmen')!.pruefliste!;
    const r = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'annahmen', pruefpunkt: 'annahmen-arten' } });
    expect(r.isError).toBeFalsy();
    expect(sc(r).pruefpunkte).toStrictEqual([{ id: 'annahmen-arten', text: liste[1].text }]);
    expect(sc(r).anleitung).toMatch(/^Prüf nur annahmen-arten\./);
    expect(sc(r).anleitung).toMatch(/auch mehr als drei/);
    expect(sc(r).anleitung).toMatch(/ob als Nächstes annahmen-wichtig-beleg drankommen soll/);
    expect(sc(r).anleitung).not.toMatch(/[Hh]öchstens drei/);
    const t = text(r);
    expect(t).toContain('## Prüfpunkt im Fokus');
    expect(t).not.toContain('annahmen-pruefbar:');
    // Die Nummer bleibt die Position in der ganzen Liste, nicht 1.
    expect(t).toContain(`\n2. annahmen-arten: ${liste[1].text}\n`);
    expect(t).toContain(TEXT_A);

    // Der letzte Punkt der Liste, aus methoden.ts statt fest.
    const letzter = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'annahmen', pruefpunkt: liste.at(-1)!.id } });
    expect(sc(letzter).anleitung).toMatch(/letzte Prüfpunkt/);
    expect(sc(letzter).anleitung).not.toMatch(/Als Nächstes|als Nächstes/);
  });

  it('pruefpunkt tolerant: feste ID in jeder Schreibweise, ohne Präfix, alte Positions-ID, Nummer', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    for (const pruefpunkt of ['annahmen-loesung', 'Annahmen-Lösung', ' loesung ', 'Lösung', 'annahmen–loesung', 'annahmen-loesung.', 'annahmen-loesung?', '„Lösung“']) {
      const r = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'annahmen', pruefpunkt } });
      expect(r.isError, pruefpunkt).toBeFalsy();
      expect(sc(r).pruefpunkte.map((p) => p.id), pruefpunkt).toStrictEqual(['annahmen-loesung']);
    }
  });

  it('pruefpunkt mit Wörtern und Zeichen: „Wichtig & Beleg“ meint annahmen-wichtig-beleg', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    for (const pruefpunkt of ['Wichtig & Beleg', 'wichtig/beleg', 'Prüfpunkt „wichtig-beleg“']) {
      const r = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'annahmen', pruefpunkt } });
      expect(sc(r).pruefpunkte.map((p) => p.id), pruefpunkt).toStrictEqual(['annahmen-wichtig-beleg']);
    }
  });

  it('alte Positions-IDs (vor NDU-28) zeigen über alt weiter auf ihren Punkt, auch wenn die Liste umsortiert wird', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    const m = METHODEN.find((x) => x.slug === 'annahmen')!;
    const vorher = m.pruefliste!;
    // Umsortieren: annahmen-loesung steht nun vorne; die alte ID annahmen-5 bleibt bei ihr, die Nummer 5 nicht.
    m.pruefliste = [vorher[4], ...vorher.slice(0, 4), vorher[5]];
    try {
      for (const pruefpunkt of ['annahmen-5', 'Annahmen 5', 'annahmen-05']) {
        const r = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'annahmen', pruefpunkt } });
        expect(sc(r).pruefpunkte.map((p) => p.id), pruefpunkt).toStrictEqual(['annahmen-loesung']);
      }
      const nummer = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'annahmen', pruefpunkt: '5' } });
      expect(sc(nummer).pruefpunkte.map((p) => p.id)).toStrictEqual(['annahmen-riskanteste']);
    } finally {
      m.pruefliste = vorher;
    }
  });

  it('pruefpunkt als Nummer und alte Positions-ID in der heutigen Reihenfolge', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    for (const pruefpunkt of ['Annahmen-5', ' annahmen 5 ', 'annahmen–5', 'annahmen−5', 'annahmen-5.', 'annahmen-05', '5', '05', 'Punkt 5', 'Prüfpunkt 5:', '#5']) {
      const r = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'annahmen', pruefpunkt } });
      expect(r.isError, pruefpunkt).toBeFalsy();
      expect(sc(r).pruefpunkte.map((p) => p.id), pruefpunkt).toStrictEqual(['annahmen-loesung']);
    }
  });

  it('pruefpunkt mit dem Artefaktnamen statt des Slugs: leitfaden-zukunft, auch die alte ID leitfaden-2', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h, 1002));
    for (const pruefpunkt of ['leitfaden-zukunft', 'interview-zukunft', 'zukunft', 'leitfaden-2', 'interview-2', '2']) {
      const r = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'leitfaden', pruefpunkt } });
      expect(r.isError, pruefpunkt).toBeFalsy();
      expect(sc(r).pruefpunkte.map((p) => p.id), pruefpunkt).toStrictEqual(['interview-zukunft']);
    }
  });

  it('Lehrende-Token ohne Demo-Mappe mit unbekanntem pruefpunkt: zuerst der Satz zur Demo-Mappe', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h, 1000, 'lehrende'));
    const r = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'annahmen', pruefpunkt: 'annahmen-9' } });
    expect(r.isError).toBe(true);
    expect(text(r)).toMatch(/Demo-Mappe gibt es noch nicht/);
    expect(text(r)).not.toMatch(/Prüfpunkt/);
  });

  it('ohne pruefpunkt ("", null, fehlt): alle Punkte, höchstens drei Befunde wie bisher', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    for (const args of [{ artefakt: 'annahmen' }, { artefakt: 'annahmen', pruefpunkt: '' }, { artefakt: 'annahmen', pruefpunkt: null }]) {
      const r = await c.callTool({ name: 'artefakt_pruefen', arguments: args });
      expect(r.isError, JSON.stringify(args)).toBeFalsy();
      expect(sc(r).pruefpunkte).toHaveLength(METHODEN.find((m) => m.slug === 'annahmen')!.pruefliste!.length);
      expect(sc(r).anleitung).toMatch(/^Höchstens drei Befunde/);
      expect(sc(r).anleitung).not.toMatch(/drankommen/);
    }
  });

  it('unbekannter pruefpunkt (auch einer anderen Methode) -> Hinweis mit den gültigen IDs, nichts gelesen', async () => {
    const h = await aufbau();
    const lesen = vi.spyOn(h.speicher, 'lesen');
    const c = await client(h, await accessToken(h));
    for (const pruefpunkt of ['annahmen-9', 'interview-ziel', 'interview-1', '9', '0', 'gibtsnicht']) {
      const r = await c.callTool({ name: 'artefakt_pruefen', arguments: { artefakt: 'annahmen', pruefpunkt } });
      expect(r.isError, pruefpunkt).toBe(true);
      expect(text(r)).toContain(`„${pruefpunkt}“ gibt es für Annahmen-Map nicht`);
      expect(text(r)).toContain(METHODEN.find((m) => m.slug === 'annahmen')!.pruefliste!.map((p) => p.id).join(', '));
      expect(text(r)).not.toContain(TEXT_A);
    }
    expect(lesen).not.toHaveBeenCalled();
  });
});

// NDU-27: Kurstag und Stand der Mappe.
describe('tag_stand', () => {
  type StandSc = { tag: number; lage: string; datum: string | null; faellig: { artefakt: string; stand: string; umfang: string; fehlt: string[] }[]; inArbeit: unknown[]; entsteht: { slug: string }[] };
  const sc = (r: Awaited<ReturnType<Client['callTool']>>) => r.structuredContent as StandSc;
  const json = (d: unknown) => `${JSON.stringify(d, null, 2)}\n`;
  const alleSpeichern = async (h: Aufbau, repo: string, daten: Record<string, unknown>) => {
    for (const [name, d] of Object.entries(daten)) {
      const { basisSha } = await h.speicher.lesen(repo, name as 'brief');
      await h.speicher.speichern(repo, name as 'brief', { [`mappe/${name}.json`]: json(d) }, basisSha, AUTOR, name);
    }
  };

  it('leere Mappe (nur Annahmen): zu Tag 2 ist alles fällig, das meiste leer', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: MCP_WERKZEUGE.tagStand, arguments: { tag: 2 } });
    expect(r.isError).toBeFalsy();
    const s = sc(r);
    expect(s).toMatchObject({ tag: 2, lage: 'gewaehlt', datum: null });
    expect(s.faellig.map((f) => [f.artefakt, f.stand])).toStrictEqual([
      ['brief', 'leer'],
      ['entscheidungen', 'leer'],
      ['annahmen', 'ausgefuellt'],
      ['leitfaden', 'leer'],
      ['interviews', 'leer'],
    ]);
    expect(s.entsteht.map((m) => m.slug)).toContain('synthese');
    const t = text(r);
    expect(t).toContain('## Fällig bis Tag 2');
    expect(t).toContain('- Interviews und Snapshots (interviews): leer – noch nicht angelegt');
    // Nur Zahlen, kein Artefakttext.
    expect(t).not.toContain(TEXT_A);
  });

  it('teilweise Mappe: „2 von 5 Snapshots“ und welches Interview ohne Chance ist', async () => {
    const h = await aufbau();
    const iv = structuredClone(interviewsBeispiel);
    iv.interviews = iv.interviews.slice(0, 2);
    iv.interviews[1].chancen = [];
    await alleSpeichern(h, 'test-sofie', { brief: briefBeispiel, interviews: iv });
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: MCP_WERKZEUGE.tagStand, arguments: { tag: 2 } });
    const interviews = sc(r).faellig.find((f) => f.artefakt === 'interviews')!;
    expect(interviews).toMatchObject({ stand: 'duenn', umfang: '2 von 5 Snapshots' });
    expect(interviews.fehlt).toStrictEqual(['noch 3 von 5 Interviews offen', 'I2 ohne Chance']);
    expect(text(r)).toContain('Interviews und Snapshots (interviews): dünn – 2 von 5 Snapshots; noch 3 von 5 Interviews offen; I2 ohne Chance');
  });

  it('volle Mappe: alles ausgefüllt', async () => {
    const h = await aufbau();
    await alleSpeichern(h, 'test-jonas', { entscheidungen: entscheidungenBeispiel, leitfaden: leitfadenBeispiel, annahmen: annahmenBeispiel, interviews: interviewsBeispiel });
    const c = await client(h, await accessToken(h, 1002));
    const r = await c.callTool({ name: MCP_WERKZEUGE.tagStand, arguments: { tag: 2 } });
    expect(sc(r).faellig.map((f) => f.stand)).toStrictEqual(['ausgefuellt', 'ausgefuellt', 'ausgefuellt', 'ausgefuellt', 'ausgefuellt']);
    expect(sc(r).faellig.flatMap((f) => f.fehlt)).toStrictEqual([]);
  });

  it('ohne tag ("", null, fehlt): Termine der Kohorte entscheiden (Kohorte test ohne Termine -> Tag 1, in Arbeit)', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    for (const args of [{}, { tag: null }, { tag: '' }]) {
      const r = await c.callTool({ name: MCP_WERKZEUGE.tagStand, arguments: args });
      expect(r.isError, JSON.stringify(args)).toBeFalsy();
      expect(sc(r)).toMatchObject({ tag: 1, lage: 'naechster', datum: null, ohneTermin: [] });
      expect(sc(r).faellig).toStrictEqual([]);
      expect(sc(r).inArbeit).toHaveLength(5);
      expect(text(r)).toContain('Termin noch offen');
    }
  });

  it('GitHub-Ausfall bei einem Artefakt: nur diese Zeile „nicht gelesen“, die anderen bleiben', async () => {
    const h = await aufbau();
    const echt = h.speicher.lesen.bind(h.speicher);
    vi.spyOn(h.speicher, 'lesen').mockImplementation((repo, name) => (name === 'interviews' ? Promise.reject(new GithubAusnahme(502)) : echt(repo, name)));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: MCP_WERKZEUGE.tagStand, arguments: { tag: 2 } });
    expect(r.isError).toBeFalsy();
    expect(sc(r).faellig.find((f) => f.artefakt === 'interviews')?.stand).toBe('nicht-gelesen');
    expect(sc(r).faellig.find((f) => f.artefakt === 'annahmen')?.stand).toBe('ausgefuellt');
  });

  it('anderer Fehler beim Lesen (kein GitHub-Ausfall): Fehlerergebnis statt „nicht gelesen“', async () => {
    const h = await aufbau();
    vi.spyOn(h.speicher, 'lesen').mockRejectedValue(new TypeError('kaputt'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: MCP_WERKZEUGE.tagStand, arguments: { tag: 2 } });
    expect(r.isError).toBe(true);
    expect(text(r)).toMatch(/etwas schiefgegangen/);
  });

  it('unlesbare Datei zählt als unlesbar, ungültiger tag -> Fehlerergebnis, Lehrende -> Satz zur Lehrende-Ansicht', async () => {
    const h = await aufbau();
    await h.speicher.speichern('test-sofie', 'brief', { 'mappe/brief.json': '{ kaputt' }, null, AUTOR, 'kaputt');
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: MCP_WERKZEUGE.tagStand, arguments: { tag: 2 } });
    expect(sc(r).faellig.find((f) => f.artefakt === 'brief')?.stand).toBe('unlesbar');
    for (const tag of [0, 8, 2.5, 'zwei', '-1']) {
      const f = await c.callTool({ name: MCP_WERKZEUGE.tagStand, arguments: { tag } });
      expect(f.isError, String(tag)).toBe(true);
      expect(text(f), String(tag)).toMatch(/Möglich sind 1 bis 7/);
    }
    // Zahl als Text (ChatGPT) gilt.
    expect(sc(await c.callTool({ name: MCP_WERKZEUGE.tagStand, arguments: { tag: '2' } })).tag).toBe(2);
    const lehrende = await client(h, await accessToken(h, 1000, 'lehrende'));
    const l = await lehrende.callTool({ name: MCP_WERKZEUGE.tagStand, arguments: {} });
    expect(l.isError).toBe(true);
    expect(text(l)).toMatch(/Demo-Mappe gibt es noch nicht/);
  });
});

// NDU-29: Die Interview-Prüfliste verrät den Mom Test – erst nach dem Aufdecken (MOM_TEST_GRUPPE) oder NACH_MOM_TEST.
describe('Connector hält sich an Aufdecken (Mom Test)', () => {
  // Kurstag 22.10.2026, 10:00 in Wien (UTC+2) – vor NACH_MOM_TEST (16:45).
  const VORMITTAG = Date.parse('2026-10-22T08:00:00Z');
  const LEITFADEN = `${JSON.stringify(leitfadenBeispiel, null, 2)}\n`;
  const interview = METHODEN.find((m) => m.slug === 'interview')!;

  async function amKurstag(ms = VORMITTAG, rolle: { githubId: number; rolle: 'studierende' | 'lehrende' } = { githubId: 1002, rolle: 'studierende' }) {
    const h = await aufbau();
    h.uhr.ms = ms;
    await h.speicher.speichern('test-jonas', 'leitfaden', { 'mappe/leitfaden.json': LEITFADEN }, null, AUTOR, 'Leitfaden');
    const c = await client(h, await accessToken(h, rolle.githubId, rolle.rolle));
    return { h, c };
  }
  const aufdecken = (h: Aufbau, kennung = MOM_TEST_GRUPPE, ms = h.uhr.ms) => h.abh.cache.set(aufgedecktSchluessel(kennung, new Date(ms)), true, 3600);
  const zu = (r: Awaited<ReturnType<Client['callTool']>>) => {
    for (const p of interview.pruefliste!) {
      expect(text(r), p.id).not.toContain(p.text);
      expect(text(r), p.id).not.toContain(p.id);
    }
    expect(r.structuredContent ?? {}).not.toHaveProperty('pruefliste');
  };
  const NOCHMAL = (werkzeug: string) => `Sobald Markus die Übung aufgedeckt hat, ruf ${werkzeug} noch einmal auf.`;

  it('vor dem Aufdecken: methode_erklaeren(interview) ohne Prüfliste, mit „Kommt nach der Übung“', async () => {
    const { c } = await amKurstag();
    const r = await c.callTool({ name: MCP_WERKZEUGE.methodeErklaeren, arguments: { slug: 'interview' } });
    expect(r.isError).toBeFalsy();
    expect(r.structuredContent).not.toHaveProperty('pruefliste');
    expect(r.structuredContent).toMatchObject({ slug: 'interview', prueflisteGesperrt: true, frage: interview.frage });
    expect(text(r)).toContain('Kommt nach der Übung');
    expect(text(r)).toContain('spätestens am 22.10. um 16:45');
    expect(text(r)).toContain(NOCHMAL(MCP_WERKZEUGE.methodeErklaeren));
    zu(r);
  });

  it('vor dem Aufdecken: artefakt_pruefen(leitfaden) prüft nicht – auch nicht mit pruefpunkt –, kein Leitfaden-Text', async () => {
    const { c } = await amKurstag();
    for (const args of [{ artefakt: 'leitfaden' }, { artefakt: 'leitfaden', pruefpunkt: '2' }]) {
      const r = await c.callTool({ name: MCP_WERKZEUGE.artefaktPruefen, arguments: args });
      // Kein Fehlerergebnis (Clients zeigten sonst einen Werkzeugfehler); structuredContent passt zum outputSchema,
      // sonst hätte der Client hier schon geworfen.
      expect(r.isError, JSON.stringify(args)).toBeFalsy();
      expect(r.structuredContent).toMatchObject({ artefakt: 'leitfaden', gesperrt: true, pruefpunkte: [], vorarbeit: [] });
      expect(r.structuredContent).not.toHaveProperty('vorhanden');
      expect((r.structuredContent as { anleitung: string }).anleitung).toMatch(/^Kommt nach der Übung/);
      expect(text(r)).toContain('Kommt nach der Übung');
      expect(text(r)).toContain(NOCHMAL(MCP_WERKZEUGE.artefaktPruefen));
      expect(text(r)).not.toContain(leitfadenBeispiel.wen);
      zu(r);
    }
  });

  it('Demo-Mappe der Lehrenden (NDU-37): artefakt_pruefen(leitfaden) gesperrt wie bei Studierenden, nach dem Aufdecken offen', async () => {
    const { h, c } = await amKurstag(VORMITTAG, { githubId: 1000, rolle: 'lehrende' });
    const { repo } = await h.speicher.anlegen({ kohorte: 'test', rolle: 'lehrende', kuerzel: 'demo-1000' }, 1000);
    await h.speicher.speichern(repo, 'leitfaden', { 'mappe/leitfaden.json': LEITFADEN }, null, AUTOR, 'Leitfaden');
    const vorher = await c.callTool({ name: MCP_WERKZEUGE.artefaktPruefen, arguments: { artefakt: 'leitfaden' } });
    expect(vorher.isError).toBeFalsy();
    expect(vorher.structuredContent).toMatchObject({ artefakt: 'leitfaden', gesperrt: true, pruefpunkte: [] });
    expect(text(vorher)).not.toContain(leitfadenBeispiel.wen);
    zu(vorher);
    await aufdecken(h);
    const nachher = await c.callTool({ name: MCP_WERKZEUGE.artefaktPruefen, arguments: { artefakt: 'leitfaden' } });
    expect(nachher.isError).toBeFalsy();
    expect(nachher.structuredContent).not.toHaveProperty('gesperrt');
    expect(nachher.structuredContent).toHaveProperty('vorhanden', true);
    expect((nachher.structuredContent as { pruefpunkte: unknown[] }).pruefpunkte).toHaveLength(interview.pruefliste!.length);
    expect(text(nachher)).toContain(`${BASIS}/innolab/mappe?ansicht=demo`);
    expect(text(nachher)).not.toMatch(/\/innolab\/mappe(?!\?ansicht=demo)/);
    // Ohne Mappe (methode_erklaeren) bleibt die Prüfliste für Lehrende immer offen.
    expect((await c.callTool({ name: MCP_WERKZEUGE.methodeErklaeren, arguments: { slug: 'interview' } })).structuredContent).toHaveProperty('pruefliste');
  });

  it('vor dem Aufdecken: Lehrende und Personen ohne Mappe hören bei artefakt_pruefen(leitfaden) den Satz zur Mappe', async () => {
    const { h } = await amKurstag();
    const lehrende = await client(h, await accessToken(h, 1000, 'lehrende'));
    const l = await lehrende.callTool({ name: MCP_WERKZEUGE.artefaktPruefen, arguments: { artefakt: 'leitfaden' } });
    expect(l.isError).toBe(true);
    expect(text(l)).toMatch(/Demo-Mappe gibt es noch nicht/);
    h.abh.umgebung.zugang.test.studierende.push({ githubId: 1003, kuerzel: 'neu' });
    const ohne = await client(h, await accessToken(h, 1003));
    const o = await ohne.callTool({ name: MCP_WERKZEUGE.artefaktPruefen, arguments: { artefakt: 'leitfaden' } });
    expect(o.isError).toBe(true);
    expect(text(o)).toBe(KEINE_MAPPE);
  });

  it('vor dem Aufdecken: ohne Mappe fragt artefakt_pruefen gar nicht erst nach dem Aufdecken', async () => {
    const { h } = await amKurstag();
    h.abh.umgebung.zugang.test.studierende.push({ githubId: 1003, kuerzel: 'neu' });
    const ohne = await client(h, await accessToken(h, 1003));
    const get = vi.spyOn(h.abh.cache, 'get');
    await ohne.callTool({ name: MCP_WERKZEUGE.artefaktPruefen, arguments: { artefakt: 'leitfaden' } });
    expect(get.mock.calls.filter(([k]) => k.startsWith('aufgedeckt:'))).toStrictEqual([]);
  });

  it('vor dem Aufdecken: andere Methoden und Artefakte bleiben offen', async () => {
    const { c } = await amKurstag();
    const m = await c.callTool({ name: MCP_WERKZEUGE.methodeErklaeren, arguments: { slug: 'annahmen' } });
    expect(m.structuredContent).toHaveProperty('pruefliste');
    const p = await c.callTool({ name: MCP_WERKZEUGE.artefaktPruefen, arguments: { artefakt: 'annahmen' } });
    expect(p.isError).toBeFalsy();
    const l = await c.callTool({ name: MCP_WERKZEUGE.artefaktLesen, arguments: { artefakt: 'leitfaden' } });
    expect(l.isError).toBeFalsy();
  });

  it('nach dem Aufdecken (MOM_TEST_GRUPPE, heute): Prüfliste frei', async () => {
    const { h, c } = await amKurstag();
    await aufdecken(h);
    const m = await c.callTool({ name: MCP_WERKZEUGE.methodeErklaeren, arguments: { slug: 'interview' } });
    expect((m.structuredContent as { pruefliste: unknown[] }).pruefliste).toStrictEqual(interview.pruefliste!.map((p) => ({ id: p.id, text: p.text })));
    expect(m.structuredContent).not.toHaveProperty('prueflisteGesperrt');
    const p = await c.callTool({ name: MCP_WERKZEUGE.artefaktPruefen, arguments: { artefakt: 'leitfaden' } });
    expect(p.isError).toBeFalsy();
    expect((p.structuredContent as { pruefpunkte: unknown[] }).pruefpunkte).toHaveLength(interview.pruefliste!.length);
    expect(p.structuredContent).not.toHaveProperty('gesperrt');
    expect(p.structuredContent).toHaveProperty('vorhanden', true);
  });

  it('eine frühere Mom-Test-Übung (eigene Gruppe) oder ein Aufdecken von gestern öffnet sie nicht', async () => {
    const { h, c } = await amKurstag();
    await aufdecken(h, 'mom-test-auftakt');
    await aufdecken(h, MOM_TEST_GRUPPE, VORMITTAG - 24 * 3600 * 1000);
    const m = await c.callTool({ name: MCP_WERKZEUGE.methodeErklaeren, arguments: { slug: 'interview' } });
    expect(m.structuredContent).not.toHaveProperty('pruefliste');
  });

  it('ab NACH_MOM_TEST (16:45 in Wien) frei, auch ohne Aufdecken; 16:44 noch zu', async () => {
    const { c } = await amKurstag(Date.parse('2026-10-22T14:45:00Z'));
    const m = await c.callTool({ name: MCP_WERKZEUGE.methodeErklaeren, arguments: { slug: 'interview' } });
    expect(m.structuredContent).toHaveProperty('pruefliste');
    const { c: frueh } = await amKurstag(Date.parse('2026-10-22T14:44:00Z'));
    const f = await frueh.callTool({ name: MCP_WERKZEUGE.methodeErklaeren, arguments: { slug: 'interview' } });
    expect(f.structuredContent).not.toHaveProperty('pruefliste');
  });

  it('Lehrende sehen die Prüfliste immer', async () => {
    const { c } = await amKurstag(VORMITTAG, { githubId: 1000, rolle: 'lehrende' });
    const m = await c.callTool({ name: MCP_WERKZEUGE.methodeErklaeren, arguments: { slug: 'interview' } });
    expect(m.structuredContent).toHaveProperty('pruefliste');
  });

  it('Cache-Ausfall beim Nachsehen: lieber zu (und ins Log), die Werkzeuge antworten trotzdem', async () => {
    const { h, c } = await amKurstag();
    await aufdecken(h);
    const echt = h.abh.cache.get.bind(h.abh.cache);
    vi.spyOn(h.abh.cache, 'get').mockImplementation((k) => (k.startsWith('aufgedeckt:') ? Promise.reject(new Error('cache weg')) : echt(k)));
    const fehler = vi.spyOn(console, 'error').mockImplementation(() => {});
    const m = await c.callTool({ name: MCP_WERKZEUGE.methodeErklaeren, arguments: { slug: 'interview' } });
    expect(m.isError).toBeFalsy();
    expect(m.structuredContent).not.toHaveProperty('pruefliste');
    expect(fehler).toHaveBeenCalled();
  });
});

// NDU-35: Feedback der Lehrenden kommt mit artefakt_lesen und artefakt_pruefen mit – nur lesend, nie als Prüfbefund.
describe('Feedback der Lehrenden im Connector', () => {
  const D = '2026-10-23T09:00:00.000Z';
  async function mitFeedback(h: Aufbau, repo = 'test-sofie') {
    await feedbackAendern(h.speicher, repo, (f) => {
      const a = feedbackSchreiben(f, { artefakt: 'annahmen', zeilenId: 'A2', text: 'Woher stammt die Zahl?\n# Keine Überschrift', autor: 'markus', datum: D });
      const b = feedbackSchreiben(a, { artefakt: 'brief', text: 'Brief: nur hier.', autor: 'markus', datum: D });
      return erledigtSetzen(antworten(b, { antwortAuf: 'FB1', text: 'Aus der Kassa.', autor: 'sofie', datum: D }), 'FB2', true);
    }, AUTOR, 'Feedback');
  }

  it('artefakt_pruefen: eigener Abschnitt mit Zeile, Stand und Antwort; Anleitung: eingehen, nie als Befund; structuredContent.feedback', async () => {
    const h = await aufbau();
    await mitFeedback(h);
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: MCP_WERKZEUGE.artefaktPruefen, arguments: { artefakt: 'annahmen' } });
    expect(r.isError).toBeFalsy();
    const t = text(r);
    // Zwischen Artefakt (und Vorarbeit) und der Anleitung; der Text der Lehrperson ist ein Zitat und beginnt keine Überschrift.
    expect(t.split('\n').filter((z) => /^#{1,2} /.test(z))).toStrictEqual(['# Prüfung: Annahmen-Map', '## Prüfpunkte (Annahmen-Map)', '## Artefakt', '## Vorarbeit zum Abgleich: Produkt-Brief (brief)', '## Feedback der Lehrenden (kein Prüfbefund)', '## So antwortest du']);
    expect(t).toContain('- FB1: markus zu A2, 23.10.2026, offen\n  > Woher stammt die Zahl?\n  > # Keine Überschrift\n  - Antwort von sofie, 23.10.2026:\n    > Aus der Kassa.');
    expect(t).not.toContain('Brief: nur hier.');
    const sc = r.structuredContent as { anleitung: string; feedback: unknown };
    expect(sc.anleitung).toMatch(/nie als eigenen Befund/);
    expect(sc.anleitung).toMatch(/schreib selbst kein Feedback/);
    expect(sc.feedback).toStrictEqual([{
      id: 'FB1', zeile: 'A2', autor: 'markus', datum: '23.10.2026', text: 'Woher stammt die Zahl?\n# Keine Überschrift', erledigt: false,
      antworten: [{ autor: 'sofie', datum: '23.10.2026', text: 'Aus der Kassa.' }],
    }]);
  });

  it('artefakt_lesen: Abschnitt am Ende des Textes, structuredContent bleiben die Daten des Artefakts', async () => {
    const h = await aufbau();
    await mitFeedback(h);
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: MCP_WERKZEUGE.artefaktLesen, arguments: { artefakt: 'brief' } });
    // Sofie hat keinen Brief, aber Feedback dazu: Hinweis „noch nicht ausgefüllt“ und das Feedback, erledigt.
    expect(text(r)).toContain('noch nicht ausgefüllt');
    expect(text(r)).toContain('- FB2: markus zum ganzen Artefakt, 23.10.2026, erledigt\n  > Brief: nur hier.');
    const a = await c.callTool({ name: MCP_WERKZEUGE.artefaktLesen, arguments: { artefakt: 'annahmen' } });
    expect(a.structuredContent).toStrictEqual(mitText(TEXT_A));
    expect(text(a)).toContain('## Feedback der Lehrenden (kein Prüfbefund)');
  });

  it('artefakt_pruefen, Artefakt noch leer, aber mit Feedback: Anleitung sagt trotzdem, wie mit dem Feedback umzugehen ist', async () => {
    const h = await aufbau();
    await mitFeedback(h);
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: MCP_WERKZEUGE.artefaktPruefen, arguments: { artefakt: 'brief' } });
    expect(r.isError).toBeFalsy();
    const sc = r.structuredContent as { anleitung: string; vorhanden: boolean };
    expect(sc.vorhanden).toBe(false);
    expect(sc.anleitung.startsWith(ANLEITUNG_LEER)).toBe(true);
    expect(sc.anleitung).toMatch(/nie als eigenen Befund/);
    expect(sc.anleitung).toMatch(/schreib selbst kein Feedback/);
    expect(text(r)).toContain('- FB2: markus zum ganzen Artefakt');
  });

  it('ohne Feedback: kein Abschnitt, kein feedback-Schlüssel, Anleitung ohne den Satz', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: MCP_WERKZEUGE.artefaktPruefen, arguments: { artefakt: 'annahmen' } });
    expect(text(r)).not.toContain('Feedback der Lehrenden');
    expect(Object.keys(r.structuredContent ?? {}).sort()).toStrictEqual(['anleitung', 'artefakt', 'pruefpunkte', 'titel', 'vorarbeit', 'vorhanden']);
    expect((r.structuredContent as { anleitung: string }).anleitung).not.toMatch(/Feedback/);
  });

  it('nur das eigene: Feedback in Jonas’ Mappe erreicht Sofies Token nicht', async () => {
    const h = await aufbau();
    await mitFeedback(h, 'test-jonas');
    const c = await client(h, await accessToken(h, 1001));
    for (const name of [MCP_WERKZEUGE.artefaktPruefen, MCP_WERKZEUGE.artefaktLesen]) {
      const r = await c.callTool({ name, arguments: { artefakt: 'annahmen' } });
      expect(text(r), name).not.toContain('Woher stammt die Zahl?');
    }
  });

  it('nur lesend: Lesen schreibt nichts (auch nicht „gesehen“); es gibt kein Werkzeug zum Schreiben', async () => {
    const h = await aufbau();
    await mitFeedback(h);
    const vorher = await h.speicher.feedbackLesen('test-sofie');
    const commits = h.speicher.commits('test-sofie').length;
    const c = await client(h, await accessToken(h));
    await c.callTool({ name: MCP_WERKZEUGE.artefaktPruefen, arguments: { artefakt: 'annahmen' } });
    await c.callTool({ name: MCP_WERKZEUGE.artefaktLesen, arguments: { artefakt: 'annahmen' } });
    expect(h.speicher.commits('test-sofie')).toHaveLength(commits);
    expect(await h.speicher.feedbackLesen('test-sofie')).toStrictEqual(vorher);
    const { tools } = await c.listTools();
    expect(tools.some((t) => /feedback/i.test(t.name))).toBe(false);
  });

  it('unlesbares Feedback: das Werkzeug läuft, ein Satz statt des Feedbacks', async () => {
    const h = await aufbau();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await h.speicher.feedbackAendern('test-sofie', () => '{kaputt', AUTOR, 'x');
    const c = await client(h, await accessToken(h));
    const r = await c.callTool({ name: MCP_WERKZEUGE.artefaktPruefen, arguments: { artefakt: 'annahmen' } });
    expect(r.isError).toBeFalsy();
    expect(text(r)).toContain('Das Feedback der Lehrenden ließ sich gerade nicht lesen.');
    expect(r.structuredContent).not.toHaveProperty('feedback');
  });

  it('Server-Anweisung: auf Feedback eingehen, nie als Prüfbefund, nie selbst schreiben', async () => {
    const h = await aufbau();
    const c = await client(h, await accessToken(h));
    const anweisung = c.getInstructions() ?? '';
    expect(anweisung).toContain(`${MCP_WERKZEUGE.artefaktLesen} und ${MCP_WERKZEUGE.artefaktPruefen} liefern das Feedback der Lehrenden`);
    expect(anweisung).toMatch(/nie als eigenen Prüfbefund aus und schreib selbst nie Feedback/);
  });
});
