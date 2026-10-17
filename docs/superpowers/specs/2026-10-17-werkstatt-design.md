# Werkstatt: Artefakte der Studierenden im Innolab

> Stand 17.10.2026. Grundlage: Recherche SOTA 2026 (zwei Durchgänge), zwei Reviews durch Fable, Entscheidungen von Markus im Chat am 17.10.
> Ziel: MVP am **Do 22.10.2026** (Tag 1) im Einsatz, danach Ausbau je Kurstag bis Tag 7 (07.01.2027). Wiederverwendbar für künftige Jahrgänge.

## 1. Problem und Ziel

Bisher halten die Studierenden jedes Artefakt fest, indem sie eine Markdown-Vorlage von der Website in `docs/*.md` ihres App-Repos kopieren. Das scheitert:

- **Abschreiben statt Verdichten.** Die letzten 10 Minuten eines Blocks gehen ins Übertragen von Stickies in Überschriften.
- **Es fühlt sich wie Coding an.** VS Code, Vorlage, Überschriften erhalten – das Innolab soll Grafiken und kurze Erklärungen haben, „das ist nicht Coding“ (Markus).
- **IDs sind nur Konvention.** Niemand merkt, wenn eine Annahme umbenannt wird oder eine Entscheidung ohne Beleg dasteht.
- **Review ist unsichtbar.** Markus sieht die drei Produkte nicht nebeneinander, die Historie steckt in `git log`.
- **Datenschutz.** Die App-Repos sind **öffentlich**; Interviewnotizen dürfen dort nie landen.

Die **Werkstatt** ersetzt das: Auf jeder Methodenseite klicken die Studierenden auf „Bearbeiten“ und arbeiten am Artefakt im Browser, mit dem Bild der Methode daneben. Gespeichert wird in einem **privaten Git-Repo pro Studierende*r**, das die Werkstatt anlegt und verwaltet; mit Git haben die Studierenden nichts zu tun. KI-Arbeit läuft in **Claude Chat** (claude.ai, nicht Claude Code) über einen **MCP-Connector** der Werkstatt; ChatGPT soll über denselben Connector gehen.

### Erfolgskriterien

1. Am 22.10. legen alle drei Studierenden die vier Tag-1-Artefakte in der Werkstatt an, ohne Terminal und ohne Git.
2. Jedes gespeicherte Artefakt ist ein Commit in ihrem privaten Repo, als JSON plus lesbares Markdown.
3. In Claude Chat liest der Connector ihre Artefakte und prüft sie gegen die Prüfliste der Methode; Claude schreibt nie selbst ins Artefakt.
4. Markus sieht pro Artefakt Stand und Verlauf; ab Tag 3 alle drei Produkte nebeneinander.
5. Nach Tag 7 gehört jedem Studierenden sein Repo.
6. Der nächste Jahrgang braucht nur eine neue Kohorte (Allowlist, Präfix), keinen neuen Code.

### Nicht-Ziele

- Kein Ersatz für Miro: Miro bleibt die Fläche zum Denken in der Session (divergent). Die Werkstatt hält fest, was übrig bleibt (konvergent).
- Keine Echtzeit-Zusammenarbeit, kein Kommentarsystem in der App (Peer-Review läuft über GitHub-Issues am Mappe-Repo, Phase 3).
- Keine eigene Datenbank.
- Kein allgemeines LMS.

## 2. Leitentscheidungen

