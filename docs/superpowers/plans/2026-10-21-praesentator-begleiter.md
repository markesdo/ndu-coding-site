# Präsentator-Begleiter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eine Seite `/innolab/begleiter`, die dem Beamer folgt und zu jeder Tag-1-Folie Stichworte (live) und Vorbereitungsmaterial zeigt.

**Architecture:** Die Folienliste des Tages entsteht beim Bauen aus den Seitenquellen (`<Folie>` mit `<h2 id>`). Notizen liegen als TS-Daten je Seite in `src/data/begleiter/`. Die Seite rendert alle Folien mit Notizen statisch (versteckt) und ein Client-Skript zeigt die passende – aus der Position von `GET /api/position` oder von Hand geblättert.

**Tech Stack:** Astro 7 (static), TypeScript, Vitest, vorhandene Position-API.

**Spec:** `docs/superpowers/specs/2026-10-21-praesentator-begleiter-design.md`

## Global Constraints
- Deutsch; der Begleiter spricht Markus an. Keine Emojis (Lucide-Icons). Keine Anekdoten über Markus' eigene Konten.
- Quelle treu: Seitenzahl = gedruckte Seite (EPUB: Kapitel + Abschnitt); wörtliche Zitate im Original geprüft; nichts erfinden.
- Zusatzfälle nur echte, nachprüfbare Fälle mit Quelle, Kennzeichnung exakt „Zusatz, nicht aus den Kursquellen“; nur wo ein guter Fall existiert.
- Kaffeebar-Beispiele nur mit IDs, die in `src/werkstatt/beispiele/*.json` existieren und genau das sagen.
- Tag-Reihenfolge: `/innolab/tag-1` → `/innolab/methoden/problem-rahmen` → `/innolab/methoden/entscheidungslog` → `/innolab/methoden/annahmen` → `/innolab/methoden/interview` → `/innolab/tag-1/abschluss`.
- Kein neues Backend. Board-Schlüssel nie ins Repo. Keine rohen U+2028/U+2029.
- Gates je PR: `npm test`, `npm run build`; Git/gh wie im Handover (`GH_TOKEN=$(gh auth token --user markesdo)` je Befehl, Attribution-Zeilen, nicht mergen).

## Review Focus
1. Beamer meldet einen Unter-Anker (h3-id einer Übung, z. B. `uebung-1-c`) → Begleiter zeigt die umschließende Folie. Test in Task 1 (`folieZu` mit Unter-Anker).
2. Beamer meldet `anker: ''` oder eine Seite außerhalb von Tag 1 (`/innolab/tag-3`) → „Beamer ist nicht auf Tag 1“ mit Titel aus der Position, kein Absturz. Test in Task 1.
3. API nicht erreichbar / Timeout → Anzeige „Keine Verbindung zum Beamer“, letzte Folie bleibt stehen, Folgen läuft weiter. Test in Task 2 (reine Funktion `anzeige()`).
4. Markus blättert von Hand → Folgen pausiert, bis er „Dem Beamer folgen“ drückt; eine neue Beamer-Position springt währenddessen NICHT um. Test in Task 2.
5. Notiz zeigt auf eine Folien-id, die es (nach Umbenennen) nicht mehr gibt → Test rot. Test in Task 1 (`notizenOhneFolie`).

---

### Task 1: Folienliste und Zuordnung

**Files:**
- Create: `src/lib/begleiter.ts`, `src/lib/begleiter.test.ts`
- Create: `src/data/begleiter/typen.ts` (Typ `Notiz`), `src/data/begleiter/index.ts` (sammelt alle Notizen, anfangs leere Records je Seite)

