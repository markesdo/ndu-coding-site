// Antwortrunde: Studierende schicken einen Satz über die Seite (api/antworten.ts; Rückfall: reihum laut). Bis zum Aufdecken
// zeigt die Seite nur, welche Rollen geantwortet haben; die Texte gibt der Server erst heraus, wenn die Auflösung der Runde
// für alle offen ist – dieselbe Kennung wie <Aufloesung gruppe=…> (lib/aufgedeckt.ts), also ein Klick des Präsentators für
// Buch und Sätze. Speicher: ein fester Platz pro Runde, Kurstag und Rolle (je drei; „zwoelf“ und „rueckblick“ haben neutrale Plätze statt Rollen) – wer abschickt, überschreibt
// den Platz seiner Rolle. Keine Client-ids, kein Index, keine Listen: Die Zahl der Schlüssel ist fest, der Text begrenzt.
// Hier ohne DOM und ohne Vercel, damit testbar. .js-Endungen: api/antworten.ts lädt das per Node-ESM.
import { wienerZeit } from '../components/jetzt.js';
import { AUFGEDECKT_TTL_SEKUNDEN, gruppeFrei } from './aufgedeckt.js';
import { NACH_NETFLIX, NACH_RUECKBLICK_TAG_2, NACH_ZWOELF } from '../components/innolab-zeiten.js';

export interface Rolle { id: string; label: string }
export interface Runde {
  /** Kennung der Auflösung, deren Aufdecken die Texte freigibt (gruppe an <Aufloesung>). */
  kennung: string;
  /** Rückfall wie <Aufloesung ab=…>: ab dann sind die Texte auch ohne Aufdecken frei. */
  ab: string;
  /** Ein Platz pro Rolle. Eine Runde ohne echte Rollen bekäme Plätze wie „person-1“ … „person-3“. */
  rollen: readonly Rolle[];
  /** Eigene Texte fürs Eingabefeld; fehlt etwas, gilt EINGABE_STANDARD. */
  eingabe?: Partial<EingabeTexte>;
}

export interface EingabeTexte {
  /** Beschriftung des Felds. */
  label: string;
  /** Hinweis vor der Rollenwahl, hinter „Antwort hier auf der Seite:“. */
  hinweis: string;
  /** Platzhalter im Feld; leer = keiner. */
  platzhalter: string;
  /** Wie die Plätze heißen (aria-label der Knöpfe): „Deine Rolle“, bei neutralen Plätzen „Dein Platz“. */
  wahl: string;
  /** Meldung, wenn noch kein Platz gewählt ist. */
  wahlFehlt: string;
  /** Meldung, wenn jemand anderes den gewählten Platz schon hat. */
  wahlBesetzt: string;
  /** Hinweis nach dem Senden, {label} = Name des eigenen Platzes. */
  wahlFest: string;
  /** Statuszeile der Eingabe nach dem Aufdecken – wo die Sätze stehen. */
  aufgedeckt: string;
}

/** Texte der Eingabe, wenn die Runde keine eigenen hat (Netflix). */
export const EINGABE_STANDARD: Readonly<EingabeTexte> = {
  label: 'Ein Satz aus deiner Rolle',
  hinweis: 'erst deine Rolle wählen, dann einen Satz abschicken.',
  platzhalter: '',
  wahl: 'Deine Rolle',
  wahlFehlt: 'Bitte zuerst deine Rolle wählen.',
  wahlBesetzt: 'Diese Rolle hat schon jemand – wählt eine andere.',
  wahlFest: 'deine Rolle ist {label} – ändern kannst du deine Antwort, nicht die Rolle.',
  aufgedeckt: 'Aufgedeckt – eure Sätze stehen auf der nächsten Folie.',
};

/** Hinweis nach dem Senden mit dem Namen des eigenen Platzes. */
export function wahlFestText(texte: Pick<EingabeTexte, 'wahlFest'>, label: string): string {
  return texte.wahlFest.replace('{label}', label);
}

/** Texte der Eingabe für eine Runde: eigene, sonst EINGABE_STANDARD. Die Seite setzt sie nur als Text. */
export function eingabeTexte(runde: Runde): EingabeTexte {
  return { ...EINGABE_STANDARD, ...runde.eingabe };
}

