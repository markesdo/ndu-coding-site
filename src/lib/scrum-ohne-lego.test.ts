import { readFileSync } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Scrum from '../pages/innolab/methoden/scrum.astro';
import { ohneAbgeschaltet } from '../components/abgeschaltet';
import { gliederung } from '../components/gliederung';
import { folienAus } from './begleiter';

// NDU-72 (Entscheidung Markus 25.11.2026): Lego4Scrum ist dieses Kursjahr gestrichen. Die Folien stehen weiter im
// Quelltext von scrum.astro, dürfen aber weder auf dem Beamer noch im Handout, im Inhaltsverzeichnis oder im Begleiter
// erscheinen. Gegenprobe: LEGO4SCRUM_AKTIV auf true → diese Tests werden rot.
const QUELLE = readFileSync(new URL('../pages/innolab/methoden/scrum.astro', import.meta.url), 'utf8');
const LEGO_IDS = ['lego', 'vision', 'produkt-board', 'lego-sprint', 'review-1', 'nachbesprechung'];

describe('Scrum-Seite ohne Lego4Scrum (NDU-72)', () => {
  it('gerendert: kein Lego-Text, die Folge geht von „Planen ohne Schätzen“ zu „Weiter heute: Prototyp bis 17:15“ (Folie #weiter-tag-4), dann #team', async () => {
    const html = await (await AstroContainer.create()).renderToString(Scrum);
    for (const text of ['mit Lego', 'Lego4Scrum: warum Lego', 'Ein Sprint mit Lego', 'Lego4Scrum', 'Das erste Review', 'Was ihr mitnehmt']) {
      expect(html, text).not.toContain(text);
    }
    const ids = [...html.matchAll(/<h2[^>]*\bid="([^"]+)"/g)].map((m) => m[1]);
    for (const id of LEGO_IDS) expect(ids, id).not.toContain(id);
    expect(ids.indexOf('planen')).toBeGreaterThan(0);
    expect(ids.slice(ids.indexOf('planen'), ids.indexOf('planen') + 3)).toStrictEqual(['planen', 'weiter-tag-4', 'team']);
    expect(html.indexOf('Weiter heute: Prototyp bis 17:15</h2>')).toBeGreaterThan(html.indexOf('Planen ohne Schätzen</h2>'));
  }, 60_000);

  it('Inhaltsverzeichnis (gliederung) und Begleiter (folienAus) ohne die Lego-Anker', () => {
    const toc = gliederung(QUELLE).map((a) => a.id);
    const folien = folienAus('/innolab/methoden/scrum', QUELLE);
    const alleFolienIds = folien.flatMap((f) => [f.id, ...f.unterIds]);
    for (const id of LEGO_IDS) {
      expect(toc, id).not.toContain(id);
      expect(alleFolienIds, id).not.toContain(id);
    }
    expect(toc.slice(toc.indexOf('planen'), toc.indexOf('planen') + 3)).toStrictEqual(['planen', 'weiter-tag-4', 'team']);
    expect(folien.map((f) => f.titel).join(' | ')).not.toMatch(/Lego/);
  });
});

describe('ohneAbgeschaltet', () => {
  const block = '{X && (<>\n<Folie><h2 id="weg">Weg</h2></Folie>\n</>)}';
  it('entfernt den Block, wenn const X = false; lässt ihn bei true und ohne Konstante stehen', () => {
    expect(ohneAbgeschaltet(`const X = false;\n---\n<h2 id="a">A</h2>${block}<h2 id="b">B</h2>`)).toBe('const X = false;\n---\n<h2 id="a">A</h2><h2 id="b">B</h2>');
    expect(ohneAbgeschaltet(`const X = true;\n---\n${block}`)).toBe(`const X = true;\n---\n${block}`);
    expect(ohneAbgeschaltet(`const Y = false;\n---\n${block}`)).toBe(`const Y = false;\n---\n${block}`);
  });
});
