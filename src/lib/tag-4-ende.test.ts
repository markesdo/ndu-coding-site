import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { ohneAbgeschaltet } from '../components/abgeschaltet';
import { station } from '../components/arbeitsfluss';
import { bloeckeAus, folienAus, quellenAusGlob } from './begleiter';
import { NOTIZEN_CONCEPT_STORY } from '../data/begleiter/concept-story';
import { NOTIZEN_EXPERIMENT } from '../data/begleiter/experiment';
import { NOTIZEN_GESCHAEFTSMODELL } from '../data/begleiter/geschaeftsmodell';
import { NOTIZEN_SCRUM } from '../data/begleiter/scrum';
import { NOTIZEN_STORY_MAP } from '../data/begleiter/story-map';
import { NOTIZEN_TAG_4 } from '../data/begleiter/tag-4';
import { NOTIZEN_VALUE_MAP } from '../data/begleiter/value-map';

// Audit 26.11.2026 (Tag 4 im Beamer, Punkte E und F): Tag 4 hatte kein Ende. Nach scrum#planen lief → in die Tag-5-Folien
// (#team, #dod …) und weiter nach /methoden/backlog; die Origin Story (17:15) kam schon um 11:30 (heute 11:50) nach experiment#vorgehen.
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const seite = (p: string) => ohneAbgeschaltet(quellen[p] ?? '');
const folie = (p: string, id: string) => {
  const q = seite(p);
  const a = q.indexOf(`<h2 id="${id}">`);
  return a < 0 ? '' : q.slice(q.lastIndexOf('<Folie', a), q.indexOf('</Folie>', a));
};

