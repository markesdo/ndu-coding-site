import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { NOTIZEN_CONCEPT_STORY } from '../data/begleiter/concept-story';
import { quellenAusGlob } from './begleiter';

// Dieselbe Glob-Form wie in pages/innolab/begleiter.astro.
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const seite = quellen['/innolab/methoden/concept-story'] ?? '';
const folie = (id: string) => {
  const a = seite.indexOf(`<h2 id="${id}">`);
  return a < 0 ? '' : seite.slice(a, seite.indexOf('</Folie>', a));
};

// Entscheidung 66 (21.11.): Story-Bogen verbessern, nichts kürzen.
describe('Story-Bogen (Entscheidung 66; seit 26.11. Theorie an Tag 4)', () => {
  it('Folie 1 hat das Warum fürs eigene Produkt, die drei Fragen und den Ausblick auf den Prototyp', () => {
    const f = folie('story-bogen');
    expect(f).toContain('<li data-schritt><strong>Warum für euch:</strong> Ihr wisst nicht, ob eure Idee gut ist? Erzählt sie als Geschichte – wo die Geschichte nicht trägt, trägt die Idee nicht. („That’s a story.“)</li>');
    expect(f).toContain('„Wo die Geschichte nicht trägt, trägt die Idee nicht“ ist die Lesart dieses Kurses von Lichaws Satz.');
    expect(f).toContain('<li data-schritt><strong>Drei Fragen:</strong> Was ist die Geschichte? Wer ist die Hauptfigur? Was ist ihr Ziel?</li>');
    // 27.11.: Kursregel-Zeile von der Folie gestrichen, sie steht nur noch im Handout.
    expect(f).not.toContain('Am Bogen prüft ihr danach');
    expect(f.slice(f.indexOf('<ul>'), f.indexOf('</ul>')).match(/<li data-schritt>/g) ?? []).toHaveLength(3);
    expect(f).toContain('Dass ihr am Bogen entscheidet, was in euren Prototyp kommt, ist eine Kursregel');
    expect(JSON.stringify(NOTIZEN_CONCEPT_STORY['story-bogen'])).not.toContain('vierte Zeile');
    expect(f).toContain('„What’s the story? Who is the hero? What is the hero’s goal?“ ({LICHAW}, Introduction vor Kap. 1, S. xiii–xiv)');
    expect(NOTIZEN_CONCEPT_STORY['story-bogen'].kern?.[0].quelle).toContain('Introduction (vor Kap. 1), S. xiii–xiv');
  });
  it('Lichaws Film ist ein Dokumentarfilm zum Jahresende im Master, kein Abschlussfilm', () => {
    const texte = [seite, JSON.stringify(NOTIZEN_CONCEPT_STORY)];
    expect(texte.every((x) => x.length > 1000)).toBe(true);
    expect(texte.flatMap((x) => x.match(/Abschlussfilm/g) ?? [])).toStrictEqual([]);
    expect(texte.map((x) => x.includes('Dokumentarfilm zum Jahresende'))).toStrictEqual([true, true]);
    expect(NOTIZEN_CONCEPT_STORY['story-bogen'].geschichte?.text).toContain('im Master ihren Dokumentarfilm zum Jahresende');
  });
  it('keine Kürz- oder Überspring-Hinweise, keine Uhrzeit mitten im Block; jede Folie mit Sprechzeit', () => {
    const notizen = Object.entries(NOTIZEN_CONCEPT_STORY);
    expect(notizen.flatMap(([id, n]) => n.live.filter((s) => /Wenn hinten|überspringen|streichen|16:30/.test(s)).map((s) => `${id}: ${s}`))).toStrictEqual([]);
    expect(JSON.stringify(NOTIZEN_CONCEPT_STORY)).not.toMatch(/Bei Bedarf, als zweites Beispiel/);
    // Ohne die Übung von Tag 4 (vorgehen) und das Handout (vorlage, pruefen): die Folien des Story-Bogens von Tag 3.
    const ids = [...seite.matchAll(/<h2 id="([^"]+)">/g)].map((m) => m[1]).filter((id) => !['vorlage', 'vorgehen', 'pruefen'].includes(id));
    expect(ids).toHaveLength(16);
    const minuten = ids.map((id) => {
      const z = NOTIZEN_CONCEPT_STORY[id]?.live.find((s) => s.startsWith('Zeit:') && s.includes('Sprechzeit ~'));
      return Number(z?.match(/Sprechzeit ~(\d+) min/)?.[1] ?? NaN);
    });
    expect(minuten.every((m) => m > 0)).toBe(true);
    // Der Kopfkommentar in concept-story.ts nennt genau diese Summe.
    const kopf = readFileSync('src/data/begleiter/concept-story.ts', 'utf8').split('export const')[0];
    expect(kopf).toContain(`rund ${minuten.reduce((a, m) => a + m, 0)} min`);
  });
  it('höchstens fünf live-Stichworte je Folie (typen.ts)', () => {
    const zuViele = Object.entries(NOTIZEN_CONCEPT_STORY).filter(([, n]) => n.live.length > 5).map(([id, n]) => `${id}: ${n.live.length}`);
    expect(zuViele).toStrictEqual([]);
  });
  it('mitten im Block eine Uhrprüfung: concept-story notiert die Ist-Zeit', () => {
    expect(NOTIZEN_CONCEPT_STORY['concept-story'].live[0]).toBe('Zeit: Ist-Zeit notieren; Sprechzeit ~2 min, mit der BOOM-Karte.');
  });
  it('Folien, die früher keine Geschichte hatten, haben jetzt eine, mit Seite; eigene Worte als Kursformulierung', () => {
    for (const id of ['hauptfigur', 'drei-storys', 'concept-story', 'woher', 'ein-satz']) {
      const g = NOTIZEN_CONCEPT_STORY[id]?.geschichte;
      expect(g?.quelle, id).toMatch(/S\. \d+/);
      if (g?.text.includes('Für euch:')) expect(g.quelle, id).toContain('Kursformulierung');
    }
    expect(NOTIZEN_CONCEPT_STORY.hauptfigur.geschichte?.quelle).toContain('Goals Can Change, S. 135');
    // Seit der Durchsicht 26.11. ist hoehepunkt in concept-story aufgegangen; das halbe Telefongespräch steht dort als Frage.
    expect(NOTIZEN_CONCEPT_STORY['concept-story'].fragen?.[0].antwort).toContain('„Humans, it turns out, need closure.“');
    expect(NOTIZEN_CONCEPT_STORY.woher.geschichte?.quelle).toContain('fiktionalisiert (S. 38)');
    expect(NOTIZEN_CONCEPT_STORY.slack.geschichte).toBeUndefined();
  });
});

