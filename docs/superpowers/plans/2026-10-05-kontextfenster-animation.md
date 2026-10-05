# Kontextfenster-Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static context-window click widget on `/konzepte/coding-agent` with a 9-step, keyboard-driven animation (React island + Motion) that Markus can present on a projector and students can reread.

**Architecture:** Pure step data and logic live in `kontextfenster-steps.ts` (unit-tested with Vitest). A generic `Stage` React component owns navigation, keyboard scope, fullscreen, captions and screen-reader output; the `Kontextfenster` scene renders blocks for the current step with Motion width animations. The scene is embedded in the Astro page with `client:visible`; step 1 is server-rendered without entry animation so it is visible without JavaScript.

**Tech Stack:** Astro 7.3.5, `@astrojs/react` 7.0.0, React 19, `motion` 14.0.0 (`motion/react`), Vitest 5, plain CSS with the tokens in `src/styles/global.css`.

**Spec:** `docs/superpowers/specs/2026-10-05-kontextfenster-animation-design.md`

## Global Constraints

- Repo: `ndu-coding-site/`, branch `kontextfenster-animation` (stacked on `sprache-und-termine`). Do not touch `main`, do not push.
- Node ≥ 22.12.0 (already in `package.json` engines).
- New runtime deps exactly: `@astrojs/react@^7`, `react@^19`, `react-dom@^19`, `motion@^14`. New dev deps exactly: `@types/react`, `@types/react-dom`, `vitest@^5`. Nothing else.
- Imports for animation come from `motion/react`. No Motion `layout` prop on blocks.
- All visible text German, „ihr“-Anrede (umgestellt 5.10.), „*innen“, „…“-Anführungszeichen, Halbgeviertstrich „ – “. Captions verbatim from the spec table.
- Colours only via tokens from `global.css` (`--purple`, `--accent`, `--green`, `--yellow`, `--blue`, `--muted`, `--bg`, `--bg-2`, `--fg`, `--border`, `--radius`, `--mono`). Dark mode follows the existing pattern: `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) … }` plus `:root[data-theme="dark"] …`.
- Mobile breakpoint 900 px; must work at 390 px width without horizontal scroll.
- Commit messages in German; subject = result for users; end with `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.
- After writing any file, it must not contain raw U+2028/U+2029/U+200B/BOM (check: `LC_ALL=C grep -rlP '\xe2\x80[\xa8\xa9\x8b]|\xef\xbb\xbf' src` prints nothing).

## Review Focus

1. **Presenter taps → quickly during the step-6 prelude (or presses → three times fast from step 5):** the view must end on the correct step's final state, never stuck on the 96 % prelude and never showing step-6 blocks on step 7. Pinned by Task 3, Step 4.
2. **Space bar after clicking a button:** exactly one step forward, and the page must not scroll while the stage has focus. Pinned by Task 3, Step 3.
3. **Escape out of fullscreen:** button label returns to „Vollbild“, arrow keys still work after clicking the stage. Pinned by Task 3, Step 6.
4. **Site theme forced via `data-theme="dark"` / `"light"` (not just OS setting):** block labels stay readable in both. Pinned by Task 3, Step 5.
5. **Projector at browser zoom 150 % (≈ 1280 px CSS width → ~850 px):** frame, legend, caption and controls don't overflow horizontally. Pinned by Task 3, Step 5.

---

### Task 1: Step data and logic (with test setup)

**Files:**
- Modify: `package.json` (deps, `"test"` script)
- Create: `src/components/sota/kontextfenster-steps.ts`
- Test: `src/components/sota/kontextfenster-steps.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces (exact):
  - `export type Art = 'fest' | 'auftrag' | 'datei' | 'werkzeug' | 'verlauf' | 'zusammenfassung';`
  - `export interface Block { id: string; art: Art; label: string; size: number; verblasst?: boolean; tag?: string }`
  - `export interface Schritt { title: string; text: string }` — `text` may contain inline code in backticks.
  - `export const STEPS: Schritt[]` (length 9)
  - `export function blocksAt(step: number): Block[]` — `step` is 1-based (1–9); throws `RangeError` otherwise.
  - `export function preludeAt(step: number): Block[] | null` — non-null only for step 6.
  - `export function fillOf(blocks: Block[]): number` — sum of `size`.
  - `export const PRELUDE_MS = 900;`

- [ ] **Step 1: Install dependencies and add the test script**

Run in `ndu-coding-site/`:
```bash
npm install @astrojs/react@^7 react@^19 react-dom@^19 motion@^14
npm install -D @types/react @types/react-dom vitest@^5
npm pkg set scripts.test="vitest run"
```
Expected: `package.json` lists the four deps and three dev deps; `npm ls motion vitest @astrojs/react` shows 14.x, 5.x, 7.x. An npm warning about the optional peer `oxc-transform-react` is fine.

- [ ] **Step 2: Write the failing tests**

