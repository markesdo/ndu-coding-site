import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { METHODEN } from './methoden';
import { NOTIZEN } from '../data/begleiter';
import { CHAT_BAUM } from '../data/begleiter/chat';

// Begriffe am Opportunity Solution Tree, wie Produktleute sie sagen: übergeordnete Chance, Teilchance, Geschwister –
// nicht „Eltern“, „Elternteil“, „Kind“. Anker, Dateinamen und Prüfpunkt-IDs (#eltern-kind, eltern-kind.jpg,
// baum-ein-elternteil) bleiben, sie sind klein geschrieben und fallen nicht unter das Muster.
const ALT = /\b(Eltern\w*|Kind|Kinder|Kindern|Kindes)\b/g;
const quelle = (pfad: string) => readFileSync(new URL(pfad, import.meta.url), 'utf8');

describe('Begriffe am Opportunity Solution Tree', () => {
  it.each(['../pages/innolab/methoden/baum.astro', '../pages/innolab/methoden/ziel-chance.astro'])('%s sagt nicht Eltern oder Kind', (datei) => {
    expect(quelle(datei).match(ALT) ?? []).toStrictEqual([]);
  });

  it('Prüflisten von Baum und Ziel-Chance, Begleiter-Notizen zum Baum und Chat-Text auch nicht', () => {
    const texte = [
      ...METHODEN.filter((m) => m.slug === 'baum' || m.slug === 'ziel-chance').flatMap((m) => (m.pruefliste ?? []).map((p) => p.text)),
      JSON.stringify(NOTIZEN['/innolab/methoden/baum']),
      CHAT_BAUM,
    ];
    expect(texte.flatMap((t) => t.match(ALT) ?? [])).toStrictEqual([]);
  });
});
