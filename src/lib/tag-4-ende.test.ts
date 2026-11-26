import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { ohneAbgeschaltet } from '../components/abgeschaltet';
import { station } from '../components/arbeitsfluss';
import { bloeckeAus, folienAus, quellenAusGlob } from './begleiter';

// Audit 26.11.2026 (Tag 4 im Beamer, Punkte E und F): Tag 4 hatte kein Ende. Nach scrum#planen lief → in die Tag-5-Folien
// (#team, #dod …) und weiter nach /methoden/backlog; die Origin Story (17:15) kam schon um 11:30 nach experiment#vorgehen.
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const seite = (p: string) => ohneAbgeschaltet(quellen[p] ?? '');
const folie = (p: string, id: string) => {
  const q = seite(p);
  const a = q.indexOf(`<h2 id="${id}">`);
  return a < 0 ? '' : q.slice(q.lastIndexOf('<Folie', a), q.indexOf('</Folie>', a));
};

type F = { id: string; weiter?: string; zurueck?: string; ende: boolean };
/** ende als nacktes Attribut – nicht „ende“ in einem Wert wie weiter="…#ende-tag-4". */
const hatEnde = (attr: string) => /(?:^|\s)ende(?=\s|\/?$)/.test(attr.replace(/="[^"]*"/g, '=""'));
/** Folien einer Seite mit weiter / zurueck / ende aus dem Tag <Folie …> (so liest Layout.astro sie als data-…). Die
 *  Überschrift muss in derselben Folie stehen: Der Ausdruck läuft nicht über </Folie> hinaus. */
function folienMit(p: string): F[] {
  return [...seite(p).matchAll(/<Folie\b([^>]*)>(?:(?!<\/Folie>)[\s\S])*?<h2 id="([^"]+)"/g)].map(([, attr, id]) => ({
    id, weiter: attr.match(/\bweiter="([^"]+)"/)?.[1], zurueck: attr.match(/\bzurueck="([^"]+)"/)?.[1], ende: hatEnde(attr),
  }));
}
const naechsteSeite = (p: string) => seite(p).match(/<FooterNav\b[^>]*\bnext=\{\{ href: '([^']+)'/)?.[1];
const vorigeSeite = (p: string) => seite(p).match(/<FooterNav\b[^>]*\bprev=\{\{ href: '([^']+)'/)?.[1];

/** Was ← am Anfang einer Folie (keine Schritte gezeigt) tut: zurueck → dorthin, sonst die Folie davor, auf der ersten
 *  Folie die vorige Seite (FooterNav; dort landet man auf deren Anker bzw. Seitenanfang). */
function zurueckVon(pfad: string, id: string): string {
  const fs = folienMit(pfad);
  const i = fs.findIndex((f) => f.id === id);
  expect(i, `${pfad}#${id}: keine Folie`).toBeGreaterThanOrEqual(0);
  if (fs[i].zurueck) return fs[i].zurueck!;
  return i > 0 ? `${pfad}#${fs[i - 1].id}` : (vorigeSeite(pfad) ?? '(keine)');
}

/**
 * Was → im Beamer von Folie zu Folie tut (folien.ts, Ende einer Folie): ende → stehen bleiben; weiter → dorthin;
 * sonst nächste Folie der Seite, nach der letzten die nächste Seite (FooterNav). Ankunft per #anker auf der Folie
 * mit diesem h2 (oder der ersten Folie der Seite).
 */
function route(start: string, max = 60, bis?: string): string[] {
  const weg: string[] = [];
  let [pfad, anker] = start.split('#');
  for (let n = 0; n < max; n++) {
    const fs = folienMit(pfad);
    if (fs.length === 0) return [...weg, `${pfad} (keine Folien)`];
    let i = anker ? fs.findIndex((f) => f.id === anker) : 0;
    if (i < 0) return [...weg, `${pfad}#${anker} (keine Folie)`];
    for (;;) {
      const f = fs[i];
      weg.push(`${pfad}#${f.id}`);
      if (f.ende) return weg;
      const ziel = f.weiter ?? (i + 1 < fs.length ? undefined : naechsteSeite(pfad));
      if (ziel) { [pfad, anker] = ziel.split('#'); if (pfad === bis) return [...weg, pfad]; break; }
      if (i + 1 >= fs.length) return [...weg, `${pfad} (Seitenende ohne Weiter)`];
      i++;
    }
  }
  return [...weg, '(kein Ende)'];
}

describe('Tag 4 im Beamer: → von 9:00 bis „Ende Tag 4“', () => {
  // Im Test berechnet, nicht beim Sammeln: Ein kaputter Weg soll an einer Assertion rot werden, nicht beim Laden der Datei.
  let weg: string[] = [];
  beforeAll(() => { weg = route('/innolab/tag-4'); });

  it('läuft Tag 4 in der Reihenfolge des Ablaufs und endet auf „Ende Tag 4“', () => {
    const seiten = weg.map((w) => w.split('#')[0]).filter((p, i, a) => p !== a[i - 1]);
    expect(seiten).toStrictEqual([
      '/innolab/tag-4', '/innolab/methoden/value-map', '/innolab/tag-4', '/innolab/methoden/concept-story', '/innolab/methoden/geschaeftsmodell',
      '/innolab/methoden/experiment', '/innolab/methoden/story-map', '/innolab/methoden/usage-story',
      '/innolab/methoden/prototyp-spike', '/innolab/methoden/scrum', '/innolab/tag-4',
    ]);
    // Seit 26.11.2026: Value Map vor „Was bauen wir?“; von ihrer letzten Folie zurück auf tag-4, dann zur Concept Story.
    const vm = weg.indexOf('/innolab/methoden/value-map#uebertrag');
    expect(weg.slice(0, 2)).toStrictEqual(['/innolab/tag-4#arbeitsfluss', '/innolab/methoden/value-map#vorgehen']);
    expect(vm).toBeGreaterThan(1);
    expect(weg.slice(vm, vm + 4)).toStrictEqual([
      '/innolab/methoden/value-map#uebertrag', '/innolab/tag-4#was-bauen-wir', '/innolab/tag-4#slice-im-baum', '/innolab/methoden/concept-story#story-bogen',
    ]);
    // Seit der Durchsicht 26.11.: das Beispiel der Origin Story (Aufsteller der Kaffeebar) als eigene Folie.
    expect(weg.slice(-6)).toStrictEqual([
      '/innolab/methoden/scrum#planen', '/innolab/methoden/scrum#weiter-tag-4',
      '/innolab/tag-4#abschluss', '/innolab/tag-4#origin-beispiel', '/innolab/tag-4#hausaufgabe', '/innolab/tag-4#ende-tag-4',
    ]);
  });

  it('keine Tag-5-Folie von scrum und keine Seite nach scrum außer dem Abschluss', () => {
    expect(weg.filter((w) => /scrum#(team|dod|vorgehen|uebertrag)$/.test(w))).toStrictEqual([]);
    expect(weg.some((w) => w.startsWith('/innolab/methoden/backlog'))).toBe(false);
  });

  it('die Origin Story kommt einmal, im Abschluss – nicht um 11:30 auf der Experiment-Seite', () => {
    const origin = weg.filter((w) => folie(w.split('#')[0], w.split('#')[1]).includes('/quellen/lichaw/origin-story.jpg'));
    expect(origin).toStrictEqual(['/innolab/tag-4#abschluss']);
    expect(folienAus('/innolab/methoden/experiment', seite('/innolab/methoden/experiment')).map((f) => f.id)).not.toContain('origin-story');
    expect(seite('/innolab/methoden/experiment')).not.toContain('<h2 id="origin-story">');
  });
});

describe('Tag 4: Folien des Abschlusses', () => {
  // Seit 26.11.2026: Arbeitsfluss → Value Map → zurück zu „Was bauen wir?“ → „Slice 1 im Baum“ → Concept Story.
  it('der Morgen: Arbeitsfluss → value-map#vorgehen; value-map#uebertrag → „Was bauen wir?“; „Slice 1 im Baum“ → Concept Story, nicht in den Abschluss', () => {
    const fs = folienMit('/innolab/tag-4');
    expect(fs.find((f) => f.id === 'arbeitsfluss')?.weiter).toBe('/innolab/methoden/value-map#vorgehen');
    expect(fs.filter((f) => f.weiter === '/innolab/methoden/value-map#vorgehen').map((f) => f.id)).toStrictEqual(['arbeitsfluss']);
    const vm = folienMit('/innolab/methoden/value-map');
    expect(vm.at(-1)).toStrictEqual({ id: 'uebertrag', weiter: '/innolab/tag-4#was-bauen-wir', zurueck: undefined, ende: false });
    expect(seite('/innolab/methoden/value-map')).toContain('<Folie weiter="/innolab/tag-4#was-bauen-wir" weiterTitel="Was bauen wir?">');
    // „Was bauen wir?“: → auf „Slice 1 im Baum“ (kein weiter), ← zurück zur Value Map statt zum Arbeitsfluss.
    expect(fs.find((f) => f.id === 'was-bauen-wir')).toStrictEqual({ id: 'was-bauen-wir', weiter: undefined, zurueck: '/innolab/methoden/value-map#uebertrag', ende: false });
    expect(zurueckVon('/innolab/tag-4', 'was-bauen-wir')).toBe('/innolab/methoden/value-map#uebertrag');
    expect(fs.find((f) => f.id === 'slice-im-baum')?.weiter).toBe('/innolab/methoden/concept-story#story-bogen');
    expect(seite('/innolab/tag-4')).toContain('<Folie weiter="/innolab/methoden/concept-story#story-bogen" weiterTitel="Story-Bogen + Concept Story">');
  });

  // Review #448: ← auf tag-4#abschluss ging zu „Was bauen wir?“ (9:00) statt zurück auf scrum.
  it('← am Anfang des Abschlusses führt zurück zur letzten Tag-4-Folie auf scrum', () => {
    expect(zurueckVon('/innolab/tag-4', 'abschluss')).toBe('/innolab/methoden/scrum#weiter-tag-4');
  });

  it('der Block 17:15 im Ablauf und alle Links auf die Origin Story zeigen auf die Folie im Abschluss', () => {
    expect(bloeckeAus(seite('/innolab/tag-4')).find((b) => b.titel === 'Origin Story & Hausaufgabe')?.href).toBe('#abschluss');
    expect(station('origin-story')?.href).toBe('/innolab/tag-4#abschluss');
    for (const [p, q] of Object.entries(quellen)) expect(q, p).not.toContain('experiment#origin-story');
  });

  it('Hausaufgabe: die Schritte auf der Folie stehen alle in der Checkliste; die ganze Liste nur im Handout', () => {
    const f = folie('/innolab/tag-4', 'hausaufgabe');
    const schritte = [...f.matchAll(/<li data-schritt>([\s\S]*?)<\/li>/g)].map((m) => m[1]);
    expect(schritte.length).toBeGreaterThanOrEqual(4);
    expect(schritte.length).toBeLessThanOrEqual(6);
    const liste = f.slice(f.indexOf('<div class="nur-handout">'));
    expect(liste).toContain('<Checklist id="il-tag4-hausaufgabe-5-v4" items={[');
    // Je Schritt der Teil, der wörtlich aus einem Punkt der Liste kommt.
    // Review #448: Die Folie zeigte nur die Punkte 6–12; der erste Schritt nennt die Punkte 1–5.
    // Seit der Durchsicht 26.11.: zuerst, was andere Menschen und Vorlauf braucht (E1, fünf Tests); „Fertig machen“ an fünfter Stelle.
    expect(schritte.map((x) => x.match(/^<strong>([^<]+)<\/strong>/)?.[1])).toStrictEqual([
      'E1 laufen lassen', 'Fünf Usability-Tests', 'Je Lernkarte die Entscheidung:', 'Origin Story', 'Fertig machen, was heute offen blieb:', 'Linear einrichten,',
    ]);
    expect(schritte[0]).toContain('bis drei Werktage vor Tag 5');
    expect(schritte[4]).toBe('<strong>Fertig machen, was heute offen blieb:</strong> Value Map und Fit, Concept Story, Baum, Geschäftsmodell und Karte E1, Story Map und Usage Story (ganze Liste im Handout).');
    for (const aus of ['Value Map und Fit', 'Concept Story', 'Euer Baum', 'GESCHAEFTSMODELL.md', 'Karte E1', 'STORY-MAP.md', 'Usage Story']) expect(liste, aus).toContain(aus);
    for (const aus of [
      'als Text für Aufsteller oder Landingpage in <code>docs/STORYS.md</code>',
      'an einem echten Ort oder als simulierter Moment mit zehn Menschen aus der Zielgruppe',
      'Fünf Usability-Tests</strong> mit Karte E2',
      'Befund → Handlung',
      'als Collaborator',
    ]) {
      expect(schritte.join('\n'), aus).toContain(aus);
      expect(liste.replace(/<\/?strong>/g, ''), aus).toContain(aus.replace(/<\/?strong>/g, ''));
    }
  });

  it('„Ende Tag 4“ ist die letzte Folie, mit ende; Tag 5 beginnt mit dem ersten Block von Tag 5', () => {
    const fs = folienMit('/innolab/tag-4');
    expect(fs.at(-1)).toStrictEqual({ id: 'ende-tag-4', weiter: undefined, zurueck: undefined, ende: true });
    expect(fs.filter((f) => f.ende).map((f) => f.id)).toStrictEqual(['ende-tag-4']);
    const erster = bloeckeAus(seite('/innolab/tag-5'))[0];
    expect(erster.titel).toBe('Test-Debrief');
    const f = folie('/innolab/tag-4', 'ende-tag-4');
    expect(f).toContain(`<p class="nur-beamer">Tag 5 beginnt am 12. Dezember mit dem <a href="/innolab/tag-5${erster.href}">${erster.titel}</a>: Was haben E1 und eure Tests gezeigt?</p>`);
    expect(seite('/innolab/tag-5')).toContain('Samstag, 12. Dezember 2026');
  });
});

// Review #448: An Tag 5 zeigte ← von scrum#team die Tag-4-Folie „Ab hier: Tag 5“ („Heute: weiter am Prototyp bis 17:15“),
// und → von dort sprang in den Abschluss von Tag 4.
describe('Tag 5 im Beamer: rund um scrum#team keine Tag-4-Folie', () => {
  it('→ von Tag 5 über den Debrief nach scrum#team und weiter bis zum Backlog – ohne #weiter-tag-4', () => {
    const weg = route('/innolab/tag-5', 60, '/innolab/methoden/backlog');
    expect(weg.at(-1)).toBe('/innolab/methoden/backlog');
    expect(weg).toContain('/innolab/methoden/scrum#team');
    expect(weg.filter((w) => w.startsWith('/innolab/methoden/scrum'))[0]).toBe('/innolab/methoden/scrum#team');
    expect(weg.some((w) => w.endsWith('#weiter-tag-4') || w.startsWith('/innolab/tag-4'))).toBe(false);
  });

  it('← am Anfang von scrum#team führt zurück zum Debrief von Tag 5, nicht auf #weiter-tag-4', () => {
    expect(zurueckVon('/innolab/methoden/scrum', 'team')).toBe('/innolab/tag-5#debrief-ablauf');
    // Gegenprobe: Ohne zurueck wäre es die Tag-4-Folie darüber.
    const fs = folienMit('/innolab/methoden/scrum');
    const team = fs.findIndex((f) => f.id === 'team');
    expect(team).toBeGreaterThanOrEqual(1);
    expect(fs[team - 1].id).toBe('weiter-tag-4');
    // Der Debrief ist die letzte Folie auf tag-5; dessen → führt nach scrum#team.
    expect(folienMit('/innolab/tag-5').at(-1)?.id).toBe('debrief-ablauf');
  });
});

describe('Hilfen des Tests', () => {
  it('ende nur als nacktes Attribut; der Ausdruck für Folien läuft nicht über </Folie> hinaus', () => {
    expect(hatEnde(' ende')).toBe(true);
    expect(hatEnde(' weiter="/innolab/tag-4#ende-tag-4" weiterTitel="x"')).toBe(false);
    expect(hatEnde(' zurueck="/a" ende')).toBe(true);
    const q = '<Folie weiter="/x"><p>ohne Überschrift</p></Folie>\n<h2 id="draussen">D</h2>';
    expect([...q.matchAll(/<Folie\b([^>]*)>(?:(?!<\/Folie>)[\s\S])*?<h2 id="([^"]+)"/g)]).toHaveLength(0);
  });
});

// Review 2 #448: Was nur zur Uhrzeit am Beamer stimmt, steht nicht im Handout (dort lesen es alle auch an Tag 5).
describe('Handout ohne Beamer-Sätze', () => {
  it('„Heute … bis 17:15“, der Tag-5-Satz und die Hausaufgaben-Schritte nur im Beamer; das Handout behält Hinweis und Checkliste', () => {
    const weiter = folie('/innolab/methoden/scrum', 'weiter-tag-4');
    expect(weiter).toMatch(/<p class="nur-beamer">Heute: weiter am Prototyp bis 17:15/);
    expect(weiter).toMatch(/<p class="nur-handout">Teamaufstellung und Definition of Done folgen an <a href="\/innolab\/tag-5">Tag 5<\/a>/);
    // „folgen an Tag 5“ steht genau einmal außerhalb von .nur-beamer.
    const ohneBeamer = weiter.replace(/<p class="[^"]*\bnur-beamer\b[^"]*">[\s\S]*?<\/p>/g, '');
    expect(ohneBeamer.match(/folgen an/g)).toHaveLength(1);
    const ende = folie('/innolab/tag-4', 'ende-tag-4').replace(/<p class="[^"]*\bnur-beamer\b[^"]*">[\s\S]*?<\/p>/g, '');
    expect(ende.match(/beginnt mit dem Test-Debrief/g)).toHaveLength(1);
    expect(folie('/innolab/tag-4', 'hausaufgabe')).toContain('<ol class="gross dicht nur-beamer">');
  });
});

// Review 3 #448: Der Handout-Link führt auf die Vorlage selbst, nicht nur auf die Seite.
describe('Origin Story: Vorlage verlinkt', () => {
  it('tag-4#abschluss verlinkt experiment#vorlage-origin-story, und dort steht die Überschrift mit dieser id', () => {
    expect(folie('/innolab/tag-4', 'abschluss')).toContain('href="/innolab/methoden/experiment#vorlage-origin-story"');
    expect(seite('/innolab/methoden/experiment')).toContain('<h3 id="vorlage-origin-story">Vorlage · Origin Story in docs/STORYS.md</h3>');
  });
});

// 26.11.: Wie hängt Slice 1 mit dem Baum von Tag 2/3 zusammen? Eine Folie direkt nach „Was bauen wir?“ (9:00).
describe('Tag 4: Folie „Slice 1 im Baum“', () => {
  it('steht direkt nach „Was bauen wir?“, als letzte Folie vor dem Abschluss', () => {
    const ids = folienMit('/innolab/tag-4').map((f) => f.id);
    expect(ids.slice(ids.indexOf('was-bauen-wir'), ids.indexOf('was-bauen-wir') + 3)).toStrictEqual(['was-bauen-wir', 'slice-im-baum', 'abschluss']);
  });

  it('nennt die drei Linien, Slice 1, Ziel-Chance und Spitzenreiter; Torres nur im Handout', () => {
    const f = folie('/innolab/tag-4', 'slice-im-baum');
    expect(f).toContain('<h2 id="slice-im-baum">Slice 1 im Baum</h2>');
    expect(f).toContain('<SliceImBaum />');
    const handout = f.slice(f.indexOf('<div class="nur-handout">'));
    expect(handout.length).toBeGreaterThan(30);
    for (const w of ['<strong>Outcome</strong>', '<strong>Beleg</strong>', '<strong>Annahme</strong>', 'Slice 1', 'Ziel-Chance', 'Spitzenreiter', '(A5)', 'E1 testet A5']) expect(handout, w).toContain(w);
    expect(handout).toContain('it’s also a great technique for helping us to surface underlying assumptions“ (S. 119)');
    // Am Beamer ohne Zitat: Torres steht nicht außerhalb des Handouts.
    expect(f.slice(0, f.indexOf('<div class="nur-handout">'))).not.toContain('Torres');
    // Ohne Schritte: von #faden, #methoden oder #abschluss aus deckte → sonst erst unsichtbar Schritte auf.
    expect(f).not.toContain('data-schritt');
  });

  it('das Bild zeigt die drei Linien, Ziel-Chance, Spitzenreiter und Slice 1 – ohne data-schritt', () => {
    const roh = readFileSync(new URL('../components/bild/SliceImBaum.astro', import.meta.url), 'utf8');
    // Ohne Frontmatter und Kommentare: dort darf „data-schritt“ als Wort stehen.
    const bild = roh.replace(/^---[\s\S]*?\n---/, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
    expect(bild).toContain('<figure class="slice-baum"');
    for (const w of ['LINIE.outcome.name', 'LINIE.beleg.name', 'LINIE.annahme.name', 'Ziel-Chance', 'Spitzenreiter', '<strong>Slice 1</strong>', '„Wir lernen, ob …“ – die riskanteste Annahme']) expect(bild, w).toContain(w);
    // Durchsicht 26.11.: rechts nur Begriffe, die um 9:35 bekannt sind – das Layout der Story Map kommt erst ab 11:30.
    expect(bild.match(/Lern-Sticky|links neben Slice 1/g) ?? []).toStrictEqual([]);
    expect(bild).not.toMatch(/\bdata-schritt\b/);
  });
});
