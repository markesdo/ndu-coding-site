import { describe, expect, it } from 'vitest';
import { huelle, speichernErlaubt, statusText, type Ereignis, type HuellenZustand } from './huelle';
import annahmen from '../beispiele/annahmen.json';

function lauf(start: HuellenZustand, ...ereignisse: Ereignis[]) {
  let zustand = start;
  const effekte: string[][] = [];
  for (const e of ereignisse) {
    const r = huelle(zustand, e);
    zustand = r.zustand;
    effekte.push(r.effekte);
  }
  return { zustand, effekte };
}

describe('Zustandsmaschine der Editor-Hülle', () => {
  it('Laden: geladen → bereit, 401 → abgemeldet, wird-eingerichtet, sonst fehler', () => {
    expect(lauf('laden', { typ: 'geladen' }).zustand).toBe('bereit');
    expect(lauf('laden', { typ: 'ladenFehlgeschlagen', status: 401, code: 'nicht-angemeldet' }).zustand).toBe('abgemeldet');
    expect(lauf('laden', { typ: 'ladenFehlgeschlagen', status: 503, code: 'wird-eingerichtet' }).zustand).toBe('wird-eingerichtet');
    expect(lauf('laden', { typ: 'ladenFehlgeschlagen', status: 502, code: 'github-fehler' }).zustand).toBe('fehler');
  });

  it('Entwurf bleibt bei 401 und 502: sichern beim Speichern, nie löschen', () => {
    const a = lauf('bereit', { typ: 'speichern' }, { typ: 'speichernFehlgeschlagen', status: 401, code: 'nicht-angemeldet' });
    expect(a.zustand).toBe('abgemeldet');
    expect(a.effekte[0]).toContain('entwurfSichern');
    expect(a.effekte.flat()).not.toContain('entwurfLoeschen');

    const b = lauf('bereit', { typ: 'speichern' }, { typ: 'speichernFehlgeschlagen', status: 502, code: 'github-fehler' });
    expect(b.zustand).toBe('fehler');
    expect(b.effekte[0]).toContain('entwurfSichern');
    expect(b.effekte.flat()).not.toContain('entwurfLoeschen');
  });

  it('nur gespeichert löscht den Entwurf', () => {
    const r = lauf('bereit', { typ: 'speichern' }, { typ: 'gespeichert' });
    expect(r.zustand).toBe('gespeichert');
    expect(r.effekte[1]).toStrictEqual(['entwurfLoeschen']);
    expect(r.effekte[0]).not.toContain('entwurfLoeschen');
  });

  it('Konflikt: Zustand konflikt, Entwurf bleibt; neu laden holt den Server-Stand', () => {
    const k = lauf('bereit', { typ: 'speichern' }, { typ: 'speichernFehlgeschlagen', status: 409, code: 'konflikt' });
    expect(k.zustand).toBe('konflikt');
    expect(k.effekte.flat()).not.toContain('entwurfLoeschen');
    const n = huelle('konflikt', { typ: 'neuLaden' });
    expect(n.zustand).toBe('laden');
    expect(n.effekte).toStrictEqual(['neuLaden']);
    expect(n.effekte).not.toContain('entwurfLoeschen');
    // Entwurf bleibt auch nach dem Neuladen abrufbar: geladen → bereit ohne Löschen.
    expect(huelle('laden', { typ: 'geladen' }).effekte).toStrictEqual([]);
  });

  it('Änderungen werden als Entwurf gesichert; im Konflikt bleibt der Konflikt', () => {
    expect(huelle('bereit', { typ: 'geaendert' })).toStrictEqual({ zustand: 'bereit', effekte: ['entwurfSichern'] });
    expect(huelle('gespeichert', { typ: 'geaendert' }).zustand).toBe('bereit');
    expect(huelle('konflikt', { typ: 'geaendert' })).toStrictEqual({ zustand: 'konflikt', effekte: ['entwurfSichern'] });
  });

  it('Speichern geht nur aus bereit, fehler und abgemeldet-nach-Login nicht aus laden', () => {
    expect(huelle('laden', { typ: 'speichern' })).toStrictEqual({ zustand: 'laden', effekte: [] });
    expect(huelle('speichert', { typ: 'speichern' })).toStrictEqual({ zustand: 'speichert', effekte: [] });
    expect(huelle('fehler', { typ: 'speichern' }).zustand).toBe('speichert');
  });

  it('Statuswörter', () => {
    expect(statusText('gespeichert', true)).toBe('Gespeichert');
    expect(statusText('konflikt', true)).toBe('Inzwischen geändert');
    expect(statusText('bereit', true)).toBe('Entwurf');
    expect(statusText('fehler', true)).toBe('Entwurf');
    expect(statusText('bereit', false)).toBe('');
  });
});

describe('Speichern sperren', () => {
  it('Beispiel ist speicherbar', () => {
    expect(speichernErlaubt('annahmen', annahmen)).toStrictEqual({ erlaubt: true, fehler: [] });
  });

  it('Prüflisten-Hinweise (keine „machbar“-Annahme) sperren nicht', () => {
    const nurEine = { ...annahmen, riskanteste: undefined, annahmen: [{ ...annahmen.annahmen[0], art: 'wuenschenswert' }] };
    expect(speichernErlaubt('annahmen', nurEine).erlaubt).toBe(true);
    expect(speichernErlaubt('annahmen', { ...annahmen, riskanteste: undefined, annahmen: [] }).erlaubt).toBe(true);
  });

  it('Schemafehler sperren und nennen den Pfad', () => {
    const r = speichernErlaubt('annahmen', { ...annahmen, stand: 'gestern' });
    expect(r.erlaubt).toBe(false);
    expect(r.fehler.map((f) => f.pfad)).toContain('stand');
  });
});
