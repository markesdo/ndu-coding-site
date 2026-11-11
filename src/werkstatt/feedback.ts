// Feedback der Lehrenden zu einem Artefakt (optional zu einer Zeile) und Antworten der Studierenden (NDU-35).
// Liegt im Mappe-Repo der Person in mappe/feedback.json (Schema feedback@1), neben den Artefakten, aber nie darin:
// Lehrende schreiben nur hier, nie in die Artefakte. Rein (ohne Speicher), damit Server, Browser und Connector dieselben
// Regeln nutzen. Die Server-Routen schicken nie eine ganze Datei vom Browser durch, sondern rufen genau eine dieser
// Änderungen auf dem Stand auf, auf dem der Commit landet (Speicher.feedbackAendern) – so bleibt jeder Eintrag erhalten,
// auch wenn Lehrende und Studierende gleichzeitig schreiben. Keine Noten, keine Punkte.
// NDU-41: Feedback der Lehrenden trägt optional ein Kriterium aus dem Katalog (kriterien.ts). Neues optionales Feld, darum
// weiter feedback@1 (Regel im Werkstatt-Design: neue Felder optional → keine neue Version); alte Dateien bleiben gültig.
// NDU-42: Feedback der Lehrenden zu einer erlaubten Zeile trägt optional eine „mögliche Fassung“ – versiegelt (fassung,
// AES-GCM, server/fassung.ts), mit dem Stand der Zeile beim Schreiben (zeilenStand, SHA-256 des normalisierten
// Zeilentexts) und, sobald die Person sie sehen darf, dem Zeitpunkt (aufgedecktAm). Klartext steht nie in der Datei:
// Die Person hat Lesezugriff auf ihr Repo, und die Fassung darf sie erst nach eigener Überarbeitung sehen. Ob sie offen
// ist, rechnet nur der Server (server/fassung.ts); Browser und Connector bekommen nie das Siegel.
import { z } from 'zod';
import { KRITERIUM_ID, kriterium as kriteriumAusKatalog, kriteriumPasst } from './kriterien.js';
import { ARTEFAKT_NAMEN, ARTEFAKTE, type ArtefaktName, type DatenVon } from './schemas/index.js';
import { graphemAnzahl } from './text.js';

export const FEEDBACK_PFAD = 'mappe/feedback.json';
export const FEEDBACK_SCHEMA = 'feedback@1';
// Lehrende schreiben einen Absatz, Antworten sind kurz.
export const FEEDBACK_MAX = 1500;
export const ANTWORT_MAX = 500;
// Mögliche Fassung (NDU-42): eine Zeile, Form statt Inhalt. Dazu eine Grenze in Bytes (UTF-8), damit das Siegel immer
// in die Form von feedback@1 passt (FASSUNG_SIEGEL): 300 Zeichen aus Emoji-Folgen wären sonst bis zu einige kB.
export const FASSUNG_MAX = 300;
export const FASSUNG_MAX_BYTES = 1200;
const AUTOR_MAX = 60;

// Abschnitte des Produkt-Briefs (der Brief hat keine Zeilen-IDs); Titel wie die Karten der Vorschau (brief-hilfen.ts).
export const BRIEF_ABSCHNITTE = {
  fuerWen: 'Für wen?',
  problem: 'Welches Problem?',
  produktSatz: 'Produkt in einem Satz',
  nicht: 'Was macht es NICHT?',
  outcome: 'Woran merken wir, dass es funktioniert?',
  offeneFragen: 'Offene Fragen',
} as const;
export type BriefAbschnitt = keyof typeof BRIEF_ABSCHNITTE;

// Welche Zeilen-IDs zu welchem Artefakt passen (wie die Schemas: D3, F1, A2, I2 und Zitate I2-4).
const ZEILEN_MUSTER: Record<Exclude<ArtefaktName, 'brief'>, RegExp> = {
  entscheidungen: /^D[1-9][0-9]*$/,
  leitfaden: /^F[1-9][0-9]*$/,
  annahmen: /^A[1-9][0-9]*$/,
  interviews: /^I[1-9][0-9]*(-[1-9][0-9]*)?$/,
};

