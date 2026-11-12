// Gewählte Nummern („Zwölf Chancen“, Tag 2 Baum): Nach dem Aufdecken markiert die Folie „warum“ die Nummern, die in den
// Sätzen der Runde stehen. Es zählen nur Nummern ganz am Anfang des Satzes – eine oder eine Aufzählung, getrennt durch
// Komma, Semikolon, Punkt, „und“, „&“, „+“ oder Leerzeichen („3 – weil …“, „7 und 12 – …“, „1, 2: …“, „2; 7; 11“, „2. 7. 11.“);
// ein Schrägstrich beendet die Liste („3/5“ zählt nur 3). „Nr. 3“ oder
// „ich nehme 3“ zählen nicht – lieber keine Markierung als eine falsche. Erlaubt sind 1 bis MAX_NUMMER; dieselbe Nummer
// zählt pro Satz einmal. Reine Logik hier (testbar); gewaehltMarkieren setzt sie im DOM um (nur im Browser).

export const MAX_NUMMER = 12;

// Eine Zahl, die nicht direkt an Ziffern oder Buchstaben hängt („123“, „3a“ zählen nicht).
const ZAHL = String.raw`(\d+)(?![\p{L}\d])`;
const ERSTE = new RegExp(String.raw`^\s*${ZAHL}`, 'u');
const WEITERE = new RegExp(String.raw`^(?:\s*(?:,|;|\.|&|\+|und(?![\p{L}\d]))\s*|\s+)${ZAHL}`, 'u');

/** Die Nummern am Satzanfang (je 1–12, ohne Doppelte, in Reihenfolge), sonst []. */
export function nummernAus(text: string): number[] {
  const roh: number[] = [];
  let m = ERSTE.exec(text);
  let rest = text;
  while (m) {
    roh.push(Number(m[1]));
    rest = rest.slice(m[0].length);
    m = WEITERE.exec(rest);
  }
  return [...new Set(roh.filter((n) => n >= 1 && n <= MAX_NUMMER))];
}

/** Die drei Paare der Übung „zwoelf“ (Torres S. 82): je Paar zählt eine Wahl. */
export const ZWOELF_PAARE: readonly (readonly [number, number])[] = [[1, 2], [7, 12], [9, 11]];

/** Höchstens eine Nummer je Paar – die erste, die vorkommt; Nummern außerhalb der Paare bleiben, wie sie sind. */
export function jePaarEine(nummern: readonly number[], paare: readonly (readonly number[])[]): number[] {
  const belegt = new Set<number>();
  return nummern.filter((n) => {
    const i = paare.findIndex((p) => p.includes(n));
    if (i < 0) return true;
    if (belegt.has(i)) return false;
    belegt.add(i);
    return true;
  });
}

/** Wie viele Sätze jede Nummer gewählt haben; Sätze ohne gültige Nummer fehlen. Mit paare: je Paar eine (jePaarEine). */
export function gewaehltZaehlen(texte: readonly string[], paare: readonly (readonly number[])[] = []): Map<number, number> {
  const z = new Map<number, number>();
  for (const t of texte) for (const n of jePaarEine(nummernAus(t), paare)) z.set(n, (z.get(n) ?? 0) + 1);
  return z;
}

/** Fester Schlüssel einer Zählung – gleich, wenn sich nichts geändert hat (dann nicht neu markieren). */
export function gewaehltSchluessel(z: ReadonlyMap<number, number>): string {
  return [...z].sort((a, b) => a[0] - b[0]).map(([n, k]) => `${n}x${k}`).join(',');
}

/** Markiert in jedem Bereich [data-gewaehlt="<runde>"] unter root die <b> mit gewählter Nummer (Klasse „gewaehlt“,
 *  „(gewählt)“ für Screenreader, „×2“/„×3“ bei Mehrfachwahl). Alte Markierungen werden erst entfernt; leere Zählung =
 *  alles zurück. */
export function gewaehltMarkieren(root: ParentNode, runde: string, zaehlung: ReadonlyMap<number, number>): void {
  const doc = (root as Node).ownerDocument ?? (root as Document);
  root.querySelectorAll<HTMLElement>(`[data-gewaehlt="${CSS.escape(runde)}"]`).forEach((bereich) => {
    bereich.querySelectorAll('[data-gewaehlt-zusatz]').forEach((x) => x.remove());
    bereich.querySelectorAll<HTMLElement>('b').forEach((b) => {
      b.classList.remove('gewaehlt');
      const t = (b.textContent ?? '').trim();
      const anzahl = /^\d+$/.test(t) ? zaehlung.get(Number(t)) ?? 0 : 0;
      if (anzahl === 0) return;
      b.classList.add('gewaehlt');
      const sr = doc.createElement('span');
      sr.className = 'sr-only';
      sr.dataset.gewaehltZusatz = '';
      sr.textContent = anzahl > 1 ? ` (${anzahl}-mal gewählt)` : ' (gewählt)';
      b.after(sr);
      if (anzahl > 1) {
        const mal = doc.createElement('span');
        mal.className = 'gewaehlt-anzahl';
        mal.dataset.gewaehltZusatz = '';
        mal.setAttribute('aria-hidden', 'true');
        mal.textContent = `×${anzahl}`;
        b.after(mal);
      }
    });
  });
}
