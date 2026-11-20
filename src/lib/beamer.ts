// Beamer-Modus zur Laufzeit umschalten – eine Regel für Layout.astro (Knopf „Beamer“, Taste B), wo-ist.ts (Abmelden) und die
// Startseiten-Knöpfe „Beamer starten“ / „Beamer beenden“ (PraesentatorEinstieg.astro). Wer Präsentator ist, entscheidet
// html[data-ist-praesentator]: das setzt BeamerStart.astro vor dem ersten Zeichnen aus dem Schlüssel im localStorage; danach
// halten es wo-ist.ts (Seiten mit Layout) und PraesentatorEinstieg.astro (storage-Ereignis, auch auf /start) nach.

/** localStorage-Schlüssel des Präsentators (gesetzt auf /praesentator, wo-ist.ts). BeamerStart.astro (is:inline) nennt ihn wörtlich. */
export const PRAESENTATOR_SCHLUESSEL = 'ndu-presenter';
/** Gemerkter Beamer-Modus (nur beim Präsentator). */
export const BEAMER_SCHLUESSEL = 'ndu-beamer';

/** Das Nötigste von document.documentElement – so laufen die Tests ohne DOM. */
export type Wurzel = Pick<Element, 'hasAttribute' | 'toggleAttribute' | 'setAttribute' | 'removeAttribute'>;
export type Speicher = Pick<Storage, 'setItem' | 'removeItem'>;

/** localStorage, falls erreichbar (privates Fenster, gesperrte Website-Daten, Tests ohne DOM: undefined). */
export function sichererSpeicher(): Storage | undefined {
  try { return globalThis.localStorage ?? undefined; } catch { return undefined; }
}

/** Liegt der Präsentator-Schlüssel in diesem Browser? */
export function praesentatorAngemeldet(speicher: Pick<Storage, 'getItem'> | undefined = sichererSpeicher()): boolean {
  try { return Boolean(speicher?.getItem(PRAESENTATOR_SCHLUESSEL)); } catch { return false; }
}

/** Beamer an oder aus. Einschalten nur beim Präsentator (Regel in BeamerStart.astro), ausschalten immer.
 *  hell: Beamer heißt helles Thema; /start hat ein eigenes dunkles Farbschema und bleibt dabei.
 *  Gibt zurück, ob umgeschaltet wurde – ohne Schlüssel bleibt alles, wie es ist, auch wenn jemand den Knopf per DevTools einblendet. */
export function beamerSchalten(
  root: Wurzel,
  an: boolean,
  { hell = true, speicher = sichererSpeicher() }: { hell?: boolean; speicher?: Speicher } = {},
): boolean {
  if (an && !root.hasAttribute('data-ist-praesentator')) return false;
  // Seite ohne Beamer (Werkstatt, BeamerStart.astro ohne): nicht einschalten, auch nicht per Taste B.
  if (an && root.hasAttribute('data-ohne-beamer')) return false;
  root.toggleAttribute('data-beamer', an);
  if (hell) { if (an) root.setAttribute('data-theme', 'light'); else root.removeAttribute('data-theme'); }
  try { if (an) speicher?.setItem(BEAMER_SCHLUESSEL, '1'); else speicher?.removeItem(BEAMER_SCHLUESSEL); } catch {}
  return true;
}

/** start: /start (ohne Layout, eigenes dunkles Farbschema, kein anderer Knopf zum Ausschalten); layout: Seite mit Layout.astro. */
export type Seitenart = 'start' | 'layout';
type Lage = { praesentator: boolean; beamer: boolean; seite: Seitenart };

/** Was unten auf /start und /innolab steht. Präsentator: „Beamer starten“, sonst der Link „Präsentator“.
 *  Im Beamer-Modus auf Layout-Seiten nichts (dort gibt es den Knopf „Beamer“ und Taste B); auf /start „Beamer beenden“ –
 *  auch ohne Schlüssel (in einem anderen Tab abgemeldet), denn ausschalten muss immer gehen. */
export function einstieg({ praesentator, beamer, seite }: Lage): 'starten' | 'beenden' | 'link' | 'nichts' {
  if (beamer) return seite === 'start' ? 'beenden' : 'nichts';
  return praesentator ? 'starten' : 'link';
}

/** Was ein Klick auf den Knopf tut: null = nichts (Studierende, auch wenn der Knopf per DevTools eingeblendet ist).
 *  Das Ergebnis geht an beamerSchalten(), das die Präsentator-Regel noch einmal selbst prüft. */
export function klickAktion({ praesentator, beamer, seite }: Lage): { an: boolean; hell: boolean } | null {
  const hell = seite !== 'start';
  if (beamer) return { an: false, hell };
  return praesentator ? { an: true, hell } : null;
}

