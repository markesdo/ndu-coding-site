// Autor*in und Nachricht der Commits, die die Werkstatt im Namen der angemeldeten Person schreibt (Artefakte speichern,
// Feedback der Lehrenden und der Studierenden). Eine Stelle, damit alle Routen dieselbe Form nutzen.
import type { Sitzung } from './sitzung.js';

const NACHRICHT_HOECHSTENS = 100;
// Rückhalt: Grapheme können beliebig lang sein (kombinierende Zeichen); mehr UTF-16-Einheiten kommen nie in den Commit.
const NACHRICHT_EINHEITEN = 300;

/** Die angemeldete Person mit ihrer noreply-Adresse von GitHub (so ordnet GitHub den Commit ihrem Konto zu). */
export function commitAutor(s: Pick<Sitzung, 'githubId' | 'login'>): { name: string; email: string } {
  return { name: s.login, email: `${s.githubId}+${s.login}@users.noreply.github.com` };
}

// Commit-Nachricht: einzeilig, ohne Steuer- und Formatzeichen (z. B. U+202E dreht Text um), höchstens 100 Zeichen
// nach Graphemen. Der Joiner in Emoji-Folgen (Join_Control) bleibt, sonst zerfiele eine Familie in Einzelpersonen.
export function kurzeNachricht(roh: string): string {
  const sauber = roh.replace(/(?!\p{Join_Control})[\p{Cc}\p{Cf}]/gu, ' ').replace(/\s+/g, ' ').trim();
  let laenge = 0;
  const behalten: string[] = [];
  // Lazy über die Grapheme und früh aufhören: lange Eingaben werden nie ganz zerlegt. Nur ganze Grapheme.
  for (const { segment } of new Intl.Segmenter('de', { granularity: 'grapheme' }).segment(sauber)) {
    if (behalten.length === NACHRICHT_HOECHSTENS || laenge + segment.length > NACHRICHT_EINHEITEN) break;
    behalten.push(segment);
    laenge += segment.length;
  }
  return behalten.join('').trim();
}
