import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { METHODEN } from './methoden';
import { NOTIZEN } from '../data/begleiter';
import { CHAT_BAUM } from '../data/begleiter/chat';
import { TAG_1 } from '../data/begleiter/tag';

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

  // Das Anti-Muster „solution in disguise“ heißt „Lösung statt Chance“, nicht „verkleidete Lösung“ (Markus 11.11.).
  it('nirgends „verkleidete Lösung“ oder „Lösung in Verkleidung“: Seiten, Begleiter, Tageskarte, Chat', () => {
    const VERKLEIDET = /[Vv]erkleid\w*/g;
    const texte = [
      ...['baum', 'hmw', 'problem-rahmen', 'ziel-chance'].map((s) => quelle(`../pages/innolab/methoden/${s}.astro`)),
      quelle('../pages/innolab/tag-1.astro'),
      JSON.stringify(NOTIZEN), JSON.stringify(TAG_1), CHAT_BAUM,
    ];
    expect(texte.flatMap((t) => t.match(VERKLEIDET) ?? [])).toStrictEqual([]);
  });
});
