// HTML der Zustimmungsseite und der Meldungen von oauth/authorize. Eigenständig (kein Astro), deutsch, „du“.
// Alles Fremde (state, client_id …) läuft durch esc(); CSP ohne Skripte, nicht einbettbar (Clickjacking).
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (z) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[z]!);
}

const STIL = `
:root{color-scheme:light dark;--grund:#f6f5f2;--karte:#fff;--text:#1d1d1b;--leise:#5d5d58;--rand:#d9d7d0;--akzent:#1f5f4a;--akzent-text:#fff}
@media (prefers-color-scheme:dark){:root{--grund:#161615;--karte:#21211f;--text:#ecebe6;--leise:#a9a8a0;--rand:#3a3a36;--akzent:#7fc4a8;--akzent-text:#10201a}}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:16px;background:var(--grund);color:var(--text);font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
main{width:100%;max-width:30rem;background:var(--karte);border:1px solid var(--rand);border-radius:12px;padding:28px}
h1{font-size:1.3rem;line-height:1.3;margin:0 0 12px}
p{margin:0 0 12px;color:var(--leise)}
strong{color:var(--text)}
.ziel{font-size:1.05rem;padding:10px 12px;border:1px solid var(--rand);border-radius:8px;margin:16px 0;color:var(--text)}
.knoepfe{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}
button,a.knopf{font:inherit;padding:10px 18px;border-radius:8px;border:1px solid var(--rand);background:transparent;color:var(--text);cursor:pointer;text-decoration:none}
button.erlauben,a.knopf{background:var(--akzent);border-color:var(--akzent);color:var(--akzent-text);font-weight:600}
button:focus-visible,a.knopf:focus-visible{outline:3px solid var(--akzent);outline-offset:2px}
`;

function seite(c: Context, status: ContentfulStatusCode, titel: string, rumpf: string, ziel?: URL): Response {
  // Mit Formular (ziel gesetzt) same-origin: unter no-referrer schickt der Browser beim Absenden „Origin: null“
  // (Fetch-Spec, „serializing a request origin“), und die CSRF-Prüfung lehnt ab. same-origin gibt dem Ziel
  // (claude.ai oder Claude Code auf localhost) nach der Weiterleitung trotzdem keinen Referer. Reine Meldungsseiten
  // bleiben bei no-referrer.
  const nonce = crypto.getRandomValues(new Uint8Array(16)).reduce((s, b) => s + b.toString(16).padStart(2, '0'), '');
  // form-action muss auch das Ziel erlauben: Browser wenden es auf die Weiterleitung nach dem Absenden an.
  // ziel.origin ist https://claude.ai oder bei Claude Code http://localhost:<Port>.
  const formAction = ziel ? `'self' ${ziel.origin}` : `'self'`;
  c.header('Content-Security-Policy', `default-src 'none'; style-src 'nonce-${nonce}'; form-action ${formAction}; frame-ancestors 'none'; base-uri 'none'`);
  c.header('X-Frame-Options', 'DENY');
  c.header('Cache-Control', 'no-store');
  c.header('Referrer-Policy', ziel ? 'same-origin' : 'no-referrer');
  c.header('X-Content-Type-Options', 'nosniff');
  return c.html(
    `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${esc(titel)}</title><style nonce="${nonce}">${STIL}</style></head>
<body><main>
${rumpf}
</main></body></html>`,
    status,
  );
}

export interface Zustimmung {
  // Geprüfte Rücksprungadresse und Name des Clients (clients.ts).
  ziel: URL;
  name: string;
  trennen: string;
  login: string;
  // Alle Parameter der Anfrage, unverändert zurück an POST oauth/authorize (dort erneut geprüft).
  felder: Record<string, string>;
  aktion: string;
}

export function zustimmungsSeite(c: Context, z: Zustimmung): Response {
  const versteckt = Object.entries(z.felder)
    .map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`)
    .join('\n');
  const titel = `${z.name} möchte deine Mappe lesen`;
  return seite(
    c,
    200,
    titel,
    `<h1>${esc(titel)}</h1>
<p>Du bist mit GitHub als <strong>${esc(z.login)}</strong> angemeldet.</p>
<p class="ziel">Nach deiner Zustimmung geht es weiter zu <strong>${esc(z.ziel.host)}</strong>.</p>
<p>Claude kann dann über den Connector deine Artefakte lesen und dir Rückmeldung dazu geben. Trennen kannst du die Verbindung jederzeit ${esc(z.trennen)}.</p>
<p>Erlaube das nur, wenn du gerade selbst den Werkstatt-Connector verbindest.</p>
<form method="post" action="${esc(z.aktion)}">
${versteckt}
<div class="knoepfe">
<button type="submit" name="entscheidung" value="erlauben" class="erlauben">Erlauben</button>
<button type="submit" name="entscheidung" value="ablehnen">Abbrechen</button>
</div>
</form>`,
    z.ziel,
  );
}

export function meldungsSeite(c: Context, status: ContentfulStatusCode, titel: string, text: string, knopf?: { text: string; href: string }): Response {
  const k = knopf ? `<div class="knoepfe"><a class="knopf" href="${esc(knopf.href)}">${esc(knopf.text)}</a></div>` : '';
  return seite(c, status, titel, `<h1>${esc(titel)}</h1>\n<p role="alert">${esc(text)}</p>\n${k}`);
}
