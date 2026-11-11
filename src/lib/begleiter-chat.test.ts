import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { NOTIZEN } from '../data/begleiter';
import { CHAT_BAUM, CHAT_JOURNEY_MAP, CHAT_NETFLIX, CHAT_SYNTHESE, CHAT_ZWOELF } from '../data/begleiter/chat';

// Tag 2 ist online: Markus kopiert die Schritte jeder Übung im Begleiter in den Teams-Chat (Notiz.chat), ohne den
// Beamer-Modus zu verlassen. Die Karte „Für den Teams-Chat“ im Handout zeigt denselben String aus data/begleiter/chat.ts.
const quelle = (pfad: string) => readFileSync(new URL(pfad, import.meta.url), 'utf8');
const UEBUNGEN = [
  { seite: '/innolab/methoden/synthese', datei: '../pages/innolab/methoden/synthese.astro', name: 'CHAT_SYNTHESE', text: CHAT_SYNTHESE },
  { seite: '/innolab/methoden/journey-map', datei: '../pages/innolab/methoden/journey-map.astro', name: 'CHAT_JOURNEY_MAP', text: CHAT_JOURNEY_MAP },
  { seite: '/innolab/methoden/baum', datei: '../pages/innolab/methoden/baum.astro', name: 'CHAT_BAUM', text: CHAT_BAUM },
];

describe('Text für den Teams-Chat', () => {
  it.each(UEBUNGEN)('$seite#vorgehen: die Notiz trägt den Chat-Text mit allen vier Schritten', ({ seite, text }) => {
    expect(NOTIZEN[seite].vorgehen.chat).toBe(text);
    expect(text.split('\n').filter((z) => /^[1-4]\. /.test(z))).toHaveLength(4);
  });

  it.each(UEBUNGEN)('$seite: die Handout-Karte rendert genau diesen String (eine Quelle)', ({ datei, name }) => {
    const s = quelle(datei);
    const karten = [...s.matchAll(/<Prompt label="Für den Teams-Chat">([\s\S]*?)<\/Prompt>/g)].map((m) => m[1]);
    expect(karten).toStrictEqual([`{${name}}`]);
    expect(s).toMatch(new RegExp(`import \\{ ${name} \\} from '../../../data/begleiter/chat';`));
  });

  it('die Erst-fragen-Folien geben ihre Aufgabe für den Chat mit', () => {
    expect(NOTIZEN['/innolab/methoden/synthese'].geschichte.chat).toBe(CHAT_NETFLIX);
    expect(NOTIZEN['/innolab/methoden/baum'].zwoelf.chat).toBe(CHAT_ZWOELF);
  });

  it('der Begleiter zeigt den Text mit Kopier-Knopf (Copy/Check wie die Prompt-Karte) und kopiert ihn per kopiereText', () => {
    const b = quelle('../pages/innolab/begleiter.astro');
    const kasten = b.match(/\{n\?\.chat && \(([\s\S]*?)\n {14}\)\}/)?.[1] ?? '';
    expect(kasten).toContain('data-chat');
    expect(kasten).toContain('Für den Teams-Chat');
    expect(kasten).toMatch(/<button type="button" class="chat-kopieren" data-chat-kopieren>/);
    expect(kasten).toContain('<Copy class="ico-copy"');
    expect(kasten).toContain('<Check class="ico-done"');
    expect(kasten).toContain('<pre class="chat-text">{n.chat}</pre>');
    expect(b).toMatch(/querySelectorAll<HTMLButtonElement>\('\[data-chat-kopieren\]'\)[\s\S]*?kopiereText\(/);
  });
});
