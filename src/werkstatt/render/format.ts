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

// Allgemeine Regel für den Anfang jeder ausgegebenen Freitext-Zeile: Einrückung entfernen (kein Codeblock),
// dann ein ASCII-Satzzeichen am Anfang mit Backslash wörtlich machen. Eine geordnete Liste (1. oder 2))
// wird vor dem Satzzeichen maskiert (1\.), die Ziffer bleibt unberührt.
function zeilenanfang(z: string): string {
  const ohne = z.replace(/^[ \t]+/, '');
  if (/^\d{1,9}[.)]/.test(ohne)) return ohne.replace(/^(\d{1,9})([.)])/, '$1\\$2');
  return /^[!-/:-@[-`{-~]/.test(ohne) ? `\\${ohne}` : ohne;
}

// Einzeilige Felder: Zeilenumbrüche werden zu Leerzeichen, so kann kein Text eine neue Zeile beginnen.
// Leer -> „Noch nichts eingetragen.“
export function einzeilig(s: string): string {
  const t = zeilenende(s).replace(/\s*\n\s*/g, ' ').trim();
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
      // Endet die Zeile selbst auf einen Backslash, trägt der Umbruch zwei Leerzeichen statt eines zweiten Backslashs.
      return z.endsWith('\\') ? `${z}\\  ` : `${z}\\`;
    })
    .join('\n');
}

// Für Tabellenzellen: einzeilig, Backslash und senkrechter Strich maskiert.
export function zelle(s: string): string {
  const t = zeilenende(s).replace(/\s*\n\s*/g, ' ').trim();
  return (t === '' ? LEER : t).replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
}

// Anführungszeichen nur um echten Text.
export function zitat(s: string): string {
  const t = einzeilig(s);
  return t === LEER ? LEER : `„${t}“`;
}

// IDs und Notiz teilen sich eine Klammer; eine leere Notiz (Entwurf) zählt wie keine.
export function belegText(stufe: Belegstufe, ids: readonly string[], notiz?: string): string {
  const zusatz = [ids.map(zelle).join(', '), notiz?.trim() ? zelle(notiz) : ''].filter(Boolean).join('; ');
  return zusatz ? `${BELEGSTUFE_TEXT[stufe]} (${zusatz})` : BELEGSTUFE_TEXT[stufe];
}
