// Texte für den Teams-Chat (Tag 2 ist online): Markus kopiert sie im Begleiter (Notiz.chat, Knopf „Kopieren“), ohne den
// Beamer-Modus zu verlassen. Die Karte „Für den Teams-Chat“ im Handout der Übungsfolien zeigt denselben String – eine
// Quelle, damit Begleiter und Handout nicht auseinanderlaufen (begleiter-chat.test.ts).

export const CHAT_SYNTHESE = `Interview-Synthese · 44 min · Miro: T1 · 5, eure Snapshots als Karten
1. Zeigen (5 min): Eine Person geht ihre Snapshots durch – Zitat, Geschichte, Chancen: auf Miro T1 · 5 oder, falls die Karte noch leer ist, per Bildschirm teilen aus der Werkstatt.
2. Besprechen (7 min): Die anderen beiden fragen: Was wurde gesagt? Was ändert sich? Wie war das Gespräch? Was haben wir überhört? Was sie anders hören, notiert ihr für den Snapshot.
3. Reihum: drei Runden à 12 Minuten.
4. Festhalten und prüfen (8 min): Snapshots in der Werkstatt ergänzen, Belege in der Annahmen-Map, Zeilen im Entscheidungslog (eine pro Entscheidung, nicht pro Interview); dann Prüfliste und Claude.
Noch keine Interviews in der Werkstatt? Bis 14:50 die besten 2–3 eintragen, in dieser Reihenfolge: Pseudonym, Datum, Einwilligung, 3–5 Zitate mit ID, Chancen mit Beleg-IDs. Danach Runden à 5 min (2 zeigen, 3 besprechen).`;

export const CHAT_JOURNEY_MAP = `Experience Map · 35 min · Miro: T2 · 1 · Experience Map
1. Allein (10 min): Knoten aus euren Skizzen beschriften – auf Papier oder gleich in eurer Spalte auf Miro T2 · 1 –, zur neuen Map zusammenfügen, die Map von Tag 1 daneben.
2. Zu dritt (12 min): Jede*r zeigt die eigene Map (Bildschirm teilen), die anderen fragen nach – ohne die eigene zu verteidigen.
3. Momente festlegen (8 min), in eurer Spalte auf Miro T2 · 1, jede*r für das eigene Produkt: drei bis fünf, ohne Überschneidung, in den Worten der Kundschaft. Jeder Moment mit Zitat-ID, etwa I2-3: Das Zitat zeigt, was die Person dort denkt, fühlt oder tut. Dann den stärksten Moment (Hoch- oder Tiefpunkt) und das Ende markieren.
4. Prüfen (5 min): Prüfliste, dann Claude mit einem Bild eurer Map (Prompt auf der Seite unter „Prüfen“).`;

export const CHAT_BAUM = `Opportunity Solution Tree · 39 min · Miro: euer Baum, „Baum · <euer Name>“ (Beispiel: Baum · Beispiel Kaffeebar)
Vorher: Momente aus T2 · 1 als blaue Karten unter euer Outcome (Cmd+D).
1. Inventar, allein (12 min): jede Chance aus euren Snapshots durch die drei Fragen – Bedürfnis statt Lösung? In mehr als einem Interview? Treibt sie den Outcome? –, dann als gelbe Karte in „Baum · <euer Name>“ unter ihren Moment. Jede Chance nennt mindestens eine Zitat-ID, etwa I2-3. Einzelfälle (nur eine Person) in den Streifen „Nur in einem Interview“.
2. Struktur, allein (10 min): Ast für Ast gruppieren, übergeordnete Chancen ergänzen und mit „(ergänzt)“ beschriften, Dubletten zusammenlegen. Jede Karte hängt mit einer Linie an genau einer Karte darüber: Cmd+D dupliziert, vom blauen Punkt der oberen Karte zur unteren ziehen.
3. Gegenlesen, reihum (12 min, vier pro Baum): Aus Firmensicht? Senkrechte Kette? Hängt an zwei Chancen? Nicht konkret? Lösung statt Chance? Gefühl statt Ursache? Ohne ID kein Beleg.
4. Prüfen (5 min): Prüfliste, dann Claude mit einem Bild eures Baums (Prompt auf der Seite unter „Prüfen“).`;

/** Erst-fragen-Folien ohne Handout-Karte: nur die Aufgabe, damit sie im Chat steht, während alle tippen. */
export const CHAT_NETFLIX = 'Was ist für euch das Wichtigste in dieser Geschichte? Ein Satz – erst tippen, abschicken auf mein Zeichen.';
export const CHAT_ZWOELF = 'Welche der zwölf Chancen würdet ihr zuerst angehen, und warum? Ein Satz – erst tippen, abschicken auf mein Zeichen.';
