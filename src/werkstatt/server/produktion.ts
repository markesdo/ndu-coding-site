// Abhängigkeiten für Vercel (api/werkstatt.ts). Wirft nie beim Import: Fehlen Secrets, scheitert erst die Anfrage,
// die sie braucht, mit 503 – die Website baut und deployt auch ohne Werkstatt-Secrets.
import { ApiAusnahme } from './antwort.js';
import { vercelCache } from './cache.js';
import { botIdentitaetGeber, installationTokenGeber } from './github/app-token.js';
import { githubIdentitaet } from './github/identitaet.js';
import { githubSpeicher } from './github/speicher.js';
import { umgebungLesen } from './umgebung.js';
import type { Abhaengigkeiten, Speicher, Umgebung } from './typen.js';

// Ein Speicher für alle Jahrgänge: Org und Vorlage bestimmt githubSpeicher pro Aufruf aus der Kohorte.
// App-ID und Schlüssel erst beim ersten Token lesen.
function produktionsSpeicher(abh: Pick<Abhaengigkeiten, 'umgebung' | 'cache' | 'jetzt'>): Speicher {
  const app = {
    fetch: (eingabe: RequestInfo | URL, init?: RequestInit) => fetch(eingabe, init),
    cache: abh.cache,
    jetzt: () => abh.jetzt(),
    schluessel: () => ({ appId: abh.umgebung.githubAppId, privateKeyPem: abh.umgebung.githubPrivateKey }),
  };
  const token = installationTokenGeber(app);
  return githubSpeicher({ fetch: app.fetch, cache: abh.cache, token, bot: botIdentitaetGeber(app, token) });
}

export function produktionsAbhaengigkeiten(env: NodeJS.ProcessEnv = process.env): Abhaengigkeiten {
  let umgebung: Umgebung | undefined;
  let speicher: Speicher | undefined;
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
    // Liest die Umgebung erst beim ersten Token, nicht hier.
    get speicher(): Speicher {
      return (speicher ??= produktionsSpeicher(abh));
    },
    github: githubIdentitaet(() => abh.umgebung),
    cache: vercelCache(),
    jetzt: () => Date.now(),
  };
  return abh;
}
