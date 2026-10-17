// GitHub-App-User-Autorisierung (OAuth-Web-Flow): wer ist die Person? Das User-Token wird nur für einen
// Aufruf von /user gebraucht und danach verworfen, nie gespeichert oder geloggt.
import type { GithubIdentitaet, Umgebung } from '../typen.js';

type Zugangsdaten = Pick<Umgebung, 'githubClientId' | 'githubClientSecret'>;

// Als Funktion übergeben, wenn die Umgebung erst bei der ersten Anfrage gelesen werden darf (produktion.ts).
export function githubIdentitaet(
  env: Zugangsdaten | (() => Zugangsdaten),
  fetchFn: typeof fetch = fetch,
  zeitlimitMs = 8000,
): GithubIdentitaet {
  const daten = () => (typeof env === 'function' ? env() : env);
  return {
    loginUrl(state, redirectUri) {
      const url = new URL('https://github.com/login/oauth/authorize');
      url.searchParams.set('client_id', daten().githubClientId);
      url.searchParams.set('state', state);
      url.searchParams.set('redirect_uri', redirectUri);
      return url.toString();
    },
    async codeEinloesen(code, redirectUri) {
      const { githubClientId, githubClientSecret } = daten();
      const tausch = await fetchFn('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(zeitlimitMs),
        body: JSON.stringify({ client_id: githubClientId, client_secret: githubClientSecret, code, redirect_uri: redirectUri }),
      });
      if (!tausch.ok) throw new Error(`GitHub-Tokentausch: HTTP ${tausch.status}`);
      const t = (await tausch.json()) as { access_token?: unknown; error?: unknown };
      // GitHub antwortet auf einen ungültigen Code mit 200 und { error }.
      if (typeof t.access_token !== 'string' || !t.access_token) {
        throw new Error(`GitHub-Tokentausch abgelehnt${typeof t.error === 'string' ? `: ${t.error}` : ''}`);
      }
      const antwort = await fetchFn('https://api.github.com/user', {
        headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${t.access_token}`, 'User-Agent': 'ndu-werkstatt' },
        signal: AbortSignal.timeout(zeitlimitMs),
      });
      if (!antwort.ok) throw new Error(`GitHub /user: HTTP ${antwort.status}`);
      const u = (await antwort.json()) as { id?: unknown; login?: unknown };
      if (!Number.isSafeInteger(u.id) || (u.id as number) <= 0 || typeof u.login !== 'string' || !u.login) {
        throw new Error('GitHub /user: unerwartete Antwort');
      }
      return { githubId: u.id as number, login: u.login };
    },
  };
}
