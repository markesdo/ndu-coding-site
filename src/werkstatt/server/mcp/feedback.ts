// Feedback der Lehrenden im Connector (NDU-35), nur lesend: artefakt_lesen und artefakt_pruefen liefern es mit.
// Claude geht darauf ein, gibt es aber nie als eigenen Prüfbefund aus und schreibt selbst nie Feedback (es gibt dafür
// kein Werkzeug). Eigene Datei, damit werkzeuge.ts nur an wenigen Stellen wächst.
// NDU-41: Trägt ein Feedback ein Kriterium aus dem Katalog, kommt nur dessen Name mit – nie das Kaffeebar-Paar, damit
// Claude keine Fassung zum Übernehmen in der Hand hat.
// NDU-42/NDU-44: Ebenso nie die mögliche Fassung der Lehrenden (fassung, zeilenStand, freiSeit), weder zu noch
// frei, weder als Text noch als Siegel: feedbackAusgabe nimmt nur die unten genannten Felder, nie den ganzen Eintrag,
// und öffnet nie ein Siegel. Claude erfährt nur, dass es eine gibt (fassungInWerkstatt), damit es auf die Werkstatt
// verweisen kann – die Regel „Claude schreibt nie Artefakttext“ lässt sich so nicht über die Fassung umgehen.
import { z } from 'zod';
import { tagInWien } from '../../../lib/kurswahl.js';
import { faeden, zeilenName, type FeedbackFaden } from '../../feedback.js';
import { kriterium } from '../../kriterien.js';
import { datumAt } from '../../render/format.js';
import type { ArtefaktName } from '../../schemas/index.js';
import { feedbackHolen } from '../feedback.js';
import type { Abhaengigkeiten } from '../typen.js';

export const FEEDBACK_UEBERSCHRIFT = 'Feedback der Lehrenden (kein Prüfbefund)';

// Was im structuredContent steht: Feedback der Lehrenden mit Antworten, ohne interne Felder (gesehen).
export const FEEDBACK_AUSGABE = z
  .array(z.object({
    id: z.string(),
    zeile: z.string().optional().describe('Zeilen-ID (A2, I2-4) oder Abschnitt des Briefs; fehlt = zum ganzen Artefakt.'),
    kriterium: z.string().optional().describe('Name des Kriteriums, das die Lehrperson gewählt hat (z. B. „Output statt Outcome“); fehlt = ohne Kriterium.'),
    autor: z.string(),
    datum: z.string(),
    text: z.string(),
    erledigt: z.boolean(),
    fassungInWerkstatt: z
      .literal(true)
      .optional()
      .describe('Die Lehrperson hat dazu eine mögliche Fassung hinterlegt. Ihren Text bekommst du nie; die Person sieht sie nur in der Werkstatt am Feedback, sobald sie die Zeile selbst überarbeitet oder geantwortet hat. Sag nur, dass es sie gibt und wo; zitier, umschreib oder errate sie nie.'),
    antworten: z.array(z.object({ autor: z.string(), datum: z.string(), text: z.string() })),
  }))
  .describe('Feedback der Lehrenden zu diesem Artefakt mit den Antworten der Person. Nur zum Eingehen, nie als eigener Befund.');

export type FeedbackAusgabe = z.infer<typeof FEEDBACK_AUSGABE>;

export const FEEDBACK_UNLESBAR = 'Das Feedback der Lehrenden ließ sich gerade nicht lesen.';

// Steht statt feedback im structuredContent, wenn mappe/feedback.json sich nicht lesen ließ.
export const FEEDBACK_HINWEIS_AUSGABE = z.string().optional().describe(`Statt feedback: ${FEEDBACK_UNLESBAR}`);

/** Die Fäden zu einem Artefakt; null = mappe/feedback.json ließ sich nicht lesen (dann nur ein Satz, das Werkzeug läuft
 *  weiter). Scheitert GitHub, gilt dasselbe: Feedback ist Beigabe, kein Grund für ein Fehlerergebnis. */
export async function feedbackFuerClaude(abh: Abhaengigkeiten, repo: string, artefakt: ArtefaktName): Promise<FeedbackFaden[] | null> {
  try {
    return faeden((await feedbackHolen(abh.speicher, repo)).eintraege, artefakt);
  } catch (e) {
    console.error('werkstatt-mcp feedback:', e instanceof Error ? `${e.name}: ${e.message}` : 'Fehler');
    return null;
  }
}

const tag = (iso: string) => datumAt(tagInWien(new Date(iso)));
// Text der Lehrenden und der Person als Zitat, Zeile für Zeile: So beginnt er nie eine Überschrift oder Liste.
const zitat = (text: string, einzug: string) => text.split('\n').map((z) => `${einzug}> ${z}`).join('\n');

