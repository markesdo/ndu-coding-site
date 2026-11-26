import { readFileSync } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Folie from './Folie.astro';
import BuchAbbildung from './bild/BuchAbbildung.astro';

// Audit 26.11. (Tag 4 im Beamer): Mechanik, die Layout.astro und beamer.css aus Folie.astro / BuchAbbildung.astro lesen.
const BEAMER_CSS = readFileSync(new URL('../styles/beamer.css', import.meta.url), 'utf8');
const LAYOUT = readFileSync(new URL('../layouts/Layout.astro', import.meta.url), 'utf8');

describe('Folie: weiter und ende', () => {
  it('weiter wird data-weiter, ende wird data-ende; ohne beides keines der Attribute', async () => {
    const c = await AstroContainer.create();
    const mitWeiter = await c.renderToString(Folie, { props: { weiter: '/innolab/methoden/value-map#vorgehen' } });
    const mitEnde = await c.renderToString(Folie, { props: { ende: true } });
    const ohne = await c.renderToString(Folie, {});
    expect(mitWeiter).toContain('data-weiter="/innolab/methoden/value-map#vorgehen"');
    expect(mitWeiter).not.toContain('data-ende');
    expect(mitEnde).toMatch(/data-ende(=""|\s|>)/);
    expect(mitEnde).not.toContain('data-weiter');
    expect(ohne).not.toMatch(/data-(weiter|ende)/);
  });

  it('Layout.astro liest beide Attribute für → (folien.ts: sprung, ende)', () => {
    expect(LAYOUT).toContain("sprung: !!folie.dataset.weiter, ende: folie.hasAttribute('data-ende')");
    expect(LAYOUT).toContain("else if (tun === 'sprung') springeNach(folie.dataset.weiter!);");
  });
});

describe('Beamer ohne weiches Scrollen', () => {
  // global.css: html { scroll-behavior: smooth } – im Beamer flog value-map#vorgehen 1,5 s über elf Folien.
  it('beamer.css schaltet scroll-behavior im Beamer ab', () => {
    expect(BEAMER_CSS).toMatch(/html\[data-beamer\] \{ scroll-behavior: auto; \}/);
  });
});

describe('BuchAbbildung: Maße vor dem Laden', () => {
  it('trägt width, height und contain-intrinsic-size aus der Datei (varianten.jpg: 1000 × 394)', async () => {
    const html = await (await AstroContainer.create()).renderToString(BuchAbbildung, {
      props: { src: '/quellen/patton/varianten.jpg', alt: 'x', quelle: 'y' },
    });
    expect(html).toContain('width="1000"');
    expect(html).toContain('height="394"');
    expect(html).toContain('contain-intrinsic-size: 1000px 394px');
  });
});
