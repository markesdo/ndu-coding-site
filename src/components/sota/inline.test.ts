import { isValidElement, type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { inline } from './inline';

describe('inline', () => {
  it('macht aus Text in Backticks <code>, der Rest bleibt Text', () => {
    const teile = inline('`main` ist live, `push` lädt hoch');
    expect(teile.map((t) => (isValidElement(t) ? `<code>${(t as ReactElement<{ children: string }>).props.children}</code>` : t)))
      .toStrictEqual(['', '<code>main</code>', ' ist live, ', '<code>push</code>', ' lädt hoch']);
  });

  it('Text ohne Backticks bleibt unverändert', () => {
    expect(inline('ohne Code')).toStrictEqual(['ohne Code']);
  });
});
