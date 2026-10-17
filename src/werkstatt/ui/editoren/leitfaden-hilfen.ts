// Reine Hilfen des Leitfaden-Editors. Beispielfragen werden nie vorbefüllt (Mom-Test-Pointe): Wer die Fragen
// abschreibt, übt nicht, eigene zu stellen. Nur der Einstieg kommt aus der Vorlage auf „Interview“.
import { naechsteId } from '../../ids.js';
import { EINSTIEG_VORLAGE, type Frage } from '../../schemas/index.js';

export { EINSTIEG_VORLAGE };

/** Solange der Platzhalter im Einstieg steht, fehlt noch deine Situation. */
export const hatPlatzhalter = (einstieg: string): boolean => einstieg.includes('[Situation]');
export const PLATZHALTER_HINWEIS = 'Ersetze noch [Situation] durch deine Situation.';

/** Neue Frage: leer, mit der nächsten freien F-ID. */
export function neueFrage(vorhandene: readonly Frage[]): Frage {
  return { id: naechsteId('F', vorhandene.map((f) => f.id)), text: '', art: 'kern' };
}
