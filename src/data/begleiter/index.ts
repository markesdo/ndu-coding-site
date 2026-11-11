// Alle Begleiter-Notizen: Seitenpfad → h2-id der Folie → Notiz. Ein Test prüft, dass jeder Eintrag auf eine Folie zeigt.
import type { Notiz } from './typen';
import { NOTIZEN_TAG_1 } from './tag-1';
import { NOTIZEN_PROBLEM_RAHMEN } from './problem-rahmen';
import { NOTIZEN_ENTSCHEIDUNGSLOG } from './entscheidungslog';
import { NOTIZEN_ANNAHMEN } from './annahmen';
import { NOTIZEN_INTERVIEW } from './interview';
import { NOTIZEN_ABSCHLUSS } from './abschluss';
import { NOTIZEN_EXPERIMENT } from './experiment';
import { NOTIZEN_TAG_5 } from './tag-5';

export type { Notiz } from './typen';

export const NOTIZEN: Record<string, Record<string, Notiz>> = {
  '/innolab/tag-1': NOTIZEN_TAG_1,
  '/innolab/methoden/problem-rahmen': NOTIZEN_PROBLEM_RAHMEN,
  '/innolab/methoden/entscheidungslog': NOTIZEN_ENTSCHEIDUNGSLOG,
  '/innolab/methoden/annahmen': NOTIZEN_ANNAHMEN,
  '/innolab/methoden/interview': NOTIZEN_INTERVIEW,
  '/innolab/tag-1/abschluss': NOTIZEN_ABSCHLUSS,
  // Außerhalb von Tag 1: bereit für den Begleiter späterer Tage (zeigt bisher nur Tag 1).
  '/innolab/methoden/experiment': NOTIZEN_EXPERIMENT,
  '/innolab/tag-5': NOTIZEN_TAG_5,
};
