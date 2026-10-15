// „Erst machen, dann erklären“: Ab wann die Auflösung einer Übung für alle sichtbar ist. Ohne DOM, damit testbar.
import { wienerZeit } from './jetzt';

/** „2026-10-16T10:10“ (Wiener Zeit) → Datum und Minuten seit Mitternacht. Ungültiges → undefined. */
export function aufloesungAb(text: string): { datum: string; minuten: number } | undefined {
  const m = text.trim().match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/);
  if (!m) return undefined;
  const [h, min] = [Number(m[2]), Number(m[3])];
  if (h > 23 || min > 59) return undefined;
  // Kalendertag prüfen: 2026-10-61 oder 2026-02-30 gibt es nicht (Date würde sie still weiterrechnen).
  const [jahr, monat, tag] = m[1].split('-').map(Number);
  const d = new Date(Date.UTC(jahr, monat - 1, tag));
  if (d.getUTCFullYear() !== jahr || d.getUTCMonth() !== monat - 1 || d.getUTCDate() !== tag) return undefined;
  return { datum: m[1], minuten: h * 60 + min };
}

/** Ist die Auflösung zum Zeitpunkt `jetzt` freigegeben? Ungültiges `ab` bleibt verborgen. */
export function aufgeloest(ab: string, jetzt: Date): boolean {
  const ziel = aufloesungAb(ab);
  if (!ziel) return false;
  const { datum, minuten } = wienerZeit(jetzt);
  return datum > ziel.datum || (datum === ziel.datum && minuten >= ziel.minuten);
}