| Frage | Entscheidung | Warum |
|---|---|---|
| Wo schreiben die Studierenden? | Im Browser auf der Innolab-Seite: „Bearbeiten“ öffnet den Editor neben dem Bild | Markus: nahtlos, klicken und arbeiten |
| Wo liegen die Daten? | Ein **privates Repo pro Studierende*r** in einer Org von Markus, z. B. `ndu-innolab/2026-<login>` | Markus: eigenes privates Repo; Git als Speicher, Historie gratis |
| Wer legt das Repo an? | Die Werkstatt, beim ersten Login, aus einem Vorlagen-Repo | Studierende fassen Git nicht an |
| Wer committet? | Die GitHub App (Bot) mit `Co-authored-by` der Studierenden | Ein Installations-Token, kein Token der Studierenden nötig |
| Architektur | Astro bleibt statisch; dazu eine **Hono-App in `api/`** desselben Vercel-Projekts; Editoren als React-Islands | Ein Deploy, Schemas/Prüflisten/Bilder ohne Paket geteilt; `api/position.ts` zeigt, dass es geht |
| Anmeldung | **GitHub-Login** (GitHub App, User-Autorisierung) nur zur Identität; Allowlist per **numerischer GitHub-ID** | Logins sind umbenennbar und neu registrierbar |
| Sitzung und Tokens | **Ohne Datenbank**: signiertes Cookie für die Website, verschlüsselte Token-Umschläge (AES-256-GCM) für MCP – portiert aus `capitelize-outlook-mcp` | Bewährt, getestet, nichts Neues zu lernen |
| KI | **Claude Chat** mit Werkstatt-Connector (remote MCP, Streamable HTTP, stateless); ChatGPT als zweiter Client | Markus: kein Claude Code mehr für die KI-Arbeit |
| Connector-Anmeldung | claude.ai über **Claudes veröffentlichte Identität (CIMD)**, festgepinnt wie ChatGPT in capitelize; Fallback: eigene Client-ID | Studierende fügen nur die URL ein, keine Client-ID/Secret |
| KI-Grenze | MCP-Werkzeuge lesen und prüfen; einziges Schreibwerkzeug hinterlegt **Vorschläge**, die die Studierenden im Editor annehmen | „KI prüft, schreibt nie das Artefakt“ als Mechanismus, nicht als Bitte |
| Region | Vercel-Funktionen in `fra1` | Datenschutz |

Verworfen: Git-CMS (Keystatic, Tina, Decap, Sveltia, Pages CMS – keins kann typisierte Canvases plus ein Repo pro Person), Miro als Quelle der Wahrheit (Struktur zerfällt, IDs nicht erzwingbar), Better Auth (MCP-/CIMD-Plugins noch Beta), separate Next.js-App (zweiter Deploy ohne Gewinn), Repos in den Konten der Studierenden (jede*r müsste die App installieren).

## 3. Architektur

```
Browser (Studierende)                         Claude Chat / ChatGPT
  │  Innolab-Seiten (statisch, Astro)            │  MCP (Streamable HTTP)
  │  + React-Islands: Editor, Bild, Mappe        │  OAuth 2.1 + PKCE, CIMD
  ▼                                              ▼
Vercel-Projekt ndu-coding-site ──────────────────────────────────────────
  middleware.ts      Kurspasswort (wie bisher) – nimmt Werkstatt-Pfade aus
  api/werkstatt.ts   Hono-App (fra1)
     /api/werkstatt/auth/*      GitHub-Login, Sitzungs-Cookie
     /api/werkstatt/mappe/*     Artefakte lesen/speichern, Verlauf, Vorschläge
     /mcp                        MCP-Endpunkt
     /oauth/*, /.well-known/*   OAuth-Autorisierungsserver für den Connector
  src/werkstatt/     geteilter Code: Schemas, IDs, Renderer, Prüfungen
  ▼
GitHub (Org ndu-innolab)
  GitHub App „NDU Werkstatt“: Contents r/w, Administration r/w (Repos anlegen), Metadata r
  ndu-innolab/mappe-vorlage     Vorlagen-Repo (AGENTS.md, README, leere mappe/)
  ndu-innolab/2026-<login>      ein privates Repo pro Studierende*r
```

### 3.1 Pfade und Kurspasswort

- Website-Seiten bleiben hinter dem Kurspasswort.
- Die Werkstatt-API hat ihre eigene Anmeldung (Sitzungs-Cookie) und ist aus der Kurspasswort-Middleware ausgenommen: `/api/werkstatt/*`, `/mcp`, `/oauth/*`, `/.well-known/oauth-authorization-server`, `/.well-known/oauth-protected-resource*`. Die OAuth-Login-Seite für den Connector muss ohne Kurs-Cookie erreichbar sein (claude.ai öffnet sie im Popup). `middleware-matcher.test.ts` bekommt Fälle für jeden dieser Pfade.
- Rewrites in `vercel.json` leiten diese Pfade auf `api/werkstatt.ts`.

