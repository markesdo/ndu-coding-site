// Arbeitsfluss.astro gerendert (Container-API, vitest.config.ts): Punkte, Fokus, Tour und die Schritte auf den
// Seiten, die den Plan einbinden (NDU-74).
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import Arbeitsfluss from './Arbeitsfluss.astro';
import Uebergang from '../Uebergang.astro';
import quelle from './Arbeitsfluss.astro?raw';
import { PUNKT_REM, STATIONEN, quellen, station, tourStationen, ziele } from '../arbeitsfluss';
import { rollen, stationAusAdresse, tourFokus } from '../arbeitsfluss-fokus';

let container: AstroContainer;
beforeAll(async () => { container = await AstroContainer.create(); });
const render = (props: Record<string, unknown>) => container.renderToString(Arbeitsfluss, { props });

/** Öffnende Tags der Stationen: id → Klassen. */
function stationKlassen(html: string): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [tag] of html.matchAll(/<(?:a|span)\b[^>]*\bdata-id="[^"]+"[^>]*>/g)) {
    const id = tag.match(/data-id="([^"]+)"/)![1];
    out[id] = (tag.match(/\bclass="([^"]*)"/)?.[1] ?? '').split(/\s+/);
  }
  return out;
}
/** Schritte, die die Folienmechanik zählt (Layout.astro: data-schritt, nicht in [hidden] oder .nur-handout). */
const schritte = (html: string) => [...html.matchAll(/<[^>]*\bdata-schritt\b[^>]*>/g)].map((m) => m[0]);

