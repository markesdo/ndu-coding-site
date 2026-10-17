import { kohorte2026 } from './2026';
import type { Kohorte } from './typen';

// Übungskohorte für Probeläufe; Org und Vorlage kommen von 2026, damit sie nur dort stehen.
export const kohorteTest: Kohorte = {
  ...kohorte2026,
  id: 'test',
  titel: 'Test',
  termine: {},
};
