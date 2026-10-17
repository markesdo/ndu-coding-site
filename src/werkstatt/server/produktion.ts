// Abhängigkeiten für Vercel (api/werkstatt.ts). Wirft nie beim Import: Fehlen Secrets, scheitert erst die Anfrage,
// die sie braucht, mit 503 – die Website baut und deployt auch ohne Werkstatt-Secrets.
import { ApiAusnahme } from './antwort.js';
import { vercelCache } from './cache.js';
import { githubIdentitaet } from './github/identitaet.js';
import { umgebungLesen } from './umgebung.js';
import type { Abhaengigkeiten, Speicher, Umgebung } from './typen.js';

// Platzhalter, bis T5 (githubSpeicher) hier ihre Implementierung eintragen.
function nochNicht(): never {
  throw new ApiAusnahme(501, 'unbekannt', 'Diese Funktion der Werkstatt gibt es noch nicht.');
}
const speicherPlatzhalter: Speicher = {
  anlegen: async () => nochNicht(),
  lesen: async () => nochNicht(),
  speichern: async () => nochNicht(),
  uebersicht: async () => nochNicht(),
  werkstattJson: async () => nochNicht(),
};

export function produktionsAbhaengigkeiten(env: NodeJS.ProcessEnv = process.env): Abhaengigkeiten {
  let umgebung: Umgebung | undefined;
  const abh: Abhaengigkeiten = {
    // Erst beim ersten Zugriff gelesen und dann behalten. Die Meldung nennt nur Variablennamen und geht ins Log,
    // nicht in die Antwort.
    get umgebung(): Umgebung {
      if (!umgebung) {
        try {
          umgebung = umgebungLesen(env);
        } catch (e) {
          console.error('werkstatt: Umgebung unvollständig –', (e as Error).message);
          throw new ApiAusnahme(503, 'unbekannt', 'Die Werkstatt ist noch nicht eingerichtet.');
        }
      }
      return umgebung;
    },
    speicher: speicherPlatzhalter,
    github: githubIdentitaet(() => abh.umgebung),
    cache: vercelCache(),
    jetzt: () => Date.now(),
  };
  return abh;
}
