// Antwortrunde: Studierende schicken einen Satz über die Seite statt in den Teams-Chat (api/antworten.ts). Bis zum Aufdecken
// zeigt die Seite nur, welche Rollen geantwortet haben; die Texte gibt der Server erst heraus, wenn die Auflösung der Runde
// für alle offen ist – dieselbe Kennung wie <Aufloesung gruppe=…> (lib/aufgedeckt.ts), also ein Klick des Präsentators für
// Buch und Sätze. Speicher: ein fester Platz pro Runde, Kurstag und Rolle (bei Netflix drei) – wer abschickt, überschreibt
// den Platz seiner Rolle. Keine Client-ids, kein Index, keine Listen: Die Zahl der Schlüssel ist fest, der Text begrenzt.
// Hier ohne DOM und ohne Vercel, damit testbar. .js-Endungen: api/antworten.ts lädt das per Node-ESM.
import { wienerZeit } from '../components/jetzt.js';
import { AUFGEDECKT_TTL_SEKUNDEN, gruppeFrei } from './aufgedeckt.js';
import { NACH_NETFLIX } from '../components/innolab-zeiten.js';

export interface Rolle { id: string; label: string }
export interface Runde {
  /** Kennung der Auflösung, deren Aufdecken die Texte freigibt (gruppe an <Aufloesung>). */
  kennung: string;
  /** Rückfall wie <Aufloesung ab=…>: ab dann sind die Texte auch ohne Aufdecken frei. */
  ab: string;
  /** Ein Platz pro Rolle. Eine Runde ohne echte Rollen (z. B. „zwoelf“) bekommt Plätze wie „person-1“ … „person-3“. */
  rollen: readonly Rolle[];
}

/** Erlaubte Runden – nur was hier steht, nimmt der Server an. Weitere Übungen hier eintragen. */
export const RUNDEN: Readonly<Record<string, Runde>> = {
  netflix: {
    kennung: 'netflix',
    ab: NACH_NETFLIX,
    rollen: [
      { id: 'produktmanagement', label: 'Produktmanagement' },
      { id: 'design', label: 'Design' },
      { id: 'entwicklung', label: 'Entwicklung' },
    ],
  },
};

/** Höchstens so viele Zeichen pro Satz – drei davon passen auf „warum“ bei 720p. */
export const MAX_TEXT = 120;
/** Ein Kurstag, wie das Aufdecken. */
export const TTL_SEKUNDEN = AUFGEDECKT_TTL_SEKUNDEN;
/** Antworten nach dem Aufdecken: Die Seite fragt nur noch so oft nach (falls „Runde leeren“ die Runde wieder öffnet). */
export const ANTWORTEN_FREI_MS = 30_000;
/** Größter Body, den der Server liest (Text plus Felder, großzügig). */
export const MAX_BODY = 4096;
/** Studierende fragen so oft nach, solange die Folie zu sehen ist … */
export const ANTWORTEN_MS = 4000;
/** … und geben eine hängende Anfrage nach so langer Zeit auf. */
export const ANTWORTEN_TIMEOUT_MS = 3000;

// Steuerzeichen (C0, DEL, C1), Zeilen-/Absatztrenner und Richtungs-Steuerzeichen, die Text auf dem Beamer verdrehen könnten.
const STEUER = /[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028\u2029\u202a-\u202e\u2066-\u2069\ufeff]/g;

export function rundePruefen(roh: unknown): Runde | null {
  return typeof roh === 'string' && Object.hasOwn(RUNDEN, roh) ? RUNDEN[roh] : null;
}

/** Rolle aus der Liste der Runde, sonst null. */
export function rollePruefen(runde: Runde, roh: unknown): string | null {
  return typeof roh === 'string' && runde.rollen.some((r) => r.id === roh) ? roh : null;
}

/** Ein Satz: Zeilenumbrüche (auch U+2028/2029) zu Leerzeichen, Steuerzeichen raus, Leerraum zu einem Leerzeichen,
 *  getrimmt; 1–MAX_TEXT Zeichen, sonst null. HTML bleibt Text – die Seite setzt es nur als textContent. */
export function textBereinigen(roh: unknown): string | null {
  const p = textPruefen(roh);
  return 'text' in p ? p.text : null;
}

/** Wie textBereinigen, mit Grund für die Seite: leer (auch nach dem Bereinigen) oder zu lang. */
export function textPruefen(roh: unknown): { text: string } | { fehler: 'leer' | 'lang' } {
  if (typeof roh !== 'string') return { fehler: 'leer' };
  const t = roh.replace(/[\r\n\t\u2028\u2029]+/g, ' ').replace(STEUER, '').replace(/\s+/g, ' ').trim();
  const laenge = [...t].length;
  return laenge < 1 ? { fehler: 'leer' } : laenge > MAX_TEXT ? { fehler: 'lang' } : { text: t };
}

