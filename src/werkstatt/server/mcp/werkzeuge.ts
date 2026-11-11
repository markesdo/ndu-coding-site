// Die Lesewerkzeuge des Connectors (Phase 1 und 1b). Die Mappe ergibt sich immer aus den Token-Claims (githubId,
// kohorte, rolle); kein Argument nennt ein Repo oder eine Person. Beschreibungen tragen das Nötige selbst, weil
// ChatGPT weder Prompts noch Ressourcen zeigt.
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { abText } from '../../../components/aufloesung.js';
import { wienerZeit } from '../../../components/jetzt.js';
import { aufgedecktSchluessel, gruppeFrei } from '../../../lib/aufgedeckt.js';
import { DEMO_HREF } from '../../../lib/nav-rolle.js';
import { FOKUS_FRAGEN, FOKUS_STELLEN, METHODEN, NICHT_EINORDNEN, TAGE, pruefFragen, werkstattVorarbeit, type Methode, type Pruefpunkt } from '../../../components/methoden.js';
import { kohorte, werkstattArtefakte } from '../../kohorten/index.js';
import { datumAt } from '../../render/format.js';
import { rendern } from '../../render/index.js';
import { ARTEFAKT_NAMEN, ARTEFAKTE, artefaktParsen, type ArtefaktName } from '../../schemas/index.js';
import { BEFUND_ARTEN, verknuepfungenPruefen, verknuepfungenText, type MappeDaten } from '../../verknuepfungen.js';
import { STAENDE, TAG_LAGEN, artefaktStand, entstehtAn, faelligBis, inArbeitAn, kurstagBestimmen, type ArtefaktStand, type Kurstag } from '../../tag-stand.js';
import { MCP_WERKZEUGE, type MappeStand } from '../../vertrag.js';
import { mappeMitgliedschaft, repoName } from '../../zugang.js';
import { ApiAusnahme } from '../antwort.js';
import type { TokenClaims } from '../oauth/routen.js';
import { mitgliedschaftFinden } from '../sitzung.js';
import { DateiUnlesbar } from '../speicher-fehler.js';
import type { Abhaengigkeiten } from '../typen.js';
import { FEEDBACK_ANLEITUNG, FEEDBACK_AUSGABE, FEEDBACK_HINWEIS_AUSGABE, feedbackFelder, feedbackFuerClaude, feedbackText } from './feedback.js';

export interface WerkzeugKontext {
  abh: Abhaengigkeiten;
  claims: TokenClaims;
  // Öffentliche Origin (origin(c)), für Links.
  origin: string;
}

// NDU-52: Claude Code gibt dem Modell bei einem Ergebnis mit structuredContent nur dessen JSON, nicht den Text (2.1.322:
// Textblöcke fallen weg). Claude.ai und andere Clients zeigen womöglich nur den Text. Darum trägt jedes Ergebnis alles,
// was Claude braucht, in beiden: Inhalt (Artefakt, Vorarbeit, Feedback, Zahlen) als Abschnitte bzw. Felder, die Regeln
// für Claude aus einer Quelle (ergebnis(): Ende des Textes = anleitung im JSON). Beschreibungen im outputSchema sieht das
// Modell nicht; was es wissen muss, steht in den Werten.

// Ein Satz an die Person statt eines Ergebnisses (isError, damit kein outputSchema verlangt wird).
class Hinweis extends Error {}

// --- statische Teile der Werkzeuge ---

const LESEN = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;
const ARTEFAKT_ENUM = z.enum(ARTEFAKT_NAMEN as [ArtefaktName, ...ArtefaktName[]]);
const ARTEFAKT_LISTE = ARTEFAKT_NAMEN.map((n) => `${n} (${ARTEFAKTE[n].titel})`).join(', ');
const ARTEFAKT_EINGABE = { artefakt: ARTEFAKT_ENUM.describe(`Welches Artefakt: ${ARTEFAKT_LISTE}.`) };
const SLUGS = METHODEN.map((m) => m.slug);
const PRUEFPUNKT = z.object({ nr: z.number().describe('Position in der Prüfliste; pruefpunkt nimmt sie wie die ID an.'), id: z.string(), text: z.string() });
type PruefpunktAusgabe = z.infer<typeof PRUEFPUNKT>;
// Was Claude von einem Prüfpunkt sieht: Position, ID und Text, ohne die alte Positions-ID. pruefpunkt nimmt Nummer und ID an.
const ausgabe = (p: Pruefpunkt, i: number): PruefpunktAusgabe => ({ nr: i + 1, id: p.id, text: p.text });
// Dieselbe Zeile im Text: „5. annahmen-loesung: …“.
const pruefpunktZeile = (p: PruefpunktAusgabe) => `${p.nr}. ${p.id}: ${p.text}`;
const WERKSTATT = z.string().describe('Link zur Werkstatt: Ändern kann die Person nur dort.');
const MARKDOWN = z.string().optional().describe('Das Artefakt als Markdown, wie die Werkstatt es zeigt; fehlt, solange es leer ist.');
const HINWEIS = z.string().optional().describe('Satz an die Person statt des Artefakts (noch leer).');
const ANLEITUNG = z.string().describe('So gehst du mit diesem Ergebnis um; steht gleichlautend am Ende des Textes.');
// Steht im Text über jeder Vorarbeit und im JSON an jeder Vorarbeit.
const VORARBEIT_ZWECK = 'Nur zum Abgleich, nicht prüfen und nicht daraus zitieren.';

