// Wann eine Annahme mit Belegstufe „getan“ eine Quelle hat. Gemeinsam für verknuepfungen_pruefen und den Hinweis im
// Annahmen-Editor, damit beide dieselbe Regel anwenden (Skala nach Bland wie auf der Methodenseite Annahmen-Map:
// „getan“ = beobachtet, gemessen, bezahlt; ein Interview belegt höchstens „erzählt“).
// Die Regel ist absichtlich schlicht, damit sie sich nicht über Ketten oder Kreise austricksen lässt: Quelle ist nur eine
// Beleg-Notiz, an der Annahme selbst oder an einer Entscheidung, die selbst „getan“ und nicht ersetzt ist. Beleg-IDs
// einer Entscheidung zählen dafür nie (sonst trügen A↔A-Kreise, F-IDs oder Ketten D→D1).
import type { Annahme, Entscheidung, Entscheidungen } from './schemas/index.js';

type Beleg = Pick<Annahme, 'beleg' | 'belegIds' | 'belegNotiz'>;

export const notizGefuellt = (notiz: string | undefined): boolean => (notiz ?? '').trim() !== '';

/** Die D-IDs einer Annahme (Kandidaten für eine Quelle im Entscheidungslog). */
export const entscheidungsIds = (a: Pick<Annahme, 'belegIds'>): string[] => a.belegIds.filter((id) => id.startsWith('D'));

/** Ohne Entscheidungslog (etwa im Editor): Hat die Annahme „getan“ eine eigene Notiz? Andere Stufen: true. */
export function getanHatEigeneQuelle(a: Beleg): boolean {
  return a.beleg !== 'getan' || notizGefuellt(a.belegNotiz);
}

/** Ersetzte Zeile → die Zeile, die sie ersetzt (D1 → D3). Ersetzte Zeilen sind Geschichte. */
export function ersetztDurch(zeilen: readonly Entscheidung[]): Map<string, string> {
  return new Map(zeilen.flatMap((e) => (e.ersetzt ? [[e.ersetzt, e.id] as const] : [])));
}

/** Ist die Entscheidung selbst „getan“ mit Beleg-Notiz (ohne Blick auf „ersetzt“)? */
export const getanMitNotiz = (e: Entscheidung): boolean => e.beleg === 'getan' && notizGefuellt(e.belegNotiz);

/** Trägt diese Entscheidung „getan“ für eine Annahme? Nur selbst „getan“, nicht ersetzt und mit Beleg-Notiz. */
export function entscheidungTraegtGetan(e: Entscheidung, ersetzt: ReadonlyMap<string, string>): boolean {
  return getanMitNotiz(e) && !ersetzt.has(e.id);
}

/** Baut die Prüfung einmal für ein Entscheidungslog (Map statt Suche je ID). */
export function getanQuellePruefer(entscheidungen: Entscheidungen): (a: Beleg) => boolean {
  const zeilen = entscheidungen.entscheidungen;
  const nachId = new Map<string, Entscheidung>(zeilen.map((e) => [e.id, e]));
  const ersetzt = ersetztDurch(zeilen);
  return (a) => getanHatEigeneQuelle(a) || entscheidungsIds(a).some((id) => {
    const e = nachId.get(id);
    return e !== undefined && entscheidungTraegtGetan(e, ersetzt);
  });
}
