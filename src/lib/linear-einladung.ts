// Einladungslink in den Linear-Workspace für Übung 10 (Tag 3). Er kommt aus der
// Vercel-Variable LINEAR_INVITE_URL und landet beim Build in der Seite hinter dem
// Kurspasswort – das Repo ist öffentlich, darum steht er nie im Code.
// Nur Einladungslinks der Form https://linear.app/<workspace>/join/<code> zählen; alles
// andere (auch die bloße Workspace-Adresse) fällt auf den Text ohne Link zurück.
export function linearEinladung(wert: string | undefined): string | null {
  const roh = wert?.trim();
  if (!roh) return null;
  try {
    const url = new URL(roh);
    const einladung =
      url.protocol === 'https:' && url.hostname === 'linear.app' && !url.port && !url.username && !url.password &&
      /^\/[^/]+\/join\/[^/]+\/?$/.test(url.pathname);
    return einladung ? url.href : null;
  } catch {
    return null;
  }
}
