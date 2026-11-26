import { describe, expect, it } from 'vitest';
import { ohneAbgeschaltet } from '../components/abgeschaltet';
import { MIRO_FRAMES } from '../components/miro-frames';
import { NOTIZEN } from '../data/begleiter';
import { quellenAusGlob } from './begleiter';

// Story Map, Tag 4 (Entscheidung Markus 26.11.2026): Die Studierenden werden Schritt für Schritt geführt wie in seinem
// Foliensatz 25/26 (Folien 105–112 Morgen, 124–140 Produkt). Warm-up: sechs Schritte, die jede*r selbst im eigenen Frame
// „T4 · 1 · Warm-up · euer Morgen · Produkt n“ macht, mit Zielebenen nach Patton (Kap. 5); Übung: elf Schritt-Folien mit
// Uhr, Kaffeebar-Beispiel und Prüffrage. Alles liegt auf Miro – keine docs-Datei (Nachtrag 26.11. abends).
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const seite = ohneAbgeschaltet(quellen['/innolab/methoden/story-map'] ?? '');
const folienIds = [...seite.matchAll(/<Folie\b[^>]*>(?:(?!<\/Folie>)[\s\S])*?<h2 id="([^"]+)"/g)].map((m) => m[1]);
const folie = (id: string) => {
  const a = seite.indexOf(`<h2 id="${id}">`);
  return a < 0 ? '' : seite.slice(a, seite.indexOf('</Folie>', a));
};
const sichtbar = (f: string) => { const h = f.indexOf('class="nur-handout"'); return h < 0 ? f : f.slice(0, h); };
const handout = (f: string) => { const h = f.indexOf('class="nur-handout"'); return h < 0 ? '' : f.slice(h); };
const timer = (f: string) => [...f.matchAll(/<Timer minuten=\{(\d+)\} \/>/g)].map((m) => Number(m[1]));

const MORGEN = ['morgen-aufschreiben', 'erzaehlfluss', 'varianten', 'backbone', 'verschlafen', 'verschlafen-slice', 'zielebenen'];
const SCHRITTE = [
  'schritt-rahmen', 'schritt-jetzt-map', 'schritt-tasks', 'schritt-aktivitaeten', 'schritt-reihen', 'schritt-erkunden',
  'schritt-loecher', 'schritt-outcome', 'schritt-schneiden', 'schritt-durchgehen', 'schritt-festhalten',
];
const WARMUP_FRAMES = [1, 2, 3].map((n) => `T4 · 1 · Warm-up · euer Morgen · Produkt ${n}`);

