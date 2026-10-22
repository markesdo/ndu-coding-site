import { describe, expect, it } from 'vitest';
import type { Befund } from '../verknuepfungen';
import type { LehrendenAnsicht, LehrendenArtefakt, LehrendenMappe } from '../vertrag';
import {
  adresseMitLeser, alleGithubFehler, anfragePfad, inhaltPfad, dateiVerlaufUrl, kurstagText, leserAusAdresse, leserKopf, lueckenJeArtefakt, nachbar,
  personText, spaltenHinweis, standText, tagText, vorZeit, zelle, zellenLabel, zuerstAnsehen,
} from './lehrenden-hilfen';

const A = (o: Partial<LehrendenArtefakt> = {}): LehrendenArtefakt => ({
  name: 'brief', stand: 'vorhanden', umfang: '4 von 6 Feldern', fehlt: [], leer: false, faelligZuTag: 2, faellig: true, commits: 0, mehr: false, zuletzt: '2026-10-21T22:30:00Z', ...o,
});
const TAG1 = { tag: 1, datum: '2026-10-22' };
const HEUTE_TAG1 = { tag: 1, titel: 'Rahmen & Verstehen', lage: 'heute' as const };
const TAG2 = { tag: 2, titel: 'Verstehen & Synthese', lage: 'naechster' as const };
const JETZT = Date.parse('2026-10-24T10:00:00Z');
const befund = (artefakt: Befund['artefakt'], ort: string): Befund => ({ art: 'fehlender-beleg', artefakt, ort, text: ort });
const bereit = (kuerzel: string, artefakte: LehrendenArtefakt[], luecken: Befund[] = [], zuletzt: string | null = null): LehrendenMappe => ({
  kuerzel, zustand: 'bereit', repo: `2026-${kuerzel}`, repoUrl: `https://github.com/ndu-innolab/2026-${kuerzel}`, zuletzt, artefakte, luecken,
});
const ansicht = (personen: LehrendenMappe[], o: Partial<LehrendenAnsicht> = {}): LehrendenAnsicht => ({
  kohorte: '2026', kohorten: [], kurstag: TAG2, spalten: [], tage: [TAG1], bezug: TAG1, personen, ...o,
});

describe('Kopf', () => {
  it('anfragePfad', () => {
    expect(anfragePfad()).toBe('/api/werkstatt/lehrende');
    expect(anfragePfad('2026', 1)).toBe('/api/werkstatt/lehrende?kohorte=2026&seit=1');
    expect(inhaltPfad('2026', 'k 1', 'brief')).toBe('/api/werkstatt/lehrende/artefakt?kohorte=2026&person=k+1&artefakt=brief');
  });
  it('kurstagText, tagText, spaltenHinweis', () => {
    expect(kurstagText(HEUTE_TAG1)).toBe('Heute Tag 1');
    expect(kurstagText(TAG2)).toBe('Als Nächstes Tag 2');
    expect(kurstagText({ tag: 7, titel: 'Präsentation', lage: 'vorbei' })).toBe('Kurs vorbei (zuletzt Tag 7)');
    expect(tagText(TAG1)).toBe('Tag 1 (22.10.2026)');
    expect(spaltenHinweis({ name: 'brief', faelligZuTag: 2, hausaufgabe: false })).toBe('fällig Tag 2');
    expect(spaltenHinweis({ name: 'interviews', faelligZuTag: 2, hausaufgabe: true })).toBe('Hausaufgabe');
  });
  it('standText: Uhrzeit in Wien, nach mehr als fünf Minuten relativ', () => {
    const geladen = Date.parse('2026-10-24T08:42:00Z');
    expect(standText(geladen, geladen + 60_000)).toBe('Stand 10:42');
    expect(standText(geladen, geladen + 5 * 60_000)).toBe('Stand 10:42');
    expect(standText(geladen, geladen + 6 * 60_000)).toBe('Stand vor 6 Min.');
  });
  it('vorZeit', () => {
    expect(vorZeit('2026-10-24T09:59:30Z', JETZT)).toBe('gerade eben');
    expect(vorZeit('2026-10-24T09:55:00Z', JETZT)).toBe('vor 5 Min.');
    expect(vorZeit('2026-10-24T07:00:00Z', JETZT)).toBe('vor 3 Std.');
    expect(vorZeit('2026-10-23T09:00:00Z', JETZT)).toBe('vor 1 Tag');
    expect(vorZeit('2026-10-21T22:30:00Z', JETZT)).toBe('vor 2 Tagen');
  });
});

