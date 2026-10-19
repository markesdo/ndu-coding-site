import type { Interviews } from '../schemas/index.js';
import { datumAt, einzeilig, liste, listenpunkt, mehrzeilig, zitat } from './format.js';

// Ein Abschnitt pro Interview, oben der Snapshot (Torres S. 68), darunter Notizen und Zitate mit ID.
export function interviewsRendern(d: Interviews): string {
  const teile = d.interviews.map((iv) => {
    const chancen = iv.chancen.map((c) => `- ${listenpunkt(c.text)}${c.belege.length ? ` (${c.belege.join(', ')})` : ''}`);
    const zitate = iv.zitate.map((z) => `- **${z.id}** „${einzeilig(z.text)}“`);
    return `## ${iv.id} · ${einzeilig(iv.pseudonym)}

**Datum:** ${datumAt(iv.datum)}

${zitat(iv.zitat)}

**Kurzinfos:** ${einzeilig(iv.kurzinfos)}

### Einsichten
${liste(iv.einsichten)}

### Chancen
${chancen.length ? chancen.join('\n') : 'Noch keine eingetragen.'}

### Notizen
${mehrzeilig(iv.notizen)}

### Zitate
${zitate.length ? zitate.join('\n') : 'Noch keine eingetragen.'}
`;
  });
  return `# Interviews und Snapshots

**Stand:** ${datumAt(d.stand)}

Pseudonymisiert. Die Skizze jeder Geschichte liegt auf dem Team-Board in Miro.

${teile.length ? teile.join('\n') : 'Noch keine Interviews eingetragen.\n'}`;
}