**Interfaces:**
- Produces:
  - `type Notiz = { live: string[]; ueberleitung?: string; uebung?: { dauer?: string; form?: string }; kern?: { text: string; quelle: string }[]; geschichte?: { text: string; quelle: string }; zusatz?: { titel: string; text: string; quelle: string }[]; fragen?: { frage: string; antwort: string }[]; ablauf?: { schritte?: string[]; achten?: string[]; fehler?: string[]; aufloesung?: string } }` in `typen.ts`.
  - `NOTIZEN: Record<string /* pfad */, Record<string /* h2-id */, Notiz>>` in `index.ts`.
  - `type Folie = { pfad: string; id: string; titel: string; unterIds: string[] }`.
  - `TAG_1_SEITEN: string[]` (Reihenfolge aus Global Constraints).
  - `folienAus(pfad: string, quelle: string): Folie[]` – je `<Folie …>…</Folie>` die `h2 id`, Titel ohne Tags, alle weiteren `id="…"` im Block als `unterIds`.
  - `tagFolien(quellen: Record<string, string>): Folie[]` – für `TAG_1_SEITEN` in dieser Reihenfolge; Schlüssel von `quellen` = Seitenpfad.
  - `folieZu(folien: Folie[], pfad: string, anker: string): number | null` – Index der Folie mit `id === anker` oder `unterIds` enthält `anker`; bei leerem/unbekanntem Anker auf einer Tag-1-Seite die erste Folie dieser Seite; sonst `null`.
  - `notizenOhneFolie(folien: Folie[], notizen: typeof NOTIZEN): string[]` – `pfad#id` jeder Notiz ohne Folie.

- [ ] **Step 1: Tests schreiben** (`begleiter.test.ts`): mit kleinem Inline-Quelltext (zwei Folien, zweite mit `<h3 id="uebung-1-c">`):
  - `folienAus` liefert `[{id:'a',titel:'A',unterIds:[]},{id:'b',…,unterIds:['uebung-1-c']}]`.
  - `folieZu(folien,'/innolab/tag-1','uebung-1-c')` → Index der Folie `b`; `folieZu(…,'/innolab/tag-1','')` → erste Folie der Seite; `folieZu(…,'/innolab/tag-3','x')` → `null`.
  - echte Seiten über `import.meta.glob('../pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true })`: `tagFolien(...)` hat **51** Folien, erste `pfad` = `/innolab/tag-1`, letzte `pfad` = `/innolab/tag-1/abschluss`.
  - `notizenOhneFolie(tagFolien(...), NOTIZEN)` → `[]`; und mit einer Fake-Notiz `{ '/innolab/tag-1': { gibtsnicht: {live:['x']} } }` → `['/innolab/tag-1#gibtsnicht']`.
- [ ] **Step 2:** `npx vitest run src/lib/begleiter.test.ts` → FAIL (Modul fehlt).
- [ ] **Step 3:** Implementieren (Pfad aus Glob-Schlüssel: `../pages` → `''`, `.astro` weg, `/index` weg).
- [ ] **Step 4:** Test PASS; `npm test` grün.
- [ ] **Step 5:** Commit `Begleiter: Folienliste des Tages und Zuordnung zur Beamer-Position`.

### Task 2: Seite `/innolab/begleiter` mit Folgen und Blättern

**Files:**
- Create: `src/pages/innolab/begleiter.astro`, `src/components/begleiter-anzeige.ts`, `src/components/begleiter-anzeige.test.ts`
- Modify: `src/components/PraesentatorEinstieg.astro` (Link „Begleiter“ neben „Beamer starten“, nur für den Präsentator; README-Satz in „Im Kurs am Beamer“)

**Interfaces:**
- Consumes: `tagFolien`, `folieZu`, `NOTIZEN`, `Notiz` aus Task 1; `Position`, `ABFRAGE_MS`, `ABFRAGE_TIMEOUT_MS` aus `src/lib/position.ts`.
- Produces: `type Zustand = { index: number; folgen: boolean; meldung: 'ok' | 'nicht-tag-1' | 'keine-position' | 'keine-verbindung' }`; `anzeige(z: Zustand, ereignis: { art: 'position'; index: number | null } | { art: 'fehler' } | { art: 'leer' } | { art: 'blaettern'; index: number } | { art: 'folgen' }): Zustand` in `begleiter-anzeige.ts`.