Create `src/components/sota/kontextfenster-steps.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { STEPS, blocksAt, fillOf, preludeAt, type Art } from './kontextfenster-steps';

const FILL = [14, 18, 46, 74, 82, 30, 34, 14, 18];
const kinds = (step: number): Art[] => blocksAt(step).map((b) => b.art);
const count = (step: number, art: Art) => kinds(step).filter((a) => a === art).length;

describe('kontextfenster-steps', () => {
  it('hat neun Schritte mit Titel und Text', () => {
    expect(STEPS).toHaveLength(9);
    for (const s of STEPS) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.text.length).toBeGreaterThan(0);
    }
  });

  it.each(FILL.map((fill, i) => [i + 1, fill]))('Schritt %i ist zu %i Prozent belegt', (step, fill) => {
    expect(fillOf(blocksAt(step))).toBe(fill);
  });

  it('Auftakt von Schritt 6 steht bei 96 %', () => {
    const prelude = preludeAt(6);
    expect(prelude).not.toBeNull();
    expect(fillOf(prelude!)).toBe(96);
  });

  it('nur Schritt 6 hat einen Auftakt', () => {
    for (let step = 1; step <= 9; step++) {
      if (step !== 6) expect(preludeAt(step)).toBeNull();
    }
  });

  it('übersteigt in keinem Zustand 100 Einheiten', () => {
    for (let step = 1; step <= 9; step++) {
      expect(fillOf(blocksAt(step))).toBeLessThanOrEqual(100);
    }
    expect(fillOf(preludeAt(6)!)).toBeLessThanOrEqual(100);
  });

  it('Systemregeln und CLAUDE.md sind in jedem Schritt da', () => {
    for (let step = 1; step <= 9; step++) {
      const ids = blocksAt(step).map((b) => b.id);
      expect(ids).toContain('sys');
      expect(ids).toContain('claude-md');
    }
  });

  it('Schritt 5: Auftrag und die ersten zwei Dateien verblassen, sonst nichts', () => {
    const faded = blocksAt(5).filter((b) => b.verblasst).map((b) => b.id).sort();
    expect(faded).toStrictEqual(['auftrag', 'datei-1', 'datei-2']);
  });

  it('Schritt 6: kein Auftrag mehr, genau eine Zusammenfassung', () => {
    expect(count(6, 'auftrag')).toBe(0);
    expect(count(6, 'zusammenfassung')).toBe(1);
  });

  it('Schritt 7: Auftrag bleibt neben der Zusammenfassung', () => {
    expect(count(7, 'auftrag')).toBe(1);
    expect(count(7, 'zusammenfassung')).toBe(1);
    expect(blocksAt(7).find((b) => b.art === 'auftrag')?.tag).toBe('bleibt');
  });

  it('Schritt 8: nur feste Blöcke', () => {
    expect(new Set(kinds(8))).toStrictEqual(new Set<Art>(['fest']));
  });

  it('Schritt 9: ENTSCHEIDUNGEN.md ist ein fester, verknüpfter Block', () => {
    const e = blocksAt(9).find((b) => b.id === 'entscheidungen');
    expect(e?.art).toBe('fest');
    expect(e?.tag).toBe('in CLAUDE.md verknüpft');
  });

  it('Block-IDs sind je Zustand eindeutig', () => {
    const states = [...Array.from({ length: 9 }, (_, i) => blocksAt(i + 1)), preludeAt(6)!];
    for (const blocks of states) {
      const ids = blocks.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('wirft bei Schritten außerhalb von 1–9', () => {
    expect(() => blocksAt(0)).toThrow(RangeError);
    expect(() => blocksAt(10)).toThrow(RangeError);
    expect(() => blocksAt(1.5)).toThrow(RangeError);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./kontextfenster-steps"` (module does not exist yet).

- [ ] **Step 4: Write the implementation**

