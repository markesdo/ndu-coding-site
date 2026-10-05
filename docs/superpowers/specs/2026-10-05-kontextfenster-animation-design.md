# Kontextfenster-Animation (Sub-Projekt 1 der animierten Konzeptseiten)

Stand: 5.10.2026, überarbeitet nach Review · Branch `kontextfenster-animation` (gestapelt auf `sprache-und-termine` → `astro-7`)

## Ziel

Am Do 8.10., 13:00 (Konzept 2, Tag 1) erklärt Markus am Beamer, was mit dem Kontextfenster eines Coding-Agenten passiert – Schritt für Schritt, per Pfeiltaste. Danach bleibt die Animation auf `/konzepte/coding-agent` zum Nachlesen.

Die Animation ersetzt das bestehende Klick-Widget `#ctx` (Balken, der sich sprunghaft füllt). Der umgebende Text bleibt.

Erfolgskriterien:
- Jeder der 9 Schritte ist am Beamer in rund zehn Sekunden erfassbar (Beschriftung + Bild).
- Aussage fachlich korrekt für Claude Code 2026: Auto-Compact statt „Älteres fällt still raus“; automatisch geladen wird nur `CLAUDE.md` samt `@`-Verweisen.
- Funktioniert in Light/Dark, auf dem Handy (≤ 900 px, getestet bei 390 px) und im Vollbild; mit „Bewegung reduzieren“ ohne Bewegung.

Zielgruppe der Texte: Master-Studierende ohne Programmiererfahrung – klar, präzise, nicht vereinfacht-kindlich. Anrede „Sie“.

## Abhängigkeit (anderes Repo)

Das Template `ndu-coding-2026` muss in seiner `CLAUDE.md` die Zeile `@docs/ENTSCHEIDUNGEN.md` bekommen. Erst dann stimmt Schritt 9 – und der bestehende Satz auf der Seite („was in `CLAUDE.md` oder `docs/ENTSCHEIDUNGEN.md` steht, ist in jeder Session wieder da“). Das passiert im nächsten Template-Commit (zusammen mit den Supabase-Key-Namen), muss vor Do 8.10., 09:00 auf `main` des Templates sein und ist nicht Teil dieses Branches.

## Architektur

React-Island in Astro, Animation mit Motion.

| Datei | Zweck |
|---|---|
| `src/components/sota/Stage.tsx` | Wiederverwendbarer Rahmen für alle Schritt-Animationen (auch die vier Ausblick-Szenen in Sub-Projekt 2): Titel, Bühne, Beschriftung, Steuerung. |
| `src/components/sota/Kontextfenster.tsx` | Die Szene: zeichnet das Fenster für den aktuellen Schritt. |
| `src/components/sota/kontextfenster-steps.ts` | Reine Daten/Logik ohne React: Beschriftungen, `blocksAt(step)`, `preludeAt(step)`, `fillOf(blocks)`. Unit-testbar. |
| `src/components/sota/kontextfenster-steps.test.ts` | Vitest-Tests der Logik. |
| `src/components/sota/stage.css` | Styles für Stage und Szene, ausschließlich mit den Tokens aus `global.css`. |

Abhängigkeiten (neu): `@astrojs/react@^7`, `react@^19`, `react-dom@^19`, `motion@^14`; Dev: `@types/react`, `@types/react-dom`, `vitest`. `astro.config.mjs` bekommt `integrations: [react()]`. `tsconfig.json` braucht `"jsx": "react-jsx"` und `"jsxImportSource": "react"` (die Astro-Basis setzt `preserve`). Vitest läuft ohne eigene Konfiguration (`vitest run`), ohne `getViteConfig` – die getestete Datei importiert nichts aus Astro. Neues Script: `"test": "vitest run"`.

Einbindung: In `coding-agent.astro` ersetzt `<Kontextfenster client:visible />` den Block `<div class="widget" id="ctx">…</div>`. Die nicht mehr genutzten `.ctx-*`-Styles in `global.css` werden entfernt.

### Server-Rendering und Hydration

