// Kurzlebiger Schlüssel-Wert-Speicher (Installations-Tokens, verbrauchte Refresh-Tokens).
// Prod: Vercel Runtime Cache wie api/position.ts. Tests und Dev: eine Map pro Prozess.
import { getCache } from '@vercel/functions';
import { ApiAusnahme } from './antwort.js';
import type { Cache } from './typen.js';

// getCache() fiele auf Vercel ohne Anfrage-Kontext still auf einen Speicher pro Instanz zurück – dann sähen
// verschiedene Instanzen Verschiedenes (z. B. ein verbrauchtes Refresh-Token als frisch). Lieber laut scheitern.
const KONTEXT = Symbol.for('@vercel/request-context');
function ohneRuntimeCache(): boolean {
  const kontext = (globalThis as Record<symbol, { get?: () => { cache?: unknown } } | undefined>)[KONTEXT]?.get?.();
  return Boolean(process.env.VERCEL) && !kontext?.cache && !process.env.RUNTIME_CACHE_ENDPOINT;
}

export function vercelCache(): Cache {
  const cache = () => {
    if (ohneRuntimeCache()) throw new ApiAusnahme(503, 'unbekannt', 'Die Werkstatt ist gerade nicht erreichbar. Bitte später noch einmal versuchen.');
    return getCache();
  };
  return {
    async get(k) {
      return (await cache().get(k)) ?? undefined;
    },
    async set(k, v, ttlSek) {
      await cache().set(k, v, { ttl: ttlSek, name: 'werkstatt' });
    },
  };
}

export function mapCache(jetzt: () => number = Date.now): Cache {
  const eintraege = new Map<string, { v: unknown; bis: number }>();
  return {
    async get(k) {
      const e = eintraege.get(k);
      if (!e) return undefined;
      if (jetzt() >= e.bis) {
        eintraege.delete(k);
        return undefined;
      }
      return e.v;
    },
    async set(k, v, ttlSek) {
      eintraege.set(k, { v, bis: jetzt() + ttlSek * 1000 });
    },
  };
}
