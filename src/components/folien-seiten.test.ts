import { describe, expect, it } from 'vitest';

// Jede Folie trägt ihre Aussage als ganzen Satz (Assertion-Evidence: Überschrift plus Kernsatz, darunter das Bild).
// Der Kernsatz muss sofort sichtbar sein – nicht erst in einer Auflösung, einem verdeckten Schritt oder nur im Handout.
// Sonst steht am Beamer nur die Überschrift da, bis → gedrückt wird, und die Folie wirkt leer.
const seiten = import.meta.glob('../pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

/** Inhalt jeder <Folie …>…</Folie> einer Seite, ohne Auflösungen (die sind vor dem Aufdecken nicht zu sehen). */
function folien(quelle: string): { id: string; sichtbar: string }[] {
  return [...quelle.matchAll(/<Folie\b[^>]*>([\s\S]*?)<\/Folie>/g)].map(([, inhalt]) => ({
    id: inhalt.match(/<h2 id="([^"]+)"/)?.[1] ?? '?',
    sichtbar: inhalt.replace(/<Aufloesung\b[\s\S]*?<\/Aufloesung>/g, ''),
  }));
}

/** Ein sofort sichtbarer Kernsatz: Element mit Klasse folie-satz, nicht als Schritt und nicht nur im Handout. */
const kernsatz = /<(\w+)\b(?![^>]*\bdata-schritt\b)[^>]*\bclass="(?![^"]*\bnur-handout\b)[^"]*\bfolie-satz\b[^"]*"[^>]*>/;

describe('Folien auf den Innolab-Seiten', () => {
  it('es gibt Seiten mit Folien (sonst prüft der Test nichts)', () => {
    expect(Object.values(seiten).some((s) => /<Folie\b/.test(s))).toBe(true);
  });

  it('jede Folie hat einen sofort sichtbaren Kernsatz (.folie-satz außerhalb von Auflösung, Schritt und Handout)', () => {
    const ohne = Object.entries(seiten).flatMap(([pfad, quelle]) =>
      folien(quelle).filter((f) => !kernsatz.test(f.sichtbar)).map((f) => `${pfad.split('pages/')[1]} #${f.id}`),
    );
    expect(ohne).toStrictEqual([]);
  });

  it('erkennt einen Kernsatz, der nur in der Auflösung steht oder erst als Schritt kommt, als fehlend', () => {
    const nurAufgeloest = '<Folie><h2 id="x">X</h2><Aufloesung ab="2026-10-22T10:10"><p class="folie-satz">Pointe</p></Aufloesung></Folie>';
    const alsSchritt = '<Folie><h2 id="y">Y</h2><p class="folie-satz" data-schritt>Später</p></Folie>';
    const gut = '<Folie id="z"><h2 id="z">Z</h2><p class="folie-satz gross">Sofort</p></Folie>';
    expect(folien(nurAufgeloest + alsSchritt + gut).map((f) => kernsatz.test(f.sichtbar))).toStrictEqual([false, false, true]);
  });
});