/** Passt die Zeilen-ID (oder beim Brief der Abschnitt) zu diesem Artefakt? */
export function zeilePasst(artefakt: ArtefaktName, zeilenId: string): boolean {
  if (artefakt === 'brief') return Object.hasOwn(BRIEF_ABSCHNITTE, zeilenId);
  return ZEILEN_MUSTER[artefakt].test(zeilenId);
}

/** „A2“ oder beim Brief der Titel des Abschnitts („Welches Problem?“). */
export function zeilenName(artefakt: ArtefaktName, zeilenId: string): string {
  return artefakt === 'brief' && Object.hasOwn(BRIEF_ABSCHNITTE, zeilenId) ? BRIEF_ABSCHNITTE[zeilenId as BriefAbschnitt] : zeilenId;
}

// Wo Lehrende eine mögliche Fassung hinterlegen dürfen (NDU-39): Outcome und Problem im Brief, der Wortlaut einer
// Annahme, eine Leitfaden-Frage. Nie an Interviews und Zitaten (Daten der Person), Entscheidungen, Belegen oder am
// ganzen Artefakt – dort nur eine Frage.
const FASSUNG_BRIEF: readonly string[] = ['outcome', 'problem'] satisfies BriefAbschnitt[];
export const FASSUNG_ORTE = 'Eine mögliche Fassung geht nur an Outcome oder Problem im Brief, an einer Annahme oder an einer Leitfaden-Frage.';

/** Darf an dieser Stelle eine mögliche Fassung stehen? */
export function fassungErlaubt(artefakt: ArtefaktName, zeilenId: string | undefined): boolean {
  if (zeilenId === undefined || !zeilePasst(artefakt, zeilenId)) return false;
  return artefakt === 'brief' ? FASSUNG_BRIEF.includes(zeilenId) : artefakt === 'annahmen' || artefakt === 'leitfaden';
}

/** Text der Zeile, an der eine Fassung hängt, normalisiert (NFC, Leerraum zu einem Leerzeichen): Nur echte Änderungen
 *  am Wortlaut zählen, nicht ein zusätzliches Leerzeichen. Beim Outcome beide Felder. null = die Zeile gibt es nicht
 *  (mehr) oder das Artefakt ist nicht gespeichert; einen noch nicht gespeicherten Brief zählen die Abschnitte als leer
 *  (sie gibt es immer). daten = mit dem Schema des Editors geprüft. */
export function fassungZeilenText(artefakt: ArtefaktName, daten: unknown, zeilenId: string): string | null {
  const norm = (t: string) => t.normalize('NFC').replace(/\s+/g, ' ').trim();
  if (artefakt === 'brief' && (daten === null || daten === undefined)) daten = { problem: '', outcome: { wirGlauben: '', wirMerkenEs: '' } };
  if (daten === null || daten === undefined) return null;
  switch (artefakt) {
    case 'brief': {
      const b = daten as DatenVon<'brief'>;
      if (zeilenId === 'problem') return norm(b.problem);
      if (zeilenId === 'outcome') return `${norm(b.outcome.wirGlauben)}\n${norm(b.outcome.wirMerkenEs)}`;
      return null;
    }
    case 'annahmen': {
      const a = (daten as DatenVon<'annahmen'>).annahmen.find((x) => x.id === zeilenId);
      return a ? norm(a.text) : null;
    }
    case 'leitfaden': {
      const f = (daten as DatenVon<'leitfaden'>).fragen.find((x) => x.id === zeilenId);
      return f ? norm(f.text) : null;
    }
    default:
      return null;
  }
}

export interface ZeilenWahl {
  wert: string;
  text: string;
}

const KURZ = 48;
function kurz(s: string): string {
  const t = s.replace(/\s+/g, ' ').trim();
  const g = [...new Intl.Segmenter('de', { granularity: 'grapheme' }).segment(t)].map((x) => x.segment);
  return g.length > KURZ ? `${g.slice(0, KURZ).join('').trimEnd()} …` : t;
}
const mitText = (id: string, text: string) => ({ wert: id, text: text.trim() ? `${id} · ${kurz(text)}` : id });