describe('Punkte tragen die Farbe ihrer Hauptlinie', () => {
  it('jede Station hat die Klasse ihrer ersten Linie', async () => {
    const k = stationKlassen(await render({}));
    expect(Object.keys(k)).toHaveLength(STATIONEN.length);
    for (const s of STATIONEN) expect(k[s.id], s.id).toContain(`af-haupt-${s.linien[0]}`);
  });

  it('das CSS füllt den Punkt mit dieser Farbe (nicht mit der Textfarbe)', () => {
    for (const l of ['beleg', 'outcome', 'annahme']) expect(quelle).toMatch(new RegExp(`\\.af-haupt-${l} \\{ --af-farbe: var\\(--af-${l}\\); \\}`));
    const punkt = quelle.match(/\n {2}\.af-punkt \{([^}]*)\}/)?.[1] ?? '';
    expect(punkt).toMatch(/background: var\(--af-farbe\)/);
    expect(punkt).toMatch(/border: 3px solid var\(--af-farbe\)/);
  });

  it('Punktgrößen kommen aus PUNKT_REM (auch der Stern), keine festen Maße im CSS', async () => {
    expect(quelle).toMatch(/\.af-station\.af-stern \.af-punkt \{ width: var\(--af-punkt-stern\); height: var\(--af-punkt-stern\);/);
    expect(quelle).not.toMatch(/\.af-punkt[^{]*\{[^}]*width: \d/);
    const html = await render({});
    expect(html).toContain(`--af-punkt-stern:${PUNKT_REM.stern}rem`);
  });
});

describe('Lucide-Icons im Punkt: Die Regeln der Komponente greifen (kein Pfeil ohne Fokus)', () => {
  it('Pfeil und Stern tragen das Scope-Attribut der Komponente, die Regeln stehen im Scope', async () => {
    const html = await render({});
    const cid = html.match(/<figure[^>]*\s(data-astro-cid-[a-z0-9]+)/)?.[1];
    expect(cid).toBeTruthy();
    const pfeile = [...html.matchAll(/<svg\b[^>]*\baf-pfeil\b[^>]*>/g)].map((m) => m[0]);
    expect(pfeile).toHaveLength(STATIONEN.length);
    expect(pfeile.filter((p) => !p.includes(cid!))).toStrictEqual([]);
    const sterne = [...html.matchAll(/<svg\b[^>]*\baf-stern-icon\b[^>]*>/g)].map((m) => m[0]);
    expect(sterne.length).toBeGreaterThan(0);
    expect(sterne.filter((p) => !p.includes(cid!))).toStrictEqual([]);
    // Ohne :global – also gescopt; der Pfeil ist nur bei einem Ziel zu sehen.
    expect(quelle).toMatch(/\n {2}\.af-pfeil \{ display: none; \}/);
    expect(quelle).toMatch(/\.af-station\.af-ziel \.af-pfeil \{ display: block; \}/);
    expect(quelle).toMatch(/\.af-station\.af-ziel\.af-stern \.af-pfeil \{ display: none; \}/);
  });
});

describe('Fokus: Station → markierte Quellen und Ziele', () => {
  for (const id of ['kundenprofil', 'story-map', 'prototyp-spike']) {
    it(id, async () => {
      const s = station(id)!;
      const html = await render({ id: 'p', fokus: id });
      const k = stationKlassen(html);
      const mit = (rolle: string) => Object.keys(k).filter((x) => k[x].includes(`af-${rolle}`)).sort();
      expect(mit('fokus')).toStrictEqual([id]);
      expect(mit('quelle')).toStrictEqual(quellen(s).map((x) => x.id).sort());
      expect(mit('ziel')).toStrictEqual(ziele(s).map((x) => x.id).sort());
      expect(mit('blass')).toHaveLength(STATIONEN.length - 1 - quellen(s).length - ziele(s).length);
      expect(html).toMatch(/<figure[^>]*\bdata-fokus-an\b/);
      // Nur der Pfad und die Fußzeile dieser Station sind an.
      const an = [...html.matchAll(/<path[^>]*class="af-fokus-pfad af-an"[^>]*data-fokus-pfad="([^"]+)"/g)].map((m) => m[1]);
      expect(new Set(an)).toStrictEqual(new Set([id]));
      const fuss = [...html.matchAll(/<span class="af-fuss-fokus"[^>]*data-fuss="([^"]+)"(?![^>]*hidden)[^>]*>/g)].map((m) => m[1]);
      expect(fuss).toStrictEqual([id]);
      expect(html).toMatch(/<span class="af-fuss-legende" hidden/);
    });
  }

  it('ohne Fokus: keine Rolle, kein Pfad an, Legende statt Fußzeile', async () => {
    const html = await render({});
    const k = stationKlassen(html);
    expect(Object.values(k).flat().filter((c) => /^af-(fokus|quelle|ziel|blass)$/.test(c))).toStrictEqual([]);
    expect(html).not.toMatch(/af-fokus-pfad af-an/);
    expect(html).not.toMatch(/<figure[^>]*\bdata-fokus-an\b/);
    expect(html).toMatch(/<span class="af-fuss-legende"(?![^>]*\shidden)[^>]*>/);
  });

  it('jede Station verweist für Screenreader auf ihre Fußzeile (Kommt aus / Geht nach)', async () => {
    const html = await render({ id: 'p' });
    for (const s of STATIONEN) {
      expect(html).toContain(`data-id="${s.id}"`);
      expect(html).toMatch(new RegExp(`data-id="${s.id}"[^>]*aria-describedby="p-fuss-${s.id}"|aria-describedby="p-fuss-${s.id}"[^>]*data-id="${s.id}"`));
      expect(html).toContain(`id="p-fuss-${s.id}"`);
    }
  });

  it('unbekannter Fokus bricht den Bau ab', async () => {
    await expect(render({ fokus: 'gibt-es-nicht' })).rejects.toThrow(/unbekannt/);
  });
});

describe('Tour: eine Station je Schritt', () => {
  it('Tag 4: zehn Schritte, je Station einer, in der Reihenfolge des Ablaufs, sonst keine', async () => {
    const html = await render({ hier: 4, bis: 4, tour: 4, legende: false });
    const s = schritte(html);
    expect(s).toHaveLength(10);
    expect(s.map((t) => t.match(/data-tour="([^"]+)"/)?.[1])).toStrictEqual(tourStationen(4).map((x) => x.id));
    // Kein Marker ist hidden – sonst zählte ihn die Folienmechanik nicht.
    expect(s.filter((t) => /\shidden\b/.test(t))).toStrictEqual([]);
  });

  it('Tour und Aufdecken zugleich bricht den Bau ab', async () => {
    await expect(render({ tour: 4, aufdecken: 3 })).rejects.toThrow(/schließen sich aus/);
  });

  it('der Fokus folgt dem zuletzt aufgedeckten Schritt; zurückgeblättert dem davor', () => {
    const ids = tourStationen(4).map((x) => x.id);
    const stand = (n: number) => ids.map((id, i) => ({ id, gezeigt: i < n }));
    expect(tourFokus(stand(0))).toBeUndefined();
    expect(tourFokus(stand(1))).toBe('value-map-nachholen');
    expect(tourFokus(stand(5))).toBe('story-map');
    expect(tourFokus(stand(4))).toBe('experiment');
    expect(tourFokus(stand(10))).toBe('origin-story');
  });
});

describe('andere Seiten mit dem Plan: Schritte unverändert', () => {
  const seiten = import.meta.glob('../../pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
  const aufrufe = Object.entries(seiten).flatMap(([pfad, q]) => [...q.matchAll(/<Arbeitsfluss\b([^>]*?)\/>/g)].map((m) => ({ pfad, attr: m[1] })));

  it('es gibt Seiten mit dem Plan (sonst prüft der Test nichts)', () => {
    expect(aufrufe.length).toBeGreaterThan(3);
  });

  it('nur die Seite Arbeitsfluss hat eine Tour – in einer eigenen Folie nach dem Plan, nicht auf der Plan-Folie', () => {
    expect(aufrufe.filter((a) => /\btour=/.test(a.attr)).map((a) => a.pfad.split('pages/')[1])).toStrictEqual(['innolab/arbeitsfluss.astro']);
    const q = seiten['../../pages/innolab/arbeitsfluss.astro'];
    const folien = [...q.matchAll(/<Folie\b[^>]*>([\s\S]*?)<\/Folie>/g)].map((m) => m[1]);
    const ids = folien.map((f) => f.match(/<h2 id="([^"]+)"/)?.[1]);
    expect(ids.slice(0, 2)).toStrictEqual(['plan', 'tag-4-stationen']);
    expect(folien[0]).not.toMatch(/\btour=/);
    expect(folien[1]).toMatch(/<Arbeitsfluss\b[^>]*\btour=\{4\}/);
    // Außer den Tour-Markern zählt auf der Tour-Folie kein Schritt.
    expect(folien[1]).not.toMatch(/data-schritt/);
  });

  it('jeder Aufruf ohne Tour erzeugt genau die Schritte fürs Aufdecken der Spalten, wie bisher', async () => {
    for (const a of aufrufe.filter((x) => !/\btour=/.test(x.attr))) {
      const auf = a.attr.match(/\baufdecken=\{(\d+)\}/)?.[1];
      const html = await render(auf ? { aufdecken: Number(auf) } : {});
      expect(schritte(html), `${a.pfad} ${a.attr}`).toHaveLength(auf ? 5 - Number(auf) : 0);
      expect(html).not.toMatch(/data-tour=/);
    }
  });
});

describe('Fokus aus der Adresse und Rollen', () => {
  it('?station=… nur für bekannte Stationen', () => {
    const ids = STATIONEN.map((s) => s.id);
    expect(stationAusAdresse('?tag=4&station=story-map', ids)).toBe('story-map');
    expect(stationAusAdresse('?station=gibt-es-nicht', ids)).toBeUndefined();
    expect(stationAusAdresse('?tag=4', ids)).toBeUndefined();
  });

  it('Rollen: Fokus, Quelle, Ziel, sonst blass; ohne Fokus keine', () => {
    expect(rollen(['a', 'b', 'c', 'd'], 'b', { quellen: ['a'], ziele: ['c'] })).toStrictEqual({ a: 'quelle', b: 'fokus', c: 'ziel', d: 'blass' });
    expect(rollen(['a', 'b'], undefined, { quellen: [], ziele: [] })).toStrictEqual({ a: undefined, b: undefined });
  });

  it('der Streifen auf den Methodenseiten öffnet den Plan mit seiner Station im Fokus', async () => {
    const html = await container.renderToString(Uebergang, { props: { station: 'story-map' } });
    expect(html).toContain('href="/innolab/arbeitsfluss?tag=4&amp;station=story-map#plan"');
  });
});
