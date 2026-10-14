// Einladungslink in den Linear-Workspace für Übung 10 (Tag 3). Er kommt aus der
// Vercel-Variable LINEAR_INVITE_URL und landet beim Build in der Seite hinter dem
// Kurspasswort – das Repo ist öffentlich, darum steht er nie im Code.
// Nur https-Links auf linear.app zählen; alles andere fällt auf den Text ohne Link zurück.
export function linearEinladung(wert: string | undefined): string | null {
  const roh = wert?.trim();
  if (!roh) return null;
  try {
    const url = new URL(roh);
    return url.protocol === 'https:' && url.hostname === 'linear.app' ? url.href : null;
  } catch {
    return null;
  }
}
