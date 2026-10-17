// Die vier Lesewerkzeuge des Connectors (Phase 1). Die Mappe ergibt sich immer aus den Token-Claims (githubId,
// kohorte, rolle); kein Argument nennt ein Repo oder eine Person. Beschreibungen tragen das Nötige selbst, weil
// ChatGPT weder Prompts noch Ressourcen zeigt.
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { METHODEN, type Methode } from '../../../components/methoden.js';
import { rendern } from '../../render/index.js';
import { ARTEFAKT_NAMEN, ARTEFAKTE, artefaktParsen, type ArtefaktName } from '../../schemas/index.js';
import { MCP_WERKZEUGE, type MappeStand } from '../../vertrag.js';
import { repoName } from '../../zugang.js';
import { ApiAusnahme } from '../antwort.js';
import type { TokenClaims } from '../oauth/routen.js';
import { mitgliedschaftFinden } from '../sitzung.js';
import { DateiUnlesbar } from '../speicher-fehler.js';
import type { Abhaengigkeiten } from '../typen.js';

export interface WerkzeugKontext {
  abh: Abhaengigkeiten;
  claims: TokenClaims;
  // Öffentliche Origin (origin(c)), für Links.
  origin: string;
}

// Ein Satz an die Person statt eines Ergebnisses (isError, damit kein outputSchema verlangt wird).
class Hinweis extends Error {}

// --- statische Teile der Werkzeuge ---

const LESEN = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;
const ARTEFAKT_ENUM = z.enum(ARTEFAKT_NAMEN as [ArtefaktName, ...ArtefaktName[]]);
const ARTEFAKT_LISTE = ARTEFAKT_NAMEN.map((n) => `${n} (${ARTEFAKTE[n].titel})`).join(', ');
const ARTEFAKT_EINGABE = { artefakt: ARTEFAKT_ENUM.describe(`Welches Artefakt: ${ARTEFAKT_LISTE}.`) };
const SLUGS = METHODEN.map((m) => m.slug);

const UEBERSICHT = {
  title: 'Mappe: Übersicht',
  description:
    'Zeigt, welche der vier Artefakte (Produkt-Brief, Entscheidungslog, Interviewleitfaden, Annahmen-Map) in der eigenen Werkstatt-Mappe der angemeldeten Person schon gespeichert sind. Ohne Argumente: die Mappe ergibt sich aus der Anmeldung. Nur lesen.',
  inputSchema: {},
  outputSchema: {
    kohorte: z.string(),
    repo: z.string(),
    lesezugriff: z.enum(['aktiv', 'eingeladen', 'unbekannt']),
    artefakte: z.array(z.object({ name: ARTEFAKT_ENUM, vorhanden: z.boolean() })),
  },
  annotations: LESEN,
};

const LESEN_WERKZEUG = {
  title: 'Artefakt lesen',
  description: `Liest ein Artefakt aus der eigenen Werkstatt-Mappe der angemeldeten Person: als Markdown und als strukturierte Daten. Mögliche Artefakte: ${ARTEFAKT_LISTE}. Formuliere daraus keinen neuen Artefakttext; ändern kann die Person nur selbst in der Werkstatt. Nur lesen.`,
  inputSchema: ARTEFAKT_EINGABE,
  annotations: LESEN,
};

const METHODE = {
  title: 'Methode erklären',
  description: `Erklärt eine Methode des Innolabs: welche Frage sie beantwortet, ihre Prüfliste (häufige Fehler als prüfbare Sätze), wofür die KI dabei da ist, die Quelle und den Link zur Methodenseite. Die Methoden der Mappe: ${ARTEFAKT_NAMEN.map((n) => `${ARTEFAKTE[n].slug} (${ARTEFAKTE[n].titel})`).join(', ')}. Nur lesen.`,
  inputSchema: { slug: z.string().describe(`Slug der Methode, eine von: ${SLUGS.join(', ')}.`) },
  annotations: LESEN,
};

const PRUEFEN = {
  title: 'Artefakt prüfen',
  description: `Holt ein Artefakt aus der eigenen Werkstatt-Mappe zusammen mit der Prüfliste seiner Methode (Prüfpunkte mit IDs wie annahmen-1) und einer Anleitung. Mögliche Artefakte: ${ARTEFAKT_LISTE}. Danach prüfst du selbst: höchstens drei Befunde, die wichtigsten zuerst, jeder mit Prüfpunkt-ID, einem wörtlichen Zitat aus dem Artefakt und einer Rückfrage. Schreib keinen Artefakttext um und schlag keinen fertigen Text vor; geändert wird nur in der Werkstatt. Ist das Artefakt noch leer, bitte die Person, es erst selbst auszufüllen. Nur lesen.`,
  inputSchema: ARTEFAKT_EINGABE,
  outputSchema: {
    artefakt: ARTEFAKT_ENUM,
    titel: z.string(),
    vorhanden: z.boolean(),
    markdown: z.string().describe('Das Artefakt als Markdown; leer, wenn es noch nicht ausgefüllt ist.'),
    pruefpunkte: z.array(z.object({ id: z.string(), text: z.string() })),
    anleitung: z.string().describe('So antwortest du auf diese Prüfung.'),
  },
  annotations: LESEN,
};

