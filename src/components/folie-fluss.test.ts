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
    const mitWeiter = await c.renderToString(Folie, { props: { weiter: '/innolab/methoden/value-map#vorgehen', weiterTitel: 'Value Map' } });
    const mitEnde = await c.renderToString(Folie, { props: { ende: true } });
    const ohne = await c.renderToString(Folie, {});
    expect(mitWeiter).toContain('data-weiter="/innolab/methoden/value-map#vorgehen"');
    expect(mitWeiter).not.toContain('data-ende');
    expect(mitEnde).toMatch(/data-ende(=""|\s|>)/);
    expect(mitEnde).not.toContain('data-weiter');
    expect(mitWeiter).toContain('data-weiter-titel="Value Map"');
    expect(ohne).not.toMatch(/data-(weiter|ende|zurueck)/);
  });

  it('zurueck wird data-zurueck; weiter ohne weiterTitel bricht den Build ab', async () => {
    const c = await AstroContainer.create();
    expect(await c.renderToString(Folie, { props: { zurueck: '/innolab/tag-5#debrief' } })).toContain('data-zurueck="/innolab/tag-5#debrief"');
    await expect(c.renderToString(Folie, { props: { weiter: '/x' } })).rejects.toThrow(/braucht weiterTitel/);
  });

  it('Layout.astro liest beide Attribute für → (folien.ts: sprung, ende)', () => {
    expect(LAYOUT).toContain("sprung: !!folie.dataset.weiter, ende: folie.hasAttribute('data-ende')");
    expect(LAYOUT).toContain("else if (tun === 'sprung') springeNach(folie.dataset.weiter!);");
    expect(LAYOUT).toContain("else if (tun === 'sprung') springeNach(folie.dataset.zurueck!);");
  });

  // Review #447: Auf einer ende-Folie mit Schritten zeigte der Zähler „n / n“, „Ende“ erschien nie.
  it('„Ende“ steht, sobald keine Schritte mehr offen sind – auch auf einer Folie mit Schritten', () => {
    expect(BEAMER_CSS).toContain("html[data-beamer] .folie[data-ende]:not([data-schritte-offen])::after {\n  content: 'Ende';");
    expect(BEAMER_CSS).toContain('html[data-beamer] .folie[data-ende][data-ende-gedrueckt]:not([data-schritte-offen])::after {');
    expect(BEAMER_CSS).not.toMatch(/data-ende[^{]*:not\(\[data-schritte\]\)/);
  });
});

describe('nur im Beamer', () => {
  // Review 2 #448: Sätze zur Uhrzeit auf einer Folie („Heute: … bis 17:15“) lesen sich im Handout an Tag 5 falsch.
  it('.nur-beamer fehlt außerhalb des Beamers und steht im Beamer', () => {
    expect(BEAMER_CSS).toContain('.nur-beamer { display: none; }\nhtml[data-beamer] .nur-beamer { display: revert; }');
  });
});

// Review 2 #447, im Browser gemessen: Von scrum#team ging ← per scrollBy auf die Stelle mit dem Hinweis davor, dann zog
// scroll-snap (proximity, in Scrollrichtung) #planen an den Rand – der Hinweis war übersprungen. Abhilfe: beim Blättern
// mit ← / → kein Einrasten, bis wieder mit Rad, Finger oder Bildtasten gescrollt wird.
describe('kein Einrasten beim Blättern', () => {
  it('beamer.css schaltet scroll-snap mit data-ohne-einrasten ab; Layout setzt es bei ← / → und nimmt es beim Scrollen weg', () => {
    expect(BEAMER_CSS).toContain('html[data-beamer][data-ohne-einrasten]:has(.folie) { scroll-snap-type: none; }');
    expect(LAYOUT).toMatch(/if \(i < 0\) return false;\n\s*ohneEinrasten\(\);/);
    expect(LAYOUT).toContain("for (const t of ['wheel', 'touchstart']) addEventListener(t, einrasten, { passive: true });");
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

  it('findet die Datei auch mit ?query, #anker und Prozent-Kodierung im Pfad', async () => {
    const html = await (await AstroContainer.create()).renderToString(BuchAbbildung, {
      props: { src: '/quellen/patton/%76arianten.jpg?v=2#bild', alt: 'x', quelle: 'y' },
    });
    expect(html).toContain('width="1000"');
  });
});