### 3.2 Identität und Kohorte

- Konfiguration per Umgebungsvariable `WERKSTATT_KOHORTE` (JSON, nicht im öffentlichen Repo): `{ "jahr": "2026", "org": "ndu-innolab", "lehrende": [<githubId>], "studierende": [{ "githubId": 123, "kuerzel": "sofie" }] }`.
- Login: GitHub-App-User-Autorisierung (PKCE). Die Werkstatt liest nur `id` und `login` und wirft das User-Token danach weg.
- Nicht auf der Liste → freundliche Seite „Du bist für keinen Kurs freigeschaltet“, kein Repo.
- Sitzung: signiertes Cookie `ndu_werkstatt` (HMAC, `{githubId, rolle, exp}`, 30 Tage, HttpOnly, Secure, SameSite=Lax). Aufbau wie `kurszugang.ts`.

### 3.3 Speicher: Mappe-Repo

- Beim ersten Login legt die Werkstatt `ndu-innolab/<jahr>-<login>` aus `ndu-innolab/mappe-vorlage` an (privat), sofern es fehlt. Idempotent.
- Installations-Token pro Anfrage, eingeschränkt auf `repository_ids: [repo]` und nötige Rechte, gecacht ~50 min (Vercel Runtime Cache, wie `position.ts`).
- **Ein Speichern = ein Commit**, atomar über die Git-Data-API (Blobs → Tree → Commit → Ref): `mappe/<artefakt>.json` plus `mappe/<artefakt>.md` (gerendert) plus `README.md` (Übersicht).
- **Konflikte:** Der Editor schickt den Commit-SHA seines Stands mit. Hat sich der Ref bewegt, antwortet die API mit 409; der Editor zeigt „Inzwischen geändert – neu laden“ und behält den Entwurf.
- Commit-Nachricht: `<Artefakt>: <kurze Änderung>` plus `Co-authored-by: <login> <id+login@users.noreply.github.com>`.
- Kein Autospeichern auf Tastendruck: Knopf „Speichern“, Entwurf in `localStorage`, Markierung „ungespeichert“.

Repo-Layout:

```
README.md                  generiert: Produkt, Stand, Liste aller Artefakte mit Links
AGENTS.md                  aus der Vorlage: wie Agenten die Mappe lesen (IDs, Verweise, Grenzen)
mappe/
  brief.json   brief.md
  entscheidungen.json  entscheidungen.md
  leitfaden.json  leitfaden.md
  interviews/I1.json  I1.md …
  annahmen.json  annahmen.md
  vorschlaege/<artefakt>.json   offene KI-Vorschläge
  pruefungen/<artefakt>.json    Selbst- und KI-Prüfungen (Kalibrierung, Phase 3)
```

### 3.4 Datenmodell

Geteilte Zod-Schemas in `src/werkstatt/schemas/` (Browser, API und MCP nutzen dieselben). Jede Datei hat `schema: "<artefakt>@<version>"`, `stand` (ISO-Datum) und die Felder.

**ID-Grammatik** (global pro Mappe, nie wiederverwendet):

| Präfix | Artefakt | ab |
|---|---|---|
| D | Entscheidung | Tag 1 |
| F | Leitfaden-Frage | Tag 1 |
| A | Annahme | Tag 1 |
| I | Interview, Zitat `I2-Z3` | Tag 1 (Hausaufgabe) |
| T | Thema (Synthese) | Tag 2 |
| J / P / G | Job / Pain / Gain | Tag 2 |
| M | Moment der Wahrheit | Tag 2 |
| H | HMW / Chance | Tag 2 |
| L | Lösungsidee | Tag 2 |
| E | Experiment | Tag 3 |
| S | Story-Map-Slice | Tag 3 |

**Belegstufe** (eine Aufzählung für Annahmen und Entscheidungen, passend zur Skala „sagen → tun“): `keiner | gesagt | beobachtet | getestet`.

**Tag-1-Schemas** (aus den bisherigen Vorlagen und Prüflisten):

