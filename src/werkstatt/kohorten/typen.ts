// Eine Kohorte = ein Jahrgang. Öffentlich und im Repo; wer dazugehört, steht in WERKSTATT_ZUGANG.
import type { ArtefaktName } from '../schemas/namen.js';

export type KohortenStatus = 'aktiv' | 'archiviert';

export type ArtefaktVersion = `${ArtefaktName}@${number}`;

export interface Kohorte {
  id: string;
  kurs: 'innolab';
  titel: string;
  org: string;
  vorlage: string;
  status: KohortenStatus;
  artefakte: ArtefaktVersion[];
  // Kurstag -> Datum (ISO) oder null, solange der Termin offen ist.
  termine: Record<string, string | null>;
}
