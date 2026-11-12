// Gewählte Nummern („Zwölf Chancen“, Tag 2 Baum): Nach dem Aufdecken markiert die Folie „warum“ die Nummern, die in den
// Sätzen der Runde stehen. Es zählt nur die Zahl ganz am Anfang des Satzes („3 – weil …“, „ 12: …“); „Nr. 3“ oder
// „ich nehme 3“ zählen nicht – lieber keine Markierung als eine falsche. Erlaubt sind 1 bis MAX_NUMMER.
// Reine Logik hier (testbar); gewaehltMarkieren setzt sie im DOM um und wird nur im Browser aufgerufen.

export const MAX_NUMMER = 12;

/** Die Nummer am Satzanfang (1–12), sonst null. */
export function nummerAus(text: string): number | null {
  const m = /^\s*(\d{1,2})\b/.exec(text);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 1 && n <= MAX_NUMMER ? n : null;
}

/** Wie oft jede Nummer gewählt wurde; Sätze ohne gültige Nummer fehlen. */
export function gewaehltZaehlen(texte: readonly string[]): Map<number, number> {
  const z = new Map<number, number>();
  for (const t of texte) {
    const n = nummerAus(t);
    if (n !== null) z.set(n, (z.get(n) ?? 0) + 1);
  }
  return z;
}

/** Markiert in jedem Bereich [data-gewaehlt="<runde>"] die <b> mit gewählter Nummer (Klasse „gewaehlt“, „(gewählt)“ für
 *  Screenreader, „×2“/„×3“ bei Mehrfachwahl). Vorherige Markierungen werden erst entfernt; leere Zählung = alles zurück. */
export function gewaehltMarkieren(doc: ParentNode, runde: string, zaehlung: ReadonlyMap<number, number>): void {
  doc.querySelectorAll<HTMLElement>(`[data-gewaehlt="${runde}"]`).forEach((bereich) => {
    bereich.querySelectorAll('[data-gewaehlt-zusatz]').forEach((x) => x.remove());
    bereich.querySelectorAll<HTMLElement>('b').forEach((b) => {
      b.classList.remove('gewaehlt');
      const n = nummerAus(b.textContent ?? '');
      const anzahl = n === null ? 0 : zaehlung.get(n) ?? 0;
      if (anzahl === 0) return;
      b.classList.add('gewaehlt');
      const sr = document.createElement('span');
      sr.className = 'sr-only';
      sr.dataset.gewaehltZusatz = '';
      sr.textContent = anzahl > 1 ? ` (${anzahl}-mal gewählt)` : ' (gewählt)';
      b.after(sr);
      if (anzahl > 1) {
        const mal = document.createElement('span');
        mal.className = 'gewaehlt-anzahl';
        mal.dataset.gewaehltZusatz = '';
        mal.setAttribute('aria-hidden', 'true');
        mal.textContent = `×${anzahl}`;
        b.after(mal);
      }
    });
  });
}