// NDU-66 (Entscheidung Markus 25.11.2026): Die Concept Story wird an Tag 4 geschrieben – 10 min Theorie, 30 min Übung.
describe('Tag 4: Concept Story schreiben (NDU-66)', () => {
  // Seit 27.11.2026 (Dozent): zwei Schritte – die Flach-Probe ist der Check am Ende von Schritt 1, kein eigener Schritt.
  it('die Übung steht wieder auf der Seite: zwei Schritte, Titel = Summe der Timer = 30 min, Vorlage und Prüfen', () => {
    const f = folie('vorgehen');
    const timer = [...f.matchAll(/<Timer minuten=\{(\d+)\} \/>/g)].map((m) => Number(m[1]));
    expect(timer).toStrictEqual([25, 5]);
    expect(f).toContain('<h2 id="vorgehen">So geht ihr vor (30 min)</h2>');
    expect([...f.matchAll(/<li data-schritt><strong>([^<]+)<\/strong>/g)].map((m) => m[1])).toStrictEqual(['Sieben Stationen, allein:', 'Festhalten:']);
    expect(f).toContain('<span class="fertig-wenn"><strong>Fertig, wenn:</strong> Krise und Höhepunkt stehen – sonst ist eure Story eine Linie (Flach-Probe, Kursregel).</span>');
    expect(f).toContain('<li data-schritt><strong>Festhalten:</strong> den Satz in Abschnitt 3 eures <a href="/innolab/mappe?bearbeiten=brief">Produkt-Briefs</a>, Station 6 als Annahme in die <a href="/innolab/mappe?bearbeiten=annahmen">Annahmen-Map</a> (beides in der Werkstatt).');
    // Seit 26.11. abends: keine docs-Dateien für Studierende – die Story bleibt auf Miro.
    expect(f).toContain('Die Story bleibt auf Miro in eurem Frame – eine Datei schreibt ihr nicht.');
    expect(f).not.toContain('docs/');
    // Seit 27.11.2026 (Dozent): Tag 4 ohne Claude-Hausaufgabe – Prüfen nur noch selbst, mit der Prüfliste.
    expect(seite).toContain('<Selbstpruefung slug="concept-story" />');
    expect(seite).toContain('<span class="eyebrow">Innolab · Tag 4 · Methode</span>');
    expect(NOTIZEN_CONCEPT_STORY.vorgehen?.uebung?.dauer).toBe('30 min (25 + 5)');
  });
  it('kein „nur Theorie“ mehr für Tag 4, keine Erzählrunde zu den eigenen Produkten', () => {
    const texte = [seite, JSON.stringify(NOTIZEN_CONCEPT_STORY)];
    expect(texte.flatMap((x) => x.match(/schreibt ihr an diesem Tag nicht|eine eigene Story schreibt ihr heute nicht|dafür gibt es dort keinen Block|Erzählen, reihum/g) ?? [])).toStrictEqual([]);
    expect(folie('vorgehen')).toContain('Eine Runde, in der ihr einander eure Storys erzählt, gibt es nicht');
  });
});

