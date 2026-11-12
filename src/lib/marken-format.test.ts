import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { METHODEN } from '../components/methoden';
import { NOTIZEN_JOURNEY_MAP } from '../data/begleiter/journey-map';

// Experience Map: Marken haben eine Form – Wort mit Zitat-ID am Moment, ohne Zahl: „Tief · I3-3“, „Ende · I3-5“;
// mehrere Geschichten im selben Moment: mehrere IDs („Tief · I3-3 · I5-6“). Gezählt wird nur das Vorkommen der Knoten
// („3 von 5“ am Namen-Sticky). Weder die alte Doppelform „Tief · I3-3 – Tief in 2 von 5“ noch die Zahlform
// „Tief · I3-3 · 2 von 5“ (auch ohne ID in der Legende, „Tief · 2 von 5“, oder im aria-label, „Tief I3-3, 2 von 5“)
// darf zurückkommen.
const ALT = / – (Tief|Ende) in |(Tief|Ende) in \d+ von|(Tief|Ende) · I\d+-\d+ – |(Tief|Ende) · I\d+-\d+(?: · I\d+-\d+)* · \d+ von|(Tief|Ende) · \d+ von|(Tief|Ende) I\d+-\d+, \d+ von/g;
const quelle = (pfad: string) => readFileSync(new URL(pfad, import.meta.url), 'utf8');
const pruefliste = METHODEN.find((m) => m.slug === 'journey-map')?.pruefliste ?? [];

describe('Experience Map: eine Markenform', () => {
  it('journey-map.astro ohne alte Markenform', () => {
    expect(quelle('../pages/innolab/methoden/journey-map.astro').match(ALT) ?? []).toStrictEqual([]);
  });

  it('ziel-chance.astro ohne alte Markenform', () => {
    expect(quelle('../pages/innolab/methoden/ziel-chance.astro').match(ALT) ?? []).toStrictEqual([]);
  });

  it('Begleiter journey-map ohne alte Markenform', () => {
    expect(JSON.stringify(NOTIZEN_JOURNEY_MAP).match(ALT) ?? []).toStrictEqual([]);
  });

  it('Prüfliste journey-map ohne alte Markenform, Beispiel in neuer Form', () => {
    expect(pruefliste.length).toBeGreaterThan(0);
    expect(JSON.stringify(pruefliste).match(ALT) ?? []).toStrictEqual([]);
    const marke = pruefliste.find((p) => p.id === 'journey-map-hoehepunkt-ende');
    expect(marke?.kurz).toContain('‚Tief · I3-3‘');
    expect(marke?.text).toContain('‚Tief · I3-3‘');
  });
});
