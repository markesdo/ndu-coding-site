import { describe, expect, it } from 'vitest';
import { sichererPfad } from '../../lib/kurszugang.js';
import { ARTEFAKT_NAMEN } from '../schemas/index.js';
import { adresseOhneBearbeiten, bearbeitenAusAdresse, bearbeitenHref, direktOeffnen, mitBearbeiten } from './bearbeiten-link.js';
import { LOGIN_HREF, loginHref } from './mappe-hilfen.js';

describe('bearbeitenAusAdresse', () => {
  it('erkennt jedes Artefakt der Mappe', () => {
    for (const n of ARTEFAKT_NAMEN) expect(bearbeitenAusAdresse(`?bearbeiten=${n}`)).toBe(n);
    expect(bearbeitenAusAdresse('?ansicht=demo&bearbeiten=leitfaden')).toBe('leitfaden');
  });
  it('ignoriert Unbekanntes, Leeres und Fehlendes', () => {
    expect(bearbeitenAusAdresse('')).toBeNull();
    expect(bearbeitenAusAdresse('?bearbeiten=')).toBeNull();
    expect(bearbeitenAusAdresse('?bearbeiten=quatsch')).toBeNull();
    expect(bearbeitenAusAdresse('?bearbeiten=Annahmen')).toBeNull();
    expect(bearbeitenAusAdresse('?bearbeiten=toString')).toBeNull();
    expect(bearbeitenAusAdresse('?artefakt=annahmen')).toBeNull();
  });
});

describe('adresseOhneBearbeiten', () => {
  it('entfernt nur den Parameter', () => {
    expect(adresseOhneBearbeiten('/innolab/mappe', '?bearbeiten=annahmen', '')).toBe('/innolab/mappe');
    expect(adresseOhneBearbeiten('/innolab/mappe', '?ansicht=demo&bearbeiten=annahmen', '#x')).toBe('/innolab/mappe?ansicht=demo#x');
  });
});

describe('Links und Rücksprung', () => {
  it('bearbeitenHref zeigt auf die Mappe und wird wieder erkannt', () => {
    expect(bearbeitenHref('interviews')).toBe('/innolab/mappe?bearbeiten=interviews');
    expect(bearbeitenAusAdresse(new URL(bearbeitenHref('leitfaden'), 'https://x.invalid').search)).toBe('leitfaden');
  });
  it('mitBearbeiten hängt an, auch hinter ?ansicht=demo', () => {
    expect(mitBearbeiten('/innolab/mappe', null)).toBe('/innolab/mappe');
    expect(mitBearbeiten('/innolab/mappe?ansicht=demo', 'annahmen')).toBe('/innolab/mappe?ansicht=demo&bearbeiten=annahmen');
  });
  it('Anmelden über einen Direktlink kommt mit dem Parameter zurück (übersteht sichererPfad)', () => {
    const weiter = (h: string) => new URL(h, 'https://x.invalid').searchParams.get('weiter');
    expect(sichererPfad(weiter(loginHref('kohorte', 'annahmen')))).toBe('/innolab/mappe?bearbeiten=annahmen');
    expect(sichererPfad(weiter(loginHref('demo', 'interviews')))).toBe('/innolab/mappe?ansicht=demo&bearbeiten=interviews');
    expect(loginHref('kohorte', null)).toBe(LOGIN_HREF);
  });
});

describe('direktOeffnen', () => {
  it('nur der passende Editor, nie im Beamer', () => {
    expect(direktOeffnen('?bearbeiten=annahmen', 'annahmen', false)).toBe(true);
    expect(direktOeffnen('?bearbeiten=annahmen', 'leitfaden', false)).toBe(false);
    expect(direktOeffnen('?bearbeiten=annahmen', 'annahmen', true)).toBe(false);
    expect(direktOeffnen('?bearbeiten=quatsch', 'annahmen', false)).toBe(false);
  });
});
