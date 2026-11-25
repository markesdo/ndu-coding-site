// Fokus im Arbeitsfluss (NDU-74): Was eine Station im Fokus mit den anderen macht. Ohne Importe, damit das Skript klein
// bleibt; rollen gilt beim Bauen (Prop fokus) und im Browser, fokusSteuern schaltet im Browser um (getestet mit happy-dom).

/** fokus: die Station selbst; quelle: gibt ihr etwas; ziel: nimmt etwas von ihr; blass: unbeteiligt. */
export type Rolle = 'fokus' | 'quelle' | 'ziel' | 'blass';

/** Rolle jeder Station bei einem Fokus; ohne Fokus hat keine eine Rolle. */
export function rollen(alle: string[], fokus: string | undefined, kanten: { quellen: string[]; ziele: string[] }): Record<string, Rolle | undefined> {
  const r: Record<string, Rolle | undefined> = {};
  for (const id of alle) {
    r[id] = !fokus ? undefined : id === fokus ? 'fokus' : kanten.quellen.includes(id) ? 'quelle' : kanten.ziele.includes(id) ? 'ziel' : 'blass';
  }
  return r;
}

/** Tour: Fokus auf der zuletzt aufgedeckten Station (Schritte werden der Reihe nach aufgedeckt); keine: kein Fokus. */
export const tourFokus = (schritte: { id: string; gezeigt: boolean }[]): string | undefined =>
  schritte.filter((s) => s.gezeigt).at(-1)?.id;

/** ?station=… aus der Adresse, nur wenn es die Station gibt. */
export function stationAusAdresse(suche: string, bekannt: string[]): string | undefined {
  const id = new URLSearchParams(suche).get('station') ?? undefined;
  return id && bekannt.includes(id) ? id : undefined;
}

/** Ruhender Fokus, eine Regel für Laden und Tour-Schritt: Tour-Schritt vor ?station=… vor Prop fokus. */
export const grundFokus = (z: { tour?: string; adresse?: string; prop?: string }): string | undefined => z.tour ?? z.adresse ?? z.prop;

const ROLLEN: Rolle[] = ['fokus', 'quelle', 'ziel', 'blass'];

/**
 * Fokus im Browser für eine Figur (.af aus Arbeitsfluss.astro). Kanten (data-quellen, data-ziele), Pfade und Fußzeilen
 * stehen schon im HTML; hier wird nur umgeschaltet. Vorrang: Die letzte Handlung gilt – Maus (nur echte Maus, kein
 * Tippen) oder Tastatur auf einer Station überlagern den ruhenden Fokus (grundFokus), ein Tour-Schritt (← / →) setzt
 * beide zurück und zeigt seine Station. Tippen oder Klicken ins Leere des Plans und Escape lassen Maus-, Tastatur- und
 * Adress-Fokus fallen.
 * ?station=…: Ist die Spalte der Station im Beamer noch zugedeckt (aufdecken), wird bis dorthin aufgedeckt; wird sie per ←
 * wieder zugedeckt, fällt der Adress-Fokus weg. Was in zugedeckten Spalten liegt, wird nicht hervorgehoben und fehlt in
 * der Fußzeile, bis es aufgedeckt ist.
 */