const UEBERSICHT = {
  title: 'Mappe: Übersicht',
  description:
    `Zeigt, welche Artefakte (${ARTEFAKT_NAMEN.map((n) => ARTEFAKTE[n].titel).join(', ')}) in der eigenen Werkstatt-Mappe der angemeldeten Person schon gespeichert sind. Ohne Argumente: die Mappe ergibt sich aus der Anmeldung. Nur lesen.`,
  inputSchema: {},
  outputSchema: {
    kohorte: z.string(),
    repo: z.string(),
    lesezugriff: z.enum(['aktiv', 'eingeladen', 'unbekannt']),
    artefakte: z.array(z.object({ name: ARTEFAKT_ENUM, titel: z.string(), vorhanden: z.boolean() })),
    demoMappe: z.literal(true).optional().describe('Demo-Mappe einer Lehrperson; zählt nicht als Mappe der Kohorte.'),
    werkstatt: WERKSTATT,
    anleitung: ANLEITUNG,
  },
  annotations: LESEN,
};

const LESEN_WERKZEUG = {
  title: 'Artefakt lesen',
  description: `Liest ein Artefakt aus der eigenen Werkstatt-Mappe der angemeldeten Person als Markdown. Mögliche Artefakte: ${ARTEFAKT_LISTE}. Formuliere daraus keinen neuen Artefakttext; ändern kann die Person nur selbst in der Werkstatt. Hat eine Lehrperson Feedback dazu geschrieben, steht es am Ende unter „Feedback der Lehrenden“ (kein Prüfbefund; du schreibst selbst keins). Eine mögliche Fassung der Lehrenden kommt nie mit: Gibt es eine, sag nur, dass sie in der Werkstatt steht. Nur lesen.`,
  inputSchema: ARTEFAKT_EINGABE,
  // Dasselbe wie der Text (NDU-52); die Rohdaten des Artefakts nicht noch einmal, das Markdown trägt alles mit den IDs.
  outputSchema: {
    artefakt: ARTEFAKT_ENUM,
    titel: z.string(),
    vorhanden: z.boolean(),
    markdown: MARKDOWN,
    hinweis: HINWEIS,
    feedback: FEEDBACK_AUSGABE.optional(),
    feedbackHinweis: FEEDBACK_HINWEIS_AUSGABE,
    anleitung: ANLEITUNG,
    werkstatt: WERKSTATT,
  },
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
  description: `Holt ein Artefakt aus der eigenen Werkstatt-Mappe zusammen mit der Prüfliste seiner Methode (Prüfpunkte mit festen IDs wie annahmen-loesung), der Vorarbeit zum Abgleich (etwa Brief und Annahmen-Map beim Leitfaden) und einer Anleitung. Mögliche Artefakte: ${ARTEFAKT_LISTE}. Danach prüfst du selbst: höchstens drei Befunde, die wichtigsten zuerst, jeder mit Prüfpunkt-ID, einem wörtlichen Zitat aus dem Artefakt (nie aus der Vorarbeit) und einer Rückfrage. Mit pruefpunkt (z. B. annahmen-loesung) prüfst du nur diesen einen Punkt. ${FOKUS_STELLEN} ${FOKUS_FRAGEN} ${NICHT_EINORDNEN} Schreib keinen Artefakttext um und schlag keinen fertigen Text vor; geändert wird nur in der Werkstatt. Ist das Artefakt noch leer, bitte die Person, es erst selbst auszufüllen. Feedback der Lehrenden kommt mit (Abschnitt „Feedback der Lehrenden“): Geh darauf ein, gib es aber nie als eigenen Befund aus und schreib selbst keins. Eine mögliche Fassung der Lehrenden kommt nie mit: Gibt es eine, sag nur, dass sie in der Werkstatt steht. Nur lesen.`,
  inputSchema: {
    ...ARTEFAKT_EINGABE,
    pruefpunkt: z
      .string()
      .nullish()
      .describe('Optional: ID eines Prüfpunkts dieses Artefakts (z. B. annahmen-loesung) oder seine Nummer in der Liste (5), um nur diesen Punkt gründlich zu prüfen. Ohne: alle Prüfpunkte.'),
  },
  // Alles aus dem Text auch hier, das Artefakt und die Vorarbeit als Markdown (NDU-52): Claude Code sieht nur das JSON.
  outputSchema: {
    artefakt: ARTEFAKT_ENUM,
    titel: z.string(),
    methode: z.string().describe('Die Methode, deren Prüfliste gilt.'),
    vorhanden: z.boolean().optional().describe('Ob das Artefakt gespeichert ist; fehlt, solange die Prüfliste gesperrt ist.'),
    markdown: MARKDOWN.describe('Abschnitt „Artefakt“: das geprüfte Artefakt als Markdown. Nur daraus zitieren.'),
    hinweis: HINWEIS,
    gesperrt: z
      .literal(true)
      .optional()
      .describe('Die Prüfliste verrät die Lösung einer Übung und ist noch zu: keine Prüfpunkte, nichts prüfen; anleitung sagt, wann es weitergeht.'),
    pruefpunkte: z.array(PRUEFPUNKT).describe('Die zu prüfenden Punkte; mit pruefpunkt nur dieser eine.'),
    vorarbeit: z
      .array(z.object({
        artefakt: ARTEFAKT_ENUM,
        titel: z.string(),
        vorhanden: z.boolean(),
        zweck: z.string(),
        markdown: z.string().optional(),
        hinweis: z.string().optional().describe('Statt markdown: warum sie fehlt.'),
      }))
      .describe('Artefakte, die zum Abgleich mitgeliefert werden (im Text unter „Vorarbeit zum Abgleich“).'),
    anleitung: ANLEITUNG,
    feedback: FEEDBACK_AUSGABE.optional(),
    feedbackHinweis: FEEDBACK_HINWEIS_AUSGABE,
  },
  annotations: LESEN,
};

