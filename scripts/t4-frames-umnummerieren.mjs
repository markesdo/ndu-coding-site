// Tag-4-Frames umnummerieren (28.11.2026): Die Nummern folgen jetzt der Reihenfolge des Tages. Die Frame-IDs auf dem Board
// bleiben, nur die Titel ändern sich – hier dieselbe Zuordnung für alle Dateien unter src/.
// Aufruf: `node scripts/t4-frames-umnummerieren.mjs` (wiederholbar: Die neuen Namen treffen kein altes Muster).
// Ein Durchgang über Platzhalter: erst jeder alte Name → eigenes Token, dann jedes Token → neuer Name. So wird nie verkettet
// (0 → 1 und danach 1 → 4). Längere Namen stehen vor ihren Präfixen.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// Neuer Name der Teamaufstellung (wandert zu Tag 5); den genauen Titel vergibt der Umbau auf dem Board.
export const TEAMAUFSTELLUNG_NEU = 'T5 · 1 · Teamaufstellung & DoD';

// Alter Titel-Anfang → neuer. Jeder Eintrag ist ein Präfix: „T4 · 0 · Concept Story“ trifft auch „… · Kaffeebar“, „… · Produkt n“.
export const ALT_NEU = [
  ['T4 · 0 · Anleitung Concept Story', 'T4 · 1 · Anleitung Concept Story'],
  ['T4 · 0 · Concept Story', 'T4 · 1 · Concept Story'],
  ['T4 · 7 · Anleitung Geschäftsmodell', 'T4 · 2 · Anleitung Geschäftsmodell'],
  ['T4 · 7 · Geschäftsmodell', 'T4 · 2 · Geschäftsmodell'],
  ['T4 · 0 · Anleitung Annahmen der Idee', 'T4 · 3 · Anleitung Annahmen der Idee'],
  ['T4 · 0 · Annahmen der Idee', 'T4 · 3 · Annahmen der Idee'],
  ['T4 · 1 · Anleitung Warm-up', 'T4 · 4 · Anleitung Warm-up'],
  ['T4 · 1 · Warm-up', 'T4 · 4 · Warm-up'],
  ['T4 · 1 · Anleitung Story Map', 'T4 · 4 · Anleitung Story Map'],
  ['T4 · 1 · Story Map', 'T4 · 4 · Story Map'],
  ['T4 · 4 · Anleitung Usage Story', 'T4 · 5 · Anleitung Usage Story'],
  ['T4 · 4 · Usage Story', 'T4 · 5 · Usage Story'],
  ['T4 · 5 · Anleitung Prototyp', 'T4 · 6 · Anleitung Prototyp'],
  ['T4 · 5 · Prototyp', 'T4 · 6 · Prototyp'],
  ['T4 · 3 · Scrum', 'T4 · 7 · Scrum'],
  ['T4 · 6 · Anleitung Origin Story', 'T4 · 8 · Anleitung Origin Story'],
  ['T4 · 6 · Origin Story', 'T4 · 8 · Origin Story'],
  ['T4 · 6 · Anleitung Lernkarten', 'T4 · 8 · Anleitung Lernkarten'],
  ['T4 · 6 · Lernkarten', 'T4 · 8 · Lernkarten'],
  ['T4 · 2 · Teamaufstellung & DoD', TEAMAUFSTELLUNG_NEU],
].sort((a, b) => b[0].length - a[0].length);

// Kurzformen ohne Titel (nur Tag und Nummer), von Hand geprüft: exakter Text mit Umgebung → neuer Text.
export const KURZFORMEN = [
  ['Anleitung-Frame links neben „T4 · 0“ zeigen', 'Anleitung-Frame links neben „T4 · 3“ zeigen'],
  ['an Tag 4 (experiment.astro), darum T4 · 0.', 'an Tag 4 (experiment.astro), darum T4 · 3.'],
  ['// Anleitung links neben T4 · 0 (seit 26.11.2026)', '// Anleitung links neben T4 · 3 (seit 26.11.2026)'],
  ['(eigene Spalte in T4 · 1)', '(eigene Spalte in T4 · 4)'],
];

const ERSETZUNGEN = [...ALT_NEU, ...KURZFORMEN];

/** Ersetzt in einem Text; zählt je altem Namen. */
export function umnummerieren(text, zaehler = new Map()) {
  const token = (i) => `\u0000T4FRAME${i}\u0000`;
  let t = text;
  ERSETZUNGEN.forEach(([alt], i) => {
    const teile = t.split(alt);
    if (teile.length > 1) zaehler.set(alt, (zaehler.get(alt) ?? 0) + teile.length - 1);
    t = teile.join(token(i));
  });
  ERSETZUNGEN.forEach(([, neu], i) => { t = t.split(token(i)).join(neu); });
  return t;
}

const dateien = (d) => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? dateien(p) : /\.(astro|ts|tsx|mjs|js|css|md|json)$/.test(n) ? [p] : [];
});

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const wurzel = fileURLToPath(new URL('..', import.meta.url));
  const zaehler = new Map();
  const geaendert = [];
  for (const p of dateien(join(wurzel, 'src'))) {
    const alt = readFileSync(p, 'utf8');
    const neu = umnummerieren(alt, zaehler);
    if (neu !== alt) { writeFileSync(p, neu); geaendert.push(relative(wurzel, p)); }
  }
  for (const [alt] of ERSETZUNGEN) console.log(`${String(zaehler.get(alt) ?? 0).padStart(4)}  ${alt}`);
  console.log(`\n${geaendert.length} Dateien geändert:\n${geaendert.join('\n')}`);
}
