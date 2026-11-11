import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import VerweisAuswahl from './VerweisAuswahl';

const html = (hinweis?: string) => renderToStaticMarkup(<VerweisAuswahl label="Belege" werte={[]} onChange={() => {}} hinweis={hinweis} />);

describe('VerweisAuswahl: Hinweis', () => {
  it('zeigt den Hinweis und verknüpft ihn mit aria-describedby, ohne aria-invalid', () => {
    const h = html('Noch kein Beleg.');
    const id = /<p class="wk-feldhinweis" id="([^"]+)">Noch kein Beleg\.<\/p>/.exec(h)?.[1];
    expect(id).toBeTruthy();
    expect(h).toContain(`aria-describedby="${id}"`);
    expect(h).not.toContain('aria-invalid');
  });

  it('ohne Hinweis kein Absatz und kein aria-describedby', () => {
    const h = html();
    expect(h).not.toContain('wk-feldhinweis');
    expect(h).not.toContain('aria-describedby');
  });
});
