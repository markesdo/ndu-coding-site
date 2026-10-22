import { describe, expect, it } from 'vitest';
import { MOM_TEST_GRUPPE } from '../../components/innolab-zeiten.js';
import { METHODEN, pruefPrompt } from '../../components/methoden.js';
import { ARTEFAKT_NAMEN } from '../schemas/index.js';
import { kopierText, pruefMethode, pruefPromptFrei, vorarbeitNamen } from './kopiertext.js';

const methode = (slug: string) => METHODEN.find((m) => m.slug === slug)!;
const BRIEF = '**Stand:** 22.10.2026 — Problem-Rahmen, Innolab Tag 1\n\n## 1. Für wen?\nPendlerinnen am Bahnhof\n';
const LEITFADEN = '# Interviewleitfaden\n\n**Stand:** 22.10.2026\n';
const MAP = '# Annahmen\n\n| A1 | … |\n';

describe('kopierText', () => {
  it('ohne Prüf-Prompt nur das Artefakt – keine Prüfliste, kein Prompt (Brief bekommt seine Überschrift)', () => {
    const r = kopierText({ name: 'brief', markdown: BRIEF, mitPrompt: false, frei: true });
    expect(r).toStrictEqual({ text: `# Produkt-Brief\n\n${BRIEF.trim()}\n`, mitPrompt: false, fehlt: [] });
    expect(r.text).not.toMatch(/Prüfliste|problem-rahmen-zielgruppe/);
  });

  it('kein Editor hängt mehr eine Prüfliste an den kopierten Text', () => {
    for (const name of ARTEFAKT_NAMEN) {
      const { text } = kopierText({ name, markdown: '# X\n', mitPrompt: false, frei: true });
      expect(text).toBe('# X\n');
    }
  });

  it('mit Prüf-Prompt: genau der Prompt der Methodenseite, darunter das Artefakt', () => {
    const r = kopierText({ name: 'brief', markdown: BRIEF, mitPrompt: true, frei: true });
    expect(r.mitPrompt).toBe(true);
    expect(r.text).toBe(`${pruefPrompt(methode('problem-rahmen'))}\n\n# Produkt-Brief\n\n${BRIEF.trim()}\n`);
    // Der Prompt sagt Claude, dass der Text darunter folgt – sonst schriebe Claude ihn um.
    expect(r.text).toContain('Ohne Werkstatt-Zugang nimm stattdessen die Texte, die ich unter diese Nachricht einfüge: meinen Produkt-Brief.');
    expect(r.fehlt).toStrictEqual([]);
  });

  it('mit Prüf-Prompt kommt die Vorarbeit in der Reihenfolge des Prompts dazu; was fehlt, steht in fehlt', () => {
    const voll = kopierText({ name: 'leitfaden', markdown: LEITFADEN, mitPrompt: true, frei: true, vorarbeit: { brief: BRIEF, annahmen: MAP } });
    expect(voll.text).toBe(`${pruefPrompt(methode('interview'))}\n\n${LEITFADEN.trim()}\n\n# Produkt-Brief\n\n${BRIEF.trim()}\n\n${MAP.trim()}\n`);
    expect(voll.fehlt).toStrictEqual([]);
    const halb = kopierText({ name: 'leitfaden', markdown: LEITFADEN, mitPrompt: true, frei: true, vorarbeit: { annahmen: MAP } });
    expect(halb.text).not.toContain('# Produkt-Brief');
    expect(halb.fehlt).toStrictEqual(['brief']);
  });

  it('Leitfaden vor dem Mom Test: kein Prompt und keine Prüfliste, auch mit Schalter an', () => {
    const r = kopierText({ name: 'leitfaden', markdown: LEITFADEN, mitPrompt: true, frei: false, vorarbeit: { brief: BRIEF, annahmen: MAP } });
    expect(r).toStrictEqual({ text: LEITFADEN, mitPrompt: false, fehlt: [] });
    for (const p of methode('interview').pruefliste!) {
      expect(r.text).not.toContain(p.id);
      expect(r.text).not.toContain(p.text);
    }
  });
});

describe('pruefPromptFrei', () => {
  const interview = methode('interview');
  const vorher = new Date('2026-10-22T14:44:00Z'); // 16:44 in Wien, eine Minute vor NACH_MOM_TEST

  it('Leitfaden: zu bis zum Aufdecken oder bis NACH_MOM_TEST, für den Präsentator immer', () => {
    expect(pruefPromptFrei(interview, vorher, false)).toBe(false);
    expect(pruefPromptFrei(interview, vorher, false, ['toast'])).toBe(false);
    expect(pruefPromptFrei(interview, vorher, false, [MOM_TEST_GRUPPE])).toBe(true);
    expect(pruefPromptFrei(interview, vorher, true)).toBe(true);
    expect(pruefPromptFrei(interview, new Date('2026-10-22T14:45:00Z'), false)).toBe(true);
  });

  it('Methoden ohne prueflisteNach sind immer frei', () => {
    expect(pruefPromptFrei(methode('problem-rahmen'), vorher, false)).toBe(true);
  });
});

describe('pruefMethode und vorarbeitNamen', () => {
  it('jeder Editor hat einen Prüf-Prompt in der Werkstatt', () => {
    for (const name of ARTEFAKT_NAMEN) expect(pruefMethode(name), name).toBeDefined();
  });

  it('Vorarbeit wie im Prompt genannt', () => {
    expect(vorarbeitNamen('brief')).toStrictEqual([]);
    expect(vorarbeitNamen('leitfaden')).toStrictEqual(['brief', 'annahmen']);
  });
});
