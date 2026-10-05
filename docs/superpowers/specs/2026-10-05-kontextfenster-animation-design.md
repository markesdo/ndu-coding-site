# Kontextfenster-Animation (Sub-Projekt 1 der animierten Konzeptseiten)

Stand: 5.10.2026 · Branch `kontextfenster-animation` (auf `astro-7`)

## Ziel

Am Mi 8.10., 13:00 (Konzept 2, Tag 1) erklärt Markus am Beamer, was mit dem Kontextfenster eines Coding-Agenten passiert – Schritt für Schritt, per Pfeiltaste. Danach bleibt die Animation auf `/konzepte/coding-agent` zum Nachlesen.

Die Animation ersetzt das bestehende Klick-Widget `#ctx` (Balken, der sich sprunghaft füllt). Der umgebende Text bleibt.

Erfolgskriterien:
- Jeder der 8 Schritte ist am Beamer ohne Erklärung lesbar (Beschriftung + Bild).
- Aussage fachlich korrekt für Claude Code 2026 (insbesondere Auto-Compact statt „Älteres fällt still raus“).
- Funktioniert in Light/Dark, auf dem Handy (≤ 900 px) und im Vollbild; mit „Bewegung reduzieren“ ohne Bewegungsanimation.

Zielgruppe der Texte: Master-Studierende ohne Programmiererfahrung – klar, präzise, nicht vereinfacht-kindlich. Anrede „Sie“.

## Architektur

React-Island in Astro, Animation mit Motion.

| Datei | Zweck |
|---|---|
| `src/components/sota/Stage.tsx` | Wiederverwendbarer Rahmen für alle Schritt-Animationen (auch die vier Ausblick-Szenen in Sub-Projekt 2): Titel, Bühne, Beschriftung, Steuerung. |
| `src/components/sota/Kontextfenster.tsx` | Die Szene: zeichnet das Fenster für den aktuellen Schritt. |
| `src/components/sota/kontextfenster-steps.ts` | Reine Daten/Logik: `STEPS` (Beschriftungen) und `blocksAt(step)` → Liste der Blöcke mit Zustand + Füllstand. Ohne React, unit-testbar. |
| `src/components/sota/stage.css` | Styles für Stage und Szene, ausschließlich mit den Tokens aus `global.css`. |

Abhängigkeiten (neu): `@astrojs/react@^7`, `react@^19`, `react-dom@^19`, `motion@^14`; Dev: `@types/react`, `@types/react-dom`, `vitest`. `astro.config.mjs` bekommt `integrations: [react()]`, `tsconfig.json` `"jsx": "react-jsx"`, `"jsxImportSource": "react"`.

Einbindung: In `coding-agent.astro` ersetzt `<Kontextfenster client:visible />` den Block `<div class="widget" id="ctx">…</div>`. Astro rendert Schritt 1 serverseitig, d. h. ohne JavaScript ist das Ausgangsbild sichtbar. Die nicht mehr genutzten `.ctx-*`-Styles in `global.css` werden entfernt.

### Stage – Verhalten

- Props: `title`, `steps: { caption: ReactNode }[]`, `children: (step: number) => ReactNode`.
- Steuerung: Buttons „Zurück“, „Weiter“, „Von vorn“, „Vollbild“; Anzeige „3 / 8“.
- Tastatur: ← / → / Leertaste / Pos1. Nur wenn die Stage fokussiert ist (Klick auf die Stage fokussiert sie, `tabIndex=0`) oder im Vollbild – so bewegen sich nie zwei Szenen gleichzeitig, und Leertaste scrollt sonst normal.
- Vollbild: Fullscreen-API auf das Stage-Element; im Vollbild skaliert die Bühne auf die Bildschirmhöhe, Beschriftung größer. Wo die API fehlt (iPhone-Safari), wird der Button ausgeblendet.
- Barrierefreiheit: Beschriftung in einer `aria-live="polite"`-Region; Buttons mit deutschen `aria-label`; sichtbarer Fokus.
- `MotionConfig reducedMotion="user"`: Bei „Bewegung reduzieren“ nur Überblendungen.

### Kontextfenster – Darstellung

Ein querliegender Rahmen = das Fenster (Kapazität fest 100 Einheiten). Blöcke liegen nebeneinander, Breite proportional zur Größe, Farbe nach Art:

| Art | Farbe (Token) | Beispiele |
|---|---|---|
| `fest` – wird bei jedem Start geladen | `--purple` | Systemregeln, `CLAUDE.md`, später `ENTSCHEIDUNGEN.md` |
| `auftrag` | `--accent` | Ihr Prompt |
| `datei` | `--green` | gelesene Dateien |
| `werkzeug` | `--yellow` | Build-Ausgabe, Fehlerlog |
| `verlauf` | `--blue` | Nachrichten hin und her |
| `zusammenfassung` | `--muted` | Ergebnis von Compact |

Über dem Rahmen ein Füllstand („46 % belegt“), ab 80 % in `--yellow`, ab 95 % in `--accent`. Blöcke im Zustand `verblasst` haben reduzierte Deckkraft. Ein- und Austritte animiert (`AnimatePresence`, `layout`). Auf schmalen Bildschirmen werden Beschriftungen kleiner Blöcke ausgeblendet (Titel im `title`-Attribut).

### Schritte und Beschriftungen

