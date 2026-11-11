// Alle Begleiter-Notizen: Seitenpfad → h2-id der Folie → Notiz. Ein Test prüft, dass jeder Eintrag auf eine Folie zeigt.
import type { Notiz } from './typen';
import { NOTIZEN_TAG_1 } from './tag-1';
import { NOTIZEN_PROBLEM_RAHMEN } from './problem-rahmen';
import { NOTIZEN_ENTSCHEIDUNGSLOG } from './entscheidungslog';
import { NOTIZEN_ANNAHMEN } from './annahmen';
import { NOTIZEN_INTERVIEW } from './interview';
import { NOTIZEN_ABSCHLUSS } from './abschluss';
import { NOTIZEN_TAG_2 } from './tag-2';
import { NOTIZEN_SYNTHESE } from './synthese';
import { NOTIZEN_JOURNEY_MAP } from './journey-map';
import { NOTIZEN_BAUM } from './baum';
import { NOTIZEN_EXPERIMENT } from './experiment';
import { NOTIZEN_PITCH } from './pitch';
import { NOTIZEN_TAG_5 } from './tag-5';

export type { Notiz } from './typen';

export const NOTIZEN: Record<string, Record<string, Notiz>> = {
  '/innolab/tag-1': NOTIZEN_TAG_1,
  '/innolab/methoden/problem-rahmen': NOTIZEN_PROBLEM_RAHMEN,
  '/innolab/methoden/entscheidungslog': NOTIZEN_ENTSCHEIDUNGSLOG,
  '/innolab/methoden/annahmen': NOTIZEN_ANNAHMEN,
  '/innolab/methoden/interview': NOTIZEN_INTERVIEW,
  '/innolab/tag-1/abschluss': NOTIZEN_ABSCHLUSS,
  // Außerhalb von Tag 1: Der Begleiter folgt diesen Seiten Folie für Folie, in dieser Reihenfolge (lib/begleiter notizSeiten).
  '/innolab/tag-2': NOTIZEN_TAG_2,
  '/innolab/methoden/synthese': NOTIZEN_SYNTHESE,
  '/innolab/methoden/journey-map': NOTIZEN_JOURNEY_MAP,
  '/innolab/methoden/baum': NOTIZEN_BAUM,
  '/innolab/methoden/experiment': NOTIZEN_EXPERIMENT,
  '/innolab/methoden/pitch': NOTIZEN_PITCH,
  '/innolab/tag-5': NOTIZEN_TAG_5,
};
