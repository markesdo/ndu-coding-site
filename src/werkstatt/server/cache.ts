// Kurzlebiger Schlüssel-Wert-Speicher (Installations-Tokens, verbrauchte Refresh-Tokens).
// Prod: Vercel Runtime Cache wie api/position.ts. Tests und Dev: eine Map pro Prozess.
import { getCache } from '@vercel/functions';
import { ohneRuntimeCache } from '../../lib/runtime-cache.js';
import { ApiAusnahme } from './antwort.js';
import type { Cache } from './typen.js';

// Ohne Runtime Cache auf Vercel lieber laut scheitern (503): Sonst sähen verschiedene Instanzen Verschiedenes,
// z. B. ein verbrauchtes Refresh-Token als frisch.
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
