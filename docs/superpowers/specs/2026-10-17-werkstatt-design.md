# Werkstatt: Artefakte der Studierenden im Innolab

> Stand 17.10.2026, Rev. 2 nach Fable-Review. Grundlage: Recherche SOTA 2026 (zwei Durchgänge), drei Reviews durch Fable, Entscheidungen von Markus im Chat am 17.10.
> Ziel: MVP am **Do 22.10.2026** (Tag 1) im Einsatz, danach Ausbau je Kurstag bis Tag 7 (07.01.2027). **Künftige Jahrgänge ohne neuen Code** (Markus, 17.10.: „wichtig ist, dass wir künftige Jahre auch handhaben können“).

## 1. Problem und Ziel

Bisher halten die Studierenden jedes Artefakt fest, indem sie eine Markdown-Vorlage von der Website in `docs/*.md` ihres App-Repos kopieren. Das scheitert:

- **Abschreiben statt Verdichten.** Die letzten 10 Minuten eines Blocks gehen ins Übertragen von Stickies in Überschriften.
- **Es fühlt sich wie Coding an.** VS Code, Vorlage, Überschriften erhalten – das Innolab soll Grafiken und kurze Erklärungen haben, „das ist nicht Coding“ (Markus).
- **IDs sind nur Konvention.** Niemand merkt, wenn eine Annahme umbenannt wird oder eine Entscheidung ohne Beleg dasteht.
- **Review ist unsichtbar.** Markus sieht die drei Produkte nicht nebeneinander, die Historie steckt in `git log`.
- **Datenschutz.** Die App-Repos sind **öffentlich**; Interviewnotizen dürfen dort nie landen.

Die **Werkstatt** ersetzt das: Auf jeder Methodenseite klicken die Studierenden auf „Bearbeiten“ und arbeiten am Artefakt im Browser, mit dem Bild der Methode daneben. Gespeichert wird in einem **privaten Git-Repo pro Studierende*r**, das die Werkstatt anlegt und verwaltet; mit Git haben die Studierenden nichts zu tun. KI-Arbeit läuft in **Claude Chat** (claude.ai, nicht Claude Code) über einen **MCP-Connector** der Werkstatt; ChatGPT folgt über denselben Connector.

### Erfolgskriterien

1. Am 22.10. legen alle drei Studierenden die vier Tag-1-Artefakte in der Werkstatt an, ohne Terminal und ohne Git.
2. Jedes gespeicherte Artefakt ist ein Commit in ihrem privaten Repo, als JSON plus lesbares Markdown, mit der Person als Autor*in.
3. In Claude Chat liest der Connector ihre Artefakte und prüft sie gegen die Prüfliste der Methode; Claude schreibt nie selbst ins Artefakt.
4. Markus sieht pro Artefakt Stand und Verlauf; ab Tag 3 alle drei Produkte nebeneinander.
5. Nach Tag 7 gehört jedem Studierenden sein Repo.
6. Ein neuer Jahrgang braucht nur eine Kohorten-Datei und einen Eintrag in der Zugangsliste, keinen neuen Code; alte Mappen bleiben lesbar.

### Nicht-Ziele

- Kein Ersatz für Miro: Miro bleibt die Fläche zum Denken in der Session (divergent). Die Werkstatt hält fest, was übrig bleibt (konvergent).
- Keine Echtzeit-Zusammenarbeit, kein Kommentarsystem in der App (Peer-Review über GitHub-Issues am Mappe-Repo, Phase 3).
- Keine eigene Datenbank.
- Kein allgemeines LMS. Andere Kurse/Lehrende sind über `kurs` und `org` pro Kohorte möglich, werden aber jetzt nicht gebaut.

## 2. Leitentscheidungen

