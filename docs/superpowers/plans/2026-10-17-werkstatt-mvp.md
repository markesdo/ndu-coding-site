# Werkstatt MVP – Implementierungsplan (Phase 0 + 1)

> Rev. 2 nach Fable-Review (17.10.): Einstieg `api/werkstatt.ts` + Rewrites, Router-Stubs gegen Merge-Konflikte, Konflikt pro Artefakt (Blob-SHA), lokaler Dev-Server, PEM-Format, Sonntags-Probe.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bis Mi 21.10.2026, 12:00 bearbeiten Studierende die vier Tag-1-Artefakte im Browser auf der Innolab-Seite, gespeichert als Commits in ihrem privaten Mappe-Repo, und prüfen sie in Claude Chat über den Werkstatt-Connector.

**Architecture:** Astro bleibt statisch. Eine Hono-App in `api/werkstatt.ts` (eine Vercel-Funktion, fra1; `vercel.json` schreibt `/api/werkstatt/*` und die zwei `/.well-known/oauth-*`-Pfade darauf um) liefert Login, Mappe-API, OAuth-Autorisierungsserver und MCP-Endpunkt, alles unter `/api/werkstatt/`. Gespeichert wird über eine GitHub App in `ndu-innolab/<kohorte>-<kuerzel>`; keine Datenbank, Zustand steckt in signierten Cookies und verschlüsselten Umschlägen. Editoren sind React-Islands, die geteilte Zod-Schemas nutzen.

**Tech Stack:** Astro 7, React 19, Vercel Functions + Routing Middleware, `hono@4.13.13` (ohne den veralteten Adapter `hono/vercel`; Export `export default { fetch: (req: Request) => app.fetch(req) }`), `zod@4.6.7`, `jose@6.2.12` (Schlüssel über `node:crypto` `createPrivateKey`), `@modelcontextprotocol/sdk@1.32.1` (`WebStandardStreamableHTTPServerTransport` aus `@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js`), Vitest 5; dev: `@hono/node-server@2.1.5`, `tsx@4.23.15`.

**Spec:** `docs/superpowers/specs/2026-10-17-werkstatt-design.md` (Rev. 2). Executors lesen Spec und Plan.

## Global Constraints

- Versionen exakt gepinnt wie oben (kein `^`), Node `>=22.12.0`.
- Gate je Task: `npm test` und `npm run build` grün, keine CI.
- Alle Werkstatt-Routen unter `/api/werkstatt/`; die Middleware nimmt genau `/api/werkstatt`, `/api/werkstatt/…` und die zwei Pfade `/.well-known/oauth-authorization-server/api/werkstatt/oauth` und `/.well-known/oauth-protected-resource/api/werkstatt/mcp` aus, nichts sonst.
- Öffentliche Origin aus `WERKSTATT_ORIGIN` (Prod), sonst `new URL(request.url).origin` (Preview, lokal).
- UI-Module (`src/werkstatt/ui/**`) importieren nie aus `src/werkstatt/server/**` (dort ist `node:crypto`).
- Imports in `api/` und `middleware.ts` mit `.js`-Endung (wie `api/position.ts`).
- `src/werkstatt/server/app.ts` wird nach Task 3 von keinem Task mehr geändert; jeder Task ersetzt nur seinen eigenen Router-Stub.
- Fehlerantworten der API: JSON `{ "fehler": "<deutscher Satz>", "code": "<kebab-code>" }`.
- Zugang über numerische GitHub-ID, nie über den Login.
- Repo-Name `<kohorte>-<kuerzel>`, Org aus der Kohorte; nie hart `ndu-innolab` im Code außerhalb von `src/werkstatt/kohorten/2026.ts`.
- Lokale Abkürzungen (Fake-Speicher, Test-Login) nur bei `NODE_ENV` ∈ {`development`, `test`}; sonst, auch bei fehlendem Wert, verweigert.
- Secrets nur aus `process.env`: `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_APP_CLIENT_ID`, `GITHUB_APP_CLIENT_SECRET`, `WERKSTATT_SESSION_SECRET`, `MCP_TOKEN_KEYS`, `WERKSTATT_ZUGANG`. Nie loggen.
- UI-Texte deutsch; Editor spricht mit „du“, Kurstexte bleiben bei „ihr“. Datum österreichisch (`22.10.2026`). Lucide-Icons, keine Emojis.
- Statuswörter exakt: `Entwurf`, `Gespeichert`, `Inzwischen geändert`.
- Kommentare und Commits auf Deutsch, Stil wie im Repo; Commits enden mit `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` und der Claude-Session-Zeile.
- Beamer: alles Werkstatt-Sichtbare trägt `data-werkstatt`; `html[data-beamer] [data-werkstatt] { display: none }`.
- Edit/Write dekodieren `\uXXXX`: nach solchen Escapes die Datei auf rohe U+2028/U+2029 prüfen.

## Review Focus

1. **Zwei Geräte, eine Mappe:** Laptop speichert die Annahmen, Handy hat noch den alten Stand der Annahmen → Speichern vom Handy muss 409 liefern, nicht still überschreiben. **Zwei Tabs mit verschiedenen Artefakten** (Brief und Annahmen) dürfen sich dagegen nie blockieren. Tests in Task 5 (`speichern mit veraltetem basisSha`, `anderes artefakt blockiert nicht`) und Task 11.
2. **Erster Login in zwei Tabs:** zweites Anlegen bekommt 422 „exists“ → Erfolg, kein Fehlerbildschirm. Test in Task 5 (`anlegen ist idempotent`).
3. **Umbenannter GitHub-Login:** gleiche ID, neuer Login → Zugang bleibt, Repo-Name bleibt (Kürzel). Test in Task 4 (`umbenannter login behält zugang`).
4. **Entwurf überlebt Ablauf der Sitzung oder GitHub-Ausfall:** Editor verliert nie Eingaben. Test in Task 8 (`entwurf bleibt bei 401 und 502`).
5. **Connector-Token einer anderen Kohorte** liest nie eine fremde Mappe. Test in Task 12 (`token liest nur eigene mappe`).

---

## Wellen und Abhängigkeiten

| Welle | Tasks | Start | Wer |
|---|---|---|---|
| 0 | T0 + Sonntags-Probe (Markus), T1, T2, T3, T10 | Sa–Mo 10:00 | T1–T3 seriell, ein Agent: das sind die Verträge; T10 parallel (keine Code-Abhängigkeit) |
| 1 | T4, T5, T6, T7, T8, T9 | Mo 10:00, parallel | je ein Agent im eigenen Worktree |
| 2 | T11, T12, T13 | sobald Abhängigkeiten gemergt | parallel |
| 3 | T14, T15 | Di | seriell, Go/No-Go Di 18:00 |

Kritischer Pfad: T1→T2→T3 → T5 (nur gegen echtes GitHub prüfbar) → T11 → T14 → E2E, parallel T7 → T12 → claude.ai-Probe. Abhängigkeiten: T4–T9 brauchen T1–T3. T11 (Mappe-Routen) braucht T4, T5, T6. T12 (MCP) braucht T5, T6, T7. T13 (Editoren) braucht T8, T9. T14 (Seitenintegration) braucht T11, T13. T15 (Probe/E2E) braucht alles.

Worktree pro Task: `git worktree add -b werkstatt/<task-slug> ../ndu-coding-site-<slug> origin/main && ln -s ../ndu-coding-site/node_modules node_modules` (nach `npm install` im Haupt-Checkout der neuen Abhängigkeiten aus T1; danach im Worktree `npm install` statt Symlink, falls `package.json` abweicht). Haupt-Checkout nie umschalten.

---

### Task 0: GitHub App und Umgebung (Markus, manuell)

**Ergebnis:** App installiert, Secrets in Vercel, Vorlagen-Repo existiert.

