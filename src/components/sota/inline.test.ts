import { isValidElement, type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { inline, plainText, stageSteps } from './inline';
import { STEPS as BESTELLWEG } from './bestellweg-steps';
import { STEPS as DESIGN_TOKEN } from './design-token-steps';
import { STEPS as KONTEXTFENSTER } from './kontextfenster-steps';
import { STEPS as NAECHSTES_STUECK } from './naechstes-stueck-steps';
import { STEPS as PR_WEG } from './pr-weg-steps';

// Elemente als lesbare Zeichenkette: Typ und Inhalt, damit auch ein falsches Element (z. B. <span>) auffällt.
function alsText(teile: ReturnType<typeof inline>): string[] {
  return teile.map((t) => {
    if (!isValidElement(t)) return String(t);
    const e = t as ReactElement<{ children: string }>;
    return `<${String(e.type)}>${e.props.children}</${String(e.type)}>`;
  });
}

describe('inline', () => {
  it('macht aus Text in Backticks <code>, der Rest bleibt Text', () => {
    expect(alsText(inline('`main` ist live, `push` lädt hoch')))
      .toStrictEqual(['', '<code>main</code>', ' ist live, ', '<code>push</code>', ' lädt hoch']);
  });

  it('Text ohne Backticks bleibt unverändert', () => {
    expect(inline('ohne Code')).toStrictEqual(['ohne Code']);
  });
});

describe('plainText und stageSteps', () => {
  it('der reine Text ist die Beschriftung ohne Backticks', () => {
    expect(plainText('`main` ist live')).toBe('main ist live');
    expect(stageSteps([{ title: 'Push.', text: '`git push` lädt hoch' }])[0].plain).toBe('Push. git push lädt hoch');
  });

  it.each([
    ['Bestellweg', BESTELLWEG],
    ['Design-Token', DESIGN_TOKEN],
    ['Kontextfenster', KONTEXTFENSTER],
    ['Nächstes Stück', NAECHSTES_STUECK],
    ['Pull Request', PR_WEG],
  ])('%s: jeder Backtick hat sein Gegenstück – sonst wird der Rest der Beschriftung zu Code', (_, steps) => {
    for (const s of steps) {
      for (const t of [s.title, s.text]) expect(t.split('`').length % 2, t).toBe(1);
    }
  });
});