| Frage | Entscheidung | Warum |
|---|---|---|
| Wo schreiben die Studierenden? | Im Browser auf der Innolab-Seite: „Bearbeiten“ öffnet den Editor neben dem Bild | Markus: nahtlos, klicken und arbeiten |
| Wo liegen die Daten? | Ein **privates Repo pro Person und Kohorte** in der Org `ndu-innolab`: `ndu-innolab/<kohorte>-<kuerzel>`, z. B. `2026-sofie` | Markus: eigenes privates Repo; Kürzel statt Login, weil Logins umbenennbar sind |
| Wer legt das Repo an? | Die Werkstatt, beim ersten Login, aus dem Vorlagen-Repo der Kohorte | Studierende fassen Git nicht an |
| Wer committet? | Die GitHub App; **Autor*in = Studierende*r** (`<id>+<login>@users.noreply.github.com`), Committer = Bot | GitHub zeigt die Person als Autor*in |
| Architektur | Astro bleibt statisch; dazu eine **Hono-App** in `api/werkstatt.ts` desselben Vercel-Projekts (Rewrites in `vercel.json`); Editoren als React-Islands | Ein Deploy, Schemas/Prüflisten/Bilder ohne Paket geteilt |
| Anmeldung | **GitHub-Login** (GitHub-App-User-Autorisierung) nur zur Identität; Zugang per **numerischer GitHub-ID** | Logins sind umbenennbar und neu registrierbar |
| Sitzung und Tokens | **Ohne Datenbank**: signiertes Cookie für die Website; OAuth-Codes, Access- und Refresh-Tokens als **verschlüsselte Umschläge** (AES-256-GCM) | Serverless: Anfragen landen auf verschiedenen Instanzen, kein gemeinsamer Speicher |
| Übernahme aus capitelize | Portiert werden `token-codec.ts`, `client-assertion.ts`, `pinned-clients.ts`, Tests und Runbook-Wissen; **HTTP-Schicht und Provider werden neu** (capitelize ist Express mit In-Memory-Zuständen) | Ehrliche Aufwandsschätzung |
| KI | **Claude Chat** mit Werkstatt-Connector (remote MCP, Streamable HTTP, stateless); ChatGPT ab Phase 1b | Markus: kein Claude Code mehr für die KI-Arbeit |
| Connector-Anmeldung | claude.ai über **Claudes veröffentlichte Identität (CIMD)** als öffentlicher Client: Metadaten mit `client_id_metadata_document_supported: true` und `none` in `token_endpoint_auth_methods_supported`, PKCE S256, Refresh-Tokens rotieren | Studierende fügen nur die URL ein; laut Anthropic-Doku Voraussetzung für CIMD |
| KI-Grenze | MCP-Werkzeuge lesen und prüfen; einziges Schreibwerkzeug hinterlegt **Vorschläge** (Phase 1b), die die Studierenden im Editor selbst umsetzen | „KI prüft, schreibt nie das Artefakt“ als Mechanismus |
| Region | Vercel-Funktionen in `fra1` | Datenschutz |

Verworfen: Git-CMS (Keystatic, Tina, Decap, Sveltia, Pages CMS – keins kann typisierte Canvases plus ein Repo pro Person), Miro als Quelle der Wahrheit (Struktur zerfällt, IDs nicht erzwingbar), Better Auth (MCP-/CIMD-Plugins noch Beta), separate Next.js-App (zweiter Deploy ohne Gewinn), Repos in den Konten der Studierenden (jede*r müsste die App installieren).

## 3. Architektur

```
Browser (Studierende)                         Claude Chat / ChatGPT
  │  Innolab-Seiten (statisch, Astro)            │  MCP (Streamable HTTP)
  │  + React-Islands: Editor, Bild, Mappe        │  OAuth 2.1 + PKCE, CIMD
  ▼                                              ▼
Vercel-Projekt ndu-coding-site (Funktionen in fra1) ─────────────────────
  middleware.ts                    Kurspasswort (wie bisher) – nimmt /api/werkstatt/* aus
  api/werkstatt.ts                 Hono-App (Rewrites aus vercel.json)
     /api/werkstatt/auth/*            GitHub-Login, Sitzungs-Cookie, Abmelden
     /api/werkstatt/mappe/*           Artefakte lesen/speichern, Verlauf, Vorschläge
     /api/werkstatt/mcp               MCP-Endpunkt (Connector-URL)
     /api/werkstatt/oauth/*           Autorisierungsserver: authorize, token, Login-Seite
     /api/werkstatt/oauth/metadata    RFC 8414 (Issuer-Metadaten)
     /api/werkstatt/mcp/resource      RFC 9728 (Protected Resource Metadata)
  src/werkstatt/                   geteilter Code: Kohorten, Schemas, IDs, Renderer, Prüfungen
  ▼
GitHub (Org ndu-innolab)
  GitHub App „NDU Werkstatt“, installiert auf der Org mit „All repositories“:
     Administration r/w (Repos aus Vorlage anlegen), Contents r/w, Metadata r
  ndu-innolab/mappe-vorlage-<kohorte>   Vorlagen-Repo pro Kohorte (AGENTS.md, README, leere mappe/)
  ndu-innolab/<kohorte>-<kuerzel>        ein privates Repo pro Person und Kohorte
```

### 3.1 Pfade und Kurspasswort

