// Präsentator-Begleiter (/innolab/begleiter): welche Folie gezeigt wird und was die Statuszeile sagt. Ohne DOM, damit
// testbar. Folgen an: jede Beamer-Meldung zählt (Index nur bei einer Tag-1-Folie, sonst bleibt die letzte stehen).
// Folgen aus (von Hand geblättert): Beamer-Meldungen ändern nichts, bis „Dem Beamer folgen“ gedrückt wird.

/** frage = noch keine Antwort seit dem Laden bzw. seit „Dem Beamer folgen“. */
export type Meldung = 'frage' | 'ok' | 'nicht-tag-1' | 'keine-position' | 'keine-verbindung';
export type Zustand = { index: number; folgen: boolean; meldung: Meldung };
export type Ereignis =
  | { art: 'position'; index: number | null }
  | { art: 'fehler' }
  | { art: 'leer' }
  | { art: 'blaettern'; index: number }
  | { art: 'folgen' };

export function anzeige(z: Zustand, e: Ereignis): Zustand {
  switch (e.art) {
    case 'blaettern': return { ...z, index: e.index, folgen: false };
    case 'folgen': return { ...z, folgen: true, meldung: 'frage' };
  }
  if (!z.folgen) return z;
  switch (e.art) {
    case 'position': return e.index === null ? { ...z, meldung: 'nicht-tag-1' } : { ...z, index: e.index, meldung: 'ok' };
    case 'fehler': return { ...z, meldung: 'keine-verbindung' };
    case 'leer': return { ...z, meldung: 'keine-position' };
  }
}
