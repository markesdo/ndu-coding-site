// NDU-42: mögliche Fassung in der Oberfläche. Studierende: zu nur ein Satz, offen ein Kasten „Eine mögliche Fassung, nicht
// die richtige“ mit hervorgehobenen Lücken, ohne Kopieren, Übernehmen oder Diff. Lehrende: Text und Stand.
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { faeden } from '../feedback.js';
import type { FassungSicht, FeedbackSichtEintrag } from '../vertrag.js';
import { Faden, LehrendenFeedback } from './Feedback';
import { fassungStandText, fassungStuecke } from './feedback-hilfen';

const D = '2026-11-11T10:00:00.000Z';
const TEXT = 'Wir glauben, dass [Gruppe] morgens [Zahl aus deinen Interviews] Minuten wartet.';
const mit = (fassung: FassungSicht): FeedbackSichtEintrag[] => [{ id: 'FB1', artefakt: 'annahmen', zeilenId: 'A2', von: 'lehrende', autor: 'markus', text: 'Woher stammt die 40?', datum: D, fassung }];
const person = (fassung: FassungSicht) => renderToStaticMarkup(<ul><Faden faden={faeden(mit(fassung), 'annahmen')[0]} neu={false} aendern={async () => true} /></ul>);
const lehrende = (fassung: FassungSicht) => renderToStaticMarkup(<LehrendenFeedback kohorte="2026" person="sofie" name="annahmen" daten={null} eintraege={mit(fassung)} geschrieben={() => {}} />);

describe('Studierende', () => {
  it('zu: nur der Satz, kein Kasten', () => {
    const html = person({ zu: true });
    expect(html).toContain('Überarbeite zuerst selbst – danach siehst du hier eine mögliche Fassung.');
    expect(html).not.toContain('fb-fassung"');
    expect(html).not.toContain('Eine mögliche Fassung, nicht die richtige');
  });

  it('offen: Kasten mit Titel, Lücken hervorgehoben; kein Kopieren, kein Übernehmen', () => {
    const html = person({ zu: false, text: TEXT, aufgedecktAm: D });
    expect(html).toContain('Eine mögliche Fassung, nicht die richtige');
    expect(html).toContain('<mark class="fb-luecke">[Gruppe]</mark>');
    expect(html).toContain('<mark class="fb-luecke">[Zahl aus deinen Interviews]</mark>');
    expect(html).not.toContain('Überarbeite zuerst selbst');
    expect(html).not.toMatch(/kopier|übernehm/i);
    // Knöpfe am Faden bleiben die bisherigen: erledigt und antworten.
    expect([...html.matchAll(/<button[^>]*>(.*?)<\/button>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').trim())).toStrictEqual(['Erledigt', 'Antworten']);
  });

  it('Siegel nicht mehr lesbar: Hinweis statt Text', () => {
    expect(person({ zu: false, unlesbar: true })).toContain('Diese Fassung lässt sich nicht mehr lesen.');
  });
});

describe('Lehrende', () => {
  it('Text und Stand: zu, frei, aufgedeckt am', () => {
    const zu = lehrende({ zu: true, text: TEXT });
    expect(zu).toContain('Mögliche Fassung');
    expect(zu).toContain('<mark class="fb-luecke">[Gruppe]</mark>');
    expect(zu).toContain('zu – öffnet sich, wenn die Person die Zeile überarbeitet oder antwortet');
    expect(lehrende({ zu: false, text: TEXT })).toContain('frei – die Person sieht sie, sobald sie ihr Feedback öffnet');
    expect(lehrende({ zu: false, text: TEXT, aufgedecktAm: '2026-11-12T08:00:00.000Z' })).toContain('aufgedeckt am 12.11.2026');
    // Im Bereich mit data-werkstatt (Beamer blendet ihn aus).
    expect(zu.startsWith('<section class="fb" data-werkstatt="')).toBe(true);
  });

  it('Feld „Mögliche Fassung“ nur an erlaubten Zeilen: zum ganzen Artefakt nicht', () => {
    expect(lehrende({ zu: true, text: TEXT })).not.toContain('Mögliche Fassung (optional');
  });
});

describe('Hilfen', () => {
  it('fassungStuecke: Lücken in eckigen Klammern, Rest unverändert', () => {
    expect(fassungStuecke('A [b] c [d]')).toStrictEqual([
      { text: 'A ', luecke: false }, { text: '[b]', luecke: true }, { text: ' c ', luecke: false }, { text: '[d]', luecke: true },
    ]);
    expect(fassungStuecke('ohne')).toStrictEqual([{ text: 'ohne', luecke: false }]);
    expect(fassungStuecke('[]')).toStrictEqual([{ text: '[]', luecke: false }]);
  });

  it('fassungStandText', () => {
    expect(fassungStandText({ zu: true })).toMatch(/^zu/);
    expect(fassungStandText({ zu: false, aufgedecktAm: '2026-11-12T08:00:00.000Z' })).toBe('aufgedeckt am 12.11.2026');
  });
});
