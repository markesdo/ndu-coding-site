// Reine Hilfen der Lehrenden-Ansicht (LehrendenAnsicht.tsx): Zellen der Matrix Person × Artefakt, die Leiste „Zuerst
// ansehen“, relative Zeiten, der Leser (Adresse ?person=…&artefakt=…). Nur Text und Daten; das Einsetzen macht React.
// Wortschatz: Symbol und Wort, nie Farbe allein; keine Punkte, Prozente oder Fortschrittsbalken.
import { tagInWien } from '../../lib/kurswahl.js';
import { datumAt } from '../render/format.js';
import { ARTEFAKTE, ARTEFAKT_NAMEN, type ArtefaktName } from '../schemas/index.js';
import type { Befund } from '../verknuepfungen.js';
import { ROUTEN, type LehrendenAnsicht, type LehrendenArtefakt, type LehrendenMappe } from '../vertrag.js';

type Bezug = LehrendenAnsicht['bezug'];
type Kurstag = LehrendenAnsicht['kurstag'];
export type BereiteMappe = Extract<LehrendenMappe, { zustand: 'bereit' }>;

const MINUTE = 60_000;
const STUNDE = 60 * MINUTE;
const TAG = 24 * STUNDE;
/** Ab so alten Daten lädt die Rückkehr in den Tab still neu (kein Abfragen im Takt: GitHub-Kontingent). */
export const STILL_NEU_AB_MS = 2 * MINUTE;
/** Ab so alten Daten heißt es „Stand vor N Min.“ statt der Uhrzeit. */
export const ALT_AB_MS = 5 * MINUTE;

export function anfragePfad(kohorte?: string, seit?: number): string {
  const p = new URLSearchParams();
  if (kohorte) p.set('kohorte', kohorte);
  if (seit !== undefined) p.set('seit', String(seit));
  const q = p.toString();
  return `${ROUTEN.lehrende.pfad}${q ? `?${q}` : ''}`;
}

const titel = (n: ArtefaktName) => ARTEFAKTE[n].titel;

/** „Heute Tag 1“ oder „Als Nächstes Tag 3“. */
export function kurstagText(k: Kurstag): string {
  return `${k.heute ? 'Heute' : 'Als Nächstes'} Tag ${k.tag}`;
}

/** Eintrag der Auswahl „Änderungen seit“: „Tag 1 (22.10.2026)“. */
export function tagText(t: { tag: number; datum: string }): string {
  return `Tag ${t.tag} (${datumAt(t.datum)})`;
}

/** Spaltenkopf: wann das Artefakt fällig ist. */
export function spaltenHinweis(s: LehrendenAnsicht['spalten'][number]): string {
  return s.hausaufgabe ? 'Hausaufgabe' : `fällig Tag ${s.faelligZuTag}`;
}

export type ZellenArt = 'vorhanden' | 'faellig-offen' | 'offen' | 'unlesbar';
export interface Zelle {
  art: ZellenArt;
  wort: string;
  // Nur bei vorhanden mit Inhalt.
  umfang: string | null;
  // „geändert seit Tag 1“; null = unverändert oder kein Bezugstag.
  geaendert: string | null;
}

/** Noch nichts Eigenes: nicht gespeichert, oder gespeichert, aber leer (vorbefüllter Einstieg, leere Zeilen). */
export const istOffen = (a: LehrendenArtefakt) => a.stand === 'offen' || (a.stand === 'vorhanden' && a.leer);
export const istFaellig = (a: Pick<LehrendenArtefakt, 'faelligZuTag'>, k: Kurstag) => a.faelligZuTag <= k.tag;

