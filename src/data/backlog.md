# Backlog — Leihbar

> Ein Issue = ein Durchgang mit Claude. Oben steht, was als Nächstes dran ist.
> Status: ⬜ offen · 🔧 in Arbeit · ✅ fertig (alle Kriterien im Browser geprüft)
> Aufbau jedes Issues: **Ziel** (was danach möglich ist, für wen und warum – „damit …“) · **Nicht im Umfang** · **Akzeptanzkriterien** (Gegeben … wenn … dann …) · **Fertig, wenn** (woran man es prüft).

## Tag 1 — Übung 2: MVP ohne Datenbank

### ⬜ Issue 1 — Liste mit Beispieldaten
**Ziel:** Auf der Startseite sehen Studierende alle Gegenstände, die gerade ausleihbar sind – damit sie wissen, was es am Campus gibt.
**Nicht im Umfang:** Suche, Filter, Detailseite, Datenbank (Beispieldaten aus `src/data/gegenstaende.ts`, Bilder aus `public/gegenstaende/`).
**Akzeptanzkriterien:**
- Gegeben ich öffne die Startseite, dann sehe ich mindestens 4 Gegenstände mit Bild, Titel, Kategorie, Preis pro Tag („gratis“, wenn er 0 ist), Ort und Besitzer*in.
- Gegeben ein Gegenstand ist gerade verliehen, dann wird er nicht angezeigt.
- Gegeben ich öffne die Seite am Handy (375 px breit), dann sind alle Gegenstände lesbar und nichts ragt über den Rand.

**Fertig, wenn:** Startseite im Browser und in Handybreite geprüft; die verliehene „Systemkamera“ fehlt.

### ⬜ Issue 2 — Detailseite
**Ziel:** Ein Klick auf einen Gegenstand zeigt Beschreibung und alle Details auf einer eigenen Seite – damit Studierende entscheiden können, ob sie ihn ausleihen.
**Nicht im Umfang:** Anfragen, Bearbeiten, Teilen.
**Akzeptanzkriterien:**
- Gegeben ich klicke auf einen Gegenstand in der Liste, dann öffnet sich eine eigene Seite (eigene URL) mit allen Infos und dem Bild.
- Gegeben ich bin auf der Detailseite, dann gibt es einen Weg zurück zur Liste.
- Gegeben ich rufe die Adresse eines Gegenstands auf, den es nicht gibt, dann sehe ich eine verständliche Meldung statt eines Fehlers.

**Fertig, wenn:** zwei Gegenstände angeklickt, Adresse kopiert und in neuem Tab geöffnet, zurück zur Liste; eine erfundene Adresse aufgerufen und die Meldung gesehen.

### ⬜ Issue 3 — Nach Kategorie filtern
**Ziel:** Studierende filtern die Liste nach Kategorie (Mode, Wohnen & Deko, Technik, Freizeit) – damit sie schneller finden, was sie brauchen.
**Nicht im Umfang:** Freitextsuche, mehrere Kategorien gleichzeitig.
**Akzeptanzkriterien:**
- Gegeben ich klicke auf „Mode“, dann sehe ich nur Mode und der Filter ist sichtbar aktiv.
- Gegeben ich klicke auf „Alle“, dann sehe ich wieder alle Gegenstände.
- Gegeben ich habe „Mode“ gewählt, wenn ich danach „Technik“ wähle, dann sehe ich nur Technik (Filter addieren sich nicht).

**Fertig, wenn:** jede Kategorie einmal angeklickt, zweimal hintereinander gewechselt, auch am Handy.

## Tag 2 — Übung 3: Echte Daten (Supabase)

### ⬜ Issue 4 — Gegenstand anbieten
**Ziel:** Studierende bieten einen Gegenstand an, und er erscheint dauerhaft in der Liste – damit die App echte Angebote zeigt statt Beispieldaten.
**Nicht im Umfang:** Bearbeiten, Löschen, Bilder hochladen (neue Gegenstände zeigen einen neutralen Platzhalter statt eines Bildes).
**Akzeptanzkriterien:**
- Gegeben ich fülle Titel, Kategorie, Beschreibung, Ort und Preis pro Tag aus und speichere, dann erscheint der Gegenstand in der Liste und ist nach Reload noch da (Datenbank!).
- Gegeben der Titel ist leer oder der Preis ist negativ, dann sehe ich eine verständliche Fehlermeldung und nichts wird gespeichert.
- Gegeben ich schaue ins Supabase-Dashboard, dann sehe ich den Gegenstand in der Tabelle `items`.

