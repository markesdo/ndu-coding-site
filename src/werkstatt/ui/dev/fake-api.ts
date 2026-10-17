// Nur für die Dev-Testseite: ersetzt fetch für /api/werkstatt, solange die echten Router (T4, T11) fehlen.
// ?fake=ok | konflikt | ausfall | abgemeldet | einrichten. Wird nie gebaut (die Seite entsteht nur im Dev-Server).
import beispiel from '../../beispiele/annahmen.json';

export function fakeApiEinschalten(szenario: string): void {
  let sha = 'sha-1';
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  const echtesFetch = window.fetch.bind(window);

  window.fetch = async (eingabe, optionen) => {
    const url = new URL(typeof eingabe === 'string' ? eingabe : eingabe instanceof URL ? eingabe.href : eingabe.url, location.href);
    if (!url.pathname.startsWith('/api/werkstatt/')) return echtesFetch(eingabe, optionen);
    if (url.pathname.endsWith('/auth/ich')) {
      if (szenario === 'abgemeldet') return json(401, { fehler: 'Nicht angemeldet.', code: 'nicht-angemeldet' });
      return json(200, { githubId: 900001, login: 'sofie-test', kohorte: 'test', rolle: 'studierende', repo: szenario === 'einrichten' ? null : 'test/mappe-sofie' });
    }
    if (optionen?.method === 'PUT') {
      (window as unknown as { __puts: number }).__puts = ((window as unknown as { __puts?: number }).__puts ?? 0) + 1;
      await new Promise((r) => setTimeout(r, 300)); // langsam genug, um Doppelklick zu probieren
      if (szenario === 'konflikt') {
        sha = `sha-${Number(sha.slice(4)) + 1}`; // jemand anderes hat inzwischen gespeichert
        return json(409, { fehler: 'Inzwischen geändert – neu laden. Dein Entwurf bleibt erhalten.', code: 'konflikt' });
      }
      if (szenario === 'ausfall') return json(502, { fehler: 'GitHub nicht erreichbar.', code: 'github-fehler' });
      sha = `sha-${Number(sha.slice(4)) + 1}`;
      return json(200, { basisSha: sha, commitUrl: 'https://example.invalid/commit' });
    }
    // Von Hand in der Konsole: window.__ladenAusfall = true → Laden scheitert (Wiederöffnen nach Fehler prüfen).
    if ((window as unknown as { __ladenAusfall?: boolean }).__ladenAusfall) return json(502, { fehler: 'GitHub nicht erreichbar.', code: 'github-fehler' });
    return json(200, { name: 'annahmen', daten: beispiel, basisSha: sha });
  };
}
