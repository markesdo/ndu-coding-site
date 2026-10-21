import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import Textfeld from './Textfeld';

const html = (hinweis?: string) => renderToStaticMarkup(<Textfeld label="Notizen" wert="" onChange={() => {}} hinweis={hinweis} />);

describe('Textfeld: Hinweis', () => {
  it('zeigt den Hinweis am Feld und verknüpft ihn mit aria-describedby, ohne aria-invalid', () => {
    const h = html('Klingt nach einem Namen.');
    const id = /<p class="wk-feldhinweis" id="([^"]+)" role="status">Klingt nach einem Namen\.<\/p>/.exec(h)?.[1];
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