/** Was der Beamer von einer Folie zeigt: ohne Kommentare und ohne .nur-handout (div mit verschachtelten divs, p, span). */
function imBeamer(f: string): string {
  let s = f.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/<(p|span|li)\b[^>]*\bclass="[^"]*\bnur-handout\b[^"]*"[^>]*>[\s\S]*?<\/\1>/g, '');
  for (;;) {
    const a = s.search(/<div\b[^>]*\bclass="[^"]*\bnur-handout\b[^"]*"[^>]*>/);
    if (a < 0) return s;
    const tags = /<div\b[^>]*>|<\/div>/g;
    tags.lastIndex = a;
    let tiefe = 0;
    let ende = s.length;
    for (let m = tags.exec(s); m; m = tags.exec(s)) {
      if (m[0].endsWith('/>')) continue; // <div … /> öffnet nichts
      tiefe += m[0] === '</div>' ? -1 : 1;
      if (tiefe === 0) { ende = m.index + m[0].length; break; }
    }
    s = s.slice(0, a) + s.slice(ende);
  }
}

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
      '/innolab/methoden/experiment', '/innolab/methoden/story-map', '/innolab/tag-4', '/innolab/methoden/usage-story',
      '/innolab/methoden/prototyp-spike', '/innolab/methoden/scrum', '/innolab/tag-4',
    ]);
    // Seit 26.11.2026: Value Map vor „Was bauen wir?“; von ihrer letzten Folie zurück auf tag-4, dann zur Concept Story.
    const vm = weg.indexOf('/innolab/methoden/value-map#uebertrag');
    expect(weg.slice(0, 2)).toStrictEqual(['/innolab/tag-4#arbeitsfluss', '/innolab/methoden/value-map#vorgehen']);
    expect(vm).toBeGreaterThan(1);
    expect(weg.slice(vm, vm + 3)).toStrictEqual([
      '/innolab/methoden/value-map#uebertrag', '/innolab/tag-4#was-bauen-wir', '/innolab/methoden/concept-story#story-bogen',
    ]);
    // Seit 28.11.2026: „Slice 1 im Baum“ erst, wenn Slice 1 auf der Story Map steht – zwischen Story Map und Usage Story.
    const sm = weg.indexOf('/innolab/methoden/story-map#uebertrag');
    expect(sm).toBeGreaterThan(vm);
    expect(weg.slice(sm, sm + 3)).toStrictEqual([
      '/innolab/methoden/story-map#uebertrag', '/innolab/tag-4#slice-im-baum', '/innolab/methoden/usage-story#drei-storys',
    ]);
    expect(weg.filter((w) => w === '/innolab/tag-4#slice-im-baum')).toHaveLength(1);
    // Seit der Durchsicht 26.11.: das Beispiel der Origin Story (Aufsteller der Kaffeebar) als eigene Folie.
    expect(weg.slice(-6)).toStrictEqual([
      '/innolab/methoden/scrum#planen', '/innolab/methoden/scrum#weiter-tag-4',
      '/innolab/tag-4#abschluss', '/innolab/tag-4#origin-beispiel', '/innolab/tag-4#hausaufgabe', '/innolab/tag-4#ende-tag-4',
    ]);
  });

  // Markus 27.11.: Folien sagen, was zu tun ist und warum – kein Etikett „Kursregel“ (Abgleich mit den Quellen nur im
  // Begleiter). Geprüft wird jede Folie auf dem Weg von 9:00 bis „Ende Tag 4“, ohne Handout und Kommentare.
  // Grenze: gelesen wird nur der .astro-Quelltext der Seite. Text aus eingebundenen Komponenten (z. B. SliceImBaum,
  // WasBauenWir, VierArten) und aus Props, die erst beim Rendern entstehen, sieht der Test nicht.
  it('keine Folie auf dem Weg trägt im Beamer das Etikett „Kursregel“', () => {
    expect(weg.length).toBeGreaterThan(80);
    const treffer = weg.filter((w) => {
      const [p, id] = w.split('#');
      const f = folie(p, id);
      expect(f, w).not.toBe('');
      return /Kursregel/.test(imBeamer(f));
    });
    expect(treffer).toStrictEqual([]);
  });

  it('keine Tag-5-Folie von scrum und keine Seite nach scrum außer dem Abschluss', () => {
    expect(weg.filter((w) => /scrum#(team|dod|vorgehen|uebertrag)$/.test(w))).toStrictEqual([]);
    expect(weg.some((w) => w.startsWith('/innolab/methoden/backlog'))).toBe(false);
  });

  it('die Origin Story kommt einmal, im Abschluss – nicht um 11:50 auf der Experiment-Seite', () => {
    const origin = weg.filter((w) => folie(w.split('#')[0], w.split('#')[1]).includes('/quellen/lichaw/origin-story.jpg'));
    expect(origin).toStrictEqual(['/innolab/tag-4#abschluss']);
    expect(folienAus('/innolab/methoden/experiment', seite('/innolab/methoden/experiment')).map((f) => f.id)).not.toContain('origin-story');
    expect(seite('/innolab/methoden/experiment')).not.toContain('<h2 id="origin-story">');
  });
});