describe('zelle', () => {
  it('vorhanden mit Umfang; geändert nur bei Commits seit dem Bezugstag', () => {
    expect(zelle(A({ commits: 2 }), TAG1)).toStrictEqual({ art: 'vorhanden', wort: 'vorhanden', umfang: '4 von 6 Feldern', geaendert: 'geändert seit Tag 1' });
    expect(zelle(A(), TAG1).geaendert).toBeNull();
    // Ohne Bezugstag kein „geändert seit“ (gezählt wird alles, das sagt der Hinweis oben).
    expect(zelle(A({ commits: 2 }), null).geaendert).toBeNull();
  });
  it('offen: fällig nach dem Flag des Servers, sonst „noch nicht dran“', () => {
    const offen = A({ stand: 'offen', umfang: null, zuletzt: null });
    expect(zelle(offen, TAG1)).toStrictEqual({ art: 'faellig-offen', wort: 'fällig, offen', umfang: null, geaendert: null });
    expect(zelle({ ...offen, faellig: false }, TAG1)).toStrictEqual({ art: 'offen', wort: 'noch nicht dran', umfang: null, geaendert: null });
  });
  it('gespeichert, aber leer, zählt als offen (kein „dünn“)', () => {
    expect(zelle(A({ leer: true, umfang: '0 Annahmen' }), TAG1).art).toBe('faellig-offen');
  });
  it('unlesbar', () => {
    expect(zelle(A({ stand: 'unlesbar', umfang: null }), TAG1)).toMatchObject({ art: 'unlesbar', wort: 'passt nicht zum Format' });
  });
  it('zellenLabel', () => {
    expect(zellenLabel('k2', 'interviews', zelle(A({ name: 'interviews', stand: 'offen' }), TAG1))).toBe('k2, Interviews und Snapshots: fällig, offen');
    expect(zellenLabel('k1', 'brief', zelle(A({ commits: 1 }), TAG1))).toBe('k1, Produkt-Brief: vorhanden, 4 von 6 Feldern, geändert seit Tag 1');
  });
});

