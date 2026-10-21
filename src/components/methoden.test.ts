import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ARTEFAKTE as WERKSTATT_ARTEFAKTE, ARTEFAKT_NAMEN } from '../werkstatt/schemas/index.js';
import { MCP_WERKZEUGE } from '../werkstatt/vertrag.js';
import { ARTEFAKTE, METHODEN, ORTE, TAGE, WERKSTATT_AKKUSATIV, erzeugtVon, methodenVonTag, pruefChecklisteId, pruefPrompt, pruefungInWerkstatt } from './methoden';

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

  it('Werkstatt-Artefakte prüft Claude mit artefakt_pruefen, nicht aus docs/ – die Vorarbeit liest es mit artefakt_lesen', () => {
    const pr = pruefPrompt(METHODEN.find((m) => m.slug === 'problem-rahmen')!);
    expect(pr).toMatch(new RegExp(`^Prüf meinen Produkt-Brief mit der Werkstatt \\(Werkzeug ${MCP_WERKZEUGE.artefaktPruefen}\\) gegen diese Prüfliste \\(Problem-Rahmen & Produkt-Brief\\):\n1\. `));
    expect(pr).not.toContain('Zum Abgleich');
    const el = pruefPrompt(METHODEN.find((m) => m.slug === 'entscheidungslog')!);
    expect(el).toMatch(/^Prüf mein Entscheidungslog mit der Werkstatt \(Werkzeug artefakt_pruefen\)/);
    expect(el).toContain(`\nZum Abgleich lies auch meinen Produkt-Brief (Werkzeug ${MCP_WERKZEUGE.artefaktLesen}).\n`);
    const iv = pruefPrompt(METHODEN.find((m) => m.slug === 'interview')!);
    expect(iv).toMatch(/^Prüf meinen Interviewleitfaden mit der Werkstatt \(Werkzeug artefakt_pruefen\)/);
    expect(iv).toContain('Zum Abgleich lies auch meinen Produkt-Brief und meine Annahmen-Map (Werkzeug artefakt_lesen).');
    const an = pruefPrompt(METHODEN.find((m) => m.slug === 'annahmen')!);
    expect(an).toMatch(/^Prüf meine Annahmen-Map mit der Werkstatt/);
    for (const t of [pr, el, iv, an]) {
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

  it('jede Methode mit eigener Seite hat eine Prüfliste mit 3–8 Punkten', () => {
    const mitSeite = METHODEN.filter((m) => existsSync(new URL(`../pages/innolab/methoden/${m.slug}.astro`, import.meta.url)));
    expect(mitSeite.length).toBeGreaterThan(0);
    for (const m of mitSeite) {
      expect(m.pruefliste?.length ?? 0, m.slug).toBeGreaterThanOrEqual(3);
      expect(m.pruefliste!.length, m.slug).toBeLessThanOrEqual(8);
      // Reiner Text: Die Checkliste rendert HTML, der Claude-Prompt kopiert Text – beides soll gleich aussehen.
      for (const p of m.pruefliste!) expect(p, m.slug).not.toMatch(/[<>&]/);
    }
  });

  it('neu geschriebene Prüflisten bekommen eine neue Checklisten-ID – alte Häkchen hängen sonst an neuen Punkten', () => {
    const id = (slug: string) => pruefChecklisteId(METHODEN.find((m) => m.slug === slug)!);
    expect([id('scrum'), id('sprint'), id('backlog')]).toStrictEqual(['il-scrum-2', 'il-sprint-2', 'il-backlog']);
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
    expect(sy).toContain('Zum Abgleich lies auch meinen Interviewleitfaden und meine Annahmen-Map (Werkzeug artefakt_lesen).');
  });

  it('wer in der Prüfliste ein früheres Artefakt nennt, hat es in „braucht“ – sonst liest Claude es beim Prüfen nicht', () => {
    const namen: Record<string, string> = {
      'Annahmen-Map': 'annahmen', Synthese: 'synthese', Kundenprofil: 'profil', 'Experience Map': 'journey',
      'Value Map': 'valuemap', 'Story Map': 'storymap', Entscheidungslog: 'entscheidungen',
    };
    for (const m of METHODEN.filter((x) => x.pruefliste)) {
      const text = m.pruefliste!.join(' ');
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
    expect(pi).toMatch(/^Lies docs\/PITCH\.md\. Zum Abgleich lies auch docs\/STORYS\.md, docs\/GESCHAEFTSMODELL\.md, docs\/TESTS\.md, docs\/SPRINTS\.md und aus der Werkstatt meinen Produkt-Brief und mein Entscheidungslog \(Werkzeug artefakt_lesen\)\. /);
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