Create `src/components/sota/kontextfenster-steps.ts`:
```ts
// Daten und Logik der Kontextfenster-Animation (Konzept 2). Ohne React, damit testbar.
// Größen sind didaktisch gewählt (Kapazität = 100 Einheiten), keine echten Token-Zahlen.

export type Art = 'fest' | 'auftrag' | 'datei' | 'werkzeug' | 'verlauf' | 'zusammenfassung';

export interface Block {
  id: string;
  art: Art;
  label: string;
  size: number;
  verblasst?: boolean;
  tag?: string;
}

export interface Schritt {
  title: string;
  /** Inline-Code in Backticks. */
  text: string;
}

export const PRELUDE_MS = 900;

const SYS: Block = { id: 'sys', art: 'fest', label: 'Systemregeln', size: 6 };
const CLAUDE_MD: Block = { id: 'claude-md', art: 'fest', label: 'CLAUDE.md', size: 8 };
const AUFTRAG: Block = { id: 'auftrag', art: 'auftrag', label: 'Auftrag', size: 4 };
const DATEI_1: Block = { id: 'datei-1', art: 'datei', label: 'page.tsx', size: 7 };
const DATEI_2: Block = { id: 'datei-2', art: 'datei', label: 'EventCard.tsx', size: 7 };
const DATEI_3: Block = { id: 'datei-3', art: 'datei', label: 'rsvp.ts', size: 7 };
const DATEI_4: Block = { id: 'datei-4', art: 'datei', label: 'auth.ts', size: 7 };
const BUILD: Block = { id: 'build', art: 'werkzeug', label: 'Build', size: 6 };
const LOG: Block = { id: 'log', art: 'werkzeug', label: 'Fehlerlog (400 Zeilen)', size: 22 };
const VERLAUF_1: Block = { id: 'verlauf-1', art: 'verlauf', label: 'Verlauf', size: 8 };
const VERLAUF_2: Block = { id: 'verlauf-2', art: 'verlauf', label: 'Verlauf', size: 14 };
const ZUSAMMENFASSUNG: Block = { id: 'zusammenfassung', art: 'zusammenfassung', label: 'Zusammenfassung', size: 16 };
const ENTSCHEIDUNGEN: Block = {
  id: 'entscheidungen',
  art: 'fest',
  label: 'ENTSCHEIDUNGEN.md',
  size: 4,
  tag: 'in CLAUDE.md verknüpft',
};

const fade = (b: Block): Block => ({ ...b, verblasst: true });
const DATEIEN = [DATEI_1, DATEI_2, DATEI_3, DATEI_4];

const STATES: Block[][] = [
  [SYS, CLAUDE_MD],
  [SYS, CLAUDE_MD, AUFTRAG],
  [SYS, CLAUDE_MD, AUFTRAG, ...DATEIEN],
  [SYS, CLAUDE_MD, AUFTRAG, ...DATEIEN, BUILD, LOG],
  [SYS, CLAUDE_MD, fade(AUFTRAG), fade(DATEI_1), fade(DATEI_2), DATEI_3, DATEI_4, BUILD, LOG, VERLAUF_1],
  [SYS, CLAUDE_MD, ZUSAMMENFASSUNG],
  [SYS, CLAUDE_MD, ZUSAMMENFASSUNG, { ...AUFTRAG, tag: 'bleibt' }],
  [SYS, CLAUDE_MD],
  [SYS, CLAUDE_MD, ENTSCHEIDUNGEN],
];

const PRELUDES: Partial<Record<number, Block[]>> = {
  6: [...STATES[4], VERLAUF_2],
};

export const STEPS: Schritt[] = [
  {
    title: 'Jede Session beginnt gleich.',
    text: 'Bevor Sie etwas schreiben, liegen schon die Systemregeln und Ihre `CLAUDE.md` im Kontextfenster – dem Arbeitsgedächtnis des Modells.',
  },
  {
    title: 'Ihr Auftrag.',
    text: '„Füge auf der Event-Seite einen RSVP-Button hinzu – nur für angemeldete Nutzer*innen.“ Die Einschränkung am Ende ist eine Absprache, auf die es später ankommt.',
  },
  {
    title: 'Claude liest.',
    text: 'Um den Auftrag zu verstehen, öffnet der Agent die relevanten Dateien. Jede gelesene Datei belegt Platz – deshalb lohnt es sich, gezielt auf die betroffenen Stellen zu verweisen.',
  },
  {
    title: 'Werkzeuge liefern Ergebnisse.',
    text: 'Build-Ausgaben und Fehlermeldungen landen ebenfalls im Kontext. Ein vollständiges Log mit 400 Zeilen verdrängt mehr, als es nützt; die entscheidenden fünf Zeilen genügen.',
  },
  {
    title: 'Je voller, desto unschärfer.',
    text: 'Das Modell gewichtet nicht alles gleich. Je mehr im Fenster liegt, desto leichter gehen frühe Details unter – etwa Ihre Einschränkung aus Schritt 2. Die Antworten werden ungenauer, lange bevor das Fenster voll ist.',
  },
  {
    title: 'Auto-Compact.',
    text: 'Kurz vor der Grenze fasst Claude Code den Verlauf automatisch zusammen. Das schafft Platz, kostet aber Detail – was nicht in der Zusammenfassung steht, ist weg. Hier: Ihre Einschränkung aus Schritt 2.',
  },
  {
    title: 'Besser: selbst verdichten.',
    text: 'Mit `/compact` lösen Sie die Zusammenfassung rechtzeitig selbst aus und sagen, was bleiben muss: `/compact Behalte: nur für angemeldete Nutzer*innen`. Dann übersteht die Absprache die Verdichtung.',
  },
  {
    title: '`/clear` – neue Session.',
    text: 'Nach einer abgeschlossenen Story ist ein leerer Kontext der beste Start: schnell, präzise, ohne Altlasten. Was nur im Chat stand, ist damit allerdings weg.',
  },
  {
    title: 'Dauerhaftes gehört in Dateien.',
    text: 'Entscheidungen, die über eine Session hinaus gelten, halten Sie in `docs/ENTSCHEIDUNGEN.md` fest. Im Kursprojekt ist die Datei in `CLAUDE.md` verknüpft und wird deshalb bei jedem Start geladen. Was nur im Chat stand, ist in der nächsten Session weg.',
  },
];

export function blocksAt(step: number): Block[] {
  const state = Number.isInteger(step) ? STATES[step - 1] : undefined;
  if (!state) throw new RangeError(`Schritt ${step} gibt es nicht (1–${STATES.length}).`);
  return state;
}

export function preludeAt(step: number): Block[] | null {
  return PRELUDES[step] ?? null;
}

export function fillOf(blocks: Block[]): number {
  return blocks.reduce((sum, b) => sum + b.size, 0);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, 21 tests reported (12 plain `it` + 9 rows from the one `it.each`), 0 failed.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/components/sota/kontextfenster-steps.ts src/components/sota/kontextfenster-steps.test.ts
git commit -m "Kontextfenster-Animation: Schritte und Füllstände als getestete Daten

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 7: Prove the tests bind (mutation)**

Temporarily change STATES index 5 (step 6) from `[SYS, CLAUDE_MD, ZUSAMMENFASSUNG]` to `[SYS, CLAUDE_MD, AUFTRAG, ZUSAMMENFASSUNG]`. Confirm the mutation applied: `git diff --stat` shows `kontextfenster-steps.ts | 2 +-`.
Run: `npm test`
Expected: FAIL on assertions (not a crash): `Schritt 6 ist zu 30 Prozent belegt` (expected 30, received 34) and `Schritt 6: kein Auftrag mehr` (expected 0, received 1).
Restore: `git checkout -- src/components/sota/kontextfenster-steps.ts`, run `npm test` → PASS, `git status --short` → clean.

---

### Task 2: Stage, scene and page integration

**Files:**
- Modify: `astro.config.mjs` (React integration)
- Modify: `tsconfig.json` (JSX settings)
- Create: `src/components/sota/Stage.tsx`
- Create: `src/components/sota/Kontextfenster.tsx`
- Create: `src/components/sota/stage.css`
- Modify: `src/pages/konzepte/coding-agent.astro` (frontmatter import, card sentence, replace `#ctx` widget)
- Modify: `src/styles/global.css` (remove `.ctx-*` rules)