- Website-Seiten bleiben hinter dem Kurspasswort.
- **Alles der Werkstatt liegt unter `/api/werkstatt/`**, auch MCP und OAuth. Die Kurspasswort-Middleware nimmt genau dieses Präfix aus; die Werkstatt hat ihre eigene Anmeldung. Der 401 des MCP-Endpunkts trägt `WWW-Authenticate: Bearer resource_metadata="https://ndu.datamonkeys.ai/api/werkstatt/mcp/resource"`; Claude folgt diesem Verweis (Anthropic-Doku: zuverlässigster Weg auf Serverless). Die Issuer-Metadaten liegen unter dem Issuer `https://ndu.datamonkeys.ai/api/werkstatt/oauth` gemäß RFC 8414 (Pfad-Issuer). Zur Sicherheit von Anfang an zusätzlich `/.well-known/oauth-authorization-server/api/werkstatt/oauth` und `/.well-known/oauth-protected-resource/api/werkstatt/mcp` per Rewrite auf dieselbe Funktion, beide von der Middleware ausgenommen.
- `middleware-matcher.test.ts` bekommt Fälle: `/api/werkstatt/*` ohne Kurs-Cookie erreichbar; `/api/werkstattx`, `/api/position` und alle Seiten weiter gesperrt.
- `vercel.json`: `"regions": ["fra1"]`, `maxDuration` für die Werkstatt-Funktion 30 s. Token-Endpunkt muss unter 10 s antworten (Anthropic-Grenze), Speichern ist Git-Data mit 4–5 Aufrufen und braucht ein Budget von ~5 s.

### 3.2 Kohorten und Zugang (mehrere Jahrgänge)

Zwei Teile, getrennt nach öffentlich und personenbezogen:

**Kohorte** (öffentlich, im Repo, `src/werkstatt/kohorten/<id>.ts`, eine Datei pro Jahrgang):

```ts
{ id: '2026', kurs: 'innolab', titel: 'Innolab 26/27', org: 'ndu-innolab',
  vorlage: 'mappe-vorlage-2026', status: 'aktiv',            // 'aktiv' | 'archiviert'
  artefakte: ['brief@1', 'entscheidungen@1', 'leitfaden@1', 'annahmen@1', 'interview@1', …],
  termine: { tag1: '2026-10-22', tag2: null, tag3: '2026-11-21', … } }
```

**Zugang** (personenbezogen, nur als Vercel-Umgebungsvariable `WERKSTATT_ZUGANG`, nie im Repo):

```json
{ "2026": { "lehrende": [9001],
            "studierende": [{ "githubId": 1001, "kuerzel": "sofie" }, …] } }
```

Regeln:

- Eine Person ist `(githubId, kohorte, rolle)`. Wer wiederholt, steht in zwei Kohorten und bekommt zwei Repos. Der Login wählt die neueste **aktive** Kohorte der Person; Lehrende sehen alle aktiven Kohorten (Kohortenwahl auf `/innolab/mappe` ab Phase 2).
- Sitzungs-Cookie `ndu_werkstatt`: HMAC über `{githubId, kohorte, rolle, exp}`, 30 Tage, HttpOnly, Secure, SameSite=Lax, Aufbau wie `kurszugang.ts`.
- MCP-Token-Claims: `{githubId, kohorte, rolle, exp, typ}`. **Die Connector-URL ändert sich nie**; das Token entscheidet, welche Mappe gelesen wird.
- Nicht in der Zugangsliste → Seite „Du bist für keinen Kurs freigeschaltet“, kein Repo, keine Tokens.
- `status: 'archiviert'` → Mitglieder sehen „Kurs beendet, euer Repo wurde übertragen“; Tokens dieser Kohorte → `invalid_grant`.
- Jedes Repo trägt `werkstatt.json` mit `{ kohorte, githubId }`, im ersten Commit nach dem Anlegen geschrieben; die Werkstatt prüft es beim Öffnen, damit ein Kürzel nie auf die falsche Person zeigt.
- **Neuer Jahrgang** = Kohorten-Datei anlegen, Vorlagen-Repo `mappe-vorlage-<id>` aus dem vorigen kopieren, Zugang ergänzen, alte Kohorte nach dem Transfer auf `archiviert`. Kein Code.

### 3.3 Speicher: Mappe-Repo

