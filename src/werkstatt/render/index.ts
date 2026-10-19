// Öffentliche Fläche der Renderer: Browser und Server importieren nur von hier.
import type { ArtefaktName, DatenVon } from '../schemas/index.js';
import { annahmenRendern } from './annahmen.js';
import { briefRendern } from './brief.js';
import { entscheidungenRendern } from './entscheidungen.js';
import { interviewsRendern } from './interviews.js';
import { leitfadenRendern } from './leitfaden.js';

export { readmeRendern } from './readme.js';

const RENDERER: { [N in ArtefaktName]: (daten: DatenVon<N>) => string } = {
  brief: briefRendern,
  entscheidungen: entscheidungenRendern,
  leitfaden: leitfadenRendern,
  annahmen: annahmenRendern,
  interviews: interviewsRendern,
};

export function rendern<N extends ArtefaktName>(name: N, daten: DatenVon<N>): string {
  return RENDERER[name](daten);
}

// Genau die Dateien, die ein Speichern schreibt.
export function dateienFuerSpeichern<N extends ArtefaktName>(name: N, daten: DatenVon<N>, readme: string): Record<string, string> {
  return {
    [`mappe/${name}.json`]: `${JSON.stringify(daten, null, 2)}\n`,
    [`mappe/${name}.md`]: rendern(name, daten),
    'README.md': readme,
  };
}