- [ ] **Schritt 1: App registrieren** unter https://github.com/organizations/ndu-innolab/settings/apps/new
  - Name `NDU Werkstatt`, Homepage `https://ndu.datamonkeys.ai/innolab`
  - Callback URLs (bis zu 10, exakter Abgleich): `https://ndu.datamonkeys.ai/api/werkstatt/auth/callback`, der feste Branch-Alias der Previews `https://ndu-coding-site-git-<branch>-<team>.vercel.app/api/werkstatt/auth/callback` für den Werkstatt-Integrationsbranch, `http://localhost:4321/api/werkstatt/auth/callback`. „Request user authorization (OAuth) during installation“ aus, „Expire user authorization tokens“ an (egal: das User-Token wird nur einmal für `/user` benutzt)
  - Webhook: aus
  - Repository permissions: **Administration: Read and write**, **Contents: Read and write**, Metadata: Read-only (Pflicht)
  - Account permissions: keine; „Only on this account“
- [ ] **Schritt 2:** Private Key erzeugen (.pem; GitHub liefert PKCS#1 `BEGIN RSA PRIVATE KEY` – so lassen, der Code liest es), Client Secret erzeugen. App-ID und Client-ID notieren.
- [ ] **Schritt 3:** App auf `ndu-innolab` installieren, **All repositories**.
- [ ] **Schritt 4:** Leeres privates Repo `ndu-innolab/mappe-vorlage-2026` anlegen, in Settings „Template repository“ anhaken (Inhalt kommt aus Task 10).
- [ ] **Schritt 5 (nach Okay, Werte nie im Chat):** Vercel-Projekt `ndu-coding-site`, Umgebung Production + Preview: `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY` (PEM, Zeilenumbrüche erhalten), `GITHUB_APP_CLIENT_ID`, `GITHUB_APP_CLIENT_SECRET`, `WERKSTATT_SESSION_SECRET` (`openssl rand -hex 32`), `MCP_TOKEN_KEYS` (`k1:` + `openssl rand -base64 32`, Format wie capitelize `REMOTE.md`), `WERKSTATT_ORIGIN=https://ndu.datamonkeys.ai` (nur Production), `WERKSTATT_ZUGANG` (JSON nach Spec §3.2, IDs aus dem Chat vom 17.10., Kürzel `joachim`, `sofie`, `chen`). Zusätzlich eine Test-Kohorte `test` mit Markus' Zweitkonto für das E2E.
- [ ] **Schritt 6:** Vercel-Firewall: **eine** Rate-Limit-Regel (Hobby erlaubt eine), Bedingung Pfad beginnt mit `/api/werkstatt/auth/` ODER `/api/werkstatt/oauth/`, 30 Anfragen pro 60 s pro IP.
- [ ] **Schritt 7:** Deployment Protection für Previews ausschalten oder ein Protection-Bypass-Secret anlegen – sonst erreicht claude.ai die Preview-URL am Montag nicht.
- [ ] **Schritt 8 (So, Sonntags-Probe, ein Agent mit Markus' Okay):** kleines Skript mit dem echten Installations-Token: Repo aus `mappe-vorlage-2026` erzeugen → warten, bis `git/ref/heads/main` existiert (Dauer notieren) → Blob/Tree/Commit/Ref mit `force: false` → zweites PATCH auf veralteter Basis liefert 422. Ergebnis als Kommentar an Task 5. Test-Repo danach löschen (Markus).

---

### Task 1: Abhängigkeiten, Kohorten, Zugang, IDs (Vertrag)

**Files:**
- Modify: `package.json` (deps `hono@4.13.13`, `zod@4.6.7`, `jose@6.2.12`, `@modelcontextprotocol/sdk@1.32.1`; devDeps `@hono/node-server@2.1.5`, `tsx@4.23.15`; Skript `"werkstatt:dev": "NODE_ENV=development tsx scripts/werkstatt-dev.ts"`)
- Create: `src/werkstatt/kohorten/typen.ts`, `src/werkstatt/kohorten/2026.ts`, `src/werkstatt/kohorten/test.ts`, `src/werkstatt/kohorten/index.ts`
- Create: `src/werkstatt/zugang.ts`, `src/werkstatt/ids.ts`
- Test: `src/werkstatt/zugang.test.ts`, `src/werkstatt/ids.test.ts`

**Interfaces:**
- Produces:
  - `type KohortenStatus = 'aktiv' | 'archiviert'`
  - `interface Kohorte { id: string; kurs: 'innolab'; titel: string; org: string; vorlage: string; status: KohortenStatus; artefakte: ArtefaktVersion[]; termine: Record<string, string | null> }` mit `type ArtefaktVersion = \`${ArtefaktName}@${number}\`` (ArtefaktName aus Task 2)
  - `KOHORTEN: readonly Kohorte[]`, `kohorte(id: string): Kohorte | undefined`
  - `type Rolle = 'studierende' | 'lehrende'`
  - `interface Zugang { [kohorte: string]: { lehrende: number[]; studierende: { githubId: number; kuerzel: string }[] } }`
  - `zugangLesen(roh: string | undefined): Zugang` – wirft `Error('WERKSTATT_ZUGANG ungültig')` bei fehlendem/kaputtem JSON, doppeltem Kürzel in einer Kohorte oder Kürzel außerhalb `^[a-z][a-z0-9-]{1,20}$`
  - `interface Mitgliedschaft { kohorte: string; rolle: Rolle; kuerzel: string | null }`
  - `mitgliedschaften(z: Zugang, githubId: number, kohorten: readonly Kohorte[]): Mitgliedschaft[]` – nur Kohorten mit Status `aktiv`, neueste zuerst (absteigend nach `id`)
  - `repoName(m: Mitgliedschaft): string` → `${kohorte}-${kuerzel}`; wirft für Lehrende ohne Kürzel
  - `type IdPraefix = 'D' | 'F' | 'A' | 'I' | 'T' | 'J' | 'P' | 'G' | 'W' | 'H' | 'L' | 'E' | 'S'`
  - `istId(s: string): boolean` (`A12`, `I2-4`; nicht `A0`, `a1`, `I2-`)
  - `naechsteId(p: IdPraefix, vorhandene: readonly string[]): string` – größte Nummer + 1, Lücken werden nie aufgefüllt

- [ ] **Schritt 1: Tests schreiben**
  - `mitgliedschaften`: Person in `2026` und `2027` (beide aktiv) → `[2027, 2026]`; `2026` archiviert → nur `2027`; unbekannte ID → `[]`; Lehrende-ID → `{ rolle: 'lehrende', kuerzel: null }`.
  - `zugangLesen`: `undefined` wirft; doppeltes Kürzel wirft; `"Sofie"` wirft.
  - `naechsteId('A', ['A1','A3'])` → `'A4'`; `naechsteId('D', [])` → `'D1'`.
  - `istId`: wie oben.
- [ ] **Schritt 2:** `npx vitest run src/werkstatt` → FAIL (Module fehlen).
- [ ] **Schritt 3:** Implementieren. `2026.ts`: `{ id: '2026', kurs: 'innolab', titel: 'Innolab 26/27', org: 'ndu-innolab', vorlage: 'mappe-vorlage-2026', status: 'aktiv', artefakte: ['brief@1','entscheidungen@1','leitfaden@1','annahmen@1'], termine: { tag1: '2026-10-22', tag2: null, tag3: '2026-11-21', tag4: '2026-11-28', tag5: '2026-12-12', tag6: '2026-12-19', tag7: '2027-01-07' } }`. `test.ts`: Kohorte `test`, gleiche Org, Vorlage `mappe-vorlage-2026`, Status `aktiv`.
- [ ] **Schritt 4:** Tests grün, `npm run build` grün.
- [ ] **Schritt 5:** Commit `Werkstatt: Kohorten, Zugang und ID-Grammatik`.

---

### Task 2: Schemas Tag 1, Kaffeebar-Beispiele, API-Vertrag (Vertrag)

**Files:**
- Create: `src/werkstatt/schemas/gemeinsam.ts`, `brief.ts`, `entscheidungen.ts`, `leitfaden.ts`, `annahmen.ts`, `index.ts`
- Create: `src/werkstatt/beispiele/brief.json`, `entscheidungen.json`, `leitfaden.json`, `annahmen.json` (Kaffeebar, aus den Beispielen auf `problem-rahmen.astro`, `entscheidungslog.astro`, `interview.astro`, `annahmen.astro`)
- Create: `src/werkstatt/vertrag.ts` (API- und MCP-Typen, keine Logik außer Konstanten)
- Test: `src/werkstatt/schemas/schemas.test.ts`

**Interfaces:**
- Consumes: `istId`, `IdPraefix` (Task 1)
- Produces:
  - `type ArtefaktName = 'brief' | 'entscheidungen' | 'leitfaden' | 'annahmen'`
  - `type Belegstufe = 'keiner' | 'gesagt' | 'erzaehlt' | 'getan'`, `BELEGSTUFEN` (Reihenfolge so)
  - Typen `Brief`, `Entscheidungen` (Zeilentyp `Entscheidung`), `Leitfaden` (Zeilentyp `Frage`), `Annahmen` (Zeilentyp `Annahme`) exakt nach Spec §3.4; jede Datei zusätzlich `schema: '<name>@1'` und `stand: string` (ISO-Datum `YYYY-MM-DD`); `type ArtefaktDaten = Brief | Entscheidungen | Leitfaden | Annahmen`
  - `interface Feldfehler { pfad: string; meldung: string }` – `pfad` wie `annahmen.3.art`, `meldung` deutsch
  - `ARTEFAKTE: Record<ArtefaktName, { titel: string; slug: string; version: 1; leer(heute: string): unknown }>` – `slug` = Methodenseite (`problem-rahmen`, `entscheidungslog`, `interview`, `annahmen`)
  - `artefaktParsen(name: ArtefaktName, roh: unknown): { ok: true; daten: ArtefaktDaten } | { ok: false; fehler: Feldfehler[] }` – liest auch künftig ältere Versionen über eine (jetzt leere) Migrationstabelle `MIGRATIONEN: Record<string, (alt: unknown) => unknown>`
  - `quadrant(a: Annahme): 'ol' | 'or' | 'ul' | 'ur'` – oben = `wichtig === 'hoch'`, rechts = `beleg` ∈ {`erzaehlt`, `getan`}; `ol` = zuerst testen (passt zu `annahmen.astro`: nach oben wichtig, nach rechts belegt)
  - `punkt(a: Annahme, nachbarn: readonly Annahme[]): { x: number; y: number }` – y: hoch .85 / mittel .5 / niedrig .15; x: keiner .1 / gesagt .35 / erzaehlt .65 / getan .9; gleiche Zelle → um 0,06 pro Nachbar nach rechts unten versetzt, geklemmt auf [0,1]
  - In `vertrag.ts`:
    - `interface ApiFehler { fehler: string; code: 'nicht-angemeldet' | 'nicht-freigeschaltet' | 'wird-eingerichtet' | 'ungueltig' | 'konflikt' | 'github-fehler' | 'csrf' | 'unbekannt'; felder?: Feldfehler[] }`
    - `interface MappeStand { kohorte: string; repo: string; artefakte: { name: ArtefaktName; vorhanden: boolean }[] }`
    - `interface ArtefaktAntwort { name: ArtefaktName; daten: unknown | null; basisSha: string | null }` – **`basisSha` ist der Blob-SHA von `mappe/<name>.json`**, `null` = Datei gibt es noch nicht; so blockieren sich verschiedene Artefakte nie
    - `interface SpeichernAnfrage { daten: unknown; basisSha: string | null; nachricht?: string }`, `interface SpeichernAntwort { basisSha: string; commitUrl: string }`
    - `interface Ich { githubId: number; login: string; kohorte: string; rolle: Rolle; repo: string | null }` – `repo: null` heißt „wird noch eingerichtet“
    - Routen als Konstanten: `GET /api/werkstatt/auth/ich`, `GET /api/werkstatt/auth/login?weiter=`, `GET /api/werkstatt/auth/callback`, `POST /api/werkstatt/auth/abmelden`, `GET /api/werkstatt/mappe`, `GET /api/werkstatt/mappe/:artefakt`, `PUT /api/werkstatt/mappe/:artefakt` (409 bei Konflikt), `ALL /api/werkstatt/mcp`
    - MCP-Werkzeugnamen: `mappe_uebersicht`, `artefakt_lesen`, `methode_erklaeren`, `artefakt_pruefen`

- [ ] **Schritt 1: Tests schreiben**
  - Jede Beispieldatei: `artefaktParsen(name, beispiel).ok === true`.
  - `annahmen` ohne `art` an Zeile 2 → `fehler` enthält `{ pfad: 'annahmen.1.art' }` mit deutscher Meldung.
  - `riskanteste: 'A9'` bei fehlendem A9 → Fehler `pfad: 'riskanteste'`.
  - Doppelte ID in `entscheidungen` → Fehler. `ersetzt` zeigt auf unbekannte D-ID → Fehler.
  - `quadrant({ wichtig: 'hoch', beleg: 'keiner' })` → `'ol'`; `({ wichtig: 'niedrig', beleg: 'getan' })` → `'ur'`.
  - `punkt`: zwei Annahmen in derselben Zelle bekommen verschiedene Punkte.
  - `ARTEFAKTE[n].leer('2026-10-22')` ist gültig für alle vier.
- [ ] **Schritt 2:** FAIL.
- [ ] **Schritt 3:** Implementieren mit Zod 4, deutsche Meldungen über `error`-Parameter je Feld.
- [ ] **Schritt 4:** Grün, Build grün.
- [ ] **Schritt 5:** Commit `Werkstatt: Schemas der Tag-1-Artefakte mit Kaffeebar-Beispielen und API-Vertrag`. Danach weiter mit Task 3; T1–T3 gehen als ein PR (nach Markus' Okay) – Startsignal für Welle 1.

---

### Task 3: Hono-Gerüst, Middleware-Ausnahme, Vercel-Konfiguration

**Files:**
- Create: `api/werkstatt.ts` (nur `export default { fetch: (req: Request) => app.fetch(req) }` mit `app = appErstellen(produktionsAbhaengigkeiten())`)
- Create: `src/werkstatt/server/app.ts`, `umgebung.ts`, `antwort.ts`, `typen.ts`, `cache.ts`
- Create (Stubs, je `export function xRouten(abh: Abhaengigkeiten): Hono`, jede Route 501 `unbekannt`): `src/werkstatt/server/routen/auth.ts` (`authRouten`), `routen/mappe.ts` (`mappeRouten`), `oauth/routen.ts` (`oauthRouten`), `mcp/server.ts` (`mcpRouten`) – T4, T11, T7, T12 ersetzen nur ihre Datei
- Create: `scripts/werkstatt-dev.ts` (`@hono/node-server`, Port 8787, `fakeSpeicher` und Fake-Identität mit Auswahl einer Testperson; verweigert ohne `istLokal`)
- Modify: `astro.config.mjs` (`vite.server.proxy['/api/werkstatt'] = 'http://localhost:8787'`), `src/lib/kurszugang.ts` (`istOeffentlich`), `vercel.json` (`regions`, `functions`, `rewrites`)
- Test: `src/lib/middleware-matcher.test.ts` (erweitern), `src/werkstatt/server/app.test.ts`

**Interfaces:**
- Consumes: `ApiFehler` (Task 2)
- Produces:
  - `interface Abhaengigkeiten { umgebung: Umgebung; speicher: Speicher; github: GithubIdentitaet; cache: Cache; jetzt(): number }` – alles in `server/typen.ts`, implementiert in T4 (Identität) und T5 (Speicher)
  - `interface Umgebung { githubAppId: string; githubPrivateKey: string; githubClientId: string; githubClientSecret: string; sessionSecret: string; tokenKeys: Schluessel[]; zugang: Zugang; origin: string | null; lokal: boolean }`
  - `interface Schluessel { kid: string; key: Uint8Array }` – geparst aus `MCP_TOKEN_KEYS` (`<kid>:<base64 32 B>`, kommagetrennt, erster = aktuell)
  - `interface Cache { get(k: string): Promise<unknown>; set(k: string, v: unknown, ttlSek: number): Promise<void> }` – `vercelCache()` über `getCache()` (wie `api/position.ts`), `mapCache()` für Tests und Dev
  - `origin(c): string` = `umgebung.origin ?? new URL(c.req.url).origin`
  - `appErstellen(abh: Abhaengigkeiten): Hono` – mountet `authRouten` unter `/api/werkstatt/auth`, `mappeRouten` unter `/api/werkstatt/mappe`, `oauthRouten` unter `/api/werkstatt/oauth` und zusätzlich für `/api/werkstatt/mcp/resource` und die zwei `/.well-known/…`-Pfade (vor `mcpRouten` registriert), `mcpRouten` unter `/api/werkstatt/mcp`; Fallback 404 als `ApiFehler`
  - `umgebungLesen(env: NodeJS.ProcessEnv): Umgebung` – wirft bei fehlenden Secrets, normalisiert wörtliches `\n` im PEM; `istLokal(env)` = `NODE_ENV` ∈ {development, test}
  - `fehler(c, status, code, satz)` und `json(c, daten, status?)` mit `Cache-Control: no-store`
  - CSRF-Middleware für `POST/PUT/DELETE` unter `/api/werkstatt/mappe/*`, `/api/werkstatt/auth/abmelden` und die Zustimmung `POST /api/werkstatt/oauth/authorize` (dort nur Origin-Prüfung, Formular erlaubt): `Content-Type` beginnt mit `application/json` (außer Abmelden) und `Origin` = eigene Origin → sonst 403 `csrf`
- `server/typen.ts` legt fest:
  - `interface Speicher { anlegen(m: Mitgliedschaft, githubId: number): Promise<{ repo: string }>; lesen(repo: string, name: ArtefaktName): Promise<{ daten: unknown | null; basisSha: string | null }>; speichern(repo: string, name: ArtefaktName, dateien: Record<string, string>, basisSha: string | null, autor: { name: string; email: string }, nachricht: string): Promise<{ basisSha: string; commitUrl: string } | { konflikt: true }>; uebersicht(repo: string): Promise<{ name: ArtefaktName; vorhanden: boolean }[]>; werkstattJson(repo: string): Promise<{ kohorte: string; githubId: number } | null> }` – `basisSha` ist immer der Blob-SHA von `mappe/<name>.json`
  - `interface GithubIdentitaet { loginUrl(state: string, redirectUri: string): string; codeEinloesen(code: string, redirectUri: string): Promise<{ githubId: number; login: string }> }`

- [ ] **Schritt 1: Tests**
  - Middleware: `/api/werkstatt`, `/api/werkstatt/mcp`, `/api/werkstatt/oauth/token`, `/.well-known/oauth-authorization-server/api/werkstatt/oauth` öffentlich; `/api/werkstattx`, `/api/position`, `/innolab/mappe`, `/.well-known/anderes` nicht.
  - `app.test.ts`: `GET /.well-known/oauth-protected-resource/api/werkstatt/mcp` und `GET /api/werkstatt/mcp/resource` erreichen beide `oauthRouten` (Stub 501), nicht `mcpRouten`.
  - `app.test.ts`: `GET /api/werkstatt/gibtsnicht` → 404 mit `{ code: 'unbekannt' }`; `PUT /api/werkstatt/mappe/brief` mit `Origin: https://boese.example` → 403 `csrf`; ohne `Content-Type: application/json` → 403 `csrf`.
  - `umgebungLesen({})` wirft; `istLokal({ NODE_ENV: undefined })` → false; `istLokal({ NODE_ENV: 'production' })` → false.
- [ ] **Schritt 2:** FAIL.
- [ ] **Schritt 3:** Implementieren. `vercel.json` ergänzen: `"regions": ["fra1"]`, `"functions": { "api/werkstatt.ts": { "maxDuration": 30 } }`, `"rewrites"`: `/api/werkstatt/:pfad*` → `/api/werkstatt`, `/.well-known/oauth-authorization-server/api/werkstatt/oauth` → `/api/werkstatt`, `/.well-known/oauth-protected-resource/api/werkstatt/mcp` → `/api/werkstatt`. Kommentarblock in `middleware.ts` um die Ausnahme ergänzen.
- [ ] **Schritt 4:** Grün; `npm run build`; `npm run werkstatt:dev` + `npm run dev`: `curl localhost:4321/api/werkstatt/gibtsnicht` → 404-JSON über den Proxy. **Preview-Probe:** Branch deployen; `curl <preview>/api/werkstatt/mcp` und `curl <preview>/.well-known/oauth-authorization-server/api/werkstatt/oauth` landen beide in der Funktion (Stub-JSON, nicht Login-Seite), und `request.url` enthält den ursprünglichen Pfad; Ergebnis im PR notieren.
- [ ] **Schritt 5:** Commit `Werkstatt: Hono-App unter /api/werkstatt, vom Kurspasswort ausgenommen`. PR mit T1–T3 öffnen, `/code-review`, nach Markus' Okay mergen – Startsignal für Welle 1.

---

### Task 4: Sitzung und GitHub-Login

**Files:**
- Create: `src/werkstatt/server/sitzung.ts`, `src/werkstatt/server/routen/auth.ts`, `src/werkstatt/server/github/identitaet.ts`
- Test: `src/werkstatt/server/sitzung.test.ts`, `src/werkstatt/server/routen/auth.test.ts`

**Interfaces:**
- Consumes: `mitgliedschaften`, `zugangLesen`, `KOHORTEN` (T1); `Abhaengigkeiten`, `GithubIdentitaet`, `Speicher.anlegen` (T3)
- Produces:
  - `COOKIE_WERKSTATT = 'ndu_werkstatt'`, Gültigkeit 30 Tage
  - `interface Sitzung { githubId: number; login: string; kohorte: string; rolle: Rolle; exp: number }`
  - `sitzungErstellen(s: Sitzung, secret: string): Promise<string>` / `sitzungLesen(cookie: string | undefined, secret: string, jetztSek: number): Promise<Sitzung | null>` – HMAC-SHA256 über base64url-JSON, Vergleich zeitkonstant (wie `kurszugang.ts`)
  - Hono-Middleware `mitSitzung` setzt `c.var.sitzung` oder antwortet 401 `nicht-angemeldet`
  - Routen: `GET auth/ich` → `Ich`; `GET auth/login?weiter=` (state-Cookie `__Host-werkstatt_state`, 10 min, plus `weiter` über `sichererPfad`) → 302 zu GitHub; `GET auth/callback` → state prüfen → `codeEinloesen` → `mitgliedschaften` → keine: 302 auf `/innolab/mappe?fehler=nicht-freigeschaltet`; sonst Studierende: `speicher.anlegen` (scheitert es, trotzdem Cookie setzen; `/innolab/mappe` zeigt „Deine Mappe wird eingerichtet …“, T11 versucht erneut) → Cookie setzen → 302 auf `weiter`; `POST auth/abmelden` löscht Cookie
  - `githubIdentitaet(env)`: GitHub-App-User-Autorisierung (`https://github.com/login/oauth/authorize?client_id=…&state=…&redirect_uri=…`, Token-Tausch gegen `https://github.com/login/oauth/access_token`, dann `GET https://api.github.com/user` → `id`, `login`). Das User-Token wird nicht gespeichert.

- [ ] **Schritt 1: Tests** (mit Fake-`GithubIdentitaet` und Fake-`Speicher`)
  - Sitzung: Rundlauf; manipulierte Signatur → null; abgelaufen → null.
  - Callback mit falschem `state` → 400, kein Cookie.
  - Callback für unbekannte ID → 302 `/innolab/mappe?fehler=nicht-freigeschaltet`, `anlegen` nie aufgerufen.
  - `umbenannter login behält zugang`: Fake liefert `{ githubId: 1001, login: 'neuer-name' }` → Cookie gesetzt, `anlegen` mit Kürzel `sofie`.
  - Lehrende: Cookie mit `rolle: 'lehrende'`, `anlegen` nicht aufgerufen.
  - `weiter=https://boese.example` → Ziel `/`.
- [ ] **Schritt 2:** FAIL. **Schritt 3:** Implementieren. **Schritt 4:** Grün + Build.
- [ ] **Schritt 5:** Commit `Werkstatt: Anmeldung mit GitHub und Sitzungs-Cookie`.

---

### Task 5: GitHub-Speicher (App-Token, Anlegen, atomares Speichern) und Fake

**Files:**
- Create: `src/werkstatt/server/github/app-token.ts`, `src/werkstatt/server/github/speicher.ts`, `src/werkstatt/server/github/fake.ts`
- Test: `src/werkstatt/server/github/speicher.test.ts` (gegen `fake.ts`), `app-token.test.ts`

**Interfaces:**
- Consumes: `Speicher` (T3), `Kohorte`, `repoName` (T1), `getCache` aus `@vercel/functions` (wie `api/position.ts`)
- Produces:
  - `appJwt(appId: string, privateKeyPem: string, jetztSek: number): Promise<string>` – RS256, `iat = jetzt - 60`, `exp = jetzt + 540`; Schlüssel per `createPrivateKey(pem)` aus `node:crypto` (GitHub liefert PKCS#1, `jose.importPKCS8` lehnt das ab), signiert mit jose `SignJWT`
  - `installationToken(opts: { org: string; repoId?: number; rechte: Record<string, 'read' | 'write'> }): Promise<string>` – Installation über `GET /orgs/{org}/installation`; mit `repoId` → `repository_ids: [repoId]`; Cache (`abh.cache`) mit Schlüssel `gh-token:<org>:<repoId|org>:<rechte>`, TTL 50 min; Repo-Name → numerische ID einmal über `GET /repos/{org}/{name}` mit dem Org-Token auflösen und cachen
  - `githubSpeicher(abh: { fetch: typeof fetch; token: typeof installationToken; kohorte: Kohorte }): Speicher`
    - `anlegen`: `POST /repos/{org}/{vorlage}/generate` `{ owner: org, name, private: true }`; 422 mit „already exists“ → `werkstattJson` lesen: passt oder fehlt → Erfolg, fremde ID → `Error('repo-gehoert-anderer-person')`; danach warten, bis `GET git/ref/heads/main` existiert (alle 1 s, höchstens 8 s; GitHub kopiert die Vorlage nicht garantiert synchron), dann `werkstatt.json` schreiben, falls es fehlt
    - `speichern`: Kopf `main` lesen → Blob-SHA von `mappe/<name>.json` im Kopf-Tree mit `basisSha` vergleichen (beide `null` = neu) → ungleich: `{ konflikt: true }` → Blobs → `POST git/trees` mit `base_tree` = Kopf-Tree → `POST git/commits` `{ parents: [kopf], author, committer: Bot }` → `PATCH git/refs/heads/main` `{ sha, force: false }`; 422 „not a fast forward“ (anderes Artefakt gleichzeitig gespeichert) → einmal von vorn; zweites 422 → `{ konflikt: true }`. Rückgabe `basisSha` = neuer Blob-SHA der JSON-Datei
    - `lesen`: Datei `mappe/<name>.json` über Contents-API → `basisSha` = deren `sha`; 404 → `daten: null`, `basisSha: null`
    - `uebersicht`: eine Tree-Abfrage `GET git/trees/main?recursive=1` → welche `mappe/*.json` existieren
  - `fakeSpeicher(): Speicher & { commits(repo): FakeCommit[]; aendernVonAussen(repo, name): void }` mit `interface FakeCommit { dateien: Record<string, string>; autor: { name: string; email: string }; nachricht: string }` – nur in Tests und bei `istLokal`
  - `fakeGithub(): { fetch: typeof fetch; zustand }` – Attrappe der REST-Endpunkte; `PATCH git/refs` antwortet 422 genau dann, wenn `parents[0]` des neuen Commits nicht der aktuelle Kopf ist (echtes Fast-Forward-Modell, kein Schalter)

- [ ] **Schritt 1: Tests** (Fake-GitHub als `fetch`-Attrappe, nicht nur `fakeSpeicher`, damit die echte Implementierung läuft)
  - `speichern schreibt einen commit mit drei dateien`: JSON, MD, README in genau einem `git/commits`-Aufruf; `author.email` = `1001+sofiethon@users.noreply.github.com`.
  - `speichern mit veraltetem basisSha`: Annahmen wurden zwischendurch von außen geändert → `{ konflikt: true }`, Kopf unverändert.
  - `anderes artefakt blockiert nicht`: Brief und Annahmen mit je eigenem `basisSha` nacheinander gespeichert → beide erfolgreich, zwei Commits.
  - `wettlauf beim ref-update`: zwischen Commit und PATCH bewegt sich der Kopf (Fake-Hook) → ein Neuversuch, dann Erfolg.
  - `anlegen wartet auf main`: Fake liefert `main` erst beim dritten Abruf → `werkstatt.json` wird danach geschrieben.
  - `anlegen ist idempotent`: erster Aufruf 201, zweiter 422 „exists“ mit passender `werkstatt.json` → Erfolg; mit fremder ID → wirft.
  - Token-Cache: zweiter Aufruf innerhalb 50 min ruft `access_tokens` nicht erneut.
  - `appJwt`: Header `alg: RS256`, `iss` = App-ID (Test-Schlüssel per `generateKeyPair`).
- [ ] **Schritt 2:** FAIL. **Schritt 3:** Implementieren. **Schritt 4:** Grün + Build.
- [ ] **Schritt 5:** Commit `Werkstatt: Mappe-Repos über die GitHub App anlegen und atomar speichern`.

---

### Task 6: Markdown-Renderer und README

**Files:**
- Create: `src/werkstatt/render/brief.ts`, `entscheidungen.ts`, `leitfaden.ts`, `annahmen.ts`, `readme.ts`, `index.ts`
- Test: `src/werkstatt/render/render.test.ts` (Snapshots der Kaffeebar-Beispiele)

**Interfaces:**
- Consumes: Schemas und Beispiele (T2)
- Produces:
  - `rendern(name: ArtefaktName, daten: ArtefaktDaten): string` – Markdown in der Struktur der bisherigen Vorlagen (Überschriften wie auf den Methodenseiten), Datum österreichisch, IDs fett, Belegstufe ausgeschrieben
  - `readmeRendern(k: Kohorte, vorhanden: { name: ArtefaktName; vorhanden: boolean }[]): string` – Titel, Kohorte, Tabelle aller Artefakte der Kohorte mit Link auf `mappe/<name>.md` (vorhanden) oder „noch offen“; braucht keine Daten der anderen Artefakte
  - `dateienFuerSpeichern(name, daten, readme): Record<string, string>` – genau `mappe/<name>.json` (2 Leerzeichen, abschließender Zeilenumbruch), `mappe/<name>.md`, `README.md`

- [ ] **Schritt 1:** Snapshot-Tests der vier Beispiele, dazu je Renderer eine ausdrückliche Prüfung (z. B. `22.10.2026` statt ISO-Datum), damit Snapshot-Änderungen nichts verdecken; Test: ersetzte Entscheidung zeigt „ersetzt am 05.11.2026“; riskanteste Annahme markiert „(riskanteste)“.
- [ ] **Schritt 2:** FAIL. **Schritt 3:** Implementieren. **Schritt 4:** Snapshots durchsehen (Deutsch, keine Platzhalter), grün.
- [ ] **Schritt 5:** Commit `Werkstatt: Artefakte als lesbares Markdown`.

---

### Task 7: OAuth-Autorisierungsserver für den Connector

**Files:**
- Create: `src/werkstatt/server/oauth/umschlag.ts` (Port von capitelize `src/oauth/token-codec.ts`), `metadaten.ts`, `clients.ts`, `routen.ts`, `zustimmung.ts` (HTML der Zustimmungsseite)
- Test: `src/werkstatt/server/oauth/oauth.test.ts`, `umschlag.test.ts`

**Interfaces:**
- Consumes: `Sitzung`, `sitzungLesen`, Login-Route (T4), `mitgliedschaften` (T1)
- Produces:
  - `ISSUER = <origin> + '/api/werkstatt/oauth'`, `RESOURCE = <origin> + '/api/werkstatt/mcp'`
  - `type UmschlagTyp = 'code' | 'access' | 'refresh'`
  - `versiegeln(typ: UmschlagTyp, inhalt: object, ttlSek: number, schluessel: Schluessel[]): Promise<string>` / `oeffnen(typ, token, schluessel, jetztSek): Promise<object | null>` – AES-256-GCM, Schlüsselrotation wie capitelize (`MCP_TOKEN_KEYS`)
  - `interface TokenClaims { githubId: number; kohorte: string; rolle: Rolle; clientId: string; exp: number }`
  - Routen:
    - `GET oauth/metadata` und `GET /.well-known/oauth-authorization-server/api/werkstatt/oauth` (gleiches JSON; `ISSUER` und Endpunkte aus `origin(c)`): `issuer`, `authorization_endpoint`, `token_endpoint`, `response_types_supported: ['code']`, `grant_types_supported: ['authorization_code','refresh_token']`, `code_challenge_methods_supported: ['S256']`, `token_endpoint_auth_methods_supported: ['none']`, `client_id_metadata_document_supported: true`, `authorization_response_iss_parameter_supported: true`, `scopes_supported: ['mappe', 'offline_access']`
    - `GET /api/werkstatt/mcp/resource` und `GET /.well-known/oauth-protected-resource/api/werkstatt/mcp`: `resource: RESOURCE`, `authorization_servers: [ISSUER]`, `scopes_supported: ['mappe']`
    - `GET oauth/authorize`: prüft `client_id` per `clientErlaubt`, `redirect_uri` exakt aus `clients.ts`, `code_challenge_method=S256` Pflicht; ohne Sitzung → Weiterleitung zu `auth/login?weiter=<diese URL>`; mit Sitzung → Zustimmungsseite („Claude (claude.ai) möchte deine Mappe lesen“, Host deutlich); POST Zustimmung → Code-Umschlag 60 s mit `{ clientId, redirectUri, codeChallenge, githubId, kohorte, rolle }` → 302 mit `code`, `state`, `iss`
    - `POST oauth/token` (`application/x-www-form-urlencoded`): `authorization_code` mit PKCE-Prüfung → `access` (1 h) + `refresh` (30 Tage); `refresh_token` → neues Paar, altes Refresh im Runtime Cache als verbraucht markiert (TTL 30 Tage); verbraucht/abgelaufen/archivierte Kohorte → 400 `invalid_grant`
  - `clients.ts`: `clientErlaubt(clientId: string): { redirectUris: string[] } | null` – erlaubt https-URLs mit Host `claude.ai` (redirect `https://claude.ai/api/mcp/auth_callback`); Liste ergänzbar für ChatGPT in Phase 1b. Jede neue client_id wird einmal pro Tag geloggt (für die Probe in T15).
  - `bearerPruefen(header: string | null): Promise<TokenClaims | null>` für T12

- [ ] **Schritt 1: Tests** (über Honos `app.request()` gegen `appErstellen` mit Fakes; aus capitelize nur die Hilfen `pkce()` und `form()` übernehmen)
  - Metadaten enthalten `none` und `client_id_metadata_document_supported: true`.
  - Authorize ohne `code_challenge` → 400; fremde `redirect_uri` → 400 ohne Weiterleitung.
  - Ganzer Ablauf: Sitzung → Zustimmung → Code → Token → `bearerPruefen` liefert Claims.
  - Code nach 61 s → `invalid_grant`; Code mit anderer `redirect_uri` → `invalid_grant`; falscher `code_verifier` → `invalid_grant`.
  - Refresh rotiert: neues Refresh-Token ≠ altes; altes erneut → `invalid_grant`.
  - Kohorte auf `archiviert` → Refresh `invalid_grant`.
- [ ] **Schritt 2:** FAIL. **Schritt 3:** Implementieren. **Schritt 4:** Grün + Build.
- [ ] **Schritt 5:** Commit `Werkstatt: OAuth für den Claude-Connector ohne Datenbank`.

---

### Task 8: Editor-Hülle, API-Client, Felder

**Files:**
- Create: `src/werkstatt/ui/api.ts`, `src/werkstatt/ui/EditorHuelle.tsx`, `src/werkstatt/ui/entwurf.ts`, `src/werkstatt/ui/felder/{Textfeld,Liste,Auswahl,VerweisAuswahl}.tsx`, `src/styles/werkstatt.css`
- Test: `src/werkstatt/ui/entwurf.test.ts`, `src/werkstatt/ui/huelle.test.ts` (Zustandsmaschine ohne DOM)

**Interfaces:**
- Consumes: `vertrag.ts`, `artefaktParsen`, `ARTEFAKTE` (T2)
- Produces:
  - `api.ich(): Promise<Ich | null>`, `api.lesen(name): Promise<ArtefaktAntwort>`, `api.speichern(name, anfrage): Promise<SpeichernAntwort | { konflikt: true }>` – wirft `ApiError` mit `status` und `code`
  - `entwurfLaden(name, kohorte) / entwurfSichern(name, kohorte, daten) / entwurfLoeschen(...)` – `localStorage`-Schlüssel `ndu-werkstatt-<kohorte>-<name>`, alle Zugriffe in try/catch
  - `type HuellenZustand = 'laden' | 'abgemeldet' | 'wird-eingerichtet' | 'bereit' | 'speichert' | 'gespeichert' | 'konflikt' | 'fehler'` und reiner Reducer `huelle(zustand, ereignis): { zustand: HuellenZustand; effekte: Effekt[] }` mit `type Effekt = 'entwurfSichern' | 'entwurfLoeschen' | 'neuLaden'` (testbar ohne React; die Komponente führt die Effekte aus)
  - `<EditorHuelle name={ArtefaktName} titel bild={(daten) => ReactNode} formular={(daten, setze, fehler) => ReactNode} />` – `dialog`-Element mit Fokusfalle und Escape, Statuszeile `aria-live="polite"` mit `Entwurf` / `Gespeichert` / `Inzwischen geändert`, Knöpfe „Speichern“, „Für Claude kopieren“ (Markdown aus `rendern` plus Prüfliste aus `methoden.ts`, kopiert mit `kopiereText` aus `src/lib/kopieren.ts`), „Schließen“; Wurzel trägt `data-werkstatt`
  - Fehlertexte exakt aus Spec §5

- [ ] **Schritt 1: Tests**
  - `entwurf bleibt bei 401 und 502`: `huelle(bereit, speichern)` liefert `effekte` mit `entwurfSichern`; danach `speichernFehlgeschlagen(401)` → `abgemeldet`, `502` → `fehler`, und keiner der Schritte liefert `entwurfLoeschen`; nur `gespeichert` liefert `entwurfLoeschen`.
  - Konflikt → Zustand `konflikt`, Entwurf bleibt; „Neu laden“ lädt Server-Stand, Entwurf bleibt abrufbar.
  - `localStorage` wirft → Editor funktioniert weiter (kein Absturz).
  - Speichern bei Schemafehler gesperrt, bei reinen Prüflisten-Hinweisen erlaubt.
- [ ] **Schritt 2:** FAIL. **Schritt 3:** Implementieren (gegen `npm run werkstatt:dev` auf der Testseite `src/pages/innolab/werkstatt/[seite].astro` mit `getStaticPaths = () => import.meta.env.DEV ? [{ params: { seite: 'test' } }] : []` – im Build entsteht sie nicht). **Schritt 4:** Grün + Build; im Browser Tastatur-Durchlauf.
- [ ] **Schritt 5:** Commit `Werkstatt: Editor-Hülle mit Entwurf, Konflikt und Kopieren für Claude`.

---

### Task 9: Matrix2x2 als React-Bild

**Files:**
- Create: `src/werkstatt/ui/bild/matrix.css` (Stile aus `Matrix2x2.astro` kopiert, nur für React; die Astro-Komponente bleibt unverändert), `src/werkstatt/ui/bild/Matrix2x2.tsx`, `src/werkstatt/ui/bild/AnnahmenMatrix.tsx`
- Test: `src/werkstatt/ui/bild/annahmen-matrix.test.ts`

**Interfaces:**
- Consumes: `quadrant`, `punkt` (T2); Farben der vier Arten wie `VierArten.astro` (`yellow` wünschenswert, `blue` machbar, `green` wirtschaftlich, `purple` bedienbar)
- Produces:
  - `<Matrix2x2 …>` mit denselben Props wie die Astro-Version und identischem Markup/Klassen
  - `<AnnahmenMatrix annahmen={Annahme[]} riskanteste={string | null} />` – Achsen wie auf `annahmen.astro` (nach oben wichtig, nach rechts belegt, Feld `ol` hervorgehoben), Sticky-Text `A1 · <gekürzt auf 40 Zeichen>`, Farbe nach Art plus Text der Art im Screenreader-Text
  - `annahmenPunkte(annahmen, riskanteste): { t: string; x: number; y: number; hervor: boolean; farbe: string }[]` (rein, getestet)

- [ ] **Schritt 1: Tests:** Kaffeebar-Beispiel ergibt vier Punkte, A1 `hervor`; Text über 40 Zeichen gekürzt mit „…“.
- [ ] **Schritt 2:** FAIL. **Schritt 3:** Implementieren; im Browser neben die Astro-Folie legen: gleiche Achsen, Farben, Beschriftung.
- [ ] **Schritt 4:** Grün + Build.
- [ ] **Schritt 5:** Commit `Matrix2x2 als React-Bild für den Annahmen-Editor`.

---

### Task 10: Vorlagen-Repo-Inhalt und Setup-Seite für Claude

**Files:**
- Create: `werkstatt-vorlage/README.md`, `werkstatt-vorlage/AGENTS.md`, `werkstatt-vorlage/mappe/.gitkeep` (Inhalt für `ndu-innolab/mappe-vorlage-2026`, kohortenneutral)
- Create: `src/pages/innolab/werkstatt/claude.astro`
- Test: nur Build (Navigationseinträge macht Task 14)

**Interfaces:**
- Produces:
  - `AGENTS.md`: was in `mappe/` liegt, ID-Grammatik, Belegstufen, „JSON ist die Quelle, `.md` ist generiert“, „Nicht in diesem Repo schreiben – Änderungen nur über die Werkstatt“
  - Setup-Seite (Deutsch, „ihr“, Präsentationsformat mit kurzen Schritten): 1. claude.ai → Einstellungen → Connectors → „Benutzerdefinierten Connector hinzufügen“, Name „NDU Werkstatt“, URL `https://ndu.datamonkeys.ai/api/werkstatt/mcp`, Auth-Einstellung „Claudes veröffentlichte Identität“ (genaue Beschriftung nach der Probe in T15 ergänzen, Screenshots dann); 2. Verbinden → GitHub-Login → Zustimmen; 3. Einstellungen → Datenschutz → Modelltraining aus; 4. Prüfen-Prompt: „Prüf meine Annahmen-Map mit der Werkstatt.“; Plan-B-Absatz mit „Für Claude kopieren“
  - Seite trägt `data-werkstatt` an Knöpfen, ist im Beamer lesbar (Folien-Komponenten)

- [ ] **Schritt 1:** Dateien anlegen; Markus pusht `werkstatt-vorlage/` nach `mappe-vorlage-2026` (oder Agent mit Markus' Okay per `gh`, `GH_TOKEN` pro Befehl).
- [ ] **Schritt 2:** `npm test`, `npm run build`, Seite im Browser bei 1280×720 und schmal prüfen.
- [ ] **Schritt 3:** Commit `Werkstatt: Vorlage der Mappe und Anleitung für den Claude-Connector`.

---

### Task 11: Mappe-Routen

**Files:**
- Create: `src/werkstatt/server/routen/mappe.ts`
- Test: `src/werkstatt/server/routen/mappe.test.ts`

**Interfaces:**
- Consumes: `mitSitzung` (T4), `Speicher` + `fakeSpeicher` (T5), `rendern`, `readmeRendern`, `dateienFuerSpeichern` (T6), `artefaktParsen` (T2), `repoName` (T1)
- Produces: Routen nach `vertrag.ts`:
  - `GET mappe` → `MappeStand` (Lehrende ohne Repo: 200 mit `artefakte: []` und `repo: ''` – Lehrende-Ansicht folgt Phase 2); fehlt das Repo noch, ruft die Route `speicher.anlegen` erneut auf (idempotent) und antwortet bei Misserfolg 503 `wird-eingerichtet`
  - `GET mappe/:artefakt` → `ArtefaktAntwort`; unbekannter Name → 404 `unbekannt`
  - `PUT mappe/:artefakt` → validiert (`422 ungueltig` mit `Feldfehler[]` unter `felder`), setzt `stand` auf heute (Wien), rendert, speichert; Konflikt → 409 `konflikt`; GitHub-Fehler → 502 `github-fehler`
  - Beim ersten Zugriff prüft die Route `werkstattJson(repo)` gegen die Sitzung; Abweichung → 403 `nicht-freigeschaltet`

- [ ] **Schritt 1: Tests** (gegen `appErstellen` mit `fakeSpeicher`)
  - PUT gültig → 200, Fake hat einen Commit mit drei Dateien; `stand` = heutiges Datum in `Europe/Vienna`.
  - PUT ungültig → 422, `felder[0].pfad` gesetzt, kein Commit.
  - PUT mit veraltetem `basisSha` → 409, kein Commit.
  - Brief und Annahmen nacheinander mit ihrem jeweils geladenen `basisSha` → beide 200.
  - Erstes `anlegen` beim Login gescheitert → `GET mappe` legt an und liefert 200.
  - Ohne Cookie → 401 `nicht-angemeldet`.
  - Repo mit fremder `werkstatt.json` → 403.
- [ ] **Schritt 2:** FAIL. **Schritt 3:** Implementieren. **Schritt 4:** Grün + Build.
- [ ] **Schritt 5:** Commit `Werkstatt: Mappe lesen und speichern über die API`.

---

### Task 12: MCP-Endpunkt und Werkzeuge

**Files:**
- Create: `src/werkstatt/server/mcp/server.ts`, `werkzeuge.ts`, `anweisung.ts`
- Test: `src/werkstatt/server/mcp/mcp.test.ts`

**Interfaces:**
- Consumes: `bearerPruefen`, `RESOURCE` (T7), `Speicher` (T5), `rendern` (T6), `METHODEN` aus `src/components/methoden.ts`, `ARTEFAKTE` (T2)
- Produces:
  - `ALL /api/werkstatt/mcp`: ohne gültiges Bearer → 401 mit `WWW-Authenticate: Bearer resource_metadata="<origin>/api/werkstatt/mcp/resource", scope="mappe"`; sonst neuer `McpServer` pro Anfrage mit `WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true })`
  - Server-Anweisung (`anweisung.ts`, deutsch, „du“): Tutor-Rolle, erst eigene Arbeit, nie Artefakttext formulieren, höchstens drei Befunde mit wörtlichem Zitat, zurückfragen, auf die Werkstatt zum Ändern verweisen
  - Werkzeuge (alle `annotations: { readOnlyHint: true }`, deutsche Beschreibungen, die ohne Prompts verständlich sind; optionale Argumente tolerieren `""`/`null` wegen ChatGPT):
    - Wo `outputSchema` gesetzt ist, muss der Handler `structuredContent` liefern (das SDK prüft es)
    - `mappe_uebersicht()` → Text + `structuredContent` = `MappeStand`
    - `artefakt_lesen({ artefakt })` → Markdown aus `rendern` + `structuredContent` = Daten
    - `methode_erklaeren({ slug })` → aus `METHODEN`: `name`, `frage`, `pruefliste`, `ki`, `quelle`, Link `https://ndu.datamonkeys.ai/innolab/methoden/<slug>`; nichts aus Seiten-Markup
    - `artefakt_pruefen({ artefakt })` → Artefakt-Markdown + Prüfpunkte `[{ id: '<slug>-<n>', text }]` + `outputSchema` `{ befunde: [{ pruefpunkt, zitat, frage }] (max 3) }`
  - Mappe immer aus Claims (`githubId`, `kohorte`), nie aus Argumenten

- [ ] **Schritt 1: Tests** (MCP-Client des SDK gegen die Hono-App mit Fakes)
  - Ohne Token → 401 mit `resource_metadata`-Verweis.
  - `tools/list` enthält genau die vier Namen, alle mit `readOnlyHint: true`.
  - `artefakt_pruefen('annahmen')` liefert die fünf Prüfpunkte aus `methoden.ts` mit IDs `annahmen-1` … `annahmen-5`.
  - `token liest nur eigene mappe`: Token für Kohorte `test`/Person X, Fake hat Repos von X und Y → nur X wird gelesen; ein Argument, das ein anderes Repo nennt, gibt es nicht.
  - `methode_erklaeren('interview')` enthält nicht den Text der Mom-Test-Auflösung (Stichprobe: kein „Ja, total!“).
- [ ] **Schritt 2:** FAIL. **Schritt 3:** Implementieren. **Schritt 4:** Grün + Build.
- [ ] **Schritt 5:** Commit `Werkstatt: MCP-Connector mit Lese- und Prüfwerkzeugen`.

---

### Task 13: Die vier Editoren

Ein Agent pro Editor möglich (13a–13d), gleiche Struktur.

**Files:**
- Create: `src/werkstatt/ui/editoren/BriefEditor.tsx`, `EntscheidungenEditor.tsx`, `LeitfadenEditor.tsx`, `AnnahmenEditor.tsx`, `src/werkstatt/ui/editoren/index.ts`
- Test: `src/werkstatt/ui/editoren/editoren.test.ts` (reine Hilfsfunktionen: Zeile hinzufügen, ID vergeben, ersetzen)

**Interfaces:**
- Consumes: `EditorHuelle`, Felder (T8), `AnnahmenMatrix` (T9), `naechsteId` (T1), Schemas (T2)
- Produces: `EDITOREN: Record<ArtefaktName, React.ComponentType>`; je Editor:
  - **Brief:** Felder in der Reihenfolge der Vorlage (1–7), Bild = Karten pro Abschnitt; „Produkt in einem Satz“ zeigt „offen bis Tag 3“
  - **Entscheidungen:** Tabelle (Datum, Entscheidung, Grund, Beleg, Beleg-IDs); „Neue Entscheidung“ vergibt `naechsteId('D')`; „Ersetzen“ legt neue Zeile mit `ersetzt` an, alte Zeile wird nicht editierbar und zeigt „ersetzt am …“; Löschen nur für noch nie gespeicherte Zeilen
  - **Leitfaden:** Ziel, Wen, Einstieg (vorbefüllt mit dem Einstiegstext der Vorlage), Fragen mit `F`-IDs und Art Kern/Nachfrage, Abschluss; keine Beispielfragen vorbefüllt (Mom-Test-Pointe)
  - **Annahmen:** Zeilen mit Text, Art, Wichtig, Beleg; Auswahl „riskanteste“; Bild = `AnnahmenMatrix` live; Hinweis, solange eine der vier Arten fehlt

- [ ] **Schritt 1: Tests:** `zeileHinzufuegen` vergibt fortlaufende IDs nach Löschen ohne Wiederverwendung; `ersetzen('D2')` erzeugt `D<n>` mit `ersetzt: 'D2'`, D2 unverändert.
- [ ] **Schritt 2:** FAIL. **Schritt 3:** Implementieren. **Schritt 4:** Grün + Build; Browser mit Fake-API: jedes Formular nur per Tastatur ausfüllbar, Kaffeebar-Beispiel lädt fehlerfrei.
- [ ] **Schritt 5:** Commit je Editor `Werkstatt: Editor <Name>`.

---

### Task 14: Seitenintegration Tag 1

**Files:**
- Create: `src/components/Bearbeiten.astro` (Knopf + `client:only="react"`-Island, `data-werkstatt`), `src/pages/innolab/mappe.astro`, `src/werkstatt/ui/MappeUebersicht.tsx`
- Modify: `src/pages/innolab/methoden/{problem-rahmen,entscheidungslog,interview,annahmen}.astro` (Knopf; Texte „in `docs/…` festhalten“ → „in der Werkstatt speichern“), `src/pages/innolab/tag-1/abschluss.astro` (Hausaufgabe), `src/components/methoden.ts` (`Ort` + `werkstatt`, `pfad` → `mappe/<artefakt>.json` für die vier; `pruefPrompt` für Werkstatt-Artefakte: „Prüf meine <Artefakt> mit der Werkstatt (artefakt_pruefen) gegen diese Prüfliste: …“ statt „Lies docs/…“), `src/components/ClaudePruefung.astro`, `src/styles/beamer.css` (`html[data-beamer] [data-werkstatt] { display: none }`), Navigation (Eintrag „Meine Mappe“)
- Test: `src/components/methoden.test.ts` (bestehende Erwartungen zu `docs/…` für die vier Tag-1-Artefakte auf die Werkstatt umstellen, die übrigen unverändert lassen), neuer Test `src/werkstatt/seiten.test.ts`

**Interfaces:**
- Consumes: `EDITOREN` (T13), `api` (T8), Routen (T11)
- Produces:
  - `<Bearbeiten artefakt="annahmen" />` – im Folienfluss nach „So geht ihr vor“, nicht in Folien, die eine Auflösung enthalten
  - `/innolab/mappe`: Liste der Artefakte mit Stand und „Bearbeiten“, Link zur Setup-Seite, Fehlerseite für `?fehler=nicht-freigeschaltet` (Text aus Spec §5)

- [ ] **Schritt 1: Tests:** `seiten.test.ts`: jede Methode mit `ergibt` ∈ Werkstatt-Artefakten hat auf ihrer Seite `<Bearbeiten artefakt=…>` (Dateiinhalt lesen wie `folien-seiten.test.ts`); keine der vier Seiten nennt noch `docs/PRODUKT.md`, `docs/ENTSCHEIDUNGEN.md`, `docs/interviews/LEITFADEN.md`, `docs/ANNAHMEN.md`; `folien-seiten.test.ts` bleibt grün.
- [ ] **Schritt 2:** FAIL. **Schritt 3:** Implementieren. **Schritt 4:** Grün + Build; Beamer-Probe: Knopf unsichtbar, alle Folien passen weiter bei 1280×720 (mit echten Klicks auf Auflösungen, wie im Handover beschrieben).
- [ ] **Schritt 5:** Commit `Innolab Tag 1: Artefakte in der Werkstatt statt in docs/`.

---

### Task 15: Preview-Probe, Ende-zu-Ende, Go/No-Go (Mo–Di)

- [ ] **Schritt 1 (Mo, sobald T3+T7 gemergt sind):** Preview-Deploy (Deployment Protection aus, siehe T0). Prüfen mit `curl`: `/api/werkstatt/mcp` → 401 mit `resource_metadata`; beide Metadaten-Pfade (unter `/api/werkstatt/…` und `/.well-known/…`) erreichbar ohne Kurs-Cookie. In claude.ai (Markus' Konto) Connector mit der Preview-URL hinzufügen; im Log die gesendete `client_id` ablesen.
- [ ] **Schritt 2:** `clients.ts` auf die beobachtete client_id festziehen; Setup-Seite (T10) mit den echten Beschriftungen und Screenshots ergänzen.
- [ ] **Schritt 3 (Di):** E2E auf Prod mit Markus' Zweitkonto in Kohorte `test`: Login → Repo `test-<kuerzel>` entsteht → vier Artefakte speichern → Commits mit Person als Autor*in → zweiter Tab mit altem Stand → 409 → Connector in claude.ai verbinden → „Prüf meine Annahmen-Map mit der Werkstatt“ → Befunde mit Zitaten, keine Änderung im Repo.
- [ ] **Schritt 4 (Di 18:00):** Go/No-Go mit Markus. Go → Tag 1 mit Connector. No-Go → Setup-Seite zeigt nur Plan B, Connector zur Hausaufgabe.
- [ ] **Schritt 5 (Mi 12:00):** Freeze. `/code-review` über alle gemergten PRs der Woche, Befunde ≥ 80 vor Tag 1 beheben.

---

## Nach dem MVP (eigene Pläne, je Kurstag)

- **Phase 1b (vor Tag 2):** Interview-Editor I1–I5 (Pseudonym, Einwilligung, Zitat-IDs `I1-1`), `verknuepfungen_pruefen`, `vorschlag_hinterlegen` + Vorschläge im Editor, Datenschutzhinweis für Interviewte, ChatGPT-Client (`https://chatgpt.com/oauth/client.json`, `private_key_jwt` aus capitelize).
- **Phase 2 (Tag 2):** Schemas und Editoren Synthese, Kundenprofil, Journey Map (Bild „Kurve“), HMW, Ideation; Lehrende-Ansicht mit Kohortenwahl; Verlauf pro Artefakt; React-`Zeitleiste`.
- **Phase 3 (Tag 3):** Value Map („Canvas“), Storys, Experimente, Story Map; OST aus Verweisen; Kalibrierungslog; Abruf; Peer-Review.
- **Phase 4 (Tag 4–7):** MCP-Apps-Ansicht, Export nach `docs/` des App-Repos, ZIP-Export, Transfer-Anleitung, Archivierung.
