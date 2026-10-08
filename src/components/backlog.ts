// Liest die Issues aus dem Backlog des Template-Repos (Kopie in src/data/backlog.md), damit die
// Issue-Karten auf der Website genau den Text zeigen, der auch in den Repos der Studierenden steht.
export type Issue = {
  nr: number;
  titel: string;
  ziel: string;
  nichtImUmfang: string;
  kriterien: string[];
  fertigWenn: string;
  /** Der ganze Abschnitt als Markdown, zum Kopieren in docs/BACKLOG.md. */
  markdown: string;
};

// „### ⬜ Issue 4 — Gegenstand anbieten“ – das Status-Zeichen davor wird ignoriert.
const KOPF = /^### \S+ Issue (\d+) — (.+)$/;

function feld(zeilen: string[], name: string, nr: number): string {
  const praefix = `**${name}:** `;
  const zeile = zeilen.find(z => z.startsWith(praefix));
  if (!zeile) throw new Error(`Issue ${nr}: Feld „${name}“ fehlt im Backlog.`);
  return zeile.slice(praefix.length).trim();
}

export function issuesLesen(md: string): Map<number, Issue> {
  const issues = new Map<number, Issue>();
  const zeilen = md.split('\n');
  for (let i = 0; i < zeilen.length; i++) {
    const kopf = KOPF.exec(zeilen[i]);
    if (!kopf) continue;
    const nr = Number(kopf[1]);
    // Der Abschnitt endet vor der nächsten Überschrift (### Issue oder ## Abschnitt).
    let ende = i + 1;
    while (ende < zeilen.length && !zeilen[ende].startsWith('#')) ende++;
    const abschnitt = zeilen.slice(i, ende);
    // Jede Zeile ist ein Feld, ein Kriterium oder leer – umgebrochene Zeilen würden sonst still abgeschnitten.
    for (const z of abschnitt.slice(1)) {
      if (z.trim() !== '' && !z.startsWith('**') && !z.startsWith('- ')) {
        throw new Error(`Issue ${nr}: unerwartete Zeile im Backlog (umgebrochen?): „${z.slice(0, 60)}“`);
      }
    }
    const start = abschnitt.indexOf('**Akzeptanzkriterien:**');
    if (start < 0) throw new Error(`Issue ${nr}: „Akzeptanzkriterien“ fehlen im Backlog.`);
    const kriterien: string[] = [];
    for (const z of abschnitt.slice(start + 1)) {
      if (z.startsWith('- ')) kriterien.push(z.slice(2).trim());
      else if (z.trim() !== '') break;
    }
    if (kriterien.length === 0) throw new Error(`Issue ${nr}: keine Akzeptanzkriterien im Backlog.`);
    if (issues.has(nr)) throw new Error(`Issue ${nr} steht zweimal im Backlog.`);
    issues.set(nr, {
      nr,
      titel: kopf[2].trim(),
      ziel: feld(abschnitt, 'Ziel', nr),
      nichtImUmfang: feld(abschnitt, 'Nicht im Umfang', nr),
      kriterien,
      fertigWenn: feld(abschnitt, 'Fertig, wenn', nr),
      markdown: abschnitt.join('\n').trim(),
    });
  }
  return issues;
}

/** Das wenige Markdown im Backlog (`Code`, **fett**) als HTML; alles andere wird escaped. */
export function inlineHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}
