// Antwortrunde: Studierende schicken einen Satz über die Seite statt in den Teams-Chat (api/antworten.ts). Bis zum Aufdecken
// zählt die Seite nur, wer geantwortet hat; die Texte gibt der Server erst heraus, wenn die Auflösung der Runde für alle offen
// ist – dieselbe Kennung wie <Aufloesung gruppe=…> (lib/aufgedeckt.ts), also ein Klick des Präsentators für Buch und Sätze.
// Hier ohne DOM und ohne Vercel, damit testbar. .js-Endungen: api/antworten.ts lädt das per Node-ESM.
import { aufgeloest } from '../components/aufloesung.js';
import { wienerZeit } from '../components/jetzt.js';
import { NACH_NETFLIX } from '../components/innolab-zeiten.js';

export interface Rolle { id: string; label: string }
export interface Runde {
  /** Kennung der Auflösung, deren Aufdecken die Texte freigibt (gruppe an <Aufloesung>). */
  kennung: string;
  /** Rückfall wie <Aufloesung ab=…>: ab dann sind die Texte auch ohne Aufdecken frei. */
  ab: string;
  /** Leer: Runde ohne Rollen (dann kein rolle im POST). */
  rollen: readonly Rolle[];
}

/** Erlaubte Runden – nur was hier steht, nimmt der Server an. Weitere Übungen (z. B. „zwoelf“ ohne Rollen) hier eintragen. */
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

export const MAX_TEXT = 200;
/** Höchstens so viele Antworten pro Runde und Kurstag (Kurs: 3 Studierende) – begrenzt Missbrauch. */
export const MAX_ANTWORTEN = 30;
/** Dieselbe id schreibt höchstens alle 2 s. */
export const SPERRE_MS = 2000;
/** Höchstens so viele Browser-ids pro Absender-IP, Runde und Kurstag (Laptop, Handy, privates Fenster). */
export const MAX_IDS_PRO_IP = 4;
export const TTL_SEKUNDEN = 18 * 60 * 60;
/** Größter Body, den der Server liest (200 Zeichen Text plus Felder, großzügig). */
export const MAX_BODY = 4096;
/** Studierende fragen so oft nach, solange die Folie zu sehen ist … */
export const ANTWORTEN_MS = 4000;
/** … und geben eine hängende Anfrage nach so langer Zeit auf. */
export const ANTWORTEN_TIMEOUT_MS = 3000;

const ID = /^[A-Za-z0-9_-]{16,64}$/;
// Steuerzeichen (C0, DEL, C1), Zeilen-/Absatztrenner und Richtungs-Steuerzeichen, die Text auf dem Beamer verdrehen könnten.
const STEUER = /[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028\u2029\u202a-\u202e\u2066-\u2069\ufeff]/g;

export function rundePruefen(roh: unknown): Runde | null {
  return typeof roh === 'string' && Object.hasOwn(RUNDEN, roh) ? RUNDEN[roh] : null;
}

/** Rolle der Runde, oder null, wenn die Runde keine Rollen hat (dann darf keine kommen). undefined = ungültig. */
export function rollePruefen(runde: Runde, roh: unknown): string | null | undefined {
  if (!runde.rollen.length) return roh === undefined || roh === null || roh === '' ? null : undefined;
  return typeof roh === 'string' && runde.rollen.some((r) => r.id === roh) ? roh : undefined;
}

/** Ein Satz: Zeilenumbrüche (auch U+2028/2029) zu Leerzeichen, Steuerzeichen raus, Leerraum zu einem Leerzeichen, getrimmt; 1–200 Zeichen, sonst null. */
export function textBereinigen(roh: unknown): string | null {
  if (typeof roh !== 'string') return null;
  const t = roh.replace(/[\r\n\t\u2028\u2029]+/g, ' ').replace(STEUER, '').replace(/\s+/g, ' ').trim();
  const laenge = [...t].length;
  return laenge >= 1 && laenge <= MAX_TEXT ? t : null;
}

export function idPruefen(roh: unknown): string | null {
  return typeof roh === 'string' && ID.test(roh) ? roh : null;
}

export interface Eingabe { runde: string; rolle: string | null; text: string; id: string }

/** POST-Body prüfen: alles oder nichts. */
export function eingabePruefen(body: unknown): Eingabe | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  const runde = rundePruefen(b.runde);
  if (!runde) return null;
  const rolle = rollePruefen(runde, b.rolle);
  const text = textBereinigen(b.text);
  const id = idPruefen(b.id);
  if (rolle === undefined || text === null || id === null) return null;
  return { runde: b.runde as string, rolle, text, id };
}

/** Lauf der Runde heute: „Runde leeren“ (Präsentator) setzt ihn neu, alle anderen Schlüssel hängen daran – so ist
 *  Leeren ein einziges Schreiben, ohne Schlüssel aufzählen zu müssen; der alte Lauf läuft per TTL aus. */
export function laufSchluessel(runde: string, jetzt: Date): string {
  return `antworten-lauf:${wienerZeit(jetzt).datum}:${runde}`;
}

