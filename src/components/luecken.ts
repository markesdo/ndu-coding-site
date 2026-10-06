// Markiert Platzhalter wie „[Nummer]“ in gerendertem Prompt-HTML mit <mark class="luecke">.
// Nur in Text, nie in Tags (Attribute bleiben unberührt). Ausgenommen sind Pfadsegmente wie „/events/[id]“
// und Klammern direkt nach Buchstaben/Ziffern (z. B. Array-Zugriffe in Code).
const PLATZHALTER = /(?<![\/\w])\[([^\][\n<>"]{1,80})\]/g;

export function lueckenMarkieren(html: string): string {
  return html
    .split(/(<[^>]*>)/)
    .map((teil) => (teil.startsWith('<') ? teil : teil.replace(PLATZHALTER, '<mark class="luecke">[$1]</mark>')))
    .join('');
}