/** Zeilen eines Artefakts, zu denen Lehrende Feedback schreiben können: jede Zeile mit ID (beim Brief die Abschnitte),
 *  in der Reihenfolge des Artefakts. Dieselbe Liste für die Auswahl im Leser und die Prüfung der Route.
 *  daten = mit dem Schema des Editors geprüft; null = nichts gespeichert. */
export function zeilenAuswahl(name: ArtefaktName, daten: unknown): ZeilenWahl[] {
  if (name === 'brief') return Object.entries(BRIEF_ABSCHNITTE).map(([wert, text]) => ({ wert, text }));
  if (daten === null || daten === undefined) return [];
  switch (name) {
    case 'entscheidungen':
      return (daten as DatenVon<'entscheidungen'>).entscheidungen.map((e) => mitText(e.id, e.entscheidung));
    case 'leitfaden':
      return (daten as DatenVon<'leitfaden'>).fragen.map((f) => mitText(f.id, f.text));
    case 'annahmen':
      return (daten as DatenVon<'annahmen'>).annahmen.map((a) => mitText(a.id, a.text));
    case 'interviews':
      return (daten as DatenVon<'interviews'>).interviews.flatMap((iv) => [mitText(iv.id, iv.pseudonym), ...iv.zitate.map((z) => mitText(z.id, z.text))]);
  }
}

const FEEDBACK_ID = /^FB[1-9][0-9]*$/;
// Versiegelte Fassung: `f1.<kid>.<base64url>` (server/fassung.ts); Stand der Zeile: `sha256:<64 hex>`. 2000 Zeichen
// base64url fassen 1500 Bytes: Nonce (12) + FASSUNG_MAX_BYTES (1200) + Tag (16) = 1228.
export const FASSUNG_SIEGEL = /^f1\.[A-Za-z0-9_-]{1,32}\.[A-Za-z0-9_-]{20,2000}$/;
export const ZEILEN_STAND = /^sha256:[0-9a-f]{64}$/;
// Form einer Kriteriums-ID: KRITERIUM_ID aus kriterien.ts. Ob es sie im Katalog gibt und ob sie passt, prüft
// feedbackSchreiben beim Schreiben, nicht das Lesen: Eine Datei bleibt lesbar, auch wenn der Katalog sich später ändert.
// Wie das Schema der Beleg-Notiz: Steuer- und Formatzeichen sind nicht erlaubt (U+202E dreht Text um); Zeilenumbrüche
// (\n) und Tab schon, der Joiner in Emoji-Folgen auch.
const STEUERZEICHEN = /(?![\n\t\p{Join_Control}])[\p{Cc}\p{Cf}\u2028\u2029\u0085]/u;

const textSchema = (max: number) =>
  z
    .string({ error: 'Text: bitte als Text eintragen.' })
    .refine((s) => s.trim() !== '', { error: 'Text: bitte etwas eintragen.' })
    .refine((s) => !STEUERZEICHEN.test(s), { error: 'Text: ohne Steuerzeichen.' })
    .refine((s) => graphemAnzahl(s) <= max, { error: `Text: höchstens ${max} Zeichen.` });