- `brief`: `fuerWen`, `problem`, `heuteGeloestDurch`, `produktSatz?` (offen bis Tag 3), `nicht: string[3]`, `outcome: { wirGlauben, wirMerkenEs }`, `offeneFragen: string[]`.
- `entscheidungen`: Liste von `{ id: "D1", datum, entscheidung, grund, beleg: Belegstufe, belegIds: string[], ersetzt?: "D3" }`. Zeilen werden nie gelöscht; eine ersetzte Zeile zeigt „ersetzt am …“ aus der neuen.
- `leitfaden`: `{ ziel, wen, einstieg, fragen: [{ id: "F1", text, art: "kern" | "nachfrage" }], abschluss }`.
- `annahmen`: Liste von `{ id: "A1", text, art: "wuenschenswert" | "machbar" | "wirtschaftlich" | "bedienbar", wichtig: "hoch" | "mittel" | "niedrig", beleg: Belegstufe, belegIds }` plus `riskanteste: "A4"`. Quadrant der 2×2 wird abgeleitet, nicht eingegeben.
- `interview` (pro Datei, Hausaufgabe nach Tag 1): `{ id: "I1", datum, pseudonym, rolle, einwilligung: true, zitate: [{ id: "I1-Z1", text }], notizen }`. Pflichtfeld Pseudonym, Warnhinweis bei Eigennamen.

**Verweise** sind Felder, kein Fließtext. Ein Prüfer (`verknuepfungen`) meldet unbekannte IDs, fehlende Belege und verwaiste Elemente; der Editor zeigt jede ID als Link und Rückverweise („A4 wird belegt durch I2-Z3“). Der **Opportunity Solution Tree wird aus den Verweisen abgeleitet** (Phase 3), nicht gezeichnet.

### 3.5 Editor und Seitenintegration

- Jede Methodenseite mit Artefakt bekommt einen Knopf **„Bearbeiten“** (im Beamer verborgen). Er öffnet ein Seitenpanel (Laptop) bzw. Vollbild (schmal) mit Formular links und **Live-Bild** rechts: Annahmen → `Matrix2x2` mit den vier Farben; Entscheidungslog → `Zeitleiste`; Brief und Leitfaden → Karten.
- Die vorhandenen Astro-Bilder bekommen React-Gegenstücke, die dieselben CSS-Klassen nutzen, damit Folie und Editor gleich aussehen.
- **Editor-Hülle** (eine Komponente für alle Artefakte): laden, Entwurf, speichern, Konflikt, Fehler, „nicht angemeldet“ → „Mit GitHub anmelden“. Formulare entstehen aus den Schemas plus wenigen Spezialfeldern (Liste mit IDs, Auswahl, Verweisauswahl).
- Neue Seite **`/innolab/mappe`**: alle Artefakte der Person, Stand, letzte Änderung, offene Vorschläge, Link zum Connector-Setup. Für Lehrende: Auswahl der Studierenden.
- **Plan B** pro Artefakt: Das bisherige `ClaudePruefung` mit Kopier-Prompt bleibt; zusätzlich „Für Claude kopieren“ (Artefakt als Markdown plus Prüfliste) aus dem Editor.
- `methoden.ts`: `pfad` zeigt künftig auf `mappe/<artefakt>.json`, `lebtIn` bekommt den Ort `werkstatt`. Methodenseiten und Folien, die `docs/*.md` nennen, werden für Tag 1 angepasst, die übrigen mit ihrer Phase.

### 3.6 MCP-Connector

- Endpunkt `https://ndu.datamonkeys.ai/mcp`, Streamable HTTP, stateless (`enableJsonResponse`), Server pro Anfrage. Kompatibel mit Clients nach Spec 2025-11-25 und 2026-07-28.
- OAuth-Autorisierungsserver portiert aus `capitelize-outlook-mcp` (`provider.ts`, `token-codec.ts`, `pinned-clients.ts`, `client-assertion.ts`, `login-page.ts`): Autorisieren = GitHub-Login der Werkstatt (gleiche Allowlist), Tokens als verschlüsselte Umschläge mit `{githubId, jahr, exp}`. Gepinnte Clients: claude.ai (CIMD) und ChatGPT (CIMD + `private_key_jwt`). RFC 9207 `iss`. PKCE Pflicht.
- **Server-Anweisung** (Tutor-Rolle, auf Deutsch, „ihr“): erst eigene Arbeit, dann Prüfung; nie Artefakttext formulieren; höchstens drei Befunde, jeweils mit Zitat; zurückfragen.
- **Werkzeuge** (Namen deutsch, Beschreibungen für ChatGPT ohne Prompts/Ressourcen tragfähig):