const ANLEITUNG_LEER = 'Noch nichts eingetragen. Bitte die Person, es zuerst selbst in der Werkstatt auszufüllen, und prüfe danach.';
const anleitungPruefen = (k: WerkzeugKontext) =>
  `Höchstens drei Befunde, die wichtigsten zuerst. Jeder Befund: Prüfpunkt-ID, ein wörtliches Zitat aus dem Artefakt, eine Rückfrage, die die Person selbst weiterbringt. Kein umformulierter Text. Passt alles, sag das in einem Satz. Ändern kann die Person nur selbst in der Werkstatt: ${mappeUrl(k)}`;

// --- Hilfen ---

const mappeUrl = (k: WerkzeugKontext) => `${k.origin}/innolab/mappe`;
const methodeZu = (name: ArtefaktName): Methode => METHODEN.find((m) => m.slug === ARTEFAKTE[name].slug)!;

const keineMappe = (k: WerkzeugKontext) =>
  `Deine Mappe gibt es noch nicht. Öffne einmal die Werkstatt unter ${mappeUrl(k)}, dann wird sie angelegt.`;
const unpassendeDatei = (k: WerkzeugKontext, name: ArtefaktName) =>
  `${ARTEFAKTE[name].titel}: Diese Datei passt nicht zum Format der Werkstatt (vielleicht direkt auf GitHub geändert). Öffne sie in der Werkstatt und speichere sie neu: ${mappeUrl(k)}`;
const nochLeer = (k: WerkzeugKontext, name: ArtefaktName) =>
  `${ARTEFAKTE[name].titel}: noch nicht ausgefüllt. Bitte die Person, es zuerst selbst in der Werkstatt auszufüllen: ${mappeUrl(k)}`;

const textErgebnis = (text: string, structuredContent?: Record<string, unknown>): CallToolResult =>
  structuredContent ? { content: [{ type: 'text', text }], structuredContent } : { content: [{ type: 'text', text }] };

// Sätze für den Chat statt der Sätze der Web-Oberfläche („Seite neu laden“ passt in Claude nicht).
function chatSatz(k: WerkzeugKontext, e: ApiAusnahme): string {
  if (e.status === 404) return keineMappe(k);
  switch (e.code) {
    case 'wird-eingerichtet':
      return 'Deine Mappe wird gerade eingerichtet. Versuch es in ein paar Sekunden noch einmal.';
    case 'nicht-freigeschaltet':
      return 'Diese Mappe gehört nicht zu deinem Zugang. Frag Markus.';
    case 'github-fehler':
      return 'GitHub ist gerade nicht erreichbar. Versuch es gleich noch einmal.';
    default:
      return 'Die Werkstatt ist gerade nicht erreichbar. Versuch es später noch einmal.';
  }
}

// Ausnahmen werden zu einem Fehlerergebnis mit einem Satz für die Person; Einzelheiten nur ins Log.
async function sicher(k: WerkzeugKontext, f: () => Promise<CallToolResult>): Promise<CallToolResult> {
  try {
    return await f();
  } catch (e) {
    let text: string;
    if (e instanceof Hinweis) text = e.message;
    else if (e instanceof ApiAusnahme) text = chatSatz(k, e);
    else {
      console.error('werkstatt-mcp:', e instanceof Error ? `${e.name}: ${e.message}` : 'Fehler');
      text = 'In der Werkstatt ist etwas schiefgegangen. Versuch es später noch einmal.';
    }
    return { content: [{ type: 'text', text }], isError: true };
  }
}

// Repo der Person aus den Claims, nur wenn es existiert und laut werkstatt.json ihr gehört. Ein Weg für alle
// Werkzeuge: der GitHub-Speicher liefert bei fehlendem Repo aus lesen() null, aus uebersicht() einen 404.
async function eigeneMappe(k: WerkzeugKontext): Promise<string> {
  const { githubId, kohorte, rolle } = k.claims;
  if (rolle === 'lehrende') {
    throw new Hinweis('Du bist als Lehrende*r angemeldet und hast keine eigene Mappe. Die Lehrende-Ansicht mit allen Mappen einer Kohorte kommt später.');
  }
  // bearerPruefen hat die Mitgliedschaft gerade geprüft; fehlt sie jetzt trotzdem, nichts lesen.
  const m = mitgliedschaftFinden(k.abh.umgebung.zugang, githubId, kohorte, rolle);
  if (!m) throw new Hinweis('Dein Zugang zur Werkstatt ist nicht mehr aktiv. Frag Markus.');
  const repo = repoName(m);
  const wj = await k.abh.speicher.werkstattJson(repo);
  if (!wj) throw new Hinweis(keineMappe(k));
  // Kürzel neu vergeben: das alte Repo gehört noch der vorigen Person.
  if (wj.githubId !== githubId) throw new Hinweis('Diese Mappe gehört nicht zu deinem Zugang. Frag Markus.');
  return repo;
}

