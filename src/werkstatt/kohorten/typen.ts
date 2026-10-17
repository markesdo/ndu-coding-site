// Eine Kohorte = ein Jahrgang. Öffentlich und im Repo; wer dazugehört, steht in WERKSTATT_ZUGANG.
import type { ArtefaktName } from '../schemas/namen.js';

export type KohortenStatus = 'aktiv' | 'archiviert';

export type ArtefaktVersion = `${ArtefaktName}@${number}`;

export interface Kohorte {
  // Nur a-z und 0-9, kein Bindestrich: githubSpeicher liest die Kohorte aus dem Präfix `<id>-` des Repo-Namens
  // (Test in kohorten.test.ts).
  id: string;
  kurs: 'innolab';
  titel: string;
  org: string;
  vorlage: string;
  status: KohortenStatus;
  // Beginn des Jahrgangs (ISO-Datum). Bestimmt die Reihenfolge der Mitgliedschaften: neuester zuerst.
  beginn: string;
  artefakte: ArtefaktVersion[];
  // Kurstag -> Datum (ISO) oder null, solange der Termin offen ist.
  termine: Record<string, string | null>;
}
