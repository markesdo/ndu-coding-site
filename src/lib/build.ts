// Kennung dieses Builds für „Neue Version – neu laden“ (lib/neu-laden.ts). Auf Vercel der Commit; lokal leer –
// dann fragt die Seite gar nicht erst nach. Zum Ausprobieren: NDU_BUILD=aaa npm run build.
// Ohne Git-Daten (Deploy per CLI) die Deploy-Kennung – sonst wäre der Hinweis dort stillschweigend aus.
export const BUILD = process.env.NDU_BUILD || process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID || '';
