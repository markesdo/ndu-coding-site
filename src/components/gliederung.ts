// Gliederung einer Tagesseite aus ihrem Quelltext: h2 mit id, darunter die Übungsschritte a)–f) als h3 mit id.
// Daraus entstehen beim Bauen das Inhaltsverzeichnis und die Beschriftung der „Wo bin ich“-Leiste.

export interface Eintrag {
  id: string;
  /** Text für das Inhaltsverzeichnis. */
  text: string;
  /** Kurzform für die Leiste, z. B. „Übung 1 · c) Vage oder präzise · 10 min“. */
  leiste: string;
}

export interface Abschnitt extends Eintrag {
  schritte: Eintrag[];
}

const ohneTags = (html: string) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

/** „c) Vage oder präzise – ein Raum-Experiment (10 min)“ → { titel: „c) Vage oder präzise“, dauer: „10 min“ } */
function kurz(text: string): { titel: string; dauer?: string } {
  const dauer = text.match(/\((?:[^()]*?,\s*)?(\d+\s*min)[^()]*\)\s*$/)?.[1];
  const ohneKlammer = text.replace(/\s*\([^()]*\)\s*$/, '');
  return { titel: ohneKlammer.split(' – ')[0].trim(), dauer };
}

export function gliederung(quelle: string): Abschnitt[] {
  const abschnitte: Abschnitt[] = [];
  const re = /<(h2|h3)\b([^>]*)>([\s\S]*?)<\/\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(quelle))) {
    const [, tag, attrs, inhalt] = m;
    const id = attrs.match(/\bid="([^"]+)"/)?.[1];
    if (!id) continue;
    if (tag === 'h2') {
      // Die Dauer steht bei Übungen als Pille im h2: „Übung 1 · Erste eigene Änderungen <span class="pill">60 min</span>“.
      const pille = inhalt.match(/<span[^>]*class="pill[^"]*"[^>]*>([\s\S]*?)<\/span>/)?.[1];
      const text = ohneTags(inhalt.replace(/<span[^>]*class="pill[^"]*"[^>]*>[\s\S]*?<\/span>/, ''));
      abschnitte.push({ id, text, leiste: pille ? `${text} · ${ohneTags(pille)}` : text, schritte: [] });
      continue;
    }
    const aktuell = abschnitte.at(-1);
    const text = ohneTags(inhalt);
    // Nur Übungsschritte a)–f) unter einer Übung; Checklisten-Überschriften u. Ä. bleiben draußen.
    if (!aktuell || !/^Übung\b/.test(aktuell.text) || !/^[a-z]\)\s/.test(text)) continue;
    const { titel, dauer } = kurz(text);
    const uebung = aktuell.text.split(' · ')[0];
    aktuell.schritte.push({ id, text, leiste: [uebung, titel, dauer].filter(Boolean).join(' · ') });
  }
  return abschnitte;
}
