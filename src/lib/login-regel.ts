// Prompt „Regel für Login-Weiterleitungen“ – steht in Tag 2 (Übung 5e) und auf /login-lokal-und-live.
// Dieselbe Regel steht in CLAUDE.md der Templates ndu-coding-2026 und ndu-projekt; bei Änderungen dort mitziehen.
export const LOGIN_REGEL_PROMPT =
  'Trag in CLAUDE.md im Abschnitt Tech-Stack diese Regel als eigenen Punkt „Login-Weiterleitungen“ ein, falls sie fehlt: ' +
  'Jeder Supabase-Aufruf mit Weiterleitung (signUp mit emailRedirectTo, Passwort-Reset, Magic Link, Google-/GitHub-Login) ' +
  'bekommt als Ziel die aktuelle Adresse der App plus eine Route, die den Code aus dem Link in eine Sitzung tauscht ' +
  '(z. B. /auth/confirm, nach der Supabase-Doku für Next.js) – nie eine feste URL wie localhost:3000 oder die Vercel-Adresse. ' +
  'Aktuelle Adresse: im Browser window.location.origin, auf dem Server aus den Request-Headern. ' +
  'Supabase akzeptiert nur Adressen, die unter Authentication → URL Configuration → Redirect URLs stehen, und nimmt sonst stillschweigend die Site URL. ' +
  'Landet ein Login auf der falschen Adresse, prüf zuerst diese Liste und sag mir, was dort fehlt. ' +
  'Prüf dann, ob der Code schon irgendwo eine feste Adresse für Weiterleitungen verwendet, und sag es mir, bevor du etwas änderst.';
