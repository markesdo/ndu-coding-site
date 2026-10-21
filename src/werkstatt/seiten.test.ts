import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ARTEFAKTE, METHODEN, artefakt } from '../components/methoden';
import { ARTEFAKTE as WERKSTATT_ARTEFAKTE, ARTEFAKT_NAMEN } from './schemas/index.js';
import { EDITOREN } from './ui/editoren/index.js';
import { EDITOR_ANKER, LEITFADEN_LINK } from './ui/mappe-hilfen.js';
import { MCP_WERKZEUGE } from './vertrag.js';

// Seitenintegration der Werkstatt (Spec §3.5): Jede Methode, deren Artefakt in der Werkstatt lebt, hat auf ihrer Seite
// einen „Bearbeiten“-Knopf, und ihre Texte schicken niemanden mehr in eine Datei unter docs/.
const seiten = import.meta.glob('../pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const seite = (pfad: string): string => {
  const s = seiten[`../pages/innolab/${pfad}.astro`];
  if (s === undefined) throw new Error(`Seite ${pfad} fehlt`);
  return s;
};

const werkstattMethoden = METHODEN.filter((m) => m.ergibt.some((id) => artefakt(id)?.werkstatt !== undefined));
const ALTE_DATEIEN = ['docs/PRODUKT.md', 'docs/ENTSCHEIDUNGEN.md', 'docs/interviews/LEITFADEN.md', 'docs/ANNAHMEN.md'];

/** Folien einer Seite, die eine Auflösung enthalten. */
const folienMitAufloesung = (quelle: string): string[] =>
  [...quelle.matchAll(/<Folie\b[^>]*>([\s\S]*?)<\/Folie>/g)].map(([, inhalt]) => inhalt).filter((f) => /<Aufloesung\b/.test(f));

describe('Werkstatt auf den Methodenseiten', () => {
  it('die Tag-1-Methoden und die Synthese gehören zur Werkstatt (sonst prüft der Test nichts)', () => {
    expect(werkstattMethoden.map((m) => m.slug)).toStrictEqual(['problem-rahmen', 'entscheidungslog', 'annahmen', 'interview', 'synthese']);
  });

  it('jede Werkstatt-Methode hat auf ihrer Seite <Bearbeiten artefakt=…> für ihr Artefakt, nach „So geht ihr vor“', () => {
    for (const m of werkstattMethoden) {
      const quelle = seite(`methoden/${m.slug}`);
      for (const id of m.ergibt) {
        const name = artefakt(id)!.werkstatt!;
        expect(WERKSTATT_ARTEFAKTE[name].slug, m.slug).toBe(m.slug);
        const stelle = quelle.indexOf(`<Bearbeiten artefakt="${name}"`);
        expect(stelle, `${m.slug}: <Bearbeiten artefakt="${name}">`).toBeGreaterThan(-1);
        expect(stelle, `${m.slug}: Bearbeiten erst nach „So geht ihr vor“`).toBeGreaterThan(quelle.indexOf('id="vorgehen"'));
        expect(quelle.indexOf('id="vorgehen"'), m.slug).toBeGreaterThan(-1);
      }
    }
  });

  it('kein „Bearbeiten“ in einer Folie mit Auflösung – und keine fremden Artefaktnamen', () => {
    for (const [pfad, quelle] of Object.entries(seiten)) {
      for (const f of folienMitAufloesung(quelle)) expect(f, pfad).not.toContain('<Bearbeiten');
      for (const [, name] of quelle.matchAll(/<Bearbeiten artefakt="([^"]*)"/g)) {
        expect(ARTEFAKT_NAMEN as readonly string[], pfad).toContain(name);
      }
    }
  });

  it('keine der vier Seiten und der Abschluss von Tag 1 nennt noch eine der alten Dateien', () => {
    const pfade = [...werkstattMethoden.map((m) => `methoden/${m.slug}`), 'tag-1/abschluss'];
    for (const p of pfade) {
      for (const datei of ALTE_DATEIEN) expect(seite(p), `${p} nennt ${datei}`).not.toContain(datei);
    }
  });

  it('Interview-Notizen gehen nie ins App-Repo (öffentlich): kein docs/interviews/, kein „committet und gepusht“', () => {
    for (const p of ['tag-1/abschluss', 'methoden/interview']) expect(seite(p), p).not.toContain('docs/interviews/');
    const tag1 = Object.entries(seiten).filter(([p]) => /pages\/innolab\/(tag-1(\.astro|\/)|methoden\/(problem-rahmen|entscheidungslog|interview|annahmen)\.astro)/.test(p));
    expect(tag1.length).toBe(6);
    // Jede Zeile: Auf Tag 1 wird nichts mehr committet – was die Hausaufgabe festhält, liegt privat oder in der Werkstatt.
    for (const [p, quelle] of tag1) {
      expect(quelle.split('\n').filter((z) => /committ(et)? und gepusht/i.test(z)), p).toStrictEqual([]);
    }
  });

  it('der Leitfaden-Editor steckt auf der Interview-Seite in einer Auflösung (er verrät den Mom Test)', () => {
    const iv = seite('methoden/interview');
    const aufloesungen = [...iv.matchAll(/<Aufloesung\b[\s\S]*?<\/Aufloesung>/g)].map(([a]) => a);
    expect(aufloesungen.filter((a) => a.includes('<Bearbeiten artefakt="leitfaden"'))).toHaveLength(1);
    expect(iv.split('<Bearbeiten artefakt="leitfaden"').length - 1).toBe(1);
    // Der Link der Mappe („Zur Interview-Seite“) springt auf die Überschrift direkt vor dieser Auflösung.
    const anker = LEITFADEN_LINK.split('#')[1];
    expect(LEITFADEN_LINK.startsWith('/innolab/methoden/interview#')).toBe(true);
    expect(iv).toMatch(new RegExp(`<h2 id="${anker}">[^<]*</h2>\\s*<Aufloesung\\b[^>]*>[\\s\\S]*?<Bearbeiten artefakt="leitfaden"`));
    // Dieselbe Freigabezeit wie /innolab/mappe: aus innolab-zeiten.ts, nicht als eigene Konstante.
    expect(iv).toContain("import { MOM_TEST_GRUPPE, NACH_MOM_TEST } from '../../../components/innolab-zeiten';");
    expect(iv).not.toMatch(/const NACH_MOM_TEST\s*=/);
  });

  it('Werkzeugnamen des Connectors kommen aus MCP_WERKZEUGE, nicht als Text in die Seite', () => {
    for (const m of werkstattMethoden) {
      const q = seite(`methoden/${m.slug}`);
      for (const w of Object.values(MCP_WERKZEUGE)) expect(q, `${m.slug}: ${w}`).not.toContain(w);
    }
    expect(seite('methoden/annahmen')).toContain('MCP_WERKZEUGE.artefaktLesen');
  });

  it('die Hausaufgabe nennt die Werkstatt und die Seite zum Verbinden von Claude', () => {
    const a = seite('tag-1/abschluss');
    expect(a).toContain('Werkstatt');
    expect(a).toContain('href="/innolab/werkstatt/claude"');
  });

  it('die Mappe-Seite bindet die Übersicht als Island ein', () => {
    expect(seite('mappe')).toMatch(/<MappeUebersicht client:only="react"/);
  });
});

