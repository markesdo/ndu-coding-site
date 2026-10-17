import { TAGE } from '../../components/methoden.js';
import type { Kohorte } from './typen.js';

export const kohorte2026: Kohorte = {
  id: '2026',
  kurs: 'innolab',
  titel: 'Innolab 26/27',
  org: 'ndu-innolab',
  vorlage: 'mappe-vorlage-2026',
  status: 'aktiv',
  beginn: '2026-10-22',
  artefakte: ['brief@1', 'entscheidungen@1', 'leitfaden@1', 'annahmen@1'],
  // Aus dem Kursplan (TAGE), keine zweite Liste: tag<n> -> Datum oder null, solange der Termin offen ist.
  termine: Object.fromEntries(TAGE.map((t) => [`tag${t.n}`, t.datum ?? null])),
};