export function fokusSteuern(fig: HTMLElement, suche: string): void {
  const doc = fig.ownerDocument;
  const stationen = [...fig.querySelectorAll<HTMLElement>('.af-station[data-id]')];
  const ids = stationen.map((s) => s.dataset.id!);
  const spalteVon = new Map(stationen.map((s) => [s.dataset.id!, s.dataset.spalte!]));
  const schrittSpalten = [...fig.querySelectorAll<HTMLElement>('.af-spalte[data-schritt]')];
  // Zugedeckt ist eine Spalte nur im Beamer (beamer.css: [data-schritt]:not(.gezeigt) unsichtbar).
  const verdeckt = (sp?: string) =>
    doc.documentElement.hasAttribute('data-beamer') && schrittSpalten.some((x) => x.dataset.spalte === sp && !x.classList.contains('gezeigt'));
  const liste = (v?: string) => (v ?? '').split(' ').filter((id) => id && !verdeckt(spalteVon.get(id)));
  const zeige = (fokus: string | undefined) => {
    const el = stationen.find((s) => s.dataset.id === fokus);
    const r = rollen(ids, el ? fokus : undefined, { quellen: liste(el?.dataset.quellen), ziele: liste(el?.dataset.ziele) });
    fig.toggleAttribute('data-fokus-an', !!el);
    for (const s of stationen) for (const x of ROLLEN) s.classList.toggle(`af-${x}`, r[s.dataset.id!] === x);
    for (const p of fig.querySelectorAll<SVGElement>('[data-fokus-pfad]')) p.classList.toggle('af-an', !!el && p.dataset.fokusPfad === fokus);
    for (const f of fig.querySelectorAll<HTMLElement>('[data-fuss]')) {
      f.hidden = !el || f.dataset.fuss !== fokus;
      if (f.hidden) continue;
      for (const teil of f.querySelectorAll<HTMLElement>('.af-fuss-teil')) {
        const glieder = [...teil.querySelectorAll<HTMLElement>('.af-glied')];
        for (const g of glieder) g.hidden = verdeckt(g.dataset.spalte);
        const leer = teil.querySelector<HTMLElement>('.af-glied-leer');
        if (leer) leer.hidden = glieder.some((g) => !g.hidden);
      }
    }
    const legende = fig.querySelector<HTMLElement>('.af-fuss-legende');
    if (legende) legende.hidden = !!el;
  };

  const prop = fig.dataset.fokus || undefined;
  let adresse = fig.hasAttribute('data-adresse') ? stationAusAdresse(suche, ids) : undefined;
  const marker = [...fig.querySelectorAll<HTMLElement>('[data-tour]')];
  const ausTour = () => tourFokus(marker.map((m) => ({ id: m.dataset.tour!, gezeigt: m.classList.contains('gezeigt') })));
  let ueber: string | undefined; // Station unter der Maus
  let fokussiert: string | undefined; // Station mit Tastaturfokus
  const jetzt = () => ueber ?? fokussiert ?? grundFokus({ tour: ausTour(), adresse, prop });
  const loslassen = () => { ueber = undefined; fokussiert = undefined; adresse = undefined; zeige(jetzt()); };

  // ?station=… im Beamer: Spalten bis zur Station aufdecken, sonst stünde der Fokus in einer verdeckten Spalte. Der
  // Schrittzähler (Layout.astro) hört auf 'aufloesung-offen' – dasselbe Ereignis wie bei einer Auflösung.
  if (adresse) {
    const sp = Number(spalteVon.get(adresse));
    let neu = false;
    for (const sch of schrittSpalten) {
      if (Number(sch.dataset.spalte) <= sp && !sch.classList.contains('gezeigt')) { sch.classList.add('gezeigt'); neu = true; }
    }
    if (neu) doc.dispatchEvent(new (doc.defaultView?.Event ?? Event)('aufloesung-offen'));
  }

  // ← / → in Layout.astro setzen und nehmen .gezeigt. Tour-Schritt: Maus und Tastatur zurücksetzen. Spalte zugedeckt:
  // ein Adress-Fokus darin fällt weg; aufgedeckt: Fußzeile und Hervorhebung nehmen die Spalte dazu.
  const Beobachter = doc.defaultView?.MutationObserver ?? MutationObserver;
  if (marker.length) {
    const tour = new Beobachter(() => { ueber = undefined; fokussiert = undefined; zeige(jetzt()); });
    for (const m of marker) tour.observe(m, { attributes: true, attributeFilter: ['class'] });
  }
  if (schrittSpalten.length) {
    const spalten = new Beobachter(() => {
      if (adresse && verdeckt(spalteVon.get(adresse))) adresse = undefined;
      zeige(jetzt());
    });
    for (const sch of schrittSpalten) spalten.observe(sch, { attributes: true, attributeFilter: ['class'] });
  }
  zeige(jetzt());

  for (const s of stationen) {
    // Nur eine echte Maus schwebt; beim Tippen (Touch, Stift) gäbe es kein „Maus weg“.
    s.addEventListener('pointerenter', (e) => { if ((e as PointerEvent).pointerType !== 'mouse') return; ueber = s.dataset.id; zeige(jetzt()); });
    s.addEventListener('pointerleave', (e) => { if ((e as PointerEvent).pointerType !== 'mouse') return; if (ueber === s.dataset.id) ueber = undefined; zeige(jetzt()); });
    s.addEventListener('focus', () => { fokussiert = s.dataset.id; zeige(jetzt()); });
    s.addEventListener('blur', () => { if (fokussiert === s.dataset.id) fokussiert = undefined; zeige(jetzt()); });
  }
  // Ins Leere des Plans tippen oder klicken: Fokus weg (Legende kommt zurück). Escape ebenso.
  fig.addEventListener('click', (e) => {
    const ziel = e.target as Element | null;
    if (!ziel?.closest?.('.af-station, button')) loslassen();
  });
  doc.addEventListener('keydown', (e) => { if (e.key === 'Escape') loslassen(); });

  // Legende: eine Linie allein zeigen; derselbe Knopf noch einmal zeigt wieder alle.
  const knoepfe = [...fig.querySelectorAll<HTMLButtonElement>('[data-faden-knopf]')];
  for (const k of knoepfe) {
    k.addEventListener('click', () => {
      const l = k.dataset.fadenKnopf!;
      if (fig.dataset.faden === l) delete fig.dataset.faden;
      else fig.dataset.faden = l;
      for (const x of knoepfe) x.setAttribute('aria-pressed', String(fig.dataset.faden === x.dataset.fadenKnopf));
    });
  }
}