describe('Tag 4: Folien des Abschlusses', () => {
  // Seit 26.11.2026: Arbeitsfluss → Value Map → zurück zu „Was bauen wir?“ → Concept Story. Seit 28.11.2026 kommt „Slice 1 im
  // Baum“ erst nach der Story Map (14:05) und führt zur Usage Story.
  it('der Morgen: Arbeitsfluss → value-map#vorgehen; value-map#uebertrag → „Was bauen wir?“ → Concept Story; story-map#uebertrag → „Slice 1 im Baum“ → Usage Story', () => {
    const fs = folienMit('/innolab/tag-4');
    expect(fs.find((f) => f.id === 'arbeitsfluss')?.weiter).toBe('/innolab/methoden/value-map#vorgehen');
    expect(fs.filter((f) => f.weiter === '/innolab/methoden/value-map#vorgehen').map((f) => f.id)).toStrictEqual(['arbeitsfluss']);
    const vm = folienMit('/innolab/methoden/value-map');
    expect(vm.at(-1)).toStrictEqual({ id: 'uebertrag', weiter: '/innolab/tag-4#was-bauen-wir', zurueck: undefined, ende: false });
    expect(seite('/innolab/methoden/value-map')).toContain('<Folie weiter="/innolab/tag-4#was-bauen-wir" weiterTitel="Was bauen wir?">');
    // „Was bauen wir?“: → direkt zur Concept Story, ← zurück zur Value Map statt zum Arbeitsfluss.
    expect(fs.find((f) => f.id === 'was-bauen-wir')).toStrictEqual({ id: 'was-bauen-wir', weiter: '/innolab/methoden/concept-story#story-bogen', zurueck: '/innolab/methoden/value-map#uebertrag', ende: false });
    expect(zurueckVon('/innolab/tag-4', 'was-bauen-wir')).toBe('/innolab/methoden/value-map#uebertrag');
    expect(fs.find((f) => f.id === 'slice-im-baum')).toStrictEqual({ id: 'slice-im-baum', weiter: '/innolab/methoden/usage-story#drei-storys', zurueck: '/innolab/methoden/story-map#uebertrag', ende: false });
    expect(zurueckVon('/innolab/tag-4', 'slice-im-baum')).toBe('/innolab/methoden/story-map#uebertrag');
    expect(folienMit('/innolab/methoden/story-map').at(-1)).toStrictEqual({ id: 'uebertrag', weiter: '/innolab/tag-4#slice-im-baum', zurueck: undefined, ende: false });
  });

  // 28.11.2026: ← läuft beide Wege zurück, wie → sie hin läuft – nicht an den Anfang der Seite davor (FooterNav).
  it('← zurück: Concept Story → „Was bauen wir?“ → Value Map; Usage Story → „Slice 1 im Baum“ → Story Map', () => {
    expect(zurueckVon('/innolab/methoden/concept-story', 'story-bogen')).toBe('/innolab/tag-4#was-bauen-wir');
    expect(zurueckVon('/innolab/tag-4', 'was-bauen-wir')).toBe('/innolab/methoden/value-map#uebertrag');
    expect(zurueckVon('/innolab/methoden/usage-story', 'drei-storys')).toBe('/innolab/tag-4#slice-im-baum');
    expect(zurueckVon('/innolab/tag-4', 'slice-im-baum')).toBe('/innolab/methoden/story-map#uebertrag');
    // Gegenprobe: Ohne zurueck führte ← an den Anfang der Value Map bzw. der Story Map.
    expect(vorigeSeite('/innolab/methoden/concept-story')).toBe('/innolab/methoden/value-map');
    expect(vorigeSeite('/innolab/methoden/usage-story')).toBe('/innolab/methoden/story-map');
  });

  // Consult 28.11.2026 (consult-tag4-reihenfolge.md, Abschnitte 3 und 4): Überleitungen an den Nahtstellen, wörtlich.
  it('Überleitungen an den Nahtstellen des Tages', () => {
    expect(NOTIZEN_VALUE_MAP.uebertrag.ueberleitung).toBe('Euer Spitzenreiter steht auf Papier – was wird heute daraus?');
    expect(NOTIZEN_TAG_4['was-bauen-wir'].ueberleitung).toBe('Bevor ihr Slice 1 schneidet: Versteht jemand in Sekunden, warum euer Spitzenreiter besser ist als das, was eure Person heute tut?');
    expect(NOTIZEN_STORY_MAP.uebertrag.ueberleitung).toBe('Nach der Pause: erst ein Blick, wo Slice 1 in eurem Baum hängt – dann die Usage Story.');
    expect(NOTIZEN_TAG_4['slice-im-baum'].ueberleitung).toBe('Slice 1 steht und hängt am Baum – jetzt erzählt ihr den Weg durch ihn: die Usage Story.');
    // Concept Story → Geschäftsmodell (10:40): die Folie danach öffnet mit dem Fit der Value Map, darum die Brücke.
    const brueckeGm = 'Die Concept Story sagt, warum jemand wechselt. Offen ist, ob es sich für euch trägt.';
    expect(NOTIZEN_CONCEPT_STORY.vorgehen.ueberleitung).toBe(`Nach der Pause: ${brueckeGm}`);
    expect(NOTIZEN_GESCHAEFTSMODELL['warum-jetzt'].live).toContain(`„${brueckeGm}“`);
    expect(folie('/innolab/methoden/geschaeftsmodell', 'warum-jetzt')).toContain(`<p class="folie-satz">${brueckeGm}</p>`);
    // Scrum → Origin Story (17:15): zurück zum Vormittag, im Begleiter und sichtbar im Beamer.
    expect(NOTIZEN_SCRUM['weiter-tag-4'].ueberleitung).toBe('Scrum beginnt an Tag 5. Für heute fehlt noch ein Stück vom Vormittag: der Text, mit dem E1 laufen würde.');
    expect(folie('/innolab/methoden/scrum', 'weiter-tag-4')).toContain('<p class="nur-beamer">Für heute fehlt noch ein Stück vom Vormittag: der Text, mit dem E1 laufen würde.</p>');
    // Was um 9:35 nicht mehr stimmt, steht nicht mehr da.
    const live = [NOTIZEN_VALUE_MAP.uebertrag, NOTIZEN_TAG_4['was-bauen-wir'], NOTIZEN_TAG_4['slice-im-baum']].flatMap((n) => n.live).join(' | ');
    expect(live).not.toMatch(/Slice 1 im Baum|zusammen mit|Annahme nur ankündigen|ab Tag 4/);
    expect(NOTIZEN_TAG_4['slice-im-baum'].live).toContain('A5 ist die Kaffeebar – bei euch die ID eurer Karte E1.');
    // tag-4#faden: E1 beschreibt den Test nur, getestet wird freiwillig nach dem Kurstag – also „plant“, nicht „getestet“.
    expect(folie('/innolab/methoden/value-map', 'uebertrag')).toContain('Ab heute plant ihr, wie ihr testet');
    expect(folie('/innolab/methoden/value-map', 'uebertrag')).not.toMatch(/Getestet wird ab/);
    // Die letzte Story-Map-Folie kündigt an, was → wirklich zeigt: erst Slice 1 im Baum, dann die Usage Story.
    expect(imBeamer(folie('/innolab/methoden/story-map', 'uebertrag'))).toContain('<p class="nur-beamer"><strong>Nach der Pause:</strong> erst Slice 1 im Baum, dann die Usage Story.</p>');
    expect(NOTIZEN_STORY_MAP.uebertrag.live).toContain('Nach der Pause: erst Slice 1 im Baum, dann Usage Story.');
    expect(folie('/innolab/methoden/story-map', 'uebertrag')).toContain('<a href="/innolab/tag-4#slice-im-baum">„Slice 1 im Baum“</a>');
    // Begleiter der Folien, die das Etikett verloren haben: live und Ablauf ohne „Kursregel“ (Herkunft nur in kern/quelle).
    const ohneEtikett = [NOTIZEN_CONCEPT_STORY.beispiel, NOTIZEN_CONCEPT_STORY.woher, NOTIZEN_EXPERIMENT.spitzenreiter]
      .flatMap((n) => [...n.live, ...(n.ablauf?.schritte ?? [])]);
    expect(ohneEtikett.filter((t) => /Kursregel/.test(t))).toStrictEqual([]);
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
    expect(schritte.length).toBeLessThanOrEqual(7);
    const liste = f.slice(f.indexOf('<div class="nur-handout">'));
    expect(liste).toContain('<Checklist id="il-tag4-hausaufgabe-5-v8" items={[');
    // Dozent 27.11.2026: E1 läuft nicht. Origin Story → Karte E1 fertig → freiwillig Usability-Tests → Aufräumen → Linear.
    // Seit 26.11.2026 nachts: Prototyp auf Papier; der letzte Schritt sagt, was bis Tag 5 da sein muss (Claude Code, Linear).
    expect(schritte.map((x) => x.match(/^<strong>([^<]+)<\/strong>/)?.[1])).toStrictEqual([
      'Origin Story', 'Karte E1 fertig machen,', 'Freiwillig: Usability-Tests', 'Fertig machen, was heute offen blieb', 'Bis Tag 5:',
    ]);
    // Code-Review #459: Linear braucht Claude Code (/ndu-linear) und kommt darum erst an Tag 5.
    expect(schritte[4]).toContain('Claude Code installieren, noch nicht anmelden');
    expect(schritte[4]).toContain('Linear richtet ihr an Tag 5 gemeinsam ein.');
    expect(liste).not.toContain('Linear eingerichtet');
    expect(schritte.join('\n')).not.toMatch(/Spike|weiterbauen|Branch/);
    expect(liste.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')).not.toMatch(/Spike|weiterbauen|im eigenen Branch/);
    expect(schritte.join('\n')).not.toMatch(/E1 laufen lassen|Lernkarte E1|Aufsteller oder die Landingpage/);
    expect(schritte[2]).toContain('fünf sind ideal, auch zwei, drei helfen');
    for (const aus of ['Value Map und Fit', 'Concept Story', 'Euer Baum', 'Geschäftsmodell auf Miro', 'Karte E1', 'Story Map mit Slice 1', 'Usage Story']) expect(liste, aus).toContain(aus);
    const pos = ['Origin Story auf Miro', 'Karte E1 fertig', 'Freiwillig: Usability-Tests', 'Value Map und Fit'].map((w) => liste.indexOf(w));
    expect(pos.every((x, k) => x > 0 && (k === 0 || x > pos[k - 1]))).toBe(true);
    expect(liste).not.toMatch(/E1 gelaufen|Lernkarte E1 mit/);
    for (const aus of ['mit dem E1 laufen würde', 'Usability-Tests</strong> mit dem Papier-Prototyp', 'als Collaborator']) {
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
    expect(f).toContain(`<p class="nur-beamer">Tag 5 beginnt am 12. Dezember mit dem <a href="/innolab/tag-5${erster.href}">${erster.titel}</a>: Was hätte E1 gezeigt – und was eure Tests?</p>`);
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

  // Seit Code-Review #459 liegt zwischen Debrief und Teamaufstellung der Block mit Claude Pro, Claude Code und Linear.
  it('← am Anfang von scrum#team führt zurück zur Linear-Folie von Tag 5, nicht auf #weiter-tag-4', () => {
    expect(zurueckVon('/innolab/methoden/scrum', 'team')).toBe('/innolab/tag-5#linear-einrichten');
    // Gegenprobe: Ohne zurueck wäre es die Tag-4-Folie darüber.
    const fs = folienMit('/innolab/methoden/scrum');
    const team = fs.findIndex((f) => f.id === 'team');
    expect(team).toBeGreaterThanOrEqual(1);
    expect(fs[team - 1].id).toBe('weiter-tag-4');
    // Nach dem Debrief folgen auf tag-5 die drei Folien von 9:25 (Claude Pro, Opus, Linear); die letzte führt nach scrum#team.
    expect(folienMit('/innolab/tag-5').find((f) => f.id === 'linear-einrichten')?.weiter).toBe('/innolab/methoden/scrum#team');
  });
});

describe('Hilfen des Tests', () => {
  it('imBeamer entfernt Handout mit verschachtelten divs und Kommentare, behält den Rest', () => {
    const f = '<h2 id="x">X</h2>{/* Kursregel */}<p>sichtbar</p><div class="nur-handout"><div class="b"><p>a</p></div><p>Kursregel</p></div><p class="nur-handout">Kursregel</p><p>danach</p>';
    expect(imBeamer(f)).toBe('<h2 id="x">X</h2><p>sichtbar</p><p>danach</p>');
    // Ein selbstschließendes <div … /> im Handout zählt nicht als offen – sonst liefe das Handout bis zum Ende weiter.
    const g = '<div class="nur-handout"><div class="trenner" /><p>Kursregel</p></div><p>danach</p>';
    expect(imBeamer(g)).toBe('<p>danach</p>');
  });
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
  it('„Jetzt: Origin Story“, der Tag-5-Satz und die Hausaufgaben-Schritte nur im Beamer; das Handout behält Hinweis und Checkliste', () => {
    const weiter = folie('/innolab/methoden/scrum', 'weiter-tag-4');
    expect(weiter).toMatch(/<p class="nur-beamer">Jetzt: Origin Story und Hausaufgabe/);
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
  // Seit 26.11. abends: keine docs-Vorlage mehr – die Origin Story steht auf Miro im eigenen Frame.
  it('tag-4#abschluss nennt den Miro-Frame der Origin Story statt einer docs-Vorlage', () => {
    expect(folie('/innolab/tag-4', 'abschluss')).toContain('in eurem Frame „T4 · 8 · Origin Story · Produkt n“: <MiroLink name="T4 · 8 · Origin Story · Produkt 1">Produkt 1</MiroLink>');
    expect(folie('/innolab/tag-4', 'abschluss')).not.toContain('vorlage-origin-story');
    // Auf der Experiment-Seite zeigt der Abschnitt mit dieser id, wie der Miro-Frame aussieht.
    expect(seite('/innolab/methoden/experiment')).toContain('<h3 id="vorlage-origin-story">So sieht die Origin Story auf Miro aus</h3>');
  });
});

// 26.11.: Wie hängt Slice 1 mit dem Baum von Tag 2/3 zusammen? In der Datei direkt nach „Was bauen wir?“; gezeigt seit 28.11. um 14:05.
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
    // Durchsicht 26.11. (damals 9:35): rechts keine Layout-Wörter der Story Map – die Zeilen nennen, was dort steht.
    expect(bild.match(/Lern-Sticky|links neben Slice 1/g) ?? []).toStrictEqual([]);
    expect(bild).not.toMatch(/\bdata-schritt\b/);
  });
});

// Wünsche des Dozenten (27.11.2026): Origin Story mit den sieben Stationen des Miro-Frames; Warm-up der Story Map mit dem Satz
// aus seinem Foliensatz und den drei Morgen; „im Kopf überschlägt“ statt „zusammenrechnet“ (Lichaw: „mental calculation“).
describe('Origin Story, Warm-up, Concept Story: Wortlaut nach Durchsicht', () => {
  it('tag-4#abschluss zeigt sieben Stationen in der Reihenfolge des Frames', () => {
    const f = folie('/innolab/tag-4', 'abschluss');
    const stationen = [...f.matchAll(/<li data-schritt><strong>([^<]+)<\/strong>/g)].map((m) => m[1]);
    expect(stationen).toStrictEqual(['Exposition', 'Auslöser', 'Steigende Handlung', 'Krise', 'Höhepunkt', 'Fallende Handlung', 'Ende']);
  });
  it('Story-Map-Warm-up: Satz zum Aufwachen und drei Morgen', () => {
    const q = folie('/innolab/methoden/story-map', 'morgen-aufschreiben');
    expect(q).toContain('<p class="folie-satz">„Schließt die Augen und denkt an den Moment zurück, als ihr heute aufgewacht seid. Was ist das Erste, woran ihr euch erinnert? Öffnet die Augen und schreibt es auf ein Sticky.“</p>');
    const v = folie('/innolab/methoden/story-map', 'varianten');
    expect(v).toContain('<p class="folie-satz">Drei Morgen: ein typischer Morgen – euer bester – euer schlechtester.</p>');
    expect(v).toContain('„the typical day story, the fabulous day story, and the story that has an emergency or two“');
  });
  it('Concept Story: „im Kopf überschlägt“, nirgends „zusammenrechnet“', () => {
    expect(folie('/innolab/methoden/concept-story', 'concept-story')).toContain('Was jemand in Sekunden im Kopf überschlägt, wenn er zum ersten Mal von eurem Produkt hört.');
  });
});