- **Anlegen** beim ersten Login: `POST /repos/{org}/{vorlage}/generate` mit Namen `<kohorte>-<kuerzel>`, privat, mit dem org-weiten Installations-Token (Administration). Antwortet GitHub mit 422 „name already exists“ (zweiter Tab, Wiederholung), gilt das als Erfolg, sobald `werkstatt.json` zur Person passt (oder noch fehlt und das Repo leer aus der Vorlage stammt). Danach `werkstatt.json` schreiben.
- **Speichern** mit einem pro Repo eingeschränkten Installations-Token (`repository_ids: [repo]`, `permissions: { contents: 'write' }`), gecacht pro Repo ~50 min (Vercel Runtime Cache, wie `position.ts`).
- **Ein Speichern = ein Commit**, atomar über die Git-Data-API. **Konflikte gelten pro Artefakt:** Der Editor schickt den Blob-SHA der geladenen `mappe/<artefakt>.json` mit (`null` = neu). Die API liest den Kopf von `main`; weicht der Blob-SHA dieser Datei ab → **409**, der Editor zeigt „Inzwischen geändert – neu laden“ und behält den Entwurf. Sonst Blobs → Tree auf dem Kopf → Commit → `PATCH /git/refs/heads/main` mit `force: false`; hat jemand inzwischen ein *anderes* Artefakt gespeichert (422 „not a fast forward“), einmal von vorn. So blockieren sich zwei Tabs mit verschiedenen Artefakten nie, und nichts wird still überschrieben.
- Ein Commit enthält `mappe/<artefakt>.json`, `mappe/<artefakt>.md` (gerendert) und `README.md` (Übersicht aus der Dateiliste, neu gerendert).
- Commit-Nachricht: `<Artefakt>: <kurze Änderung>`; Autor*in die Person, Committer der Bot.
- Kein Autospeichern auf Tastendruck: Knopf „Speichern“, Entwurf in `localStorage` (try/catch), Status „Entwurf / Gespeichert / Inzwischen geändert“.

Repo-Layout:

```
README.md                  generiert: Produkt, Stand, Liste aller Artefakte mit Links
AGENTS.md                  aus der Vorlage: wie Agenten die Mappe lesen (IDs, Verweise, Grenzen)
werkstatt.json             { kohorte, githubId, schemaVersionen } – Zuordnung und Selbstbeschreibung
mappe/
  brief.json   brief.md
  entscheidungen.json  entscheidungen.md
  leitfaden.json  leitfaden.md
  interviews/I1.json  I1.md …
  annahmen.json  annahmen.md
  vorschlaege/<artefakt>.json   offene KI-Vorschläge (Phase 1b)
  pruefungen/<artefakt>.json    Selbst- und KI-Prüfungen mit Prüfpunkt-Text (Phase 3)
```

### 3.4 Datenmodell

Geteilte Zod-Schemas in `src/werkstatt/schemas/` (Browser, API und MCP nutzen dieselben). Jede Datei hat `schema: "<artefakt>@<version>"`, `stand` (ISO-Datum) und die Felder.

**Schema-Entwicklung über Jahrgänge:**

- Neue Felder sind optional → keine neue Version.
- Eine brechende Änderung erhöht die Version (`annahmen@2`), der alte Parser bleibt, dazu `migrieren(alt → neu)` und ein Test mit einer alten Beispieldatei.
- Gelesen wird immer mit Migration im Speicher; geschrieben wird erst beim ausdrücklichen Speichern in der neuen Version. Alte Repos bleiben für immer lesbar.
- Welche Versionen eine Kohorte nutzt, steht in ihrer Kohorten-Datei (`artefakte`).

**ID-Grammatik** (global pro Mappe, nie wiederverwendet; Buchstaben wie in den bestehenden Kursseiten):

| Präfix | Artefakt | ab |
|---|---|---|
| D | Entscheidung | Tag 1 |
| F | Leitfaden-Frage | Tag 1 |
| A | Annahme | Tag 1 |
| I | Interview, Zitat `I2-4` (wie auf den Kursseiten) | Tag 1 (Hausaufgabe) |
| T | Thema (Synthese) | Tag 2 |
| J / P / G | Job / Pain / Gain | Tag 2 |
| W | Moment der Wahrheit | Tag 2 |
| H | HMW / Chance | Tag 2 |
| L | Lösungsidee | Tag 2 |
| E | Experiment | Tag 3 |
| S | Story-Map-Slice | Tag 3 |

Vor dem Festschreiben der Tag-2- und Tag-3-Präfixe gleicht ein Agent sie mit allen Methodenseiten ab (Beispiele und Vorlagen nutzen schon IDs).

**Belegstufe** (eine Aufzählung für Annahmen und Entscheidungen, passend zur Skala „sagen → tun“): `keiner | gesagt | erzaehlt | getan`, angezeigt als „noch keiner · gesagt · erzählt · getan“ wie auf der Skala im Entscheidungslog.

**Tag-1-Schemas** (aus den bisherigen Vorlagen und Prüflisten in `methoden.ts`):

