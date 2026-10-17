import { ARTEFAKTE, type ArtefaktName } from '../schemas/index.js';
import type { Kohorte } from '../kohorten/typen.js';

// Inhaltsverzeichnis der Mappe. Braucht nur die Dateiliste, keine Daten der Artefakte.
export function readmeRendern(k: Kohorte, vorhanden: { name: ArtefaktName; vorhanden: boolean }[]): string {
  const zeilen = vorhanden.map((v) => {
    const titel = ARTEFAKTE[v.name].titel;
    return `| ${titel} | ${v.vorhanden ? `[mappe/${v.name}.md](mappe/${v.name}.md)` : 'noch offen'} |`;
  });
  return `# Projektmappe

**Kohorte:** ${k.titel}

| Artefakt | Datei |
|----------|-------|
${zeilen.join('\n')}
`;
}
