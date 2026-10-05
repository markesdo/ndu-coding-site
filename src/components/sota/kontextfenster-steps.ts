// Daten und Logik der Kontextfenster-Animation (Konzept 2). Ohne React, damit testbar.
// Größen sind didaktisch gewählt (Kapazität = 100 Einheiten), keine echten Token-Zahlen.

export type Art = 'fest' | 'auftrag' | 'datei' | 'werkzeug' | 'verlauf' | 'zusammenfassung';

export interface Block {
  id: string;
  art: Art;
  label: string;
  size: number;
  verblasst?: boolean;
  tag?: string;
}

export interface Schritt {
  title: string;
  /** Inline-Code in Backticks. */
  text: string;
}

export const PRELUDE_MS = 900;

const SYS: Block = { id: 'sys', art: 'fest', label: 'Systemregeln', size: 6 };
const CLAUDE_MD: Block = { id: 'claude-md', art: 'fest', label: 'CLAUDE.md', size: 8 };
const AUFTRAG: Block = { id: 'auftrag', art: 'auftrag', label: 'Auftrag', size: 4 };
const DATEI_1: Block = { id: 'datei-1', art: 'datei', label: 'page.tsx', size: 7 };
const DATEI_2: Block = { id: 'datei-2', art: 'datei', label: 'EventCard.tsx', size: 7 };
const DATEI_3: Block = { id: 'datei-3', art: 'datei', label: 'rsvp.ts', size: 7 };
const DATEI_4: Block = { id: 'datei-4', art: 'datei', label: 'auth.ts', size: 7 };
const BUILD: Block = { id: 'build', art: 'werkzeug', label: 'Build', size: 6 };
const LOG: Block = { id: 'log', art: 'werkzeug', label: 'Fehlerlog (400 Zeilen)', size: 22 };
const VERLAUF_1: Block = { id: 'verlauf-1', art: 'verlauf', label: 'Verlauf', size: 8 };
const VERLAUF_2: Block = { id: 'verlauf-2', art: 'verlauf', label: 'Verlauf', size: 14 };
const ZUSAMMENFASSUNG: Block = { id: 'zusammenfassung', art: 'zusammenfassung', label: 'Zusammenfassung', size: 16 };
const ENTSCHEIDUNGEN: Block = {
  id: 'entscheidungen',
  art: 'fest',
  label: 'ENTSCHEIDUNGEN.md',
  size: 4,
  tag: 'in CLAUDE.md verknüpft',
};

const fade = (b: Block): Block => ({ ...b, verblasst: true });
const DATEIEN = [DATEI_1, DATEI_2, DATEI_3, DATEI_4];

const STATES: Block[][] = [
  [SYS, CLAUDE_MD],
  [SYS, CLAUDE_MD, AUFTRAG],
  [SYS, CLAUDE_MD, AUFTRAG, ...DATEIEN],
  [SYS, CLAUDE_MD, AUFTRAG, ...DATEIEN, BUILD, LOG],
  [SYS, CLAUDE_MD, fade(AUFTRAG), fade(DATEI_1), fade(DATEI_2), DATEI_3, DATEI_4, BUILD, LOG, VERLAUF_1],
  [SYS, CLAUDE_MD, ZUSAMMENFASSUNG],
  [SYS, CLAUDE_MD, ZUSAMMENFASSUNG, { ...AUFTRAG, tag: 'bleibt' }],
  [SYS, CLAUDE_MD],
  [SYS, CLAUDE_MD, ENTSCHEIDUNGEN],
];

const PRELUDES: Partial<Record<number, Block[]>> = {
  6: [...STATES[4], VERLAUF_2],
};

export const STEPS: Schritt[] = [
  {
    title: 'Jede Session beginnt gleich.',
    text: 'Bevor Sie etwas schreiben, liegen schon die Systemregeln und Ihre `CLAUDE.md` im Kontextfenster – dem Arbeitsgedächtnis des Modells.',
  },
  {
    title: 'Ihr Auftrag.',
    text: '„Füge auf der Event-Seite einen RSVP-Button hinzu – nur für angemeldete Nutzer*innen.“ Die Einschränkung am Ende ist eine Absprache, auf die es später ankommt.',
  },
  {
    title: 'Claude liest.',
    text: 'Um den Auftrag zu verstehen, öffnet der Agent die relevanten Dateien. Jede gelesene Datei belegt Platz – deshalb lohnt es sich, gezielt auf die betroffenen Stellen zu verweisen.',
  },
  {
    title: 'Werkzeuge liefern Ergebnisse.',
    text: 'Build-Ausgaben und Fehlermeldungen landen ebenfalls im Kontext. Ein vollständiges Log mit 400 Zeilen verdrängt mehr, als es nützt; die entscheidenden fünf Zeilen genügen.',
  },
  {
    title: 'Je voller, desto unschärfer.',
    text: 'Das Modell gewichtet nicht alles gleich. Je mehr im Fenster liegt, desto leichter gehen frühe Details unter – etwa Ihre Einschränkung aus Schritt 2. Die Antworten werden ungenauer, lange bevor das Fenster voll ist.',
  },
  {
    title: 'Auto-Compact.',
    text: 'Kurz vor der Grenze fasst Claude Code den Verlauf automatisch zusammen. Das schafft Platz, kostet aber Detail – was nicht in der Zusammenfassung steht, ist weg. Hier: Ihre Einschränkung aus Schritt 2.',
  },
  {
    title: 'Besser: selbst verdichten.',
    text: 'Mit `/compact` lösen Sie die Zusammenfassung rechtzeitig selbst aus und sagen, was bleiben muss: `/compact Behalte: nur für angemeldete Nutzer*innen`. Dann übersteht die Absprache die Verdichtung.',
  },
  {
    title: '`/clear` – neue Session.',
    text: 'Nach einer abgeschlossenen Story ist ein leerer Kontext der beste Start: schnell, präzise, ohne Altlasten. Was nur im Chat stand, ist damit allerdings weg.',
  },
  {
    title: 'Dauerhaftes gehört in Dateien.',
    text: 'Entscheidungen, die über eine Session hinaus gelten, halten Sie in `docs/ENTSCHEIDUNGEN.md` fest. Im Kursprojekt ist die Datei in `CLAUDE.md` verknüpft und wird deshalb bei jedem Start geladen. Was nur im Chat stand, ist in der nächsten Session weg.',
  },
];

export function blocksAt(step: number): Block[] {
  const state = Number.isInteger(step) ? STATES[step - 1] : undefined;
  if (!state) throw new RangeError(`Schritt ${step} gibt es nicht (1–${STATES.length}).`);
  return state;
}

export function preludeAt(step: number): Block[] | null {
  return PRELUDES[step] ?? null;
}

export function fillOf(blocks: Block[]): number {
  return blocks.reduce((sum, b) => sum + b.size, 0);
}
