// Öffentliche Fläche der Renderer: Browser und Server importieren nur von hier.
import type { ArtefaktDaten, ArtefaktName, Annahmen, Brief, Entscheidungen, Leitfaden } from '../schemas/index.js';
import { annahmenRendern } from './annahmen.js';
import { briefRendern } from './brief.js';
import { entscheidungenRendern } from './entscheidungen.js';
import { leitfadenRendern } from './leitfaden.js';

export { readmeRendern } from './readme.js';

export function rendern(name: ArtefaktName, daten: ArtefaktDaten): string {
  switch (name) {
    case 'brief':
      return briefRendern(daten as Brief);
    case 'entscheidungen':
      return entscheidungenRendern(daten as Entscheidungen);
    case 'leitfaden':
      return leitfadenRendern(daten as Leitfaden);
    case 'annahmen':
      return annahmenRendern(daten as Annahmen);
  }
}

// Genau die Dateien, die ein Speichern schreibt.
export function dateienFuerSpeichern(name: ArtefaktName, daten: ArtefaktDaten, readme: string): Record<string, string> {
  return {
    [`mappe/${name}.json`]: `${JSON.stringify(daten, null, 2)}\n`,
    [`mappe/${name}.md`]: rendern(name, daten),
    'README.md': readme,
  };
}
