import { describe, expect, it } from 'vitest';
import { abschnittName, aktiverAbschnitt, kuerzen, pfadOhneSchraegstrich, seitenName, ueberschriftText, zaehlendeOberkante } from './abschnitt';

describe('pfadOhneSchraegstrich', () => {
  it('/tag-1/ und /tag-1 sind dieselbe Seite, / bleibt /', () => {
    expect(pfadOhneSchraegstrich('/tag-1/')).toBe('/tag-1');
    expect(pfadOhneSchraegstrich('/tag-1')).toBe('/tag-1');
    expect(pfadOhneSchraegstrich('/')).toBe('/');
  });
});

describe('ueberschriftText', () => {
  it('entfernt die Zeitangabe am Ende und Mehrfach-Leerraum', () => {
    expect(ueberschriftText('  b) Drei kleine   Änderungen\n (15 min) ')).toBe('b) Drei kleine Änderungen');
  });
});

describe('kuerzen', () => {
  it('kürzt an einer Wortgrenze', () => {
    expect(kuerzen('Alternative: lokal auf dem Laptop (ab Tag 2)')).toBe('Alternative: lokal auf dem …');
    expect(kuerzen('Kurz')).toBe('Kurz');
  });
});

describe('seitenName', () => {
  it('nimmt den Teil vor dem ersten „ · “', () => {
    expect(seitenName('Tag 1 · Verstehen & Starten · NDU Coding 2026')).toBe('Tag 1');
    expect(seitenName('Setup & Accounts · NDU Coding 2026')).toBe('Setup & Accounts');
  });
});

describe('abschnittName', () => {
  it('Übung mit Teilaufgabe → „Übung 1 b“', () => {
    expect(abschnittName('Übung 1 · Erste eigene Änderungen', 'b) Drei kleine Änderungen – eine nach der anderen')).toBe('Übung 1 b');
  });
  it('nur h2 mit „ · “ → Teil davor', () => {
    expect(abschnittName('Konzept 2 · Sprachmodell, Agent, Auftrag')).toBe('Konzept 2');
  });
  it('nummerierter Setup-Schritt → „Schritt 5“, h3 ohne Buchstaben hängt an', () => {
    expect(abschnittName('5 · Claude Code starten und anmelden', 'Im Browser anmelden')).toBe('Schritt 5 · Im Browser anmelden');
  });
  it('h2 ohne „ · “ wird gekürzt', () => {
    expect(abschnittName('Alternative: lokal auf dem Laptop (ab Tag 2)')).toBe('Alternative: lokal auf dem …');
  });
  it('Screenshot-Schritt aus der Präsentation hängt das Bild an', () => {
    expect(abschnittName('Übung 3 · Supabase', 'a) Projekt anlegen', '3.4')).toBe('Übung 3 a · Bild 3.4');
  });
  it('ohne Überschrift leer', () => {
    expect(abschnittName()).toBe('');
  });
});

describe('aktiverAbschnitt', () => {
  const tops = [-500, -20, 300, 900];
  it('letzte Überschrift über der Lesezeile', () => {
    expect(aktiverAbschnitt(tops, 280)).toBe(1);
  });
  it('genau auf der Linie zählt schon', () => {
    expect(aktiverAbschnitt(tops, 300)).toBe(2);
  });
  it('vor der ersten Überschrift → -1', () => {
    expect(aktiverAbschnitt([100, 400], 50)).toBe(-1);
  });
});

describe('zaehlendeOberkante (Beamer: Inhalt der Folie senkrecht mittig)', () => {
  // Gemessen am 21.10. auf /innolab/methoden/interview im Beamer (997 px hoch, Lesezeile 349): Nach dem Sprung auf
  // „forschungsfrage“ steht die Folie oben, ihre h2 aber bei 367 – gemeldet wurde die Folie davor.
  const linie = 997 * 0.35;
  it('erste Überschrift einer Folie zählt mit der Oberkante der Folie', () => {
    const tops = [zaehlendeOberkante(-1300, -1307), zaehlendeOberkante(367, 0)];
    expect(aktiverAbschnitt(tops, linie)).toBe(1);
  });
  it('ohne Folie zählt die eigene Oberkante', () => {
    expect(zaehlendeOberkante(367, null)).toBe(367);
    expect(aktiverAbschnitt([zaehlendeOberkante(-1300, null), zaehlendeOberkante(367, null)], linie)).toBe(0);
  });
});