export interface Eingabe { runde: string; konfig: Runde; rolle: string; text: string }

/** POST-Body prüfen: alles oder nichts. */
export function eingabePruefen(body: unknown): Eingabe | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  const runde = rundePruefen(b.runde);
  if (!runde) return null;
  const rolle = rollePruefen(runde, b.rolle);
  const text = textBereinigen(b.text);
  if (rolle === null || text === null) return null;
  return { runde: b.runde as string, konfig: runde, rolle, text };
}

/** Der Platz einer Rolle: pro Runde, Wiener Kurstag und Rolle ein Schlüssel. */
export function platzSchluessel(runde: string, rolle: string, jetzt: Date): string {
  return `antwort:${wienerZeit(jetzt).datum}:${runde}:${rolle}`;
}

export interface Gespeichert { text: string; zeit: number }

export function gespeichertPruefen(roh: unknown): Gespeichert | null {
  if (!roh || typeof roh !== 'object') return null;
  const g = roh as Record<string, unknown>;
  return typeof g.text === 'string' && typeof g.zeit === 'number' ? { text: g.text, zeit: g.zeit } : null;
}

/** Sind die Texte frei? Wenn die Kennung der Runde heute aufgedeckt ist, spätestens ab runde.ab. Kein Vorrang für den
 *  Präsentator: Der Beamer zeigt, was die Studierenden sehen. */
export function texteFrei(runde: Runde, aufgedeckt: boolean, jetzt: Date): boolean {
  return gruppeFrei(runde.kennung, runde.ab, jetzt, aufgedeckt ? [runde.kennung] : []);
}

/** Gilt „Gesendet“ noch? Nur, wenn die eigene Rolle laut Server belegt ist (nach „Runde leeren“ nicht mehr). */
export function gesendetGilt(vergeben: readonly string[], eigeneRolle: string | null): boolean {
  return eigeneRolle !== null && vergeben.includes(eigeneRolle);
}

/** Hat jemand anderes die gewählte Rolle schon? Belegt und nicht die, die dieser Browser selbst abgeschickt hat. */
export function rolleBesetzt(vergeben: readonly string[], gewaehlt: string | null, eigeneRolle: string | null): boolean {
  return gewaehlt !== null && vergeben.includes(gewaehlt) && gewaehlt !== eigeneRolle;
}

export interface Antwort { rolle: string; text: string }
export interface Stand {
  /** Belegte Plätze (höchstens so viele wie Rollen). */
  anzahl: number;
  /** Welche Rollen haben geantwortet. */
  vergeben: string[];
  frei: boolean;
  /** Nur wenn frei: die Texte in der Reihenfolge der Rollen. */
  antworten?: Antwort[];
}

/** plaetze: je Rolle der Runde (gleiche Reihenfolge) der gespeicherte Eintrag oder null. */
export function standBauen(runde: Runde, plaetze: readonly (Gespeichert | null)[], frei: boolean): Stand {
  const belegt = runde.rollen.map((r, i) => ({ rolle: r.id, g: plaetze[i] ?? null })).filter((x) => x.g !== null);
  const stand: Stand = { anzahl: belegt.length, vergeben: belegt.map((x) => x.rolle), frei };
  if (frei) stand.antworten = belegt.map((x) => ({ rolle: x.rolle, text: x.g!.text }));
  return stand;
}

/** Für „Eure Sätze“: je Rolle (Reihenfolge der Runde) die Texte; Rollen ohne Antwort fehlen. */
export function antwortenGruppieren(rollen: readonly Rolle[], antworten: readonly Antwort[]): { label: string; texte: string[] }[] {
  return rollen
    .map((r) => ({ label: r.label, texte: antworten.filter((a) => a.rolle === r.id).map((a) => a.text) }))
    .filter((g) => g.texte.length > 0);
}

/** „2 von 3 haben geantwortet“ – erwartet: Zahl der Rollen bzw. Kursteilnehmenden. */
export function statusText(anzahl: number, erwartet: number): string {
  if (anzahl === 0) return 'Noch keine Antworten.';
  const verb = anzahl === 1 ? 'hat' : 'haben';
  return anzahl >= erwartet ? `${anzahl} ${verb} geantwortet.` : `${anzahl} von ${erwartet} ${verb} geantwortet.`;
}
