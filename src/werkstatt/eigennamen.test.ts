import { describe, expect, it } from 'vitest';
import interviewsBeispiel from './beispiele/interviews.json';
import { namenFinden, namenHinweis } from './eigennamen';
import { artefaktParsen } from './schemas/index';

describe('namenFinden', () => {
  it('Anrede mit Namen, „ich heiße …“ und häufige Vornamen', () => {
    expect(namenFinden('Frau Huber kommt jeden Tag. Ich heiße Berger, sagt er. Dann kam Lukas dazu.')).toStrictEqual([
      { fund: 'Frau Huber', grund: 'Anrede mit Namen' },
      { fund: 'Ich heiße Berger', grund: 'Name genannt' },
      { fund: 'Lukas', grund: 'Vorname' },
    ]);
  });

  it('Kontaktdaten: E-Mail, Telefonnummer, @Konto', () => {
    expect(namenFinden('Schreib an pendlerin.42@example.at oder ruf 0664 123 45 67 an, Insta @kaffee_lisa_wien')).toStrictEqual([
      { fund: 'pendlerin.42@example.at', grund: 'E-Mail-Adresse' },
      { fund: '0664 123 45 67', grund: 'Telefonnummer' },
      { fund: '@kaffee_lisa_wien', grund: 'Konto-Name' },
    ]);
  });

  it('überlappende Treffer zählen einmal, die genauere Art gewinnt', () => {
    expect(namenFinden('Herr Paul kommt.')).toStrictEqual([{ fund: 'Herr Paul', grund: 'Anrede mit Namen' }]);
    // Titel davor: der Name gehört zum Fund, nicht nur „Herr Dr“.
    expect(namenFinden('Herr Dr. Maier und Mag. Berger')).toStrictEqual([
      { fund: 'Herr Dr. Maier', grund: 'Anrede mit Namen' },
      { fund: 'Mag. Berger', grund: 'Anrede mit Namen' },
    ]);
    expect(namenFinden('Mail: Anna.Maier@example.at')).toStrictEqual([{ fund: 'Anna.Maier@example.at', grund: 'E-Mail-Adresse' }]);
  });

  it('Herr/Frau mit Artikel davor bleibt ein Name („die Frau Huber“, „meine Frau Huber“)', () => {
    expect(namenFinden('Die Frau Huber hat gesagt, sie fährt immer mit dem Herrn Berger.')).toStrictEqual([
      { fund: 'Frau Huber', grund: 'Anrede mit Namen' },
      { fund: 'Herrn Berger', grund: 'Anrede mit Namen' },
    ]);
    expect(namenFinden('Meine Frau Huber kommt, der Herr Dr. Maier auch.')).toStrictEqual([
      { fund: 'Frau Huber', grund: 'Anrede mit Namen' },
      { fund: 'Herr Dr. Maier', grund: 'Anrede mit Namen' },
    ]);
  });

  it('gewöhnliche Wörter und Zahlen nach Herr/Frau sind kein Name', () => {
    expect(namenFinden('Frau Mitte 40, Herr Anfang 30, Frau Ende 50. Herr Und dann. Frau 40 Jahre.')).toStrictEqual([]);
  });

  it('ein Datum ist keine Telefonnummer, eine Nummer mit Schrägstrich schon', () => {
    expect(namenFinden('Interview am 05/10/2026, nächstes am 06-10-2026.')).toStrictEqual([]);
    expect(namenFinden('Ruf 0664/123 45 67 an.')).toStrictEqual([{ fund: '0664/123 45 67', grund: 'Telefonnummer' }]);
  });

  it('Genitiv und Vorname als Teil eines Wortes', () => {
    expect(namenFinden('Annas Zug fährt um 7:42.')).toStrictEqual([{ fund: 'Annas', grund: 'Vorname' }]);
    // „Annahme“ und „Paulaner“ enthalten Vornamen, sind aber keine.
    expect(namenFinden('Die Annahme hält. Paulaner im Kühlschrank, der Automat heißt SuperMax.')).toStrictEqual([]);
  });

  it('Nomen, Uhrzeiten, Daten und Frau ohne Namen bleiben still', () => {
    expect(namenFinden('Die Frau neben ihr schaut auf die Uhr. Zug 7:42, am 2026-10-23, acht Leute in der Schlange.')).toStrictEqual([]);
    expect(namenFinden('Sie heißt das gut, er heißt mich willkommen.')).toStrictEqual([]);
    expect(namenFinden('Sie heißt Pendler gut. Ich heiße Sie willkommen.')).toStrictEqual([]);
    expect(namenFinden('Mein Name ist egal, sagt sie.')).toStrictEqual([]);
    expect(namenFinden('Eine Frau Mitte 40 wartet, der Herr Doktor auch. Fr. Morgen wieder.')).toStrictEqual([]);
    // Orte und Einrichtungen mit Vornamen im Bindestrich-Wort.
    expect(namenFinden('Steigt am Franz-Josefs-Bahnhof aus, studiert am Max-Reinhardt-Seminar.')).toStrictEqual([]);
  });

  it('die Kaffeebar-Interviews lösen keinen Hinweis aus', () => {
    for (const iv of interviewsBeispiel.interviews) {
      const texte = [iv.pseudonym, iv.zitat, iv.kurzinfos, iv.notizen, ...iv.einsichten, ...iv.chancen.map((c) => c.text), ...iv.zitate.map((z) => z.text)];
      for (const t of texte) expect(namenFinden(t), `${iv.id}: ${t}`).toStrictEqual([]);
    }
  });
});

describe('namenHinweis', () => {
  it('nennt jeden Fund mit Grund und sagt, dass trotzdem gespeichert wird', () => {
    expect(namenHinweis('Herr Maier, Tel. 0043 664 1234567')).toBe(
      'Klingt nach etwas, woran man die Person erkennt: „Herr Maier“ (Anrede mit Namen), „0043 664 1234567“ (Telefonnummer). Ersetze es durch eine Rolle oder das Pseudonym. Gespeichert wird trotzdem.',
    );
  });

  it('ohne Fund: undefined', () => {
    expect(namenHinweis('Pendlerin, Zug 7:42')).toBeUndefined();
  });
});

describe('nur Hinweis, keine Sperre', () => {
  it('ein Interview mit Namen in den Notizen lässt sich trotzdem speichern (Schema bleibt gültig)', () => {
    const d = structuredClone(interviewsBeispiel);
    d.interviews[0].notizen = 'Frau Huber kommt jeden Tag.';
    expect(namenHinweis(d.interviews[0].notizen)).toBeDefined();
    expect(artefaktParsen('interviews', d).ok).toBe(true);
  });
});