| Werkzeug | Art | Liefert |
|---|---|---|
| `mappe_uebersicht` | lesen | Artefakte, Stand, offene Vorschläge, Lücken in der Kette |
| `artefakt_lesen(artefakt)` | lesen | gerendertes Markdown plus strukturierte Daten |
| `methode_erklaeren(slug)` | lesen | Frage, Vorgehen, Beispiel (Kaffeebar), Prüfliste – ohne Pointen vor ihrer Freigabezeit |
| `artefakt_pruefen(artefakt)` | lesen | Artefakt plus Prüfpunkte mit IDs plus Ausgabeformat (`outputSchema`); Claude urteilt |
| `verknuepfungen_pruefen` | lesen | unbekannte IDs, fehlende Belege, verwaiste Elemente (deterministisch, serverseitig) |
| `vorschlag_hinterlegen(artefakt, befunde[])` | schreiben | speichert Befunde als offene Vorschläge; Server prüft, dass jedes Zitat wörtlich im Artefakt steht; max. 3 je Aufruf, 5 offen je Artefakt |

- Lesewerkzeuge tragen `readOnlyHint: true`.
- Interviewnotizen gibt `artefakt_lesen` nur mit Pseudonym heraus.
- Im Editor erscheinen offene Vorschläge am betroffenen Feld; „Übernehmen“ ändert nichts automatisch, sondern öffnet das Feld zum Selbstformulieren; „Verwerfen“ schließt den Vorschlag. Wer übernimmt, markiert die Zeile mit `herkunft: "ki-vorschlag"`.
- Später (Phase 4): MCP-Apps-Ansicht (SEP-1865), die das Artefakt-Bild direkt in Claude und ChatGPT zeigt.

### 3.7 Lehrende, Review, Pädagogik

- **Lehrende-Ansicht** (Phase 2): alle drei Mappen nebeneinander, pro Artefakt Stand, Commits seit dem letzten Kurstag, offene Lücken aus `verknuepfungen_pruefen`.
- **Verlauf pro Artefakt** aus der Git-Historie: „seit Tag 1 geändert“, als Reflexionsfrage zu Beginn des nächsten Tags.
- **Kalibrierungslog** (Phase 3): Die Häkchen der Studierenden aus der Prüfliste und Claudes Befunde zu denselben Prüfpunkt-IDs werden in `mappe/pruefungen/` gespeichert. Über den Kurs sehen die Studierenden, wo Selbsteinschätzung und KI auseinanderliegen.
- **Abruf zum Tagesbeginn** (Phase 3): drei Fragen aus den eigenen IDs (vorhandene `Quiz`-Komponente).
- **Peer-Review** (Phase 3, Tag 3/4): GitHub-Issues am Mappe-Repo, Lesezugriff für die Peers in der Werkstatt.

### 3.8 Datenschutz und Grenzen

- Daten liegen bei GitHub (privat, US), Verarbeitung auf Vercel `fra1`, keine eigene Datenbank.
- Über den Connector fließen Artefakte zu Anthropic bzw. OpenAI. Tag-1-Setup: „In Claude: Einstellungen → Datenschutz → Modelltraining aus.“
- Interviews nur mit Pseudonym und Einwilligung; einseitiger Datenschutzhinweis für Interviewte (Phase 1b).
- Nach Tag 7: Repo-Transfer an die Studierenden (`POST /repos/{owner}/{repo}/transfer`, Annahme per E-Mail) plus ZIP-Export als Fallback; danach löscht die Werkstatt nichts, Markus entfernt die Kohorte.
- Secrets nur als Vercel-Umgebungsvariablen: GitHub-App-ID, Private Key, Client-ID/Secret, `WERKSTATT_SESSION_SECRET`, `MCP_TOKEN_KEYS`, `WERKSTATT_KOHORTE`. Nie im Repo.
- Lokale Entwicklung: Fake-GitHub-Speicher und Test-Login nur bei `NODE_ENV` in {development, test}; alles andere verweigert.

