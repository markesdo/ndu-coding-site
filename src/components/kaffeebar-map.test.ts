import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MOMENTNAMEN, zaehlung } from '../data/kaffeebar-skizzen';

// KaffeebarMap.astro: Tag 3 (namen="taetigkeit") zeigt je Moment nur Name + Zählung und baut sich im Beamer mit den vier
// Punkten auf tag-3/experience-map.astro#was-allen-fehlt auf (Entscheidung 21.11., Punkt 22). Tag 2 (ohne Prop,
// journey-map.astro#beispiel) bleibt, wie er unterrichtet wurde: Ich-Sätze, Zitat und ID je Moment.
const quelle = (pfad: string) => readFileSync(new URL(pfad, import.meta.url), 'utf8');
const map = quelle('./KaffeebarMap.astro');
const markup = map.slice(map.indexOf('\n---\n', 4) + 5, map.indexOf('<style>'));
const TAG3_START = "{namen === 'taetigkeit' ? (";
const tag3 = markup.slice(markup.indexOf(TAG3_START) + TAG3_START.length, markup.indexOf(') : ('));
const tag2 = markup.slice(markup.indexOf(') : (') + 5, markup.lastIndexOf(')}'));
const stil = map.slice(map.indexOf('<style>'));
const seite = quelle('../pages/innolab/tag-3/experience-map.astro');
const folie = seite.slice(seite.indexOf('<h2 id="was-allen-fehlt">'), seite.indexOf('</Folie>', seite.indexOf('<h2 id="was-allen-fehlt">')));
const karten = [...tag3.matchAll(/<div class="karte" data-moment="(\w)"[^>]*>([\s\S]*?)<\/div>/g)].map((m) => ({ g: m[1] as 'a' | 'c' | 'd', html: m[2] }));
// Die Zitate von Tag 2 (fett gesetzt), z. B. „das wird nix“.
const zitate = [...tag2.matchAll(/<b>([^<]+)<\/b>/g)].map((m) => m[1].replace(/[.„“…]/g, '').trim());

describe('KaffeebarMap Tag 3: Name + Zählung', () => {
  it('beide Fassungen gefunden', () => {
    expect(tag3).toContain('class="kaffeebar-map tag-3"');
    expect(tag2).toContain('<div class="kaffeebar-map">');
    expect(zitate).toStrictEqual(['das wird nix', 'Dann halt die Brühe', 'Das war ein Fehler', 'in Ruhe']);
  });
  it('drei Momentkarten in der Reihenfolge Halle → Anstehen → Zug', () => {
    expect(karten.map((k) => k.g)).toStrictEqual(['a', 'c', 'd']);
  });
  it('kein Zitat und keine Zitat-ID auf der Map (Karten, Umweg, aria-label)', () => {
    expect(tag3.match(/I\d+-\d+/g) ?? []).toStrictEqual([]);
    expect(tag3).not.toMatch(/class="id"|<b>|„/);
    expect(zitate.filter((z) => tag3.includes(z))).toStrictEqual([]);
  });
  it('Name aus MOMENTNAMEN, Zählung aus zaehlung(g) – nichts hart codiert', () => {
    expect(karten.map((k) => [k.html.match(/<strong>\{MOMENTNAMEN\.(\w)\}<\/strong>/)?.[1], k.html.match(/<span class="zahl">\{zaehlung\('(\w)'\)\}<\/span>/)?.[1]]))
      .toStrictEqual(karten.map((k) => [k.g, k.g]));
    expect(tag3).not.toMatch(/\d+ von \d+/);
    // Die Zahlen, die die Folie damit zeigt (Entscheidung 22).
    expect(['a', 'c', 'd'].map((g) => `${MOMENTNAMEN[g as 'a']} ${zaehlung(g as 'a')}`)).toStrictEqual(['Halle: entscheiden 3 von 5', 'Anstehen und Warten 2 von 5', 'Im Zug 1 von 5']);
  });
  it('Marken ohne ID: Tief an Halle, Umweg und Anstehen, Ende im Zug', () => {
    const marken = [...tag3.matchAll(/<span class="pill (tief|ende)" data-teil="marken">([^<]*)<\/span>/g)].map((m) => `${m[1]}:${m[2]}`);
    expect(marken).toStrictEqual(['tief:Tief', 'tief:Tief', 'tief:Tief', 'ende:Ende']);
    expect(karten.map((k) => k.html.match(/class="pill (\w+)"/)?.[1])).toStrictEqual(['tief', 'tief', 'ende']);
  });
});

