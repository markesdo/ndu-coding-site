// Feedback der Lehrenden zu einem Artefakt (optional zu einer Zeile) und Antworten der Studierenden (NDU-35).
// Liegt im Mappe-Repo der Person in mappe/feedback.json (Schema feedback@1), neben den Artefakten, aber nie darin:
// Lehrende schreiben nur hier, nie in die Artefakte. Rein (ohne Speicher), damit Server, Browser und Connector dieselben
// Regeln nutzen. Die Server-Routen schicken nie eine ganze Datei vom Browser durch, sondern rufen genau eine dieser
// Änderungen auf dem Stand auf, auf dem der Commit landet (Speicher.feedbackAendern) – so bleibt jeder Eintrag erhalten,
// auch wenn Lehrende und Studierende gleichzeitig schreiben. Keine Noten, keine Punkte.
import { z } from 'zod';
import { ARTEFAKT_NAMEN, ARTEFAKTE, type ArtefaktName, type DatenVon } from './schemas/index.js';
import { graphemAnzahl } from './text.js';

export const FEEDBACK_PFAD = 'mappe/feedback.json';
export const FEEDBACK_SCHEMA = 'feedback@1';
// Lehrende schreiben einen Absatz, Antworten sind kurz.
export const FEEDBACK_MAX = 1500;
export const ANTWORT_MAX = 500;
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
  })
  .strict()
  .superRefine((e, ctx) => {
    if (e.zeilenId !== undefined && !zeilePasst(e.artefakt, e.zeilenId)) {
      ctx.addIssue({ code: 'custom', path: ['zeilenId'], message: `${e.zeilenId} passt nicht zu ${ARTEFAKTE[e.artefakt].titel}.` });
    }
    if (e.von === 'lehrende' && e.antwortAuf !== undefined) ctx.addIssue({ code: 'custom', path: ['antwortAuf'], message: 'Feedback der Lehrenden antwortet auf nichts.' });
    if (e.von === 'studierende' && e.antwortAuf === undefined) ctx.addIssue({ code: 'custom', path: ['antwortAuf'], message: 'Eine Antwort braucht antwortAuf.' });
    if (e.von === 'studierende' && (e.erledigt !== undefined || e.gesehen !== undefined)) {
      ctx.addIssue({ code: 'custom', path: ['erledigt'], message: 'erledigt und gesehen gibt es nur am Feedback der Lehrenden.' });
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

/** Lehrende: neues Feedback zu einem Artefakt, optional zu einer Zeile. */
export function feedbackSchreiben(
  f: Feedback,
  e: { artefakt: ArtefaktName; zeilenId?: unknown; text: unknown; autor: string; datum: string },
): Feedback {
  const text = textPruefen(e.text, FEEDBACK_MAX);
  const roh = e.zeilenId === undefined || e.zeilenId === null || e.zeilenId === '' ? undefined : e.zeilenId;
  if (roh !== undefined && (typeof roh !== 'string' || !zeilePasst(e.artefakt, roh))) {
    throw new FeedbackAbgelehnt(`Diese Zeile gibt es in ${ARTEFAKTE[e.artefakt].titel} so nicht.`);
  }
  const zeile = roh as string | undefined;
  const neu: FeedbackEintrag = { id: naechsteId(f), artefakt: e.artefakt, ...(zeile !== undefined ? { zeilenId: zeile } : {}), von: 'lehrende', autor: e.autor, text, datum: e.datum };
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
  return { ...f, eintraege: [...f.eintraege, neu] };
}

/** Studierende: Feedback der Lehrenden als erledigt markieren oder wieder öffnen. Ändert nur dieses eine Feld;
 *  unverändert = dieselbe Datei (kein Commit). */
export function erledigtSetzen(f: Feedback, id: unknown, erledigt: unknown): Feedback {
  if (typeof erledigt !== 'boolean') throw new FeedbackAbgelehnt('erledigt muss ja oder nein sein.');
  const ziel = lehrendenEintrag(f, id);
  if ((ziel.erledigt === true) === erledigt) return f;
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

export interface FeedbackFaden {
  feedback: FeedbackEintrag;
  antworten: FeedbackEintrag[];
}

/** Feedback der Lehrenden zu einem Artefakt mit seinen Antworten, in der Reihenfolge des Schreibens. */
export function faeden(eintraege: readonly FeedbackEintrag[], artefakt: ArtefaktName): FeedbackFaden[] {
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
export function feedbackZaehlen(eintraege: readonly FeedbackEintrag[], artefakt: ArtefaktName): FeedbackZahlen {
  const fb = eintraege.filter((e) => e.von === 'lehrende' && e.artefakt === artefakt);
  return {
    offen: fb.filter((e) => !e.erledigt).length,
    erledigt: fb.filter((e) => e.erledigt).length,
    neu: fb.filter((e) => !e.gesehen).length,
    antworten: eintraege.filter((e) => e.von === 'studierende' && e.artefakt === artefakt).length,
  };
}
