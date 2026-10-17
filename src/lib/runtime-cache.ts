// Gemeinsam für api/position.ts und die Werkstatt (src/werkstatt/server/cache.ts).
// getCache() nimmt den echten Runtime Cache aus dem Anfrage-Kontext (in @vercel/functions: getContext().cache, nicht
// exportiert – gleiches Symbol wie dort), sonst den Build-Cache über RUNTIME_CACHE_ENDPOINT, sonst still einen
// Speicher pro Instanz. Auf Vercel hieße Letzteres: Verschiedene Instanzen sähen Verschiedenes – lieber laut scheitern.
const KONTEXT = Symbol.for('@vercel/request-context');

export function ohneRuntimeCache(): boolean {
  const kontext = (globalThis as Record<symbol, { get?: () => { cache?: unknown } } | undefined>)[KONTEXT]?.get?.();
  return Boolean(process.env.VERCEL) && !kontext?.cache && !process.env.RUNTIME_CACHE_ENDPOINT;
}
