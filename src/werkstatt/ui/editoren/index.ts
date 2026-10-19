// Alle Editoren der Mappe, nach Artefakt. Methodenseiten (Bearbeiten.astro) und /innolab/mappe holen ihren Editor von hier.
import type { ComponentType } from 'react';
import type { ArtefaktName } from '../../schemas/index.js';
import AnnahmenEditor from './AnnahmenEditor.js';
import BriefEditor from './BriefEditor.js';
import EntscheidungenEditor from './EntscheidungenEditor.js';
import InterviewsEditor from './InterviewsEditor.js';
import LeitfadenEditor from './LeitfadenEditor.js';

export const EDITOREN: Record<ArtefaktName, ComponentType> = {
  brief: BriefEditor,
  entscheidungen: EntscheidungenEditor,
  leitfaden: LeitfadenEditor,
  annahmen: AnnahmenEditor,
  interviews: InterviewsEditor,
};
