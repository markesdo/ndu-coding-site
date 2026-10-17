import { randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import type { Schluessel } from '../typen';
import { oeffnen, versiegeln } from './umschlag';

const schluessel = (kid: string): Schluessel => ({ kid, key: new Uint8Array(randomBytes(32)) });
const k1 = schluessel('k1');
const k2 = schluessel('k2');
const JETZT = 1_800_000_000;

describe('versiegeln/oeffnen', () => {
  it('Rundreise: Inhalt und Ablauf kommen zurück', async () => {
    const t = await versiegeln('access', { githubId: 1001, kohorte: 'test' }, 3600, [k1], JETZT);
    expect(t.startsWith('v1.k1.')).toBe(true);
    expect(await oeffnen('access', t, [k1], JETZT)).toStrictEqual({ githubId: 1001, kohorte: 'test', exp: JETZT + 3600 });
  });

  it('abgelaufen: null (genau am Ablauf schon)', async () => {
    const t = await versiegeln('code', { a: 1 }, 60, [k1], JETZT);
    expect(await oeffnen('code', t, [k1], JETZT + 59)).not.toBeNull();
    expect(await oeffnen('code', t, [k1], JETZT + 60)).toBeNull();
  });

  it('anderer Typ: null (ein Access-Token ist kein Refresh-Token)', async () => {
    const t = await versiegeln('access', { a: 1 }, 60, [k1], JETZT);
    expect(await oeffnen('refresh', t, [k1], JETZT)).toBeNull();
    expect(await oeffnen('code', t, [k1], JETZT)).toBeNull();
  });

  it('Rotation: neuer Schlüssel vorne, alte Tokens bleiben gültig, bis ihr kid entfernt wird', async () => {
    const alt = await versiegeln('refresh', { a: 1 }, 60, [k1], JETZT);
    const neu = await versiegeln('refresh', { a: 2 }, 60, [k2, k1], JETZT);
    expect(neu.startsWith('v1.k2.')).toBe(true);
    expect(await oeffnen('refresh', alt, [k2, k1], JETZT)).toMatchObject({ a: 1 });
    expect(await oeffnen('refresh', neu, [k2, k1], JETZT)).toMatchObject({ a: 2 });
    expect(await oeffnen('refresh', alt, [k2], JETZT)).toBeNull();
  });

  it('kid vertauscht oder Bytes verändert: null', async () => {
    const t = await versiegeln('access', { a: 1 }, 60, [k1], JETZT);
    const andererKey = { kid: 'k1', key: k2.key };
    expect(await oeffnen('access', t, [andererKey], JETZT)).toBeNull();
    // kid auf k2 umschreiben: AAD passt nicht mehr.
    expect(await oeffnen('access', t.replace('v1.k1.', 'v1.k2.'), [k1, { kid: 'k2', key: k1.key }], JETZT)).toBeNull();
    const teile = t.split('.');
    const roh = Buffer.from(teile[2], 'base64url');
    roh[roh.length - 20] ^= 1;
    expect(await oeffnen('access', `v1.k1.${roh.toString('base64url')}`, [k1], JETZT)).toBeNull();
  });

  it('Müll: null, kein Wurf', async () => {
    for (const t of ['', 'v1', 'v1.k1', 'v2.k1.AAAA', 'v1.k1.!!!', 'v1.k1.AAAA', 'a.b.c.d']) {
      expect(await oeffnen('access', t, [k1], JETZT), t).toBeNull();
    }
  });

  it('jedes Token ist anders (frische Nonce)', async () => {
    const a = await versiegeln('access', { a: 1 }, 60, [k1], JETZT);
    const b = await versiegeln('access', { a: 1 }, 60, [k1], JETZT);
    expect(a).not.toBe(b);
  });

  it('ohne Schlüssel oder mit ungeeignetem kid: wirft beim Versiegeln', async () => {
    await expect(versiegeln('access', {}, 60, [], JETZT)).rejects.toThrow();
    await expect(versiegeln('access', {}, 60, [{ kid: 'a.b', key: k1.key }], JETZT)).rejects.toThrow();
  });
});
