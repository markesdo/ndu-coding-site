import { kohorte2026 } from './2026.js';
import type { Kohorte } from './typen.js';

// Übungskohorte für Probeläufe; Org und Vorlage kommen von 2026, damit sie nur dort stehen.
export const kohorteTest: Kohorte = {
  ...kohorte2026,
  id: 'test',
  titel: 'Test',
  termine: {},
};
