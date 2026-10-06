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
- `?intro`: spielt den Auftakt der Übersicht noch einmal ab (der getippte Auftrag, aus dem die Seite entsteht). Ohne `?intro` läuft er nur beim ersten Besuch.
- Eröffnungsfolie nach NDU Live: `/?beamer&intro` – der Titel steht dann in der Mitte des Bildschirms.

## Inhalte ändern

Alles ist HTML in `.astro`-Dateien – Claude Code kann sie direkt bearbeiten. Prompts für Studierende immer als `<Prompt>`-Komponente, damit der Copy-Button da ist.
