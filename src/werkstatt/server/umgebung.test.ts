import { describe, expect, it } from 'vitest';
import { istLokal, umgebungLesen } from './umgebung';

const schluessel = (byte: number, laenge = 32) => Buffer.alloc(laenge, byte).toString('base64');

const VOLL = {
  GITHUB_APP_ID: '123456',
  GITHUB_APP_PRIVATE_KEY: '-----BEGIN RSA PRIVATE KEY-----\\nABC\\nDEF\\n-----END RSA PRIVATE KEY-----',
  GITHUB_APP_CLIENT_ID: 'Iv23li-test',
  GITHUB_APP_CLIENT_SECRET: 'client-secret-wert',
  WERKSTATT_SESSION_SECRET: 'x'.repeat(32),
  MCP_TOKEN_KEYS: `neu:${schluessel(1)},alt:${schluessel(2)}`,
  WERKSTATT_ZUGANG: JSON.stringify({ test: { lehrende: [7], studierende: [{ githubId: 8, kuerzel: 'sofie' }] } }),
};

describe('umgebungLesen', () => {
  it('wirft ohne Secrets', () => {
    expect(() => umgebungLesen({})).toThrow();
  });
  it('wirft, wenn eine einzige Variable fehlt', () => {
    for (const name of Object.keys(VOLL)) {
      const env: NodeJS.ProcessEnv = { ...VOLL };
      delete env[name];
      expect(() => umgebungLesen(env), name).toThrow(name);
    }
  });
  it('liest alles, normalisiert wörtliches \\n im PEM, erster Schlüssel ist der aktuelle', () => {
    const u = umgebungLesen({ ...VOLL, NODE_ENV: 'production' });
    expect(u.githubPrivateKey).toBe('-----BEGIN RSA PRIVATE KEY-----\nABC\nDEF\n-----END RSA PRIVATE KEY-----');
    expect(u.tokenKeys.map((k) => k.kid)).toEqual(['neu', 'alt']);
    expect(u.tokenKeys[0].key).toBeInstanceOf(Uint8Array);
    expect(u.tokenKeys[0].key.length).toBe(32);
    expect(u.tokenKeys[1].key[0]).toBe(2);
    expect(u.zugang.test.studierende[0].kuerzel).toBe('sofie');
    expect(u.origin).toBeNull();
    expect(u.lokal).toBe(false);
  });
  it('WERKSTATT_ORIGIN wird zur reinen Origin', () => {
    expect(umgebungLesen({ ...VOLL, WERKSTATT_ORIGIN: 'https://ndu.datamonkeys.ai/' }).origin).toBe('https://ndu.datamonkeys.ai');
    expect(() => umgebungLesen({ ...VOLL, WERKSTATT_ORIGIN: 'kein-url' })).toThrow('WERKSTATT_ORIGIN');
  });
  it('MCP_TOKEN_KEYS: falsche Länge, doppelte kid oder fehlender Doppelpunkt werfen – ohne den Wert zu verraten', () => {
    for (const roh of [`a:${schluessel(1, 16)}`, `a:${schluessel(1)},a:${schluessel(2)}`, schluessel(1), `:${schluessel(1)}`]) {
      let meldung = '';
      try {
        umgebungLesen({ ...VOLL, MCP_TOKEN_KEYS: roh });
      } catch (e) {
        meldung = (e as Error).message;
      }
      expect(meldung, roh).toContain('MCP_TOKEN_KEYS');
      expect(meldung).not.toContain(schluessel(1).slice(0, 12));
    }
  });
  it('Secrets werden getrimmt (Zeilenumbruch am Ende aus `vercel env add`)', () => {
    const u = umgebungLesen({ ...VOLL, GITHUB_APP_ID: '12345\n', GITHUB_APP_CLIENT_SECRET: ' geheim \r\n', WERKSTATT_SESSION_SECRET: `${'x'.repeat(32)}\n` });
    expect(u.githubAppId).toBe('12345');
    expect(u.githubClientSecret).toBe('geheim');
    expect(u.sessionSecret).toBe('x'.repeat(32));
  });
  it('WERKSTATT_SESSION_SECRET: die Mindestlänge zählt ohne Zeilenumbruch', () => {
    expect(() => umgebungLesen({ ...VOLL, WERKSTATT_SESSION_SECRET: `${'x'.repeat(31)}\n` })).toThrow('WERKSTATT_SESSION_SECRET');
  });
  it('zu kurzes WERKSTATT_SESSION_SECRET wirft', () => {
    expect(() => umgebungLesen({ ...VOLL, WERKSTATT_SESSION_SECRET: 'kurz' })).toThrow('WERKSTATT_SESSION_SECRET');
  });
});

describe('istLokal', () => {
  it('nur development und test', () => {
    expect(istLokal({ NODE_ENV: 'development' })).toBe(true);
    expect(istLokal({ NODE_ENV: 'test' })).toBe(true);
  });
  it('fehlend, leer, production oder Ähnliches: nein', () => {
    expect(istLokal({ NODE_ENV: undefined })).toBe(false);
    expect(istLokal({})).toBe(false);
    expect(istLokal({ NODE_ENV: '' })).toBe(false);
    expect(istLokal({ NODE_ENV: 'production' })).toBe(false);
    expect(istLokal({ NODE_ENV: 'Development' })).toBe(false);
    expect(istLokal({ NODE_ENV: 'preview' })).toBe(false);
  });
});
