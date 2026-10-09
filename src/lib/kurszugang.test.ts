import { describe, expect, it } from 'vitest';
import { GUELTIG_SEKUNDEN, cookieLesen, gleich, istOeffentlich, passwortStimmt, sichererPfad, tokenErstellen, tokenGueltig, zielMitAnker } from './kurszugang';

const SECRET = 'a'.repeat(64);
const PW = 'kurs-passwort';
const JETZT = 1_791_000_000;

describe('Token', () => {
  it('ein frisch erstelltes Token ist gültig', async () => {
    const t = await tokenErstellen(SECRET, PW, JETZT);
    expect(await tokenGueltig(t, SECRET, PW, JETZT)).toBe(true);
  });

  it('enthält das Passwort nicht', async () => {
    const t = await tokenErstellen(SECRET, PW, JETZT);
    expect(t).not.toContain(PW);
    expect(t.startsWith('v1.')).toBe(true);
  });

  it('läuft nach 60 Tagen ab', async () => {
    const t = await tokenErstellen(SECRET, PW, JETZT);
    expect(await tokenGueltig(t, SECRET, PW, JETZT + GUELTIG_SEKUNDEN - 1)).toBe(true);
    expect(await tokenGueltig(t, SECRET, PW, JETZT + GUELTIG_SEKUNDEN)).toBe(false);
  });

  it('ist ungültig mit anderem Geheimnis oder geändertem Passwort', async () => {
    const t = await tokenErstellen(SECRET, PW, JETZT);
    expect(await tokenGueltig(t, 'b'.repeat(64), PW, JETZT)).toBe(false);
    expect(await tokenGueltig(t, SECRET, 'neues-passwort', JETZT)).toBe(false);
  });

  it('erkennt manipulierte Laufzeit und Signatur', async () => {
    const t = await tokenErstellen(SECRET, PW, JETZT);
    const [v, ablauf, sig] = t.split('.');
    expect(await tokenGueltig(`${v}.${Number(ablauf) + 999999}.${sig}`, SECRET, PW, JETZT)).toBe(false);
    expect(await tokenGueltig(`${v}.${ablauf}.${sig.slice(0, -1)}${sig.endsWith('A') ? 'B' : 'A'}`, SECRET, PW, JETZT)).toBe(false);
    expect(await tokenGueltig(undefined, SECRET, PW, JETZT)).toBe(false);
    expect(await tokenGueltig('quatsch', SECRET, PW, JETZT)).toBe(false);
    expect(await tokenGueltig(`v2.${ablauf}.${sig}`, SECRET, PW, JETZT)).toBe(false);
  });
});

describe('Passwortvergleich', () => {
  it('nimmt nur das richtige Passwort', async () => {
    expect(await passwortStimmt(PW, PW, SECRET)).toBe(true);
    expect(await passwortStimmt('kurs-passworT', PW, SECRET)).toBe(false);
    expect(await passwortStimmt('', PW, SECRET)).toBe(false);
    expect(await passwortStimmt(PW + ' ', PW, SECRET)).toBe(false);
  });

  it('gleich() vergleicht exakt', () => {
    expect(gleich('abc', 'abc')).toBe(true);
    expect(gleich('abc', 'abd')).toBe(false);
    expect(gleich('abc', 'abcd')).toBe(false);
  });
});

describe('sichererPfad (Rücksprung nur auf diese Website)', () => {
  it('behält Pfade dieser Website mit Suche und Anker', () => {
    expect(sichererPfad('/konzepte/llm')).toBe('/konzepte/llm');
    expect(sichererPfad('/tag-1?beamer#uebung-1')).toBe('/tag-1?beamer#uebung-1');
  });

  it('„Weiter“ von /start: die Übersicht mit und ohne Beamer-Modus übersteht den Umweg über das Kurspasswort', () => {
    expect(sichererPfad('/')).toBe('/');
    expect(sichererPfad('/?beamer')).toBe('/?beamer');
    // So kommt es in der Middleware an: /login?weiter=%2F%3Fbeamer → searchParams dekodiert einmal.
    expect(sichererPfad(new URL('https://kurs.invalid/login?weiter=%2F%3Fbeamer').searchParams.get('weiter'))).toBe('/?beamer');
  });

  it.each([
    ['https://evil.example/x'],
    ['//evil.example/x'],
    ['/\\evil.example'],
    ['\\\\evil.example'],
    ['javascript:alert(1)'],
    ['evil.example'],
    ['/login'],
    ['/login/?weiter=/x'],
    [''],
    [null],
    ['/' + 'a'.repeat(600)],
    ['/tag-1\nSet-Cookie: x'],
    ['http://evil.example'],
    ['/%2F%2Fevil.example'],
    ['/%2fevil.example'],
    ['/%5Cevil.example'],
    ['/tag-1%5C..'],
    ['/ evil'],
    ['/tag-1\t'],
    ['/%0D%0ASet-Cookie:x'],
    ['/%E0%A4%A'],
  ])('lenkt %j auf die Startseite', (roh) => {
    expect(sichererPfad(roh as string | null)).toBe('/');
  });
});

describe('cookieLesen', () => {
  it('findet das Cookie zwischen anderen', () => {
    expect(cookieLesen('a=1; ndu_zugang=v1.2.x; b=3')).toBe('v1.2.x');
    expect(cookieLesen('xndu_zugang=nein')).toBeUndefined();
    expect(cookieLesen(null)).toBeUndefined();
  });
});

describe('istOeffentlich', () => {
  it('die Startseite ist ohne Kurspasswort erreichbar – mit und ohne Schrägstrich', () => {
    expect(istOeffentlich('/start')).toBe(true);
    expect(istOeffentlich('/start/')).toBe(true);
  });
  it('kein Präfix-Leck: ähnliche Pfade und alle Kursseiten bleiben geschützt', () => {
    for (const p of ['/', '/tag-1', '/konzepte/llm', '/startseite', '/start-x', '/start/geheim', '/START', '/start.html', '//start', '/prompts']) {
      expect(istOeffentlich(p)).toBe(false);
    }
  });
});

describe('zielMitAnker (Login behält den Anker, z. B. /setup#lokal)', () => {
  it('hängt den Anker aus der Adresse an das Ziel', () => {
    expect(zielMitAnker('/setup', '#lokal')).toBe('/setup#lokal');
    expect(sichererPfad(zielMitAnker('/setup', '#lokal'))).toBe('/setup#lokal');
  });
  it('doppelt ihn nicht, wenn das Ziel schon einen hat (nach falschem Passwort)', () => {
    expect(zielMitAnker('/tag-1#uebung-1', '#uebung-1')).toBe('/tag-1#uebung-1');
  });
  it('nimmt den Präsentator-Schlüssel nie mit (sonst stünde er im Formular und ginge an den Server)', () => {
    expect(zielMitAnker('/', '#presenter=geheim')).toBe('/');
    expect(zielMitAnker('/tag-1', '#presenter=geheim')).toBe('/tag-1');
  });
  it('ohne Anker oder ohne Ziel bleibt alles, wie es ist', () => {
    expect(zielMitAnker('/setup', '')).toBe('/setup');
    expect(zielMitAnker(null, '#lokal')).toBe(null);
  });
  it('ein Anker, den die Prüfung ablehnt, kostet nur den Anker, nicht das Ziel', () => {
    for (const anker of ['#100%', '#a%20b', '#a\\b']) {
      expect(zielMitAnker('/setup', anker)).toBe('/setup');
    }
  });
});
