import { afterEach, describe, expect, it, vi } from 'vitest';
import { ARTEFAKT_NAMEN } from '../schemas/index.js';
import { ROUTEN, type MappeStand } from '../vertrag.js';
import { api, ApiError } from './api.js';
import { NACH_MOM_TEST } from '../../components/innolab-zeiten.js';
import { FEHLER_TEXT, adresseOhneFehler, anmeldeFehler, leitfadenFrei, mappeZeilen } from './mappe-hilfen.js';

describe('anmeldeFehler', () => {
  it('liefert für die Rücksprünge der Anmeldung den Text (Spec §5)', () => {
    expect(anmeldeFehler('?fehler=nicht-freigeschaltet')).toStrictEqual({
      code: 'nicht-freigeschaltet',
      text: 'Du bist für keinen Kurs freigeschaltet. Schreib Markus deinen GitHub-Namen.',
      neuAnmelden: false,
    });
    expect(anmeldeFehler('?fehler=anmeldung-ungueltig')).toMatchObject({ code: 'anmeldung-ungueltig', neuAnmelden: true });
    expect(anmeldeFehler('?x=1&fehler=anmeldung-fehlgeschlagen')).toMatchObject({ code: 'anmeldung-fehlgeschlagen', neuAnmelden: true });
    for (const t of Object.values(FEHLER_TEXT)) expect(t.length).toBeGreaterThan(20);
  });

  it('ignoriert fehlende und unbekannte Codes', () => {
    expect(anmeldeFehler('')).toBeNull();
    expect(anmeldeFehler('?fehler=')).toBeNull();
    expect(anmeldeFehler('?fehler=<script>')).toBeNull();
    expect(anmeldeFehler('?fehler=toString')).toBeNull();
  });
});

describe('adresseOhneFehler', () => {
  it('nimmt nur ?fehler aus der Adresse, der Rest bleibt', () => {
    expect(adresseOhneFehler('/innolab/mappe', '?fehler=anmeldung-ungueltig', '')).toBe('/innolab/mappe');
    expect(adresseOhneFehler('/innolab/mappe', '?a=1&fehler=x&b=2', '#claude')).toBe('/innolab/mappe?a=1&b=2#claude');
  });
});

describe('leitfadenFrei', () => {
  it('gibt den Leitfaden-Editor erst nach dem Mom Test frei (Wiener Zeit), den Präsentator immer', () => {
    expect(NACH_MOM_TEST).toBe('2026-10-22T13:45');
    expect(leitfadenFrei(new Date('2026-10-22T11:44:00Z'), false)).toBe(false); // 13:44 in Wien
    expect(leitfadenFrei(new Date('2026-10-22T11:45:00Z'), false)).toBe(true);
    expect(leitfadenFrei(new Date('2026-10-17T08:00:00Z'), false)).toBe(false);
    expect(leitfadenFrei(new Date('2026-10-17T08:00:00Z'), true)).toBe(true);
  });
});

describe('mappeZeilen', () => {
  it('listet alle Artefakte der Mappe in fester Reihenfolge mit Titel, Methodenseite und Stand', () => {
    const stand: MappeStand = { kohorte: '2026', repo: '2026-sofie', artefakte: [{ name: 'annahmen', vorhanden: true }, { name: 'brief', vorhanden: false }] };
    const z = mappeZeilen(stand);
    expect(z.map((x) => x.name)).toStrictEqual([...ARTEFAKT_NAMEN]);
    expect(z.find((x) => x.name === 'annahmen')).toStrictEqual({ name: 'annahmen', titel: 'Annahmen-Map', href: '/innolab/methoden/annahmen', vorhanden: true });
    // Fehlt ein Artefakt in der Antwort, gilt es als offen.
    expect(z.filter((x) => x.vorhanden).map((x) => x.name)).toStrictEqual(['annahmen']);
  });
});

describe('api.mappe', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('liest den Stand der Mappe', async () => {
    const stand: MappeStand = { kohorte: '2026', repo: '2026-sofie', artefakte: [] };
    const f = vi.fn(async () => new Response(JSON.stringify(stand), { status: 200 }));
    vi.stubGlobal('fetch', f);
    await expect(api.mappe()).resolves.toStrictEqual(stand);
    expect(f).toHaveBeenCalledWith(ROUTEN.mappe.pfad, expect.objectContaining({ method: 'GET', credentials: 'same-origin' }));
  });

  it('meldet „wird eingerichtet“ als ApiError mit Code', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ code: 'wird-eingerichtet', fehler: 'Deine Mappe wird eingerichtet …' }), { status: 503 })));
    const e = await api.mappe().catch((x: unknown) => x);
    expect(e).toBeInstanceOf(ApiError);
    expect(e).toMatchObject({ status: 503, code: 'wird-eingerichtet' });
  });
});
