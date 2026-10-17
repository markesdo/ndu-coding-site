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
import type { Abhaengigkeiten } from '../typen.js';

export interface WerkzeugKontext {
  abh: Abhaengigkeiten;
  claims: TokenClaims;
  // Öffentliche Origin (origin(c)), für Links.
  origin: string;
}

// Ein Hinweis an die Person statt eines Ergebnisses (isError, damit kein outputSchema verlangt wird).
class Hinweis extends Error {}

const LESEN = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;

const ARTEFAKT_LISTE = ARTEFAKT_NAMEN.map((n) => `${n} (${ARTEFAKTE[n].titel})`).join(', ');
const artefaktArg = z.enum(ARTEFAKT_NAMEN as [ArtefaktName, ...ArtefaktName[]]).describe(`Welches Artefakt: ${ARTEFAKT_LISTE}.`);

const mappeUrl = (k: WerkzeugKontext) => `${k.origin}/innolab/mappe`;
const methodeUrl = (k: WerkzeugKontext, slug: string) => `${k.origin}/innolab/methoden/${slug}`;
const methodeZu = (name: ArtefaktName): Methode => METHODEN.find((m) => m.slug === ARTEFAKTE[name].slug)!;

const textErgebnis = (text: string, structuredContent?: Record<string, unknown>): CallToolResult =>
  structuredContent ? { content: [{ type: 'text', text }], structuredContent } : { content: [{ type: 'text', text }] };

// Ausnahmen werden zu einem Fehlerergebnis mit einem Satz für die Person; Einzelheiten nur ins Log.
async function sicher(k: WerkzeugKontext, f: () => Promise<CallToolResult>): Promise<CallToolResult> {
  try {
    return await f();
  } catch (e) {
    let text: string;
    if (e instanceof Hinweis) text = e.message;
    else if (e instanceof ApiAusnahme && e.status === 404) {
      text = `Deine Mappe ist noch nicht angelegt. Öffne einmal die Werkstatt (${mappeUrl(k)}), dann wird sie eingerichtet.`;
    } else if (e instanceof ApiAusnahme) text = e.satz;
    else {
      console.error('werkstatt-mcp:', e instanceof Error ? `${e.name}: ${e.message}` : 'Fehler');
      text = 'In der Werkstatt ist etwas schiefgegangen. Bitte später noch einmal versuchen.';
    }
    return { content: [{ type: 'text', text }], isError: true };
  }
}

// Repo der Person aus den Claims. Lehrende haben (noch) keine eigene Mappe.
function eigenesRepo(k: WerkzeugKontext): string {
  const { githubId, kohorte, rolle } = k.claims;
  if (rolle === 'lehrende') {
    throw new Hinweis('Du bist als Lehrende*r angemeldet und hast keine eigene Mappe. Die Lehrende-Ansicht mit allen Mappen einer Kohorte kommt später.');
  }
  const m = mitgliedschaftFinden(k.abh.umgebung.zugang, githubId, kohorte, rolle);
  // bearerPruefen hat die Mitgliedschaft gerade geprüft; fehlt sie trotzdem, lieber nichts lesen.
  if (!m) throw new ApiAusnahme(401, 'nicht-angemeldet', 'Bitte verbinde die Werkstatt in Claude neu.');
  return repoName(m);
}

async function artefaktHolen(k: WerkzeugKontext, name: ArtefaktName) {
  const repo = eigenesRepo(k);
  const { daten } = await k.abh.speicher.lesen(repo, name);
  if (daten === null) return null;
  const p = artefaktParsen(name, daten);
  if (!p.ok) {
    throw new Hinweis(
      `${ARTEFAKTE[name].titel}: Die gespeicherte Datei passt nicht zum Format der Werkstatt (vielleicht direkt auf GitHub geändert). Öffne das Artefakt in der Werkstatt und speichere es dort neu: ${mappeUrl(k)}`,
    );
  }
  return { daten: p.daten as Record<string, unknown>, markdown: rendern(name, p.daten) };
}

const nochLeer = (k: WerkzeugKontext, name: ArtefaktName) =>
  `${ARTEFAKTE[name].titel}: noch nicht ausgefüllt. Bitte die Person, es zuerst selbst in der Werkstatt auszufüllen: ${mappeUrl(k)}`;

// Format eines Befunds. Heute nur in Beschreibung, Text und Anweisung; vorschlag_hinterlegen (Phase 1b) nimmt es als Eingabe.
export const befundSchema = z.object({
  pruefpunkt: z.string().describe('ID des Prüfpunkts, z. B. annahmen-2.'),
  zitat: z.string().describe('Wörtliches Zitat der betroffenen Stelle aus dem Artefakt.'),
  frage: z.string().describe('Eine Rückfrage, die die Person selbst weiterbringt. Kein umformulierter Artefakttext.'),
});

