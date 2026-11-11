// Vorwissen der Studierenden je Methode, nur für den Präsentator-Begleiter (/innolab/begleiter): Was schon aus einer
// anderen Lehrveranstaltung (LV) bekannt ist, braucht weniger Theorie. Nie auf Studierenden-Seiten oder dem Beamer
// zeigen (vorwissen.test.ts prüft, wer diese Datei importiert).
// Quelle: Umfrage im Teams-Kanal, November 2026, Antwort so, wie die Studierenden sie gegeben haben. Manches hieß in den
// LVs vermutlich anders; „unsicher“ = nur ähnlich, unter anderem Namen genannt.
// Schlüssel = Methoden-Slug aus components/methoden.ts (Seite /innolab/methoden/<slug>).

export type VorwissenGrad = 'bekannt' | 'teilweise' | 'unsicher';

export type Vorwissen = {
  /** Name der LV, in der die Methode vorkam. */
  lv: string;
  grad: VorwissenGrad;
  /** Was die Studierenden dazu gesagt haben, möglichst wörtlich. */
  notiz?: string;
};

const NEED_FINDING = 'Need Finding / Market Research';
const ENTREPRENEUR_LAB = 'Entrepreneur Lab & Prototyping';

export const VORWISSEN: Record<string, Vorwissen> = {
  interview: { lv: NEED_FINDING, grad: 'bekannt' },
  synthese: { lv: NEED_FINDING, grad: 'teilweise', notiz: 'Antwort: „mäßig?“' },
  'ziel-chance': { lv: NEED_FINDING, grad: 'bekannt' },
  hmw: { lv: NEED_FINDING, grad: 'bekannt' },
  kundenprofil: { lv: ENTREPRENEUR_LAB, grad: 'bekannt', notiz: 'Dazu genannt: „customer journey, storyboard – mäßige Sachen“' },
  geschaeftsmodell: { lv: ENTREPRENEUR_LAB, grad: 'bekannt' },
  'story-map': { lv: ENTREPRENEUR_LAB, grad: 'bekannt' },
  'usage-story': { lv: ENTREPRENEUR_LAB, grad: 'unsicher', notiz: 'Antwort: „kinda, not really?“' },
  'journey-map': { lv: ENTREPRENEUR_LAB, grad: 'unsicher', notiz: '„customer journey“ genannt, ähnlich unter anderem Namen' },
  'concept-story': { lv: ENTREPRENEUR_LAB, grad: 'unsicher', notiz: '„storyboard“ genannt, ähnlich unter anderem Namen' },
};