describe('Story Map: geführt Schritt für Schritt', () => {
  it('Folien in dieser Reihenfolge: Warm-up, Begriffe, Theorie, Kaffeebar, Übersicht, elf Schritte, Übertrag', () => {
    expect(folienIds).toStrictEqual([
      'warmup', ...MORGEN, 'begriffe',
      'warum', 'outcome', 'jetzt-spaeter', 'anatomie', 'erkunden', 'schneiden', 'lernen', 'beispiel', 'sechs-schritte',
      'vorgehen', ...SCHRITTE, 'uebertrag',
    ]);
  });

  it('Warm-up: jeder Schritt hat eine Uhr und verlinkt die drei Frames, die auf dem Team-Board stehen', () => {
    for (const f of WARMUP_FRAMES) expect(MIRO_FRAMES[f], f).toMatch(/^\d+$/);
    for (const id of MORGEN) {
      const f = sichtbar(folie(id));
      expect(timer(f), id).toHaveLength(1);
      for (const name of WARMUP_FRAMES) expect(f, `${id}: ${name}`).toContain(`<MiroLink name="${name}">`);
    }
    // 4 + 3 + 4 + 3 + 3 + 2 + 2 = 21 min selbst tun; mit Erklären 28 (Handout von „vorgehen“).
    expect(MORGEN.flatMap((id) => timer(folie(id))).reduce((a, b) => a + b, 0)).toBe(21);
    // Kein Link auf Markus’ eigenes Board: Das Repo ist öffentlich.
    expect(seite).not.toMatch(/miro\.com/);
    expect(seite).toContain("const BEISPIEL_MORGEN = 'Beispiel: Markus zeigt seinen Morgen auf Miro.';");
  });

  it('Zielebenen: drei Ebenen in den Farben des Frames, Meereshöhe wörtlich nach Patton (Kap. 5), Cockburn genannt', () => {
    const f = folie('zielebenen');
    const s = sichtbar(f);
    expect(s).toContain('<span class="farbe gruen">Zusammenfassung</span>');
    expect(s).toContain('<span class="farbe gelb">Meereshöhe</span>');
    expect(s).toContain('<span class="farbe blau">Teilschritte</span>');
    expect(s).toContain('„Fertig machen“');
    expect(s).toContain('„Duschen“');
    expect(s).toContain('„Haare waschen“');
    expect(s).toContain('src="/quellen/patton/zielebenen.jpg"');
    expect(handout(f)).toContain('„Alistair uses an altitude metaphor where sea level is in the middle, and everything else is either above or below sea level. A sea-level task is one we’d expect to complete before intentionally stopping to do something else.“');
    expect(handout(f)).toContain('({PATTON}, Kap. 5, I’m Just More Detail-Oriented)');
    // Patton spricht von Summary, Sea Level und Fisch – Drachen und Muschel stehen nicht in Kap. 5.
    expect(f).not.toMatch(/kite|clam|Drachen|Muschel/i);
  });

  it('Begriffe: der Rückblick nach dem Warm-up nennt alle Begriffe und übergibt ans Produkt', () => {
    const s = sichtbar(folie('begriffe'));
    expect(s.match(/<li data-schritt>/g) ?? []).toHaveLength(5);
    for (const w of ['Task', 'Erzählfluss', 'Körper', 'Aktivität', 'Backbone', 'Slice', 'Outcome', 'Weiter:']) expect(s, w).toContain(w);
  });

  it('Übung: jede Schritt-Folie hat den Story-Map-Frame, genau eine Uhr, ein Kaffeebar-Beispiel (außer Festhalten) und eine Prüffrage; zusammen 42 min', () => {
    const summe = SCHRITTE.map((id) => {
      const s = sichtbar(folie(id));
      expect(s, id).toContain('<MiroFrame name="T4 · 1 · Story Map" />');
      expect(timer(s), id).toHaveLength(1);
      // Festhalten braucht kein Beispiel: dort ist nur noch Claude dran.
      if (id !== 'schritt-festhalten') expect(s, id).toMatch(/<p class="(mini|paar)" data-schritt>/);
      expect(s.match(/<p class="pruefen" data-schritt><strong>Prüft/g) ?? [], id).toHaveLength(1);
      return timer(s)[0];
    });
    expect(summe).toStrictEqual([3, 2, 6, 2, 2, 6, 5, 2, 5, 5, 4]);
    expect(folie('vorgehen')).toContain('So geht ihr vor (42 min)</h2>');
  });

  it('Übung: die Regeln aus der Auswertung der Maps 25/26 stehen an ihrem Schritt', () => {
    expect(sichtbar(folie('schritt-tasks'))).toContain('<strong>Anfang und Ende:</strong> beim Anlass im Alltag der Person');
    expect(sichtbar(folie('schritt-aktivitaeten'))).toContain('Anbahnung · Information · Registrierung · Onboarding · Kernnutzen');
    expect(sichtbar(folie('schritt-reihen'))).toContain('<strong>Graue Reihe „System“:</strong> nur, worauf die Person wartet oder was sie sieht');
    expect(sichtbar(folie('schritt-aktivitaeten'))).toContain('das letzte Feld heißt „… danach“');
    expect(sichtbar(folie('schritt-durchgehen'))).toContain('„Outcome erreicht? ja / nein, es fehlt: …“');
    expect(seite).not.toMatch(/reihum/i);
    expect(sichtbar(folie('schritt-erkunden'))).toContain('<strong>Mindestens ein rotes Sticky pro Aktivität.</strong>');
    expect(sichtbar(folie('schritt-outcome'))).toContain('„Outcome: [Wer] tut [was] statt [was bisher].“');
    const schneiden = sichtbar(folie('schritt-schneiden'));
    expect(schneiden).toContain('nicht kopieren – jedes Sticky gibt es einmal');
    expect(schneiden).toContain('<strong>Euer „bar an der Ausgabe“:</strong>');
    expect(sichtbar(folie('schritt-durchgehen'))).toContain('<strong>Prüft:</strong> An welchem Sticky passiert der Outcome?');
    // Fehlerquellen des alten Foliensatzes: keine „As a …, I want“-Stickies in der Map, keine Features als Ziel-Outcomes.
    expect(seite).not.toMatch(/möchte ich|As a |I want/);
  });

  it('Farblegende auf der Übersicht: dieselben Farben wie auf den Frames', () => {
    const s = sichtbar(folie('vorgehen'));
    for (const t of ['Grün: Aktivität', 'Gelb: Task', 'Blau: Details, Varianten', 'Rot: geht schief', 'Grau: System', 'Pink: Outcome', 'Cyan: „Wir lernen, ob“', 'Violett: wer handelt', '* kein Software-Schritt', 'Sprechblase: offene Frage → Annahmen-Map']) expect(s, t).toContain(t);
  });

  it('alles auf Miro: keine docs-Datei; Claude Code mit Opus liest einen Screenshot und die Annahmen-Map der Werkstatt', () => {
    expect(seite).not.toMatch(/docs\/|STORY-MAP\.md/);
    const f = sichtbar(folie('schritt-festhalten'));
    expect(f).toContain('<code>/model opus</code>');
    expect(f).toContain('Screenshot eures Bereichs');
    expect(seite).toContain('const ANNAHMEN_SLICE = `Im Bild: meine Story Map von Miro (Frame „T4 · 1 · Story Map“, mein Bereich)');
    expect(seite).toContain('Lies aus der Werkstatt meine Annahmen-Map (Werkzeug ${MCP_WERKZEUGE.artefaktLesen})');
    expect(seite).toContain('<h2 id="vorlage">So sieht euer Bereich im Frame aus</h2>');
  });

  // Code-Review #457: jede Prüffrage prüft ihren eigenen Schritt; Verweise auf Schrittnummern stimmen; Prüfen ohne Repo.
  it('Review #457: eigene Prüffragen, richtige Schrittnummern, Prüfen mit Screenshot', () => {
    expect(seite).not.toContain('Prüft in Schritt');
    expect(sichtbar(folie('schritt-loecher'))).toContain('<strong>Prüft:</strong> Wo springt eure Geschichte zwischen zwei Stickies – und was ist, wenn …?');
    expect(handout(folie('sechs-schritte'))).toContain('Übungsschritt 10 und 11 – Durchgehen und Festhalten');
    const pruefen = seite.slice(seite.indexOf('<h2 id="pruefen">'), seite.indexOf('<ClaudePruefung'));
    expect(pruefen).toContain('in eurer Spalte im Frame „T4 · 1 · Story Map“. Claude prüft es an einem Bildschirmfoto, in claude.ai mit dem Werkstatt-Connector und mit Opus – Schritt für Schritt unter „So geht’s“.');
    const n = NOTIZEN['/innolab/methoden/story-map'];
    expect(n['schritt-durchgehen'].ueberleitung).toBe('Zum Schluss: fertig auf Miro – und Claude nach Annahmen fragen.');
    expect(n['schritt-tasks'].live).toContain('Fragen: Hat jeder Pain vom Rand einen Task, der ihn löst?');
    expect(JSON.stringify(n)).not.toMatch(/ins Repo|docs\//);
  });

  it('Begleiter: Warm-up-Notiz erinnert ans Teilen des eigenen Boards, ohne Link', () => {
    const n = NOTIZEN['/innolab/methoden/story-map'];
    expect(n.warmup.live).toContain('Eigenes Board „Euer Morgen“ teilen (Link aus deinen Lesezeichen).');
    expect(JSON.stringify(n)).not.toMatch(/miro\.com/);
  });
});
