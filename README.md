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

- `?beamer` (oder Taste `B`): größere Schrift, ohne Seitenleiste; `?beamer=0` schaltet aus. Den Beamer-Modus gibt es nur beim Präsentator (auf diesem Browser angemeldet auf `/praesentator`): Knöpfe, Taste `B`, `?beamer` und das Merken der Wahl. Bei allen anderen wird `?beamer` ignoriert und ein gespeicherter Beamer-Modus beim nächsten Laden gelöscht. Regel: `src/components/BeamerStart.astro`.
- `/start`: Startseite vor dem Login, öffentlich (ohne Kurspasswort), mit der Kurswahl: Programmieren mit AI (`/`) und Innolab (`/innolab`). Das Innolab ist ausgegraut bis zum ersten Innolab-Tag (16.10., Wiener Zeit; `src/lib/kurswahl.ts`). Wer ohne Anmeldung `/` aufruft, landet hier; vom gewählten Kurs geht es über das Kurspasswort weiter.
- Nach NDU Live am Beamer: `/start?beamer` – die Kurs-Links bleiben im Beamer-Modus (`/?beamer`, `/innolab?beamer`). Vorher einmal auf `/praesentator` anmelden.
- **„Wo ist Markus?“:** Studierende sehen unten rechts „Markus ist bei: Tag 1 · Übung 1 b“ und springen per Klick dorthin (nie automatisch). Gemeldet wird vom Beamer-Tab: Seite und Abschnitt unter der Lesezeile, bei offener Screenshot-Präsentation der Schritt; bei Änderung nach 1,5 s, sonst jede Minute. Studierende fragen alle 2 s (ohne frische Position alle 15 s). Nach 2 min ohne Signal „· vor N min“, nach 30 min weg.
  - Anmelden am Präsentator-Rechner auf `/praesentator` (nicht im Menü) mit dem `PRESENTER_KEY`; der Browser merkt ihn sich, Abmelden auf derselben Seite. Gemeldet wird nur im Beamer-Modus. Der Schalter „Live“ neben „Beamer“ zeigt den Zustand (Punkt gefüllt = sendet, hohl = Pause oder kein Beamer-Modus, gelb = letzte Meldung gescheitert); Klick pausiert und löscht die Position, sodass der Knopf bei den Studierenden verschwindet.
  - Vercel-Variable `PRESENTER_KEY` (Sensitive). Ohne sie nimmt `/api/position` nichts an. Speicher: Vercel Runtime Cache (flüchtig, kein Datenbank-Setup). Code: `api/position.ts`, `src/components/wo-ist.ts`.

## Inhalte ändern

Alles ist HTML in `.astro`-Dateien – Claude Code kann sie direkt bearbeiten. Prompts für Studierende immer als `<Prompt>`-Komponente, damit der Copy-Button da ist.
