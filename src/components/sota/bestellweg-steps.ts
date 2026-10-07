// Daten und Logik der Bestellweg-Animation (Konzept 1, „Eine Bestellung durchs Haus“). Ohne React, damit testbar.

export type StationId = 'frontend' | 'api' | 'backend' | 'db';
export const STATIONEN: StationId[] = ['frontend', 'api', 'backend', 'db'];

export type ZettelArt = 'bestellung' | 'antwort' | 'fehler';
export type Pruefung = 'offen' | 'ok' | 'fehler';

export interface Zettel {
  /** Gleicher Schlüssel = derselbe Zettel, der weiterwandert; neuer Schlüssel = neuer Zettel. */
  key: string;
  art: ZettelArt;
  at: StationId;
  /** Wo ein neuer Zettel beim Vorwärtsblättern losfährt. Ohne Angabe erscheint er direkt bei `at`. */
  von?: StationId;
  zeilen: [string, string];
  /** Der Kellner hat den Zettel angenommen. */
  stempel?: boolean;
}

export interface Zeile {
  id: string;
  user: string;
  zeit: string;
}

export interface Zustand {
  /** Station, um die es in diesem Schritt geht; null = alle gleichzeitig. */
  aktiv: StationId | null;
  zettel: Zettel | null;
  nutzer: string;
  angemeldet: boolean;
  klick: boolean;
  button: 'offen' | 'angefragt' | 'fehler';
  /** Anfragen, die das Frontend anzeigt. */
  angezeigt: number;
  pruefungen: [Pruefung, Pruefung, Pruefung];
  /** Letzte Zeilen der Tabelle requests für Gegenstand 42. */
  zeilen: Zeile[];
  neueZeile: string | null;
  /** Zeilen für Gegenstand 42 laut Datenbank. */
  anzahl: number;
  /** Die Datenbank war an diesem Vorgang nicht beteiligt. */
  unberuehrt: boolean;
  werkzeuge: boolean;
}

export interface Schritt {
  title: string;
  /** Inline-Code in Backticks. */
  text: string;
}

export const PRUEFUNGEN = ['angemeldet', 'Gegenstand 42 gibt es', 'noch nicht angefragt'] as const;

export const WERKZEUG: Record<StationId, string> = {
  frontend: 'Browser · Konsole',
  api: 'Terminal',
  backend: 'Terminal',
  db: 'Supabase · Table Editor',
};

const ALT: Zeile[] = [
  { id: 'max', user: 'Max', zeit: '09:12' },
  { id: 'aylin', user: 'Aylin', zeit: '09:40' },
];
const MARA: Zeile = { id: 'mara', user: 'Mara', zeit: 'jetzt' };

const BESTELLUNG = (at: StationId, stempel = false): Zettel => ({
  key: 'bestellung', art: 'bestellung', at, zeilen: ['POST /api/requests', 'Gegenstand 42 · Mara'], stempel,
});
const ANTWORT = (at: StationId): Zettel => ({
  key: 'antwort', art: 'antwort', at, von: 'backend', zeilen: ['200 · ok', '13 Anfragen'],
});

const START: Zustand = {
  aktiv: 'frontend',
  zettel: null,
  nutzer: 'Mara',
  angemeldet: true,
  klick: false,
  button: 'offen',
  angezeigt: 12,
  pruefungen: ['offen', 'offen', 'offen'],
  zeilen: ALT,
  neueZeile: null,
  anzahl: 12,
  unberuehrt: false,
  werkzeuge: false,
};

const NACH_ANFRAGE: Zustand = {
  ...START,
  pruefungen: ['ok', 'ok', 'ok'],
  zeilen: [...ALT, MARA],
  anzahl: 13,
};

const JONAS: Zustand = {
  ...NACH_ANFRAGE,
  nutzer: 'Jonas',
  angemeldet: false,
  button: 'offen',
  angezeigt: 13,
  pruefungen: ['offen', 'offen', 'offen'],
};

