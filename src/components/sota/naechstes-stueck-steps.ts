// Daten und Logik der Animation „Ein Stück nach dem anderen“ (/konzepte/llm). Ohne React, damit testbar.
// Zerlegung in Stücke und Prozentzahlen sind didaktisch gewählt, keine Ausgaben eines echten Modells.

export type Art = 'prompt' | 'erzeugt' | 'doku';

export interface Stueck {
  id: string;
  /** Mit führendem Leerzeichen, wie ein Token – die Stücke ergeben aneinandergereiht den Text. */
  text: string;
  art: Art;
}

export interface Kandidat {
  text: string;
  /** Wahrscheinlichkeit in Prozent. */
  p: number;
}

export interface Verteilung {
  id: string;
  kandidaten: Kandidat[];
  /** Alle übrigen Kandidaten zusammen, in Prozent. */
  andere: number;
}

export interface Zustand {
  session?: 1 | 2;
  kontext: Stueck[];
  verteilung?: Verteilung;
  /** Text des gewürfelten Kandidaten. */
  gewaehlt?: string;
  vergleich?: { session: 1 | 2; stuecke: Stueck[] }[];
}

export interface Schritt {
  title: string;
  /** Inline-Code in Backticks. */
  text: string;
}

const stuecke = (prefix: string, art: Art, texte: string[]): Stueck[] =>
  texte.map((text, i) => ({ id: `${prefix}${i}`, text, art }));

// Gleicher Anfang wie in der Kontextfenster-Animation: der RSVP-Button aus Campus Events.
const AUFTRAG = stuecke('a', 'prompt', ['Füge', ' auf', ' der', ' Event', '-Seite', ' einen', ' Button', ' hinzu', ',', ' der']);
const BEIM = stuecke('s1-', 'erzeugt', [' beim']);
const REST_S1 = stuecke('s1-r', 'erzeugt', [' Klick', ' die', ' Zus', 'age', ' speichert', '.']);
const ANGEMELDETEN = stuecke('s2-', 'erzeugt', [' angemeldeten']);
const REST_S2 = stuecke('s2-r', 'erzeugt', [' Nutzer', '*innen', ' das', ' Zus', 'agen', ' erlaubt', '.']);

const CODE = stuecke('c', 'prompt', ['const', ' [', 'count', ',', ' set', 'Count', ']', ' =', ' use']);
const VERCEL = stuecke('v', 'prompt', ['In', ' Ver', 'cel', ' heißt', ' die', ' Einstellung', ',', ' mit', ' der', ' man', ' Builds', ' über', 'springt', ':']);
const DOKU: Stueck = { id: 'doku', text: 'Auszug Vercel-Doku: „Settings → Build and Deployment → Ignored Build Step …“ ', art: 'doku' };

const V_AUFTRAG: Verteilung = {
  id: 'auftrag',
  kandidaten: [
    { text: ' beim', p: 31 },
    { text: ' angemeldeten', p: 22 },
    { text: ' die', p: 14 },
    { text: ' nur', p: 9 },
  ],
  andere: 24,
};
const V_BEIM: Verteilung = {
  id: 'beim',
  kandidaten: [
    { text: ' Klick', p: 58 },
    { text: ' Anklicken', p: 14 },
    { text: ' Laden', p: 6 },
    { text: ' Drücken', p: 5 },
  ],
  andere: 17,
};
const V_CODE: Verteilung = {
  id: 'code',
  kandidaten: [
    { text: 'State', p: 96 },
    { text: 'Ref', p: 2 },
    { text: 'Memo', p: 1 },
    { text: 'Effect', p: 1 },
  ],
  andere: 0,
};
const V_VERCEL: Verteilung = {
  id: 'vercel',
  kandidaten: [
    { text: ' Skip', p: 22 },
    { text: ' Build', p: 19 },
    { text: ' Ignored', p: 16 },
    { text: ' Deploy', p: 13 },
  ],
  andere: 30,
};
const V_VERCEL_DOKU: Verteilung = {
  id: 'vercel-doku',
  kandidaten: [
    { text: ' Ignored', p: 93 },
    { text: ' Skip', p: 3 },
    { text: ' Build', p: 2 },
    { text: ' Deploy', p: 1 },
  ],
  andere: 1,
};

const ZUSTAENDE: Zustand[] = [
  { session: 1, kontext: AUFTRAG },
  { session: 1, kontext: AUFTRAG, verteilung: V_AUFTRAG },
  { session: 1, kontext: AUFTRAG, verteilung: V_AUFTRAG, gewaehlt: ' beim' },
  { session: 1, kontext: [...AUFTRAG, ...BEIM], verteilung: V_BEIM },
  { session: 1, kontext: [...AUFTRAG, ...BEIM, ...REST_S1] },
  { kontext: CODE, verteilung: V_CODE, gewaehlt: 'State' },
  { kontext: VERCEL, verteilung: V_VERCEL },
  { kontext: VERCEL, verteilung: V_VERCEL, gewaehlt: ' Skip' },
  { kontext: [DOKU, ...VERCEL], verteilung: V_VERCEL_DOKU, gewaehlt: ' Ignored' },
  { session: 2, kontext: AUFTRAG, verteilung: V_AUFTRAG },
  { session: 2, kontext: AUFTRAG, verteilung: V_AUFTRAG, gewaehlt: ' angemeldeten' },
  {
    kontext: [],
    vergleich: [
      { session: 1, stuecke: [...AUFTRAG, ...BEIM, ...REST_S1] },
      { session: 2, stuecke: [...AUFTRAG, ...ANGEMELDETEN, ...REST_S2] },
    ],
  },
];

