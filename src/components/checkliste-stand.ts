// Häkchen einer Checkliste im localStorage (Checklist.astro). Ohne DOM, damit testbar.
// Ohne ids: ein Array je Position (wie bisher). Mit ids (Prüflisten, seit NDU-28): ein Objekt je Prüfpunkt-ID, damit ein
// Häkchen beim Umsortieren oder Einfügen am selben Punkt bleibt. Ein altes Array wird einmal nach Position übernommen.

export type Haekchen = boolean[] | Record<string, boolean>;

/** Gespeicherten Text lesen; Kaputtes oder Fremdes gilt als leer. */
export function haekchenLesen(roh: string | null, ids?: readonly string[]): Haekchen {
  let wert: unknown = null;
  try {
    wert = JSON.parse(roh ?? 'null');
  } catch {
    wert = null;
  }
  if (!ids) return Array.isArray(wert) ? wert.map(Boolean) : [];
  if (Array.isArray(wert)) return Object.fromEntries(ids.flatMap((id, i) => (wert[i] ? [[id, true]] : [])));
  if (wert && typeof wert === 'object') return Object.fromEntries(Object.entries(wert).filter(([, v]) => v === true));
  return {};
}

/** Stand ein altes Array (Häkchen je Position) da, wo jetzt ids gelten? Dann einmal als Objekt zurückschreiben. */
export function altesFormat(roh: string | null, ids?: readonly string[]): boolean {
  if (!ids) return false;
  try {
    return Array.isArray(JSON.parse(roh ?? 'null'));
  } catch {
    return false;
  }
}

export function abgehakt(h: Haekchen, i: number, ids?: readonly string[]): boolean {
  return Array.isArray(h) ? !!h[i] : !!(ids && h[ids[i]]);
}

/** Neuer Stand nach einem Klick; das Objekt behält Häkchen gestrichener IDs nicht. */
export function haekchenSetzen(h: Haekchen, i: number, an: boolean, ids?: readonly string[]): Haekchen {
  if (Array.isArray(h)) {
    const neu = [...h];
    neu[i] = an;
    return neu;
  }
  const neu: Record<string, boolean> = {};
  for (const id of ids ?? []) if (h[id]) neu[id] = true;
  if (ids && an) neu[ids[i]] = true;
  if (ids && !an) delete neu[ids[i]];
  return neu;
}