**Fertig, wenn:** ein Gegenstand angeboten, Seite neu geladen, Zeile im Supabase-Dashboard gesehen; je ein Versuch mit leerem Titel und mit negativem Preis – beide Male Fehlermeldung, keine neue Zeile.

## Tag 2 — Übung 4: Login & Anfragen

### ⬜ Issue 5 — Anmelden
**Ziel:** Studierende registrieren sich mit E-Mail und Passwort und melden sich an – damit die App weiß, wer sie sind.
**Nicht im Umfang:** Login mit Google, Passwort vergessen, Profilseite.
**Akzeptanzkriterien:**
- Gegeben ich bin nicht angemeldet, dann sehe ich „Anmelden“ im Header; angemeldet sehe ich meine E-Mail und „Abmelden“.
- Gegeben ich rufe `/meine-anfragen` nicht angemeldet auf, dann werde ich zur Anmeldung geleitet.
- Gegeben ich gebe ein falsches Passwort ein, dann sehe ich eine verständliche Fehlermeldung.

**Fertig, wenn:** ein Testkonto registriert, ab- und wieder angemeldet, einmal mit falschem Passwort versucht, `/meine-anfragen` ohne Login aufgerufen.

### ⬜ Issue 6 — Ausleihen anfragen
**Ziel:** Studierende fragen einen Gegenstand zum Ausleihen an und können die Anfrage zurückziehen – damit Besitzer*innen sehen, wer ihn haben möchte.
**Nicht im Umfang:** Anfrage annehmen oder ablehnen, Zeitraum wählen, Bezahlung.
**Akzeptanzkriterien:**
- Gegeben ich bin angemeldet, wenn ich „Ausleihen anfragen“ klicke, dann steht der Button auf „Angefragt ✓“ und der Zähler „Anfragen“ steigt um 1.
- Gegeben ich habe angefragt, wenn ich erneut klicke, dann ist die Anfrage zurückgezogen und der Zähler sinkt um 1.
- Gegeben ich bin nicht angemeldet, wenn ich klicke, dann führt mich der Button zur Anmeldung.
- Gegeben ich öffne die Detailseite am Handy, dann sehe ich den Button ohne zu scrollen.
- Gegeben eine andere Person hat angefragt, dann kann ich **ihre** Anfrage nicht löschen (Row Level Security, Tabelle `requests`).

**Fertig, wenn:** alle Kriterien im Browser durchgeklickt, Zähler stimmt auch nach einem Reload.

### ⬜ Issue 7 — Meine Anfragen
**Ziel:** Unter `/meine-anfragen` sehen Studierende, was sie angefragt haben – damit sie den Überblick behalten.
**Nicht im Umfang:** Status der Anfrage, Erinnerungen.
**Akzeptanzkriterien:**
- Gegeben ich habe 2 Gegenstände angefragt, dann sehe ich genau diese 2, die neueste Anfrage zuerst.
- Gegeben ich habe nichts angefragt, dann sehe ich einen Hinweis mit Link zur Liste.

**Fertig, wenn:** mit einem Testkonto erst ohne Anfrage (Hinweis sichtbar), dann zwei Anfragen gestellt und eine zurückgezogen – die Liste stimmt jeweils.

## Optional (Tag 2, wer schnell ist) — KI als Feature

### ⬜ Issue 8 — Beschreibung vorschlagen lassen
**Ziel:** Besitzer*innen lassen sich aus Titel, Kategorie und Ort eine Beschreibung vorschlagen – damit sie Gegenstände schneller anbieten.
**Nicht im Umfang:** Bilder generieren, Übersetzungen, automatisches Speichern des Vorschlags.
**Akzeptanzkriterien:**
- Gegeben ich habe Titel, Kategorie und Ort ausgefüllt, wenn ich auf „Beschreibung vorschlagen“ klicke, dann erscheint nach wenigen Sekunden ein Vorschlag (2–3 Sätze, Deutsch) im Beschreibungsfeld, den ich bearbeiten kann.
- Gegeben der Titel ist leer, dann ist der Button deaktiviert.
- Gegeben ich klicke 6-mal innerhalb einer Minute, dann bekomme ich beim 6. Mal eine freundliche Meldung statt eines Vorschlags (Rate Limit).
- Gegeben ich schaue in den Browser-Code (Netzwerk-Tab), dann ist dort **kein** API-Key sichtbar – der Aufruf läuft über eine eigene API-Route im Backend (`ANTHROPIC_API_KEY` in `.env.local`).