/** Die drei Rollen aus Torres' Netflix-Beispiel (S. 75); nur die Netflix-Runde nutzt sie. */
const DREI_ROLLEN: readonly Rolle[] = [
  { id: 'produktmanagement', label: 'Produktmanagement' },
  { id: 'design', label: 'Design' },
  { id: 'entwicklung', label: 'Entwicklung' },
];

/** Drei neutrale Plätze statt Rollen („zwoelf“, „rueckblick“): Wer welchen Platz nimmt, bedeutet nichts. */
const DREI_PLAETZE: readonly Rolle[] = [
  { id: 'p1', label: 'Platz 1' },
  { id: 'p2', label: 'Platz 2' },
  { id: 'p3', label: 'Platz 3' },
];

/** Wie die Wahl bei neutralen Plätzen heißt – ohne „Rolle“. */
const PLATZ_WAHL = {
  wahl: 'Dein Platz',
  wahlFehlt: 'Bitte zuerst einen Platz wählen.',
  wahlBesetzt: 'Diesen Platz hat schon jemand – wählt einen anderen.',
  wahlFest: 'du hast {label} – ändern kannst du deine Antwort, nicht den Platz.',
} as const;

/** Erlaubte Runden – nur was hier steht, nimmt der Server an. Weitere Übungen hier eintragen. */
export const RUNDEN: Readonly<Record<string, Runde>> = {
  /** Tag 2, Synthese: Was hört eure Rolle in der Netflix-Geschichte? */
  netflix: { kennung: 'netflix', ab: NACH_NETFLIX, rollen: DREI_ROLLEN },
  /** Tag 2, Baum: drei Paare aus den zwölf Chancen (1 oder 2, 7 oder 12, 9 oder 11; Torres S. 82) – je eine Nummer und ein Satz zum
   *  schwersten Paar, aufgedeckt auf „warum“. Drei neutrale Plätze. */
  zwoelf: {
    kennung: 'zwoelf', ab: NACH_ZWOELF, rollen: DREI_PLAETZE,
    eingabe: {
      label: 'Drei Nummern (1 oder 2, 7 oder 12, 9 oder 11) und ein Satz: Welches Paar fiel am schwersten?',
      hinweis: 'erst einen Platz wählen, dann Nummern und Satz abschicken.',
      platzhalter: 'z. B. 2, 7, 11 – bei 9 oder 11 …',
      ...PLATZ_WAHL,
    },
  },
  /** Tag 2, Abschluss: Rückblick auf den Kurs als Produkt – ein Satz „Hoch:“/„Tief:“ zum stärksten Moment des Tages.
   *  Drei neutrale Plätze statt Rollen; Eingabe und Auflösung auf derselben Folie. Soll die Runde an einem späteren
   *  Kurstag wiederkommen, reicht ein neues ab: Die Plätze hängen schon am Wiener Kurstag (platzSchluessel). */
  rueckblick: {
    kennung: 'rueckblick', ab: NACH_RUECKBLICK_TAG_2,
    rollen: DREI_PLAETZE,
    eingabe: {
      label: 'Ein Satz, beginnt mit ‚Hoch:‘ oder ‚Tief:‘',
      hinweis: 'erst einen Platz wählen, dann deinen Satz abschicken.',
      platzhalter: 'Tief: … – ich habe gerade …',
      ...PLATZ_WAHL,
      aufgedeckt: 'Aufgedeckt – eure Sätze stehen darunter.',
    },
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

/** Event auf document nach jeder Abfrage einer Runde (Antwortrunde.astro), einmal pro Ergebnis: Folien können darauf
 *  reagieren, ohne selbst zu fragen (z. B. „warum“ in baum.astro markiert gewählte Nummern). texte nur nach dem Aufdecken. */
export const ANTWORTRUNDE_STAND = 'antwortrunde:stand';
export interface AntwortrundeStand { runde: string; frei: boolean; texte: string[] }
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

/** Anonyme Kennung eines Browsers (zufällig, im localStorage; kein Name, kein Konto): Sie hält einen belegten Platz für
 *  den, der ihn zuerst belegt hat. Fehlt sie (Seite von vor dem Update), gilt null; ein ungültiger Wert ist undefined. */
export function geraetPruefen(roh: unknown): string | null | undefined {
  if (roh === undefined || roh === null) return null;
  return typeof roh === 'string' && /^[A-Za-z0-9_-]{8,64}$/.test(roh) ? roh : undefined;
}

export interface Eingabe { runde: string; konfig: Runde; rolle: string; text: string; geraet: string | null }

/** POST-Body prüfen: alles oder nichts. */
export function eingabePruefen(body: unknown): Eingabe | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  const runde = rundePruefen(b.runde);
  if (!runde) return null;
  const rolle = rollePruefen(runde, b.rolle);
  const text = textBereinigen(b.text);
  const geraet = geraetPruefen(b.geraet);
  if (rolle === null || text === null || geraet === undefined) return null;
  return { runde: b.runde as string, konfig: runde, rolle, text, geraet };
}

/** Der Platz einer Rolle: pro Runde, Wiener Kurstag und Rolle ein Schlüssel. */
export function platzSchluessel(runde: string, rolle: string, jetzt: Date): string {
  return `antwort:${wienerZeit(jetzt).datum}:${runde}:${rolle}`;
}

/** geraet: wer den Platz belegt hat (anonyme Kennung); geht nie an die Seite zurück (standBauen). */
export interface Gespeichert { text: string; zeit: number; geraet?: string | null }

export function gespeichertPruefen(roh: unknown): Gespeichert | null {
  if (!roh || typeof roh !== 'object') return null;
  const g = roh as Record<string, unknown>;
  if (typeof g.text !== 'string' || typeof g.zeit !== 'number') return null;
  return { text: g.text, zeit: g.zeit, geraet: typeof g.geraet === 'string' ? g.geraet : null };
}

/** Hat ein anderer Browser diesen Platz schon? Dann weist der Server ab (409, grund „besetzt“), die erste Antwort bleibt.
 *  Derselbe Browser darf seine Antwort überschreiben. Ein Eintrag ohne Kennung (alte Seite) hält den Platz nicht. */
export function platzBesetzt(vorher: Gespeichert | null, geraet: string | null): boolean {
  return Boolean(vorher?.geraet) && vorher!.geraet !== geraet;
}

/** Sind die Texte frei? Wenn die Kennung der Runde heute aufgedeckt ist, spätestens ab runde.ab. Kein Vorrang für den
 *  Präsentator: Der Beamer zeigt, was die Studierenden sehen. */
export function texteFrei(runde: Runde, aufgedeckt: boolean, jetzt: Date): boolean {
  return gruppeFrei(runde.kennung, runde.ab, jetzt, aufgedeckt ? [runde.kennung] : []);
}

/** Hat der Präsentator gerade die Auflösung dieser Runde aufgedeckt (Event AUFGEDECKT_GEMELDET, detail = Kennung)? Dann
 *  sofort neu fragen: Die Abfrage beim Öffnen kam vor dem gespeicherten Aufdecken an und sähe sonst 4 s lang „zu“. */
export function betrifftRunde(runde: Pick<Runde, 'kennung'>, gemeldet: unknown): boolean {
  return typeof gemeldet === 'string' && gemeldet === runde.kennung;
}

/** Gilt „Gesendet“ noch? Nur, wenn die eigene Rolle laut Server belegt ist (nach „Runde leeren“ nicht mehr). */
export function gesendetGilt(vergeben: readonly string[], eigeneRolle: string | null): boolean {
  return eigeneRolle !== null && vergeben.includes(eigeneRolle);
}

/** Welche Rolle ist wählbar? Vor dem Senden die freien und die eigene; nach dem Senden nur noch die eigene – sonst hielte
 *  ein Browser zwei Plätze (der alte bliebe belegt). Nach „Runde leeren“ ist eigeneRolle wieder null (gesendetGilt). */
export function rolleWaehlbar(rolle: string, vergeben: readonly string[], eigeneRolle: string | null): boolean {
  return eigeneRolle !== null ? rolle === eigeneRolle : !vergeben.includes(rolle);
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