const VERKNUEPFUNGEN = {
  title: 'Verknüpfungen prüfen',
  description: `Prüft ohne KI, ob die Verweise der eigenen Werkstatt-Mappe zusammenpassen, über Produkt-Brief, Entscheidungslog, Annahmen-Map und Interviews: unbekannte IDs (z. B. ein Beleg I2-3, den es in den Interviews nicht gibt, oder D4, A3 im Text), fehlende Belege (Belegstufe „gesagt“, „erzählt“ oder „getan“ ohne Beleg; Annahmen mit „gesagt“ oder „erzählt“ ohne Interview oder Zitat; „getan“ ohne Beleg-Notiz, bei Annahmen auch nicht über eine Entscheidung, die selbst „getan“ ist und eine Beleg-Notiz hat – ein Interview-Zitat belegt höchstens „erzählt“; Chance ohne Zitat), verwaiste Interviews (von keinem Beleg genannt) und die riskanteste Annahme ohne jeden Beleg, obwohl schon Interviews gespeichert sind. Ohne Argumente. Das Ergebnis ist eine Liste von Befunden; geh sie mit der Person durch, frag nach, wo der Beleg liegt, und formuliere keinen Artefakttext. Ändern kann die Person nur selbst in der Werkstatt. Nur lesen.`,
  inputSchema: {},
  outputSchema: {
    befunde: z.array(z.object({
      art: z.enum(BEFUND_ARTEN),
      artefakt: ARTEFAKT_ENUM,
      ort: z.string().describe('ID der Zeile (D4) oder Feld (Brief · Offene Frage 2, I2 · Chance 1).'),
      id: z.string().optional().describe('Die unbekannte ID, das verwaiste Interview bzw. die riskanteste Annahme ohne Beleg.'),
      text: z.string(),
    })),
    geprueft: z.array(ARTEFAKT_ENUM),
    fehlen: z.array(ARTEFAKT_ENUM).describe('Noch nicht gespeichert.'),
    unlesbar: z.array(ARTEFAKT_ENUM).describe('Passt nicht zum Format der Werkstatt; dort neu speichern.'),
    werkstatt: WERKSTATT,
    anleitung: ANLEITUNG,
  },
  annotations: LESEN,
};

const STAND_SCHEMA = z.object({
  artefakt: ARTEFAKT_ENUM,
  titel: z.string(),
  stand: z.enum(STAENDE),
  umfang: z.string(),
  fehlt: z.array(z.string()),
});

const TAG_STAND = {
  title: 'Kurstag und Stand',
  description: `Zeigt, welcher Kurstag dran ist (heute oder der nächste, aus den Terminen der Kohorte), welche Artefakte der eigenen Werkstatt-Mappe bis dahin fällig sind und was davon noch leer oder dünn ist (z. B. „2 von 5 Snapshots“, „I3 ohne Chance“). Nur Zählen, kein Urteil über die Qualität; prüfen geht mit ${MCP_WERKZEUGE.artefaktPruefen}. Optional tag (1–${TAGE.length}) für einen bestimmten Kurstag. Nur lesen.`,
  inputSchema: {
    // Auch als Text: ChatGPT schickt Zahlen mitunter als "2" und ein leeres optionales Argument als "".
    tag: z.union([z.number(), z.string()]).nullish().describe(`Optional: Kurstag 1–${TAGE.length}. Ohne: heute bzw. der nächste Kurstag.`),
  },
  outputSchema: {
    kohorte: z.string(),
    heute: z.string().describe('Kalendertag in Wien (JJJJ-MM-TT).'),
    tag: z.number(),
    titel: z.string(),
    datum: z.string().nullable().describe('Termin des Kurstags; null = noch offen.'),
    lage: z.enum(TAG_LAGEN),
    ohneTermin: z.array(z.number()).describe('Frühere Kurstage, deren Termin noch offen ist.'),
    faellig: z.array(STAND_SCHEMA).describe('Bis zu diesem Kurstag fällig.'),
    inArbeit: z.array(STAND_SCHEMA).describe('Ab diesem Kurstag in Arbeit, fällig zum nächsten.'),
    entsteht: z.array(z.object({ slug: z.string(), name: z.string() })).describe('Methoden dieses Kurstags.'),
    werkstatt: WERKSTATT,
    anleitung: ANLEITUNG,
  },
  annotations: LESEN,
};

const ANLEITUNG_LEER = 'Noch nichts eingetragen. Bitte die Person, es zuerst selbst in der Werkstatt auszufüllen, und prüfe danach.';
interface PruefLage {
  // Mit pruefpunkt: nur dieser Punkt, danach der nächste der Liste (fehlt beim letzten).
  fokus?: { punkt: Pruefpunkt; naechster?: Pruefpunkt };
  // Vorarbeit wurde mitgeliefert / ein Teil davon fehlt oder ist unlesbar.
  vorarbeit: boolean;
  vorarbeitFehlt: boolean;
  // Es gibt Feedback der Lehrenden zu diesem Artefakt (NDU-35).
  feedback: boolean;
}

// So sehen die IDs der Zeilen im geprüften Artefakt aus; der Brief hat keine.
const ID_BEISPIEL: Record<ArtefaktName, string | undefined> = {
  brief: undefined,
  entscheidungen: 'D2',
  leitfaden: 'F4',
  annahmen: 'A3',
  interviews: 'I2 oder I2-4',
};

