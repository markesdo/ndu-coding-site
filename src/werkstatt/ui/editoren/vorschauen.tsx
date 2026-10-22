// Die Vorschau („Bild“) jedes Editors, nur lesend: dieselben Komponenten, die rechts im Editor stehen. Der Leser der
// Lehrenden-Ansicht zeigt damit ein Artefakt so, wie die Person es beim Bearbeiten sieht. Nur React-Text, nie HTML.
import type { ComponentType } from 'react';
import type { ArtefaktName, DatenVon } from '../../schemas/index.js';
import { Bild as AnnahmenBild } from './AnnahmenEditor.js';
import { Vorschau as BriefVorschau } from './BriefEditor.js';
import { Tabelle as EntscheidungenTabelle } from './EntscheidungenEditor.js';
import { Vorschau as InterviewsVorschau } from './InterviewsEditor.js';
import { Vorschau as LeitfadenVorschau } from './LeitfadenEditor.js';

export const VORSCHAUEN: { [N in ArtefaktName]: ComponentType<{ daten: DatenVon<N> }> } = {
  brief: BriefVorschau,
  entscheidungen: EntscheidungenTabelle,
  annahmen: AnnahmenBild,
  leitfaden: LeitfadenVorschau,
  interviews: InterviewsVorschau,
};