const eintragSchema = z
  .object({
    id: z.string().regex(FEEDBACK_ID, { error: 'ID: muss wie FB1 aussehen.' }),
    artefakt: z.enum(ARTEFAKT_NAMEN, { error: 'Artefakt: unbekannt.' }),
    zeilenId: z.string().optional(),
    // Nur an Feedback der Lehrenden: Kriterium aus dem Katalog (NDU-41).
    kriterium: z.string().regex(KRITERIUM_ID, { error: 'Kriterium: unbekannte Form.' }).optional(),
    von: z.enum(['lehrende', 'studierende'], { error: 'von: „lehrende“ oder „studierende“.' }),
    autor: z.string().refine((s) => s.trim() !== '' && graphemAnzahl(s) <= AUTOR_MAX && !STEUERZEICHEN.test(s), { error: 'Autor: fehlt oder ist zu lang.' }),
    // Einträge der Studierenden sind kurz; die Datei selbst prüft die längere Grenze, die Route die passende.
    text: textSchema(FEEDBACK_MAX),
    datum: z.iso.datetime({ error: 'Datum: muss ein ISO-Zeitpunkt sein.' }),
    // Nur an Feedback der Lehrenden: die Person hat es erledigt bzw. schon geöffnet.
    erledigt: z.literal(true).optional(),
    gesehen: z.literal(true).optional(),
    // Nur an Antworten der Studierenden: auf welches Feedback.
    antwortAuf: z.string().regex(FEEDBACK_ID).optional(),
    // Nur an Feedback der Lehrenden zu einer erlaubten Zeile (NDU-42): versiegelte Fassung, Stand der Zeile beim
    // Schreiben und, sobald offen, wann die Person sie zum ersten Mal sehen durfte. Form wie FASSUNG_SIEGEL.
    fassung: z.string().regex(FASSUNG_SIEGEL, { error: 'Fassung: unbekannte Form.' }).optional(),
    zeilenStand: z.string().regex(ZEILEN_STAND, { error: 'Zeilenstand: unbekannte Form.' }).optional(),
    aufgedecktAm: z.iso.datetime({ error: 'aufgedecktAm: muss ein ISO-Zeitpunkt sein.' }).optional(),
  })
  .strict()
  .superRefine((e, ctx) => {
    if (e.zeilenId !== undefined && !zeilePasst(e.artefakt, e.zeilenId)) {
      ctx.addIssue({ code: 'custom', path: ['zeilenId'], message: `${e.zeilenId} passt nicht zu ${ARTEFAKTE[e.artefakt].titel}.` });
    }
    if (e.von === 'studierende' && e.kriterium !== undefined) ctx.addIssue({ code: 'custom', path: ['kriterium'], message: 'Ein Kriterium gibt es nur am Feedback der Lehrenden.' });
    if (e.von === 'lehrende' && e.antwortAuf !== undefined) ctx.addIssue({ code: 'custom', path: ['antwortAuf'], message: 'Feedback der Lehrenden antwortet auf nichts.' });
    if (e.von === 'studierende' && e.antwortAuf === undefined) ctx.addIssue({ code: 'custom', path: ['antwortAuf'], message: 'Eine Antwort braucht antwortAuf.' });
    if (e.von === 'studierende' && (e.erledigt !== undefined || e.gesehen !== undefined)) {
      ctx.addIssue({ code: 'custom', path: ['erledigt'], message: 'erledigt und gesehen gibt es nur am Feedback der Lehrenden.' });
    }
    if (e.fassung === undefined) {
      if (e.zeilenStand !== undefined || e.aufgedecktAm !== undefined) ctx.addIssue({ code: 'custom', path: ['zeilenStand'], message: 'zeilenStand und aufgedecktAm gibt es nur mit einer Fassung.' });
    } else if (e.von !== 'lehrende' || !fassungErlaubt(e.artefakt, e.zeilenId)) {
      ctx.addIssue({ code: 'custom', path: ['fassung'], message: 'Eine mögliche Fassung gibt es nur am Feedback der Lehrenden zu einer erlaubten Zeile.' });
    } else if (e.zeilenStand === undefined) {
      ctx.addIssue({ code: 'custom', path: ['zeilenStand'], message: 'Eine Fassung braucht den Stand der Zeile.' });
    }
  });

export const feedbackSchema = z
  .object({
    schema: z.literal(FEEDBACK_SCHEMA, { error: `Diese Datei ist kein ${FEEDBACK_SCHEMA}.` }),
    eintraege: z.array(eintragSchema, { error: 'Die Einträge müssen eine Liste sein.' }),
  })
  .strict()
  .superRefine((f, ctx) => {
    const nachId = new Map<string, (typeof f.eintraege)[number]>();
    f.eintraege.forEach((e, i) => {
      if (nachId.has(e.id)) ctx.addIssue({ code: 'custom', path: ['eintraege', i, 'id'], message: `${e.id} gibt es schon.` });
      nachId.set(e.id, e);
    });
    f.eintraege.forEach((e, i) => {
      if (e.antwortAuf === undefined) return;
      const ziel = nachId.get(e.antwortAuf);
      if (!ziel || ziel.von !== 'lehrende' || ziel.artefakt !== e.artefakt) {
        ctx.addIssue({ code: 'custom', path: ['eintraege', i, 'antwortAuf'], message: `${e.antwortAuf} ist kein Feedback der Lehrenden zu diesem Artefakt.` });
      }
    });
  });

