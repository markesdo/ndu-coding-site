// „Wo ist Markus?“ – im Browser, eingebunden in Layout.astro.
// Präsentator (Beamer-Modus + Schlüssel): meldet Seite und Abschnitt an /api/position, sobald sie sich ändern, sonst jede Minute.
// Studierende: fragen alle 5 s nach und zeigen unten rechts „Markus ist bei: …“ – ein Klick springt hin, nie automatisch.
// Einschalten am Präsentator-Rechner einmalig mit …/#presenter=<PRESENTER_KEY>, ausschalten mit #presenter=0.
// Der Schlüssel steht im Hash, nicht in der Query: Der Hash geht nie an den Server und landet so in keinem Log.
import { abschnittName, aktiverAbschnitt, pfadOhneSchraegstrich, seitenName, ueberschriftVon } from './abschnitt';
import { alterText, positionHref, type Position } from '../lib/position';

const KEY = 'ndu-presenter';
const API = '/api/position';
const root = document.documentElement;

const lies = (): string | null => { try { return localStorage.getItem(KEY); } catch { return null; } };
const schreib = (wert: string | null) => {
  try { if (wert) localStorage.setItem(KEY, wert); else localStorage.removeItem(KEY); } catch {}
};

function hinweis(text: string) {
  const el = document.createElement('div');
  el.className = 'wo-ist-hinweis';
  el.setAttribute('role', 'status');
  el.textContent = text;
  document.body.append(el);
  setTimeout(() => el.remove(), 4000);
}

// Einmaliges Einschalten über den Hash; danach sofort aus der Adresszeile (die Leinwand zeigt sie).
const treffer = location.hash.match(/^#presenter=(.+)$/);
if (treffer) {
  history.replaceState(null, '', location.pathname + location.search);
  let wert = treffer[1];
  try { wert = decodeURIComponent(wert); } catch {} // kaputtes %-Zeichen: so nehmen, wie es dasteht
  schreib(wert === '0' ? null : wert);
  hinweis(wert === '0' ? 'Präsentator-Modus aus' : 'Präsentator-Modus an – im Beamer-Modus sehen die Studierenden, wo du bist.');
}

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
    const i = aktiverAbschnitt(hs.map((h) => h.getBoundingClientRect().top), amEnde ? innerHeight : innerHeight * 0.35);
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

  setInterval(async () => {
    const key = lies();
    if (!key || !root.hasAttribute('data-beamer') || document.visibilityState !== 'visible') return;
    const jetzt = Date.now();
    const pos = jetzigePosition();
    const s = JSON.stringify(pos);
    if (s !== kandidat) { kandidat = s; kandidatSeit = jetzt; return; }
    if (jetzt - kandidatSeit < 1500 || jetzt < sperreBis) return;
    if (s === gesendet && jetzt - gesendetUm < 60_000) return;
    sperreBis = jetzt + 10_000; // höchstens ein Versuch pro 10 s, falls etwas hängt
    try {
      const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-presenter-key': key }, body: s });
      if (r.status === 403) { schreib(null); hinweis('Präsentator-Schlüssel stimmt nicht – Präsentator-Modus aus.'); return; }
      if (r.status === 401) { hinweis('Nicht mehr angemeldet – Seite neu laden und Kurspasswort eingeben.'); return; }
      if (!r.ok || !r.headers.get('content-type')?.includes('application/json')) { console.warn('[wo-ist] Position nicht gespeichert:', r.status); return; }
      gesendet = s; gesendetUm = Date.now(); sperreBis = 0;
    } catch (e) {
      console.warn('[wo-ist] Position nicht gesendet:', e);
    }
  }, 1000);
}

// ---------------------------------------------------------------------------
// Studierende
const PIN = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>';

function studierende() {
  const link = document.createElement('a');
  link.className = 'wo-ist';
  link.hidden = true;
  link.innerHTML = `${PIN}<span class="wo-ist-text"><span>Markus ist bei: </span><b></b><span class="wo-ist-alt"></span></span>`;
  const titel = link.querySelector('b')!;
  const alt = link.querySelector<HTMLElement>('.wo-ist-alt')!;
  document.body.append(link);
  let aktuell: Position | null = null;
  // Nach einem Klick auf ein Ziel, das hier nicht darstellbar ist, nicht weiter drängeln, bis Markus woanders ist.
  let erledigt = '';

  link.addEventListener('click', (e) => {
    if (!aktuell) return;
    erledigt = positionHref(aktuell);
    link.hidden = true;
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

  // Ohne frische Position (kein Kurs gerade) seltener fragen.
  let ruhigBis = 0;

  async function holen(sofort = false) {
    if (document.visibilityState !== 'visible' || root.hasAttribute('data-beamer') || lies()) { link.hidden = true; return; }
    if (!sofort && Date.now() < ruhigBis) return;
    try {
      const r = await fetch(API, { cache: 'no-store' });
      if (!r.ok || !r.headers.get('content-type')?.includes('application/json')) throw new Error(String(r.status));
      const d = (await r.json()) as { position: Position | null; zeit?: number; jetzt?: number };
      const alter = d.position && d.zeit && d.jetzt ? alterText(d.jetzt - d.zeit) : null;
      if (!d.position || alter === null) { aktuell = null; link.hidden = true; ruhigBis = Date.now() + 60_000; return; }
      ruhigBis = 0;
      aktuell = d.position;
      link.href = positionHref(d.position);
      titel.textContent = d.position.titel;
      alt.textContent = alter ? ` · ${alter}` : '';
      link.setAttribute('aria-label', `Zu Markus springen: ${d.position.titel}${alter ? `, ${alter}` : ''}`);
      link.hidden = schonDa(d.position) || (positionHref(d.position) === erledigt && !zeigbar(d.position));
    } catch {
      aktuell = null;
      link.hidden = true;
      ruhigBis = Date.now() + 60_000;
    }
  }

  holen(true);
  setInterval(() => holen(), 5000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') holen(true); });
  // Beim Scrollen sofort ausblenden, wenn man angekommen ist (ohne auf die nächste Abfrage zu warten).
  addEventListener('scroll', () => { if (aktuell && !link.hidden && schonDa(aktuell)) link.hidden = true; }, { passive: true });
}

praesentator();
studierende();
