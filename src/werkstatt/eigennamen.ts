// Hinweis auf Eigennamen und Kontaktdaten in Interview-Texten. Nur ein Hinweis, kein Schemafehler: Deutsch schreibt
// jedes Nomen groß, darum sucht die Funktion nicht nach Großbuchstaben, sondern nach Mustern, die fast immer eine
// Person meinen (Anrede mit Namen, „ich heiße …“, häufige Vornamen, E-Mail, Telefonnummer, @Konto). Ein Hinweis zu
// viel ist billiger als ein übersehener Name, aber gewöhnliche Sätze sollen still bleiben.

export interface NamenFund {
  fund: string;
  grund: 'Anrede mit Namen' | 'Name genannt' | 'Vorname' | 'E-Mail-Adresse' | 'Telefonnummer' | 'Konto-Name';
}

// Häufige Vornamen in Österreich und Deutschland. Ausgelassen sind Namen, die auch gewöhnliche Wörter sind (Mark,
// Rose, Will), damit „die Mark“ oder „Rose“ als Blume keinen Hinweis auslöst.
const VORNAMEN = [
  'Alexander', 'Andrea', 'Andreas', 'Anna', 'Barbara', 'Benjamin', 'Christian', 'Christina', 'Clara', 'Claudia', 'Daniel',
  'David', 'Dominik', 'Elena', 'Elias', 'Elisabeth', 'Emma', 'Fabian', 'Felix', 'Florian', 'Franz', 'Georg', 'Hannah',
  'Jakob', 'Johann', 'Johanna', 'Johannes', 'Jonas', 'Josef', 'Julia', 'Julian', 'Karl', 'Katharina', 'Klara', 'Laura',
  'Lea', 'Lena', 'Leon', 'Leonie', 'Lisa', 'Lukas', 'Magdalena', 'Manuel', 'Maria', 'Marie', 'Markus', 'Martin',
  'Martina', 'Matthias', 'Max', 'Maximilian', 'Mia', 'Michael', 'Monika', 'Moritz', 'Nina', 'Niklas', 'Noah', 'Patrick',
  'Paul', 'Peter', 'Petra', 'Philipp', 'Sabine', 'Sandra', 'Sarah', 'Sebastian', 'Simon', 'Sofie', 'Sophia', 'Sophie',
  'Stefan', 'Stefanie', 'Theresa', 'Thomas', 'Tobias', 'Valentina', 'Wolfgang',
];

const WORT = '\\p{Lu}[\\p{L}\\-]+';
const TITEL = '(?:Dr|Mag|Prof|Ing|DI)\\.';
// Nach Herr/Frau steht in Österreich oft ein Artikel davor („die Frau Huber“), darum zählt nur das Wort danach: Ein Name
// ist es nicht, wenn dort ein gewöhnliches Wort steht („eine Frau Mitte 40“, „der Herr Doktor“, „Herr Und“ am Zeilenanfang).
const KEIN_NAME = [
  'Mitte', 'Ende', 'Anfang', 'Doktor', 'Professor', 'Professorin', 'Magister', 'Magistra', 'Ingenieur', 'Ingenieurin',
  'Direktor', 'Direktorin', 'Ober', 'Nachbar', 'Nachbarin', 'Kollege', 'Kollegin', 'Chef', 'Chefin', 'Mama', 'Papa',
  'Und', 'Oder', 'Aber', 'Mit', 'Ohne', 'Im', 'In', 'Am', 'An', 'Aus', 'Bei', 'Vor', 'Nach', 'Neben', 'Hinter', 'Dann', 'Da',
];
const ANREDE_NAME = `(?!(?:${KEIN_NAME.join('|')})(?![\\p{L}\\-]))${WORT}`;
// Kontaktdaten zuerst: Ein Treffer belegt seine Stelle, „Anna.Maier@example.at“ ist eine E-Mail, kein Vorname.
const MUSTER: { re: RegExp; grund: NamenFund['grund'] }[] = [
  { re: /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+/gu, grund: 'E-Mail-Adresse' },
  // Ein Datum wie 05/10/2026 oder 05-10-2026 ist keine Telefonnummer.
  { re: /(?<![\p{N}])(?!\p{N}{1,2}([/-])\p{N}{1,2}\1\p{N}{2,4}(?![\p{N}]))(?:\+|00|0)\p{N}[\p{N} /-]{6,}\p{N}/gu, grund: 'Telefonnummer' },
  { re: /(?<![\p{L}\p{N}._%+-])@[A-Za-z0-9_]{3,}/gu, grund: 'Konto-Name' },
  { re: new RegExp(`(?<![\\p{L}])(?:(?:Herrn?|Frau)(?:\\s+${TITEL})*|${TITEL}(?:\\s+${TITEL})*)\\s+${ANREDE_NAME}`, 'gu'), grund: 'Anrede mit Namen' },
  { re: new RegExp(`(?<![\\p{L}])(?:[Ii]ch heiße|[Ii]ch heisse|namens|[Mm]ein Name ist)\\s+(?!Sie\\b|Ihnen\\b)${WORT}`, 'gu'), grund: 'Name genannt' },
  // Mit Bindestrich ist es meist ein Ort oder eine Einrichtung (Franz-Josefs-Bahnhof); Doppelnamen wie Anna-Lena entgehen dabei.
  { re: new RegExp(`(?<![\\p{L}-])(?:${VORNAMEN.join('|')})s?(?![\\p{L}-])`, 'gu'), grund: 'Vorname' },
];

/** Stellen, die wahrscheinlich eine Person erkennbar machen, in der Reihenfolge im Text; überlappende Treffer einmal. */
export function namenFinden(text: string): NamenFund[] {
  const treffer: { start: number; ende: number; f: NamenFund }[] = [];
  for (const { re, grund } of MUSTER) {
    for (const m of text.matchAll(re)) {
      const start = m.index;
      const ende = start + m[0].length;
      if (treffer.some((t) => start < t.ende && t.start < ende)) continue;
      treffer.push({ start, ende, f: { fund: m[0].trim(), grund } });
    }
  }
  return treffer.sort((a, b) => a.start - b.start).map((t) => t.f);
}

/** Ein Satz fürs Feld, oder undefined, wenn nichts auffällt. */
export function namenHinweis(text: string): string | undefined {
  const funde = namenFinden(text);
  if (funde.length === 0) return undefined;
  const liste = funde.map((f) => `„${f.fund}“ (${f.grund})`).join(', ');
  return `Klingt nach etwas, woran man die Person erkennt: ${liste}. Ersetze es durch eine Rolle oder das Pseudonym. Gespeichert wird trotzdem.`;
}