describe('Beamer', () => {
  it('blendet data-werkstatt in der Datei aus, die jede Seite lädt', () => {
    // Als Datei gelesen: CSS-Importe liefert Vitest leer.
    const layout = readFileSync(new URL('../layouts/Layout.astro', import.meta.url), 'utf8');
    const beamerCss = readFileSync(new URL('../styles/beamer.css', import.meta.url), 'utf8');
    expect(layout).toContain("import '../styles/beamer.css';");
    expect(beamerCss).toMatch(/html\[data-beamer\] \[data-werkstatt\] \{ display: none; \}/);
  });
});

describe('EDITOREN', () => {
  it('hat für jedes Artefakt der Mappe genau einen Editor', () => {
    expect(Object.keys(EDITOREN).sort()).toStrictEqual([...ARTEFAKT_NAMEN].sort());
    for (const n of ARTEFAKT_NAMEN) expect(typeof EDITOREN[n], n).toBe('function');
    expect(new Set(Object.values(EDITOREN)).size).toBe(ARTEFAKT_NAMEN.length);
  });

  it('jedes Werkstatt-Artefakt aus methoden.ts hat einen Editor', () => {
    for (const a of ARTEFAKTE.filter((x) => x.werkstatt)) expect(EDITOREN[a.werkstatt!], a.id).toBeDefined();
  });
});

describe('Claude verbinden', () => {
  const seite = seiten['../pages/innolab/werkstatt/claude.astro'];

  it('Knopf nutzt den geprüften Link, Fallback nennt die URL aus derselben Quelle', () => {
    expect(seite).toContain('href={connectorLink(seite)}');
    expect(seite).toContain('{connectorUrl(seite)}');
    expect(seite).not.toContain('https://ndu.datamonkeys.ai/api/werkstatt/mcp</code>');
  });
});

describe('Mappe verlinkt direkt zum Editor', () => {
  it('der Anker jedes Artefakts ist die letzte Überschrift vor seinem „Bearbeiten“', () => {
    for (const name of ARTEFAKT_NAMEN) {
      const seite = seiten[`../pages/innolab/methoden/${WERKSTATT_ARTEFAKTE[name].slug}.astro`];
      const knopf = seite.indexOf(`<Bearbeiten artefakt="${name}"`);
      expect(knopf, name).toBeGreaterThan(-1);
      const davor = [...seite.slice(0, knopf).matchAll(/<h2 id="([^"]+)"/g)].at(-1)?.[1];
      expect(davor, name).toBe(EDITOR_ANKER[name]);
      expect(seite.split(`id="${EDITOR_ANKER[name]}"`).length - 1, `${name}: Anker eindeutig`).toBe(1);
    }
  });
});
