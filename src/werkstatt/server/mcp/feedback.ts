// Feedback der Lehrenden im Connector (NDU-35), nur lesend: artefakt_lesen und artefakt_pruefen liefern es mit.
// Claude geht darauf ein, gibt es aber nie als eigenen Prüfbefund aus und schreibt selbst nie Feedback (es gibt dafür
// kein Werkzeug). Eigene Datei, damit werkzeuge.ts nur an wenigen Stellen wächst.
// NDU-41: Trägt ein Feedback ein Kriterium aus dem Katalog, kommt nur dessen Name mit – nie das Kaffeebar-Paar, damit
// Claude keine Fassung zum Übernehmen in der Hand hat.
// NDU-42: Ebenso nie die mögliche Fassung der Lehrenden (fassung, zeilenStand, aufgedecktAm), weder zu noch aufgedeckt:
// feedbackAusgabe nimmt nur die unten genannten Felder, nie den ganzen Eintrag.
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
    antworten: z.array(z.object({ autor: z.string(), datum: z.string(), text: z.string() })),
  }))
  .describe('Feedback der Lehrenden zu diesem Artefakt mit den Antworten der Person. Nur zum Eingehen, nie als eigener Befund.');

export type FeedbackAusgabe = z.infer<typeof FEEDBACK_AUSGABE>;

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
      antworten: antworten.map((a) => ({ autor: a.autor, datum: tag(a.datum), text: a.text })),
    };
  });
}

/** Abschnitt für den Text des Ergebnisses; leer, wenn es kein Feedback gibt. */
export function feedbackText(f: readonly FeedbackFaden[] | null): string[] {
  if (f === null) return ['', `## ${FEEDBACK_UEBERSCHRIFT}`, 'Das Feedback der Lehrenden ließ sich gerade nicht lesen.'];
  if (f.length === 0) return [];
  const zeilen = ['', `## ${FEEDBACK_UEBERSCHRIFT}`, 'Was die Lehrenden zu diesem Artefakt angemerkt haben, mit den Antworten der Person. Geh darauf ein, wo es passt; es ist kein Befund der Prüfung, und du schreibst selbst kein Feedback.', ''];
  for (const a of feedbackAusgabe(f)) {
    const krit = a.kriterium ? `, Kriterium „${a.kriterium}“` : '';
    zeilen.push(`- ${a.id}: ${a.autor}${a.zeile ? ` zu ${a.zeile}` : ' zum ganzen Artefakt'}, ${a.datum}, ${a.erledigt ? 'erledigt' : 'offen'}${krit}`, zitat(a.text, '  '));
    for (const x of a.antworten) zeilen.push(`  - Antwort von ${x.autor}, ${x.datum}:`, zitat(x.text, '    '));
  }
  return zeilen;
}

/** Satz für die Anleitung von artefakt_pruefen, nur wenn es Feedback gibt. */
export const FEEDBACK_ANLEITUNG =
  `Unter „${FEEDBACK_UEBERSCHRIFT}“ steht, was die Lehrenden angemerkt haben: Geh darauf ein, wo es passt (etwa „Bei A2 hatte deine Lehrperson nach der Quelle gefragt – was hast du dazu herausgefunden?“), aber gib es nie als eigenen Befund oder Prüfpunkt aus, zitier es nicht als Artefakt und schreib selbst kein Feedback. Nennt ein Feedback ein Kriterium, frag, was die Person daran an ihrer eigenen Stelle erkennt; formulier dafür keinen Text.`;
