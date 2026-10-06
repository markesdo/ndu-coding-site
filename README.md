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
- `/start`: Startseite vor dem Login, öffentlich (ohne Kurspasswort). Eine Animation baut den Titel auf, danach führt „Weiter“ (Klick, Enter, Leertaste oder →) zu Tag 1 – ohne Anmeldung über das Kurspasswort. Nie automatisch weiter.
- Nach NDU Live am Beamer: `/start?beamer` – „Weiter“ bleibt im Beamer-Modus (`/tag-1?beamer`).
- Die Animation ist austauschbar: Sie bespielt nur `#auftakt-buehne` in `src/pages/start.astro` (Skript `src/components/auftakt.ts`); der Endzustand ist statisches HTML.

## Inhalte ändern

Alles ist HTML in `.astro`-Dateien – Claude Code kann sie direkt bearbeiten. Prompts für Studierende immer als `<Prompt>`-Komponente, damit der Copy-Button da ist.
