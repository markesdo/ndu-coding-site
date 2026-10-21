// „Erst machen, dann erklären“: Ab wann die Auflösung einer Übung für alle sichtbar ist. Ohne DOM, damit testbar.
import { wienerZeit } from './jetzt.js'; // .js-Endung: über lib/aufgedeckt.ts auch in api/aufgedeckt.ts

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

/** Kennung fürs Aufdecken für alle (lib/aufgedeckt.ts): die Gruppe – global, z. B. „mom-test“ auch für die Mappe –, sonst
 *  Seite und Knopftext, damit gleiche Knopftexte auf verschiedenen Seiten nicht zusammen aufgehen. */
export function aufloesungKennung(pfad: string, gruppe: string | undefined, knopf: string): string {
  return gruppe ?? `${pfad.replace(/\/+$/, '') || '/'}:${knopf}`;
}

/** Eine Auflösung, wie Aufloesung.astro sie hier anmeldet. oeffnen() muss mehrfach aufrufbar sein. */
export interface AufloesungBox {
  kennung: string;
  gruppe?: string;
  oeffnen: () => void;
}

/**
 * Wer öffnet was (ohne DOM, damit testbar):
 * - Knopf beim Präsentator (Klick oder Pfeiltaste im Beamer, die den Knopf auslöst): melden – das deckt für alle auf –
 *   und die ganze Gruppe öffnen.
 * - Knopf bei Studierenden (fuer="alle"): nur diese Box – ein Klick auf „Prompt öffnen“ verrät nicht den Rest des Mom Test.
 * - Von Markus aufgedeckt (Nachfrage) oder Uhrzeit erreicht: jede Box mit der Kennung samt Gruppe.
 * Gruppen öffnen direkt, nicht über Klicks auf die anderen Knöpfe – so meldet jedes Aufdecken genau einmal.
 */
export function aufloesungSteuerung(boxen: readonly AufloesungBox[], melden: (kennung: string) => void) {
  const mitGruppe = (b: AufloesungBox) => {
    b.oeffnen();
    if (b.gruppe) for (const x of boxen) if (x !== b && x.gruppe === b.gruppe) x.oeffnen();
  };
  return {
    knopf(b: AufloesungBox, praesentator: boolean) {
      if (!praesentator) { b.oeffnen(); return; }
      melden(b.kennung);
      mitGruppe(b);
    },
    aufgedeckt(kennung: string) { for (const b of boxen) if (b.kennung === kennung) mitGruppe(b); },
    uhr: mitGruppe,
  };
}
