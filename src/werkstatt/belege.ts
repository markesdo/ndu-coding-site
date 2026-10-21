// Wann eine Annahme mit Belegstufe „getan“ eine Quelle hat. Gemeinsam für verknuepfungen_pruefen und den Hinweis im
// Annahmen-Editor, damit beide dieselbe Regel anwenden (Skala nach Bland wie auf der Methodenseite Annahmen-Map:
// „getan“ = beobachtet, gemessen, bezahlt; ein Interview belegt höchstens „erzählt“).
import type { Annahme, Entscheidung, Entscheidungen } from './schemas/index.js';

type Beleg = Pick<Annahme, 'id' | 'beleg' | 'belegIds' | 'belegNotiz'>;

const gefuellt = (notiz: string | undefined): boolean => (notiz ?? '').trim() !== '';
const istInterview = (id: string): boolean => id.startsWith('I');
const istEntscheidung = (id: string): boolean => id.startsWith('D');

/** Die D-IDs einer Annahme (Kandidaten für eine Quelle im Entscheidungslog). */
export const entscheidungsIds = (a: Pick<Annahme, 'belegIds'>): string[] => a.belegIds.filter(istEntscheidung);

/**
 * Baut die Prüfung einmal für ein Entscheidungslog (Map statt Suche je ID). Eine Annahme „getan“ hat eine Quelle, wenn
 * - sie eine Beleg-Notiz hat, oder
 * - eine ihrer D-IDs auf eine nicht ersetzte Entscheidung zeigt, die selbst „getan“ ist und eine Quelle nennt: eine
 *   Beleg-Notiz oder eine Beleg-ID, die es gibt (`bekannt`), die kein Interview oder Zitat ist und nicht auf die Annahme
 *   selbst zurückzeigt.
 * Ohne Entscheidungslog (`null`, etwa im Annahmen-Editor) zählt nur die Notiz. Andere Stufen: immer true.
 */
export function getanQuellePruefer(entscheidungen: Entscheidungen | null, bekannt: (id: string) => boolean = () => false): (a: Beleg) => boolean {
  const zeilen = entscheidungen?.entscheidungen ?? [];
  const nachId = new Map<string, Entscheidung>(zeilen.map((e) => [e.id, e]));
  const ersetzt = new Set(zeilen.flatMap((e) => (e.ersetzt ? [e.ersetzt] : [])));
  const daGibt = (id: string) => nachId.has(id) || bekannt(id);
  const traegt = (e: Entscheidung, annahme: string) =>
    e.beleg === 'getan' && !ersetzt.has(e.id) &&
    (gefuellt(e.belegNotiz) || e.belegIds.some((id) => id !== annahme && id !== e.id && !istInterview(id) && daGibt(id)));
  return (a) => {
    if (a.beleg !== 'getan' || gefuellt(a.belegNotiz)) return true;
    return entscheidungsIds(a).some((id) => {
      const e = nachId.get(id);
      return e !== undefined && traegt(e, a.id);
    });
  };
}

/** Einzelne Annahme; für viele Annahmen einmal `getanQuellePruefer` bauen. */
export function getanHatQuelle(a: Beleg, entscheidungen: Entscheidungen | null, bekannt?: (id: string) => boolean): boolean {
  return getanQuellePruefer(entscheidungen, bekannt)(a);
}
