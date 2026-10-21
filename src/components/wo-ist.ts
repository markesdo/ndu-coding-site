// „Wo ist Markus?“ – im Browser, eingebunden in Layout.astro.
// Präsentator (Beamer-Modus + Schlüssel): meldet Seite und Abschnitt an /api/position, sobald sie sich ändern, sonst jede Minute.
// Studierende: fragen nach (Takt: ABFRAGE_MS / RUHIG_MS in lib/position.ts; Kette aus lib/kette.ts), immer nur eine Anfrage zugleich und zeigen unten rechts „Markus ist bei: …“ – ein Klick springt hin, nie automatisch.
// Anmelden am Präsentator-Rechner auf /praesentator (Schlüssel = PRESENTER_KEY, liegt dann im localStorage dieses Browsers).
// Der Live-Schalter in Kopf- bzw. Seitenleiste zeigt den Zustand und pausiert (Position wird dann gelöscht).
import { abschnittName, aktiverAbschnitt, pfadOhneSchraegstrich, seitenName, ueberschriftOberkanten, ueberschriftVon } from './abschnitt';
import { abfrageKette, jsonHolen, zeitlimit } from '../lib/kette';
import { PRAESENTATOR_SCHLUESSEL, beamerSchalten } from '../lib/beamer';
import { ABFRAGE_MS, ABFRAGE_TIMEOUT_MS, alterText, naechsteAbfrage, nochmalLoeschen, positionHref, type Position } from '../lib/position';

const KEY = PRAESENTATOR_SCHLUESSEL;
const PAUSE = 'ndu-presenter-pause';
const API = '/api/position';
const root = document.documentElement;

const lies = (): string | null => { try { return localStorage.getItem(KEY); } catch { return null; } };
const schreib = (wert: string | null) => {
  try { if (wert) localStorage.setItem(KEY, wert); else localStorage.removeItem(KEY); } catch {}
};

const pausiert = (): boolean => { try { return localStorage.getItem(PAUSE) === '1'; } catch { return false; } };
const pausieren = (an: boolean) => { try { if (an) localStorage.setItem(PAUSE, '1'); else localStorage.removeItem(PAUSE); } catch {} };

// Alle Schreibzugriffe gehen hierüber: Position, Prüfung ({ pruefen }), Löschen ({ aus }).
const melden = (key: string, body: string) =>
  fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-presenter-key': key }, body, signal: zeitlimit(8000) });

// Pause bzw. Abmelden: Position auf dem Server löschen, damit der Knopf bei den Studierenden gleich verschwindet.
function ausMelden(key: string) {
  melden(key, '{"aus":true}').catch((e) => console.warn('[wo-ist] Pause nicht gemeldet:', e));
}

// Früherer Präsentator-Link (#presenter=…, evtl. Lesezeichen): Schlüssel sofort aus der Adresszeile, angemeldet wird auf /praesentator.
if (location.hash.startsWith('#presenter=')) {
  history.replaceState(null, '', location.pathname + location.search);
  hinweisSpaeter('Der Präsentator-Link gilt nicht mehr – bitte auf /praesentator anmelden.');
}

function hinweisSpaeter(text: string) {
  if (document.body) hinweis(text); else addEventListener('DOMContentLoaded', () => hinweis(text), { once: true });
}

function hinweis(text: string) {
  const el = document.createElement('div');
  el.className = 'wo-ist-hinweis';
  el.setAttribute('role', 'status');
  el.textContent = text;
  // Steht gerade der Hinweis „Seite aktualisiert“ oben (sichtbar, nicht im Beamer ausgeblendet), darunter einreihen.
  const banner = document.querySelector('.neu-laden');
  if (banner && banner.getClientRects().length > 0) el.style.top = `${Math.round(banner.getBoundingClientRect().bottom) + 8}px`;
  document.body.append(el);
  setTimeout(() => el.remove(), 4000);
}

// Für /praesentator: Schlüssel beim Server prüfen (speichert nichts), dann merken.
export async function anmelden(key: string): Promise<'ok' | 'falsch' | 'abgemeldet' | 'fehler'> {
  try {
    const r = await melden(key, '{"pruefen":true}');
    if (r.status === 403) return 'falsch';
    if (r.status === 401) return 'abgemeldet';
    if (!r.ok || !r.headers.get('content-type')?.includes('application/json')) return 'fehler';
  } catch {
    return 'fehler';
  }
  schreib(key);
  pausieren(false);
  return 'ok';
}

export function abmelden() {
  const key = lies();
  if (key) ausMelden(key);
  schreib(null);
  pausieren(false);
}

export const angemeldet = (): boolean => Boolean(lies());

