// Kleine Bausteine der Renderer. Reine Funktionen, keine Node-Module.

// ISO-Datum (2026-10-22) -> österreichisch (22.10.2026). Fremdes bleibt unverändert.
export function datumAt(iso: string): string {
  const t = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return t ? `${t[3]}.${t[2]}.${t[1]}` : iso;
}

// Einzeilige Felder: Zeilenumbrüche werden zu Leerzeichen, so kann kein Text eine neue Zeile beginnen.
export function einzeilig(s: string): string {
  return s.replace(/\s*\r?\n\s*/g, ' ').trim();
}

// Mehrzeilige Felder: Umbrüche bleiben, aber keine Zeile darf als Überschrift, Liste, Zitat,
// Tabelle, Codeblock oder Trennlinie beginnen. Ein Backslash davor macht das Zeichen wörtlich.
export function mehrzeilig(s: string): string {
  return s
    .split(/\r?\n/)
    .map((z) => z.replace(/^(\s*)(?=[#>*+\-=|`~]|\d+[.)]\s)/, '$1\\'))
    .join('\n');
}

// Für Tabellenzellen: einzeilig, Backslash und senkrechter Strich maskiert.
export function zelle(s: string): string {
  return einzeilig(s).replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
}

