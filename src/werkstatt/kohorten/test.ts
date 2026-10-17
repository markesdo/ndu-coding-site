import type { Kohorte } from './typen';

// Übungskohorte für Probeläufe; kommt in WERKSTATT_ZUGANG nur vor, wenn Lehrende sie dort eintragen.
export const kohorteTest: Kohorte = {
  id: 'test',
  kurs: 'innolab',
  titel: 'Test',
  org: 'ndu-innolab',
  vorlage: 'mappe-vorlage-2026',
  status: 'aktiv',
  artefakte: ['brief@1', 'entscheidungen@1', 'leitfaden@1', 'annahmen@1'],
  termine: {},
};