export function zelle(a: LehrendenArtefakt, k: Kurstag, bezug: Bezug): Zelle {
  const geaendert = bezug && a.commits > 0 ? `geändert seit Tag ${bezug.tag}` : null;
  if (a.stand === 'unlesbar') return { art: 'unlesbar', wort: 'passt nicht zum Format', umfang: null, geaendert };
  if (istOffen(a)) {
    return istFaellig(a, k)
      ? { art: 'faellig-offen', wort: 'fällig, offen', umfang: null, geaendert }
      : { art: 'offen', wort: 'noch nicht dran', umfang: null, geaendert };
  }
  return { art: 'vorhanden', wort: 'vorhanden', umfang: a.umfang, geaendert };
}

/** Vorlesetext des Zellen-Knopfs: „sofie, Interviews: fällig, offen“. */
export function zellenLabel(kuerzel: string, name: ArtefaktName, z: Zelle): string {
  const teile = [z.wort, z.umfang, z.geaendert].filter((x): x is string => !!x);
  return `${kuerzel}, ${titel(name)}: ${teile.join(', ')}`;
}

/** „gerade eben“, „vor 5 Min.“, „vor 3 Std.“, „vor 1 Tag“, „vor 2 Tagen“. */
export function vorZeit(iso: string, jetzt: number): string {
  const ms = Math.max(0, jetzt - Date.parse(iso));
  if (ms < MINUTE) return 'gerade eben';
  if (ms < STUNDE) return `vor ${Math.floor(ms / MINUTE)} Min.`;
  if (ms < TAG) return `vor ${Math.floor(ms / STUNDE)} Std.`;
  const tage = Math.floor(ms / TAG);
  return `vor ${tage} ${tage === 1 ? 'Tag' : 'Tagen'}`;
}

/** Zweite Zeile des Zeilenkopfs (unter dem Kürzel). */
export function personText(p: LehrendenMappe, jetzt: number): string {
  switch (p.zustand) {
    case 'keine-mappe':
      return 'noch nicht angemeldet';
    case 'fehler':
      return p.grund === 'github' ? 'gerade nicht lesbar – später neu laden' : 'Repo passt nicht zur Zugangsliste – Zugangsliste prüfen';
    case 'bereit':
      return p.zuletzt ? `zuletzt aktiv ${vorZeit(p.zuletzt, jetzt)}` : 'noch nichts gespeichert';
  }
}

export interface Hinweis {
  art: 'nichts-seit' | 'faellig-offen' | 'luecken';
  text: string;
}

/** Leiste „Zuerst ansehen“: wer seit dem Bezugstag nichts gespeichert hat, was fällig und offen ist, wo Lücken sind. */
export function zuerstAnsehen(a: LehrendenAnsicht): Hinweis[] {
  const bereit = a.personen.filter((p): p is BereiteMappe => p.zustand === 'bereit');
  const aus: Hinweis[] = [];
  if (a.bezug) {
    const still = bereit.filter((p) => p.artefakte.every((x) => x.commits === 0)).map((p) => p.kuerzel);
    if (still.length) aus.push({ art: 'nichts-seit', text: `Seit Tag ${a.bezug.tag} nichts gespeichert: ${still.join(', ')}` });
  }
  const faellig = bereit
    .map((p) => ({ k: p.kuerzel, namen: p.artefakte.filter((x) => istOffen(x) && istFaellig(x, a.kurstag)).map((x) => titel(x.name)) }))
    .filter((x) => x.namen.length > 0)
    .map((x) => `${x.k} (${x.namen.join(', ')})`);
  if (faellig.length) aus.push({ art: 'faellig-offen', text: `Fällig und offen: ${faellig.join(', ')}` });
  const luecken = bereit.filter((p) => p.luecken.length > 0).map((p) => `${p.kuerzel} (${p.luecken.length})`);
  if (luecken.length) aus.push({ art: 'luecken', text: `Lücken: ${luecken.join(', ')}` });
  return aus;
}

/** Alle Mappen scheitern an GitHub: dann ein Hinweis oben statt einer Zeile pro Person. */
export function alleGithubFehler(a: LehrendenAnsicht): boolean {
  return a.personen.length > 0 && a.personen.every((p) => p.zustand === 'fehler' && p.grund === 'github');
}

