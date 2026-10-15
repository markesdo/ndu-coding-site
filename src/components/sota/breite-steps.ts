// Daten und Logik der Animation „Eine App, jede Breite“ (/konzepte/responsive). Ohne React, damit testbar.
// Eine Leihbar-Startseite als Drahtgitter, deren Layout wie Tailwind entscheidet: Klassen ohne Präfix gelten überall,
// `md:` ab 768 px, `lg:` ab 1024 px – immer „ab dieser Breite und breiter“.

export const MIN_BREITE = 320;
export const MAX_BREITE = 1440;

/** Tailwind-Standard, alle als min-width. 2xl (1536) liegt außerhalb des Lineals. */
export const BREAKPOINTS = [
  { name: 'sm', px: 640 },
  { name: 'md', px: 768 },
  { name: 'lg', px: 1024 },
  { name: 'xl', px: 1280 },
] as const;

/** `max-w-5xl` wie im Leihbar-Template: Der Inhalt wird höchstens 1024 px breit. */
export const INHALT_MAX = 1024;
/** `px-4`: 16 px Innenabstand links und rechts. */
export const INNENABSTAND = 16;
/** Der Hinweis im Fehler-Schritt hat `w-[600px]`. */
export const FEST_BREIT = 600;

/** Ab diesen Breiten greifen die Klassen mit Präfix (siehe CODE). */
const MD = 768;
const LG = 1024;

export interface Layout {
  breite: number;
  spalten: 1 | 2 | 3;
  /** Volle Navigation oder Menü-Knopf. */
  navigation: 'voll' | 'menue';
  /** Breite des Inhalts ohne Rand (max-w-5xl), Innenabstand inklusive. */
  inhalt: number;
  /** Rand links und rechts neben dem Inhalt. */
  rand: number;
  /** Wie weit der fest breite Hinweis über den Bildschirm hinausragt (nur im Fehler-Schritt). */
  ueberlauf: number;
}

export function layoutBei(breite: number, { fehler = false }: { fehler?: boolean } = {}): Layout {
  if (!Number.isFinite(breite) || breite < MIN_BREITE || breite > MAX_BREITE) {
    throw new RangeError(`Breite ${breite} liegt außerhalb von ${MIN_BREITE}–${MAX_BREITE} px.`);
  }
  const inhalt = Math.min(breite, INHALT_MAX);
  const rand = (breite - inhalt) / 2;
  // Der Hinweis beginnt nach Rand und Innenabstand; was über die Bildschirmkante geht, ragt hinaus.
  const ueberlauf = fehler ? Math.max(0, rand + INNENABSTAND + FEST_BREIT - breite) : 0;
  return {
    breite,
    spalten: breite >= LG ? 3 : breite >= MD ? 2 : 1,
    navigation: breite >= LG ? 'voll' : 'menue',
    inhalt,
    rand,
    ueberlauf,
  };
}

export interface CodeZeile {
  id: 'nav' | 'menue' | 'inhalt' | 'raster' | 'hinweis';
  tag: string;
  klassen: string[];
  /** Was das Element in der App ist. */
  was: string;
}

export const CODE: CodeZeile[] = [
  { id: 'nav', tag: 'nav', klassen: ['hidden', 'lg:flex'], was: 'Navigation' },
  { id: 'menue', tag: 'button', klassen: ['lg:hidden'], was: 'Menü-Knopf' },
  { id: 'inhalt', tag: 'main', klassen: ['mx-auto', 'max-w-5xl', 'px-4'], was: 'Inhalt' },
  { id: 'raster', tag: 'ul', klassen: ['grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3'], was: 'Gegenstände' },
];
export const CODE_FEHLER: CodeZeile = { id: 'hinweis', tag: 'div', klassen: ['w-[600px]'], was: 'Hinweis' };

/** Die Klassen, die bei dieser Breite gerade entscheiden – sie werden im Code markiert. */
export function aktiveKlassen(breite: number): string[] {
  const l = layoutBei(breite);
  const aktiv = [
    l.navigation === 'voll' ? 'lg:flex' : 'hidden',
    l.spalten === 3 ? 'lg:grid-cols-3' : l.spalten === 2 ? 'md:grid-cols-2' : 'grid-cols-1',
  ];
  if (l.navigation === 'voll') aktiv.push('lg:hidden');
  if (breite > INHALT_MAX) aktiv.push('max-w-5xl');
  return aktiv;
}

