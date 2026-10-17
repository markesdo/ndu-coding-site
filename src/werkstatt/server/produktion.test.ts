import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiAusnahme } from './antwort';
import { produktionsAbhaengigkeiten } from './produktion';

describe('produktionsAbhaengigkeiten.speicher', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('ohne Secrets: Zugriff auf speicher wirft nicht, die erste Anfrage scheitert mit 503 – ohne GitHub zu rufen', async () => {
    const f = vi.fn(async () => {
      throw new Error('GitHub darf im Test nicht gerufen werden');
    });
    vi.stubGlobal('fetch', f);
    const abh = produktionsAbhaengigkeiten({});
    const s = abh.speicher;
    expect(abh.speicher).toBe(s);
    const fehler = await s.lesen('2026-sofie', 'brief').catch((e: unknown) => e);
    expect(fehler).toBeInstanceOf(ApiAusnahme);
    expect((fehler as ApiAusnahme).status).toBe(503);
    expect(f).not.toHaveBeenCalled();
  });
});
