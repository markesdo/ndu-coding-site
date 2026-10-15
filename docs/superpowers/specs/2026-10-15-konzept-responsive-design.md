# Konzept „Responsive Design“ – Spec

Stand 15.10.2026. Abgestimmt mit Markus nach einem Opus-Consult (mobile first, Breakpoints als Vokabular, eigene Seite).

## Ziel

Studierende ohne Technik-Hintergrund verstehen, **warum** sie bei 375 px prüfen, **mit welchen Wörtern** sie Claude sagen, was an welcher Breite passieren soll, und dass die Reihenfolge am Handy eine **Produktentscheidung** ist. Responsive wird an 5+ Stellen verlangt (Qualität 1b, `HANDY_PROMPT`, Backlog-Kriterien, Zwischenwoche-Redesign, Tag 1), aber nirgends erklärt.

Nicht im Umfang: Container Queries, CSS-Details jenseits der Tailwind-Präfixe, Geräte-Mockups in 3D, eine eigene Grafik „Geräte-Reihe“.

## Seite `/konzepte/responsive`

Eyebrow „Ergänzung zu Konzept 7 · zum Nachschlagen“. Im Menü nach „Design-System“. FooterNav: ← Qualität 1b (`/konzepte/qualitaet#ui-schleife`), → Design-System. Ein Rücklink in Qualität 1b.

1. **Auf einen Blick** (`Wichtigste`): Claude sieht keinen Bildschirm · zuerst 375 · am Handy entscheidet die Reihenfolge.
2. **Warum** – Claude baut für einen ausgedachten Laptop; der stille Fehler; Reihenfolge = Priorisierung. 375 sind CSS-Pixel, echte Handys 390–430: 375 ist bewusst die strenge Probe.
3. **Eine App, jede Breite** – Animation (unten).
4. **Die Wörter für den Prompt** – Tabelle Wort | heißt | so sagt ihr es Claude (Viewport, Breakpoint, mobile first, „ab 768 px“, maximale Breite, Tap-Ziel 44 px als Kursregel – WCAG AA verlangt 24, AAA 44 –, waagrechtes Scrollen). Ein Prompt, der das Vokabular anwendet.
5. **Vier typische Bruchstellen** – statische Mini-Mocks vorher/nachher (langes Kompositum „Ausleihbestätigung“, zu kleines Tap-Ziel, breite Tabelle, umbrechender Header), je ein Satz zur Lösung. Darunter je eine Zeile: Tabelle → Spalten weglassen oder Karten (Produktentscheidung), Bilder mit festem Seitenverhältnis, Tastatur verdeckt das halbe Formular.
6. **Prüfen** – zwei Sätze, Links auf Qualität 1b (`HANDY_PROMPT`) und `setup#devtools`.
7. **Im Innolab: Figma-Frames sind Stichproben** – die 900-px-Frage; ins Issue gehört die Reihenfolge am Handy und was zwischen den Frames passiert. Link `design-system#uebergabe`.

## Animation „Eine App, jede Breite“

Muster wie `EinWertVieleStellen`: `breite-steps.ts` (Daten + Logik, ohne React, getestet) + `EineAppJedeBreite.tsx` (Szene in `Stage`), CSS in `stage.css` mit Präfix `rb-`.

**Szene:** oben ein Lineal 0–1440 px mit Marken bei 640/768/1024/1280 (`sm md lg xl`), Bereich links von 640 beschriftet „ohne Präfix: gilt überall“; aktive Marken (≤ Breite) hervorgehoben. Darunter ein Rahmen, dessen Breite proportional zur simulierten Breite ist (`w / 1440` der Szene), darin eine Leihbar-Drahtgitter-App: Kopf (Marke + Menü-Knopf oder volle Navigation), Suche, Karten im Raster. Die Mini-App bleibt hell wie in `dt-app`. Optional ein Code-Feld mit drei Zeilen, deren gerade gültige Klasse markiert ist.

**Layout-Regeln (wie Tailwind, min-width):** Spalten 1 / `md:` 2 ab 768 / `lg:` 3 ab 1024; volle Navigation ab 1024, darunter Menü-Knopf; Inhalt höchstens 1024 px (`max-w-5xl` wie im Leihbar-Template), darüber wächst nur der Rand.

**Schritte:**
1. 375 – eine Spalte, nummerierte Reihenfolge, Frage „Was steht oben?“. Kein Code.
2. 600 – alles fließt, Karten werden breiter. Kein Code.
3. 768 – zwei Spalten, `md:grid-cols-2` markiert.
4. 1024 – drei Spalten, volle Navigation.
5. 1440 – Inhalt bleibt bei 1024, Rand wächst, `max-w-5xl` markiert.
6. 375 – Fehler: Hinweis-Box `w-[600px]` ragt hinaus, waagrechtes Scrollen; Lösung `w-full max-w-[600px]`.
7. 900 – Figma-Frames bei 375 und 1440 auf dem Lineal, 900 dazwischen: „Wer hat das entschieden?“
8. Freies Spiel – Schieberegler 320–1440 (natives `input type=range`, Tastatur inklusive), Code sichtbar.

Bewegung: Breite per CSS-Transition, bei `prefers-reduced-motion` ohne (Stage liefert `reduced`).

## Bruchstellen

`Bruchstellen.astro`, reines HTML/CSS, je Karte zwei Mini-Rahmen „vorher“/„nachher“. Das Kompositum nutzt echtes `hyphens: auto` mit `lang="de"` im Nachher.

## Tests

- `breite-steps.test.ts`: Schwellen (767 → 1, 768 → 2, 1023 → 2, 1024 → 3 Spalten; Navigation ab 1024), Inhaltsbreite gedeckelt, Fehler-Schritt ragt über den Rahmen, Schrittbreiten 375/600/768/1024/1440/375/900, aktive Klassen je Schritt, 8 Schritte mit Titel und Text.
- `konzept-kette.test.ts`: neue Zeile für `responsive`.
- Bindung per Mutation (Schwelle verschieben → Test rot).
- `npm test`, `npm run build`, Ansicht im Dev-Server bei 375 und 1280.