/** localStorage: die Führung unter den Beamer-Tabs als Pacht {id, ts} (JSON; wo-ist.ts). Nur der führende Tab meldet seine
 *  Position an /api/position – sonst überschreiben sich zwei Beamer-Tabs mit Schlüssel gegenseitig, und der Zähler im
 *  Begleiter springt zwischen ihren Folien hin und her. Der Führer erneuert ts jede Sekunde, solange er melden kann; hört er
 *  auf (abgestürzt, geschlossen, Beamer aus, pausiert, verborgen), ist die Pacht nach FUEHRUNG_FRIST_MS frei. */
export const FUEHRENDER_TAB = 'ndu-beamer-tab';
/** So lange gilt eine Pacht ohne Erneuerung (der Führer erneuert jede Sekunde). */
export const FUEHRUNG_FRIST_MS = 4000;

export type Fuehrung = { id: string; ts: number };

/** Pacht lesen; alles, was nicht {id: string, ts: number} ist, gilt als keine Pacht. */
export function fuehrungLesen(roh: string | null): Fuehrung | null {
  if (!roh) return null;
  try {
    const f = JSON.parse(roh) as unknown;
    if (f && typeof f === 'object' && typeof (f as Fuehrung).id === 'string' && Number.isFinite((f as Fuehrung).ts)) return { id: (f as Fuehrung).id, ts: (f as Fuehrung).ts };
  } catch {}
  return null;
}

export function fuehrungSchreiben(ich: string, jetzt: number): string {
  return JSON.stringify({ id: ich, ts: jetzt } satisfies Fuehrung);
}

/** Darf dieser Tab seine Position melden? Ja, wenn er die Pacht hält – oder wenn sie frei ist: keine, unlesbar oder älter
 *  als FUEHRUNG_FRIST_MS (dann übernimmt er sie). Eine frische Pacht eines anderen Tabs bleibt: Die Tabs wechseln nicht hin
 *  und her; übernommen wird nur nach Stille oder bei eigener Benutzung (focus, keydown, pointerdown). Beim Seitenwechsel
 *  bleibt die Pacht stehen, die neue Seite im selben Tab übernimmt sie beim Laden. */
export function dieserTabMeldet(roh: string | null, ich: string, jetzt: number): boolean {
  const f = fuehrungLesen(roh);
  return !f || f.id === ich || jetzt - f.ts > FUEHRUNG_FRIST_MS;
}

/** Darf dieser Tab die Führung übernehmen? Nur, wenn er auch melden kann: Präsentator-Schlüssel da, Beamer-Modus an, nicht
 *  pausiert. Sonst nähme ein Begleiter- oder normaler Tab im selben Browser dem Beamer-Tab die Führung, und der schwiege. */
export function darfFuehren({ schluessel, beamer, pausiert }: { schluessel: string | null; beamer: boolean; pausiert: boolean }): boolean {
  return Boolean(schluessel) && beamer && !pausiert;
}

/** Seitenkopf nach dem Laden an den Anfang (Layout.astro)? Nur im Beamer, ohne #anker, wenn die Seite ein paar Pixel tief
 *  eingerastet ist (weniger als die Kopfleiste) – und nur, solange niemand selbst gescrollt, geklickt oder getippt hat. */
export function kopfAnDenAnfang({ beamer, anker, scrollY, kopfleiste, beruehrt }: { beamer: boolean; anker: boolean; scrollY: number; kopfleiste: number; beruehrt: boolean }): boolean {
  return beamer && !anker && !beruehrt && scrollY > 0 && scrollY < kopfleiste;
}

/** Abstand über der ersten Folie im Beamer (Layout.astro): so viel, dass sie genau an der Falz beginnt, am unteren Rand
 *  des ersten Bildschirms. Der Seitenkopf wird so zum Titelbild, und das erste → zeigt Folie 1 ganz, statt sie ein
 *  zweites Mal anzuspringen. folieOben = Oberkante der Folie im Dokument ohne diesen Abstand. kopfOben = wo der erste
 *  Bildschirm beginnt: Der Seitenkopf ist ein Rastpunkt (beamer.css, .content mit scroll-padding unter der Kopfleiste),
 *  liegt er tiefer als die Kopfleiste hoch ist, rastet die Seite beim Laden ein paar Pixel tiefer ein. 0, wenn der Beamer
 *  aus ist oder die Folie ohnehin an oder unter der Falz beginnt. */
export function ersteFolieAbstand({ beamer, fensterHoehe, folieOben, kopfOben = 0 }: { beamer: boolean; fensterHoehe: number; folieOben: number; kopfOben?: number }): number {
  if (!beamer) return 0;
  return Math.max(0, Math.ceil(Math.max(0, kopfOben) + fensterHoehe - folieOben));
}
