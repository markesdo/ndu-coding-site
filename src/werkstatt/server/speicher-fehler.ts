// Fehler, die ein Speicher nach außen wirft – gemeinsam für githubSpeicher und fakeSpeicher, damit Routen-Tests gegen
// den Fake dieselben Antworten sehen wie Prod.
import { ApiAusnahme } from './antwort.js';

export const unbekanntesRepo = () => new ApiAusnahme(404, 'unbekannt', 'Diese Mappe gibt es nicht.');
export const wirdEingerichtet = () =>
  new ApiAusnahme(503, 'wird-eingerichtet', 'Deine Mappe wird eingerichtet. Lade die Seite in ein paar Sekunden neu.');
export const fremdesRepo = () => new ApiAusnahme(403, 'nicht-freigeschaltet', 'Diese Mappe gehört zu einer anderen Person. Schreib Markus.');

// Programmier- oder Konfigurationsfehler: Einzelheiten nur ins Log.
export function internerFehler(log: string): ApiAusnahme {
  console.error(`werkstatt: ${log}`);
  return new ApiAusnahme(500, 'unbekannt', 'In der Werkstatt ist etwas schiefgegangen. Bitte später noch einmal versuchen.');
}