- [ ] **Step 1: Tests** (`begleiter-anzeige.test.ts`): Position mit Index 5 bei `folgen:true` → `index 5, meldung 'ok'`; bei `folgen:false` → Index bleibt, Meldung bleibt; `index: null` → `meldung 'nicht-tag-1'`, Index bleibt; `fehler` → `'keine-verbindung'`, Index bleibt; `leer` → `'keine-position'`; `blaettern` → neuer Index und `folgen:false`; `folgen` → `folgen:true`.
- [ ] **Step 2:** FAIL. **Step 3:** `anzeige` implementieren.
- [ ] **Step 4: Seite bauen.** Je Folie aus `tagFolien` ein `<article data-index hidden>` mit Kopf (Seite · Titel), **Live-Block** (große Schrift: `live` als Liste, `ueberleitung`, `uebung`), darunter **Vorbereitung** (`kern`, `geschichte`, `zusatz` mit Etikett „Zusatz, nicht aus den Kursquellen“, `fragen`, `ablauf`) – fehlt die Notiz: „Zu dieser Folie gibt es noch keine Notizen.“ Steuerleiste oben: ‹ zurück · Folienliste (select, gruppiert nach Seite) · weiter › · Schalter „Dem Beamer folgen“ · Statuszeile aus `meldung`. Skript: alle `ABFRAGE_MS` `GET /api/position` mit Timeout `ABFRAGE_TIMEOUT_MS`, `folieZu` → `anzeige` → sichtbares `article` umschalten; Pfeiltasten blättern. Dunkles Thema, Tablet hoch/quer; keine Layout-Sidebar nötig (eigenes schlankes Layout oder `Layout` ohne Sidebar – Builder entscheidet).
- [ ] **Step 5:** Prüfen mit Dev-Server 4391 (wiederverwenden): Seite lädt, Blättern geht, „noch keine Notizen“ sichtbar; Position simulieren ist lokal nicht möglich (API nur auf Vercel) – `anzeige`-Tests decken das ab. `npm test`, `npm run build` grün.
- [ ] **Step 6:** Commit, Push, PR „Präsentator-Begleiter: Seite, die dem Beamer folgt (Stufe 1)“. **Stufe 1 endet hier** (Review, Merge auf Markus' „merge“, Deploy prüfen über `version.json`).

### Task 3–8: Inhalte je Seite (Stufe 2, eine Seite pro Task, in Tag-Reihenfolge)

Reihenfolge: 3 `tag-1` (19) · 4 `problem-rahmen` (7) · 5 `entscheidungslog` (5) · 6 `annahmen` (7) · 7 `interview` (10) · 8 `abschluss` (3).

**Files (je Task):**
- Create: `src/data/begleiter/<slug>.ts` → `export const NOTIZEN_<SLUG>: Record<string, Notiz>`
- Modify: `src/data/begleiter/index.ts` (eintragen)

**Inhalt je Folie (aus der Folie selbst, ihrem Handout und den zitierten Quellen):** `live` 3–5 Stichworte; `ueberleitung` zur nächsten Folie der Tagesfolge; `kern` mit gedruckter Seite; `geschichte` aus der Quelle, wenn die Folie eine erzählt; `zusatz` nur bei gutem echten Fall (Websuche erlaubt, Quelle als URL/Buch); `fragen` 1–3; bei Übungen `uebung` (Dauer aus `<Timer minuten>`), `ablauf` mit Auflösung (aus `<Aufloesung>` der Seite, falls vorhanden).

- [ ] **Step 1:** Inhalte schreiben (Subagent; Volltexte `~/code/ndu coding/2026/quellen/`, Originale `~/Documents/innolab_2026/`, Seiten-Offsets im Handover). Jedes wörtliche Zitat im Original nachschlagen.
- [ ] **Step 2:** `npx vitest run src/lib/begleiter.test.ts` → `notizenOhneFolie` bleibt `[]` (falsche id → rot).
- [ ] **Step 3:** `npm run build`; Seite im Dev-Server ansehen (Live-Block passt auf ein Tablet hochkant ohne Scrollen).
- [ ] **Step 4:** Commit je Seite; Push; PR je Seite oder gesammelt in einem Content-PR mit einem Commit je Seite (Builder entscheidet nach Zeit). Merge auf Markus' „merge“.

### Task 9: Vollständigkeit

**Files:** Modify `src/lib/begleiter.test.ts`
- [ ] **Step 1:** Test „jede Tag-1-Folie hat eine Notiz mit mindestens einem `live`-Stichwort“ über `tagFolien` × `NOTIZEN`.
- [ ] **Step 2:** grün (nach Task 8); Mutation: eine Notiz entfernen → rot auf Assertion; zurück.
- [ ] **Step 3:** Commit, PR, Merge auf „merge“.