- `brief@1`: `fuerWen`, `problem`, `heuteGeloestDurch`, `produktSatz?` (offen bis Tag 3), `nicht: string[]` (3 erwartet), `outcome: { wirGlauben, wirMerkenEs }`, `offeneFragen: string[]`.
- `entscheidungen@1`: Liste von `{ id: "D1", datum, entscheidung, grund, beleg: Belegstufe, belegIds: string[], ersetzt?: "D3" }`. Zeilen werden nie gelöscht; eine ersetzte Zeile zeigt „ersetzt am …“ aus der neuen.
- `leitfaden@1`: `{ ziel, wen, einstieg, fragen: [{ id: "F1", text, art: "kern" | "nachfrage" }], abschluss }`.
- `annahmen@1`: Liste von `{ id: "A1", text, art: "wuenschenswert" | "machbar" | "wirtschaftlich" | "bedienbar", wichtig: "hoch" | "mittel" | "niedrig", beleg: Belegstufe, belegIds }` plus `riskanteste: "A4"`. Quadrant der 2×2 wird abgeleitet, nicht eingegeben.
- `interview@1` (pro Datei, Hausaufgabe nach Tag 1): `{ id: "I1", datum, pseudonym, rolle, einwilligung: true, zitate: [{ id: "I1-1", text }], notizen }`. Pflichtfeld Pseudonym, Warnhinweis bei Eigennamen.

Zu jedem Schema gibt es eine **Kaffeebar-Beispieldatei** (gültig, aus den Beispielen der Kursseiten), die Tests, Editor-Vorschau und Kursseiten gemeinsam nutzen.

**Verweise** sind Felder, kein Fließtext. Ein Prüfer (`verknuepfungen`, Phase 1b) meldet unbekannte IDs, fehlende Belege und verwaiste Elemente; der Editor zeigt jede ID als Link und Rückverweise („A4 wird belegt durch I2-3“). Der **Opportunity Solution Tree wird aus den Verweisen abgeleitet** (Phase 3), nicht gezeichnet.

### 3.5 Editor und Seitenintegration

- Jede Methodenseite mit Artefakt bekommt einen Knopf **„Bearbeiten“**. Er öffnet ein Seitenpanel (breit) bzw. Vollbild (schmal) mit Formular links und **Live-Bild** rechts. MVP-Bilder: Annahmen → React-Gegenstück von `Matrix2x2` mit den vier Farben (gleiche CSS-Klassen wie die Folie); Entscheidungslog → Tabelle (React-`Zeitleiste` in Phase 2); Brief und Leitfaden → Karten.
- **Editor-Hülle** (eine Komponente für alle Artefakte): laden, Entwurf, speichern, Konflikt, Fehler, „nicht angemeldet“ → „Mit GitHub anmelden“ (Rücksprung auf dieselbe Seite). Formulare entstehen aus den Schemas plus wenigen Spezialfeldern (Liste mit IDs, Auswahl, Verweisauswahl).
- Neue Seite **`/innolab/mappe`**: alle Artefakte der Person (vorhanden oder offen; Verlauf ab Phase 2), Link zum Connector-Setup. Für Lehrende (Phase 2): Auswahl der Studierenden und Kohorte.
- Neue Seite **`/innolab/werkstatt/claude`**: Connector einrichten in claude.ai (Schritte mit Screenshots), Modelltraining ausschalten, Prüfen-Prompt.
- **Plan B** pro Artefakt: Das bisherige `ClaudePruefung` mit Kopier-Prompt bleibt; zusätzlich „Für Claude kopieren“ (Artefakt als Markdown plus Prüfliste) im Editor.
- **Beamer:** Knopf und Panel tragen `data-werkstatt`; `html[data-beamer] [data-werkstatt] { display: none }` – kein neuer Mechanismus. Die Kaffeebar-Beispiele auf den Folien bleiben statisch.
- **Barrierefreiheit:** Panel als `dialog` mit Fokusfalle und Escape, beschriftete Felder, Fehlermeldungen am Feld, `aria-live="polite"` für den Speicherstatus, vollständig per Tastatur bedienbar, Matrix-Farben immer mit Textlabel.
- **Texte:** Kurstexte bleiben bei „ihr“; der Editor spricht eine Person an → „du“. Datumsformat österreichisch (22.10.2026), Lucide-Icons, keine Emojis.
- `methoden.ts`: `pfad` zeigt künftig auf `mappe/<artefakt>.json`, `lebtIn` bekommt den Ort `werkstatt`. Methodenseiten und Folien, die `docs/*.md` nennen, werden für Tag 1 angepasst, die übrigen mit ihrer Phase.

### 3.6 MCP-Connector

