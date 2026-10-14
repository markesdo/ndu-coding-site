import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ARTEFAKTE, METHODEN, ORTE, TAGE, erzeugtVon, methodenVonTag, pruefPrompt } from './methoden';

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

  it('Kurstage laufen aufsteigend von 1 bis 6, Orte sind bekannt', () => {
    const tage = METHODEN.map((m) => m.tag);
    expect(tage).toEqual([...tage].sort((a, b) => a - b));
    expect(tage[0]).toBe(1);
    for (const t of tage) expect(t).toBeLessThanOrEqual(6);
    for (const a of ARTEFAKTE) {
      expect(a.lebtIn.length, a.id).toBeGreaterThan(0);
      for (const o of a.lebtIn) expect(Object.keys(ORTE)).toContain(o);
      if (a.lebtIn.includes('repo') && a.id !== 'inkrement') expect(a.pfad, a.id).toMatch(/^docs\//);
    }
  });

  it('methodenVonTag liefert die Methoden eines Tags in Kursreihenfolge', () => {
    expect(methodenVonTag(2).map((m) => m.slug)).toEqual(['synthese', 'kundenprofil', 'journey-map', 'hmw', 'ideation']);
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

  it('der Prüf-Prompt nennt das Ergebnis und zum Abgleich die Vorarbeit, jede nur einmal', () => {
    const kp = pruefPrompt(METHODEN.find((m) => m.slug === 'kundenprofil')!);
    expect(kp).toMatch(/^Lies docs\/KUNDENPROFIL\.md\. Zum Abgleich lies auch docs\/interviews\/SYNTHESE\.md\./);
    const jm = pruefPrompt(METHODEN.find((m) => m.slug === 'journey-map')!);
    expect(jm).toContain('Zum Abgleich lies auch docs/KUNDENPROFIL.md, docs/interviews/SYNTHESE.md.');
    // Teilprüfung: der Leitfaden statt aller Interview-Dateien, die Vorarbeit bleibt.
    const iv = pruefPrompt(METHODEN.find((m) => m.slug === 'interview')!, 'docs/interviews/LEITFADEN.md');
    expect(iv).toMatch(/^Lies docs\/interviews\/LEITFADEN\.md\. Zum Abgleich lies auch docs\/PRODUKT\.md\./);
    const pr = pruefPrompt(METHODEN.find((m) => m.slug === 'problem-rahmen')!);
    expect(pr).toMatch(/^Lies docs\/PRODUKT\.md\. Prüf es/);
  });

  it('wer in der Prüfliste ein früheres Artefakt nennt, hat es in „braucht“ – sonst liest Claude es beim Prüfen nicht', () => {
    const namen: Record<string, string> = {
      'Annahmen-Map': 'annahmen', Synthese: 'synthese', Kundenprofil: 'profil', 'Journey Map': 'journey',
      'Value Map': 'valuemap', 'Story Map': 'storymap',
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
    expect(sprint).toMatch(/^Lies über den Linear-MCP die Issues für Sprint 1\. Zum Abgleich lies auch docs\/PRODUKT\.md, docs\/TEAM\.md\./);
    for (const m of METHODEN.filter((x) => x.pruefliste)) expect(pruefPrompt(m), m.slug).not.toMatch(/^Lies \./);
  });

  it('der Sprint wird am Sprint-Protokoll geprüft, mit Issues, Team und Brief zum Abgleich', () => {
    const sp = pruefPrompt(METHODEN.find((m) => m.slug === 'sprint')!);
    expect(sp).toMatch(/^Lies docs\/SPRINTS\.md\. Zum Abgleich lies auch die Issues über den Linear-MCP .*, docs\/TEAM\.md, docs\/PRODUKT\.md\./);
    // Schätzung, Issues und Kriterien liegen alle in Linear: einmal lesen, nicht dreimal.
    const sch = pruefPrompt(METHODEN.find((m) => m.slug === 'schaetzen')!);
    expect(sch.split('Linear-MCP').length - 1).toBe(1);
    expect(sch).not.toContain('Zum Abgleich');
  });

  it('der Pitch wird an docs/PITCH.md geprüft, gegen alle Quellen seiner Belege, jede Datei einmal', () => {
    const pi = pruefPrompt(METHODEN.find((m) => m.slug === 'pitch')!);
    expect(pi).toMatch(/^Lies docs\/PITCH\.md\. Zum Abgleich lies auch docs\/PRODUKT\.md, docs\/STORYS\.md, docs\/GESCHAEFTSMODELL\.md, docs\/TESTS\.md, docs\/SPRINTS\.md, docs\/ENTSCHEIDUNGEN\.md\. /);
  });

  it('jede Tagesseite trägt das Datum aus TAGE als data-kurstag – sonst springt die Jetzt-Markierung am falschen Tag', () => {
    const seiten = TAGE.map((t) => ({ t, url: new URL(`../pages/innolab/tag-${t.n}.astro`, import.meta.url) })).filter((x) => existsSync(x.url));
    expect(seiten.length).toBeGreaterThan(0);
    for (const { t, url } of seiten) {
      const kurstage = [...readFileSync(url, 'utf8').matchAll(/data-kurstag="([^"]+)"/g)].map((m) => m[1]);
      expect(kurstage, `tag-${t.n}`).toStrictEqual([t.datum]);
    }
  });
});
