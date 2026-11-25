import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Das Repo ist öffentlich: Vornamen und Kürzel der Studierenden stehen nirgends in src/ und public/ – nicht in Seiten,
// Begleiter-Notizen, Code, Tests oder Dateinamen. Frames je Person heißen hier „Produkt 1/2/3“ (miro-frames.ts),
// Testpersonen der Werkstatt sind erfunden.
//
// Die Namensliste steht bewusst nicht im Repo (auch nicht als Hash – Vornamen ließen sich per Wörterbuch zurückrechnen).
// Sie kommt aus der Umgebungsvariable NAMEN_WAECHTER (kommagetrennt) oder aus der nicht eingecheckten Datei
// .namen-waechter.local im Repo-Wurzelverzeichnis (ein Wort pro Zeile, # für Kommentare; steht in .gitignore). Fehlt
// beides, wird die Prüfung des Repos übersprungen und meldet das – sie wird nicht grün vorgetäuscht.
const WURZEL = fileURLToPath(new URL('..', import.meta.url));
const LISTE = join(WURZEL, '.namen-waechter.local');

function namenLaden(): string[] {
  const roh = process.env.NAMEN_WAECHTER
    ? process.env.NAMEN_WAECHTER.split(',')
    : existsSync(LISTE) ? readFileSync(LISTE, 'utf8').split('\n').filter((z) => !z.trim().startsWith('#')) : [];
  return [...new Set(roh.map((w) => w.trim().toLowerCase()).filter(Boolean))];
}

const NAMEN = namenLaden();

// Die Liste häufiger Vornamen der Eigennamen-Prüfung meint niemanden, sondern löst den Hinweis „Vorname“ in
// Interview-Texten aus. Nur dieses Array ist ausgenommen, der Rest der Datei wird geprüft.
const AUSGENOMMEN: Readonly<Record<string, RegExp>> = {
  'src/werkstatt/eigennamen.ts': /const VORNAMEN = \[[^\]]*\];/,
};

const dateien = (d: string): string[] => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? dateien(p) : [p];
});

// Wörter aus Buchstaben; „mapeName“ zählt als „mape“ und „name“, „Annas“ auch als „anna“ (Genitiv). Literaturangaben
// („Name et al. (2007)“) meinen niemanden aus dem Kurs und zählen nicht.
function verboteneWoerter(text: string, namen: readonly string[]): string[] {
  const verboten = new Set(namen);
  const funde = new Set<string>();
  for (const [wort] of text.replace(/\p{Lu}\p{L}+ et al\./gu, '').matchAll(/\p{L}+/gu)) {
    for (const teil of [wort, ...wort.split(/(?<=\p{Ll})(?=\p{Lu})/u)]) {
      const klein = teil.toLowerCase();
      for (const w of klein.endsWith('s') ? [klein, klein.slice(0, -1)] : [klein]) if (verboten.has(w)) funde.add(teil);
    }
  }
  return [...funde];
}

describe('keine Namen von Studierenden im öffentlichen Repo', () => {
  it('der Wächter erkennt ein Wort aus der Liste, auch im Genitiv und in camelCase', () => {
    const probe = ['probewort'];
    expect(verboteneWoerter('Feedback an Probewort und mädchen', probe)).toStrictEqual(['Probewort']);
    expect(verboteneWoerter('Probeworts Baum', probe)).toStrictEqual(['Probeworts']);
    expect(verboteneWoerter("const baumProbewort = 'test-probewort';", probe)).toStrictEqual(['Probewort', 'probewort']);
    expect(verboteneWoerter('Probewort et al. (2007)', probe)).toStrictEqual([]);
    expect(verboteneWoerter("const VORNAMEN = [\n  'Probewort',\n];".replace(AUSGENOMMEN['src/werkstatt/eigennamen.ts']!, ''), probe)).toStrictEqual([]);
  });

  if (NAMEN.length === 0) {
    console.warn('kein-name.test.ts: keine Namensliste (NAMEN_WAECHTER oder .namen-waechter.local) – Prüfung des Repos übersprungen.');
  }

  it.skipIf(NAMEN.length === 0)('kein Name und kein Kürzel in src/ und public/ (Inhalt und Dateiname)', () => {
    const funde: string[] = [];
    const alle = [...dateien(join(WURZEL, 'src')), ...dateien(join(WURZEL, 'public'))];
    expect(alle.length).toBeGreaterThan(100);
    for (const p of alle) {
      const rel = relative(WURZEL, p).split('\\').join('/');
      const inhalt = readFileSync(p);
      // Bilder und andere Binärdateien: nur der Dateiname.
      let text = inhalt.includes(0) ? rel : `${rel}\n${inhalt.toString('utf8')}`;
      const ausnahme = AUSGENOMMEN[rel];
      if (ausnahme) {
        expect(text, `${rel}: ausgenommener Abschnitt fehlt`).toMatch(ausnahme);
        text = text.replace(ausnahme, '');
      }
      for (const wort of verboteneWoerter(text, NAMEN)) funde.push(`${rel}: ${wort}`);
    }
    expect(funde).toStrictEqual([]);
  });
});
