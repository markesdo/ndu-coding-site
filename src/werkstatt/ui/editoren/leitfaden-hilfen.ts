// Reine Hilfen des Leitfaden-Editors. Beispielfragen werden nie vorbefüllt (Mom-Test-Pointe): Wer die Fragen
// abschreibt, übt nicht, eigene zu stellen. Nur der Einstieg kommt aus der Vorlage auf „Interview“.
import { naechsteId } from '../../ids.js';
import type { Frage } from '../../schemas/index.js';

const PLATZHALTER = /\[\s*situation\s*\]/i;

/** Solange der Platzhalter im Einstieg steht, fehlt noch deine Situation. */
export const hatPlatzhalter = (einstieg: string): boolean => PLATZHALTER.test(einstieg);
export const PLATZHALTER_HINWEIS = 'Ersetze noch [Situation] durch deine Situation.';

/** Neue Frage: leer, mit der nächsten freien F-ID. Bekannte Grenze: Wird die höchste Frage gelöscht, vergibt das die ID erneut (noch verweist nichts auf F-IDs). */
export function neueFrage(vorhandene: readonly Frage[]): Frage {
  return { id: naechsteId('F', vorhandene.map((f) => f.id)), text: '', art: 'kern' };
}

const GUELTIG = /^F[1-9][0-9]*$/;

/** Jede Frage ohne gültige, einmalige F-ID bekommt die nächste freie; gültige bleiben. Ohne Änderung kommt dieselbe Liste zurück. */
export function fragenIdsReparieren(fragen: readonly Frage[]): readonly Frage[] {
  const gesehen = new Set<string>();
  const kaputt = fragen.map((f) => {
    const defekt = !GUELTIG.test(f.id) || gesehen.has(f.id);
    if (!defekt) gesehen.add(f.id);
    return defekt;
  });
  if (!kaputt.some(Boolean)) return fragen;
  const vergeben = [...gesehen];
  return fragen.map((f, i) => {
    if (!kaputt[i]) return f;
    const id = naechsteId('F', vergeben);
    vergeben.push(id);
    return { ...f, id };
  });
}
