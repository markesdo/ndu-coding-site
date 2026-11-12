import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { METHODEN } from '../components/methoden';
import { NOTIZEN_JOURNEY_MAP } from '../data/begleiter/journey-map';

// Experience Map: Marken haben eine Form – „Tief · I3-3 · 2 von 5“, „Ende · I3-5 · 1 von 5“ (im Raster je Geschichte
// ohne Zahl: „Tief · I2-1“). Die alte Doppelform „Tief · I3-3 – Tief in 2 von 5“ darf nirgends zurückkommen.
const ALT = / – (Tief|Ende) in |(Tief|Ende) in \d von|(Tief|Ende) · I\d-\d – /g;
const quelle = (pfad: string) => readFileSync(new URL(pfad, import.meta.url), 'utf8');
const pruefliste = METHODEN.find((m) => m.slug === 'journey-map')?.pruefliste ?? [];

describe('Experience Map: eine Markenform', () => {
  it('journey-map.astro ohne alte Markenform', () => {
    expect(quelle('../pages/innolab/methoden/journey-map.astro').match(ALT) ?? []).toStrictEqual([]);
  });

  it('Begleiter journey-map ohne alte Markenform', () => {
    expect(JSON.stringify(NOTIZEN_JOURNEY_MAP).match(ALT) ?? []).toStrictEqual([]);
  });

  it('Prüfliste journey-map ohne alte Markenform, Beispiel in neuer Form', () => {
    expect(pruefliste.length).toBeGreaterThan(0);
    expect(JSON.stringify(pruefliste).match(ALT) ?? []).toStrictEqual([]);
    const marke = pruefliste.find((p) => p.id === 'journey-map-hoehepunkt-ende');
    expect(marke?.kurz).toContain('‚Tief · I3-3 · 2 von 5‘');
    expect(marke?.text).toContain('‚Tief · I3-3 · 2 von 5‘');
  });
});
