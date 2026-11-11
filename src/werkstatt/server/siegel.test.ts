// Gemeinsames Siegel (Review #317): Umschläge und mögliche Fassung nutzen siegel.ts. Die Vektoren unten hat der Code
// VOR der Auslagerung versiegelt (umschlag.ts und fassung.ts mit eigenem AES-GCM, Commit b4753b6): Sie müssen sich mit dem
// gemeinsamen Code genau so öffnen lassen – und nur in ihrer eigenen Art (anderer Zweck, andere Version, anderes AAD: null).
import { describe, expect, it } from 'vitest';
import { fassungOeffnen } from './fassung';
import { oeffnen } from './oauth/umschlag';
import { entsiegeln, siegeln } from './siegel';

const K = [{ kid: 'k1', key: new Uint8Array(32).fill(7) }];
const UMSCHLAG_ALT = 'v1.k1.AvZYdizyZVPSH_rL3DdLAg3eAr_JWnPd1veD4jFgoo_fAHCyw_gHhtAWX19rhud3M9AbG1Yz70CKe5xPjlpvpMKUjPVAUHcf_pd0a8iiXZU04OYJtgerqeve0Jkw-g';
const FASSUNG_ALT = 'f1.k1.iSozLZnnW1fu3c9UxdL8V1JUhdHrfBJNL8Lw3dShaYEvHaemt9WnwDCL3VQl-F6ZnaCSvfMc4M8';
const ORT = { repo: '2026-sofie', artefakt: 'annahmen' as const, zeilenId: 'A2' };
const enc = new TextEncoder();

describe('siegel.ts: gleiches Verhalten wie vor der Auslagerung', () => {
  it('alter Umschlag öffnet sich unverändert', async () => {
    expect(await oeffnen('access', UMSCHLAG_ALT, K, 1_800_000_000)).toStrictEqual({ githubId: 1001, kohorte: 'test', exp: 1_800_003_600 });
    expect(await oeffnen('refresh', UMSCHLAG_ALT, K, 1_800_000_000)).toBeNull();
  });

  it('alte Fassung öffnet sich unverändert, nur an ihrem Ort', async () => {
    expect(await fassungOeffnen(FASSUNG_ALT, ORT, K)).toBe('Wir glauben, dass [Zahl] …');
    expect(await fassungOeffnen(FASSUNG_ALT, { ...ORT, zeilenId: 'A3' }, K)).toBeNull();
  });

  it('Zweck trennt die Schlüssel: dasselbe AAD, anderer Zweck öffnet nicht', async () => {
    const art = { version: 'x1', aad: () => enc.encode('a') };
    const s = await siegeln(art, enc.encode('geheim'), K);
    expect(new TextDecoder().decode((await entsiegeln(art, s, K))!)).toBe('geheim');
    expect(await entsiegeln({ ...art, zweck: 'anderer' }, s, K)).toBeNull();
    const h = await siegeln({ ...art, zweck: 'z' }, enc.encode('geheim'), K);
    expect(await entsiegeln(art, h, K)).toBeNull();
    expect(await entsiegeln({ ...art, zweck: 'z' }, h, K)).not.toBeNull();
  });
});
