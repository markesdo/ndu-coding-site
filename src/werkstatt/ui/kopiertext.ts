// Text für „Für Claude kopieren“ im Editor (EditorHuelle): rein, ohne React und DOM.
// Ohne Prüf-Prompt nur das Artefakt; die Prüfliste hängt nie mehr daran – sie steht im Prüf-Prompt der Methodenseite.
// Mit Prüf-Prompt (Schalter „Prüf-Prompt mitkopieren“): derselbe Prompt wie auf der Methodenseite unter „Prüfen“, darunter
// das Artefakt und die Vorarbeit aus der Werkstatt, die der Prompt nennt („Ohne Werkstatt-Zugang nimm stattdessen die
// Texte, die ich unter diese Nachricht einfüge: …“). So reicht ohne Connector ein Kopieren.
import { gruppeFrei } from '../../lib/aufgedeckt.js';
import { METHODEN, pruefPrompt, pruefungInWerkstatt, werkstattVorarbeit, type Methode } from '../../components/methoden.js';
import { rendern } from '../render/index.js';
import { ARTEFAKTE, artefaktParsen, type ArtefaktName, type DatenVon } from '../schemas/index.js';

/** localStorage-Schlüssel des Schalters (je Browser); fehlt er, ist der Schalter an. */
export const MITKOPIEREN_SCHLUESSEL = 'werkstatt:pruefprompt-mitkopieren';

/** Neben dem Knopf, solange Änderungen ungespeichert sind und der Prompt mitkommt: Der Connector (artefakt_pruefen) liest
 *  die gespeicherte Fassung, der kopierte Text trägt den Entwurf. Ein Hinweis statt Sperre – ohne Connector ist gerade
 *  der Entwurf richtig. */
export const ERST_SPEICHERN = 'Erst speichern: Mit Connector prüft Claude die gespeicherte Fassung.';

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

/** Stand einer Vorarbeit für den Prompt: Markdown des gespeicherten Stands, nie gespeichert oder nicht ladbar.
 *  Fehlt der Name ganz, lädt sie noch. */
export type VorarbeitStand = { markdown: string } | 'nicht-gespeichert' | 'fehler';

/** Antwort von api.lesen → Stand. Nie gespeichert (daten null) heißt „fehlt“: Die leere Vorlage („Noch nichts
 *  eingetragen.“) ginge sonst als echter Text an Claude. */
export function vorarbeitAusAntwort<N extends ArtefaktName>(name: N, daten: unknown | null | undefined): VorarbeitStand {
  if (daten === null || daten === undefined) return 'nicht-gespeichert';
  try {
    const p = artefaktParsen(name, daten);
    return p.ok ? { markdown: rendern(name, p.daten as DatenVon<N>) } : 'fehler';
  } catch {
    return 'fehler';
  }
}

export interface KopierEinstellung {
  name: ArtefaktName;
  /** Schalter „Prüf-Prompt mitkopieren“. */
  mitPrompt: boolean;
  /** pruefPromptFrei für diese Methode; false hält Prompt und Prüfliste zurück, egal wie der Schalter steht. */
  frei: boolean;
  /** Vorarbeit je Name (VorarbeitStand); fehlt ein Name, lädt sie noch. */
  vorarbeit?: Partial<Record<ArtefaktName, VorarbeitStand>>;
}

export interface Fehlend {
  name: ArtefaktName;
  grund: 'nicht-gespeichert' | 'fehler';
}

export interface KopierPlan {
  /** Kommt der Prüf-Prompt in den Text? */
  mitPrompt: boolean;
  /** Vorarbeit, die der Prompt nennt, aber nicht im Text stehen wird. */
  fehlt: Fehlend[];
  /** Lädt noch Vorarbeit? Dann wartet der Knopf. */
  laedt: boolean;
}

/** Was der Text enthalten wird – billig, ohne Markdown; für Schalter, Hinweise und Knopf bei jedem Rendern. */
export function kopierPlan({ name, mitPrompt, frei, vorarbeit = {} }: KopierEinstellung): KopierPlan {
  const m = pruefMethode(name);
  if (!mitPrompt || !frei || !m) return { mitPrompt: false, fehlt: [], laedt: false };
  const namen = werkstattVorarbeit(m);
  const fehlt: Fehlend[] = [];
  let laedt = false;
  for (const n of namen) {
    const v = vorarbeit[n];
    if (v === undefined) laedt = true;
    else if (typeof v === 'string') fehlt.push({ name: n, grund: v });
  }
  return { mitPrompt: true, fehlt, laedt };
}

export interface KopierText extends KopierPlan {
  text: string;
}

// Der Brief trägt keine eigene Überschrift; unter dem Prompt soll jedes Artefakt mit seinem Namen anfangen.
function mitTitel(name: ArtefaktName, markdown: string): string {
  const md = markdown.trim();
  return md.startsWith('# ') ? md : `# ${ARTEFAKTE[name].titel}\n\n${md}`;
}

/** Der ganze Text für „Für Claude kopieren“ – dieselbe Funktion für den Knopf und die Anzeige „Was kopiert wird“.
 *  markdown: das Artefakt im Editor (auch ein ungespeicherter Entwurf). */
export function kopierText(e: KopierEinstellung & { markdown: string }): KopierText {
  const plan = kopierPlan(e);
  const m = pruefMethode(e.name);
  if (!plan.mitPrompt || !m) return { ...plan, text: `${mitTitel(e.name, e.markdown)}\n` };
  const da = werkstattVorarbeit(m).flatMap((n) => {
    const v = e.vorarbeit?.[n];
    return v !== undefined && typeof v !== 'string' ? [mitTitel(n, v.markdown)] : [];
  });
  return { ...plan, text: `${[pruefPrompt(m), mitTitel(e.name, e.markdown), ...da].join('\n\n')}\n` };
}

const GRUND: Record<Fehlend['grund'], string> = { 'nicht-gespeichert': 'nicht gespeichert', fehler: 'nicht geladen' };
const fehltListe = (fehlt: readonly Fehlend[]) => fehlt.map((f) => `${ARTEFAKTE[f.name].titel} (${GRUND[f.grund]})`).join(', ');

/** Satz zur fehlenden Vorarbeit für „Was kopiert wird“; leer, wenn nichts fehlt. */
export function fehltHinweis(fehlt: readonly Fehlend[]): string {
  return fehlt.length ? `Fehlt: ${fehltListe(fehlt)} – erst im jeweiligen Editor speichern oder selbst darunter einfügen.` : '';
}

/** Meldung nach dem Kopieren: fehlt Vorarbeit, sagt sie es sichtbar neben dem Knopf, nicht nur in „Was kopiert wird“. */
export function kopierStatus(meldung: string, plan: KopierPlan, kopiert: boolean): string {
  if (!plan.fehlt.length) return meldung;
  const rest = `aber ohne ${fehltListe(plan.fehlt)}. Fügt das selbst darunter ein.`;
  return kopiert ? `Kopiert – ${rest}` : `${meldung} – ${rest}`;
}
