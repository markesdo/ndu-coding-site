import { describe, expect, it } from 'vitest';
import { schluesselAbgleichen, schluesselSchieben } from './schluessel';

describe('stabile Zeilenschlüssel der Liste', () => {
  it('neue Zeilen bekommen neue, nie wiederverwendete Schlüssel', () => {
    const z = { n: 0 };
    const a = schluesselAbgleichen([], 3, z);
    expect(a).toStrictEqual(['z0', 'z1', 'z2']);
    // Eine Zeile entfernen und eine hinzufügen: der entfernte Schlüssel kommt nicht wieder.
    const b = schluesselAbgleichen(a.filter((k) => k !== 'z1'), 3, z);
    expect(b).toStrictEqual(['z0', 'z2', 'z3']);
  });

  it('Schlüssel hängen nicht am Inhalt: Ändern der ID einer Zeile ändert keinen Schlüssel', () => {
    const z = { n: 0 };
    const a = schluesselAbgleichen([], 2, z);
    expect(schluesselAbgleichen(a, 2, z)).toStrictEqual(a);
  });

  it('kürzt auf die Länge der Liste (Daten wurden von außen ersetzt)', () => {
    expect(schluesselAbgleichen(['z0', 'z1', 'z2'], 1, { n: 3 })).toStrictEqual(['z0']);
  });

  it('Verschieben tauscht die Schlüssel mit den Zeilen', () => {
    expect(schluesselSchieben(['a', 'b', 'c'], 0, 1)).toStrictEqual(['b', 'a', 'c']);
    expect(schluesselSchieben(['a', 'b', 'c'], 2, -1)).toStrictEqual(['a', 'c', 'b']);
  });
});
