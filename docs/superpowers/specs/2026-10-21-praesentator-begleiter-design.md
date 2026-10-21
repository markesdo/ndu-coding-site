# Präsentator-Begleiter – Design

Stand 21.10.2026, freigegeben von Markus im Chat. Ziel: einsatzbereit für Innolab Tag 1 am **Do 22.10.2026**.

## Wozu
Markus unterrichtet das Innolab allein am Beamer. Er will auf einem zweiten Bildschirm (Tablet oder Laptop) zu jeder Folie sehen, was er sagen soll, und sich am Abend davor vorbereiten können, ohne die Bücher noch einmal zu lesen.

## Was es ist
Eine Seite `/innolab/begleiter` (hinter dem Kurspasswort wie alles; nur für Markus verlinkt, neben dem Link „Präsentator“ aus `PraesentatorEinstieg.astro`, sichtbar nur mit Präsentator-Schlüssel). Sie zeigt das Material zu **einer Folie**:

1. **Live (oben, groß, auf einen Blick):** 3–5 Stichworte zum Sagen; ein Satz Überleitung zur nächsten Folie; bei Übungen Timer-Dauer und Sozialform.
2. **Vorbereitung (darunter, ausklappbar oder scrollbar):**
   - Kern aus der Quelle mit Seitenzahl (gedruckte Seite; EPUB Kapitel + Abschnitt), wörtliche Zitate nur im Original geprüft.
   - Die Geschichte/das Beispiel aus der Quelle, nacherzählt zum Erzählen.
   - **Zusatzfälle** außerhalb der Kursquellen: echte, nachprüfbare Fälle mit Quelle (URL oder Buch), deutlich gekennzeichnet „Zusatz, nicht aus den Kursquellen“. Nichts erfinden.
   - Erwartbare Fragen der Studierenden mit kurzer Antwort.
   - Bei Übungen: Ablauf, worauf achten, typische Fehler, Auflösung.

## Synchronisation
- Standard: **folgt dem Beamer automatisch.** Quelle ist die bestehende Position aus `api/position.ts` (GET, für Angemeldete; Felder `pfad`, `anker`, `titel`), die der Beamer-Tab schon für „Wo ist Markus?“ meldet. Der Begleiter fragt im selben Takt wie die Studierenden-Seiten (`src/lib/position.ts`: `ABFRAGE_MS`) und zeigt den Eintrag zu `pfad#anker`.
- Zusätzlich **von Hand blättern** (vor/zurück, Liste der Folien des Tages), damit Markus am Abend ohne Beamer vorbereiten kann. Beim Blättern pausiert das Folgen; ein Schalter „Dem Beamer folgen“ schaltet es wieder ein.
- Keine Position / Folie ohne Eintrag: klare Anzeige („Beamer meldet nichts“ bzw. „Zu dieser Folie gibt es noch keine Notizen“) mit Titel der Folie.

## Inhalte
- Umfang jetzt: **nur Tag 1** – `src/pages/innolab/tag-1.astro` (19 Folien), die verlinkten Methodenseiten `problem-rahmen` (7), `entscheidungslog` (5), `annahmen` (7), `interview` (10) und `src/pages/innolab/tag-1/abschluss.astro` (3; *Entscheidung Claude*), zusammen 51. Schlüssel je Folie = Seitenpfad + `h2`-id der `Folie`; Positionen mit Unter-Anker oder ohne Anker werden der umschließenden Folie bzw. der ersten Folie der Seite zugeordnet (*Entscheidung Claude*).
- Reihenfolge des Tages (für „nächste Folie“ und die Folienliste) nach dem Zeitplan in `tag-1.astro`: Tag 1 → problem-rahmen → entscheidungslog → annahmen → interview → Abschluss (*Entscheidung Claude*).
- **Zusatzfälle nur, wo es einen guten echten Fall gibt** – nichts zum Auffüllen erfinden; Agenten dürfen im Web suchen, jede Quelle mit URL/Buch (*Entscheidung Claude*).
- **Auslieferung in Stufen (Markus):** zuerst Seite + Beamer-Folgen + Anzeige „noch keine Notizen“; dann Inhalte Seite für Seite, sobald geprüft, in der Reihenfolge des Tages (Tag-1-Vormittag und problem-rahmen zuerst). Kein eigener Review-Schritt durch Markus vor dem Live-Gang; er liest beim Vorbereiten. Der Test „jede Tag-1-Folie hat einen Eintrag“ gilt erst, wenn alle Seiten fertig sind; bis dahin prüft er nur, dass jeder Eintrag auf eine existierende Folie zeigt.
- Ablage im Repo als Daten (das Repo ist öffentlich; Markus ist einverstanden, dass Studierende es lesen könnten), Sprache Deutsch, Kursstil („ihr“ nur in Zitaten an Studierende; der Begleiter spricht Markus an).
- Erstellt von Subagenten aus den Volltexten in `~/code/ndu coding/2026/quellen/` und den Originalen in `~/Documents/innolab_2026/`, eine Seite pro Agent; jedes Zitat im Original geprüft; Kaffeebar-Beispiele nur mit IDs aus `src/werkstatt/beispiele/*.json`.
- Keine Anekdoten über Markus' eigene Konten/Erlebnisse (Kursregel).

## Constraints
- Kein neues Backend, keine Datenbank; vorhandene Position-API reicht.
- Tablet-tauglich (Hochformat und Querformat), große Schrift oben, dunkles Thema wie die Site.
- Tests: Zuordnung Position → Eintrag (inkl. Unter-Anker, leere Position); jeder Eintrag zeigt auf eine existierende Folie (Seite + h2-id); Vollständigkeit erst in der letzten Stufe (siehe Inhalte).
- Gates wie sonst: `npm test`, `npm run build`, kein Board-Schlüssel im Repo, keine rohen U+2028/2029.

## Nicht-Ziele
- Keine Steuerung des Beamers vom Tablet aus.
- Tag 2–7 jetzt nicht (Format so wählen, dass sie später dazukommen).
- Kein Schutz der Inhalte vor Studierenden über das Kurspasswort hinaus.

## Dem Builder überlassen
Datenformat (TS-Modul oder JSON/Markdown je Seite), Seitenlayout im Rahmen oben, Name der Komponenten, wie die Folienliste gebaut wird (aus den Daten oder aus den Seitenquellen).
