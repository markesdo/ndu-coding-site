// Freigabezeiten des Innolabs, die mehr als eine Seite braucht. Wiener Zeit, Format wie <Aufloesung ab=…>.

/** Spätester Zeitpunkt für die Auflösungen des Mom Test an Tag 1 (Gruppen „mom-test…“ der Interview-Seite) und den
 *  Leitfaden-Editor (auch auf /innolab/mappe), denn er verrät die Regeln des Mom Test. Normal öffnet Markus sie früher
 *  per Knopf für alle (lib/aufgedeckt.ts); die Uhrzeit ist nur der Rückfall: Ende des Kurstags. */
export const NACH_MOM_TEST = '2026-10-22T16:45';

/** Rückfall für die Toast-Auflösung an Tag 1 (Video und Erklärung): Ende des Kurstags. Aufgedeckt wird per Klick des
 *  Präsentators (Aufdecken für alle); eine feste Uhrzeit mitten am Tag öffnete sie bei spätem Beginn vor der Übung. */
export const NACH_TOAST = '2026-10-22T16:45';

/** Gruppe der letzten Mom-Test-Übung („ausgraben“, interview.astro) mit Editor, Vorlage, Probe-Prompt und Prüfliste; die
 *  Mappe (mappe-hilfen.ts) gibt den Leitfaden frei, sobald Markus sie aufdeckt. Die früheren Übungen haben eigene Gruppen. Global, nicht an die Seite gebunden (components/aufloesung.ts aufloesungKennung). */
export const MOM_TEST_GRUPPE = 'mom-test';

/** Rückfall für die Intuit-Auflösung an Tag 3 (Experiment-Karte, Folie „sagen-tun“): Ende des Kurstags. Aufgedeckt wird
 *  per Klick des Präsentators wie beim Toast; eine Uhrzeit mitten am Tag öffnete sie bei Verspätung vor der Übung. */
export const NACH_INTUIT = '2026-11-21T17:00';

/** Ende von Tag 2 (12.11.) als später Rückfall für die Antwortrunden des Tages: bewusst Mitternacht statt Kursende 18:00,
 *  damit eine Verspätung die Eingabe nicht mitten in der Übung schließt und die Auflösung nicht vorzeitig öffnet. */
export const ENDE_TAG_2 = '2026-11-12T23:59';

/** Rückfall für die Netflix-Auflösung an Tag 2 (Interview-Synthese, Folie „warum“): Ende des Tages. Aufgedeckt wird
 *  per Klick des Präsentators wie beim Toast; vorher sollen alle ihren eigenen Satz abgeschickt haben. */
export const NACH_NETFLIX = ENDE_TAG_2;

/** Rückfall für die Antwortrunde „Zwölf Chancen“ an Tag 2 (Baum, Folie „warum“): Ende des Tages. Aufgedeckt wird per
 *  Klick des Präsentators wie bei Netflix; vorher sollen alle ihre Nummer mit Satz abgeschickt haben. */
export const NACH_ZWOELF = ENDE_TAG_2;


/** Antwortrunde „Rückblick“ am Ende von Tag 2 (Abschluss, Folie „rueckblick“): Im Raum wird nicht aufgedeckt, Markus
 *  dankt nur. Ab 19 Uhr (Kursende 18 Uhr plus eine Stunde Puffer, falls es später wird) sind die Texte lesbar, damit
 *  Markus sie noch am selben Abend sichert; die Eingabe ist dann zu. */
export const NACH_RUECKBLICK_TAG_2 = '2026-11-12T19:00';
