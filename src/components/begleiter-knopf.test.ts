import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { bereichVon } from '../lib/navigation';

// Knopf „Begleiter öffnen“ in der Kopfleiste (Layout.astro) und auf /praesentator. Studierende sehen ihn nie:
// er trägt data-nur-praesentator, das beamer.css ohne html[data-ist-praesentator] ausblendet.
const layout = readFileSync(new URL('../layouts/Layout.astro', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles/beamer.css', import.meta.url), 'utf8');
const praesentator = readFileSync(new URL('../pages/praesentator.astro', import.meta.url), 'utf8');

/** Das <a …>-Tag des Knopfs (Klasse begleiter-knopf) samt Attributen. */
function knopfTag(quelle: string, merkmal: string): string {
  const m = quelle.match(new RegExp(`<a [^>]*${merkmal}[^>]*>`));
  if (!m) throw new Error(`kein <a> mit ${merkmal}`);
  return m[0];
}
/** Regelblock zu genau diesem Selektor (am Zeilenanfang, erste Fundstelle), ohne Klammern. */
function regel(selektor: string, quelle = css): string | undefined {
  const esc = selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp(`^[ \\t]*${esc} \\{([^}]*)\\}`, 'm').exec(quelle);
  return m?.[1].trim();
}

describe('Begleiter-Knopf in der Kopfleiste', () => {
  const tag = knopfTag(layout, 'class="begleiter-knopf"');

  it('öffnet den Begleiter in einem neuen Tab, beschriftet für Screenreader', () => {
    expect(tag).toContain('href="/innolab/begleiter"');
    expect(tag).toContain('target="_blank"');
    expect(tag).toContain('rel="noopener"');
    expect(tag).toContain('aria-label="Begleiter öffnen"');
  });

  it('nur beim Präsentator: trägt data-nur-praesentator, und das CSS blendet das ohne Schlüssel hart aus', () => {
    expect(tag).toMatch(/\sdata-nur-praesentator[\s>]/);
    expect(regel('html:not([data-ist-praesentator]) [data-nur-praesentator]')).toBe('display: none !important;');
  });

  it('nur im Innolab: steht im Layout hinter bereich === \'innolab\'', () => {
    const start = layout.indexOf("{bereich === 'innolab' && (");
    expect(start).toBeGreaterThan(-1);
    const ende = layout.indexOf(')}', start);
    expect(layout.indexOf(tag)).toBeGreaterThan(start);
    expect(layout.indexOf(tag)).toBeLessThan(ende);
    // genau ein Knopf: kein zweiter ohne die Bedingung
    expect(layout.split('class="begleiter-knopf"')).toHaveLength(2);
    expect(bereichVon('/innolab/tag-1')).toBe('innolab');
    expect(bereichVon('/tag-1')).toBe('coding');
  });

  it('nur im Beamer-Modus und nicht am Handy (dort ist die Kopfleiste voll)', () => {
    expect(regel('html:not([data-beamer]) .topbar .begleiter-knopf')).toBe('display: none;');
    const schmal = css.slice(css.indexOf('@media (max-width: 900px) {'));
    expect(regel('html[data-beamer] .topbar .begleiter-knopf', schmal.slice(0, schmal.indexOf('\n}')))).toBe('display: none;');
  });

  it('so hoch wie die Knöpfe daneben: gleicher Rahmen und Abstand wie „Beamer“, gestreckt auf die Zeilenhöhe', () => {
    expect(css).toMatch(/html\[data-beamer\] \.topbar button,[^{]*html\[data-beamer\] \.topbar \.begleiter-knopf \{/);
    expect(regel('.topbar .begleiter-knopf')).toContain('align-self: stretch;');
  });
});

describe('Begleiter-Link auf /praesentator', () => {
  it('steht im Bereich „angemeldet“ neben „Abmelden“ und öffnet einen neuen Tab', () => {
    const drin = praesentator.slice(praesentator.indexOf('<div data-praes-angemeldet hidden>'));
    const block = drin.slice(0, drin.indexOf('<script>'));
    const tag = knopfTag(block, 'data-praes-begleiter');
    expect(tag).toContain('href="/innolab/begleiter"');
    expect(tag).toContain('target="_blank"');
    expect(tag).toContain('rel="noopener"');
    expect(block).toContain('Begleiter öffnen</a>');
    expect(block).toContain('data-praes-abmelden');
    // nicht im Anmeldeformular, das Abgemeldete sehen
    const form = praesentator.slice(praesentator.indexOf('<form'), praesentator.indexOf('</form>'));
    expect(form).not.toContain('/innolab/begleiter');
  });
});
