// Fehler, die ein Speicher nach außen wirft – gemeinsam für githubSpeicher und fakeSpeicher, damit Routen-Tests gegen
// den Fake dieselben Antworten sehen wie Prod.
import { ApiAusnahme } from './antwort.js';

// GitHub-Logins: alphanumerisch und Bindestrich, höchstens 39 Zeichen, nie am Anfang ein Bindestrich.
export const LOGIN_MUSTER = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
export const unbekanntesRepo = () => new ApiAusnahme(404, 'unbekannt', 'Diese Mappe gibt es nicht.');
export const wirdEingerichtet = () =>
  new ApiAusnahme(503, 'wird-eingerichtet', 'Deine Mappe wird eingerichtet. Lade die Seite in ein paar Sekunden neu.');
// Kein gültiges JSON im Repo (z. B. von Hand auf GitHub kaputt bearbeitet). Für die Web-API wie ein GitHub-Fehler (502);
// eigene Klasse, damit der Connector sagen kann, dass die Datei in der Werkstatt neu gespeichert werden muss.
export const GITHUB_SATZ = 'GitHub ist gerade nicht erreichbar. Bitte gleich noch einmal versuchen.';
export class DateiUnlesbar extends ApiAusnahme {
  constructor(readonly pfad: string) {
    super(502, 'github-fehler', GITHUB_SATZ);
  }
}
export function jsonAusRepo(pfad: string, inhalt: string): unknown {
  try {
    return JSON.parse(inhalt) as unknown;
  } catch {
    console.error(`werkstatt: kaputtes JSON in ${pfad}`);
    throw new DateiUnlesbar(pfad);
  }
}
export const fremdesRepo = () => new ApiAusnahme(403, 'nicht-freigeschaltet', 'Diese Mappe gehört zu einer anderen Person. Schreib Markus.');

// Programmier- oder Konfigurationsfehler: Einzelheiten nur ins Log.
export function internerFehler(log: string): ApiAusnahme {
  console.error(`werkstatt: ${log}`);
  return new ApiAusnahme(500, 'unbekannt', 'In der Werkstatt ist etwas schiefgegangen. Bitte später noch einmal versuchen.');
}
