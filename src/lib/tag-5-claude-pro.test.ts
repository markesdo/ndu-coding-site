import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { bloeckeAus, folienAus, hhmm, quellenAusGlob } from './begleiter';
import { METHODEN } from '../components/methoden';
import { NOTIZEN } from '../data/begleiter';

// Entscheidung Markus 26.11.2026 nachts: Tag 4 ganz ohne Claude – der Prototyp entsteht auf Papier. Claude Pro und Claude
// Code richten alle an Tag 5 gemeinsam ein, als eigener Block vor der ersten Nutzung (Backlog: Issues nach Linear), und am
// Nachmittag baut Claude Code Slice 1 nach den Papier-Skizzen. Vorher (26.11.–27.11.) stand der Block an Tag 4 um 11:00
// auf der Experiment-Seite (tag-4-claude-pro.test.ts).
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const seite = (p: string) => quellen[p] ?? '';
const folie = (p: string, id: string) => {
  const q = seite(p);
  const a = q.indexOf(`<h2 id="${id}">`);
  return a < 0 ? '' : q.slice(a, q.indexOf('</Folie>', a));
};
// Das öffnende <Folie …> vor einer Überschrift.
const folienTag = (p: string, id: string) => {
  const q = seite(p);
  const a = q.indexOf(`<h2 id="${id}">`);
  const auf = q.lastIndexOf('<Folie', a);
  return q.slice(auf, q.indexOf('>', auf) + 1);
};
const setup = () => readFileSync(new URL('../pages/setup.astro', import.meta.url), 'utf8');
const T4 = '/innolab/tag-4';
const T5 = '/innolab/tag-5';
const EX = '/innolab/methoden/experiment';
const ohneKommentare = (q: string) => q.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
// Was im Beamer zu sehen ist: alle Folien einer Seite ohne Handout und Kommentare.
const beamer = (p: string) =>
  (ohneKommentare(seite(p)).match(/<Folie\b[\s\S]*?<\/Folie>/g) ?? []).map((f) => f.replace(/<div class="nur-handout">[\s\S]*?<\/div>\s*(?=<\/Folie>|$)/, '').replace(/<p class="nur-handout">[\s\S]*?<\/p>/g, '')).join('\n');

