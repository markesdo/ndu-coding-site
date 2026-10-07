# NDU Coding 2026 — Kurs-Website

Statische Website (Astro) für den Kurs „Programmieren mit AI“, MSc Management by Innovation, NDU.

## Lokal

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # Ausgabe in dist/
```

## Deploy auf Vercel

1. Repo auf GitHub pushen.
2. vercel.com → Add New → Project → Repo importieren. Framework „Astro“ wird erkannt.
3. Deploy. Fertig – jeder Push auf `main` deployt neu.

## Struktur

- `src/pages/` — eine Datei = eine Seite (`tag-1.astro` → `/tag-1`)
- `src/pages/konzepte/` — Konzeptseiten
- `src/components/` — `Prompt` (Copy-Button), `Checklist` (Fortschritt im Browser), `Block` (Ablauf), `Callout`, `FooterNav`
- `src/layouts/Layout.astro` — Navigation (dort neue Seiten eintragen)
- `src/styles/global.css` — Design-Tokens, Light/Dark

## Im Kurs am Beamer

- `?beamer` (oder Taste `B`): größere Schrift, ohne Seitenleiste; `?beamer=0` schaltet aus.
- `/start`: Startseite vor dem Login, öffentlich (ohne Kurspasswort). Eine Animation baut den Titel auf, danach führt „Weiter“ (Klick, Enter, Leertaste oder →) zur Übersicht – ohne Anmeldung über das Kurspasswort. Nie automatisch weiter.
- Nach NDU Live am Beamer: `/start?beamer` – „Weiter“ bleibt im Beamer-Modus (`/?beamer`).
- Die Animation „Der Cursor läuft“ (`src/components/auftakt-start.ts`, GSAP mit SplitText – nur auf dieser Seite geladen): Ein Auftrag wird getippt, seine Buchstaben fliegen in den Titel, ein Druckkopf schreibt Einleitung und Tage, dann wartet „› weiter“. Jede Taste oder jeder Klick springt ans Ende. Zeiten und Regeln stehen als reine Funktionen in `src/components/auftakt-zeitplan.ts` (mit Tests); der Endzustand ist statisches HTML in `src/pages/start.astro`.

## Inhalte ändern

Alles ist HTML in `.astro`-Dateien – Claude Code kann sie direkt bearbeiten. Prompts für Studierende immer als `<Prompt>`-Komponente, damit der Copy-Button da ist.
