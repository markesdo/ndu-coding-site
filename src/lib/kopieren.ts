// Kopieren für Prompt-Karten und kopierbare Inline-Werte (<code data-kopieren>).
// Ehrlich bei Fehlern: Klappt die Zwischenablage nicht (kein HTTPS, Rechte), wird der Text markiert,
// und die Seite sagt „mit ⌘C kopieren“ statt „Kopiert“.

export type KopierErgebnis = 'kopiert' | 'markiert';

/** Der Wert, der kopiert wird: data-wert, sonst der sichtbare Text – ohne Leerraum am Rand. */
export function wertAus(el: { getAttribute(name: string): string | null; textContent: string | null }): string {
  return (el.getAttribute('data-wert') ?? el.textContent ?? '').trim();
}

// Vorlagen und Warnungen dürfen keinen Kopier-Knopf bekommen: Der kopierte Text wäre falsch oder gefährlich.
const NICHT_KOPIERBAR = [/…/, /\[[^\]]*\]/, /EURE-|EUER-|euer-name|ADRESSE|PROJECT-REF|TOKEN/, /--force\b/, /\brm -rf\b/];

export function darfKopierbarSein(wert: string): boolean {
  return wert.trim() !== '' && !NICHT_KOPIERBAR.some((re) => re.test(wert));
}

export async function kopiereText(text: string, zumMarkieren?: Node | null): Promise<KopierErgebnis> {
  try {
    await navigator.clipboard.writeText(text);
    return 'kopiert';
  } catch {
    if (zumMarkieren && typeof document !== 'undefined') {
      const r = document.createRange();
      r.selectNodeContents(zumMarkieren);
      const sel = getSelection();
      sel?.removeAllRanges();
      sel?.addRange(r);
      // Ältere Kopier-Funktion auf der Markierung – klappt oft auch ohne HTTPS oder Clipboard-Recht.
      try { if (document.execCommand('copy')) return 'kopiert'; } catch {}
    }
    return 'markiert';
  }
}

/** Rückmeldung nach dem Kopieren – dieselbe für Prompt-Karten und Inline-Werte. */
export function kopierMeldung(ergebnis: KopierErgebnis, plattform: string): string {
  return ergebnis === 'kopiert' ? 'Kopiert' : `Markiert – mit ${kopierKuerzel(plattform)} kopieren`;
}

/** Tastenkürzel zum Kopieren, passend zum Gerät – für die Meldung, wenn nur markiert wurde. */
export function kopierKuerzel(plattform: string): string {
  return /Mac|iPhone|iPad/i.test(plattform) ? '⌘C' : 'Strg+C';
}