export type Feedback = z.infer<typeof feedbackSchema>;
export type FeedbackEintrag = Feedback['eintraege'][number];

export const feedbackLeer = (): Feedback => ({ schema: FEEDBACK_SCHEMA, eintraege: [] });

/** null (Datei fehlt) = leer; passt die Datei nicht zum Schema: ok false. */
export function feedbackParsen(roh: unknown): { ok: true; daten: Feedback } | { ok: false; meldung: string } {
  if (roh === null) return { ok: true, daten: feedbackLeer() };
  const r = feedbackSchema.safeParse(roh);
  return r.success ? { ok: true, daten: r.data } : { ok: false, meldung: r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') };
}

/** So steht die Datei im Repo (eingerückt, mit Zeilenende wie die Artefakte). */
export const feedbackJson = (f: Feedback): string => `${JSON.stringify(f, null, 2)}\n`;

// Eine Änderung, die so nicht geht (unbekanntes Feedback, zu langer Text …): Satz für die Person.
export class FeedbackAbgelehnt extends Error {
  constructor(meldung: string) {
    super(meldung);
    this.name = 'FeedbackAbgelehnt';
  }
}

function naechsteId(f: Feedback): string {
  let max = 0;
  for (const e of f.eintraege) max = Math.max(max, Number(e.id.slice(2)));
  return `FB${max + 1}`;
}

// \r\n wie \n; Rand-Leerraum weg. Ein Satz pro Fehler.
function textPruefen(roh: unknown, max: number): string {
  if (typeof roh !== 'string') throw new FeedbackAbgelehnt('Bitte einen Text eintragen.');
  const t = roh.replace(/\r\n?/g, '\n').trim();
  const r = textSchema(max).safeParse(t);
  if (!r.success) throw new FeedbackAbgelehnt(r.error.issues[0].message);
  return t;
}

function lehrendenEintrag(f: Feedback, id: unknown): FeedbackEintrag {
  const e = f.eintraege.find((x) => x.id === id && x.von === 'lehrende');
  if (!e) throw new FeedbackAbgelehnt('Dieses Feedback gibt es nicht (mehr). Neu laden.');
  return e;
}

const leerWert = (x: unknown) => x === undefined || x === null || x === '';

/** Text einer möglichen Fassung (NDU-42): eine Zeile (Leerraum und Umbrüche werden zu einem Leerzeichen), höchstens
 *  FASSUNG_MAX Zeichen, ohne Steuerzeichen. undefined = keine Fassung (fehlt oder leer). */
export function fassungTextPruefen(roh: unknown): string | undefined {
  if (leerWert(roh)) return undefined;
  if (typeof roh !== 'string') throw new FeedbackAbgelehnt('Mögliche Fassung: bitte als Text eintragen.');
  const t = roh.replace(/\s+/g, ' ').trim();
  if (t === '') return undefined;
  if (STEUERZEICHEN.test(t)) throw new FeedbackAbgelehnt('Mögliche Fassung: ohne Steuerzeichen.');
  if (graphemAnzahl(t) > FASSUNG_MAX) throw new FeedbackAbgelehnt(`Mögliche Fassung: höchstens ${FASSUNG_MAX} Zeichen.`);
  if (new TextEncoder().encode(t).length > FASSUNG_MAX_BYTES) throw new FeedbackAbgelehnt(`Mögliche Fassung: zu lang (höchstens ${FASSUNG_MAX} Zeichen; manche Zeichen wie Emoji zählen mehrfach).`);
  return t;
}

/** Offene Fassung zu diesem Artefakt: Feedback der Lehrenden mit Fassung, noch nicht erledigt. Höchstens eine je
 *  Artefakt (NDU-39: eine Fassung pro Artefakt und Runde; die Runde endet mit „erledigt“). */
export function offeneFassung<T extends Pick<FeedbackEintrag, 'von' | 'artefakt' | 'erledigt'> & { fassung?: unknown }>(eintraege: readonly T[], artefakt: ArtefaktName): T | undefined {
  return eintraege.find((x) => x.von === 'lehrende' && x.artefakt === artefakt && x.fassung !== undefined && x.erledigt !== true);
}

/** Lehrende: neues Feedback zu einem Artefakt, optional zu einer Zeile und optional mit einem Kriterium aus dem Katalog,
 *  das zu Artefakt und (beim Brief) Abschnitt passt. fassung: schon versiegelt (server/fassung.ts) mit dem Stand der Zeile
 *  beim Schreiben; nur an erlaubten Zeilen und höchstens eine offene je Artefakt. */
export function feedbackSchreiben(
  f: Feedback,
  e: { artefakt: ArtefaktName; zeilenId?: unknown; kriterium?: unknown; text: unknown; autor: string; datum: string; fassung?: { siegel: string; zeilenStand: string } },
): Feedback {
  const text = textPruefen(e.text, FEEDBACK_MAX);
  const roh = leerWert(e.zeilenId) ? undefined : e.zeilenId;
  if (roh !== undefined && (typeof roh !== 'string' || !zeilePasst(e.artefakt, roh))) {
    throw new FeedbackAbgelehnt(`Diese Zeile gibt es in ${ARTEFAKTE[e.artefakt].titel} so nicht.`);
  }
  const zeile = roh as string | undefined;
  let kriterium: string | undefined;
  if (!leerWert(e.kriterium)) {
    const k = typeof e.kriterium === 'string' ? kriteriumAusKatalog(e.kriterium) : undefined;
    if (!k) throw new FeedbackAbgelehnt('Dieses Kriterium gibt es nicht (mehr). Neu laden.');
    if (!kriteriumPasst(k, e.artefakt, zeile)) {
      const wozu = zeile === undefined ? ARTEFAKTE[e.artefakt].titel : e.artefakt === 'brief' ? `„${zeilenName(e.artefakt, zeile)}“` : zeile;
      throw new FeedbackAbgelehnt(`„${k.name}“ passt nicht zu ${wozu}.`);
    }
    kriterium = k.id;
  }
  if (e.fassung !== undefined) {
    if (!fassungErlaubt(e.artefakt, zeile)) throw new FeedbackAbgelehnt(FASSUNG_ORTE);
    const offen = offeneFassung(f.eintraege, e.artefakt);
    if (offen) throw new FeedbackAbgelehnt(`Zu ${ARTEFAKTE[e.artefakt].titel} gibt es schon eine offene mögliche Fassung (${offen.id}). Eine neue geht erst, wenn sie erledigt ist.`);
  }
  const neu: FeedbackEintrag = {
    id: naechsteId(f), artefakt: e.artefakt, ...(zeile !== undefined ? { zeilenId: zeile } : {}), ...(kriterium !== undefined ? { kriterium } : {}),
    von: 'lehrende', autor: e.autor, text, datum: e.datum,
    ...(e.fassung !== undefined ? { fassung: e.fassung.siegel, zeilenStand: e.fassung.zeilenStand } : {}),
  };
  return { ...f, eintraege: [...f.eintraege, neu] };
}

/** Studierende: kurze Antwort auf ein Feedback der Lehrenden (an derselben Stelle). */
export function antworten(f: Feedback, e: { antwortAuf: unknown; text: unknown; autor: string; datum: string }): Feedback {
  const ziel = lehrendenEintrag(f, e.antwortAuf);
  const text = textPruefen(e.text, ANTWORT_MAX);
  const neu: FeedbackEintrag = {
    id: naechsteId(f), artefakt: ziel.artefakt, ...(ziel.zeilenId !== undefined ? { zeilenId: ziel.zeilenId } : {}),
    von: 'studierende', autor: e.autor, text, datum: e.datum, antwortAuf: ziel.id,
  };
  // Eine Antwort öffnet die mögliche Fassung (NDU-42): gleich im selben Commit vermerken, wann.
  const aufdecken = ziel.fassung !== undefined && ziel.aufgedecktAm === undefined;
  const eintraege = aufdecken ? f.eintraege.map((x) => (x === ziel ? { ...x, aufgedecktAm: e.datum } : x)) : f.eintraege;
  return { ...f, eintraege: [...eintraege, neu] };
}

/** Studierende: Feedback der Lehrenden als erledigt markieren oder wieder öffnen. Ändert nur dieses eine Feld;
 *  unverändert = dieselbe Datei (kein Commit). */
export function erledigtSetzen(f: Feedback, id: unknown, erledigt: unknown): Feedback {
  if (typeof erledigt !== 'boolean') throw new FeedbackAbgelehnt('erledigt muss ja oder nein sein.');
  const ziel = lehrendenEintrag(f, id);
  if ((ziel.erledigt === true) === erledigt) return f;
  // Höchstens eine offene Fassung je Artefakt (NDU-42): Wieder öffnen darf keine zweite offene ergeben.
  if (!erledigt && ziel.fassung !== undefined) {
    const andere = offeneFassung(f.eintraege.filter((x) => x !== ziel), ziel.artefakt);
    if (andere) throw new FeedbackAbgelehnt(`${ziel.id} lässt sich gerade nicht wieder öffnen: Zu ${ARTEFAKTE[ziel.artefakt].titel} ist schon eine andere mögliche Fassung offen (${andere.id}). Setz zuerst ${andere.id} auf erledigt.`);
  }
  return {
    ...f,
    eintraege: f.eintraege.map((x) => {
      if (x !== ziel) return x;
      const { erledigt: _alt, ...rest } = x;
      return erledigt ? { ...rest, erledigt: true } : rest;
    }),
  };
}

/** Studierende haben das Feedback zu diesem Artefakt geöffnet: „neu“ fällt weg. Nichts Neues = dieselbe Datei. */
export function gesehenSetzen(f: Feedback, artefakt: ArtefaktName): Feedback {
  if (!f.eintraege.some((x) => x.von === 'lehrende' && x.artefakt === artefakt && !x.gesehen)) return f;
  return { ...f, eintraege: f.eintraege.map((x) => (x.von === 'lehrende' && x.artefakt === artefakt && !x.gesehen ? { ...x, gesehen: true } : x)) };
}

// --- Lesen und Zählen ---------------------------------------------------------------------------------------------

/** Was Fäden und Zählung von einem Eintrag brauchen: so passen die Einträge der Datei und die der API (vertrag.ts). */
type FadenTeil = Pick<FeedbackEintrag, 'id' | 'von' | 'artefakt' | 'antwortAuf'>;

export interface FeedbackFaden<T extends FadenTeil = FeedbackEintrag> {
  feedback: T;
  antworten: T[];
}

/** Feedback der Lehrenden zu einem Artefakt mit seinen Antworten, in der Reihenfolge des Schreibens. */
export function faeden<T extends FadenTeil>(eintraege: readonly T[], artefakt: ArtefaktName): FeedbackFaden<T>[] {
  return eintraege
    .filter((e) => e.von === 'lehrende' && e.artefakt === artefakt)
    .map((feedback) => ({ feedback, antworten: eintraege.filter((a) => a.von === 'studierende' && a.antwortAuf === feedback.id) }));
}

export interface FeedbackZahlen {
  // Feedback der Lehrenden, noch nicht erledigt.
  offen: number;
  erledigt: number;
  // Noch nicht geöffnet.
  neu: number;
  antworten: number;
}

/** Zählung je Artefakt (Zelle der Lehrenden-Ansicht, Zeile in „Meine Mappe“). */
export function feedbackZaehlen(eintraege: readonly Pick<FeedbackEintrag, 'von' | 'artefakt' | 'erledigt' | 'gesehen'>[], artefakt: ArtefaktName): FeedbackZahlen {
  const fb = eintraege.filter((e) => e.von === 'lehrende' && e.artefakt === artefakt);
  return {
    offen: fb.filter((e) => !e.erledigt).length,
    erledigt: fb.filter((e) => e.erledigt).length,
    neu: fb.filter((e) => !e.gesehen).length,
    antworten: eintraege.filter((e) => e.von === 'studierende' && e.artefakt === artefakt).length,
  };
}
