import { describe, expect, it } from 'vitest';
import { lueckenMarkieren } from './luecken';

describe('lueckenMarkieren', () => {
  it('markiert Platzhalter und behält die Klammern im Text', () => {
    expect(lueckenMarkieren('Setze Issue [Nummer] um.')).toBe('Setze Issue <mark class="luecke">[Nummer]</mark> um.');
  });

  it('markiert mehrere Platzhalter, auch mit Leerzeichen und Komma', () => {
    expect(lueckenMarkieren('[Idee in einem Satz] und [Beschreibung, oder Screenshot einfügen]')).toBe(
      '<mark class="luecke">[Idee in einem Satz]</mark> und <mark class="luecke">[Beschreibung, oder Screenshot einfügen]</mark>',
    );
  });

  it('lässt Pfadsegmente wie /events/[id] unverändert', () => {
    expect(lueckenMarkieren('baue die Seite /events/[id] nach')).toBe('baue die Seite /events/[id] nach');
  });

  it('lässt Array-Zugriffe und JSON-Listen in Ruhe', () => {
    expect(lueckenMarkieren('liste[0] und ["context7"]')).toBe('liste[0] und ["context7"]');
  });

  it('ändert nichts innerhalb von Tags', () => {
    const html = '<code data-x="[nicht]">Text</code> [Name]';
    expect(lueckenMarkieren(html)).toBe('<code data-x="[nicht]">Text</code> <mark class="luecke">[Name]</mark>');
  });

  it('lässt Text ohne Platzhalter unverändert', () => {
    const html = 'claude mcp add --transport http context7 https://mcp.context7.com/mcp';
    expect(lueckenMarkieren(html)).toBe(html);
  });
});