**Fertig, wenn:** drei Vorschläge erzeugt, Rate Limit ausgelöst, Netzwerk-Tab ohne Key.

## Tag 2 — Übung 6: Gemeinsam (mit den Konten der anderen)

### ⬜ Issue 9 — Zähler live
**Ziel:** Der Zähler „Anfragen“ auf der Detailseite ändert sich ohne Neuladen, sobald jemand anderes anfragt oder zurückzieht – damit Besitzer*innen sofort sehen, dass jemand Interesse hat.
**Nicht im Umfang:** Benachrichtigungen, Töne, Liste der Anfragenden.
**Akzeptanzkriterien:**
- Gegeben ich habe die Detailseite eines Gegenstands offen, wenn eine andere Person ihn auf ihrem Gerät anfragt, dann steigt der Zähler innerhalb von 3 Sekunden um 1, ohne dass ich neu lade.
- Gegeben die andere Person zieht ihre Anfrage zurück, dann sinkt der Zähler wieder, ebenfalls ohne Neuladen.
- Gegeben ich bin nicht angemeldet, dann sehe ich den Zähler trotzdem live.
- Gegeben ich lade die Seite danach neu, dann zeigt der Zähler denselben Wert (nichts doppelt gezählt).

**Fertig, wenn:** die nächste Person in der Runde auf meiner Live-Adresse angefragt und zurückgezogen hat, während ich auf meinem Gerät zugesehen habe – einmal angemeldet, einmal abgemeldet.

### ⬜ Issue 10 — Anfrage annehmen oder ablehnen
**Ziel:** Besitzer*innen nehmen eine Anfrage an oder lehnen sie ab, und die anfragende Person sieht die Antwort – damit aus einer Anfrage eine Ausleihe wird.
**Nicht im Umfang:** Zeitraum, Übergabe, Nachrichten, E-Mails; Beispiel-Gegenstände ohne Besitzer*in-Konto.
**Akzeptanzkriterien:**
- Gegeben jemand hat einen Gegenstand angefragt, den ich anbiete, dann sehe ich auf dessen Detailseite die Anfrage mit der E-Mail, mit der die Person angemeldet ist, und den Buttons „Annehmen“ und „Ablehnen“.
- Gegeben der Gegenstand gehört nicht mir, dann sehe ich dort keine fremden Anfragen und keine Buttons.
- Gegeben ich nehme eine Anfrage an, dann steht bei der anfragenden Person unter `/meine-anfragen` „angenommen“; lehne ich ab, steht dort „abgelehnt“. Neue Anfragen stehen auf „offen“.
- Gegeben ich bin weder Besitzer*in noch die anfragende Person, dann kann ich die Anfrage samt E-Mail auch direkt in der Datenbank nicht lesen; der Zähler aus Issue 9 zählt trotzdem für alle (Row Level Security, Tabelle `requests`).
- Gegeben ich bin Besitzer*in, dann kann ich an einer Anfrage nur den Status ändern; alle anderen können gar nichts ändern.

**Fertig, wenn:** die nächste Person in der Runde auf meiner Live-Adresse einen Gegenstand angefragt hat, den ich angeboten habe; ich habe angenommen und sie hat „angenommen“ gesehen; eine zweite Anfrage abgelehnt; RLS-Prüfung mit dem Supabase-MCP ohne Lücke.

### ⬜ Issue 11 — Hinweis auf neue Anfragen (wer schnell ist)
**Ziel:** Im Header sehe ich, wie viele offene Anfragen auf meine Gegenstände warten – damit ich keine verpasse.
**Nicht im Umfang:** E-Mail- oder Push-Benachrichtigungen, Anfragen auf fremde Gegenstände.
**Akzeptanzkriterien:**
- Gegeben auf meine Gegenstände warten 2 offene Anfragen, dann zeigt der Header eine 2, und ein Klick darauf führt zu einer Seite, auf der ich sie sehe.
- Gegeben es wartet keine offene Anfrage, dann zeigt der Header keine Zahl.
- Gegeben eine andere Person fragt an, während ich die App offen habe, dann steigt die Zahl ohne Neuladen; nehme ich an oder lehne ab, sinkt sie.
- Gegeben ich bin nicht angemeldet, dann gibt es keinen Hinweis.
- Gegeben ich öffne die App am Handy (375 px), dann bleibt der Header einzeilig.