- Astro rendert die Island auf dem Server. Schritt 1 muss ohne JavaScript vollständig sichtbar sein. Deshalb: **keine Eintrittsanimation beim ersten Rendern** – `AnimatePresence initial={false}`, Blöcke von Schritt 1 ohne `initial`-Werte. Animationen beginnen ab dem ersten Schrittwechsel.
- Alles, was vom Browser abhängt (Vollbild verfügbar?, `prefers-reduced-motion`), wird erst nach dem Mounten in einem `useEffect` ermittelt. Beim Server-Rendern und beim ersten Client-Rendern gilt derselbe Ausgangszustand (Vollbild-Button sichtbar). So entsteht keine Hydration-Warnung.

### Stage – Verhalten

- Props: `title`, `steps: { caption: ReactNode; plain: string }[]` (`plain` = Beschriftung als reiner Text für Screenreader), `children: (step: number, direction: 1 | -1) => ReactNode`.
- Steuerung: Buttons „Zurück“, „Weiter“, „Von vorn“, „Vollbild“; Anzeige „3 / 9“. „Zurück“ ist auf Schritt 1, „Weiter“ auf dem letzten Schritt deaktiviert.
- Tastatur: ← / → / Leertaste / Pos1 werden **nur** verarbeitet, wenn das Ereignis auf dem Stage-Element selbst ausgelöst wird (`e.target === e.currentTarget`). Ein Fokus auf einem Button bleibt Sache des Buttons – so löst Leertaste nach einem Klick auf „Weiter“ genau einen Schritt aus. Ein Klick auf die Bühne fokussiert die Stage (`tabIndex=0`), die Buttons geben nach dem Klick den Fokus an die Stage zurück. Außerhalb der Stage scrollt die Leertaste die Seite wie gewohnt.
- Vollbild: Fullscreen-API auf das Stage-Element, danach `stage.focus()`, damit Pfeiltasten sofort wirken. Im Vollbild: `.stage:fullscreen { background: var(--bg); color: var(--fg); }`, Bühne skaliert auf die Bildschirmhöhe, Beschriftung größer. Ist `document.fullscreenEnabled` falsch (iPhone-Safari), wird der Button nach dem Mounten ausgeblendet.
- Barrierefreiheit: Eine visuell versteckte `<p aria-live="polite">` enthält `plain` des aktuellen Schritts; die animierte, sichtbare Beschriftung ist `aria-hidden`. So wird beim Überblenden nicht doppelt vorgelesen. Buttons mit deutschen `aria-label`, sichtbarer Fokusring.
- Bewegung reduzieren: `useReducedMotion()`; ist sie aktiv, sind alle Übergangsdauern 0 (auch Breiten, nicht nur Transformationen), Beschriftungen wechseln ohne Animation.

### Kontextfenster – Darstellung

Ein querliegender Rahmen = das Fenster (Kapazität fest 100 Einheiten). Blöcke liegen nebeneinander. Jeder Block hat eine feste ID (für `AnimatePresence`) und `flex: none`; seine Breite wird direkt animiert (`animate={{ width: size + '%' }}`, `exit={{ width: 0, opacity: 0 }}`, `overflow: hidden`). Kein Motion-`layout` – das verzerrt Text bei Breitenänderungen.

| Art | Hintergrund (Token) | Beispiele |
|---|---|---|
| `fest` – wird bei jedem Start geladen | `--purple` | Systemregeln, `CLAUDE.md`, ab Schritt 9 `ENTSCHEIDUNGEN.md` |
| `auftrag` | `--accent` | Ihr Prompt mit der Absprache |
| `datei` | `--green` | gelesene Dateien |
| `werkzeug` | `--yellow` | Build-Ausgabe, Fehlerlog |
| `verlauf` | `--blue` | Nachrichten hin und her |
| `zusammenfassung` | `--muted` | Ergebnis von Compact |

Kontrastregel für Blockbeschriftungen: Light-Theme – Beschriftung `#fff` auf den kräftigen Light-Tokens. Dark-Theme – die Dark-Tokens sind hell, daher Beschriftung `var(--bg)` (fast schwarz). Umgesetzt als eigene Variable `--block-ink` in `stage.css` mit Dark-Override nach dem Muster von `global.css` (`prefers-color-scheme` + `[data-theme]`).

