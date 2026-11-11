import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Der Werkstatt-Dialog darf nie als Ganzes scrollen: Sonst wandern Kopf- und Fußleiste („Speichern“) aus dem Bild,
// sobald absolut positionierte Nur-Leser-Elemente tief im Inhalt den Dialog höher machen als den Bildschirm.
// Layout misst jsdom nicht; der Test hält deshalb die Deklarationen fest, die das verhindern.
const css = readFileSync(new URL('../styles/werkstatt.css', import.meta.url), 'utf8');

/** Deklarationen des ersten Blocks, dessen Selektor genau `selektor` ist (ohne Kommentare). */
function regel(selektor: string): string {
  const ohneKommentare = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const treffer = ohneKommentare.match(new RegExp(`(^|\\n)\\s*${selektor.replace(/\./g, '\\.')}\\s*\\{([^}]*)\\}`));
  if (!treffer) throw new Error(`Keine Regel für ${selektor} in werkstatt.css`);
  return treffer[2];
}

describe('werkstatt.css: Dialog scrollt nicht als Ganzes', () => {
  it('.wk-dialog schneidet Überlauf ab (clip, nicht hidden – hidden ließe sich per Fokus scrollen)', () => {
    expect(regel('.wk-dialog')).toMatch(/overflow:\s*clip/);
  });

  it.each(['.wk-formular', '.wk-bild', '.lv-leser-inhalt', '.zg-buehne', '.zg-kontext'])('%s hält absolut positionierte Kinder in seinem Scrollbereich', (s) => {
    expect(regel(s)).toMatch(/position:\s*relative/);
  });
});
