// „Jetzt“-Markierung im Tagesablauf: Welche Zeile läuft gerade? Ohne DOM, damit testbar.
// Kurszeiten gelten in Wien; der Rechner der Studierenden kann in einer anderen Zeitzone stehen.

export const ZEITZONE = 'Europe/Vienna';

export interface Zeitraum {
  /** Minuten seit Mitternacht. */
  start: number;
  ende: number;
}

/** „09:00–09:30“ (Halbgeviertstrich oder Bindestrich) → Minuten. Ungültiges → undefined. */
export function zeitraum(text: string): Zeitraum | undefined {
  const m = text.trim().match(/^(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})$/);
  if (!m) return undefined;
  const [h1, m1, h2, m2] = m.slice(1).map(Number);
  if (h1 > 23 || h2 > 23 || m1 > 59 || m2 > 59) return undefined;
  const start = h1 * 60 + m1;
  const ende = h2 * 60 + m2;
  return ende > start ? { start, ende } : undefined;
}

/** Datum (JJJJ-MM-TT) und Minuten seit Mitternacht in Wien für einen Zeitpunkt. */
export function wienerZeit(jetzt: Date): { datum: string; minuten: number } {
  const teile = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZEITZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(jetzt);
  const t = (typ: string) => teile.find((p) => p.type === typ)?.value ?? '';
  return { datum: `${t('year')}-${t('month')}-${t('day')}`, minuten: Number(t('hour')) * 60 + Number(t('minute')) };
}

/**
 * Index der Zeile, die gerade läuft, sonst -1. Zeiträume sind halboffen: Um 10:45 gilt die Zeile,
 * die um 10:45 beginnt, nicht die, die um 10:45 endet. Pausen zählen wie jede andere Zeile.
 */
export function aktiveZeile(zeiten: string[], kurstag: string, jetzt: Date): number {
  const { datum, minuten } = wienerZeit(jetzt);
  if (datum !== kurstag) return -1;
  return zeiten.findIndex((z) => {
    const r = zeitraum(z);
    return r !== undefined && minuten >= r.start && minuten < r.ende;
  });
}
