// Abhängigkeiten für Tests und den lokalen Dev-Server: Fakes statt GitHub, Testpersonen in der Kohorte test.
// Verweigert außerhalb von NODE_ENV ∈ {development, test} (die Fakes prüfen das selbst noch einmal).
import { randomBytes } from 'node:crypto';
import type { Zugang } from '../zugang.js';
import { mapCache } from './cache.js';
import { TESTPERSONEN, fakeIdentitaet } from './fake-identitaet.js';
import { fakeSpeicher } from './fake-speicher.js';
import type { Abhaengigkeiten, Umgebung } from './typen.js';
import { istLokal } from './umgebung.js';

export function testZugang(): Zugang {
  return {
    test: {
      lehrende: TESTPERSONEN.filter((p) => p.rolle === 'lehrende').map((p) => p.githubId),
      studierende: TESTPERSONEN.filter((p) => p.rolle === 'studierende' && p.kuerzel).map((p) => ({ githubId: p.githubId, kuerzel: p.kuerzel! })),
    },
  };
}

export function lokaleUmgebung(): Umgebung {
  if (!istLokal(process.env)) throw new Error('lokaleUmgebung nur bei NODE_ENV development oder test');
  return {
    githubAppId: 'lokal',
    githubPrivateKey: 'lokal',
    githubClientId: 'lokal',
    githubClientSecret: 'lokal',
    // Pro Prozess neu: lokale Sitzungen und Tokens überleben keinen Neustart, und nichts davon gilt anderswo.
    sessionSecret: randomBytes(32).toString('base64'),
    tokenKeys: [{ kid: 'lokal', key: new Uint8Array(randomBytes(32)) }],
    zugang: testZugang(),
    origin: null,
    lokal: true,
  };
}

export function lokaleAbhaengigkeiten(teil: Partial<Abhaengigkeiten> = {}): Abhaengigkeiten {
  return {
    umgebung: teil.umgebung ?? lokaleUmgebung(),
    speicher: teil.speicher ?? fakeSpeicher(),
    github: teil.github ?? fakeIdentitaet(),
    cache: teil.cache ?? mapCache(),
    jetzt: teil.jetzt ?? (() => Date.now()),
  };
}