const sichtbar = (el: Element) => el.getClientRects().length > 0;
const ueberschriften = () => [...document.querySelectorAll<HTMLElement>('.inner :is(h2, h3)[id]')].filter(sichtbar);

const hierPfad = () => pfadOhneSchraegstrich(location.pathname);

const vorOderGleich = (a: Node, b: Node) => a === b || Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

/** Wo ist dieser Tab gerade? Offene Screenshot-Präsentation zählt vor der Scroll-Position. */
function jetzigePosition(): Position {
  const pfad = hierPfad();
  const hs = ueberschriften();
  let ziel: HTMLElement | undefined;
  let bild: string | undefined;
  if (document.querySelector('dialog.shot-zoom[open]') && location.hash) {
    const li = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (li?.matches('.shots > li')) { ziel = li; bild = li.dataset.label; }
  }
  if (!ziel) {
    // Am Seitenende erreichen die letzten Überschriften die Lesezeile nie – dann zählt das ganze Fenster.
    const amEnde = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
    const i = aktiverAbschnitt(ueberschriftOberkanten(hs), amEnde ? innerHeight : innerHeight * 0.35);
    ziel = hs[i];
  }
  const davor = ziel ? hs.filter((h) => vorOderGleich(h, ziel!)) : [];
  const letzte = davor.at(-1);
  const h3 = letzte?.tagName === 'H3' ? letzte : undefined;
  const h2 = davor.filter((h) => h.tagName === 'H2').at(-1);
  const name = abschnittName(h2 && ueberschriftVon(h2), h3 && ueberschriftVon(h3), bild);
  const seite = seitenName(document.title);
  return { pfad, anker: ziel?.id ?? '', titel: name ? `${seite} · ${name}` : seite };
}

// ---------------------------------------------------------------------------
// Präsentator
function praesentator() {
  let gesendet = '';
  let gesendetUm = 0;
  let kandidat = '';
  let kandidatSeit = 0;
  let sperreBis = 0;
  let fehler = false;

  // Live-Schalter: nur wo der Schlüssel liegt. live = sendet, wartet = nur im Beamer-Modus, fehler = letzte Meldung gescheitert.
  const knoepfe = [...document.querySelectorAll<HTMLButtonElement>('[data-praesentator]')];
  const TITEL = {
    live: 'Live: Die Studierenden sehen, wo du bist. Klick pausiert.',
    wartet: 'Live, aber gesendet wird nur im Beamer-Modus (Taste B). Klick pausiert.',
    fehler: 'Live, aber die letzte Meldung ist gescheitert (Details in der Konsole). Klick pausiert.',
    pause: 'Pausiert: Die Studierenden sehen nichts. Klick sendet wieder.',
  };
  const zeichnen = () => {
    const key = lies();
    const zustand = pausiert() ? 'pause' : !root.hasAttribute('data-beamer') ? 'wartet' : fehler ? 'fehler' : 'live';
    // Beamer-Knöpfe u. Ä. (data-nur-praesentator) zeigt das CSS nur mit html[data-ist-praesentator]; den Anfangswert setzt
    // Layout.astro vor dem ersten Zeichnen, hier folgt er An- und Abmelden.
    root.toggleAttribute('data-ist-praesentator', Boolean(key));
    // Abgemeldet (hier, in einem anderen Tab oder per 403), aber noch im Beamer-Modus: verlassen – ohne Schlüssel gibt es
    // keinen Knopf und keine Taste mehr zum Ausschalten.
    if (!key && root.hasAttribute('data-beamer')) beamerSchalten(root, false);
    for (const b of knoepfe) {
      b.hidden = !key;
      b.dataset.zustand = zustand;
      b.setAttribute('aria-pressed', String(zustand !== 'pause'));
      b.title = `${TITEL[zustand]} Abmelden: Seite /praesentator.`;
      b.querySelector('[data-praesentator-text]')!.textContent = zustand === 'pause' ? 'Live aus' : 'Live';
    }
  };
  knoepfe.forEach((b) => b.addEventListener('click', () => {
    const key = lies();
    if (!key) return;
    if (pausiert()) {
      pausieren(false);
      gesendet = ''; sperreBis = 0; fehler = false; // sofort wieder senden, sobald die Position steht
      hinweis('Live – die Studierenden sehen wieder, wo du bist.');
    } else {
      pausieren(true);
      ausMelden(key);
      hinweis('Pausiert – die Studierenden sehen deine Position nicht mehr.');
    }
    zeichnen();
  }));
  zeichnen();

  setInterval(async () => {
    zeichnen();
    const key = lies();
    if (!key || pausiert() || !root.hasAttribute('data-beamer') || document.visibilityState !== 'visible') return;
    const jetzt = Date.now();
    const pos = jetzigePosition();
    const s = JSON.stringify(pos);
    if (s !== kandidat) { kandidat = s; kandidatSeit = jetzt; return; }
    if (jetzt - kandidatSeit < 1500 || jetzt < sperreBis) return;
    if (s === gesendet && jetzt - gesendetUm < 60_000) return;
    sperreBis = jetzt + 10_000; // höchstens ein Versuch pro 10 s, falls etwas hängt
    try {
      const r = await melden(key, s);
      // Während der Anfrage pausiert oder (in einem anderen Tab) abgemeldet? Die Position kam evtl. nach dem Löschen an.
      if (pausiert() || lies() !== key) { if (nochmalLoeschen(r.ok, pausiert(), lies() === key)) ausMelden(key); return; }
      if (r.status === 403) { schreib(null); pausieren(false); fehler = false; hinweis('Präsentator-Schlüssel stimmt nicht – Präsentator-Modus aus.'); return; }
      fehler = !r.ok || !r.headers.get('content-type')?.includes('application/json');
      if (r.status === 401) { hinweis('Nicht mehr angemeldet – Seite neu laden und Kurspasswort eingeben.'); return; }
      if (fehler) { console.warn('[wo-ist] Position nicht gespeichert:', r.status); return; }
      gesendet = s; gesendetUm = Date.now(); sperreBis = 0;
    } catch (e) {
      fehler = true;
      console.warn('[wo-ist] Position nicht gesendet:', e);
    }
    zeichnen();
  }, 1000);
}