describe('KaffeebarMap Tag 2 bleibt', () => {
  it('Ich-Sätze, Zitate mit ID und Marken mit ID', () => {
    expect(tag2).toContain('{name(\'a\')}');
    for (const id of ['I2-1', 'I4-4', 'I3-3', 'I3-5']) expect(tag2).toContain(`<span class="id">${id}</span>`);
    for (const m of ['Tief · I2-1', 'Tief · I4-4', 'Tief · I3-3 · I5-6', 'Ende · I3-5']) expect(tag2).toContain(m);
    expect(tag2).not.toMatch(/data-teil|zaehlung|MOMENTNAMEN/);
    expect(map).toContain("const name = (g: 'a' | 'c' | 'd') => `„${SAETZE[g]}“`;");
  });
  it('journey-map.astro nutzt die Tag-2-Fassung (ohne Prop)', () => {
    expect(quelle('../pages/innolab/methoden/journey-map.astro')).toContain('<KaffeebarMap />');
  });
});

describe('was-allen-fehlt: vier Punkte, jeder deckt seinen Teil der Map auf', () => {
  const SCHRITTE = ['umweg', 'marken', 'grau', 'grenze'];
  it('vier Punkte mit Schritt in dieser Reihenfolge und Wortlaut', () => {
    const punkte = [...folie.matchAll(/<li data-schritt="(\w+)">([\s\S]*?)<\/li>/g)].map((m) => [m[1], m[2].replace(/<[^>]+>/g, '').trim()]);
    expect(punkte).toStrictEqual([
      ['umweg', 'Umweg und Schleife: als Pfeil.'],
      ['marken', 'Tief und Ende: markieren – wo tut es am meisten weh, wie geht es aus?'],
      ['grau', 'Nicht erzählt: graue Karte – zählt 0, ist eure nächste Interviewfrage.'],
      ['grenze', 'Überschneidung: Passt ein Sticky unter zwei Momente? Fragt: Wann in der Geschichte? Sonst überschneiden sie sich – zusammenlegen oder schärfer trennen.'],
    ]);
    // Keine weiteren Schritte auf der Folie, keine in der Map (sonst ein Tastendruck, der nichts zeigt).
    expect(folie.match(/<\w+[^>]*\sdata-schritt\b/g)).toHaveLength(4);
    expect(markup).not.toMatch(/\sdata-schritt\b/);
    expect(folie).toContain('<KaffeebarMap namen="taetigkeit" />');
  });
  it('jeder Schritt hat seinen Teil auf der Map', () => {
    const teile = (t: string) => [...tag3.matchAll(new RegExp(`<(\\w+) class="([^"]+)"[^>]*data-teil="${t}"`, 'g'))].map((m) => m[2]);
    expect(Object.fromEntries(SCHRITTE.map((t) => [t, teile(t)]))).toStrictEqual({
      umweg: ['umweg'],
      marken: ['pill tief', 'pill tief', 'pill tief', 'pill ende'],
      grau: ['chip grau'],
      grenze: ['karte', 'karte'],
    });
    expect(tag3).toContain('Umweg: Automat → Zug');
    expect(tag3).toMatch(/<span class="chip grau" data-teil="grau">Ende\? – nicht erzählt<\/span>/);
  });
  it('Beamer: umweg, marken, grau verborgen bis zu ihrem Schritt; grenze hebt Halle und Anstehen hervor', () => {
    for (const t of ['umweg', 'marken', 'grau']) {
      expect(stil).toContain(`:global(html[data-beamer] [data-folie]:has([data-schritt="${t}"]:not(.gezeigt))) .tag-3 [data-teil="${t}"]`);
    }
    const versteckt = stil.slice(stil.indexOf(':global(html[data-beamer] [data-folie]:has([data-schritt="umweg"]'), stil.indexOf('{ visibility: hidden; }'));
    expect(versteckt.match(/data-teil="\w+"/g)).toStrictEqual(['data-teil="umweg"', 'data-teil="marken"', 'data-teil="grau"']);
    expect(stil).toContain(':global(html[data-beamer] [data-folie]:has([data-schritt="grenze"].gezeigt)) .tag-3 [data-teil="grenze"] { border-color: var(--accent);');
    // Nur im Beamer: außerhalb (Handout, Seite) ist alles sichtbar.
    expect(stil.match(/visibility: hidden/g)).toHaveLength(1);
  });
});