// Fable-Durchsicht der Theorie (26.11.2026): Reihenfolge für den Beamer, iPhone-Strang in vier Folien, Kursregeln benannt,
// Übung auf Miro statt in docs/STORYS.md.
describe('Concept Story klar im Beamer (Durchsicht 26.11.)', () => {
  const reihenfolge = [...seite.matchAll(/<h2 id="([^"]+)">/g)].map((m) => m[1]);
  const lis = (id: string) => [...folie(id).matchAll(/<li data-schritt><strong>([^<]+)<\/strong>/g)].map((m) => m[1]);

  it('Folien in der neuen Reihenfolge: concept-story vor flach, hoch-lehre nach hoch, drei-storys als Ausblick nach ein-satz', () => {
    expect(reihenfolge).toStrictEqual([
      'story-bogen', 'facetime', 'stationen', 'hauptfigur', 'pinocchio', 'a-mal-b', 'concept-story', 'flach', 'hoch',
      'hoch-lehre', 'baut-mit', 'slack', 'beispiel', 'woher', 'ein-satz', 'drei-storys', 'vorgehen', 'vorlage', 'pruefen',
    ]);
    // Der Begleiter folgt derselben Reihenfolge, ohne Notiz zu einer Folie, die es nicht gibt.
    expect(Object.keys(NOTIZEN_CONCEPT_STORY)).toStrictEqual(reihenfolge.filter((id) => !['vorlage', 'pruefen'].includes(id)));
  });

  it('hoehepunkt ist in concept-story aufgegangen: keine Folie, keine Notiz, kein Link mehr', () => {
    const alle = Object.values(quellen).join('\n');
    expect(alle.length).toBeGreaterThan(100000);
    expect(alle.match(/id="hoehepunkt"|concept-story#hoehepunkt/g) ?? []).toStrictEqual([]);
    expect(NOTIZEN_CONCEPT_STORY).not.toHaveProperty('hoehepunkt');
    expect(lis('concept-story')).toStrictEqual(['Anfang', 'Krise = die Konkurrenz:', 'Höhepunkt = euer Wertversprechen:', 'Schluss']);
  });

  // 27.11.: Kursregel-Zeile auf hoch-lehre gestrichen (Markus). Der Satz „Ist eure Story die Linie, fehlt die Krise“ steht auf hoch-lehre nicht mehr;
  // Im Handout steht das Nebeneinanderlegen der beiden Lösungen als Handlung mit Grund, markiert als Übertrag des Kurses –
  // seit 27.11. abends ohne Etikett „Kursregel“ (#485).
  it('hoch erzählt die Figur, hoch-lehre zieht die Lehre – Kursregel-Zeile weg, im Handout das Nebeneinanderlegen mit Grund', () => {
    expect(folie('hoch')).toContain('<h2 id="hoch">Dieselbe Figur, jetzt mit Bogen</h2>');
    expect(lis('hoch')).toStrictEqual(['Anfang wie zuvor', 'Krise:', 'Höhepunkt:', 'Danach:']);
    expect(folie('hoch')).not.toContain(' hochkant');
    expect(lis('hoch-lehre')).toStrictEqual(['Niemand hatte 3-in-1 verlangt:', 'Der Linie fehlen zwei Stationen:', 'Zwei Fragen von Lichaw:']);
    expect(folie('hoch-lehre')).not.toContain('Schreibt beide auf');
    expect(NOTIZEN_CONCEPT_STORY['hoch-lehre'].live.filter((s) => s.startsWith('Kursregel'))).toStrictEqual([]);
    expect(folie('hoch-lehre')).toContain('Legt beide nebeneinander: Erst neben der Linie seht ihr, ob eure Story eine Krise hat, die der Höhepunkt auflöst. Das ist ein Übertrag des Kurses;');
    expect(folie('hoch-lehre').match(/Kursregel/g) ?? []).toStrictEqual([]);
  });

  it('Begleiter hoch und baut-mit: Geschichte, Fragen, Lesarten markiert (27.11.)', () => {
    const hoch = NOTIZEN_CONCEPT_STORY.hoch;
    expect(hoch.geschichte?.text).toContain('„Are you getting it?“');
    expect(hoch.kern?.some((k) => k.text.startsWith('Abb. 3.4 von links gelesen') && k.text.includes('„I want an iPhone!“'))).toBe(true);
    expect(hoch.fragen?.map((f) => f.frage)).toStrictEqual([
      'Was heißt „dieselbe Figur“?',
      'Warum 3-in-1 und nicht 2-in-1 – mehr Funktionen = besser?',
      'Warum ist der Touchscreen eine Krise?',
      'Was hat das mit unserem Produkt zu tun?',
    ]);
    expect(hoch.zusatz?.map((z) => z.titel)).toStrictEqual(['Hintergrund (nicht bei Lichaw): die Keynote']);
    const bautMit = NOTIZEN_CONCEPT_STORY['baut-mit'];
    expect(bautMit.geschichte?.text).toContain('„Animation supported the story. Cut-and-paste did not.“');
    expect(bautMit.fragen?.find((f) => f.frage.startsWith('Warum stützte Kopieren'))?.antwort).toMatch(/^Lesart dieses Kurses, nicht bei Lichaw:/);
    expect(bautMit.fragen?.find((f) => f.frage.startsWith('Wie findet ihr'))?.antwort).toContain('Übertrag des Kurses');
  });

  it('slack: die Linie als naheliegende Lösung erklärt, Übertrag als Lesart markiert (27.11.)', () => {
    expect(folie('slack')).toContain('<p data-schritt><strong>Die naheliegende Lösung wäre die Linie:</strong> eine Plattform, die „easier to use“ ist als E-Mail. Aber Schwierigkeit war nicht das Problem – das Problem war: nichts an einem Ort.</p>');
    expect(folie('slack')).not.toContain('Die Linie daneben:</strong>');
    const fragen = NOTIZEN_CONCEPT_STORY.slack.fragen ?? [];
    expect(fragen.map((f) => f.frage)).toStrictEqual(['Was heißt „die Linie“ hier?', 'Was ist bei euch die Linie?']);
    expect(fragen[1].antwort).toMatch(/^Lesart dieses Kurses:/);
  });

  // 27.11. abends (Markus): Kursregel-Zeile auf baut-mit gestrichen; die Regel steht nur noch im Handout, als Übertrag des Kurses.
  it('baut-mit: Kette Krise → Höhepunkt → Anforderung → Gebaut, zwei Zeilen ohne Kursregel, keine eigene Begründung', () => {
    const f = folie('baut-mit');
    expect([...f.matchAll(/\{ t: '([^']+)'/g)].map((m) => m[1])).toStrictEqual(['Krise', 'Höhepunkt', 'Anforderung', 'Gebaut']);
    expect(f).toContain('hervor={[3]}');
    expect(lis('baut-mit')).toStrictEqual(['Animation stützte die Story.', 'Nicht nur Pitch:']);
    const sichtbar = f.slice(0, f.indexOf('<div class="nur-handout">'));
    expect(sichtbar).not.toContain('Kursregel');
    expect(f).toContain('<p><strong>Kursregel:</strong> Was eure Concept Story nicht stützt, kommt nicht in den Prototyp. Das ist ein Übertrag des Kurses, nicht Lichaws Regel:');
    expect(f).not.toContain('auf der Folie ist ein Übertrag');
    const n = NOTIZEN_CONCEPT_STORY['baut-mit'];
    expect(n.live.filter((s) => s.includes('Kursregel'))).toStrictEqual([]);
    expect(JSON.stringify(n)).not.toContain('Kursregel auf der Folie');
    expect(f).not.toContain('Für euch:');
    expect(f).not.toContain('sonst wäre der Höhepunkt');
    expect(f).toContain('Warum Kopieren und Einfügen die Story nicht stützte, führt Lichaw nicht aus.');
  });

  it('Kursregel-Etiketten: Flach-Probe in beispiel und vorgehen, Zeilen 6 und 7 in woher', () => {
    expect(folie('beispiel')).toContain('<p data-schritt><strong>Kursregel – Flach-Probe:</strong>');
    expect(lis('vorgehen')).not.toContain('Kursregel – Flach-Probe:');
    expect(folie('vorgehen')).toContain('(Flach-Probe, Kursregel)');
    const zeilen = folie('woher').split('<tr data-schritt>').slice(1);
    expect(zeilen.map((z) => z.includes('(Kursregel)'))).toStrictEqual([false, false, false, false, false, true, true]);
    expect(folie('woher')).toContain('Kap. 8, Goals Are Measurable, S. 135');
  });

  it('Übung auf Miro: Frames der Kaffeebar und je Produkt, keine docs-Datei (seit 26.11. abends)', () => {
    const f = folie('vorgehen');
    // Seit 27.11. (Dozent): Die Übungsfolie trägt die Miro-Pille der Anleitung wie die anderen Arbeitsfolien; die eigenen
    // Frames und das Kaffeebar-Beispiel stehen in Schritt 1 (#beispiel hat keine Pille mehr).
    expect(f.match(/<MiroFrame name="[^"]+" \/>/g)).toStrictEqual(['<MiroFrame name="T4 · 0 · Anleitung Concept Story" />']);
    // Seit 27.11.: die eigenen Frames und das Beispiel im Schritt selbst; die Anleitung nur in der Pille, nicht doppelt.
    const schritt1 = f.slice(f.indexOf('<strong>Sieben Stationen, allein:</strong>'), f.indexOf('</li>', f.indexOf('<strong>Sieben Stationen, allein:</strong>')));
    for (const n of [1, 2, 3]) expect(schritt1).toMatch(new RegExp(`<MiroLink name="T4 · 0 · Concept Story · Produkt ${n}">(Produkt )?${n}</MiroLink>`));
    expect(schritt1).toContain('<MiroLink name="T4 · 0 · Concept Story · Kaffeebar">Kaffeebar</MiroLink>');
    expect(schritt1).not.toContain('Anleitung Concept Story');
    // Seit 27.11. (Dozent): Links nur, wo die Arbeit beginnt – #beispiel ist Theorie, ohne Miro-Pille.
    expect(folie('beispiel')).not.toMatch(/<Miro(Frame|Link)\b/);
    // Wortlaut wie auf dem Frame: Stationen „1 Exposition“ … „7 Ende“, Feld „Flach-Probe (Kursregel)“.
    expect(f).toContain('unter „1 Exposition“ bis „7 Ende“');
    expect(f).toContain('Das Feld „Flach-Probe“ unten links im Frame könnt ihr dafür nutzen; es ist freiwillig.');
    expect(f).not.toContain('Vorlage in <code>docs/STORYS.md</code>');
    expect(seite).toContain('<h2 id="vorlage">So sieht euer Frame aus</h2>');
    expect(seite).not.toContain('<Prompt label="Vorlage · docs/STORYS.md">');
    // Seit 27.11.2026 (Dozent): Prüfen selbst mit der Prüfliste, ohne Claude (vorher an einem Bild des Frames in claude.ai).
    expect(seite).toContain('Eure Story liegt nur auf Miro, in eurem Frame „T4 · 0 · Concept Story · Produkt n“. Prüft selbst mit der Liste unten und hakt ab, was erfüllt ist.');
    expect(seite).not.toContain('Ohne Claude Code');
    expect(NOTIZEN_CONCEPT_STORY.vorgehen.miro?.frame).toBe('T4 · 0 · Concept Story · Produkt 1');
  });
});

// Wünsche des Dozenten (27.11.2026): #ein-satz sagt im Beamer, wohin der Satz kommt; die Notiz zu baut-mit erklärt, welches
// iPhone gemeint ist und warum Kopieren und Einfügen fehlte – Hintergrund außerhalb von Lichaw klar markiert.
describe('Concept Story: Satz im Brief, iPhone-Hintergrund', () => {
  it('#ein-satz: sichtbare Zeile, wohin der Satz kommt und was daraus wird', () => {
    const f = folie('ein-satz');
    const sichtbar = f.slice(0, f.indexOf('<p class="nur-handout">'));
    expect(sichtbar).toContain('<p data-schritt><strong>Der Satz kommt in Abschnitt 3 eures Produkt-Briefs (Werkstatt)</strong> – offen seit Tag 1. Daraus wird euer Pitch an Tag 7.</p>');
    expect(NOTIZEN_CONCEPT_STORY['ein-satz'].live).toContain('Zeit: Sprechzeit ~1 min; Satz → Brief, Abschnitt 3; Pitch an Tag 7.');
  });
  it('baut-mit: Frage nach Kopieren und Einfügen, Hintergrund als „nicht bei Lichaw“ markiert', () => {
    const n = NOTIZEN_CONCEPT_STORY['baut-mit'];
    expect(n.verstaendnis?.frage).toBe('Warum fehlte Kopieren und Einfügen?');
    expect(n.verstaendnis?.antwort).toContain('Lichaw nennt keinen weiteren Grund.');
    expect(n.zusatz?.[0].titel).toBe('Hintergrund (nicht bei Lichaw): das erste iPhone');
    expect(n.zusatz?.[0].text).toContain('es kam erst 2009 mit iPhone OS 3.0');
    expect(JSON.stringify(n.kern)).toContain('There was a good reason why the iPhone launched with fancy animation but no cut-and-paste functionality.');
    // Lichaw nennt in Kap. 7 die Pin-Animation (S. 129–130, Abb. 7.9) – die Notiz darf nicht sagen, sie nenne keine.
    expect(JSON.stringify(n)).not.toMatch(/Welche Animation, nennt Lichaw nicht|Welche Animationen Lichaw meint, ist damit nicht gesagt/);
    expect(JSON.stringify(n.kern)).toContain('„meticulously crafted for bounce and elasticity“');
    expect(n.kern?.find((k) => k.text.includes('pin dropped'))?.quelle).toContain('Kap. 7, Build and Communicate, S. 129–130, Abb. 7.9');
    expect(n.zusatz?.[0].text).toContain('Lichaw selbst nennt als Beispiel die Pin-Animation in Maps');
    expect(JSON.stringify(NOTIZEN_CONCEPT_STORY.hoch.kern)).toContain('Blackberrys and Palm Treos');
  });
});

// Wunsch des Dozenten (27.11.2026): Im Begleiter zu #stationen jede Station einzeln – was sie tut, Lichaws Frage, ihr Film-Beispiel,
// die Kaffeebar wie auf den Seiten, eine Falle; zur Exposition weitere Beispiele des Kurses. Zu #hoch-lehre: wofür die zwei Fragen
// da sind und was ihr heute damit tut.
describe('Begleiter: sieben Stationen einzeln, zwei Fragen erklärt (27.11.)', () => {
  const usage = quellen['/innolab/methoden/usage-story'] ?? '';
  const usageBeispiel = usage.slice(usage.indexOf('<h2 id="beispiel">'), usage.indexOf('</Folie>', usage.indexOf('<h2 id="beispiel">')));
  const st = NOTIZEN_CONCEPT_STORY.stationen;
  const stationen = ['1 Exposition.', '2 Auslöser (Inciting incident).', '3 Steigende Handlung.', '4 Krise.', '5 Höhepunkt (Climax or resolution).', '6 Fallende Handlung (Denouement).', '7 Ende.'];
  const abschnitte = ['Exposition', 'Inciting Incident or Problem', 'Rising Action', 'Crisis', 'Climax or Resolution', 'Falling Action or Denouement', 'End'];

  it('stationen: ein Überblick, dann je Station ein Eintrag mit Aufgabe, Frage, Film, Kaffeebar und Falle', () => {
    const k = st.kern ?? [];
    expect(k).toHaveLength(8);
    expect(k[0].text).toContain('Lichaw begründet die Zahl sieben nicht eigens');
    expect(k.slice(1).map((e) => stationen.find((s) => e.text.startsWith(s)))).toStrictEqual(stationen);
    k.slice(1).forEach((e, i) => {
      for (const teil of ['Was ', 'Frage:', 'Film:', 'Kaffeebar (Kursbeispiel):', 'Falle:']) expect(e.text, `${stationen[i]} ${teil}`).toContain(teil);
      expect(e.quelle, stationen[i]).toMatch(new RegExp(`Kap\\. 2, ${abschnitte[i]}, S\\. \\d+`));
      expect(e.quelle, stationen[i]).toContain('Kaffeebar: Kursbeispiel (concept-story#beispiel, usage-story#beispiel)');
    });
  });

  it('Exposition: Lichaws Fragen und Marty, nur so weit sie ihn beschreibt', () => {
    const e = st.kern?.[1].text ?? '';
    expect(e).toContain('Frage: Wer? Welche Ziele? Was steht im Weg?');
    expect(e).toContain('„What is the problem or impediment standing in the way of this person meeting her goal?“');
    expect(e).toContain('„His family isn’t very ambitious, but Marty has plans. He’s going to make something of himself.“');
    expect(e).toContain('was Marty vor 1955 im Weg steht, nennt sie nicht');
  });

  it('die Kaffeebar-Stellen im Begleiter stehen wörtlich so auf concept-story#beispiel bzw. usage-story#beispiel', () => {
    const kern = JSON.stringify(st.kern);
    expect(usageBeispiel.length).toBeGreaterThan(500);
    const seiten = { cs: folie('beispiel'), us: usageBeispiel };
    const stellen: [string, 'cs' | 'us'][] = [
      ['die Barista kennt die Stammgäste (G3, I3-6)', 'cs'],
      ['ohne gehetzt in den Tag zu starten (J2)', 'cs'],
      ['bei mehr als fünf Leuten reicht die Zeit nicht (P2)', 'cs'],
      ['„Gleis-1-Express“ – bestellen im Browser, per QR-Code an der Hallentür, abholen an der Express-Ausgabe', 'cs'],
      ['„halt Notlösung, aber er ist schnell“ (I1-3)', 'cs'],
      ['„Fertig 7:31. Dein Zug fährt 7:38.“ – Gewissheit statt Glücksspiel', 'cs'],
      ['„Wenn ich auf die Uhr schauen muss, geh ich“ (I2-2)', 'cs'],
      ['gemessen an Bestellungen über den Code zwischen 7:15 und 7:45', 'cs'],
      ['I1, Zug 7:38, „eigentlich immer knapp dran“ (I1-1); will Kaffee, ohne den Zug zu riskieren (J1, P1)', 'us'],
      ['7:27, „Ich komme in die Halle und entscheide.“: Schlange bis zur Tür, an der Tür der Aufsteller', 'us'],
      ['scannen → eins aus drei → 7:38 eintippen', 'us'],
      ['der Zweifel, ob es reicht (P1, I3-3)', 'us'],
      ['Express-Ausgabe, Nummer am Bildschirm, bar bezahlt', 'us'],
      ['im Zug der erste Schluck (I1-4)', 'us'],
    ];
    expect(stellen.filter(([s, wo]) => !kern.includes(s) || !seiten[wo].includes(s)).map(([s]) => s)).toStrictEqual([]);
  });

  it('stationen: Fragen zu sieben, Höhepunkt, Kürze und Exposition; Beispiele außerhalb Lichaws markiert; kein „Kursregel“', () => {
    expect(st.fragen?.map((f) => f.frage)).toStrictEqual([
      'Warum sieben Stationen – reichen nicht Anfang, Mitte, Ende?',
      'Warum hört die Geschichte nicht am Höhepunkt auf?',
      'Warum sollen fallende Handlung und Ende so kurz sein?',
      'Was gehört in eine gute Exposition? Gibt es Beispiele?',
      'Reicht eine Persona-Beschreibung als Exposition?',
    ]);
    const f = (i: number) => st.fragen?.[i].antwort ?? '';
    expect(f(1)).toContain('„Stories can’t just end on a high point, or they’re as unsatisfying as a cliffhanger.“');
    expect(f(2)).toContain('„As much as humans need closure, they’re also impatient beings.“');
    expect(f(3)).toContain('Beispiele des Kurses, nicht bei Lichaw: (a) Kaffeebar');
    expect(f(3)).toContain('(b) Lern-App');
    expect(f(3)).toContain('(c) Rechnungs-Tool');
    expect(f(4)).toMatch(/^Nein\. Schwach \(Beispiel des Kurses\): .* Stark: /);
    expect(st.live).toContain('Bei Bedarf: jede Station unten im Begleiter, mit Kaffeebar-Beispiel.');
    expect(JSON.stringify(st).match(/Kursregel/g) ?? []).toStrictEqual([]);
  });

  it('hoch-lehre: iPhone, „Our brains don’t like flat“, die zwei Fragen und wann die Linie reicht – mit Quelle', () => {
    const n = NOTIZEN_CONCEPT_STORY['hoch-lehre'];
    const kern = JSON.stringify(n.kern);
    expect(kern).toContain('„Are you getting it?“');
    expect(kern).toContain('„Our brains don’t like flat. Our brains need structure in order to get excited about things');
    expect(kern).toContain('„What is the straightforward solution to the problem?“ und „What is the awesome solution to the problem?“');
    expect(kern).toContain('Ein festes Vorgehen für die zwei Fragen gibt sie nicht');
    expect(n.kern?.find((k) => k.text.startsWith('Wann die naheliegende Lösung reicht'))?.quelle).toContain('Kap. 5, Micro-Stories: Core Tasks, S. 90');
    expect(n.fragen?.map((f) => f.frage)).toStrictEqual([
      'Wofür sind die zwei Fragen da?',
      'Was machen wir heute konkret damit?',
      'Wie sieht das bei der Kaffeebar aus?',
      'Frage an den Raum: War ein iPod, der telefoniert, eine schlechte Idee?',
      'Frage an den Raum: Wann dürft ihr bei der naheliegenden Lösung bleiben?',
      'Vorsicht beim Erzählen: Was davon steht so bei Lichaw?',
    ]);
    const a = (i: number) => n.fragen?.[i].antwort ?? '';
    expect(a(1)).toMatch(/^Übertrag des Kurses, nicht bei Lichaw/);
    // Linie und Gipfel der Kaffeebar wie auf concept-story#beispiel.
    for (const s of ['„Geht sich ein Kaffee aus?“ → Wartezeit-Anzeige an der Tür → Kaffee vor dem Zug', 'trifft P1, aber nicht P2, P3 und G1', '„Fertig 7:31. Dein Zug fährt 7:38.“']) {
      expect(a(2), s).toContain(s);
      expect(folie('beispiel'), s).toContain(s);
    }
    expect(a(5)).toContain('sind Lichaws Sätze');
    expect(a(5)).toContain('ein Übertrag des Kurses, kein Schritt bei Lichaw');
    expect(n.live).toContain('Bei Bedarf: Kaffeebar – Wartezeit-Anzeige als Linie, „Fertig 7:31“ als Gipfel.');
    expect(JSON.stringify(n).match(/Kursregel/g) ?? []).toStrictEqual([]);
  });
});