**Interfaces:**
- Consumes (from Task 1): `STEPS`, `blocksAt`, `preludeAt`, `fillOf`, `PRELUDE_MS`, types `Art`, `Block` from `./kontextfenster-steps`.
- Produces (for Sub-Projekt 2):
  - `export interface StageStep { caption: ReactNode; plain: string }`
  - `export interface StageNav { index: number; direction: 1 | -1; seq: number }` — `index` 0-based; `seq` increments on every navigation.
  - `export default function Stage(props: { title: string; steps: StageStep[]; children: (nav: StageNav, reduced: boolean) => ReactNode }): JSX.Element`
  - CSS classes `.stage*` and `.sr-only` in `stage.css`.
  - `export default function Kontextfenster(): JSX.Element`

- [ ] **Step 1: Enable React in Astro**

`astro.config.mjs` becomes:
```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Kurs-Website NDU Coding 2026 — statische Seite, deploybar auf Vercel oder GitHub Pages.
export default defineConfig({
  site: 'https://ndu-coding-2026.vercel.app',
  trailingSlash: 'ignore',
  // Astro 7 entfernt Leerraum sonst nach JSX-Regeln – das kann Leerzeichen zwischen Inline-Elementen kosten.
  compressHTML: true,
  integrations: [react()],
});
```
`tsconfig.json` becomes:
```json
{
  "extends": "astro/tsconfigs/base",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```
Run: `npm run build` → Expected: `21 page(s) built`, `Complete!`.

- [ ] **Step 2: Create `src/components/sota/Stage.tsx`**

