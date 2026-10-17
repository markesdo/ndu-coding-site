import { kohorte2026 } from './2026.js';
import type { Kohorte } from './typen.js';

// Übungskohorte für Probeläufe; Org und Vorlage kommen von 2026, damit sie nur dort stehen.
export const kohorteTest: Kohorte = {
  ...kohorte2026,
  id: 'test',
  titel: 'Test',
  // Immer zuletzt, ausdrücklich aktiv (nicht von 2026 geerbt).
  status: 'aktiv',
  beginn: '2000-01-01',
  termine: {},
};
