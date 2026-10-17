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

// Regel für den Anfang jeder Freitext-Zeile, die einen Markdown-Block beginnen könnte: Einrückung entfernen
// (kein Codeblock), dann jedes ASCII-Satzzeichen am Anfang mit Backslash wörtlich machen. Bewusst ohne Ausnahmen:
// Ein Link oder Code ganz am Zeilenanfang erscheint dann als Text, dafür öffnet kein Eintrag je einen Block
// (Überschrift, Liste, HTML, Verweisdefinition …). Eine geordnete Liste (1. oder 2)) wird vor dem Satzzeichen
// maskiert (1\.), die Ziffer bleibt.
function zeilenanfang(z: string): string {
  const ohne = z.replace(/^[ \t]+/, '');
  if (/^\d{1,9}[.)]/.test(ohne)) return ohne.replace(/^(\d{1,9})([.)])/, '$1\\$2');
  return /^[!-/:-@[-`{-~]/.test(ohne) ? `\\${ohne}` : ohne;
}

// Zeilenumbrüche werden zu Leerzeichen, so kann kein Text eine neue Zeile beginnen.
function flach(s: string): string {
  return zeilenende(s).replace(/\s*\n\s*/g, ' ').trim();
}

// Einzeilige Felder mitten in einer Zeile (nach „Ziel: “, „— “, „**F1** “). Leer -> „Noch nichts eingetragen.“
export function einzeilig(s: string): string {
  const t = flach(s);
  return t === '' ? LEER : t;
}

// Einzeilige Felder, die einen Listenpunkt füllen und darum einen Block beginnen könnten.
export function listenpunkt(s: string): string {
  const t = flach(s);
  return t === '' ? LEER : zeilenanfang(t);
}

// Mehrzeilige Felder: Absätze bleiben, Umbrüche innerhalb eines Absatzes werden harte Umbrüche (Backslash am
// Zeilenende), jede Zeile folgt der Zeilenanfangs-Regel.
export function mehrzeilig(s: string): string {
  const zeilen = zeilenende(s).trim().split('\n').map((z) => zeilenanfang(z.trimEnd()));
  if (zeilen.length === 1 && zeilen[0] === '') return LEER;
  return zeilen
    .map((z, i) => {
      if (z === '' || zeilen[i + 1] === undefined || zeilen[i + 1] === '') return z;
      // Endet die Zeile auf eine ungerade Zahl Backslashs, ist der letzte unmaskiert: ein weiterer macht ihn wörtlich,
      // zwei Leerzeichen tragen den Umbruch. Bei gerader Zahl (oder keinem) trägt ein Backslash den Umbruch.
      const rest = /\\*$/.exec(z)![0].length;
      return rest % 2 === 1 ? `${z}\\  ` : `${z}\\`;
    })
    .join('\n');
}

// Für Tabellenzellen: einzeilig, Backslash und senkrechter Strich maskiert.
export function zelle(s: string): string {
  return einzeilig(s).replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
}

// Anführungszeichen nur um echten Text.
export function zitat(s: string): string {
  const t = flach(s);
  return t === '' ? LEER : `„${t}“`;
}

// IDs und Notiz teilen sich eine Klammer; leere IDs und eine leere Notiz (Entwurf) zählen wie keine.
export function belegText(stufe: Belegstufe, ids: readonly string[], notiz?: string): string {
  const maskiert = (t: string) => t.replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
  const idText = ids.map(flach).filter(Boolean).map(maskiert).join(', ');
  const notizText = maskiert(flach(notiz ?? ''));
  const zusatz = [idText, notizText].filter(Boolean).join('; ');
  return zusatz ? `${BELEGSTUFE_TEXT[stufe]} (${zusatz})` : BELEGSTUFE_TEXT[stufe];
}