const ZUSTAENDE: Zustand[] = [
  START,
  { ...START, klick: true, zettel: BESTELLUNG('frontend') },
  { ...START, aktiv: 'api', zettel: BESTELLUNG('api', true) },
  { ...START, aktiv: 'backend', zettel: BESTELLUNG('backend', true), pruefungen: ['ok', 'ok', 'ok'] },
  { ...NACH_ANFRAGE, aktiv: 'db', zettel: BESTELLUNG('db', true), neueZeile: 'mara' },
  { ...NACH_ANFRAGE, aktiv: 'api', zettel: ANTWORT('api') },
  { ...NACH_ANFRAGE, aktiv: 'frontend', zettel: ANTWORT('frontend'), button: 'angefragt', angezeigt: 13 },
  {
    ...JONAS,
    aktiv: 'backend',
    klick: true,
    zettel: { key: 'bestellung-jonas', art: 'bestellung', at: 'backend', von: 'frontend', zeilen: ['POST /api/requests', 'Gegenstand 42 · ohne Login'], stempel: true },
    pruefungen: ['fehler', 'offen', 'offen'],
  },
  {
    ...JONAS,
    aktiv: 'frontend',
    zettel: { key: 'fehler', art: 'fehler', at: 'frontend', von: 'backend', zeilen: ['401', 'nicht angemeldet'] },
    pruefungen: ['fehler', 'offen', 'offen'],
    button: 'fehler',
    unberuehrt: true,
  },
  {
    ...JONAS,
    aktiv: null,
    zettel: { key: 'fehler', art: 'fehler', at: 'frontend', zeilen: ['401', 'nicht angemeldet'] },
    pruefungen: ['fehler', 'offen', 'offen'],
    button: 'fehler',
    unberuehrt: true,
    werkzeuge: true,
  },
];

export const STEPS: Schritt[] = [
  { title: 'Ausgangslage.', text: 'Mara sieht Gegenstand 42, den Samtsessel, im Browser: 12 Anfragen, daneben der Button „Ausleihen anfragen“. Die Zahl steht nirgends im Frontend fest – sie kommt aus der Datenbank.' },
  { title: 'Frontend.', text: 'Mara klickt. Der Button schreibt einen Bestellzettel: `POST /api/requests` – „lege eine Anfrage an“ –, dazu Gegenstand 42 und wer klickt.' },
  { title: 'API.', text: 'Der Endpoint `/api/requests` nimmt den Zettel an und trägt ihn in die Küche. Ob die Bestellung geht, prüft der Kellner nicht.' },
  { title: 'Backend.', text: 'Die Küche prüft nacheinander: Ist Mara angemeldet? Gibt es Gegenstand 42? Hat sie ihn schon angefragt? Erst wenn alles stimmt, geht es weiter.' },
  { title: 'Datenbank.', text: 'Neue Zeile in der Tabelle `requests`: Gegenstand 42, Mara, jetzt. Die Küche zählt nach: 13 Zeilen für Gegenstand 42.' },
  { title: 'Antwort.', text: 'Die Antwort nimmt denselben Weg zurück: `200` – hat geklappt –, dazu die neue Zahl.' },
  { title: 'Angekommen.', text: 'Das Frontend zeigt „Angefragt · 13“. Die 13 hat es nicht selbst hochgezählt – sie stammt aus der Datenbank.' },
  { title: 'Zweiter Versuch.', text: 'Jonas ist nicht angemeldet und klickt ebenfalls. Sein Zettel kommt bis in die Küche – dort scheitert die erste Prüfung.' },
  { title: 'Fehler zurück.', text: 'Die Antwort lautet `401` – nicht angemeldet. Jonas sieht „Bitte anmelden“. Die Datenbank hat davon nichts mitbekommen: weiterhin 13 Zeilen.' },
  { title: 'In welcher Schicht?', text: 'Entstanden im Backend, sichtbar im Frontend, in der Datenbank nie angekommen. Darum fragt ihr bei jedem Fehler zuerst: in welcher Schicht? Jede hat ihren eigenen Ort zum Nachsehen.' },
];

/** Zustand der Szene in Schritt 1 … STEPS.length. */
export function stateAt(step: number): Zustand {
  const z = ZUSTAENDE[step - 1];
  if (!z) throw new Error(`Schritt ${step} gibt es nicht`);
  return z;
}

/** Spalte einer Station (0–3) – für die Position des Zettels. */
export function spalte(id: StationId): number {
  return STATIONEN.indexOf(id);
}

/** Wie viele Stationen der Zettel beim Vorwärtsblättern in diesen Schritt zurücklegt:
 *  derselbe Zettel ab seiner letzten Station, ein neuer ab `von`. */
export function strecke(step: number): number {
  const jetzt = stateAt(step).zettel;
  if (!jetzt) return 0;
  const vorher = step > 1 ? stateAt(step - 1).zettel : null;
  const start = vorher?.key === jetzt.key ? vorher.at : jetzt.von;
  return start ? Math.abs(spalte(jetzt.at) - spalte(start)) : 0;
}
