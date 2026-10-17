// Kleine Bausteine der Renderer. Reine Funktionen, keine Node-Module.
import { BELEGSTUFE_TEXT, type Belegstufe } from '../schemas/index.js';

// ISO-Datum (2026-10-22) -> österreichisch (22.10.2026). Fremdes bleibt unverändert.
export function datumAt(iso: string): string {
  const t = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return t ? `${t[3]}.${t[2]}.${t[1]}` : iso;
}

export const LEER = 'Noch nichts eingetragen.';

// CommonMark kennt \n, \r\n und ein einzelnes \r als Zeilenende; hier wird alles zu \n.
function zeilenende(s: string): string {
  return s.replace(/\r\n?/g, '\n');
}

// Zeichen, die mitten im Text Markdown auslösen (Betonung, Code, Link, HTML, Durchstreichen), werden wörtlich
// gemacht: aus „Pendler*innen und Mitarbeiter*innen“ wird keine Kursivschrift, „<Situation>“ verschwindet nicht.
// _ nur am Wortrand (im Wort wirkt es nie), & nur vor einer Entity. Adressen (https://…, www.…, auch in <…>) bleiben
// unberührt: GitHub verlinkt sie aus dem Rohtext, ein Backslash darin landete im Link.
const ADRESSE = /<(?:https?:\/\/|www\.)[^\s<>]*>|(?:https?:\/\/|www\.)[^\s<]*/g;

function zeichen(t: string): string {
  let aus = '';
  let ab = 0;
  for (const m of t.matchAll(ADRESSE)) {
    aus += textZeichen(t.slice(ab, m.index)) + m[0];
    ab = m.index + m[0].length;
  }
  return aus + textZeichen(t.slice(ab));
}

function textZeichen(t: string): string {
  return t
    .replace(/[\\`*<[\]~]/g, '\\$&')
    .replace(/(?<![\p{L}\p{N}])_|_(?![\p{L}\p{N}])/gu, '\\_')
    .replace(/&(?=#\d+;|#[xX][0-9a-fA-F]+;|[A-Za-z][A-Za-z0-9]*;)/g, '\\&');
}

// Anfang einer Zeile, die einen Block beginnen könnte: Einrückung entfernen (kein Codeblock), dann ein
// ASCII-Satzzeichen am Anfang wörtlich machen (Überschrift, Liste, Zitat, Trennlinie, Tabelle …). Beginnt die Zeile
// schon mit einem Backslash, hat zeichen() das erste Zeichen bereits maskiert. Eine geordnete Liste (1. oder 2))
// wird vor dem Satzzeichen maskiert (1\.), die Ziffer bleibt.
function zeilenanfang(z: string): string {
  const ohne = z.replace(/^[ \t]+/, '');
  if (/^\d{1,9}[.)]/.test(ohne)) return ohne.replace(/^(\d{1,9})([.)])/, '$1\\$2');
  return /^[!-/:-@[\]-`{-~]/.test(ohne) ? `\\${ohne}` : ohne;
}

// Zeilenumbrüche werden zu Leerzeichen, so kann kein Text eine neue Zeile beginnen.
function flach(s: string): string {
  return zeilenende(s).replace(/\s*\n\s*/g, ' ').trim();
}

// Nur Einträge mit Text (ein leerer Entwurfs-Eintrag mitten in einer Liste erscheint nicht).
function gefuellt(xs: readonly string[]): string[] {
  return xs.filter((x) => flach(x) !== '');
}

/** Aufzählung aus Freitext-Einträgen; ohne Eintrag ein Punkt „Noch nichts eingetragen.“ */
export function liste(xs: readonly string[]): string {
  const g = gefuellt(xs);
  return g.length > 0 ? g.map((x) => `- ${listenpunkt(x)}`).join('\n') : `- ${LEER}`;
}

// Einzeilige Felder mitten in einer Zeile (nach „Ziel: “, „— “, „**F1** “). Leer -> „Noch nichts eingetragen.“
export function einzeilig(s: string): string {
  const t = flach(s);
  return t === '' ? LEER : zeichen(t);
}

// Einzeilige Felder, die einen Listenpunkt füllen und darum einen Block beginnen könnten.
export function listenpunkt(s: string): string {
  const t = flach(s);
  return t === '' ? LEER : zeilenanfang(zeichen(t));
}

// Mehrzeilige Felder: Absätze bleiben, Umbrüche innerhalb eines Absatzes werden harte Umbrüche (zwei Leerzeichen
// am Zeilenende; ein Backslash dort hinge an einer URL am Zeilenende mit dran), jede Zeile folgt der Zeilenanfangs-Regel.
export function mehrzeilig(s: string): string {
  const zeilen = zeilenende(s).trim().split('\n').map((z) => zeilenanfang(zeichen(z.trimEnd())));
  if (zeilen.length === 1 && zeilen[0] === '') return LEER;
  return zeilen.map((z, i) => (z === '' || zeilen[i + 1] === undefined || zeilen[i + 1] === '' ? z : `${z}  `)).join('\n');
}

// Für Tabellenzellen: einzeilig, dazu der senkrechte Strich maskiert.
export function zelle(s: string): string {
  return einzeilig(s).replace(/\|/g, '\\|');
}

// Anführungszeichen nur um echten Text.
export function zitat(s: string): string {
  const t = flach(s);
  return t === '' ? LEER : `„${zeichen(t)}“`;
}

// IDs und Notiz teilen sich eine Klammer; leere IDs und eine leere Notiz (Entwurf) zählen wie keine.
export function belegText(stufe: Belegstufe, ids: readonly string[], notiz?: string): string {
  const idText = gefuellt(ids).map(zelle).join(', ');
  const notizText = notiz !== undefined && flach(notiz) !== '' ? zelle(notiz) : '';
  const zusatz = [idText, notizText].filter(Boolean).join('; ');
  return zusatz ? `${BELEGSTUFE_TEXT[stufe]} (${zusatz})` : BELEGSTUFE_TEXT[stufe];
}