export function werkzeugeRegistrieren(server: McpServer, k: WerkzeugKontext): void {
  server.registerTool(
    MCP_WERKZEUGE.mappeUebersicht,
    {
      title: 'Mappe: Übersicht',
      description:
        'Zeigt, welche der vier Artefakte (Produkt-Brief, Entscheidungslog, Interviewleitfaden, Annahmen-Map) in der eigenen Werkstatt-Mappe der angemeldeten Person schon gespeichert sind. Ohne Argumente: die Mappe ergibt sich aus der Anmeldung. Nur lesen.',
      inputSchema: {},
      outputSchema: {
        kohorte: z.string(),
        repo: z.string(),
        artefakte: z.array(z.object({ name: z.enum(ARTEFAKT_NAMEN as [ArtefaktName, ...ArtefaktName[]]), vorhanden: z.boolean() })),
      },
      annotations: LESEN,
    },
    () =>
      sicher(k, async () => {
        const repo = eigenesRepo(k);
        const stand: MappeStand = { kohorte: k.claims.kohorte, repo, artefakte: await k.abh.speicher.uebersicht(repo) };
        const zeilen = stand.artefakte.map((a) => `- ${ARTEFAKTE[a.name].titel} (${a.name}): ${a.vorhanden ? 'gespeichert' : 'noch leer'}`);
        return textErgebnis([`Deine Mappe (Kohorte ${stand.kohorte}):`, ...zeilen, '', `Bearbeiten in der Werkstatt: ${mappeUrl(k)}`].join('\n'), { ...stand });
      }),
  );

  server.registerTool(
    MCP_WERKZEUGE.artefaktLesen,
    {
      title: 'Artefakt lesen',
      description: `Liest ein Artefakt aus der eigenen Werkstatt-Mappe der angemeldeten Person: als Markdown und als strukturierte Daten. Mögliche Artefakte: ${ARTEFAKT_LISTE}. Formuliere daraus keinen neuen Artefakttext; ändern kann die Person nur selbst in der Werkstatt. Nur lesen.`,
      inputSchema: { artefakt: artefaktArg },
      annotations: LESEN,
    },
    ({ artefakt }) =>
      sicher(k, async () => {
        const a = await artefaktHolen(k, artefakt);
        if (!a) return textErgebnis(nochLeer(k, artefakt));
        return textErgebnis(a.markdown, a.daten);
      }),
  );

  const slugs = METHODEN.map((m) => m.slug);
  server.registerTool(
    MCP_WERKZEUGE.methodeErklaeren,
    {
      title: 'Methode erklären',
      description: `Erklärt eine Methode des Innolabs: welche Frage sie beantwortet, ihre Prüfliste (häufige Fehler als prüfbare Sätze), wofür die KI dabei da ist, die Quelle und den Link zur Methodenseite. Die Methoden der Mappe: ${ARTEFAKT_NAMEN.map((n) => `${ARTEFAKTE[n].slug} (${ARTEFAKTE[n].titel})`).join(', ')}. Nur lesen.`,
      inputSchema: { slug: z.string().describe(`Slug der Methode, eine von: ${slugs.join(', ')}.`) },
      annotations: LESEN,
    },
    ({ slug }) =>
      sicher(k, async () => {
        const m = METHODEN.find((x) => x.slug === slug);
        if (!m) throw new Hinweis(`Diese Methode gibt es nicht. Mögliche Slugs: ${slugs.join(', ')}.`);
        const link = methodeUrl(k, m.slug);
        const zeilen = [`# ${m.name}`, '', `Frage: ${m.frage}`, ''];
        if (m.pruefliste) zeilen.push('Prüfliste:', ...m.pruefliste.map((p, i) => `${i + 1}. ${p}`), '');
        zeilen.push(`Rolle der KI (immer erst nach der eigenen Arbeit): ${m.ki}`);
        if (m.quelle) zeilen.push(`Quelle: ${m.quelle}`);
        zeilen.push(`Methodenseite: ${link}`);
        const daten: Record<string, unknown> = { slug: m.slug, name: m.name, frage: m.frage };
        if (m.pruefliste) daten.pruefliste = [...m.pruefliste];
        daten.ki = m.ki;
        if (m.quelle) daten.quelle = m.quelle;
        daten.link = link;
        return textErgebnis(zeilen.join('\n'), daten);
      }),
  );

  server.registerTool(
    MCP_WERKZEUGE.artefaktPruefen,
    {
      title: 'Artefakt prüfen',
      description: `Holt ein Artefakt aus der eigenen Werkstatt-Mappe zusammen mit der Prüfliste seiner Methode (Prüfpunkte mit IDs wie annahmen-1). Mögliche Artefakte: ${ARTEFAKT_LISTE}. Danach prüfst du selbst: höchstens drei Befunde, die wichtigsten zuerst, jeder mit Prüfpunkt-ID, einem wörtlichen Zitat aus dem Artefakt und einer Rückfrage. Schreib keinen Artefakttext um und schlag keinen fertigen Text vor; geändert wird nur in der Werkstatt. Ist das Artefakt noch leer, bitte die Person, es erst selbst auszufüllen. Nur lesen.`,
      inputSchema: { artefakt: artefaktArg },
      outputSchema: {
        artefakt: z.enum(ARTEFAKT_NAMEN as [ArtefaktName, ...ArtefaktName[]]),
        titel: z.string(),
        vorhanden: z.boolean(),
        markdown: z.string().describe('Das Artefakt als Markdown; leer, wenn es noch nicht ausgefüllt ist.'),
        pruefpunkte: z.array(z.object({ id: z.string(), text: z.string() })),
      },
      annotations: LESEN,
    },
    ({ artefakt }) =>
      sicher(k, async () => {
        const a = await artefaktHolen(k, artefakt);
        const m = methodeZu(artefakt);
        const pruefpunkte = (m.pruefliste ?? []).map((text, i) => ({ id: `${m.slug}-${i + 1}`, text }));
        const titel = ARTEFAKTE[artefakt].titel;
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
          'Höchstens drei Befunde, die wichtigsten zuerst. Jeder Befund: Prüfpunkt-ID, ein wörtliches Zitat aus dem Artefakt, eine Rückfrage. Kein umformulierter Text. Passt alles, sag das in einem Satz.',
          `Ändern kann die Person nur selbst in der Werkstatt: ${mappeUrl(k)}`,
        ].join('\n');
        return textErgebnis(text, { artefakt, titel, vorhanden: a !== null, markdown: a?.markdown ?? '', pruefpunkte });
      }),
  );
}