/** „Stand 10:42“ (Uhrzeit in Wien); nach mehr als fünf Minuten „Stand vor 6 Min.“. */
export function standText(geladen: number, jetzt: number): string {
  if (jetzt - geladen > ALT_AB_MS) return `Stand ${vorZeit(new Date(geladen).toISOString(), jetzt)}`;
  const zeit = new Intl.DateTimeFormat('de-AT', { timeZone: 'Europe/Vienna', hour: '2-digit', minute: '2-digit' }).format(geladen);
  return `Stand ${zeit}`;
}

/** Lücken nach Artefakt gruppiert, in Anzeigereihenfolge der Artefakte; leere Gruppen fehlen. */
export function lueckenJeArtefakt(luecken: readonly Befund[], namen: readonly ArtefaktName[] = ARTEFAKT_NAMEN): { name: ArtefaktName; befunde: Befund[] }[] {
  return namen.map((name) => ({ name, befunde: luecken.filter((b) => b.artefakt === name) })).filter((g) => g.befunde.length > 0);
}

// --- Leser -------------------------------------------------------------------------------------------------------------

export interface Leser {
  person: string;
  artefakt: ArtefaktName;
}

const istName = (x: string): x is ArtefaktName => (ARTEFAKT_NAMEN as readonly string[]).includes(x);

/** ?person=…&artefakt=… aus der Adresse; null, wenn eins fehlt oder das Artefakt unbekannt ist. */
export function leserAusAdresse(suche: string): Leser | null {
  const p = new URLSearchParams(suche);
  const person = p.get('person');
  const artefakt = p.get('artefakt') ?? '';
  return person && istName(artefakt) ? { person, artefakt } : null;
}

/** Die Adresse mit (oder ohne, leser = null) ?person und ?artefakt; andere Parameter und der Anker bleiben. */
export function adresseMitLeser(pfad: string, suche: string, hash: string, leser: Leser | null): string {
  const p = new URLSearchParams(suche);
  p.delete('person');
  p.delete('artefakt');
  if (leser) {
    p.set('person', leser.person);
    p.set('artefakt', leser.artefakt);
  }
  const q = p.toString();
  return `${pfad}${q ? `?${q}` : ''}${hash}`;
}

/** Nachbar im Leser (dasselbe Artefakt, andere Person): nur Mappen, die es gibt; am Rand null. */
export function nachbar(personen: readonly LehrendenMappe[], kuerzel: string, richtung: -1 | 1): string | null {
  const bereit = personen.filter((p) => p.zustand === 'bereit').map((p) => p.kuerzel);
  const i = bereit.indexOf(kuerzel);
  if (i < 0) return null;
  return bereit[i + richtung] ?? null;
}

/** Kopfzeile des Lesers: „vorhanden · 4 von 5 Snapshots · zuletzt gespeichert am 22.10.2026 · geändert seit Tag 1 (3 Commits)“. */
export function leserKopf(a: LehrendenArtefakt, k: Kurstag, bezug: Bezug): string {
  const z = zelle(a, k, bezug);
  const teile: string[] = [z.wort];
  if (z.umfang) teile.push(z.umfang);
  if (a.zuletzt) teile.push(`zuletzt gespeichert am ${datumAt(tagInWien(new Date(a.zuletzt)))}`);
  const anzahl = `${a.commits}${a.mehr ? '+' : ''} ${a.commits === 1 && !a.mehr ? 'Commit' : 'Commits'}`;
  if (bezug) teile.push(a.commits > 0 ? `geändert seit Tag ${bezug.tag} (${anzahl})` : `seit Tag ${bezug.tag} unverändert`);
  else if (a.zuletzt) teile.push(`${anzahl} bisher`);
  return teile.join(' · ');
}

/** Verlauf der JSON-Datei auf GitHub. */
export function dateiVerlaufUrl(repoUrl: string, name: ArtefaktName): string {
  return `${repoUrl}/commits/main/mappe/${name}.json`;
}