- **Connector-URL** `https://ndu.datamonkeys.ai/api/werkstatt/mcp`, Streamable HTTP, stateless (`enableJsonResponse`), Server pro Anfrage. Kompatibel mit Clients nach Spec 2025-11-25 und 2026-07-28.
- **Autorisierungsserver** (neu, mit Bausteinen aus capitelize):
  - Autorisieren = GitHub-Login der Werkstatt (gleiche Zugangsliste) plus Zustimmungsseite, die den Ziel-Host (`claude.ai`) deutlich zeigt.
  - Codes als versiegelte Umschläge (`typ: 'code'`, 60 s, gebunden an client_id, redirect_uri, code_challenge, githubId, kohorte). Einmaligkeit nach bestem Bemühen über Runtime Cache; PKCE macht ein abgefangenes Wiederverwenden durch Dritte nutzlos.
  - Access-Token 1 h, Refresh-Token 30 Tage, **bei jedem Refresh rotiert**; ungültiges Refresh-Token → `invalid_grant`. Token-Endpunkt nimmt `application/x-www-form-urlencoded`.
  - **claude.ai** als öffentlicher CIMD-Client: redirect_uri exakt `https://claude.ai/api/mcp/auth_callback`, client_id eine https-URL auf `claude.ai`. Die genaue client_id loggt die Probe am Mo 19.10.; danach festgepinnt.
  - **ChatGPT** (Phase 1b): gepinnter CIMD-Client `https://chatgpt.com/oauth/client.json` mit `private_key_jwt` (aus capitelize).
  - Ohne Token antwortet `/mcp` mit 401 und `resource_metadata`-Verweis.
- **Server-Anweisung** (Tutor-Rolle, deutsch, „du“): erst eigene Arbeit, dann Prüfung; nie Artefakttext formulieren; höchstens drei Befunde, jeweils mit Zitat; zurückfragen.
- **Werkzeuge** (Namen deutsch; Beschreibungen tragen das Nötige selbst, weil ChatGPT keine Prompts/Ressourcen zeigt):

| Werkzeug | Phase | Art | Liefert |
|---|---|---|---|
| `mappe_uebersicht` | 1 | lesen | welche Artefakte vorhanden sind (Verlauf ab Phase 2) |
| `artefakt_lesen(artefakt)` | 1 | lesen | gerendertes Markdown plus strukturierte Daten |
| `methode_erklaeren(slug)` | 1 | lesen | aus `methoden.ts`: Frage, Prüfliste, Rolle der KI, Quelle, Link zur Seite – keine Inhalte aus Auflösungen |
| `artefakt_pruefen(artefakt)` | 1 | lesen | Artefakt plus Prüfpunkte mit IDs plus Ausgabeformat (`outputSchema`); Claude urteilt |
| `verknuepfungen_pruefen` | 1b | lesen | unbekannte IDs, fehlende Belege, verwaiste Elemente (deterministisch) |
| `vorschlag_hinterlegen(artefakt, befunde[])` | 1b | schreiben | speichert Befunde als offene Vorschläge; Server prüft, dass jedes Zitat wörtlich im Artefakt steht; max. 3 je Aufruf, 5 offen je Artefakt |

- Lesewerkzeuge tragen `readOnlyHint: true`.
- Interviewnotizen gibt `artefakt_lesen` nur mit Pseudonym heraus.
- Vorschläge erscheinen im Editor am betroffenen Feld; „Umsetzen“ öffnet das Feld zum Selbstformulieren (nichts wird automatisch übernommen), „Verwerfen“ schließt den Vorschlag; umgesetzte Zeilen tragen `herkunft: "ki-vorschlag"`.
- Sollen später Inhalte aus Auflösungen über MCP verfügbar sein, wandern deren Freigabezeiten aus den Seiten in `termine` der Kohorte.
- Später (Phase 4): MCP-Apps-Ansicht (SEP-1865), die das Artefakt-Bild direkt in Claude und ChatGPT zeigt.

### 3.7 Lehrende, Review, Pädagogik

- **Lehrende-Ansicht** (Phase 2): alle Mappen einer Kohorte nebeneinander, pro Artefakt Stand, Commits seit dem letzten Kurstag, Lücken aus `verknuepfungen_pruefen`.
- **Verlauf pro Artefakt** aus der Git-Historie: „seit Tag 1 geändert“, als Reflexionsfrage zu Beginn des nächsten Tags.
- **Kalibrierungslog** (Phase 3): Häkchen der Studierenden aus der Prüfliste und Claudes Befunde zu denselben Prüfpunkt-IDs landen in `mappe/pruefungen/`, **mit dem Prüfpunkt-Text als Schnappschuss**, damit spätere Änderungen an Prüflisten alte Logs nicht verfälschen.
- **Abruf zum Tagesbeginn** (Phase 3): drei Fragen aus den eigenen IDs (vorhandene `Quiz`-Komponente).
- **Peer-Review** (Phase 3, Tag 3/4): GitHub-Issues am Mappe-Repo, Lesezugriff für die Peers in der Werkstatt.

