import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ARTEFAKTE, METHODEN, ORTE, erzeugtVon, methodenVonTag, pruefPrompt } from './methoden';

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
});