describe('Personen und Leiste', () => {
  it('personText je Zustand', () => {
    expect(personText(bereit('k1', [], [], '2026-10-22T10:00:00Z'), JETZT)).toBe('zuletzt aktiv vor 2 Tagen');
    expect(personText(bereit('k1', []), JETZT)).toBe('noch nichts gespeichert');
    expect(personText({ kuerzel: 'k2', zustand: 'keine-mappe' }, JETZT)).toBe('noch nicht angemeldet');
    expect(personText({ kuerzel: 'k3', zustand: 'fehler', grund: 'github' }, JETZT)).toBe('gerade nicht lesbar – später neu laden');
    expect(personText({ kuerzel: 'k3', zustand: 'fehler', grund: 'zuordnung' }, JETZT)).toBe('Repo passt nicht zur Zugangsliste – Zugangsliste prüfen');
  });

  it('zuerstAnsehen: nichts gespeichert, fällig und offen, Lücken', () => {
    const a = ansicht([
      bereit('k1', [A({ commits: 1 })], [befund('brief', 'x'), befund('brief', 'y'), befund('annahmen', 'z')]),
      bereit('k2', [A(), A({ name: 'interviews', stand: 'offen', faelligZuTag: 2 })]),
      bereit('k3', [A({ name: 'leitfaden', commits: 1, stand: 'offen', faelligZuTag: 3, faellig: false })]),
      { kuerzel: 'k4', zustand: 'keine-mappe' },
    ]);
    expect(zuerstAnsehen(a)).toStrictEqual([
      { art: 'nicht-angemeldet', text: 'Noch nicht angemeldet: k4' },
      { art: 'nichts-seit', text: 'Seit Tag 1 nichts gespeichert: k2' },
      { art: 'faellig-offen', text: 'Fällig und offen: k2 (Interviews und Snapshots)' },
      { art: 'luecken', text: 'Lücken: k1 (3)' },
    ]);
  });
  it('zuerstAnsehen: ohne Bezugstag kein „nichts gespeichert“, ohne Befund leer', () => {
    expect(zuerstAnsehen(ansicht([bereit('k1', [A()])], { bezug: null }))).toStrictEqual([]);
  });

  it('alleGithubFehler nur, wenn wirklich alle an GitHub scheitern', () => {
    const gh: LehrendenMappe = { kuerzel: 'k1', zustand: 'fehler', grund: 'github' };
    expect(alleGithubFehler(ansicht([gh, { ...gh, kuerzel: 'k2' }]))).toBe(true);
    expect(alleGithubFehler(ansicht([gh, { kuerzel: 'k2', zustand: 'fehler', grund: 'zuordnung' }]))).toBe(false);
    expect(alleGithubFehler(ansicht([gh, bereit('k2', [])]))).toBe(false);
    expect(alleGithubFehler(ansicht([]))).toBe(false);
  });

  it('lueckenJeArtefakt: nach Artefakt in Anzeigereihenfolge, leere Gruppen fehlen', () => {
    expect(lueckenJeArtefakt([befund('annahmen', 'A1'), befund('brief', 'x'), befund('annahmen', 'A2')])).toStrictEqual([
      { name: 'brief', befunde: [befund('brief', 'x')] },
      { name: 'annahmen', befunde: [befund('annahmen', 'A1'), befund('annahmen', 'A2')] },
    ]);
  });
});

describe('Leser', () => {
  it('Adresse lesen und schreiben; andere Parameter bleiben', () => {
    expect(leserAusAdresse('?person=k2&artefakt=interviews')).toStrictEqual({ person: 'k2', artefakt: 'interviews' });
    expect(leserAusAdresse('?person=k2&artefakt=quatsch')).toBeNull();
    expect(leserAusAdresse('?artefakt=brief')).toBeNull();
    expect(adresseMitLeser('/innolab/mappe', '?x=1', '#a', { person: 'k2', artefakt: 'brief' })).toBe('/innolab/mappe?x=1&person=k2&artefakt=brief#a');
    expect(adresseMitLeser('/innolab/mappe', '?person=k2&artefakt=brief', '', null)).toBe('/innolab/mappe');
  });
  it('nachbar überspringt Personen ohne Mappe; am Rand null', () => {
    const p = [bereit('k1', []), { kuerzel: 'k2', zustand: 'keine-mappe' } as LehrendenMappe, bereit('k3', [])];
    expect(nachbar(p, 'k1', 1)).toBe('k3');
    expect(nachbar(p, 'k3', -1)).toBe('k1');
    expect(nachbar(p, 'k1', -1)).toBeNull();
    expect(nachbar(p, 'k2', 1)).toBeNull();
  });
  it('leserKopf mit Commit-Zahl (nur hier, nicht in der Zelle)', () => {
    expect(leserKopf(A({ commits: 3 }), TAG1)).toBe('vorhanden · 4 von 6 Feldern · zuletzt gespeichert am 22.10.2026 · geändert seit Tag 1 (3 Commits)');
    expect(leserKopf(A({ commits: 100, mehr: true }), TAG1)).toContain('(100+ Commits)');
    expect(leserKopf(A(), TAG1)).toBe('vorhanden · 4 von 6 Feldern · zuletzt gespeichert am 22.10.2026 · seit Tag 1 unverändert');
    expect(leserKopf(A({ commits: 1 }), null)).toBe('vorhanden · 4 von 6 Feldern · zuletzt gespeichert am 22.10.2026 · 1 Commit bisher');
  });
  it('dateiVerlaufUrl', () => {
    expect(dateiVerlaufUrl('https://github.com/ndu-innolab/2026-k1', 'brief')).toBe('https://github.com/ndu-innolab/2026-k1/commits/main/mappe/brief.json');
  });
});