// Name aus dem Katalog; eine ID, die es dort nicht (mehr) gibt, fällt weg.
const kriteriumName = (id: string | undefined): string | undefined => (id === undefined ? undefined : kriterium(id)?.name);

export function feedbackAusgabe(f: readonly FeedbackFaden[]): FeedbackAusgabe {
  return f.map(({ feedback: e, antworten }) => {
    const krit = kriteriumName(e.kriterium);
    return {
      id: e.id,
      ...(e.zeilenId !== undefined ? { zeile: zeilenName(e.artefakt, e.zeilenId) } : {}),
      ...(krit !== undefined ? { kriterium: krit } : {}),
      autor: e.autor,
      datum: tag(e.datum),
      text: e.text,
      erledigt: e.erledigt === true,
      ...(e.fassung !== undefined ? { fassungInWerkstatt: true as const } : {}),
      antworten: antworten.map((a) => ({ autor: a.autor, datum: tag(a.datum), text: a.text })),
    };
  });
}

/** Dasselbe wie feedbackText für structuredContent (NDU-52): Claude Code gibt dem Modell bei structuredContent nur das
 *  JSON, nicht den Text. Ohne Feedback kein Schlüssel; unlesbar: der Satz statt des Feedbacks. */
export function feedbackFelder(f: readonly FeedbackFaden[] | null): { feedback?: FeedbackAusgabe; feedbackHinweis?: string } {
  if (f === null) return { feedbackHinweis: FEEDBACK_UNLESBAR };
  return f.length ? { feedback: feedbackAusgabe(f) } : {};
}

/** Abschnitt für den Text des Ergebnisses; leer, wenn es kein Feedback gibt. */
export function feedbackText(f: readonly FeedbackFaden[] | null): string[] {
  if (f === null) return ['', `## ${FEEDBACK_UEBERSCHRIFT}`, FEEDBACK_UNLESBAR];
  if (f.length === 0) return [];
  const zeilen = ['', `## ${FEEDBACK_UEBERSCHRIFT}`, 'Was die Lehrenden zu diesem Artefakt angemerkt haben, mit den Antworten der Person; wie du damit umgehst, steht in der Anleitung am Ende.', ''];
  for (const a of feedbackAusgabe(f)) {
    const krit = a.kriterium ? `, Kriterium „${a.kriterium}“` : '';
    zeilen.push(`- ${a.id}: ${a.autor}${a.zeile ? ` zu ${a.zeile}` : ' zum ganzen Artefakt'}, ${a.datum}, ${a.erledigt ? 'erledigt' : 'offen'}${krit}`, zitat(a.text, '  '));
    if (a.fassungInWerkstatt) zeilen.push(`  ${FASSUNG_HINWEIS}`);
    for (const x of a.antworten) zeilen.push(`  - Antwort von ${x.autor}, ${x.datum}:`, zitat(x.text, '    '));
  }
  return zeilen;
}

/** Steht im Text unter einem Feedback mit möglicher Fassung (NDU-44). Den Text der Fassung kennt Claude nicht. */
export const FASSUNG_HINWEIS =
  '(Dazu hat die Lehrperson eine mögliche Fassung in der Werkstatt hinterlegt. Ihr Text kommt hier nie mit; die Person sieht sie in der Werkstatt am Feedback, sobald sie die Zeile selbst überarbeitet oder geantwortet hat. Sag nur, dass es sie gibt und wo – zitier, umschreib oder errate sie nicht.)';

/** Satz für die Anleitung von artefakt_pruefen, nur wenn es Feedback gibt. */
export const FEEDBACK_ANLEITUNG =
  `Unter „${FEEDBACK_UEBERSCHRIFT}“ (im JSON: feedback) steht, was die Lehrenden angemerkt haben: Geh darauf ein, wo es passt (etwa „Bei A2 hatte deine Lehrperson nach der Quelle gefragt – was hast du dazu herausgefunden?“), aber gib es nie als eigenen Befund oder Prüfpunkt aus, zitier es nicht als Artefakt und schreib selbst kein Feedback. Nennt ein Feedback ein Kriterium, frag, was die Person daran an ihrer eigenen Stelle erkennt; formulier dafür keinen Text. Steht bei einem Feedback, dass die Lehrperson eine mögliche Fassung hinterlegt hat, sag nur, dass es sie gibt und dass die Person sie in der Werkstatt am Feedback findet, sobald sie die Zeile selbst überarbeitet hat; ihren Text kennst du nicht, und du formulierst auch keine eigene.`;