```tsx
// Rahmen für Schritt-Animationen: Steuerung, Tastatur, Vollbild, Beschriftung.
// Wiederverwendbar für alle animierten Szenen der Kurs-Website.
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import './stage.css';

export interface StageStep {
  caption: ReactNode;
  /** Beschriftung als reiner Text für Screenreader. */
  plain: string;
}

export interface StageNav {
  index: number;
  direction: 1 | -1;
  /** Zählt jede Navigation hoch – damit Szenen erkennen, dass ein Schritt neu betreten wurde. */
  seq: number;
}

interface StageProps {
  title: string;
  steps: StageStep[];
  children: (nav: StageNav, reduced: boolean) => ReactNode;
}

export default function Stage({ title, steps, children }: StageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [nav, setNav] = useState<StageNav>({ index: 0, direction: 1, seq: 0 });
  // Server und erstes Client-Rendern: Button sichtbar; erst nach dem Mounten prüfen (keine Hydration-Abweichung).
  const [canFullscreen, setCanFullscreen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const reduced = useReducedMotion() ?? false;
  const last = steps.length - 1;

  useEffect(() => {
    setCanFullscreen(Boolean(document.fullscreenEnabled));
    const onChange = () => setIsFullscreen(document.fullscreenElement === ref.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const move = (delta: 1 | -1) =>
    setNav((n) => {
      const index = n.index + delta;
      return index < 0 || index > last ? n : { index, direction: delta, seq: n.seq + 1 };
    });
  const restart = () => setNav((n) => (n.index === 0 ? n : { index: 0, direction: -1, seq: n.seq + 1 }));
  const refocus = () => ref.current?.focus();

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Nur Tasten auf der Stage selbst – ein fokussierter Button behandelt Leertaste/Enter selbst.
    if (e.target !== e.currentTarget) return;
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      move(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      move(-1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      restart();
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await ref.current?.requestFullscreen();
    } catch (err) {
      console.warn('Vollbild nicht möglich:', err);
    }
    refocus();
  };

  return (
    <div
      ref={ref}
      className="stage"
      tabIndex={0}
      onKeyDown={onKeyDown}
      role="group"
      aria-roledescription="Animation"
      aria-label={`${title} – mit den Pfeiltasten blättern`}
    >
      <div className="stage-head">
        <span className="stage-title">{title}</span>
        <span className="stage-count">
          {nav.index + 1} / {steps.length}
        </span>
      </div>
      <div className="stage-scene">{children(nav, reduced)}</div>
      <div className="stage-caption" aria-hidden="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={nav.index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
          >
            {steps[nav.index].caption}
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="sr-only" aria-live="polite">
        {steps[nav.index].plain}
      </p>
      <div className="stage-controls">
        <button
          type="button"
          className="btn sm"
          onClick={() => { move(-1); refocus(); }}
          disabled={nav.index === 0}
          aria-label="Vorheriger Schritt"
        >
          ← Zurück
        </button>
        <button
          type="button"
          className="btn sm primary"
          onClick={() => { move(1); refocus(); }}
          disabled={nav.index === last}
          aria-label="Nächster Schritt"
        >
          Weiter →
        </button>
        <button
          type="button"
          className="btn sm"
          onClick={() => { restart(); refocus(); }}
          disabled={nav.index === 0}
          aria-label="Von vorn beginnen"
        >
          Von vorn
        </button>
        {canFullscreen && (
          <button type="button" className="btn sm" onClick={toggleFullscreen}>
            {isFullscreen ? 'Vollbild beenden' : 'Vollbild'}
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/sota/Kontextfenster.tsx`**

```tsx
// Szene „Kontextfenster“ für Konzept 2 (Tag 1). Logik und Texte: kontextfenster-steps.ts.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Stage, { type StageNav, type StageStep } from './Stage';
import { PRELUDE_MS, STEPS, blocksAt, fillOf, preludeAt, type Art } from './kontextfenster-steps';
import './stage.css';

const LEGENDE: { art: Art; text: string }[] = [
  { art: 'fest', text: 'Lädt bei jedem Start' },
  { art: 'auftrag', text: 'Ihr Auftrag' },
  { art: 'datei', text: 'Gelesene Dateien' },
  { art: 'werkzeug', text: 'Werkzeug-Ergebnisse' },
  { art: 'verlauf', text: 'Verlauf' },
  { art: 'zusammenfassung', text: 'Zusammenfassung' },
];

// `Code` in Backticks → <code>.
function inline(text: string): ReactNode[] {
  return text.split('`').map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part));
}

const stageSteps: StageStep[] = STEPS.map((s) => ({
  caption: (
    <>
      <strong>{inline(s.title)}</strong> {inline(s.text)}
    </>
  ),
  plain: `${s.title} ${s.text}`.replaceAll('`', ''),
}));

export default function Kontextfenster() {
  return (
    <Stage title="Das Kontextfenster" steps={stageSteps}>
      {(nav, reduced) => <Fenster nav={nav} reduced={reduced} />}
    </Stage>
  );
}

