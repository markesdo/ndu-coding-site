// Reine Hilfen für das Feedback (NDU-35) in Lehrenden-Ansicht, Editor und „Meine Mappe“: Zeilen zur Auswahl, Zahlen
// als Text, was „neu“ ist. Nur Text und Daten; das Einsetzen macht React. Keine Noten, keine Punkte.
import { tagInWien } from '../../lib/kurswahl.js';
import { BRIEF_ABSCHNITTE, feedbackZaehlen, zeilenName, type FeedbackEintrag, type FeedbackZahlen } from '../feedback.js';
import { datumAt } from '../render/format.js';
import type { ArtefaktName, DatenVon } from '../schemas/index.js';
import { ROUTEN } from '../vertrag.js';

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
 *  in der Reihenfolge des Artefakts. daten = mit dem Schema des Editors geprüft; null = nichts gespeichert. */
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

/** „zu A2“, „zu Welches Problem?“ oder „zum ganzen Artefakt“. */
export function bezugText(e: Pick<FeedbackEintrag, 'artefakt' | 'zeilenId'>): string {
  return e.zeilenId === undefined ? 'zum ganzen Artefakt' : `zu ${zeilenName(e.artefakt, e.zeilenId)}`;
}

/** „22.10.2026“ (Tag in Wien). */
export const feedbackDatum = (iso: string): string => datumAt(tagInWien(new Date(iso)));

const mehrzahl = (n: number, eins: string, viele: string) => `${n} ${n === 1 ? eins : viele}`;

/** Zelle der Lehrenden-Ansicht: „1 offen · 1 Antwort“, „2 erledigt“; null = kein Feedback (oder nicht lesbar). */
export function zellenFeedback(z: FeedbackZahlen | null): string | null {
  if (!z || z.offen + z.erledigt === 0) return null;
  const teile: string[] = [];
  if (z.offen) teile.push(`${z.offen} offen`);
  if (z.erledigt) teile.push(`${z.erledigt} erledigt`);
  if (z.antworten) teile.push(mehrzahl(z.antworten, 'Antwort', 'Antworten'));
  return teile.join(' · ');
}

/** Zeile in „Meine Mappe“: wie viel neu und offen ist; null = kein Feedback. */
export function mappeFeedback(eintraege: readonly FeedbackEintrag[], name: ArtefaktName): { neu: number; text: string } | null {
  const z = feedbackZaehlen(eintraege, name);
  if (z.offen + z.erledigt === 0) return null;
  const text = z.offen ? `Feedback: ${z.offen} offen` : `Feedback: ${z.erledigt} erledigt`;
  return { neu: z.neu, text };
}

/** Feedback der Lehrenden zu diesem Artefakt, das die Person noch nicht geöffnet hat. Im Editor einmal beim Laden
 *  gemerkt: „neu“ bleibt stehen, solange der Editor offen ist, auch wenn der Server es schon als gesehen führt. */
export function neueIds(eintraege: readonly FeedbackEintrag[], name: ArtefaktName): Set<string> {
  return new Set(eintraege.filter((e) => e.von === 'lehrende' && e.artefakt === name && !e.gesehen).map((e) => e.id));
}

/** Pfad zum Schreiben für Lehrende. */
export function lehrendeFeedbackPfad(kohorte: string, person: string): string {
  return `${ROUTEN.lehrendeFeedback.pfad}?${new URLSearchParams({ kohorte, person }).toString()}`;
}
