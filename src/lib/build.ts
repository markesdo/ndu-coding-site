// Kennung dieses Builds für „Neue Version – neu laden“ (lib/neu-laden.ts). Auf Vercel der Commit; lokal leer –
// dann fragt die Seite gar nicht erst nach. Zum Ausprobieren: NDU_BUILD=aaa npm run build.
export const BUILD = process.env.NDU_BUILD || process.env.VERCEL_GIT_COMMIT_SHA || '';