function anleitungPruefen(k: WerkzeugKontext, artefakt: ArtefaktName, lage: PruefLage): string[] {
  const { fokus } = lage;
  const saetze = fokus
    ? [`Prüf nur ${fokus.punkt.id}. ${FOKUS_STELLEN} ${FOKUS_FRAGEN}`]
    : ['Höchstens drei Befunde, die wichtigsten zuerst. Jeder Befund: Prüfpunkt-ID, ein wörtliches Zitat, eine Rückfrage, die die Person selbst weiterbringt.'];
  // Die Fragen der geprüften Punkte: mit pruefpunkt nur dieser.
  saetze.push(NICHT_EINORDNEN, ...pruefFragen(fokus ? [fokus.punkt] : (methodeZu(artefakt).pruefliste ?? [])));
  const id = ID_BEISPIEL[artefakt];
  saetze.push(`Zitiere nur aus dem Abschnitt „Artefakt“ (im JSON: markdown)${id ? ` und nenn die ID der Zeile, wo sie eine hat (wie ${id})` : ''}.`);
  if (lage.vorarbeit) saetze.push('Die Vorarbeit dient nur zum Abgleich; aus ihr zitierst du nicht.');
  if (lage.vorarbeitFehlt) {
    saetze.push('Fehlt Vorarbeit oder ließ sie sich nicht lesen (der Hinweis in ihrem Abschnitt sagt, was davon), sag bei den Prüfpunkten, die sie brauchen, dass du sie nicht abgleichen konntest – und nur bei „noch nicht ausgefüllt“, dass sie fehlt.');
  }
  saetze.push('Kein umformulierter Text. Passt alles, sag das in einem Satz.');
  if (lage.feedback) saetze.push(FEEDBACK_ANLEITUNG);
  if (fokus) {
    saetze.push(fokus.naechster ? `Frag am Ende, ob als Nächstes ${fokus.naechster.id} drankommen soll.` : 'Das ist der letzte Prüfpunkt der Liste; sag das in deinem letzten Absatz und nenn dort den Link zur Werkstatt.');
  }
  saetze.push(aendernNurInDerWerkstatt(k));
  return saetze;
}

// --- Hilfen ---

// Wo die Person ihre Mappe bearbeitet: Lehrende in ihrer Demo-Mappe (NDU-37), sonst „Meine Mappe“.
const mappeUrl = (k: WerkzeugKontext) => `${k.origin}${k.claims.rolle === 'lehrende' ? DEMO_HREF : '/innolab/mappe'}`;
const methodeZu = (name: ArtefaktName): Methode => METHODEN.find((m) => m.slug === ARTEFAKTE[name].slug)!;

const keineMappe = (k: WerkzeugKontext) =>
  k.claims.rolle === 'lehrende'
    ? `Deine Demo-Mappe gibt es noch nicht. Öffne einmal „Meine Demo-Mappe“ unter ${mappeUrl(k)}, dann wird sie angelegt.`
    : `Deine Mappe gibt es noch nicht. Öffne einmal die Werkstatt unter ${mappeUrl(k)}, dann wird sie angelegt.`;
const unpassendeDatei = (k: WerkzeugKontext, name: ArtefaktName) =>
  `${ARTEFAKTE[name].titel}: Diese Datei passt nicht zum Format der Werkstatt (vielleicht direkt auf GitHub geändert). Öffne sie in der Werkstatt und speichere sie neu: ${mappeUrl(k)}`;
const nochLeer = (k: WerkzeugKontext, name: ArtefaktName) =>
  `${ARTEFAKTE[name].titel}: noch nicht ausgefüllt. Bitte die Person, es zuerst selbst in der Werkstatt auszufüllen: ${mappeUrl(k)}`;
const ohneAbgleich = (name: ArtefaktName, was: string) => `${ARTEFAKTE[name].titel}: ${was}. Was sich darauf bezieht, lässt sich nicht abgleichen.`;