function Fenster({ nav, reduced }: { nav: StageNav; reduced: boolean }) {
  const step = nav.index + 1;
  const prelude = preludeAt(step);
  // Auftakt nur beim Vorwärtsgehen und ohne reduzierte Bewegung; seq macht jeden Besuch einzeln.
  const [preludeDoneSeq, setPreludeDoneSeq] = useState(-1);
  const showPrelude = prelude !== null && nav.direction === 1 && !reduced && preludeDoneSeq !== nav.seq;

  useEffect(() => {
    if (!showPrelude) return;
    const t = setTimeout(() => setPreludeDoneSeq(nav.seq), PRELUDE_MS);
    return () => clearTimeout(t);
  }, [showPrelude, nav.seq]);

  const blocks = showPrelude && prelude ? prelude : blocksAt(step);
  const fill = fillOf(blocks);
  const level = fill >= 95 ? 'kf-crit' : fill >= 80 ? 'kf-warn' : '';

  // Neu hinzugekommene Blöcke nacheinander einfließen lassen.
  const shown = useRef(new Set(blocks.map((b) => b.id)));
  const fresh = blocks.filter((b) => !shown.current.has(b.id)).map((b) => b.id);
  useEffect(() => {
    shown.current = new Set(blocks.map((b) => b.id));
  });

  const duration = reduced ? 0 : 0.5;

  return (
    <div className="kf">
      <div className={`kf-gauge ${level}`}>
        <span className="kf-gauge-text">{fill} % belegt</span>
        <div className="kf-gauge-track">
          <motion.div
            className="kf-gauge-bar"
            initial={false}
            animate={{ width: `${Math.min(fill, 100)}%` }}
            transition={{ duration }}
          />
        </div>
      </div>
      <div className="kf-fenster" role="img" aria-label={`Kontextfenster, ${fill} Prozent belegt`}>
        <AnimatePresence initial={false}>
          {blocks.map((b) => {
            const order = fresh.indexOf(b.id);
            return (
              <motion.div
                key={b.id}
                className={`kf-block kf-${b.art}${b.size < 8 ? ' kf-narrow' : ''}`}
                title={b.tag ? `${b.label} – ${b.tag}` : b.label}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: `${b.size}%`, opacity: b.verblasst ? 0.35 : 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration, delay: reduced || order < 0 ? 0 : order * 0.2 }}
              >
                <span className="kf-label">{b.label}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <p className="kf-footnote">Gemessen in Tokens – etwa 3–4 Zeichen pro Token.</p>
      {blocks.some((b) => b.tag) && (
        <ul className="kf-notes">
          {blocks
            .filter((b) => b.tag)
            .map((b) => (
              <li key={b.id}>
                <span className={`kf-dot kf-${b.art}`} aria-hidden="true" />
                <code>{b.label}</code> – {b.tag}
              </li>
            ))}
        </ul>
      )}
      <ul className="kf-legend" aria-label="Legende">
        {LEGENDE.map((l) => (
          <li key={l.art}>
            <span className={`kf-dot kf-${l.art}`} aria-hidden="true" />
            {l.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/sota/stage.css`**

```css
/* Animierte Szenen (Stage + Kontextfenster). Nur Tokens aus global.css. */
.stage {
  --block-ink: #fff;
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  margin: 1.5rem 0;
  outline: none;
}
.stage:focus-visible { box-shadow: 0 0 0 3px var(--blue); }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .stage { --block-ink: var(--bg); }
}
:root[data-theme="dark"] .stage { --block-ink: var(--bg); }

.stage-head { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; margin-bottom: .75rem; }
.stage-title { font-weight: 700; }
.stage-count { font-family: var(--mono); font-size: .85rem; color: var(--muted); }
.stage-caption { min-height: 6.5em; margin-top: 1rem; }
.stage-caption code { font-size: .9em; }
.stage-controls { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .75rem; }
.stage-controls .btn:disabled { opacity: .4; cursor: default; }

.stage:fullscreen {
  background: var(--bg);
  color: var(--fg);
  border: 0;
  border-radius: 0;
  margin: 0;
  padding: 5vh 6vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 1.5rem;
}
.stage:fullscreen .kf-fenster { height: 18vh; }
.stage:fullscreen .stage-caption { max-width: 60ch; }
.stage:fullscreen .kf-block,
.stage:fullscreen .kf-gauge-text,
.stage:fullscreen .kf-legend,
.stage:fullscreen .kf-notes,
.stage:fullscreen .kf-footnote,
.stage:fullscreen .btn { font-size: 1.1rem; }
.stage:fullscreen .kf-gauge-track { height: 10px; }

.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}

/* Kontextfenster */
.kf-gauge { display: flex; align-items: center; gap: .75rem; margin-bottom: .5rem; }
.kf-gauge-text { font-family: var(--mono); font-size: .9rem; min-width: 8.5em; }
.kf-gauge-track { flex: 1; height: 6px; border-radius: 3px; background: var(--border); overflow: hidden; }
.kf-gauge-bar { height: 100%; background: var(--muted); }
.kf-gauge.kf-warn .kf-gauge-bar { background: var(--yellow); }
.kf-gauge.kf-warn .kf-gauge-text { color: var(--yellow); font-weight: 700; }
.kf-gauge.kf-crit .kf-gauge-bar { background: var(--accent); }
.kf-gauge.kf-crit .kf-gauge-text { color: var(--accent); font-weight: 700; }

.kf-fenster {
  display: flex;
  height: 64px;
  border: 2px solid var(--fg);
  border-radius: 10px;
  background: var(--bg);
  overflow: hidden;
}
.kf-block {
  flex: none;
  display: grid;
  place-items: center;
  overflow: hidden;
  box-shadow: inset -2px 0 0 var(--bg);
  color: var(--block-ink);
  font-size: .75rem;
  font-weight: 600;
}
.kf-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; padding: 0 .25rem; }

.kf-fest { background: var(--purple); }
.kf-auftrag { background: var(--accent); }
.kf-datei { background: var(--green); }
.kf-werkzeug { background: var(--yellow); }
.kf-verlauf { background: var(--blue); }
.kf-zusammenfassung { background: var(--muted); }

.kf-footnote { font-size: .8rem; color: var(--muted); margin: .4rem 0 0; }
.kf-notes, .kf-legend { list-style: none; padding: 0; margin: .5rem 0 0; display: flex; flex-wrap: wrap; gap: .25rem 1rem; font-size: .85rem; }
.kf-legend { color: var(--muted); }
.kf-dot { display: inline-block; width: .7em; height: .7em; border-radius: 2px; margin-right: .35em; vertical-align: -.05em; }

@media (max-width: 900px) {
  .stage { padding: 1rem; }
  .kf-fenster { height: 52px; }
  .kf-block { font-size: .68rem; }
  .kf-narrow .kf-label { display: none; }
}
```

- [ ] **Step 5: Wire the scene into the page**

In `src/pages/konzepte/coding-agent.astro`:

a) Frontmatter: after `import FooterNav from '../../components/FooterNav.astro';` add
```astro
import Kontextfenster from '../../components/sota/Kontextfenster.tsx';
```

b) In the card „Es hat ein Gedächtnis mit Rand“ replace exactly `Ist es voll, fällt Älteres raus.` with `Wird es voll, fasst Claude Code den Verlauf zusammen – Details können dabei verloren gehen.`

c) Replace the whole block from `<div class="widget" id="ctx">` through its closing `</div>` (the one directly before `<p>Daraus folgen drei Regeln:`; it contains the `<script>` with `ctx-bar`) with:
```astro
  <p class="hint small muted">Klicken Sie auf die Animation und blättern Sie mit den Pfeiltasten – oder nutzen Sie die Buttons.</p>
  <Kontextfenster client:visible />
```
Keep `<h2>Das Kontextfenster</h2>` above and the `<p>Daraus folgen drei Regeln: …` paragraph below unchanged.

d) In `src/styles/global.css` delete the ten rules starting with `.ctx-bar`, `.ctx-seg` (including `.ctx-seg.sys`, `.claude`, `.code`, `.chat`, `.lost`), `.ctx-controls`, `.ctx-status`, `.ctx-status strong`.

Check: `grep -rn "ctx-" src` → no output.

- [ ] **Step 6: Build, test, check for hidden characters**

Run: `npm test && npm run build`
Expected: tests PASS; build `21 page(s) built`, `Complete!`.
Run: `LC_ALL=C grep -rlP '\xe2\x80[\xa8\xa9\x8b]|\xef\xbb\xbf' src || echo clean` → `clean`.
Run: `grep -c 'Systemregeln' dist/konzepte/coding-agent/index.html` → ≥ 1 (step 1 is server-rendered).
Run: `grep -o 'kf-block[^>]*style="[^"]*opacity:0' dist/konzepte/coding-agent/index.html | wc -l` → `0` (no invisible blocks in server HTML).

- [ ] **Step 7: Commit**

```bash
git add astro.config.mjs tsconfig.json src/components/sota src/pages/konzepte/coding-agent.astro src/styles/global.css
git commit -m "Konzept 2: Kontextfenster als Schritt-Animation zum Präsentieren

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Browser verification (and fixes it uncovers)

**Files:**
- Modify only if a check fails: `src/components/sota/Stage.tsx`, `src/components/sota/Kontextfenster.tsx`, `src/components/sota/stage.css`

**Interfaces:**
- Consumes: the built page `/konzepte/coding-agent` from Task 2.
- Produces: a verified page; screenshots for Markus.

Tool: Chrome DevTools MCP (`new_page` with `isolatedContext`, `evaluate_script`, `press_key`, `click`, `emulate`, `resize_page`, `take_screenshot`, `list_console_messages`). Clicks and key presses must go through the MCP input tools (trusted events), not `element.click()` from a script, wherever focus or fullscreen matters. Consecutive MCP `press_key` calls land roughly 600 ms apart, so never assert sub-second timing by polling – record transient states with the gauge recorder below and assert end states.

Gauge recorder (run via `evaluate_script` before the key presses whose intermediate states you want to check):
```js
() => { window.__g = []; const el = document.querySelector('.kf-gauge-text'); new MutationObserver(() => window.__g.push(el.textContent)).observe(el, { childList: true, characterData: true, subtree: true }); return el.textContent; }
```
Read it later with `() => window.__g`.

- [ ] **Step 1: Serve the production build**

Run: `npm run build && npx astro preview --port 4322 --background` (stop later with `npx astro preview stop`).
Open `http://localhost:4322/konzepte/coding-agent` in a new isolated page.

- [ ] **Step 2: Walk all steps by button and by keyboard**

Click „Weiter“ 8 times, then read the counter after each: expect `1 / 9` … `9 / 9`, „Weiter“ disabled at 9. Read the gauge text per step; expect 14, 18, 46, 74, 82, (96 then) 30, 34, 14, 18 % belegt. Click „Von vorn“ → `1 / 9`. Click the stage background, press `ArrowRight` 4 times → `5 / 9`. Install the gauge recorder, press `ArrowRight` once → `6 / 9`; after 1.5 s `window.__g` contains `96 % belegt` followed later by `30 % belegt`, and the gauge reads `30 % belegt`. Press `ArrowLeft` → `5 / 9`, `82 % belegt`; reinstall the recorder, press `ArrowRight` → `window.__g` again contains `96 % belegt` then `30 % belegt` (prelude plays again). `list_console_messages` → no errors.

- [ ] **Step 3: Keyboard scope (Review Focus 2)**

Click „Weiter“ (counter `2 / 9`), then press Space once → counter `3 / 9` (exactly one step). Record `window.scrollY` before and after the Space press → unchanged.
Click on the page heading outside the stage, press `ArrowRight` → counter unchanged; press Space → `window.scrollY` increases.

- [ ] **Step 4: Rapid input during the prelude (Review Focus 1)**

Go to step 5. Press `ArrowRight` three times with back-to-back `press_key` calls (≈ 600 ms apart, so the second press lands inside the 900 ms prelude). After 1.5 s: counter `8 / 9`, gauge `14 % belegt`, and the DOM contains exactly two `.kf-block` elements:
```js
() => document.querySelectorAll('.kf-fenster .kf-block').length
```
Expected: `2`. Then go to step 5, press `ArrowRight` once and `ArrowLeft` immediately after (next `press_key` call, inside the prelude) → counter `5 / 9`, after 1.5 s gauge `82 % belegt`.

- [ ] **Step 5: Themes, widths, zoom (Review Focus 4, 5)**

For `theme` in `dark`, `light`: run
```js
(t) => { document.documentElement.dataset.theme = t; const l = document.querySelector('.kf-block .kf-label'); const b = getComputedStyle(l.parentElement).backgroundColor; return { color: getComputedStyle(l).color, bg: b }; }
```
Expected: dark → label colour is the dark `--bg` (`rgb(18, 18, 22)`), light → `rgb(255, 255, 255)`. Take one screenshot per theme on step 4.
Remove the attribute again (`delete document.documentElement.dataset.theme`).
Check two widths: `emulate` with `viewport: "390x844x2,mobile,touch"` (do not use `resize_page` for this – macOS clamps the window to ~500 px), then reset the emulation and `resize_page` to 850×700. On each, run
```js
() => ({ overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, stage: document.querySelector('.stage').getBoundingClientRect().width })
```
Expected: `overflow: 0`. Screenshot step 4 at 390 px.

- [ ] **Step 6: Fullscreen and Escape (Review Focus 3)**

Click „Vollbild“ (MCP click). Expect `document.fullscreenElement?.classList.contains('stage') === true`, button label „Vollbild beenden“, background equals `--bg`. Press `ArrowRight` without clicking → counter increases. Take a screenshot. Leave fullscreen with `evaluate_script(async () => { await document.exitFullscreen(); })` (a CDP `Escape` press is handled by the browser UI and does not exit) → `document.fullscreenElement === null`, button label „Vollbild“. Real Esc is checked by Markus by hand during screenshot approval. Click the stage, press `ArrowRight` → counter increases.

- [ ] **Step 7: Reduced motion**

The `emulate` tool has no reduced-motion option. Instead reload with `navigate_page` (`type: "reload"`) and this `initScript`, which makes Motion's `useReducedMotion()` see the preference:
```js
const orig = window.matchMedia.bind(window); window.matchMedia = (q) => q.includes('prefers-reduced-motion') ? { matches: true, media: q, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; } } : orig(q);
```
Go to step 5, install the gauge recorder, press `ArrowRight` → after 1.5 s `window.__g` does not contain `96 % belegt` and the gauge reads `30 % belegt`. Reload without the init script afterwards.

- [ ] **Step 8: No JavaScript and hydration**

No-JS: `curl -s http://localhost:4322/konzepte/coding-agent | grep -o 'kf-label">[^<]*' | head` → shows `Systemregeln` and `CLAUDE.md`.
Hydration: `npx astro preview stop`; `npm run dev` (background, port 4321); open `http://localhost:4321/konzepte/coding-agent`, reload once, `list_console_messages` with types `error`, `warn` → no hydration/mismatch messages. Leave the dev server running for Markus.

- [ ] **Step 9: Fix, re-verify, commit**

If any check failed: fix in the owning file, rerun `npm test && npm run build`, repeat the failed check and the checks of Steps 2–3. Then:
```bash
git add src/components/sota
git commit -m "Kontextfenster-Animation: Korrekturen aus der Browser-Prüfung

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```
If nothing failed: no commit. Report the screenshots to Markus for approval (spec: „Screenshot-Abnahme durch Markus vor dem Merge“).
