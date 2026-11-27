import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ARTEFAKTE as WERKSTATT_ARTEFAKTE, ARTEFAKT_NAMEN } from '../werkstatt/schemas/index.js';
import { MCP_WERKZEUGE } from '../werkstatt/vertrag.js';
import { MOM_TEST_GRUPPE, NACH_MOM_TEST } from './innolab-zeiten';
import { type Methode, ARTEFAKTE, METHODEN, NACHFRAGE_BELEGE, miroErgebnisBilder, miroVorarbeitBilder, ORTE, TAGE, WERKSTATT_AKKUSATIV, danachEntscheiden, einfuegenHinweis, einfuegenMoeglich, erzeugtVon, methodenVonTag, pruefChecklisteId, miroBildAusschnitt, pruefPrompt, pruefungAufMiro, pruefungInWerkstatt, vorarbeitLesen } from './methoden';

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

  it('jedes Artefakt außer dem Pitch wird später weiterverwendet – keine toten Enden (stillgelegte ausgenommen)', () => {
    for (const id of artefaktIds.filter((x) => x !== 'pitch' && !erzeugtVon(x)?.stillgelegt)) {
      expect(METHODEN.some((m) => m.braucht.includes(id)), id).toBe(true);
    }
  });

  // NDU-70: Das Entscheidungslog ist in diesem Kursjahr stillgelegt – keine Methode baut darauf auf, und es steht in
  // keiner Liste der Methoden eines Tages (Toolbox, tag_stand). Die Methode selbst bleibt für die Seite und alte Links.
  it('stillgelegt ist nur das Entscheidungslog; niemand braucht es, kein Tag listet es', () => {
    expect(METHODEN.filter((m) => m.stillgelegt).map((m) => m.slug)).toStrictEqual(['entscheidungslog']);
    expect(METHODEN.filter((m) => m.braucht.includes('entscheidungen')).map((m) => m.slug)).toStrictEqual([]);
    expect(methodenVonTag(1).map((m) => m.slug)).toStrictEqual(['problem-rahmen', 'annahmen', 'interview']);
    for (const t of TAGE) expect(methodenVonTag(t.n).filter((m) => m.stillgelegt), `Tag ${t.n}`).toStrictEqual([]);
  });

  it('Kurstage laufen aufsteigend von 1 bis 6 – an Tag 6 kommt nur noch der Pitch dazu, Tag 7 ist die Präsentation –, Orte sind bekannt', () => {
    const tage = METHODEN.map((m) => m.tag);
    expect(tage).toEqual([...tage].sort((a, b) => a - b));
    expect(tage[0]).toBe(1);
    for (const t of tage) expect(t).toBeLessThanOrEqual(6);
    // Tag 6 ist Bautag: Die einzige Methode dort ist der Pitch, nach Review und Retro.
    expect(METHODEN.filter((m) => m.tag === 6).map((m) => m.slug)).toStrictEqual(['pitch']);
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
      // Live-Test 11.11.: Claude ordnet Zitate nicht selbst ein, sondern fragt.
      expect(t).toContain('Ordne nichts für mich ein: Zeig die Stelle und frag, wofür oder wogegen sie spricht – sag es nicht selbst.');
    }
    expect(METHODEN.filter((m) => pruefungInWerkstatt(m)).map((m) => m.slug)).toStrictEqual(['problem-rahmen', 'entscheidungslog', 'annahmen', 'interview', 'synthese']);
    // Mit Pfad bleibt es die Prüfung einer Datei; die Vorarbeit kommt weiter aus der Werkstatt.
    expect(pruefungInWerkstatt(METHODEN.find((m) => m.slug === 'entscheidungslog')!, 'notizen/alt.md')).toBe(false);
    expect(pruefPrompt(METHODEN.find((m) => m.slug === 'entscheidungslog')!, 'notizen/alt.md')).toMatch(/^Lies notizen\/alt\.md\. Zum Abgleich lies auch aus der Werkstatt meinen Produkt-Brief \(Werkzeug artefakt_lesen\)\. /);
  });

  it('Prüf-Prompt: jeder Weg ordnet nicht ein; die Frage nach der Belegstufe nur bei der Synthese', () => {
    const frage = 'Bei synthese-beleg-nachgetragen: Nenn Zitate, die bei keiner Annahme als Beleg stehen, aber das Thema einer Annahme berühren (Annahme nur per ID), und frag, ob und wofür oder wogegen sie sprechen. Frag bei jedem Zitat, zu dem du eine Rückfrage stellst, ob es eine konkrete Begebenheit erzählt oder eine allgemeine Aussage ist – welche Belegstufe passt?';
    const synthese = METHODEN.find((m) => m.slug === 'synthese')!;
    expect(pruefPrompt(synthese)).toContain(frage);
    expect(pruefPrompt(synthese, 'docs/interviews/I2.md')).toContain(frage);
    for (const m of METHODEN.filter((x) => x.pruefliste)) {
      const p = pruefPrompt(m);
      expect(p, m.slug).toMatch(/\nRegeln: Zitier die Stelle, um die es geht\. Nenn höchstens drei Befunde, die wichtigsten zuerst\. Ordne nichts für mich ein: Zeig die Stelle und frag, wofür oder wogegen sie spricht – sag es nicht selbst\. /);
      if (m.slug !== 'synthese') expect(p, m.slug).not.toMatch(/Belegstufe/);
    }
  });

  it('methodenVonTag liefert die Methoden eines Tags in Kursreihenfolge', () => {
    // Plan seit 12.11.2026: Tag 2 endete nach der Experience Map; Tag 3 beginnt (seit 19.11.) mit „Experience Map nachschärfen“, dann der Baum.
    expect(methodenVonTag(2).map((m) => m.slug)).toEqual(['synthese', 'journey-map']);
    expect(methodenVonTag(3)[0].slug).toBe('baum');
    expect(methodenVonTag(6).map((m) => m.slug)).toEqual(['pitch']);
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
      'synthese-snapshot', 'synthese-chance-beduerfnis', 'synthese-einsichten', 'synthese-pseudonym', 'synthese-beleg-nachgetragen', 'synthese-belege',
      'journey-map-geschichten', 'journey-map-erleben', 'journey-map-umwege', 'journey-map-momente-getrennt', 'journey-map-worte-belegt', 'journey-map-hoehepunkt-ende',
      'baum-chance-beduerfnis', 'baum-belegt', 'baum-ein-elternteil', 'baum-kind-teil', 'baum-stapel', 'baum-konkret',
      'ziel-chance-geschwister', 'ziel-chance-blatt', 'ziel-chance-linsen', 'ziel-chance-belegt', 'ziel-chance-ulwick', 'ziel-chance-begruendung',
      'hmw-wie-koennten', 'hmw-loesung', 'hmw-reichweite', 'hmw-kundensicht', 'hmw-auswahl',
      'ideation-menge', 'ideation-aussortiert', 'ideation-drei', 'ideation-verschieden', 'ideation-claude',
      'kundenprofil-segment', 'kundenprofil-jobs', 'kundenprofil-sozial-emotional', 'kundenprofil-konkret', 'kundenprofil-produkt', 'kundenprofil-ziel-chance', 'kundenprofil-geordnet',
      'value-map-lueckensatz', 'value-map-segment', 'value-map-fit-vergleich', 'value-map-wahl', 'value-map-wirkung', 'value-map-geordnet', 'value-map-adressiert', 'value-map-fragezeichen',
      'concept-story-stationen', 'concept-story-produkt', 'concept-story-krise', 'concept-story-hoehepunkt', 'concept-story-linie', 'concept-story-fallend', 'concept-story-ende',
      'geschaeftsmodell-verweise', 'geschaeftsmodell-wert', 'geschaeftsmodell-kosten', 'geschaeftsmodell-muster', 'geschaeftsmodell-annahme', 'geschaeftsmodell-widerspruch',
      'experiment-annahmen-arten', 'experiment-eine-annahme', 'experiment-wer-wo-was', 'experiment-schwelle', 'experiment-schnellster', 'experiment-danach', 'experiment-origin', 'experiment-lernkarte',
      'story-map-rahmen', 'story-map-schritte', 'story-map-erzaehlbar', 'story-map-alternativen', 'story-map-slice-ziel', 'story-map-slice-durchgehend', 'story-map-kein-software',
      'usage-story-person', 'usage-story-ausloeser', 'usage-story-schritte', 'usage-story-krise', 'usage-story-hoehepunkt', 'usage-story-nach-gipfel', 'usage-story-ende',
      'prototyp-spike-skizzen', 'prototyp-spike-branch', 'prototyp-spike-kriterien', 'prototyp-spike-karte', 'prototyp-spike-aufgabe', 'prototyp-spike-trockenlauf', 'prototyp-spike-protokoll', 'prototyp-spike-lernkarte',
      'scrum-produkte', 'scrum-rollen', 'scrum-termine', 'scrum-dod', 'scrum-dod-messung', 'scrum-abweichungen', 'scrum-lego',
      'backlog-herkunft', 'backlog-titel-ziel', 'backlog-senkrecht', 'backlog-nicht-im-umfang', 'backlog-reihenfolge', 'backlog-erzaehlt',
      'akzeptanzkriterien-szenario', 'akzeptanzkriterien-gegeben-zustand', 'akzeptanzkriterien-grenzfall', 'akzeptanzkriterien-kein-bau', 'akzeptanzkriterien-zeigbar', 'akzeptanzkriterien-ki',
      'schneiden-plan-check', 'schneiden-ein-durchgang', 'schneiden-entscheidung', 'schneiden-spike', 'schneiden-gesehen',
      'sprint-ziel', 'sprint-auswahl', 'sprint-nicht-mehr', 'sprint-beleg', 'sprint-review', 'sprint-retro', 'sprint-retro-kurz',
      'pitch-einstieg', 'pitch-demo', 'pitch-belege', 'pitch-gescheitert', 'pitch-outcome', 'pitch-position', 'pitch-pitch-satz', 'pitch-geschaeftsmodell',
    ];
    // Ein Sprint statt zwei: kein „gestriges Wetter“ aus Sprint 1 und keine kurze Retro von Sprint 2 mehr.
    // 19.11.2026: Ulwick nur noch Theorie (keine Rechnung); der Lückensatz gehört seitdem zur Ideation (ideation-drei).
    // 25.11.2026 (NDU-72): Lego4Scrum dieses Kursjahr stillgelegt.
    // 26.11.2026: Geschäftsmodell ohne Musterkarten-Runde (Karten nur noch zum Nachschlagen).
    // 26.11.2026 nachts: Prototyp auf Papier statt Spike – kein Branch, kein Link an Tag 4 (gebaut wird an Tag 5).
    const GESTRICHEN: string[] = ['sprint-nicht-mehr', 'sprint-retro-kurz', 'ziel-chance-ulwick', 'value-map-lueckensatz', 'scrum-lego', 'geschaeftsmodell-muster', 'prototyp-spike-branch'];
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
      'synthese-pseudonym': /Pseudonym/, 'synthese-beleg-nachgetragen': /Beleg nachgetragen/, 'synthese-belege': /Zitat-ID als Beleg/,
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
      ['il-experiment-2', 'il-prototyp-spike-3', 'il-scrum-2', 'il-sprint-2', 'il-backlog-2', 'il-akzeptanzkriterien-2', 'il-schneiden-2', 'il-pitch-2'],
    );
    const ids = METHODEN.map(pruefChecklisteId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('der Prüf-Prompt nennt das Ergebnis und zum Abgleich die Vorarbeit, jede nur einmal', () => {
    // Entscheidung 39 (21.11.2026): Tag 3 liegt ganz auf Miro – das Kundenprofil wird an einem Bild seines Canvas-Frames
    // geprüft; Baum und Ziel-Chance (T3 · 1) kommen als Bilder dazu, keine Datei in docs/.
    const kp = pruefPrompt(METHODEN.find((m) => m.slug === 'kundenprofil')!);
    expect(kp).toMatch(/^Unter diese Nachricht füge ich ein Bild meines Ergebnisses aus Miro ein: Kundenprofil \(Jobs, Pains, Gains\), je Spalte geordnet \(Frame „T3 · 4 · Canvas · Produkt n“\)\. Prüf es gegen diese Prüfliste \(Kundenprofil\):\n/);
    // Der Baum liegt nur auf Miro (seit 11.11.2026): Claude bekommt ihn als Bild, nicht als Datei.
    expect(kp).toContain('\nZum Abgleich füge ich auch zwei Bilder aus Miro ein: Opportunity Solution Tree (Chancen unter den Momenten) (Frame „Baum · Produkt n“) und Ziel-Chance mit vier Linsen (Frame „T3 · 1 · Ziel-Chance“).\n');
    expect(kp).toContain('\nZum Abgleich lies außerdem meine Interviews und Snapshots (Werkzeug artefakt_lesen).\n');
    expect(kp).not.toMatch(/docs\//);
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
    expect(ohne).toStrictEqual([
      ...mitListe.filter((m) => pruefungInWerkstatt(m)).map((m) => m.slug),
      ...mitListe.filter((m) => pruefungAufMiro(m)).map((m) => m.slug),
      'backlog', 'akzeptanzkriterien', 'schneiden',
    ]);
    for (const m of mitListe.filter((x) => einfuegenMoeglich(x))) {
      expect(pruefPrompt(m), m.slug).toMatch(/^Lies /);
      const p = pruefPrompt(m, undefined, 'einfuegen');
      // „oder Text aus Miro“ nur, wo das Ergebnis auch auf Miro liegt – im Prompt und im Hinweis darunter.
      const miro = m.ergibt.some((id) => ARTEFAKTE.find((a) => a.id === id)!.lebtIn.includes('miro'));
      expect(p, m.slug).toMatch(miro ? /^Unter diese Nachricht füge ich mein Ergebnis ein \(Inhalt der Datei(?:en)? oder Text aus Miro\): / : /^Unter diese Nachricht füge ich mein Ergebnis ein \(Inhalt der Datei(?:en)?\): /);
      expect(einfuegenHinweis(m).includes('Miro'), m.slug).toBe(miro);
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
    // Nur ein Teil (pfad): eine Datei, kein Miro – auch wenn das ganze Ergebnis auf Miro liegt.
    expect(einfuegenHinweis(METHODEN.find((m) => m.slug === 'baum')!, 'docs/X.md')).toBe('Prompt in ein Gespräch mit Claude einfügen, darunter den Inhalt der Datei aus eurem Repo – und jeden weiteren Text, den der Prompt zum Abgleich nennt.');
    // Story Map liegt seit dem Nachtrag 26.11.2026 nur auf Miro (eigene Spalte in T4 · 1): kein Einfügen als Text, sondern ein
    // Bild; Vorarbeit nur auf Miro als weitere Bilder, Werkstatt-Vorarbeit über den Connector.
    const sm = METHODEN.find((m) => m.slug === 'story-map')!;
    expect(einfuegenMoeglich(sm)).toBe(false);
    const smp = pruefPrompt(sm);
    expect(smp).toMatch(/^Unter diese Nachricht füge ich ein Bild meines Ergebnisses aus Miro ein: Story Map mit Slice 1 \(Frame „T4 · 1 · Story Map“\)\. Prüf es/);
    // Kundenprofil und Value Map teilen den Canvas: ein Bild; der Ideen-Vergleich der Value Map ist ein eigenes.
    expect(smp).toContain('\nZum Abgleich füge ich auch drei Bilder aus Miro ein: Kundenprofil (Jobs, Pains, Gains), je Spalte geordnet und Spitzenreiter mit Value Map und Fit (Frame „T3 · 4 · Canvas · Produkt n“), Spitzenreiter mit Value Map und Fit (Feld „Ideen vergleichen und wählen“ im Frame „T3 · 4 · Kundenprofil & Value Map“) und Experience Map mit Momenten (Äste des Baums) (Frame „T2 · 1 · Experience Map“).\n');
    expect(smp).toContain('\nZum Abgleich lies außerdem meinen Produkt-Brief und meine Annahmen-Map (Werkzeug artefakt_lesen).\n');
    expect(miroErgebnisBilder(sm).map((b) => b.ausschnitt)).toStrictEqual(['eure Spalte im Frame „T4 · 1 · Story Map“']);
    // Entscheidung 39: Kein Prüf-Prompt nennt eine Tag-3-Datei – die Ergebnisse von Tag 3 liegen auf Miro.
    for (const m of METHODEN.filter((x) => x.pruefliste)) {
      for (const weg of ['standard', 'einfuegen'] as const) {
        if (weg === 'einfuegen' && !einfuegenMoeglich(m)) continue;
        expect(pruefPrompt(m, undefined, weg), `${m.slug} ${weg}`).not.toMatch(/ZIEL-CHANCE\.md|KUNDENPROFIL\.md|HMW\.md|IDEEN\.md|VALUE-MAP\.md/);
      }
    }
  });

  // Code-Review 21.11.: je Ort ein Bild, durchgezählt; kein Frame doppelt (Kundenprofil und Value Map teilen den Canvas);
  // der Ideen-Vergleich der Value Map (Prüfpunkte -vergleich, -wahl, -fragezeichen) ist ein eigenes Bild aus T3 · 4.
  it('Miro-Bilder: Value Map mit Canvas und Feld in T3 · 4, Vorarbeit ohne den eigenen Frame, kein Frame doppelt', () => {
    const vm = METHODEN.find((m) => m.slug === 'value-map')!;
    expect(miroErgebnisBilder(vm).map((b) => b.ort)).toStrictEqual(['Frame „T3 · 4 · Canvas · Produkt n“', 'Feld „Ideen vergleichen und wählen“ im Frame „T3 · 4 · Kundenprofil & Value Map“']);
    expect(miroVorarbeitBilder(vm).map((b) => b.ort)).toStrictEqual(['Frame „T3 · 3 · Ideation“']);
    const kp = METHODEN.find((m) => m.slug === 'kundenprofil')!;
    expect(miroErgebnisBilder(kp).map((b) => b.ausschnitt)).toStrictEqual(['euren Frame „T3 · 4 · Canvas · Produkt n“']);
    expect(miroVorarbeitBilder(kp).map((b) => b.ausschnitt)).toStrictEqual(['euren Frame „Baum · Produkt n“', 'eure Spalte im Frame „T3 · 1 · Ziel-Chance“']);
    // Ideation braucht HMW und Kundenprofil: zwei Bilder zum Abgleich, keins davon ist der eigene Frame T3 · 3.
    const id = METHODEN.find((m) => m.slug === 'ideation')!;
    expect(miroErgebnisBilder(id).map((b) => b.ausschnitt)).toStrictEqual(['eure Spalte im Frame „T3 · 3 · Ideation“']);
    expect(miroVorarbeitBilder(id).map((b) => b.ausschnitt)).toStrictEqual(['eure Spalte im Frame „T3 · 2 · How Might We“', 'euren Frame „T3 · 4 · Canvas · Produkt n“']);
    const p = pruefPrompt(vm);
    expect(p).toMatch(/^Unter diese Nachricht füge ich zwei Bilder meines Ergebnisses aus Miro ein: Spitzenreiter mit Value Map und Fit \(Frame „T3 · 4 · Canvas · Produkt n“ und Feld „Ideen vergleichen und wählen“ im Frame „T3 · 4 · Kundenprofil & Value Map“\)\. Prüf es/);
    expect(p).toContain('\nZum Abgleich füge ich auch ein Bild aus Miro ein: Drei Ideen für die Ziel-Chance, je als Lückensatz (Frame „T3 · 3 · Ideation“).\n');
    for (const m of METHODEN.filter((x) => x.pruefliste)) {
      for (const weg of ['standard', 'einfuegen'] as const) {
        if (weg === 'einfuegen' && !einfuegenMoeglich(m)) continue;
        const q = pruefPrompt(m, undefined, weg);
        for (const f of [...q.matchAll(/Frame „([^“]+)“/g)].map((x) => x[1])) expect(q.split(`Frame „${f}“`).length - 1, `${m.slug} ${weg}: ${f}`).toBe(1);
      }
    }
    // Prüflisten von Tag 3 ohne Etikett „Kursregel“.
    for (const m of METHODEN.filter((x) => x.tag === 3 && x.pruefliste)) expect(m.pruefliste!.map((x) => x.text).join(' '), m.slug).not.toMatch(/Kursregel/);
  });

  // „Danach entscheidet ihr“ (ClaudePruefung.astro): Nachfragen nach Belegen nur beim Prüfen auf Miro. Bei
  // artefakt_pruefen zitiert Claude die Vorarbeit nie (Server-Anweisung, Regel 5), darum dort keine Nachfrage.
  it('Danach: Nachfrage nach Belegen nur bei Experience Map und Baum, nicht in Werkstatt oder Repo', () => {
    const methode = (slug: string) => METHODEN.find((m) => m.slug === slug)!;
    const text = (m: Methode, pfad?: string) => danachEntscheiden(m, pfad).join('\n');
    for (const slug of ['journey-map', 'baum']) {
      const d = text(methode(slug));
      expect(d, slug).toContain(NACHFRAGE_BELEGE);
      expect(d, slug).toContain('schreibt ihr selbst');
      expect(d, slug).toMatch(/„Passt alles“: weiter/);
      expect(d, slug).toContain('auf Miro ändern');
    }
    expect(pruefungInWerkstatt(methode('annahmen'))).toBe(true);
    expect(text(methode('annahmen'))).toContain('in der Werkstatt („Bearbeiten“, speichern)');
    // Außerhalb von Miro (auch Hausaufgaben-Prüfungen): keine Nachfrage, keine Aufteilung „im Kurs“.
    const ohneMiro = METHODEN.filter((m) => m.pruefliste && !pruefungAufMiro(m));
    expect(ohneMiro.length).toBeGreaterThan(5);
    for (const m of ohneMiro) {
      expect(text(m), m.slug).not.toMatch(/Nachfragen|Interviewstelle|Zeig mir/);
      expect(text(m), m.slug).not.toMatch(/im Kurs|Kurstag/i);
      expect(text(m), m.slug).toMatch(/„Passt alles“: weiter/);
    }
    // Nur ein Teil (pfad): Datei, also auch keine Nachfrage.
    expect(text(methode('baum'), 'docs/X.md')).not.toContain(NACHFRAGE_BELEGE);
    // Kein Entscheidungslog mehr (für diesen Kurs stillgelegt, Entscheidung 30, NDU-70): Wer einen Befund nicht übernimmt,
    // begründet es in einem Satz – in Werkstatt, Repo und auf Miro.
    for (const m of METHODEN.filter((x) => x.pruefliste)) {
      expect(text(m), m.slug).not.toMatch(/Entscheidungslog|ins Log/);
      expect(text(m), m.slug).toContain('Stimmt er nicht oder ist es bewusst so: lassen – und in einem Satz sagen können, warum.');
    }
    for (const s of ['ziel-chance', 'kundenprofil', 'hmw', 'ideation', 'value-map']) {
      expect(text(methode(s)), s).toContain('Stimmt er: selbst auf Miro ändern. Stimmt er nicht oder ist es bewusst so: lassen – und in einem Satz sagen können, warum.');
    }
  });

  // Seit 11.11.2026 liegen Experience Map und Baum nur auf Miro, ohne Datei im Repo: Claude prüft ein Bild des Frames.
  it('Experience Map, Baum und Tag 3: Prüfung an einem Bild aus Miro, nie über eine Datei', () => {
    // Seit 21.11.2026 (Entscheidung 39) auch alle Ergebnisse von Tag 3.
    // Seit dem Nachtrag 26.11.2026 abends auch alles von Tag 4 bis auf Scrum (keine docs-Dateien mehr für Studierende).
    expect(METHODEN.filter((m) => pruefungAufMiro(m)).map((m) => m.slug)).toStrictEqual([
      'journey-map', 'baum', 'ziel-chance', 'kundenprofil', 'hmw', 'ideation', 'value-map',
      'concept-story', 'geschaeftsmodell', 'experiment', 'story-map', 'usage-story', 'prototyp-spike',
    ]);
    for (const s of ['concept-story', 'geschaeftsmodell', 'experiment', 'story-map', 'usage-story', 'prototyp-spike']) {
      const m = METHODEN.find((x) => x.slug === s)!;
      expect(pruefPrompt(m), s).not.toMatch(/^Lies |docs\/|ändere keine Datei/m);
      expect(einfuegenMoeglich(m), s).toBe(false);
    }
    const zc = pruefPrompt(METHODEN.find((m) => m.slug === 'ziel-chance')!);
    expect(zc).toMatch(/^Unter diese Nachricht füge ich ein Bild meines Ergebnisses aus Miro ein: Ziel-Chance mit vier Linsen \(Frame „T3 · 1 · Ziel-Chance“\)\. Prüf es gegen diese Prüfliste \(Ziel-Chance wählen\):\n/);
    expect(zc).toContain('\nZum Abgleich füge ich auch ein Bild aus Miro ein: Opportunity Solution Tree (Chancen unter den Momenten) (Frame „Baum · Produkt n“).\n');
    expect(miroBildAusschnitt(ARTEFAKTE.find((a) => a.id === 'ziel')!)).toBe('eure Spalte im Frame „T3 · 1 · Ziel-Chance“');
    for (const s of ['ziel-chance', 'kundenprofil', 'hmw', 'ideation', 'value-map']) {
      expect(pruefPrompt(METHODEN.find((m) => m.slug === s)!), s).not.toMatch(/^Lies |docs\/|ändere keine Datei/m);
    }
    const jm = pruefPrompt(METHODEN.find((m) => m.slug === 'journey-map')!);
    expect(jm).toMatch(/^Unter diese Nachricht füge ich ein Bild meines Ergebnisses aus Miro ein: Experience Map mit Momenten \(Äste des Baums\) \(Frame „T2 · 1 · Experience Map“\)\. Prüf es gegen diese Prüfliste \(Experience Map\):\n/);
    expect(jm).toContain('\nZum Abgleich lies außerdem meinen Produkt-Brief und meine Interviews und Snapshots (Werkzeug artefakt_lesen).\n');
    expect(jm).not.toContain('Bild aus Miro ein: ');
    const baum = pruefPrompt(METHODEN.find((m) => m.slug === 'baum')!);
    expect(baum).toMatch(/^Unter diese Nachricht füge ich ein Bild meines Ergebnisses aus Miro ein: Opportunity Solution Tree \(Chancen unter den Momenten\) \(Frame „Baum · Produkt n“\)\./);
    expect(baum).toContain('\nZum Abgleich füge ich auch ein Bild aus Miro ein: Experience Map mit Momenten (Äste des Baums) (Frame „T2 · 1 · Experience Map“).\n');
    for (const p of [jm, baum]) expect(p).not.toMatch(/^Lies |docs\/|ändere keine Datei/m);
    expect(() => pruefPrompt(METHODEN.find((m) => m.slug === 'baum')!, undefined, 'einfuegen')).toThrow(/keinen Weg zum Einfügen/);
    // Mit pfad bleibt es eine Datei.
    expect(pruefungAufMiro(METHODEN.find((m) => m.slug === 'baum')!, 'docs/X.md')).toBe(false);
    // Kein Prüf-Prompt nennt die alten Dateien.
    for (const m of METHODEN.filter((x) => x.pruefliste)) {
      expect(pruefPrompt(m), m.slug).not.toMatch(/JOURNEY\.md|BAUM\.md|ZIEL-CHANCE\.md/);
      if (einfuegenMoeglich(m)) expect(pruefPrompt(m, undefined, 'einfuegen'), m.slug).not.toMatch(/JOURNEY\.md|BAUM\.md|ZIEL-CHANCE\.md/);
    }
  });

  it('Einfügen: jede Datei einmal, nichts aus Linear; ohne Ergebnis ein Fehler beim Bauen', () => {
    // Der Pitch braucht Concept, Origin und Usage Story – seit dem Nachtrag 26.11.2026 als Bilder ihrer Frames, nicht als Datei.
    const pitch = METHODEN.find((m) => m.slug === 'pitch')!;
    const p = pruefPrompt(pitch, undefined, 'einfuegen');
    expect(p).toMatch(/^Unter diese Nachricht füge ich mein Ergebnis ein \(Inhalt der Datei\): Pitch mit Demo und Belegen \(docs\/PITCH\.md\)\. Prüf es/);
    expect(p).not.toMatch(/docs\/(STORYS|EXPERIMENTE|GESCHAEFTSMODELL|STORY-MAP|TESTS)\.md/);
    expect(p).toContain('Concept Story (Frame „T4 · 0 · Concept Story · Produkt n“), Experiment-Karte E1 (Frame „T4 · 0 · Annahmen der Idee“), Origin Story als Text für Aufsteller oder Landingpage (Frame „T4 · 6 · Origin Story · Produkt n“)');
    // Zwei Ergebnisse an zwei Orten (Karte E1 in der eigenen Spalte, Origin Story im eigenen Frame): zwei Bilder.
    const ex = METHODEN.find((m) => m.slug === 'experiment')!;
    expect(pruefPrompt(ex)).toMatch(/^Unter diese Nachricht füge ich zwei Bilder meines Ergebnisses aus Miro ein: Experiment-Karte E1 \(Frame „T4 · 0 · Annahmen der Idee“\) und Origin Story als Text für Aufsteller oder Landingpage \(Frame „T4 · 6 · Origin Story · Produkt n“\)\. Prüf es/);
    expect(miroErgebnisBilder(ex).map((b) => b.ausschnitt)).toStrictEqual(['eure Spalte im Frame „T4 · 0 · Annahmen der Idee“', 'euren Frame „T4 · 6 · Origin Story · Produkt n“']);
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
    // Seit dem Nachtrag 26.11.2026 liegen die Ergebnisse von Tag 4 auf Miro: Datei bleibt nur das Sprint-Protokoll.
    expect(pi).toMatch(/^Lies docs\/PITCH\.md\. Zum Abgleich lies auch docs\/SPRINTS\.md und aus der Werkstatt meinen Produkt-Brief \(Werkzeug artefakt_lesen\)\. /);
    // Kundenprofil und Value Map liegen seit 21.11.2026 auf Miro: als Bild.
    expect(pi).toContain('\nZum Abgleich füge ich auch acht Bilder aus Miro ein: Kundenprofil (Jobs, Pains, Gains), je Spalte geordnet und Spitzenreiter mit Value Map und Fit (Frame „T3 · 4 · Canvas · Produkt n“), Spitzenreiter mit Value Map und Fit (Feld „Ideen vergleichen und wählen“ im Frame „T3 · 4 · Kundenprofil & Value Map“), Concept Story (Frame „T4 · 0 · Concept Story · Produkt n“), ');
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
    expect(pitch.braucht).toEqual(expect.arrayContaining(['profil', 'valuemap', 'experimente', 'spike', 'brief']));
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

  const tagesseite = (n: number) => readFileSync(new URL(`../pages/innolab/tag-${n}.astro`, import.meta.url), 'utf8');
  /** Blöcke des Ablaufs einer Tagesseite: Zeiten in Minuten seit Mitternacht, Titel und Ziel. */
  const bloecke = (n: number) =>
    [...tagesseite(n).matchAll(/<Block time="(\d{2}):(\d{2})–(\d{2}):(\d{2})"[^>]*?title="([^"]+)"(?:[^>]*?href="([^"]+)")?/g)].map((m) => ({
      von: Number(m[1]) * 60 + Number(m[2]), bis: Number(m[3]) * 60 + Number(m[4]), titel: m[5], href: m[6] ?? '',
    }));

  /** Beginn und Ende des Kurstags aus dem Seitenkopf (eyebrow „… · 09:00–17:30“), in Minuten seit Mitternacht. */
  const kopfzeit = (n: number) => {
    const m = tagesseite(n).match(/class="eyebrow">[^<]*?(\d{2}):(\d{2})–(\d{2}):(\d{2})/);
    return m ? [Number(m[1]) * 60 + Number(m[2]), Number(m[3]) * 60 + Number(m[4])] : null;
  };

  it('der Ablauf jeder Tagesseite ist lückenlos und füllt genau die Zeit im Seitenkopf', () => {
    for (const t of TAGE) {
      const b = bloecke(t.n);
      expect(b.length, `tag-${t.n}`).toBeGreaterThan(3);
      for (const [i, x] of b.entries()) {
        expect(x.bis, `tag-${t.n}: ${x.titel}`).toBeGreaterThan(x.von);
        if (i > 0) expect(x.von, `tag-${t.n}: ${x.titel} schließt nicht an ${b[i - 1].titel} an`).toBe(b[i - 1].bis);
      }
      expect(kopfzeit(t.n), `tag-${t.n}: Zeit im Seitenkopf`).toStrictEqual([b[0].von, b.at(-1)!.bis]);
    }
    // Rahmen der Tage nach dem Plan vom 12.11.2026 (Beginn, Ende in Minuten): Tag 6 ganztägig, Tag 7 am 16.01. von 9 bis 12.
    expect(kopfzeit(3)).toStrictEqual([9 * 60, 17 * 60 + 30]);
    expect(kopfzeit(4)).toStrictEqual([9 * 60, 17 * 60 + 30]);
    expect(kopfzeit(5)).toStrictEqual([9 * 60, 17 * 60]);
    expect(kopfzeit(6)).toStrictEqual([9 * 60, 18 * 60]);
    expect(kopfzeit(7)).toStrictEqual([9 * 60, 12 * 60]);
    expect(bloecke(6).find((x) => x.titel === 'Mittagspause')).toMatchObject({ von: 13 * 60, bis: 14 * 60 });
  });

  it('„Weiter“ führt an jedem Kurstag ab Tag 2 durch alle Blöcke des Tages (FooterNav-Kette) und „Zurück“ denselben Weg zurück', () => {
    const seite = (pfad: string) => readFileSync(new URL(`../pages${pfad.split('#')[0]}.astro`, import.meta.url), 'utf8');
    const ziel = (pfad: string, richtung: 'prev' | 'next') => seite(pfad).match(new RegExp(`<FooterNav[^>]*?\\b${richtung}=\\{\\{\\s*href:\\s*'([^']+)'`))?.[1];
    const m = (slug: string) => `/innolab/methoden/${slug}`;
    // Je Kurstag: Start, die Stationen in Kursreihenfolge, zuletzt das Ziel, an dem die Kette den Tag verlässt oder zur Tagesseite zurückkehrt.
    const ketten: string[][] = [
      ['/innolab/tag-2', m('synthese'), m('journey-map'), '/innolab/tag-2/abschluss', '/innolab/tag-3'],
      ['/innolab/tag-3', '/innolab/tag-3/experience-map', m('baum'), m('ziel-chance'), m('kundenprofil'), m('hmw'), m('ideation'), m('value-map'), m('concept-story')],
      // Seit 25.11.2026 (NDU-66): Tag 4 beginnt mit dem Nachholen von Value Map & Fit und der Concept Story.
      ['/innolab/tag-4', m('value-map#vorgehen'), m('concept-story'), m('geschaeftsmodell'), m('experiment'), m('story-map'), m('usage-story'), m('prototyp-spike'), m('scrum')],
      ['/innolab/tag-5', m('scrum#team'), m('backlog'), m('akzeptanzkriterien'), m('schneiden'), m('sprint'), '/innolab/tag-5#stoerfall'],
      ['/innolab/tag-6', '/innolab/tag-7', '/innolab'],
      [m('pitch'), '/innolab/tag-6#pitch-probe'],
    ];
    for (const kette of ketten) {
      for (let i = 0; i + 1 < kette.length; i++) expect(ziel(kette[i], 'next'), `Weiter von ${kette[i]}`).toBe(kette[i + 1]);
    }
    // Zurück: jede Station zeigt auf die davor (Anker der Tagesseite zählen als die Tagesseite).
    const ohneAnker = (p?: string) => p?.replace(/#(debrief|review-retro)$/, '');
    for (const [hier, davor] of [
      [m('journey-map'), m('synthese')], ['/innolab/tag-2/abschluss', m('journey-map')],
      ['/innolab/tag-3/experience-map', '/innolab/tag-3'], [m('baum'), '/innolab/tag-3/experience-map'], [m('ziel-chance'), m('baum')], [m('concept-story'), m('value-map')],
      [m('geschaeftsmodell'), m('concept-story')], [m('experiment'), m('geschaeftsmodell')], [m('story-map'), m('experiment')],
      [m('scrum'), '/innolab/tag-5'], [m('backlog'), m('scrum#team')], [m('sprint'), m('schneiden')],
      [m('pitch'), '/innolab/tag-6'],
    ]) expect(ohneAnker(ziel(hier, 'prev')), `Zurück von ${hier}`).toBe(davor);
    // Scrum steht an zwei Tagen: Der FooterNav am Seitenende gehört zu Tag 5; an Tag 4 führt der Hinweis vor #team zum Abschluss.
    expect(seite(m('scrum'))).toMatch(/Weiter heute: Origin Story und Hausaufgabe[\s\S]*?href="\/innolab\/tag-4#abschluss"[\s\S]*?<h2 id="team">/);
  });

  it('jede Methode ab Tag 2 steht im Ablauf ihres Kurstags mit so vielen Minuten, wie sie dauert', () => {
    // Methoden, die sich einen Block teilen oder über mehrere Blöcke laufen: Ziele der Blöcke und der Kurstag, an dem sie stehen.
    const minuten = (n: number, slug: string) =>
      bloecke(n).filter((x) => x.href.startsWith(`/innolab/methoden/${slug}`)).reduce((summe, x) => summe + (x.bis - x.von), 0);
    for (const m of METHODEN.filter((x) => x.tag >= 2 && x.tag <= 6)) {
      expect(tagesseite(m.tag), `${m.slug} fehlt auf tag-${m.tag}`).toContain(`/innolab/methoden/${m.slug}`);
    }
    // Die Methoden, die am 12.11.2026 den Tag gewechselt haben, mit ihrer vollen Dauer am neuen Tag – und nicht mehr am alten.
    for (const [slug, neu, alt] of [['baum', 3, 2], ['geschaeftsmodell', 4, 3], ['pitch', 6, 5]] as const) {
      const m = METHODEN.find((x) => x.slug === slug)!;
      expect(m.tag, slug).toBe(neu);
      expect(minuten(neu, slug), slug).toBe(m.dauer);
      expect(minuten(alt, slug), slug).toBe(0);
    }
    // Experiment-Karte: 40 Minuten an Tag 4 (seit 27.11.2026; 30 bis dahin), die Origin Story (10 Minuten Input) im Abschluss
    // desselben Tags. Seit 26.11.2026 nachts ohne den Claude-Pro-Block davor (10 min, jetzt an Tag 5 auf der Tagesseite):
    // Die Experiment-Karte beginnt direkt nach dem Geschäftsmodell um 11:00.
    expect(bloecke(4).find((x) => x.titel === 'Experiment-Karte')).toMatchObject({ von: 11 * 60, bis: 11 * 60 + 40 });
    expect(bloecke(4).some((x) => /claude/i.test(x.titel + x.href))).toBe(false);
    expect(bloecke(5).find((x) => x.href === '#claude-pro-jetzt')).toMatchObject({ von: 9 * 60 + 25, bis: 9 * 60 + 40 });
    expect(minuten(4, 'experiment')).toBe(40);
    expect(METHODEN.find((x) => x.slug === 'experiment')!.dauer).toBe(minuten(4, 'experiment'));
    expect(minuten(3, 'experiment')).toBe(0);
    // Concept Story seit 25.11.2026 (NDU-66) an Tag 4: seit 27.11.2026 20 min Theorie (alle Folien), 30 min Schreiben; an Tag 3
    // stand nur der Story-Bogen.
    const cs = METHODEN.find((x) => x.slug === 'concept-story')!;
    expect(cs.tag).toBe(4);
    expect(minuten(4, 'concept-story')).toBe(cs.dauer);
    expect(cs.dauer).toBe(20 + 30);
    expect(bloecke(4).find((x) => x.href.startsWith('/innolab/methoden/concept-story'))).toMatchObject({ von: 9 * 60 + 40, bis: 10 * 60 + 30 });
    // Value Map & Fit an Tag 4 nachgeholt (30 min), die Methode bleibt an Tag 3.
    expect(bloecke(4).find((x) => x.href.startsWith('/innolab/methoden/value-map'))).toMatchObject({ von: 9 * 60 + 5, bis: 9 * 60 + 35 });
    // Story Map 85 min seit 27.11.2026 (65 bis dahin, 75 bis 26.11., davor 105); tag-4-ablauf.test.ts bindet sie an die Timer.
    expect(minuten(4, 'story-map')).toBe(METHODEN.find((x) => x.slug === 'story-map')!.dauer);
    expect(minuten(4, 'story-map')).toBe(85);
    // Prototyp auf Papier 55 min seit 26.11.2026 nachts (Spike 100 bis dahin, 90 davor); Usage Story bleibt 30.
    expect(minuten(4, 'prototyp-spike')).toBe(METHODEN.find((x) => x.slug === 'prototyp-spike')!.dauer);
    expect(minuten(4, 'prototyp-spike')).toBe(55);
    expect(minuten(4, 'usage-story')).toBe(30);
    // Scrum: Agil an Tag 4 (Lego4Scrum seit 25.11.2026 stillgelegt, NDU-72), Teamaufstellung und Definition of Done an Tag 5 – zusammen die Dauer der Methode.
    expect(minuten(4, 'scrum')).toBe(40);
    expect(bloecke(4).some((x) => x.href.includes('#lego'))).toBe(false);
    // Seit Code-Review #459: Claude Pro, Claude Code und Linear (15 min) vor der Teamaufstellung, die darum um 9:40 beginnt.
    expect(bloecke(5).find((x) => x.href === '/innolab/methoden/scrum#team')).toMatchObject({ von: 9 * 60 + 40, bis: 10 * 60 + 20 });
    expect(minuten(4, 'scrum') + minuten(5, 'scrum')).toBe(METHODEN.find((x) => x.slug === 'scrum')!.dauer);
  });
});