export interface Zustand {
  breite: number;
  code: boolean;
  fehler: boolean;
  /** Reihenfolge am Handy nummerieren. */
  reihenfolge: boolean;
  /** Figma-Frames bei 375 und 1440 auf dem Lineal. */
  figma: boolean;
  /** Letzter Schritt: Schieberegler statt fester Breite. */
  frei: boolean;
}

export interface Schritt {
  title: string;
  /** Inline-Code in Backticks. */
  text: string;
}

const Z = (breite: number, z: Partial<Omit<Zustand, 'breite'>> = {}): Zustand =>
  ({ breite, code: false, fehler: false, reihenfolge: false, figma: false, frei: false, ...z });

const ZUSTAENDE: Zustand[] = [
  Z(375, { reihenfolge: true }),
  Z(600),
  Z(768, { code: true }),
  Z(1024, { code: true }),
  Z(1440, { code: true }),
  Z(375, { code: true, fehler: true }),
  Z(900, { figma: true }),
  Z(375, { code: true, frei: true }),
];

export const STEPS: Schritt[] = [
  {
    title: 'Am Handy fängt es an.',
    text: 'Leihbar bei 375 px: alles untereinander, eine Spalte. Was oben steht, sehen alle – was weiter unten steht, nur wer scrollt. Erst die Suche oder erst die neuesten Gegenstände? Das ist eine Produktentscheidung, und sie gehört euch, nicht Claude.',
  },
  {
    title: 'Breiter: Alles fließt mit.',
    text: 'Bei 600 px ändert sich am Aufbau nichts, die Karten werden einfach breiter. Das ist der Normalfall: Zwischen zwei Breakpoints dehnt sich das Layout, es springt nicht.',
  },
  {
    title: 'Ab 768 px: zwei Spalten.',
    text: 'Am Breakpoint `md` entscheidet das Layout neu. `md:grid-cols-2` heißt „ab 768 px und breiter zwei Spalten“ – nicht „auf dem Tablet“: Die Klasse kennt keine Geräte, nur Breiten. `grid-cols-1` ohne Präfix gilt überall, bis eine Klasse mit Präfix übernimmt.',
  },
  {
    title: 'Ab 1024 px: drei Spalten, volles Menü.',
    text: 'Bei `lg` kommt die dritte Spalte dazu, und die Navigation passt in eine Zeile. Darunter steckt sie hinter einem Menü-Knopf: `hidden lg:flex` heißt „versteckt, ab 1024 px sichtbar“.',
  },
  {
    title: 'Ab hier wächst nur noch der Rand.',
    text: 'Bei 1440 px bleibt der Inhalt 1024 px breit und steht in der Mitte – `max-w-5xl` setzt die Grenze. Ohne sie würden Textzeilen so lang, dass niemand sie liest, und jede Karte so breit wie ein Fernseher.',
  },
  {
    title: 'Der häufigste Fehler: etwas ist fest breit.',
    text: 'Zurück auf 375 px. Ein Hinweis hat im Code `w-[600px]` – immer 600 px, egal wie schmal der Bildschirm ist. Er ragt hinaus, und die ganze Seite lässt sich seitlich verschieben. Am Laptop sieht das niemand. Besser: `w-full max-w-[600px]` – so breit, wie Platz ist, höchstens 600 px.',
  },
  {
    title: 'Figma hatte 375 und 1440.',
    text: 'Ein Entwurf hat meist zwei Rahmen: Handy und Laptop. Die App läuft aber auch bei 900 px – im halb geöffneten Browserfenster, auf dem Tablet. Wer hat entschieden, wie es hier aussieht? Steht es nicht im Issue: Claude.',
  },
  {
    title: 'Jetzt ihr.',
    text: 'Zieht den Regler oder nutzt darauf die Pfeiltasten. Achtet auf das Lineal: Der Aufbau ändert sich nur an den Marken, dazwischen fließt er.',
  },
];

export function zustandAt(step: number): Zustand {
  const z = Number.isInteger(step) ? ZUSTAENDE[step - 1] : undefined;
  if (!z) throw new RangeError(`Schritt ${step} gibt es nicht (1–${ZUSTAENDE.length}).`);
  return z;
}

/** Lage auf dem Lineal in Prozent (0 = linker Rand, 100 = 1440 px). */
export function aufLineal(px: number): number {
  return (px / MAX_BREITE) * 100;
}