Über dem Rahmen ein Füllstand („46 % belegt“): unter 80 % neutral, ab 80 % `--yellow`, ab 95 % `--accent`. Darunter klein: „Gemessen in Tokens – etwa 3–4 Zeichen pro Token.“ Blöcke im Zustand `verblasst` haben 35 % Deckkraft. Auf schmalen Bildschirmen werden Beschriftungen von Blöcken unter 8 Einheiten ausgeblendet (Titel bleibt im `title`-Attribut).

### Auftakt-Phase (nur Schritt 6)

Schritt 6 zeigt zwei Zustände nacheinander: Erst kommt ein weiterer Verlaufsblock hinzu (96 %, rot), nach 900 ms verdichtet Auto-Compact auf 30 %. `preludeAt(6)` liefert den Zwischenzustand, `blocksAt(6)` den Endzustand; für alle anderen Schritte ist `preludeAt` `null`. Der Auftakt läuft nur beim Vorwärtsgehen auf Schritt 6 und nicht bei reduzierter Bewegung; beim Zurückgehen oder Springen erscheint direkt der Endzustand.

### Schritte und Beschriftungen

Füllstände sind didaktisch gewählt, keine echten Token-Zahlen. Blockgrößen: Systemregeln 6, `CLAUDE.md` 8, Auftrag 4, je Datei 7, Build-Ausgabe 6, Fehlerlog 22, Verlauf 8 und 14, Zusammenfassung 16, `ENTSCHEIDUNGEN.md` 4.

| # | Bild | Füllstand | Beschriftung |
|---|---|---|---|
| 1 | Systemregeln und `CLAUDE.md` liegen im Rahmen (statisch, keine Eintrittsanimation) | 14 % | **Jede Session beginnt gleich.** Bevor Sie etwas schreiben, liegen schon die Systemregeln und Ihre `CLAUDE.md` im Kontextfenster – dem Arbeitsgedächtnis des Modells. |
| 2 | Auftrag kommt hinzu | 18 % | **Ihr Auftrag.** „Füge auf der Event-Seite einen RSVP-Button hinzu – nur für angemeldete Nutzer*innen.“ Die Einschränkung am Ende ist eine Absprache, auf die es später ankommt. |
| 3 | Vier Dateien fließen nacheinander hinein | 46 % | **Claude liest.** Um den Auftrag zu verstehen, öffnet der Agent die relevanten Dateien. Jede gelesene Datei belegt Platz – deshalb lohnt es sich, gezielt auf die betroffenen Stellen zu verweisen. |
| 4 | Build-Ausgabe und ein großer Fehlerlog | 74 % | **Werkzeuge liefern Ergebnisse.** Build-Ausgaben und Fehlermeldungen landen ebenfalls im Kontext. Ein vollständiges Log mit 400 Zeilen verdrängt mehr, als es nützt; die entscheidenden fünf Zeilen genügen. |
| 5 | Ein Verlaufsblock kommt hinzu; Auftrag und die ersten beiden Dateien verblassen | 82 % | **Je voller, desto unschärfer.** Das Modell gewichtet nicht alles gleich. Je mehr im Fenster liegt, desto leichter gehen frühe Details unter – etwa Ihre Einschränkung aus Schritt 2. Die Antworten werden ungenauer, lange bevor das Fenster voll ist. |
| 6 | Auftakt: weiterer Verlaufsblock, 96 %. Dann schrumpfen Auftrag, Dateien, Werkzeug- und Verlaufsblöcke zu einem Block „Zusammenfassung“; der Auftrag ist nicht mehr da | 96 % → 30 % | **Auto-Compact.** Kurz vor der Grenze fasst Claude Code den Verlauf automatisch zusammen. Das schafft Platz, kostet aber Detail – was nicht in der Zusammenfassung steht, ist weg. Hier: Ihre Einschränkung aus Schritt 2. |
| 7 | Gleicher Zustand wie 6, aber der Auftrag sitzt als eigener Block neben der Zusammenfassung, Etikett „bleibt“ | 34 % | **Besser: selbst verdichten.** Mit `/compact` lösen Sie die Zusammenfassung rechtzeitig selbst aus und sagen, was bleiben muss: `/compact Behalte: nur für angemeldete Nutzer*innen`. Dann übersteht die Absprache die Verdichtung. |
| 8 | `/clear`: alles außer den festen Blöcken fliegt hinaus | 14 % | **`/clear` – neue Session.** Nach einer abgeschlossenen Story ist ein leerer Kontext der beste Start: schnell, präzise, ohne Altlasten. Was nur im Chat stand, ist damit allerdings weg. |
| 9 | `ENTSCHEIDUNGEN.md` dockt rechts an `CLAUDE.md` an, Etikett „in CLAUDE.md verknüpft“ | 18 % | **Dauerhaftes gehört in Dateien.** Entscheidungen, die über eine Session hinaus gelten, halten Sie in `docs/ENTSCHEIDUNGEN.md` fest. Im Kursprojekt ist die Datei in `CLAUDE.md` verknüpft und wird deshalb bei jedem Start geladen. Was nur im Chat stand, ist in der nächsten Session weg. |