// ---------------------------------------------------------------------------
// Studierende
const X = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
const PIN = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>';

// Von Studierenden eingeklappt (× oder Wischen): nur noch der runde Pin, damit nichts Text verdeckt. Gilt für diesen Tab
// über Seitenwechsel hinweg; ein Tipp auf den Pin klappt wieder auf. Gemerkt wird, wo Markus beim Einklappen war – ist er
// inzwischen woanders, bekommt der Pin einen Ring (data-neu), klappt aber nicht von selbst auf.
const KLEIN = 'ndu-wo-ist-klein';
const kleinBei = (): string | null => { try { return sessionStorage.getItem(KLEIN); } catch { return null; } };
const kleinMerken = (bei: string | null) => { try { if (bei !== null) sessionStorage.setItem(KLEIN, bei); else sessionStorage.removeItem(KLEIN); } catch {} };

function studierende() {
  // Kasten mit Link und eigenem Schließen-Knopf; hidden steht am Kasten.
  const kasten = document.createElement('div');
  kasten.className = 'wo-ist';
  kasten.hidden = true;
  kasten.innerHTML = `<a class="wo-ist-link">${PIN}<span class="wo-ist-text"><span>Markus ist bei: </span><b></b><span class="wo-ist-alt"></span></span></a><button type="button" class="wo-ist-weg" aria-label="Einklappen" title="Einklappen – der Pin bleibt, ein Tipp darauf zeigt es wieder">${X}</button>`;
  const link = kasten.querySelector<HTMLAnchorElement>('a')!;
  const titel = link.querySelector('b')!;
  const alt = link.querySelector<HTMLElement>('.wo-ist-alt')!;
  document.body.append(kasten);
  let aktuell: Position | null = null;
  // Nach einem Klick auf ein Ziel, das hier nicht darstellbar ist, nicht weiter drängeln, bis Markus woanders ist.
  let erledigt = '';

  let langText = '';
  // Eine Stelle für den zugänglichen Namen: eingeklappt kurz, sonst Ziel und Alter; ohne Position keiner.
  function beschriften() {
    const bei = kleinBei();
    const neu = bei !== null && aktuell !== null && positionHref(aktuell) !== bei;
    kasten.toggleAttribute('data-neu', neu);
    const name = bei !== null ? (neu ? 'Markus ist woanders – anzeigen' : 'Anzeigen, wo Markus ist') : langText;
    if (name) link.setAttribute('aria-label', name); else link.removeAttribute('aria-label');
  }
  function klein(an: boolean) {
    kleinMerken(an ? (aktuell ? positionHref(aktuell) : '') : null);
    kasten.toggleAttribute('data-klein', an);
    beschriften();
  }
  kasten.toggleAttribute('data-klein', kleinBei() !== null);
  beschriften();
  kasten.querySelector('button')!.addEventListener('click', () => {
    klein(true);
    link.focus(); // der ×-Knopf verschwindet; der Fokus bleibt am Pin statt auf <body> zu fallen
  });
  // Wischen zur Seite klappt ein (Tablet, Laptop mit Touchscreen); senkrecht bleibt Scrollen. Nur ein Finger zählt.
  let wisch: { id: number; x: number; y: number } | null = null;
  kasten.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    wisch = e.touches.length === 1 ? { id: t.identifier, x: t.clientX, y: t.clientY } : null;
  }, { passive: true });
  kasten.addEventListener('touchcancel', () => { wisch = null; }, { passive: true });
  kasten.addEventListener('touchend', (e) => {
    const t = [...e.changedTouches].find((x) => x.identifier === wisch?.id);
    if (wisch && t && Math.abs(t.clientX - wisch.x) > 50 && Math.abs(t.clientX - wisch.x) > 2 * Math.abs(t.clientY - wisch.y)) klein(true);
    wisch = null;
  }, { passive: true });

  link.addEventListener('click', (e) => {
    // Eingeklappt: der erste Tipp klappt nur auf, springt aber nicht (Cmd/Strg/Mittelklick öffnen weiter einen neuen Tab).
    if (kasten.hasAttribute('data-klein') && !(e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)) { e.preventDefault(); klein(false); return; }
    if (!aktuell) return;
    erledigt = positionHref(aktuell);
    kasten.hidden = true;
    if (aktuell.pfad !== hierPfad()) return; // andere Seite: normaler Link
    const el = aktuell.anker ? document.getElementById(aktuell.anker) : null;
    // Sichtbares Ziel: sanft hinscrollen. Ziel in zugeklapptem <details> oder ausgeblendetem Mac/Windows-Teil:
    // den Anker setzen – UmgebungWahl klappt auf bzw. schaltet um (hashchange; gleicher Anker löst keins aus).
    if (el && zeigbar(aktuell)) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (!el) {
      e.preventDefault();
      scrollTo({ top: 0, behavior: 'smooth' });
    } else if (location.hash === `#${aktuell.anker}`) {
      e.preventDefault();
      dispatchEvent(new HashChangeEvent('hashchange'));
    }
  });

  // Ziel auf dieser Seite gerade darstellbar (nicht zugeklappt, nicht für das andere Betriebssystem ausgeblendet)?
  function zeigbar(p: Position): boolean {
    const el = p.pfad === hierPfad() && p.anker ? document.getElementById(p.anker) : null;
    return Boolean(el && el.getClientRects().length > 0 && !el.closest('details:not([open])'));
  }

  // Schon dort? Ziel im Fenster bzw. gleiche Seite am Anfang.
  function schonDa(p: Position): boolean {
    if (p.pfad !== hierPfad()) return false;
    if (!p.anker) return scrollY < innerHeight;
    const el = document.getElementById(p.anker);
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight;
  }

  // Kette (lib/kette.ts): immer nur eine Abfrage, die nächste erst nach der Antwort, Abbruch nach ABFRAGE_TIMEOUT_MS.
  let fehlerInFolge = 0;
  const kette = abfrageKette({
    // Im Hintergrund, im Beamer-Modus oder beim Präsentator selbst: ohne Anfrage nur nachsehen, ob sich das geändert hat.
    ruht: () => document.visibilityState !== 'visible' || root.hasAttribute('data-beamer') || Boolean(lies()),
    ruhend: () => { kasten.hidden = true; },
    ruheMs: ABFRAGE_MS,
    runde: async () => {
      let ergebnis: 'frisch' | 'leer' | 'fehler' = 'fehler';
      try {
        const d = (await jsonHolen(API, ABFRAGE_TIMEOUT_MS)) as { position: Position | null; zeit?: number; jetzt?: number };
        const alter = d.position && d.zeit && d.jetzt ? alterText(d.jetzt - d.zeit) : null;
        if (!d.position || alter === null) ergebnis = 'leer';
        else {
          ergebnis = 'frisch';
          aktuell = d.position;
          link.href = positionHref(d.position);
          titel.textContent = d.position.titel;
          alt.textContent = alter ? ` · ${alter}` : '';
          langText = `Zu Markus springen: ${d.position.titel}${alter ? `, ${alter}` : ''}`;
          beschriften();
          kasten.hidden = schonDa(d.position) || (positionHref(d.position) === erledigt && !zeigbar(d.position));
        }
      } catch {
        // ergebnis bleibt 'fehler'
      }
      fehlerInFolge = ergebnis === 'fehler' ? fehlerInFolge + 1 : 0;
      const { ms, ausblenden } = naechsteAbfrage(ergebnis, fehlerInFolge);
      if (ausblenden) { aktuell = null; kasten.hidden = true; }
      return ms;
    },
  });

  kette.sofort();
  // Zurück im Tab: sofort fragen (läuft gerade eine Abfrage, plant sie die nächste ohnehin).
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') kette.sofort(); });
  // Beim Scrollen sofort ausblenden, wenn man angekommen ist (ohne auf die nächste Abfrage zu warten).
  addEventListener('scroll', () => { if (aktuell && !kasten.hidden && schonDa(aktuell)) kasten.hidden = true; }, { passive: true });
}

praesentator();
studierende();