## 4. Phasen

| Phase | Bis | Inhalt |
|---|---|---|
| **0 Grundlage** | Sa 17.10. | Org, GitHub App, Vorlagen-Repo (Markus); Schemas Tag 1, ID-Grammatik, API-Vertrag, Umgebungsvariablen, Middleware-Ausnahmen |
| **1 MVP** | Mi 21.10., 12:00 Freeze | Login + Allowlist, Repo anlegen, Speichern atomar, Editor-Hülle, vier Editoren (Brief, Entscheidungen, Leitfaden, Annahmen mit 2×2), „Bearbeiten“ auf den vier Seiten, `/innolab/mappe`, MCP mit den fünf Lesewerkzeugen, Connector-Setup-Seite, Tag-1-Texte angepasst. Ende-zu-Ende mit frischem GitHub-Konto in Claude Chat |
| **1b Hausaufgabe** | vor Tag 2 | Interview-Editor I1–I5 mit Pseudonym, `vorschlag_hinterlegen` + Vorschläge im Editor, Datenschutzhinweis, ChatGPT getestet |
| **2 Tag 2** | Ersatztermin | Synthese, Kundenprofil, Journey Map (Bild „Kurve“), HMW, Ideation; Lehrende-Ansicht; Verlauf pro Artefakt |
| **3 Tag 3** | 21.11. | Value Map („Canvas“), Storys, Experimente, Story Map; OST aus Verweisen als Startbild der Mappe; Kalibrierungslog; Abruf; Peer-Review |
| **4 Tag 4–7** | 28.11.–07.01. | Team/Sprints-Bezug, MCP-Apps-Ansicht, Export nach `docs/` des App-Repos (ohne Personenbezug) für die Bautage, Pitch, Transfer und ZIP |

Plan B für den 22.10.: Fällt Login, GitHub oder Connector aus, arbeiten die Studierenden mit dem bisherigen Kopier-Prompt in Claude Chat und halten auf Papier fest; die Werkstatt holt es nach.

## 5. Teststrategie

- Vitest wie bisher (`npm test` und `npm run build` sind das Gate, keine CI).
- Schemas: gültige und ungültige Beispiele je Artefakt; die Kaffeebar-Beispieldaten müssen gültig sein.
- Speicher: gegen einen Fake der Git-Data-API (atomarer Commit, 409 bei bewegtem Ref, Idempotenz beim Anlegen).
- Auth: Allowlist per ID (umbenannter Login bleibt zugelassen, fremde ID abgewiesen), Cookie-Signatur, Ablauf.
- MCP: Harness aus capitelize (`http-harness.ts`) portiert; Discovery-Metadaten, PKCE, Token-Umschlag, jedes Werkzeug, `readOnlyHint`, Zitatprüfung von `vorschlag_hinterlegen`.
- Middleware: jeder Werkstatt-Pfad ohne Kurs-Cookie erreichbar, alle anderen weiter gesperrt.
- Browser: Editor-Ablauf per DevTools-MCP gegen `vercel dev` bzw. Build mit Fake-Speicher.
- Ende-zu-Ende vor dem Freeze: frisches GitHub-Konto auf der Allowlist → Login → Repo entsteht → vier Artefakte → Commits sichtbar → Connector in claude.ai → Prüfung.

## 6. Was Markus selbst tun muss

1. GitHub-Org `ndu-innolab` anlegen (oder anderen Namen festlegen).
2. GitHub App „NDU Werkstatt“ registrieren und auf der Org installieren (Anleitung folgt mit Phase 0).
3. Vercel-Umgebungsvariablen setzen (Prod) – nach Okay, Werte nie im Chat.
4. GitHub-IDs der drei Studierenden bestätigen (aus ihren Logins ermittelbar).
5. Freigabe für Merges und Deploy.