### 3.8 Sicherheit, Datenschutz, Grenzen

- Daten liegen bei GitHub (privat, US), Verarbeitung auf Vercel `fra1`, keine eigene Datenbank.
- Über den Connector fließen Artefakte zu Anthropic bzw. OpenAI. Tag-1-Setup: „In Claude: Einstellungen → Datenschutz → Modelltraining aus.“
- Interviews nur mit Pseudonym und Einwilligung; einseitiger Datenschutzhinweis für Interviewte (Phase 1b).
- **CSRF:** Ändernde Routen unter `/api/werkstatt/mappe/*` verlangen `Content-Type: application/json` und einen passenden `Origin`-Header.
- **Rate Limit:** Vercel-Firewall-Regel pro IP auf `/api/werkstatt/auth/*` und `/api/werkstatt/oauth/*` (In-Memory-Limits funktionieren serverless nicht).
- Die Werkstatt-Pfade sind ohne Kurspasswort aus dem Internet erreichbar; ohne Sitzung oder Token liefern sie nichts außer Login, Metadaten und 401.
- Nach Tag 7: **Markus überträgt die Repos** mit seinem Konto (`gh api -X POST repos/ndu-innolab/<repo>/transfer`; Installations-Tokens dürfen das nicht), die Studierenden nehmen per E-Mail an; ZIP-Export in der Werkstatt als Fallback. Danach Kohorte auf `archiviert`.
- Secrets nur als Vercel-Umgebungsvariablen: GitHub-App-ID, Private Key, Client-ID/Secret, `WERKSTATT_SESSION_SECRET`, `MCP_TOKEN_KEYS`, `WERKSTATT_ZUGANG`. Nie im Repo, nie im Chat.
- Lokale Entwicklung: Fake-GitHub-Speicher und Test-Login nur bei `NODE_ENV` in {development, test}; alles andere, auch ein fehlender Wert, verweigert.

## 4. Phasen und Termine

| Phase | Bis | Inhalt |
|---|---|---|
| **0 Grundlage** | **Sa 17.10.** (Markus) | Org, GitHub App (Rechte wie in §3, „All repositories“, Callback-URLs für Website-Login und Connector-Login), Vorlagen-Repo `mappe-vorlage-2026` |
| **0 Verträge** | **Mo 19.10., 10:00**, vor allen parallelen Agenten | Zod-Schemas + Kaffeebar-Beispiele der vier Artefakte; Kohorte/Zugang; Cookie- und Token-Claims; API-Routen, Fehlerform `{ fehler, code }`, 409-Semantik; Repo-Layout und Commit-Konvention; Middleware-Ausnahme; Hono-Gerüst in `api/werkstatt.ts` mit Router-Stubs und lokalem Dev-Server; MCP-Werkzeugnamen mit Ein-/Ausgabeschemas; Textregeln. Probe im Preview-Deploy: Rewrites und claude.ai-client_id; Sonntags-Probe gegen echtes GitHub (Vorlage erzeugen, atomarer Commit) |
| **1 MVP** | **Mi 21.10., 12:00 Freeze** | Login + Zugang, Repo anlegen, atomares Speichern, Editor-Hülle, vier Editoren (Brief, Entscheidungen als Tabelle, Leitfaden, Annahmen mit 2×2), „Bearbeiten“ auf den vier Seiten, `/innolab/mappe`, Connector mit den vier Phase-1-Werkzeugen, Setup-Seite, Tag-1-Texte angepasst |
| **Go/No-Go Connector** | **Di 20.10., 18:00** | Ende-zu-Ende in claude.ai mit frischem GitHub-Konto bestanden → Connector am Tag 1; sonst Tag 1 mit „Für Claude kopieren“, Connector zur Hausaufgabe |
| **1b Hausaufgabe** | vor Tag 2 | Interview-Editor I1–I5, `verknuepfungen_pruefen`, `vorschlag_hinterlegen` + Vorschläge im Editor, Datenschutzhinweis, ChatGPT |
| **2 Tag 2** | Ersatztermin | Synthese, Kundenprofil, Journey Map (Bild „Kurve“), HMW, Ideation; Lehrende-Ansicht mit Kohortenwahl; Verlauf pro Artefakt; React-`Zeitleiste` |
| **3 Tag 3** | 21.11. | Value Map („Canvas“), Storys, Experimente, Story Map; OST aus Verweisen als Startbild der Mappe; Kalibrierungslog; Abruf; Peer-Review |
| **4 Tag 4–7** | 28.11.–07.01. | Bezug zu Team/Sprints, MCP-Apps-Ansicht, Export nach `docs/` des App-Repos (ohne Personenbezug) für die Bautage, Pitch, ZIP-Export, Transfer-Anleitung, Archivierung |

