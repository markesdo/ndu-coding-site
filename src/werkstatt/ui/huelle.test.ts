import { describe, expect, it } from 'vitest';
import { darfSpeichern, huelle, ladefehlerHinweis, leererStand, mappeLaden, speicherfehlerHinweis, versucheNach, serverStandNachLaden, serverStandNachSpeichern, speichernErlaubt, statusText, type Ereignis, type HuellenZustand } from './huelle';
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
    expect(lauf('laden', { typ: 'ladenFehlgeschlagen', status: 502, code: 'github-fehler' }).zustand).toBe('ladefehler');
    expect(lauf('laden', { typ: 'ladenFehlgeschlagen', status: 403, code: 'nicht-freigeschaltet' }).zustand).toBe('ladefehler');
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
    // Dass der Entwurf danach abrufbar bleibt (nie gelöscht, Wahl über startStand), prüft entwurf.test.ts.
    expect(huelle('laden', { typ: 'geladen' }).effekte).not.toContain('entwurfLoeschen');
  });

  it('Änderungen werden als Entwurf gesichert; im Konflikt bleibt der Konflikt', () => {
    expect(huelle('bereit', { typ: 'geaendert' })).toStrictEqual({ zustand: 'bereit', effekte: ['entwurfSichern'] });
    expect(huelle('gespeichert', { typ: 'geaendert' }).zustand).toBe('bereit');
    expect(huelle('konflikt', { typ: 'geaendert' })).toStrictEqual({ zustand: 'konflikt', effekte: ['entwurfSichern'] });
  });

  it('Speichern geht nur aus bereit, gespeichert und fehler – nicht aus laden, speichert, konflikt', () => {
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

describe('Ladefehler heilt Tippen nicht', () => {
  it('geaendert aus ladefehler bleibt ladefehler und sichert nichts', () => {
    expect(huelle('ladefehler', { typ: 'geaendert' })).toStrictEqual({ zustand: 'ladefehler', effekte: [] });
  });

  it('Speicherfehler heilt weiter durch Tippen, Ladefehler nur durch Neu versuchen', () => {
    expect(huelle('fehler', { typ: 'geaendert' }).zustand).toBe('bereit');
    expect(huelle('ladefehler', { typ: 'neuLaden' })).toStrictEqual({ zustand: 'laden', effekte: ['neuLaden'] });
    expect(huelle('ladefehler', { typ: 'speichern' }).zustand).toBe('ladefehler');
  });
});

describe('Öffnen setzt alles zurück', () => {
  it('leererStand hat keine alten Daten, keinen Entwurfsrest, keinen Stand', () => {
    expect(leererStand()).toStrictEqual({ daten: null, dirty: false, basisSha: null, aelterEntwurf: null, gesichert: true });
  });

  it('oeffnen führt aus jedem Zustand nach laden, ohne Effekte', () => {
    for (const z of ['bereit', 'gespeichert', 'konflikt', 'fehler', 'ladefehler', 'abgemeldet', 'wird-eingerichtet', 'speichert'] as const) {
      expect(huelle(z, { typ: 'oeffnen' }), z).toStrictEqual({ zustand: 'laden', effekte: [] });
    }
  });
});

describe('Neuversuche bei „wird eingerichtet“', () => {
  it('bleiben während Laden und Einrichten erhalten, sonst Neustart bei 0', () => {
    expect(versucheNach('wird-eingerichtet', 2)).toBe(2);
    expect(versucheNach('laden', 2)).toBe(2);
    for (const z of ['bereit', 'speichert', 'gespeichert', 'konflikt', 'fehler', 'ladefehler', 'abgemeldet'] as const) expect(versucheNach(z, 3), z).toBe(0);
  });
});

describe('Doppeltes Absenden', () => {
  it('während „speichert“ löst ein zweites Speichern nichts aus', () => {
    const erst = huelle('bereit', { typ: 'speichern' });
    expect(darfSpeichern(erst.zustand)).toBe(false);
    expect(huelle(erst.zustand, { typ: 'speichern' })).toStrictEqual({ zustand: 'speichert', effekte: [] });
    for (const z of ['laden', 'speichert', 'konflikt', 'abgemeldet', 'wird-eingerichtet'] as const) expect(darfSpeichern(z)).toBe(false);
    for (const z of ['bereit', 'gespeichert', 'fehler'] as const) expect(darfSpeichern(z)).toBe(true);
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

describe('Stand des Servers für das Formular', () => {
  it('nach dem Laden: die Datei des Servers, null wenn es sie nicht gibt', () => {
    expect(serverStandNachLaden(annahmen, { schon: 'geparst' })).toStrictEqual({ schon: 'geparst' });
    expect(serverStandNachLaden(null, { leer: true })).toBeNull();
  });

  it('nach geglücktem Speichern: das Gesendete', () => {
    const neu = { ...annahmen, stand: '2026-11-01' };
    expect(serverStandNachSpeichern(annahmen, { basisSha: 'b' }, neu)).toBe(neu);
    expect(serverStandNachSpeichern(null, { basisSha: 'b' }, neu)).toBe(neu);
  });

  it('bei Konflikt: unverändert', () => {
    expect(serverStandNachSpeichern(annahmen, { konflikt: true }, { ...annahmen, stand: '2026-12-01' })).toBe(annahmen);
    expect(serverStandNachSpeichern(null, { konflikt: true }, { ...annahmen, stand: '2026-12-01' })).toBeNull();
  });
});

const ICH = { githubId: 1001, login: 'sofie', kohorte: '2026', rolle: 'studierende' as const, repo: 'ndu-innolab/2026-sofie' };
const NUR_STUDIERENDE = 'Als Lehrende*r hast du keine eigene Mappe. Die Mappen der Studierenden findest du unter „Meine Mappe“ (/innolab/mappe).';
function apiFehler(status: number, code: string, message: string) {
  return Object.assign(new Error(message), { status, code });
}
function quelle(o: { ich?: unknown; lesen?: () => Promise<unknown> }) {
  const aufrufe: string[] = [];
  return {
    aufrufe,
    q: {
      ich: async () => (aufrufe.push('ich'), o.ich === undefined ? ICH : (o.ich as typeof ICH | null)),
      lesen: async () => (aufrufe.push('lesen'), o.lesen ? o.lesen() : { daten: null, basisSha: null }),
    },
  };
}

describe('Laden der Hülle (mappeLaden)', () => {
  it('Studierende: ich, dann lesen – auch ohne Repo in /auth/ich (GET artefakt legt an)', async () => {
    for (const repo of [ICH.repo, null]) {
      const { q, aufrufe } = quelle({ ich: { ...ICH, repo } });
      expect((await mappeLaden(q)).typ).toBe('geladen');
      expect(aufrufe).toStrictEqual(['ich', 'lesen']);
    }
  });
  it('Anlegen dauert: „wird eingerichtet“ mit Person', async () => {
    const { q } = quelle({ ich: { ...ICH, repo: null }, lesen: () => Promise.reject(apiFehler(503, 'wird-eingerichtet', 'Deine Mappe wird eingerichtet.')) });
    const r = await mappeLaden(q);
    expect(r).toMatchObject({ typ: 'fehler', status: 503, code: 'wird-eingerichtet', ich: { githubId: 1001 } });
    if (r.typ !== 'fehler') throw new Error('unerreichbar');
    expect(huelle('laden', { typ: 'ladenFehlgeschlagen', status: r.status, code: r.code }).zustand).toBe('wird-eingerichtet');
  });
  it('Studierende ohne Repo, Mappe gehört jemand anderem: Meldung des Servers, kein Neuversuch', async () => {
    const fremd = 'Diese Mappe gehört nicht zu deiner Anmeldung. Schreib Markus.';
    const { q } = quelle({ ich: { ...ICH, repo: null }, lesen: () => Promise.reject(apiFehler(403, 'nicht-freigeschaltet', fremd)) });
    const r = await mappeLaden(q);
    if (r.typ !== 'fehler') throw new Error('unerreichbar');
    expect(huelle('laden', { typ: 'ladenFehlgeschlagen', status: r.status, code: r.code }).zustand).toBe('ladefehler');
    expect(ladefehlerHinweis(r.code, r.meldung)).toStrictEqual({ text: fremd, nochmal: false });
  });
  it('Lehrende: lesen liefert die Meldung des Servers; Ladefehler statt „wird eingerichtet“', async () => {
    const { q, aufrufe } = quelle({ ich: { ...ICH, rolle: 'lehrende', repo: null }, lesen: () => Promise.reject(apiFehler(403, 'nicht-freigeschaltet', NUR_STUDIERENDE)) });
    const r = await mappeLaden(q);
    expect(aufrufe).toStrictEqual(['ich', 'lesen']);
    if (r.typ !== 'fehler') throw new Error('unerreichbar');
    expect(huelle('laden', { typ: 'ladenFehlgeschlagen', status: r.status, code: r.code }).zustand).toBe('ladefehler');
    expect(ladefehlerHinweis(r.code, r.meldung)).toStrictEqual({ text: NUR_STUDIERENDE, nochmal: false });
  });
  it('nicht angemeldet: abgemeldet, auch bei 401 mitten im Laden', async () => {
    expect(await mappeLaden(quelle({ ich: null }).q)).toStrictEqual({ typ: 'abgemeldet' });
    expect(await mappeLaden(quelle({ lesen: () => Promise.reject(apiFehler(401, 'nicht-angemeldet', '')) }).q)).toStrictEqual({ typ: 'abgemeldet' });
  });
  it('unlesbare Datei: Meldung des Servers, Neu versuchen bleibt', async () => {
    const unlesbar = 'Die gespeicherte Datei lässt sich nicht lesen. Stell sie auf GitHub wieder her oder schreib Markus.';
    const r = await mappeLaden(quelle({ lesen: () => Promise.reject(apiFehler(502, 'github-fehler', unlesbar)) }).q);
    if (r.typ !== 'fehler') throw new Error('unerreichbar');
    expect(ladefehlerHinweis(r.code, r.meldung)).toStrictEqual({ text: unlesbar, nochmal: true });
  });
  it('kein Netz (leere Meldung) und Fremdfehler: eigener Text mit Neuversuch', async () => {
    const r = await mappeLaden(quelle({ lesen: () => Promise.reject(apiFehler(0, 'github-fehler', '')) }).q);
    if (r.typ !== 'fehler') throw new Error('unerreichbar');
    expect(ladefehlerHinweis(r.code, r.meldung)).toStrictEqual({ text: 'Deine Mappe lässt sich gerade nicht laden.', nochmal: true });
    const x = await mappeLaden(quelle({ lesen: () => Promise.reject(new TypeError('kaputt')) }).q);
    expect(x).toMatchObject({ typ: 'fehler', status: 0, code: 'unbekannt', meldung: null });
    expect(ladefehlerHinweis('datei', null).nochmal).toBe(false);
  });
});

describe('Hinweis nach gescheitertem Speichern', () => {
  const felder = [
    { pfad: 'entscheidungen.2', meldung: 'D3: Gespeicherte Entscheidungen lassen sich nicht ändern – ersetze sie stattdessen.' },
    { pfad: 'entscheidungen.2', meldung: 'D3: Gespeicherte Entscheidungen lassen sich nicht ändern – ersetze sie stattdessen.' },
  ];
  it('abgelehnt (422): Meldung des Servers und jede Feldmeldung, auch ohne passendes Formularfeld', () => {
    expect(speicherfehlerHinweis('Das lässt sich so nicht speichern. Bitte prüfe die markierten Felder.', felder, true)).toStrictEqual({
      text: 'Das lässt sich so nicht speichern. Bitte prüfe die markierten Felder. Dein Entwurf ist auf diesem Gerät gesichert.',
      details: ['D3: Gespeicherte Entscheidungen lassen sich nicht ändern – ersetze sie stattdessen.'],
    });
  });
  it('unlesbare Datei (502): Meldung des Servers, Entwurf ungesichert', () => {
    const unlesbar = 'Entscheidungslog: Die gespeicherte Datei lässt sich nicht lesen. Stell sie auf GitHub wieder her oder schreib Markus.';
    expect(speicherfehlerHinweis(unlesbar, [], false).text).toBe(`${unlesbar} Dein Entwurf konnte auf diesem Gerät nicht gesichert werden – lass diesen Tab offen.`);
  });
  it('ohne Meldung (kein Netz): „gerade nicht möglich“', () => {
    expect(speicherfehlerHinweis(null, [], true)).toStrictEqual({ text: 'Speichern gerade nicht möglich. Dein Entwurf ist auf diesem Gerät gesichert.', details: [] });
  });
});