describe('Tag 4 ohne Claude (Markus 26.11.2026 nachts)', () => {
  it('der Ablauf von Tag 4 nennt weder Claude Pro noch Claude Code; die Experiment-Karte beginnt direkt nach dem Geschäftsmodell', () => {
    const t4 = seite(T4);
    const ablauf = t4.slice(t4.indexOf('<h2 id="ablauf">'), t4.indexOf('</div>', t4.indexOf('<div class="schedule"')));
    expect(ablauf.length).toBeGreaterThan(1000);
    expect(ablauf.match(/Claude/g) ?? []).toStrictEqual([]);
    const b = bloeckeAus(t4);
    const gm = b.findIndex((x) => x.titel === 'Geschäftsmodell');
    expect(b[gm + 1]).toMatchObject({ titel: 'Experiment-Karte', von: b[gm].bis });
    expect(t4).not.toContain('experiment#claude-pro-jetzt');
  });

  it('die Experiment-Seite hat keine Claude-Pro-Folien mehr; ihre erste Folie ist die Theorie', () => {
    const q = seite(EX);
    expect(q).not.toMatch(/id="claude-pro-jetzt"|id="claude-code-opus"/);
    expect(folienAus(EX, q)[0].id).toBe('annahmen-der-idee');
  });

  it('keine Folie von Tag 4 schickt Studierende in Claude Code oder zu /model opus', () => {
    const pfade = [T4, ...['value-map', 'concept-story', 'geschaeftsmodell', 'experiment', 'story-map', 'usage-story', 'prototyp-spike'].map((x) => `/innolab/methoden/${x}`)];
    const funde = pfade.flatMap((p) => {
      const b = beamer(p);
      expect(b.length, p).toBeGreaterThan(500);
      return (b.match(/\/model opus|Claude Code (öffnen|starten|baut –|, mit Opus)|<code>claude<\/code>/g) ?? []).map((m) => `${p}: ${m}`);
    });
    expect(funde).toStrictEqual([]);
    // Code-Review #459: auch im Handout der Tag-4-Seiten kein /model opus und kein „in Claude Code“ als Ort der Arbeit –
    // nur die Vorschau auf Tag 5 (Feld „Für Claude Code (an Tag 5 …)“ und der Hinweis „An Tag 5 baut Claude Code daraus“).
    const handout = pfade.flatMap((p) => {
      const q = ohneKommentare(seite(p)).replace('Für Claude Code (an Tag 5, mit Opus – /model opus)', '');
      return (q.match(/\/model opus|in Claude Code <code>/g) ?? []).map((m) => `${p}: ${m}`);
    });
    expect(handout).toStrictEqual([]);
    // Die Story Map fragt Claude nicht mehr, auch nicht zu Hause (seit 27.11.2026 ohne „Annahmen hinter Slice 1“).
    expect(folie('/innolab/methoden/story-map', 'schritt-festhalten')).toContain('<h2 id="schritt-festhalten">11 · Fertig auf Miro</h2>');
    expect(seite('/innolab/methoden/story-map')).not.toContain('Annahmen hinter Slice 1');
  });

  // Entscheidung Dozent 27.11.2026: Die freiwillige Claude-Hausaufgabe auf den Tag-4-Seiten fällt weg. „Prüfen“ bleibt als
  // Selbstprüfung mit der Prüfliste (Selbstpruefung.astro, dieselbe Checklisten-ID wie ClaudePruefung); die Methoden von
  // Tag 2 und 3 prüfen weiter mit Claude – außer der Value Map (Tag 3, an Tag 4 nachgeholt; Entscheidung Dozent 27.11.2026):
  // Sie prüft ebenfalls nur selbst.
  it('Tag-4-Seiten und Value Map: Prüfen nur selbst – kein claude.ai, kein ClaudePruefung, kein Claude-Prompt; Tag 2 und 3 behalten ihre', () => {
    const tag4 = ['concept-story', 'geschaeftsmodell', 'experiment', 'story-map', 'usage-story', 'prototyp-spike'];
    for (const slug of [...tag4, 'value-map']) {
      const q = seite(`/innolab/methoden/${slug}`);
      expect(q, slug).not.toMatch(/claude\.ai|ClaudePruefung|<Prompt\b[^>]*label="[^"]*(Prüfen lassen|zu Hause)|Zu Hause, in|Wer mag, lässt zu Hause/);
      const a = q.indexOf('<h2 id="pruefen">Prüfen</h2>');
      expect(a, slug).toBeGreaterThan(0);
      const pruefen = q.slice(a, q.indexOf(`<Selbstpruefung slug="${slug}" />`, a));
      expect(pruefen, slug).toContain('Prüft selbst mit der Liste unten und hakt ab, was erfüllt ist.');
      expect(pruefen.length, slug).toBeLessThan(400);
    }
    // Die Methoden-Karte (und methode_erklaeren im Werkstatt-Connector) nennt die gestrichenen Prompts nicht mehr. Was Claude
    // mit Connector an einem Bild prüfen kann, bleibt dort beschrieben (Code-Review #470: kein „keine Rolle“ gegen die
    // Server-Anweisung, die Tag-4-Bilder weiter prüfen lässt).
    expect(METHODEN.filter((x) => tag4.includes(x.slug)).map((m) => m.ki).filter((ki) => /Gegenprobe|Annahmen hinter/.test(ki))).toStrictEqual([]);
    // Selbstprüfung hakt an derselben Liste wie ClaudePruefung ab (gleiche Checklisten-ID), ohne Prompt.
    const selbst = readFileSync(new URL('../components/Selbstpruefung.astro', import.meta.url), 'utf8');
    expect(selbst).toContain('<Checklist id={pruefChecklisteId(m)} items={m.pruefliste.map((p) => p.text)} ids={m.pruefliste.map((p) => p.id)} />');
    expect(selbst).not.toMatch(/Prompt|claude\.ai/);
    // Value Map: auch der Ablauf (vorgehen-fit) und die Begleiter-Notiz schicken nicht mehr zur Claude-Prüfung, sondern zur Liste.
    const vm = seite('/innolab/methoden/value-map');
    expect(vm).not.toMatch(/Prüfung mit Claude|nach dem Kurstag/);
    expect(vm).toContain('Geprüft wird selbst, mit der Liste unter „Prüfen“.</p>');
    const vmNotiz = JSON.stringify(NOTIZEN['/innolab/methoden/value-map'] ?? {});
    expect(vmNotiz.length).toBeGreaterThan(1000);
    expect(vmNotiz).not.toMatch(/Claude/);
    expect(vmNotiz).toContain('Prüfen selbst mit der Prüfliste.');
    // Tag 2 und 3 (ohne die Value Map) prüfen weiter mit Claude.
    const frueher = METHODEN.filter((m) => (m.tag === 2 || m.tag === 3) && m.slug !== 'value-map' && m.pruefliste && !m.stillgelegt && seite(`/innolab/methoden/${m.slug}`).includes('<h2 id="pruefen">'));
    expect(frueher.map((m) => m.slug)).toEqual(expect.arrayContaining(['synthese', 'journey-map', 'ziel-chance', 'kundenprofil', 'hmw', 'ideation']));
    for (const m of frueher) {
      const q = seite(`/innolab/methoden/${m.slug}`);
      expect(q, m.slug).toContain(`<ClaudePruefung slug="${m.slug}"`);
      expect(q, m.slug).not.toContain('<Selbstpruefung');
    }
    expect(readFileSync(new URL('../components/ClaudePruefung.astro', import.meta.url), 'utf8')).toContain('In claude.ai ein neues Gespräch öffnen');
  });

  it('Tag 4: Hinweis „Claude Code ab Tag 5“ vor dem Ablauf – installieren bis Tag 5, Pro gemeinsam an Tag 5', () => {
    const t4 = seite(T4);
    const hinweis = t4.indexOf('<Callout type="info" title="Heute ohne Claude – Claude Code ab Tag 5">');
    expect(hinweis).toBeGreaterThan(0);
    expect(hinweis).toBeLessThan(t4.indexOf('<h2 id="ablauf">'));
    const text = t4.slice(hinweis, t4.indexOf('</Callout>', hinweis));
    expect(text).toContain('Installiert es bis Tag 5 auf eurem Mac (<a href="/setup#lokal-schnellweg">mit dem Setup-Skript</a>)');
    expect(text).toContain('href="/innolab/tag-5#claude-pro-jetzt"');
    expect(t4).not.toMatch(/Vor Tag 4: Claude Code installieren|um 11:00 gemeinsam/);
  });
});