Plan B für den 22.10.: Fällt Login, GitHub oder Connector aus, arbeiten die Studierenden mit dem bisherigen Kopier-Prompt in Claude Chat und halten auf Papier fest; die Werkstatt holt es nach.

## 5. Fehlerzustände (mit Text)

| Zustand | Anzeige |
|---|---|
| Nicht angemeldet | „Melde dich mit GitHub an, um deine Mappe zu bearbeiten.“ + Knopf |
| Nicht freigeschaltet | „Du bist für keinen Kurs freigeschaltet. Schreib Markus deinen GitHub-Namen.“ |
| Repo wird angelegt | „Deine Mappe wird eingerichtet …“ (Fortschritt, höchstens 10 s, dann Neuversuch) |
| Validierungsfehler | am Feld, z. B. „Mindestens eine Annahme braucht die Art ‚machbar‘.“ – Speichern bleibt möglich, wenn nur Prüflisten-Hinweise offen sind; gesperrt nur bei Schemafehlern |
| Konflikt (409) | „Inzwischen geändert – neu laden. Dein Entwurf bleibt erhalten.“ |
| GitHub nicht erreichbar | „Speichern gerade nicht möglich. Dein Entwurf ist auf diesem Gerät gesichert.“ |
| Sitzung abgelaufen | Login-Knopf, Entwurf bleibt |
| Connector-Token widerrufen/abgelaufen | in Claude: Hinweis der Server-Anweisung, den Connector neu zu verbinden |
| Kohorte archiviert | „Der Kurs ist beendet. Dein Repo gehört jetzt dir: [Link].“ |

## 6. Teststrategie und Abnahme

- Vitest wie bisher (`npm test` und `npm run build` sind das Gate, keine CI). Jede Linear-Issue nennt ihre Abnahmekriterien als prüfbare Sätze.
- **Schemas:** gültige und ungültige Beispiele je Artefakt; Kaffeebar-Beispiele gültig; Migrationstest, sobald es eine zweite Version gibt.
- **Kohorten:** Person in zwei Kohorten → neueste aktive; archivierte Kohorte → kein Zugang, `invalid_grant`.
- **Speicher** gegen einen Fake der Git-Data-API: ein Commit pro Speichern; veralteter `basisSha` → 409 und nichts geschrieben; Anlegen idempotent (422 „exists“ mit passender `werkstatt.json` = Erfolg, mit fremder = Fehler); Autor*in = Person.
- **Auth:** Zugang per ID (umbenannter Login bleibt zugelassen, fremde ID → keine Freigabe, kein Repo), Cookie-Signatur und Ablauf, CSRF-Prüfung.
- **OAuth/MCP:** Harness nach dem Vorbild von capitelize (`http-harness.ts`): 401 mit `resource_metadata`; Issuer-Metadaten mit CIMD-Werten und `none`; PKCE S256 Pflicht; Code-Umschlag läuft nach 60 s ab und ist an redirect_uri gebunden; Refresh rotiert, altes Refresh → `invalid_grant`; jedes Werkzeug; `readOnlyHint`; Token einer anderen Kohorte liest keine fremde Mappe.
- **Middleware:** `/api/werkstatt/*` ohne Kurs-Cookie erreichbar, alles andere weiter gesperrt.
- **Browser:** Editor-Ablauf per DevTools-MCP gegen den Build mit Fake-Speicher; Tastatur-only-Durchlauf; Beamer blendet die Werkstatt aus.
- **Ende-zu-Ende vor dem Go/No-Go:** frisches GitHub-Konto in einer Test-Kohorte → Login → Repo entsteht → vier Artefakte → Commits mit Person als Autor*in → Connector in claude.ai → `artefakt_pruefen`.

## 7. Was Markus selbst tun muss

1. GitHub-Org `ndu-innolab` anlegen (Name frei, geprüft 17.10.).
2. GitHub App „NDU Werkstatt“ registrieren und auf der Org mit „All repositories“ installieren (Schritt-für-Schritt-Anleitung im Plan).
3. Vorlagen-Repo `mappe-vorlage-2026` freigeben (Inhalt liefert ein Agent).
4. Vercel-Umgebungsvariablen setzen (Prod und Preview) – nach Okay, Werte nie im Chat. `WERKSTATT_SESSION_SECRET` mindestens 32 Zeichen (`openssl rand -hex 32`), sonst startet die Werkstatt nicht.
5. Freigabe für Merges, Deploy und das Teilen der Setup-Seite.

Die GitHub-IDs der Kohorte 2026 sind ermittelt (17.10.) und kommen nur in `WERKSTATT_ZUGANG`, nicht in dieses Repo. Kürzel legt Markus fest.
