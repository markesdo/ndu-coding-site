// NDU-41: Kriterium am Feedback in der Oberfläche. Lehrende wählen nur passende Kriterien; am Feedback stehen Etikett und
// aufklappbares Kaffeebar-Paar, bei Lehrenden wie bei Studierenden, immer innerhalb von data-werkstatt (Beamer blendet aus).
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { feedbackLeer, feedbackSchreiben, faeden } from '../feedback.js';
import type { FeedbackSichtEintrag as FeedbackEintrag } from '../vertrag.js';
import { kriterium } from '../kriterien.js';
import type { ArtefaktName } from '../schemas/index.js';
import { Faden, LehrendenFeedback } from './Feedback';

const D = '2026-11-11T10:00:00.000Z';
const eintraege = (artefakt: ArtefaktName, zeilenId: string | undefined, krit: string | undefined): FeedbackEintrag[] =>
  // Ohne Fassung sind Einträge der Datei und der API gleich.
  feedbackSchreiben(feedbackLeer(), { artefakt, zeilenId, kriterium: krit, text: 'Was tun Menschen danach anders?', autor: 'markus', datum: D }).eintraege as unknown as FeedbackEintrag[];

const lehrende = (name: ArtefaktName, e: FeedbackEintrag[] = []) =>
  renderToStaticMarkup(<LehrendenFeedback kohorte="2026" person="sofie" name={name} daten={null} eintraege={e} geschrieben={() => {}} />);
// Optionen der Auswahl „Kriterium“ (ohne „Ohne Kriterium“).
const optionen = (html: string) => {
  const auswahl = /<label[^>]*>Kriterium \(optional\)<\/label><select[^>]*>(.*?)<\/select>/.exec(html);
  return auswahl ? [...auswahl[1].matchAll(/<option value="([^"]*)"/g)].map((m) => m[1]).filter((v) => v !== '') : null;
};

describe('Kriterium in der Oberfläche', () => {
  it('Lehrende: Auswahl nur mit den Kriterien, die zum Artefakt passen; ohne passende keine Auswahl', () => {
    expect(optionen(lehrende('leitfaden'))).toStrictEqual(['meinungsfrage', 'verallgemeinerung', 'suggestivfrage']);
    expect(optionen(lehrende('brief'))).toStrictEqual(['output-statt-outcome', 'outcome-nicht-messbar', 'loesung-im-problem', 'zielgruppe-zu-vage', 'zwei-zielgruppen']);
    expect(optionen(lehrende('interviews'))).toBeNull();
  });

  it('am Feedback: Etikett mit Namen und aufklappbares Paar (zu), mit Markierung „für den Katalog formuliert“ und Quelle', () => {
    const k = kriterium('outcome-nicht-messbar')!;
    for (const html of [
      lehrende('brief', eintraege('brief', 'outcome', k.id)),
      renderToStaticMarkup(<ul><Faden faden={faeden(eintraege('brief', 'outcome', k.id), 'brief')[0]} neu aendern={async () => true} /></ul>),
    ]) {
      expect(html).toContain('Kriterium: Outcome nicht messbar');
      expect(html).toMatch(/<details class="fb-paar"><summary>.*Am Beispiel Kaffeebar: schwächer und stärker<\/summary>/);
      expect(html).not.toMatch(/<details[^>]* open/);
      expect(html).toContain(`„${k.paar.schwach.text}“<span class="wk-hilfe"> (für den Katalog formuliert)</span>`);
      expect(html).toContain(`„${k.paar.stark.text}“</dd>`);
      expect(html).toContain(k.paar.warum);
      expect(html).toContain('<a href="/innolab/methoden/problem-rahmen#fehler-2" target="_blank" rel="noreferrer">Problem-Rahmen &amp; Produkt-Brief – Fehler 2: Der Output steckt im Outcome<svg');
      expect(html).toContain('Continuous Discovery Habits');
    }
  });

  it('wörtlich belegte schwache Fassung trägt keine Markierung; Zusatz (Art) steht dabei', () => {
    const html = lehrende('annahmen', eintraege('annahmen', 'A3', 'art-der-annahme'));
    expect(html).toContain('· Art: wünschenswert<span class="wk-hilfe"> (für den Katalog formuliert)</span>');
    expect(html).toContain('· Art: bedienbar</dd>');
    const m = lehrende('leitfaden', eintraege('leitfaden', undefined, 'meinungsfrage'));
    expect(m).toContain('„Findest du die Schlange nervig?“</dd>');
    expect(m).not.toContain('für den Katalog formuliert');
  });

  it('Kursregel steht als eigener Satz bei der Quelle, nur wo es eine gibt', () => {
    const k = kriterium('beleg-ohne-quelle')!;
    expect(lehrende('annahmen', eintraege('annahmen', 'A2', k.id))).toContain(`<span class="fb-kursregel">Kursregel: ${k.quelle.kursregel}</span>`);
    expect(lehrende('brief', eintraege('brief', 'outcome', 'output-statt-outcome'))).not.toContain('Kursregel');
  });

  it('ohne Kriterium oder mit unbekanntem: kein Etikett, kein Paar', () => {
    expect(lehrende('brief', eintraege('brief', 'outcome', undefined))).not.toContain('fb-kriterium');
    const alt: FeedbackEintrag[] = [{ id: 'FB1', artefakt: 'brief', kriterium: 'frueher-mal', von: 'lehrende', autor: 'm', text: 't', datum: D }];
    expect(lehrende('brief', alt)).not.toContain('fb-kriterium');
  });

  it('Quelle: jeder Link öffnet einen neuen Tab und hat einen eigenen Text; summary trägt den Auf/zu-Pfeil', () => {
    const html = lehrende('brief', eintraege('brief', 'problem', 'loesung-im-problem'));
    const links = [...html.matchAll(/<a href="(\/innolab\/[^"]+)"([^>]*)>([^<]*)</g)];
    expect(links.map((l) => l[1])).toStrictEqual(['/innolab/methoden/problem-rahmen#fehler-1', '/innolab/methoden/problem-rahmen#loesungsraum']);
    expect(links.every((l) => l[2] === ' target="_blank" rel="noreferrer"')).toBe(true);
    expect(new Set(links.map((l) => l[3])).size).toBe(2);
    expect(html).toMatch(/<summary><svg[^>]*class="[^"]*fb-paar-pfeil/);
  });

  it('Beamer: alles Feedback samt Paar liegt in einem Bereich mit data-werkstatt', () => {
    const html = lehrende('brief', eintraege('brief', 'outcome', 'output-statt-outcome'));
    expect(html.startsWith('<section class="fb" data-werkstatt="')).toBe(true);
    expect(html.indexOf('fb-paar')).toBeGreaterThan(0);
  });

});
