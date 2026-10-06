// Daten und Logik der Animation „Ein Wert, viele Stellen“ (/konzepte/design-system). Ohne React, damit testbar.
// Zwei Versionen derselben Mini-App: links mit Token `accent`, rechts mit festen Farbwerten im Code.

export type StelleId = 'button' | 'link' | 'badge' | 'rand' | 'fokus' | 'teilen';
export type Art = 'token' | 'hex';

export interface Stelle {
  id: StelleId;
  /** Woran man die Stelle in der App erkennt. */
  name: string;
  datei: string;
  /** Tailwind-Klasse, wie sie im Code steht. */
  code: string;
}

export interface Seite {
  art: Art;
  /** Wert des Tokens `--accent` in globals.css (nur Token-Seite). */
  accent?: string;
  stellen: Stelle[];
}

export interface Zustand {
  token: Seite;
  hex: Seite;
  /** Code-Ansicht sichtbar. */
  code: boolean;
  /** Stellen, die in diesem Schritt neu gesetzt wurden (je Seite). */
  geaendert: Record<Art, StelleId[]>;
  /** Stellen, die eine Ersetzung verfehlt hat (nur Hex-Seite). */
  verfehlt: StelleId[];
  /** Hervorgehoben, weil der Text darauf zeigt. */
  markiert: StelleId[];
  /** Zahl der Codezeilen, die für die Änderung angefasst wurden (je Seite). */
  zeilen: Record<Art, number>;
}

export interface Schritt {
  title: string;
  /** Inline-Code in Backticks. */
  text: string;
}

export const ROT = '#e8472b';
export const BLAU = '#2457d6';

const STELLEN: { id: StelleId; name: string; datei: string; token: string; hex: string }[] = [
  { id: 'button', name: 'Button „Ich komme“', datei: 'RsvpButton.tsx', token: 'bg-accent', hex: 'bg-[#e8472b]' },
  { id: 'link', name: 'Link „Alle Events“', datei: 'Header.tsx', token: 'text-accent', hex: 'text-[#e8472b]' },
  // Großbuchstaben: gleiche Farbe, aber für Suchen und Ersetzen ein anderer Text.
  { id: 'badge', name: 'Badge „Neu“', datei: 'Badge.tsx', token: 'bg-accent', hex: 'bg-[#E8472B]' },
  { id: 'rand', name: 'Kartenrand', datei: 'EventCard.tsx', token: 'border-accent', hex: 'border-[#e8472b]' },
  // Bei einem späteren Issue leicht abgewandelt – sieht fast gleich aus, ist aber ein anderer Wert.
  { id: 'fokus', name: 'Fokusrahmen im Suchfeld', datei: 'Suche.tsx', token: 'outline-accent', hex: 'outline-[#e8603f]' },
];

const start = (art: Art): Seite => ({
  art,
  ...(art === 'token' ? { accent: ROT } : {}),
  stellen: STELLEN.map(({ id, name, datei, token, hex }) => ({ id, name, datei, code: art === 'token' ? token : hex })),
});

