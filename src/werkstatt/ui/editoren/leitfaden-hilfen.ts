// Reine Hilfen des Leitfaden-Editors. Beispielfragen werden nie vorbefüllt (Mom-Test-Pointe): Wer die Fragen
// abschreibt, übt nicht, eigene zu stellen. Nur der Einstieg kommt aus der Vorlage auf „Interview“.
import { naechsteId } from '../../ids.js';
import type { Frage, Leitfaden } from '../../schemas/index.js';

export const EINSTIEG_VORLAGE =
  'Danke, dass du dir Zeit nimmst. Ich will verstehen, wie du [Situation] heute erlebst – es gibt keine falschen Antworten. Darf ich das Gespräch aufnehmen? Die Aufnahme bleibt bei mir, im Projekt steht nur ein Transkript ohne Namen.';

/** Neue Frage: leer, mit der nächsten freien F-ID. */
export function neueFrage(vorhandene: readonly Frage[]): Frage {
  return { id: naechsteId('F', vorhandene.map((f) => f.id)), text: '', art: 'kern' };
}

/** Ein leerer Einstieg bekommt den Text der Vorlage; ein vorhandener bleibt unangetastet. */
export function einstiegVorbefuellen(d: Leitfaden): Leitfaden {
  return d.einstieg.trim() === '' ? { ...d, einstieg: EINSTIEG_VORLAGE } : d;
}
