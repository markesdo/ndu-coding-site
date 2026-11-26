import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { bloeckeAus, quellenAusGlob } from './begleiter';

// Entscheidung Markus 26.11.2026: Claude Pro schließen alle an Tag 4 gemeinsam ab, um 10:50 als eigener Block direkt vor der
// Experiment-Karte, wo Claude Code zum ersten Mal gebraucht wird – nicht „vor 9:00“ allein.
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const seite = (p: string) => quellen[p] ?? '';
const folie = (p: string, id: string) => {
  const q = seite(p);
  const a = q.indexOf(`<h2 id="${id}">`);
  return a < 0 ? '' : q.slice(a, q.indexOf('</Folie>', a));
};
const setup = () => readFileSync(new URL('../pages/setup.astro', import.meta.url), 'utf8');
const EX = '/innolab/methoden/experiment';
// Seitenkörper ohne Frontmatter (dort steht der Prompt „Gegenprobe zu E1“ als Konstante) und ohne Kommentare.
const koerper = (p: string) => {
  const q = seite(p);
  return q.slice(q.indexOf('---', 3) + 3).replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
};

describe('Tag 4: Claude Pro gemeinsam um 10:50 (Markus 26.11.2026)', () => {
  // Seit 26.11. abends zwei Folien (claude-pro-jetzt, claude-code-opus), damit jede bei 1280 × 720 passt.
  it('Folie „claude-pro-jetzt“ ist die erste Folie der Experiment-Seite; nach „claude-code-opus“ folgt die Theorie (eigener Block 10:50–11:00)', () => {
    const q = seite(EX);
    const pro = q.indexOf('<h2 id="claude-pro-jetzt">Jetzt: Claude Pro abschließen und Claude Code starten</h2>');
    expect(pro).toBeGreaterThan(0);
    // Vor ihr öffnet nur ihre eigene <Folie>, danach folgt als nächste Folie die erste der Theorie.
    expect(q.slice(0, pro).match(/<Folie>/g) ?? []).toHaveLength(1);
    const theorie = q.indexOf('<h2 id="annahmen-der-idee">');
    expect(theorie).toBeGreaterThan(pro);
    expect(q.slice(pro, theorie).match(/<Folie>/g) ?? []).toHaveLength(2);
    const opus = q.indexOf('<h2 id="claude-code-opus">');
    expect(opus).toBeGreaterThan(pro);
    expect(q.slice(opus, theorie).match(/<Folie>/g) ?? []).toHaveLength(1);
  });

  it('der Pro-Block (10:50) liegt vor der ersten Nutzung von Claude Code an Tag 4: Story Map ab 11:30, dann Prototyp-Spike', () => {
    const b = bloeckeAus(seite('/innolab/tag-4'));
    const pro = b.find((x) => x.href === '/innolab/methoden/experiment#claude-pro-jetzt');
    expect(pro).toMatchObject({ von: 10 * 60 + 50, bis: 11 * 60 });
    // Davor nennt kein Block des Ablaufs Claude Code, und keine Übung davor (Value Map, Concept Story, Geschäftsmodell) braucht es.
    const ablauf = seite('/innolab/tag-4').match(/<Block time="[^"]+"[\s\S]*?(?:\/>|<\/Block>)/g) ?? [];
    expect(ablauf).toHaveLength(b.length);
    const davor = ablauf.filter((_, i) => b[i].bis <= pro!.von);
    expect(davor.length).toBeGreaterThan(3);
    expect(davor.flatMap((x) => x.match(/Claude Code|Claude Pro/g) ?? [])).toStrictEqual([]);
    for (const slug of ['value-map', 'concept-story', 'geschaeftsmodell']) {
      const v = folie(`/innolab/methoden/${slug}`, 'vorgehen');
      expect(v.length, slug).toBeGreaterThan(200);
      expect(v.match(/Claude Code|Claude Pro/g) ?? [], slug).toStrictEqual([]);
    }
    // Erste Nutzung: der Prompt der Story Map; ihr Block beginnt nach dem Pro-Block, der Prototyp-Spike noch später.
    expect(seite('/innolab/methoden/story-map')).toContain('<Prompt label="Annahmen hinter Slice 1 · Claude Code"');
    const sm = b.find((x) => x.titel === 'Story Map')!;
    const spike = b.find((x) => x.titel === 'Prototyp-Spike')!;
    expect(sm.von).toBeGreaterThanOrEqual(pro!.bis);
    expect(spike.von).toBeGreaterThan(sm.von);
    // Auf der Experiment-Seite kommt jede Nennung von Claude Code nach der Folie.
    const k = koerper(EX);
    const folieAn = k.indexOf('<h2 id="claude-pro-jetzt">');
    expect(folieAn).toBeGreaterThan(0);
    expect(k.indexOf('Claude Code')).toBeGreaterThan(folieAn);
  });

  it('die Folien nennen den richtigen Grund: Claude Code ab der Story Map (11:30), dann zum Bauen im Spike', () => {
    const f = folie(EX, 'claude-pro-jetzt') + folie(EX, 'claude-code-opus');
    expect(f).toContain('Claude Code braucht ihr heute zum ersten Mal in der <a href="/innolab/methoden/story-map#pruefen">Story Map</a> ab 11:30');
    expect(f).toContain('Markus hilft vor 11:30');
    expect(f).not.toMatch(/bis zum Spike um 14:05|erst für das Pre-Mortem|Claude Code ab hier/);
    // Wer schon Pro oder Max hat, sieht es auf der Folie selbst, nicht nur im Handout – mit den Schritten, die bleiben.
    const sichtbar = f.slice(0, f.indexOf('<div class="nur-handout">'));
    expect(sichtbar).toContain('<strong>Ihr habt schon Pro oder Max?</strong> Dann nichts abschließen, nichts kündigen: nur Schritt 3 bis 5.');
  });

  it('Schritte der beiden Folien: abschließen, kündigen, starten | Opus, Test, wer hängt – mit Setup-Links und 10-Minuten-Timer', () => {
    const pro = folie(EX, 'claude-pro-jetzt');
    const opus = folie(EX, 'claude-code-opus');
    const f = pro + opus;
    const schritte = (x: string) => [...x.matchAll(/<li data-schritt><strong>([^<]+)<\/strong>/g)].map((m) => m[1]);
    expect(schritte(pro)).toStrictEqual(['Claude Pro neu abschließen,', 'Gleich wieder kündigen:', 'Claude Code starten:']);
    expect(schritte(opus)).toStrictEqual(['Modell auf Opus stellen:', 'Kurzer Test:', 'Wer hängt,']);
    expect(opus).toContain('<ol class="gross" start="4">');
    expect([...f.matchAll(/<Timer minuten=\{(\d+)\} \/>/g)].map((m) => m[1])).toStrictEqual(['10']);
    for (const a of ['claude-pro', 'claude-code-browser', 'lokal-schnellweg', 'lokal-starten']) expect(f, a).toContain(`href="/setup#${a}"`);
    // Auf der sichtbaren Folie (vor dem Handout) stehen die Links bei den Schritten Abschließen und Anmelden.
    const sichtbar = pro.slice(0, pro.indexOf('<div class="nur-handout">'));
    expect([...sichtbar.matchAll(/href="\/setup#([a-z-]+)"/g)].map((m) => m[1])).toStrictEqual(['claude-pro', 'claude-code-browser']);
    expect(f).toContain('21,60 €');
    expect(f).toContain('bis etwa 28. Dezember');
    expect(f).toContain('sagt es sofort – laut, in der Teams-Besprechung.');
    expect(f).toContain('keine Erstattung anfordern');
    expect(f).toContain('<div class="nur-handout">');
  });

  it('die Anker der Setup-Seite, auf die die Folie zeigt, sind Überschriften (nicht nur ids von Schritte)', () => {
    const s = setup();
    for (const a of ['claude-pro', 'claude-code-browser', 'lokal-schnellweg', 'lokal-starten']) expect(s, a).toMatch(new RegExp(`<h[2-4] id="${a}">`));
  });

  it('Tag 4: kein „vor 9:00 Claude Pro“ mehr; Hinweis „um 10:50 gemeinsam“ vor dem Ablauf, der 10:50-Block nennt es', () => {
    const t4 = seite('/innolab/tag-4');
    expect(t4).not.toContain('title="Vor 9:00: Claude Pro neu abschließen"');
    expect(t4.match(/heute Morgen|am Morgen vor 9:00/g) ?? []).toStrictEqual([]);
    const hinweis = t4.indexOf('<Callout type="info" title="Claude Pro: um 10:50 gemeinsam, nicht vorher">');
    expect(hinweis).toBeGreaterThan(0);
    expect(hinweis).toBeLessThan(t4.indexOf('<h2 id="ablauf">'));
    expect(t4.slice(hinweis, t4.indexOf('</Callout>', hinweis))).toContain('href="/innolab/methoden/experiment#claude-pro-jetzt"');
    // Eigener Block 10:50–11:00 auf die Folie, danach die Experiment-Karte 11:00–11:30 ohne Verweis auf den Puffer.
    expect(t4).toContain('<Block time="10:50–11:00" type="plenum" title="Claude Pro und Claude Code, gemeinsam" href="/innolab/methoden/experiment#claude-pro-jetzt">');
    expect(t4).toContain('<Block time="11:00–11:30" type="uebung" title="Experiment-Karte" href="/innolab/methoden/experiment#annahmen-der-idee">Schritte der Idee,');
    expect(t4).not.toMatch(/Was davon offen bleibt|im Puffer ab 16:25 nach/);
    // Installieren vorher bleibt, Anmelden erst um 10:50.
    const von = t4.indexOf('title="Vor Tag 4: Claude Code installieren">');
    expect(von).toBeGreaterThan(0);
    const vorher = t4.slice(von, hinweis);
    expect(vorher).toContain('href="/setup#lokal-schnellweg"');
    expect(vorher).toContain('das machen wir gemeinsam um 10:50');
  });

  it('Setup, Tag-2-Abschluss, Tag 3 und Tag 4 schicken niemanden mehr „am Morgen“ von Tag 4 zum Abschluss', () => {
    const s = setup();
    const texte = [s, seite('/innolab/tag-2/abschluss'), seite('/innolab/tag-3'), seite('/innolab/tag-4')];
    expect(texte.every((x) => x.length > 1000)).toBe(true);
    // Sätze mit Pro und „Morgen“ oder „vor 9:00“, nicht nach Ziffern getrennt („28. November“), aber an Block-, Absatz- und
    // Listengrenzen (sonst reicht der Block „Claude Pro“ bis ins „euer Morgen“ der Story Map); die Concept Story schreibt ihr weiterhin am Morgen von Tag 4.
    const saetze = texte.flatMap((x) => x.split(/(?<=\D[.!?])\s+|<\/?(?:Block|p|li|Callout)\b[^>]*>/)).filter((satz) => /Pro\b/.test(satz) && /Morgen|vor 9:00/.test(satz));
    expect(saetze).toStrictEqual([]);
    expect(s).toContain('schließen wir Pro gemeinsam neu ab, um 10:50 in der Besprechung');
  });
});