// Eingebettetes Markdown unter eine ##-Überschrift: seine Überschriften rutschen zwei Ebenen tiefer, damit „Artefakt“
// und jede Vorarbeit ein Abschnitt bleiben. Text der Person kann keine Überschrift beginnen (zeilenanfang in render/format.ts).
const eingebettet = (md: string) => md.replace(/^(#{1,6}) /gm, (_, h: string) => `${'#'.repeat(Math.min(h.length + 2, 6))} `);

const aendernNurInDerWerkstatt = (k: WerkzeugKontext) => `Ändern kann die Person nur selbst in der Werkstatt: ${mappeUrl(k)}`;

// Eine Quelle für beide Sichten: Die Regeln für Claude (saetze) stehen einmal am Ende des Textes – mit ueberschrift als
// eigener Abschnitt – und gleichlautend als anleitung im structuredContent. So kann keine Regel nur im Text stehen.
function ergebnis(text: string, sc: Record<string, unknown>, saetze: readonly string[], ueberschrift?: string): CallToolResult {
  const anleitung = saetze.join(' ');
  return {
    content: [{ type: 'text', text: [text, '', ...(ueberschrift ? [ueberschrift] : []), anleitung].join('\n') }],
    structuredContent: { ...sc, anleitung },
  };
}

// Das Artefakt oder, solange es leer ist, der Satz dazu: ein Wert für Text und JSON.
const artefaktTeil = (k: WerkzeugKontext, name: ArtefaktName, a: { markdown: string } | null): { markdown: string } | { hinweis: string } =>
  a ? { markdown: a.markdown } : { hinweis: nochLeer(k, name) };

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

// Nur Name und Meldung ins Log, nie Daten der Mappe.
const fehlerLoggen = (wo: string, e: unknown) => console.error(wo, e instanceof Error ? `${e.name}: ${e.message}` : 'Fehler');

// Ausnahmen werden zu einem Fehlerergebnis mit einem Satz für die Person; Einzelheiten nur ins Log.
async function sicher(k: WerkzeugKontext, f: () => Promise<CallToolResult>): Promise<CallToolResult> {
  try {
    return await f();
  } catch (e) {
    let text: string;
    if (e instanceof Hinweis) text = e.message;
    else if (e instanceof ApiAusnahme) text = chatSatz(k, e);
    else {
      fehlerLoggen('werkstatt-mcp:', e);
      text = 'In der Werkstatt ist etwas schiefgegangen. Versuch es später noch einmal.';
    }
    return { content: [{ type: 'text', text }], isError: true };
  }
}

// Repo der Person aus den Claims, nur wenn es existiert und laut werkstatt.json ihr gehört. Ein Weg für alle
// Werkzeuge: der GitHub-Speicher liefert bei fehlendem Repo aus lesen() null, aus uebersicht() einen 404.
// Lehrende lesen ihre Demo-Mappe (NDU-37), damit sich die Prüfungen im Kurs vorführen lassen.
async function eigeneMappe(k: WerkzeugKontext): Promise<string> {
  const { githubId, kohorte, rolle } = k.claims;
  // bearerPruefen hat die Mitgliedschaft gerade geprüft; fehlt sie jetzt trotzdem, nichts lesen.
  const m = mitgliedschaftFinden(k.abh.umgebung.zugang, githubId, kohorte, rolle);
  if (!m) throw new Hinweis('Dein Zugang zur Werkstatt ist nicht mehr aktiv. Frag Markus.');
  const repo = repoName(mappeMitgliedschaft(m, githubId));
  const wj = await k.abh.speicher.werkstattJson(repo);
  if (!wj) throw new Hinweis(keineMappe(k));
  // Kürzel neu vergeben: das alte Repo gehört noch der vorigen Person.
  if (wj.githubId !== githubId) throw new Hinweis('Diese Mappe gehört nicht zu deinem Zugang. Frag Markus.');
  return repo;
}

// Geparste Daten, null = noch nicht gespeichert, 'unlesbar' = kaputtes JSON oder falsches Format.
async function artefaktLaden<N extends ArtefaktName>(k: WerkzeugKontext, repo: string, name: N) {
  let daten: unknown;
  try {
    ({ daten } = await k.abh.speicher.lesen(repo, name));
  } catch (e) {
    if (e instanceof DateiUnlesbar) return 'unlesbar' as const;
    throw e;
  }
  if (daten === null) return null;
  const p = artefaktParsen(name, daten);
  return p.ok ? p.daten : ('unlesbar' as const);
}

async function artefaktHolen(k: WerkzeugKontext, name: ArtefaktName, repo?: string) {
  const daten = await artefaktLaden(k, repo ?? (await eigeneMappe(k)), name);
  if (daten === null) return null;
  if (daten === 'unlesbar') throw new Hinweis(unpassendeDatei(k, name));
  return { markdown: rendern(name, daten) };
}

function methodeDaten(k: WerkzeugKontext, m: Methode) {
  return {
    slug: m.slug,
    name: m.name,
    frage: m.frage,
    ...(m.pruefliste ? { pruefliste: m.pruefliste.map(ausgabe) } : {}),
    ki: m.ki,
    ...(m.quelle ? { quelle: m.quelle } : {}),
    link: `${k.origin}/innolab/methoden/${m.slug}`,
  };
}

function methodeText(d: ReturnType<typeof methodeDaten>): string {
  const zeilen = [`# ${d.name}`, '', `Frage: ${d.frage}`, ''];
  if (d.pruefliste) zeilen.push('Prüfliste:', ...d.pruefliste.map(pruefpunktZeile), '');
  zeilen.push(`Rolle der KI: ${d.ki}`);
  if (d.quelle) zeilen.push(`Quelle: ${d.quelle}`);
  zeilen.push(`Methodenseite: ${d.link}`);
  return zeilen.join('\n');
}

function anleitungMethode(d: ReturnType<typeof methodeDaten>): string[] {
  return [
    'Die KI kommt immer erst nach der eigenen Arbeit der Person dran.',
    ...(d.pruefliste ? [`Mit der Nummer oder ID eines Prüfpunkts prüft ${MCP_WERKZEUGE.artefaktPruefen} (pruefpunkt) nur diesen Punkt.`] : []),
  ];
}

// Schreibweise einer Prüfpunkt-Angabe vereinheitlichen: klein, Umlaute wie in den IDs (prüfpunkt -> pruefpunkt), alles
// außer Buchstaben und Ziffern als ein Bindestrich (Leerzeichen, Striche, „&“, „#“, Satzzeichen am Ende), ohne
// „Punkt“/„Prüfpunkt“ davor.
// "" und null = keine Angabe.
function pruefpunktNormal(s: string | null | undefined): string | undefined {
  const t = (s ?? '')
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^(?:pruef)?punkt-/, '');
  return t || undefined;
}

// Index des gemeinten Prüfpunkts, sonst -1.
// - Die feste ID (annahmen-loesung), auch ohne Slug (loesung) oder mit dem Artefaktnamen statt des Slugs
//   (leitfaden-zukunft = interview-zukunft).
// - Eine alte Positions-ID von vor NDU-28 (annahmen-5, leitfaden-3) über ihr eingefrorenes alt: Sie zeigt auch nach
//   Umsortieren auf denselben Punkt. Positions-IDs ohne alt (annahmen-9) gibt es nicht.
// - Eine bloße Nummer (5, 05) meint die Position in der aktuellen Liste, wie der Prüf-Prompt sie nummeriert.
function pruefpunktFinden(alle: readonly Pruefpunkt[], roh: string, slug: string, artefakt: ArtefaktName): number {
  if (/^\d+$/.test(roh)) {
    const i = Number(roh) - 1;
    return i >= 0 && i < alle.length ? i : -1;
  }
  const ohne = roh.startsWith(`${slug}-`) ? roh.slice(slug.length + 1) : roh.startsWith(`${artefakt}-`) ? roh.slice(artefakt.length + 1) : roh;
  const kurz = /^\d+$/.test(ohne) ? String(Number(ohne)) : ohne;
  const i = alle.findIndex((p) => p.id === `${slug}-${kurz}`);
  return i >= 0 ? i : alle.findIndex((p) => p.alt === `${slug}-${kurz}`);
}

const LAGE_TEXT: Record<Kurstag['lage'], string> = {
  heute: 'heute',
  naechster: 'nächster Kurstag',
  gewaehlt: 'gewählt',
  vorbei: 'letzter Kurstag, der Kurs ist vorbei',
};
const STAND_TEXT: Record<ArtefaktStand['stand'], string> = {
  leer: 'leer',
  duenn: 'dünn',
  ausgefuellt: 'ausgefüllt',
  unlesbar: 'unlesbar',
  'nicht-gelesen': 'nicht gelesen',
};

function standZeile(s: ArtefaktStand): string {
  return `- ${s.titel} (${s.artefakt}): ${STAND_TEXT[s.stand]} – ${s.umfang}${s.fehlt.length ? `; ${s.fehlt.join('; ')}` : ''}`;
}

// Liest die Artefakte für tag_stand: eine unlesbare Datei zählt als „unlesbar“, ein GitHub-Ausfall nur bei diesem
// Artefakt als „nicht gelesen“; die übrigen Zeilen bleiben.
async function staendeLesen(k: WerkzeugKontext, repo: string, namen: readonly ArtefaktName[]): Promise<ArtefaktStand[]> {
  return Promise.all(
    namen.map(async (name) => {
      let daten: Awaited<ReturnType<typeof artefaktLaden>>;
      try {
        daten = await artefaktLaden(k, repo, name);
      } catch (e) {
        // Nur ein GitHub-Ausfall wird zur Zeile „nicht gelesen“; alles andere ist ein Fehler des Werkzeugs (sicher()).
        if (!(e instanceof ApiAusnahme && e.code === 'github-fehler')) throw e;
        fehlerLoggen('werkstatt-mcp tag_stand:', e);
        return artefaktStand(name, 'nicht-gelesen');
      }
      return artefaktStand(name, daten);
    }),
  );
}

// tag als Zahl 1–7; "" und null = ohne. Alles andere: Hinweis mit dem gültigen Bereich.
function tagLesen(tag: number | string | null | undefined): number | undefined {
  const roh = typeof tag === 'string' ? tag.trim() : tag;
  if (roh === undefined || roh === null || roh === '') return undefined;
  const n = typeof roh === 'number' ? roh : /^\d+$/.test(roh) ? Number(roh) : NaN;
  if (!Number.isInteger(n) || n < 1 || n > TAGE.length) throw new Hinweis(`Den Kurstag „${tag}“ gibt es nicht. Möglich sind 1 bis ${TAGE.length}.`);
  return n;
}

// Eine Prüfliste, die die Lösung einer Übung verrät (prueflisteNach, z. B. die Interview-Methode und der Mom Test), gibt der
// Connector erst frei wie die Seite und der Leitfaden-Editor (gruppeFrei): sobald Markus die Gruppe aufgedeckt hat –
// derselbe Runtime-Cache-Eintrag wie api/aufgedeckt.ts, je Wiener Kalendertag – oder die Zeit vorbei ist; Lehrende immer.
// Der Satz nennt das Werkzeug, das Claude nach dem Aufdecken noch einmal aufrufen soll.
const kommtNachDerUebung = (m: Methode, werkzeug: string) =>
  `Kommt nach der Übung: Die Prüfliste von „${m.name}“ verrät die Lösung der Übung. Sie ist frei, sobald Markus sie aufdeckt, spätestens ${abText(m.prueflisteNach!.ab)}. Bis dahin prüfst du nichts dagegen und nennst ihre Regeln nicht. Sobald Markus die Übung aufgedeckt hat, ruf ${werkzeug} noch einmal auf.`;

// Hat Markus die Gruppe heute aufgedeckt? [gruppe] oder []; wie aufgedecktHolen für gruppeFrei.
async function heuteAufgedeckt(k: WerkzeugKontext, gruppe: string, jetzt: Date): Promise<string[]> {
  try {
    return (await k.abh.cache.get(aufgedecktSchluessel(gruppe, jetzt))) ? [gruppe] : [];
  } catch (e) {
    // Lieber zu als zu früh offen: die Uhrzeit öffnet sie ohnehin.
    fehlerLoggen('werkstatt-mcp aufgedeckt:', e);
    return [];
  }
}

// mappe: geprüft wird eine Mappe – bei Lehrenden ihre Demo-Mappe, die oft am Beamer läuft. Dann gilt die Regel der
// Studierenden (Aufdecken oder Uhrzeit), sonst verriete die Vorführung die Übung. Ohne Mappe (methode_erklaeren) sehen
// Lehrende die Prüfliste immer.
async function prueflisteFrei(k: WerkzeugKontext, m: Methode, mappe = false): Promise<boolean> {
  const nach = m.prueflisteNach;
  if (!nach) return true;
  const jetzt = new Date(k.abh.jetzt());
  const immer = !mappe && k.claims.rolle === 'lehrende';
  // Öffnen Rolle oder Uhrzeit sie schon, braucht es den Cache nicht.
  if (gruppeFrei(nach.gruppe, nach.ab, jetzt, [], immer)) return true;
  return gruppeFrei(nach.gruppe, nach.ab, jetzt, await heuteAufgedeckt(k, nach.gruppe, jetzt), immer);
}

// --- Registrierung ---

export function werkzeugeRegistrieren(server: McpServer, k: WerkzeugKontext): void {
  server.registerTool(MCP_WERKZEUGE.mappeUebersicht, UEBERSICHT, () =>
    sicher(k, async () => {
      const repo = await eigeneMappe(k);
      const stand: MappeStand = { kohorte: k.claims.kohorte, repo, lesezugriff: 'unbekannt', artefakte: await k.abh.speicher.uebersicht(repo) };
      const artefakte = stand.artefakte.map((a) => ({ name: a.name, titel: ARTEFAKTE[a.name].titel, vorhanden: a.vorhanden }));
      const demo = k.claims.rolle === 'lehrende';
      const zeilen = artefakte.map((a) => `- ${a.titel} (${a.name}): ${a.vorhanden ? 'gespeichert' : 'noch leer'}`);
      const saetze = [
        ...(demo ? ['Das ist die Demo-Mappe der Lehrperson; sie zählt nicht als Mappe der Kohorte.'] : []),
        `Bearbeiten in der Werkstatt: ${mappeUrl(k)}`,
      ];
      return ergebnis([`${demo ? 'Deine Demo-Mappe' : 'Deine Mappe'} (Kohorte ${stand.kohorte}):`, ...zeilen].join('\n'), {
        ...stand,
        artefakte,
        ...(demo ? { demoMappe: true as const } : {}),
        werkstatt: mappeUrl(k),
      }, saetze);
    }),
  );

  server.registerTool(MCP_WERKZEUGE.artefaktLesen, LESEN_WERKZEUG, ({ artefakt }) =>
    sicher(k, async () => {
      const repo = await eigeneMappe(k);
      const [a, fb] = await Promise.all([artefaktHolen(k, artefakt, repo), feedbackFuerClaude(k.abh, repo, artefakt)]);
      const teil = artefaktTeil(k, artefakt, a);
      const text = ('markdown' in teil ? teil.markdown : teil.hinweis) + feedbackText(fb).join('\n');
      const sc = { artefakt, titel: ARTEFAKTE[artefakt].titel, vorhanden: a !== null, ...teil, ...feedbackFelder(fb), werkstatt: mappeUrl(k) };
      return ergebnis(text, sc, [...(fb?.length ? [FEEDBACK_ANLEITUNG] : []), aendernNurInDerWerkstatt(k)]);
    }),
  );

  server.registerTool(MCP_WERKZEUGE.methodeErklaeren, METHODE, ({ slug }) =>
    sicher(k, async () => {
      const m = METHODEN.find((x) => x.slug === slug);
      if (!m) throw new Hinweis(`Diese Methode gibt es nicht. Mögliche Slugs: ${SLUGS.join(', ')}.`);
      if (!(await prueflisteFrei(k, m))) {
        const { pruefliste: _zu, ...d } = methodeDaten(k, m);
        return ergebnis(methodeText(d), { ...d, prueflisteGesperrt: true }, [...anleitungMethode(d), kommtNachDerUebung(m, MCP_WERKZEUGE.methodeErklaeren)]);
      }
      const d = methodeDaten(k, m);
      return ergebnis(methodeText(d), d, anleitungMethode(d));
    }),
  );

  server.registerTool(MCP_WERKZEUGE.tagStand, TAG_STAND, ({ tag }) =>
    sicher(k, async () => {
      const repo = await eigeneMappe(k);
      const gewaehlt = tagLesen(tag);
      const kh = kohorte(k.claims.kohorte);
      if (!kh) throw new Hinweis('Deine Kohorte kennt die Werkstatt nicht (mehr). Frag Markus.');
      const vorhanden = werkstattArtefakte(kh);
      const heute = wienerZeit(new Date(k.abh.jetzt())).datum;
      const kt = kurstagBestimmen(kh.termine, heute, gewaehlt);
      const faelligNamen = faelligBis(kt.tag, vorhanden);
      const inArbeitNamen = kt.lage === 'vorbei' ? [] : inArbeitAn(kt.tag, vorhanden);
      const [faellig, inArbeit] = await Promise.all([staendeLesen(k, repo, faelligNamen), staendeLesen(k, repo, inArbeitNamen)]);
      const entsteht = entstehtAn(kt.tag);
      const termin = kt.datum ? datumAt(kt.datum) : 'Termin noch offen';
      const zeilen = [
        `# Kurstag ${kt.tag}: ${kt.titel} (${termin}; ${LAGE_TEXT[kt.lage]})`,
        `Heute ist der ${datumAt(heute)}.`,
        ...(kt.ohneTermin.length
          ? [`Noch ohne Termin: ${kt.ohneTermin.map((n) => `Tag ${n} (${TAGE.find((t) => t.n === n)!.titel})`).join(', ')}; was dafür fällig ist, steht unten mit.`]
          : []),
        '',
        `## Fällig bis Tag ${kt.tag}`,
        ...(faellig.length ? faellig.map(standZeile) : ['Noch nichts aus der Werkstatt-Mappe.']),
        ...(inArbeit.length ? ['', `## Ab Tag ${kt.tag} in Arbeit (fällig zu Tag ${kt.tag + 1})`, ...inArbeit.map(standZeile)] : []),
        ...(entsteht.length ? ['', `## Methoden an Tag ${kt.tag}`, ...entsteht.map((m) => `- ${m.name}`)] : []),
      ];
      const saetze = [
        'Das sind nur Zahlen, kein Urteil über die Qualität.',
        `Inhaltlich prüfen: ${MCP_WERKZEUGE.artefaktPruefen}.`,
        `Bearbeiten in der Werkstatt: ${mappeUrl(k)}`,
      ];
      return ergebnis(zeilen.join('\n'), { kohorte: k.claims.kohorte, heute, ...kt, faellig, inArbeit, entsteht, werkstatt: mappeUrl(k) }, saetze);
    }),
  );

  server.registerTool(MCP_WERKZEUGE.artefaktPruefen, PRUEFEN, ({ artefakt, pruefpunkt }) =>
    sicher(k, async () => {
      const m = methodeZu(artefakt);
      const titel = ARTEFAKTE[artefakt].titel;
      // Zuerst die Mappe: Personen ohne Mappe hören das vor jedem Hinweis zu Sperre oder Prüfpunkt.
      const repo = await eigeneMappe(k);
      // Ohne Prüfliste prüfte Claude mit eigenem Mom-Test-Wissen – das verriete die Übung genauso. Kein Fehlerergebnis:
      // Die Sperre ist kein Ausfall des Werkzeugs, Clients sollen keinen Fehler anzeigen.
      if (!(await prueflisteFrei(k, m, true))) {
        return ergebnis(`# Prüfung: ${titel}`, { artefakt, titel, methode: m.name, gesperrt: true, pruefpunkte: [], vorarbeit: [] }, [
          kommtNachDerUebung(m, MCP_WERKZEUGE.artefaktPruefen),
        ]);
      }
      const alle = m.pruefliste ?? [];
      // ChatGPT schickt für ein leeres optionales Argument "" oder null: das heißt „alle Prüfpunkte“.
      // Welche Schreibweisen gelten (feste ID, alte Positions-ID, Nummer), steht bei pruefpunktFinden.
      const roh = pruefpunktNormal(pruefpunkt);
      const fokusIndex = roh === undefined ? -1 : pruefpunktFinden(alle, roh, m.slug, artefakt);
      if (roh !== undefined && fokusIndex < 0) {
        throw new Hinweis(`Den Prüfpunkt „${pruefpunkt!.trim()}“ gibt es für ${titel} nicht. Mögliche Prüfpunkte: ${alle.map((p) => p.id).join(', ')}.`);
      }
      const fokus = fokusIndex < 0 ? undefined : { punkt: alle[fokusIndex], naechster: alle[fokusIndex + 1] };
      const punkte = alle.map(ausgabe);
      const pruefpunkte = fokus ? [punkte[fokusIndex]] : punkte;

      // Vorarbeit gleichzeitig mit dem Artefakt lesen, mitgeliefert nur, wenn es etwas zu prüfen gibt. Eine unlesbare
      // Datei oder ein GitHub-Ausfall bei der Vorarbeit verhindert die Prüfung nicht, sie steht dann als Hinweis da.
      const vorarbeitLesen = Promise.all(
        werkstattVorarbeit(m).map(async (name) => {
          const kopf = { artefakt: name, titel: ARTEFAKTE[name].titel, zweck: VORARBEIT_ZWECK };
          let hinweis: string;
          try {
            const inhalt = await artefaktHolen(k, name, repo);
            if (inhalt) return { ...kopf, vorhanden: true, markdown: inhalt.markdown };
            hinweis = ohneAbgleich(name, 'noch nicht ausgefüllt');
          } catch (e) {
            if (e instanceof Hinweis) hinweis = e.message;
            else {
              fehlerLoggen('werkstatt-mcp vorarbeit:', e);
              hinweis = ohneAbgleich(name, 'ließ sich gerade nicht lesen');
            }
          }
          return { ...kopf, vorhanden: false, hinweis };
        }),
      );
      const feedbackLesen = feedbackFuerClaude(k.abh, repo, artefakt);
      const a = await artefaktHolen(k, artefakt, repo);
      const vorarbeit = a ? await vorarbeitLesen : [];
      const fb = await feedbackLesen;
      const teil = artefaktTeil(k, artefakt, a);

      const saetze = a
        ? anleitungPruefen(k, artefakt, { fokus, vorarbeit: vorarbeit.length > 0, vorarbeitFehlt: vorarbeit.some((v) => !v.vorhanden), feedback: !!fb?.length })
        // Noch leer, aber schon Feedback (etwa zum ganzen Brief): der Satz dazu gilt auch hier.
        : [ANLEITUNG_LEER, ...(fb?.length ? [FEEDBACK_ANLEITUNG] : [])];
      const text = [
        `# Prüfung: ${titel}`,
        '',
        fokus ? `## Prüfpunkt im Fokus (${m.name})` : `## Prüfpunkte (${m.name})`,
        ...pruefpunkte.map(pruefpunktZeile),
        '',
        '## Artefakt',
        'markdown' in teil ? eingebettet(teil.markdown) : teil.hinweis,
        ...vorarbeit.flatMap((v) => [
          '',
          `## Vorarbeit zum Abgleich: ${v.titel} (${v.artefakt})`,
          v.zweck,
          '',
          v.markdown !== undefined ? eingebettet(v.markdown) : v.hinweis,
        ]),
        ...feedbackText(fb),
      ].join('\n');
      const sc = { artefakt, titel, methode: m.name, vorhanden: a !== null, ...teil, pruefpunkte, vorarbeit, ...feedbackFelder(fb) };
      return ergebnis(text, sc, saetze, '## So antwortest du');
    }),
  );
  server.registerTool(MCP_WERKZEUGE.verknuepfungenPruefen, VERKNUEPFUNGEN, () =>
    sicher(k, async () => {
      const repo = await eigeneMappe(k);
      const [brief, entscheidungen, leitfaden, annahmen, interviews] = await Promise.all([
        artefaktLaden(k, repo, 'brief'),
        artefaktLaden(k, repo, 'entscheidungen'),
        artefaktLaden(k, repo, 'leitfaden'),
        artefaktLaden(k, repo, 'annahmen'),
        artefaktLaden(k, repo, 'interviews'),
      ]);
      const mappe: MappeDaten = { brief, entscheidungen, leitfaden, annahmen, interviews };
      const v = verknuepfungenPruefen(mappe);
      return ergebnis(verknuepfungenText(v), { ...v, werkstatt: mappeUrl(k) }, [aendernNurInDerWerkstatt(k)]);
    }),
  );
}
