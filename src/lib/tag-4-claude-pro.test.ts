import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { quellenAusGlob } from './begleiter';

// Entscheidung Markus 26.11.2026: Claude Pro schließen alle an Tag 4 gemeinsam ab, um 10:50 in der Experiment-Karte, wo
// Claude Code zum ersten Mal gebraucht wird – nicht „vor 9:00“ allein.
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const seite = (p: string) => quellen[p] ?? '';
const folie = (p: string, id: string) => {
  const q = seite(p);
  const a = q.indexOf(`<h2 id="${id}">`);
  return a < 0 ? '' : q.slice(a, q.indexOf('</Folie>', a));
};
const setup = () => readFileSync(new URL('../pages/setup.astro', import.meta.url), 'utf8');
const EX = '/innolab/methoden/experiment';
// Seitenkörper ohne Frontmatter (dort steht der Pre-Mortem-Prompt als Konstante) und ohne Kommentare.
const koerper = (p: string) => {
  const q = seite(p);
  return q.slice(q.indexOf('---', 3) + 3).replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
};

describe('Tag 4: Claude Pro gemeinsam um 10:50 (Markus 26.11.2026)', () => {
  it('Folie „claude-pro-jetzt“ steht in der Experiment-Karte nach der Theorie, direkt vor dem Vorgehen', () => {
    const q = seite(EX);
    const pro = q.indexOf('<h2 id="claude-pro-jetzt">Jetzt: Claude Pro abschließen und Claude Code starten</h2>');
    expect(pro).toBeGreaterThan(q.indexOf('<h2 id="karte-e1">'));
    expect(q.indexOf('<h2 id="karte-e1">')).toBeGreaterThan(0);
    // Keine andere Folie dazwischen: nach der Pro-Folie öffnet genau eine weitere <Folie>, die des Vorgehens.
    const zwischen = q.slice(pro, q.indexOf('<h2 id="vorgehen">'));
    expect(zwischen.match(/<Folie>/g)).toHaveLength(1);
  });

  it('die Folie kommt vor dem ersten Claude-Code-Schritt von Tag 4 (Pre-Mortem unter Prüfen)', () => {
    const k = koerper(EX);
    const pro = k.indexOf('<h2 id="claude-pro-jetzt">');
    expect(pro).toBeGreaterThan(0);
    expect(k.indexOf('Claude Code')).toBeGreaterThan(pro);
    expect(k.indexOf('Pre-Mortem · Claude Code')).toBeGreaterThan(pro);
    // Davor an Tag 4 (Value Map, Concept Story, Geschäftsmodell) nennt keine Übung Claude Code oder Claude Pro.
    for (const slug of ['value-map', 'concept-story', 'geschaeftsmodell']) {
      const v = folie(`/innolab/methoden/${slug}`, 'vorgehen');
      expect(v.length, slug).toBeGreaterThan(200);
      expect(v.match(/Claude Code|Claude Pro/g) ?? [], slug).toStrictEqual([]);
    }
  });

  it('Schritte der Folie: abschließen, kündigen, starten, Test, wer hängt – mit Setup-Links und 10-Minuten-Timer', () => {
    const f = folie(EX, 'claude-pro-jetzt');
    const schritte = [...f.matchAll(/<li data-schritt><strong>([^<]+)<\/strong>/g)].map((m) => m[1]);
    expect(schritte).toStrictEqual(['Claude Pro neu abschließen,', 'Gleich wieder kündigen:', 'Claude Code starten:', 'Kurzer Test:', 'Wer hängt,']);
    expect([...f.matchAll(/<Timer minuten=\{(\d+)\} \/>/g)].map((m) => m[1])).toStrictEqual(['10']);
    for (const a of ['claude-pro', 'claude-code-browser', 'lokal-schnellweg', 'lokal-starten']) expect(f, a).toContain(`href="/setup#${a}"`);
    expect(f).toContain('21,60 €');
    expect(f).toContain('bis etwa 28. Dezember');
    expect(f).toContain('sagt es sofort – laut, in der Teams-Besprechung.');
    expect(f).toContain('keine Erstattung anfordern');
    expect(f).toContain('<div class="nur-handout">');
  });

  it('die Anker der Setup-Seite, auf die die Folie zeigt, gibt es', () => {
    const s = setup();
    for (const a of ['claude-pro', 'claude-code-browser', 'lokal-schnellweg', 'lokal-starten']) expect(s, a).toContain(`id="${a}"`);
  });

  it('Tag 4: kein „vor 9:00 Claude Pro“ mehr; Hinweis „um 10:50 gemeinsam“ vor dem Ablauf, der 10:50-Block nennt es', () => {
    const t4 = seite('/innolab/tag-4');
    expect(t4).not.toContain('title="Vor 9:00: Claude Pro neu abschließen"');
    expect(t4.match(/heute Morgen|am Morgen vor 9:00/g) ?? []).toStrictEqual([]);
    const hinweis = t4.indexOf('<Callout type="info" title="Claude Pro: um 10:50 gemeinsam, nicht vorher">');
    expect(hinweis).toBeGreaterThan(0);
    expect(hinweis).toBeLessThan(t4.indexOf('<h2 id="ablauf">'));
    expect(t4.slice(hinweis, t4.indexOf('</Callout>', hinweis))).toContain('href="/innolab/methoden/experiment#claude-pro-jetzt"');
    expect(t4).toContain('<Block time="10:50–11:20" type="uebung" title="Experiment-Karte" href="/innolab/methoden/experiment">Zuerst gemeinsam Claude Pro abschließen und Claude Code starten (10 min).');
    // Installieren vorher bleibt, Anmelden erst um 10:50.
    const von = t4.indexOf('title="Vor Tag 4: Claude Code installieren">');
    expect(von).toBeGreaterThan(0);
    const vorher = t4.slice(von, hinweis);
    expect(vorher).toContain('href="/setup#lokal-schnellweg"');
    expect(vorher).toContain('das machen wir gemeinsam um 10:50');
  });

  it('Setup, Tag 3 und Tag 4 schicken niemanden mehr „am Morgen“ von Tag 4 zum Abschluss', () => {
    const s = setup();
    const texte = [s, seite('/innolab/tag-3'), seite('/innolab/tag-4')];
    expect(texte.every((x) => x.length > 1000)).toBe(true);
    // Sätze mit Pro und „Morgen“ oder „vor 9:00“, nicht nach Ziffern getrennt („28. November“); die Concept Story schreibt ihr weiterhin am Morgen von Tag 4.
    const saetze = texte.flatMap((x) => x.split(/(?<=\D[.!?])\s+/)).filter((satz) => /Pro\b/.test(satz) && /Morgen|vor 9:00/.test(satz));
    expect(saetze).toStrictEqual([]);
    expect(s).toContain('schließen wir Pro gemeinsam neu ab, um 10:50 in der Besprechung');
  });
});
