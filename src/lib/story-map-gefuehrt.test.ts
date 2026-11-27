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
    expect(sichtbar(folie('schritt-reihen'))).toContain('<strong>Grau, unter den Task, bei dem die Person wartet:</strong> nur, worauf sie wartet oder was sie sieht');
    expect(sichtbar(folie('schritt-aktivitaeten'))).toContain('die letzte heißt „… danach“');
    expect(sichtbar(folie('schritt-durchgehen'))).toContain('„Outcome erreicht? ja / nein, es fehlt: …“');
    expect(seite).not.toMatch(/reihum/i);
    expect(sichtbar(folie('schritt-erkunden'))).toContain('<strong>Mindestens ein rotes Sticky pro Aktivität.</strong>');
    expect(sichtbar(folie('schritt-outcome'))).toContain('„Outcome: [Wer] tut [was] statt [was bisher].“');
    const schneiden = sichtbar(folie('schritt-schneiden'));
    expect(schneiden).toContain('was Slice 1 nicht braucht – nicht kopieren, jedes Sticky einmal. Aktivitäten bleiben oben.');
    expect(handout(folie('schritt-schneiden'))).toContain('Jedes Sticky gibt es dabei einmal.');
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
    expect(s).toContain('<p class="folie-satz">Welche Pains löst euer Spitzenreiter? Das zeigt euer Canvas.</p>');
    // Review #488: Die Pains stehen im Kundenprofil, nicht in der Value Map; die Canvas-Links stehen im ersten Schritt, mit der Uhr.
    const schritte = [...s.matchAll(/<li data-schritt>([\s\S]*?)<\/li>/g)].map((m) => m[1]);
    expect(schritte).toHaveLength(1);
    expect(schritte[0]).toMatch(/^<strong>Holt die Pains aus eurem Kundenprofil, auf die ein Pain Reliever mit ✓ zeigt<\/strong> – mit ID \(P1, P2 …\) an den Rand eurer Story Map\. Euer Canvas auf Miro: .*<Timer minuten=\{2\} \/>$/);
    expect(s).not.toContain('Value Map die Pains');
    for (const n of [1, 2, 3]) {
      expect(schritte[0], `Canvas ${n}`).toContain(`<MiroLink name="T3 · 4 · Canvas · Produkt ${n}">Produkt ${n}</MiroLink>`);
      expect(MIRO_FRAMES[`T3 · 4 · Canvas · Produkt ${n}`], `Canvas ${n}`).toMatch(/^\d+$/);
    }
    expect(s).toContain('<p class="pruefen" data-schritt><strong>Prüft:</strong> Steht jeder Pain mit ID am Rand?</p>');
    // Nur eine Quelle: kein Weg mehr über die Experience Map, keine Zitat-ID.
    expect(s).not.toMatch(/Experience Map|So entsteht eure Map|Zitat-ID|Momente/);
    // Kaffeebar: alle drei Pain Relievers tragen ✓ (value-map.astro) – also P1, P2 und P3, Wortlaut wie im Kundenprofil.
    expect(s).toContain('<p class="mini" data-schritt><strong>Kaffeebar:</strong> P1 Nicht wissen, ob sich ein Kaffee bis zur Abfahrt ausgeht · P2 Bei mehr als fünf Leuten in der Schlange reicht die Zeit nicht · P3 Nicht wissen, wann der Kaffee fertig ist.</p>');
    const profil = quellen['/innolab/methoden/kundenprofil'] ?? '';
    for (const p of ['P1 Nicht wissen, ob sich ein Kaffee bis zur Abfahrt ausgeht', 'P2 Bei mehr als fünf Leuten in der Schlange reicht die Zeit nicht', 'P3 Nicht wissen, wann der Kaffee fertig ist']) expect(profil, p).toContain(p);
    expect(handout(jetzt)).toContain('Jeder dieser Pains braucht später einen Task – das ist ein Übertrag des Kurses:');
    expect(handout(jetzt)).toContain('Eure Experience Map von Tag 2 ist die Jetzt-Map im Sinne Pattons ({PATTON}, Kap. 5, It’s a Now Map, Not a Later Map; Folie <a href="#jetzt-spaeter">„Jetzt-Map und Später-Map“</a>).');
    expect(seite).toContain('<h2 id="jetzt-spaeter">');
    expect(handout(jetzt)).not.toMatch(/Öffnet|lest|holt nur/);
    expect(sichtbar(folie('vorgehen'))).toContain('1 Rahmen · 2 Pains holen · 3 Tasks');
    expect(seite).not.toContain('Jetzt-Map holen');
    expect(handout(folie('vorgehen'))).toContain('In Schritt 2 holt ihr aus eurem Kundenprofil die Pains, auf die ein Pain Reliever mit ✓ zeigt');
    expect(seite).not.toContain('Ihre Momente und Pains sind der Stoff für Schritt 2');
    expect(sichtbar(folie('sechs-schritte'))).toContain('<strong>Das Ganze:</strong> Pains holen, Tasks bis zum Ende');
    expect(seite).not.toContain('am Ende braucht jeder');
    expect(sichtbar(folie('schritt-tasks'))).toMatch(/<p class="pruefen" data-schritt><strong>Prüft:<\/strong> [^<]*Hat jeder Pain am Rand einen Task, der ihn löst\? Wenn nicht: Ergänzt einen Task – oder streicht den Pain Reliever, der nicht hält\.<\/p>/);
    expect(handout(folie('schritt-tasks'))).toContain('Fangt deshalb beim Anlass im Alltag der Person an und hört auf, wenn der Outcome eingetreten ist:');
    // Review #488: keine „Kursregel“-Etiketten mehr – weder auf der Seite noch im Begleiter; stattdessen was und warum.
    expect(seite).not.toMatch(/Kursregel/);
    expect(JSON.stringify(NOTIZEN_STORY_MAP)).not.toMatch(/Kursregel/);
    expect(sichtbar(folie('sechs-schritte'))).toContain('<td><strong>Lernen:</strong> im selben Slice – „Wir lernen, ob …“; ihr baut nur einen Slice</td>');
    expect(sichtbar(folie('vorgehen'))).toContain('<li data-schritt><strong>Allein:</strong> Jede*r mappt das eigene Produkt – ihr habt drei verschiedene.</li>');
    const liste = METHODEN.find((m) => m.slug === 'story-map')!.pruefliste!;
    expect(liste.find((p) => p.id === 'story-map-pains')?.text).toBe('Jeder Pain am Rand hat einen Task, der ihn löst – oder der Pain Reliever, der nicht hält, ist in der Value Map gestrichen.');
    const n = NOTIZEN['/innolab/methoden/story-map'];
    expect(n['schritt-jetzt-map'].live).toStrictEqual([
      'Timer 2 min: Pains aus dem Kundenprofil, auf die ✓-Pain-Reliever zeigen.',
      'Mit ID an den Rand der Story Map.',
      '„Jeder davon braucht später einen Task.“',
      'Fragen: Steht jeder Pain mit ID am Rand?',
    ]);
    expect(JSON.stringify(n['schritt-jetzt-map'])).not.toMatch(/Experience Map|Zitat-ID|Momente/);
    // Die alte Formulierung „vom Rand“ stand nur im Begleiter.
    expect(JSON.stringify(NOTIZEN_STORY_MAP)).not.toContain('vom Rand');
  });

  // 27.11.2026 abends (Markus, Layout C): Jeder Bereich sieht aus wie der Warm-up-Frame – eine offene Fläche zum Sammeln,
  // Varianten und Fehler unter ihrem Task, die Slice-Linie mit Pink und Cyan wartet im Streifen unten bis Schritt 9.
  // Keine festen Reihen mehr für System, Körper, Durchgang oder Slice 2.
  it('Layout C: offene Fläche, alles unter seinem Task, Slice-Linie im Streifen unten bis Schritt 9', () => {
    const geaendert = ['vorgehen', 'schritt-tasks', 'schritt-aktivitaeten', 'schritt-reihen', 'schritt-erkunden', 'schritt-outcome', 'schritt-schneiden', 'schritt-durchgehen'];
    const vorlage = seite.slice(seite.indexOf('<h2 id="vorlage">'), seite.indexOf('<h2 id="pruefen">'));
    for (const text of [...geaendert.map(folie), vorlage]) {
      expect(text).not.toMatch(/Vier Reihen unter der Linie|Graue Reihe|Reihe „System“|Reihe „Durchgang“|Gelbe Reihe|Grüne Felder|grüne Felder|Linie „Slice 1“|Pro Spalte eine Variante|„oder“ bleibt unten|Kursregel/);
    }
    expect(sichtbar(folie('schritt-tasks'))).toContain('<strong>Gelbe Stickies in eure Fläche:</strong> Verb-Sätze, erst bis zum Ende. Alles, was die Person tut – geschnitten wird in Schritt 9.');
    expect(handout(folie('schritt-tasks'))).toContain('Die Fläche ist offen und breit, Platz ist nach unten, stapeln ist erlaubt');
    expect(sichtbar(folie('schritt-aktivitaeten'))).toContain('<strong>Tasks zu Gruppen schieben,</strong> ein grünes Sticky über jede Gruppe: ein Verb in der Sprache der Person.');
    expect(sichtbar(folie('schritt-erkunden'))).toContain('<strong>Unter den Task, zu dem es gehört:</strong> genauer · oder · richtig gut (blau) · geht schief (rot).');
    expect(handout(folie('schritt-erkunden'))).toContain('Varianten und was schiefgeht hängen deshalb als Spalte unter ihrem Task, nicht in eigenen Reihen');
    const outcome = sichtbar(folie('schritt-outcome'));
    expect(outcome).toContain('<strong>Pink aus dem Streifen, links unter die Fragekarte:</strong>');
    expect(outcome).toContain('<strong>Cyan daneben:</strong>');
    const schneiden = sichtbar(folie('schritt-schneiden'));
    expect(schneiden).toContain('<strong>Slice-Linie hochziehen,</strong> quer durch die Map; darunter schieben, was Slice 1 nicht braucht – nicht kopieren, jedes Sticky einmal. Aktivitäten bleiben oben.');
    expect(schneiden).toContain('<strong>Wo ein „oder“ hängt:</strong> Die Variante, die zum Lernen reicht, kommt über die Linie, die anderen darunter. Was fehlt oben noch?');
    expect(schneiden).toContain('darunter schieben, was Slice 1 nicht braucht – nicht kopieren, jedes Sticky einmal.');
    expect(schneiden).toContain('Slice 1 = bar an der Ausgabe* · darunter: vorher online zahlen');
    expect(schneiden).not.toContain('Slice 2');
    expect(handout(folie('schritt-schneiden'))).toContain('Bis hierher lag die Linie im Streifen unter eurer Fläche; erst jetzt zieht ihr sie hoch');
    const durchgehen = sichtbar(folie('schritt-durchgehen'));
    expect(durchgehen).toContain('ein ✓ auf jedes grüne Sticky mit Task über der Linie');
    expect(durchgehen).toContain('Rechts im Kasten: „Outcome erreicht? ja / nein, es fehlt: …“');
    expect(handout(folie('vorgehen'))).toContain('Die Slice-Linie, Pink und Cyan warten im Streifen unter der Fläche bis Schritt 8 (Outcome) und 9 (Schneiden).');
    // Handout „So sieht euer Bereich aus“: fünf Einträge statt acht Reihen.
    expect(vorlage.match(/<li>/g) ?? []).toHaveLength(5);
    expect(vorlage).toContain('<strong>Offene Fläche für Tasks und alles darunter:</strong>');
    expect(vorlage).toContain('<strong>Streifen „Schneiden“</strong> unter der Fläche: die gestrichelte Slice-Linie');
    expect(vorlage).not.toMatch(/Slice 2|Später|Genauer|Durchgang/);
    const n = NOTIZEN['/innolab/methoden/story-map'];
    expect(n['schritt-erkunden'].live[0]).toBe('Timer 6 min: vier Fragen unter den Task – gut blau, schief rot.');
    expect(n['schritt-schneiden'].live.slice(0, 2)).toStrictEqual([
      'Timer 5 min: Linie hochziehen, darunter schieben – nicht kopieren.',
      'Beim „oder“: was zum Lernen reicht, nach oben; die anderen darunter.',
    ]);
    expect(n['schritt-outcome'].live[0]).toBe('Timer 2 min: Pink aus dem Streifen, links unter die Fragekarte.');
    expect(vorlage).toContain('in Schritt 8 legt ihr Pink und Cyan links unter die Fragekarte.');
    expect(vorlage).toContain('Sie warten dort bis Schritt 8 (Outcome) und 9 (Schneiden)');
    expect(vorlage).toContain('Rechts neben der Fläche der Kasten „Outcome erreicht?');
    expect(vorlage).not.toContain('wie bisher');
    for (const id of ['vorgehen', 'schritt-erkunden', 'schritt-outcome', 'schritt-schneiden']) expect(JSON.stringify(n[id]), id).not.toMatch(/vier Zeilen|nach unten schieben|Pro Spalte|links an den Tasks|Kursregel/);
    // Live-Zeilen bleiben kurz: höchstens zwölf Wörter.
    for (const id of ['vorgehen', 'schritt-erkunden', 'schritt-outcome', 'schritt-schneiden']) {
      for (const z of n[id].live) expect(z.split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w)).length, z).toBeLessThanOrEqual(12);
    }
  });

  // 27.11.2026 nachts (Markus, Miro): „Wer handelt“ ist eine Reihe kleiner violetter Stickies über dem Backbone, jedes über
  // der Aktivität, bei der die Person handelt (Patton, Kap. 2, Narrative Flow Across Many Users). Keine eigene Reihe „Wer
  // noch“ links; Tasks anderer Personen in die Fläche, unter die Tasks der Hauptperson; Grau unter den Task, bei dem sie wartet.
  it('Wer handelt: violette Stickies über der Aktivität, keine eigene Reihe für „Wer noch“', () => {
    expect(sichtbar(folie('schritt-rahmen'))).toContain('<strong>Violett „Wer handelt: …“:</strong> eure Hauptperson, klein in die Reihe „Wer handelt“ über dem Backbone.');
    const reihen = folie('schritt-reihen');
    const s = sichtbar(reihen);
    expect(reihen).toMatch(/^<h2 id="schritt-reihen">5 · Wer noch handelt: über die Aktivität<\/h2>/);
    expect(s).toContain('<strong>Kleines violettes Sticky „Wer noch: …“</strong> in die Reihe „Wer handelt“, über die Aktivität, bei der diese Person dazukommt. Ihre Tasks gelb unter die Tasks eurer Person – mit ihrem Namen vorn: „Barista: zubereiten“.');
    expect(handout(reihen)).toContain('„I like to place stickies or simple persona thumbnails above the backbone so I can see who we’re talking about at particular times in the story“');
    for (const text of [reihen, folie('schritt-rahmen'), folie('schritt-loecher'), ohneAbgeschaltet(quellen['/innolab/tag-4'] ?? '')]) {
      expect(text).not.toMatch(/eigene Reihe|\(eigene Reihe\)|Reihe der Barista|Reihe der Pendler|Wessen Reihe|links vor dem Backbone|Wer muss noch handeln, damit der Wert ankommt\?“/);
    }
    const vorlage = seite.slice(seite.indexOf('<h2 id="vorlage">'), seite.indexOf('<h2 id="pruefen">'));
    expect(vorlage).toContain('<strong>Reihe „Wer handelt“</strong> über dem Backbone: kleine violette Stickies');
    expect(vorlage).not.toContain('<li><strong>Violett „Wer noch: …“</strong>');
    expect(vorlage.indexOf('Reihe „Wer handelt“')).toBeLessThan(vorlage.indexOf('Backbone-Reihe'));
    const n = NOTIZEN['/innolab/methoden/story-map'];
    expect(n['schritt-reihen'].live).toStrictEqual([
      'Timer 2 min: violett „Wer noch“ über die Aktivität, wo sie dazukommt.',
      'Ihre Tasks gelb darunter, Name vorn: „Barista: zubereiten“.',
      'System grau, unter den Task, bei dem die Person wartet.',
      'Falle: gelbes Sticky ohne Namen unter den Tasks eurer Person.',
      'Vorlesen: erst die Spalte der Pendler*in fertig, dann die Barista.',
    ]);
    expect(n['schritt-rahmen'].live).toContain('Violett „Wer handelt“: Hauptperson, klein in die Reihe über dem Backbone.');
    for (const id of ['schritt-rahmen', 'schritt-reihen']) {
      for (const z of n[id].live) expect(z.split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w)).length, z).toBeLessThanOrEqual(12);
    }
  });

  // 28.11.2026 (Markus, Miro): Tasks anderer Personen tragen den Namen vorn – „Barista: zubereiten“, wie „System: zeigt …“.
  // Violett heißt „Wer handelt: Pendler*in“ / „Wer noch: Barista“. Alle Aktivitäten sind die der Pendler*in; die Barista hat
  // eigene Tasks, keine eigenen Aktivitäten (consult-story-map-akteure.md).
  it('Wer noch: Name vorn auf jedem Task der anderen Person, die Barista hat keine eigenen Aktivitäten', () => {
    const s = sichtbar(folie('schritt-reihen'));
    expect(s).toContain('<span class="nicht">Nicht so:</span> „Bestellung wird bearbeitet“ · „zubereiten“ (gelb, ohne Namen) <span class="so">So:</span> violett „Wer noch: Barista“ über „Bestellen“ · gelb „Barista: zubereiten“ · grau „System: zeigt ‚Fertig 7:31‘“');
    expect(s).toContain('aktiv: „System: zeigt …“.');
    expect(s).toContain('<strong>Prüft:</strong> Wer muss noch etwas tun, damit der Wert ankommt – und steht sein Name auf jedem seiner Tasks?');
    expect(handout(folie('schritt-reihen'))).toContain('deshalb steht der Name vorn auf dem Sticky, wie bei „System: …“.');

    const beispiel = folie('beispiel');
    expect(beispiel).not.toContain('eigene Aktivitäten');
    expect(beispiel).toContain('Alle Aktivitäten sind die der Pendler*in. Die Barista hat eigene Tasks auf derselben Zeitachse');
    expect(sichtbar(beispiel)).toContain('<td>Barista: Bestellung sehen · Barista: zubereiten</td><td>Barista: bereitstellen</td><td>Barista: kassieren</td>');
    for (const t of ['Bestellung sehen', 'zubereiten', 'bereitstellen', 'kassieren']) expect(handout(beispiel)).toContain(`„Barista: ${t}“`);
    expect(handout(beispiel)).toContain('„System: zeigt ‚Fertig 7:31‘“');
    // Nur das absichtliche Gegenbeispiel auf der Folie darf „zubereiten“ ohne Namen zeigen.
    const nichtSo = '„Bestellung wird bearbeitet“ · „zubereiten“ (gelb, ohne Namen)';
    expect(seite).toContain(nichtSo);
    expect(seite.replace(nichtSo, '')).not.toMatch(/(?<!Barista: )\b(Bestellung sehen|zubereiten|bereitstellen|kassieren)\b/);
    expect(handout(beispiel)).toContain('„Wer handelt: Pendler*in“ über „In die Halle kommen“, „Wer noch: Barista“ über „Bestellen“');
    expect(handout(folie('schritt-reihen'))).toContain('Personen-Sticky über dem Backbone, dort, wo die Person in der Geschichte dran ist');

    const tag4 = ohneAbgeschaltet(quellen['/innolab/tag-4'] ?? '');
    expect(tag4).toContain('Die Tasks der Barista stehen dort unter denen der Pendler*in, mit ihrem Namen vorn („Barista: …“)');

    expect(folie('schritt-loecher')).toContain('Wer sieht die Bestellung? → „Barista: Bestellung sehen“.');
    const vorlage = seite.slice(seite.indexOf('<h2 id="vorlage">'), seite.indexOf('<h2 id="pruefen">'));
    expect(vorlage).toContain('Tasks anderer Personen stehen unter den Tasks eurer Person – mit deren Namen vorn („Barista: …“)');

    const n = NOTIZEN_STORY_MAP['schritt-reihen'];
    const kern = n.kern ?? [];
    expect(kern.map((k) => k.quelle)).toStrictEqual([
      'Jeff Patton, User Story Mapping (2014), Kap. 2, Map in a Narrative Flow Across Many Users and Systems',
      'Jeff Patton, User Story Mapping (2014), Kap. 5, 4. Distill Your Map to Make a Backbone',
      'Teresa Torres, Continuous Discovery Habits, S. 120–121',
      'Kurs; Jeff Patton, User Story Mapping (2014), Kap. 2 und 5; Torres, S. 120–121',
    ]);
    expect(kern[2].text).toContain('Swimlanes');
    expect(kern.at(-1)?.text).toMatch(/^Vorsicht beim Erzählen: Der Name vorn auf dem Sticky \(„Barista: zubereiten“\) ist eine Schreibweise des Kurses, aus keiner der beiden Quellen\./);
    expect(kern.at(-1)?.text).toContain('Der Kurs mischt beides: oben Pattons Kopf, darunter wie bei Torres der Name an jedem Schritt, nur ohne eigene Zeile.');
    expect(kern.at(-1)?.text).toContain('dass es genau über einer Aktivität steht, ist unsere Lesart');
    expect(n.fragen?.map((f) => f.frage)).toStrictEqual([
      'Warum nicht eine Zeile je Person wie bei Torres heute früh?',
      'Bekommt die zweite Person ein eigenes grünes Sticky?',
    ]);
    expect(JSON.stringify(n)).not.toContain('Kursregel');
  });

  it('Begleiter: Warm-up-Notiz erinnert ans Teilen des eigenen Boards, ohne Link', () => {
    const n = NOTIZEN['/innolab/methoden/story-map'];
    expect(n.warmup.live).toContain('Eigenes Board „Euer Morgen“ teilen (Link aus deinen Lesezeichen).');
    expect(JSON.stringify(n)).not.toMatch(/miro\.com/);
  });
});
