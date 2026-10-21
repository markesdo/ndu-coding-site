// Abschnittsnamen und „welcher Abschnitt ist gerade dran?“ – bis auf ueberschriftVon ohne DOM, damit testbar.
// Genutzt vom Zurück-Knopf (Layout.astro) und von „Wo ist Markus?“ (wo-ist.ts).

/** Kurz halten: an einer Wortgrenze kürzen, nicht mitten im Wort. */
export function kuerzen(t: string, max = 28): string {
  return t.length <= max ? t : `${t.slice(0, t.lastIndexOf(' ', max)).replace(/[\s–-]+$/, '')} …`;
}

/** Überschriftstext ohne Zeitangabe am Ende („… (10 min)“) und ohne Mehrfach-Leerraum. */
export function ueberschriftText(roh: string): string {
  return roh.replace(/\s+/g, ' ').replace(/\s*\(\d+\s*min\)\s*$/, '').trim();
}

const ENTITAETEN: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', shy: '' };

/** HTML aus einem Seitenquelltext → Text: ohne Tags, Entitäten (&amp;, &#8211; …) aufgelöst, Leerraum zusammengefasst. */
export function textAusHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&(?:#(\d+)|#x([0-9a-f]+)|(\w+));/gi, (m, dez?: string, hex?: string, name?: string) =>
      dez ? String.fromCodePoint(Number(dez)) : hex ? String.fromCodePoint(parseInt(hex, 16)) : (ENTITAETEN[name!.toLowerCase()] ?? m))
    .replace(/\s+/g, ' ')
    .trim();
}

/** Überschrift aus dem Seitenquelltext (inneres HTML des h2/h3) → Text ohne Zeit-Pille und ohne „(10 min)“ am Ende. */
export function ueberschriftAusHtml(html: string): string {
  return ueberschriftText(textAusHtml(html.replace(/<span[^>]*class="pill[^"]*"[^>]*>[\s\S]*?<\/span>/g, '')));
}

/** Text einer Überschrift im Browser, ohne Zeit-Pille. */
export function ueberschriftVon(h: HTMLElement): string {
  const k = h.cloneNode(true) as HTMLElement;
  k.querySelectorAll('.pill').forEach((p) => p.remove());
  return ueberschriftText(k.textContent ?? '');
}

/** Pfad ohne Schrägstrich am Ende – so meldet und vergleicht „Wo ist Markus?“ Seiten. */
export function pfadOhneSchraegstrich(pfad: string): string {
  return pfad.replace(/\/+$/, '') || '/';
}

/** Seitenname aus dem Dokumenttitel: „Tag 1 · Verstehen & Starten · NDU Coding 2026“ → „Tag 1“. */
export function seitenName(titel: string): string {
  return titel.split(' · ')[0].trim();
}

// „Übung 1 · Erste eigene Änderungen“ → „Übung 1“; „5 · Claude Code starten“ → „Schritt 5“; ohne „ · “ gekürzt.
function h2Kurz(h2: string): string {
  const i = h2.indexOf(' · ');
  if (i < 0) return kuerzen(h2);
  const vorn = h2.slice(0, i).trim();
  return /^\d+$/.test(vorn) ? `Schritt ${vorn}` : vorn;
}

/**
 * Name eines Abschnitts aus den Überschriften davor (Texte schon mit ueberschriftText bereinigt):
 * h2 „Übung 1 · …“ + h3 „b) Drei kleine Änderungen“ → „Übung 1 b“; h3 ohne Buchstaben → „Schritt 5 · Im Browser anmelden“.
 * Ein Screenshot-Schritt aus der Präsentation hängt „Bild 5.6“ an.
 */
export function abschnittName(h2?: string, h3?: string, bild?: string): string {
  const teile: string[] = [];
  const kopf = h2 ? h2Kurz(h2) : '';
  const buchstabe = h3?.match(/^([a-z])\)\s*/);
  if (h3 && buchstabe && kopf) teile.push(`${kopf} ${buchstabe[1]}`);
  else {
    if (kopf) teile.push(kopf);
    if (h3) teile.push(kuerzen(h3.replace(/^[a-z]\)\s*/, '')));
  }
  if (bild) teile.push(`Bild ${bild}`);
  return teile.join(' · ');
}

/** Was ueberschriftOberkanten vom DOM braucht (jedes Element erfüllt das), damit es ohne Browser testbar ist. */
export type OberkantenKnoten = {
  getBoundingClientRect(): { top: number };
  closest(selektor: string): { getBoundingClientRect(): { top: number } } | null;
};

/**
 * Oberkanten der Überschriften für aktiverAbschnitt. Im Beamer füllt eine Folie die Höhe und zentriert ihren Inhalt
 * (beamer.css); die erste Überschrift einer kurzen Folie steht dann unter der Lesezeile, und es zählte die Folie davor.
 * Deshalb zählt für die erste der übergebenen Überschriften einer .folie die Oberkante der Folie, für alle anderen die
 * eigene. hs: sichtbare Überschriften in Dokumentreihenfolge – eine ausgeblendete zählt so nicht als „erste“.
 */
export function ueberschriftOberkanten(hs: readonly OberkantenKnoten[]): number[] {
  const gesehen = new Set<unknown>();
  return hs.map((h) => {
    const folie = h.closest('.folie');
    if (!folie || gesehen.has(folie)) return h.getBoundingClientRect().top;
    gesehen.add(folie);
    return folie.getBoundingClientRect().top;
  });
}

/**
 * Index der Überschrift, in deren Abschnitt die Lesezeile liegt: die letzte, deren Oberkante darüber ist.
 * `tops` sind Oberkanten relativ zum Fenster, in Dokumentreihenfolge. Keine darüber → -1 (Seitenanfang).
 */
export function aktiverAbschnitt(tops: number[], linie: number): number {
  let i = -1;
  tops.forEach((t, j) => { if (t <= linie) i = j; });
  return i;
}
