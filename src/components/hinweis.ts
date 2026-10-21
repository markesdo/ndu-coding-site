// Kurzer Hinweis oben in der Mitte (Stil .wo-ist-hinweis in global.css) – für „Wo ist Markus?“ (wo-ist.ts) und das
// Aufdecken für alle (Aufloesung.astro).
export function hinweis(text: string, ms = 4000) {
  const el = document.createElement('div');
  el.className = 'wo-ist-hinweis';
  el.setAttribute('role', 'status');
  el.textContent = text;
  // Steht gerade der Hinweis „Seite aktualisiert“ oben (sichtbar, nicht im Beamer ausgeblendet), darunter einreihen.
  const banner = document.querySelector('.neu-laden');
  if (banner && banner.getClientRects().length > 0) el.style.top = `${Math.round(banner.getBoundingClientRect().bottom) + 8}px`;
  document.body.append(el);
  setTimeout(() => el.remove(), ms);
}
