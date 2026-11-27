import { describe, expect, it } from 'vitest';
import { bloeckeAus, folienAus, hhmm, quellenAusGlob } from './begleiter';
import { KAFFEEBAR_BAUM_TAG_4 } from '../components/innolab-beispiel';
import { NOTIZEN } from '../data/begleiter';

// Dieselbe Glob-Form wie in pages/innolab/begleiter.astro.
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const seite = (p: string) => quellen[p] ?? '';
const folie = (p: string, id: string) => {
  const q = seite(p);
  const a = q.indexOf(`<h2 id="${id}">`);
  return a < 0 ? '' : q.slice(a, q.indexOf('</Folie>', a));
};

// NDU-66 (Entscheidung Markus 25.11.2026): neuer Ablauf für Tag 4, Concept Story am Morgen, der Baum wächst um Lösungen und Tests.
describe('Tag 4: Ablauf vom 25.11.2026 (NDU-66)', () => {
  it('die Blöcke in Reihenfolge, mit Zeiten und Zielen', () => {
    const b = bloeckeAus(seite('/innolab/tag-4')).map((x) => `${hhmm(x.von)}–${hhmm(x.bis)} ${x.titel} ${x.href ?? ''}`.trim());
    expect(b).toStrictEqual([
      // Seit 26.11.2026 (Markus): Value Map vor „Was bauen wir?“ – erst dort ist der Spitzenreiter bestätigt, den „Slice 1 im Baum“ zeigt.
      '09:00–09:05 Arbeitsfluss – ihr seid hier #arbeitsfluss',
      '09:05–09:35 Value Map & Fit (Nachholen von Tag 3) /innolab/methoden/value-map#vorgehen',
      '09:35–09:40 Was bauen wir? #was-bauen-wir',
      // Seit 27.11.2026 (Tag-4-PR): die überarbeiteten Blöcke brauchen mehr Zeit; der Puffer am Nachmittag fällt weg.
      '09:40–10:30 Story-Bogen + Concept Story /innolab/methoden/concept-story#story-bogen',
      '10:30–10:40 Pause',
      // Seit 26.11.2026 (Durchsicht): „Geschäftsmodell“ wie der Titel der Seite, nicht mehr „Geschäftsmodell-Karten“.
      '10:40–11:00 Geschäftsmodell /innolab/methoden/geschaeftsmodell',
      // Seit 26.11.2026 nachts (Markus): Tag 4 ohne Claude. Der Claude-Pro-Block (11:00–11:10) wandert an Tag 5, die
      // Experiment-Karte beginnt direkt nach dem Geschäftsmodell; aus dem Prototyp-Spike (100 min) wird der Prototyp auf
      // Papier (55 min). Die frei gewordenen 55 Minuten stehen als Puffer vor der Pause; Agil & Scrum bleibt um 16:35.
      '11:00–11:40 Experiment-Karte /innolab/methoden/experiment#annahmen-der-idee',
      '11:40–13:05 Story Map /innolab/methoden/story-map',
      '13:05–14:05 Mittagspause',
      '14:05–14:35 Usage Story /innolab/methoden/usage-story',
      '14:35–15:30 Prototyp auf Papier /innolab/methoden/prototyp-spike',
      '15:30–16:25 Puffer: nachholen, was offen ist',
      '16:25–16:35 Pause',
      '16:35–17:15 Agil & Scrum /innolab/methoden/scrum#foliensatz',
      '17:15–17:30 Origin Story & Hausaufgabe #abschluss',
    ]);
  });

  it('der Baum wächst um Lösungen (Value Map) und Tests (Experiment-Karte), je 2 min im Block', () => {
    expect(seite('/innolab/tag-4')).toContain('<strong>Der Baum wächst heute um Lösungen und Tests.</strong>');
    // Je ein eigener Schritt (data-schritt) in der Vorgehen-Folie.
    expect(folie('/innolab/methoden/value-map', 'vorgehen-fit')).toContain('<li data-schritt><strong>Euer Baum – Lösungen:</strong> Hängt eure drei Ideen als Lösungen unter den Stern in eurem Baum (<MiroLink name="Baum · Produkt 1">Produkt 1</MiroLink> · <MiroLink name="Baum · Produkt 2">2</MiroLink> · <MiroLink name="Baum · Produkt 3">3</MiroLink>) und markiert den Spitzenreiter. <Timer minuten={2} /></li>');
    const ex = folie('/innolab/methoden/experiment', 'vorgehen');
    expect(ex).toContain('<li data-schritt><strong>Euer Baum – Tests, auf Miro:</strong> riskanteste Annahme und E1 unter den Spitzenreiter (<MiroLink name="Baum · Produkt 1">Produkt 1</MiroLink> · <MiroLink name="Baum · Produkt 2">2</MiroLink> · <MiroLink name="Baum · Produkt 3">3</MiroLink>). <Timer minuten={2} /></li>');
    // E2 kommt erst nach dem Papier-Prototyp – nicht auf der Folie der Experiment-Karte, nur im Handout.
    expect(ex.slice(0, ex.indexOf('<div class="nur-handout">'))).not.toContain('E2');
    expect(ex).toContain('nach dem Papier-Prototyp kommt E2 dazu');
    // 18 min Übung plus 12 min Theorie füllen den 30-Minuten-Block; der Titel ist die Summe der Timer.
    const timer = [...ex.matchAll(/<Timer minuten=\{(\d+)\} \/>/g)].reduce((a, m) => a + Number(m[1]), 0);
    expect(timer).toBe(18);
    expect(ex).toContain(`So geht ihr vor (${timer} min)</h2>`);
    // Kaffeebar: drei Ideen unter der Ziel-Chance, der Spitzenreiter markiert, darunter A5 mit E1.
    const loesungen = KAFFEEBAR_BAUM_TAG_4.kinder![0].kinder!;
    expect(loesungen.map((k) => k.t)).toStrictEqual(['Wartezeit-Anzeige an der Tür', 'Spitzenreiter: Im Gehen bestellen', 'Kaffeewagen am Bahnsteig']);
    expect(loesungen.filter((k) => k.kinder?.length).map((k) => k.kinder!.map((t) => t.t))).toStrictEqual([['A5 → E1: Aufsteller an der Hallentür, ab 10 von 30']]);
  });

  // Seit 26.11.2026 abends (Markus): Die Übung ist auf elf Schritt-Folien verteilt, je mit eigener Uhr; „vorgehen“ ist die
  // Übersicht ohne Timer. Das Warm-up macht jede*r selbst in sechs Schritten (28 statt 6 min) – der Block im Ablauf von
  // tag-4.astro (65 min) wächst im Tag-4-PR; hier nur Übung + davor als Summe der Seite.
  it('Story Map: Timer der Übung 42 auf den Schritt-Folien, davor 43 (26 + 8 + 9), Block im Ablauf 85; Agil & Scrum 40 min', () => {
    const q = seite('/innolab/methoden/story-map');
    const schritte = [...q.matchAll(/<h2 id="(schritt-[a-z-]+)">/g)].map((m) => m[1]);
    expect(schritte).toHaveLength(11);
    const timer = schritte.reduce((a, id) => a + [...folie('/innolab/methoden/story-map', id).matchAll(/<Timer minuten=\{(\d+)\} \/>/g)].reduce((b, m) => b + Number(m[1]), 0), 0);
    expect(timer).toBe(42);
    const sm = folie('/innolab/methoden/story-map', 'vorgehen');
    expect(sm).toContain(`So geht ihr vor (${timer} min)</h2>`);
    expect(sm).not.toContain('<Timer');
    const davor = sm.match(/Davor, zusammen (\d+) Minuten: Warm-up (\d+) .*?Theorie (\d+), Kaffeebar gemeinsam (\d+)\./);
    // Seit 27.11.2026 (Tag-4-PR): 43 = Warm-up 26 (zwei Minuten weniger Erklärung) + Theorie 8 + Kaffeebar 9.
    expect(davor?.slice(1).map(Number)).toStrictEqual([43, 26, 8, 9]);
    const [, summe, warmup, theorie, kaffeebar] = davor!.map(Number);
    expect(warmup + theorie + kaffeebar).toBe(summe);
    // Das Warm-up hat seine eigenen Uhren auf den Folien vor der Theorie; die Erklärung ist der Rest der 26 Minuten.
    const vorTheorie = q.slice(q.indexOf('<h2 id="warmup">'), q.indexOf('<h2 id="begriffe">'));
    const warmupUhren = [...vorTheorie.matchAll(/<Timer minuten=\{(\d+)\} \/>/g)].reduce((a, m) => a + Number(m[1]), 0);
    expect(warmupUhren).toBe(21);
    expect(warmup - warmupUhren).toBe(5);
    // Wieder da (seit 27.11.2026): Der Block im Ablauf von Tag 4 ist genau „davor“ plus die Uhren der Übung.
    const block = bloeckeAus(seite('/innolab/tag-4')).find((x) => x.href === '/innolab/methoden/story-map')!;
    expect(block.bis - block.von).toBe(summe + timer);
    expect(seite('/innolab/methoden/scrum')).toContain('Agil &amp; Scrum: 27 Minuten Theorie aus dem Foliensatz (20 Folien), 2 Minuten „Wo wir abweichen“, 7 Minuten Kaffeebar auf der Scrum-Karte (4 sortieren, 3 Auflösung), 4 Minuten Gleis-1-Express und Übergang.');
  });

  it('keine alten Tag-4-Zeiten mehr (Pre-Mortem 9:20, Origin Story 17:10, Lego 15:50)', () => {
    const texte = ['/innolab/tag-3', '/innolab/tag-4', '/innolab/methoden/experiment', '/innolab/methoden/scrum'].map(seite);
    expect(texte.every((x) => x.length > 1000)).toBe(true);
    expect(texte.flatMap((x) => x.match(/um 9:20|Abschluss, 17:10|ab 15:50|14:45–15:40|15:50–17:10/g) ?? [])).toStrictEqual([]);
  });

  // Seit 27.11.2026: Die Zeiten vor dem Tag-4-PR stehen nirgends mehr auf den Seiten des Tages, ihren Begleiter-Notizen und
  // den Seiten, die auf Tag 4 vorausweisen (Claude Pro 10:50, Story Map 11:30, Spike 14:05, Prototyp bis 15:35, Puffer 16:25).
  // 14:05 ist seit 26.11.2026 nachts wieder eine Zeit von Tag 4 (Usage Story) – hier nicht mehr verboten; dafür die Zeiten
  // des Spike-Ablaufs vom 27.11. (Claude Pro 11:00–11:10, Experiment 11:10, Story Map 11:50, Mittag 13:15, Usage 14:15, Spike 14:45).
  it('keine Zeiten von vor dem 27.11. (10:50, 11:30, 13:35, 15:35, 15:45, Puffer 16:25) und keine des Spike-Ablaufs', () => {
    const pfade = ['/innolab/tag-2/abschluss', '/innolab/tag-3', '/innolab/tag-4', ...['experiment', 'story-map', 'usage-story', 'prototyp-spike', 'scrum', 'concept-story', 'geschaeftsmodell', 'value-map'].map((x) => `/innolab/methoden/${x}`)];
    const texte = pfade.map((p) => ({ p, q: seite(p) }));
    for (const { p, q } of texte) expect(q.length, p).toBeGreaterThan(1000);
    const alt = /\b(10:50|11:30|12:35|13:35|15:35|15:45|11:10|11:50|13:15|14:15|14:45)\b|ab 16:25|Puffer ab|16:25–17:15/g;
    // tag-3 hat eigene Blöcke um 11:30 (Kundenprofil): nur die Hinweise auf Tag 4 zählen.
    const ohneTag3Ablauf = (p: string, q: string) => (p === '/innolab/tag-3' ? q.replace(/<Block [^>]*>/g, '') : q);
    expect(texte.flatMap(({ p, q }) => (ohneTag3Ablauf(p, q).match(alt) ?? []).map((m) => `${p}: ${m}`))).toStrictEqual([]);
    const notizen = ['/innolab/tag-4', ...['experiment', 'story-map', 'usage-story', 'prototyp-spike', 'scrum'].map((x) => `/innolab/methoden/${x}`)];
    expect(notizen.flatMap((p) => (JSON.stringify(NOTIZEN[p] ?? {}).match(alt) ?? []).map((m) => `${p}: ${m}`))).toStrictEqual([]);
  });

  // Dozent 27.11.2026: Auf den Folien stehen keine Uhrzeiten im Fließtext („um 9:05“, „bis 15:35“) – nur relativ („heute
  // Morgen“, „gleich“, „nach der Mittagspause“). Uhrzeiten bleiben im Ablauf, in Begleiter-Notizen und in Hinweisen zum Termin.
  // Ausnahme: das Beispiel der Kaffeebar für die Zeitbox („bis 16:00“), ein Wert, den die Studierenden selbst eintragen.
  it('keine Uhrzeit im Fließtext der Tag-4-Folien', () => {
    const pfade = ['/innolab/tag-4', ...['value-map', 'concept-story', 'geschaeftsmodell', 'experiment', 'story-map', 'usage-story', 'prototyp-spike'].map((x) => `/innolab/methoden/${x}`)];
    const funde = pfade.flatMap((p) => {
      const q = seite(p).replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
      const folien = q.match(/<Folie\b[\s\S]*?<\/Folie>/g) ?? [];
      expect(folien.length, p).toBeGreaterThan(3);
      return folien.flatMap((f) => (f.replace('Zeitbox: bis 16:00', '').match(/\b(9|1[0-7]):[0-5]\d\b/g) ?? []).map((z) => `${p}: ${z}`));
    });
    const weiter = folie('/innolab/methoden/scrum', 'weiter-tag-4').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
    expect(weiter.length).toBeGreaterThan(100);
    expect([...funde, ...(weiter.match(/\b(9|1[0-7]):[0-5]\d\b/g) ?? [])]).toStrictEqual([]);
  });

  // Kursregel (Markus 12.11.): drei Produkte – keine Runden aufs eigene Produkt, sondern allein und 1:1 mit Markus.
  it('Story Map und Geschäftsmodell: keine Runde zu dritt aufs eigene Produkt, stattdessen allein und 1:1', () => {
    const sm = folie('/innolab/methoden/story-map', 'vorgehen');
    const gm = folie('/innolab/methoden/geschaeftsmodell', 'vorgehen');
    expect([sm, gm].flatMap((x) => x.match(/zu dritt|die anderen beiden (gehen|ergänzen)|die anderen fragen/gi) ?? [])).toStrictEqual([]);
    expect(seite('/innolab/methoden/geschaeftsmodell')).not.toContain('zu dritt sechs Karten');
    expect(sm).toContain('<li data-schritt><strong>Kursregel:</strong> Jede*r arbeitet allein an der eigenen Map.</li>');
    // Markus 27.11.: Die live-Stichworte zu #vorgehen nennen 1:1 und „keine Runde“ nicht mehr (uebung.form bleibt).
    expect(NOTIZEN['/innolab/methoden/story-map'].vorgehen.live.filter((s) => /1:1|Runde/.test(s))).toStrictEqual([]);
    expect(folie('/innolab/methoden/story-map', 'schritt-loecher')).toContain('<li data-schritt><strong>Markus kommt ins 1:1</strong> und stellt dieselben Fragen; ihr ergänzt, ohne zu verteidigen.</li>');
    expect(folie('/innolab/methoden/story-map', 'schritt-durchgehen')).toContain('<li data-schritt><strong>Erzählt Slice 1 allein</strong>');
    expect(gm).toContain('Jede*r arbeitet allein am eigenen Produkt; Markus fragt im 1:1 nach.');
  });

  it('Tag-2-Abschluss nennt den Anfang von Tag 4 richtig: Arbeitsfluss, Value Map nachholen, dann Concept Story', () => {
    expect(seite('/innolab/tag-2/abschluss')).toContain('Tag 4 beginnt mit dem Arbeitsfluss und dem Nachholen von Value Map und Fit; dann schreibt ihr eure Concept Story.');
    // Tag 3 #faden: ohne Bezug „dort“, der Tag ist genannt (Code-Review #436).
    expect(seite('/innolab/tag-3')).toContain('(Experiment-Karte); an Tag 4 folgen auch Story Map, Usage Story und Prototyp.');
    expect(seite('/innolab/tag-3')).not.toContain('dort folgen auch');
    expect(seite('/innolab/methoden/experiment')).not.toContain('die „?“ von Tag 3 auf Miro');
  });

  // NDU-71: Um 9:00 blättert Markus im Beamer per → vom Ablauf direkt in den Arbeitsfluss, ohne Seitenwechsel.
  it('Beamer: nach dem Ablauf kommen die Folien Arbeitsfluss (Tag 4 hier, Tag 4 und 5–7 per →) und „Was bauen wir?“', () => {
    const q = seite('/innolab/tag-4');
    // Dahinter die drei Folien des Abschlusses (17:15, tag-4-ende.test.ts). → vom Arbeitsfluss zur Value Map, von dort zurück zu „Was bauen wir?“.
    expect(folienAus('/innolab/tag-4', q).map((f) => f.id)).toStrictEqual(['arbeitsfluss', 'was-bauen-wir', 'slice-im-baum', 'abschluss', 'origin-beispiel', 'hausaufgabe', 'ende-tag-4']);
    // Die erste Folie steht direkt hinter dem Ablauf, nicht erst nach #faden.
    const ablauf = q.indexOf('<h2 id="ablauf">');
    expect(ablauf).toBeGreaterThan(0);
    expect(q.slice(ablauf, q.search(/<Folie\b/)).match(/<h2 id="[^"]+"/g)).toStrictEqual(['<h2 id="ablauf"']);
    expect(folie('/innolab/tag-4', 'arbeitsfluss')).toContain('<Arbeitsfluss id="af-tag-4" hier={4} bis={4} aufdecken={3} />');
    // Letzte Folie ohne Schritte: Von #faden, #methoden oder #abschluss aus deckte → sonst erst unsichtbar ihre Schritte auf.
    expect(folie('/innolab/tag-4', 'was-bauen-wir')).toContain('schritte={false}');
    expect(folie('/innolab/tag-4', 'was-bauen-wir')).toContain('>Heute Mittag steht Slice 1 auf eurer Story Map, am Nachmittag als Prototyp auf Papier. An Tag 5 besprecht ihr, ob er hält – und baut ihn.</WasBauenWir>');
    // „Heute Mittag“ nur auf Tag 4; der Arbeitsfluss ist tagneutral.
    expect(folie('/innolab/arbeitsfluss', 'was-bauen-wir')).toContain('<WasBauenWir>An Tag 4 entsteht euer Slice 1.');
    expect(seite('/innolab/arbeitsfluss')).not.toContain('Heute Mittag');
    // Im Handout nicht doppelt: der Plan nur in der Folie.
    expect(q.match(/<Arbeitsfluss\b/g)).toHaveLength(1);
  });
});