async function artefaktHolen(k: WerkzeugKontext, name: ArtefaktName) {
  const repo = await eigeneMappe(k);
  let daten: unknown;
  try {
    ({ daten } = await k.abh.speicher.lesen(repo, name));
  } catch (e) {
    if (e instanceof DateiUnlesbar) throw new Hinweis(unpassendeDatei(k, name));
    throw e;
  }
  if (daten === null) return null;
  const p = artefaktParsen(name, daten);
  if (!p.ok) throw new Hinweis(unpassendeDatei(k, name));
  return { daten: p.daten as Record<string, unknown>, markdown: rendern(name, p.daten) };
}

function methodeDaten(k: WerkzeugKontext, m: Methode) {
  return {
    slug: m.slug,
    name: m.name,
    frage: m.frage,
    ...(m.pruefliste ? { pruefliste: [...m.pruefliste] } : {}),
    ki: m.ki,
    ...(m.quelle ? { quelle: m.quelle } : {}),
    link: `${k.origin}/innolab/methoden/${m.slug}`,
  };
}

function methodeText(d: ReturnType<typeof methodeDaten>): string {
  const zeilen = [`# ${d.name}`, '', `Frage: ${d.frage}`, ''];
  if (d.pruefliste) zeilen.push('Prüfliste:', ...d.pruefliste.map((p, i) => `${i + 1}. ${p}`), '');
  zeilen.push(`Rolle der KI (immer erst nach der eigenen Arbeit): ${d.ki}`);
  if (d.quelle) zeilen.push(`Quelle: ${d.quelle}`);
  zeilen.push(`Methodenseite: ${d.link}`);
  return zeilen.join('\n');
}

// --- Registrierung ---

export function werkzeugeRegistrieren(server: McpServer, k: WerkzeugKontext): void {
  server.registerTool(MCP_WERKZEUGE.mappeUebersicht, UEBERSICHT, () =>
    sicher(k, async () => {
      const repo = await eigeneMappe(k);
      const stand: MappeStand = { kohorte: k.claims.kohorte, repo, lesezugriff: 'unbekannt', artefakte: await k.abh.speicher.uebersicht(repo) };
      const zeilen = stand.artefakte.map((a) => `- ${ARTEFAKTE[a.name].titel} (${a.name}): ${a.vorhanden ? 'gespeichert' : 'noch leer'}`);
      return textErgebnis([`Deine Mappe (Kohorte ${stand.kohorte}):`, ...zeilen, '', `Bearbeiten in der Werkstatt: ${mappeUrl(k)}`].join('\n'), { ...stand });
    }),
  );

  server.registerTool(MCP_WERKZEUGE.artefaktLesen, LESEN_WERKZEUG, ({ artefakt }) =>
    sicher(k, async () => {
      const a = await artefaktHolen(k, artefakt);
      if (!a) return textErgebnis(nochLeer(k, artefakt));
      return textErgebnis(a.markdown, a.daten);
    }),
  );

  server.registerTool(MCP_WERKZEUGE.methodeErklaeren, METHODE, ({ slug }) =>
    sicher(k, async () => {
      const m = METHODEN.find((x) => x.slug === slug);
      if (!m) throw new Hinweis(`Diese Methode gibt es nicht. Mögliche Slugs: ${SLUGS.join(', ')}.`);
      const d = methodeDaten(k, m);
      return textErgebnis(methodeText(d), d);
    }),
  );

  server.registerTool(MCP_WERKZEUGE.artefaktPruefen, PRUEFEN, ({ artefakt }) =>
    sicher(k, async () => {
      const a = await artefaktHolen(k, artefakt);
      const m = methodeZu(artefakt);
      const pruefpunkte = (m.pruefliste ?? []).map((text, i) => ({ id: `${m.slug}-${i + 1}`, text }));
      const titel = ARTEFAKTE[artefakt].titel;
      const anleitung = a ? anleitungPruefen(k) : ANLEITUNG_LEER;
      const text = [
        `# Prüfung: ${titel}`,
        '',
        `## Prüfpunkte (${m.name})`,
        ...pruefpunkte.map((p) => `- ${p.id}: ${p.text}`),
        '',
        '## Artefakt',
        a ? a.markdown : nochLeer(k, artefakt),
        '',
        '## So antwortest du',
        anleitung,
      ].join('\n');
      return textErgebnis(text, { artefakt, titel, vorhanden: a !== null, markdown: a?.markdown ?? '', pruefpunkte, anleitung });
    }),
  );
}
