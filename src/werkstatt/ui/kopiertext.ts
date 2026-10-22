// Text für „Für Claude kopieren“ im Editor (EditorHuelle): rein, ohne React und DOM.
// Ohne Prüf-Prompt nur das Artefakt; die Prüfliste hängt nie mehr daran – sie steht im Prüf-Prompt der Methodenseite.
// Mit Prüf-Prompt (Schalter „Prüf-Prompt mitkopieren“): derselbe Prompt wie auf der Methodenseite unter „Prüfen“, darunter
// das Artefakt und die Vorarbeit aus der Werkstatt, die der Prompt nennt („Ohne Werkstatt-Zugang nimm stattdessen die
// Texte, die ich unter diese Nachricht einfüge: …“). So reicht ohne Connector ein Kopieren.
import { gruppeFrei } from '../../lib/aufgedeckt.js';
import { METHODEN, pruefPrompt, pruefungInWerkstatt, werkstattVorarbeit, type Methode } from '../../components/methoden.js';
import { ARTEFAKTE, type ArtefaktName } from '../schemas/index.js';

/** localStorage-Schlüssel des Schalters (je Browser); fehlt er, ist der Schalter an. */
export const MITKOPIEREN_SCHLUESSEL = 'werkstatt:pruefprompt-mitkopieren';

/** Die Methode, deren Prüf-Prompt zu diesem Artefakt gehört – nur, wenn sie in der Werkstatt prüft (alle Editoren). */
export function pruefMethode(name: ArtefaktName): Methode | undefined {
  const m = METHODEN.find((x) => x.slug === ARTEFAKTE[name].slug);
  return m?.pruefliste && pruefungInWerkstatt(m) ? m : undefined;
}

/** Darf der Prüf-Prompt (mit der Prüfliste) schon sichtbar sein? Verrät die Prüfliste eine Übung (prueflisteNach, der
 *  Mom Test beim Leitfaden), erst wie deren Auflösung: aufgedeckt, spätestens ab ab, für den Präsentator immer
 *  (dieselbe Regel wie leitfadenFrei auf /innolab/mappe und der Connector). */
export function pruefPromptFrei(m: Methode, jetzt: Date, praesentator: boolean, aufgedeckt: readonly string[] = []): boolean {
  return !m.prueflisteNach || gruppeFrei(m.prueflisteNach.gruppe, m.prueflisteNach.ab, jetzt, aufgedeckt, praesentator);
}

/** Werkstatt-Artefakte, die der Prompt zum Abgleich nennt – die lädt der Editor mit, solange der Schalter an ist. */
export function vorarbeitNamen(name: ArtefaktName): ArtefaktName[] {
  const m = pruefMethode(name);
  return m ? werkstattVorarbeit(m) : [];
}

export interface KopierEingabe {
  name: ArtefaktName;
  /** Markdown des Artefakts im Editor (auch ein ungespeicherter Entwurf). */
  markdown: string;
  /** Schalter „Prüf-Prompt mitkopieren“. */
  mitPrompt: boolean;
  /** pruefPromptFrei für diese Methode; false hält Prompt und Prüfliste zurück, egal wie der Schalter steht. */
  frei: boolean;
  /** Markdown der Vorarbeit, gespeicherter Stand; fehlt ein Name (lädt noch, Fehler), steht er in fehlt. */
  vorarbeit?: Partial<Record<ArtefaktName, string>>;
}

export interface KopierText {
  text: string;
  /** Ist der Prüf-Prompt im Text? */
  mitPrompt: boolean;
  /** Vorarbeit, die der Prompt nennt, aber nicht im Text steht. */
  fehlt: ArtefaktName[];
}

// Der Brief trägt keine eigene Überschrift; unter dem Prompt soll jedes Artefakt mit seinem Namen anfangen.
function mitTitel(name: ArtefaktName, markdown: string): string {
  const md = markdown.trim();
  return md.startsWith('# ') ? md : `# ${ARTEFAKTE[name].titel}\n\n${md}`;
}

export function kopierText({ name, markdown, mitPrompt, frei, vorarbeit = {} }: KopierEingabe): KopierText {
  const m = pruefMethode(name);
  if (!mitPrompt || !frei || !m) return { text: `${mitTitel(name, markdown)}\n`, mitPrompt: false, fehlt: [] };
  const namen = werkstattVorarbeit(m);
  const da = namen.filter((n) => vorarbeit[n] !== undefined);
  const teile = [pruefPrompt(m), mitTitel(name, markdown), ...da.map((n) => mitTitel(n, vorarbeit[n]!))];
  return { text: `${teile.join('\n\n')}\n`, mitPrompt: true, fehlt: namen.filter((n) => !da.includes(n)) };
}