export const STEPS: Schritt[] = [
  {
    title: 'Nur dieser Text.',
    text: 'Das Modell bekommt euren Auftrag als Text, zerlegt in Stücke. Es schlägt nirgends nach – es gibt keine Datenbank mit Antworten, nur Gewichte aus dem Training und das, was im Kontext steht.',
  },
  {
    title: 'Kandidaten mit Wahrscheinlichkeiten.',
    text: 'Für das nächste Stück berechnet das Modell, wie gut jedes mögliche Stück passt – zehntausende Kandidaten. Hier die vier stärksten, der Rest ist zusammengefasst.',
  },
  {
    title: 'Gewichtet gewürfelt.',
    text: 'Gewählt wird nach diesen Gewichten: Meist gewinnt ein starker Kandidat, aber nicht zwingend der stärkste. Diesmal „beim“.',
  },
  {
    title: 'Alles links ist Eingabe.',
    text: 'Das gewählte Stück gehört jetzt zum Kontext, und die Balken werden neu berechnet. Deshalb zählt jede Formulierung in eurem Auftrag: Sie verschiebt alle folgenden Balken.',
  },
  {
    title: 'Stück für Stück.',
    text: 'So entsteht jede Antwort, auch eine ganze Datei Code: ein Stück wählen, neu rechnen, nächstes Stück. Ein Stück heißt Token – oft ein Wortteil, im Schnitt etwa 3–4 Zeichen.',
  },
  {
    title: 'Bei Code oft eindeutig.',
    text: 'Code folgt strengen Mustern, die das Modell sehr oft gesehen hat: Nach `use` kommt hier fast sicher `State`. Spitze Balken – darum klappt Code so gut. Und Code lässt sich ausführen; dann zeigt sich, ob er stimmt.',
  },
  {
    title: 'Wenig gesehen: flache Balken.',
    text: 'Zu dieser Vercel-Einstellung hat das Modell wenig passende Beispiele gesehen. Kein Kandidat sticht heraus – gewählt wird trotzdem einer.',
  },
  {
    title: 'So entsteht Halluzination.',
    text: 'Gewählt: „Skip“ – daraus wird „Skip Build“. Klingt genauso flüssig wie eine richtige Antwort, die Einstellung heißt aber anders. „Weiß ich nicht“ ist nur ein weiterer Kandidat und gewinnt selten. Das ist kein Bug, der bald behoben wird, sondern folgt aus dem Verfahren.',
  },
  {
    title: 'Gegenmittel: Kontext und Prüfen.',
    text: 'Steht der passende Auszug aus der Doku im Kontext, wird die Verteilung spitz: „Ignored Build Step“. Deshalb gebt ihr Fehlermeldungen und Doku mit – und prüft das Ergebnis, statt es zu glauben. Spitze Balken können übrigens auch falsch sein.',
  },
  {
    title: 'Derselbe Auftrag, noch einmal.',
    text: 'Neue Session, exakt derselbe Text. Das Modell rechnet exakt dieselben Balken wie beim ersten Mal.',
  },
  {
    title: 'Diesmal fällt der Würfel anders.',
    text: '„angemeldeten“ hatte 22 % – nicht der stärkste Kandidat, aber gut möglich. Ab hier läuft die Antwort in eine andere Richtung.',
  },
  {
    title: 'Zwei plausible Ergebnisse.',
    text: 'Beide passen zum Auftrag – aber erfüllen beide euer Akzeptanzkriterium? Präzise Kriterien verkleinern die Streuung, Prüfen fängt den Rest. Einen Schalter, der den Zufall abstellt, hat Claude Code nicht.',
  },
];

export function zustandAt(step: number): Zustand {
  const z = Number.isInteger(step) ? ZUSTAENDE[step - 1] : undefined;
  if (!z) throw new RangeError(`Schritt ${step} gibt es nicht (1–${ZUSTAENDE.length}).`);
  return z;
}

export function summe(v: Verteilung): number {
  return v.kandidaten.reduce((s, k) => s + k.p, v.andere);
}

/** Höchste Einzelwahrscheinlichkeit – hoch heißt spitz, niedrig heißt flach. */
export function spitze(v: Verteilung): number {
  return Math.max(...v.kandidaten.map((k) => k.p));
}

export function gewaehlterKandidat(z: Zustand): Kandidat | undefined {
  return z.verteilung?.kandidaten.find((k) => k.text === z.gewaehlt);
}
