// Abschnittsnamen und „welcher Abschnitt ist gerade dran?“ – ohne DOM, damit testbar.
// Genutzt vom Zurück-Knopf und von „Wo ist Markus?“ (wo-ist.ts).

/** Kurz halten: an einer Wortgrenze kürzen, nicht mitten im Wort. */
export function kuerzen(t: string, max = 28): string {
  return t.length <= max ? t : `${t.slice(0, t.lastIndexOf(' ', max)).replace(/[\s–-]+$/, '')} …`;
}

/** Überschriftstext ohne Zeitangabe am Ende („… (10 min)“) und ohne Mehrfach-Leerraum. */
export function ueberschriftText(roh: string): string {
  return roh.replace(/\s+/g, ' ').replace(/\s*\(\d+\s*min\)\s*$/, '').trim();
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

/**
 * Index der Überschrift, in deren Abschnitt die Lesezeile liegt: die letzte, deren Oberkante darüber ist.
 * `tops` sind Oberkanten relativ zum Fenster, in Dokumentreihenfolge. Keine darüber → -1 (Seitenanfang).
 */
export function aktiverAbschnitt(tops: number[], linie: number): number {
  let i = -1;
  tops.forEach((t, j) => { if (t <= linie) i = j; });
  return i;
}
