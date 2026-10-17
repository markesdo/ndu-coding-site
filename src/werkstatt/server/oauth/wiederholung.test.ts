import { describe, expect, it } from 'vitest';
import { antwortOeffnen, antwortVersiegeln } from './wiederholung';

describe('Antwort für Neuversuche', () => {
  const inhalt = { erstellt: 1000, paar: { access_token: 'A-geheim', refresh_token: 'R-geheim' } };

  it('öffnet sich nur mit demselben Refresh-Token', async () => {
    const v = await antwortVersiegeln('R1', inhalt);
    expect(await antwortOeffnen('R1', v)).toStrictEqual(inhalt);
    expect(await antwortOeffnen('R2', v)).toBeNull();
  });

  it('der Cache-Wert enthält die Tokens nicht im Klartext', async () => {
    const v = await antwortVersiegeln('R1', inhalt);
    expect(JSON.stringify(v)).not.toContain('geheim');
  });

  it('Müll und Fehlendes ergeben null', async () => {
    expect(await antwortOeffnen('R1', undefined)).toBeNull();
    expect(await antwortOeffnen('R1', { iv: 'x', daten: 'y' })).toBeNull();
    expect(await antwortOeffnen('R1', inhalt)).toBeNull();
  });
});
