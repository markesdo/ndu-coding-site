import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { NOTIZEN } from '../data/begleiter';

// NDU-70 (Entscheidung Markus 21.11.2026): Das Entscheidungslog wird in diesem Kursjahr nicht mehr verwendet. Begründet
// wird dort, wo gearbeitet wird – Tag 3 im Feld „Begründen“ auf Miro, bei Experimenten auf der Lernkarte, im Sprint beim
// Sprint-Ziel oder im Issue. Nur die Methodenseite bleibt für alte Links, mit Hinweis.
// Kursregel „kein Reihum“: Übungen beginnen still und dann zugleich oder mit dem Grund; Antworten laut, nicht der Reihe nach.
const SRC = fileURLToPath(new URL('..', import.meta.url));
const dateien = (ordner: string): string[] =>
  readdirSync(join(SRC, ordner), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? dateien(join(ordner, e.name)) : /\.(astro|ts)$/.test(e.name) && !e.name.endsWith('.test.ts') ? [join(ordner, e.name)] : [],
  );
const INNOLAB = [...dateien('pages/innolab'), ...dateien('data/begleiter'), 'components/Antwortrunde.astro'];
const quelle = (datei: string) => readFileSync(join(SRC, datei), 'utf8');

describe('Innolab ohne Entscheidungslog (NDU-70)', () => {
  it('nur die Methodenseite selbst nennt das Entscheidungslog', () => {
    const mit = INNOLAB.filter((d) => /entscheidungslog/i.test(quelle(d)));
    expect(mit).toStrictEqual(['pages/innolab/methoden/entscheidungslog.astro']);
  });

  it('die Methodenseite sagt oben, dass sie dieses Kursjahr nicht genutzt wird', () => {
    const s = quelle('pages/innolab/methoden/entscheidungslog.astro');
    const hinweis = s.indexOf('<Callout type="info" title="Dieses Kursjahr nicht genutzt">');
    expect(hinweis).toBeGreaterThan(0);
    expect(hinweis).toBeLessThan(s.indexOf('<Folie>'));
  });

  it('keine Begleiter-Notizen mehr zur Methodenseite', () => {
    expect(Object.keys(NOTIZEN)).not.toContain('/innolab/methoden/entscheidungslog');
  });
});

describe('Innolab ohne Reihum (Kursregel)', () => {
  it('weder Seiten, Begleiter-Notizen noch die Antwortrunde sagen „reihum“ oder „zu dritt: vorlesen“', () => {
    const treffer = INNOLAB.flatMap((d) =>
      quelle(d)
        .split('\n')
        .map((z, i) => ({ z, i }))
        // Kommentare, die frühere Entscheidungen festhalten („ohne Reihum“), zählen nicht.
        .filter(({ z }) => /reihum|zu dritt:<\/strong> vorlesen/i.test(z) && !/^\s*\/\//.test(z))
        .map(({ i }) => `${d}:${i + 1}`),
    );
    expect(treffer).toStrictEqual([]);
  });
});
