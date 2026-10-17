import { createPublicKey, generateKeyPairSync } from 'node:crypto';
import { decodeProtectedHeader, jwtVerify } from 'jose';
import { describe, expect, it } from 'vitest';
import { mapCache } from '../cache';
import { appJwt, botIdentitaetGeber, installationTokenGeber } from './app-token';
import { fakeGithub } from './fake-github';

// GitHub liefert den App-Schlüssel als PKCS#1 („BEGIN RSA PRIVATE KEY“) – genau so testen.
const { privateKey: PEM } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

function aufbau() {
  const gh = fakeGithub();
  const uhr = { ms: 1_800_000_000_000 };
  const abh = {
    fetch: gh.fetch,
    cache: mapCache(() => uhr.ms),
    jetzt: () => uhr.ms,
    schluessel: () => ({ appId: '123456', privateKeyPem: PEM }),
  };
  return { gh, uhr, token: installationTokenGeber(abh), bot: botIdentitaetGeber(abh) };
}

describe('appJwt', () => {
  it('PKCS#1-Schlüssel, RS256, iss = App-ID, iat 60 s zurück, exp 540 s voraus', async () => {
    expect(PEM).toContain('BEGIN RSA PRIVATE KEY');
    const jetzt = 1_800_000_000;
    const jwt = await appJwt('123456', PEM, jetzt);
    expect(decodeProtectedHeader(jwt)).toEqual({ alg: 'RS256', typ: 'JWT' });
    const { payload } = await jwtVerify(jwt, createPublicKey(PEM), { currentDate: new Date(jetzt * 1000) });
    expect(payload).toStrictEqual({ iss: '123456', iat: jetzt - 60, exp: jetzt + 540 });
  });
});

describe('installationToken', () => {
  it('org-weit: Installation der Org, Rechte wie verlangt, ohne repository_ids', async () => {
    const { gh, token } = await aufbau();
    const t = await token({ org: 'ndu-innolab', rechte: { administration: 'write' } });
    expect(gh.zustand.tokens.get(t)).toStrictEqual({ permissions: { administration: 'write' }, repositoryIds: null });
    const [aufruf] = gh.zustand.aufrufeVon('POST', '/access_tokens');
    expect(aufruf.pfad).toBe('/app/installations/77/access_tokens');
    expect(aufruf.body).toStrictEqual({ permissions: { administration: 'write' } });
  });

  it('pro Repo: repository_ids = [repoId]', async () => {
    const { gh, token } = await aufbau();
    const t = await token({ org: 'ndu-innolab', repoId: 5009, rechte: { contents: 'write' } });
    expect(gh.zustand.tokens.get(t)).toStrictEqual({ permissions: { contents: 'write' }, repositoryIds: [5009] });
  });

  it('Cache: innerhalb 50 min kein neuer access_tokens-Aufruf, danach ein neuer', async () => {
    const { gh, uhr, token } = await aufbau();
    const opts = { org: 'ndu-innolab', repoId: 5009, rechte: { contents: 'write' as const } };
    const erst = await token(opts);
    uhr.ms += 49 * 60_000;
    expect(await token(opts)).toBe(erst);
    expect(gh.zustand.aufrufeVon('POST', '/access_tokens')).toHaveLength(1);
    uhr.ms += 2 * 60_000;
    expect(await token(opts)).not.toBe(erst);
    expect(gh.zustand.aufrufeVon('POST', '/access_tokens')).toHaveLength(2);
  });

  it('Cache trennt Repo und Rechte', async () => {
    const { gh, token } = await aufbau();
    const a = await token({ org: 'ndu-innolab', repoId: 5009, rechte: { contents: 'write' } });
    const b = await token({ org: 'ndu-innolab', repoId: 5010, rechte: { contents: 'write' } });
    const c = await token({ org: 'ndu-innolab', rechte: { contents: 'write' } });
    const d = await token({ org: 'ndu-innolab', rechte: { administration: 'write' } });
    expect(new Set([a, b, c, d]).size).toBe(4);
    expect(gh.zustand.aufrufeVon('POST', '/access_tokens')).toHaveLength(4);
  });

  it('unbekannte Org wirft', async () => {
    const { token } = await aufbau();
    await expect(token({ org: 'woanders', rechte: { contents: 'write' } })).rejects.toThrow(/github/);
  });
});

describe('botIdentitaet', () => {
  it('Name und noreply-Adresse des App-Bots, einmal abgefragt', async () => {
    const { gh, bot } = await aufbau();
    const erwartet = { name: 'ndu-werkstatt[bot]', email: '4242+ndu-werkstatt[bot]@users.noreply.github.com' };
    expect(await bot()).toStrictEqual(erwartet);
    expect(await bot()).toStrictEqual(erwartet);
    expect(gh.zustand.aufrufeVon('GET', '/app')).toHaveLength(1);
  });
});
