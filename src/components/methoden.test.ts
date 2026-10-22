import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ARTEFAKTE as WERKSTATT_ARTEFAKTE, ARTEFAKT_NAMEN } from '../werkstatt/schemas/index.js';
import { MCP_WERKZEUGE } from '../werkstatt/vertrag.js';
import { MOM_TEST_GRUPPE, NACH_MOM_TEST } from './innolab-zeiten';
import { ARTEFAKTE, METHODEN, ORTE, TAGE, WERKSTATT_AKKUSATIV, einfuegenMoeglich, erzeugtVon, methodenVonTag, pruefChecklisteId, pruefPrompt, pruefungInWerkstatt, vorarbeitLesen } from './methoden';

const artefaktIds = ARTEFAKTE.map((a) => a.id);
const slugs = METHODEN.map((m) => m.slug);

describe('methoden', () => {
  it('Slugs und Artefakt-IDs sind eindeutig, alle Texte gefüllt', () => {
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(artefaktIds).size).toBe(artefaktIds.length);
    for (const m of METHODEN) {
      for (const feld of [m.name, m.frage, m.ki]) expect(feld.trim().length, m.slug).toBeGreaterThan(0);
      expect(m.slug).toMatch(/^[a-z0-9-]+$/);
      expect(m.dauer).toBeGreaterThan(0);
    }
  });

  it('jedes Artefakt entsteht in genau einer Methode – nichts wird zweimal erarbeitet', () => {
    for (const id of artefaktIds) {
      const quellen = METHODEN.filter((m) => m.ergibt.includes(id)).map((m) => m.slug);
      expect(quellen, id).toHaveLength(1);
    }
  });

  it('jede Methode erzeugt etwas, und nur bekannte Artefakte', () => {
    for (const m of METHODEN) {
      expect(m.ergibt.length, m.slug).toBeGreaterThan(0);
      for (const id of [...m.ergibt, ...m.braucht]) expect(artefaktIds, `${m.slug}: ${id}`).toContain(id);
    }
  });

  it('eine Methode baut nur auf Artefakten früherer Methoden auf', () => {
    METHODEN.forEach((m, i) => {
      for (const id of m.braucht) {
        const quelle = erzeugtVon(id)!;
        expect(METHODEN.indexOf(quelle), `${m.slug} braucht ${id} von ${quelle.slug}`).toBeLessThan(i);
      }
    });
  });

  it('jedes Artefakt außer dem Pitch wird später weiterverwendet – keine toten Enden', () => {
    for (const id of artefaktIds.filter((x) => x !== 'pitch')) {
      expect(METHODEN.some((m) => m.braucht.includes(id)), id).toBe(true);
    }
  });

  it('Kurstage laufen aufsteigend von 1 bis 4 – ab Tag 5 wird nur gebaut –, Orte sind bekannt', () => {
    const tage = METHODEN.map((m) => m.tag);
    expect(tage).toEqual([...tage].sort((a, b) => a - b));
    expect(tage[0]).toBe(1);
    for (const t of tage) expect(t).toBeLessThanOrEqual(4);
    for (const a of ARTEFAKTE) {
      expect(a.lebtIn.length, a.id).toBeGreaterThan(0);
      for (const o of a.lebtIn) expect(Object.keys(ORTE)).toContain(o);
      if (a.lebtIn.includes('repo') && a.id !== 'inkrement') expect(a.pfad, a.id).toMatch(/^docs\//);
    }
  });

  it('die vier Tag-1-Artefakte und die Interviews leben in der Werkstatt, jedes Werkstatt-Artefakt genau einmal', () => {
    const inWerkstatt = ARTEFAKTE.filter((a) => a.lebtIn.includes('werkstatt'));
    expect(inWerkstatt.map((a) => [a.id, a.werkstatt])).toStrictEqual([
      ['brief', 'brief'], ['entscheidungen', 'entscheidungen'], ['transkripte', 'leitfaden'], ['annahmen', 'annahmen'], ['synthese', 'interviews'],
    ]);
    // Interview-Notizen nie ins App-Repo (öffentlich): Leitfaden und Notizen leben nur in der Werkstatt.
    for (const a of inWerkstatt) expect(a.lebtIn, a.id).not.toContain('repo');
    expect(ARTEFAKTE.filter((a) => a.werkstatt !== undefined)).toStrictEqual(inWerkstatt);
    for (const a of inWerkstatt) {
      // Der Pfad zeigt in die Mappe.
      expect(a.pfad, a.id).toBe(`mappe/${a.werkstatt}.json`);
      // Die Methodenseite des Werkstatt-Artefakts ist die Methode, die das Artefakt erzeugt.
      expect(erzeugtVon(a.id)!.slug, a.id).toBe(WERKSTATT_ARTEFAKTE[a.werkstatt!].slug);
    }
    expect(ARTEFAKTE.find((a) => a.id === 'transkripte')).toStrictEqual({
      id: 'transkripte', name: 'Leitfaden und Interview-Notizen (pseudonymisiert)', lebtIn: ['werkstatt'], pfad: 'mappe/leitfaden.json', werkstatt: 'leitfaden',
    });
    // Der Akkusativ nennt das Artefakt mit dem Titel aus der Werkstatt, für jedes Artefakt der Mappe.
    expect(Object.keys(WERKSTATT_AKKUSATIV).sort()).toStrictEqual([...ARTEFAKT_NAMEN].sort());
    for (const n of ARTEFAKT_NAMEN) expect(WERKSTATT_AKKUSATIV[n], n).toMatch(new RegExp(`^mein(e|en)? ${WERKSTATT_ARTEFAKTE[n].titel}$`));
  });

  it('Werkstatt-Artefakte prüft Claude mit artefakt_pruefen, nicht aus docs/ – die Vorarbeit liefert das Werkzeug mit', () => {
    const pr = pruefPrompt(METHODEN.find((m) => m.slug === 'problem-rahmen')!);
    expect(pr).toMatch(new RegExp(`^Prüf meinen Produkt-Brief mit der Werkstatt \\(Werkzeug ${MCP_WERKZEUGE.artefaktPruefen}\\) gegen diese Prüfliste \\(Problem-Rahmen & Produkt-Brief\\):\n1\. `));
    expect(pr).not.toContain('Zum Abgleich');
    const el = pruefPrompt(METHODEN.find((m) => m.slug === 'entscheidungslog')!);
    expect(el).toMatch(/^Prüf mein Entscheidungslog mit der Werkstatt \(Werkzeug artefakt_pruefen\)/);
    expect(el).toContain('\nZum Abgleich liefert das Werkzeug auch meinen Produkt-Brief mit.\n');
    expect(el).not.toContain(MCP_WERKZEUGE.artefaktLesen);
    const iv = pruefPrompt(METHODEN.find((m) => m.slug === 'interview')!);
    expect(iv).toMatch(/^Prüf meinen Interviewleitfaden mit der Werkstatt \(Werkzeug artefakt_pruefen\)/);
    expect(iv).toContain('Zum Abgleich liefert das Werkzeug auch meinen Produkt-Brief und meine Annahmen-Map mit.');
    const an = pruefPrompt(METHODEN.find((m) => m.slug === 'annahmen')!);
    expect(an).toMatch(/^Prüf meine Annahmen-Map mit der Werkstatt/);
    expect(iv).toContain('Ohne Werkstatt-Zugang nimm stattdessen die Texte, die ich unter diese Nachricht einfüge: meinen Interviewleitfaden, meinen Produkt-Brief und meine Annahmen-Map.');
    for (const t of [pr, el, iv, an]) {
      expect(t).toContain('Ohne Werkstatt-Zugang nimm stattdessen die Texte');
      expect(t).not.toMatch(/docs\/|Lies /);
      // Claude ändert in der Werkstatt nichts: kein „ändere keine Datei“, sondern kein eigener Text.
      expect(t).toContain('Schreib nichts um und formulier keinen Text für mich');
    }
    expect(METHODEN.filter((m) => pruefungInWerkstatt(m)).map((m) => m.slug)).toStrictEqual(['problem-rahmen', 'entscheidungslog', 'annahmen', 'interview', 'synthese']);
    // Mit Pfad bleibt es die Prüfung einer Datei; die Vorarbeit kommt weiter aus der Werkstatt.
    expect(pruefungInWerkstatt(METHODEN.find((m) => m.slug === 'entscheidungslog')!, 'notizen/alt.md')).toBe(false);
    expect(pruefPrompt(METHODEN.find((m) => m.slug === 'entscheidungslog')!, 'notizen/alt.md')).toMatch(/^Lies notizen\/alt\.md\. Zum Abgleich lies auch aus der Werkstatt meinen Produkt-Brief \(Werkzeug artefakt_lesen\)\. /);
  });

  it('methodenVonTag liefert die Methoden eines Tags in Kursreihenfolge', () => {
    expect(methodenVonTag(2).map((m) => m.slug)).toEqual(['synthese', 'journey-map', 'baum', 'ziel-chance', 'hmw', 'ideation']);
    expect(methodenVonTag(7)).toEqual([]);
  });

  // NDU-28: Prüfpunkte haben feste IDs <slug>-<thema>, unabhängig von Reihenfolge und Text.
  it('Prüf-Prompt nennt zu jedem Punkt seine feste ID (auch ohne Connector dieselben IDs wie artefakt_pruefen)', () => {
    for (const m of METHODEN.filter((x) => x.pruefliste)) {
      const prompt = pruefPrompt(m);
      m.pruefliste!.forEach((p, i) => expect(prompt, p.id).toContain(`\n${i + 1}. ${p.text} (${p.id})\n`));
    }
  });

  it('Prüfpunkt-IDs: eindeutig, <slug>-<thema> ohne Ziffern', () => {
    const alle = METHODEN.flatMap((m) => m.pruefliste ?? []).map((p) => p.id);
    expect(new Set(alle).size).toBe(alle.length);
    for (const m of METHODEN) {
      for (const p of m.pruefliste ?? []) {
        expect(p.id.startsWith(`${m.slug}-`), p.id).toBe(true);
        expect(p.id.slice(m.slug.length + 1), p.id).toMatch(/^[a-z]+(-[a-z]+)*$/);
      }
    }
  });

  it('Prüfpunkt-IDs wandern nicht: vergeben ist vergeben, gestrichen bleibt gestrichen', () => {
    // Jede je vergebene ID. Ein neuer Punkt kommt hier dazu; ein gestrichener oder umbenannter kommt nach GESTRICHEN, und
    // seine ID wird nie wieder vergeben – so bedeutet eine ID in Gesprächen und im Kalibrierungslog immer dasselbe.
    const VERGEBEN = [
      'problem-rahmen-zielgruppe', 'problem-rahmen-loesung', 'problem-rahmen-heute', 'problem-rahmen-nicht', 'problem-rahmen-outcome',
      'entscheidungslog-felder', 'entscheidungslog-beleg', 'entscheidungslog-tatsache', 'entscheidungslog-ersetzt',
      'annahmen-pruefbar', 'annahmen-arten', 'annahmen-wichtig-beleg', 'annahmen-riskanteste', 'annahmen-loesung', 'annahmen-getan-quelle',
      'interview-ziel', 'interview-zukunft', 'interview-idee', 'interview-letztes-mal', 'interview-heute', 'interview-nachfragen', 'interview-einwilligung',
      'synthese-snapshot', 'synthese-chance-beduerfnis', 'synthese-einsichten', 'synthese-pseudonym', 'synthese-beleg-nachgetragen',
      'journey-map-geschichten', 'journey-map-erleben', 'journey-map-umwege', 'journey-map-momente-getrennt', 'journey-map-worte-belegt', 'journey-map-hoehepunkt-ende',
      'baum-chance-beduerfnis', 'baum-belegt', 'baum-ein-elternteil', 'baum-kind-teil', 'baum-stapel', 'baum-konkret',
      'ziel-chance-geschwister', 'ziel-chance-blatt', 'ziel-chance-linsen', 'ziel-chance-belegt', 'ziel-chance-ulwick',
      'hmw-wie-koennten', 'hmw-loesung', 'hmw-reichweite', 'hmw-kundensicht', 'hmw-auswahl',
      'ideation-menge', 'ideation-aussortiert', 'ideation-drei', 'ideation-verschieden', 'ideation-claude',
      'kundenprofil-segment', 'kundenprofil-jobs', 'kundenprofil-sozial-emotional', 'kundenprofil-konkret', 'kundenprofil-produkt', 'kundenprofil-ziel-chance', 'kundenprofil-geordnet',
      'value-map-lueckensatz', 'value-map-segment', 'value-map-fit-vergleich', 'value-map-wahl', 'value-map-wirkung', 'value-map-adressiert',
      'concept-story-stationen', 'concept-story-produkt', 'concept-story-krise', 'concept-story-hoehepunkt', 'concept-story-linie', 'concept-story-fallend', 'concept-story-ende',
      'geschaeftsmodell-verweise', 'geschaeftsmodell-wert', 'geschaeftsmodell-kosten', 'geschaeftsmodell-muster', 'geschaeftsmodell-annahme', 'geschaeftsmodell-widerspruch',
      'experiment-annahmen-arten', 'experiment-eine-annahme', 'experiment-wer-wo-was', 'experiment-schwelle', 'experiment-schnellster', 'experiment-danach', 'experiment-origin', 'experiment-lernkarte',
      'story-map-rahmen', 'story-map-schritte', 'story-map-erzaehlbar', 'story-map-alternativen', 'story-map-slice-ziel', 'story-map-slice-durchgehend', 'story-map-kein-software',
      'usage-story-person', 'usage-story-ausloeser', 'usage-story-schritte', 'usage-story-krise', 'usage-story-hoehepunkt', 'usage-story-nach-gipfel', 'usage-story-ende',
      'prototyp-spike-skizzen', 'prototyp-spike-branch', 'prototyp-spike-karte', 'prototyp-spike-aufgabe', 'prototyp-spike-trockenlauf', 'prototyp-spike-protokoll', 'prototyp-spike-lernkarte',
      'scrum-produkte', 'scrum-rollen', 'scrum-termine', 'scrum-dod', 'scrum-dod-messung', 'scrum-abweichungen', 'scrum-lego',
      'backlog-herkunft', 'backlog-titel-ziel', 'backlog-senkrecht', 'backlog-nicht-im-umfang', 'backlog-reihenfolge', 'backlog-erzaehlt',
      'akzeptanzkriterien-szenario', 'akzeptanzkriterien-gegeben-zustand', 'akzeptanzkriterien-grenzfall', 'akzeptanzkriterien-kein-bau', 'akzeptanzkriterien-zeigbar', 'akzeptanzkriterien-ki',
      'schneiden-plan-check', 'schneiden-ein-durchgang', 'schneiden-entscheidung', 'schneiden-spike', 'schneiden-gesehen',
      'sprint-ziel', 'sprint-auswahl', 'sprint-nicht-mehr', 'sprint-beleg', 'sprint-review', 'sprint-retro', 'sprint-retro-kurz',
      'pitch-einstieg', 'pitch-demo', 'pitch-belege', 'pitch-gescheitert', 'pitch-outcome', 'pitch-position', 'pitch-pitch-satz', 'pitch-geschaeftsmodell',
    ];
    const GESTRICHEN: string[] = [];
    const jetzt = METHODEN.flatMap((m) => m.pruefliste ?? []).map((p) => p.id);
    for (const id of jetzt) expect(VERGEBEN, `${id}: neue ID in VERGEBEN eintragen`).toContain(id);
    for (const id of VERGEBEN) {
      if (GESTRICHEN.includes(id)) expect(jetzt, `${id} ist gestrichen und darf nicht wiederkommen`).not.toContain(id);
      else expect(jetzt, `${id} fehlt: umbenannt oder gestrichen? Dann nach GESTRICHEN`).toContain(id);
    }
  });

  it('alte Positions-IDs (vor NDU-28) sind eingefroren: jede zeigt für immer auf denselben Punkt, neue kommen nicht dazu', () => {
    // So vergab artefakt_pruefen die IDs bis NDU-28 (<slug>-<Position>); nur die Werkstatt-Methoden waren erreichbar.
    const ALT: Record<string, string> = {
      'problem-rahmen-1': 'problem-rahmen-zielgruppe',
      'problem-rahmen-2': 'problem-rahmen-loesung',
      'problem-rahmen-3': 'problem-rahmen-heute',
      'problem-rahmen-4': 'problem-rahmen-nicht',
      'problem-rahmen-5': 'problem-rahmen-outcome',
      'entscheidungslog-1': 'entscheidungslog-felder',
      'entscheidungslog-2': 'entscheidungslog-beleg',
      'entscheidungslog-3': 'entscheidungslog-tatsache',
      'entscheidungslog-4': 'entscheidungslog-ersetzt',
      'annahmen-1': 'annahmen-pruefbar',
      'annahmen-2': 'annahmen-arten',
      'annahmen-3': 'annahmen-wichtig-beleg',
      'annahmen-4': 'annahmen-riskanteste',
      'annahmen-5': 'annahmen-loesung',
      'annahmen-6': 'annahmen-getan-quelle',
      'interview-1': 'interview-ziel',
      'interview-2': 'interview-zukunft',
      'interview-3': 'interview-idee',
      'interview-4': 'interview-letztes-mal',
      'interview-5': 'interview-heute',
      'interview-6': 'interview-nachfragen',
      'interview-7': 'interview-einwilligung',
      'synthese-1': 'synthese-snapshot',
      'synthese-2': 'synthese-chance-beduerfnis',
      'synthese-3': 'synthese-einsichten',
      'synthese-4': 'synthese-pseudonym',
      'synthese-5': 'synthese-beleg-nachgetragen',
    };
    const jetzt = Object.fromEntries(METHODEN.flatMap((m) => m.pruefliste ?? []).filter((p) => p.alt).map((p) => [p.alt!, p.id]));
    expect(jetzt).toStrictEqual(ALT);
  });

  it('Prüfpunkt-IDs der Werkstatt-Methoden bleiben bei ihrem Thema', () => {
    // Stichwort aus dem Text jedes Punkts, den artefakt_pruefen liefert. Wird ein Punkt umformuliert, bleibt das Stichwort;
    // sonst ist es ein neues Thema mit neuer ID (und die alte kommt nach GESTRICHEN, Test oben).
    const STICHWORT: Record<string, RegExp> = {
      'problem-rahmen-zielgruppe': /Zielgruppe/, 'problem-rahmen-loesung': /keine Lösung/, 'problem-rahmen-heute': /heute gelöst/,
      'problem-rahmen-nicht': /NICHT/, 'problem-rahmen-outcome': /Outcome-Metrik/,
      'entscheidungslog-felder': /Datum, Entscheidung und Grund/, 'entscheidungslog-beleg': /Beleg/, 'entscheidungslog-tatsache': /Tatsache/,
      'entscheidungslog-ersetzt': /ersetzt/,
      'annahmen-pruefbar': /prüfbarer Satz/, 'annahmen-arten': /vier Arten/, 'annahmen-wichtig-beleg': /wie wichtig/,
      'annahmen-riskanteste': /riskanteste/, 'annahmen-loesung': /Funktion/, 'annahmen-getan-quelle': /„getan“/,
      'interview-ziel': /Forschungsfrage/, 'interview-zukunft': /Zukunft/, 'interview-idee': /Idee/, 'interview-letztes-mal': /letzten konkreten Mal/,
      'interview-heute': /heute schon tut/, 'interview-nachfragen': /Nachfragen/, 'interview-einwilligung': /Einwilligung/,
      'synthese-snapshot': /Snapshot/, 'synthese-chance-beduerfnis': /Bedürfnis/, 'synthese-einsichten': /Einsichten/,
      'synthese-pseudonym': /Pseudonym/, 'synthese-beleg-nachgetragen': /Beleg nachgetragen/,
    };
    const werkstatt = METHODEN.filter((m) => pruefungInWerkstatt(m)).flatMap((m) => m.pruefliste ?? []);
    expect(werkstatt.map((p) => p.id).sort()).toStrictEqual(Object.keys(STICHWORT).sort());
    for (const p of werkstatt) expect(p.text, p.id).toMatch(STICHWORT[p.id]);
  });

  it('die Interview-Prüfliste ist zu wie die Mom-Test-Auflösung (NDU-29); andere Prüflisten sind nicht gesperrt', () => {
    expect(METHODEN.find((m) => m.slug === 'interview')!.prueflisteNach).toStrictEqual({ gruppe: MOM_TEST_GRUPPE, ab: NACH_MOM_TEST });
    expect(METHODEN.filter((m) => m.prueflisteNach).map((m) => m.slug)).toStrictEqual(['interview']);
  });

  it('jede Methode mit eigener Seite hat eine Prüfliste mit 3–8 Punkten', () => {
    const mitSeite = METHODEN.filter((m) => existsSync(new URL(`../pages/innolab/methoden/${m.slug}.astro`, import.meta.url)));
    expect(mitSeite.length).toBeGreaterThan(0);
    for (const m of mitSeite) {
      expect(m.pruefliste?.length ?? 0, m.slug).toBeGreaterThanOrEqual(3);
      expect(m.pruefliste!.length, m.slug).toBeLessThanOrEqual(8);
      // Reiner Text: Die Checkliste rendert HTML, der Claude-Prompt kopiert Text – beides soll gleich aussehen.
      for (const p of m.pruefliste!) expect(p.text, m.slug).not.toMatch(/[<>&]/);
    }
  });

  it('neu geschriebene Prüflisten bekommen eine neue Checklisten-ID – alte Häkchen hängen sonst an neuen Punkten', () => {
    const id = (slug: string) => pruefChecklisteId(METHODEN.find((m) => m.slug === slug)!);
    expect(['experiment', 'prototyp-spike', 'scrum', 'sprint', 'backlog', 'akzeptanzkriterien', 'schneiden', 'pitch'].map(id)).toStrictEqual(
      ['il-experiment-2', 'il-prototyp-spike-2', 'il-scrum-2', 'il-sprint-2', 'il-backlog-2', 'il-akzeptanzkriterien-2', 'il-schneiden-2', 'il-pitch-2'],
    );
    const ids = METHODEN.map(pruefChecklisteId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('der Prüf-Prompt nennt das Ergebnis und zum Abgleich die Vorarbeit, jede nur einmal', () => {
    const kp = pruefPrompt(METHODEN.find((m) => m.slug === 'kundenprofil')!);
    expect(kp).toMatch(/^Lies docs\/KUNDENPROFIL\.md\. Zum Abgleich lies auch docs\/BAUM\.md, docs\/ZIEL-CHANCE\.md und aus der Werkstatt meine Interviews und Snapshots \(Werkzeug artefakt_lesen\)\./);
    const jm = pruefPrompt(METHODEN.find((m) => m.slug === 'journey-map')!);
    expect(jm).toContain('Lies docs/JOURNEY.md. Zum Abgleich lies auch aus der Werkstatt meinen Produkt-Brief und meine Interviews und Snapshots (Werkzeug artefakt_lesen).');
    // Vorarbeit aus der Werkstatt: über den Connector, nicht als Datei (Tag 2 passt ihre Seite mit ihrer Phase an).
    const sy = pruefPrompt(METHODEN.find((m) => m.slug === 'synthese')!);
    expect(sy).toMatch(/^Prüf meine Interviews und Snapshots mit der Werkstatt \(Werkzeug artefakt_pruefen\) gegen diese Prüfliste \(Interview-Synthese\):/);
    expect(sy).toContain('Zum Abgleich liefert das Werkzeug auch meinen Interviewleitfaden und meine Annahmen-Map mit.');
  });

  // NDU-18: Claude Code liest Dateien im Repo und die Werkstatt über den Connector. Ohne Claude Code der Ausweichweg:
  // das Ergebnis als Text in Claude einfügen – nur, wo das Ergebnis in einer Datei liegt.
  it('Ausweichweg „einfügen“: für Ergebnisse in Dateien, nicht für die Werkstatt und nicht für Linear', () => {
    const mitListe = METHODEN.filter((m) => m.pruefliste);
    const ohne = mitListe.filter((m) => !einfuegenMoeglich(m)).map((m) => m.slug);
    expect(ohne).toStrictEqual([...mitListe.filter((m) => pruefungInWerkstatt(m)).map((m) => m.slug), 'backlog', 'akzeptanzkriterien', 'schneiden']);
    for (const m of mitListe.filter((x) => einfuegenMoeglich(x))) {
      expect(pruefPrompt(m), m.slug).toMatch(/^Lies /);
      const p = pruefPrompt(m, undefined, 'einfuegen');
      // „oder Text aus Miro“ nur, wo das Ergebnis auch auf Miro liegt.
      const miro = m.ergibt.some((id) => ARTEFAKTE.find((a) => a.id === id)!.lebtIn.includes('miro'));
      expect(p, m.slug).toMatch(miro ? /^Unter diese Nachricht füge ich mein Ergebnis ein \(Inhalt der Datei oder Text aus Miro\): / : /^Unter diese Nachricht füge ich mein Ergebnis ein \(Inhalt der Datei\): /);
      // Nichts, was nur Claude Code kann: keine Datei lesen, keine Datei ändern.
      expect(p, m.slug).not.toMatch(/^Lies |ändere keine Datei/m);
    }
    expect(() => pruefPrompt(METHODEN.find((m) => m.slug === 'annahmen')!, undefined, 'einfuegen')).toThrow(/keinen Weg zum Einfügen/);
    // pfad: nur, wenn er eine Datei nennt.
    const ak = METHODEN.find((m) => m.slug === 'akzeptanzkriterien')!;
    expect(einfuegenMoeglich(ak, 'über den Linear-MCP die Issues für Sprint 1')).toBe(false);
    expect(einfuegenMoeglich(ak, 'über den Linear-MCP die Issues aus docs/BACKLOG.md')).toBe(false);
    expect(einfuegenMoeglich(ak, 'docs/interviews/I2.md')).toBe(true);
    expect(pruefPrompt(METHODEN.find((m) => m.slug === 'baum')!, 'docs/X.md', 'einfuegen')).toMatch(/: docs\/X\.md\. Prüf es/);
    // Vorarbeit aus Dateien wird mit eingefügt, Werkstatt-Vorarbeit kommt über den Connector.
    const baum = pruefPrompt(METHODEN.find((m) => m.slug === 'baum')!, undefined, 'einfuegen');
    expect(baum).toContain('\nZum Abgleich füge ich auch ein: Experience Map mit Momenten (Äste des Baums) (docs/JOURNEY.md).\n');
    expect(baum).toContain('\nZum Abgleich lies außerdem meinen Produkt-Brief und meine Interviews und Snapshots (Werkzeug artefakt_lesen).\n');
    const hmw = pruefPrompt(METHODEN.find((m) => m.slug === 'hmw')!, undefined, 'einfuegen');
    expect(hmw).toContain('\nZum Abgleich füge ich auch ein: Ziel-Chance mit vier Linsen und Ulwick-Gegenprobe (docs/ZIEL-CHANCE.md).\n');
    expect(hmw).not.toContain(MCP_WERKZEUGE.artefaktLesen);
  });

  it('Einfügen: jede Datei einmal, nichts aus Linear; ohne Ergebnis ein Fehler beim Bauen', () => {
    // Der Pitch braucht Concept, Origin und Usage Story (alle docs/STORYS.md).
    const pitch = METHODEN.find((m) => m.slug === 'pitch')!;
    const p = pruefPrompt(pitch, undefined, 'einfuegen');
    expect(p.split('docs/STORYS.md')).toHaveLength(2);
    // Der Name der ersten Story in braucht steht für die Datei.
    // Alle Storys der Datei unter einem Namen, die Datei einmal.
    const storys = pitch.braucht.map((id) => ARTEFAKTE.find((a) => a.id === id)!).filter((a) => a.pfad === 'docs/STORYS.md').map((a) => a.name);
    expect(storys.length).toBeGreaterThan(1);
    expect(p).toContain(`${storys.slice(0, -1).join(', ')} und ${storys.at(-1)} (docs/STORYS.md)`);
    // Vorarbeit in derselben Datei wie das Ergebnis steht beim Ergebnis (Usage und Concept Story in docs/STORYS.md).
    const us = pruefPrompt(METHODEN.find((m) => m.slug === 'usage-story')!, undefined, 'einfuegen');
    expect(us).toMatch(/: Usage Story des Kernablaufs und Concept Story \(docs\/STORYS\.md\)\. Prüf es/);
    expect(us.split('docs/STORYS.md')).toHaveLength(2);
    // Vorarbeit in Linear: ausdrücklich zum Kopieren.
    const sprint = pruefPrompt(METHODEN.find((m) => m.slug === 'sprint')!, undefined, 'einfuegen');
    expect(sprint).toContain('\nAus Linear kopiere ich zum Abgleich Issues geschnitten und quer gelesen dazu (Kennung, Titel und Text jedes Issues).\n');
    // Akzeptanzkriterien mit einem Ergebnis in einer Datei: die Issues kommen als Kopie aus Linear, nie als Datei.
    const ak = METHODEN.find((m) => m.slug === 'akzeptanzkriterien')!;
    expect(pruefPrompt({ ...ak, ergibt: ['team'] }, undefined, 'einfuegen')).toMatch(/\nAus Linear kopiere ich zum Abgleich Backlog aus Issues dazu/);
    expect(() => pruefPrompt({ ...pitch, ergibt: [] }, undefined, 'einfuegen')).toThrow(/keinen Weg zum Einfügen/);
  });

  it('wer in der Prüfliste ein früheres Artefakt nennt, hat es in „braucht“ – sonst liest Claude es beim Prüfen nicht', () => {
    const namen: Record<string, string> = {
      'Annahmen-Map': 'annahmen', Synthese: 'synthese', Kundenprofil: 'profil', 'Experience Map': 'journey',
      'Value Map': 'valuemap', 'Story Map': 'storymap', Entscheidungslog: 'entscheidungen',
    };
    for (const m of METHODEN.filter((x) => x.pruefliste)) {
      const text = m.pruefliste!.map((p) => p.text).join(' ');
      for (const [name, id] of Object.entries(namen)) {
        if (text.includes(name)) expect([...m.braucht, ...m.ergibt], `${m.slug} nennt ${name}`).toContain(id);
      }
    }
  });

  it('Artefakte in Linear liest Claude über den Linear-MCP – nie eine leere Dateiangabe', () => {
    const ak = pruefPrompt(METHODEN.find((m) => m.slug === 'akzeptanzkriterien')!);
    expect(ak).toMatch(/^Lies die Issues über den Linear-MCP/);
    expect(ak).toContain('ändere keine Datei und kein Issue');
    // Teilprüfung in Linear: die Issues nicht ein zweites Mal „zum Abgleich“, Brief und Team schon.
    const sprint = pruefPrompt(METHODEN.find((m) => m.slug === 'akzeptanzkriterien')!, 'über den Linear-MCP die Issues für Sprint 1');
    expect(sprint).toMatch(/^Lies über den Linear-MCP die Issues für Sprint 1\. Zum Abgleich lies auch docs\/TEAM\.md und aus der Werkstatt meinen Produkt-Brief \(Werkzeug artefakt_lesen\)\./);
    for (const m of METHODEN.filter((x) => x.pruefliste)) expect(pruefPrompt(m), m.slug).not.toMatch(/^Lies \./);
  });

  it('der Sprint wird am Sprint-Protokoll geprüft, mit Issues, Team und Brief zum Abgleich', () => {
    const sp = pruefPrompt(METHODEN.find((m) => m.slug === 'sprint')!);
    expect(sp).toMatch(/^Lies docs\/SPRINTS\.md\. Zum Abgleich lies auch die Issues über den Linear-MCP .*, docs\/TEAM\.md und aus der Werkstatt meinen Produkt-Brief \(Werkzeug artefakt_lesen\)\./);
    // Geschnittene Issues, Issues und Kriterien liegen alle in Linear: einmal lesen, nicht dreimal.
    const sch = pruefPrompt(METHODEN.find((m) => m.slug === 'schneiden')!);
    expect(sch.split('Linear-MCP').length - 1).toBe(1);
    expect(sch).not.toContain('Zum Abgleich');
  });

  it('der Pitch wird an docs/PITCH.md geprüft, gegen alle Quellen seiner Belege, jede Datei einmal', () => {
    const pi = pruefPrompt(METHODEN.find((m) => m.slug === 'pitch')!);
    expect(pi).toMatch(/^Lies docs\/PITCH\.md\. Zum Abgleich lies auch docs\/KUNDENPROFIL\.md, docs\/VALUE-MAP\.md, docs\/STORYS\.md, docs\/EXPERIMENTE\.md, docs\/GESCHAEFTSMODELL\.md, docs\/TESTS\.md, docs\/SPRINTS\.md und aus der Werkstatt meinen Produkt-Brief und mein Entscheidungslog \(Werkzeug artefakt_lesen\)\. /);
    // Die Prüfliste verlangt alle vier Raster-Felder mit Beleg aus Kundenprofil oder Value Map, ein Sicherheits-Wort wie in
    // den Lernkarten (E1, E2) und die Outcome-Zahlen – darum liest Claude Profil, Value Map, Experimente und Tests mit.
    const pitch = METHODEN.find((m) => m.slug === 'pitch')!;
    const liste = pitch.pruefliste!.map((p) => p.text).join(' ');
    expect(liste).toMatch(/wegfällt, weniger wird, mehr wird und neu ist/);
    expect(liste).toMatch(/ID aus dem Kundenprofil oder einem Verweis auf die Value Map/);
    expect(liste).toMatch(/ein Wort dazu, wie sicher sie ist/);
    expect(liste).toMatch(/Zahlen der Outcome-Metrik/);
    // vorarbeitLesen (daraus baut die Pitch-Seite den Prompt der Investorin) liefert dieselbe Liste wie der Prüf-Prompt.
    expect(pi).toContain(`Zum Abgleich lies auch ${vorarbeitLesen(pitch, ['docs/PITCH.md']).join(' und ')}. `);
    expect(pitch.braucht).toEqual(expect.arrayContaining(['profil', 'valuemap', 'experimente', 'spike', 'entscheidungen', 'brief']));
  });

  it('jede Tagesseite trägt das Datum aus TAGE als data-kurstag – sonst springt die Jetzt-Markierung am falschen Tag', () => {
    const seiten = TAGE.map((t) => ({ t, url: new URL(`../pages/innolab/tag-${t.n}.astro`, import.meta.url) })).filter((x) => existsSync(x.url));
    // Tagesseiten gibt es lückenlos ab Tag 1 – eine verschwundene Seite soll hier auffallen, nicht still übersprungen werden.
    expect(seiten.map((x) => x.t.n)).toStrictEqual(TAGE.slice(0, seiten.length).map((t) => t.n));
    expect(seiten.length).toBeGreaterThanOrEqual(6);
    for (const { t, url } of seiten) {
      const kurstage = [...readFileSync(url, 'utf8').matchAll(/data-kurstag="([^"]+)"/g)].map((m) => m[1]);
      expect(kurstage, `tag-${t.n}`).toStrictEqual(t.datum ? [t.datum] : []);
    }
  });
});
