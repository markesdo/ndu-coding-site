// Gemeinsames Nachfragen im Browser für „Wo ist Markus?“ (components/wo-ist.ts) und „Seite aktualisiert“
// (components/neu-laden.ts). Eine Kette statt setInterval: Die nächste Runde wird erst geplant, wenn die laufende fertig
// ist – so überholt keine alte Antwort eine neue, und hängende Anfragen stauen sich nicht. Ohne DOM, damit testbar.

export interface Kette {
  /** Nächste Runde in ms (ersetzt eine schon geplante). */
  planen(ms: number): void;
  /** Gleich eine Runde – läuft schon eine, plant die ohnehin die nächste. */
  sofort(): void;
}

export interface KettenOptionen {
  /** Eine Runde mit Anfrage; gibt die Wartezeit bis zur nächsten zurück. Fängt eigene Fehler selbst. */
  runde: () => Promise<number>;
  /** Gerade keine Anfrage (Tab im Hintergrund, Beamer-Modus …)? Dann nur in ruheMs wieder nachsehen. */
  ruht: () => boolean;
  /** Wird in jeder ruhenden Runde aufgerufen, z. B. um eine Anzeige auszublenden. */
  ruhend?: () => void;
  ruheMs: number;
}

export function abfrageKette(o: KettenOptionen): Kette {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let laeuft = false;
  const planen = (ms: number) => { clearTimeout(timer); timer = setTimeout(tick, ms); };

  async function tick() {
    if (laeuft) return; // die laufende Runde plant die nächste selbst
    if (o.ruht()) { o.ruhend?.(); planen(o.ruheMs); return; }
    laeuft = true;
    let ms = o.ruheMs;
    try {
      ms = await o.runde();
    } catch (e) {
      console.warn('[kette] Runde fehlgeschlagen:', e); // Sicherheitsnetz – die Kette darf nicht abreißen
    } finally {
      laeuft = false;
      planen(ms);
    }
  }

  return { planen, sofort: () => planen(0) };
}

/** AbortSignal.timeout fehlt in älterem Safari (< 16). */
export function zeitlimit(ms: number): AbortSignal {
  if ('timeout' in AbortSignal) return AbortSignal.timeout(ms);
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

/**
 * JSON holen, am Cache vorbei. Wirft bei Umleitung (Kurspasswort → Login-Seite sähe im fetch wie Erfolg aus),
 * Fehlerstatus, fehlendem JSON und nach timeoutMs.
 */
export async function jsonHolen(url: string, timeoutMs: number): Promise<unknown> {
  const r = await fetch(url, { cache: 'no-store', signal: zeitlimit(timeoutMs) });
  if (r.redirected) throw new Error(`${url} wurde umgeleitet – fehlt die Ausnahme im Kurspasswort-Matcher?`);
  if (!r.ok || !r.headers.get('content-type')?.includes('application/json')) throw new Error(`${url}: Status ${r.status}, kein JSON`);
  return r.json();
}