describe('Tag 5: Claude Pro und Claude Code gemeinsam (Markus 26.11.2026 nachts)', () => {
  // Code-Review #459: Linear braucht Claude Code (/ndu-linear), und die Teamaufstellung nennt schon Linear-Projekte – darum
  // steht der Block gleich nach dem Debrief, 15 min mit Linear. Die Minuten kommen aus dem ersten Bau-Block.
  it('eigener Block 9:25–9:40 gleich nach dem Debrief, mit Linear – vor der Teamaufstellung und der ersten Nutzung im Backlog', () => {
    const b = bloeckeAus(seite(T5));
    const pro = b.findIndex((x) => x.href === '#claude-pro-jetzt');
    expect(b[pro]).toMatchObject({ titel: 'Claude Pro, Claude Code und Linear, gemeinsam', von: 9 * 60 + 25, bis: 9 * 60 + 40 });
    expect(b[pro - 1].titel).toBe('Test-Debrief');
    expect(b[pro + 1]).toMatchObject({ titel: 'Teamaufstellung & Definition of Done', href: '/innolab/methoden/scrum#team', von: 9 * 60 + 40 });
    expect(seite(T5)).toContain('Dann Linear: <code>/ndu-linear</code>, ein Projekt je Produkt.</Block>');
    expect(b.map((x) => `${hhmm(x.von)}–${hhmm(x.bis)} ${x.titel}`)).toStrictEqual([
      '09:00–09:25 Test-Debrief', '09:25–09:40 Claude Pro, Claude Code und Linear, gemeinsam', '09:40–10:20 Teamaufstellung & Definition of Done',
      '10:20–10:30 Pause', '10:30–11:30 Backlog aus Issues', '11:30–12:15 Akzeptanzkriterien', '12:15–13:15 Mittagspause',
      '13:15–13:45 Schneiden statt Schätzen', '13:45–14:25 Sprint-Planning mit Störfall', '14:25–14:35 Pause', '14:35–15:35 Bauen',
      '15:35–15:45 Pause', '15:45–16:45 Bauen', '16:45–17:00 Abschluss',
    ]);
    // Davor (Debrief) braucht niemand Claude Code.
    const ablauf = seite(T5).match(/<Block time="[^"]+"[\s\S]*?(?:\/>|<\/Block>)/g) ?? [];
    expect(ablauf).toHaveLength(b.length);
    expect(ablauf.slice(0, pro).flatMap((x) => x.match(/Claude/g) ?? [])).toStrictEqual([]);
    const f = folie(T5, 'debrief-ablauf');
    expect(f.length).toBeGreaterThan(200);
    expect(f.match(/Claude Code|Claude Pro/g) ?? []).toStrictEqual([]);
    // Der Backlog-Prompt liest docs/LINEAR.md – das schreibt /ndu-linear im Block davor.
    expect(seite('/innolab/methoden/backlog')).toContain('const NACH_LINEAR = `Lies docs/LINEAR.md.');
    const l = folie(T5, 'linear-einrichten');
    expect([...l.matchAll(/<li data-schritt><strong>([^<]+)<\/strong>/g)].map((m) => m[1])).toStrictEqual(['Team im Browser:', 'Claude mit Linear verbinden:', 'Jede*r im eigenen Repo:']);
    expect(l).toContain('<ol class="gross" start="7">');
    // Linear-Konten gibt es seit dem Coding-Kurs – kein neues Konto (Markus 27.11.).
    expect(l).toContain('Konten habt ihr aus dem Coding-Kurs.');
    expect(l).toContain('<Prompt label="In Claude Code">/ndu-linear</Prompt>');
    expect([...(folie(T5, 'claude-pro-jetzt') + folie(T5, 'claude-code-opus') + l).matchAll(/<Timer minuten=\{(\d+)\} \/>/g)].map((m) => Number(m[1]))).toStrictEqual([10, 5]);
    // Die Teamaufstellung sagt, dass Linear gerade eingerichtet wurde.
    expect(seite('/innolab/methoden/scrum')).toContain('Team und Projekte habt ihr gerade mit <code>/ndu-linear</code> eingerichtet (<a href="/innolab/tag-5#linear-einrichten">Tag 5</a>');
  });

  it('die drei Folien stehen auf tag-5, im Beamer zwischen Debrief und Teamaufstellung', () => {
    expect(folienAus(T5, seite(T5)).map((f) => f.id)).toStrictEqual(['debrief', 'umschwenken', 'debrief-ablauf', 'claude-pro-jetzt', 'claude-code-opus', 'linear-einrichten', 'bauen-skizzen']);
    for (const id of ['debrief-ablauf', 'claude-pro-jetzt', 'claude-code-opus']) expect(folienTag(T5, id), id).toBe('<Folie>');
    expect(folienTag(T5, 'linear-einrichten')).toBe('<Folie weiter="/innolab/methoden/scrum#team" weiterTitel="Teamaufstellung & Definition of Done">');
    expect(folienTag('/innolab/methoden/scrum', 'team')).toBe('<Folie zurueck="/innolab/tag-5#linear-einrichten">');
    expect(folienTag('/innolab/methoden/scrum', 'uebertrag')).toBe('<Folie>');
    expect(folienTag('/innolab/methoden/backlog', 'drei-cs')).toBe('<Folie>');
  });

  it('Schritte der beiden Folien: abschließen, kündigen, starten | Opus, Test, wer hängt – mit Setup-Links und 10-Minuten-Timer', () => {
    const pro = folie(T5, 'claude-pro-jetzt');
    const opus = folie(T5, 'claude-code-opus');
    const f = pro + opus;
    const schritte = (x: string) => [...x.matchAll(/<li data-schritt><strong>([^<]+)<\/strong>/g)].map((m) => m[1]);
    expect(schritte(pro)).toStrictEqual(['Claude Pro neu abschließen,', 'Gleich wieder kündigen:', 'Claude Code starten:']);
    expect(schritte(opus)).toStrictEqual(['Modell auf Opus stellen:', 'Kurzer Test:', 'Wer hängt,']);
    expect(opus).toContain('<ol class="gross" start="4">');
    expect([...f.matchAll(/<Timer minuten=\{(\d+)\} \/>/g)].map((m) => m[1])).toStrictEqual(['10']);
    for (const a of ['claude-pro', 'claude-code-browser', 'lokal-schnellweg', 'lokal-starten']) expect(f, a).toContain(`href="/setup#${a}"`);
    const sichtbar = pro.slice(0, pro.indexOf('<div class="nur-handout">'));
    expect([...sichtbar.matchAll(/href="\/setup#([a-z-]+)"/g)].map((m) => m[1])).toStrictEqual(['claude-pro', 'claude-code-browser']);
    expect(sichtbar).toContain('<strong>Ihr habt schon Pro oder Max?</strong> Dann nichts abschließen, nichts kündigen: nur Schritt 3 bis 5.');
    expect(sichtbar).toContain('<p class="folie-satz">Alle zugleich, 15 Minuten mit Linear – ab jetzt braucht ihr Claude Code.</p>');
    expect(f).toContain('21,60 €');
    // Abgeschlossen am 12.12., gekündigt: läuft bis etwa 12. Jänner – über Tag 5 und Tag 6.
    expect(f).toContain('Pro läuft trotzdem bis etwa 12. Jänner.');
    expect(f).not.toContain('28. Dezember');
    expect(f).toContain('sagt es sofort – laut, in der Teams-Besprechung.');
    expect(f).toContain('keine Erstattung anfordern');
    expect(f).toContain('Kurzer Test:</strong> Screenshot eures Frames „T4 · 0 · Concept Story · Produkt n“ einfügen');
    expect(f).toContain('<p class="small">Meldet Claude ein Limit oder gibt es Opus nicht: <code>/model</code> und das vorgeschlagene Standardmodell wählen, dann weiter.</p>');
  });

  it('Bauen: die erste Bau-Folie gibt Claude Code die Bilder von Tag 4 – Skizzen, Abnahmekriterien, Usage Story, Story Map', () => {
    const f = folie(T5, 'bauen-skizzen');
    expect(folienTag(T5, 'bauen-skizzen')).toBe('<Folie zurueck="/innolab/tag-5#stoerfall" weiter="#abschluss" weiterTitel="Abschluss">');
    expect([...f.matchAll(/<li data-schritt><strong>([^<]+)<\/strong>/g)].map((m) => m[1])).toStrictEqual([
      'Claude Code, mit Opus:', 'Prompt „Issue nach Skizzen“', 'Claude nennt zuerst die Bildschirme.', 'Ansehen, schmal wie ein Handy:', 'Prompt „Vorschau sichern“:',
    ]);
    expect(f).toContain('<Prompt label="Issue nach Skizzen · Claude Code, mit Opus"');
    expect(f).toContain('meine Usage Story mit sieben Stationen, meine Story Map mit Slice 1, meine Abnahmekriterien und Fotos meiner Papier-Skizzen oder Bilder meiner Figma-Frames, ein Blatt oder Frame je Bildschirm.');
    expect(f).toContain('<Prompt label="Vorschau sichern · Claude Code">');
    expect(f).toContain('öffne einen Pull Request nach main – mergen tust du nicht');
    // Der erste Bau-Block ist 15 Minuten kürzer als bis zum 26.11. (Block mit Claude Pro, Claude Code und Linear am Morgen).
    const b = bloeckeAus(seite(T5)).filter((x) => x.titel === 'Bauen');
    expect(b.map((x) => [hhmm(x.von), hhmm(x.bis)])).toStrictEqual([['14:35', '15:35'], ['15:45', '16:45']]);
    // Code-Review #459: Der erste Bau-Block führt direkt auf die Folie mit den Skizzen.
    expect(b[0].href).toBe('#bauen-skizzen');
    expect(seite(T5)).toContain('nach euren Skizzen von Tag 4.</Block>');
  });

  it('die Anker der Setup-Seite, auf die die Folie zeigt, sind Überschriften', () => {
    const s = setup();
    for (const a of ['claude-pro', 'claude-code-browser', 'lokal-schnellweg', 'lokal-starten']) expect(s, a).toMatch(new RegExp(`<h[2-4] id="${a}">`));
  });

  it('Setup, Tag-2-Abschluss und Tag 3 schicken zu Tag 5, nicht mehr zu Tag 4 um 11:00', () => {
    const s = setup();
    const texte = [s, seite('/innolab/tag-2/abschluss'), seite('/innolab/tag-3'), seite(T4)];
    expect(texte.every((x) => x.length > 1000)).toBe(true);
    expect(texte.flatMap((x) => x.match(/experiment#claude-pro-jetzt|Pro gemeinsam neu ab, um 11:00|an Tag 4 neu abschließen|28\.11\.–28\.12\./g) ?? [])).toStrictEqual([]);
    expect(s).toContain('<li><strong>Innolab (12.12.–12.01.):</strong> An Innolab-Tag 5 (12. Dezember) schließen wir Pro gemeinsam neu ab');
    expect(s).toContain('(<a href="/innolab/tag-5#claude-pro-jetzt">Folie</a>)');
    expect(seite('/innolab/tag-2/abschluss')).toContain('<p data-schritt>Claude Pro erst an Tag 5 neu abschließen, am 12. Dezember gemeinsam in der Besprechung.</p>');
    expect(seite('/innolab/tag-3')).toContain('<p><strong>Tag 4 ist online und ohne Claude Code:</strong>');
  });

  // Nachtrag 26.11. abends: Claude und Claude Code immer mit Opus; im Innolab keine Dateien in VS Code, nur Terminal und claude.
  it('Setup: Opus mit /model opus und derselben Ausweichzeile wie auf tag-5#claude-code-opus, ohne Versionsnummer', () => {
    const s = setup();
    const zeile = 'Meldet Claude ein Limit oder gibt es Opus nicht: <code>/model</code> und das vorgeschlagene Standardmodell wählen, dann weiter.';
    expect(s.split(zeile)).toHaveLength(3);
    for (const id of ['claude-code-opus', 'lokal-opus']) expect(s).toContain(`<p id="${id}"><strong>Modell: Opus.</strong>`);
    expect(s.match(/<Prompt label="Claude Code">\/model opus<\/Prompt>/g)).toHaveLength(2);
    expect(seite(T5)).toContain(zeile);
    expect(s.match(/Opus \d|opus-\d/gi) ?? []).toStrictEqual([]);
    expect(s).toContain('<h4 id="lokal-starten">VS Code, Claude und App starten</h4>');
    expect(s).toContain('<Prompt label="Terminal in VS Code">claude</Prompt>');
  });
});
