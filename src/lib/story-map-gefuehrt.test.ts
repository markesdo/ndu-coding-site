import { describe, expect, it } from 'vitest';
import { ohneAbgeschaltet } from '../components/abgeschaltet';
import { METHODEN } from '../components/methoden';
import { MIRO_FRAMES } from '../components/miro-frames';
import { NOTIZEN } from '../data/begleiter';
import { NOTIZEN_STORY_MAP } from '../data/begleiter/story-map';
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
    for (const t of ['Grün: Aktivität', 'Gelb: Task', 'Blau: Details, Varianten', 'Rot: geht schief', 'Grau: System', 'Pink: Outcome', 'Cyan: „Wir lernen, ob“', 'Violett: wer handelt', '* kein Software-Schritt', 'Sprechblase: offene Frage → <a href="/innolab/mappe?bearbeiten=annahmen">Annahmen-Map</a>']) expect(s, t).toContain(t);
  });

  // Seit 26.11.2026 nachts: Tag 4 ohne Claude Code – Schritt 11 fragt Claude nicht mehr. Seit 27.11.2026 (Dozent) auch
  // ohne die freiwillige Hausaufgabe „Annahmen hinter Slice 1“ in claude.ai.
  it('alles auf Miro: keine docs-Datei; ohne „Annahmen hinter Slice 1“ in claude.ai', () => {
    expect(seite).not.toMatch(/docs\/|STORY-MAP\.md/);
    const f = sichtbar(folie('schritt-festhalten'));
    expect(f).not.toMatch(/Claude|\/model opus/);
    expect(seite).not.toMatch(/Annahmen hinter Slice 1|ANNAHMEN_SLICE|claude\.ai|<Prompt\b|MCP_WERKZEUGE/);
    expect(handout(folie('schritt-festhalten'))).toContain('keine Datei im Repo. Neue Annahmen tragt ihr selbst in die Annahmen-Map der Werkstatt ein.');
    expect(seite).toContain('<h2 id="vorlage">So sieht euer Bereich im Frame aus</h2>');
  });

  // Code-Review #457: jede Prüffrage prüft ihren eigenen Schritt; Verweise auf Schrittnummern stimmen; Prüfen ohne Repo.
  it('Review #457: eigene Prüffragen, richtige Schrittnummern; Prüfen selbst (seit 27.11.2026 ohne Claude)', () => {
    expect(seite).not.toContain('Prüft in Schritt');
    expect(sichtbar(folie('schritt-loecher'))).toContain('<strong>Prüft:</strong> Wo springt eure Geschichte zwischen zwei Stickies – und was ist, wenn …?');
    expect(handout(folie('sechs-schritte'))).toContain('Übungsschritt 10 und 11 – Durchgehen und Festhalten');
    const pruefen = seite.slice(seite.indexOf('<h2 id="pruefen">'), seite.indexOf('<Selbstpruefung'));
    expect(pruefen).toContain('in eurer Spalte im Frame „T4 · 1 · Story Map“. Prüft selbst mit der Liste unten und hakt ab, was erfüllt ist.');
    const n = NOTIZEN['/innolab/methoden/story-map'];
    expect(n['schritt-durchgehen'].ueberleitung).toBe('Zum Schluss: fertig auf Miro.');
    expect(n['schritt-tasks'].live).toContain('Fragen: Hat jeder Pain am Rand einen Task, der ihn löst?');
    expect(JSON.stringify(n)).not.toMatch(/ins Repo|docs\//);
  });

  // 27.11.2026: Die Studierenden erfahren, wozu die Pains am Rand stehen (Value Map wählt sie, am Ende braucht jeder einen
  // Task) – nicht nur der Begleiter. Auf der Folie, im Handout und in der Prüfliste.
  // 27.11.2026 (Markus, später): Schritt 2 vereinfacht – nur noch eine Quelle, der Canvas (T3 · 4). Kein Lesen der
  // Experience Map, keine Zitat-ID: Die P-IDs führen ins Kundenprofil und zu seinen Zitaten.
  it('Pains holen: Schritt 2 holt die Pains mit ✓ aus der Value Map; Schritt 3 prüft sichtbar, ob jeder einen Task hat', () => {
    const jetzt = folie('schritt-jetzt-map');
    const s = sichtbar(jetzt);
    expect(jetzt).toMatch(/^<h2 id="schritt-jetzt-map">2 · Pains holen<\/h2>/);
    expect(s).toContain('<p class="folie-satz">Welche Pains löst euer Spitzenreiter? Die stehen schon in eurer Value Map.</p>');
    expect(s).toContain('<li data-schritt><strong>Holt aus eurer Value Map die Pains, auf die ein Pain Reliever mit ✓ zeigt</strong> – mit ID (P1, P2 …) an den Rand eurer Story Map. <Timer minuten={2} /></li>');
    for (const n of [1, 2, 3]) {
      expect(s, `Canvas ${n}`).toContain(`<MiroLink name="T3 · 4 · Canvas · Produkt ${n}">Produkt ${n}</MiroLink>`);
      expect(MIRO_FRAMES[`T3 · 4 · Canvas · Produkt ${n}`], `Canvas ${n}`).toMatch(/^\d+$/);
    }
    expect(s).toContain('<p class="pruefen" data-schritt><strong>Prüft:</strong> Steht jeder Pain mit ID am Rand?</p>');
    // Nur eine Quelle: kein Weg mehr über die Experience Map, keine Zitat-ID.
    expect(s).not.toMatch(/Experience Map|So entsteht eure Map|Zitat-ID|Momente/);
    expect(handout(jetzt)).toContain('Jeder dieser Pains braucht später einen Task');
    expect(handout(jetzt)).toContain('Eure Experience Map von Tag 2 ist im Sinne Pattons die Jetzt-Map; das erklärt die Folie „Jetzt-Map und Später-Map“.');
    expect(handout(jetzt)).not.toMatch(/Öffnet|lest|holt nur/);
    expect(sichtbar(folie('vorgehen'))).toContain('1 Rahmen · 2 Pains holen · 3 Tasks');
    expect(seite).not.toContain('Jetzt-Map holen');
    expect(handout(folie('vorgehen'))).toContain('In Schritt 2 holt ihr aus eurer Value Map die Pains, auf die ein Pain Reliever mit ✓ zeigt');
    expect(seite).not.toContain('Ihre Momente und Pains sind der Stoff für Schritt 2');
    expect(sichtbar(folie('sechs-schritte'))).toContain('<strong>Das Ganze:</strong> Pains holen, Tasks bis zum Ende');
    expect(seite).not.toContain('am Ende braucht jeder');
    expect(sichtbar(folie('schritt-tasks'))).toMatch(/<p class="pruefen" data-schritt><strong>Prüft:<\/strong> [^<]*Hat jeder Pain am Rand einen Task, der ihn löst\? Wenn nicht: Ergänzt einen Task – oder streicht den Pain Reliever, der nicht hält\.<\/p>/);
    expect(handout(folie('schritt-tasks'))).toContain('Fangt deshalb beim Anlass im Alltag der Person an und hört auf, wenn der Outcome eingetreten ist:');
    expect(folie('schritt-tasks')).not.toMatch(/Kursregel/);
    const liste = METHODEN.find((m) => m.slug === 'story-map')!.pruefliste!;
    expect(liste.find((p) => p.id === 'story-map-pains')?.text).toBe('Jeder Pain am Rand hat einen Task, der ihn löst – oder der Pain Reliever, der nicht hält, ist in der Value Map gestrichen.');
    const n = NOTIZEN['/innolab/methoden/story-map'];
    expect(n['schritt-jetzt-map'].live).toStrictEqual([
      'Timer 2 min: Pains mit ✓-Pain-Reliever, mit ID an den Rand.',
      '„Jeder davon braucht später einen Task.“',
      'Fragen: Steht jeder Pain mit ID am Rand?',
    ]);
    expect(JSON.stringify(n['schritt-jetzt-map'])).not.toMatch(/Experience Map|Zitat-ID|Momente/);
    // Die alte Formulierung „vom Rand“ stand nur im Begleiter.
    expect(JSON.stringify(NOTIZEN_STORY_MAP)).not.toContain('vom Rand');
  });

  it('Begleiter: Warm-up-Notiz erinnert ans Teilen des eigenen Boards, ohne Link', () => {
    const n = NOTIZEN['/innolab/methoden/story-map'];
    expect(n.warmup.live).toContain('Eigenes Board „Euer Morgen“ teilen (Link aus deinen Lesezeichen).');
    expect(JSON.stringify(n)).not.toMatch(/miro\.com/);
  });
});
