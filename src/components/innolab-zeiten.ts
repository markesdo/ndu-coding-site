// Freigabezeiten des Innolabs, die mehr als eine Seite braucht. Wiener Zeit, Format wie <Aufloesung ab=…>.

/** Spätester Zeitpunkt für die Auflösungen des Mom Test an Tag 1 (Gruppen „mom-test…“ der Interview-Seite) und den
 *  Leitfaden-Editor (auch auf /innolab/mappe), denn er verrät die Regeln des Mom Test. Normal öffnet Markus sie früher
 *  per Knopf für alle (lib/aufgedeckt.ts); die Uhrzeit ist nur der Rückfall: Ende des Kurstags. */
export const NACH_MOM_TEST = '2026-10-22T16:45';

/** Gruppe der letzten Mom-Test-Übung („ausgraben“, interview.astro) mit Editor, Vorlage, Probe-Prompt und Prüfliste; die
 *  Mappe (mappe-hilfen.ts) gibt den Leitfaden frei, sobald Markus sie aufdeckt. Die früheren Übungen haben eigene Gruppen. Global, nicht an die Seite gebunden (components/aufloesung.ts aufloesungKennung). */
export const MOM_TEST_GRUPPE = 'mom-test';