### Anpassungen am umgebenden Text

- Karte „Es hat ein Gedächtnis mit Rand“: „Ist es voll, fällt Älteres raus.“ → „Wird es voll, fasst Claude Code den Verlauf zusammen – Details können dabei verloren gehen.“
- Hinweistext über der Animation: „Klicken Sie auf die Animation und blättern Sie mit den Pfeiltasten – oder nutzen Sie die Buttons.“
- Der Absatz mit den drei Regeln unter dem Widget bleibt (stimmt, sobald das Template `@docs/ENTSCHEIDUNGEN.md` verknüpft).

## Nicht im Umfang

- Freies Ausprobieren (Buttons „+ Dateien“, „+ Nachrichten“ wie im alten Widget).
- Echte Token-Zahlen oder modellabhängige Kapazitäten; das Kürzen alter Werkzeug-Ergebnisse vor der eigentlichen Verdichtung (bewusste Vereinfachung).
- Die Template-Änderung selbst (eigener Commit im Template-Repo, siehe Abhängigkeit).
- Die vier Ausblick-Szenen (Sub-Projekt 2, nutzt `Stage` wieder).

## Tests und Prüfung

**Unit (Vitest)** für `kontextfenster-steps.ts`:
- Füllstand je Schritt genau wie in der Tabelle (14, 18, 46, 74, 82, 30, 34, 14, 18) und `preludeAt(6)` = 96.
- In keinem Schritt und keinem Auftakt übersteigt die Summe der Blockgrößen 100.
- Systemregeln und `CLAUDE.md` sind in jedem Schritt vorhanden.
- Schritt 5: Auftrag und die ersten zwei Dateien sind `verblasst`, die übrigen nicht.
- Schritt 6: kein `auftrag`-Block, genau ein `zusammenfassung`-Block.
- Schritt 7: genau ein `auftrag`- und ein `zusammenfassung`-Block.
- Schritt 8: nur `fest`-Blöcke.
- Schritt 9: `ENTSCHEIDUNGEN.md` ist ein `fest`-Block.
- Block-IDs sind innerhalb eines Schritts eindeutig.
- Bindung nachweisen: nach dem Commit gezielt brechen (z. B. Auftrag in Schritt 6 belassen), Test muss an einer Assertion rot werden, zurücksetzen, grün.

**Build:** `npm run build` grün.

**Browser** (Produktions-Build via `astro preview`, Chrome DevTools), plus einmal `astro dev` für Hydration:
- Alle 9 Schritte per Pfeiltaste und per Button vorwärts und rückwärts; Auftakt in Schritt 6 nur vorwärts sichtbar.
- „Weiter“ anklicken, dann Leertaste → genau ein Schritt weiter.
- Klick außerhalb der Stage → Pfeiltasten tun nichts, Leertaste scrollt die Seite.
- Light und Dark, Blockbeschriftungen lesbar.
- Breite 390 px ohne horizontales Scrollen.
- Vollbild: Hintergrund `--bg`, Pfeiltasten wirken ohne Klick.
- `prefers-reduced-motion: reduce` emuliert → keine Bewegung, kein Auftakt.
- JavaScript deaktiviert → Schritt 1 vollständig sichtbar.
- `astro dev`: keine Hydration-Warnung in der Konsole.
- Screenshot-Abnahme durch Markus vor dem Merge.