/** Ein Eintrag pro Runde, Kurstag (Wien), Lauf und Browser-id: Jede id schreibt nur ihren eigenen Schlüssel. */
export function antwortSchluessel(runde: string, id: string, jetzt: Date, lauf = '0'): string {
  return `antwort:${wienerZeit(jetzt).datum}:${runde}:${lauf}:${id}`;
}

/** Liste der ids, die heute in dieser Runde geantwortet haben (der Runtime Cache kann keine Schlüssel aufzählen). */
export function indexSchluessel(runde: string, jetzt: Date, lauf = '0'): string {
  return `antworten:${wienerZeit(jetzt).datum}:${runde}:${lauf}`;
}

/** ids pro Absender (gehashte IP): Ohne diese Grenze könnte eine angemeldete Person mit selbst erfundenen ids die
 *  30 Plätze der Runde füllen. */
export function absenderSchluessel(runde: string, absender: string, jetzt: Date, lauf = '0'): string {
  return `antworten-ip:${wienerZeit(jetzt).datum}:${runde}:${lauf}:${absender}`;
}

/** Absender einer Anfrage: auf Vercel setzt die Plattform x-real-ip (bzw. x-forwarded-for) selbst, der Browser kann es
 *  nicht vorgeben. Fehlt beides (lokal), teilen sich alle einen Eimer. */
export function absenderIp(headers: Headers): string {
  return headers.get('x-real-ip')?.trim() || headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unbekannt';
}

/** IP nicht im Klartext speichern: SHA-256, gekürzt. */
export async function absenderHash(ip: string): Promise<string> {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`antworten:${ip}`)));
  return [...d.slice(0, 12)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface Gespeichert { rolle: string | null; text: string; zeit: number }

export function gespeichertPruefen(roh: unknown): Gespeichert | null {
  if (!roh || typeof roh !== 'object') return null;
  const g = roh as Record<string, unknown>;
  if (typeof g.text !== 'string' || typeof g.zeit !== 'number' || !(g.rolle === null || typeof g.rolle === 'string')) return null;
  return { rolle: g.rolle, text: g.text, zeit: g.zeit };
}

export function indexPruefen(roh: unknown): string[] {
  return Array.isArray(roh) ? roh.filter((x): x is string => idPruefen(x) !== null) : [];
}

/** Sind die Texte frei? Wenn die Kennung der Runde heute aufgedeckt ist, spätestens ab runde.ab. Kein Vorrang für den
 *  Präsentator: Der Beamer zeigt, was die Studierenden sehen. */
export function texteFrei(runde: Runde, aufgedeckt: boolean, jetzt: Date): boolean {
  return aufgedeckt || aufgeloest(runde.ab, jetzt);
}

export interface Antwort { rolle: string | null; text: string }
export interface Stand {
  anzahl: number;
  rollen: Record<string, number>;
  frei: boolean;
  /** Nur wenn frei: die Texte, nach Rolle (Reihenfolge der Runde), dann nach Zeit. Nie die ids. */
  antworten?: Antwort[];
  /** Nur mit ?id=…: Ist die eigene Antwort gezählt? (Die Seite schickt sonst noch einmal.) */
  eigene?: boolean;
}

export function standBauen(runde: Runde, eintraege: readonly (Gespeichert & { id: string })[], frei: boolean, eigeneId?: string | null): Stand {
  const rollen: Record<string, number> = Object.fromEntries(runde.rollen.map((r) => [r.id, 0]));
  for (const e of eintraege) if (e.rolle !== null && e.rolle in rollen) rollen[e.rolle]++;
  const stand: Stand = { anzahl: eintraege.length, rollen, frei };
  if (frei) {
    const rang = (r: string | null) => { const i = runde.rollen.findIndex((x) => x.id === r); return i < 0 ? runde.rollen.length : i; };
    stand.antworten = [...eintraege]
      .sort((a, b) => rang(a.rolle) - rang(b.rolle) || a.zeit - b.zeit)
      .map(({ rolle, text }) => ({ rolle, text }));
  }
  if (eigeneId) stand.eigene = eintraege.some((e) => e.id === eigeneId);
  return stand;
}

/** Für „Eure Sätze“: je Rolle (Reihenfolge der Runde) die Texte; Rollen ohne Antwort fehlen. Ohne Rollen: eine Gruppe ohne label. */
export function antwortenGruppieren(rollen: readonly Rolle[], antworten: readonly Antwort[]): { label: string | null; texte: string[] }[] {
  if (!rollen.length) return antworten.length ? [{ label: null, texte: antworten.map((a) => a.text) }] : [];
  return rollen
    .map((r) => ({ label: r.label, texte: antworten.filter((a) => a.rolle === r.id).map((a) => a.text) }))
    .filter((g) => g.texte.length > 0);
}

/** „2 von 3 haben geantwortet“ – erwartet: Zahl der Kursteilnehmenden (Kurs: 3); mehr Antworten zählen trotzdem. */
export function statusText(anzahl: number, erwartet: number): string {
  if (anzahl === 0) return 'Noch keine Antworten.';
  const verb = anzahl === 1 ? 'hat' : 'haben';
  return anzahl >= erwartet ? `${anzahl} ${verb} geantwortet.` : `${anzahl} von ${erwartet} ${verb} geantwortet.`;
}