/** Farbe, die eine Stelle im Browser zeigt – kleingeschrieben, damit gleiche Farben gleich zählen. */
export function farbe(seite: Seite, stelle: Stelle): string {
  if (stelle.code.includes('accent')) {
    if (!seite.accent) throw new Error(`${stelle.id}: verweist auf accent, aber die Seite hat kein Token.`);
    return seite.accent.toLowerCase();
  }
  const m = stelle.code.match(/#[0-9a-fA-F]{6}/);
  if (!m) throw new Error(`${stelle.id}: kein Farbwert in „${stelle.code}“.`);
  return m[0].toLowerCase();
}

export function farben(seite: Seite): string[] {
  return [...new Set(seite.stellen.map((s) => farbe(seite, s)))];
}

/** Token-Seite: eine Zeile in globals.css ändern. */
export function tokenSetzen(seite: Seite, wert: string): Seite {
  return { ...seite, accent: wert };
}

/** Hex-Seite: Suchen und Ersetzen über alle Dateien – wörtlich, mit Groß- und Kleinschreibung, wie ein Editor. */
export function ersetzen(seite: Seite, von: string, nach: string): { seite: Seite; getroffen: StelleId[]; verfehlt: StelleId[] } {
  const getroffen: StelleId[] = [];
  const stellen = seite.stellen.map((s) => {
    if (!s.code.includes(von)) return s;
    getroffen.push(s.id);
    return { ...s, code: s.code.replaceAll(von, nach) };
  });
  const neu = { ...seite, stellen };
  const verfehlt = stellen.filter((s) => !getroffen.includes(s.id) && farbe(neu, s) !== nach.toLowerCase()).map((s) => s.id);
  return { seite: neu, getroffen, verfehlt };
}

/** Der Agent baut eine neue Stelle und kopiert die Klasse aus einer bestehenden Datei. */
export function kopieren(seite: Seite, vorlage: StelleId): Seite {
  const v = seite.stellen.find((s) => s.id === vorlage);
  if (!v) throw new Error(`Vorlage ${vorlage} fehlt.`);
  return { ...seite, stellen: [...seite.stellen, { id: 'teilen', name: 'Button „Teilen“', datei: 'TeilenButton.tsx', code: v.code }] };
}

const leer = (): Record<Art, StelleId[]> => ({ token: [], hex: [] });
const null0 = (): Record<Art, number> => ({ token: 0, hex: 0 });

const T0 = start('token');
const H0 = start('hex');
const T1 = tokenSetzen(T0, BLAU);
const ERSATZ = ersetzen(H0, ROT, BLAU);
const H1 = ERSATZ.seite;
// Gleiche Vorlage auf beiden Seiten: Claude nimmt das Badge als nächstliegendes Beispiel.
const T2 = kopieren(T1, 'badge');
const H2 = kopieren(H1, 'badge');

const ZUSTAENDE: Zustand[] = [
  { token: T0, hex: H0, code: false, geaendert: leer(), verfehlt: [], markiert: [], zeilen: null0() },
  { token: T0, hex: H0, code: true, geaendert: leer(), verfehlt: [], markiert: ['badge', 'fokus'], zeilen: null0() },
  {
    token: T1, hex: H0, code: true,
    geaendert: { token: T1.stellen.map((s) => s.id), hex: [] },
    verfehlt: [], markiert: [], zeilen: { token: 1, hex: 0 },
  },
  {
    token: T1, hex: H1, code: true,
    geaendert: { token: [], hex: ERSATZ.getroffen },
    verfehlt: ERSATZ.verfehlt, markiert: [], zeilen: { token: 1, hex: ERSATZ.getroffen.length },
  },
  { token: T1, hex: H1, code: true, geaendert: leer(), verfehlt: ERSATZ.verfehlt, markiert: ERSATZ.verfehlt, zeilen: { token: 1, hex: ERSATZ.getroffen.length } },
  { token: T2, hex: H2, code: true, geaendert: { token: ['teilen'], hex: ['teilen'] }, verfehlt: ERSATZ.verfehlt, markiert: ['teilen'], zeilen: { token: 1, hex: ERSATZ.getroffen.length } },
  { token: T2, hex: H2, code: true, geaendert: leer(), verfehlt: [], markiert: [], zeilen: { token: 1, hex: ERSATZ.getroffen.length } },
];

export const STEPS: Schritt[] = [
  {
    title: 'Zwei Apps, die gleich aussehen.',
    text: 'Beide Versionen von Campus Events zeigen dieselbe Akzentfarbe an fünf Stellen: Button, Link, Badge, Kartenrand und der Rahmen im Suchfeld, wenn es aktiv ist. Im Browser seht ihr keinen Unterschied.',
  },
  {
    title: 'Der Unterschied steht im Code.',
    text: 'Links ist die Farbe einmal als Token `accent` festgelegt, alle Stellen verweisen darauf. Rechts trägt jede Stelle den Farbwert selbst – einmal in Großbuchstaben, einmal als Ton, den Claude bei einem späteren Issue leicht abgewandelt hat.',
  },
  {
    title: 'Neue Entscheidung: Der Akzent wird blau.',
    text: 'Links ändert ihr eine Zeile in `globals.css`. Alle fünf Stellen folgen.',
  },
  {
    title: 'Rechts: Suchen und Ersetzen.',
    text: '`#e8472b` wird in allen Dateien durch `#2457d6` ersetzt. Drei von fünf Stellen folgen. `#E8472B` passt nicht, weil es großgeschrieben ist, und `#e8603f` ist ein anderer Wert.',
  },
  {
    title: 'Niemand merkt es sofort.',
    text: 'Das Badge erscheint nur bei neuen Events, der Rahmen nur, wenn jemand ins Suchfeld klickt. Solche Reste fallen oft erst Wochen später auf – meist jemand anderem.',
  },
  {
    title: 'Der Agent kopiert, was er sieht.',
    text: 'Nächstes Issue: ein Teilen-Button. Claude nimmt das Badge als Vorlage. Links übernimmt es den Verweis auf `accent` und der Button wird blau. Rechts übernimmt es den alten Farbwert – rot.',
  },
  {
    title: 'Ein Token ist eine Entscheidung mit Namen.',
    text: 'Links: eine Zeile geändert, eine Farbe. Rechts: drei verschiedene Farben, und jedes Issue kann eine weitere hinzufügen. Darum gehören Farben, Abstände und Schriften in Tokens – und die Regel „nur Tokens verwenden“ in die `CLAUDE.md`.',
  },
];

export function zustandAt(step: number): Zustand {
  const z = Number.isInteger(step) ? ZUSTAENDE[step - 1] : undefined;
  if (!z) throw new RangeError(`Schritt ${step} gibt es nicht (1–${ZUSTAENDE.length}).`);
  return z;
}