Füllstände sind didaktisch gewählt, keine echten Token-Zahlen.

| # | Bild | Füllstand | Beschriftung |
|---|---|---|---|
| 1 | Leerer Rahmen; Systemregeln und `CLAUDE.md` gleiten hinein | 14 % | **Jede Session beginnt gleich.** Bevor Sie etwas schreiben, liegen schon die Systemregeln und Ihre `CLAUDE.md` im Kontextfenster – dem Arbeitsgedächtnis des Modells. Alles wird in Tokens gemessen, Wortbausteinen von etwa drei bis vier Zeichen. |
| 2 | Auftrag kommt hinzu | 18 % | **Ihr Auftrag.** „Füge auf der Event-Seite einen RSVP-Button hinzu – nur für angemeldete Nutzer*innen.“ Die Einschränkung am Ende ist eine Absprache, auf die es später ankommt. |
| 3 | Vier Dateien fließen nacheinander hinein | 46 % | **Claude liest.** Um den Auftrag zu verstehen, öffnet der Agent die relevanten Dateien. Jede gelesene Datei belegt Platz – deshalb lohnt es sich, gezielt auf die betroffenen Stellen zu verweisen. |
| 4 | Build-Ausgabe und ein großer Fehlerlog | 74 % | **Werkzeuge liefern Ergebnisse.** Build-Ausgaben und Fehlermeldungen landen ebenfalls im Kontext. Ein vollständiges Log mit 400 Zeilen verdrängt mehr, als es nützt; die entscheidenden fünf Zeilen genügen. |
| 5 | Verlaufsblöcke kommen hinzu; die frühen Blöcke (Auftrag, erste Dateien) verblassen | 92 % | **Je voller, desto unschärfer.** Das Modell gewichtet nicht alles gleich. In einem vollen Kontext werden frühe Details – etwa Ihre Einschränkung aus Schritt 2 – leichter übersehen. Die Antworten werden ungenauer, bevor das Fenster überhaupt voll ist. |
| 6 | Grenze erreicht → Auto-Compact: Auftrag, Dateien, Werkzeug- und Verlaufsblöcke schrumpfen zu einem Block „Zusammenfassung“; die Absprache erscheint dort nicht mehr | 30 % | **Auto-Compact.** Kurz vor der Grenze fasst Claude Code den bisherigen Verlauf automatisch zusammen. Das schafft Platz, kostet aber Detail: Ob „nur für angemeldete Nutzer*innen“ die Zusammenfassung überlebt, ist nicht garantiert. Mit `/compact` lösen Sie das selbst aus – und können sagen, was erhalten bleiben soll. |
| 7 | `/clear`: alles außer den festen Blöcken fliegt hinaus | 14 % | **`/clear` – neue Session.** Nach einer abgeschlossenen Story ist ein leerer Kontext der beste Start: schnell, präzise, ohne Altlasten. Was nur im Chat stand, ist damit allerdings weg. |
| 8 | `ENTSCHEIDUNGEN.md` gleitet zu den festen Blöcken; Hinweis „wird bei jedem Start geladen“ | 18 % | **Dauerhaftes gehört in Dateien.** Entscheidungen, die über eine Session hinaus gelten, halten Sie in `CLAUDE.md` oder `docs/ENTSCHEIDUNGEN.md` fest. Was dort steht, ist in jeder neuen Session wieder da – was nur im Chat stand, nicht. |

### Anpassungen am umgebenden Text

- Karte „Es hat ein Gedächtnis mit Rand“: „Ist es voll, fällt Älteres raus.“ → „Wird es voll, fasst Claude Code den Verlauf zusammen – Details können dabei verloren gehen.“
- Der Absatz mit den drei Regeln unter dem Widget bleibt.
- Weitere sprachliche Änderungen auf dieser Seite kommen aus dem separaten Sprach-Review, nicht aus diesem Sub-Projekt.

## Nicht im Umfang

- Freies Ausprobieren (Buttons „+ Dateien“, „+ Nachrichten“ wie im alten Widget) – die Schrittfolge deckt `/compact` und `/clear` ab.
- Echte Token-Zahlen oder modellabhängige Kapazitäten.
- Die vier Ausblick-Szenen (Sub-Projekt 2, nutzt `Stage` wieder).

## Tests und Prüfung

- **Unit (vitest)** für `blocksAt`: Füllstand je Schritt wie in der Tabelle; feste Blöcke sind in allen Schritten vorhanden; Schritt 6 enthält keinen `auftrag`-Block mehr, aber genau einen `zusammenfassung`-Block; Schritt 7 enthält nur feste Blöcke; Schritt 8 enthält `ENTSCHEIDUNGEN.md` als festen Block. Bindung des Tests wird durch gezieltes Brechen (Mutation) nachgewiesen.
- **Build** grün (`npm run build`), keine Konsolenfehler.
- **Browser** (Produktions-Build via `astro preview`, Chrome DevTools): alle 8 Schritte per Pfeiltaste und per Button; Leertaste scrollt die Seite, solange die Stage nicht fokussiert ist; Light und Dark; Breite 390 px ohne horizontales Scrollen; Vollbild; `prefers-reduced-motion: reduce` emuliert → keine Bewegung, nur Überblendung; Ausgangsbild sichtbar bei deaktiviertem JavaScript.
- Screenshot-Abnahme durch Markus vor dem Merge.