**Fertig, wenn:** die nächste Person in der Runde hat zweimal angefragt, die Zahl stieg live auf 2; eine angenommen, eine abgelehnt, die Zahl verschwand; einmal abgemeldet geprüft.

## Tag 2 — Übung 7: Animation

### ⬜ Issue 12 — Filter mit Animation
**Ziel:** Beim Wechsel der Kategorie gleiten die Karten an ihren neuen Platz, statt zu springen – damit man sieht, was wegfällt und was bleibt.
**Nicht im Umfang:** Animation beim ersten Laden der Seite, neue Filter, Sortierung.
**Akzeptanzkriterien:**
- Gegeben ich wechsle von „Alle“ zu „Mode“, dann blenden die übrigen Karten aus und die verbleibenden gleiten an ihren neuen Platz – in höchstens 0,4 Sekunden.
- Gegeben ich wechsle die Kategorie, dann gleitet die Markierung des aktiven Filters zum neuen Filter.
- Gegeben ich klicke schnell hintereinander mehrere Filter, dann zeigt die Liste am Ende genau die Gegenstände der zuletzt gewählten Kategorie (keine doppelten oder hängengebliebenen Karten).
- Gegeben „Bewegung reduzieren“ ist eingeschaltet, dann wechselt die Liste ohne Animation.
- Gegeben ich öffne die Seite am Handy (375 px), dann ragt auch während der Animation nichts über den Rand.

**Fertig, wenn:** jede Kategorie angeklickt, schnell hin und her gewechselt, einmal mit „Bewegung reduzieren“ (DevTools → Rendering → prefers-reduced-motion: reduce) und einmal in Handybreite.

### ⬜ Issue 13 — Anfragen ohne Warten
**Ziel:** Button und Zähler reagieren sofort beim Klick, nicht erst nach der Antwort der Datenbank – damit sich die App schnell anfühlt; klappt das Speichern nicht, sieht man das.
**Nicht im Umfang:** Töne, Vibration, Animationen auf dem Rest der Seite.
**Akzeptanzkriterien:**
- Gegeben ich bin angemeldet, wenn ich „Ausleihen anfragen“ klicke, dann ändern sich Button und Zähler sofort, und die Zahl wechselt mit einer kurzen Animation (höchstens 0,3 Sekunden).
- Gegeben das Speichern schlägt fehl, dann springen Button und Zähler auf den alten Stand zurück, der Button schüttelt kurz, und ich lese in einem ganzen deutschen Satz, was passiert ist.
- Gegeben ich lade die Seite neu, dann stimmt der Zähler – auch zusammen mit der Live-Aktualisierung aus Issue 9 wird nichts doppelt gezählt.
- Gegeben „Bewegung reduzieren“ ist eingeschaltet, dann ändern sich Zahl und Button ohne Animation.

**Fertig, wenn:** angefragt, zurückgezogen, neu geladen; den Fehlerfall einmal ausgelöst (DevTools → Network → „Offline“, dann klicken) und gesehen, dass der Zähler zurückspringt; danach wieder „No throttling“.

### ⬜ Issue 14 — Erfolgsmoment beim Anbieten
**Ziel:** Nach dem Speichern eines neuen Gegenstands sieht man deutlich, dass es geklappt hat, und findet ihn sofort in der Liste – damit Anbietende sicher sind, dass ihr Angebot online ist.
**Nicht im Umfang:** Konfetti, Teilen, E-Mail an andere.
**Akzeptanzkriterien:**
- Gegeben ich speichere einen gültigen Gegenstand, dann sehe ich eine Erfolgsmeldung mit Häkchen, die nach wenigen Sekunden von selbst verschwindet.
- Gegeben ich lande danach in der Liste, dann ist der neue Gegenstand kurz hervorgehoben.
- Gegeben ich lade die Seite neu, dann sind Meldung und Hervorhebung weg.
- Gegeben das Speichern scheitert (z. B. leerer Titel), dann gibt es keinen Erfolgsmoment, sondern die Fehlermeldung aus Issue 4.
- Gegeben „Bewegung reduzieren“ ist eingeschaltet, dann erscheinen Meldung und Hervorhebung ohne Animation.

**Fertig, wenn:** ein Gegenstand angeboten und Meldung und Hervorhebung gesehen, neu geladen; einmal mit leerem Titel versucht; einmal mit „Bewegung reduzieren“.

## Später / Ideen (nicht im MVP)
- Kalender mit freien Tagen
- Fotos hochladen
- Kaution und Bewertungen
